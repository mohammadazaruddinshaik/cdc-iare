import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Search, ListOrdered, ChevronLeft, ChevronRight, Filter, Calendar, BookOpen, Loader2, ClipboardList } from 'lucide-react';
import Header from '../components/Header';

const GlassSkeletonLoader = () => (
    <div className="animate-pulse w-full max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-white/10 rounded-lg"></div>
                <div className="h-10 bg-white/10 rounded-lg"></div>
            </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-white/10">
                <div className="h-4 bg-white/10 rounded col-span-1"></div>
                <div className="h-4 bg-white/10 rounded col-span-4"></div>
                <div className="h-4 bg-white/10 rounded col-span-2"></div>
                <div className="h-4 bg-white/10 rounded col-span-2"></div>
                <div className="h-4 bg-white/10 rounded col-span-3"></div>
            </div>
            <div className="mt-4 space-y-4">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="flex md:grid md:grid-cols-12 gap-4 items-center">
                        <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                            <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                        </div>
                        <div className="hidden md:block col-span-2 h-5 bg-white/10 rounded-md"></div>
                        <div className="hidden md:block col-span-2 h-5 bg-white/10 rounded-md"></div>
                        <div className="w-24 md:w-auto md:col-span-3 h-8 bg-white/10 rounded-md"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ENHANCED Calendar Modal for daily logs
const CalendarModal = ({ dailyLogs, position }) => {
    if (!dailyLogs || dailyLogs.length === 0) return null;

    const [currentDate, setCurrentDate] = useState(() => {
        // Start with the date of the most recent log
        return new Date(dailyLogs.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b).date);
    });

    const logsByDate = useMemo(() => {
        const map = new Map();
        dailyLogs.forEach(log => {
            if (!map.has(log.date)) {
                map.set(log.date, []);
            }
            map.get(log.date).push(log);
        });
        return map;
    }, [dailyLogs]);

    const changeMonth = (offset) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-full h-8"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const logs = logsByDate.get(dateStr);
            
            let bgColor = 'bg-white/10';
            let tooltip = 'No data';

            if (logs && logs.length > 0) {
                const isPresent = logs.some(log => log.status === 'present');
                bgColor = isPresent ? 'bg-green-500/80' : 'bg-red-500/80';
                tooltip = logs.map(log => `${log.course}: ${log.status}`).join(' | ');
            }

            days.push(
                <div key={day} className={`w-full h-8 flex items-center justify-center rounded-full ${bgColor} relative group text-xs`}>
                    {day}
                    <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        {tooltip}
                    </span>
                </div>
            );
        }
        return days;
    };

    return (
        <div
            className="fixed z-50 bg-black/40 backdrop-blur-xl text-white p-3 rounded-2xl shadow-2xl border border-white/20 transition-opacity duration-300 w-72"
            style={{ top: position.y, left: position.x }}
        >
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => changeMonth(-1)} className="hover:bg-white/20 p-1 rounded-full"><ChevronLeft size={16}/></button>
                <h3 className="font-bold text-sm text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeMonth(1)} className="hover:bg-white/20 p-1 rounded-full"><ChevronRight size={16}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-400 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="font-bold text-center">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
                {renderDays()}
            </div>
        </div>
    );
};


