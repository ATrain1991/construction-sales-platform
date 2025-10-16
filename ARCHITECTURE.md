# Architecture Documentation

## System Architecture

The Construction Sales Platform is built with a modular, extensible architecture that separates concerns and allows for easy customization and scaling.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components - ProjectForm, ResultsDisplay)        │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│           (App.jsx - State Management)                   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│  (productMatcher.js - Filtering, Scoring, Analysis)     │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                     │
│      (csvParser.js - Data Loading & Parsing)             │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Data Storage Layer                    │
│              (CSV File - Product Data)                   │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── ProjectForm
│   ├── Basic Information Section
│   ├── Budget & Timeline Section
│   ├── Milestones Management
│   ├── Category Selection
│   ├── Certifications Section
│   └── Preferences Section
│
└── ResultsDisplay
    ├── Project Summary
    │   ├── Stats Cards
    │   ├── Alerts (Risks & Recommendations)
    │   └── Category Breakdown
    ├── Results Controls
    │   ├── Category Filter
    │   ├── Sort Options
    │   └── View Toggle
    └── Products Display
        └── ProductCard (repeated)
            ├── Product Header
            ├── Product Info
            ├── Match Reasons
            ├── Warnings
            └── Expandable Details
```

## Data Flow

### 1. Initial Load
```
User Opens App
    ↓
App.jsx useEffect
    ↓
loadProductsFromCSV()
    ↓
Parse CSV → Products Array
    ↓
Set products state
    ↓
Render ProjectForm
```

### 2. Project Submission
```
User Fills Form
    ↓
Submit Project Specification
    ↓
handleProjectSubmit()
    ↓
findMatchingProducts()
    ├── filterByLocation()
    ├── filterByProjectType()
    ├── filterByCategories()
    ├── filterByCertifications()
    ├── filterByEcoPreferences()
    └── calculateMatchScore() for each
    ↓
analyzeProject()
    ├── Calculate total cost
    ├── Check budget
    ├── Analyze timeline
    ├── Identify risks
    └── Generate recommendations
    ↓
Set projectAnalysis state
    ↓
Render ResultsDisplay
```

## Business Logic Engine

### Product Matching Algorithm

```javascript
function findMatchingProducts(products, specification) {
  // Stage 1: Hard Filters (must pass)
  let candidates = products
    .filter(p => !isRestrictedInLocation(p, spec.location))
    .filter(p => matchesProjectType(p, spec.projectType))
    .filter(p => inRequiredCategories(p, spec.categories));

  // Stage 2: Soft Filters (preferences)
  if (hasEcoPreferences(spec)) {
    candidates = applyEcoFilters(candidates, spec);
  }

  // Stage 3: Scoring
  const scored = candidates.map(product => ({
    product,
    score: calculateMatchScore(product, spec),
    timeline: analyzeTimeline(product, spec),
    reasons: buildMatchReasons(product, spec),
    warnings: identifyWarnings(product, spec)
  }));

  // Stage 4: Ranking
  return scored.sort((a, b) => b.score - a.score);
}
```

### Scoring System

The scoring system uses a weighted point system:

| Criteria | Points | Weight |
|----------|--------|--------|
| Legal Availability | 60 | Essential |
| Project Type Match | 10 | High |
| Certifications | 10 | High |
| Eco Preferences | 10 | Medium |
| Stock Availability | 5 | Medium |
| Installation Match | 5 | Medium |
| Warranty Coverage | 3 | Low |
| Timeline Feasibility | +5/-10 | Variable |

**Total Possible: 100 points**

### Timeline Calculation

```
Estimated Delivery Date = Order Date + Lead Time + Shipping Time

Shipping Time Calculation:
- Same state: 2 days
- Same region: 3 days
- Cross-region: 5 days
- Remote states (AK, HI, etc.): +3 days per remote endpoint

Timeline Met = Estimated Delivery <= Required Date
```

## Extension Points

### 1. Adding New Filters

Location: `src/services/productMatcher.js`

```javascript
export const filterByYourCriteria = (products, criteria) => {
  return products.filter(product => {
    // Your filtering logic
    return yourCondition(product, criteria);
  });
};

// Then update findMatchingProducts():
export const findMatchingProducts = (products, spec) => {
  let filtered = products;
  // ... existing filters
  filtered = filterByYourCriteria(filtered, spec.yourCriteria);
  // ... rest of function
};
```

### 2. Modifying Score Weights

Location: `src/services/productMatcher.js`

```javascript
// Create a configuration object
const SCORE_WEIGHTS = {
  legalAvailability: 60,
  projectTypeMatch: 10,
  certifications: 10,
  ecoPreferences: 10,
  stockAvailability: 5,
  installationMatch: 5,
  warranty: 3,
  timelinePenalty: 10
};

