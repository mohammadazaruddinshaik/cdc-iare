import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, GraduationCap, Briefcase, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BASE_URL;

// Slideshow data tailored for IARE
const slideshowData = [
    {
        id: 1,
        icon: <GraduationCap className="h-8 w-8 text-white" />,
        title: "Academic Excellence",
        subtitle: "The IARE Advantage",
        description: "Committed to nurturing innovative minds, IARE provides a world-class academic environment with cutting-edge resources and a focus on hands-on learning.",
        gradient: "from-blue-600 via-cyan-600 to-teal-500",
    },
    {
        id: 2,
        icon: <Briefcase className="h-8 w-8 text-white" />,
        title: "Robust Placements",
        subtitle: "Your Career Starts Here",
        description: "Our dedicated Career Development Center ensures high placement rates, connecting students with top-tier companies across various industries.",
        gradient: "from-purple-600 via-pink-600 to-red-500",
    },
    {
        id: 3,
        icon: <BarChart3 className="h-8 w-8 text-white" />,
        title: "Strategic Partnerships",
        subtitle: "Shaping Future Leaders",
        description: "IARE's strong industry collaborations and MoUs with leading corporations provide students with invaluable real-world experience and professional networking opportunities.",
        gradient: "from-orange-600 via-amber-600 to-yellow-500",
    },
];

/**
 * Slide Component with animations using framer-motion
 */
const SlideComponent = ({ slide, isActive }) => (
    <AnimatePresence mode="wait">
        {isActive && (
            <motion.div
                key={slide.id}
                className="h-full flex flex-col justify-center text-white relative z-10"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* Floating Icon */}
                <motion.div
                    className={`w-20 h-20 bg-gradient-to-br ${slide.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
                >
                    {slide.icon}
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h3 className="text-sm font-medium text-gray-300 mb-2 tracking-wide uppercase">
                        {slide.subtitle}
                    </h3>
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        {slide.title}
                    </h2>
                    <p className="text-lg text-gray-200/90 leading-relaxed">
                        {slide.description}
                    </p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

/**
 * Progress Indicator Component
 */
const ProgressIndicator = ({ slides, currentSlide, onSlideChange }) => (
    <div className="flex space-x-3 justify-center mt-8 relative z-10">
        {slides.map((_, index) => (
            <motion.button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
                onClick={() => onSlideChange(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
            />
        ))}
    </div>
);

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const navigate = useNavigate();
    
    // Auto-advance slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slideshowData.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: "include"
            });
            
            const data = await response.json();
            const role = data.role;
            if (response.ok) {
                localStorage.setItem("userIdentifier", username.toUpperCase());
                localStorage.setItem("userRole", role); 
                switch (role) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'faculty':
                        navigate('/faculty/dashboard');
                        break;
                    case 'student':
                        navigate('/student/dashboard');
                        break;
                    default:
                        // Fallback for an unexpected role
                        setError("Login successful, but role is unknown.");
                        break;
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login request failed:', err);
            setError('An error occurred. Please check your network and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-inter text-gray-200 bg-gray-900 relative overflow-hidden">
            {/* Background elements for glass-morphism */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            
            {/* Main container with glass-morphic effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full lg:grid lg:grid-cols-2 lg:h-[80vh] lg:max-w-7xl lg:rounded-3xl lg:overflow-hidden relative z-10 shadow-2xl bg-white/10 backdrop-filter backdrop-blur-3xl border border-white/20"
            >
                {/* Left Column: Slideshow */}
                <div className="hidden lg:flex items-center justify-center p-12 relative overflow-hidden">
                    {/* Dark gradient for the left panel */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div>
                    <div className="relative z-10 w-full max-w-lg">
                        <div className="relative h-96 mb-8">
                            {slideshowData.map((slide, index) => (
                                <div key={slide.id} className="absolute inset-0">
                                    <SlideComponent
                                        slide={slide}
                                        isActive={index === currentSlide}
                                    />
                                </div>
                            ))}
                        </div>
                        <ProgressIndicator
                            slides={slideshowData}
                            currentSlide={currentSlide}
                            onSlideChange={setCurrentSlide}
                        />
                    </div>
                </div>

                {/* Right Column: Login Form */}
                <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="w-full max-w-sm space-y-8"
                    >
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <img
                                src="https://www.iare.ac.in/sites/default/files/design_templates/IARE_Logo_Academic.png"
                                alt="IARE Academic Logo"
                                className="h-16 md:h-20 w-auto"
                            />
                        </div>
                        
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            Sign in to your account
                        </h2>
                        
                        <form onSubmit={handleLogin} className="mt-8 space-y-6">
                            {/* Username Input with Icon */}
                            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                                <label htmlFor="username" className="sr-only">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                                        placeholder="Enter your username"
                                        disabled={isLoading}
                                    />
                                </div>
                            </motion.div>
                            
                            {/* Password Input with Icon */}
                            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                </div>
                            </motion.div>

                            {error && <p className="text-red-400 text-sm text-center pt-2 animate-pulse">{error}</p>}
                            
                            {/* Login Button with Loading State */}
                            <motion.button
                                type="submit"
                                className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Logging in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <LogIn className="w-5 h-5" />
                                        <span>Login</span>
                                    </div>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
            
            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;

