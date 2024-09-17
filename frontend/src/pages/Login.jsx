import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const url = "http://localhost:5000";
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1];
  const [data, setData] = useState({
    email: "",
    password: ""
  })
  const [auth, setAuth] = useState(false);
  const [userId, setUserId] = useState("");
  const [path, setPath] = useState("");
  const changeHandler = e => {
    setData({...data,[e.target.name]:e.target.value});
  }
  const submitHandler = e => {
    e.preventDefault();
    axios.post('${url}/login', {
      email: data.email,
      password: data.password
    }).then(
      res => {
        console.log(res);
        localStorage.setItem('token',res.data.token);
        setAuth(true);
        setUserId(res.data.id);
        setPath(res.data.redirect);
      }
    ).catch(error=>{
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
  if(auth){
    return <Navigate to={`${path}/${userId}`} />
  }
  return (
    <div>
      <Header currentPage={currentPage} />
      <div className='main-container'>
        <form onSubmit={submitHandler} className='form' action='login-account.html' autoComplete='off'>
          <div className='form-group'><input type='email' placeholder='Email Address' name='email' onChange={changeHandler} /></div>
          <div className='form-group'><input type='password' placeholder='Password' name='password' onChange={changeHandler} /></div>
          <div className='form-group'><input className='btn btn-primary' type='submit' value='Login'/></div>
        </form>
        <br/>
        New user?
        <Link to='/register'><button className='btn btn-success'>Register</button></Link> &nbsp;
      </div>
      <Footer />
    </div>
  )
}

export default Login
