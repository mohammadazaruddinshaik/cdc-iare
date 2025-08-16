/**
 * @file Header.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 17 Aug 2025
 * @description A reusable header component for the dashboard application.
 * Displays the application logo/title, navigation links, and user information with a profile dropdown.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, UserCircle } from 'lucide-react';

const Header = ({ animate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Helper function to determine link styles based on the current path
  // It now also considers the root path '/' as the dashboard
  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (location.pathname === '/' && path === '/dashboard');
    return {
      link: isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
      underline: isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
    };
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Clear any stored user data (localStorage, sessionStorage, etc.)
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Close the dropdown
    setIsProfileOpen(false);
    
    // Redirect to login page
    navigate('/');
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    setIsProfileOpen(false);
    navigate('/profile');
  };

  return (
    <header className="text-white py-4">
      <div className="flex items-center justify-between">
        {/* Left Section: Logo and Navigation */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className={`flex items-center space-x-2 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            <div className="relative">
              <span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CDC PORTAL
              </span>
            </div>
          </div>
          <nav className={`hidden lg:flex space-x-6 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            <Link to="/dashboard" className={`${getLinkClass('/dashboard').link} relative group transition-all duration-300 hover:scale-105`}>
              Dashboard
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass('/dashboard').underline} transition-transform duration-300`}></div>
            </Link>
            <Link to="/leaderboard" className={`${getLinkClass('/leaderboard').link} relative group transition-all duration-300 hover:scale-105`}>
              LeaderBoard
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass('/leaderboard').underline} transition-transform duration-300`}></div>
            </Link>
            <Link to="/timetable" className={`${getLinkClass('/timetable').link} relative group transition-all duration-300 hover:scale-105`}>
              Time Table
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass('/timetable').underline} transition-transform duration-300`}></div>
            </Link>
            <Link to="/logs" className={`${getLinkClass('/logs').link} relative group transition-all duration-300 hover:scale-105`}>
              Logs
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass('/logs').underline} transition-transform duration-300`}></div>
            </Link>
          </nav>
        </div>
        
        {/* Right Section: User Profile */}
        <div 
          className={`relative transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">Shaik Mohammad Azaruddin</p>
              <p className="text-xs text-gray-300">AI/ML Engineer</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          <div 
            className={`absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out z-50 border border-white/20 ${isProfileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          >
            <div className="p-2">
              {/* Profile Option */}
              <button 
                onClick={handleProfileClick}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200/50 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <UserCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span>My Profile</span>
              </button>
              
              {/* Logout Option */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-105 mt-1"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;