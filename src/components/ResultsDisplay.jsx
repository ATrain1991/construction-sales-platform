import React, { useState } from 'react';

/**
 * Results Display Component
 * Shows matched products, project analysis, and timeline information
 */
const ResultsDisplay = ({ analysis, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (!analysis || !analysis.recommendedProducts) {
    return (
      <div className="results-empty">
        <p>No results to display</p>
        <button onClick={onBack} className="btn-secondary">
          Back to Form
        </button>
      </div>
    );
  }

  // Get unique categories from results
  const categories = ['all', ...new Set(
    analysis.recommendedProducts.map(m => m.product.category)
  )];

  // Filter products
  let displayProducts = analysis.recommendedProducts;
  if (selectedCategory !== 'all') {
    displayProducts = displayProducts.filter(
      m => m.product.category === selectedCategory
    );
  }

  // Sort products
  const sortProducts = (products) => {
    switch (sortBy) {
      case 'score':
        return [...products].sort((a, b) => b.matchScore - a.matchScore);
      case 'price-low':
        return [...products].sort((a, b) => a.product.price - b.product.price);
      case 'price-high':
        return [...products].sort((a, b) => b.product.price - a.product.price);
      case 'delivery':
        return [...products].sort((a, b) =>
          a.estimatedDelivery - b.estimatedDelivery
        );
      default:
        return products;
    }
  };

  displayProducts = sortProducts(displayProducts);

  return (
    <div className="results-container">
      {/* Project Summary */}
      <section className="project-summary">
        <div className="summary-header">
          <h2>{analysis.specification.projectName}</h2>
          <button onClick={onBack} className="btn-secondary">
            New Search
          </button>
        </div>

        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-label">Products Found</span>
            <span className="stat-value">{analysis.recommendedProducts.length}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Estimated Cost</span>
            <span className="stat-value">
              ${analysis.estimatedTotalCost.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Budget Status</span>
            <span className={`stat-value ${
              analysis.estimatedTotalCost <= analysis.specification.maxBudget
                ? 'status-good'
                : 'status-warning'
            }`}>
              {analysis.estimatedTotalCost <= analysis.specification.maxBudget
                ? 'Within Budget'
                : 'Over Budget'}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Timeline</span>
            <span className={`stat-value ${
              analysis.timelineAnalysis.feasible
                ? 'status-good'
                : 'status-warning'
            }`}>
              {analysis.timelineAnalysis.feasible ? 'Feasible' : 'At Risk'}
            </span>
          </div>
        </div>

        {/* Risks and Recommendations */}
        {(analysis.risks.length > 0 || analysis.recommendations.length > 0) && (
          <div className="alerts-section">
            {analysis.risks.length > 0 && (
              <div className="alert alert-warning">
                <h4>Risks Identified</h4>
                <ul>
                  {analysis.risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div className="alert alert-info">
                <h4>Recommendations</h4>
                <ul>
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Category Breakdown */}
        {Object.keys(analysis.categoryBreakdown).length > 0 && (
          <div className="category-breakdown">
            <h3>Category Breakdown</h3>
            <div className="breakdown-grid">
              {Object.entries(analysis.categoryBreakdown).map(([category, data]) => (
                <div key={category} className="breakdown-item">
                  <div className="breakdown-category">{category}</div>
                  <div className="breakdown-product">{data.product}</div>
                  <div className="breakdown-cost">
                    ${data.cost.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="breakdown-delivery">
                    Delivery: {new Date(data.deliveryDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Filters and Controls */}
      <section className="results-controls">
        <div className="control-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="delivery">Earliest Delivery</option>
          </select>
        </div>

        <div className="control-group">
          <label>View:</label>
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid/List */}
      <section className={`products-display ${viewMode}`}>
        <h3>Matching Products ({displayProducts.length})</h3>

        {displayProducts.length === 0 ? (
          <div className="no-products">
            <p>No products match the selected filters</p>
          </div>
        ) : (
          <div className={`products-${viewMode}`}>
            {displayProducts.map((match, idx) => (
              <ProductCard key={match.product.productId} match={match} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/**
 * Individual Product Card Component
 */
const ProductCard = ({ match, viewMode }) => {
  const [expanded, setExpanded] = useState(false);
  const { product } = match;

  return (
    <div className={`product-card ${viewMode}`}>
      <div className="product-header">
        <div className="product-title">
          <h4>{product.productName}</h4>
          <span className="product-category">{product.category}</span>
        </div>
        <div className="match-score">
          <span className="score-value">{match.matchScore}</span>
          <span className="score-label">Match Score</span>
        </div>
      </div>

      <div className="product-body">
        <div className="product-info">
          <div className="info-item">
            <span className="info-label">Manufacturer:</span>
            <span className="info-value">{product.manufacturer}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Price:</span>
            <span className="info-value price">
              ${product.price.toFixed(2)} / {product.unit}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Stock:</span>
            <span className={`info-value ${product.stockQty > 0 ? 'in-stock' : 'out-stock'}`}>
              {product.stockQty > 0 ? `${product.stockQty} available` : 'Out of stock'}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Lead Time:</span>
            <span className="info-value">{product.leadTimeDays} days</span>
          </div>

          <div className="info-item">
            <span className="info-label">Estimated Delivery:</span>
            <span className={`info-value ${match.meetsTimeline ? '' : 'warning'}`}>
              {match.estimatedDelivery.toLocaleDateString()}
              {!match.meetsTimeline && ' ⚠️'}
            </span>
          </div>
        </div>

        {/* Match Reasons */}
        {match.matchReasons.length > 0 && (
          <div className="match-reasons">
            <strong>Why this matches:</strong>
            <ul>
              {match.matchReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {match.warnings.length > 0 && (
          <div className="match-warnings">
            <strong>Warnings:</strong>
            <ul>
              {match.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Expandable Details */}
        <button
          className="btn-expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show More Details'}
        </button>

        {expanded && (
          <div className="product-details">
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Product ID:</span>
                <span className="detail-value">{product.productId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Warehouse:</span>
                <span className="detail-value">{product.warehouseLocation}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Shipping Days:</span>
                <span className="detail-value">{match.estimatedShippingDays} days</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Dimensions:</span>
                <span className="detail-value">{product.dimensions}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Weight:</span>
                <span className="detail-value">{product.weight} lbs</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Min Order:</span>
                <span className="detail-value">{product.minOrderQty} {product.unit}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Warranty:</span>
                <span className="detail-value">
                  {product.warrantyYears > 0 ? `${product.warrantyYears} years` : 'N/A'}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Installation:</span>
                <span className="detail-value">{product.installationDifficulty}</span>
              </div>

              {product.fireRating && (
                <div className="detail-item">
                  <span className="detail-label">Fire Rating:</span>
                  <span className="detail-value">{product.fireRating}</span>
                </div>
              )}

              <div className="detail-item">
                <span className="detail-label">Eco-Friendly:</span>
                <span className="detail-value">{product.ecoFriendly}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Recyclable:</span>
                <span className="detail-value">{product.recyclable}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Sustainable:</span>
                <span className="detail-value">{product.sustainableSource}</span>
              </div>
            </div>

            {product.certifications && (
              <div className="certifications">
                <strong>Certifications:</strong>
                <div className="cert-tags">
                  {product.certifications.split(';').filter(c => c.trim()).map((cert, idx) => (
                    <span key={idx} className="cert-tag">{cert.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <div className="product-description">
                <strong>Description:</strong>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
