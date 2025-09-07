/**
 * @file LogsPage.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 04 Sep 2025
 * @description A page to display attendance logs with a skeleton loader, robust error handling, and a minimum loading duration.
 * @version 2.1.0 - Added a minimum delay to the loading state.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, Calendar, BookOpen } from 'lucide-react';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_BASE_URL;

// --- Skeleton Loader Component ---
const LogsSkeletonLoader = () => (
    <div className="animate-pulse space-y-2 px-4 py-3">
        {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center py-2">
                <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-48"></div>
                    <div className="h-3 bg-white/10 rounded w-32"></div>
                </div>
                <div className="h-6 w-20 bg-white/10 rounded-full"></div>
            </div>
        ))}
    </div>
);


const LogsPage = () => {
    // --- State ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [animate, setAnimate] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const courseNameMapping = {
        'CP': 'Competitive Programming',
        'JFS': 'Java Full Stack',
        'AWS': 'Amazon Web Services',
        'DBMS': 'Database Management System',
    };

    const getFullCourseName = (shortName) => courseNameMapping[shortName] || shortName;

    useEffect(() => {
        const fetchLogData = async () => {
            try {
                setLoading(true);
                const rollno = sessionStorage.getItem('userIdentifier');

                if (!rollno) {
                    throw new Error("Roll number not found. Please log in again.");
                }
            
                // <<< 1. Create two promises: one for the fetch, one for a minimum delay >>>
                const fetchDataPromise = fetch(`${API_URL}/api/Student/getLogData/${rollno}`, {
                    method: 'GET',
                    credentials: "include"
                });

                // Set a minimum 2-second delay
                const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));

                // <<< 2. Wait for both the data and the delay to finish >>>
                const [response] = await Promise.all([fetchDataPromise, minDelayPromise]);

                if (!response.ok) {
                       sessionStorage.clear();
                       navigate('/', { replace: true });
                }

                const data = await response.json();

                if (data.attendance && data.attendance.dailyLogs) {
                    const processedLogs = data.attendance.dailyLogs.map((log, index) => ({
                        id: log._id || `log_${index}`,
                        date: new Date(log.date).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        }),
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
                // This will only run after the minimum delay has passed
                setLoading(false);
            }
        };

        fetchLogData();
    }, [navigate]);


    const filteredLogs = useMemo(() => {
        if (!searchTerm) return logs;
        return logs.filter(log => log.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [logs, searchTerm]);

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
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            <ClipboardList className="w-7 h-7 mr-2 text-blue-400" />
                            Attendance Logs
                        </h1>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by course..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        {/* --- Table Header --- */}
                        <div className="hidden md:grid grid-cols-10 gap-4 px-4 py-3 font-bold text-xs text-gray-400 uppercase border-b border-white/10">
                            <div className="col-span-3 flex items-center gap-2"><Calendar size={14} /> Date</div>
                            <div className="col-span-5 flex items-center gap-2"><BookOpen size={14} /> Course Name</div>
                            <div className="col-span-2 text-right">Status</div>
                        </div>
                        <div className="max-h-[68vh] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <LogsSkeletonLoader />
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log, index) => (
                                    <div key={log.id} className="px-4 py-3 border-b border-white/5 transition-all duration-300 hover:bg-white/10 text-sm" style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards`, opacity: 0 }}>
                                        <div className="grid grid-cols-2 md:grid-cols-10 gap-4 items-center">
                                            {/* --- Mobile View Labels --- */}
                                            <div className="md:hidden font-semibold text-gray-400 text-xs uppercase">Date</div>
                                            <div className="md:hidden text-right font-semibold text-gray-400 text-xs uppercase">Status</div>
                                            
                                            {/* --- Data: Date --- */}
                                            <div className="md:col-span-3 text-left">{log.date}</div>

                                            {/* --- Data: Status (Mobile) --- */}
                                            <div className={`md:hidden justify-self-end font-semibold py-1 px-3 rounded-full text-xs inline-block border ${getStatusClass(log.status)}`}>{log.status}</div>
                                            
                                            {/* --- Data: Course Name --- */}
                                            <div className="col-span-2 md:col-span-5 md:border-t-0 border-t border-white/10 pt-2 md:pt-0 font-medium">{log.courseName}</div>
                                            
                                            {/* --- Data: Status (Desktop) --- */}
                                            <div className="hidden md:flex col-span-2 justify-end">
                                                <span className={`font-semibold py-1 px-3 rounded-full text-xs border ${getStatusClass(log.status)}`}>{log.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 text-gray-400">
                                    {searchTerm ? `No logs found for "${searchTerm}".` : "No attendance logs available."}
                                </div>
                            )}
                        </div>
                    </div>
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

export default LogsPage;