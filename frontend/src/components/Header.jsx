import React, { useState } from 'react'

const Header = ({currentPage}) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    console.log(isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    console.log(isMenuOpen);
  }
  console.log("It is: ",currentPage.replace('home','dashboard'));
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
          <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              {currentPage.includes("home") ? (
                <li><a href={currentPage.replace('home','dashboard')}>Dashboard</a></li>
              ): currentPage.includes("dashboard") ? (
                <li><a href={currentPage.replace('dashboard','home')}>Home</a></li>
                ): null}
                {/* Have an onClick event to remove the token and 
                then navigate user to the login page */}
              <li><a href="/logout">Logout</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header