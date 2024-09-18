import React, {useState, useEffect} from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import moment from 'moment';

const ADashboard = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  // console.log("URL is: ", url);
  const location = useLocation();
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservation, setReservation] = useState({
    _id: '',
    roomNumber: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${url}${currentURL}`, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        setData(res.data.reservations);
        setRooms(res.data.rooms);
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
    };
    fetchData();
  }, [data]);

  if(!localStorage.getItem('token')) {
    alert('Login to get into the aplication.')
    return <Navigate to='/login' />
  }

  const createResBtn = () => {
    setReservation({
      _id: '',
      roomNumber: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalEdit(false);
    setIsModalOpen(false);
  }

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setReservation({
      ...reservation,
      [name]: value
    });
  };
  
  const submitHandler = e => {
    e.preventDefault();
    if (reservation._id) {
      updateReservation(e);
    }
    else {
      axios.post(`${url}${currentURL}`, {
        roomNumber: reservation.roomNumber,
        startDate: reservation.startDate,
        endDate: reservation.endDate
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(res => {
        console.log("Response: ",res.data.newReservation);
        setReservation({
          roomNumber: '',
          startDate: '',
          endDate: ''
        });
        setData([...data, res.data.newReservation]);
        setIsModalOpen(false);
        setTimeout(() => {
          alert(res.data.message);
        }, 100);
      }).catch(error => {
        if (error.response) {
          alert(error.response.data.message);
        } else if (error.request) {
          console.log(error.request);
        } else {
          alert('Error', error.message);
        }
        console.log(error.config);
      });
    }
  };

  const editResBtn = (reservation) => {
    setReservation({
      ...reservation,
      startDate: moment.utc(reservation.startDate).format('YYYY-MM-DD'),
      endDate: moment.utc(reservation.endDate).format('YYYY-MM-DD')
    });
    setIsModalEdit(true);
    setIsModalOpen(true);
  }

  const updateReservation = (e) => {
    e.preventDefault();
    console.log("Selected: ",reservation.startDate);
    const updatedReservation = {
      ...reservation,
      startDate: moment.utc(reservation.startDate).toISOString(),
      endDate: moment.utc(reservation.endDate).toISOString()
    };
    axios.put(`${url}${currentURL}`, updatedReservation, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      console.log(res);
      setReservation({ _id: '', roomNumber: '', startDate: '', endDate: '', status: ''});
      setIsModalEdit(false);
      setIsModalOpen(false);
      setData(data.map(item => (item._id === reservation._id ? res.data.updatedReservation : item)))
      window.location.reload();
      setTimeout(() => {
        alert(res.data.message);
      }, 100);
    }).catch(error => {
      if (error.response) {
        alert(error.response.data.message);
      } else if (error.request) {
        console.log(error.request);
      } else {
        alert('Error', error.message);
      }
      console.log(error.config);
    });
  }

  const delResBtn = (_id) => {
    axios.delete(`${url}${currentURL}`, {data:{_id:_id},
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      console.log(res);
      setData(data.filter(item => item._id !== _id));
      setTimeout(() => {
        alert(res.data.message);
      }, 100);
    }).catch(error=>{
      if (error.response) {
        alert(error.response.data.message);
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
    return days * pricePerDay;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header currentPage={currentURL} />
      <div className='content'>
        <div className="reservations-container">
          <div className='heading'>
            <h2>Reservations</h2>
            <input type='button' className='btn btn-primary' value='Make a Reservation' onClick={createResBtn} />
          </div>
          {isModalOpen &&
            <div className="check" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                <span onClick={closeModal} style={{ float: 'right', cursor: 'pointer' }}>&times;</span> <br/>
                <form onSubmit={submitHandler} className='form-a-dashboard' autoComplete='off'>
                  <div className='form-group-a-dashboard'>
                    <label>Room Number</label>
                    <select name='roomNumber' value={reservation.roomNumber} onChange={changeHandler}>
                      <option value='' disabled>Select Room Number</option>
                      {rooms.map(room => (
                        <option key={room._id} value={room.roomNumber}>{room.roomNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div className='form-group-a-dashboard'>
                    <label>Start Date</label>
                    <input type='date' name='startDate' value={reservation.startDate} onChange={changeHandler} />
                  </div>
                  <div className='form-group-a-dashboard'>
                    <label>End Date</label>
                    <input type='date' name='endDate' value={reservation.endDate} onChange={changeHandler} />
                  </div>
                  {isModalEdit && 
                  <div className='form-group-a-dashboard'>
                    <label>Reservation Status</label>
                    <select name='status' value={reservation.status} onChange={changeHandler}>
                      <option value='' disabled>Select Status</option>
                      <option value='approved'>Approve</option>
                      <option value='pending'>Pending</option>
                      <option value='canceled'>Cancel</option>
                      <option value='rejected'>Reject</option>
                    </select>
                  </div> }
                  <div className='form-group-a-dashboard'>
                    <input type='submit' className='btn btn-primary' value={reservation._id ? 'Update Reservation' : 'Confirm Reservation'} />
                  </div>
                </form>
              </div>
            </div>
          }
          {data.length === 0 ? (
            <p className='no-reservations-message'><a style={{cursor:'pointer', color:'blue'}} onClick={createResBtn}>No Reservations Available. Book one now</a></p>
          ) : (
          <table className="reservations-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Price</th>
                <th>Booking Date (YYYY-MM-DD) </th>
                <th>Modify Reservation</th>
              </tr>
            </thead>
            <tbody>
              {data.map(reservation => {
                const days = calculateDays(reservation.startDate, reservation.endDate);
                const totalPrice = calculateTotalPrice(days, reservation.price);
                return (
                <tr key={reservation._id} className={`table-row ${reservation.status}`} title={reservation.status.toUpperCase()}>
                  <td>{reservation.userId}</td>
                  <td>{reservation.roomNumber}</td>
                  <td>{reservation.roomType}</td>
                  <td>${totalPrice}</td>
                  <td>
                    {formatDate(reservation.startDate)} to {formatDate(reservation.endDate)}
                  </td>
                  <td>
                    <button className='btn btn-danger' onClick={()=>delResBtn(reservation._id)}>Delete Reservation</button>
                    &nbsp;
                    <button className='btn btn-warning' onClick={()=>editResBtn(reservation)}>Update Reservation</button>
                  </td>
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

export default ADashboard
