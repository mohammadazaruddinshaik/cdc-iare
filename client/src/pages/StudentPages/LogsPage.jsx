import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Calendar, BookOpen, ChevronLeft, ChevronRight, X,
    CheckCircle2, XCircle, PieChart as PieChartIcon,
    CalendarDays, BarChart2, Terminal, Cloud, Database, Coffee, Server,
    GitBranch, FileQuestion, FolderOpen
} from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const API_URL = import.meta.env.VITE_BASE_URL;

// Attendance thresholds used to colour-code rates.
const SAFE_RATE = 75;
const WARN_RATE = 60;

// --- STYLING CONFIGURATION ---
const COURSE_STYLES = {
    'CP': {
        label: 'Competitive Programming',
        gradient: 'from-orange-500/20 to-amber-500/5',
        text: 'text-orange-300',
        border: 'border-orange-500/30',
        accent: '#fb923c',
        icon: Terminal
    },
    'AWS': {
        label: 'Amazon Web Services',
        gradient: 'from-violet-500/20 to-purple-500/5',
        text: 'text-violet-300',
        border: 'border-violet-500/30',
        accent: '#a78bfa',
        icon: Cloud
    },
    'DBS': {
        label: 'Database Solutions',
        gradient: 'from-emerald-500/20 to-teal-500/5',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
        accent: '#34d399',
        icon: Database
    },
    'JFS': {
        label: 'Java Full Stack',
        gradient: 'from-rose-500/20 to-red-500/5',
        text: 'text-rose-300',
        border: 'border-rose-500/30',
        accent: '#fb7185',
        icon: Coffee
    },
    'CC': {
        label: 'Cloud Computing',
        gradient: 'from-sky-500/20 to-cyan-500/5',
        text: 'text-sky-300',
        border: 'border-sky-500/30',
        accent: '#38bdf8',
        icon: Server
    },
    'DEVOPS': {
        label: 'DevOps',
        gradient: 'from-indigo-500/20 to-blue-500/5',
        text: 'text-indigo-300',
        border: 'border-indigo-500/30',
        accent: '#818cf8',
        icon: GitBranch
    },
    'DEFAULT': {
        label: 'Course',
        gradient: 'from-slate-500/20 to-gray-500/5',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        accent: '#94a3b8',
        icon: BookOpen
    }
};

const getCourseStyle = (code) => {
    const key = String(code || '').toUpperCase();
    if (COURSE_STYLES[key]) return COURSE_STYLES[key];
    return { ...COURSE_STYLES.DEFAULT, label: key || COURSE_STYLES.DEFAULT.label };
};

const pad = (n) => String(n).padStart(2, '0');

// Local-date key. toISOString() would shift the day for anyone behind UTC.
const getDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "2026-07-21" parsed by `new Date()` is UTC midnight, which lands on the
// previous day in negative-offset timezones. Build it from local parts instead.
const parseLocalDate = (value) => {
    if (value instanceof Date) return value;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return new Date(value);
};

