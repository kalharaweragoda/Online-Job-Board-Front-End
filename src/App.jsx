import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/Auth'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import JobList from './components/JobList'
import JobDetail from './components/JobDetail'
import JobCreate from './components/JobCreate'
import JobEdit from './components/JobEdit'
import JobApplicants from './components/JobApplicants'
import MyApplications from './components/MyApplications'
import CompanySetup from './components/CompanySetup'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function Layout() {
  const location = useLocation()
  const hideNav = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      {!hideNav && <Nav />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        <Route path="/" element={<Home />} />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute role="employer">
              <JobCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute role="employer">
              <JobEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:jobId/applicants"
          element={
            <ProtectedRoute role="employer">
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute role="employer">
              <CompanySetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute role="jobseeker">
              <MyApplications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