// Use in calculateMatchScore()
export const calculateMatchScore = (product, spec) => {
  let score = 0;

  if (isLegallyAvailable(product, spec)) {
    score += SCORE_WEIGHTS.legalAvailability;
  }

  // ... rest of scoring
};
```

### 3. Adding Custom Analysis

Location: `src/services/productMatcher.js`

```javascript
export const analyzeProject = (matches, spec) => {
  const analysis = {
    // ... existing analysis
    customAnalysis: performCustomAnalysis(matches, spec)
  };

  return analysis;
};

const performCustomAnalysis = (matches, spec) => {
  // Your custom analysis logic
  return {
    metric1: calculateMetric1(matches),
    metric2: calculateMetric2(matches, spec)
  };
};
```

### 4. Integrating External APIs

Create a new service file: `src/services/externalApi.js`

```javascript
export const enrichProductData = async (product) => {
  const response = await fetch(`https://api.example.com/products/${product.id}`);
  const enrichedData = await response.json();

  return {
    ...product,
    ...enrichedData
  };
};

// Use in App.jsx
const loadData = async () => {
  const products = await loadProductsFromCSV('/products.csv');
  const enriched = await Promise.all(
    products.map(p => enrichProductData(p))
  );
  setProducts(enriched);
};
```

## State Management

Currently using React's built-in state management:

```javascript
// App-level state
const [products, setProducts] = useState([]);
const [currentView, setCurrentView] = useState('form');
const [projectAnalysis, setProjectAnalysis] = useState(null);

// Component-level state
const [formData, setFormData] = useState({ /* ... */ });
const [milestones, setMilestones] = useState([]);
```

### Scaling to Context API

For larger applications, use Context:

```javascript
// src/context/ProductContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
```

### Scaling to Redux

For complex state management:

```javascript
// src/store/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async () => {
    const products = await loadProductsFromCSV('/products.csv');
    return products;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  }
});
```

## Performance Optimization

### Current Optimizations
- Single CSV load on mount
- Efficient filtering algorithms
- Sorted results cached until re-filter

### Recommended Optimizations

1. **Memoization**
```javascript
import { useMemo } from 'react';

const filteredProducts = useMemo(() => {
  return filterProducts(products, criteria);
}, [products, criteria]);
```

2. **Virtual Scrolling** (for large result sets)
```javascript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={200}
>
  {({ index, style }) => (
    <ProductCard product={products[index]} style={style} />
  )}
</FixedSizeList>
```

3. **Code Splitting**
```javascript
const ResultsDisplay = lazy(() => import('./components/ResultsDisplay'));

<Suspense fallback={<LoadingSpinner />}>
  <ResultsDisplay />
</Suspense>
```

## Security Considerations

### Input Validation
- Form inputs are validated using HTML5 validation
- Date ranges are checked
- Numeric inputs have min/max constraints

### Future Security Enhancements
- Sanitize user inputs
- Implement rate limiting for API calls
- Add CSRF protection
- Implement content security policy
- Use HTTPS for all data transmission

## Testing Strategy

### Unit Tests
Test individual functions:
```javascript
describe('productMatcher', () => {
  test('filterByLocation removes restricted products', () => {
    // Test implementation
  });

  test('calculateMatchScore returns correct score', () => {
    // Test implementation
  });
});
```

### Integration Tests
Test component interactions:
```javascript
describe('ProjectForm submission', () => {
  test('submits form data correctly', () => {
    // Test implementation
  });
});
```

### E2E Tests
Test full user flows:
```javascript
describe('Complete project flow', () => {
  test('user can create project and view results', () => {
    // Test implementation
  });
});
```

## Deployment Architecture

### Development
```
Local Machine
├── Vite Dev Server (Port 3000)
├── Hot Module Replacement
└── Source Maps Enabled
```

### Production
```
CDN (Vercel/Netlify/AWS S3)
├── Static HTML/CSS/JS
├── Optimized Assets
├── Gzip/Brotli Compression
└── Edge Caching
```

### With Backend
```
Frontend (React)
    ↓ (REST/GraphQL)
Backend API (Node.js/Python/etc)
    ↓
Database (PostgreSQL/MongoDB)
    ↓
File Storage (S3/Cloud Storage)
```

## Monitoring and Analytics

### Recommended Tools
- **Performance**: Lighthouse, Web Vitals
- **Errors**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel
- **User Behavior**: Hotjar, FullStory

### Key Metrics to Track
- Page load time
- Time to first product match
- Average match score
- User drop-off points
- Most selected categories
- Budget distribution
- Timeline feasibility rate

## Documentation Standards

### Code Comments
```javascript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
export const functionName = (paramName) => {
  // Implementation
};
```

### Component Documentation
```javascript
/**
 * ComponentName - Brief description
 *
 * @component
 * @param {Object} props
 * @param {Type} props.propName - Prop description
 * @returns {JSX.Element}
 */
const ComponentName = ({ propName }) => {
  // Implementation
};
```

## Conclusion

This architecture provides a solid foundation that can be extended with:
- Additional business rules
- External integrations
- Advanced analytics
- User management
- Real-time features
- Mobile applications

The modular design ensures each layer can be modified or replaced independently, making the platform highly adaptable to specific business needs.
