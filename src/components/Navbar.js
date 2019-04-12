import React from 'react';
import {Link} from 'react-router-dom';
import './navbar.scss';

export default function Navbar(props){
  return(
    <nav className= 'navbar'>
      <Link to="/">JewishBookCorner<i className="fas fa-book-open"></i></Link>
    </nav>
  )
}