import React, { useState } from 'react';

/**
 * Project Dashboard Component
 * Displays project overview with circular progress charts for product categories
 * Allows adding products and managing order quantities
 */
const ProjectDashboard = ({ analysis, currentProject, onBack, onSave }) => {
  // State for managing ordered products
  const [orderedProducts, setOrderedProducts] = useState(currentProject?.orderedProducts || {});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCategories, setCustomCategories] = useState(currentProject?.customCategories || []);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  if (!analysis || !analysis.recommendedProducts) {
    return (
      <div className="dashboard-empty">
        <p>No project data available</p>
        <button onClick={onBack} className="btn-secondary">
          Back to Form
        </button>
      </div>
    );
  }

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats = {};

    // Group products by category from analysis
    analysis.recommendedProducts.forEach(match => {
      const category = match.product.category;
      if (!stats[category]) {
        stats[category] = {
          category,
          totalNeeded: 0,
          totalOrdered: 0,
          products: [],
          isCustom: false
        };
      }
      stats[category].products.push(match);
    });

    // Add custom categories
    customCategories.forEach(category => {
      if (!stats[category]) {
        stats[category] = {
          category,
          totalNeeded: 0,
          totalOrdered: 0,
          products: [],
          isCustom: true
        };
      }
    });

    // Calculate totals based on ordered products
    Object.keys(orderedProducts).forEach(productId => {
      const product = analysis.recommendedProducts.find(
        m => m.product.productId === productId
      );
      if (product) {
        const category = product.product.category;
        if (stats[category]) {
          stats[category].totalNeeded += orderedProducts[productId].quantityNeeded || 0;
          stats[category].totalOrdered += orderedProducts[productId].quantityOrdered || 0;
        }
      }
    });

    return Object.values(stats);
  };

  // Add product to order
  const handleAddProduct = (productId, quantityNeeded = 0) => {
    setOrderedProducts(prev => ({
      ...prev,
      [productId]: {
        quantityNeeded,
        quantityOrdered: 0
      }
    }));
  };

  // Update product quantity
  const handleUpdateQuantity = (productId, field, value) => {
    setOrderedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  // Remove product from order
  const handleRemoveProduct = (productId) => {
    setOrderedProducts(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Handle chart click to open category modal
  const handleChartClick = (category) => {
    setSelectedCategory(category);
  };

  // Add new custom category
  const handleAddCategory = (categoryName) => {
    if (categoryName && !customCategories.includes(categoryName)) {
      setCustomCategories(prev => [...prev, categoryName]);
    }
  };

  // Get products for a specific category
  const getProductsForCategory = (category) => {
    if (!category) return [];
    return analysis.recommendedProducts.filter(
      match => match.product.category === category
    );
  };

  // Get ordered products for a specific category
  const getOrderedProductsForCategory = (category) => {
    return Object.keys(orderedProducts)
      .map(productId => {
        const match = analysis.recommendedProducts.find(
          m => m.product.productId === productId
        );
        if (match && match.product.category === category) {
          return {
            ...match,
            ...orderedProducts[productId]
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Handle save project
  const handleSaveProject = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      await onSave(orderedProducts, customCategories);
      setSaveMessage('Project saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to save project');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Category color palette
  const getCategoryColor = (category, index) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
      '#14b8a6', // teal
      '#a855f7', // violet
    ];
    return colors[index % colors.length];
  };

  const categoryStats = getCategoryStats();
  const orderedProductsList = Object.keys(orderedProducts).map(productId => {
    const match = analysis.recommendedProducts.find(
      m => m.product.productId === productId
    );
    return {
      ...match,
      ...orderedProducts[productId]
    };
  });

  // Calculate overall progress and budget usage by category
  const totalNeeded = orderedProductsList.reduce((sum, p) => sum + (p.quantityNeeded || 0), 0);
  const totalOrdered = orderedProductsList.reduce((sum, p) => sum + (p.quantityOrdered || 0), 0);
  const overallProgress = totalNeeded > 0 ? (totalOrdered / totalNeeded) * 100 : 0;

  // Calculate cost by category
  const totalCost = orderedProductsList.reduce(
    (sum, item) => sum + (item.product.price * (item.quantityOrdered || 0)),
    0
  );

  const categoryBudgetData = categoryStats.map((stat, index) => {
    const categoryProducts = orderedProductsList.filter(
      item => item.product.category === stat.category
    );
    const categoryCost = categoryProducts.reduce(
      (sum, item) => sum + (item.product.price * (item.quantityOrdered || 0)),
      0
    );
    return {
      category: stat.category,
      cost: categoryCost,
      color: getCategoryColor(stat.category, index),
      totalNeeded: stat.totalNeeded,
      totalOrdered: stat.totalOrdered
    };
  }).filter(data => data.cost > 0 || data.totalOrdered > 0);

  const maxBudget = analysis.specification.maxBudget || totalCost;

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>{analysis.specification.projectName}</h1>
          <p className="project-type">{analysis.specification.projectType}</p>
          {currentProject && (
            <span className="project-saved-badge">Saved Project</span>
          )}
        </div>
        <div className="dashboard-actions">
          {saveMessage && (
            <span className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSaveProject}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (currentProject ? 'Save Changes' : 'Save Project')}
          </button>
          <button onClick={onBack} className="btn-secondary">
            New Project
          </button>
        </div>
      </header>

      {/* Overall Progress Section */}
      <section className="dashboard-overview">
        <div className="overview-stats-grid">
          {/* Multi-colored Progress Chart */}
          <div className="overview-chart-card">
            <h3>Total Progress</h3>
            <MultiSegmentChart
              segments={categoryBudgetData.map(data => ({
                label: data.category,
                value: data.totalOrdered,
                total: totalOrdered,
                color: data.color
              }))}
              totalValue={totalOrdered}
              maxValue={totalNeeded}
              label="Ordered"
              unit="items"
            />
          </div>

          {/* Multi-colored Budget Chart */}
          <div className="overview-chart-card">
            <h3>Budget Usage</h3>
            <MultiSegmentChart
              segments={categoryBudgetData.map(data => ({
                label: data.category,
                value: data.cost,
                total: totalCost,
                color: data.color
              }))}
              totalValue={totalCost}
              maxValue={maxBudget}
              label="Spent"
              unit="$"
              isCurrency
            />
          </div>

          {/* Summary Stats */}
          <div className="overview-summary-card">
            <h3>Project Summary</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="summary-label">Total Products</span>
                <span className="summary-value">{orderedProductsList.length}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Categories</span>
                <span className="summary-value">{categoryStats.length}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Items Ordered</span>
                <span className="summary-value">{totalOrdered} / {totalNeeded}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Budget</span>
                <span className="summary-value">
                  ${totalCost.toLocaleString()} / ${maxBudget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Progress Charts */}
      <section className="category-charts">
        <div className="section-header">
          <h2>Product Categories</h2>
          <button
            className="btn-primary"
            onClick={() => setSelectedCategory('__new__')}
          >
            + Add Category
          </button>
        </div>
        <div className="charts-grid">
          {categoryStats.map((stat, index) => (
            <CategoryChart
              key={stat.category}
              category={stat.category}
              totalNeeded={stat.totalNeeded}
              totalOrdered={stat.totalOrdered}
              color={getCategoryColor(stat.category, index)}
              onClick={() => handleChartClick(stat.category)}
            />
          ))}
        </div>
      </section>

      {/* Ordered Products Table */}
      <section className="ordered-products">
        <div className="section-header">
          <h2>Ordered Products</h2>
        </div>

        {orderedProductsList.length === 0 ? (
          <div className="empty-state">
            <p>No products added yet. Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price/Unit</th>
                  <th>Qty Needed</th>
                  <th>Qty Ordered</th>
                  <th>Progress</th>
                  <th>Total Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderedProductsList.map(item => {
                  const progress = item.quantityNeeded > 0
                    ? (item.quantityOrdered / item.quantityNeeded) * 100
                    : 0;
                  const totalCost = item.product.price * (item.quantityOrdered || 0);

                  return (
                    <tr key={item.product.productId}>
                      <td>
                        <div className="product-name">
                          {item.product.productName}
                          <span className="manufacturer">{item.product.manufacturer}</span>
                        </div>
                      </td>
                      <td>{item.product.category}</td>
                      <td>${item.product.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.quantityNeeded || 0}
                          onChange={(e) => handleUpdateQuantity(
                            item.product.productId,
                            'quantityNeeded',
                            e.target.value
                          )}
                          className="qty-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={item.quantityNeeded || 0}
                          value={item.quantityOrdered || 0}
                          onChange={(e) => handleUpdateQuantity(
                            item.product.productId,
                            'quantityOrdered',
                            e.target.value
                          )}
                          className="qty-input"
                        />
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="progress-text">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="cost-cell">${totalCost.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveProduct(item.product.productId)}
                          title="Remove product"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" className="text-right"><strong>Total Cost:</strong></td>
                  <td className="cost-cell">
                    <strong>
                      ${orderedProductsList.reduce(
                        (sum, item) => sum + (item.product.price * (item.quantityOrdered || 0)),
                        0
                      ).toFixed(2)}
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Category Modal */}
      {selectedCategory && selectedCategory !== '__new__' && (
        <CategoryModal
          category={selectedCategory}
          availableProducts={getProductsForCategory(selectedCategory)}
          orderedProducts={getOrderedProductsForCategory(selectedCategory)}
          onAddProduct={handleAddProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveProduct={handleRemoveProduct}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {/* Add New Category Modal */}
      {selectedCategory === '__new__' && (
        <AddCategoryModal
          existingCategories={categoryStats.map(s => s.category)}
          onAddCategory={(name) => {
            handleAddCategory(name);
            setSelectedCategory(name);
          }}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

/**
 * Multi-Segment Circular Chart Component
 * Shows a pie chart with different colored segments for each category
 */
const MultiSegmentChart = ({ segments, totalValue, maxValue, label, unit, isCurrency }) => {
  const radius = 70;
  const centerX = 90;
  const centerY = 90;
  const percentage = maxValue > 0 ? (totalValue / maxValue) * 100 : 0;

  // Calculate segments for the pie chart
  let currentAngle = -90; // Start from top
  const segmentPaths = segments.map(segment => {
    const segmentPercentage = totalValue > 0 ? (segment.value / totalValue) : 0;
    const segmentAngle = segmentPercentage * 360;

    const startAngle = currentAngle;
    const endAngle = currentAngle + segmentAngle;
    currentAngle = endAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = segmentAngle > 180 ? 1 : 0;

    return {
      ...segment,
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: segmentPercentage * 100
    };
  });

  const displayValue = isCurrency ? `$${totalValue.toLocaleString()}` : totalValue;
  const displayMax = isCurrency ? `$${maxValue.toLocaleString()}` : maxValue;

  return (
    <div className="multi-segment-chart">
      <div className="chart-svg-container">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="12"
          />

          {/* Segment paths */}
          {segmentPaths.map((seg, idx) => (
            <path
              key={idx}
              d={seg.path}
              fill={seg.color}
              opacity="0.9"
            />
          ))}

          {/* Inner white circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - 12}
            fill="white"
          />

          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#333"
          >
            {percentage.toFixed(0)}%
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#666"
          >
            {displayValue}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {segments.map((seg, idx) => (
          <div key={idx} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: seg.color }}
            />
            <span className="legend-label">{seg.label}</span>
            <span className="legend-value">
              {isCurrency ? `$${seg.value.toLocaleString()}` : seg.value}
            </span>
          </div>
        ))}
      </div>

      <div className="chart-footer">
        <span className="chart-footer-label">{label}:</span>
        <span className="chart-footer-value">{displayValue} / {displayMax}</span>
      </div>
    </div>
  );
};

/**
 * Circular Progress Chart Component
 */
const CategoryChart = ({ category, totalNeeded, totalOrdered, color, onClick }) => {
  const percentage = totalNeeded > 0 ? (totalOrdered / totalNeeded) * 100 : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="category-chart" onClick={onClick} role="button" tabIndex={0}>
      <div className="chart-circle">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="progress-circle"
          />
          {/* Center text */}
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            className="chart-percentage"
            fontSize="20"
            fontWeight="bold"
            fill="#333"
          >
            {percentage.toFixed(0)}%
          </text>
        </svg>
      </div>
      <div className="chart-info">
        <div className="category-color-indicator" style={{ backgroundColor: color }} />
        <h4 className="chart-category">{category}</h4>
        <p className="chart-details">
          {totalOrdered} / {totalNeeded} ordered
        </p>
      </div>
      <div className="chart-hint">Click to manage</div>
    </div>
  );
};

/**
 * Category Modal Component
 * Displays products for a specific category and allows management
 */
const CategoryModal = ({
  category,
  availableProducts,
  orderedProducts,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [showAvailable, setShowAvailable] = useState(false);

  // Filter available products not yet ordered
  const unorderedProducts = availableProducts.filter(
    match => !orderedProducts.find(p => p.product.productId === match.product.productId)
  );

  const filteredUnordered = searchTerm
    ? unorderedProducts.filter(m =>
        m.product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : unorderedProducts;

  const handleAdd = (productId) => {
    const quantity = quantities[productId] || 0;
    if (quantity > 0) {
      onAddProduct(productId, quantity);
      setQuantities(prev => ({ ...prev, [productId]: 0 }));
      setShowAvailable(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Ordered Products Section */}
          <div className="modal-section">
            <h3>Ordered Products ({orderedProducts.length})</h3>
            {orderedProducts.length === 0 ? (
              <div className="empty-state-small">
                <p>No products ordered in this category yet.</p>
              </div>
            ) : (
              <div className="modal-products-list">
                {orderedProducts.map(item => {
                  const progress = item.quantityNeeded > 0
                    ? (item.quantityOrdered / item.quantityNeeded) * 100
                    : 0;
                  const totalCost = item.product.price * (item.quantityOrdered || 0);

                  return (
                    <div key={item.product.productId} className="modal-product-card">
                      <div className="modal-product-header">
                        <div>
                          <h4>{item.product.productName}</h4>
                          <p className="modal-product-meta">
                            {item.product.manufacturer} • ${item.product.price.toFixed(2)}/{item.product.unit}
                          </p>
                        </div>
                        <button
                          className="btn-remove-small"
                          onClick={() => onRemoveProduct(item.product.productId)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="modal-product-quantities">
                        <div className="qty-group">
                          <label>Needed:</label>
                          <input
                            type="number"
                            min="0"
                            value={item.quantityNeeded || 0}
                            onChange={(e) => onUpdateQuantity(
                              item.product.productId,
                              'quantityNeeded',
                              e.target.value
                            )}
                            className="qty-input"
                          />
                        </div>
                        <div className="qty-group">
                          <label>Ordered:</label>
                          <input
                            type="number"
                            min="0"
                            max={item.quantityNeeded || 0}
                            value={item.quantityOrdered || 0}
                            onChange={(e) => onUpdateQuantity(
                              item.product.productId,
                              'quantityOrdered',
                              e.target.value
                            )}
                            className="qty-input"
                          />
                        </div>
                      </div>
                      <div className="modal-product-footer">
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="progress-text">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="product-cost">
                          Total: ${totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Products Section */}
          <div className="modal-section">
            <div className="section-header-small">
              <h3>Available Products ({unorderedProducts.length})</h3>
              <button
                className="btn-secondary-small"
                onClick={() => setShowAvailable(!showAvailable)}
              >
                {showAvailable ? 'Hide' : 'Show'}
              </button>
            </div>

            {showAvailable && (
              <>
                <input
                  type="text"
                  placeholder="Search available products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="modal-products-list">
                  {filteredUnordered.length === 0 ? (
                    <p className="no-products">No available products</p>
                  ) : (
                    filteredUnordered.map(match => (
                      <div key={match.product.productId} className="modal-product-card available">
                        <div className="modal-product-header">
                          <div>
                            <h4>{match.product.productName}</h4>
                            <p className="modal-product-meta">
                              {match.product.manufacturer} • ${match.product.price.toFixed(2)}/{match.product.unit}
                            </p>
                            <span className={`match-score-badge ${
                              match.matchScore >= 80 ? 'high' :
                              match.matchScore >= 60 ? 'medium' : 'low'
                            }`}>
                              Match: {match.matchScore}%
                            </span>
                          </div>
                        </div>
                        <div className="modal-product-actions">
                          <input
                            type="number"
                            min="0"
                            placeholder="Quantity needed"
                            value={quantities[match.product.productId] || ''}
                            onChange={(e) => setQuantities(prev => ({
                              ...prev,
                              [match.product.productId]: parseInt(e.target.value) || 0
                            }))}
                            className="qty-input"
                          />
                          <button
                            className="btn-primary-small"
                            onClick={() => handleAdd(match.product.productId)}
                            disabled={!quantities[match.product.productId] || quantities[match.product.productId] <= 0}
                          >
                            Add to Order
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Add Category Modal Component
 */
const AddCategoryModal = ({ existingCategories, onAddCategory, onClose }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    if (existingCategories.includes(trimmedName)) {
      setError('Category already exists');
      return;
    }

    onAddCategory(trimmedName);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Category</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="category-name">Category Name:</label>
            <input
              id="category-name"
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError('');
              }}
              className="form-input"
              placeholder="e.g., Electrical, Plumbing, HVAC"
              autoFocus
            />
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDashboard;
