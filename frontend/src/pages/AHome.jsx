import React, { useEffect, useState } from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const AHome = () => {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[2];
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get(`http://localhost:5000${currentURL}`,{
      headers: {
        'token': localStorage.getItem('token')
      }
    }).then(res => {setData(res.data); console.log(data)}
    ).catch(error=>{
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
  return (
    <div>
      <Header currentPage={currentPage} />
      <div>
        Ahome
      </div>
      <Footer />
    </div>
  )
}

export default AHome;
