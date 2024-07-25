import React, {useState, useEffect} from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const CDashboard = () => {
  const location = useLocation();
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  const [isModal, setIsModal] = useState(false);
  const [reservation, setReservation] = useState({
    _id: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    axios.get(`http://localhost:5000${currentURL}`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      setData(res.data.reservations);
    }).catch(error=>{
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

  const editResBtn = (reservation) => {
    console.log(reservation);
    // setReservation(reservation);
    setReservation({
      ...reservation,
      startDate: moment.utc(reservation.startDate).format('YYYY-MM-DD'),
      endDate: moment.utc(reservation.endDate).format('YYYY-MM-DD')
    });
    setIsModal(true);
  }

  const closeModal = () => {
    setIsModal(false);
  }

  const changeHandler = (e) => {
    const {name, value} = e.target;
    setReservation({
      ...reservation,
      [name]: value
    })
  }

  const submitHandler = e => {
    e.preventDefault();
    if(reservation._id) {
      updateReservation(e);
    }
  }

  const updateReservation = (e) => {
    e.preventDefault();
    const updatedReservation = {
      ...reservation,
      startDate: moment.utc(reservation.startDate).toISOString(),
      endDate: moment.utc(reservation.endDate).toISOString()
    };
    axios.put(`http://localhost:5000${currentURL}`, updatedReservation, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      setReservation({ _id: '', startDate: '', endDate: ''});
      setIsModal(false);
      setData(data.map(item => (item._id === reservation._id ? res.data.updatedReservation : item)));
      setTimeout(() => {
        alert(res.data.message);
      }, 100);
    }).catch(error => {
      if (error.response) {
        alert(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        alert('Error', error.message);
      }
      console.log(error.config);
    });
  }

  const delResBtn = (_id) => {
    axios.delete(`http://localhost:5000${currentURL}`, {data: {_id:_id},
    headers: {
      'Authorization': localStorage.getItem('token')
    }
    }).then(res => {
      console.log(res);
      setTimeout(() => {
        alert(res.data.message);
      }, 100);
    }).catch(error=>{
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
  
  const formatDate = (dateStr) => {
    return moment.utc(dateStr).format('YYYY-MM-DD');
  };

  const calculateDays = (startDate, endDate) => {
    const start = moment.utc(startDate);
    const end = moment.utc(endDate);
    if(start.isSame(end, 'day')) {
      return 1;
    }
    return end.diff(start, 'days');
  }

  const calculateTotalPrice = (days, pricePerDay) => {
    return (days) * pricePerDay;
  }

  return (
    <div>
      <Header currentPage={currentURL} />
      <div className='content'>
        <div className='reservations-container-cdashboard'>
          <h2>Reservations</h2>
          {isModal &&
            <div className="check" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                <span onClick={closeModal} style={{ float: 'right', cursor: 'pointer' }}>&times;</span> <br/>
                <form onSubmit={submitHandler} className='form-c-home' autoComplete='off'>
                  <div className='form-group-c-home'>
                    <label>Start Date</label>
                    <input type='date' name='startDate' value={reservation.startDate} onChange={changeHandler} />
                  </div>
                  <div className='form-group-c-home'>
                    <label>End Date</label>
                    <input type='date' name='endDate' value={reservation.endDate} onChange={changeHandler} />
                  </div>
                  <div className='form-group-c-home'>
                    <input type='submit' className='btn btn-primary' value={reservation._id && 'Update Reservation Request'} />
                  </div>
                </form>
              </div>
            </div>
          }
          {data.length === 0 ? (
            <p className='no-reservations-message'><a href={currentURL.replace('dashboard','home')}>No Reservations Available. Book one now</a></p>
          ) : (
          <table className='reservations-table'>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Price</th>
                <th>Booking Date (YYYY-MM-DD)</th>
                <th>Modify Reservation</th>
              </tr>
            </thead>
            <tbody>
              {data.map(reservation => {
                const days = calculateDays(reservation.startDate, reservation.endDate);
                const totalPrice = calculateTotalPrice(days, reservation.price);
                return (
                  <tr key={reservation._id} className={`table-row ${reservation.status.toLowerCase()}`} title={reservation.status.toUpperCase()}>
                    <td>{reservation.userId}</td>
                    <td>{reservation.roomNumber}</td>
                    <td>{reservation.roomType}</td>
                    <td>${totalPrice}</td>
                    <td>
                    {formatDate(reservation.startDate)} to {formatDate(reservation.endDate)}
                    </td>
                    {reservation.status==="approved" ? 
                    <td>
                      <b><i> BOOKING APPROVED! </i></b>
                    </td>
                    :
                    <td>
                      <button className='btn btn-danger' onClick={()=>delResBtn(reservation._id)}>Delete Reservation</button>
                      &nbsp;
                      <button className='btn btn-warning' onClick={()=>editResBtn(reservation)}>Modify Reservation</button> 
                    </td> }
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}</div>
      </div>
      <Footer />
    </div>
  )
}

export default CDashboard
