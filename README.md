# Construction Sales Platform

A modern web application for managing construction projects, matching products with project requirements, and tracking orders with visual dashboards.

## Features

### 🔐 User Authentication
- Secure login and registration system
- User accounts with isolated project data
- Session persistence across browser restarts

### 📊 Project Management
- Create and manage multiple construction projects
- Save projects with all configurations
- Load and continue working on saved projects
- Delete projects with confirmation

### 🎯 Intelligent Product Matching
- Match products based on project specifications
- Filter by location, project type, and certifications
- Score-based ranking system
- Timeline and budget analysis

### 📈 Visual Dashboard
- **Multi-colored Progress Charts**: Track overall progress with category-specific colors
- **Budget Visualization**: See budget allocation across categories
- **Category Management**: Click on charts to manage products by category
- **Custom Categories**: Create and manage custom product categories
- **Real-time Updates**: Charts update instantly as you modify orders

### 🛠️ Product Management
- Add products to categories via modal interface
- Set quantity needed and ordered for each product
- Track progress with visual indicators
- Calculate costs automatically
- Remove products from orders

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Custom CSS with CSS Variables
- **Data Storage**: localStorage (browser-based)
- **Charts**: Custom SVG-based visualizations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Construction Sales Platform"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Register/Login**: Create an account or log in to an existing one
2. **View Projects**: See all your saved projects on the project list page
3. **Create Project**: Click "New Project" and fill out the project form
4. **Manage Products**: 
   - Click on any category chart to open the product modal
   - Add products with quantities
   - Track progress with visual charts
5. **Save Progress**: Click "Save Project" to persist your work
6. **Return Later**: Load saved projects anytime to continue working

## Project Structure

```
Construction Sales Platform/
├── src/
│   ├── components/
│   │   ├── Auth.jsx              # Login/Register component
│   │   ├── ProjectList.jsx        # Project list view
│   │   ├── ProjectForm.jsx        # Project specification form
│   │   ├── ProjectDashboard.jsx   # Main dashboard with charts
│   │   └── ResultsDisplay.jsx     # Product results view
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication context
│   ├── services/
│   │   └── productMatcher.js      # Product matching logic
│   ├── utils/
│   │   └── csvParser.js           # CSV data parser
│   ├── App.jsx                    # Main application component
│   └── App.css                    # Global styles
├── public/
│   └── products.csv               # Product database
├── index.html
├── package.json
└── vite.config.js
```

## Features in Detail

### Multi-Segment Charts
- **Progress Chart**: Shows what percentage of items have been ordered, color-coded by category
- **Budget Chart**: Displays budget usage across categories with color-coded segments
- Each segment's size represents its proportion of the total

### Category Management
- Click any category chart to open a modal
- View ordered products and available products
- Add products directly from the modal
- Edit quantities in real-time
- Create custom categories for organization

### Data Persistence
- All user data stored in browser's localStorage
- Projects include specifications, ordered products, and custom categories
- Timestamps track creation and modification dates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate-data` - Generate sample product data

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with React and Vite
- Uses custom SVG charts for visualizations
- Inspired by modern construction management needs
