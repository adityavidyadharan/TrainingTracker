
import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import LandingPage from './views/LandingPage'
import TrainingStatus from './views/TrainingStatus'
import Login from './views/Login'
import Navbar from './components/Navbar'
import Profile from './views/Profile'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/status" element={<TrainingStatus />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
