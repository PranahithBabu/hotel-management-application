import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Login from './pages/Login'
import Registration from './pages/Registration'
import AHome from './pages/AHome'
import CHome from './pages/CHome'
import ADashboard from './pages/ADashboard'
import CDashboard from './pages/CDashboard'
import Initial from './pages/Initial'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Initial />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Registration />} />
      <Route path='/a/home/:id' element={<AHome />} />
      <Route path='/c/home/:id' element={<CHome />} />
      <Route path='/a/dashboard/:id' element={<ADashboard />} />
      <Route path='/c/dashboard/:id' element={<CDashboard />} />
    </Routes>
  )
}

export default App
