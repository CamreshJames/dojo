import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import './NotFound.css';

function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const isAuthenticated = !!localStorage.getItem('currentUser');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: isAuthenticated ? '/dashboard' : '/login', search: { q: searchQuery } });
    }
  };

  const handleBack = () => {
    navigate({ to: isAuthenticated ? '/dashboard' : '/login' });
  };

  return (
    <div className="notfound-container">
      <div className="space-bg">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      <div className="notfound-content">
        <div className="astronaut">
          <div className="head">
            <div className="helmet"></div>
            <div className="face">
              <div className="eyes"></div>
              <div className="mouth"></div>
            </div>
          </div>
          <div className="body">
            <div className="suit"></div>
            <div className="arms">
              <div className="arm left"></div>
              <div className="arm right"></div>
            </div>
            <div className="legs">
              <div className="leg left"></div>
              <div className="leg right"></div>
            </div>
          </div>
          <div className="float-animation"></div>
        </div>

        <h1 className="error-title">404 - Lost in Orbit!</h1>
        <p className="error-subtitle">
          Whoops! The page you're looking for has floated away into deep space.
          Let's get you back on track.
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a ticket or page..."
            className="search-input"
          />
          <button type="submit" className="search-btn">Launch Search</button>
        </form>

        <button onClick={handleBack} className="back-btn">
          <span className="btn-icon">🚀</span>
          Beam Me to {isAuthenticated ? 'Dashboard' : 'Login'}
        </button>

        <div className="fun-links">
          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="fun-link">
            Home Base
          </Link>
          <Link to="/tickets" className="fun-link">
            Ticket Galaxy
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;