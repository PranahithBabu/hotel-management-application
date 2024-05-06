import React, {useState, useEffect} from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Registration = () => {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1];
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: ""
  })
  const [auth, setAuth] = useState(false);
  const navigate = useNavigate();
  const changeHandler = e => {
    setData({...data,[e.target.name]:e.target.value})
  }
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(data);
    var check = false;
    if (data.secretKey !== "") {
        if (data.secretKey === "adminlogin") {
            console.log("Correct key");
            check = true;
        } else {
            const isConfirmed = window.confirm("It is an incorrect key. Do you wish to continue as customer?");
            if (isConfirmed) {
                check = true;
            } else {
                console.log("Registration canceled by user");
                // document.getElementById('secretkey').classList.add('invalid');
            }
        }
    }else{
      check = true;
    }
    if(check){
        try {
            await axios.post('http://localhost:5000/register', {
                name: data.name,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
                secretKey: data.secretKey
            }).then(
              res => {console.log(res); setAuth(true); navigate('/login', { state: { success: true } });}
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
          }catch {
            console.log(error);
          }
        }
      }
  if(auth) {
    return <Navigate to='/login' />
  }
  return (
    <div>
      <Header currentPage={currentPage} />
      <div>
        <form onSubmit={submitHandler} className='form' action='register-account.html' autoComplete='off'>
          <div className='form-group'><input type='text' placeholder='Username' name='name' onChange={changeHandler} /></div>
          <div className='form-group'><input type='email' placeholder='Email Address' name='email' onChange={changeHandler} /></div>
          <div className='form-group'><input type='password' placeholder='Password' name='password' onChange={changeHandler} /></div>
          <div className='form-group'><input type='password' placeholder='Confirm Password' name='confirmPassword' onChange={changeHandler} /></div>
          <div className='question-mark-container'>
            <input type="password" id="secretkey" name='secretKey' className="form-control" aria-describedby="passwordHelpBlock" 
            placeholder="Secret key" onChange={changeHandler}/>
            <span className='question-mark'>?</span>
            <div className='tooltip' role="tooltip">For Admin Login</div>
          </div>
          <div className='form-group'><input className='btn btn-primary' type='submit' value='Register'/></div>
        </form>
        <br/>
        Existing customer? Click here to Login
        <Link to='/login'><button className='btn btn-success'>Login</button></Link> &nbsp;
      </div>
      <Footer />
    </div>
  )
}

export default Registration
