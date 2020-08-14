import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.scss';

export default function Navbar(props) {
  return (
    <nav className="navbar">
      <Link to="/dashboard">
        <i class="fas fa-book book-icon"></i>
        JewishBookCorner
      </Link>
    </nav>
  );
}
