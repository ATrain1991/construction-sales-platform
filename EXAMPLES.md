# Business Rules Examples

This document provides practical examples of custom business rules that can be added to the Construction Sales Platform.

## Table of Contents
1. [Pricing Rules](#pricing-rules)
2. [Availability Rules](#availability-rules)
3. [Compatibility Rules](#compatibility-rules)
4. [Shipping Rules](#shipping-rules)
5. [Discount Rules](#discount-rules)
6. [Regulatory Rules](#regulatory-rules)
7. [Priority Rules](#priority-rules)

---

## Pricing Rules

### 1. Volume Discount Rule

Offer discounts based on order quantity.

```javascript
// src/services/businessRules.js

export const applyVolumeDiscount = (product, quantity) => {
  let discountRate = 0;

  if (quantity >= 1000) {
    discountRate = 0.20; // 20% off
  } else if (quantity >= 500) {
    discountRate = 0.15; // 15% off
  } else if (quantity >= 100) {
    discountRate = 0.10; // 10% off
  } else if (quantity >= 50) {
    discountRate = 0.05; // 5% off
  }

  return {
    originalPrice: product.price,
    discountRate,
    discountedPrice: product.price * (1 - discountRate),
    savings: product.price * discountRate * quantity,
    totalCost: product.price * (1 - discountRate) * quantity
  };
};

// Usage in calculateMatchScore:
const pricing = applyVolumeDiscount(product, spec.estimatedQuantity);
if (pricing.discountRate > 0) {
  matchReasons.push(`${pricing.discountRate * 100}% volume discount available`);
}
```

### 2. Dynamic Pricing Based on Market Conditions

Adjust prices based on time of year, demand, etc.

```javascript
export const calculateDynamicPrice = (product, orderDate) => {
  let multiplier = 1.0;
  const month = orderDate.getMonth();

  // Construction materials cost more in spring/summer (high demand)
  if (month >= 3 && month <= 8) {
    multiplier = 1.15; // 15% markup
  }

  // Roofing materials cheaper in winter
  if (product.category === 'Roofing' && (month <= 2 || month >= 10)) {
    multiplier = 0.85; // 15% discount
  }

  // Holiday sales
  if (month === 10) { // November
    multiplier = 0.90; // 10% off
  }

  return {
    basePrice: product.price,
    adjustedPrice: product.price * multiplier,
    reason: multiplier > 1 ? 'High demand period' : 'Off-season discount'
  };
};
```

### 3. Bundle Pricing

Offer discounts when multiple related products are purchased together.

```javascript
export const calculateBundleDiscount = (selectedProducts) => {
  const bundles = [
    {
      name: 'Flooring Complete',
      categories: ['Flooring', 'Hardware', 'Tools'],
      discount: 0.12
    },
    {
      name: 'Electrical Package',
      categories: ['Electrical', 'Tools'],
      discount: 0.08
    },
    {
      name: 'Paint & Finish',
      categories: ['Paint', 'Drywall'],
      discount: 0.10
    }
  ];

  const applicableBundles = [];
  const selectedCategories = [...new Set(selectedProducts.map(p => p.category))];

  for (const bundle of bundles) {
    const hasAllCategories = bundle.categories.every(cat =>
      selectedCategories.includes(cat)
    );

    if (hasAllCategories) {
      const bundleProducts = selectedProducts.filter(p =>
        bundle.categories.includes(p.category)
      );

      const totalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
      const savings = totalPrice * bundle.discount;

      applicableBundles.push({
        name: bundle.name,
        products: bundleProducts,
        totalPrice,
        discount: bundle.discount,
        savings,
        finalPrice: totalPrice - savings
      });
    }
  }

  return applicableBundles;
};
```

---

## Availability Rules

### 1. Seasonal Availability

Restrict products based on time of year.

```javascript
export const checkSeasonalAvailability = (product, orderDate) => {
  const month = orderDate.getMonth();

  // Winter restrictions
  if ([11, 0, 1].includes(month)) {
    // No roofing in winter in northern states
    if (product.category === 'Roofing') {
      return {
        available: false,
        reason: 'Roofing products unavailable during winter months',
        nextAvailable: new Date(orderDate.getFullYear(), 2, 1) // March 1
      };
    }

    // Concrete curing issues in freezing temps
    if (product.category === 'Concrete' && product.productName.includes('Ready Mix')) {
      return {
        available: false,
        reason: 'Concrete pouring not recommended in freezing temperatures',
        alternative: 'Consider using concrete blankets or heated enclosures'
      };
    }
  }

  // Summer only products
  if (product.productName.includes('Heat-Resistant') && month < 4) {
    return {
      available: true,
      warning: 'This product is designed for hot weather installation'
    };
  }

  return { available: true };
};

// Integration:
export const findMatchingProducts = (products, spec) => {
  let filtered = products.filter(product => {
    const availability = checkSeasonalAvailability(product, spec.projectStartDate);
    return availability.available;
  });

  // ... rest of filtering
};
```

### 2. Lead Time Variability

Adjust lead times based on external factors.

```javascript
export const calculateActualLeadTime = (product, orderDate) => {
  let leadTime = product.leadTimeDays;
  const month = orderDate.getMonth();

  // Holiday delays
  if (month === 11) { // December
    leadTime += 5; // +5 days for holiday season
  }

  // Supply chain factors
  if (product.category === 'Steel' && product.manufacturer === 'IndustrialLeader') {
    leadTime += 3; // Known supplier with longer lead times
  }

  // Stock level impact
  if (product.stockQty < 10) {
    leadTime += 7; // Need to restock
  }

  // Pandemic or crisis multiplier
  const crisisActive = false; // Could be from API/database
  if (crisisActive) {
    leadTime *= 1.5;
  }

  return {
    originalLeadTime: product.leadTimeDays,
    adjustedLeadTime: Math.ceil(leadTime),
    factors: []
  };
};
```

---

## Compatibility Rules

### 1. Product Compatibility Checking

Ensure selected products work together.

```javascript
export const checkProductCompatibility = (selectedProducts, spec) => {
  const issues = [];
  const warnings = [];

  // Check electrical and HVAC compatibility
  const electrical = selectedProducts.filter(p => p.category === 'Electrical');
  const hvac = selectedProducts.filter(p => p.category === 'HVAC');

  if (electrical.length > 0 && hvac.length > 0) {
    // Check voltage compatibility
    const hasHighVoltage = hvac.some(p => p.description.includes('240V'));
    const has240Circuit = electrical.some(p => p.productName.includes('240V'));

    if (hasHighVoltage && !has240Circuit) {
      issues.push({
        severity: 'error',
        message: 'HVAC system requires 240V circuit breaker',
        products: hvac.map(p => p.productId),
        solution: 'Add 240V circuit breaker to electrical selection'
      });
    }
  }

  // Check insulation and climate compatibility
  const insulation = selectedProducts.find(p => p.category === 'Insulation');
  if (insulation && spec.location) {
    const coldClimateStates = ['AK', 'MT', 'ND', 'MN', 'WI', 'MI', 'ME'];
    const isColdClimate = coldClimateStates.includes(spec.location);

    if (isColdClimate && !insulation.description.includes('R-30')) {
      warnings.push({
        severity: 'warning',
        message: 'Higher R-value insulation recommended for cold climate',
        product: insulation.productId,
        recommendation: 'Consider R-30 or higher insulation'
      });
    }
  }

  // Check lumber and hardware compatibility
  const lumber = selectedProducts.filter(p => p.category === 'Lumber');
  const hardware = selectedProducts.filter(p => p.category === 'Hardware');

  if (lumber.length > 0 && hardware.length === 0) {
    warnings.push({
      severity: 'warning',
      message: 'Lumber selected but no hardware (screws/nails) included',
      recommendation: 'Add fasteners to your selection'
    });
  }

  return { issues, warnings };
};
```

### 2. Code Compliance Checking

Verify selections meet building codes.

```javascript
export const checkCodeCompliance = (selectedProducts, spec) => {
  const violations = [];

  // Fire rating requirements
  if (spec.projectType === 'Commercial') {
    const fireRatedProducts = selectedProducts.filter(p => p.fireRating);

    if (selectedProducts.length > 0 && fireRatedProducts.length === 0) {
      violations.push({
        code: 'IBC-703',
        severity: 'critical',
        message: 'Commercial buildings require fire-rated materials',
        recommendation: 'Select products with Class A or B fire rating'
      });
    }
  }

  // Egress requirements
  if (spec.projectType === 'Residential') {
    const windows = selectedProducts.filter(p => p.category === 'Windows');
    const bedroomWindows = windows.filter(p =>
      p.description.toLowerCase().includes('bedroom')
    );

    if (bedroomWindows.length > 0) {
      const hasEgressWindow = bedroomWindows.some(w =>
        w.dimensions.includes('Egress') || parseWindowSize(w.dimensions).area >= 5.7
      );

      if (!hasEgressWindow) {
        violations.push({
          code: 'IRC-R310.2',
          severity: 'critical',
          message: 'Bedroom windows must meet egress requirements',
          requirement: 'Minimum 5.7 sq ft opening, 24" min height, 20" min width'
        });
      }
    }
  }

  return violations;
};
```

---

## Shipping Rules

### 1. Weight-Based Shipping Restrictions

Special handling for heavy items.

```javascript
export const calculateShippingRestrictions = (product, destination) => {
  const restrictions = [];

  // Heavy items
  if (product.weight > 500) {
    restrictions.push({
      type: 'weight',
      message: 'Freight shipping required (over 500 lbs)',
      additionalCost: 250,
      additionalDays: 3
    });
  }

  // Oversized items
  const [length, width, height] = product.dimensions.split('x').map(Number);
  const volume = length * width * height;

  if (length > 96 || width > 48 || volume > 50000) {
    restrictions.push({
      type: 'size',
      message: 'Oversized item - special handling required',
      additionalCost: 150,
      requiresLiftGate: true
    });
  }

  // Hazardous materials
  if (product.category === 'Paint' || product.description.includes('Flammable')) {
    restrictions.push({
      type: 'hazmat',
      message: 'Hazardous materials shipping restrictions apply',
      prohibitedMethods: ['Air'],
      additionalDays: 2,
      requiresHazmatCert: true
    });
  }

  // Remote location surcharge
  const remoteStates = ['AK', 'HI'];
  if (remoteStates.includes(destination)) {
    restrictions.push({
      type: 'location',
      message: 'Remote location delivery',
      additionalCost: 500,
      additionalDays: 7
    });
  }

  return restrictions;
};
```

### 2. Multi-Warehouse Optimization

Optimize shipping from multiple warehouses.

```javascript
export const optimizeWarehouseSelection = (products, destination) => {
  // Group products by warehouse
  const byWarehouse = {};
  products.forEach(product => {
    const wh = product.warehouseLocation;
    if (!byWarehouse[wh]) {
      byWarehouse[wh] = [];
    }
    byWarehouse[wh].push(product);
  });

  // Calculate shipping for each warehouse option
  const options = Object.entries(byWarehouse).map(([warehouse, whProducts]) => {
    const shippingDays = calculateShippingDays(warehouse, destination);
    const totalWeight = whProducts.reduce((sum, p) => sum + p.weight, 0);
    const shippingCost = calculateShippingCost(totalWeight, shippingDays);

    return {
      warehouse,
      products: whProducts,
      shippingDays,
      shippingCost,
      itemCount: whProducts.length
    };
  });

  // Find optimal split or single warehouse
  const singleWarehouse = options.sort((a, b) =>
    (a.shippingCost + a.shippingDays * 10) - (b.shippingCost + b.shippingDays * 10)
  )[0];

  return {
    recommended: singleWarehouse,
    allOptions: options,
    splitShipment: options.length > 1
  };
};
```

---

## Discount Rules

### 1. Customer Loyalty Discounts

Apply discounts based on customer history.

```javascript
export const calculateLoyaltyDiscount = (customer, orderTotal) => {
  if (!customer) return { discount: 0 };

  const tier = customer.loyaltyTier; // 'bronze', 'silver', 'gold', 'platinum'
  const lifetimeSpend = customer.lifetimeSpend;

  const discounts = {
    bronze: 0.02,   // 2%
    silver: 0.05,   // 5%
    gold: 0.08,     // 8%
    platinum: 0.12  // 12%
  };

  let discount = discounts[tier] || 0;

  // Bonus for large orders
  if (orderTotal > 50000) {
    discount += 0.03; // Additional 3%
  }

  // Anniversary bonus
  const accountAge = Date.now() - customer.createdDate;
  const yearsActive = accountAge / (365 * 24 * 60 * 60 * 1000);
  if (yearsActive >= 5) {
    discount += 0.02; // 2% for 5+ years
  }

  return {
    discount,
    tier,
    savings: orderTotal * discount,
    reason: `${tier} member discount`
  };
};
```

### 2. Project-Based Incentives

Offer discounts for specific project types.

```javascript
export const calculateProjectIncentive = (spec, products) => {
  const incentives = [];

  // Green building incentive
  const ecoProducts = products.filter(p => p.ecoFriendly === 'Yes');
  const ecoPercentage = ecoProducts.length / products.length;

  if (ecoPercentage >= 0.75) {
    incentives.push({
      name: 'Green Building Incentive',
      discount: 0.10,
      reason: '75%+ eco-friendly products',
      eligible: true
    });
  }

  // First-time commercial builder
  if (spec.projectType === 'Commercial' && spec.firstTimeCommercial) {
    incentives.push({
      name: 'New Commercial Builder',
      discount: 0.05,
      reason: 'First commercial project support',
      eligible: true
    });
  }

  // Complete project package
  if (spec.requiredCategories?.length >= 10) {
    incentives.push({
      name: 'Complete Project Package',
      discount: 0.07,
      reason: 'Purchasing 10+ product categories',
      eligible: true
    });
  }

  const totalDiscount = incentives.reduce((sum, inc) => sum + inc.discount, 0);

  return {
    incentives,
    totalDiscount: Math.min(totalDiscount, 0.25), // Cap at 25%
    stackable: true
  };
};
```

---

## Regulatory Rules

### 1. Environmental Regulations

Check compliance with environmental laws.

```javascript
export const checkEnvironmentalCompliance = (product, spec) => {
  const issues = [];

  // California Prop 65
  if (spec.location === 'CA') {
    if (product.category === 'Paint' && !product.certifications.includes('Low VOC')) {
      issues.push({
        regulation: 'California Prop 65',
        severity: 'error',
        message: 'Product must meet California VOC limits',
        requirement: 'Low VOC certification required'
      });
    }
  }

  // EPA regulations
  if (product.description.includes('Treated Wood')) {
    const allowedTreatments = ['ACQ', 'CA-B', 'Micronized Copper'];
    const hasApprovedTreatment = allowedTreatments.some(treatment =>
      product.description.includes(treatment)
    );

    if (!hasApprovedTreatment) {
      issues.push({
        regulation: 'EPA Wood Treatment Standards',
        severity: 'warning',
        message: 'Verify wood treatment meets EPA standards',
        requirement: 'Use EPA-approved preservatives only'
      });
    }
  }

  return issues;
};
```

### 2. Safety Certifications

Verify required safety certifications.

```javascript
export const verifySafetyCertifications = (product, spec) => {
  const required = [];
  const missing = [];

  if (product.category === 'Electrical') {
    required.push('UL Listed');

    if (!product.certifications.includes('UL Listed')) {
      missing.push({
        cert: 'UL Listed',
        severity: 'critical',
        reason: 'All electrical products must be UL Listed',
        consequence: 'Cannot be legally installed'
      });
    }
  }

  if (spec.projectType === 'Commercial') {
    required.push('Fire Rating');

    if (!product.fireRating) {
      missing.push({
        cert: 'Fire Rating',
        severity: 'high',
        reason: 'Commercial buildings require fire-rated materials',
        consequence: 'May not pass inspection'
      });
    }
  }

  return { required, missing, compliant: missing.length === 0 };
};
```

---

## Priority Rules

### 1. Rush Order Handling

Prioritize products for expedited delivery.

```javascript
export const prioritizeForRushOrder = (products, spec) => {
  if (!spec.rushOrder) return products;

  return products.map(product => {
    let rushAvailable = false;
    let rushCost = 0;
    let rushDays = product.leadTimeDays;

    // In-stock items can be rushed
    if (product.stockQty > 0) {
      rushAvailable = true;
      rushDays = Math.ceil(product.leadTimeDays * 0.5); // 50% faster
      rushCost = product.price * 0.15; // 15% rush fee
    }

    // Some manufacturers offer rush production
    if (['BuildCo', 'ProBuild'].includes(product.manufacturer)) {
      rushAvailable = true;
      rushDays = Math.ceil(product.leadTimeDays * 0.75); // 25% faster
      rushCost = product.price * 0.10; // 10% rush fee
    }

    return {
      ...product,
      rushAvailable,
      rushCost,
      rushLeadTime: rushDays,
      normalLeadTime: product.leadTimeDays
    };
  }).sort((a, b) => {
    // Prioritize rush-available products
    if (a.rushAvailable && !b.rushAvailable) return -1;
    if (!a.rushAvailable && b.rushAvailable) return 1;

    // Then by rush lead time
    return a.rushLeadTime - b.rushLeadTime;
  });
};
```

---

## Integration Examples

### Complete Custom Scoring with All Rules

```javascript
export const calculateEnhancedMatchScore = (product, spec, customer) => {
  // Base matching score
  const baseMatch = calculateMatchScore(product, spec);
  let score = baseMatch.matchScore;
  const reasons = [...baseMatch.matchReasons];

  // Apply volume discount bonus
  if (spec.quantity >= 100) {
    const volumeDiscount = applyVolumeDiscount(product, spec.quantity);
    score += 5;
    reasons.push(`Volume discount: ${volumeDiscount.discountRate * 100}%`);
  }

  // Check seasonal availability
  const seasonal = checkSeasonalAvailability(product, spec.projectStartDate);
  if (!seasonal.available) {
    score -= 20;
    reasons.push(`Not available: ${seasonal.reason}`);
  }

  // Loyalty discount bonus
  if (customer) {
    const loyalty = calculateLoyaltyDiscount(customer, product.price);
    if (loyalty.discount > 0) {
      score += 3;
      reasons.push(`${customer.loyaltyTier} member benefit`);
    }
  }

  // Compliance check
  const compliance = checkCodeCompliance([product], spec);
  if (compliance.violations.length > 0) {
    score -= 15;
    reasons.push('May not meet code requirements');
  }

  return {
    ...baseMatch,
    matchScore: Math.max(0, Math.min(100, score)),
    matchReasons: reasons
  };
};
```

These examples demonstrate how to extend the platform with real-world business logic. Mix and match these patterns to create rules specific to your business needs.
