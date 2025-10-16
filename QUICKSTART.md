# Quick Start Guide

Get your Construction Sales Platform up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 18.2
- Vite 5.0 (development server)
- @vitejs/plugin-react

### 2. Verify Product Data

The product CSV file should already be generated. If not, run:

```bash
npm run generate-data
```

This creates `public/products.csv` with 2,000 sample products.

### 3. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Using the Platform

### Step 1: Fill Out Project Specification

1. **Basic Information**
   - Enter project name (e.g., "New Office Building")
   - Select project type (Residential, Commercial, etc.)
   - Choose state, city, and ZIP code

2. **Budget and Timeline**
   - Set maximum budget
   - Define project start and end dates

3. **Milestones (Optional)**
   - Add specific project milestones
   - Set target dates for each milestone
   - Mark critical path milestones

4. **Product Categories**
   - Select required product categories
   - Choose from: Lumber, Concrete, Steel, Insulation, etc.

5. **Certifications (Optional)**
   - Toggle "Require certified products"
   - Select specific certifications needed

6. **Preferences**
   - Check eco-friendly preference
   - Check sustainable source preference
   - Select installation capability (DIY or Professional)

7. **Additional Notes**
   - Add any special requirements

### Step 2: View Results

After submission, you'll see:

1. **Project Summary**
   - Total products found
   - Estimated cost
   - Budget status
   - Timeline feasibility

2. **Alerts**
   - Identified risks
   - Recommendations

3. **Category Breakdown**
   - Best product per category
   - Cost breakdown
   - Delivery dates

4. **Product List**
   - Ranked by match score
   - Filter by category
   - Sort by various criteria
   - Switch between grid/list view

### Step 3: Explore Product Details

Click "Show More Details" on any product to see:
- Full specifications
- Certifications
- Shipping information
- Environmental attributes
- Match reasons and warnings

## Example Project

Try this sample project to test the system:

```
Project Name: Downtown Office Renovation
Project Type: Commercial
Location: New York, NY, 10001
Budget: $100,000
Start Date: 2025-11-01
End Date: 2025-12-31

Categories:
- Flooring
- Paint
- Electrical
- Windows

Preferences:
- Eco-friendly: Yes
- Installation: Professional
```

## Project Structure Overview

```
src/
├── components/       # React components
├── services/         # Business logic
├── types/           # Type definitions
├── utils/           # Utility functions
├── App.jsx          # Main app
└── index.jsx        # Entry point

public/
└── products.csv     # Product data (2000 items)
```

## Common Tasks

### Add New Products

Edit `src/utils/generateProductData.js` and regenerate:

```bash
npm run generate-data
```

### Modify Styling

Edit `src/App.css` for component styles or `src/index.css` for global styles.

### Add Business Rules

Edit `src/services/productMatcher.js`:

```javascript
// Add new filter
export const filterByCustomRule = (products, criteria) => {
  return products.filter(product => {
    // Your logic here
  });
};

// Update findMatchingProducts to use it
```

### Change Scoring Weights

In `src/services/productMatcher.js`, modify `calculateMatchScore()`:

```javascript
// Example: Give more weight to stock availability
if (product.stockQty > 0) {
  score += 15; // Changed from 5
  matchReasons.push('In stock');
}
```

## Build for Production

```bash
npm run build
```

Outputs to `dist/` folder. Deploy to any static hosting service.

## Troubleshooting

### Products Not Loading
- Check that `public/products.csv` exists
- Verify file path in `App.jsx` is correct (`/products.csv`)
- Check browser console for errors

### Form Not Submitting
- Ensure all required fields are filled
- Check browser console for validation errors
- Verify dates are in correct format

### Slow Performance
- For large datasets (>5000 products), implement pagination
- Use virtual scrolling for results
- Consider server-side filtering

## Next Steps

1. **Customize Product Data**
   - Modify `generateProductData.js` for your products
   - Add/remove categories
   - Adjust restrictions and certifications

2. **Add Custom Business Rules**
   - See `ARCHITECTURE.md` for extension points
   - Implement volume discounts
   - Add seasonal availability
   - Create compatibility rules

3. **Integrate with Backend**
   - Replace CSV with API calls
   - Add database integration
   - Implement user authentication

4. **Enhance UI**
   - Add product images
   - Create comparison views
   - Implement export functionality

5. **Deploy**
   - Push to Vercel/Netlify
   - Set up CI/CD
   - Configure custom domain

## Resources

- [README.md](README.md) - Full documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

## Support

Check inline code comments and JSDoc documentation for detailed information about each function and component.

## Sample Data Statistics

The included CSV contains:
- **2,000 products** across 16 categories
- **50 US states** with location-based filtering
- **10 manufacturers**
- **8 certification types**
- **6 project types**
- **Varied pricing**: $5 - $3,500
- **Lead times**: 1-30 days
- **Stock levels**: 0-5,000 units

Perfect for testing all features of the platform!

---

Happy building! 🏗️
