import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/Auth'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App