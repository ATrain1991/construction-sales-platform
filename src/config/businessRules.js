/**
 * Business Rules Configuration
 *
 * This file contains customizable business rules for product matching,
 * pricing, and project analysis. Modify these rules to fit your specific
 * business requirements.
 */

/**
 * SCORING RULES
 * Adjust point values for different matching criteria
 */
export const scoringRules = {
  // Base score for products available in the location
  baseAvailabilityScore: 60,

  // Project type match
  projectTypeMatch: 10,

  // Certification matching (per certification, max total)
  certificationPoints: 5,
  maxCertificationPoints: 10,

  // Eco-friendly preferences (per preference, max total)
  ecoFriendlyPoints: 5,
  sustainablePoints: 5,
  maxEcoPoints: 10,

  // Stock availability
  inStockBonus: 5,

  // Installation difficulty match
  installationMatch: 5,

  // Warranty bonuses
  warranty10YearsPlus: 3,
  warranty5To9Years: 2,

  // Timeline compliance
  timelineMetBonus: 5,
  timelineMissedPenalty: -10
};

/**
 * BUDGET RULES
 * Configure budget-related calculations and thresholds
 */
export const budgetRules = {
  // Budget cushion (90% means use 90% of max budget for filtering)
  budgetCushion: 0.9,

  // Warning threshold (alert when over this percentage)
  warningThreshold: 0.85,

  // Critical threshold (alert when over this percentage)
  criticalThreshold: 1.0,

  // Allow over-budget projects (if false, strictly enforce budget)
  allowOverBudget: true
};

/**
 * TIMELINE RULES
 * Configure timeline calculations and constraints
 */
export const timelineRules = {
  // Buffer days to add for safety margin
  safetyBufferDays: 7,

  // Minimum acceptable timeline (days)
  minimumTimelineDays: 30,

  // Lead time multiplier for rush orders
  rushOrderMultiplier: 0.75,

  // Weekend/holiday adjustment (additional days)
  weekendAdjustment: 2
};

/**
 * PRODUCT FILTERING RULES
 * Configure which products to include/exclude
 */
export const filteringRules = {
  // Require certifications to be exact match
  strictCertifications: false,

  // Allow out-of-stock products in results
  allowOutOfStock: true,

  // Minimum stock quantity to consider "in stock"
  minStockQuantity: 1,

  // Include discontinued products
  includeDiscontinued: false,

  // Maximum lead time in days
  maxLeadTimeDays: 90
};

/**
 * CATEGORY RULES
 * Define required categories and their priorities
 */
export const categoryRules = {
  // Default categories for different project types
  defaultCategories: {
    'Residential': ['Lumber', 'Roofing', 'Insulation', 'Drywall', 'Paint'],
    'Commercial': ['Concrete', 'Steel', 'Glass', 'HVAC', 'Electrical'],
    'Industrial': ['Steel', 'Concrete', 'Heavy Machinery', 'Safety Equipment'],
    'Infrastructure': ['Concrete', 'Asphalt', 'Steel', 'Piping', 'Signage']
  },

  // Category priorities (higher number = higher priority)
  priorities: {
    'Safety Equipment': 100,
    'Foundation': 90,
    'Structural': 80,
    'Roofing': 70,
    'Electrical': 60,
    'Plumbing': 60,
    'HVAC': 50,
    'Insulation': 40,
    'Finishing': 30
  }
};

/**
 * PRICING RULES
 * Configure pricing calculations and discounts
 */
export const pricingRules = {
  // Volume discounts (quantity threshold -> discount percentage)
  volumeDiscounts: {
    10: 0.05,   // 5% off for 10+ items
    25: 0.10,   // 10% off for 25+ items
    50: 0.15,   // 15% off for 50+ items
    100: 0.20   // 20% off for 100+ items
  },

  // Bulk order threshold (minimum total order value for bulk pricing)
  bulkOrderThreshold: 10000,

  // Bulk order discount percentage
  bulkOrderDiscount: 0.12,

  // Tax rate (as decimal)
  taxRate: 0.0,

  // Shipping calculation
  shipping: {
    freeShippingThreshold: 5000,
    flatRate: 150,
    perItemRate: 10
  }
};

/**
 * NOTIFICATION RULES
 * Configure when to show warnings and alerts
 */
export const notificationRules = {
  // Show warning when products are late
  warnOnLateDelivery: true,

  // Show warning when over budget
  warnOnOverBudget: true,

  // Show warning for out-of-stock items
  warnOnOutOfStock: true,

  // Show recommendations automatically
  showRecommendations: true,

  // Minimum match score to display (0-100)
  minDisplayScore: 50
};

/**
 * CUSTOM BUSINESS LOGIC
 * Add your own custom functions here
 */

/**
 * Custom product scoring function
 * Override this to implement your own scoring logic
 */
export const customScoring = (product, specification) => {
  // Example: Prefer local suppliers
  let bonusPoints = 0;

  if (product.warehouseLocation === specification.location) {
    bonusPoints += 10; // Local supplier bonus
  }

  // Example: Seasonal adjustments
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 10 || currentMonth <= 2) { // Winter months
    if (product.category === 'Insulation' || product.category === 'Heating') {
      bonusPoints += 5;
    }
  }

  return bonusPoints;
};

/**
 * Custom filtering function
 * Override this to implement your own filtering logic
 */
export const customFilter = (product, specification) => {
  // Example: Filter based on company policy
  // Return false to exclude the product

  // Example: Only eco-friendly for government projects
  if (specification.projectType === 'Government' && product.ecoFriendly !== 'Yes') {
    return false;
  }

  // Example: Minimum warranty requirement
  if (specification.requireWarranty && product.warrantyYears < 5) {
    return false;
  }

  return true;
};

/**
 * Price adjustment function
 * Modify this to add custom pricing logic
 */
export const adjustPrice = (basePrice, quantity, product, specification) => {
  let finalPrice = basePrice;

  // Apply volume discounts
  for (const [threshold, discount] of Object.entries(pricingRules.volumeDiscounts).reverse()) {
    if (quantity >= parseInt(threshold)) {
      finalPrice *= (1 - discount);
      break;
    }
  }

  // Add any custom pricing logic here
  // Example: Preferred customer discount
  if (specification.customerTier === 'Premium') {
    finalPrice *= 0.95; // 5% discount
  }

  return finalPrice;
};

/**
 * Export all rules as a single object
 */
export default {
  scoring: scoringRules,
  budget: budgetRules,
  timeline: timelineRules,
  filtering: filteringRules,
  categories: categoryRules,
  pricing: pricingRules,
  notifications: notificationRules,
  custom: {
    scoring: customScoring,
    filter: customFilter,
    adjustPrice
  }
};
