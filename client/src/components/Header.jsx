import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, ChevronDown, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import IARELogo from '../assets/logo.png';

/**
 * @file Header.jsx
 * @description A responsive, high-priority header with role-based navigation and enhanced profile management.
 */
const Header = ({ animate }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // UI States
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [displayUser, setDisplayUser] = useState({ name: '', roleLabel: '', roleIcon: null });
    const [imgError, setImgError] = useState(false);

    // --- EFFECT: Close mobile menu on route change ---
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // --- EFFECT: Reset image error on user change ---
    useEffect(() => {
        setImgError(false);
    }, [user]);

    // --- EFFECT: Parse User Data for Display ---
    useEffect(() => {
        if (!user) {
            setDisplayUser({ name: 'Guest', roleLabel: 'Visitor', roleIcon: <User size={14} /> });
            return;
        }

        const identifier = user.username || 'User';
        let label = 'User';
        let icon = <User size={14} />;

        switch (user.role) {
            case 'faculty':
                label = 'Faculty Member';
                icon = <Briefcase size={14} />;
                break;
            case 'student':
                label = 'Student Scholar';
                icon = <GraduationCap size={14} />;
                break;
            case 'admin':
                label = 'System Administrator';
                icon = <ShieldCheck size={14} />;
                break;
            default:
                label = user.role || 'Member';
        }

        setDisplayUser({ name: identifier, roleLabel: label, roleIcon: icon });
    }, [user]);

    // --- NAVIGATION LOGIC ---
    let navLinks = [];
    let dashboardPath = '/';
    let profilePath = '/profile';

    if (user?.role === 'faculty') {
        dashboardPath = '/faculty/dashboard';
        profilePath = '/faculty/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: '/leaderboard', label: 'Leaderboard' },
            { path: '/faculty/timetable', label: 'Schedule' },
            { path: '/faculty/students', label: 'Attendance' },
        ];
    } else if (user?.role === 'student') {
        dashboardPath = '/student/dashboard';
        profilePath = '/student/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: '/leaderboard', label: 'Leaderboard' },
            { path: '/timetable', label: 'Schedule' },
            { path: '/logs', label: 'Logs' },
            { path: '/inbox', label: 'Inbox' }, 
        ];
    } else if (user?.role === 'admin') {
        dashboardPath = '/admin/dashboard';
        profilePath = '/admin/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: '/leaderboard', label: 'Leaderboard' },
            { path: '/admin/timetable', label: 'Schedules' },
            { path: '/admin/attendance', label: 'Attendance' },
            { path: '/admin/announcements', label: 'Announcements'}
        ];
    }

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const handleProfileNavigate = () => {
        setIsProfileDropdownOpen(false); 
        navigate(profilePath);
    };

    // Helper for active link styles
    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return {
            container: isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium',
            indicator: isActive ? 'w-full' : 'w-0 group-hover:w-full'
        };
    };

    // Student Profile Image URL Construction
    const profileImageUrl = (user?.role === 'student' && user?.username) 
        ? `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${user.username.toUpperCase()}/${user.username.toUpperCase()}.jpg`
        : null;

    return (
        // Header Container: High Z-Index to stay on top
        <header className="relative z-[100] py-4 w-full">
            <div className="flex items-center justify-between px-4 lg:px-0">
                
                {/* --- LEFT SECTION: Mobile Toggle & Logo --- */}
                <div className="flex items-center gap-4 lg:gap-8">
                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className={`transform transition-all duration-700 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <Link to={dashboardPath} className="block">
                            <img src={IARELogo} alt="IARE Logo" className="h-12 w-auto object-contain hover:brightness-110 transition-all" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={`hidden lg:flex items-center gap-8 transform transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                        {navLinks.map((link) => {
                            const styles = getLinkClass(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative group py-2 text-sm tracking-wide transition-colors ${styles.container}`}
                                >
                                    {link.label}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${styles.indicator}`}></span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* --- RIGHT SECTION: Profile & Actions --- */}
                <div className="flex items-center gap-3 lg:gap-5">
                    
                    {/* Profile Dropdown Wrapper */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsProfileDropdownOpen(true)}
                        onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    >
                        {/* Profile Trigger */}
                        <div 
                            onClick={handleProfileNavigate}
                            className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-1 pr-4 py-1 cursor-pointer transition-all duration-300 backdrop-blur-sm group transform ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden border-2 border-white/20 group-hover:border-blue-400 transition-colors">
                                {profileImageUrl && !imgError ? (
                                    <img 
                                        src={profileImageUrl} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)} 
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
                            </div>
                            
                            {/* Text Info (Desktop) */}
                            <div className="hidden lg:flex flex-col items-start">
                                <span className="text-xs font-bold text-white leading-tight">{displayUser.name}</span>
                                <span className="text-[10px] font-medium text-blue-300 flex items-center gap-1">
                                    {displayUser.roleLabel}
                                </span>
                            </div>
                            
                            {/* Chevron (Desktop) */}
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 hidden lg:block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Enhanced Dropdown Menu */}
                        <div className={`absolute top-full right-0 pt-2 w-64 origin-top-right transition-all duration-200 ${isProfileDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>
                            <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-white/10 overflow-hidden ring-1 ring-black/50">
                                {/* Header in Dropdown (Visible on Mobile mostly) */}
                                <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                                    <p className="text-sm font-bold text-white truncate">{displayUser.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-400 font-medium">
                                        {displayUser.roleIcon}
                                        <span>{displayUser.roleLabel}</span>
                                    </div>
                                </div>
                                
                                <div className="p-2">
                                    <Link 
                                        to={profilePath} 
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <User size={16} /> My Profile
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left mt-1"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Logout (Desktop) */}
                    <div className={`hidden lg:block transform transition-all duration-700 delay-200 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                        <button 
                            onClick={handleLogout} 
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2.5 rounded-full border border-red-500/20 transition-all"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MOBILE MENU OVERLAY --- */}
            {/* Background: Solid dark blue with slight opacity for readability */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#071225]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden z-50 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <nav className="flex flex-col p-4 space-y-2">
                    {navLinks.map((navLink) => (
                        <Link
                            key={navLink.path}
                            to={navLink.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block py-3 px-4 rounded-xl text-base font-medium transition-all ${location.pathname === navLink.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                        >
                            {navLink.label}
                        </Link>
                    ))}
                    
                    <div className="h-px bg-white/10 my-2 mx-4"></div>
                    
                    <Link 
                        to={profilePath} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium transition-all ${location.pathname === profilePath ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                    >
                        <User size={18} /> My Profile
                    </Link>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-xl text-base font-bold text-red-400 hover:bg-red-500/10 transition-all mt-2"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;