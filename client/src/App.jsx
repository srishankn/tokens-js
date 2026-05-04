import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import TodoList from './TodoList';
import { getAccessToken } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());

  return (
    <Router>
      <div className="app-wrapper">
        <h1>SecureVault</h1>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/profile" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/todos" 
            element={isAuthenticated ? <TodoList setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
