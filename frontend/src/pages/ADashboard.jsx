import React, {useState, useEffect} from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

const ADashboard = () => {
  const location = useLocation();
  // const currentPage = location.pathname.split('/')[2];
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get(`http://localhost:5000${currentURL}`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      setData(res.data.reservations);
      // console.log(res)
    }
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

  if(!localStorage.getItem('token')) {
    alert('Login to get into the aplication.')
    return <Navigate to='/login' />
  }

  const delResBtn = (_id) => {
    axios.delete(`http://localhost:5000${currentURL}`, {data:{_id:_id},
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => console.log(res)
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
  }

  return (
    <div>
      <Header currentPage={currentURL} />
      <div>

        {/* Button to "Make A Reservation", and then it should 
        pop up or enable a form to fill the details and 
        "Confirm Reservation" */}

        <div className="reservations-container">
          <h2>Reservations</h2>
          <table className="reservations-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Price</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Modify Reservation</th>
              </tr>
            </thead>
            <tbody>
              {data.map(reservation => (
                <tr key={reservation._id}>
                  <td>{reservation.userId}</td>
                  <td>{reservation.roomNumber}</td>
                  <td>{reservation.roomType}</td>
                  <td>${reservation.price}</td>
                  <td>{new Date(reservation.startDate).toLocaleDateString()} 
                  - {new Date(reservation.endDate).toLocaleDateString()}</td>
                  <td>{reservation.status}</td>
                  <td>
                    <button className='btn btn-danger' onClick={()=>delResBtn(reservation._id)}>Cancel Reservation</button>
                    &nbsp;
                    {/* PUT route should be done */}
                    <button className='btn btn-warning' onClick={()=>editResBtn(reservation._id)}>Update Reservation</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default ADashboard
