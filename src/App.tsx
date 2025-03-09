
import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import LandingPage from './views/LandingPage'
import TrainingStatus from './views/TrainingStatus'
import Login from './views/Login'
import Navbar from './components/Navbar'
import Profile from './views/Profile'
import { UserProvider } from './providers/UserProvider'
import LogTraining from './views/LogTraining'

function App() {

  return (
    <BrowserRouter>
    <UserProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/training" element={<LogTraining />} />
        <Route path="/status" element={<TrainingStatus />} />
      </Routes>
    </UserProvider>
    </BrowserRouter>
  )
}

export default App
