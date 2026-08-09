import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/Auth'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import JobCreate from './components/JobCreate'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs/new" element={<JobCreate />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
