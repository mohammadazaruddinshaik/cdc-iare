import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Import all page components ---

// Authentication
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component

// Role-based Dashboards
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Role-based Profile Pages
import StudentProfilePage from './pages/ProfilePage';
import FacultyProfilePage from './pages/FacultyProfilePage';
import AdminProfilePage from './pages/AdminProfilePage';

// Shared Pages
import LeaderboardPage from './pages/LeaderBoardPage';
import TimeTablePage from './pages/TimeTablePage';

// Student-specific Pages
import LogsPage from './pages/LogsPage';

// Faculty-specific Pages
import UpdateStudentPage from './pages/UpdateStudentPage';
import PostAttendance from './pages/PostAttendancePage';
import ViewAttendance from './pages/ViewAttendancePage';
import ViewAttendanceReports from './pages/ViewAttendanceReports';
import FacultyActionPage from './pages/FacultyActionPage';
import FacultyMarkAttendancePage from './pages/FacultyMarkAttendancePage';

// Admin-specific Pages
import AdminTimetablePage from './pages/AdminTimeTablePage';
import ManageFacultyPage from './pages/ManageFacultyPage';
import SessionWiseReportPage from './pages/SessionWiseReportPage';
import BatchWiseReport from './pages/BatchWiseReportPage';
import ManageAttendancePage from './pages/ManageAttendancePage';
import ManageStudentPage from './pages/ManageStudentPage';
import MonthlyReport from './pages/MonthlyReportPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/timetable" element={<AdminTimetablePage />} />
          <Route path="/admin/attendance" element={<ViewAttendance />} />
          <Route path="/admin/manage-students" element={<ManageStudentPage />} />
          <Route path="/admin/manage-faculty" element={<ManageFacultyPage />} />
          <Route path="/admin/manage-attendance" element={<ManageAttendancePage />} />
          <Route path="/session-report" element={<SessionWiseReportPage />} />
          <Route path="/batch-report" element={<BatchWiseReport />} />
          <Route path="/monthly-report" element={<MonthlyReport />} />
        </Route>

        {/* Protected Faculty Routes */}
        <Route element={<ProtectedRoute requiredRole="faculty" />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/profile" element={<FacultyProfilePage />} />
          <Route path="/faculty/update-student" element={<UpdateStudentPage />} />
          <Route path="/faculty/action" element={<FacultyActionPage />} />
          <Route path="/post-attendance" element={<PostAttendance />} />
          <Route path="/faculty/mark-attendance" element={<FacultyMarkAttendancePage />} />
          <Route path="/faculty/students" element={<ViewAttendance />} />
          <Route path="/faculty/reports" element={<ViewAttendanceReports />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Route>

      
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/timetable" element={<TimeTablePage />} />

        {/* Catch-all route for 404 - make sure it's outside all protected routes */}
        <Route path="*" element={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#111827' }}>
            <h1>404 | Page Not Found</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;