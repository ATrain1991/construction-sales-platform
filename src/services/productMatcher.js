/**
 * Product Matching and Filtering Service
 * This service handles filtering products based on project specifications,
 * legal restrictions, and timeline requirements
 */

import { calculateShippingDays } from '../utils/csvParser.js';

/**
 * Filter products based on location and legal restrictions
 * @param {Array} products - All available products
 * @param {string} stateCode - State code where project is located
 * @returns {Array} Filtered products that are legal in the location
 */
export const filterByLocation = (products, stateCode) => {
  return products.filter(product => {
    // Check if product is restricted in this state
    if (!product.restrictedStates) return true;

    const restrictedStates = product.restrictedStates
      .split(';')
      .map(s => s.trim())
      .filter(s => s);

    return !restrictedStates.includes(stateCode);
  });
};

/**
 * Filter products by project type
 * @param {Array} products - Products to filter
 * @param {string} projectType - Type of project
 * @returns {Array} Products applicable to the project type
 */
export const filterByProjectType = (products, projectType) => {
  if (!projectType) return products;

  return products.filter(product => {
    if (!product.applicableProjectTypes) return false;

    const applicableTypes = product.applicableProjectTypes
      .split(';')
      .map(t => t.trim())
      .filter(t => t);

    return applicableTypes.includes(projectType);
  });
};

/**
 * Filter products by required categories
 * @param {Array} products - Products to filter
 * @param {Array<string>} categories - Required categories
 * @returns {Array} Products in the specified categories
 */
export const filterByCategories = (products, categories) => {
  if (!categories || categories.length === 0) return products;

  return products.filter(product =>
    categories.includes(product.category)
  );
};

/**
 * Filter products by certifications
 * @param {Array} products - Products to filter
 * @param {Array<string>} requiredCerts - Required certifications
 * @returns {Array} Products with required certifications
 */
export const filterByCertifications = (products, requiredCerts) => {
  if (!requiredCerts || requiredCerts.length === 0) return products;

  return products.filter(product => {
    if (!product.certifications) return false;

    const productCerts = product.certifications
      .split(';')
      .map(c => c.trim())
      .filter(c => c);

    // Check if product has all required certifications
    return requiredCerts.every(reqCert =>
      productCerts.includes(reqCert)
    );
  });
};

/**
 * Filter products by budget constraints
 * @param {Array} products - Products to filter
 * @param {number} maxBudget - Maximum budget
 * @param {number} cushion - Budget cushion percentage (default 0.9 = 90% of budget)
 * @returns {Array} Products within budget
 */
export const filterByBudget = (products, maxBudget, cushion = 0.9) => {
  if (!maxBudget) return products;

  const effectiveBudget = maxBudget * cushion;

  return products.filter(product =>
    product.price <= effectiveBudget
  );
};

/**
 * Filter products by stock availability
 * @param {Array} products - Products to filter
 * @param {boolean} inStockOnly - Whether to filter to in-stock only
 * @returns {Array} Filtered products
 */
export const filterByStock = (products, inStockOnly = false) => {
  if (!inStockOnly) return products;

  return products.filter(product => product.stockQty > 0);
};

/**
 * Filter products by eco-friendly preferences
 * @param {Array} products - Products to filter
 * @param {Object} preferences - Eco preferences
 * @returns {Array} Filtered products
 */
export const filterByEcoPreferences = (products, preferences) => {
  let filtered = products;

  if (preferences.ecoFriendly) {
    filtered = filtered.filter(p => p.ecoFriendly === 'Yes');
  }

  if (preferences.sustainable) {
    filtered = filtered.filter(p => p.sustainableSource === 'Yes');
  }

  if (preferences.recyclable) {
    filtered = filtered.filter(p => p.recyclable === 'Yes');
  }

  return filtered;
};

/**
 * Check if product can meet timeline requirements
 * @param {Object} product - Product to check
 * @param {Date} requiredDate - Required delivery date
 * @param {string} projectState - Project location state code
 * @param {Date} orderDate - Expected order date (default: today)
 * @returns {Object} Timeline analysis
 */
export const checkTimeline = (product, requiredDate, projectState, orderDate = new Date()) => {
  const shippingDays = calculateShippingDays(product.warehouseLocation, projectState);
  const totalDays = product.leadTimeDays + shippingDays;

  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + totalDays);

  const meetsTimeline = deliveryDate <= requiredDate;
  const daysMargin = Math.floor((requiredDate - deliveryDate) / (1000 * 60 * 60 * 24));

  return {
    estimatedShippingDays: shippingDays,
    totalLeadTime: totalDays,
    estimatedDelivery: deliveryDate,
    meetsTimeline,
    daysMargin
  };
};

/**
 * Calculate match score for a product based on project specifications
 * @param {Object} product - Product to score
 * @param {Object} spec - Project specification
 * @returns {Object} Match result with score and reasons
 */
