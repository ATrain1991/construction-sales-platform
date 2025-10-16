# Business Rules Configuration Guide

This guide explains how to customize the business rules in the Construction Sales Platform to match your specific business requirements.

## Location

Business rules are configured in: **`src/config/businessRules.js`**

## Available Rule Categories

### 1. Scoring Rules

Control how products are scored and ranked in search results.

```javascript
export const scoringRules = {
  baseAvailabilityScore: 60,      // Base points for available products
  projectTypeMatch: 10,            // Points for matching project type
  certificationPoints: 5,          // Points per matching certification
  maxCertificationPoints: 10,      // Maximum points from certifications
  // ... see file for all options
};
```

**How to modify:**
- Increase `projectTypeMatch` to prioritize project-specific products
- Adjust `ecoFriendlyPoints` to favor sustainable products
- Change `timelineMetBonus` to emphasize delivery speed

### 2. Budget Rules

Configure budget calculations and thresholds.

```javascript
export const budgetRules = {
  budgetCushion: 0.9,              // Use 90% of budget for filtering
  warningThreshold: 0.85,          // Warn at 85% of budget
  criticalThreshold: 1.0,          // Critical alert at 100%
  allowOverBudget: true            // Allow over-budget projects
};
```

**Use cases:**
- Set `budgetCushion` to 1.0 to use full budget
- Lower `warningThreshold` for more conservative budgeting
- Set `allowOverBudget: false` to strictly enforce budgets

### 3. Timeline Rules

Manage project timeline calculations.

```javascript
export const timelineRules = {
  safetyBufferDays: 7,             // Extra days for safety margin
  minimumTimelineDays: 30,         // Minimum project duration
  rushOrderMultiplier: 0.75,       // Lead time reduction for rush orders
  weekendAdjustment: 2             // Additional days for weekends
};
```

### 4. Product Filtering Rules

Control which products appear in results.

```javascript
export const filteringRules = {
  strictCertifications: false,     // Require exact certification matches
  allowOutOfStock: true,           // Show out-of-stock items
  minStockQuantity: 1,             // Minimum stock to show
  includeDiscontinued: false,      // Show discontinued products
  maxLeadTimeDays: 90              // Maximum acceptable lead time
};
```

### 5. Category Rules

Define default categories and priorities.

```javascript
export const categoryRules = {
  defaultCategories: {
    'Residential': ['Lumber', 'Roofing', 'Insulation', 'Drywall', 'Paint'],
    'Commercial': ['Concrete', 'Steel', 'Glass', 'HVAC', 'Electrical'],
    // Add your project types here
  },

  priorities: {
    'Safety Equipment': 100,       // Highest priority
    'Foundation': 90,
    'Structural': 80,
    // Adjust based on importance
  }
};
```

### 6. Pricing Rules

Configure pricing, discounts, and shipping.

```javascript
export const pricingRules = {
  volumeDiscounts: {
    10: 0.05,   // 5% off for 10+ items
    25: 0.10,   // 10% off for 25+ items
    50: 0.15,   // 15% off for 50+ items
    100: 0.20   // 20% off for 100+ items
  },

  bulkOrderThreshold: 10000,
  bulkOrderDiscount: 0.12,
  taxRate: 0.0,                    // Set your tax rate

  shipping: {
    freeShippingThreshold: 5000,
    flatRate: 150,
    perItemRate: 10
  }
};
```

### 7. Notification Rules

Control warnings and alerts.

```javascript
export const notificationRules = {
  warnOnLateDelivery: true,
  warnOnOverBudget: true,
  warnOnOutOfStock: true,
  showRecommendations: true,
  minDisplayScore: 50              // Hide low-scoring products
};
```

## Custom Business Logic

### Custom Scoring Function

Add your own scoring logic:

```javascript
export const customScoring = (product, specification) => {
  let bonusPoints = 0;

  // Example: Prefer local suppliers
  if (product.warehouseLocation === specification.location) {
    bonusPoints += 10;
  }

  // Example: Seasonal adjustments
  const month = new Date().getMonth();
  if (month >= 10 || month <= 2) { // Winter
    if (product.category === 'Insulation') {
      bonusPoints += 5;
    }
  }

  // Add your custom logic here

  return bonusPoints;
};
```

