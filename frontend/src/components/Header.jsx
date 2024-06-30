import React, { useState, useEffect, useRef } from 'react'
import {Link} from 'react-router-dom'

const Header = ({currentPage}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="header">
      <h1>Hotel Booking</h1>
      {!['', 'login', 'register'].includes(currentPage) && (
        <div>
          <div className="menu-toggle" onClick={toggleMenu}>
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
          </div>
          <div className={`menu ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
            <ul>
              {currentPage.includes("home") ? (
                <li><a href={currentPage.replace('home','dashboard')}>Dashboard</a></li>
              ): currentPage.includes("dashboard") ? (
                <li><a href={currentPage.replace('dashboard','home')}>Home</a></li>
                ): null}
              <li onClick={()=>localStorage.removeItem('token')}><Link to='/login'>Logout</Link></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header