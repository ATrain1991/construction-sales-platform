import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Authentication Context
 * Manages user authentication and project storage
 */
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Get all users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  // Register a new user
  const register = (username, password, email) => {
    const users = getUsers();

    // Check if username already exists
    if (users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      projects: []
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login after registration
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  };

  // Login a user
  const login = (username, password) => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Save a project
  const saveProject = (projectData) => {
    if (!currentUser) {
      throw new Error('Must be logged in to save projects');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const project = {
      id: projectData.id || Date.now().toString(),
      name: projectData.name,
      specification: projectData.specification,
      orderedProducts: projectData.orderedProducts,
      customCategories: projectData.customCategories || [],
      createdAt: projectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if updating existing project
    const projectIndex = users[userIndex].projects.findIndex(p => p.id === project.id);

    if (projectIndex !== -1) {
      // Update existing project
      users[userIndex].projects[projectIndex] = project;
    } else {
      // Add new project
      users[userIndex].projects.push(project);
    }

    saveUsers(users);

    // Update current user
    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    return project;
  };

  // Delete a project
  const deleteProject = (projectId) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete projects');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].projects = users[userIndex].projects.filter(p => p.id !== projectId);
    saveUsers(users);

    // Update current user
    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // Get user's projects
  const getUserProjects = () => {
    if (!currentUser) {
      return [];
    }
    return currentUser.projects || [];
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    saveProject,
    deleteProject,
    getUserProjects
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
