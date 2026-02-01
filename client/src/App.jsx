import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// --- Context & Core Components ---
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './components/ErrorPage'; 
import Loader from './components/Loader'; 

// --- Eager Load (Load immediately) ---
import LoginPage from './pages/CommonPages/LoginPage';

// --- Lazy Load (Load only when needed) ---
// 1. Common Pages
const LeaderboardPage = lazy(() => import('./pages/CommonPages/LeaderBoardPage'));
const TimeTablePage = lazy(() => import('./pages/StudentPages/TimeTablePage'));
const ViewAttendance = lazy(() => import('./pages/CommonPages/ViewAttendancePage'));
const PostAttendance = lazy(() => import('./pages/CommonPages/PostAttendancePage'));
const MultiBatchAttendancePage = lazy(() => import('./pages/CommonPages/MultiBatchAttendancePage'));
const FacultyActionPage = lazy(() => import('./pages/CommonPages/FacultyActionPage'));
const BatchWiseReport = lazy(() => import('./pages/CommonPages/BatchWiseReportPage'));

// 2. Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminPages/AdminDashboard'));
const AdminProfilePage = lazy(() => import('./pages/AdminPages/AdminProfilePage'));
const AdminTimetablePage = lazy(() => import('./pages/AdminPages/AdminTimeTablePage'));
const ManageStudentPage = lazy(() => import('./pages/AdminPages/ManageStudentPage'));
const ManageFacultyPage = lazy(() => import('./pages/AdminPages/ManageFacultyPage'));
const ManageAttendancePage = lazy(() => import('./pages/AdminPages/ManageAttendancePage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/AdminPages/AdminAnnouncementsPage'));
const CreateTimetablePage = lazy(() => import('./pages/AdminPages/CreateTimeTable'));
const SystemAdministrationPage = lazy(() => import('./pages/AdminPages/SystemAdministration'));
const SessionWiseReportPage = lazy(() => import('./pages/AdminPages/SessionWiseReportPage'));
const MonthlyReport = lazy(() => import('./pages/AdminPages/MonthlyReportPage'));
const ModifyTimetablePage = lazy(() => import('./pages/AdminPages/ModifyTimetablePage'));

// 3. Faculty Pages
const FacultyDashboard = lazy(() => import('./pages/FacultyPages/FacultyDashboard'));
const FacultyProfilePage = lazy(() => import('./pages/FacultyPages/FacultyProfilePage'));
const FacultyMarkAttendancePage = lazy(() => import('./pages/FacultyPages/FacultyMarkAttendancePage'));
const UpdateStudentPage = lazy(() => import('./pages/FacultyPages/UpdateStudentPage'));
const FacultyTimetablePage = lazy(() => import('./pages/FacultyPages/FacultyTimeTablePage'));

// 4. Student Pages
const StudentDashboard = lazy(() => import('./pages/StudentPages/StudentDashboard'));
const StudentProfilePage = lazy(() => import('./pages/StudentPages/ProfilePage'));
const LogsPage = lazy(() => import('./pages/StudentPages/LogsPage'));
const InboxPage = lazy(() => import('./pages/StudentPages/AnnouncementsPage'));

/**
 * --- NetworkGuard ---
 * Wraps ONLY the specific routes that must fail when offline.
 * If you want a page to work offline, do NOT wrap it with this.
 */
const NetworkGuard = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <ErrorPage type="network" onRetry={() => window.location.reload()} />;
  }

  return children;
};

/**
 * --- SessionGuard ---
 * Wraps all protected routes.
 * Checks if Auth is ready.
 */
const SessionGuard = () => {
  const { loading } = useAuth();

  if (loading) return <Loader />;
  
  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
};

