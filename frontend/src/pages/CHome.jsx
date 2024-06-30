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

  useEffect(() => {
    axios.get(`http://localhost:5000${currentURL}`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      setData(res.data.rooms);
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

  const bookRoomBtn = async (roomId) => {
    const [startDate, endDate] = selectedDateRange;
    const room = data.find(room => room._id === roomId);
    const isRoomAvailable = room.unavailableDates.every(
      range =>
          !(
            !range.roomAvailabilty &&
            (new Date(startDate) <= new Date(range.end) && new Date(endDate) >= new Date(range.start))
          )
    );
    if(isRoomAvailable){
      try {
        const res = await axios.post(`http://localhost:5000${currentURL}`, {
          _id: roomId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        console.log("Response: ", res);      
      } catch (error) {
        if (error.response) {
          alert(error.response.data.message);
        } else if (error.request) {
          console.log(error.request);
        } else {
          alert('Error', error.message);
        }
        console.log(error.config);
      }
    }
    else {
      alert('The selected date range is not available for this room.');
    }
  }

  return (
    <div className='content-c-home'>
      <Header currentPage={currentURL} />
      <div className='main-chome-container'>
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
                <div className={`card ${newitem.roomMaintenance ? 'maintenance' : ''}`} style={{width: "100%", borderColor: newitem.roomMaintenance ? "grey": "green", borderWidth: "5px"}}>
                  <span className='card-head'>
                    <h5 class="card-header" style={{color: newitem.roomMaintenance ? "grey": "black"}}>{newitem.roomNumber}</h5> &nbsp;
                    {newitem.roomMaintenance && <div className="maintenance-message">Room is under maintenance</div>}
                  </span>
                  <div class="card-body">
                    <ul class="list-group">
                      <li class="list-group-item">Room Type: {newitem.roomType}</li>
                      <li class="list-group-item">Room Price: ${newitem.roomPrice}</li>
                    </ul> <br/>
                    <button className="btn btn-primary" onClick={()=>bookRoomBtn(newitem._id)} disabled={newitem.roomMaintenance}>Book Room</button> &nbsp;
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
