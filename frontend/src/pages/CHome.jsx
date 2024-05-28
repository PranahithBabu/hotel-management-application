import React, { useState, useEffect } from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';

const CHome = () => {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1];
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([new Date(), new Date()]);
  // const [userId, setUserId] = useState(''); // You might want to get this from your authentication context or similar

  useEffect(() => {
    axios.get(`http://localhost:5000${currentURL}`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      // console.log("Response: ",res.data.rooms);/
      // setData(res.data.rooms.roomAvailability ? res.data.rooms : null); 
      setData(res.data.rooms);
      // console.log(data)
    }
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
  })

  if(!localStorage.getItem('token')) {
    alert('Login to get into the aplication.')
    return <Navigate to='/login' />
  }

  const handleDateChange = (range) => {
    setSelectedDateRange(range);
  };

  const bookRoomBtn = (roomId) => {
    const [startDate, endDate] = selectedDateRange;
    console.log(roomId);
    axios.post(`http://localhost:5000${currentURL}`, {
      _id:roomId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      console.log("Response: ",res);
      setData(data.map(room => room._id === roomId ? { ...room, roomAvailability: false } : room));
    }
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
  }

  return (
    <div>
      <Header currentPage={currentURL} />
      <div className='main-container'>
        <div className='calendar-container'>
          <h2>Book a Room</h2>
          <Calendar
            selectRange={true}
            onChange={handleDateChange}
            value={selectedDateRange}
          />
        </div>
        <div className='cards-container'>
          <div className='row' style={{margin: '10px'}}>
            {data.map(newitem => 
              <div className='col-md-4' key={newitem._id}>
                <div class="card" style={{width: "100%", borderColor: newitem.roomAvailability ? "green": "grey", borderWidth: "5px"}}>
                  <h5 class="card-header" style={{color: newitem.roomAvailability ? "black": "grey"}}>{newitem.roomNumber}</h5>
                  <div class="card-body">
                    <ul class="list-group">
                      <li class="list-group-item">Room Type: {newitem.roomType}</li>
                      <li class="list-group-item">Room Price: ${newitem.roomPrice}</li>
                    </ul> <br/>
                    <button className="btn btn-primary" onClick={()=>bookRoomBtn(newitem._id)} disabled={!newitem.roomAvailability}>Book Room</button> &nbsp;
                  </div>
                </div> <br/>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CHome
