import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, 
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
// 2. SUB-COMPONENT: ANIMATED BACKGROUND (CORNERS FIXED)
// ==========================================
const DataStreamBackground = () => {
    const leftPhrases = ["BATTLE OF MINDS", "TIME MATTERS", "EVERY SECOND COUNTS", "PROVE YOUR SKILL", "FOCUS", "ADAPT", "WIN"];
    const rightPhrases = ["RISE HIGHER", "STAY AHEAD", "MIND OVER TIME", "SHARP THINKING", "LOGIC", "SPEED", "ACCURACY"];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 selection:bg-none">
            {/* Ambient Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-slate-100 opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] opacity-60"></div>

            {/* Grid Texture */}
            <div className="absolute inset-0 opacity-[0.2]" 
                 style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* UPDATES:
               1. left-0 / right-0 to stick to corners.
               2. w-96 to ensure absolutely no text cutting.
               3. text-left (on left) and text-right (on right) to anchor to edges.
               4. pl-8 / pr-8 to give breathing room from the absolute bezel.
            */}
            
            {/* Left Column - Anchored to Top Left */}
            <div className="absolute left-0 top-0 bottom-0 w-96 overflow-hidden opacity-30 hidden md:block [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                <motion.div 
                    animate={{ y: [0, -1000] }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col gap-20 text-left pl-8 pt-20"
                >
                    {[...leftPhrases, ...leftPhrases, ...leftPhrases, ...leftPhrases].map((item, i) => (
                        <span key={`l-${i}`} className="whitespace-nowrap text-xs font-black tracking-[0.2em] text-slate-400">
                            {item}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Right Column - Anchored to Top Right */}
            <div className="absolute right-0 top-0 bottom-0 w-96 overflow-hidden opacity-40 hidden md:block [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                <motion.div 
                    animate={{ y: [-1000, 0] }}
                    transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col gap-20 text-right pr-8 pt-20"
                >
                    {[...rightPhrases, ...rightPhrases, ...rightPhrases, ...rightPhrases].map((item, i) => (
                        <span key={`r-${i}`} className="whitespace-nowrap text-xl font-black tracking-tighter text-indigo-300">
                            {item}
                        </span>
                    ))}
                </motion.div>
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

    // --- NAVIGATION HANDLER ---
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
            case 'SUCCESS': return 'shadow-[0_30px_60px_-15px_rgba(79,70,229,0.2)] ring-4 ring-indigo-50 border-indigo-100';
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
            <div className="relative z-10 w-full max-w-[560px] lg:max-w-[480px] px-6">
                
                {/* --- HEADER: TITLE --- */}
                <motion.div layout className="text-center mb-8 lg:mb-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        Not Just a Quiz
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-5xl font-black tracking-tighter text-slate-900 mb-3 lg:mb-2 leading-[0.9]">
                        It’s a Battle <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Of Minds.
                        </span>
                    </h1>
                    
                    <p className="text-slate-500 font-medium text-lg lg:text-base tracking-tight">
                        Every question counts. Every second matters.
                    </p>
                </motion.div>

                {/* --- CARD CONTAINER --- */}
                <motion.div 
                    layout
                    className={`relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] lg:rounded-[2rem] transition-all duration-500 overflow-hidden ${getCardStyles()}`}
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
                                    w-full 
                                    h-24 lg:h-20 
                                    text-center 
                                    text-4xl lg:text-3xl 
                                    font-black tracking-[0.25em] 
                                    rounded-[2rem] lg:rounded-[1.75rem]
                                    outline-none transition-all duration-300 font-mono
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

                    {/* C. SUCCESS DETAILS */}
                    <AnimatePresence>
                        {status === 'SUCCESS' && apiData && (
                            <motion.div {...ANIMATION_VARIANTS} className="relative z-10">
                                <div className="px-8 pb-8 pt-6 lg:px-6 lg:pb-6 lg:pt-4 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 rounded-b-[2.5rem]">
                                    
                                    {/* Visual Separator */}
                                    <div className="w-full flex justify-center mb-6 lg:mb-4">
                                        <div className="w-12 h-1 bg-slate-200/80 rounded-full"></div>
                                    </div>

                                    {/* 1. Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 lg:mb-6">
                                        <div className="flex-1">
                                            <h2 className="text-xl lg:text-lg font-black text-slate-800 tracking-tight leading-tight mb-2">
                                                {apiData.session.title}
                                            </h2>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-blue-400"></div>
                                                <div>
                                                    <p className="text-sm lg:text-xs font-bold text-slate-700">
                                                        {apiData.student.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-0.5">
                                                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                                                            {apiData.student.rollno}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                                                             {apiData.student.sem} • {apiData.student.batch}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Status Chip */}
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 shadow-sm shrink-0">
                                            <Zap size={12} className="fill-amber-500 text-amber-600" />
                                            <span className="text-[9px] font-black uppercase tracking-wider">Ready</span>
                                        </div>
                                    </div>

                                    {/* 2. Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-8 lg:mb-6">
                                        
                                        {/* Time Card */}
                                        <div className="relative group overflow-hidden bg-white border border-rose-100/80 rounded-2xl p-4 lg:p-3 shadow-[0_2px_8px_-2px_rgba(225,29,72,0.1)] hover:shadow-md hover:border-rose-200 transition-all duration-300">
                                            <div className="absolute top-0 right-0 p-2 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                                                <Hourglass size={50} className="text-rose-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="p-1 bg-rose-50 rounded-md text-rose-500">
                                                        <Hourglass size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">Time Limit</span>
                                                </div>
                                                <p className="text-2xl lg:text-xl font-black text-slate-800">
                                                    {apiData.session.durationMinutes}
                                                    <span className="text-xs font-bold text-slate-400 ml-0.5">m</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Questions Card */}
                                        <div className="relative group overflow-hidden bg-white border border-cyan-100/80 rounded-2xl p-4 lg:p-3 shadow-[0_2px_8px_-2px_rgba(6,182,212,0.1)] hover:shadow-md hover:border-cyan-200 transition-all duration-300">
                                            <div className="absolute top-0 right-0 p-2 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                                                <Target size={50} className="text-cyan-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="p-1 bg-cyan-50 rounded-md text-cyan-500">
                                                        <Target size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase text-cyan-500 tracking-wider">Total Q's</span>
                                                </div>
                                                <p className="text-2xl lg:text-xl font-black text-slate-800">
                                                    {apiData.questions.length}
                                                    <span className="text-xs font-bold text-slate-400 ml-0.5">Q</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. CTA Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartQuiz}
                                        className="relative w-full py-4 lg:py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm lg:text-xs uppercase tracking-widest rounded-xl lg:rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden border border-white/10"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Go Live <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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