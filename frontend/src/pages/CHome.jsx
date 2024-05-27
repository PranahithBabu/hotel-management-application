import React, { useState, useEffect } from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

const CHome = () => {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1];
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get(`http://localhost:5000${currentURL}`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {console.log("Response: ",res); setData(res.data); console.log(data)}
  ).catch(error => {
    if (error.response) {
      alert(error.response.data);
    } else if (error.request) {
      console.log(error.request);
    } else {
      alert('Error', error.message);
    }
    console.log(error.config);
  })
  },[data])

  if(!localStorage.getItem('token')) {
    alert('Login to get into the aplication.')
    return <Navigate to='/login' />
  }

  return (
    <div>
      <Header currentPage={currentURL} />
      <div>
        Chome
      </div>
      <Footer />
    </div>
  )
}

export default CHome
