import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Import all page components ---

// Authentication
import LoginPage from './pages/LoginPage';

// Role-based Dashboards
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Role-based Profile Pages
import StudentProfilePage from './pages/ProfilePage'; // Assuming this is the student's profile
import FacultyProfilePage from './pages/FacultyProfilePage'; // The new faculty profile page

// Shared Pages
import LeaderboardPage from './pages/LeaderBoardPage';
import TimeTablePage from './pages/TimeTablePage';

// Student-specific Pages
import LogsPage from './pages/LogsPage';

// Faculty-specific Pages
import UpdateStudentPage from './pages/UpdateStudentPage';
import PostAttendance from './pages/PostAttendancePage';
import ViewAttendance from './pages/ViewAttendancePage'; // Import the new page
import ViewAttendanceReports from './pages/ViewAttendanceReports';
import FacultyActionPage from './pages/FacultyActionPage';
// Admin-specific Pages 
import AdminTimetablePage from './pages/AdminTimeTablePage';
import ManageFacultyPage from './pages/ManageFacultyPage';
import SessionWiseReportPage from './pages/SessionWiseReportPage';
import BatchWiseReport from './pages/BatchWiseReportPage';
import ManageAttendancePage from './pages/ManageAttendancePage';
import ManageStudentPage from './pages/ManageStudentPage';
import AdminProfilePage from './pages/AdminProfilePage';
import MonthlyReport from './pages/MonthlyReportPage';
import FacultyMarkAttendancePage from './pages/FacultyMarkAttendancePage';
function App() {
  return (
    <Router>
      <Routes>
        {/* --- Application Routes --- */}
        {/* Default route to the login page */}
        <Route path="/" element={<LoginPage />} />

        {/* Role-based dashboard routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* UPDATED: Role-specific profile routes */}
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/faculty/profile" element={<FacultyProfilePage />} />

        {/* Faculty-specific action routes */}
        <Route path="/faculty/update-student" element={<UpdateStudentPage />} />
        <Route path="/faculty/action" element={< FacultyActionPage/>} />
        <Route path="/post-attendance" element={<PostAttendance />} />
        <Route path="/faculty/mark-attendance" element={<FacultyMarkAttendancePage />}/>
        <Route path="/faculty/students" element={<ViewAttendance />} /> {/* Add the new route */}
        <Route path="/faculty/reports" element={<ViewAttendanceReports/>}></Route>

        
        <Route path="/admin/timetable" element={<AdminTimetablePage/>}></Route>
        <Route path="/admin/profile" element={<AdminProfilePage/>}></Route>
        <Route path="/admin/attendance" element={<ViewAttendance />} /> {/* Add the new route */}
        <Route path="/admin/manage-students" element={<ManageStudentPage />} /> {/* Add the new route */}
        <Route path="/admin/manage-faculty" element={<ManageFacultyPage />} /> {/* Add the new route */}
        <Route path="/admin/manage-attendance" element={<ManageAttendancePage />} /> {/* Add the new route */}
        <Route path="/session-report" element={<SessionWiseReportPage/>}></Route>
        <Route path="/batch-report" element={<BatchWiseReport />}></Route>
        <Route path="/monthly-report" element={<MonthlyReport />}></Route>

        {/* Shared application routes */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/timetable" element={<TimeTablePage />} />
        
        {/* Student-specific routes */}
        <Route path="/logs" element={<LogsPage />} />

        {/* A catch-all route for any undefined paths */}
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
