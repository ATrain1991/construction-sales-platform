/**
 * CSV Parser utility for loading product data
 */

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @returns {Array<Object>} Array of parsed objects
 */
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = parseValue(header, values[index]);
    });
    data.push(obj);
  }

  return data;
};

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} Array of values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current);

  return values;
};

/**
 * Parse and convert value to appropriate type
 * @param {string} header - Column header
 * @param {string} value - String value
 * @returns {*} Parsed value
 */
const parseValue = (header, value) => {
  // Trim whitespace
  value = value.trim();

  // Handle empty values
  if (value === '') {
    if (header.includes('price') || header.includes('Qty') ||
        header.includes('Days') || header.includes('weight') ||
        header.includes('Years')) {
      return 0;
    }
    return '';
  }

  // Parse numbers
  if (header === 'price' || header === 'minOrderQty' || header === 'stockQty' ||
      header === 'leadTimeDays' || header === 'weight' || header === 'warrantyYears') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  return value;
};

/**
 * Load products from CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array<Object>>} Promise resolving to array of products
 */
export const loadProductsFromCSV = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading products from CSV:', error);
    throw error;
  }
};

/**
 * Calculate shipping days based on warehouse and destination
 * @param {string} warehouseState - Warehouse state code
 * @param {string} destinationState - Destination state code
 * @returns {number} Estimated shipping days
 */
export const calculateShippingDays = (warehouseState, destinationState) => {
  if (warehouseState === destinationState) {
    return 2; // Same state shipping
  }

  // Remote states take longer
  const remoteStates = ['AK', 'HI', 'ME', 'MT', 'WY', 'ND', 'SD'];
  const isWarehouseRemote = remoteStates.includes(warehouseState);
  const isDestinationRemote = remoteStates.includes(destinationState);

  let baseDays = 5; // Cross-state shipping

  if (isWarehouseRemote) baseDays += 3;
  if (isDestinationRemote) baseDays += 3;

  // Regional proximity (simplified)
  const regions = {
    northeast: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
    southeast: ['MD', 'DE', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'KY', 'TN', 'AL', 'MS', 'LA', 'AR'],
    midwest: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
    southwest: ['TX', 'OK', 'NM', 'AZ'],
    west: ['CA', 'NV', 'OR', 'WA', 'ID', 'UT', 'CO', 'WY', 'MT'],
    other: ['AK', 'HI']
  };

  let warehouseRegion = null;
  let destinationRegion = null;

  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(warehouseState)) warehouseRegion = region;
    if (states.includes(destinationState)) destinationRegion = region;
  }

  if (warehouseRegion === destinationRegion && warehouseRegion !== 'other') {
    baseDays -= 2; // Same region is faster
  }

  return Math.max(baseDays, 2); // Minimum 2 days
};
