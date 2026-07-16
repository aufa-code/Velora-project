import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Setup from './pages/Setup';
import Session from './pages/Session';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/session" element={<Session />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
