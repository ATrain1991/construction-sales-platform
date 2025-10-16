import React, { useState } from 'react';
import { PROJECT_TYPES, PRODUCT_CATEGORIES, US_STATES, CERTIFICATIONS } from '../types/index.js';

/**
 * Project Specification Form Component
 * Allows customers to define their project specifications
 */
const ProjectForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'Residential',
    location: 'CA',
    city: '',
    zipCode: '',
    maxBudget: '',
    projectStartDate: '',
    projectEndDate: '',
    requiredCategories: [],
    requireCertifications: false,
    requiredCertifications: [],
    ecoFriendlyPreference: false,
    sustainablePreference: false,
    installationCapability: 'Professional',
    notes: ''
  });

  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    targetDate: '',
    requiredCategories: [],
    critical: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      requiredCategories: prev.requiredCategories.includes(category)
        ? prev.requiredCategories.filter(c => c !== category)
        : [...prev.requiredCategories, category]
    }));
  };

  const handleCertificationToggle = (cert) => {
    setFormData(prev => ({
      ...prev,
      requiredCertifications: prev.requiredCertifications.includes(cert)
        ? prev.requiredCertifications.filter(c => c !== cert)
        : [...prev.requiredCertifications, cert]
    }));
  };

  const handleMilestoneChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMilestone(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMilestoneCategoryToggle = (category) => {
    setNewMilestone(prev => ({
      ...prev,
      requiredCategories: prev.requiredCategories.includes(category)
        ? prev.requiredCategories.filter(c => c !== category)
        : [...prev.requiredCategories, category]
    }));
  };

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.targetDate) {
      setMilestones(prev => [...prev, {
        ...newMilestone,
        id: `milestone-${Date.now()}`
      }]);
      setNewMilestone({
        name: '',
        targetDate: '',
        requiredCategories: [],
        critical: false
      });
    }
  };

  const removeMilestone = (id) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert string dates to Date objects
    const specification = {
      ...formData,
      maxBudget: parseFloat(formData.maxBudget) || 0,
      projectStartDate: new Date(formData.projectStartDate),
      projectEndDate: new Date(formData.projectEndDate),
      milestones: milestones.map(m => ({
        ...m,
        targetDate: new Date(m.targetDate)
      }))
    };

    onSubmit(specification);
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <h2>Define Your Project</h2>

      {/* Basic Information */}
      <section className="form-section">
        <h3>Basic Information</h3>

        <div className="form-group">
          <label htmlFor="projectName">Project Name *</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            required
            placeholder="e.g., New Office Building"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectType">Project Type *</label>
          <select
            id="projectType"
            name="projectType"
            value={formData.projectType}
            onChange={handleInputChange}
            required
          >
            {PROJECT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">State *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              placeholder="City name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code *</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              pattern="[0-9]{5}"
              placeholder="12345"
            />
          </div>
        </div>
      </section>

      {/* Budget and Timeline */}
      <section className="form-section">
        <h3>Budget and Timeline</h3>

        <div className="form-group">
          <label htmlFor="maxBudget">Maximum Budget ($) *</label>
          <input
            type="number"
            id="maxBudget"
            name="maxBudget"
            value={formData.maxBudget}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            placeholder="50000.00"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="projectStartDate">Project Start Date *</label>
            <input
              type="date"
              id="projectStartDate"
              name="projectStartDate"
              value={formData.projectStartDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectEndDate">Project End Date *</label>
            <input
              type="date"
              id="projectEndDate"
              name="projectEndDate"
              value={formData.projectEndDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="form-section">
        <h3>Project Milestones (Optional)</h3>
        <p className="section-description">
          Define key milestones with specific deadlines to help match products to your timeline
        </p>

        <div className="milestones-list">
          {milestones.map(milestone => (
            <div key={milestone.id} className="milestone-item">
              <div className="milestone-header">
                <strong>{milestone.name}</strong>
                {milestone.critical && <span className="badge critical">Critical</span>}
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
              <div className="milestone-details">
                <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                {milestone.requiredCategories.length > 0 && (
                  <span>Categories: {milestone.requiredCategories.join(', ')}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="milestone-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="milestoneName">Milestone Name</label>
              <input
                type="text"
                id="milestoneName"
                name="name"
                value={newMilestone.name}
                onChange={handleMilestoneChange}
                placeholder="e.g., Foundation Complete"
              />
            </div>

            <div className="form-group">
              <label htmlFor="milestoneDate">Target Date</label>
              <input
                type="date"
                id="milestoneDate"
                name="targetDate"
                value={newMilestone.targetDate}
                onChange={handleMilestoneChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="critical"
                checked={newMilestone.critical}
                onChange={handleMilestoneChange}
              />
              Critical path milestone
            </label>
          </div>

          <button type="button" onClick={addMilestone} className="btn-secondary">
            Add Milestone
          </button>
        </div>
      </section>

      {/* Product Categories */}
      <section className="form-section">
        <h3>Required Product Categories</h3>
        <p className="section-description">
          Select the categories of products you need for this project
        </p>

        <div className="checkbox-grid">
          {PRODUCT_CATEGORIES.map(category => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requiredCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="form-section">
        <h3>Certifications</h3>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="requireCertifications"
              checked={formData.requireCertifications}
              onChange={handleInputChange}
            />
            Require certified products
          </label>
        </div>

        {formData.requireCertifications && (
          <div className="checkbox-grid">
            {CERTIFICATIONS.map(cert => (
              <label key={cert} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.requiredCertifications.includes(cert)}
                  onChange={() => handleCertificationToggle(cert)}
                />
                {cert}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="form-section">
        <h3>Preferences</h3>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="ecoFriendlyPreference"
              checked={formData.ecoFriendlyPreference}
              onChange={handleInputChange}
            />
            Prefer eco-friendly products
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="sustainablePreference"
              checked={formData.sustainablePreference}
              onChange={handleInputChange}
            />
            Prefer sustainable sources
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="installationCapability">Installation Capability</label>
          <select
            id="installationCapability"
            name="installationCapability"
            value={formData.installationCapability}
            onChange={handleInputChange}
          >
            <option value="DIY">DIY Installation</option>
            <option value="Professional">Professional Installation</option>
          </select>
        </div>
      </section>

      {/* Additional Notes */}
      <section className="form-section">
        <h3>Additional Notes</h3>

        <div className="form-group">
          <label htmlFor="notes">Special Requirements or Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
            placeholder="Any special requirements, constraints, or additional information..."
          />
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Find Matching Products
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
