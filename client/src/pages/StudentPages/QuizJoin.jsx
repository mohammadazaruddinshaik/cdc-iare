import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Clock, UserCheck, Search, 
    CheckCircle2, AlertCircle, FileQuestion, 
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENT: BACKGROUND ATMOSPHERE (THE "BATTLE" THEME) ---
const DataStreamBackground = () => {
    // Left Side: Competitive/Urgency Phrases
    const leftPhrases = [
        "BATTLE OF MINDS", "TIME MATTERS", "EVERY SECOND COUNTS", 
        "PROVE YOUR SKILL", "FOCUS", "ADAPT", "WIN"
    ];

    // Right Side: Aspirational/Cognitive Phrases
    const rightPhrases = [
        "RISE HIGHER", "STAY AHEAD", "MIND OVER TIME", 
        "SHARP THINKING", "LOGIC", "SPEED", "ACCURACY"
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 selection:bg-none">
            {/* Ambient Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-slate-100 opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] opacity-60"></div>

            {/* Left Column: Drifting Text */}
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

            {/* Right Column: Drifting Text */}
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

// --- MAIN PAGE COMPONENT ---
const QuizJoinPage = () => {
    const navigate = useNavigate();

    // --- STATIC MOCK DATA ---
    const staticQuizData = {
        success: true,
        session: {
            sessionId: "REQ-8859",
            title: "Advanced System Architecture", // Sample Title
            durationMinutes: 45
        },
        student: {
            name: "Alex Developer" // Sample Name
        },
        questions: new Array(25).fill(null) // Mocking 25 questions
    };
    
    // State Management
    // Initialize with data so it shows immediately
    const [sessionCode, setSessionCode] = useState('DEMO01'); 
    const [status, setStatus] = useState('SUCCESS'); // Start in SUCCESS state
    const [apiData, setApiData] = useState(staticQuizData); 
    const [errorMsg, setErrorMsg] = useState('');

    // --- MOCK API INTERACTION ---
    const verifySession = async (code) => {
        setStatus('LOADING');
        setErrorMsg('');

        // Simulate Network Delay
        setTimeout(() => {
            // FORCE SUCCESS FOR STATIC DEMO
            setApiData(staticQuizData);
            setStatus('SUCCESS');
        }, 1500);
    };

    // Watch for 6-character input
    useEffect(() => {
        // Only trigger mock fetch if user manually changes code to 6 chars
        // and we aren't already displaying the initial static data
        if (sessionCode.length === 6 && sessionCode !== 'DEMO01') {
            verifySession(sessionCode);
        } else if (sessionCode.length < 6) {
            if (status !== 'IDLE') {
                setStatus('IDLE');
                setApiData(null);
                setErrorMsg('');
            }
        }
    }, [sessionCode]);

    // Handle Quiz Start
    const handleStartQuiz = () => {
        if (apiData) {
            // --- UPDATED NAVIGATION ---
            // Navigate to instructions and pass the quiz data in the state
            navigate('/quiz/instructions', { 
                state: { quizData: apiData } 
            });
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-slate-900 overflow-hidden">
            
            <DataStreamBackground />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[560px] px-6">
                
                {/* 1. Main Title */}
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

                {/* 2. The Input Card */}
                <motion.div 
                    layout
                    className={`
                        relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500
                        ${status === 'SUCCESS' 
                            ? 'shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] ring-4 ring-indigo-50 border-indigo-100' 
                            : status === 'ERROR'
                                ? 'shadow-2xl shadow-red-200/50 ring-4 ring-red-50 border-red-100'
                                : 'shadow-2xl shadow-slate-200/80 border border-white'}
                    `}
                >
                    <div className="p-3">
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
                                    ${status === 'LOADING' ? 'bg-indigo-50/50 text-indigo-600' : 'bg-white hover:bg-slate-50/50 text-slate-800'}
                                    ${status === 'ERROR' ? 'text-red-500 bg-red-50/50' : ''}
                                `}
                            />
                            
                            {/* Interactive Status Indicator */}
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                <AnimatePresence mode="wait">
                                    {status === 'IDLE' && (
                                        <motion.div 
                                            key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="bg-slate-100 p-3 rounded-full text-slate-400"
                                        >
                                            <Hash size={24} />
                                        </motion.div>
                                    )}
                                    {status === 'LOADING' && (
                                        <motion.div 
                                            key="loading" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }}
                                            transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                                            className="bg-indigo-100 p-3 rounded-full text-indigo-600 border border-indigo-200"
                                        >
                                            <Search size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === 'SUCCESS' && (
                                        <motion.div 
                                            key="success" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                                            className="bg-emerald-500 p-3 rounded-full text-white shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle2 size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === 'ERROR' && (
                                        <motion.div 
                                            key="error" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }}
                                            className="bg-red-500 p-3 rounded-full text-white shadow-lg shadow-red-200"
                                        >
                                            <AlertCircle size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* 3. Error Feedback */}
                    <AnimatePresence>
                        {status === 'ERROR' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden text-center pb-4 px-6"
                            >
                                <p className="text-sm font-bold text-red-500 bg-red-50 py-2 rounded-xl border border-red-100">
                                    {errorMsg}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 4. SUCCESS: Battle Details */}
                    <AnimatePresence>
                        {status === 'SUCCESS' && apiData && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-8 pb-8 pt-2">
                                    <div className="w-full h-px bg-slate-100 mb-6"></div>

                                    {/* Session Info */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                                {apiData.session.title}
                                            </h2>
                                            <div className="flex items-center gap-1.5">
                                                <UserCheck size={12} className="text-indigo-500" />
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                    Contender: {apiData.student.name}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Status Chip */}
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                            <span className="relative flex h-2 w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Time Limit</p>
                                                <p className="font-bold text-slate-900">{apiData.session.durationMinutes} Min</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileQuestion size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
                                                <p className="font-bold text-slate-900">{apiData.questions.length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartQuiz}
                                        className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:shadow-indigo-300 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <span>Enter Arena</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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