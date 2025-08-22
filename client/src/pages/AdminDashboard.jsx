import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, CalendarCheck, FileText, ArrowRight, Clock, CheckSquare, AlertCircle, User, LogOut, Menu, X } from 'lucide-react';
import Header from '../components/Header';

// --- Generic Session Bar Chart Component (No changes needed) ---
const SessionBarChart = ({ data, barColor }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return <div className="text-center text-gray-500 py-4"><p>No sessions scheduled for today.</p></div>;
    }

    return (
        <div className="space-y-3 mt-2 pr-2">
            {data.map((item, index) => {
                const percentage = item.total > 0 ? (item.present / item.total) * 100 : 0;
                return (
                    <div key={`${item.batchName}-${index}`} style={{ animation: `fadeInUp 0.5s ease-out ${index * 150}ms forwards`, opacity: 0 }}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-gray-700 truncate pr-2">{item.batchName}</span>
                            {item.status === 'pending' ? (
                                <span className="text-xs font-bold text-amber-600 flex-shrink-0 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Pending
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-gray-600 flex-shrink-0">{item.present}/{item.total}</span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 shadow-inner overflow-hidden">
                            {item.status === 'pending' ? (
                                <div className="bg-transparent h-1.5 rounded-full"></div>
                            ) : (
                                <div className={`${barColor} h-1.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


// --- Timetable and Subject Data (Used for mapping API data to sessions) ---
const batchWiseTimetable = {
    "SKILLUP BATCH-1": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "AWS", room: "5102" }] },
    "SKILLUP BATCH-2": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5106" }] },
    "SKILLUP BATCH-3": { "Friday": [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5104" }] },
    "SKILLNEXT BATCH-1": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5204" }] },
    "SKILLNEXT BATCH-2": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5104" }] },
    "SKILLNEXT BATCH-3": { "Friday": [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5102" }] },
    "SKILLBRIDGE BATCH-1": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5101" }] },
    "SKILLBRIDGE BATCH-2": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5005" }] },
    "SKILLBRIDGE BATCH-3": { "Friday": [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5201" }] },
    "SKILLBRIDGE BATCH-4": { "Friday": [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5101" }] },
    "SKILLBRIDGE BATCH-5": { "Friday": [{ time: "09:30AM - 12:15PM", subject: "DBMS", room: "5106" }] }
};


// --- Section Header Component (No changes needed) ---
const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div>
        <h2 className="text-md lg:text-lg font-bold text-white">{title}</h2>
    </div>
);


// --- Main Admin Dashboard Component ---
const AdminDashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Helper function to format API batch names
    const formatApiBatchName = (apiName) => {
        const parts = apiName.replace('attendance_', '').split('-');
        if (parts.length < 2) return apiName; // fallback
        const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        return `${name.toUpperCase()} BATCH-${parts[1]}`;
    };

    useEffect(() => {
        localStorage.setItem("userRole", "admin");

        const fetchAdminData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/Admin/getDashboardData');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'API returned an error');
                }
                
                const apiData = result.data;
                const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

                const morningSessions = [];
                const afternoonSessions = [];

                apiData.attendanceSummary.forEach(summary => {
                    const formattedBatchName = formatApiBatchName(summary.batch);
                    const timetableEntry = batchWiseTimetable[formattedBatchName];
                    const daySchedule = timetableEntry ? timetableEntry[today] : null;

                    if (daySchedule && daySchedule.length > 0) {
                        const classInfo = daySchedule[0];
                        const startTime = classInfo.time.split(' - ')[0];
                        let [time, modifier] = startTime.split(/(AM|PM)/);
                        let [hours] = time.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

                        const isMorning = parseInt(hours) < 13;

                        const sessionDetails = {
                            batchName: `${formattedBatchName} (${classInfo.subject})`,
                            present: summary.presentCount,
                            total: summary.totalCount,
                            status: 'marked' // Assume 'marked' if data is present in the summary
                        };

                        if (isMorning) {
                            morningSessions.push(sessionDetails);
                        } else {
                            afternoonSessions.push(sessionDetails);
                        }
                    }
                });

                setAdminData({
                    stats: { 
                        totalStudents: apiData.totalStudents, 
                        totalFaculty: apiData.totalFaculty 
                    },
                    sessions: { 
                        morning: morningSessions, 
                        afternoon: afternoonSessions 
                    }
                });

            } catch (err) {
                setError(err.message || 'Failed to load dashboard data.');
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
                setAnimate(true);
            }
        };

        fetchAdminData();
    }, []);
    
    if (isLoading) {
        return <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center"><div className="relative"><div className="animate-spin rounded-full h-16 w-16 border-4 border-[#071225] border-t-transparent"></div></div></div>;
    }

    if (error || !adminData) {
        return <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center"><div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4"><h2 className="text-xl font-bold text-red-600 mb-4">An Error Occurred</h2><p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data.'}</p><button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Retry</button></div></div>;
    }

    // --- The rest of the component JSX remains the same ---
    const managementItems = [
        { title: "Manage Students", icon: <Users className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />, count: adminData.stats.totalStudents, description: "View, Add, or Edit Student Details", bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50", path: "/admin/manage-students" },
        { title: "Manage Faculty", icon: <UserCheck className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />, count: adminData.stats.totalFaculty, description: "View, Add, or Edit Faculty Details", bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50", path: "/admin/manage-faculty" },
        { title: "Manage Attendance", icon: <CalendarCheck className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />, description: "Mark or Update Student Attendance", bgColor: "bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50", path: "/admin/manage-attendance" },
    ];

    const sessionItems = [
        { title: "Morning Attendance", icon: <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />, data: adminData.sessions.morning, barColor: 'bg-gradient-to-r from-blue-400 to-indigo-500', bgColor: 'bg-gradient-to-br from-blue-100 to-blue-50' },
        { title: "Afternoon Attendance", icon: <CheckSquare className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />, data: adminData.sessions.afternoon, barColor: 'bg-gradient-to-r from-green-400 to-teal-500', bgColor: 'bg-gradient-to-br from-green-100 to-green-50' },
    ];
    
    const reportItems = [
        { title: "Session Report", icon: <FileText className="w-6 h-6 text-red-600" />, path: '/session-report', bgColor: "bg-gradient-to-br from-red-100 via-red-50 to-pink-50" },
        { title: "Batch Wise Report", icon: <FileText className="w-6 h-6 text-cyan-600" />, path: '/batch-report', bgColor: "bg-gradient-to-br from-cyan-100 via-cyan-50 to-teal-50" },
        { title: "Monthly Report", icon: <FileText className="w-6 h-6 text-emerald-600" />, path: '/monthly-report', bgColor: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50" },
    ];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 20px; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[1.5rem] rounded-br-[1.5rem] sm:rounded-bl-[2rem] sm:rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 pb-6 lg:pb-8 pt-2">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3"></div>
                    <section className="space-y-6 lg:space-y-8">
                        <div>
                            <SectionHeader title="Quick Actions" animate={animate} delay={300} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {managementItems.map((item, index) => (
                                    <div key={index} onClick={() => navigate(item.path)} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex flex-col border border-white/20 relative overflow-hidden group min-h-[140px] lg:min-h-[150px] cursor-pointer ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                                        <div className="flex items-start justify-between mb-2 relative z-10">
                                            <h3 className="font-bold text-sm lg:text-base leading-tight pr-2">{item.title}</h3>
                                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/40 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">{item.icon}</div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3 h-8">{item.description}</p>
                                        <div className="flex items-end justify-between mt-auto">
                                            {item.count ? <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">{item.count}</p> : <div />}
                                            <div className="bg-gray-800 text-white font-bold py-1.5 px-3 rounded-md text-xs self-end shadow-md">Manage</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <SectionHeader title="Download Reports" animate={animate} delay={600} />
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {reportItems.map((item, index) => (
                                    <div key={index} onClick={() => navigate(item.path)} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-between border border-white/20 relative overflow-hidden group min-h-[80px] cursor-pointer ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                                        <div className="flex items-center relative z-10">
                                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0 mr-3">{item.icon}</div>
                                            <h3 className="font-bold text-sm lg:text-base leading-tight pr-2">{item.title}</h3>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="bg-gray-200 group-hover:bg-gray-800 group-hover:text-white text-gray-600 p-2.5 rounded-full transition-colors self-end shadow-md flex items-center justify-center">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
                <h2 className={`text-lg lg:text-xl font-bold text-[#071225] mb-4 transition-opacity duration-1000 delay-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>Today's Attendance</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {sessionItems.map((item, index) => (
                        <div key={index} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex flex-col border border-white/50 relative overflow-hidden group ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                            <div className="flex items-start justify-between mb-2 relative z-10">
                                <h3 className="font-bold text-sm lg:text-base leading-tight pr-2">{item.title}</h3>
                                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/40 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">{item.icon}</div>
                            </div>
                            <div className="relative z-10 mt-auto max-h-48 overflow-y-auto custom-scrollbar">
                                <SessionBarChart data={item.data} barColor={item.barColor} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;