import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, ArrowRight, ArrowUpRight, Zap, Timer, History, 
    X, Sparkles, CalendarDays, CheckCircle2, 
    AlertCircle, Hourglass, XCircle, BarChart2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTS ---
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

// --- CONFIG ---
const backendUrl = (import.meta.env.VITE_BASE_URL || "http://localhost:5000").replace(/\/$/, '');

// --- STYLING CONSTANTS ---
const STATUS_STYLES = {
    LIVE: {
        label: 'Live Now',
        gradient: 'from-emerald-500/20 to-teal-500/5',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        icon: Zap,
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        button: 'Enter Contest'
    },
    UPCOMING: {
        label: 'Upcoming',
        gradient: 'from-orange-500/20 to-amber-500/5',
        text: 'text-orange-300',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
        icon: Timer,
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
        button: 'Register Now'
    },
    PAST: {
        label: 'Ended',
        gradient: 'from-slate-500/20 to-gray-500/5',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        bg: 'bg-slate-500/10',
        icon: History,
        glow: '',
        button: null
    }
};

// --- HELPERS ---
const formatTimeRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const format = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${format(s)} - ${format(e)}`;
};

const formatDateFull = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// --- COMPONENT: COUNTDOWN TIMER ---
const CountdownTimer = ({ targetDate, label }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(targetDate).getTime() - now;

            if (distance < 0) {
                setTimeLeft("00:00:00");
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const dStr = days > 0 ? `${days}d ` : '';
            const hStr = hours.toString().padStart(2, '0');
            const mStr = minutes.toString().padStart(2, '0');
            const sStr = seconds.toString().padStart(2, '0');

            setTimeLeft(`${dStr}${hStr}:${mStr}:${sStr}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <span className="font-mono font-bold tracking-widest tabular-nums">
            {label} {timeLeft}
        </span>
    );
};

// --- COMPONENT: DETAILS MODAL ---
const ContestModal = ({ contest, onClose }) => {
    const navigate = useNavigate();
    if (!contest) return null;

    const style = STATUS_STYLES[contest.status] || STATUS_STYLES.PAST;
    
    const isEnded = contest.status === 'PAST';
    const status = contest.submissionStatus || "Not Attempted";
    const isAttempted = status === "Submitted" || status === "Completed";
    const showStats = isEnded || isAttempted;

    let statusConfig = { color: 'text-slate-400', icon: AlertCircle, label: status };
    
    if (isAttempted) {
        statusConfig = { color: 'text-emerald-400', icon: CheckCircle2, label: 'Submitted' };
    } else if (isEnded && status === 'Not Attempted') {
        statusConfig = { color: 'text-rose-400', icon: XCircle, label: 'Missed' };
    } else if (status === 'In-Progress' && isEnded) {
         statusConfig = { color: 'text-amber-400', icon: AlertCircle, label: 'Incomplete' };
    }

    return (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <motion.div className="relative bg-[#0F172A] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5"
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}>
                
                <div className="flex items-center justify-between p-6 pb-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.text} ${style.border} bg-white/5`}>
                        {style.label}
                    </span>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={18}/></button>
                </div>

                <div className="px-6 pb-6">
                    <h3 className="text-2xl font-black text-white leading-tight mb-6 mt-2">
                        {contest.examName}
                    </h3>

                    <div className="space-y-3">
                        <div className="bg-[#0F172A]/50 border border-white/5 rounded-[1.5rem] p-5 flex flex-col gap-3">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                    <CalendarDays size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</p>
                                    <p className="text-sm font-bold text-white">{formatDateFull(contest.startTime)}</p>
                                </div>
                             </div>

                             <div className="w-full h-px bg-white/5"></div>

                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                                    <Clock size={18} />
                                </div>
                                 <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Time Window</p>
                                    <p className="text-sm font-bold text-white">{formatTimeRange(contest.startTime, contest.endTime)}</p>
                                </div>
                             </div>
                        </div>

                        {showStats ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-[1.5rem] p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">Score Obtained</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-amber-400">{contest.marksObtained}</span>
                                            <span className="text-sm font-bold text-slate-500">/ {contest.totalMarks}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0F172A]/50 border border-white/5 rounded-[1.5rem] p-4 flex flex-col justify-between">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">My Status</p>
                                    <div className={`flex items-center gap-2 mt-2 font-bold text-sm ${statusConfig.color}`}>
                                        <statusConfig.icon size={16} />
                                        <span>{statusConfig.label}</span>
                                    </div>
                                </div>

                                <div className="bg-[#0F172A]/50 border border-white/5 rounded-[1.5rem] p-4 flex flex-col justify-between">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                                    <div className="flex items-center gap-2 mt-2 font-bold text-sm text-blue-300">
                                        <Hourglass size={16} />
                                        <span>{contest.totalDuration} Min</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0F172A]/50 border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                    <span className="text-white font-bold flex items-center gap-2 text-sm">
                                        <AlertCircle size={16} className="text-slate-400"/> {contest.submissionStatus}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                                    <span className="text-white font-bold text-sm">{contest.totalDuration} Min</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {style.button && !isEnded && (
                    <div className="p-6 pt-2">
                        <button 
                            onClick={() => navigate(`/contests/${contest.id}`)}
                            className="w-full py-3.5 rounded-full bg-white text-[#0F172A] hover:bg-blue-50 font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {style.button} 
                            {contest.status === 'LIVE' ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}
                        </button>
                    </div>
                )}

            </motion.div>
        </motion.div>
    );
};