// --- Route Definitions ---
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<LoginPage />} />

      {/* Protected Area */}
      <Route element={<SessionGuard />}>
        
        {/* --- Common Routes --- */}
        {/* Example: Leaderboard requires internet, so we wrap it in NetworkGuard */}
        <Route path="/leaderboard" element={
          <NetworkGuard>
            <LeaderboardPage />
          </NetworkGuard>
        } />
        
        {/* Timetable might be cached, so we allow it offline (No NetworkGuard) */}
        <Route path="/timetable" element={<TimeTablePage />} />

        {/* --- Shared Admin & Faculty Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
          {/* USER REQUEST: No Network Guard for these specific pages */}
          <Route path="/post-attendance" element={<PostAttendance />} />
          <Route path="/post-attendance-multiple" element={<MultiBatchAttendancePage />} />
          <Route path="/mark-attendance" element={<FacultyMarkAttendancePage />} />
          
          <Route path="/batch-report" element={<BatchWiseReport />} />
          <Route path="/faculty/action" element={<FacultyActionPage />} />
        </Route>

        {/* --- Admin Only Routes --- */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          {/* Dashboards often need live data, so we guard them */}
          <Route path="/admin/dashboard" element={
            <NetworkGuard>
              <AdminDashboard />
            </NetworkGuard>
          } />
          
          {/* USER REQUEST: These pages are included WITHOUT NetworkGuard (Accessible offline) */}
          <Route path="/admin/manage-students" element={<ManageStudentPage />} />
          <Route path="/admin/manage-faculty" element={<ManageFacultyPage />} />
          <Route path="/admin/manage-attendance" element={<ManageAttendancePage />} />
          <Route path="/admin/create-timetable" element={<CreateTimetablePage />} />
          <Route path="/modify-timetable" element={<ModifyTimetablePage />} />

          {/* Other Admin Routes */}
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/timetable" element={<AdminTimetablePage />} />
          <Route path="/admin/attendance" element={<ViewAttendance />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          <Route path="/admin/system-admin" element={<SystemAdministrationPage />} />
          <Route path="/session-report" element={<SessionWiseReportPage />} />
          <Route path="/monthly-report" element={<MonthlyReport />} />
        </Route>

        {/* --- Faculty Only Routes --- */}
        <Route element={<ProtectedRoute requiredRole="faculty" />}>
          <Route path="/faculty/dashboard" element={
            <NetworkGuard>
              <FacultyDashboard />
            </NetworkGuard>
          } />
          <Route path="/faculty/profile" element={<FacultyProfilePage />} />
          <Route path="/faculty/update-student" element={<UpdateStudentPage />} />
          <Route path="/faculty/students" element={<ViewAttendance />} />
          <Route path="/faculty/timetable" element={<FacultyTimetablePage />} />
        </Route>

        {/* --- Student Only Routes --- */}
        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/student/dashboard" element={
            <NetworkGuard>
              <StudentDashboard />
            </NetworkGuard>
          } />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/inbox" element={<InboxPage />} />
        </Route>

        {/* --- 404 Not Found --- */}
        <Route path="*" element={<ErrorPage type="notfound" />} />
      </Route>
    </Routes>
  );
};

// --- MAIN APPLICATION ENTRY ---
function App() {
  const [errorType, setErrorType] = useState(null);

  // Global Error Listener
  useEffect(() => {
    // NOTE: Removed global 'offline' listener here so individual pages can decide.
    // Only listening for critical application errors now.
    
    const handleNetworkError = () => setErrorType('network'); // Custom event manually triggered by API calls
    const handleServerError = () => setErrorType('server');   // Custom event manually triggered by API calls

    window.addEventListener('app-network-error', handleNetworkError);
    window.addEventListener('app-server-error', handleServerError);

    return () => {
      window.removeEventListener('app-network-error', handleNetworkError);
      window.removeEventListener('app-server-error', handleServerError);
    };
  }, []);

  const handleRetry = () => {
    setErrorType(null);
    window.location.reload();
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        {/* Only blocking global errors (like 500 server crashes), not connection loss */}
        {errorType ? (
          <ErrorPage type={errorType} onRetry={handleRetry} />
        ) : (
          <AppRoutes />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;