const titleCase = (value) => {
    const s = String(value ?? '').trim();
    if (!s) return 'Unknown';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const rateColor = (pct) => {
    if (pct >= SAFE_RATE) return '#10b981';
    if (pct >= WARN_RATE) return '#f59e0b';
    return '#f43f5e';
};

// ----------------------------------
// --- CALENDAR MODAL ---
// ----------------------------------
const CalendarModal = ({ logs, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dailyStatus = useMemo(() => {
        const daily = {};
        logs.forEach(log => {
            const key = getDateKey(log.date);
            if (!daily[key] || log.status === 'Present') {
                daily[key] = log.status;
            }
        });
        return daily;
    }, [logs]);

    return (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            <motion.div className="relative bg-[#0F172A] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-2xl font-black text-white">{monthName}</h3>
                        <p className="text-slate-400 text-sm font-bold">{year}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronLeft size={20} /></button>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronRight size={20} /></button>
                        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-slate-400 transition-all ml-2"><X size={20} /></button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                        {daysOfWeek.map(d => <span key={d} className="text-xs font-black text-slate-500 uppercase tracking-widest">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center justify-items-center">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const dateKey = getDateKey(new Date(year, month, day + 1));
                            const status = dailyStatus[dateKey];

                            let styles = "bg-white/5 text-slate-400 border border-white/5";
                            if (status === 'Present') styles = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50";
                            if (status === 'Absent') styles = "bg-rose-500/20 text-rose-400 border border-rose-500/50";

                            return (
                                <div key={day} className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold ${styles}`}>
                                    {day + 1}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-6 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Absent</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ----------------------------------
// --- ANALYTICS MODAL ---
// ----------------------------------
const StatsModal = ({ courses, overall, onClose }) => {
    const donutData = [
        { name: 'Present', value: overall.present },
        { name: 'Absent', value: Math.max(overall.total - overall.present, 0) }
    ].filter(d => d.value > 0);

    const hasData = overall.total > 0;

    return (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            <motion.div className="relative bg-[#0F172A] w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-[2rem] shadow-2xl border border-white/10 ring-1 ring-white/5"
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>

                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 sm:p-8 pb-4 bg-[#0F172A]/95 backdrop-blur-md border-b border-white/5">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                            <PieChartIcon className="text-blue-400" size={22} /> Analytics
                        </h3>
                        <p className="text-slate-400 font-medium text-sm mt-1">Your attendance rate, overall and by course</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition shrink-0"><X size={20} /></button>
                </div>

                {!hasData ? (
                    <div className="w-full text-center py-16 px-8">
                        <p className="text-slate-400 font-bold">Nothing to chart yet. Analytics appear once attendance is recorded.</p>
                    </div>
                ) : (
                    <div className="p-6 sm:p-8 pt-6 space-y-8">

                        {/* Overall: present vs absent */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                            <div className="w-44 h-44 relative shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={58}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {donutData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.name === 'Present' ? '#10b981' : '#f43f5e'} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-4xl font-black" style={{ color: rateColor(overall.percentage) }}>
                                        {overall.percentage}%
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Overall</span>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-3 gap-3 text-center sm:text-left">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="block text-2xl font-black text-white">{overall.total}</span>
                                    <span className="text-[11px] font-bold text-slate-400">Classes held</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="block text-2xl font-black text-emerald-400">{overall.present}</span>
                                    <span className="text-[11px] font-bold text-emerald-300/80">Attended</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                    <span className="block text-2xl font-black text-rose-400">{overall.total - overall.present}</span>
                                    <span className="text-[11px] font-bold text-rose-300/80">Missed</span>
                                </div>
                            </div>
                        </div>

                        {/* Per course rates */}
                        <div>
                            <div className="flex items-baseline justify-between mb-4">
                                <h4 className="text-sm font-black text-white">By course</h4>
                                <span className="text-[11px] font-bold text-slate-500">Attended / held</span>
                            </div>

                            <div className="space-y-4">
                                {courses.map((course) => {
                                    const style = getCourseStyle(course.name);
                                    const CourseIcon = style.icon;
                                    const barColor = rateColor(course.percentage);

                                    return (
                                        <div key={course.name}>
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`p-1.5 rounded-lg border flex items-center justify-center bg-gradient-to-br ${style.gradient} ${style.border} ${style.text} shrink-0`}>
                                                        <CourseIcon size={14} />
                                                    </div>
                                                    <span className="font-bold text-slate-200 text-sm truncate">{style.label}</span>
                                                </div>
                                                <div className="flex items-baseline gap-2 shrink-0">
                                                    <span className="text-xs font-bold text-slate-400">{course.present}/{course.total}</span>
                                                    <span className="text-sm font-black tabular-nums" style={{ color: barColor }}>{course.percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: barColor }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${course.percentage}%` }}
                                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-6 text-[11px] font-bold text-slate-500">
                                Green is {SAFE_RATE}% or above, amber is {WARN_RATE}&ndash;{SAFE_RATE - 1}%, red is below {WARN_RATE}%.
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// ----------------------------------
// --- MAIN PAGE COMPONENT ---
// ----------------------------------
const LogsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [apiCourseAttendance, setApiCourseAttendance] = useState({});
    const [apiOverall, setApiOverall] = useState({ totalDays: 0, presentDays: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [animate, setAnimate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/'); return; }

        let cancelled = false;

        const fetchLogsData = async () => {
            try {
                const [, response] = await Promise.all([
                    new Promise(resolve => setTimeout(resolve, 1000)),
                    fetch(`${API_URL}/api/student/get-log-data`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    })
                ]);

                if (response.status === 401 || response.status === 403) {
                    logout();
                    return;
                }

                if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

                const raw = await response.json();

                // The endpoint returns dailyLogs / courseAttendance / overallAttendance
                // at the top level. Kept tolerant in case the shape changes.
                const payload = raw?.attendance ?? raw?.data?.attendance ?? raw?.data ?? raw ?? {};

                if (cancelled) return;

                const daily = (payload.dailyLogs || []).map((log, index) => ({
                    id: log._id || `${log.date}-${log.course}-${index}`,
                    date: parseLocalDate(log.date),
                    courseName: String(log.course || '').toUpperCase(),
                    status: titleCase(log.status)
                }));
                daily.sort((a, b) => b.date - a.date);

                setLogs(daily);
                setApiCourseAttendance(payload.courseAttendance || {});
                setApiOverall(payload.overallAttendance || { totalDays: 0, presentDays: 0 });
            } catch (err) {
                console.error("Error fetching logs:", err);
                if (!cancelled) setError("Couldn't load your attendance. Check your connection and try again.");
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setTimeout(() => setAnimate(true), 100);
                }
            }
        };

        fetchLogsData();
        return () => { cancelled = true; };
    }, [user, navigate, logout]);

    // Stats are derived from dailyLogs, which is the authoritative record.
    // courseAttendance / overallAttendance are used only as a fallback.
    const courseStats = useMemo(() => {
        if (logs.length > 0) {
            const tally = {};
            logs.forEach(log => {
                if (!tally[log.courseName]) tally[log.courseName] = { present: 0, total: 0 };
                tally[log.courseName].total += 1;
                if (log.status === 'Present') tally[log.courseName].present += 1;
            });
            return Object.entries(tally)
                .map(([name, { present, total }]) => ({
                    name,
                    present,
                    total,
                    percentage: total > 0 ? Math.round((present / total) * 100) : 0
                }))
                .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
        }

        return Object.entries(apiCourseAttendance)
            .map(([name, val]) => {
                const total = val?.totalDays || 0;
                const present = val?.presentDays || 0;
                return { name, present, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
            })
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [logs, apiCourseAttendance]);

    const overallStats = useMemo(() => {
        if (logs.length > 0) {
            const present = logs.filter(l => l.status === 'Present').length;
            return {
                total: logs.length,
                present,
                percentage: Math.round((present / logs.length) * 100)
            };
        }
        const total = apiOverall.totalDays || 0;
        const present = apiOverall.presentDays || 0;
        return { total, present, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
    }, [logs, apiOverall]);

    const groupedLogs = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const filtered = logs.filter(log =>
            log.courseName.toLowerCase().includes(term) ||
            getCourseStyle(log.courseName).label.toLowerCase().includes(term)
        );
        return filtered.reduce((acc, log) => {
            const monthYear = log.date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(log);
            return acc;
        }, {});
    }, [logs, searchTerm]);

    if (isLoading) return <Loader />;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-40 md:pb-32 relative overflow-hidden selection:bg-blue-500/30">

            <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 relative z-10">

                {/* --- TITLE & CONTROLS --- */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 pb-2">
                            Attendance Logs
                        </span>
                    </h1>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 md:flex-none group">
                            <div className="relative flex items-center bg-[#0F172A] border border-white/10 rounded-full shadow-xl">
                                <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search course..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none rounded-full font-medium"
                                />
                            </div>
                        </div>

                        {/* Analytics is now reachable on mobile too. */}
                        <button
                            onClick={() => setIsChartOpen(true)}
                            className="p-2.5 bg-[#0F172A] hover:bg-white/10 text-white rounded-xl border border-white/10 shadow-lg transition-all active:scale-95 shrink-0"
                            title="Analytics"
                        >
                            <BarChart2 size={20} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0"
                            title="Calendar View"
                        >
                            <Calendar size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-bold">
                        {error}
                    </div>
                )}

                {/* --- QUICK STATS ROW --- */}
                <div className={`grid grid-cols-3 gap-3 md:gap-5 mb-10 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-blue-500/20 p-4 md:p-5 rounded-[1.5rem] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <span className="block text-2xl md:text-3xl font-black text-white">{overallStats.total}</span>
                        <span className="text-[10px] md:text-xs font-bold text-blue-300 uppercase tracking-wider">Total Classes</span>
                    </div>

                    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-emerald-500/20 p-4 md:p-5 rounded-[1.5rem] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <span className="block text-2xl md:text-3xl font-black text-white">{overallStats.present}</span>
                        <span className="text-[10px] md:text-xs font-bold text-emerald-300 uppercase tracking-wider">Present</span>
                    </div>

                    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-purple-500/20 p-4 md:p-5 rounded-[1.5rem] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <span className="block text-2xl md:text-3xl font-black text-white">{overallStats.percentage}%</span>
                        <span className="text-[10px] md:text-xs font-bold text-purple-300 uppercase tracking-wider">Attendance Rate</span>
                    </div>
                </div>

                {/* --- LOGS LIST / EMPTY STATE --- */}
                <div className="space-y-8">
                    {Object.keys(groupedLogs).length > 0 ? (
                        Object.keys(groupedLogs).map((monthYear, idx) => (
                            <motion.section
                                key={monthYear}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 + 0.2 }}
                                className="bg-[#0F172A]/40 backdrop-blur-md rounded-[1.5rem] border border-white/5 overflow-hidden"
                            >
                                <div className="bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-10 px-5 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between gap-3">
                                    <h2 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                                        <CalendarDays className="text-blue-400" size={20} /> {monthYear}
                                    </h2>
                                    <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wide border border-white/5 shrink-0">
                                        {groupedLogs[monthYear].length} Entries
                                    </span>
                                </div>

                                <div className="divide-y divide-white/5">
                                    {groupedLogs[monthYear].map((log) => {
                                        const style = getCourseStyle(log.courseName);
                                        const CourseIcon = style.icon;
                                        const isPresent = log.status === 'Present';

                                        return (
                                            <div key={log.id} className="p-4 sm:p-5 hover:bg-white/5 transition-colors flex items-center justify-between gap-3 group">
                                                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                                    <div className="flex flex-col items-center justify-center bg-white/5 w-14 h-14 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all shrink-0">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {log.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-black text-white leading-none mt-0.5">
                                                            {log.date.getDate()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`p-1.5 rounded-lg border flex items-center justify-center bg-gradient-to-br ${style.gradient} ${style.border} ${style.text} shrink-0`}>
                                                            <CourseIcon size={14} />
                                                        </div>
                                                        <h4 className="font-bold text-white text-sm sm:text-base truncate">{style.label}</h4>
                                                    </div>
                                                </div>

                                                <div className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold uppercase tracking-wider border flex items-center gap-1.5 sm:gap-2 shrink-0 ${isPresent
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    }`}>
                                                    {isPresent ? <CheckCircle2 size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                                                    {log.status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-[#0F172A]/40 rounded-[2rem] border-2 border-dashed border-white/10 backdrop-blur-sm">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                                {searchTerm ? (
                                    <FileQuestion className="text-slate-500" size={40} />
                                ) : (
                                    <FolderOpen className="text-slate-500" size={40} />
                                )}
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">
                                {searchTerm ? 'No Search Results' : 'No Data Available'}
                            </h3>
                            <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">
                                {searchTerm
                                    ? `We couldn't find any courses matching "${searchTerm}".`
                                    : "You have no attendance records yet. Once classes start, they'll appear here."}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isCalendarOpen && <CalendarModal logs={logs} onClose={() => setIsCalendarOpen(false)} />}
                {isChartOpen && <StatsModal courses={courseStats} overall={overallStats} onClose={() => setIsChartOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default LogsPage;