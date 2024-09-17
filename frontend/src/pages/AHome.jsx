import React, { useEffect, useState } from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

const AHome = () => {
  const url = "http://localhost:5000";
  const location = useLocation();
  const currentURL = location.pathname;
  const [data, setData] = useState([]);
  const [room, setRoom] = useState({
    roomNumber: '',
    roomType: '',
    roomPrice: '',
    roomMaintenance: false
  })
  const [editRoom, setEditRoom] = useState({
    roomNumber: '',
    roomType: '',
    roomPrice: '',
    roomMaintenance: false
  })
  const [search, setSearch] = useState("")
  const [filteredData, setFilteredData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activateBtn, setActivateBtn] = useState(false);

  useEffect(() => {
    const { roomNumber, roomType, roomPrice } = room;
    setActivateBtn(roomNumber !== '' && roomType !== '' && roomPrice !== '');
  }, [room]);

  useEffect(() => {
    axios.get(`${url}${currentURL}`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      setData(res.data.rooms);
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
  }, [data])

  if(!localStorage.getItem('token')) {
    alert('Login to get into the aplication.')
    return <Navigate to='/login' />
  }

  const changeHandler = e => {
    const { name, value, type, checked } = e.target;
    setRoom(prevRoom => ({
      ...prevRoom,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const submitHandler = e => {
    e.preventDefault();
    if(isEdit) {
      axios.put(`${url}${currentURL}`, room, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(res => {
        setData(data.map(item => (item._id === editId ? res.data : item)));
        resetForm();
        setTimeout(() => {
          alert(res.data.message);
        }, 100);
      }).catch(error => {
        console.error(error);
        alert('Error updating room');
      });
    }
    else {
      axios.post(`${url}${currentURL}`, room, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(
        res => {
          setData([...data, res]);
          setRoom({roomNumber: '', roomType:'', roomPrice: '', roomMaintenance: false});
          setTimeout(() => {
            alert(res.data.message);
          }, 100);
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
    }
  }

  const editRoomBtn = (room) => {
    setRoom(room);
    setIsEdit(true);
    setEditId(room._id);
  }

  const resetForm = () => {
    setRoom({
      roomNumber: '',
      roomType: '',
      roomPrice: '',
      roomMaintenance: false
    });
    setIsEdit(false);
    setEditId(null);
  };

  const deleteRoomBtn = (_id) => {
    axios.delete(`${url}${currentURL}`,{data:{_id:_id},
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(res => {
      setTimeout(() => {
        alert(res.data.message);
      }, 100);
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
  }
  
  const cancelEditBtn = () => {
    setRoom({
      roomNumber: '',
      roomType: '',
      roomPrice: '',
      roomMaintenance: false
    });
    setIsEdit(false);
  }

  return (
    <div className='content-a-home'>
      <Header currentPage={currentURL} />
      <div className='main-ahome-container'>
        <div className='fixed-element'>
          <div>
            <form onSubmit={submitHandler} className='form-a-home' autoComplete='off'>
              <div className='form-group-a-home'>
                <input type='text' placeholder='Room Number' value={room.roomNumber} name='roomNumber' onChange={changeHandler} disabled={isEdit} />
              </div>
              <div className='form-group-a-home'>
                <select name='roomType' value={room.roomType} onChange={changeHandler}>
                  <option value='' disabled>Select Room Type</option>
                  <option value='Single'>Single</option>
                  <option value='Double'>Double</option>
                  <option value='Suite'>Suite</option>
                </select>
              </div>
              <div className='form-group-a-home'>
                <input type='text' placeholder='Room Price' name='roomPrice' value={room.roomPrice} onChange={changeHandler} />
              </div>
              <div className='form-group-a-home'>
                <label>
                  <input type='checkbox' name='roomMaintenance' checked={room.roomMaintenance} onChange={changeHandler} />
                  Room Maintenance
                </label>
              </div>
              <div className='form-group-a-home'>
                {isEdit?
                  <div className='btn'>
                    <input className='btn btn-danger' type='submit' value='Cancel Editing' onClick={()=>cancelEditBtn()} /> &nbsp;
                    <input className='btn btn-warning' type='submit' value='Edit Room' />
                  </div>
                  :
                  <input className='btn btn-primary' type='submit' value='Add Room' disabled = {!activateBtn} />
                }
              </div>
            </form>
            <br/>
          </div>
          <div className='cards-container-ahome'>
            <div className='row' style={{margin: '10px'}}>
              {data.map(newitem => 
                <div className='col-md-4' key={newitem._id}>
                  <div class="card" style={{width: "100%", borderColor: newitem.roomMaintenance ? "grey": "green", borderWidth: "5px"}}>
                    <h5 class="card-header" style={{color: newitem.roomMaintenance ? "grey": "black"}}>{newitem.roomNumber}</h5>
                    <div class="card-body">
                      <ul class="list-group">
                        <li class="list-group-item">Room Type: {newitem.roomType}</li>
                        <li class="list-group-item">Room Price: ${newitem.roomPrice}</li>
                      </ul> <br/>
                      <button className="btn btn-danger" onClick={()=>deleteRoomBtn(newitem._id)}>Delete Room</button> &nbsp;
                      <button className='btn btn-warning' onClick={()=>editRoomBtn(newitem)}>Edit Room</button>
                    </div>
                  </div> <br/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default AHome;
