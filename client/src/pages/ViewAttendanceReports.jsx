import React, { useState, useEffect, useRef } from 'react';
import { FileText, Sheet, Download, AlertTriangle, CheckCircle, ChevronUp, Loader2, XCircle, User, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// --- Reusable Header Component ---
/**
 * @file Header.jsx
 * @description A reusable, responsive, and role-aware header component.
 * It dynamically adjusts navigation links and user display based on whether the
 * logged-in user is a 'student', 'faculty', or 'admin'.
 */
const Header = ({ animate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ primary: '', secondary: '' });

  // In a real app, this would come from a global state/context or a more robust source than localStorage.
  const userRole = localStorage.getItem("userRole"); 

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      const identifier = localStorage.getItem("userIdentifier");
      if (userRole === 'faculty') {
        const name = localStorage.getItem("userName") || "Faculty";
        setUserData({ primary: name, secondary: identifier || 'N/A' });
      } else if (userRole === 'student') {
        const batch = localStorage.getItem("batch");
        setUserData({ primary: identifier || 'N/A', secondary: batch || 'N/A' });
      } else if (userRole === 'admin') {
        // Static data for Admin user
        setUserData({ primary: 'Admin', secondary: 'Administrator' });
      }
    } catch (error) {
      console.error("Failed to get user data from localStorage:", error);
      setUserData({ primary: 'Error', secondary: 'Data Error' });
    }
  }, [userRole]);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return {
      link: isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
      underline: isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
    };
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // --- ROLE-BASED NAVIGATION ---
  let navLinks = [];
  let dashboardPath = '/';
  let profilePath = '/profile';

  if (userRole === 'faculty') {
    dashboardPath = '/faculty/dashboard';
    profilePath = '/faculty/profile';
    navLinks = [
      { path: dashboardPath, label: 'Dashboard' },
      { path: '/leaderboard', label: 'Leaderboard' },
      { path: '/timetable', label: 'Time Table' },
      { path: '/faculty/students', label: 'Attendance Board' },      
    ];
  } else if (userRole === 'student') {
    dashboardPath = '/student/dashboard';
    profilePath = '/student/profile';
    navLinks = [
      { path: dashboardPath, label: 'Dashboard' },
      { path: '/leaderboard', label: 'LeaderBoard' },
      { path: '/timetable', label: 'Time Table' },
      { path: '/logs', label: 'Logs' },
    ];
  } else if (userRole === 'admin') {
    dashboardPath = '/admin/dashboard';
    profilePath = '/admin/profile';
    navLinks = [
      { path: dashboardPath, label: 'Dashboard' },
      { path: '/leaderboard', label: 'Leaderboard' },
      { path: '/admin/timetable', label: 'Time Table' },
      { path: '/admin/attendance', label: 'Attendance Board' },
    ];
  }

  return (
    <header className="text-white py-2 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className={`flex items-center space-x-2 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            <Link to={dashboardPath} className="relative">
              <span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CDC PORTAL
              </span>
            </Link>
          </div>
          <nav className={`hidden lg:flex space-x-6 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            {navLinks.map((navLink) => (
              <Link
                key={navLink.path}
                to={navLink.path}
                className={`${getLinkClass(navLink.path).link} relative group transition-all duration-300 hover:scale-105 text-sm`}
              >
                {navLink.label}
                <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass(navLink.path).underline} transition-transform duration-300`}></div>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div
            className={`relative transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
            onClick={() => navigate(profilePath)}
          >
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block pr-2">
                <p className="text-sm font-semibold text-white">{userData.primary}</p>
                <p className="text-xs text-gray-300">{userData.secondary}</p>
              </div>
            </div>
          </div>
          <div className={`flex items-center transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            <button onClick={handleLogout} className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-300 group" aria-label="Logout">
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu: Removed 'absolute' to allow it to push content down */}
      <div className={`lg:hidden bg-slate-800/90 backdrop-blur-md mt-2 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col p-4">
          {navLinks.map((navLink) => (
            <Link
              key={navLink.path}
              to={navLink.path}
              className={`${getLinkClass(navLink.path).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}
            >
              {navLink.label}
            </Link>
          ))}
          <div className="border-t border-white/20 my-2"></div>
          <Link to={profilePath} className={`${getLinkClass(profilePath).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}>
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 w-full py-3 px-3 rounded-md hover:bg-red-500/10 text-center text-lg font-semibold"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};


// --- Configuration & Helpers ---
const backendUrl =  import.meta.env.VITE_BASE_URL;

const batchOptions = [
  { value: "attendance_skillup-1", label: "SKILLUP BATCH-1" },
  { value: "attendance_skillup-2", label: "SKILLUP BATCH-2" },
  { value: "attendance_skillup-3", label: "SKILLUP BATCH-3" },
  { value: "attendance_skillnext-1", label: "SKILLNEXT BATCH-1" },
  { value: "attendance_skillnext-2", label: "SKILLNEXT BATCH-2" },
  { value: "attendance_skillnext-3", label: "SKILLNEXT BATCH-3" },
  { value: "attendance_skillbridge-1", label: "SKILLBRIDGE BATCH-1" },
  { value: "attendance_skillbridge-2", label: "SKILLBRIDGE BATCH-2" },
  { value: "attendance_skillbridge-3", label: "SKILLBRIDGE BATCH-3" },
  { value: "attendance_skillbridge-4", label: "SKILLBRIDGE BATCH-4" },
  { value: "attendance_skillbridge-5", label: "SKILLBRIDGE BATCH-5" },
];

const getShortBatchName = (fullBatchName) => {
  const batchPart = fullBatchName.split("_")[1]?.toUpperCase() || "";
  const [type, number] = batchPart.split("-");
  let code = "NA";
  if (type === "SKILLUP") code = "SU";
  else if (type === "SKILLNEXT") code = "SN";
  else if (type === "SKILLBRIDGE") code = "SB";
  return `V-${code}${number}`;
};

// --- Main Component ---
const ViewAttendanceReport = () => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({ type: null, status: 'idle' });
  const [feedback, setFeedback] = useState({ msg: '', type: '' });
  const dropdownRef = useRef(null);
  const [animateHeader, setAnimateHeader] = useState(false);

  useEffect(() => {
    // Animate header on component mount
    setTimeout(() => setAnimateHeader(true), 100);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
  };

  const handleDownload = async (fileType) => {
    if (!selectedBatch || !selectedDate) {
      showFeedback("Please select a batch and a date.", 'error');
      return;
    }
    
    setDownloadStatus({ type: fileType, status: 'loading' });
    setFeedback({ msg: '', type: '' });

    const url = fileType === 'pdf'
      ? `${backendUrl}/api/Faculty/batch-report-pdf?batch=${selectedBatch.value}&date=${selectedDate}`
      : `${backendUrl}/api/Faculty/batch-report-excel?batch=${selectedBatch.value}&date=${selectedDate}`;

    const fileExtension = fileType === 'pdf' ? 'pdf' : 'xlsx';
    const successMessage = `${fileType.toUpperCase()} report generated successfully.`;
    const errorMessage = `Download failed. Please try again.`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Network response failed");
      }

      const shortBatch = getShortBatchName(selectedBatch.value);
      const [year, month, day] = selectedDate.split('-');
      const formattedDate = `${day}-${month}-${year}`;
      const filename = `${shortBatch}-${formattedDate}-Attendance.${fileExtension}`;

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
      showFeedback(successMessage, 'success');
      setDownloadStatus({ type: fileType, status: 'success' });

    } catch (error) {
      console.error("Download error:", error);
      showFeedback(error.message || errorMessage, 'error');
      setDownloadStatus({ type: fileType, status: 'error' });
    } finally {
      setTimeout(() => setDownloadStatus({ type: null, status: 'idle' }), 2000);
    }
  };

  const renderButtonIcon = (type, IconComponent) => {
    const currentStatus = downloadStatus.type === type ? downloadStatus.status : 'idle';
    
    switch(currentStatus) {
      case 'loading': return <Loader2 className="w-6 h-6 animate-spin" />;
      case 'success': return <CheckCircle className="w-6 h-6" />;
      case 'error': return <XCircle className="w-6 h-6" />;
      default: return <IconComponent className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>

      {/* Header Section */}
      <header className="relative z-20 w-full shrink-0 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Header animate={animateHeader} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4 border border-white/10 shadow-lg">
              <Download className="w-8 h-8 text-sky-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Download Report</h2>
            <p className="text-slate-400 mt-1">Select batch and date to generate the report.</p>
          </div>

          <div className="space-y-6">

            {/* Batch Dropdown - Reworked for clarity */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Batch</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-sm cursor-pointer flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <span className={selectedBatch ? "text-white" : "text-slate-400"}>
                    {selectedBatch ? selectedBatch.label : 'Please select a batch'}
                  </span>
                  <ChevronUp className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-0' : 'rotate-180'}`} />
                </button>
                {isDropdownOpen && (
                  <ul className="absolute top-full mt-2 w-full bg-slate-700 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {batchOptions.map(option => (
                      <li
                        key={option.value}
                        className="px-4 py-2 text-white hover:bg-sky-500/20 cursor-pointer"
                        onClick={() => { setSelectedBatch(option); setIsDropdownOpen(false); }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label htmlFor="report-date" className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-start justify-center gap-8 pt-4">
              {/* PDF Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  title="Download PDF"
                  onClick={() => handleDownload('pdf')}
                  disabled={downloadStatus.status === 'loading'}
                  className={`w-16 h-16 flex items-center justify-center bg-slate-700/80 border border-white/10 hover:bg-slate-600 text-red-400 font-semibold rounded-full shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${downloadStatus.type === 'pdf' && downloadStatus.status === 'loading' ? 'animate-pulse' : ''} ${downloadStatus.type === 'pdf' && downloadStatus.status === 'success' ? 'bg-green-500/30 !text-green-400' : ''} ${downloadStatus.type === 'pdf' && downloadStatus.status === 'error' ? 'bg-red-500/30 !text-red-400' : ''}`}
                >
                  {renderButtonIcon('pdf', FileText)}
                </button>
                <span className="text-xs text-slate-400 font-medium">PDF</span>
              </div>

              {/* Excel Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  title="Download Excel"
                  onClick={() => handleDownload('excel')}
                  disabled={downloadStatus.status === 'loading'}
                  className={`w-16 h-16 flex items-center justify-center bg-slate-700/80 border border-white/10 hover:bg-slate-600 text-green-400 font-semibold rounded-full shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${downloadStatus.type === 'excel' && downloadStatus.status === 'loading' ? 'animate-pulse' : ''} ${downloadStatus.type === 'excel' && downloadStatus.status === 'success' ? 'bg-green-500/30 !text-green-400' : ''} ${downloadStatus.type === 'excel' && downloadStatus.status === 'error' ? 'bg-red-500/30 !text-red-400' : ''}`}
                >
                  {renderButtonIcon('excel', Sheet)}
                </button>
                <span className="text-xs text-slate-400 font-medium">Excel</span>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback.msg && (
            <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-opacity duration-300 ${feedback.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
              {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{feedback.msg}</span>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ViewAttendanceReport;
