import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, Terminal, CloudLightning, Database, MapPin, 
    ChevronRight, ChevronLeft, CalendarDays, Coffee, Layers
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const API_URL = import.meta.env.VITE_BASE_URL;

// --- 1. COLORFUL THEMES (For Upcoming Sessions) ---
const subjectDetails = {
  'CP': { 
      title: 'Competitive Programming', 
      // Cyan/Blue Theme
      gradient: 'from-cyan-500 to-blue-500',
      glass: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50',
      text: 'text-cyan-200',
      iconBg: 'bg-cyan-500/20 text-cyan-100',
      icon: <Terminal className="w-full h-full" /> 
  },
  'JFS': { 
      title: 'Java Full Stack', 
      // Orange/Amber Theme
      gradient: 'from-orange-500 to-amber-500',
      glass: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50',
      text: 'text-orange-200',
      iconBg: 'bg-orange-500/20 text-orange-100',
      icon: <Coffee className="w-full h-full" /> 
  },
  'DBS': { 
      title: 'Database Solutions', 
      // Emerald/Teal Theme
      gradient: 'from-emerald-500 to-teal-500',
      glass: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
      text: 'text-emerald-200',
      iconBg: 'bg-emerald-500/20 text-emerald-100',
      icon: <Database className="w-full h-full" /> 
  },
  'AWS': { 
      title: 'Cloud Computing (AWS)', 
      // Purple/Pink Theme
      gradient: 'from-violet-600 to-fuchsia-500',
      glass: 'bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50',
      text: 'text-violet-200',
      iconBg: 'bg-violet-500/20 text-violet-100',
      icon: <CloudLightning className="w-full h-full" /> 
  },
  'DEFAULT': {
      title: 'Course Session',
      // Slate/Gray Theme
      gradient: 'from-slate-600 to-slate-500',
      glass: 'bg-slate-500/10 border-slate-500/20 hover:border-slate-500/50',
      text: 'text-slate-200',
      iconBg: 'bg-slate-500/20 text-slate-100',
      icon: <Layers className="w-full h-full" />
  }
};

// --- 2. FIXED BLUE THEME (Strictly for Today's Hero Card) ---
const HERO_BLUE_THEME = {
    gradient: 'from-blue-600 via-blue-500 to-indigo-600',
    iconBg: 'bg-blue-400/20 text-white',
    border: 'border-blue-400/30'
};

// Helper: Map Short Codes to Config Keys
const getSubjectStyleKey = (subjectName) => {
    if (!subjectName) return 'DEFAULT';
    const upper = subjectName.toUpperCase().trim();
    
    if (upper === 'CP' || upper.includes('COMPETITIVE')) return 'CP';
    if (upper === 'JFS' || upper.includes('JAVA')) return 'JFS';
    if (upper === 'DBS' || upper.includes('DATA')) return 'DBS';
    if (upper === 'AWS' || upper.includes('CLOUD')) return 'AWS';
    
    return 'DEFAULT';
};

const TimetablePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [scheduleMap, setScheduleMap] = useState({});
  const [userBatch, setUserBatch] = useState('');
  const [semester, setSemester] = useState('');

  // UI State
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 

  // --- Fetch Data ---
  useEffect(() => {
    if (!user) {
        navigate('/');
        return;
    }

    const fetchTimetableData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/student/get-timetable-data`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.status === 401 || response.status === 403) {
                logout();
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch timetable");

            const rawData = await response.json();
            const primaryData = Array.isArray(rawData) ? rawData[0] : rawData;

            if (primaryData) {
                setUserBatch(primaryData.batch);
                setSemester(primaryData.sem);

                const map = {};
                if (primaryData.weekSchedule && Array.isArray(primaryData.weekSchedule)) {
                    primaryData.weekSchedule.forEach(dayObj => {
                        map[dayObj.day] = dayObj.periods.map(p => ({
                            time: `${p.startTime} - ${p.endTime}`,
                            subject: p.subject,
                            room: p.roomNo,
                            faculty: p.faculty ? p.faculty.map(f => f.name).join(', ') : 'Faculty'
                        }));
                    });
                }
                setScheduleMap(map);
            }
        } catch (error) {
            console.error("Timetable fetch error:", error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setAnimate(true), 100);
        }
    };

    fetchTimetableData();
  }, [user, navigate, logout]);

  // --- Generate Schedule Logic ---
  useEffect(() => {
    const allDates = [];
    let currentDate = new Date();
    let safetyCounter = 0;
    
    // Add Today + Next 12 days
    allDates.push(new Date(currentDate)); 
    currentDate.setDate(currentDate.getDate() + 1); 

    while (allDates.length < 13 && safetyCounter < 30) {
        allDates.push(new Date(currentDate)); 
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
    }

    const processedData = allDates.map((date, index) => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const displayDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const displayDay = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = index === 0;

        const dailyClasses = scheduleMap[dayName] || [];
        const primaryClass = dailyClasses.length > 0 ? dailyClasses[0] : null;
        
        let classDetails = null;
        
        if (primaryClass) {
            const styleKey = getSubjectStyleKey(primaryClass.subject);
            // Get the specific colorful style for this subject
            const style = subjectDetails[styleKey];

            classDetails = {
                ...primaryClass,
                fullTitle: style.title,
                shortSubject: primaryClass.subject,
                icon: style.icon,
                // Assign colorful properties here (used for Upcoming)
                gradient: style.gradient,
                glass: style.glass,
                textColor: style.text,
                iconBg: style.iconBg
            };
        }

        return { 
            date: displayDate, 
            day: displayDay, 
            fullDay: dayName, 
            hasClass: !!classDetails,
            classInfo: classDetails,
            isToday 
        };
    });

    setTodaySchedule(processedData[0]); 
    setUpcomingSchedule(processedData.slice(1)); 
  }, [scheduleMap, isLoading]);

  const ITEMS_PER_PAGE = 6;
  const currentViewSchedule = upcomingSchedule.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  if (isLoading) return <Loader />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-32">
      
      {/* --- HEADER --- */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
         <Header animate={animate} />
         <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
      </div>

      <main className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto space-y-10">
        
        {/* --- SECTION 1: TODAY'S SCHEDULE (STRICTLY BLUE HERO CARD) --- */}
        <section className={`transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Today's Schedule
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium flex items-center gap-2">
                        <span>{todaySchedule?.fullDay}, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
                    </p>
                </div>
                
                {/* Batch Badge */}
                {userBatch && (
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                             <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2">SEM</span>
                             <span className="text-sm font-bold text-blue-200">{semester}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2">BATCH</span>
                            <span className="text-sm font-bold text-blue-200">{userBatch}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* HERO CARD - HARDCODED BLUE THEME (Ignores subject colors) */}
            {todaySchedule?.hasClass ? (
                <div className={`
                    relative rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden border border-white/10
                    bg-gradient-to-br ${HERO_BLUE_THEME.gradient} 
                `}>
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 mix-blend-multiply"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        
                        {/* Left: Icon & Title */}
                        <div className="flex items-center gap-6">
                            {/* Force Blue Icon Background */}
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-inner ${HERO_BLUE_THEME.border} ${HERO_BLUE_THEME.iconBg} p-5`}>
                                {todaySchedule.classInfo.icon}
                            </div>
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-black/20 text-white font-bold text-xs uppercase tracking-widest border border-white/10 mb-2 shadow-sm">
                                    Ongoing Session
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
                                    {todaySchedule.classInfo.shortSubject}
                                </h2>
                                <p className="text-white/90 text-xl mt-1 font-semibold">
                                    {todaySchedule.classInfo.fullTitle}
                                </p>
                            </div>
                        </div>

                        {/* Right: Time & Details */}
                        <div className="flex flex-col items-start md:items-end gap-3 bg-black/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto shadow-lg">
                            <div className="flex items-center gap-3">
                                <Clock className="text-white w-6 h-6" />
                                <span className="text-3xl font-bold text-white tracking-tight">
                                    {todaySchedule.classInfo.time.split(' - ')[0]}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 text-sm font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                <MapPin size={14} />
                                <span>Room {todaySchedule.classInfo.room}</span>
                            </div>
                            <div className="text-white/80 text-sm font-medium">
                                {todaySchedule.classInfo.faculty}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <CalendarDays className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">No classes scheduled today</h3>
                        <p className="text-gray-400 mt-2">Enjoy your day off!</p>
                    </div>
                </div>
            )}
        </section>

        {/* --- SECTION 2: UPCOMING SCHEDULE (COLORFUL THEMES) --- */}
        <section className={`transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 bg-white/10 rounded-lg border border-white/10">
                    <Calendar className="w-5 h-5 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Upcoming Sessions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentViewSchedule.map((dayData, index) => (
                    <div 
                        key={index}
                        className={`
                            relative rounded-2xl border transition-all duration-300 overflow-hidden group
                            ${dayData.hasClass 
                                ? `${dayData.classInfo.glass}` // Uses the Colorful Glass Effect
                                : 'bg-white/5 border-white/5 opacity-60'}
                        `}
                    >
                        {/* Date Header */}
                        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="text-center">
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{dayData.day}</span>
                                    <span className="block text-lg font-bold text-white leading-none mt-0.5">{dayData.date.split(' ')[0]}</span>
                                </div>
                                <div className="h-8 w-px bg-white/10"></div>
                                <span className="text-sm font-medium text-gray-300">{dayData.date.split(' ')[1]}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 min-h-[140px] flex flex-col justify-center relative">
                            {dayData.hasClass ? (
                                <>
                                    {/* Colorful Glow based on subject */}
                                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${dayData.classInfo.gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            {/* Colorful Icon Background */}
                                            <div className={`p-2 rounded-lg backdrop-blur-sm shadow-sm ${dayData.classInfo.iconBg}`}>
                                                {React.cloneElement(dayData.classInfo.icon, { className: "w-5 h-5" })}
                                            </div>
                                            {/* Colorful Text */}
                                            <span className={`text-xs font-bold uppercase tracking-wider ${dayData.classInfo.textColor}`}>
                                                {dayData.classInfo.shortSubject}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-base font-bold text-white leading-tight mb-1 line-clamp-2">
                                            {dayData.classInfo.fullTitle}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-3">{dayData.classInfo.faculty}</p>

                                        <div className="flex items-center justify-between text-xs text-gray-300 border-t border-white/5 pt-3">
                                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                                <Clock size={12} /> {dayData.classInfo.time.split(' - ')[0]}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={12} /> {dayData.classInfo.room}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-2 rounded-full bg-white/5 mb-2">
                                        <CalendarDays size={20} className="text-gray-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">No classes</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
        </main>

      {/* --- PAGINATION --- */}
      <div className="fixed bottom-6 left-0 right-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1.5 flex items-center gap-2 pointer-events-auto ring-1 ring-white/5">
            <button 
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
                    ${currentPage === 0 
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#071225] text-white hover:bg-blue-600 border border-white/10 shadow-lg'}
                `}
            >
                <ChevronLeft size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">This Week</span>
            </button>

            <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
                    ${currentPage === 1 
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                        : 'bg-white text-[#071225] hover:bg-gray-200 border border-white/20 shadow-lg'}
                `}
            >
                <span className="text-xs font-bold uppercase tracking-wide">Next Week</span>
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;