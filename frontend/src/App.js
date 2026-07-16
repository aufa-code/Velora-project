import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Setup from './pages/Setup';
import Session from './pages/Session';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/session" element={<Session />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
