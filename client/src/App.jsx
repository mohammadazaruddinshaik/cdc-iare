import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

import LoginPage from './pages/CommonPages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; 

// --- Pages Imports ---
import AdminDashboard from './pages/AdminPages/AdminDashboard';
import FacultyDashboard from './pages/FacultyPages/FacultyDashboard';
import StudentDashboard from './pages/StudentPages/StudentDashboard';
import ModifyTimetablePage from './pages/AdminPages/ModifyTimetablePage';
import StudentProfilePage from './pages/StudentPages/ProfilePage';
import FacultyProfilePage from './pages/FacultyPages/FacultyProfilePage';
import AdminProfilePage from './pages/AdminPages/AdminProfilePage';

import LeaderboardPage from './pages/CommonPages/LeaderBoardPage';
import TimeTablePage from './pages/StudentPages/TimeTablePage';
import FacultyTimetablePage from './pages/FacultyPages/FacultyTimeTablePage';
import LogsPage from './pages/StudentPages/LogsPage';
import AnnouncementsPage from './pages/StudentPages/AnnouncementsPage';

import UpdateStudentPage from './pages/FacultyPages/UpdateStudentPage';
import PostAttendance from './pages/CommonPages/PostAttendancePage';
import ViewAttendance from './pages/CommonPages/ViewAttendancePage';
import ViewAttendanceReports from './pages/FacultyPages/ViewAttendanceReports';
import FacultyActionPage from './pages/CommonPages/FacultyActionPage';
import FacultyMarkAttendancePage from './pages/FacultyPages/FacultyMarkAttendancePage';
import MultiBatchAttendancePage from './pages/CommonPages/MultiBatchAttendancePage';

import AdminTimetablePage from './pages/AdminPages/AdminTimeTablePage';
import ManageFacultyPage from './pages/AdminPages/ManageFacultyPage';
import SessionWiseReportPage from './pages/AdminPages/SessionWiseReportPage';
import BatchWiseReport from './pages/CommonPages/BatchWiseReportPage';
import ManageAttendancePage from './pages/AdminPages/ManageAttendancePage';
import ManageStudentPage from './pages/AdminPages/ManageStudentPage';
import MonthlyReport from './pages/AdminPages/MonthlyReportPage';
import CreateTimetablePage from './pages/AdminPages/CreateTimeTable';
import SystemAdministrationPage from './pages/AdminPages/SystemAdministration';
import AdminAnnouncementsPage from './pages/AdminPages/AdminAnnouncementsPage';

// --- 1. NEW COMPONENT: HANDLES AUTH CONTEXT & LOADING ---
// This wrapper ensures AuthProvider only loads for pages INSIDE it.
const AuthLayout = () => {
  return (
    <AuthProvider>
      <AuthLoadingHandler />
    </AuthProvider>
  );
};

// --- 2. LOADING HANDLER ---
// This component sits inside AuthProvider to safely use useAuth()
const AuthLoadingHandler = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-white font-mono text-sm animate-pulse">Verifying Session...</p>
      </div>
    );
  }

  // <Outlet /> renders the child routes (Dashboard, etc.) defined in AppRoutes
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* === PUBLIC ROUTE (NO AUTH CONTEXT) === */}
        {/* This is outside AuthLayout, so it makes NO API calls on load */}
        <Route path="/" element={<LoginPage />} />


        {/* === PROTECTED ROUTES (WRAPPED IN AUTH CONTEXT) === */}
        {/* All routes inside here will trigger the Session Check */}
        <Route element={<AuthLayout />}>
          
          {/* 1. SHARED ADMIN & FACULTY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
            <Route path="/post-attendance" element={<PostAttendance />} />
            <Route path="/faculty/action" element={<FacultyActionPage />} />
            <Route path="/post-attendance-multiple" element={<MultiBatchAttendancePage />} />
            <Route path="/mark-attendance" element={<FacultyMarkAttendancePage />} />
          </Route>

          {/* 2. EXCLUSIVE ADMIN ROUTES */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/timetable" element={<AdminTimetablePage />} />
            <Route path="/admin/attendance" element={<ViewAttendance />} />
            <Route path="/admin/manage-students" element={<ManageStudentPage />} />
            <Route path="/admin/manage-faculty" element={<ManageFacultyPage />} />
            <Route path="/admin/manage-attendance" element={<ManageAttendancePage />} />
            <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
            <Route path="/admin/create-timetable" element={<CreateTimetablePage />} />
            <Route path="/admin/system-admin" element={<SystemAdministrationPage />} />
            <Route path="/session-report" element={<SessionWiseReportPage />} />
            <Route path="/batch-report" element={<BatchWiseReport />} />
            <Route path="/monthly-report" element={<MonthlyReport />} />
            <Route path="/modify-timetable" element={<ModifyTimetablePage />} />
          </Route>

          {/* 3. EXCLUSIVE FACULTY ROUTES */}
          <Route element={<ProtectedRoute requiredRole="faculty" />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfilePage />} />
            <Route path="/faculty/update-student" element={<UpdateStudentPage />} />
            <Route path="/faculty/students" element={<ViewAttendance />} />
            <Route path="/faculty/reports" element={<ViewAttendanceReports />} />
            <Route path="/faculty/timetable" element={<FacultyTimetablePage />} />
          </Route>

          {/* 4. STUDENT ROUTES */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/inbox" element={<AnnouncementsPage />} />
          </Route>

          {/* Semi-Public / Shared Routes (Accessible by all logged in users) */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/timetable" element={<TimeTablePage />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#111827' }}>
              <h1>404 | Page Not Found</h1>
            </div>
          } />
          
        </Route> {/* End of AuthLayout */}
      </Routes>
    </Router>
  );
};

function App() {
  return (
    // REMOVED AuthProvider from here. 
    // It is now handled inside AppRoutes -> AuthLayout
    <AppRoutes />
  );
}

export default App;