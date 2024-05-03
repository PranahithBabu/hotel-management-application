import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const Initial = () => {
  return (
    <div>
        <Header />
        <div className='main'>
            Book you rooms now at HOING. <br />
            <i>Manage your reservation in 1 click.</i> <br/>
            <div>
                <Link to='/register'><button className='btn btn-success'>Register</button></Link> &nbsp;
                <Link to='/login'><button className='btn btn-primary'>Login</button></Link>
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default Initial
