import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';

function App() {
  return (
    <Router>
      <div>
        {/* Navigasi ini bisa dihapus jika tidak diperlukan */}
        <nav 
          className="p-4 bg-gray-100"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "20px"
          }}
        >
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<LoginPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