### Custom Filtering Function

Filter products based on custom criteria:

```javascript
export const customFilter = (product, specification) => {
  // Return false to exclude the product

  // Example: Government projects require eco-friendly products
  if (specification.projectType === 'Government') {
    if (product.ecoFriendly !== 'Yes') {
      return false;
    }
  }

  // Example: Minimum warranty requirement
  if (specification.requireWarranty && product.warrantyYears < 5) {
    return false;
  }

  return true; // Include product
};
```

### Custom Price Adjustment

Implement dynamic pricing:

```javascript
export const adjustPrice = (basePrice, quantity, product, specification) => {
  let finalPrice = basePrice;

  // Apply volume discounts (already implemented)
  // Add your custom pricing logic:

  // Example: Premium customer discount
  if (specification.customerTier === 'Premium') {
    finalPrice *= 0.95; // 5% discount
  }

  // Example: Time-based pricing
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) { // After hours
    finalPrice *= 1.10; // 10% surcharge
  }

  return finalPrice;
};
```

## Common Customization Examples

### Example 1: Prioritize Eco-Friendly Products

```javascript
// In scoringRules
ecoFriendlyPoints: 10,  // Increase from 5 to 10
maxEcoPoints: 20,       // Increase from 10 to 20
```

### Example 2: Strict Budget Enforcement

```javascript
// In budgetRules
budgetCushion: 0.95,        // Tighter budget
warningThreshold: 0.75,     // Earlier warning
allowOverBudget: false      // No over-budget projects
```

### Example 3: Favor Local Suppliers

```javascript
// In customScoring function
if (product.warehouseLocation === specification.location) {
  bonusPoints += 20; // Increase local bonus
}
```

### Example 4: Custom Volume Discounts

```javascript
// In pricingRules
volumeDiscounts: {
  5: 0.03,    // 3% off for 5+ items
  15: 0.08,   // 8% off for 15+ items
  30: 0.12,   // 12% off for 30+ items
  75: 0.18,   // 18% off for 75+ items
  150: 0.25   // 25% off for 150+ items
}
```

### Example 5: Industry-Specific Rules

```javascript
// In customFilter function
export const customFilter = (product, specification) => {
  // Healthcare projects require specific certifications
  if (specification.industry === 'Healthcare') {
    const requiredCerts = ['FDA Approved', 'Medical Grade'];
    const productCerts = product.certifications.split(';');

    const hasRequired = requiredCerts.some(cert =>
      productCerts.includes(cert)
    );

    if (!hasRequired) return false;
  }

  return true;
};
```

## Testing Your Rules

After modifying business rules:

1. **Save the file**: Changes are automatically hot-reloaded in development
2. **Create a test project**: Use the project form to test your rules
3. **Verify scoring**: Check that products are scored as expected
4. **Test edge cases**: Try extreme values (very high quantities, tight budgets, etc.)

## Best Practices

1. **Document your changes**: Add comments explaining why you made specific changes
2. **Test incrementally**: Change one rule at a time and test
3. **Keep backups**: Consider versioning your business rules
4. **Monitor results**: Watch how rule changes affect product recommendations
5. **Iterate**: Refine rules based on real-world usage

## Troubleshooting

### Products not appearing in results
- Check `filteringRules.minDisplayScore` - lower it to see more products
- Review `customFilter` function - ensure it's not excluding products
- Verify `filteringRules.allowOutOfStock` is true if needed

### Unexpected scoring
- Review all `scoringRules` values
- Check `customScoring` function for errors
- Ensure bonus/penalty values are reasonable (typically -20 to +20)

### Budget issues
- Adjust `budgetRules.budgetCushion`
- Check if `allowOverBudget` is set correctly
- Review pricing calculations in `adjustPrice`

## Need Help?

- Check the [README.md](README.md) for general documentation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [EXAMPLES.md](EXAMPLES.md) for more code examples
- Open an issue on GitHub for support

## Contributing

When adding new business rules:
1. Document them thoroughly in this file
2. Add examples of usage
3. Include test cases
4. Submit a pull request with your changes
