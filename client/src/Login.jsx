import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from './api';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLoginMode) {
        await login(email, password);
        setIsAuthenticated(true);
        navigate('/profile');
      } else {
        await signup(email, password);
        setIsLoginMode(true);
        alert('Account created! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
      {error && <div className="error-text">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email Address" 
            required
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
        </button>
      </form>
      <p 
        onClick={() => setIsLoginMode(!isLoginMode)} 
        style={{ cursor: 'pointer', textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}
      >
        {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </p>
    </div>
  );
};

export default Login;
