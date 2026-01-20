import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, 
    UserCheck, 
    Search, 
    CheckCircle2, 
    AlertCircle, 
    Hash, 
    Target,    
    Hourglass, 
    Zap        
} from 'lucide-react';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const BACKEND_URL = import.meta.env.VITE_BASE_URL;

const ANIMATION_VARIANTS = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { type: "spring", bounce: 0.3 }
};

// ==========================================
// 2. SUB-COMPONENT: ANIMATED BACKGROUND
// ==========================================
const DataStreamBackground = () => {
    const leftPhrases = ["BATTLE OF MINDS", "TIME MATTERS", "EVERY SECOND COUNTS", "PROVE YOUR SKILL", "FOCUS", "ADAPT", "WIN"];
    const rightPhrases = ["RISE HIGHER", "STAY AHEAD", "MIND OVER TIME", "SHARP THINKING", "LOGIC", "SPEED", "ACCURACY"];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 selection:bg-none">
            {/* Ambient Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-slate-100 opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] opacity-60"></div>

            {/* Left Column Animation */}
            <div className="absolute left-4 top-0 bottom-0 w-40 overflow-hidden opacity-10 hidden md:block">
                <motion.div 
                    animate={{ y: [0, -1000] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col gap-12 text-right font-black text-xs tracking-[0.2em] text-slate-400"
                >
                    {[...leftPhrases, ...leftPhrases, ...leftPhrases, ...leftPhrases].map((item, i) => (
                        <span key={`l-${i}`} className="whitespace-nowrap">{item}</span>
                    ))}
                </motion.div>
            </div>

            {/* Right Column Animation */}
            <div className="absolute right-4 top-0 bottom-0 w-40 overflow-hidden opacity-10 hidden md:block">
                <motion.div 
                    animate={{ y: [-1000, 0] }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col gap-12 text-left font-black text-xl tracking-tighter text-indigo-300"
                >
                    {[...rightPhrases, ...rightPhrases, ...rightPhrases, ...rightPhrases].map((item, i) => (
                        <span key={`r-${i}`} className="whitespace-nowrap">{item}</span>
                    ))}
                </motion.div>
            </div>
            
            {/* Grid Texture */}
            <div className="absolute inset-0 opacity-[0.2]" 
                 style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT: QUIZ JOIN PAGE
// ==========================================
const QuizJoinPage = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [sessionCode, setSessionCode] = useState(''); 
    const [status, setStatus] = useState('IDLE'); 
    const [apiData, setApiData] = useState(null); 
    const [errorMsg, setErrorMsg] = useState('');

    // --- API HANDLER ---
    const fetchSessionDetails = async (code) => {
        setStatus('LOADING');
        setErrorMsg('');
        setApiData(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/student/quiz/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionCode: code }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setApiData(data);
                setStatus('SUCCESS');
            } else {
                setStatus('ERROR');
                setErrorMsg(data.error || 'Invalid Session Code');
            }
        } catch (error) {
            console.error("Join Error:", error);
            setStatus('ERROR');
            setErrorMsg('Connection failed. Please check server.');
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        // Clear any browser history state when landing here to prevent "Forward" loops
        window.history.replaceState(null, '');

        if (sessionCode.length === 6) {
            fetchSessionDetails(sessionCode);
        } else if (sessionCode.length < 6) {
            if (status !== 'IDLE') {
                setStatus('IDLE');
                setApiData(null);
                setErrorMsg('');
            }
        }
    }, [sessionCode]);

    // --- NAVIGATION HANDLER (SECURITY UPDATE) ---
   const handleStartQuiz = () => {
    if (apiData) {
        navigate('/student/quiz/instructions', { 
            state: { 
                ...apiData,
                sessionCode: sessionCode,
                _security_timestamp: Date.now() 
            } 
        });
    }
};

    // ==========================================
    // 4. RENDER HELPERS
    // ==========================================
    const getCardStyles = () => {
        switch (status) {
            case 'SUCCESS': return 'shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] ring-4 ring-indigo-50 border-indigo-100';
            case 'ERROR': return 'shadow-2xl shadow-red-200/50 ring-4 ring-red-50 border-red-100';
            default: return 'shadow-2xl shadow-slate-200/80 border border-white';
        }
    };

    const getInputStyles = () => {
        if (status === 'LOADING') return 'bg-indigo-50/50 text-indigo-600';
        if (status === 'ERROR') return 'text-red-500 bg-red-50/50';
        return 'bg-white hover:bg-slate-50/50 text-slate-800';
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-slate-900 overflow-hidden">
            
            <DataStreamBackground />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[560px] px-6">
                
                {/* --- HEADER: TITLE --- */}
                <motion.div layout className="text-center mb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        Not Just a Quiz
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4 leading-[0.9]">
                        It’s a Battle <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Of Minds.
                        </span>
                    </h1>
                    
                    <p className="text-slate-500 font-medium text-lg tracking-tight">
    Every question counts. Every second matters.
</p>
                </motion.div>

                {/* --- CARD CONTAINER --- */}
                <motion.div 
                    layout
                    className={`relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500 overflow-hidden ${getCardStyles()}`}
                >
                    {/* A. INPUT SECTION */}
                    <div className="p-3 relative z-20 bg-white/50">
                        <div className="relative group">
                            <input
                                type="text"
                                maxLength={6}
                                value={sessionCode}
                                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                className={`
                                    w-full h-24 text-center text-4xl font-black tracking-[0.25em] rounded-[2rem] outline-none transition-all duration-300 font-mono
                                    placeholder:font-sans placeholder:text-slate-200 placeholder:text-xl placeholder:tracking-widest placeholder:font-bold
                                    ${getInputStyles()}
                                `}
                            />
                            
                            {/* Input Status Icon */}
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                <AnimatePresence mode="wait">
                                    {status === 'IDLE' && (
                                        <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-slate-100 p-3 rounded-full text-slate-400">
                                            <Hash size={24} />
                                        </motion.div>
                                    )}
                                    {status === 'LOADING' && (
                                        <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }} transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }} className="bg-indigo-100 p-3 rounded-full text-indigo-600 border border-indigo-200">
                                            <Search size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === 'SUCCESS' && (
                                        <motion.div key="success" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="bg-emerald-500 p-3 rounded-full text-white shadow-lg shadow-emerald-200">
                                            <CheckCircle2 size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === 'ERROR' && (
                                        <motion.div key="error" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} className="bg-red-500 p-3 rounded-full text-white shadow-lg shadow-red-200">
                                            <AlertCircle size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* B. ERROR MESSAGE */}
                    <AnimatePresence>
                        {status === 'ERROR' && (
                            <motion.div {...ANIMATION_VARIANTS} className="text-center pb-4 px-6 relative z-10">
                                <p className="text-sm font-bold text-red-500 bg-red-50 py-2 rounded-xl border border-red-100">
                                    {errorMsg}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* C. SUCCESS DETAILS (ENHANCED VISUALS) */}
                    <AnimatePresence>
                        {status === 'SUCCESS' && apiData && (
                            <motion.div {...ANIMATION_VARIANTS} className="relative z-10">
                                {/* Gradient Background for Info Section */}
                                <div className="px-8 pb-8 pt-6 bg-gradient-to-b from-white via-indigo-50/20 to-indigo-50/50 rounded-b-[2.5rem]">
                                    
                                    {/* Visual Separator */}
                                    <div className="w-full flex justify-center mb-6">
                                        <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
                                    </div>

                                    {/* 1. Header: Title & Student Stats */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex-1 pr-4">
                                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                                                {apiData.session.title}
                                            </h2>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-blue-400"></div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {apiData.student.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-0.5 bg-slate-200/60 rounded text-[10px] font-bold text-slate-500">
                                                            {apiData.student.rollno}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                                                            {apiData.student.batch} • {apiData.student.sem}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Status Chip */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 shadow-sm">
                                                <Zap size={14} className="fill-amber-500 text-amber-600" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Joined</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Metrics Grid - NEW COLORS */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        
                                        {/* Card: Time (Hourglass) - NOW ROSE/RED (Urgency) */}
                                        <div className="relative group overflow-hidden bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                                                <Hourglass size={60} className="text-rose-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-white rounded-lg shadow-sm text-rose-600">
                                                        <Hourglass size={16} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">Limit</span>
                                                </div>
                                                <p className="text-2xl font-black text-slate-800">
                                                    {apiData.session.durationMinutes}
                                                    <span className="text-sm font-bold text-slate-400 ml-1">min</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card: Questions (Target) - NOW CYAN/SKY (Precision) */}
                                        <div className="relative group overflow-hidden bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                                                <Target size={60} className="text-cyan-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-white rounded-lg shadow-sm text-cyan-600">
                                                        <Target size={16} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-cyan-500 tracking-wider">Targets</span>
                                                </div>
                                                <p className="text-2xl font-black text-slate-800">
                                                    {apiData.questions.length}
                                                    <span className="text-sm font-bold text-slate-400 ml-1">Q</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. CTA Button - MATCHING 'OF MINDS' GRADIENT */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartQuiz}
                                        className="relative w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden border border-white/10"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Initialize Battle <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default QuizJoinPage;