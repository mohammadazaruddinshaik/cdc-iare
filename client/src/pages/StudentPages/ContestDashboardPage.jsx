import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
    ArrowRight, Clock, Terminal, AlertCircle, Loader2, 
    PlayCircle, CheckCircle2, AlertTriangle, X, ShieldAlert, Maximize 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTEGRATIONS ---
import api from '../../api/axiosConfig'; 
import ErrorDisplay from '../../components/ErrorDisplay'; 
import { useNetworkStatus } from '../../hooks/Network';

// --- THEME CONFIGURATION ---
const THEMES = {
    light: {
        id: 'light',
        bg: "bg-slate-50",
        text: "text-slate-900",
        subtext: "text-slate-500",
        border: "border-slate-200",
        card: "bg-white border-slate-200 shadow-sm hover:shadow-md hover:shadow-blue-500/10",
        header: "bg-white/90 border-slate-200",
        accent: "text-blue-600",
        button: "bg-slate-900 text-white hover:bg-blue-600",
        modal: "bg-white text-slate-900",
        successBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        gridOpacity: "opacity-[0.4]"
    },
    midnight: {
        id: 'midnight',
        bg: "bg-[#020617]",
        text: "text-white",
        subtext: "text-slate-400",
        border: "border-white/10",
        card: "bg-[#0F172A]/60 backdrop-blur-md border-white/5 hover:border-indigo-500/30 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.1)]",
        header: "bg-[#020617]/80 border-white/5 backdrop-blur-xl",
        accent: "text-indigo-400",
        button: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20",
        modal: "bg-[#0F172A] border border-white/10 text-white",
        successBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        gridOpacity: "opacity-[0.15]"
    },
    dark: {
        id: 'dark',
        bg: "bg-[#050505]", 
        text: "text-neutral-100",
        subtext: "text-neutral-500",
        border: "border-neutral-800",
        card: "bg-[#171717]/80 backdrop-blur-md border-neutral-800 hover:border-neutral-600",
        header: "bg-[#050505]/80 border-neutral-800 backdrop-blur-xl",
        accent: "text-white",
        button: "bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700",
        modal: "bg-[#171717] border border-neutral-800 text-white",
        successBg: "bg-green-900/20 text-green-400 border-green-900/30",
        gridOpacity: "opacity-[0.1]"
    }
};

// --- COMPONENT: DIFFICULTY BADGE ---
const DifficultyBadge = ({ level, themeId }) => {
    const isLight = themeId === 'light';
    const isDark = themeId === 'dark';
    
    const getColors = () => {
        if (isLight) {
            return {
                Easy: "text-emerald-700 bg-emerald-100 border-emerald-200",
                Medium: "text-amber-700 bg-amber-100 border-amber-200",
                Hard: "text-rose-700 bg-rose-100 border-rose-200"
            };
        } else if (isDark) {
            return {
                Easy: "text-emerald-400 bg-neutral-800 border-neutral-700",
                Medium: "text-amber-400 bg-neutral-800 border-neutral-700",
                Hard: "text-rose-400 bg-neutral-800 border-neutral-700"
            };
        } else { // Midnight
            return {
                Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20"
            };
        }
    };

    const colors = getColors();
    const safeLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Medium';
    
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${colors[safeLevel] || colors.Medium}`}>
            {safeLevel}
        </span>
    );
};

const ContestDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { contestId } = useParams(); 
    const isOnline = useNetworkStatus(); 
    
    // --- 1. THEME SETUP ---
    const [themeId, setThemeId] = useState(() => {
        if (location.state?.theme && THEMES[location.state.theme]) return location.state.theme;
        return localStorage.getItem('app-theme') || 'light';
    });

    const theme = THEMES[themeId] || THEMES['light'];

    useEffect(() => {
        localStorage.setItem('app-theme', themeId);
    }, [themeId]);

    useEffect(() => {
        if (location.state?.theme && THEMES[location.state.theme]) {
            setThemeId(location.state.theme);
        }
    }, [location.state]);

    // --- STATE ---
    const [contestData, setContestData] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(null); 
    const [isLocked, setIsLocked] = useState(true); 
    
    // UI States
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [resultModal, setResultModal] = useState({
        show: false,
        type: 'success', 
        title: '',
        message: '',
        onClose: () => {}
    });

    // --- 2. FULL SCREEN & SECURITY LOGIC ---
    const enterFullScreen = async () => {
        const elem = document.documentElement;
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
                setIsLocked(false);
            }
        } catch (err) {
            console.error("Full screen error:", err);
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setIsLocked(true); 
            } else {
                setIsLocked(false);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsLocked(true); 
            }
        };

        const handleContextMenu = (e) => e.preventDefault();

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);

        enterFullScreen();

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // --- 3. FETCH DATA ---
    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/student/get-exam-details/${contestId}`);
                const json = response.data;

                if (json.success) {
                    setContestData(json.data);
                } else {
                    setError('Failed to load contest details.');
                }
            } catch (err) {
                console.error(err);
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchExamDetails();
    }, [contestId]);

    // --- 4. TIMER LOGIC ---
    useEffect(() => {
        if (!contestData?.endTime) return;

        const calculateTime = () => {
            const end = new Date(contestData.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                return "ENDED";
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                const h = hours < 10 ? `0${hours}` : hours;
                const m = minutes < 10 ? `0${minutes}` : minutes;
                const s = seconds < 10 ? `0${seconds}` : seconds;
                return `${h}:${m}:${s}`;
            }
        };

        setTimeLeft(calculateTime()); 

        const interval = setInterval(() => {
            const timeString = calculateTime();
            setTimeLeft(timeString);
            if (timeString === "ENDED") clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [contestData]);

    // --- PREVENT BACK BUTTON ---
    useEffect(() => {
        window.history.pushState(null, null, window.location.href);
        const handlePopState = () => window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // --- HANDLERS ---
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/api/student/final-submit', { examId: contestId });
            const json = response.data;
            
            setShowFinishModal(false);

            if (json.success) {
                setResultModal({
                    show: true,
                    type: 'success',
                    title: 'Submission Successful!',
                    message: json.message || "Your exam has been submitted successfully.",
                    // ⚡️ UPDATED: Navigate to results page with data on close
                    onClose: () => navigate(`/contest/${contestId}/result`, {
                        state: { 
                            resultData: json.data, // Passing the full response data
                            theme: themeId 
                        }
                    })
                });
            } else {
                setResultModal({
                    show: true,
                    type: 'error',
                    title: 'Submission Failed',
                    message: json.message || "We couldn't submit your exam. Please try again.",
                    onClose: () => setResultModal(prev => ({ ...prev, show: false }))
                });
            }
        } catch (err) {
            setShowFinishModal(false);
            setResultModal({
                show: true,
                type: 'error',
                title: 'Network Error',
                message: "A network error occurred. Please check your connection.",
                onClose: () => setResultModal(prev => ({ ...prev, show: false }))
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProblemClick = (problemId) => {
        if (!problemId) return;
        navigate(`/contests/${contestId}/problem/${problemId}`, {
            state: { 
                contestData: contestData, 
                theme: themeId 
            }
        });
    };

    if (!isOnline) {
        return <ErrorDisplay type="offline" />;
    }

    if (loading || !timeLeft) return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 className={`animate-spin ${theme.accent}`} size={40} />
            </div>
        </div>
    );

    if (error || !contestData) return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bg} text-red-500 font-bold gap-2`}>
            <AlertCircle /> {error || "No data found"}
        </div>
    );

    const problemsList = contestData.problems || [];
    const totalUserMarks = problemsList.reduce((sum, p) => sum + (p.marksObtained || 0), 0);
    const totalMaxScore = problemsList.reduce((sum, p) => sum + (p.maxMarks || 0), 0);

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-indigo-500/30 overflow-x-hidden relative pb-10 transition-colors duration-500`}>
            
            {/* 🛡️ SECURITY LOCKOUT MODAL 🛡️ */}
            {isLocked && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl backdrop-saturate-150 animate-in fade-in duration-300">
                    <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-slate-200 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-pulse">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Lockout</h2>
                            <p className="text-slate-500 mt-2 font-medium">
                                The exam environment has been locked because focus was lost or full-screen mode was exited.
                            </p>
                        </div>
                        <button 
                            onClick={enterFullScreen}
                            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Maximize size={18} /> Resume Session
                        </button>
                    </div>
                </div>
            )}

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none">
                {themeId === 'midnight' && (
                     <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' }} />
                     </div>
                )}
                {themeId === 'dark' && (
                    <div className="absolute inset-0 bg-[#050505]">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]" />
                         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '30px 30px', maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)' }} />
                    </div>
                )}
                {themeId === 'light' && (
                    <div className="absolute inset-0 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.1]"></div>
                )}
            </div>

            {/* --- HEADER --- */}
            <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${theme.header}`}>
                <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${themeId === 'light' ? 'bg-slate-900 text-white' : (themeId === 'dark' ? 'bg-neutral-800 border border-neutral-700' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20')}`}>
                            <Terminal size={20} />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-lg tracking-tight leading-none">
                                {contestData.examName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${timeLeft === 'ENDED' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.subtext}`}>
                                    {timeLeft === 'ENDED' ? 'Exam Ended' : 'Live Contest'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-50`}>Time Remaining</span>
                            <div className={`font-mono font-black text-2xl tracking-wider ${timeLeft === 'ENDED' ? 'text-red-500' : ''}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button 
                            onClick={() => setShowFinishModal(true)}
                            className={`text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg transition-all transform active:scale-95 ${themeId === 'light' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' : (themeId === 'dark' ? 'bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700' : 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white')}`}
                        >
                            Finish Exam
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative z-10">
                <div className="space-y-6">
                     <div className={`flex items-end justify-between border-b pb-4 ${theme.border}`}>
                        <div>
                            <h2 className="text-xl font-bold">Problem Set</h2>
                            <p className={`text-sm mt-1 ${theme.subtext}`}>Select a challenge to begin coding.</p>
                        </div>
                        
                        <div className="text-right">
                            <span className="block text-3xl font-black leading-none">
                                {totalUserMarks} <span className={`text-lg opacity-40`}>/ {totalMaxScore}</span>
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>Total Score</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence>
                            {problemsList.length > 0 ? (
                                problemsList.map((prob, idx) => {
                                    const status = prob.status || "Not Attempted"; 
                                    const isSolved = status === 'Accepted' || status === 'Solved';
                                    const isInProgress = status === 'In-Progress';
                                    
                                    return (
                                        <motion.div
                                            key={prob.problemNo} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`
                                                relative rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300 group
                                                ${theme.card}
                                                ${isSolved && themeId === 'light' ? 'bg-emerald-50/50 border-emerald-100' : ''}
                                                ${isSolved && themeId === 'midnight' ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
                                                ${isSolved && themeId === 'dark' ? 'bg-neutral-900 border-neutral-800 opacity-60' : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold border transition-colors shrink-0
                                                ${isSolved
                                                    ? (themeId === 'dark' ? 'bg-neutral-800 border-neutral-700 text-emerald-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500')
                                                    : isInProgress
                                                        ? (themeId === 'dark' ? 'bg-neutral-800 border-neutral-700 text-amber-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500')
                                                        : (themeId === 'dark' ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : (themeId === 'midnight' ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'))}
                                            `}>
                                                {String(prob.problemNo).padStart(2, '0')}
                                            </div>

                                            <div className="flex-1 w-full">
                                                <h3 className={`text-lg font-bold mb-1 transition-colors ${isSolved ? 'opacity-60' : (themeId === 'dark' ? 'group-hover:text-white' : 'group-hover:text-indigo-500')}`}>
                                                    {prob.title}
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <DifficultyBadge level={prob.difficulty} themeId={themeId} />
                                                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${theme.subtext}`}>
                                                        <Clock size={12} />
                                                        {prob.timeAllocated || 20} Mins
                                                    </div>
                                                    {status !== 'Not Attempted' && (
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isSolved ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                                                <div className="text-right">
                                                    <span className={`block font-black text-lg ${isSolved ? 'text-emerald-500' : isInProgress ? 'text-amber-500' : ''}`}>
                                                        {prob.marksObtained} 
                                                        <span className="text-base opacity-40"> / {prob.maxMarks}</span>
                                                    </span>
                                                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Points</span>
                                                </div>
                                                
                                                {isSolved ? (
                                                    <button 
                                                        onClick={() => handleProblemClick(prob.problemId)}
                                                        className={`h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${themeId === 'dark' ? 'bg-neutral-800 text-emerald-500 hover:bg-neutral-700' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                                                    >
                                                        Solved <CheckCircle2 size={14} />
                                                    </button>
                                                ) : isInProgress ? (
                                                    <button 
                                                        onClick={() => handleProblemClick(prob.problemId)}
                                                        className={`h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 ${themeId === 'dark' ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20'}`}
                                                    >
                                                        Resume <PlayCircle size={14} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleProblemClick(prob.problemId)}
                                                        className={`h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 group-hover:translate-x-1 ${theme.button}`}
                                                    >
                                                        Solve <ArrowRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className={`text-center py-10 opacity-50 ${theme.subtext}`}>No problems found.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* --- CONFIRMATION MODAL --- */}
            <AnimatePresence>
                {showFinishModal && (
                    <motion.div 
                        key="confirm-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className={`rounded-3xl p-8 max-w-sm w-full shadow-2xl relative ${theme.modal}`}
                        >
                            <button onClick={() => setShowFinishModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors opacity-50 hover:opacity-100">
                                <X size={20} />
                            </button>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${themeId === 'dark' ? 'bg-amber-900/20 text-amber-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Finish Exam?</h3>
                                    <p className={`text-sm mt-2 leading-relaxed opacity-70`}>Are you sure? You won't be able to change answers.</p>
                                </div>
                                <div className="flex w-full gap-3 mt-4">
                                    <button onClick={() => setShowFinishModal(false)} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-colors ${themeId === 'light' ? 'border-slate-200 hover:bg-slate-50 text-slate-600' : 'border-white/10 hover:bg-white/5 text-white'}`}>Cancel</button>
                                    <button onClick={handleFinalSubmit} disabled={isSubmitting} className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 ${theme.button}`}>
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Yes, Submit"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- RESULT MODAL --- */}
            <AnimatePresence>
                {resultModal.show && (
                    <motion.div 
                        key="result-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className={`rounded-3xl p-8 max-w-sm w-full shadow-2xl relative ${theme.modal}`}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${resultModal.type === 'success' ? (themeId === 'dark' ? 'bg-emerald-900/20 text-emerald-500' : 'bg-emerald-500/10 text-emerald-500') : (themeId === 'dark' ? 'bg-red-900/20 text-red-500' : 'bg-red-500/10 text-red-500')}`}>
                                    {resultModal.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">{resultModal.title}</h3>
                                    <p className={`text-sm mt-2 leading-relaxed opacity-70`}>{resultModal.message}</p>
                                </div>
                                <button onClick={resultModal.onClose} className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg mt-4 ${resultModal.type === 'success' ? (themeId === 'dark' ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-500') : (themeId === 'dark' ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-500')}`}>
                                    {resultModal.type === 'success' ? "Continue" : "Okay"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContestDashboard;