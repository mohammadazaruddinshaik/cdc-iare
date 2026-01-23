import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Moon, Sun, Check, ShieldAlert, 
    MousePointer2, Maximize2, FileText, 
    ChevronRight, Clock, ArrowRight, 
    Calendar, Timer, Hash 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CSS UTILS ---
const styles = `
    .glass-panel {
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

// --- 1. DYNAMIC GRID BACKGROUND ---
const GridBackground = ({ activeMode }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700 bg-white z-0">
            {/* Dark Mode BG */}
            <motion.div 
                animate={{ opacity: activeMode === 'dark' ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-[#0B1121]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)]" />
                <div className="absolute inset-0" 
                     style={{ 
                         backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
                         backgroundSize: '40px 40px',
                         maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)' 
                     }} 
                />
            </motion.div>

            {/* Light Mode BG */}
            <motion.div 
                animate={{ opacity: activeMode === 'light' ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-white" 
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_70%)]" />
                <div className="absolute inset-0" 
                     style={{ 
                         backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)', 
                         backgroundSize: '40px 40px',
                         maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
                     }} 
                />
            </motion.div>
        </div>
    );
};

// --- 2. THEME CARD ---
const ThemeCard = ({ mode, icon: Icon, title, sub, onSelect }) => {
    const isDark = mode === 'dark';
    return (
        <motion.button
            onClick={(e) => onSelect(mode, e)}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                group relative w-full md:w-80 h-96 rounded-3xl border text-left p-8 overflow-hidden transition-all duration-300
                flex flex-col justify-between
                ${isDark 
                    ? 'bg-slate-900/60 border-slate-700 hover:border-blue-500 hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.3)]' 
                    : 'bg-white/90 border-slate-200 hover:border-blue-600 hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.15)]'
                }
                backdrop-blur-md
            `}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300
                ${isDark 
                    ? 'bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' 
                    : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-sm'
                }
            `}>
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className={`text-3xl font-bold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {title}
                </h3>
                <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {sub}
                </p>
            </div>
            <div className={`absolute bottom-8 right-8 transition-all duration-300 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100
                ${isDark ? 'text-blue-400' : 'text-blue-600'}
            `}>
                <ArrowRight size={24} />
            </div>
        </motion.button>
    );
};

