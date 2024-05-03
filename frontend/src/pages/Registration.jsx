import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const Registration = () => {
  return (
    <div>
      <Header />
      <div className='form'>
      <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" id="username" placeholder="Input username" />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input type="email" class="form-control" id="email" placeholder="Input email" />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" id="password" class="form-control" aria-describedby="passwordHelpBlock" placeholder="Input password" />
        </div>
        <div class="mb-3">
          <label for="confirmpassword" class="form-label">Confirm Password</label>
          <input type="password" id="confirmpassword" class="form-control" aria-describedby="passwordHelpBlock" placeholder="Confirm password" />
        </div>
        <div class="mb-3">
          <label for="secretkey" class="form-label">Secret Key</label>
          <div class="question-mark-container">
            <input type="password" id="secretkey" class="form-control" aria-describedby="passwordHelpBlock" placeholder="Input Secret key" />
            <span class="question-mark">?</span>
            <div class="tooltip" role="tooltip">For Admin Login</div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
      <div>
        <br/>
        Existing customer? Click here to Login
        <Link to='/login'><button className='btn btn-success'>Login</button></Link> &nbsp;
      </div>
      <Footer />
    </div>
  )
}

export default Registration
