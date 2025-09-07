import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import IARELogo from '../assets/logo.png';

/**
 * @file Header.jsx
 * @description A reusable header where clicking the profile navigates, and hovering shows a dropdown.
 */
const Header = ({ animate }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({ primary: '', secondary: '' });

    const userRole = sessionStorage.getItem("userRole");

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        try {
            const identifier = sessionStorage.getItem("userIdentifier");
            if (userRole === 'faculty') {
                const name = sessionStorage.getItem("userName") || "Faculty";
                setUserData({ primary: name, secondary: identifier || 'N/A' });
            } else if (userRole === 'student') {
                const batch = sessionStorage.getItem("batch");
                setUserData({ primary: identifier || 'N/A', secondary: batch || 'N/A' });
            } else if (userRole === 'admin') {
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
            { path: '/timetable', label: 'Schedule' },
            { path: '/faculty/students', label: 'Attendance' },
        ];
    } else if (userRole === 'student') {
        dashboardPath = '/student/dashboard';
        profilePath = '/student/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: '/leaderboard', label: 'Leaderboard' },
            { path: '/timetable', label: 'Schedule' },
            { path: '/logs', label: 'My Logs' },
        ];
    } else if (userRole === 'admin') {
        dashboardPath = '/admin/dashboard';
        profilePath = '/admin/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: '/leaderboard', label: 'Leaderboard' },
            { path: '/admin/timetable', label: 'Schedules' },
            { path: '/admin/attendance', label: 'Attendance' },
        ];
    }
    
    // New handler to navigate to profile on click
    const handleProfileNavigate = () => {
        setIsProfileDropdownOpen(false); // Ensure dropdown closes before navigating
        navigate(profilePath);
    };

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
                            <img src={IARELogo} alt="IARE Logo" className="h-14 w-auto" />
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
                    {/* Wrapper for Profile Icon + Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsProfileDropdownOpen(true)}
                        onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    >
                        {/* The visible profile icon/name */}
                        <div
                            onClick={handleProfileNavigate}
                            className={`flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full pl-1.5 pr-2 py-1.5 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer transform ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
                            style={{ transitionDelay: '400ms' }}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden sm:block pr-2">
                                <p className="text-sm font-semibold text-white">{userData.primary}</p>
                                <p className="text-xs text-gray-300">{userData.secondary}</p>
                            </div>
                        </div>

                        {/* Dropdown Menu (appears only on hover) */}
                        <div className={`absolute top-full right-0 pt-3 w-64 origin-top-right transition-all duration-200 ease-out ${isProfileDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                            <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-2xl border border-white/20 relative">
                                <div className="absolute -top-2 right-4 w-4 h-4 bg-gray-900/90 transform rotate-45 border-t border-l border-white/20"></div>

                                <div className="px-4 py-3 border-b border-white/10">
                                    <p className="text-sm font-semibold text-white truncate">{userData.primary}</p>
                                    <p className="text-xs text-gray-400 truncate">{userData.secondary}</p>
                                </div>
                                <div className="py-2">
                                    <Link
                                        to={profilePath}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        My Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className={`flex items-center transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
                        <button onClick={handleLogout} className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-300 group" aria-label="Logout">
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
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