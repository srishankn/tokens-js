import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, logout } from './api';

const Profile = ({ setIsAuthenticated }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const profileData = await fetchProfile();
      setData(profileData);
    } catch (err) {
      if (err.message === 'REFRESH_FAILED' || err.message.includes('No access token')) {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>
      
      <button className="btn-secondary" onClick={loadProfile} disabled={isLoading}>
        {isLoading && !data ? 'Loading...' : 'Refetch Data (Tests Auto-Refresh)'}
      </button>

      <button 
        style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a' }} 
        onClick={() => navigate('/todos')}
      >
        View My Tasks
      </button>
      
      {error && <div className="error-text" style={{ marginTop: '1rem' }}>{error}</div>}
      
      {data ? (
        <div className="profile-data">
          <p><strong>Message</strong> {data.message}</p>
          <p><strong>User ID</strong> {data.user_id.slice(-6)}</p>
          <p><strong>Email</strong> {data.email}</p>
        </div>
      ) : (
        !isLoading && <p style={{ color: 'var(--text-muted)' }}>No data available.</p>
      )}

      <button className="btn-danger" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
