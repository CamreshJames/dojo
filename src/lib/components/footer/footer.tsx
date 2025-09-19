import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <p className="footer-text">
        &copy; {new Date().getFullYear()} Tech Dojo. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;