const ViewAttendance = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [animate, setAnimate] = useState(false);
    const [modalData, setModalData] = useState({ visible: false, logs: [], position: { x: 0, y: 0 }, key: null });
    const itemsPerPage = 25;

    const listContainerRef = useRef(null);
    const hideTimerRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // REMOVED THE AUTO-SCROLLING EFFECT
    /*
    useEffect(() => {
        if (!loading && listContainerRef.current) {
            listContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage, loading]);
    */

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userRole = localStorage.getItem("userRole");
                let apiUrl;
                
                // Conditional API endpoint based on user role
                if (userRole === 'admin') {
                    apiUrl = 'http://localhost:5000/api/Admin/getViewStudentData';
                } else if (userRole === 'faculty') {
                    apiUrl = 'http://localhost:5000/api/Faculty/getViewStudentData';
                } else {
                    throw new Error("User role not found. Please log in again.");
                }

                const response = await fetch(apiUrl, { method: "GET", credentials: "include" });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setAllStudents(data.AllStudents || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const batches = useMemo(() => ['All', ...[...new Set(allStudents.map(s => s.batch))].sort()], [allStudents]);
    
    const filteredAndSortedStudents = useMemo(() => {
        return allStudents
            .filter(student =>
                (student.rollno.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (selectedBatch === 'All' || student.batch === selectedBatch)
            )
            .sort((a, b) => a.rollno.localeCompare(b.rollno)); // Sort by roll number
    }, [allStudents, searchTerm, selectedBatch]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredAndSortedStudents, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
    
    const courseNames = useMemo(() => {
        if (allStudents.length === 0) return [];
        const courses = new Set();
        allStudents.forEach(student => {
            if (student.courseAttendance) {
                Object.keys(student.courseAttendance).forEach(course => courses.add(course));
            }
        });
        return Array.from(courses).sort();
    }, [allStudents]);

    const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const handleMouseEnter = (e, student) => {
        if (isTouchDevice() || !student.dailyLogs || student.dailyLogs.length === 0) return;
        
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

        const modalWidth = 288;
        const modalHeight = 250;
        let x = e.clientX + 20;
        let y = e.clientY - (modalHeight / 2);

        if (x + modalWidth > window.innerWidth) x = e.clientX - modalWidth - 20;
        if (y < 0) y = 10;
        if (y + modalHeight > window.innerHeight) y = window.innerHeight - modalHeight - 10;

        setModalData({ visible: true, logs: student.dailyLogs, position: { x, y }, key: student.rollno });
    };

    const handleMouseLeave = () => {
        if (isTouchDevice()) return;
        hideTimerRef.current = setTimeout(() => {
            setModalData({ visible: false, logs: [], position: { x: 0, y: 0 }, key: null });
        }, 300);
    };

    const getPercentage = (present, total) => {
        if (!total || total === 0 || !present) return "0.00";
        return ((present / total) * 100).toFixed(2);
    };

    const getPercentageColor = (percentage) => {
        const p = parseFloat(percentage);
        if (p < 60) return 'text-red-400';
        if (p < 75) return 'text-orange-400';
        return 'text-green-400';
    };
    
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex justify-center items-center mt-8 gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 sm:px-4 bg-white/10 rounded-lg mx-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >&laquo;</button>
                <span className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 sm:px-4 bg-white/10 rounded-lg mx-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >&raquo;</button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans">
            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>
            
            {modalData.visible && (
                <div
                    onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
                    onMouseLeave={handleMouseLeave}
                >
                    <CalendarModal key={modalData.key} dailyLogs={modalData.logs} position={modalData.position} />
                </div>
            )}

            <main className="px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="max-w-7xl mx-auto pb-24">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            <ClipboardList className="w-7 h-7 mr-2 sm:mr-3 text-blue-400" /> Attendance Board
                        </h1>
                    </div>
                    {loading ? <GlassSkeletonLoader /> : error ? <div className="text-center p-8 text-red-400">Error: {error}</div> : (
                        <>
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" placeholder="Search by roll no..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select value={selectedBatch} onChange={e => { setSelectedBatch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none appearance-none transition-colors cursor-pointer" style={{backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '10px 10px'}}>
                                            {batches.map(batch => <option key={batch} value={batch} className="bg-[#0A1B3A] text-white">{batch === 'All' ? 'All Batches' : batch}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div ref={listContainerRef}>
                                <div className="flex items-center gap-3 mb-4 mt-8"><ListOrdered className="w-6 h-6 text-blue-300" /><h2 className="text-xl sm:text-2xl font-semibold text-white">Student List ({filteredAndSortedStudents.length})</h2></div>
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 font-bold text-xs text-gray-400 uppercase border-b border-white/10">
                                        <div className="col-span-1">S.No</div>
                                        <div className="col-span-4">Student</div>
                                        {courseNames.slice(0, 5).map(course => <div key={course} className="col-span-1 text-center">{course}</div>)}
                                        <div className="col-span-2 text-right">Overall %</div>
                                    </div>
                                    <div className="max-h-[68vh] overflow-y-auto custom-scrollbar">
                                        {paginatedStudents.map((student, index) => {
                                            const sno = (currentPage - 1) * itemsPerPage + index + 1;
                                            const overallPerc = getPercentage(student.overallAttendance.presentDays, student.overallAttendance.totalDays);
                                            return (
                                                <div key={student.rollno}
                                                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/10"
                                                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                                                    onMouseEnter={(e) => handleMouseEnter(e, student)}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    {/* --- MOBILE VIEW --- */}
                                                    <div className="md:hidden p-3 w-full">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-semibold text-gray-400 text-sm w-6 text-center">{sno}</span>
                                                                <div>
                                                                    <div className="font-semibold text-white text-sm">{student.name}</div>
                                                                    <div className="text-xs text-gray-400 font-mono">{student.rollno}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`font-bold text-lg ${getPercentageColor(overallPerc)}`}>{overallPerc}%</div>
                                                                <div className="text-xs text-gray-400">Overall</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* --- DESKTOP VIEW --- */}
                                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center px-4 py-3">
                                                        <div className="col-span-1 text-base text-gray-400">{sno}</div>
                                                        <div className="col-span-4">
                                                            <div className="font-semibold">{student.name}</div>
                                                            <div className="text-xs text-gray-400 font-mono">{student.rollno}</div>
                                                        </div>
                                                        {courseNames.slice(0, 5).map(course => {
                                                            const att = student.courseAttendance ? student.courseAttendance[course] : null;
                                                            const perc = att ? getPercentage(att.presentDays, att.totalDays) : '0.00';
                                                            return <div key={course} className={`col-span-1 text-center font-semibold text-sm ${getPercentageColor(perc)}`}>{perc}%</div>
                                                        })}
                                                        <div className={`col-span-2 text-right font-bold text-lg ${getPercentageColor(overallPerc)}`}>
                                                            {overallPerc}%
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {renderPagination()}
                            </div>
                        </>
                    )}
                </div>
            </main>
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

export default ViewAttendance;