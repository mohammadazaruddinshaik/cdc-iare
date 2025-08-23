import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';

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
        const name = localStorage.getItem("userName") || "Faculty Name";
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