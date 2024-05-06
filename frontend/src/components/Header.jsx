import React, { useState } from 'react'

const Header = ({currentPage}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    console.log(isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    console.log(isMenuOpen);
  }
  return (
    <div className="header">
      <h1>Hotel Booking</h1>
      {currentPage !== "" && currentPage !== 'login' && currentPage !== 'register' && (
        <div>
          <div className="menu-toggle" onClick={toggleMenu}>
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
          </div>
          <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              {currentPage === "home" ? (
                //Get user id as well here
                <li><a href="/dashboard">Dashboard</a></li>
              ): (
                <li><a href="/home">Home</a></li>
              )}
              <li><a href="/logout">Logout</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header