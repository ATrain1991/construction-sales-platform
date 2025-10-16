// Type definitions for the Construction Sales Platform

/**
 * Product data structure from CSV
 * @typedef {Object} Product
 * @property {string} productId - Unique product identifier
 * @property {string} productName - Name of the product
 * @property {string} category - Product category
 * @property {string} manufacturer - Manufacturer name
 * @property {number} price - Unit price
 * @property {string} unit - Unit of measurement (ea, ft, sqft, bundle, box)
 * @property {number} minOrderQty - Minimum order quantity
 * @property {number} stockQty - Available stock quantity
 * @property {number} leadTimeDays - Lead time in days
 * @property {string} warehouseLocation - Warehouse state code
 * @property {number} weight - Weight in lbs
 * @property {string} dimensions - Dimensions as "LxWxH"
 * @property {string} restrictedStates - Semicolon-separated state codes where product is restricted
 * @property {string} applicableProjectTypes - Semicolon-separated project types
 * @property {string} certifications - Semicolon-separated certifications
 * @property {string} ecoFriendly - "Yes" or "No"
 * @property {string} recyclable - "Yes" or "No"
 * @property {string} sustainableSource - "Yes" or "No"
 * @property {number} warrantyYears - Warranty period in years
 * @property {string} fireRating - Fire rating (Class A, B, C, or empty)
 * @property {string} installationDifficulty - Installation difficulty level
 * @property {string} description - Product description
 */

/**
 * Project timeline milestone
 * @typedef {Object} ProjectMilestone
 * @property {string} id - Unique milestone identifier
 * @property {string} name - Milestone name
 * @property {Date} targetDate - Target completion date
 * @property {string[]} requiredCategories - Required product categories for this milestone
 * @property {boolean} critical - Whether this is a critical path milestone
 */

/**
 * Project specifications defined by customer
 * @typedef {Object} ProjectSpecification
 * @property {string} projectName - Name of the project
 * @property {string} projectType - Type of project (Residential, Commercial, etc.)
 * @property {string} location - State code where project is located
 * @property {string} city - City name
 * @property {string} zipCode - ZIP code
 * @property {number} maxBudget - Maximum budget in dollars
 * @property {Date} projectStartDate - Project start date
 * @property {Date} projectEndDate - Project end date
 * @property {ProjectMilestone[]} milestones - Project milestones with timelines
 * @property {string[]} requiredCategories - Required product categories
 * @property {string[]} preferredManufacturers - Preferred manufacturers (optional)
 * @property {boolean} requireCertifications - Whether certifications are required
 * @property {string[]} requiredCertifications - Specific required certifications
 * @property {boolean} ecoFriendlyPreference - Prefer eco-friendly products
 * @property {boolean} sustainablePreference - Prefer sustainable products
 * @property {string} installationCapability - Installation capability (DIY, Professional)
 * @property {string} notes - Additional notes or requirements
 */

/**
 * Product match result with scoring
 * @typedef {Object} ProductMatch
 * @property {Product} product - The matched product
 * @property {number} matchScore - Match score (0-100)
 * @property {string[]} matchReasons - Reasons for the match
 * @property {string[]} warnings - Any warnings about the product
 * @property {number} estimatedShippingDays - Estimated shipping days to location
 * @property {Date} estimatedDelivery - Estimated delivery date
 * @property {boolean} meetsTimeline - Whether product can meet project timeline
 * @property {string[]} applicableMilestones - Milestones this product applies to
 */

/**
 * Project analysis result
 * @typedef {Object} ProjectAnalysis
 * @property {ProjectSpecification} specification - Original project specification
 * @property {ProductMatch[]} recommendedProducts - Recommended products sorted by match score
 * @property {number} estimatedTotalCost - Estimated total cost
 * @property {Object} categoryBreakdown - Cost breakdown by category
 * @property {Object} timelineAnalysis - Timeline feasibility analysis
 * @property {string[]} risks - Identified risks or concerns
 * @property {string[]} recommendations - General recommendations
 */

/**
 * Filter criteria for products
 * @typedef {Object} FilterCriteria
 * @property {string[]} categories - Filter by categories
 * @property {number} minPrice - Minimum price
 * @property {number} maxPrice - Maximum price
 * @property {string} location - State code for legal/shipping filtering
 * @property {string} projectType - Project type to match
 * @property {boolean} inStockOnly - Only show in-stock items
 * @property {number} maxLeadTime - Maximum acceptable lead time
 * @property {boolean} ecoFriendlyOnly - Only eco-friendly products
 * @property {string[]} requiredCertifications - Required certifications
 */

export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Renovation',
  'New Construction'
];

export const PRODUCT_CATEGORIES = [
  'Lumber',
  'Concrete',
  'Steel',
  'Insulation',
  'Roofing',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Flooring',
  'Drywall',
  'Paint',
  'Windows',
  'Doors',
  'Fixtures',
  'Hardware',
  'Tools'
];

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

export const CERTIFICATIONS = [
  'UL Listed',
  'Energy Star',
  'LEED Certified',
  'FSC Certified',
  'Green Guard',
  'CE Marked',
  'ISO 9001',
  'ASTM Compliant'
];

export const INSTALLATION_LEVELS = [
  'Easy',
  'Moderate',
  'Complex',
  'Professional Required'
];
