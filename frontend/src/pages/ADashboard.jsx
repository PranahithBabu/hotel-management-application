import React, {useState, useEffect} from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

const ADashboard = () => {
  const location = useLocation();
  // const currentPage = location.pathname.split('/')[2];
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
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateRes, setUpdateRes] = useState({
    _id: '',
    roomNumber: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  // useEffect(() => {
  //   axios.get(`http://localhost:5000${currentURL}`,{
  //     headers: {
  //       'Authorization': localStorage.getItem('token')
  //     }
  //   }).then(res => {
  //     setData(res.data.reservations);
  //     setRooms(res.data.rooms);
  //   }
  //   ).catch(error=>{
  //     if (error.response) {
  //       alert(error.response.data);
  //     } else if (error.request) {
  //       console.log(error.request);
  //     } else {
  //       alert('Error', error.message);
  //     }
  //     console.log(error.config);
  //   })
  // },[])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000${currentURL}`, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        setData(res.data.reservations);
        setRooms(res.data.rooms);
      } catch (error) {
        if (error.response) {
          alert(error.response.data);
        } else if (error.request) {
          console.log(error.request);
        } else {
          alert('Error', error.message);
        }
        console.log(error.config);
      }
    };
    fetchData();
  }, [currentURL]);


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
    setIsModalOpen(false);
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
    console.log("UP");
    axios.post(`http://localhost:5000${currentURL}`, {
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
  };

  const editResBtn = (reservation) => {
    setIsUpdate(true);
    setIsModalOpen(true);
    console.log("IS: ",reservation);
    setUpdateRes(reservation);
    setReservation(reservation);
    // setUpdateRes({
    //   _id: reservation._id
    // });
    console.log("It is: ",updateRes)
  }

  const updateReservation = (e) => {
    e.preventDefault();
    // console.log("Update func: ",updateRes);
    axios.put(`http://localhost:5000${currentURL}`, reservation, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      console.log(res);
      setReservation({ _id: '', roomNumber: '', startDate: '', endDate: '', status: ''});
      setData(data.map(item => (item._id === reservation._id ? res.data.updatedReservation : item)))
      setIsModalOpen(false);
      window.location.reload();

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
        {console.log("isModalOpen:", isModalOpen)}
        <div className="reservations-container">
          <div className='heading'>
            <h2>Reservations</h2>
            <input type='button' className='btn btn-primary' value='Make a Reservation' onClick={createResBtn} />
          </div>
          {isModalOpen && 
            // <div className="modal">
            //   <div className="modal-content">
            //     <span className="close" onClick={closeModal}>&times;</span>
            <div className="check" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                <span onClick={closeModal} style={{ float: 'right', cursor: 'pointer' }}>&times;</span> <br/>
                <form onSubmit={isUpdate ? updateReservation : submitHandler} className='form-a-dashboard' autoComplete='off'>
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
                  {isUpdate ? 
                    <div className='form-group-a-dashboard'>
                      <input type='submit' className='btn btn-primary' value='Edit Reservation' />
                    </div>  
                    :
                    <div className='form-group-a-dashboard'>
                      <input type='submit' className='btn btn-primary' value='Confirm Reservation' />
                    </div>
                  }
                </form>
              </div>
            </div>
          }
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
                    <button className='btn btn-warning' onClick={()=>editResBtn(reservation)}>Update Reservation</button>
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
