import React, { useState } from 'react';
import {
    LogIn, User, Eye, EyeOff, Linkedin, Github, 
    QrCode, Trophy, CheckCircle, Activity, 
    Battery, Wifi, Signal, Terminal, ScanLine, Server, Loader2, ChevronDown,
    Handshake, ShieldAlert, XCircle, X, Info, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import IARELogo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_BASE_URL;

// --- DATA ---
const teamMentor = {
    name: 'Dr. B Padmaja',
    role: 'Project Mentor',
    image: 'https://iare.irins.org/profile_images/217071.jpg',
};
const teamDevelopers = [
    { name: 'Burugu Sai Nitin', role: 'Full Stack Engineer', image: 'https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/23951A66F6/23951A66F6.jpg', linkedin: 'https://www.linkedin.com/in/burugu-sai-nitin/', github: 'https://github.com/Immnitin' },
    { name: 'Shaik Mohammad Azaruddin', role: 'Full Stack Engineer', image: 'https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/23951A66H8/23951A66H8.jpg', linkedin: 'https://www.linkedin.com/in/mohammadazaruddinshaik/', github: 'https://github.com/mohammadazaruddinshaik' },
    { name: 'Tavva Sandeep Kumar Reddy', role: 'Full Stack Engineer', image: 'https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/23951A66H0/23951A66H0.jpg', linkedin: 'https://www.linkedin.com/in/tavva-sandeep-kumar-rddy-705966355/', github: 'https://github.com/SandeepReddy100' },
];

// --- SUB-COMPONENTS ---

const DeveloperCard = ({ dev, isMentor = false }) => (
    <motion.div 
        whileHover={{ y: -8 }}
        className={`relative bg-white rounded-3xl p-1 z-10 overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 w-full max-w-sm mx-auto`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${isMentor ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-purple-600'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>
        <div className="bg-white rounded-[1.3rem] p-6 h-full flex flex-col items-center text-center relative z-10 border border-gray-100">
            <div className="relative mb-4">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${isMentor ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
                <img src={dev.image} alt={dev.name} className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-50 shadow-md group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{dev.name}</h3>
            <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6 ${isMentor ? 'text-amber-600' : 'text-blue-600'}`}>{dev.role}</p>
            {!isMentor && (
                <div className="flex gap-4 mt-auto">
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-white hover:bg-[#0077b5] transition-all duration-300"><Linkedin size={16} /></a>
                    <a href={dev.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-white hover:bg-[#333] transition-all duration-300"><Github size={16} /></a>
                </div>
            )}
        </div>
    </motion.div>
);

// --- FORGOT PASSWORD MODAL ---
const ForgotPasswordModal = ({ isOpen, onClose }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                {/* Modal Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header Strip - REMOVED ICON, KEPT CLEAN NOTICE */}
                    <div className="bg-gray-900 p-6 flex justify-between items-center relative">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Important Notice</h3>
                            <p className="text-gray-400 text-xs mt-1">Password Reset Procedure</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-white transition-colors bg-white/10 rounded-full p-2"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        <div className="flex gap-4">
                            <div className="bg-blue-50 p-3 rounded-full h-fit">
                                <Building2 className="text-blue-600 w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-gray-900 font-bold text-base">Contact Administration</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    For security purposes, please visit the <strong>CDC Administration</strong> or contact your <strong>Faculty Coordinator</strong> in person.
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs text-amber-800 font-medium flex items-center gap-2">
                                <Info size={14} />
                                Note: Bring your Student ID Card for verification.
                            </p>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// --- CYBER MASCOT ---
const CyberMascot = ({ mode }) => {
    return (
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
            {/* Robot Head */}
            <motion.div 
                className="w-20 h-16 md:w-24 md:h-20 bg-gradient-to-b from-gray-200 to-white rounded-3xl border-4 border-gray-300 shadow-xl relative overflow-hidden z-10 flex items-center justify-center gap-3 md:gap-4"
                animate={{ y: mode === 'password' ? 5 : 0 }}
            >
                <div className="flex gap-2 md:gap-3 relative z-0">
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-800 rounded-full relative overflow-hidden">
                        <motion.div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full absolute top-1 left-1" animate={{ x: mode === 'username' ? [0, 2, -2, 0] : 0, y: mode === 'username' ? [0, 1, 0] : 0 }} transition={{ repeat: Infinity, duration: 2 }}/>
                    </div>
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-800 rounded-full relative overflow-hidden">
                        <motion.div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full absolute top-1 left-1" animate={{ x: mode === 'username' ? [0, 2, -2, 0] : 0, y: mode === 'username' ? [0, 1, 0] : 0 }} transition={{ repeat: Infinity, duration: 2 }}/>
                    </div>
                </div>
                <div className="absolute bottom-3 md:bottom-4 w-4 h-1 bg-gray-300 rounded-full opacity-50"></div>
            </motion.div>

            {/* Hands */}
            <motion.div className="absolute w-6 h-8 md:w-8 md:h-10 bg-gray-300 rounded-full border-2 border-white shadow-lg z-20" initial={{ bottom: -20, left: 10, rotate: -20 }} animate={mode === 'password' ? { bottom: 40, left: 20, rotate: 0 } : { bottom: -10, left: 5, rotate: -20 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}/>
            <motion.div className="absolute w-6 h-8 md:w-8 md:h-10 bg-gray-300 rounded-full border-2 border-white shadow-lg z-20" initial={{ bottom: -20, right: 10, rotate: 20 }} animate={mode === 'password' ? { bottom: 40, right: 20, rotate: 0 } : { bottom: -10, right: 5, rotate: 20 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}/>
        </div>
    );
};

const MockPhoneScreen = ({ activeField }) => (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-[#0a0a0a] to-black font-sans w-full h-full overflow-hidden">
        
        {/* iOS-style Status Bar */}
        <div className="px-5 pt-4 flex justify-between items-center z-50 absolute top-0 left-0 right-0">
            <span className="text-[9px] text-white font-semibold tracking-wider">9:41</span>
            <div className="flex gap-1 items-center">
                <Signal size={9} className="text-white"/>
                <Wifi size={9} className="text-white"/>
                <Battery size={12} className="text-white"/>
            </div>
        </div>

        <div className="flex-1 relative flex flex-col h-full">
            <AnimatePresence mode="wait">
                {(activeField === 'username' || activeField === 'password') && (
                    // --- INPUT MODE ---
                    <motion.div 
                        key="mascot"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 bg-gray-100"
                    >
                         <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        <CyberMascot mode={activeField} />
                        <div className="mt-8 text-center relative z-10">
                            <h3 className="text-gray-800 font-bold text-lg">{activeField === 'username' ? 'Identifying User' : 'Security Mode'}</h3>
                            <p className="text-gray-500 text-xs mt-1">{activeField === 'username' ? 'Please enter your username' : 'Credentials hidden for privacy'}</p>
                        </div>
                    </motion.div>
                )}

                {activeField === 'loading' && (
                    // --- LOADING ---
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 bg-[#0a0a0a]"
                    >
                        <div className="relative mb-6">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 border-t-2 border-l-2 border-blue-500 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Server className="text-blue-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-lg">Authenticating</h3>
                        <p className="text-gray-500 text-xs mt-1 animate-pulse">Connecting to server...</p>
                    </motion.div>
                )}

                {activeField === 'success' && (
                    // --- SUCCESS (HANDSHAKE) ---
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 bg-gradient-to-br from-green-900 to-black"
                    >
                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                            <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                            />
                            <div className="relative z-10 bg-green-500/10 p-6 rounded-full border border-green-500/30">
                                <Handshake className="text-green-400 w-16 h-16" />
                            </div>
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                            >
                                <CheckCircle className="text-green-600 w-6 h-6 fill-green-100" />
                            </motion.div>
                        </div>
                        <h3 className="text-white font-bold text-xl tracking-tight">Access Granted</h3>
                    </motion.div>
                )}

                {activeField === 'error' && (
                    // --- FAILURE (REJECTED HANDSHAKE) ---
                    <motion.div 
                        key="error"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 bg-gradient-to-br from-red-950 to-black"
                    >
                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center animate-shake">
                            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl" />
                            <div className="relative z-10 bg-red-500/10 p-6 rounded-full border border-red-500/30 grayscale">
                                <Handshake className="text-red-400 w-16 h-16 opacity-50" />
                            </div>
                            
                            {/* REJECTION OVERLAY */}
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                className="absolute inset-0 flex items-center justify-center z-20"
                            >
                                <XCircle className="text-red-500 w-24 h-24 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                            </motion.div>
                        </div>
                        <h3 className="text-white font-bold text-xl tracking-tight">Access Denied</h3>
                        <p className="text-red-400 text-xs mt-2 font-medium">Verification Failed</p>
                    </motion.div>
                )}

                {!activeField && (
                    // --- DASHBOARD ---
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col p-5 pt-14"
                    >
                        {/* Header: JUST Hi Student */}
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-white text-2xl font-bold tracking-tight">Hi, Student</h2>
                                <p className="text-gray-400 text-[10px] font-medium mt-1">CSE (AI & ML) • Sem 6</p>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md shadow-lg">
                                <User size={16} className="text-white"/>
                            </div>
                        </div>

                        {/* 1. COMPACT QR SCANNER */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-blue-900/30 mb-4 cursor-pointer hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <QrCode className="text-white" size={20}/>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Scan QR Code</div>
                                </div>
                            </div>
                            <ScanLine className="text-white/50" size={16}/>
                        </div>

                        {/* 2. STATS GRID (Labels Above) */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[#1a1f2e]/80 p-3 rounded-2xl border border-white/5 backdrop-blur-md flex flex-col justify-between h-20">
                                <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">Attendance</span>
                                <div className="flex justify-between items-end">
                                    <div className="text-2xl font-bold text-white leading-none">92<span className="text-xs text-gray-500 font-medium">%</span></div>
                                    <div className="bg-green-500/20 text-green-400 p-1 rounded-md"><CheckCircle size={12}/></div>
                                </div>
                            </div>
                            
                            <div className="bg-[#1a1f2e]/80 p-3 rounded-2xl border border-white/5 backdrop-blur-md flex flex-col justify-between h-20">
                                <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">Rank</span>
                                <div className="flex justify-between items-end">
                                    <div className="text-2xl font-bold text-white leading-none">#05</div>
                                    <div className="bg-amber-500/20 text-amber-400 p-1 rounded-md"><Trophy size={12}/></div>
                                </div>
                            </div>
                        </div>

                        {/* 3. LEADERBOARD */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4 backdrop-blur-sm flex-1">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <Trophy size={14} className="text-amber-400" />
                                    <span className="text-gray-300 font-bold text-xs uppercase">Leaderboard</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[9px] font-bold text-black shadow-lg shadow-amber-500/50">1</div>
                                    <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400 w-[92%]"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-amber-400">2040</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-[9px] font-bold text-black">2</div>
                                    <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-gray-400 w-[85%]"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-400">1850</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-orange-700 rounded-full flex items-center justify-center text-[9px] font-bold text-white">3</div>
                                    <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-700 w-[78%]"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-orange-700">1620</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. COURSE */}
                        <div className="mt-auto bg-[#1a1f2e]/60 rounded-2xl p-3 border border-white/5 flex items-center gap-3 backdrop-blur-md">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-cyan-300 border border-white/5">
                                <Terminal size={14} />
                            </div>
                            <div>
                                <div className="text-white text-[10px] font-bold">Competitive Programming</div>
                                <div className="text-gray-400 text-[9px]">Active • Sem 6</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
);


// --- MAIN PAGE ---

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeField, setActiveField] = useState(null); 
    const [showForgotModal, setShowForgotModal] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        
        setIsLoading(true);
        setActiveField('loading'); 

        // 2 Second Artificial Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: "include"
            });
            const data = await response.json();
            
            if (response.ok) {
                // Success Handshake
                setActiveField('success');
                sessionStorage.setItem("userIdentifier", username.toUpperCase());
                sessionStorage.setItem("userRole", data.role);
                
                setTimeout(() => {
                    switch (data.role) {
                        case 'admin': navigate('/admin/dashboard'); break;
                        case 'faculty': navigate('/faculty/dashboard'); break;
                        case 'student': navigate('/student/dashboard'); break;
                        default: setError("Login successful, but role is unknown."); break;
                    }
                }, 1500);
            } else {
                // Error / Access Denied Visuals
                setError(data.message || 'Login failed.');
                setActiveField('error');
                setIsLoading(false);
                setTimeout(() => { setActiveField(null); }, 2500);
            }
        } catch (err) {
            console.error('Login request failed:', err);
            setError('Network error. Please try again.');
            setActiveField('error');
            setIsLoading(false);
            setTimeout(() => { setActiveField(null); }, 2500);
        }
    };

    const scrollToTeam = () => {
        document.getElementById('meet-team').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] font-inter text-gray-800 overflow-x-hidden selection:bg-blue-200">
            <style>{`html { scroll-behavior: smooth; }`}</style>
            
            {/* Modal */}
            <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />

            <div className="flex flex-col lg:flex-row min-h-screen relative">
                
                {/* LEFT SIDE: 3D PHONE VISUAL (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-center items-center text-white p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#0B0F19] to-[#0B0F19] z-0"></div>
                    <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                    
                    <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                        <div className="mb-14 text-center">
                            <h1 className="text-5xl font-extrabold mb-4 leading-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Empowering</span> <span className="text-white">Campus</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Life.</span>
                            </h1>
                            <p className="text-base text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                                Next-gen academic management for the leaders of tomorrow.
                            </p>
                        </div>

                        {/* 3D FLOATING PHONE CONTAINER */}
                        <div className="relative w-[260px] h-[530px]" style={{ perspective: '1200px' }}>
                            <motion.div 
                                animate={{ 
                                    rotateY: 20, 
                                    rotateX: 5,
                                    y: [0, -15, 0] 
                                }}
                                transition={{ 
                                    rotateY: { type: "spring", stiffness: 50 },
                                    rotateX: { type: "spring", stiffness: 50 },
                                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="w-full h-full bg-[#121212] rounded-[2.5rem] p-2 shadow-[40px_20px_60px_-15px_rgba(0,0,0,0.7)] border-[6px] border-[#1f1f1f] ring-1 ring-white/20 relative"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 pointer-events-none border border-gray-800/50 shadow-md"></div>
                                <div className="w-full h-full rounded-[2.0rem] overflow-hidden relative bg-black shadow-inner">
                                    <MockPhoneScreen activeField={activeField} />
                                </div>
                                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-50"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: FORM */}
                <div className="w-full lg:w-[55%] bg-[#F8FAFC] lg:rounded-l-[5rem] flex flex-col justify-start pt-24 lg:pt-0 lg:justify-center items-center p-6 lg:p-12 relative z-20 shadow-[-40px_0_100px_rgba(0,0,0,0.4)] min-h-screen">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none lg:rounded-l-[5rem]"></div>

                    <div className="w-full max-w-sm relative z-10 flex flex-col h-full lg:justify-center">
                        {/* Logo */}
                        <div className="mb-8 md:mb-10 flex justify-center lg:justify-start">
                            <motion.img 
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                src={IARELogo} 
                                alt="IARE" 
                                className="h-16 md:h-20 w-auto drop-shadow-xl" 
                            />
                        </div>

                        <div className="mb-6 md:mb-8 text-center lg:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Sign In</h1>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Welcome back. Please enter your details.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                            {/* Username Input - COMPACT */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setActiveField('username')}
                                        onBlur={() => setActiveField(null)}
                                        className="w-full bg-white border-2 border-gray-100 rounded-full py-3 md:py-4 pl-12 pr-6 text-sm md:text-base text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-500/10 transition-all outline-none"
                                        placeholder="Enter Username"
                                    />
                                </div>
                            </div>

                            {/* Password Input - COMPACT & NO PASTE */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setActiveField('password')}
                                        onBlur={() => setActiveField(null)}
                                        onPaste={(e) => { e.preventDefault(); return false; }}
                                        onCopy={(e) => { e.preventDefault(); return false; }}
                                        className="w-full bg-white border-2 border-gray-100 rounded-full py-3 md:py-4 pl-6 pr-12 text-sm md:text-base text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-500/10 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: 'auto', opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        className="text-red-500 text-xs md:text-sm font-bold bg-red-50 px-4 py-3 rounded-xl text-center shadow-sm border border-red-100"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-end px-2">
                                <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs md:text-sm font-bold text-blue-600 hover:text-purple-600 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button - SMALLER ON MOBILE */}
                            <motion.button 
                                whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.5)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white text-lg md:text-xl font-bold py-3.5 md:py-5 rounded-full shadow-2xl shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <LogIn size={20} />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Meet The Team Indicator */}
                        <div className="mt-8 md:mt-12 flex justify-center">
                            <motion.div 
                                onClick={scrollToTeam}
                                className="flex flex-col items-center cursor-pointer group p-4"
                                whileHover={{ y: 5 }}
                            >
                                <span className="text-xs md:text-sm font-black text-gray-400 group-hover:text-blue-600 transition-colors tracking-[0.2em] uppercase mb-2">Meet The Team</span>
                                <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-gray-300 group-hover:text-blue-600 animate-bounce" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MEET THE TEAM (Below Fold) */}
            <div id="meet-team" className="bg-[#F1F5F9] py-24 px-6 relative z-30 border-t border-gray-200 min-h-screen flex items-center">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">MEET THE TEAM</h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mt-4"></div>
                    </div>

                    <div className="flex flex-col gap-12">
                        <div className="flex justify-center">
                            <div className="w-full max-w-sm">
                                <DeveloperCard dev={teamMentor} isMentor={true} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {teamDevelopers.map((dev, index) => (
                                <DeveloperCard key={index} dev={dev} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;