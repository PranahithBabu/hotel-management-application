import React, {useState, useEffect} from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const CDashboard = () => {
  const location = useLocation();
  // const currentPage = location.pathname.split('/')[2];
  const currentURL = location.pathname;
  console.log(currentURL);
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
      <Header currentPage={currentURL} />
      <div>
        CDashboard
      </div>
      <Footer />
    </div>
  )
}

export default CDashboard
