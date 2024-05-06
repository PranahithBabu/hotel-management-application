import React from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';

const CHome = () => {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1];
  return (
    <div>
      <Header currentPage={currentPage} />
      <div>
        Chome
      </div>
      <Footer />
    </div>
  )
}

export default CHome
