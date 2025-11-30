import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, Code, Cloud, Database, MapPin, 
    ChevronRight, ChevronLeft, Sun, CalendarDays, Layers, 
    Terminal, Coffee, CloudLightning, Trophy, Filter, LayoutGrid
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
      gradient: 'from-blue-600 to-indigo-600',
      glass: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-300',
      icon: <Terminal className="w-full h-full text-white" /> 
  },
  'JFS': { 
      title: 'Java Full Stack', 
      gradient: 'from-orange-500 to-red-600',
      glass: 'bg-orange-500/10 border-orange-500/20',
      text: 'text-orange-300',
      icon: <Coffee className="w-full h-full text-white" /> 
  },
  'DBS': { 
      title: 'Database Solutions', 
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

const AdminTimetablePage = () => {
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [allBatches, setAllBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  // --- NEW: Date Selection State ---
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [todaysGlobalSchedule, setTodaysGlobalSchedule] = useState([]); 
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 

  const navigate = useNavigate();

  // --- 1. Init: Load Batches ---
  useEffect(() => {
    setTimeout(() => {
        const batches = Object.keys(batchWiseTimetable);
        if (batches.length > 0) {
            setAllBatches(batches);
            setSelectedBatch(batches[0]); 
        }
        setIsLoading(false);
        setTimeout(() => setAnimate(true), 100);
    }, 500);
  }, []);

  // --- 2. LOGIC: COMPUTE SCHEDULE FOR SELECTED DATE (ALL BATCHES) ---
  useEffect(() => {
    if (allBatches.length === 0) return;

    // Get Day Name from Selected Date (e.g., "Monday")
    const targetDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const globalData = allBatches.map(batch => {
        // Fetch classes for that specific day
        const dailyClasses = batchWiseTimetable[batch] ? (batchWiseTimetable[batch][targetDayName] || []) : [];
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
            batchName: batch,
            hasClass: !!classDetails,
            classInfo: classDetails
        };
    });

    setTodaysGlobalSchedule(globalData);
  }, [allBatches, selectedDate]); // Re-run when date changes

  // --- 3. LOGIC: COMPUTE UPCOMING SCHEDULE FOR *SELECTED* BATCH ---
  useEffect(() => {
    if (!selectedBatch || !batchWiseTimetable[selectedBatch]) return;

    const batchTimetable = batchWiseTimetable[selectedBatch];
    const allDates = [];
    let currentDate = new Date(); // Always starts from today for "Upcoming"
    let safetyCounter = 0;
    
    // Start from Tomorrow
    currentDate.setDate(currentDate.getDate() + 1);

    while (allDates.length < 12 && safetyCounter < 30) {
        const dayIndex = currentDate.getDay();
        if (dayIndex !== 0) { allDates.push(new Date(currentDate)); } 
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
    }

    const processedData = allDates.map((date) => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const displayDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const displayDay = date.toLocaleDateString('en-US', { weekday: 'short' });

        const dailyClasses = batchTimetable[dayName] || [];
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
            hasClass: !!classDetails,
            classInfo: classDetails,
        };
    });

    setUpcomingSchedule(processedData); 
  }, [selectedBatch]);

  const ITEMS_PER_PAGE = 6;
  const currentViewSchedule = upcomingSchedule.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  // Helper to format date input string
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

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
        
        {/* =========================================================
            SECTION 1: CAMPUS OVERVIEW (DATE FILTER) 
           ========================================================= */}
        <section className={`transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {/* Title & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <LayoutGrid className="text-blue-400 w-5 h-5" />
                        </div>
                        Master Time Table
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 ml-14 font-medium">
                        Showing schedule for: <span className="text-white font-bold">{selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </p>
                </div>

                {/* --- DATE SELECTOR --- */}
                <div className="relative z-30">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-xl backdrop-blur-md">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-3">Select Date:</span>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={formatDateForInput(selectedDate)}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="bg-[#0F172A] text-white text-sm font-bold px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-blue-500 appearance-none min-w-[150px] cursor-pointer"
                            />
                            <Calendar className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of All Batches for Selected Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {todaysGlobalSchedule.map((batchData, idx) => (
                    <div 
                        key={idx}
                        className={`
                            relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg
                            ${batchData.hasClass ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white/5 border-white/5 opacity-50'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-bold text-white truncate w-3/4" title={batchData.batchName}>
                                {batchData.batchName}
                            </h3>
                            {batchData.hasClass ? (
                                <div className={`p-1.5 rounded-md ${batchData.classInfo.glass} ${batchData.classInfo.textColor}`}>
                                    {React.cloneElement(batchData.classInfo.icon, { className: "w-3 h-3" })}
                                </div>
                            ) : (
                                <div className="p-1.5 rounded-md bg-white/5 text-gray-500">
                                    <Sun size={12} />
                                </div>
                            )}
                        </div>

                        {batchData.hasClass ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${batchData.classInfo.gradient}`}></div>
                                    <div>
                                        <p className="text-xs text-gray-300 font-medium line-clamp-1">{batchData.classInfo.fullTitle}</p>
                                        <p className={`text-[10px] font-bold ${batchData.classInfo.textColor} tracking-wider`}>{batchData.classInfo.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/20 px-1.5 py-0.5 rounded">
                                        <Clock size={10} /> {batchData.classInfo.time.split(' - ')[0]}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <MapPin size={10} /> {batchData.classInfo.room}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 bg-black/10 rounded-lg">
                                <span className="text-xs text-gray-500 font-medium">No Class</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* --- SECTION 2: BATCH DETAIL VIEW --- */}
        <section className={`transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <CalendarDays className="text-purple-400 w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Specific Batch Plan</h2>
                </div>

                {/* Batch Selector */}
                <div className="relative z-30 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#0F172A] border border-white/20 p-1.5 rounded-xl shadow-lg ring-1 ring-white/5">
                        <div className="px-2 text-gray-400">
                            <Filter size={14} />
                        </div>
                        <select
                            value={selectedBatch}
                            onChange={(e) => {
                                setSelectedBatch(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="bg-transparent text-white px-2 py-1.5 pr-8 focus:outline-none cursor-pointer text-sm font-bold appearance-none min-w-[200px]"
                        >
                            {allBatches.map(batch => (
                                <option key={batch} value={batch} className="bg-[#071225] text-white">
                                    {batch}
                                </option>
                            ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-gray-500 absolute right-3 pointer-events-none rotate-90" />
                    </div>
                </div>
            </div>

            {/* Upcoming Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentViewSchedule.map((dayData, index) => (
                    <div 
                        key={index}
                        className={`
                            relative rounded-2xl border transition-all duration-300 overflow-hidden group hover:shadow-xl
                            ${dayData.hasClass 
                                ? `${dayData.classInfo.glass} hover:border-white/20` 
                                : 'bg-white/5 border-white/5 opacity-60'}
                        `}
                    >
                        {/* Header */}
                        <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="text-center">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{dayData.day}</span>
                                    <span className="block text-lg font-bold text-white leading-none mt-0.5">{dayData.date.split(' ')[0]}</span>
                                </div>
                                <div className="h-8 w-px bg-white/10"></div>
                                <span className="text-sm font-medium text-gray-300">{dayData.date.split(' ')[1]}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 min-h-[120px] flex flex-col justify-center relative">
                            {dayData.hasClass ? (
                                <>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg bg-black/30 backdrop-blur-sm shadow-sm ${dayData.classInfo.textColor}`}>
                                                {React.cloneElement(dayData.classInfo.icon, { className: "w-4 h-4" })}
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${dayData.classInfo.textColor}`}>
                                                {dayData.classInfo.subject}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-sm font-bold text-white leading-tight mb-3">
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
                                        <CalendarDays size={18} className="text-gray-500" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Free Day</span>
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
        <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1.5 flex items-center gap-2 pointer-events-auto ring-1 ring-white/5">
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

export default AdminTimetablePage;