// --- COMPONENT: CURVY CONTEST CARD ---
const ContestCard = ({ contest, onSelect }) => {
    const navigate = useNavigate();
    const style = STATUS_STYLES[contest.status] || STATUS_STYLES.PAST;
    const startDate = new Date(contest.startTime);
    const isEnded = contest.status === 'PAST';

    // Handler for LIVE/UPCOMING -> Navigates to Exam Page
    const handleEnter = (e) => {
        e.stopPropagation(); 
        navigate(`/contests/${contest.id}`);
    };

    // Handler for ENDED -> Opens Modal (View Details)
    const handleViewDetails = (e) => {
        e.stopPropagation();
        onSelect(contest);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                group relative flex flex-col 
                bg-[#0F172A]/60 backdrop-blur-xl border border-white/5 
                hover:border-white/20 hover:bg-[#111c30]
                rounded-[2rem] p-5 min-h-[170px] transition-all duration-300 
                hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden
                ${style.glow}
            `}
            // Clicking the card body also opens the modal (good for mobile)
            onClick={() => onSelect(contest)}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mr-10 -mt-10 transition-colors opacity-30 ${style.gradient.split(' ')[0].replace('/20', '')}`}></div>

            {/* --- ACTION BUTTON (Top Right) --- */}
            {isEnded ? (
                // ANALYSIS BUTTON (BarChart Icon) - For Past Exams
                <button 
                    onClick={handleViewDetails}
                    className={`
                        absolute top-5 right-5
                        w-10 h-10 rounded-full flex items-center justify-center 
                        bg-white/5 text-slate-300 shadow-sm
                        hover:bg-white hover:text-[#0F172A] hover:scale-110 active:scale-95 
                        transition-all duration-300 border border-white/10
                        z-20
                    `}
                    title="View Analysis / Result"
                >
                    <BarChart2 size={18} strokeWidth={2.5} /> 
                </button>
            ) : (
                // ENTER BUTTON (Arrow Icon) - For Active/Upcoming
                <button 
                    onClick={handleEnter}
                    className={`
                        absolute top-5 right-5
                        w-10 h-10 rounded-full flex items-center justify-center 
                        bg-white text-[#0F172A] shadow-lg shadow-white/10
                        hover:scale-110 active:scale-95 transition-all duration-300
                        border-2 border-transparent group-hover:border-blue-200/50
                        z-20
                    `}
                    title="Enter Contest Page"
                >
                    <ArrowUpRight size={20} strokeWidth={2.5} />
                </button>
            )}

            <div className="relative z-10 h-full flex flex-col justify-between">
                
                {/* 1. Header: Date Box */}
                <div className="mb-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 shadow-sm group-hover:border-white/20 transition-all backdrop-blur-md">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {startDate.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-white leading-none mt-0.5">
                            {startDate.getDate()}
                        </span>
                    </div>
                </div>

                {/* 2. Content: Title 
                    Added right padding (pr-12) to ensure text never overlaps the absolute button.
                */}
                <div className="mb-auto pr-12"> 
                    <h3 className="text-lg font-black text-white leading-tight group-hover:text-blue-100 transition-colors line-clamp-2">
                        {contest.examName}
                    </h3>
                </div>

                {/* 3. Footer: Status Pill & Time */}
                <div className="flex items-end justify-between mt-4">
                    {/* Status Pill */}
                    {contest.status === 'LIVE' ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
                            <Zap size={10} className="animate-pulse" />
                            <CountdownTimer targetDate={contest.endTime} label="Ends:" />
                        </div>
                    ) : contest.status === 'UPCOMING' ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
                             <Timer size={10} />
                             <CountdownTimer targetDate={contest.startTime} label="Starts:" />
                        </div>
                    ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-[#0F172A]/50 backdrop-blur-md ${style.text} ${style.border}`}>
                            <History size={10} strokeWidth={3} /> {style.label}
                        </span>
                    )}

                    {/* Time Range */}
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold ml-2">
                        <Clock size={12} className={style.text} strokeWidth={2.5} />
                        <span>{formatTimeRange(contest.startTime, contest.endTime)}</span>
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
    const [animate, setAnimate] = useState(false);

    // FETCH DATA
    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/student/get-exams`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' 
                });

                const res = await response.json();

                if (res.success && res.data) {
                    const mapContest = (item, status) => ({
                        id: item._id,          
                        examName: item.examName,    
                        status: status,             
                        startTime: item.startTime,
                        endTime: item.endTime,
                        totalMarks: item.totalMarks,
                        totalDuration: item.totalDuration,
                        marksObtained: item.marksObtained,
                        submissionStatus: item.submissionStatus
                    });

                    // Flatten lists based on structure
                    const active = (res.data.active || []).map(item => mapContest(item, 'LIVE'));
                    const upcoming = (res.data.upcoming || []).map(item => mapContest(item, 'UPCOMING'));
                    const completed = (res.data.completed || []).map(item => mapContest(item, 'PAST'));

                    // Concatenate: LIVE first, then UPCOMING, then PAST
                    setContests([...active, ...upcoming, ...completed]);
                }
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            } finally {
                setLoading(false);
                setAnimate(true);
            }
        };

        if (user) {
            fetchContests();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const filteredContests = useMemo(() => {
        if (filter === 'ALL') return contests;
        return contests.filter(c => c.status === filter);
    }, [filter, contests]);

    if (authLoading || loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-32 relative overflow-hidden selection:bg-blue-500/30">
            
            <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-10 relative z-10">
                
                <div className={`space-y-2 mb-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                            Contest Arena
                        </span>
                    </h1>
                </div>

                <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {['ALL', 'LIVE', 'UPCOMING', 'PAST'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`
                                px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border
                                ${filter === tab 
                                    ? 'bg-white text-[#071225] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transform -translate-y-0.5' 
                                    : 'bg-[#0F172A] text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredContests.length > 0 ? (
                            filteredContests.map((contest) => (
                                <ContestCard 
                                    key={contest.id} 
                                    contest={contest} 
                                    onSelect={setSelectedContest} 
                                />
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-[#0F172A]/40 rounded-[3rem] border-2 border-dashed border-white/10 backdrop-blur-sm"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                                    <Sparkles className="text-slate-500" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">No Contests Found</h3>
                                <p className="text-slate-400 font-medium text-sm">There are no contests in this category at the moment.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {selectedContest && (
                    <ContestModal 
                        contest={selectedContest} 
                        onClose={() => setSelectedContest(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContestPage;