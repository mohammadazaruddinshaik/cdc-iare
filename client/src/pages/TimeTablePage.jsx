import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, Terminal, CloudLightning, Database, MapPin, 
    ChevronRight, ChevronLeft, CalendarDays, Coffee, Layers
} from 'lucide-react';
import Header from '../components/Header';

// --- DATA CONFIGURATION ---
const batchWiseTimetable = {
    "SKILLUP BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5102" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ]
    },
    "SKILLUP BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5106" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ]
    },
    "SKILLUP BATCH-3": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5104" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ]
    },
    "SKILLNEXT BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5204" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5204" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5204" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5204" } ]
    },
     "SKILLNEXT BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5104" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ]
    },
    "SKILLNEXT BATCH-3": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5102" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ]
    },
    "SKILLBRIDGE BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5101" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ]
    },
    "SKILLBRIDGE BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5005" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5005" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5005" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5005" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5005" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5005" } ]
    },
    "SKILLBRIDGE BATCH-3": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5201" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5201" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5201" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5201" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5201" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5201" } ]
    },
    "SKILLBRIDGE BATCH-4": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5101" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ]
    },
    "SKILLBRIDGE BATCH-5": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5106" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ]
    },
    "SKILLBRIDGE BATCH-6": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5301" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5301" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5301" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5301" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5301" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5301" } ]
    }
};

// --- STYLISH THEME CONFIGURATION ---
const subjectDetails = {
  'CP': { 
      title: 'Competitive Programming', 
      // Electric Blue Theme
      gradient: 'from-blue-600 to-indigo-600',
      glass: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-300',
      icon: <Terminal className="w-full h-full text-white" /> 
  },
  'JFS': { 
      title: 'Java Full Stack', 
      // Java Orange Theme
      gradient: 'from-orange-500 to-red-600',
      glass: 'bg-orange-500/10 border-orange-500/20',
      text: 'text-orange-300',
      icon: <Coffee className="w-full h-full text-white" /> 
  },
  'DBS': { 
      title: 'Database Solutions', 
      // Emerald Data Theme
      gradient: 'from-emerald-500 to-teal-600',
      glass: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-300',
      icon: <Database className="w-full h-full text-white" /> 
  },
  'DBMS': { 
      title: 'Database Management', 
      gradient: 'from-emerald-500 to-teal-600',
      glass: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-300',
      icon: <Database className="w-full h-full text-white" /> 
  },
};

const TimetablePage = () => {
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [studentBatch, setStudentBatch] = useState('');
  const [facultyBatches, setFacultyBatches] = useState([]);
  const [facultySelectedBatch, setFacultySelectedBatch] = useState('');

  const [todaySchedule, setTodaySchedule] = useState(null);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 

  const userRole = sessionStorage.getItem("userRole");
  const navigate = useNavigate();

  // --- 1. Auth & Data Loading ---
  useEffect(() => {
    try {
        if (userRole === 'student') {
            const batch = sessionStorage.getItem("batch");
            if (!batch) { sessionStorage.clear(); navigate('/'); return; }
            setStudentBatch(batch);
        } else if (userRole === 'faculty') {
            const batchString = sessionStorage.getItem("facultybatches");
            let batchesArray = batchString ? JSON.parse(batchString) : [];
            if (!Array.isArray(batchesArray) || batchesArray.length === 0) {
                setError('No batches assigned.');
            } else {
                setFacultyBatches(batchesArray);
                setFacultySelectedBatch(batchesArray[0]);
            }
        } else {
            navigate('/login');
        }
    } catch (e) {
        navigate('/login');
    } finally {
        setIsLoading(false);
        setTimeout(() => setAnimate(true), 100);
    }
  }, [userRole, navigate]);

  // --- 2. Schedule Logic ---
  useEffect(() => {
    let batch = userRole === 'student' ? studentBatch : facultySelectedBatch;
    if (!batch || !batchWiseTimetable[batch]) return;

    const batchTimetable = batchWiseTimetable[batch];
    
    // Generate dates: Today + Next 12 Working Days
    const allDates = [];
    let currentDate = new Date();
    let safetyCounter = 0;
    
    // Push Today first
    allDates.push(new Date(currentDate)); 
    currentDate.setDate(currentDate.getDate() + 1); 

    while (allDates.length < 13 && safetyCounter < 30) {
        const dayIndex = currentDate.getDay(); // 0 = Sun
        if (dayIndex !== 0) { allDates.push(new Date(currentDate)); }
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
    }

    const processedData = allDates.map((date, index) => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const displayDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const displayDay = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = index === 0;

        const dailyClasses = batchTimetable[dayName] || [];
        
        // Since there is only "One Class Per Day", we take the first item
        const primaryClass = dailyClasses.length > 0 ? dailyClasses[0] : null;
        
        let classDetails = null;
        
        if (primaryClass) {
            const subjectKey = Object.keys(subjectDetails).find(key => key === primaryClass.subject) || 'CP';
            const style = subjectDetails[subjectKey];
            classDetails = {
                ...primaryClass,
                fullTitle: style.title,
                icon: style.icon,
                gradient: style.gradient,
                glass: style.glass,
                textColor: style.text
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
  }, [studentBatch, facultySelectedBatch, userRole]);

  const ITEMS_PER_PAGE = 6;
  const currentViewSchedule = upcomingSchedule.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  if (isLoading) return (
    <div className="min-h-screen bg-[#071225] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-32">
      
      {/* --- HEADER --- */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
         <Header animate={animate} />
         <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
      </div>

      <main className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto space-y-10">
        
        {/* --- SECTION 1: TODAY'S FOCUS (HERO CARD) --- */}
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
                {(userRole === 'student' || userRole === 'faculty') && (
                    <div className="hidden sm:flex bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2 flex items-center gap-1"><Layers size={12}/> Batch</span>
                        <span className="text-sm font-bold text-blue-200">
                            {userRole === 'student' ? studentBatch : facultySelectedBatch}
                        </span>
                    </div>
                )}
            </div>

            {/* HERO CARD - Displays Single Class prominently */}
            {todaySchedule?.hasClass ? (
                <div className={`
                    relative rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden border border-white/10
                    bg-gradient-to-br ${todaySchedule.classInfo.gradient}
                `}>
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        
                        {/* Left: Icon & Title */}
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 p-5">
                                {todaySchedule.classInfo.icon}
                            </div>
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-black/20 text-white/90 text-xs font-bold uppercase tracking-widest border border-white/10 mb-2">
                                    Ongoing Session
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                    {todaySchedule.classInfo.fullTitle}
                                </h2>
                                <p className="text-white/80 text-lg mt-1 font-medium opacity-90">
                                    {todaySchedule.classInfo.subject} Module
                                </p>
                            </div>
                        </div>

                        {/* Right: Time & Details */}
                        <div className="flex flex-col items-start md:items-end gap-3 bg-black/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <Clock className="text-white/80 w-5 h-5" />
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    {todaySchedule.classInfo.time}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                                <MapPin size={16} />
                                <span>Lecture Hall {todaySchedule.classInfo.room}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Empty State
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <CalendarDays className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">No classes scheduled</h3>
                        <p className="text-gray-400 mt-2">Take a break and recharge!</p>
                    </div>
                </div>
            )}
        </section>

        {/* --- SECTION 2: UPCOMING SCHEDULE (Grid) --- */}
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
                                ? `${dayData.classInfo.glass} hover:border-white/30` 
                                : 'bg-white/5 border-white/5 opacity-60'}
                        `}
                    >
                        {/* Top: Date Header */}
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

                        {/* Middle: Class Content */}
                        <div className="p-5 min-h-[140px] flex flex-col justify-center relative">
                            {dayData.hasClass ? (
                                <>
                                    {/* Decorative Gradient Blob */}
                                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${dayData.classInfo.gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg bg-black/20 backdrop-blur-sm shadow-sm ${dayData.classInfo.textColor}`}>
                                                {React.cloneElement(dayData.classInfo.icon, { className: "w-5 h-5" })}
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${dayData.classInfo.textColor}`}>
                                                {dayData.classInfo.subject}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-base font-bold text-white leading-tight mb-3 line-clamp-2">
                                            {dayData.classInfo.fullTitle}
                                        </h3>

                                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-3">
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
                                    <span className="text-sm font-medium text-gray-500">No classes scheduled</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>

      </main>

      {/* --- BOTTOM CONTROLLERS --- */}
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