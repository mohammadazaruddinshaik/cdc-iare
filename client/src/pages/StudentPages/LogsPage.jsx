/**
 * @file LogsPage.jsx
 * @description Dark-themed Attendance Logs with bold typography and enhanced visuals.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Calendar, BookOpen, ChevronLeft, ChevronRight, X,
    CheckCircle2, XCircle, PieChart as PieChartIcon,
    CalendarDays, BarChart2, Filter, Terminal, Cloud, Database, Coffee, Server,
    Clock, ArrowUpRight, Sparkles, Layers
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext'; 

// --- DUMMY DATA ---
const DUMMY_DATA = {
    attendance: {
        overallAttendance: {
            totalDays: 45,
            presentDays: 38
        },
        courseAttendance: {
            "CP": { "totalDays": 12, "presentDays": 10, "_id": "69558fc48ef190d9e65e045a" },
            "JFS": { "totalDays": 15, "presentDays": 12, "_id": "695574b7dbc5c7e1a6d10033" },
            "DBS": { "totalDays": 10, "presentDays": 9, "_id": "695574b7dbc5c7e1a6d10034" },
            "AWS": { "totalDays": 8, "presentDays": 7, "_id": "695574b7dbc5c7e1a6d10035" }
        },
        dailyLogs: [
            { date: "2025-12-31T14:00:00.000Z", course: "JFS", status: "Present", _id: "1" },
            { date: "2025-12-31T09:00:00.000Z", course: "CP", status: "Present", _id: "2" },
            { date: "2025-12-30T10:00:00.000Z", course: "AWS", status: "Absent", _id: "3" },
            { date: "2025-12-29T11:00:00.000Z", course: "DBS", status: "Present", _id: "4" },
            { date: "2025-12-28T09:00:00.000Z", course: "CP", status: "Present", _id: "5" },
            { date: "2025-12-27T14:00:00.000Z", course: "JFS", status: "Present", _id: "6" },
            { date: "2025-12-26T10:00:00.000Z", course: "AWS", status: "Present", _id: "7" },
        ]
    }
};

// --- STYLING CONFIGURATION (FIXED: Passing Components, not Elements) ---
const COURSE_STYLES = {
    'CP': { 
        label: 'Competitive Programming', 
        gradient: 'from-violet-500/20 to-purple-500/5',
        text: 'text-violet-300',
        border: 'border-violet-500/30',
        icon: Terminal // Pass the component function, NOT <Terminal />
    },
    'AWS': { 
        label: 'Amazon Web Services', 
        gradient: 'from-orange-500/20 to-amber-500/5',
        text: 'text-orange-300',
        border: 'border-orange-500/30',
        icon: Cloud 
    },
    'DBS': { 
        label: 'Database Solutions', 
        gradient: 'from-emerald-500/20 to-teal-500/5',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
        icon: Database 
    },
    'JFS': { 
        label: 'Java Full Stack', 
        gradient: 'from-rose-500/20 to-red-500/5',
        text: 'text-rose-300',
        border: 'border-rose-500/30',
        icon: Coffee 
    },
    'DEFAULT': { 
        label: 'Course', 
        gradient: 'from-slate-500/20 to-gray-500/5',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        icon: BookOpen 
    }
};

const getCourseStyle = (code) => COURSE_STYLES[code] || COURSE_STYLES['DEFAULT'];
const getDateKey = (date) => date.toISOString().split('T')[0];

// ----------------------------------
// --- CALENDAR MODAL (DARK THEME) ---
// ----------------------------------
const CalendarModal = ({ logs, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const { dailyStatus } = useMemo(() => {
        const daily = {};
        logs.forEach(log => {
            const key = getDateKey(log.date);
            if (!daily[key] || daily[key] === 'Present') {
                daily[key] = log.status; 
            }
        });
        return { dailyStatus: daily };
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
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronLeft size={20}/></button>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><ChevronRight size={20}/></button>
                        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-slate-400 transition-all ml-2"><X size={20}/></button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                        {daysOfWeek.map(d => <span key={d} className="text-xs font-black text-slate-500 uppercase tracking-widest">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const dateKey = getDateKey(new Date(year, month, day + 1));
                            const status = dailyStatus[dateKey];
                            
                            let styles = "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5";
                            if (status === 'Present') styles = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
                            if (status === 'Absent') styles = "bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]";

                            return (
                                <div key={day} className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${styles}`}>
                                    {day + 1}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-6 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Present</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div> Absent</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ----------------------------------
// --- PIE CHART MODAL (DARK THEME) ---
// ----------------------------------
const StatsModal = ({ data, onClose }) => {
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

    return (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            <motion.div className="relative bg-[#0F172A] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5"
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                
                <div className="flex items-center justify-between p-8 pb-0">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <PieChartIcon className="text-blue-400" size={24}/> Analytics
                        </h3>
                        <p className="text-slate-400 font-medium text-sm mt-1">Attendance distribution by course</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={20}/></button>
                </div>

                <div className="flex flex-col md:flex-row items-center p-8 gap-10">
                    <div className="w-full md:w-1/2 h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-white">{data.reduce((acc, c) => acc + c.value, 0)}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Classes</span>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-3">
                        {data.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="font-bold text-slate-200 text-sm">{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-white">{entry.value}</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">{entry.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ----------------------------------
// --- MAIN PAGE COMPONENT ---
// ----------------------------------
const LogsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [overallStats, setOverallStats] = useState({ total: 0, present: 0, percentage: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [animate, setAnimate] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        
        // --- USING DUMMY DATA ---
        const data = DUMMY_DATA; 

        if (data?.attendance) {
            const processedLogs = (data.attendance.dailyLogs || []).map((log, index) => ({
                id: log._id || index,
                date: new Date(log.date),
                courseName: log.course,
                status: log.status
            }));
            setLogs(processedLogs);

            const groups = processedLogs.filter(l => l.status === 'Present').reduce((acc, l) => {
                acc[l.courseName] = (acc[l.courseName] || 0) + 1;
                return acc;
            }, {});
            const stats = Object.entries(groups).map(([name, value]) => ({
                name, value, 
                percentage: processedLogs.length > 0 ? Math.round((value / processedLogs.length) * 100) : 0
            })).sort((a,b) => b.value - a.value);
            setCourseStats(stats);

            const { totalDays, presentDays } = data.attendance.overallAttendance || { totalDays: 0, presentDays: 0 };
            setOverallStats({
                total: totalDays,
                present: presentDays,
                percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
            });
        }

        setTimeout(() => setAnimate(true), 100);
    }, [user, navigate]);

    const groupedLogs = useMemo(() => {
        const filtered = logs.filter(log => 
            log.courseName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.reduce((acc, log) => {
            const monthYear = log.date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(log);
            return acc;
        }, {});
    }, [logs, searchTerm]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#071225] text-white font-sans pb-20 relative overflow-hidden selection:bg-blue-500/30">
            
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-30"></div>
            </div>

            {/* Header */}
            <div className="px-4 sm:px-6 relative z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent my-4"></div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                
                {/* --- TITLE & CONTROLS --- */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
        {/* Added 'pb-2' to prevent the descender of 'g' from being cut off */}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 pb-2">
            Attendance Logs
        </span>
    </h1>
</div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-64">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 group-focus-within:opacity-60 transition duration-500 blur-sm"></div>
                            <div className="relative flex items-center bg-[#0F172A] border border-white/10 rounded-xl shadow-xl">
                                <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search course..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none rounded-xl font-medium"
                                />
                            </div>
                        </div>
                        <button onClick={() => setIsChartOpen(true)} className="p-2.5 bg-[#0F172A] hover:bg-white/10 text-white rounded-xl border border-white/10 shadow-lg transition-all active:scale-95" title="Analytics">
                            <BarChart2 size={20} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => setIsCalendarOpen(true)} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95" title="Calendar View">
                            <Calendar size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* --- QUICK STATS ROW --- */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    
                    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-blue-500/20 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                            <Layers size={24} />
                        </div>
                        <div>
                            <span className="block text-3xl font-black text-white">{overallStats.total}</span>
                            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Total Classes</span>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <span className="block text-3xl font-black text-white">{overallStats.present}</span>
                            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Present</span>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-purple-500/20 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
                            <PieChartIcon size={24} />
                        </div>
                        <div>
                            <span className="block text-3xl font-black text-white">{overallStats.percentage}%</span>
                            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Attendance Rate</span>
                        </div>
                    </div>
                </div>

                {/* --- LOGS LIST --- */}
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
                                {/* Sticky Month Header */}
                                <div className="bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                    <h2 className="font-black text-white text-lg flex items-center gap-2">
                                        <CalendarDays className="text-blue-400" size={20}/> {monthYear}
                                    </h2>
                                    <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wide border border-white/5">
                                        {groupedLogs[monthYear].length} Entries
                                    </span>
                                </div>
                                
                                <div className="divide-y divide-white/5">
                                    {groupedLogs[monthYear].map((log) => {
                                        const style = getCourseStyle(log.courseName);
                                        const isPresent = log.status === 'Present';

                                        return (
                                            <div key={log.id} className="p-5 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-5">
                                                    {/* Date Box */}
                                                    <div className="flex flex-col items-center justify-center bg-white/5 w-14 h-14 rounded-2xl border border-white/10 shadow-sm group-hover:border-white/20 transition-all">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {log.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-black text-white leading-none mt-0.5">
                                                            {log.date.getDate()}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Details */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className={`p-1.5 rounded-lg border flex items-center justify-center bg-gradient-to-br ${style.gradient} ${style.border} ${style.text}`}>
                                                                <style.icon size={14} />
                                                            </div>
                                                            <h4 className="font-bold text-white text-base">{style.label}</h4>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 ml-0.5">
                                                            <Clock size={12} strokeWidth={2.5} /> {log.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border flex items-center gap-2 shadow-sm ${
                                                    isPresent
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                    {isPresent ? <CheckCircle2 size={14} strokeWidth={3}/> : <XCircle size={14} strokeWidth={3}/>}
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
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Layers className="text-slate-500" size={40} />
                            </div>
                            <h3 className="text-xl font-black text-white">No Logs Found</h3>
                            <p className="text-slate-400 font-medium text-sm mt-1 max-w-xs">We couldn't find any attendance records for your search.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {isCalendarOpen && <CalendarModal logs={logs} onClose={() => setIsCalendarOpen(false)} />}
                {isChartOpen && <StatsModal data={courseStats} onClose={() => setIsChartOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default LogsPage;