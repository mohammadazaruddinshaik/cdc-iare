import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Code, Cloud, Database } from 'lucide-react';
import Header from '../components/Header';

// --- Centralized Timetable Data ---
const batchWiseTimetable = {
    "SKILLUP BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5102" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "AWS", room: "5102" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ]
    },
    "SKILLUP BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "AWS", room: "5106" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5106" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ]
    },
    "SKILLUP BATCH-3": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "AWS", room: "5104" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ]
    },
    "SKILLNEXT-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5204" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5204" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5204" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5204" } ]
    },
    "SKILLNEXT-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ]
    },
    "SKILLNEXT-3": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5102" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ]
    },
    "SKILLBRIDGE BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5101" } ]
    },
    "SKILLBRIDGE BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5005" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5005" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5005" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5005" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5005" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5005" } ]
    },
    "SKILLBRIDGE BATCH-3": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5201" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5201" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5201" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5201" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5201" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5201" } ]
    },
    "SKILLBRIDGE BATCH-4": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5101" } ]
    },
    "SKILLBRIDGE BATCH-5": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5106" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ]
    }
};

// --- Subject Details Mapping ---
const subjectDetails = {
    'CP': { title: 'Competitive Programming', icon: <Code className="w-5 h-5 text-white" /> },
    'JFS': { title: 'Java Full Stack', icon: <Code className="w-5 h-5 text-white" /> },
    'AWS': { title: 'Amazon Web Services', icon: <Cloud className="w-5 h-5 text-white" /> },
    'DBMS': { title: 'Database Management System', icon: <Database className="w-5 h-5 text-white" /> },
};


const TimetablePage = () => {
    const [animate, setAnimate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentBatch, setStudentBatch] = useState('');
    const [weeklySchedule, setWeeklySchedule] = useState([]);

    useEffect(() => {
        // Fetch student data to get their batch
        const fetchStudentData = async () => {
            try {
                const rollno = localStorage.getItem('rollno');
                if (!rollno) {
                    throw new Error('Roll number not found. Please log in again.');
                }
                const batch = localStorage.getItem("batch");
                setStudentBatch(batch);

            } catch (err) {
                console.error("Error fetching student data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
                setTimeout(() => setAnimate(true), 100);
            }
        };

        fetchStudentData();
    }, []);

    useEffect(() => {
        // Process and set the weekly schedule when studentBatch is available
        if (!studentBatch) return;

        const batchTimetable = batchWiseTimetable[studentBatch];
        if (!batchTimetable) {
            console.warn(`No timetable found for batch: ${studentBatch}`);
            setWeeklySchedule([]);
            return;
        }

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const schedule = daysOfWeek.map(day => {
            const dailyClasses = batchTimetable[day] || [];
            
            const formattedClasses = dailyClasses.map(classInfo => {
                const details = subjectDetails[classInfo.subject] || { title: classInfo.subject, icon: <></> };
                return {
                    time: classInfo.time,
                    subject: details.title,
                    room: classInfo.room,
                    icon: details.icon,
                    type: 'Lecture' // Assuming all are lectures
                };
            });
            
            return {
                day,
                schedule: formattedClasses
            };
        });

        setWeeklySchedule(schedule);

    }, [studentBatch]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#071225] to-[#0A1B3A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/50 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#071225] to-[#0A1B3A] flex items-center justify-center text-white p-4">
                 <div className="bg-white/10 backdrop-blur-xl rounded-lg p-8 text-center border border-white/20">
                    <h2 className="text-xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white">
            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <Calendar className="w-8 h-8 text-blue-400" />
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Weekly Schedule
                            </h1>
                        </div>
                        {studentBatch && (
                             <div className="bg-white/10 backdrop-blur-xl rounded-lg px-4 py-2 border border-white/20 text-sm">
                                Batch: <span className="font-bold">{studentBatch}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {weeklySchedule.map((dayData, dayIndex) => (
                            <div 
                                key={dayData.day}
                                className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                style={{ transitionDelay: `${dayIndex * 100}ms` }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">{dayData.day}</h2>
                                <div className="space-y-6">
                                    {dayData.schedule.length > 0 ? (
                                        dayData.schedule.map((classInfo, classIndex) => (
                                            <div
                                                key={`${dayData.day}-${classIndex}`}
                                                className="bg-black/20 rounded-xl p-5 transform transition-all duration-300 hover:shadow-lg hover:bg-black/30"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="font-semibold text-lg mb-1">{classInfo.subject}</p>
                                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{classInfo.type}</span>
                                                    </div>
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                                                        {classInfo.icon}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{classInfo.time}</span>
                                                    </div>
                                                    <p className="text-xs">Room No: {classInfo.room}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-400 bg-black/20 rounded-xl p-5">
                                            No classes scheduled.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TimetablePage;