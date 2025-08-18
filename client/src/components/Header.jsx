import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';

/**
 * @file Header.jsx
 * @description A reusable, responsive, and role-aware header component.
 * It dynamically adjusts navigation links and user display based on whether the
 * logged-in user is a 'student' or a 'faculty'.
 */
const Header = ({ animate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Unified state for user data, adaptable for both roles
  const [userData, setUserData] = useState({ primary: '', secondary: '' });

  const userRole = localStorage.getItem("userRole");

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Load user data based on role
  useEffect(() => {
    try {
      const identifier = localStorage.getItem("userIdentifier");
      if (userRole === 'faculty') {
        const name = localStorage.getItem("userName") || "Faculty Name";
        setUserData({
          primary: name,
          secondary: identifier || 'N/A',
        });
      } else {
        const batch = localStorage.getItem("batch");
        setUserData({
          primary: identifier || 'N/A',
          secondary: batch || 'N/A',
        });
      }
    } catch (error) {
      console.error("Failed to get user data from localStorage:", error);
      setUserData({ primary: 'Error', secondary: 'Data Error' });
    }
  }, [userRole]);

  // Helper to determine link styles
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return {
      link: isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
      underline: isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
    };
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // --- ROLE-BASED NAVIGATION ---
  let navLinks = [];
  let dashboardPath = '/';
  let profilePath = '/profile'; // Default profile path

  if (userRole === 'faculty') {
    dashboardPath = '/faculty/dashboard';
    profilePath = '/faculty/profile'; // Faculty-specific profile path
    navLinks = [
      { path: dashboardPath, label: 'Dashboard' },
      { path: '/leaderboard', label: 'Leaderboard' },
      { path: '/timetable', label: 'Time Table' },
      { path: '/faculty/students', label: 'Attendance Board' },      
    ];
  } else { // Student
    dashboardPath = '/student/dashboard';
    profilePath = '/student/profile'; // Student-specific profile path
    navLinks = [
      { path: dashboardPath, label: 'Dashboard' },
      { path: '/leaderboard', label: 'LeaderBoard' },
      { path: '/timetable', label: 'Time Table' },
      { path: '/logs', label: 'Logs' },
    ];
  }

  return (
    <header className="text-white py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Left Section */}
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
                className={`${getLinkClass(navLink.path).link} relative group transition-all duration-300 hover:scale-105`}
              >
                {navLink.label}
                <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass(navLink.path).underline} transition-transform duration-300`}></div>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div
            className={`relative transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
            onClick={() => navigate(profilePath)}
          >
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
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

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden absolute top-full left-0 right-0 bg-gray-900/80 backdrop-blur-md mt-2 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
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

export default Header;
