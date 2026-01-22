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
import FacultyContestPage from './pages/FacultyPages/FacultyContestPage';
import StudentContestPage from './pages/StudentPages/StudentContestPage';
import EnterContest from './pages/StudentPages/EnterContestPage';
import ContestDashboard from './pages/StudentPages/ContestDashboardPage'
import ProblemSolver from './pages/StudentPages/ProblemSolverPage';

import ContestInstructions from './pages/StudentPages/ContestInstructions';
import FacultyQuizDashboard from './pages/FacultyPages/FacultyQuizDashboard';
import QuizJoin from './pages/StudentPages/QuizJoin.jsx';
import QuizInstructions from './pages/StudentPages/QuizInstructions.jsx';
import QuizActive from './pages/StudentPages/QuizActive.jsx';
import FacultySessionPage from './pages/FacultyPages/FacultySessionPage.jsx';
import FacultySessionAnalytics from './pages/FacultyPages/FacultySessionAnalytics.jsx';
import StudentResultPage from './pages/StudentPages/StudentResultsPage.jsx';
import QuizDashboard from './pages/StudentPages/QuizDashboard.jsx';
import AssessmentResult from './pages/StudentPages/AssessmentResult.jsx';

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

  return <Outlet />;
};

const AppRoutes = () => {
  return (
    // FIX: Added future flags here to silence v7 warnings
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* === PUBLIC ROUTE (NO AUTH CONTEXT) === */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/result" element={<AssessmentResult />} />


        {/* Public Contest Routes */}

        {/* === PROTECTED ROUTES (WRAPPED IN AUTH CONTEXT) === */}
        <Route element={<AuthLayout />}>

          {/* 1. SHARED ADMIN & FACULTY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
            <Route path="/post-attendance" element={<PostAttendance />} />
            <Route path="/faculty/action" element={<FacultyActionPage />} />
            <Route path="/post-attendance-multiple" element={<MultiBatchAttendancePage />} />
            <Route path="/mark-attendance" element={<FacultyMarkAttendancePage />} />
            <Route path="/batch-report" element={<BatchWiseReport />} />
            <Route path="/coding-contests" element={<FacultyContestPage />} />
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
            <Route path="/monthly-report" element={<MonthlyReport />} />
            <Route path="/modify-timetable" element={<ModifyTimetablePage />} />
          </Route>

          {/* 3. EXCLUSIVE FACULTY ROUTES */}
          <Route element={<ProtectedRoute requiredRole="faculty" />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfilePage />} />
            <Route path="/faculty/update-student" element={<UpdateStudentPage />} />
            <Route path="/faculty/students" element={<ViewAttendance />} />
            <Route path="/faculty/timetable" element={<FacultyTimetablePage />} />
            <Route path="/faculty/quiz" element={<FacultyQuizDashboard />} />
            <Route path="/faculty/sessions" element={<FacultySessionPage />} />
            <Route path="/faculty/sessions/:sessionCode/analytics" element={<FacultySessionAnalytics />} />
          </Route>

          {/* 4. STUDENT ROUTES */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/inbox" element={<AnnouncementsPage />} />


            <Route path="/contests" element={<StudentContestPage />} />
            <Route path="/contests/:contestId" element={<EnterContest />} />
            <Route path="/contest/:contestId/instructions" element={<ContestInstructions />} />
            <Route path="/contests/:contestId/live" element={<ContestDashboard />} />
            <Route path="/contests/:contestId/problem/:problemId" element={<ProblemSolver />} />

            <Route path="/student/quiz" element={<QuizDashboard/>}/>
            <Route path="/student/quiz/join" element={<QuizJoin />} />
            <Route path="/student/quiz/instructions" element={<QuizInstructions />} />
            <Route path="/student/quiz/active" element={<QuizActive />} />
            <Route path="/student/quiz/result" element={<StudentResultPage />} />
          </Route>

          {/* Semi-Public / Shared Routes (Logged in users only) */}
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
    <AppRoutes />
  );
}

export default App;