import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Project List Component
 * Displays saved projects and allows loading/deleting
 */
const ProjectList = ({ onLoadProject, onNewProject }) => {
  const { currentUser, getUserProjects, deleteProject, logout } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const projects = getUserProjects();

  const handleDelete = (projectId) => {
    if (confirmDelete === projectId) {
      deleteProject(projectId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(projectId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <div className="user-info">
          <h1>My Projects</h1>
          <p className="user-welcome">Welcome, {currentUser?.username}!</p>
        </div>
        <div className="header-actions">
          <button onClick={onNewProject} className="btn-primary">
            + New Project
          </button>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="project-list-content">
        {projects.length === 0 ? (
          <div className="empty-projects">
            <div className="empty-icon">📋</div>
            <h2>No Projects Yet</h2>
            <p>Start by creating your first construction project</p>
            <button onClick={onNewProject} className="btn-primary btn-large">
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <span className="project-type-badge">
                    {project.specification.projectType}
                  </span>
                </div>

                <div className="project-card-body">
                  <div className="project-stat">
                    <span className="stat-label">Location:</span>
                    <span className="stat-value">{project.specification.location}</span>
                  </div>

                  <div className="project-stat">
                    <span className="stat-label">Products:</span>
                    <span className="stat-value">
                      {Object.keys(project.orderedProducts || {}).length}
                    </span>
                  </div>

                  <div className="project-stat">
                    <span className="stat-label">Budget:</span>
                    <span className="stat-value">
                      ${project.specification.maxBudget?.toLocaleString() || 'N/A'}
                    </span>
                  </div>

                  <div className="project-dates">
                    <div className="date-info">
                      <span className="date-label">Created:</span>
                      <span className="date-value">{formatDate(project.createdAt)}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Updated:</span>
                      <span className="date-value">{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="project-card-footer">
                  <button
                    onClick={() => onLoadProject(project)}
                    className="btn-card-primary"
                  >
                    Open Project
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className={`btn-card-danger ${confirmDelete === project.id ? 'confirm' : ''}`}
                  >
                    {confirmDelete === project.id ? 'Click again to confirm' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