export const calculateMatchScore = (product, spec) => {
  let score = 0;
  const matchReasons = [];
  const warnings = [];

  // Base score for being legally available (60 points)
  score += 60;
  matchReasons.push('Available in your location');

  // Project type match (10 points)
  if (product.applicableProjectTypes.includes(spec.projectType)) {
    score += 10;
    matchReasons.push(`Suitable for ${spec.projectType} projects`);
  }

  // Certification match (5 points each, max 10)
  if (spec.requiredCertifications && spec.requiredCertifications.length > 0) {
    const productCerts = product.certifications.split(';').map(c => c.trim()).filter(c => c);
    const matchedCerts = spec.requiredCertifications.filter(reqCert =>
      productCerts.includes(reqCert)
    );

    if (matchedCerts.length > 0) {
      score += Math.min(matchedCerts.length * 5, 10);
      matchReasons.push(`Has ${matchedCerts.length} required certification(s)`);
    }
  }

  // Eco-friendly preferences (5 points each, max 10)
  let ecoScore = 0;
  if (spec.ecoFriendlyPreference && product.ecoFriendly === 'Yes') {
    ecoScore += 5;
    matchReasons.push('Eco-friendly product');
  }
  if (spec.sustainablePreference && product.sustainableSource === 'Yes') {
    ecoScore += 5;
    matchReasons.push('Sustainable source');
  }
  score += Math.min(ecoScore, 10);

  // Stock availability (5 points)
  if (product.stockQty > 0) {
    score += 5;
    matchReasons.push('In stock');
  } else {
    warnings.push('Currently out of stock');
  }

  // Installation difficulty match (5 points)
  if (spec.installationCapability === 'DIY' &&
      ['Easy', 'Moderate'].includes(product.installationDifficulty)) {
    score += 5;
    matchReasons.push('DIY-friendly installation');
  } else if (spec.installationCapability === 'Professional' &&
             product.installationDifficulty === 'Professional Required') {
    score += 5;
    matchReasons.push('Professional installation available');
  }

  // Warranty (bonus points)
  if (product.warrantyYears >= 10) {
    score += 3;
    matchReasons.push(`${product.warrantyYears}-year warranty`);
  } else if (product.warrantyYears >= 5) {
    score += 2;
    matchReasons.push(`${product.warrantyYears}-year warranty`);
  }

  // Timeline analysis
  const timeline = checkTimeline(
    product,
    spec.projectEndDate,
    spec.location,
    spec.projectStartDate
  );

  if (timeline.meetsTimeline) {
    score += 5;
    matchReasons.push(`Can deliver ${timeline.daysMargin} days before deadline`);
  } else {
    score -= 10;
    warnings.push(`Will be ${Math.abs(timeline.daysMargin)} days late`);
  }

  return {
    product,
    matchScore: Math.min(Math.max(score, 0), 100), // Clamp between 0-100
    matchReasons,
    warnings,
    ...timeline
  };
};

/**
 * Find and rank products matching project specifications
 * @param {Array} allProducts - All available products
 * @param {Object} spec - Project specification
 * @returns {Array} Ranked product matches
 */
export const findMatchingProducts = (allProducts, spec) => {
  // Apply filters
  let filtered = allProducts;

  // Location/legal filter (mandatory)
  filtered = filterByLocation(filtered, spec.location);

  // Project type filter
  filtered = filterByProjectType(filtered, spec.projectType);

  // Category filter (if specified)
  if (spec.requiredCategories && spec.requiredCategories.length > 0) {
    filtered = filterByCategories(filtered, spec.requiredCategories);
  }

  // Certification filter (if required)
  if (spec.requireCertifications && spec.requiredCertifications) {
    filtered = filterByCertifications(filtered, spec.requiredCertifications);
  }

  // Eco preferences (if specified)
  if (spec.ecoFriendlyPreference || spec.sustainablePreference) {
    const ecoFiltered = filterByEcoPreferences(filtered, {
      ecoFriendly: spec.ecoFriendlyPreference,
      sustainable: spec.sustainablePreference
    });

    // Only apply eco filter if it doesn't eliminate all products
    if (ecoFiltered.length > 0) {
      filtered = ecoFiltered;
    }
  }

  // Score and rank products
  const scored = filtered.map(product =>
    calculateMatchScore(product, spec)
  );

  // Sort by match score (descending)
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
};

/**
 * Analyze project feasibility and generate recommendations
 * @param {Array} matchedProducts - Matched products with scores
 * @param {Object} spec - Project specification
 * @returns {Object} Project analysis
 */
export const analyzeProject = (matchedProducts, spec) => {
  const analysis = {
    specification: spec,
    recommendedProducts: matchedProducts,
    estimatedTotalCost: 0,
    categoryBreakdown: {},
    timelineAnalysis: {
      feasible: true,
      criticalPath: [],
      concerns: []
    },
    risks: [],
    recommendations: []
  };

  // Group by category
  const byCategory = {};
  matchedProducts.forEach(match => {
    const category = match.product.category;
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(match);
  });

  // Calculate category breakdown (taking best match from each category)
  Object.keys(byCategory).forEach(category => {
    const best = byCategory[category][0]; // Highest scored
    if (best) {
      analysis.categoryBreakdown[category] = {
        product: best.product.productName,
        cost: best.product.price,
        deliveryDate: best.estimatedDelivery
      };
      analysis.estimatedTotalCost += best.product.price;
    }
  });

  // Check budget
  if (spec.maxBudget && analysis.estimatedTotalCost > spec.maxBudget) {
    analysis.risks.push(
      `Estimated cost ($${analysis.estimatedTotalCost.toFixed(2)}) exceeds budget ($${spec.maxBudget.toFixed(2)})`
    );
    analysis.recommendations.push('Consider adjusting product selections or increasing budget');
  }

  // Timeline analysis
  const lateProducts = matchedProducts.filter(m => !m.meetsTimeline);
  if (lateProducts.length > 0) {
    analysis.timelineAnalysis.feasible = false;
    analysis.risks.push(`${lateProducts.length} products cannot meet timeline`);
    analysis.recommendations.push('Consider adjusting timeline or selecting faster-shipping alternatives');
  }

  // Check for missing categories
  if (spec.requiredCategories) {
    const foundCategories = Object.keys(analysis.categoryBreakdown);
    const missing = spec.requiredCategories.filter(cat => !foundCategories.includes(cat));

    if (missing.length > 0) {
      analysis.risks.push(`No products found for categories: ${missing.join(', ')}`);
      analysis.recommendations.push('Expand search criteria or consider alternative categories');
    }
  }

  return analysis;
};
