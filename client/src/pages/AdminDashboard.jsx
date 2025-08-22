import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, CalendarCheck, Download, FileText, ArrowRight, Clock, CheckSquare, AlertCircle, User, LogOut, Menu, X } from 'lucide-react';
import Header from '../components/Header';

// --- Generic Session Bar Chart Component ---
const SessionBarChart = ({ data, barColor }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return <div className="text-center text-gray-500 py-4"><p>No sessions scheduled.</p></div>;
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
                                <span className="text-xs font-bold text-gray-600 flex-shrink-0">
                                    {item.present}/{item.total}
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 shadow-inner overflow-hidden">
                            {item.status === 'pending' ? (
                                <div className="bg-transparent h-1.5 rounded-full"></div>
                            ) : (
                                <div
                                    className={`${barColor} h-1.5 rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- Timetable and Subject Data ---
const batchWiseTimetable = {
    "SKILLUP BATCH-1": { Monday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5102" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5102" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "DBMS", room: "5102" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5102" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "AWS", room: "5102" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5102" }] },
    "SKILLUP BATCH-2": { Monday: [{ time: "09:30AM - 12:15PM", subject: "AWS", room: "5106" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5106" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5106" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5106" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5106" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5106" }] },
    "SKILLUP BATCH-3": { Monday: [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5104" }], Tuesday: [{ time: "01:15PM - 03:50PM", subject: "AWS", room: "5104" }], Wednesday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5104" }], Thursday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5104" }], Friday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5104" }], Saturday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5104" }] },
    "SKILLNEXT BATCH-1": { Monday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5204" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "DBMS", room: "5204" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5204" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5204" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5204" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5204" }] },
    "SKILLNEXT BATCH-2": { Monday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5104" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5104" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5104" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5104" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5104" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5104" }] },
    "SKILLNEXT BATCH-3": { Monday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5102" }], Tuesday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5102" }], Wednesday: [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5102" }], Thursday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5102" }], Friday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5102" }], Saturday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5102" }] },
    "SKILLBRIDGE BATCH-1": { Monday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5101" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5101" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5101" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5101" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5101" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5101" }] },
    "SKILLBRIDGE BATCH-2": { Monday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5005" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "DBMS", room: "5005" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5005" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5005" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5005" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5005" }] },
    "SKILLBRIDGE BATCH-3": { Monday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5201" }], Tuesday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5201" }], Wednesday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5201" }], Thursday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5201" }], Friday: [{ time: "01:15PM - 03:50PM", subject: "DBMS", room: "5201" }], Saturday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5201" }] },
    "SKILLBRIDGE BATCH-4": { Monday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5101" }], Tuesday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5101" }], Wednesday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5101" }], Thursday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5101" }], Friday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5101" }], Saturday: [{ time: "09:30AM - 12:15PM", subject: "DBMS", room: "5101" }] },
    "SKILLBRIDGE BATCH-5": { Monday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5106" }], Tuesday: [{ time: "01:15PM - 03:50PM", subject: "CP", room: "5106" }], Wednesday: [{ time: "01:15PM - 03:50PM", subject: "JFS", room: "5106" }], Thursday: [{ time: "09:30AM - 12:15PM", subject: "CP", room: "5106" }], Friday: [{ time: "09:30AM - 12:15PM", subject: "DBMS", room: "5106" }], Saturday: [{ time: "09:30AM - 12:15PM", subject: "JFS", room: "5106" }] }
};

// --- Section Header Component ---
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
    
    // NEW: State to manage the downloading status for reports
    const [downloading, setDownloading] = useState({ type: null, loading: false });

    useEffect(() => {
        localStorage.setItem("userRole", "admin");

        const fetchAdminData = () => {
            try {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

                const morningSessions = [];
                const afternoonSessions = [];

                Object.keys(batchWiseTimetable).forEach(batchName => {
                    const daySchedule = batchWiseTimetable[batchName][today];
                    if (daySchedule && daySchedule.length > 0) {
                        const classInfo = daySchedule[0];
                        const startTime = classInfo.time.split(' - ')[0];

                        let [time, modifier] = startTime.split(/(AM|PM)/);
                        let [hours] = time.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

                        const isMorning = parseInt(hours) < 13;

                        const mockAttendance = {
                            batchName: `${batchName} (${classInfo.subject})`,
                            present: Math.floor(Math.random() * 40) + 10,
                            total: 50,
                            status: Math.random() > 0.2 ? 'marked' : 'pending'
                        };

                        if (isMorning) {
                            morningSessions.push(mockAttendance);
                        } else {
                            afternoonSessions.push(mockAttendance);
                        }
                    }
                });

                setAdminData({
                    stats: { totalStudents: 450, totalFaculty: 25 },
                    sessions: { morning: morningSessions, afternoon: afternoonSessions }
                });

                setTimeout(() => {
                    setIsLoading(false);
                    setAnimate(true);
                }, 800);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError('Failed to load dashboard data.');
                setIsLoading(false);
            }
        };
        fetchAdminData();
    }, []);
    
    // NEW: Function to handle the report download API call
    const handleDownloadReport = async (format) => {
        if (downloading.loading) return; // Prevent multiple clicks while one is in progress

        setDownloading({ type: format, loading: true });
        alert(`Generating your monthly ${format.toUpperCase()} report. It will be sent to the registered admin email shortly.`);

        try {
            // --- This is where you would call your actual backend API ---
            // Example: const response = await fetch(`https://your-api.com/reports/monthly?format=${format}`, { headers: { 'Authorization': 'Bearer YOUR_TOKEN' } });
            // if (!response.ok) throw new Error('API request failed');

            console.log(`Simulating API call to generate ${format.toUpperCase()} report...`);
            // Simulate a network delay of 2.5 seconds
            await new Promise(resolve => setTimeout(resolve, 2500));

            // On success, your backend would typically email the report or return a file blob to download.
            // For this example, we just show a success alert.
            console.log(`Successfully processed ${format.toUpperCase()} report request.`);
            alert(`✅ Success! The monthly report (${format.toUpperCase()}) has been sent.`);

        } catch (error) {
            console.error(`Failed to generate ${format} report:`, error);
            alert(`❌ Error: Could not generate the ${format.toUpperCase()} report. Please try again later.`);
        } finally {
            // Reset the loading state regardless of outcome
            setDownloading({ type: null, loading: false });
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#071225] border-t-transparent"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-[#071225] opacity-20"></div>
                </div>
            </div>
        );
    }

    if (error || !adminData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4">
                    <h2 className="text-xl font-bold text-red-600 mb-4">An Error Occurred</h2>
                    <p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data.'}</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const managementItems = [
        { title: "Manage Students", icon: <Users className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />, count: adminData.stats.totalStudents, description: "View, Add, or Edit Student Details", bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50", path: "/admin/manage-students" },
        { title: "Manage Faculty", icon: <UserCheck className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />, count: adminData.stats.totalFaculty, description: "View, Add, or Edit Faculty Details", bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50", path: "/admin/manage-faculty" },
        { title: "Manage Attendance", icon: <CalendarCheck className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />, description: "Mark or Update Student Attendance", bgColor: "bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50", path: "/admin/manage-attendance" },
    ];

    const sessionItems = [
        { title: "Morning Attendance", icon: <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />, data: adminData.sessions.morning, barColor: 'bg-gradient-to-r from-blue-400 to-indigo-500', bgColor: 'bg-gradient-to-br from-blue-100 to-blue-50' },
        { title: "Afternoon Attendance", icon: <CheckSquare className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />, data: adminData.sessions.afternoon, barColor: 'bg-gradient-to-r from-green-400 to-teal-500', bgColor: 'bg-gradient-to-br from-green-100 to-green-50' },
    ];
    
    // UPDATED: The structure for reportItems is now slightly different for the Monthly Report
    const reportItems = [
        {
            title: "Session Report",
            icon: <FileText className="w-6 h-6 text-red-600" />,
            actionIcon: <ArrowRight className="w-4 h-4" />,
            path: '/session-report'
        },
        {
            title: "Batch Wise Report",
            icon: <FileText className="w-6 h-6 text-cyan-600" />,
            actionIcon: <ArrowRight className="w-4 h-4" />,
            path: '/batch-report'
        },
        {
            title: "Monthly Report",
            icon: <FileText className="w-6 h-6 text-emerald-600" />,
            // This item will be rendered differently because it lacks a 'path' or 'action'
        },
    ];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 20px; }
            `}</style>
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
                                    <div key={index} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex flex-col border border-white/20 relative overflow-hidden group min-h-[140px] lg:min-h-[150px] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${300 + index * 150}ms` }}>
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                                        <div className="flex items-start justify-between mb-2 relative z-10">
                                            <h3 className="font-bold text-sm lg:text-base leading-tight pr-2">{item.title}</h3>
                                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/40 rounded-lg lg:rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">{item.icon}</div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3 h-8">{item.description}</p>
                                        <div className="flex items-end justify-between mt-auto">
                                            {item.count ? <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">{item.count}</p> : <div />}
                                            <button onClick={() => navigate(item.path)} className="bg-gray-800 hover:bg-black text-white font-bold py-1.5 px-3 rounded-md text-xs transition-colors self-end shadow-md">Manage</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionHeader title="Today's Attendance" animate={animate} delay={500} />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                {sessionItems.map((item, index) => (
                                    <div key={index} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex flex-col border border-white/20 relative overflow-hidden group ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${500 + index * 150}ms` }}>
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
                        </div>
                    </section>
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
                <h2 className={`text-lg lg:text-xl font-bold text-[#071225] mb-4 transition-opacity duration-1000 delay-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>Download Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {reportItems.map((item, index) => {
                        // Check if the item is the special Monthly Report card
                        const isMonthlyReport = item.title === "Monthly Report";
                        
                        // Check loading states for buttons
                        const isDownloadingPdf = downloading.type === 'pdf' && downloading.loading;
                        const isDownloadingExcel = downloading.type === 'excel' && downloading.loading;

                        return (
                            <div
                                key={index}
                                // The onClick is only for non-monthly report cards
                                onClick={!isMonthlyReport ? () => navigate(item.path) : undefined}
                                className={`bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-between border border-white/50 relative overflow-hidden group min-h-[80px] ${!isMonthlyReport && 'cursor-pointer'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                                style={{ transitionDelay: `${700 + index * 150}ms` }}
                            >
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-400/10 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <div className="flex items-center relative z-10">
                                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0 mr-3">{item.icon}</div>
                                    <h3 className="font-bold text-sm lg:text-base leading-tight pr-2">{item.title}</h3>
                                </div>
                                
                                <div className="relative z-10">
                                    {isMonthlyReport ? (
                                        // UPDATED: Render PDF and Excel buttons for the Monthly Report
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDownloadReport('pdf')}
                                                disabled={downloading.loading}
                                                className={`flex items-center justify-center w-20 h-9 text-xs font-bold text-white rounded-md shadow-md transition-all duration-300 ${isDownloadingPdf ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-400'}`}
                                            >
                                                {isDownloadingPdf ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    'PDF'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDownloadReport('excel')}
                                                disabled={downloading.loading}
                                                className={`flex items-center justify-center w-20 h-9 text-xs font-bold text-white rounded-md shadow-md transition-all duration-300 ${isDownloadingExcel ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'}`}
                                            >
                                                {isDownloadingExcel ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    'EXCEL'
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        // Original button for other reports
                                        <div className="bg-gray-200 group-hover:bg-gray-800 group-hover:text-white text-gray-600 p-2.5 rounded-full transition-colors self-end shadow-md flex items-center justify-center">
                                            {item.actionIcon}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;