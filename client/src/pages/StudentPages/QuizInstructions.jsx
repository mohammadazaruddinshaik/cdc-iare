import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, Eye, Zap, Lock, 
    Sun, Moon, ArrowRight, Check, 
    Terminal, Cpu, Wifi, MousePointerClick,
    AlertOctagon, ScanFace
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. ATMOSPHERE BACKGROUND ---
const Atmosphere = ({ theme }) => {
    const isDark = theme === 'dark';
    return (
        <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700 ${isDark ? 'bg-[#050B14]' : 'bg-slate-50'}`}>
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: isDark ? [0.2, 0.3, 0.2] : [0.4, 0.5, 0.4] }}
                transition={{ duration: 10, repeat: Infinity }}
                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] rounded-full blur-[120px] ${isDark ? 'bg-indigo-900/30' : 'bg-blue-100'}`}
            />
            <div className={`absolute inset-0 opacity-[0.1]`} 
                 style={{ backgroundImage: `linear-gradient(${isDark ? '#4f46e5' : '#94a3b8'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#4f46e5' : '#94a3b8'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
            </div>
        </div>
    );
};

// --- 2. MAIN COMPONENT ---
const QuizInstructions = () => {
    const navigate = useNavigate();
    
    // State
    const [theme, setTheme] = useState(null); 
    const [step, setStep] = useState(1); 
    const [agreed, setAgreed] = useState(false);

    // Theme Logic
    const isDark = theme === 'dark';
    const t = {
        card: isDark ? "bg-[#0F172A]/90 border-slate-700" : "bg-white/90 border-slate-200",
        text: isDark ? "text-slate-100" : "text-slate-900",
        subText: isDark ? "text-slate-400" : "text-slate-500",
        accent: isDark ? "text-indigo-400" : "text-indigo-600",
        gridItem: isDark ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50" : "bg-slate-50 border-slate-200 hover:border-indigo-300",
        iconBg: isDark ? "bg-slate-900 text-indigo-400" : "bg-white text-indigo-600 shadow-sm"
    };

    // Actions
    const handleThemeSelect = (selected) => {
        setTheme(selected);
        setTimeout(() => setStep(2), 400);
    };

    const handleLaunch = () => {
        // Enforce transition logic here
        navigate('/quiz/active', { state: { selectedTheme: theme } });
    };

    // Helper for Rule Items
    const RuleItem = ({ icon: Icon, title, desc }) => (
        <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${t.gridItem}`}>
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${t.iconBg}`}>
                <Icon size={20} strokeWidth={2} />
            </div>
            <div>
                <h4 className={`text-sm font-bold mb-1 ${t.text}`}>{title}</h4>
                <p className={`text-xs leading-relaxed ${t.subText}`}>{desc}</p>
            </div>
        </div>
    );

    return (
        <div className={`relative min-h-screen w-full flex flex-col items-center justify-center font-sans p-6 overflow-hidden`}>
            
            <Atmosphere theme={theme || 'light'} />

            <div className="relative z-10 w-full max-w-5xl">
                <AnimatePresence mode="wait">
                    
                    {/* --- STEP 1: INTERFACE SELECTION --- */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="flex flex-col items-center justify-center min-h-[60vh]"
                        >
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-500/20">
                                    <Terminal size={12} /> System Configuration
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                                    Select Interface
                                </h1>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Choose your preferred environment for optimal focus.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                                {/* Light Mode Option */}
                                <button 
                                    onClick={() => handleThemeSelect('light')}
                                    className="group relative p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 text-left overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                        <Sun size={120} />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                        <Sun size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Daylight Mode</h3>
                                    <p className="text-sm text-slate-500 font-medium">High contrast, clear visibility.</p>
                                </button>

                                {/* Dark Mode Option */}
                                <button 
                                    onClick={() => handleThemeSelect('dark')}
                                    className="group relative p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 text-left overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                        <Moon size={120} className="text-white" />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                                        <Moon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Midnight Mode</h3>
                                    <p className="text-sm text-slate-400 font-medium">Reduced eye strain, deep focus.</p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* --- STEP 2: STRUCTURED INSTRUCTIONS --- */}
                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`w-full mx-auto rounded-[2rem] border shadow-2xl backdrop-blur-xl overflow-hidden ${t.card}`}
                        >
                            {/* Top Bar */}
                            <div className={`px-8 py-6 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/80'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-bold leading-none ${t.text}`}>Integrity Check</h2>
                                        <p className={`text-xs mt-1 font-medium ${t.subText}`}>Session ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setStep(1)} className={`text-xs font-bold uppercase tracking-wider hover:underline ${t.subText}`}>
                                    Switch Theme
                                </button>
                            </div>

                            <div className="p-8">
                                {/* Introduction */}
                                <div className="mb-8">
                                    <h1 className={`text-3xl font-black mb-3 ${t.text}`}>
                                        Fair Play <span className={t.accent}>Protocols</span>
                                    </h1>
                                    <p className={`text-sm ${t.subText} max-w-2xl`}>
                                        Our advanced proctoring system ensures a fair assessment environment. 
                                        Please review the active monitoring modules below before commencing.
                                    </p>
                                </div>

                                {/* Structured Grid */}
                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    <RuleItem 
                                        icon={ScanFace} 
                                        title="Focus & Visibility" 
                                        desc="Tab switching, window resizing, and loss of focus are logged instantly." 
                                    />
                                    <RuleItem 
                                        icon={MousePointerClick} 
                                        title="Input Restrictions" 
                                        desc="Right-click menu, copy/paste shortcuts, and text selection are disabled." 
                                    />
                                    <RuleItem 
                                        icon={AlertOctagon} 
                                        title="Fullscreen Enforcement" 
                                        desc="The quiz must remain in fullscreen mode. Exiting triggers a violation." 
                                    />
                                    <RuleItem 
                                        icon={Cpu} 
                                        title="Behavioral Analysis" 
                                        desc="Anomalies in navigation patterns or timing may flag your session for review." 
                                    />
                                </div>

                                {/* Acknowledgement Section */}
                                <div className={`p-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg`}>
                                    <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                                        <label className="flex items-start gap-4 cursor-pointer group select-none">
                                            <div className="relative mt-0.5">
                                                <input 
                                                    type="checkbox" 
                                                    className="peer sr-only"
                                                    checked={agreed}
                                                    onChange={(e) => setAgreed(e.target.checked)}
                                                />
                                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${isDark ? 'border-slate-600 peer-checked:bg-indigo-500 peer-checked:border-indigo-500' : 'border-slate-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600'}`}>
                                                    <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-bold text-sm ${t.text}`}>I acknowledge the rules.</p>
                                                <p className={`text-xs mt-0.5 ${t.subText}`}>I understand that violations will result in warnings and potential disqualification.</p>
                                            </div>
                                            
                                            {/* CTA Button */}
                                            <button 
                                                disabled={!agreed}
                                                onClick={handleLaunch}
                                                className={`
                                                    px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all
                                                    ${agreed 
                                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 translate-x-0 opacity-100' 
                                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed translate-x-4 opacity-50 hidden md:flex'
                                                    }
                                                `}
                                            >
                                                Start <ArrowRight size={16} />
                                            </button>
                                        </label>
                                        
                                        {/* Mobile Button Fallback */}
                                        <button 
                                            disabled={!agreed}
                                            onClick={handleLaunch}
                                            className={`
                                                mt-4 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex md:hidden items-center justify-center gap-2 transition-all
                                                ${agreed 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            Start Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QuizInstructions;