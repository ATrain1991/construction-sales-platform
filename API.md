# API Reference

Complete reference for all functions and utilities in the Construction Sales Platform.

## Table of Contents

- [CSV Parser](#csv-parser)
- [Product Matcher](#product-matcher)
- [Type Definitions](#type-definitions)

---

## CSV Parser

**File**: `src/utils/csvParser.js`

### parseCSV

Parse CSV text into array of objects.

```javascript
parseCSV(csvText: string): Array<Object>
```

**Parameters:**
- `csvText` (string) - Raw CSV text content

**Returns:**
- Array of objects where each object represents a row with properties matching CSV headers

**Example:**
```javascript
const csvText = "id,name,price\n1,Product A,10.99\n2,Product B,20.50";
const data = parseCSV(csvText);
// [{id: "1", name: "Product A", price: 10.99}, {...}]
```

---

### loadProductsFromCSV

Load and parse products from CSV file.

```javascript
loadProductsFromCSV(filePath: string): Promise<Array<Object>>
```

**Parameters:**
- `filePath` (string) - Path to CSV file (relative to public directory)

**Returns:**
- Promise resolving to array of product objects

**Example:**
```javascript
const products = await loadProductsFromCSV('/products.csv');
console.log(products.length); // 2000
```

**Throws:**
- Error if file cannot be loaded or parsed

---

### calculateShippingDays

Calculate estimated shipping days between warehouse and destination.

```javascript
calculateShippingDays(
  warehouseState: string,
  destinationState: string
): number
```

**Parameters:**
- `warehouseState` (string) - Two-letter state code of warehouse
- `destinationState` (string) - Two-letter state code of destination

**Returns:**
- Number of estimated shipping days (2-15 days)

**Logic:**
- Same state: 2 days
- Same region: 3 days
- Different regions: 5 days
- Remote states (AK, HI, etc.): +3 days per remote location

**Example:**
```javascript
const days = calculateShippingDays('CA', 'CA'); // 2
const days2 = calculateShippingDays('CA', 'NY'); // 5
const days3 = calculateShippingDays('CA', 'HI'); // 8
```

---

## Product Matcher

**File**: `src/services/productMatcher.js`

### filterByLocation

Filter products based on location restrictions.

```javascript
filterByLocation(
  products: Array<Product>,
  stateCode: string
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `stateCode` (string) - Two-letter state code

**Returns:**
- Array of products that are not restricted in the given state

**Example:**
```javascript
const legalProducts = filterByLocation(allProducts, 'CA');
// Returns only products where 'CA' is not in restrictedStates
```

---

### filterByProjectType

Filter products by project type compatibility.

```javascript
filterByProjectType(
  products: Array<Product>,
  projectType: string
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `projectType` (string) - Project type (e.g., "Residential", "Commercial")

**Returns:**
- Array of products applicable to the project type

**Example:**
```javascript
const residentialProducts = filterByProjectType(products, 'Residential');
```

---

### filterByCategories

Filter products by category list.

```javascript
filterByCategories(
  products: Array<Product>,
  categories: Array<string>
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `categories` (Array) - Array of category names

**Returns:**
- Array of products in the specified categories

**Example:**
```javascript
const filtered = filterByCategories(products, ['Lumber', 'Steel']);
```

---

### filterByCertifications

Filter products by required certifications.

```javascript
filterByCertifications(
  products: Array<Product>,
  requiredCerts: Array<string>
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `requiredCerts` (Array) - Array of required certification names

**Returns:**
- Array of products that have ALL required certifications

**Example:**
```javascript
const certified = filterByCertifications(products, ['UL Listed', 'Energy Star']);
```

---

### filterByBudget

Filter products by budget constraints.

```javascript
filterByBudget(
  products: Array<Product>,
  maxBudget: number,
  cushion?: number
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `maxBudget` (number) - Maximum budget
- `cushion` (number, optional) - Budget cushion percentage (default: 0.9)

**Returns:**
- Array of products within budget

**Example:**
```javascript
const affordable = filterByBudget(products, 10000, 0.8);
// Returns products under $8000 (80% of $10000)
```

---

### filterByStock

Filter products by stock availability.

```javascript
filterByStock(
  products: Array<Product>,
  inStockOnly?: boolean
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `inStockOnly` (boolean, optional) - Filter to in-stock only (default: false)

**Returns:**
- Array of products (filtered if inStockOnly is true)

**Example:**
```javascript
const available = filterByStock(products, true);
// Returns only products with stockQty > 0
```

---

### filterByEcoPreferences

Filter products by environmental preferences.

```javascript
filterByEcoPreferences(
  products: Array<Product>,
  preferences: {
    ecoFriendly?: boolean,
    sustainable?: boolean,
    recyclable?: boolean
  }
): Array<Product>
```

**Parameters:**
- `products` (Array) - Array of product objects
- `preferences` (Object) - Environmental preferences

**Returns:**
- Array of products matching preferences

**Example:**
```javascript
const ecoProducts = filterByEcoPreferences(products, {
  ecoFriendly: true,
  sustainable: true
});
```

---

### checkTimeline

Check if product can meet timeline requirements.

```javascript
checkTimeline(
  product: Product,
  requiredDate: Date,
  projectState: string,
  orderDate?: Date
): {
  estimatedShippingDays: number,
  totalLeadTime: number,
  estimatedDelivery: Date,
  meetsTimeline: boolean,
  daysMargin: number
}
```

**Parameters:**
- `product` (Object) - Product object
- `requiredDate` (Date) - Required delivery date
- `projectState` (string) - Project location state code
- `orderDate` (Date, optional) - Expected order date (default: today)

**Returns:**
- Object with timeline analysis

**Example:**
```javascript
const timeline = checkTimeline(
  product,
  new Date('2025-12-31'),
  'CA',
  new Date('2025-11-01')
);

console.log(timeline.meetsTimeline); // true/false
console.log(timeline.daysMargin); // 15 (days before/after deadline)
```

---

### calculateMatchScore

Calculate match score for a product based on project specifications.

```javascript
calculateMatchScore(
  product: Product,
  spec: ProjectSpecification
): {
  product: Product,
  matchScore: number,
  matchReasons: Array<string>,
  warnings: Array<string>,
  estimatedShippingDays: number,
  totalLeadTime: number,
  estimatedDelivery: Date,
  meetsTimeline: boolean,
  daysMargin: number
}
```

**Parameters:**
- `product` (Object) - Product object
- `spec` (Object) - Project specification

**Returns:**
- Object with match score (0-100) and analysis

**Scoring Breakdown:**
- Legal availability: 60 points (base)
- Project type match: 10 points
- Certifications: up to 10 points (5 per match)
- Eco preferences: up to 10 points (5 per match)
- Stock availability: 5 points
- Installation match: 5 points
- Warranty: up to 3 points
- Timeline: +5 if met, -10 if missed

**Example:**
```javascript
const match = calculateMatchScore(product, specification);
console.log(match.matchScore); // 87
console.log(match.matchReasons); // ["Available in your location", "In stock", ...]
console.log(match.warnings); // ["Will be 5 days late"]
```

---

### findMatchingProducts

Find and rank products matching project specifications.

```javascript
findMatchingProducts(
  allProducts: Array<Product>,
  spec: ProjectSpecification
): Array<ProductMatch>
```

**Parameters:**
- `allProducts` (Array) - All available products
- `spec` (Object) - Project specification

**Returns:**
- Array of matched products sorted by match score (descending)

**Process:**
1. Apply location filter (mandatory)
2. Apply project type filter
3. Apply category filter (if specified)
4. Apply certification filter (if required)
5. Apply eco preference filters (if specified)
6. Calculate match score for each product
7. Sort by match score

**Example:**
```javascript
const matches = findMatchingProducts(products, {
  projectName: "Office Building",
  projectType: "Commercial",
  location: "CA",
  maxBudget: 50000,
  projectEndDate: new Date('2025-12-31'),
  requiredCategories: ["Lumber", "Concrete"],
  ecoFriendlyPreference: true
});

console.log(matches.length); // 247
console.log(matches[0].matchScore); // 92 (highest)
```

---

### analyzeProject

Analyze project feasibility and generate recommendations.

```javascript
analyzeProject(
  matchedProducts: Array<ProductMatch>,
  spec: ProjectSpecification
): {
  specification: ProjectSpecification,
  recommendedProducts: Array<ProductMatch>,
  estimatedTotalCost: number,
  categoryBreakdown: Object,
  timelineAnalysis: {
    feasible: boolean,
    criticalPath: Array,
    concerns: Array<string>
  },
  risks: Array<string>,
  recommendations: Array<string>
}
```

**Parameters:**
- `matchedProducts` (Array) - Array of matched products
- `spec` (Object) - Project specification

**Returns:**
- Comprehensive project analysis

**Analysis Includes:**
- Total estimated cost
- Best product per category
- Budget compliance check
- Timeline feasibility
- Risk identification
- Actionable recommendations

**Example:**
```javascript
const analysis = analyzeProject(matches, specification);

console.log(analysis.estimatedTotalCost); // 45234.56
console.log(analysis.timelineAnalysis.feasible); // true
console.log(analysis.risks); // ["2 products out of stock"]
console.log(analysis.recommendations); // ["Consider increasing budget by 10%"]
```

---

## Type Definitions

**File**: `src/types/index.js`

### Product

Product data structure from CSV.

```javascript
{
  productId: string,          // "P1000"
  productName: string,        // "2x4 Lumber"
  category: string,           // "Lumber"
  manufacturer: string,       // "BuildCo"
  price: number,              // 5.99
  unit: string,               // "ea", "ft", "sqft", "bundle", "box"
  minOrderQty: number,        // 10
  stockQty: number,           // 500
  leadTimeDays: number,       // 5
  warehouseLocation: string,  // "CA"
  weight: number,             // 15.5
  dimensions: string,         // "96x3.5x1.5"
  restrictedStates: string,   // "CA;NY" (semicolon-separated)
  applicableProjectTypes: string, // "Residential;Commercial"
  certifications: string,     // "FSC Certified;LEED Certified"
  ecoFriendly: string,        // "Yes" or "No"
  recyclable: string,         // "Yes" or "No"
  sustainableSource: string,  // "Yes" or "No"
  warrantyYears: number,      // 10
  fireRating: string,         // "Class A", "Class B", "Class C", or ""
  installationDifficulty: string, // "Easy", "Moderate", "Complex", "Professional Required"
  description: string         // Full product description
}
```

### ProjectSpecification

Project specifications defined by customer.

```javascript
{
  projectName: string,
  projectType: string,        // "Residential", "Commercial", etc.
  location: string,           // State code
  city: string,
  zipCode: string,
  maxBudget: number,
  projectStartDate: Date,
  projectEndDate: Date,
  milestones: Array<{
    id: string,
    name: string,
    targetDate: Date,
    requiredCategories: Array<string>,
    critical: boolean
  }>,
  requiredCategories: Array<string>,
  preferredManufacturers: Array<string>,
  requireCertifications: boolean,
  requiredCertifications: Array<string>,
  ecoFriendlyPreference: boolean,
  sustainablePreference: boolean,
  installationCapability: string, // "DIY" or "Professional"
  notes: string
}
```

### ProductMatch

Product match result with scoring.

```javascript
{
  product: Product,
  matchScore: number,         // 0-100
  matchReasons: Array<string>,
  warnings: Array<string>,
  estimatedShippingDays: number,
  totalLeadTime: number,
  estimatedDelivery: Date,
  meetsTimeline: boolean,
  daysMargin: number,
  applicableMilestones: Array<string>
}
```

### ProjectAnalysis

Complete project analysis result.

```javascript
{
  specification: ProjectSpecification,
  recommendedProducts: Array<ProductMatch>,
  estimatedTotalCost: number,
  categoryBreakdown: {
    [category]: {
      product: string,
      cost: number,
      deliveryDate: Date
    }
  },
  timelineAnalysis: {
    feasible: boolean,
    criticalPath: Array,
    concerns: Array<string>
  },
  risks: Array<string>,
  recommendations: Array<string>
}
```

---

## Constants

### PROJECT_TYPES
```javascript
['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation', 'New Construction']
```

### PRODUCT_CATEGORIES
```javascript
['Lumber', 'Concrete', 'Steel', 'Insulation', 'Roofing', 'Electrical',
 'Plumbing', 'HVAC', 'Flooring', 'Drywall', 'Paint', 'Windows',
 'Doors', 'Fixtures', 'Hardware', 'Tools']
```

### US_STATES
```javascript
[
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  // ... all 50 states
]
```

### CERTIFICATIONS
```javascript
['UL Listed', 'Energy Star', 'LEED Certified', 'FSC Certified',
 'Green Guard', 'CE Marked', 'ISO 9001', 'ASTM Compliant']
```

### INSTALLATION_LEVELS
```javascript
['Easy', 'Moderate', 'Complex', 'Professional Required']
```

---

## Usage Examples

### Complete Workflow

```javascript
import { loadProductsFromCSV } from './utils/csvParser.js';
import { findMatchingProducts, analyzeProject } from './services/productMatcher.js';

// 1. Load products
const products = await loadProductsFromCSV('/products.csv');

// 2. Define project specification
const spec = {
  projectName: "Modern Office Building",
  projectType: "Commercial",
  location: "CA",
  city: "San Francisco",
  zipCode: "94102",
  maxBudget: 100000,
  projectStartDate: new Date('2025-11-01'),
  projectEndDate: new Date('2025-12-31'),
  requiredCategories: ['Electrical', 'Flooring', 'Paint'],
  requireCertifications: true,
  requiredCertifications: ['Energy Star', 'LEED Certified'],
  ecoFriendlyPreference: true,
  installationCapability: 'Professional'
};

// 3. Find matching products
const matches = findMatchingProducts(products, spec);

// 4. Analyze project
const analysis = analyzeProject(matches, spec);

// 5. Use results
console.log(`Found ${analysis.recommendedProducts.length} products`);
console.log(`Total cost: $${analysis.estimatedTotalCost}`);
console.log(`Timeline feasible: ${analysis.timelineAnalysis.feasible}`);

// 6. Get top 10 recommendations
const topProducts = analysis.recommendedProducts.slice(0, 10);
topProducts.forEach(match => {
  console.log(`${match.product.productName}: ${match.matchScore}/100`);
});
```

### Custom Filter Example

```javascript
// Add custom filter for seasonal availability
export const filterBySeason = (products, orderDate) => {
  const month = orderDate.getMonth();

  return products.filter(product => {
    // Example: Roofing not available in winter
    if (product.category === 'Roofing' && [11, 0, 1].includes(month)) {
      return false;
    }
    return true;
  });
};

// Use in workflow
let filtered = filterByLocation(products, spec.location);
filtered = filterBySeason(filtered, spec.projectStartDate);
```

### Custom Scoring Example

```javascript
// Add bonus points for preferred manufacturers
const calculateCustomScore = (product, spec) => {
  const baseMatch = calculateMatchScore(product, spec);

  if (spec.preferredManufacturers?.includes(product.manufacturer)) {
    baseMatch.matchScore = Math.min(baseMatch.matchScore + 10, 100);
    baseMatch.matchReasons.push('Preferred manufacturer');
  }

  return baseMatch;
};
```

---

## Error Handling

All functions handle errors gracefully:

```javascript
try {
  const products = await loadProductsFromCSV('/products.csv');
} catch (error) {
  console.error('Failed to load products:', error);
  // Handle error appropriately
}
```

---

## Performance Notes

- **Filtering**: O(n) per filter, efficient for datasets up to 10,000 products
- **Scoring**: O(n) for all products passing filters
- **Sorting**: O(n log n) for final ranking

For larger datasets (>10,000 products):
- Consider server-side filtering
- Implement pagination
- Use database indexes
- Cache frequently used results

---

## TypeScript Support

To add TypeScript support:

1. Install dependencies:
```bash
npm install --save-dev typescript @types/react @types/react-dom
```

2. Rename files to `.ts`/`.tsx`

3. Add type definitions (examples in comments)

---

This API reference provides complete documentation for extending and customizing the Construction Sales Platform.
