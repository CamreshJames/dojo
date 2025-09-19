// lib/components/Header/Header.tsx
import React from 'react';
import { useAuth } from '@lib/contexts/AuthContext';
import { Link, useNavigate } from '@tanstack/react-router';
import dojoLogo from "@src/assets/dojo.png";
import { SearchIcon, HeadphonesIcon } from '@lib/utils/icons';
import './header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login', replace: true });
  };

  if (!user) return null;

  return (
    <header className="header-container">
      <div className="header-left">
        <Link to="/dashboard" className="header-logo-link">
          <img src={dojoLogo} alt="Dojo Tech Training" className="header-logo" />
          <span className="header-title">Tech Dojo</span>
        </Link>
      </div>
      <div className="header-center">
        <div className="header-search">
          <SearchIcon className='svg' fill='orange'/>
          <input
            type="text"
            placeholder="Search dojo..."
            className="header-search-input"
            aria-label="Search"
          />
        </div>
      </div>
      <div className="header-right">
        <button className="header-notification" aria-label="Notifications">
          <HeadphonesIcon className='svg'/>
          <span className="header-notification-badge">0</span>
        </button>
        <div className="header-user">
          <span className="header-user-name">{user.username}</span>
          <button onClick={handleLogout} className="header-logout" aria-label="Logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;