import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div>
      <Header />
      <div className='form'>
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label">Email address</label>
          <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="Input email" />
        </div>
        <div class="mb-3">
          <label for="inputPassword5" class="form-label">Password</label>
          <input type="password" id="inputPassword5" class="form-control" aria-describedby="passwordHelpBlock" placeholder="Input password" />
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
      <div>
        <br/>
        New user? Click here to Create an account
        <Link to='/register'><button className='btn btn-success'>Register</button></Link> &nbsp;
      </div>
      <Footer />
    </div>
  )
}

export default Login
