import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, CalendarCheck, FileText, ArrowRight, 
    AlertCircle, Clock, BookOpen, UserCheck, 
    Building2, Mail, IdCard 
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext'; 
import Loader from '../../components/Loader';

// --- Reusable UI Components ---

const CircularStats = ({ data, colorText, shadowColor, gradientId, gradientColors }) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    // Filter out pending sessions so they don't drag down the percentage
    const markedSessions = data.filter(item => item.status !== 'pending');
    
    // Prevent division by zero if everything is pending
    if (markedSessions.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center relative z-10 my-2 flex-shrink-0 opacity-50">
                 <div className="w-[130px] h-[130px] rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-400">No Data</span>
                 </div>
            </div>
         );
    }

    const totalPresent = markedSessions.reduce((acc, curr) => acc + (curr.present || 0), 0);
    const totalStudents = markedSessions.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const percentage = totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;
    
    // SVG Config
    const size = 130; 
    const radius = 44; 
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center relative z-10 my-2 flex-shrink-0">
            <div className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl rounded-full p-4 shadow-inner border border-white/60 ring-1 ring-white/40 relative">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg className="w-full h-full transform -rotate-90">
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={gradientColors[0]} />
                                <stop offset="100%" stopColor={gradientColors[1]} />
                            </linearGradient>
                        </defs>
                        <circle cx="65" cy="65" r="44" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                        <circle cx="65" cy="65" r="44" stroke={`url(#${gradientId})`} strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-in-out" style={{ filter: `drop-shadow(0px 2px 3px ${shadowColor})` }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-3xl font-black ${colorText} tracking-tight leading-none`}>{Math.round(percentage)}%</span>
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">Overall</span>
                    </div>
                </div>
            </div>
            <div className="text-center mt-3">
                 <span className="text-[11px] font-bold text-gray-600 bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-white/60 backdrop-blur-md">
                    {totalPresent} / {totalStudents} Present
                 </span>
            </div>
        </div>
    );
};

const SessionBarChart = ({ data, barColor }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-300/50">
                <p className="text-xs font-semibold">No sessions scheduled.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full px-1 py-1">
            {data.map((item, index) => {
                const percentage = item.total > 0 ? (item.present / item.total) * 100 : 0;
                
                return (
                    <div key={`${item.batchName}-${index}`} className="group/item" style={{ animation: `fadeInUp 0.5s ease-out ${index * 150}ms forwards`, opacity: 0 }}>
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-bold text-gray-700 truncate pr-3 tracking-wide" title={item.batchName}>
                                {item.batchName} <span className="text-gray-400 font-normal">({item.course})</span>
                            </span>
                            
                            {item.status === 'pending' ? (
                                <span className="flex-shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center shadow-sm">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Pending
                                </span>
                            ) : (
                                <span className="flex-shrink-0 text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200/60 shadow-sm">
                                    {item.present}/{item.total}
                                </span>
                            )}
                        </div>
                        
                        <div className="w-full bg-gray-200/60 rounded-full h-2 shadow-inner overflow-hidden border border-gray-100">
                            {item.status === 'pending' ? (
                                <div className="bg-transparent h-2 rounded-full"></div>
                            ) : (
                                <div className={`${barColor} h-2 rounded-full transition-all duration-1000 ease-out shadow-sm relative`} style={{ width: `${percentage}%` }}></div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div>
        <h2 className="text-md lg:text-lg font-bold text-white">{title}</h2>
    </div>
);

// --- Main Page Component ---

const backendUrl = import.meta.env.VITE_BASE_URL;

const GuestDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [apiData, setApiData] = useState(null);
    const [error, setError] = useState(null);

    // 1. Fetch Data
    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchGuestData = async () => {
            try {
                // Maintained the exact endpoint as requested
                const response = await fetch(`${backendUrl}/api/guest_faculty/get-dashboard-data`, {
                    method: "GET",
                    credentials: "include"
                });
                
                if (response.status === 401 || response.status === 403) {
                    logout();
                    return;
                }

                if (!response.ok) throw new Error('Network response was not ok');
                
                const result = await response.json();
                if (!result.success) throw new Error(result.message || 'API error');
                
                setApiData(result.data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
                setAnimate(true);
            }
        };

        fetchGuestData();
    }, [user, navigate, logout]);

    // 2. Process Data using useMemo
    const processedData = useMemo(() => {
        if (!apiData) return null;

        const morning = [];
        const afternoon = [];

        if (apiData.attendanceSummary && Array.isArray(apiData.attendanceSummary)) {
            apiData.attendanceSummary.forEach(semGroup => {
                // Handle Forenoon (Morning) Batches
                if (semGroup.fnBatches && Array.isArray(semGroup.fnBatches)) {
                    semGroup.fnBatches.forEach(batch => {
                        const isPending = batch.presentCount === 0;
                        morning.push({
                            batchName: `${batch.batch} (${semGroup.semester})`,
                            present: batch.presentCount,
                            total: batch.totalCount,
                            status: isPending ? 'pending' : 'marked',
                            course: batch.course || 'Unknown'
                        });
                    });
                }

                // Handle Afternoon Batches
                if (semGroup.anBatches && Array.isArray(semGroup.anBatches)) {
                    semGroup.anBatches.forEach(batch => {
                        const isPending = batch.presentCount === 0;
                        afternoon.push({
                            batchName: `${batch.batch} (${semGroup.semester})`,
                            present: batch.presentCount,
                            total: batch.totalCount,
                            status: isPending ? 'pending' : 'marked',
                            course: batch.course || 'Unknown'
                        });
                    });
                }
            });

            morning.sort((a, b) => a.batchName.localeCompare(b.batchName));
            afternoon.sort((a, b) => a.batchName.localeCompare(b.batchName));
        }

        return {
            sessions: { morning, afternoon }
        };
    }, [apiData]);

    // 3. Helper to format faculty name dynamically
    const getFormattedName = () => {
        const rawName = apiData?.faculty?.name || '';
        let cleanName = rawName.replace(/master/i, '').replace(/guest\s*faculty/i, '').trim();
        return cleanName || 'Faculty';
    };

    // 4. Render
    if (isLoading) {
        return <Loader />;
    }
    
    if (error || !processedData) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow text-red-600 flex flex-col items-center gap-4">
                <span className="font-semibold">Error: {error || 'No Data Available'}</span>
                <button onClick={() => window.location.reload()} className="bg-red-50 text-red-700 px-4 py-2 rounded-md border border-red-200 hover:bg-red-100 transition-colors">Retry Connection</button>
            </div>
        </div>
    );

    // Advanced Rendering logic for cards to show ACTUAL data
    const guestItems = [
        { 
            title: "Today's Schedule", 
            icon: <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />, 
            bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50", 
            path: "/guest/schedule",
            renderContent: () => (
                <div className="mt-2 h-[90px] overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
                    {apiData.todayClasses?.length > 0 ? (
                        apiData.todayClasses.map((cls, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-white/60 p-2 rounded border border-white/50 shadow-sm">
                                <div className="flex flex-col">
                                    <span className="font-bold text-blue-800">{cls.subject}</span>
                                    <span className="text-[10px] text-blue-600 font-semibold">{cls.session} • Room {cls.roomNo}</span>
                                </div>
                                <span className="text-gray-600 font-medium bg-blue-100/50 px-2 py-1 rounded-md">{cls.startTime}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center text-sm text-gray-500 italic">No classes scheduled today.</div>
                    )}
                </div>
            )
        },
        { 
            title: "Assigned Batches", 
            icon: <Users className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />, 
            bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50", 
            path: "/guest/batches",
            renderContent: () => (
                <div className="mt-2 h-[90px] overflow-y-auto custom-scrollbar pr-1 flex flex-wrap gap-1.5 content-start">
                    {apiData.faculty?.batches_assigned?.length > 0 ? (
                        apiData.faculty.batches_assigned.map((batch, i) => (
                            <span key={i} className="text-[11px] font-bold bg-green-200/50 text-green-800 px-2.5 py-1 rounded-md border border-green-300/50 shadow-sm flex items-center justify-center">
                                {batch}
                            </span>
                        ))
                    ) : (
                        <div className="h-full flex items-center text-sm text-gray-500 italic">No batches assigned yet.</div>
                    )}
                </div>
            )
        },
        { 
            title: "Assigned Subjects", 
            icon: <BookOpen className="w-6 h-6 lg:w-7 lg:h-7 text-orange-600" />, 
            bgColor: "bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50", 
            path: "/guest/subjects",
            renderContent: () => (
                <div className="mt-2 h-[90px] overflow-y-auto custom-scrollbar pr-1 flex flex-wrap gap-2 content-start">
                    {apiData.faculty?.subjects_assigned?.length > 0 ? (
                        apiData.faculty.subjects_assigned.map((sub, i) => (
                            <span key={i} className="text-xs font-bold bg-orange-200/50 text-orange-800 px-3 py-1.5 rounded-md border border-orange-300/50 shadow-sm flex items-center justify-center">
                                {sub}
                            </span>
                        ))
                    ) : (
                        <div className="h-full flex items-center text-sm text-gray-500 italic">No subjects assigned yet.</div>
                    )}
                </div>
            )
        },
        {
            title: "Mark Attendance",
            icon: <CalendarCheck className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />,
            bgColor: "bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50",
            path: "/faculty/action",
            renderContent: () => (
                <div className="mt-2 h-[90px] flex flex-col justify-center text-sm text-gray-700 leading-relaxed font-medium">
                    <p>Access the attendance portal to mark status for your current and upcoming assigned sessions.</p>
                </div>
            )
        },
    ];

    const sessionItems = [
        { 
            title: "Morning Attendance", 
            data: processedData.sessions.morning, 
            barColor: 'bg-gradient-to-r from-blue-400 to-indigo-500', 
            bgColor: 'bg-gradient-to-br from-blue-100 to-blue-50',
            textColor: 'text-blue-700',
            shadowColor: 'rgba(59, 130, 246, 0.5)',
            gradientId: 'blueGradient',
            gradientColors: ['#60A5FA', '#4F46E5']
        },
        { 
            title: "Afternoon Attendance", 
            data: processedData.sessions.afternoon, 
            barColor: 'bg-gradient-to-r from-green-400 to-teal-500', 
            bgColor: 'bg-gradient-to-br from-green-100 to-green-50',
            textColor: 'text-green-700',
            shadowColor: 'rgba(34, 197, 94, 0.5)',
            gradientId: 'greenGradient',
            gradientColors: ['#4ADE80', '#0D9488']
        },
    ];

    const reportItems = [
        { title: "Session Report", icon: <FileText className="w-6 h-6 text-red-600" />, path: '/guest/session-report', bgColor: "bg-gradient-to-br from-red-100 via-red-50 to-pink-50" },
    ];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
             <style>{`.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.15); border-radius: 10px; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
             
             <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[1.5rem] rounded-br-[1.5rem] sm:rounded-bl-[2rem] sm:rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 pb-6 lg:pb-8 pt-2">
                    <Header animate={animate} />
                    
                    {/* Enhanced Data-Rich Welcome Section */}
                    {apiData.faculty && (
                        <div className={`mt-4 mb-6 transition-all duration-1000 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                            <p className="text-blue-200/80 text-sm font-medium mb-1 tracking-wide">Welcome back,</p>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                {getFormattedName()}
                                <span className="text-[10px] uppercase tracking-widest font-bold bg-white/10 text-blue-100 px-2.5 py-1 rounded-md border border-white/20 shadow-sm backdrop-blur-sm mt-1">
                                    Guest
                                </span>
                            </h1>
                            
                            {/* Rich Data Header Subtitle */}
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-sm text-blue-100/90 font-medium bg-white/5 inline-flex p-2 rounded-lg border border-white/10 backdrop-blur-sm">
                                <span className="flex items-center gap-1.5">
                                    <IdCard className="w-4 h-4 opacity-70"/> {apiData.faculty.facultyid}
                                </span>
                                <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 opacity-70"/> {apiData.faculty.dept} Department
                                </span>
                                <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 opacity-70"/> {apiData.faculty.email}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>
                    
                    <section className="flex flex-col gap-6 lg:gap-8">
                        <div className="order-2 md:order-1">
                            <SectionHeader title="Dashboard Overview" animate={animate} delay={300} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                                {guestItems.map((item, index) => (
                                    <div key={index} onClick={() => navigate(item.path)} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between border border-white/30 relative overflow-hidden group min-h-[170px] cursor-pointer ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                                        
                                        <div className="w-full">
                                            <div className="flex items-start justify-between mb-1 relative z-10">
                                                <h3 className="font-bold text-sm lg:text-[15px] leading-tight text-gray-900">{item.title}</h3>
                                                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-white/50 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm transform group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                                                    {item.icon}
                                                </div>
                                            </div>
                                            
                                            {/* Dynamic Rendered Content (Actual Data) */}
                                            <div className="relative z-10 w-full">
                                                {item.renderContent()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="order-1 md:order-2">
                             <SectionHeader title="Download Reports" animate={animate} delay={600} />
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                {reportItems.map((item, index) => (
                                    <div key={index} onClick={() => navigate(item.path)} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-4 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-between border border-white/20 relative overflow-hidden group min-h-[70px] cursor-pointer ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                                        <div className="flex items-center relative z-10">
                                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0 mr-3">{item.icon}</div>
                                            <h3 className="font-bold text-sm lg:text-base leading-tight pr-2">{item.title}</h3>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="bg-gray-200 group-hover:bg-gray-800 group-hover:text-white text-gray-600 p-2.5 rounded-full transition-colors self-end shadow-sm flex items-center justify-center">
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
                <div className={`flex items-center gap-2.5 text-[#071225] mb-5 transition-opacity duration-1000 delay-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                    <UserCheck className="w-6 h-6"/>
                    <h2 className="text-lg lg:text-xl font-extrabold tracking-tight">Your Attendance Status</h2>
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                    {sessionItems.map((item, index) => (
                        <div key={index} className={`${item.bgColor} rounded-xl lg:rounded-2xl p-5 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl flex flex-col border border-white/60 relative overflow-hidden group ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="flex items-center justify-between mb-4 relative z-10 border-b border-black/5 pb-2">
                                <h3 className="font-bold text-lg leading-tight tracking-wide">{item.title}</h3>
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 h-full">
                                <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
                                    <CircularStats 
                                        data={item.data} 
                                        colorText={item.textColor}
                                        shadowColor={item.shadowColor}
                                        gradientId={item.gradientId}
                                        gradientColors={item.gradientColors}
                                    />
                                </div>

                                <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent h-32 flex-shrink-0 mx-2"></div>

                                <div className="flex-grow w-full max-h-64 overflow-y-auto custom-scrollbar flex flex-col justify-start pr-1">
                                    <SessionBarChart data={item.data} barColor={item.barColor} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default GuestDashboardPage;