// --- 3. MAIN COMPONENT ---
const QuizInstructions = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // [SECURITY 1] State Guard
    // Checks if valid session data exists. If not, kicks user to Home/Join page.
    // This prevents direct URL access or page reloads.
    useEffect(() => {
        if (!location.state || !location.state.session) {
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    // RETRIEVE DATA
    const apiData = location.state || {};
    const sessionData = apiData.session || {};
    
    // State
    const [step, setStep] = useState(1);
    const [selectedTheme, setSelectedTheme] = useState('light'); 
    const [hoveredTheme, setHoveredTheme] = useState(null); 
    const [sliderVal, setSliderVal] = useState(0);
    const [clipPath, setClipPath] = useState('circle(0% at 50% 50%)');

    const handleThemeSelect = (mode, e) => {
        const x = e.clientX; 
        const y = e.clientY; 
        
        setSelectedTheme(mode);
        setClipPath(`circle(0% at ${x}px ${y}px)`);
        
        setTimeout(() => {
            setStep(2);
            setClipPath(`circle(150% at ${x}px ${y}px)`);
        }, 50);
    };

    // --- SECURITY CRITICAL SECTION ---
    const handleLaunch = () => {
        const accentColor = selectedTheme === 'light' ? '#2563EB' : '#6366f1';
        
        // PASS DATA TO ACTIVE PAGE WITH 'replace: true'
        // This destroys the 'Instructions' page from history.
        // Hitting 'Back' from the quiz will skip this page entirely.
        navigate('/student/quiz/active', { 
            state: { 
                ...apiData, 
                theme: selectedTheme, 
                accent: accentColor,
                _security_startTime: Date.now() // Optional: Track start time
            },
            replace: true // <--- THIS IS THE KEY SECURITY FIX
        });
    };

    const handleSlider = (e) => {
        const val = parseInt(e.target.value);
        setSliderVal(val);
        if(val > 95) handleLaunch();
    };

    // If security check fails, don't render anything (prevents flash)
    if (!location.state || !location.state.session) return null;

    const isDark = selectedTheme === 'dark';
    
    // Formatters
    const formatDate = (isoStr) => {
        if(!isoStr) return 'TBD';
        return new Date(isoStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (isoStr) => {
        if(!isoStr) return '--:--';
        return new Date(isoStr).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const rules = [
        { icon: Clock, title: "Timed Assessment", desc: "Timer starts immediately." },
        { icon: Maximize2, title: "Fullscreen Only", desc: "Do not exit fullscreen." },
        { icon: MousePointer2, title: "Focus Tracking", desc: "Tab switching is logged." },
        { icon: ShieldAlert, title: "Secure Environment", desc: "Copy/Paste disabled." },
    ];

    return (
        <div className={`relative w-full h-screen overflow-hidden font-sans selection:bg-blue-500 selection:text-white`}>
            <style>{styles}</style>
            
            <GridBackground activeMode={step === 1 ? (hoveredTheme || 'light') : selectedTheme} />

            <AnimatePresence mode="wait">
                
                {/* --- STEP 1: THEME SELECTION --- */}
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 flex flex-col items-center justify-center h-full px-4"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
                                System Preference
                            </span>
                            <h1 className={`text-5xl md:text-6xl font-black tracking-tight mb-4
                                ${hoveredTheme === 'dark' ? 'text-white' : 'text-slate-900'} transition-colors duration-500
                            `}>
                                Choose Interface
                            </h1>
                        </motion.div>

                        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                            <div onMouseEnter={() => setHoveredTheme('light')} onMouseLeave={() => setHoveredTheme(null)}>
                                <ThemeCard mode="light" icon={Sun} title="Light Mode" sub="High contrast. Professional Blue accents." onSelect={handleThemeSelect} />
                            </div>
                            <div onMouseEnter={() => setHoveredTheme('dark')} onMouseLeave={() => setHoveredTheme(null)}>
                                <ThemeCard mode="dark" icon={Moon} title="Midnight" sub="Deep immersion. Reduced eye strain for focus." onSelect={handleThemeSelect} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- STEP 2: RULES & INFO --- */}
                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ clipPath: clipPath }}
                        animate={{ clipPath: `circle(150% at 50% 50%)` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`absolute inset-0 z-20 flex items-center justify-center
                            ${isDark ? 'bg-[#0B1121]' : 'bg-white'}
                        `}
                    >
                        {/* Inner Grid */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none" 
                             style={{ 
                                 backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.1)'} 1px, transparent 1px)`, 
                                 backgroundSize: '40px 40px'
                             }} 
                        />

                        <div className="w-full max-w-2xl px-6 py-8 relative z-30 overflow-y-auto max-h-screen no-scrollbar">
                            
                            {/* --- HEADER --- */}
                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-current/10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        
                                    </div>
                                    <h2 className={`text-3xl md:text-4xl font-black tracking-tight leading-none mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {sessionData.title || "Untitled Session"}
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Review the parameters below before initiating.
                                    </p>
                                </div>
                            </div>

                            {/* --- STRUCTURED SCHEDULE BOX --- */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-8 rounded-2xl border overflow-hidden
                                    ${isDark 
                                        ? 'bg-slate-800/40 border-slate-700' 
                                        : 'bg-white border-slate-200 shadow-sm'
                                    }`}
                            >
                                {/* Box Header */}
                                <div className={`px-5 py-3 border-b flex items-center gap-2
                                    ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}
                                `}>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Information
                                    </span>
                                </div>

                                {/* Box Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-current/10">
                                    {/* 1. DATE */}
                                    <div className={`p-5 flex flex-col items-center justify-center text-center ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                        <div className={`mb-2 p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date</span>
                                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDate(sessionData.startTime)}</span>
                                    </div>
                                    {/* 2. TIME */}
                                    <div className={`p-5 flex flex-col items-center justify-center text-center ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                        <div className={`mb-2 p-2 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                            <Clock size={20} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Window</span>
                                        <div className={`font-mono text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatTime(sessionData.startTime)} - {formatTime(sessionData.endTime)}</div>
                                    </div>
                                    {/* 3. DURATION */}
                                    <div className={`p-5 flex flex-col items-center justify-center text-center ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                        <div className={`mb-2 p-2 rounded-lg ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                                            <Timer size={20} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Duration</span>
                                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{sessionData.durationMinutes || 0} Min</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Rules Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                                {rules.map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        className={`p-4 rounded-xl border flex items-start gap-4 transition-transform hover:scale-[1.02]
                                            ${isDark 
                                                ? 'bg-slate-800/30 border-slate-700' 
                                                : 'bg-white border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <div className={`mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                                            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Slider Button */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className={`relative h-16 rounded-full overflow-hidden border transition-all
                                    ${isDark 
                                        ? 'bg-slate-900 border-slate-700 shadow-inner' 
                                        : 'bg-white border-slate-200 shadow-inner'}
                                `}>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <span className={`text-xs font-black uppercase tracking-[0.2em] transition-opacity
                                            ${sliderVal > 30 ? 'opacity-0' : 'opacity-40'}
                                            ${isDark ? 'text-white' : 'text-slate-400'}
                                        `}>
                                            Slide to Start
                                        </span>
                                    </div>
                                    <div className={`absolute inset-y-0 left-0 transition-none bg-blue-600/20`} style={{ width: `${sliderVal}%` }} />
                                    <input type="range" min="0" max="100" value={sliderVal} onChange={handleSlider} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
                                    <div 
                                        className={`absolute top-1.5 bottom-1.5 w-14 rounded-full flex items-center justify-center pointer-events-none z-20 transition-transform ease-out
                                            bg-blue-600 text-white shadow-lg shadow-blue-500/30
                                        `}
                                        style={{ 
                                            left: `calc(${sliderVal}% - ${sliderVal * 0.45}px + 6px)`,
                                            transform: `translateX(-${sliderVal}%)` 
                                        }}
                                    >
                                        {sliderVal > 90 ? <Check size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizInstructions;