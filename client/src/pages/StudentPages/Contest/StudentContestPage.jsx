import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, ArrowRight, ArrowUpRight, Zap, Timer, History, 
    X, Sparkles, CalendarDays, Lock,
    Hourglass, Medal, FileText, CheckCircle, XCircle, AlertCircle, Layers, Code, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from "@monaco-editor/react"; 

// --- IMPORTS ---
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext'; 
import Loader from '../../../components/Loader';
import api from '/src/api/axiosConfig'; 

// --- STYLING CONSTANTS ---
const STATUS_STYLES = {
    LIVE: {
        label: 'Live Now',
        gradient: 'from-emerald-500/20 to-teal-500/5',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        icon: Zap,
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
        button: 'Join Contest'
    },
    UPCOMING: {
        label: 'Upcoming',
        gradient: 'from-orange-500/20 to-amber-500/5',
        text: 'text-orange-300',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
        icon: Timer,
        glow: 'shadow-[0_0_30px_rgba(249,115,22,0.1)]',
        button: null 
    },
    PAST: {
        label: 'Ended',
        gradient: 'from-indigo-500/20 to-blue-500/5',
        text: 'text-indigo-300',
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/10',
        icon: History,
        glow: '',
        button: null
    }
};

const DIFFICULTY_COLORS = {
    'Easy': 'text-green-400 bg-green-400/10 border-green-400/20',
    'Medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'Hard': 'text-rose-400 bg-rose-400/10 border-rose-400/20'
};

// --- HELPERS ---
const formatTimeRange = (start, end) => {
    if (!start || !end) return 'TBA';
    const s = new Date(start);
    const e = new Date(end);
    const format = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${format(s)} - ${format(e)}`;
};

const formatDateFull = (dateString) => {
    if (!dateString) return 'Date TBA';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// --- COMPONENTS ---
const ResultSkeleton = () => (
    <div className="space-y-6 mt-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-white/5 rounded-[2rem] border border-white/5"></div>
            <div className="h-32 bg-white/5 rounded-[2rem] border border-white/5"></div>
        </div>
        <div>
            <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>)}
            </div>
        </div>
    </div>
);

const CountdownTimer = ({ targetDate, label }) => {
    const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const distance = new Date(targetDate).getTime() - now;
        if (distance < 0) return "00:00:00";
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        return `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return <span className="font-mono font-bold tracking-widest tabular-nums">{label} {timeLeft}</span>;
};

// --- MODAL COMPONENT ---
const ContestModal = ({ contest, resultData, isLoadingResult, resultError, onClose }) => {
    const navigate = useNavigate();
    const [selectedIdx, setSelectedIdx] = useState(0);

    if (!contest) return null;

    const style = STATUS_STYLES[contest.status] || STATUS_STYLES.PAST;
    const isEnded = contest.status === 'PAST';
    const isCompleted = contest.submissionStatus === 'Completed'; 
    const isResultContext = isEnded || isCompleted;
    
    // Determine if we show the detailed result view
    const showResultView = isResultContext && resultData && !isLoadingResult;

    const summary = resultData?.examSummary;
    const submissions = resultData?.submissions || [];
    const activeSubmission = submissions[selectedIdx];

    // Dynamic Wrapper Classes
    const modalClasses = showResultView 
        ? "w-full max-w-7xl h-[90vh] flex flex-col"
        : "w-full max-w-3xl max-h-[90vh] flex flex-col";

    return (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <motion.div className={`relative bg-[#0F172A] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5 ${modalClasses}`}
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
                
                {/* Header Section */}
                <div className="flex items-center justify-between p-8 pb-4 shrink-0 bg-[#0F172A] z-20">
                    <div className="flex items-center gap-3">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.text} ${style.border} bg-white/5`}>
                            {isResultContext ? 'Report Card' : style.label}
                        </span>
                        {showResultView && (
                            <span className="text-slate-500 text-xs font-bold tracking-wider">
                                {summary?.status === 'In-Progress' ? 'Pending Eval' : 'Graded'}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={20}/></button>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    
                    {!showResultView ? (
                        /* --- 1. STANDARD VIEW --- */
                        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
                            <h3 className="text-3xl font-black text-white leading-tight mb-6 mt-2">{contest.examName}</h3>
                            
                            {isLoadingResult ? (
                                <ResultSkeleton />
                            ) : resultError ? (
                                <div className="mt-8 p-8 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center flex flex-col items-center">
                                    <AlertTriangle size={32} className="text-red-400 mb-4" />
                                    <h4 className="text-xl font-bold text-white mb-2">Result Unavailable</h4>
                                    <p className="text-red-300/80">{resultError}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-[#020617]/50 border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20"><CalendarDays size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</p>
                                                <p className="text-base font-bold text-white">{formatDateFull(contest.startTime)}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-white/5"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20"><Clock size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Time Window</p>
                                                <p className="text-base font-bold text-white">{formatTimeRange(contest.startTime, contest.endTime)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#020617]/50 border border-white/5 rounded-[2rem] p-5">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Marks</p>
                                            <div className="flex items-center gap-2 mt-2 font-black text-xl text-white"><Medal size={20} className="text-amber-400"/> {contest.totalMarks}</div>
                                        </div>
                                        <div className="bg-[#020617]/50 border border-white/5 rounded-[2rem] p-5">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                                            <div className="flex items-center gap-2 mt-2 font-black text-xl text-white"><Hourglass size={20} className="text-blue-400"/> {contest.totalDuration}m</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* --- 2. RESULT VIEW (Split Layout) --- */
                        <div className="flex flex-col lg:flex-row h-full overflow-hidden border-t border-white/5">
                            
                            {/* LEFT COLUMN */}
                            <div className="w-full lg:w-[400px] shrink-0 border-r border-white/5 flex flex-col bg-[#0b1121]">
                                <div className="p-6 shrink-0">
                                    <h3 className="text-lg font-black text-white leading-tight mb-4 line-clamp-2">{contest.examName}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 text-center">
                                            <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Score</p>
                                            <div className="text-2xl font-black text-white">
                                                {summary.totalMarksObtained} <span className="text-xs text-slate-500">/ {summary.maxPossibleMarks}</span>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                            <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Solved</p>
                                            <div className="text-2xl font-black text-white">
                                                {summary.problemsSolved} <span className="text-xs text-slate-500">/ {summary.totalProblems}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="px-6 pb-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Layers size={14} /> Questions
                                    </h4>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-3">
                                    {submissions.map((sub, idx) => {
                                        const isSolved = sub.marksGet === sub.maxMarks && sub.marksGet > 0;
                                        const isPartial = sub.marksGet > 0 && sub.marksGet < sub.maxMarks;
                                        const isSelected = selectedIdx === idx;
                                        return (
                                            <div key={idx} onClick={() => setSelectedIdx(idx)}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-900/20' : 'bg-[#0F172A] border-white/5 hover:border-white/10 hover:bg-[#162032]'}`}>
                                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                                                <div className="flex items-start justify-between mb-2">
                                                    <h5 className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{sub.title}</h5>
                                                    {isSolved ? <CheckCircle size={16} className="text-emerald-400 shrink-0"/> : isPartial ? <AlertCircle size={16} className="text-amber-400 shrink-0"/> : <XCircle size={16} className="text-slate-600 shrink-0"/>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${DIFFICULTY_COLORS[sub.difficulty]}`}>{sub.difficulty}</span>
                                                    <span className="text-xs font-mono font-bold text-slate-400">{sub.marksGet}/{sub.maxMarks}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0"> 
                                {activeSubmission ? (
                                    <>
                                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0F172A]">
                                            <div>
                                                <h2 className="text-xl font-black text-white mb-1.5">{activeSubmission.title}</h2>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                                    <span className="flex items-center gap-1.5"><Clock size={14}/> {activeSubmission.timeTaken || 0}ms</span>
                                                    <span className="flex items-center gap-1.5"><Code size={14}/> Python 3</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeSubmission.marksGet === activeSubmission.maxMarks ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {activeSubmission.marksGet === activeSubmission.maxMarks ? 'Accepted' : 'Review Needed'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Marks</p>
                                                <p className="text-2xl font-black text-white">{activeSubmission.marksGet} <span className="text-sm text-slate-600">/ {activeSubmission.maxMarks}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex-1 relative">
                                            {activeSubmission.lastCode ? (
                                                <Editor
                                                    height="100%"
                                                    defaultLanguage="python"
                                                    theme="vs-dark"
                                                    value={activeSubmission.lastCode}
                                                    options={{
                                                        readOnly: true,
                                                        domReadOnly: true, 
                                                        minimap: { enabled: false },
                                                        scrollBeyondLastLine: false,
                                                        fontSize: 14,
                                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                        padding: { top: 20, bottom: 20 },
                                                        lineNumbers: 'on',
                                                        renderLineHighlight: 'none',
                                                        contextmenu: false,
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#0F172A]">
                                                    <Code size={48} className="opacity-20 mb-4" />
                                                    <p>No code submitted for this problem</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#0F172A]">
                                        Select a problem to view details
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Button */}
                {!showResultView && style.button && !isEnded && !isCompleted && !isLoadingResult && !resultError && (
                    <div className="p-8 pt-0 mt-auto bg-[#0F172A]">
                        <button onClick={() => navigate(`/contests/${contest._id}`)} // Uses examId for routing
                            className="w-full py-5 rounded-[2rem] bg-white text-[#0F172A] hover:bg-blue-50 font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                            {style.button} {contest.status === 'LIVE' ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// --- CARD COMPONENT ---
const ContestCard = ({ contest, onSelect }) => {
    const navigate = useNavigate();
    const style = STATUS_STYLES[contest.status] || STATUS_STYLES.PAST;
    const startDate = new Date(contest.startTime);
    // Determine if user can view results: Either status is PAST or they explicitly completed it
    const isEnded = contest.status === 'PAST';
    const isCompleted = contest.submissionStatus === 'Completed';

    const handleEnter = (e) => { e.stopPropagation(); navigate(`/contests/${contest._id}`); };
    const handleViewResults = (e) => { e.stopPropagation(); onSelect(contest); };

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSelect(contest)}
            className={`
                group relative flex flex-col justify-between
                bg-[#0F172A]/80 backdrop-blur-2xl border border-white/5 
                hover:border-white/20 rounded-[2.5rem] p-5 transition-all duration-300 
                hover:shadow-2xl hover:-translate-y-1 cursor-pointer
                min-h-[260px] ${style.glow}
            `}>
            
            <div className={`absolute top-0 right-0 w-[250px] h-[250px] rounded-full blur-[90px] -mr-10 -mt-10 transition-all opacity-10 group-hover:opacity-20 ${style.gradient.split(' ')[0].replace('/20', '')}`}></div>
            
            <div className="relative z-10 flex flex-col h-full gap-3">
                <div className="flex justify-between items-start pt-1">
                    <div className="flex flex-col items-center justify-center pl-2 min-w-[50px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{startDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-white leading-none mt-0.5">{startDate.getDate()}</span>
                    </div>

                    <div className="flex items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border backdrop-blur-md h-full ${style.bg} ${style.text} ${style.border}`}>
                            <style.icon size={12} className={contest.status === 'LIVE' ? 'animate-pulse' : ''} />
                            {contest.status === 'LIVE' ? <CountdownTimer targetDate={contest.endTime} label="" /> : style.label}
                        </div>
                    </div>
                </div>

                <div className="flex-grow px-2 py-1">
                    <h3 className="text-xl font-black text-white leading-tight group-hover:text-blue-100 transition-colors line-clamp-3 mb-1">
                        {contest.examName}
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="col-span-2 flex items-center justify-between px-2 pb-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <Hourglass size={14} className="text-blue-400" />
                                <span className="text-xs font-bold text-slate-300">{contest.totalDuration}m</span>
                            </div>
                            <div className="w-px h-3 bg-white/10"></div>
                            <div className="flex items-center gap-1.5">
                                <Medal size={14} className="text-amber-400" />
                                <span className="text-xs font-bold text-slate-300">{contest.totalMarks}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-400">{formatTimeRange(contest.startTime, contest.endTime)}</span>
                        </div>
                    </div>

                    <div className="col-span-2">
                        {isEnded || isCompleted ? (
                            <button onClick={handleViewResults} className="w-full py-3.5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2 group-hover:text-white group-hover:border-white/20">
                                <FileText size={16} /> View Results
                            </button>
                        ) : contest.status === 'UPCOMING' ? (
                            <div className="w-full py-3.5 rounded-[1.5rem] bg-white/5 text-orange-300/60 font-black uppercase tracking-widest text-[10px] border border-orange-500/10 flex items-center justify-center gap-2 cursor-not-allowed">
                                <Lock size={14} /> Scheduled
                            </div>
                        ) : (
                            <button onClick={handleEnter} className="w-full py-3.5 rounded-[1.5rem] bg-white text-[#0F172A] hover:bg-blue-50 font-black uppercase tracking-widest text-xs shadow-lg shadow-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                {style.button} <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE ---
const ContestPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [filter, setFilter] = useState('ALL');
    const [contests, setContests] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [selectedContest, setSelectedContest] = useState(null);
    const [resultDetails, setResultDetails] = useState(null);
    const [fetchingResult, setFetchingResult] = useState(false);
    const [resultError, setResultError] = useState(null);
    
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    // ⚡️ FETCH CONTESTS FROM API
    useEffect(() => {
        const fetchContests = async () => {
            if (authLoading || !user) return;
            try {
                // FIXED: Use relative path. 'api' already has baseURL.
                const response = await api.get(`api/student/get-exams`); 
                
                // DESTRUCTURE & FLATTEN DATA
                const { active, upcoming, completed } = response.data.data;

                // MAP TO UI STATUS
                const formattedActive = active.map(c => ({ ...c, status: 'LIVE' }));
                const formattedUpcoming = upcoming.map(c => ({ ...c, status: 'UPCOMING' }));
                const formattedPast = completed.map(c => ({ ...c, status: 'PAST' }));

                setContests([...formattedActive, ...formattedUpcoming, ...formattedPast]);
                setAnimate(true);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, [user, authLoading]);

    // ⚡️ FETCH RESULT DETAILS FROM API
    const handleContestSelect = async (contest) => {
        setSelectedContest(contest);
        setResultDetails(null); 
        setResultError(null);

        // Logic: If status is PAST (Completed category) OR explicitly marked completed
        const shouldFetchResults = contest.status === 'PAST' || contest.submissionStatus === 'Completed';

        if (shouldFetchResults) {
            setFetchingResult(true);
            try {
                // FIXED: Use relative path & contest.examId
                const response = await api.get(`api/student/view-result/${contest.examId}`);
                
                // Response structure is { success: true, data: { ... } }
                setResultDetails(response.data.data); 
            } catch (error) {
                console.error("Failed to fetch results:", error);
                setResultError(error.response?.data?.message || "Failed to load result data. Please try again.");
            } finally {
                setFetchingResult(false);
            }
        }
    };

    const filteredContests = useMemo(() => filter === 'ALL' ? contests : contests.filter(c => c.status === filter), [filter, contests]);

    if (authLoading || loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-32 relative overflow-hidden selection:bg-blue-500/30">
            <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-8 relative z-10">
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">Arena</span>
                        </h1>
                    </div>
                </div>

                <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {['ALL', 'LIVE', 'UPCOMING', 'PAST'].map(tab => (
                        <button key={tab} onClick={() => setFilter(tab)}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${filter === tab ? 'bg-white text-[#071225] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transform -translate-y-0.5' : 'bg-[#0F172A] text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredContests.length > 0 ? (
                            filteredContests.map((contest) => (
                                <ContestCard 
                                    key={contest._id} 
                                    contest={contest} 
                                    onSelect={handleContestSelect} 
                                />
                            ))
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-[#0F172A]/40 rounded-[3rem] border-2 border-dashed border-white/10 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10"><Sparkles className="text-slate-500" size={32} /></div>
                                <h3 className="text-xl font-black text-white mb-2">No Contests Found</h3>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {selectedContest && (
                    <ContestModal 
                        contest={selectedContest} 
                        resultData={resultDetails}
                        isLoadingResult={fetchingResult}
                        resultError={resultError}
                        onClose={() => setSelectedContest(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContestPage;