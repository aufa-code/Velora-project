import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Setup from './pages/Setup';
import Session from './pages/Session';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Review from './pages/Review';
import ReviewDetail from './pages/ReviewDetail';
import Gamifikasi from './pages/Gamifikasi';
import ImportMateri from './pages/ImportMateri';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/session" element={<Session />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/review" element={<Review />} />
        <Route path="/review/topik" element={<ReviewDetail />} />
        <Route path="/gamifikasi" element={<Gamifikasi />} />
        <Route path="/import" element={<ImportMateri />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
