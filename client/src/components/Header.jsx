/**
 * @file Header.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 17 Aug 2025
 * @description A reusable and responsive header component for the dashboard application.
 * Displays the application logo/title, navigation links (desktop) or a hamburger menu (mobile),
 * and a user profile section with a dropdown menu and a separate logout button.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';

const Header = ({ animate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ rollno: '', batch: '' });

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // useEffect to load user data from localStorage
  useEffect(() => {
    try {
      const getrollno = localStorage.getItem("rollno");
      const getbatch = localStorage.getItem("batch");
      setUserData({
        rollno: getrollno || 'N/A', // Fallback to 'N/A' if not present
        batch: getbatch || 'N/A',
      });
    } catch (error) {
      console.error("Failed to get user data from localStorage:", error);
      setUserData({ rollno: 'Error', batch: 'Data Error' });
    }
  }, []); // The empty dependency array ensures this effect runs only once

  // Helper function to determine link styles based on the current path
  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (location.pathname === '/' && path === '/dashboard');
    return {
      link: isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
      underline: isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
    };
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('rollno');
    localStorage.removeItem('batch');
    sessionStorage.clear();
    
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Navigation links array for DRY code
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/leaderboard', label: 'LeaderBoard' },
    { path: '/timetable', label: 'Time Table' },
    { path: '/logs', label: 'Logs' },
  ];

  return (
    <header className="text-white py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Left Section: Logo and Navigation */}
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
            <Link to="/dashboard" className="relative">
              <span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CDC PORTAL
              </span>
            </Link>
          </div>
          <nav className={`hidden lg:flex space-x-6 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            {navLinks.map((navLink) => (
              <Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} relative group transition-all duration-300 hover:scale-105`}>
                {navLink.label}
                <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass(navLink.path).underline} transition-transform duration-300`}></div>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* --- CORRECTED SECTION START --- */}
        {/* Right Section: User Profile and Mobile Menu Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Profile Section (Clickable) */}
          <div 
            className={`relative transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
            onClick={() => navigate('/profile')}
          >
            <div 
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">{userData.rollno}</p>
                <p className="text-xs text-gray-300">{userData.batch}</p>
              </div>
            </div>
          </div>

          {/* Standalone Logout Button */}
          <div className={`flex items-center transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-300 group"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            </button>
          </div>
        </div>
        {/* --- CORRECTED SECTION END --- */}
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-gray-900/80 backdrop-blur-md mt-2 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="flex flex-col p-4">
            {navLinks.map((navLink) => (
              <Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}>
                {navLink.label}
              </Link>
            ))}
            <div className="border-t border-white/20 my-2"></div>
            <Link to="/profile" className={`${getLinkClass('/profile').link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}>
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