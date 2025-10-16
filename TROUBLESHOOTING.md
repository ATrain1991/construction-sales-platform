# Troubleshooting Guide

Common issues and their solutions for the Construction Sales Platform.

## Installation Issues

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Alternative:** Use a different package manager:
```bash
# Using yarn
yarn install

# Using pnpm
pnpm install
```

---

### Issue: "Cannot find module" errors

**Cause:** Missing dependencies

**Solution:**
```bash
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react
```

---

## Runtime Errors

### Issue: "require is not defined in ES module scope"

**Cause:** Using CommonJS syntax in ES module

**Solution:** The data generation script should use `.cjs` extension:
- File should be named `generateProductData.cjs` (not `.js`)
- package.json script should reference `.cjs` file

**Verify:**
```bash
# Check package.json
"generate-data": "node src/utils/generateProductData.cjs"
```

---

### Issue: Products CSV not loading

**Symptoms:**
- Error: "Failed to load CSV"
- No products displayed
- Loading spinner never stops

**Solutions:**

1. **Check file exists:**
```bash
ls public/products.csv
```

2. **Regenerate CSV:**
```bash
npm run generate-data
```

3. **Check file path in App.jsx:**
```javascript
// Should be:
const products = await loadProductsFromCSV('/products.csv');
// NOT: './products.csv' or 'public/products.csv'
```

4. **Check browser console:**
- Open DevTools (F12)
- Look for fetch errors
- Verify the file is being requested from correct URL

---

### Issue: "Failed to parse URL from /products.csv"

**Cause:** Vite dev server configuration issue

**Solution:** Ensure `public/` folder contains `products.csv` and restart dev server:
```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

---

### Issue: Form submission doesn't work

**Symptoms:**
- Nothing happens when clicking "Find Matching Products"
- Console shows validation errors

**Solutions:**

1. **Fill all required fields:**
   - Project Name
   - Project Type
   - State, City, ZIP Code
   - Budget
   - Start and End Dates

2. **Check date format:**
   - Dates must be in YYYY-MM-DD format
   - End date must be after start date

3. **Check browser console:**
   - Look for validation or JavaScript errors

---

### Issue: No products shown in results

**Symptoms:**
- Form submits successfully
- Results page shows "0 products found"

**Possible Causes & Solutions:**

1. **Too restrictive filters:**
   - Don't select too many required categories
   - Try without certifications first
   - Increase budget
   - Extend timeline

2. **All products restricted in location:**
   - Unlikely but possible
   - Try different state
   - Check CSV for restrictedStates values

3. **Date in the past:**
   - Project dates should be in the future
   - Check that dates are valid

---

## Build Issues

### Issue: Build fails with Vite errors

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist folder
rm -rf dist

# Rebuild
npm run build
```

---

### Issue: CSS not loading in production

**Cause:** Missing import statements

**Solution:** Verify imports in files:
```javascript
// In App.jsx
import './App.css';

// In index.jsx
import './index.css';
```

---

## Browser Issues

### Issue: Page is blank

**Solutions:**

1. **Check browser console:**
   - Press F12
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

3. **Try different browser:**
   - Chrome, Firefox, Safari, Edge all supported
   - Ensure browser is up to date

---

### Issue: Styling looks broken

**Symptoms:**
- Layout is wrong
- No colors
- Elements overlapping

**Solutions:**

1. **Check CSS files are loaded:**
   - Open DevTools Network tab
   - Look for App.css and index.css
   - Should return 200 status

2. **Clear CSS cache:**
   - Hard refresh: Ctrl+Shift+R

3. **Verify CSS imports:**
```javascript
// App.jsx should have:
import './App.css';
```

---

## Performance Issues

### Issue: Page loads slowly

**Causes & Solutions:**

1. **Large CSV file:**
   - Current file (2000 products) should load in <1 second
   - If you've added more data, consider pagination
   - Or move to database solution

2. **Too many products rendering:**
   - Results are already sorted by match score
   - Consider limiting displayed results:
```javascript
// In ResultsDisplay.jsx
const displayProducts = displayProducts.slice(0, 100); // Show top 100
```

