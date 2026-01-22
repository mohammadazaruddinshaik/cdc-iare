import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
    Moon, Sun, Check, ShieldAlert, 
    Terminal, Cpu, Code2, 
    ChevronRight, Clock, ArrowRight, 
    Trophy, AlertOctagon, 
    MonitorX, Eye, Lock, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM IMPORTS ---
// Assuming these are in your standard project structure
import ErrorDisplay from '../../components/ErrorDisplay'; 
import { useNetworkStatus } from '../../hooks/Network';
import apiConfig from '../../api/axiosConfig'; 

// --- CSS UTILS ---
const styles = `
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 0; height: 0; }
`;

// --- HELPER: FORMAT DURATION ---
const getDurationString = (startStr, endStr) => {
    if (!startStr || !endStr) return "--";
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} Mins`;
};

// --- BACKGROUND COMPONENT ---
const GridBackground = ({ activeTheme }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700 bg-slate-50 z-0">
            {/* 1. MIDNIGHT THEME */}
            <motion.div 
                animate={{ opacity: activeTheme === 'midnight' ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' }} />
            </motion.div>

            {/* 2. DARK THEME */}
            <motion.div 
                animate={{ opacity: activeTheme === 'dark' ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-[#050505]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', maskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)' }} />
            </motion.div>

            {/* 3. LIGHT THEME */}
            <motion.div 
                animate={{ opacity: activeTheme === 'light' ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-slate-50" 
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_70%)]" />
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)' }} />
            </motion.div>
        </div>
    );
};

// --- THEME CARD COMPONENT ---
const ThemeCard = ({ id, activeTheme, icon: Icon, title, sub, onSelect }) => {
    const isMid = id === 'midnight';
    const isDark = id === 'dark';

    let bgClass = "bg-white/90 border-slate-200";
    let textClass = "text-slate-800";
    let subClass = "text-slate-500";
    let iconBg = "bg-indigo-50 text-indigo-600";
    let hoverBorder = "hover:border-indigo-600";

    if (isMid) {
        bgClass = "bg-[#0F172A]/80 border-white/10";
        textClass = "text-white";
        subClass = "text-slate-400";
        iconBg = "bg-white/5 text-indigo-300 border border-white/10";
        hoverBorder = "hover:border-indigo-500/50";
    } else if (isDark) {
        bgClass = "bg-[#171717]/90 border-neutral-800";
        textClass = "text-gray-100";
        subClass = "text-neutral-500";
        iconBg = "bg-neutral-800 text-white border border-neutral-700";
        hoverBorder = "hover:border-white/30";
    }

    return (
        <motion.button
            onClick={(e) => onSelect(id, e)}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                group relative w-full md:w-64 h-72 rounded-[1.5rem] border text-left p-6 overflow-hidden transition-all duration-300 flex flex-col justify-between backdrop-blur-xl
                ${bgClass} ${hoverBorder} hover:shadow-2xl
            `}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${iconBg} group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent`}>
                <Icon size={24} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className={`text-2xl font-black mb-2 tracking-tight ${textClass}`}>{title}</h3>
                <p className={`text-xs font-medium leading-relaxed ${subClass}`}>{sub}</p>
            </div>
            <div className={`absolute bottom-6 right-6 transition-all duration-300 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ${isMid || isDark ? 'text-white' : 'text-indigo-600'}`}>
                <ArrowRight size={20} />
            </div>
        </motion.button>
    );
};

// --- MAIN COMPONENT ---
const ContestInstructions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contestId } = useParams();
    const isOnline = useNetworkStatus(); // ⚡️ Network Check

    // 1. RECEIVE DATA
    const contestData = location.state?.contestData;

    // --- VALIDATION: REDIRECT IF NO DATA ---
    useEffect(() => {
        if (!contestData) {
            // Force user back to entry if they try to access this URL directly
            navigate('/student/dashboard', { replace: true });
        }
    }, [contestData, navigate]);

    // --- TRAP: PREVENT BACK NAVIGATION ---
    // This ensures they cannot go back to "Entry" page once here.
    useEffect(() => {
        // Push "current" state to history stack to create a buffer
        window.history.pushState(null, document.title, window.location.href);

        const handlePopState = (event) => {
            // If they hit back, push them forward again immediately
            window.history.pushState(null, document.title, window.location.href);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // State
    const [step, setStep] = useState(1);
    const [selectedTheme, setSelectedTheme] = useState('light'); 
    const [hoveredTheme, setHoveredTheme] = useState(null); 
    const [sliderVal, setSliderVal] = useState(0);
    const [clipPath, setClipPath] = useState('circle(0% at 50% 50%)');
    const [agreed, setAgreed] = useState(false);
    
    // Config
    const config = contestData ? {
        title: contestData.examName,
        durationStr: getDurationString(contestData.startTime, contestData.endTime),
        problems: contestData.problemsCount,
        score: contestData.problemsCount * 10,
    } : { title: "Loading..." };

    const handleThemeSelect = (themeId, e) => {
        const x = e.clientX; 
        const y = e.clientY; 
        setSelectedTheme(themeId);
        setClipPath(`circle(0% at ${x}px ${y}px)`);
        setTimeout(() => {
            setStep(2);
            setClipPath(`circle(150% at ${x}px ${y}px)`);
        }, 50);
    };

    const handleLaunch = async () => {
        if (!agreed) return;
        
        // ⚡️ NAVIGATION CHAIN PART 2
        // We replace 'Instructions' in the history with 'Dashboard'.
        // History Stack becomes: [ ...StudentDashboard, ContestDashboard ]
        // Result: Hitting 'Back' from Dashboard goes safely to StudentDashboard.
        
        navigate(`/contests/${contestId}/live`, { 
            state: { contestData: contestData, theme: selectedTheme },
            replace: true 
        });
    };

    const handleSlider = (e) => {
        if (!agreed) return;
        const val = parseInt(e.target.value);
        setSliderVal(val);
        if(val > 95) handleLaunch();
    };

    // ⚡️ OFFLINE RENDER
    if (!isOnline) {
        return <ErrorDisplay type="offline" />;
    }

    if (!contestData) return null; 

    // --- DYNAMIC STYLES BASED ON THEME ---
    const getThemeStyles = () => {
        switch(selectedTheme) {
            case 'midnight':
                return {
                    text: 'text-white',
                    subText: 'text-slate-400',
                    cardBg: 'bg-[#0F172A]/60',
                    cardBorder: 'border-white/10',
                    iconBg: 'bg-blue-500/10 text-blue-400',
                    accentColor: 'text-indigo-400',
                    divider: 'divide-white/5',
                    rulesBg: 'bg-red-500/5 border-red-500/10',
                    rulesText: 'text-red-200/70',
                    sliderTrack: 'bg-[#0F172A]',
                    sliderFill: 'bg-indigo-500/20'
                };
            case 'dark':
                return {
                    text: 'text-gray-100',
                    subText: 'text-neutral-500',
                    cardBg: 'bg-[#171717]/80',
                    cardBorder: 'border-neutral-800',
                    iconBg: 'bg-neutral-800 text-white',
                    accentColor: 'text-white',
                    divider: 'divide-neutral-800',
                    rulesBg: 'bg-red-900/10 border-red-900/20',
                    rulesText: 'text-red-400/70',
                    sliderTrack: 'bg-[#171717]',
                    sliderFill: 'bg-white/10'
                };
            default: // Light
                return {
                    text: 'text-slate-900',
                    subText: 'text-slate-500',
                    cardBg: 'bg-white',
                    cardBorder: 'border-slate-200 shadow-sm',
                    iconBg: 'bg-blue-50 text-blue-600',
                    accentColor: 'text-indigo-600',
                    divider: 'divide-current/5',
                    rulesBg: 'bg-red-50/50 border-red-100',
                    rulesText: 'text-red-900/70',
                    sliderTrack: 'bg-white shadow-inner',
                    sliderFill: 'bg-indigo-600/20'
                };
        }
    };

    const ts = getThemeStyles();
    const activeBgMode = step === 1 ? (hoveredTheme || 'light') : selectedTheme;

    return (
        <div className={`relative w-full h-screen overflow-hidden font-sans selection:bg-indigo-500 selection:text-white`}>
            <style>{styles}</style>
            
            <GridBackground activeTheme={activeBgMode} />

            <AnimatePresence mode="wait">
                {/* --- STEP 1: THEME SELECTION --- */}
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 flex flex-col items-center justify-center h-full px-4"
                    >
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                            <span className="inline-block py-1 px-3 rounded-full bg-slate-100/10 border border-slate-200/20 text-slate-500 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">Environment Setup</span>
                            <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${hoveredTheme === 'light' ? 'text-slate-900' : 'text-white'} transition-colors duration-500`}>Choose IDE Theme</h1>
                        </motion.div>
                        
                        {/* THEME CARDS GRID */}
                        <div className="flex flex-col md:flex-row gap-5">
                            <div onMouseEnter={() => setHoveredTheme('light')} onMouseLeave={() => setHoveredTheme(null)}>
                                <ThemeCard id="light" activeTheme={selectedTheme} icon={Sun} title="Light" sub="High contrast. Classic editor feel." onSelect={handleThemeSelect} />
                            </div>
                            <div onMouseEnter={() => setHoveredTheme('midnight')} onMouseLeave={() => setHoveredTheme(null)}>
                                <ThemeCard id="midnight" activeTheme={selectedTheme} icon={Moon} title="Midnight" sub="Deep blue tones. Reduced eye strain." onSelect={handleThemeSelect} />
                            </div>
                            <div onMouseEnter={() => setHoveredTheme('dark')} onMouseLeave={() => setHoveredTheme(null)}>
                                <ThemeCard id="dark" activeTheme={selectedTheme} icon={Zap} title="Dark" sub="Pure black. Distraction free." onSelect={handleThemeSelect} />
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
                        className="absolute inset-0 z-20 flex items-center justify-center bg-transparent"
                    >
                        {/* Light mode texture overlay only */}
                        {selectedTheme === 'light' && <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />}

                        <div className="w-full max-w-4xl px-6 py-8 relative z-30 h-full overflow-y-auto no-scrollbar flex flex-col justify-center">
                            {/* Header */}
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <div className={`flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest ${ts.accentColor}`}>
                                        <Terminal size={14} /> <span>Protocol Briefing</span>
                                    </div>
                                    <h1 className={`text-3xl md:text-4xl font-black tracking-tight leading-none ${ts.text}`}>{config.title}</h1>
                                </div>
                                <div className="hidden md:block text-right">
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${ts.subText}`}>System Status</div>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                        <span className="text-emerald-500 font-bold text-sm">ONLINE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: 0.1 }} 
                                    className={`lg:col-span-2 rounded-[1.5rem] border overflow-hidden backdrop-blur-xl ${ts.cardBg} ${ts.cardBorder}`}
                                >
                                    <div className={`grid grid-cols-3 divide-x h-full ${ts.divider}`}>
                                        <div className="p-6 flex flex-col justify-center items-center text-center">
                                            <div className={`mb-3 p-2 rounded-lg ${ts.iconBg}`}><Clock size={20} /></div>
                                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60 ${ts.subText}`}>Time Limit</div>
                                            <div className={`font-bold text-lg ${ts.text}`}>{config.durationStr}</div>
                                        </div>
                                        <div className="p-6 flex flex-col justify-center items-center text-center">
                                            <div className={`mb-3 p-2 rounded-lg ${selectedTheme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-purple-500/10 text-purple-500'}`}><Code2 size={20} /></div>
                                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60 ${ts.subText}`}>Problems</div>
                                            <div className={`font-bold text-lg ${ts.text}`}>{config.problems}</div>
                                        </div>
                                        <div className="p-6 flex flex-col justify-center items-center text-center">
                                            <div className={`mb-3 p-2 rounded-lg ${selectedTheme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-amber-500/10 text-amber-500'}`}><Trophy size={20} /></div>
                                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60 ${ts.subText}`}>Total Score</div>
                                            <div className={`font-bold text-lg ${ts.text}`}>{config.score}</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* System Check */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: 0.2 }} 
                                    className={`p-6 rounded-[1.5rem] border flex flex-col justify-between backdrop-blur-xl ${ts.cardBg} ${ts.cardBorder}`}
                                >
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${ts.subText}`}><AlertOctagon size={14} /> Environment</div>
                                    <div className="space-y-3">
                                        {[{ l: "Compiler Latency", s: "24ms" }, { l: "Anti-Cheat", s: "ACTIVE" }, { l: "Network", s: "STABLE" }].map((i, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs">
                                                <span className={`font-mono opacity-60 ${ts.subText}`}>{i.l}</span>
                                                <span className="font-bold text-emerald-500">{i.s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Rules */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ delay: 0.3 }} 
                                className={`mb-8 p-5 rounded-[1.5rem] border backdrop-blur-md ${ts.rulesBg}`}
                            >
                                <div className="flex items-center gap-2 mb-4 text-red-500 font-bold uppercase text-xs tracking-widest"><ShieldAlert size={16} /> Zero Tolerance Policy</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { t: "Tab Switching", d: "Focus loss is logged. Excessive switching disqualifies.", i: MonitorX },
                                        { t: "Plagiarism", d: "Code compared against web & peers via MOSS.", i: Eye },
                                        { t: "AI Tools", d: "Copilot & Clipboard extensions blocked.", i: Lock }
                                    ].map((rule, idx) => (
                                        <div key={idx} className={`flex gap-3 items-start ${ts.rulesText}`}>
                                            <rule.i size={16} className="mt-0.5 shrink-0 opacity-70" />
                                            <div><div className="text-xs font-bold uppercase mb-0.5">{rule.t}</div><div className="text-[10px] leading-tight opacity-80">{rule.d}</div></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
                                <label className="flex items-center justify-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${agreed ? 'bg-indigo-600 border-indigo-600' : `border-slate-400 group-hover:border-indigo-400`}`}>
                                        {agreed && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                                    <span className={`text-sm font-medium select-none ${selectedTheme === 'light' ? 'text-slate-600 group-hover:text-slate-800' : 'text-slate-400 group-hover:text-white'}`}>I accept the Rules of Engagement and integrity protocols.</span>
                                </label>

                                <div className={`relative h-16 rounded-full overflow-hidden border transition-all duration-300 
                                    ${ts.sliderTrack} ${ts.cardBorder}
                                    ${!agreed ? 'opacity-50 grayscale cursor-not-allowed' : 'opacity-100'}
                                `}>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <span className={`text-xs font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${sliderVal > 30 ? 'opacity-0' : 'opacity-40'} ${selectedTheme === 'light' ? 'text-slate-400' : 'text-white'}`}>{agreed ? "Slide to Initialize" : "Accept Rules to Unlock"}</span>
                                    </div>
                                    <div className={`absolute inset-y-0 left-0 transition-none ${ts.sliderFill}`} style={{ width: `${sliderVal}%` }} />
                                    <input type="range" min="0" max="100" value={sliderVal} onChange={handleSlider} disabled={!agreed} className="range-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
                                    <div className={`absolute top-1.5 bottom-1.5 w-14 rounded-full flex items-center justify-center pointer-events-none z-20 transition-transform ease-out bg-indigo-600 text-white shadow-lg shadow-indigo-500/30`} style={{ left: `calc(${sliderVal}% - ${sliderVal * 0.45}px + 6px)`, transform: `translateX(-${sliderVal}%)` }}>
                                        {sliderVal > 90 ? <Cpu size={20} className="animate-pulse" /> : <ChevronRight size={20} strokeWidth={3} />}
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

export default ContestInstructions;