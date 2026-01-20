import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    User, LogOut, Menu, X, ChevronDown, ShieldCheck, GraduationCap, Briefcase, 
    LayoutDashboard, Trophy, CalendarDays, ClipboardCheck, FileClock, 
    Inbox as InboxIcon, Megaphone, CalendarRange, BrainCircuit, Code2, 
    ListOrdered, Activity, FileText,Swords,
    // --- NEW ICONS ADDED HERE ---
    Puzzle,       // For Quiz Category
    ListChecks,   // For Manage Quizzes
    Radio         // For Live Sessions
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import IARELogo from '../assets/logo.png';

/**
 * @file Header.jsx
 * @description A responsive header with role-based navigation and nested dropdowns.
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
                label = 'Faculty';
                icon = <Briefcase size={14} />;
                break;
            case 'student':
                label = 'Student';
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
    const iconSize = 18; 

    if (user?.role === 'faculty') {
        dashboardPath = '/faculty/dashboard';
        profilePath = '/faculty/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },

            { path: '/leaderboard', label: 'Leaderboard', icon: <ListOrdered size={iconSize} /> },

            { path: '/faculty/timetable', label: 'Schedule', icon: <CalendarDays size={iconSize} /> },

            { path: '/faculty/students', label: 'Attendance', icon: <ClipboardCheck size={iconSize} /> },

            { path: '/faculty/quiz', label: 'Quizzes', icon: <Puzzle size={iconSize} /> },

            { path: '/faculty/sessions', label: 'Live Sessions', icon: <Radio size={iconSize} /> },

            { path: '/coding-contests', label: 'Contests', icon: <Code2 size={iconSize} /> },
         ]
    } else if (user?.role === 'student') {
        dashboardPath = '/student/dashboard';
        profilePath = '/student/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },
            { 
        path: '/contests', 
        label: 'Arena', 
        icon: <Swords size={iconSize} /> 
    },
            { path: '/student/quiz', label: 'Quiz', icon: <Code2 size={iconSize} /> },
            { path: '/leaderboard', label: 'Leaderboard', icon: <ListOrdered size={iconSize} /> },
            { path: '/timetable', label: 'Schedule', icon: <CalendarRange size={iconSize} /> },            
            { path: '/logs', label: 'Logs', icon: <FileClock size={iconSize} /> }, 
            { path: '/inbox', label: 'Inbox', icon: <InboxIcon size={iconSize} /> },

        ];
    } else if (user?.role === 'admin') {
        dashboardPath = '/admin/dashboard';
        profilePath = '/admin/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },
            { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={iconSize} /> },
            { path: '/admin/timetable', label: 'Schedules', icon: <CalendarRange size={iconSize} /> },
            { path: '/admin/attendance', label: 'Attendance', icon: <ClipboardCheck size={iconSize} /> },
            { path: '/admin/announcements', label: 'Announcements', icon: <Megaphone size={iconSize} /> },
            { path: '/coding-contests', label: 'Coding Contests', icon: <Code2 size={iconSize} /> },           
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

    // Helper to check if a parent link (with children) should be active
    const isParentActive = (children) => {
        return children.some(child => location.pathname === child.path);
    };

    // Student Profile Image URL Construction
    const profileImageUrl = (user?.role === 'student' && user?.username) 
        ? `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${user.username.toUpperCase()}/${user.username.toUpperCase()}.jpg`
        : null;

    return (
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
                        {navLinks.map((link, idx) => {
                            // Check if this item is a Dropdown (has children)
                            if (link.children) {
                                const isActive = isParentActive(link.children);
                                return (
                                    <div key={idx} className="relative group">
                                        <button className={`relative py-2 text-sm tracking-wide transition-colors flex items-center gap-2 ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}>
                                            <span className={`transition-colors duration-300 flex items-center justify-center shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>
                                                {link.icon}
                                            </span>
                                            {link.label}
                                            <ChevronDown size={14} className={`transition-transform duration-300 group-hover:rotate-180 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                                            {/* Active Indicator Line */}
                                            <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                        </button>

                                        {/* Dropdown Content */}
                                        <div className="absolute top-full left-0 pt-4 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 ease-out">
                                            <div className="bg-[#0f172a] rounded-xl shadow-xl border border-white/10 overflow-hidden ring-1 ring-black/50 p-2">
                                                {link.children.map((child, cIdx) => (
                                                    <Link 
                                                        key={cIdx} 
                                                        to={child.path}
                                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${location.pathname === child.path ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {child.icon}
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Standard Link
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative group py-2 text-sm tracking-wide transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`transition-colors duration-300 flex items-center justify-center shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </span>
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#071225]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden z-50 ${isMobileMenuOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <nav className="flex flex-col p-4 space-y-2">
                    {navLinks.map((navLink, idx) => {
                        // Mobile: Render Children
                        if (navLink.children) {
                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center gap-3 py-3 px-4 text-base font-bold text-gray-400">
                                        <span className="text-blue-400/80">{navLink.icon}</span>
                                        {navLink.label}
                                    </div>
                                    <div className="pl-8 space-y-1 border-l border-white/10 ml-6">
                                        {navLink.children.map((child, cIdx) => (
                                            <Link
                                                key={cIdx}
                                                to={child.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 py-2 px-4 rounded-lg text-sm font-medium transition-all ${location.pathname === child.path ? 'bg-blue-600/20 text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                {child.icon}
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        // Mobile: Standard Link
                        return (
                            <Link
                                key={idx}
                                to={navLink.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium transition-all ${location.pathname === navLink.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className={`flex shrink-0 ${location.pathname === navLink.path ? 'text-white' : 'text-blue-400/80'}`}>
                                    {navLink.icon}
                                </span>
                                {navLink.label}
                            </Link>
                        );
                    })}
                    
                    <div className="h-px bg-white/10 my-2 mx-4"></div>
                    
                    <Link 
                        to={profilePath} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium transition-all ${location.pathname === profilePath ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                    >
                        <User size={18} className={location.pathname === profilePath ? 'text-white' : 'text-blue-400/80'} /> 
                        My Profile
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