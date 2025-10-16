// Script to generate large CSV file with dummy construction product data

const fs = require('fs');

const categories = [
  'Lumber', 'Concrete', 'Steel', 'Insulation', 'Roofing', 'Electrical',
  'Plumbing', 'HVAC', 'Flooring', 'Drywall', 'Paint', 'Windows',
  'Doors', 'Fixtures', 'Hardware', 'Tools'
];

const manufacturers = [
  'BuildCo', 'ConstructMax', 'ProBuild', 'MegaSupply', 'QualityMaterials',
  'IndustryLeader', 'TrustedBrand', 'PremiumPro', 'EcoConstruct', 'ValueBuilders'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const projectTypes = [
  'Residential', 'Commercial', 'Industrial', 'Infrastructure',
  'Renovation', 'New Construction'
];

const certifications = [
  'UL Listed', 'Energy Star', 'LEED Certified', 'FSC Certified',
  'Green Guard', 'CE Marked', 'ISO 9001', 'ASTM Compliant'
];

// Generate restricted states for some products (building codes, regulations)
const generateRestrictedStates = () => {
  const numRestricted = Math.floor(Math.random() * 5);
  if (numRestricted === 0) return '';

  const restricted = [];
  for (let i = 0; i < numRestricted; i++) {
    const state = states[Math.floor(Math.random() * states.length)];
    if (!restricted.includes(state)) {
      restricted.push(state);
    }
  }
  return restricted.join(';');
};

// Generate applicable project types
const generateApplicableTypes = () => {
  const numTypes = Math.floor(Math.random() * 4) + 2;
  const applicable = [];
  for (let i = 0; i < numTypes; i++) {
    const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    if (!applicable.includes(type)) {
      applicable.push(type);
    }
  }
  return applicable.join(';');
};

// Generate certifications
const generateCertifications = () => {
  const numCerts = Math.floor(Math.random() * 3);
  if (numCerts === 0) return '';

  const certs = [];
  for (let i = 0; i < numCerts; i++) {
    const cert = certifications[Math.floor(Math.random() * certifications.length)];
    if (!certs.includes(cert)) {
      certs.push(cert);
    }
  }
  return certs.join(';');
};

// Generate shipping time based on location
const generateShippingDays = (state) => {
  const baseTime = 3 + Math.floor(Math.random() * 12); // 3-15 days
  // Some states take longer (remote locations)
  const slowStates = ['AK', 'HI', 'ME', 'MT', 'WY', 'ND', 'SD'];
  if (slowStates.includes(state)) {
    return baseTime + 5;
  }
  return baseTime;
};

// Product name templates
const productTemplates = {
  Lumber: ['2x4', '2x6', '2x8', '4x4', 'Plywood', 'OSB Board', 'Cedar Decking', 'Treated Pine'],
  Concrete: ['Ready Mix', 'Cement Bag', 'Rebar', 'Concrete Block', 'Precast Panel', 'Grout Mix'],
  Steel: ['I-Beam', 'Steel Plate', 'Rebar', 'Metal Stud', 'Steel Beam', 'Angle Iron'],
  Insulation: ['Fiberglass Batt', 'Spray Foam', 'Rigid Foam Board', 'Cellulose', 'Mineral Wool'],
  Roofing: ['Asphalt Shingle', 'Metal Roofing', 'TPO Membrane', 'EPDM Rubber', 'Clay Tile'],
  Electrical: ['Wire Cable', 'Circuit Breaker', 'Junction Box', 'Conduit', 'Light Fixture'],
  Plumbing: ['PVC Pipe', 'Copper Pipe', 'PEX Tubing', 'Valve', 'Faucet', 'Drain Fitting'],
  HVAC: ['Air Handler', 'Heat Pump', 'Ductwork', 'Thermostat', 'Ventilation Fan'],
  Flooring: ['Hardwood', 'Laminate', 'Vinyl Plank', 'Carpet Tile', 'Ceramic Tile'],
  Drywall: ['Standard Sheet', 'Moisture Resistant', 'Fire Rated', 'Joint Compound', 'Corner Bead'],
  Paint: ['Interior Latex', 'Exterior Acrylic', 'Primer', 'Stain', 'Epoxy Coating'],
  Windows: ['Double Hung', 'Casement', 'Sliding', 'Picture Window', 'Bay Window'],
  Doors: ['Entry Door', 'Interior Door', 'Sliding Door', 'Garage Door', 'Fire Door'],
  Fixtures: ['Sink', 'Toilet', 'Shower Head', 'Bathtub', 'Cabinet Hardware'],
  Hardware: ['Screws', 'Nails', 'Bolts', 'Hinges', 'Lock Set', 'Anchor'],
  Tools: ['Power Drill', 'Saw', 'Level', 'Measuring Tape', 'Hammer', 'Nail Gun']
};

// Generate products
const generateProducts = (count) => {
  const products = [];
  let productId = 1000;

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const templates = productTemplates[category];
    const productName = templates[Math.floor(Math.random() * templates.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];

    // Pricing varies widely by category
    let basePrice;
    switch(category) {
      case 'Lumber': basePrice = 5 + Math.random() * 50; break;
      case 'Concrete': basePrice = 10 + Math.random() * 100; break;
      case 'Steel': basePrice = 50 + Math.random() * 500; break;
      case 'Windows': basePrice = 200 + Math.random() * 1000; break;
      case 'Doors': basePrice = 150 + Math.random() * 800; break;
      case 'HVAC': basePrice = 500 + Math.random() * 3000; break;
      default: basePrice = 20 + Math.random() * 300;
    }

    const price = Math.round(basePrice * 100) / 100;
    const minOrderQty = [1, 10, 25, 50, 100][Math.floor(Math.random() * 5)];
    const stockQty = Math.floor(Math.random() * 5000) + 100;
    const leadTime = Math.floor(Math.random() * 30) + 1; // 1-30 days
    const weight = Math.round((Math.random() * 200 + 1) * 100) / 100; // lbs

    const restrictedStates = generateRestrictedStates();
    const applicableTypes = generateApplicableTypes();
    const productCerts = generateCertifications();

    // Warehouse locations
    const warehouseState = states[Math.floor(Math.random() * states.length)];

    // Environmental ratings
    const ecoFriendly = Math.random() > 0.7;
    const recyclable = Math.random() > 0.6;
    const sustainableSource = Math.random() > 0.5;

    // Product dimensions
    const length = Math.round((Math.random() * 144 + 12) * 10) / 10; // inches
    const width = Math.round((Math.random() * 48 + 4) * 10) / 10;
    const height = Math.round((Math.random() * 48 + 4) * 10) / 10;

    products.push({
      productId: `P${productId++}`,
      productName,
      category,
      manufacturer,
      price,
      unit: ['ea', 'ft', 'sqft', 'bundle', 'box'][Math.floor(Math.random() * 5)],
      minOrderQty,
      stockQty,
      leadTimeDays: leadTime,
      warehouseLocation: warehouseState,
      weight,
      dimensions: `${length}x${width}x${height}`,
      restrictedStates,
      applicableProjectTypes: applicableTypes,
      certifications: productCerts,
      ecoFriendly: ecoFriendly ? 'Yes' : 'No',
      recyclable: recyclable ? 'Yes' : 'No',
      sustainableSource: sustainableSource ? 'Yes' : 'No',
      warrantyYears: [0, 1, 2, 5, 10, 25][Math.floor(Math.random() * 6)],
      fireRating: ['', 'Class A', 'Class B', 'Class C'][Math.floor(Math.random() * 4)],
      installationDifficulty: ['Easy', 'Moderate', 'Complex', 'Professional Required'][Math.floor(Math.random() * 4)],
      description: `${manufacturer} ${productName} - Premium quality ${category.toLowerCase()} product for construction projects.`
    });
  }

  return products;
};

// Generate CSV
const generateCSV = (products) => {
  const headers = [
    'productId', 'productName', 'category', 'manufacturer', 'price', 'unit',
    'minOrderQty', 'stockQty', 'leadTimeDays', 'warehouseLocation', 'weight',
    'dimensions', 'restrictedStates', 'applicableProjectTypes', 'certifications',
    'ecoFriendly', 'recyclable', 'sustainableSource', 'warrantyYears',
    'fireRating', 'installationDifficulty', 'description'
  ];

  let csv = headers.join(',') + '\n';

  products.forEach(product => {
    const row = headers.map(header => {
      let value = product[header];
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    });
    csv += row.join(',') + '\n';
  });

  return csv;
};

// Generate 2000 products
console.log('Generating product data...');
const products = generateProducts(2000);

console.log('Creating CSV file...');
const csv = generateCSV(products);

fs.writeFileSync('public/products.csv', csv);
console.log(`Successfully generated products.csv with ${products.length} products!`);
console.log(`File size: ${(csv.length / 1024 / 1024).toFixed(2)} MB`);
