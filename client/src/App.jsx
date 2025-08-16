// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import all your page components
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderBoardPage';
import TimeTablePage from './pages/TimeTablePage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage'; // <-- Imported the ProfilePage

function App() {
  return (
    // 2. The main Router wraps everything
    <Router>
      <Routes>
        {/* 4. Each <Route> maps a URL path to a component */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/timetable" element={<TimeTablePage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* <-- Here's the new route */}

        {/* A default route to show the login page at the base URL */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
