import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/CommonPages/LoginPage';
import LeaderboardPage from './pages/CommonPages/LeaderBoardPage';
import PostAttendance from './pages/CommonPages/PostAttendancePage';
import ViewAttendance from './pages/CommonPages/ViewAttendancePage';
import FacultyActionPage from './pages/CommonPages/FacultyActionPage';
import MultiBatchAttendancePage from './pages/CommonPages/MultiBatchAttendancePage';
import BatchWiseReport from './pages/CommonPages/BatchWiseReportPage';

import AdminDashboard from './pages/AdminPages/AdminDashboard';
import AdminProfilePage from './pages/AdminPages/AdminProfilePage';
import AdminTimetablePage from './pages/AdminPages/AdminTimeTablePage';
import ModifyTimetablePage from './pages/AdminPages/ModifyTimetablePage';
import CreateTimetablePage from './pages/AdminPages/CreateTimeTable';
import ManageStudentPage from './pages/AdminPages/ManageStudentPage';
import ManageFacultyPage from './pages/AdminPages/ManageFacultyPage';
import ManageAttendancePage from './pages/AdminPages/ManageAttendancePage';
import AdminAnnouncementsPage from './pages/AdminPages/AdminAnnouncementsPage';
import SystemAdministrationPage from './pages/AdminPages/SystemAdministration';
import SessionWiseReportPage from './pages/AdminPages/SessionWiseReportPage';
import MonthlyReport from './pages/AdminPages/MonthlyReportPage';

import FacultyDashboard from './pages/FacultyPages/FacultyDashboard';
import FacultyProfilePage from './pages/FacultyPages/FacultyProfilePage';
import FacultyTimetablePage from './pages/FacultyPages/FacultyTimeTablePage';
import FacultyMarkAttendancePage from './pages/FacultyPages/FacultyMarkAttendancePage';
import UpdateStudentPage from './pages/FacultyPages/UpdateStudentPage';
import FacultyContestPage from './pages/FacultyPages/FacultyContestPage';
import FacultyQuizDashboard from './pages/FacultyPages/FacultyQuizDashboard';
import FacultySessionPage from './pages/FacultyPages/FacultySessionPage.jsx';
import FacultySessionAnalytics from './pages/FacultyPages/FacultySessionAnalytics.jsx';

import StudentDashboard from './pages/StudentPages/Attendance/StudentDashboard.jsx';
import StudentProfilePage from './pages/StudentPages/Attendance/ProfilePage';
import TimeTablePage from './pages/StudentPages/Attendance/TimeTablePage.jsx';
import LogsPage from './pages/StudentPages/Attendance/LogsPage.jsx';
import AnnouncementsPage from './pages/StudentPages/Attendance/AnnouncementsPage';
import StudentContestPage from './pages/StudentPages/Contest/StudentContestPage';
import EnterContest from './pages/StudentPages/Contest/EnterContestPage';
import ContestInstructions from './pages/StudentPages/Contest/ContestInstructions';
import ContestDashboard from './pages/StudentPages/Contest/ContestDashboardPage';
import ProblemSolver from './pages/StudentPages/Contest/ProblemSolverPage';
import AssessmentResult from './pages/StudentPages/Contest/AssessmentResult.jsx';
import QuizDashboard from './pages/StudentPages/Quiz/QuizDashboard.jsx';
import QuizJoin from './pages/StudentPages/Quiz/QuizJoin.jsx';
import QuizInstructions from './pages/StudentPages/Quiz/QuizInstructions.jsx';
import QuizActive from './pages/StudentPages/Quiz/QuizActive.jsx';
import StudentResultPage from './pages/StudentPages/Quiz/StudentResultsPage.jsx';

const AuthLayout = () => {
  return (
    <AuthProvider>
      <AuthLoadingHandler />
    </AuthProvider>
  );
};

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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<AuthLayout />}>
          
          <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
            <Route path="/post-attendance" element={<PostAttendance />} />
            <Route path="/faculty/action" element={<FacultyActionPage />} />
            <Route path="/post-attendance-multiple" element={<MultiBatchAttendancePage />} />
            <Route path="/mark-attendance" element={<FacultyMarkAttendancePage />} />
            <Route path="/batch-report" element={<BatchWiseReport />} />
            <Route path="/coding-contests" element={<FacultyContestPage />} />
          </Route>

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

          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/inbox" element={<AnnouncementsPage />} />
            <Route path="/contests" element={<StudentContestPage />} />
            <Route path="/contests/:contestId" element={<EnterContest />} />
            <Route path="/contests/:contestId/instructions" element={<ContestInstructions />} />
            <Route path="/contests/:contestId/live" element={<ContestDashboard />} />
            <Route path="/contests/:contestId/problem/:problemId" element={<ProblemSolver />} />
            <Route path="/contests/result" element={<AssessmentResult />} />
            <Route path="/student/quiz" element={<QuizDashboard/>}/>
            <Route path="/student/quiz/join" element={<QuizJoin />} />
            <Route path="/student/quiz/instructions" element={<QuizInstructions />} />
            <Route path="/student/quiz/active" element={<QuizActive />} />
            <Route path="/student/quiz/result" element={<StudentResultPage />} />
          </Route>

          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/timetable" element={<TimeTablePage />} />

          <Route path="*" element={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#111827' }}>
              <h1>404 | Page Not Found</h1>
            </div>
          } />
        </Route> 
      </Routes>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;