3. **Browser extensions:**
   - Disable ad blockers temporarily
   - Try in incognito/private mode

---

### Issue: Form is laggy/slow

**Cause:** Too many re-renders

**Solution:** This shouldn't happen with current implementation, but if it does:
```javascript
// Use React.memo for heavy components
export default React.memo(ProjectForm);
```

---

## Development Server Issues

### Issue: Port 3000 already in use

**Error:** `Port 3000 is already in use`

**Solutions:**

1. **Use different port:**
```bash
npm run dev -- --port 3001
```

2. **Kill process using port 3000:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

3. **Change default port in vite.config.js:**
```javascript
export default defineConfig({
  server: {
    port: 3001
  }
});
```

---

### Issue: Hot reload not working

**Symptoms:**
- Changes don't appear automatically
- Must refresh browser manually

**Solutions:**

1. **Restart dev server:**
```bash
# Ctrl+C to stop
npm run dev
```

2. **Check file is in src/ folder:**
   - Only files in src/ trigger HMR
   - public/ files require manual refresh

3. **Check WebSocket connection:**
   - Browser console should not show WebSocket errors
   - Firewall might be blocking WebSocket

---

## Data Issues

### Issue: Products have wrong data

**Solution:** Regenerate CSV:
```bash
npm run generate-data
```

This creates fresh data. Previous data will be overwritten.

---

### Issue: Want to customize product data

**Solution:** Edit `src/utils/generateProductData.cjs`:

1. **Change number of products:**
```javascript
// Line 212
const products = generateProducts(5000); // Change 2000 to 5000
```

2. **Add new categories:**
```javascript
// Line 5-9
const categories = [
  'Lumber', 'Concrete', 'Steel',
  'YourNewCategory' // Add here
];
```

3. **Adjust pricing:**
```javascript
// Lines 121-129
case 'YourCategory': basePrice = 100 + Math.random() * 500; break;
```

4. **Regenerate:**
```bash
npm run generate-data
```

---

## Deployment Issues

### Issue: Build succeeds but site doesn't work when deployed

**Common Causes:**

1. **Base URL issue:**
   - Add base URL to vite.config.js if not deploying to root:
```javascript
export default defineConfig({
  base: '/your-subdirectory/',
});
```

2. **Environment variables:**
   - If using env vars, ensure they're set in deployment platform
   - Vite requires `VITE_` prefix for public env vars

3. **404 on routes:**
   - Add redirect rules for SPA
   - For Netlify: create `public/_redirects`:
```
/*    /index.html   200
```

---

### Issue: Products CSV not loading in production

**Cause:** File not included in build

**Solution:**
- Ensure `products.csv` is in `public/` folder
- Public folder is automatically copied to dist during build
- Verify file exists in `dist/` after build:
```bash
ls dist/products.csv
```

---

## Getting Help

If you encounter an issue not listed here:

1. **Check browser console:**
   - Press F12
   - Look for red error messages
   - Note the error message and file/line number

2. **Check terminal output:**
   - Look for error messages when running npm commands
   - Note any warnings or errors

3. **Verify file structure:**
```bash
# Should match:
src/
  components/
  services/
  types/
  utils/
  App.jsx
  App.css
  index.jsx
  index.css
public/
  index.html
  products.csv
```

4. **Check package versions:**
```bash
npm list react react-dom vite
```

5. **Try clean install:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Diagnostics

Run these commands to check your setup:

```bash
# 1. Verify Node.js version (should be 16+)
node --version

# 2. Verify npm version
npm --version

# 3. Check if products.csv exists
ls public/products.csv

# 4. Verify dependencies installed
ls node_modules/react
ls node_modules/vite

# 5. Test data generation
npm run generate-data

# 6. Try starting dev server
npm run dev
```

All commands should succeed without errors.

---

## Still Having Issues?

1. Review the documentation:
   - README.md - Full feature documentation
   - QUICKSTART.md - Getting started guide
   - ARCHITECTURE.md - System architecture

2. Check the example project in QUICKSTART.md

3. Ensure you're using a supported browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

4. Try the application in incognito/private mode to rule out extension conflicts
