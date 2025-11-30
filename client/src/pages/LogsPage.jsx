/**
 * @file LogsPage.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 04 Sep 2025
 * @description A page to display attendance logs with monthly grouping and modal calendar/stats.
 * @version 4.5.1 - Fixed pie chart clipping by increasing modal container size.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Calendar, 
    BookOpen, 
    ChevronLeft, 
    ChevronRight, 
    X,
    CheckSquare, 
    XSquare, 
    ListChecks,
    Percent,
    PieChart as PieChartIcon
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_BASE_URL;

// --- Course Name Mapping ---
const courseNameMapping = {
    'CP': 'Competitive Programming',
    'JFS': 'Java Full Stack',
    'DBS': 'Database Solutions',
};
const getFullCourseName = (shortName) => courseNameMapping[shortName] || shortName;

// --- Date Helper ---
const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
};

// --- Skeleton Loader Component (Dark Theme) ---
const LogsSkeletonLoader = () => (
    <div className="animate-pulse space-y-2 px-4 py-3">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center py-2.5 border-b border-white/10">
                <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-48"></div>
                    <div className="h-3 bg-white/10 rounded w-32"></div>
                </div>
                <div className="h-6 w-20 bg-white/10 rounded-full"></div>
            </div>
        ))}
    </div>
);

// ----------------------------------
// --- CALENDAR MODAL ---
// ----------------------------------
const CalendarModal = ({ logs, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const { dailyStatus, stats } = useMemo(() => {
        const daily = {};
        const monthLogs = [];
        logs.forEach(log => {
            if (log.date.getFullYear() === year && log.date.getMonth() === month) {
                monthLogs.push(log);
            }
        });
        for (let i = monthLogs.length - 1; i >= 0; i--) {
            const log = monthLogs[i];
            const key = getDateKey(log.date);
            if (!daily[key]) daily[key] = { status: 'Absent' };
            if (log.status === 'Present') daily[key].status = 'Present';
        }
        const presentDays = monthLogs.filter(log => log.status === 'Present').length;
        const totalDays = monthLogs.length;
        const absentDays = totalDays - presentDays;
        const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        return { 
            dailyStatus: daily, 
            stats: { total: totalDays, present: presentDays, absent: absentDays, percentage: percentage } 
        };
    }, [logs, year, month]);

    const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            ></motion.div>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-lg bg-gray-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{monthName} {year}</h3>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-gray-400 transition-colors" aria-label="Close calendar">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-center mb-4 space-x-4">
                        <button onClick={goToPrevMonth} className="p-1.5 rounded-full hover:bg-white/20 text-gray-400 transition-colors" aria-label="Previous month">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToNextMonth} className="p-1.5 rounded-full hover:bg-white/20 text-gray-400 transition-colors" aria-label="Next month">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 mb-5">
                        <h4 className="text-sm font-semibold text-white mb-3">Monthly Stats</h4>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <PieChartIcon className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
                                <div className="text-xl font-bold">{stats.percentage}%</div>
                                <div className="text-xs text-gray-400">Overall</div>
                            </div>
                            <div className="text-center">
                                <ListChecks className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                                <div className="text-xl font-bold">{stats.total}</div>
                                <div className="text-xs text-gray-400">Total Days</div>
                            </div>
                            <div className="text-center">
                                <CheckSquare className="w-5 h-5 text-green-400 mx-auto mb-1.5" />
                                <div className="text-xl font-bold">{stats.present}</div>
                                <div className="text-xs text-gray-400">Presents</div>
                            </div>
                            <div className="text-center">
                                <XSquare className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                                <div className="text-xl font-bold">{stats.absent}</div>
                                <div className="text-xs text-gray-400">Absents</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {daysOfWeek.map(day => (
                            <div key={day} className="w-12 h-12 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase">{day}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                            <div key={`empty-${index}`} className="w-12 h-12"></div>
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const dayNumber = day + 1;
                            const dateKey = getDateKey(new Date(year, month, dayNumber));
                            const dayData = dailyStatus[dateKey];
                            let dayClass = "w-9 h-9 flex items-center justify-center font-medium text-sm rounded-full";
                            if (dayData) {
                                if (dayData.status === 'Present') dayClass += " border-2 border-green-400 text-white";
                                else dayClass += " border-2 border-red-400 text-white";
                            } else {
                                dayClass += " text-gray-400";
                            }
                            return (
                                <div key={dayNumber} className="w-12 h-12 flex items-center justify-center relative">
                                    <span className={dayClass}>{dayNumber}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ----------------------------------
// --- ENHANCED PIE CHART MODAL ---
// ----------------------------------
const StatsPieChartModal = ({ data, onClose }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9d'];
    const RADIAN = Math.PI / 180;
    
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
        // Use payload.percentage which we pre-calculated
        if (payload.percentage < 5) return null; 
        
        const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
                {`${payload.percentage}%`}
            </text>
        );
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            ></motion.div>
            
            {/* --- INCREASED WIDTH from max-w-3xl to max-w-5xl --- */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-5xl bg-gray-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold text-white">Attendance by Course</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-gray-400 transition-colors" aria-label="Close stats">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {data.length > 0 ? (
                    // --- NEW 2-COLUMN LAYOUT with Larger Gap ---
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        
                        {/* Left Column: Chart - INCREASED HEIGHT from h-80 to h-96 */}
                        <div className="w-full h-96">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={140}
                                        fill="#8884d8"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(20, 20, 20, 0.8)',
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px'
                                        }}
                                        itemStyle={{ color: '#E5E7EB' }}
                                        formatter={(value) => [`${value} days`, 'Present']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Right Column: Structured Legend */}
                        <div className="space-y-3 overflow-y-auto max-h-96 custom-scrollbar pr-2 flex flex-col justify-center">
                            <h4 className="font-semibold text-gray-300 mb-2">Breakdown (Total Days Present)</h4>
                            {data.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full flex-shrink-0" 
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="text-base font-medium text-white">{entry.name}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <div className="text-base font-bold text-white">{entry.value} days</div>
                                        <div className="text-sm text-gray-400">{entry.percentage}% of total</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-400 h-64 flex items-center justify-center">
                        No "Present" logs found to build analytics.
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
    // --- State ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [animate, setAnimate] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isChartOpen, setIsChartOpen] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const fetchLogData = useCallback(async () => {
        try {
            setLoading(true);
            const rollno = sessionStorage.getItem('userIdentifier');
            if (!rollno) throw new Error("Roll number not found. Please log in again.");
        
            const fetchDataPromise = fetch(`${API_URL}/api/Student/getLogData/${rollno}`, {
                method: 'GET',
                credentials: "include"
            });
            const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1500));

            const [response] = await Promise.all([fetchDataPromise, minDelayPromise]);

            if (!response.ok) {
                sessionStorage.clear();
                navigate('/', { replace: true });
                return;
            }

            const data = await response.json();

            if (data.attendance && data.attendance.dailyLogs) {
                const processedLogs = data.attendance.dailyLogs.map((log, index) => ({
                    id: log._id || `log_${index}`,
                    date: new Date(log.date),
                    courseShort: log.course,
                    courseName: getFullCourseName(log.course),
                    status: log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : 'Unknown',
                }));
                setLogs(processedLogs.reverse());
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("Failed to fetch log data:", err);
            sessionStorage.clear();
            navigate('/', { replace: true });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchLogData();
    }, [fetchLogData]);


    // --- Process data for the GROUPED LIST view ---
    const groupedLogs = useMemo(() => {
        const filtered = logs.filter(log => 
            log.courseName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.reduce((acc, log) => {
            const monthYear = log.date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push({
                ...log,
                date: log.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            });
            return acc;
        }, {});
    }, [logs, searchTerm]);

    // --- Process data for COURSE PIE CHART ---
    const courseStats = useMemo(() => {
        const presentLogs = logs.filter(log => log.status === 'Present');
        const totalPresent = presentLogs.length; // Total for percentage calculation

        const groups = presentLogs.reduce((acc, log) => {
            const course = log.courseName;
            if (!acc[course]) {
                acc[course] = 0;
            }
            acc[course]++;
            return acc;
        }, {});

        return Object.entries(groups).map(([name, value]) => ({
            name: name,
            value: value, // Raw count of present days
            percentage: totalPresent > 0 ? Math.round((value / totalPresent) * 100) : 0
        }));
    }, [logs]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'Absent': return 'bg-red-500/20 text-red-300 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans">
            <div className="px-4 sm:px-6 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>
            <main className="px-4 sm:px-6 py-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <h1 className="text-3xl sm:text-3xl font-bold flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Attendance Logs
                        </h1>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by course..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all"
                                />
                            </div>
                            
                            <div> 
                                <button
                                    onClick={() => setIsChartOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                                    aria-label="View statistics"
                                >
                                    <PieChartIcon size={16} />
                                </button>
                            </div>
                            <div> 
                                <button
                                    onClick={() => setIsCalendarOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                                    aria-label="View calendar"
                                >
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4">
                                <LogsSkeletonLoader />
                            </div>
                        ) : Object.keys(groupedLogs).length > 0 ? (
                            Object.keys(groupedLogs).map(monthYear => (
                                <section key={monthYear} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                    <h2 className="font-bold text-lg text-white bg-white/10 px-4 py-3 z-10 border-b border-white/10">
                                        {monthYear}
                                    </h2>
                                    <div className="hidden md:grid grid-cols-10 gap-4 px-4 py-3 font-bold text-xs text-gray-400 uppercase border-b border-white/10">
                                        <div className="col-span-3 flex items-center gap-2"><Calendar size={14} /> Date</div>
                                        <div className="col-span-5 flex items-center gap-2"><BookOpen size={14} /> Course Name</div>
                                        <div className="col-span-2 text-right">Status</div>
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {groupedLogs[monthYear].map((log, index) => (
                                            <div 
                                                key={log.id} 
                                                className="px-4 py-3 border-b border-white/5 transition-all duration-300 hover:bg-white/10 text-sm" 
                                                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                                            >
                                                <div className="grid grid-cols-2 md:grid-cols-10 gap-4 items-center">
                                                    <div className="md:hidden font-semibold text-gray-400 text-xs uppercase">Date</div>
                                                    <div className="md:hidden text-right font-semibold text-gray-400 text-xs uppercase">Status</div>
                                                    
                                                    <div className="md:col-span-3 text-left">{log.date}</div>
                                                    
                                                    <div className={`md:hidden justify-self-end font-semibold py-1 px-3 rounded-full text-xs inline-block border ${getStatusClass(log.status)}`}>{log.status}</div>
                                                    
                                                    <div className="col-span-2 md:col-span-5 md:border-t-0 border-t border-white/10 pt-2 md:pt-0 font-medium">{log.courseName}</div>
                                                    
                                                    <div className="hidden md:flex col-span-2 justify-end">
                                                        <span className={`font-semibold py-1 px-3 rounded-full text-xs border ${getStatusClass(log.status)}`}>{log.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl text-center p-8 text-gray-400">
                                {searchTerm ? `No logs found for "${searchTerm}".` : "No attendance logs available."}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODALS RENDERED AT THE END */}
            <AnimatePresence>
                {isCalendarOpen && (
                    <CalendarModal 
                        logs={logs} 
                        onClose={() => setIsCalendarOpen(false)} 
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isChartOpen && (
                    <StatsPieChartModal
                        data={courseStats}
                        onClose={() => setIsChartOpen(false)}
                    />
                )}
            </AnimatePresence>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.4); }
            `}</style>
        </div>
    );
};

export default LogsPage;