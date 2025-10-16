import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm.jsx';
import ResultsDisplay from './components/ResultsDisplay.jsx';
import ProjectDashboard from './components/ProjectDashboard.jsx';
import { loadProductsFromCSV } from './utils/csvParser.js';
import { findMatchingProducts, analyzeProject } from './services/productMatcher.js';
import './App.css';

/**
 * Main Application Component
 * Manages application state and coordinates between form and results
 */
function AppContent() {
  const { currentUser } = useAuth();
  const { saveProject } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('projectList'); // 'projectList', 'form', 'results', or 'dashboard'
  const [projectAnalysis, setProjectAnalysis] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  // Show auth screen if not logged in
  if (!currentUser) {
    return <Auth />;
  }

  // Load products on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const loadedProducts = await loadProductsFromCSV('/products.csv');
        setProducts(loadedProducts);
        setError(null);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load product data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle form submission
  const handleProjectSubmit = async (specification) => {
    try {
      setProcessingRequest(true);

      // Find matching products
      const matches = findMatchingProducts(products, specification);

      // Analyze project
      const analysis = analyzeProject(matches, specification);

      setProjectAnalysis(analysis);
      setCurrentView('dashboard'); // Changed to go directly to dashboard
    } catch (err) {
      console.error('Error processing project:', err);
      setError('Error processing your request. Please try again.');
    } finally {
      setProcessingRequest(false);
    }
  };

  // Handle back to form
  const handleBackToForm = () => {
    setCurrentView('form');
  };

  // Handle back to project list
  const handleBackToProjectList = () => {
    setCurrentView('projectList');
    setProjectAnalysis(null);
    setCurrentProject(null);
  };

  // Handle new project
  const handleNewProject = () => {
    setCurrentProject(null);
    setProjectAnalysis(null);
    setCurrentView('form');
  };

  // Handle load project
  const handleLoadProject = (project) => {
    setCurrentProject(project);

    // Reconstruct analysis from saved project
    const matches = findMatchingProducts(products, project.specification);
    const analysis = analyzeProject(matches, project.specification);

    setProjectAnalysis(analysis);
    setCurrentView('dashboard');
  };

  // Handle save project
  const handleSaveProject = (orderedProducts, customCategories) => {
    try {
      const projectData = {
        id: currentProject?.id,
        name: projectAnalysis.specification.projectName,
        specification: projectAnalysis.specification,
        orderedProducts,
        customCategories,
        createdAt: currentProject?.createdAt
      };

      const savedProject = saveProject(projectData);
      setCurrentProject(savedProject);
      return savedProject;
    } catch (err) {
      console.error('Failed to save project:', err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Construction Sales Platform</h1>
        </header>
        <main className="app-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading product catalog...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Construction Sales Platform</h1>
        </header>
        <main className="app-main">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Error</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Project List View
  if (currentView === 'projectList') {
    return <ProjectList onLoadProject={handleLoadProject} onNewProject={handleNewProject} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Construction Sales Platform</h1>
            <p className="header-subtitle">
              Find the right products for your construction project
            </p>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToProjectList} className="btn-header">
              My Projects
            </button>
            <div className="header-stats">
              <span>{products.length} products available</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {processingRequest && (
          <div className="processing-overlay">
            <div className="processing-modal">
              <div className="spinner"></div>
              <p>Analyzing your project and finding matching products...</p>
            </div>
          </div>
        )}

        {currentView === 'form' && (
          <ProjectForm onSubmit={handleProjectSubmit} />
        )}

        {currentView === 'results' && projectAnalysis && (
          <ResultsDisplay
            analysis={projectAnalysis}
            onBack={handleBackToForm}
          />
        )}

        {currentView === 'dashboard' && projectAnalysis && (
          <ProjectDashboard
            analysis={projectAnalysis}
            currentProject={currentProject}
            onBack={handleBackToForm}
            onSave={handleSaveProject}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Construction Sales Platform - A foundation for business logic and product matching
        </p>
        <p className="footer-note">
          This platform uses {products.length} sample products. Extend with your own business rules.
        </p>
      </footer>
    </div>
  );
}

/**
 * App Wrapper with Auth Provider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
