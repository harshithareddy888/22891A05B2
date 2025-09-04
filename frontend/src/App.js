import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Redirect from './pages/Redirect';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
// Auth guard removed to make Dashboard public
import RegisterEval from './pages/RegisterEval';
import AuthToken from './pages/AuthToken';

function App() {
  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterEval />} />
          <Route path="/auth-token" element={<AuthToken />} />
          <Route path="/:shortcode" element={<Redirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
