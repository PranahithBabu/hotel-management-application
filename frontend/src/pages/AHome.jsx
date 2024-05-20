import React, { useEffect, useState } from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

const AHome = () => {
  const location = useLocation();
  // const currentPage = location.pathname.split('/')[2];
  const currentURL = location.pathname;
  console.log(currentURL);
  const [data, setData] = useState([]);
  const [item, setItem] = useState({
    roomNumber: '',
    roomType: '',
    roomPrice: '',
    roomAvailability: ''
  })
  const [search, setSearch] = useState("")
  const [filteredData, setFilteredData] = useState([]);
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

  if(!localStorage.getItem('token')) {
    alert('Login to get into the aplication.')
    return <Navigate to='/login' />
  }
  useEffect(() => {
    const filtered = data.filter((x) => x.itemname && x.itemname.toLowerCase().includes(search.toLowerCase()));
    setFilteredData(filtered)
  },[search,data])

  const changeHandler = e => {
    setItem({...item, [e.target.name]:e.target.value})
  }

  const submitHandler = e => {
    e.preventDefault();
    console.log(item);
    axios.post(`http://localhost:5000${currentURL}`, item, {
      headers: {
        'token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    }).then(
      res => {
        setData([...data, res]);
        setItem({roomNumber: '', roomType:'', roomPrice: '', roomAvailability: ''});
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

  return (
    <div>
      <Header currentPage={currentURL} />
      <div>
      <section>
      <div className='container'>
        <div className='fixed-element'>
          <div>
            <form onSubmit={submitHandler} className='form' action='items.html' autoComplete='off'>
              <div className='form-group'><input type='text' placeholder='Room Number' value={item.roomNumber} name='roomnumber' onChange={changeHandler} /></div>
              <div className='form-group'><input type='text' placeholder='Room Type' name='roomtype' value={item.roomType} onChange={changeHandler} /></div>
              <div className='form-group'><input type='text' placeholder='Room Price' name='roomprice' value={item.roomPrice} onChange={changeHandler} /></div>
              <div className='form-group'><input type='text' placeholder='Room Availability' name='roomavailability' value={item.roomAvailability} onChange={changeHandler} /></div>
              <div className='form-group'><input className='btn btn-info' type='submit' value='Add Room' /></div>
            </form>
          </div>
            <div className='row'>
              {filteredData.map(newitem => 
                <div className='col-md-4' key={newitem._id}>
                  <div class="card" style={{width: "100%"}}>
                    <h5 class="card-header">{newitem.roomNumber}</h5>
                    <div class="card-body">
                      <ul class="list-group">
                        <li class="list-group-item">Room Type: {newitem.roomType}</li>
                        <li class="list-group-item">Room Price: ${newitem.roomPrice}</li>
                        <li class="list-group-item">Room Availability: {newitem.roomAvailability}</li>
                      </ul> <br/>
                      {/* <button className="btn btn-danger" onClick={()=>deleteItemBtn(newitem._id)}>Delete</button> &nbsp; */}
                      {/* <button className='btn btn-success' onClick={()=>checkinBtn(newitem._id, newitem.calorie, newitem.protein)}>Check In</button> */}
                    </div>
                  </div> <br/>
                </div>
              )}
            </div>
        </div>
      </div>
      </section>
      </div>
      <Footer />
    </div>
  )
}

export default AHome;
