import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    User, LogOut, Menu, X, ChevronDown, ShieldCheck, 
    LayoutDashboard, Trophy, CalendarDays, ClipboardCheck, FileClock, 
    Inbox as InboxIcon, Megaphone, CalendarRange, Code2, 
    ListOrdered, Puzzle, Radio, ScanLine, History, Clock,Timer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import IARELogo from '../assets/logo.png';

const Header = ({ animate, qrCode }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // UI States
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    
    // --- SMART QR CACHING LOGIC ---
    const [activeQR, setActiveQR] = useState(null);

    useEffect(() => {
        if (qrCode) {
            setActiveQR(qrCode);
            localStorage.setItem('cachedStudentQR', qrCode);
        } else {
            const cached = localStorage.getItem('cachedStudentQR');
            if (cached) setActiveQR(cached);
        }
    }, [qrCode]);

    // Lock Body Scroll when Mobile Menu is Open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // Close menu on navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        setImgError(false);
    }, [user]);

    // Data Parsing
    const displayName = user?.username || 'Guest';
    const displayRole = user?.role ? user.role.toUpperCase() : 'VISITOR';
    
    // Navigation Config
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
            { path: '/faculty/students', label: 'Attendance', icon: <History size={iconSize} /> },
         ]
    } else if (user?.role === 'student') {
        dashboardPath = '/student/dashboard';
        profilePath = '/student/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },
            { path: '/leaderboard', label: 'Leaderboard', icon: <ListOrdered size={iconSize} /> },
            { path: '/timetable', label: 'Schedule', icon: <Timer size={iconSize} /> },            
            { path: '/logs', label: 'Logs', icon: <History size={18} />, primary: true },
            { path: '/inbox', label: 'Inbox', icon: <InboxIcon size={iconSize} /> },
        ];
    } else if (user?.role === 'admin') {
        dashboardPath = '/admin/dashboard';
        profilePath = '/admin/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },
            { path: '/leaderboard', label: 'Leaderboard', icon: <ListOrdered size={iconSize} /> },
            { path: '/admin/timetable', label: 'Schedules', icon: <CalendarDays size={iconSize} /> },
            { path: '/admin/attendance', label: 'Attendance', icon: <History size={iconSize} /> },
            { path: '/admin/announcements', label: 'Notices', icon: <Megaphone size={iconSize} /> },
        ];
    }

    const handleLogout = () => {
        logout();
        localStorage.removeItem('cachedStudentQR'); 
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const handleProfileNavigate = () => {
        setIsProfileDropdownOpen(false); 
        navigate(profilePath);
    };

    const isParentActive = (children) => children.some(child => location.pathname === child.path);
    
    // Check if we are currently on the profile page
    const isProfileActive = location.pathname === profilePath;

    const profileImageUrl = (user?.role === 'student' && user?.username) 
        ? `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${user.username.toUpperCase()}/${user.username.toUpperCase()}.jpg`
        : null;

    
    return (
        <header className="relative z-[100] py-4 w-full">
            <div className="flex items-center justify-between px-4 lg:px-0">
                
                {/* --- LEFT: Logo & Desktop Nav --- */}
                <div className="flex items-center gap-6 xl:gap-8">
                    <div className={`transform transition-all duration-700 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <Link to={dashboardPath} className="block group">
                            <img src={IARELogo} alt="IARE" className="h-12 w-auto object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={`hidden lg:flex items-center gap-8 transform transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                        {navLinks.map((link, idx) => {
                            
                            if (link.children) {
                                const isActive = isParentActive(link.children);
                                return (
                                    <div key={idx} className="relative group">
                                        <button className={`relative py-2 text-sm tracking-wide transition-colors flex items-center gap-2 ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}>
                                            <span className={`transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>{link.icon}</span>
                                            {link.label}
                                            <ChevronDown size={14} className={`transition-transform duration-300 group-hover:rotate-180 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                                            <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                        </button>
                                        <div className="absolute top-full left-0 pt-4 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 ease-out">
                                            <div className="bg-[#0F172A] rounded-xl shadow-2xl border border-white/10 overflow-hidden ring-1 ring-black/50 p-2">
                                                {link.children.map((child, cIdx) => (
                                                    <Link key={cIdx} to={child.path} className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${location.pathname === child.path ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                                                        {child.icon}{child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            const isActive = location.pathname === link.path;
                            return (
                                <Link 
                                    key={link.path} 
                                    to={link.path} 
                                    className={`relative group py-2 text-sm tracking-wide transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>{link.icon}</span>
                                        {link.label}
                                    </span>
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* --- RIGHT: Profile & Actions --- */}
                <div className="flex items-center gap-3 lg:gap-5">
                    
                    {/* Mobile Toggle Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden relative group p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <span className="sr-only">Open Menu</span>
                        <div className="flex flex-col gap-1.5 items-end">
                            <span className="w-6 h-0.5 bg-white group-hover:w-5 transition-all"></span>
                            <span className="w-4 h-0.5 bg-white/70 group-hover:w-6 transition-all"></span>
                        </div>
                    </button>

                    {/* Desktop Profile Wrapper */}
                    <div 
                        className="relative hidden lg:block"
                        onMouseEnter={() => setIsProfileDropdownOpen(true)}
                        onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    >
                        {/* Profile Trigger - Blended with Header */}
                        <div 
                            onClick={handleProfileNavigate}
                            className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full cursor-pointer transition-all duration-300 border backdrop-blur-md ${
                                isProfileDropdownOpen || isProfileActive
                                ? 'bg-white/10 border-white/20 shadow-lg' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                        >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-[#0a0f1c] shadow-md border border-white/10">
                                {profileImageUrl && !imgError ? (
                                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                                ) : <User className="w-5 h-5 text-white" />}
                            </div>
                            <div className="hidden lg:flex flex-col items-start">
                                <span className="text-xs font-bold text-white leading-tight tracking-wide">{displayName}</span>
                                <span className={`text-[10px] font-medium flex items-center gap-1 ${isProfileActive ? 'text-blue-300' : 'text-blue-300/80'}`}>{displayRole}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 hidden lg:block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* --- ENHANCED DROPDOWN MENU --- */}
                        <div className={`absolute top-full right-0 pt-3 w-80 origin-top-right transition-all duration-300 ease-out z-[999] ${isProfileDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>
                            <div className="bg-[#0f172a] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden ring-1 ring-white/5">
                                
                                {activeQR && user?.role === 'student' ? (
                                    // DIGITAL ID CARD MODE
                                    <div className="bg-[#0f172a] flex flex-col items-center pt-8 pb-6 relative overflow-hidden">
                                        
                                        {/* Background Glow */}
                                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
                                        
                                        {/* QR Container */}
                                        <div className="relative bg-white p-3 rounded-xl shadow-2xl mb-5 w-48 h-48 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group z-10 border-[3px] border-white">
                                            <img src={activeQR} alt="ID" className="w-full h-full object-contain mix-blend-multiply" />
                                            {/* Scanning Line Animation */}
                                        </div>

                                        <div className="z-10 text-center">
                                            <h3 className="text-white font-black text-xl tracking-tight">{displayName}</h3>
                                           
                                        </div>
                                        
                                        {/* Security Note */}
                                        <div className="mt-5 px-6 z-10 w-full">
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-center backdrop-blur-sm">
                                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                                    👉 Note: This QR code updates in real time for maximum security.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // STANDARD PROFILE MODE
                                    <div className="px-6 py-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10">
                                                {displayName.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-white font-bold text-base truncate">{displayName}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Footer Actions */}
                                <div className="p-2 bg-[#0a0f1c] border-t border-white/5">
                                    <Link to={profilePath} onClick={() => setIsProfileDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors ${isProfileActive ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                                        <User size={16} /> My Profile
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left">
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
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2.5 rounded-full border border-red-500/20 transition-all hover:scale-105"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================================================================
               🌟 SOLID FULLSCREEN MOBILE MENU 🌟
               ================================================================== */}
            <div 
                className={`lg:hidden fixed inset-0 z-[200] bg-[#050B14] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
            >
                {/* Ambient Glow Effects */}
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative h-full flex flex-col px-8 py-6">
                    
                    {/* Header: Logo & X */}
                    <div className="flex items-center justify-between mb-12">
                        <img src={IARELogo} alt="IARE" className="h-10 w-auto opacity-90" />
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 border border-white/5 transition-transform active:scale-90"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto">
                        <nav className="flex flex-col space-y-8">
                            {navLinks.map((navLink, idx) => {
                                if (navLink.label === 'Leaderboard') return null;

                                if (navLink.children) {
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`flex flex-col items-start w-full gap-4 transition-all duration-700 ease-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                                            style={{ transitionDelay: `${idx * 100}ms` }}
                                        >
                                            <div className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-1 opacity-80">
                                                {navLink.label}
                                            </div>
                                            {navLink.children.map((child, cIdx) => (
                                                <Link
                                                    key={cIdx}
                                                    to={child.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`text-3xl font-bold text-left transition-all duration-300 ${
                                                        location.pathname === child.path 
                                                        ? 'text-white' 
                                                        : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        to={navLink.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block text-4xl font-black tracking-tight text-left transition-all duration-700 ease-out group ${
                                            isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                                        } ${
                                            location.pathname === navLink.path 
                                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300' 
                                            : 'text-white/40 hover:text-white'
                                        }`}
                                        style={{ transitionDelay: `${idx * 100}ms` }}
                                    >
                                        {navLink.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Footer Actions - With Active Profile Highlight */}
                    <div 
                        className={`mt-auto pt-8 transition-all duration-1000 delay-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                    >
                        <div className="grid grid-cols-2 gap-4 bg-[#0a0f1c] rounded-3xl p-2 border border-white/5 shadow-2xl">
                            <Link 
                                to={profilePath} 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-colors active:scale-95 ${
                                    isProfileActive 
                                    ? 'bg-blue-600/20 border border-blue-500/20' 
                                    : 'hover:bg-white/5'
                                }`}
                            >
                                <User size={20} className={isProfileActive ? "text-blue-400 mb-1" : "text-gray-300 mb-1"} />
                                <span className={`text-sm font-bold ${isProfileActive ? "text-blue-400" : "text-gray-300"}`}>Profile</span>
                            </Link>
                            
                            <button
                                onClick={handleLogout}
                                className="flex flex-col items-center justify-center py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors active:scale-95"
                            >
                                <LogOut size={20} className="text-red-400 mb-1" />
                                <span className="text-sm font-bold text-red-400">Log Out</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;