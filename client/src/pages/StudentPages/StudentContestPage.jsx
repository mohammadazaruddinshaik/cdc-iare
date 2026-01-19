import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, ArrowRight, ArrowUpRight, Zap, Timer, History, 
    X, Sparkles, CalendarDays, 
    Hourglass, Medal, Target, FileText
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
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
        button: 'Enter Contest'
    },
    UPCOMING: {
        label: 'Upcoming',
        gradient: 'from-orange-500/20 to-amber-500/5',
        text: 'text-orange-300',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
        icon: Timer,
        glow: 'shadow-[0_0_30px_rgba(249,115,22,0.1)]',
        button: 'Register Now'
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

// --- COMPONENT: DETAILS MODAL ---
const ContestModal = ({ contest, onClose }) => {
    const navigate = useNavigate();
    if (!contest) return null;

    const style = STATUS_STYLES[contest.status] || STATUS_STYLES.PAST;
    const isEnded = contest.status === 'PAST';
    
    return (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            <motion.div className="relative bg-[#0F172A] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5"
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}>
                
                <div className="flex items-center justify-between p-8 pb-4">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.text} ${style.border} bg-white/5`}>
                        {style.label}
                    </span>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={20}/></button>
                </div>

                <div className="px-8 pb-8">
                    <h3 className="text-3xl font-black text-white leading-tight mb-8 mt-2">{contest.examName}</h3>
                    
                    <div className="space-y-4">
                        {/* Info Block */}
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

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-[#020617]/50 border border-white/5 rounded-[2rem] p-5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Score</p>
                                <div className="flex items-center gap-2 mt-2 font-black text-xl text-white">
                                    <Medal size={20} className="text-amber-400"/> 
                                    {isEnded && contest.marksObtained !== undefined 
                                        ? `${contest.marksObtained} / ${contest.totalMarks}` 
                                        : contest.totalMarks}
                                </div>
                             </div>
                             <div className="bg-[#020617]/50 border border-white/5 rounded-[2rem] p-5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                                <div className="flex items-center gap-2 mt-2 font-black text-xl text-white"><Hourglass size={20} className="text-blue-400"/> {contest.totalDuration}m</div>
                             </div>
                        </div>
                    </div>
                </div>

                {style.button && !isEnded && (
                    <div className="p-8 pt-0">
                        <button onClick={() => navigate(`/contests/${contest.id}`)}
                            className="w-full py-5 rounded-[2rem] bg-white text-[#0F172A] hover:bg-blue-50 font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                            {style.button} {contest.status === 'LIVE' ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// --- COMPONENT: ULTRA-MODERN CARD ---
const ContestCard = ({ contest, onSelect }) => {
    const navigate = useNavigate();
    const style = STATUS_STYLES[contest.status] || STATUS_STYLES.PAST;
    const startDate = new Date(contest.startTime);
    const isEnded = contest.status === 'PAST';

    const handleEnter = (e) => { e.stopPropagation(); navigate(`/contests/${contest.id}`); };
    const handleViewResults = (e) => { e.stopPropagation(); onSelect(contest); };

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSelect(contest)}
            className={`
                group relative flex flex-col justify-between
                bg-[#0F172A]/80 backdrop-blur-2xl border border-white/5 
                hover:border-white/20 
                rounded-[2.5rem] p-4 transition-all duration-300 
                hover:shadow-2xl hover:-translate-y-1 cursor-pointer
                ${style.glow}
            `}>
            
            {/* Background Blob */}
            <div className={`absolute top-0 right-0 w-[250px] h-[250px] rounded-full blur-[90px] -mr-10 -mt-10 transition-all opacity-10 group-hover:opacity-20 ${style.gradient.split(' ')[0].replace('/20', '')}`}></div>
            
            <div className="relative z-10 flex flex-col h-full gap-2">
                
                {/* 1. TOP SECTION: Status & Date */}
                <div className="flex justify-between items-start pt-2">
                     {/* Date Pill */}
                    <div className="flex flex-col items-center justify-center pl-2 min-w-[50px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{startDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-white leading-none mt-0.5">{startDate.getDate()}</span>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border backdrop-blur-md h-full ${style.bg} ${style.text} ${style.border}`}>
                            <style.icon size={12} className={contest.status === 'LIVE' ? 'animate-pulse' : ''} />
                            {contest.status === 'LIVE' ? <CountdownTimer targetDate={contest.endTime} label="" /> : style.label}
                        </div>
                    </div>
                </div>

                {/* 2. MIDDLE SECTION: Content */}
                <div className="flex-grow px-2 py-4">
                    <h3 className="text-xl font-black text-white leading-tight group-hover:text-blue-100 transition-colors line-clamp-3 mb-1">
                        {contest.examName}
                    </h3>
                </div>

                {/* 3. BOTTOM SECTION: Stats & Action */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    
                    {/* Stats Block - UPDATED: Logic for Obtained/Total Marks */}
                    <div className="col-span-2 flex items-center justify-between px-2 pb-4">
                        {/* Left Side: Duration & Score */}
                        <div className="flex items-center gap-3">
                            {/* Duration */}
                            <div className="flex items-center gap-1.5">
                                <Hourglass size={14} className="text-blue-400" />
                                <span className="text-xs font-bold text-slate-300">{contest.totalDuration}m</span>
                            </div>
                            
                            <div className="w-px h-3 bg-white/10"></div>
                            
                            {/* Score Section: Updates to "Obtained/Total" if Ended */}
                            <div className="flex items-center gap-1.5">
                                <Medal size={14} className="text-amber-400" />
                                <span className="text-xs font-bold text-slate-300">
                                    {isEnded && contest.marksObtained !== undefined 
                                        ? `${contest.marksObtained} / ${contest.totalMarks}` 
                                        : contest.totalMarks}
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Time Window */}
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-400">{formatTimeRange(contest.startTime, contest.endTime)}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-2">
                        {isEnded ? (
                            <button onClick={handleViewResults} className="w-full py-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2 group-hover:text-white group-hover:border-white/20">
                                <FileText size={16} /> View Results
                            </button>
                        ) : (
                            <button onClick={handleEnter} className="w-full py-4 rounded-[1.5rem] bg-white text-[#0F172A] hover:bg-blue-50 font-black uppercase tracking-widest text-xs shadow-lg shadow-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
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
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

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
                        id: item._id, examName: item.examName, status: status, startTime: item.startTime,
                        endTime: item.endTime, totalMarks: item.totalMarks, totalDuration: item.totalDuration,
                        marksObtained: item.marksObtained, submissionStatus: item.submissionStatus
                    });
                    setContests([...(res.data.active || []).map(i => mapContest(i, 'LIVE')), 
                                 ...(res.data.upcoming || []).map(i => mapContest(i, 'UPCOMING')), 
                                 ...(res.data.completed || []).map(i => mapContest(i, 'PAST'))]);
                }
            } catch (error) { console.error("Failed to fetch contests:", error); } 
            finally { setLoading(false); setAnimate(true); }
        };
        if (user) fetchContests(); else if (!authLoading) setLoading(false);
    }, [user, authLoading]);

    const filteredContests = useMemo(() => filter === 'ALL' ? contests : contests.filter(c => c.status === filter), [filter, contests]);

    if (authLoading || loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-32 relative overflow-hidden selection:bg-blue-500/30">
            <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-8 relative z-10">
                
                {/* --- HEADER ROW --- */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">Contest Arena</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm">Compete, solve, and climb the leaderboard.</p>
                    </div>
                </div>

                {/* --- FILTER TABS --- */}
                <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {['ALL', 'LIVE', 'UPCOMING', 'PAST'].map(tab => (
                        <button key={tab} onClick={() => setFilter(tab)}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${filter === tab ? 'bg-white text-[#071225] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transform -translate-y-0.5' : 'bg-[#0F172A] text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* --- CARD GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredContests.length > 0 ? (
                            filteredContests.map((contest) => <ContestCard key={contest.id} contest={contest} onSelect={setSelectedContest} />)
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
                {selectedContest && <ContestModal contest={selectedContest} onClose={() => setSelectedContest(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default ContestPage;