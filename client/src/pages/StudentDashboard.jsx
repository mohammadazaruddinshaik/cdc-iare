import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, BarChart3, CalendarOff, Code, BookOpen } from 'lucide-react';
import BarChart from '../components/BarChart';
import Header from '../components/Header';
import { getCourseIcon } from '../utils/helpers';

// -----------------------------------------------------------------------------
// Helper Functions (Defined first to prevent reference errors)
// -----------------------------------------------------------------------------

const getRankBadge = (rank) => {
    switch (rank) {
        case 1:
            return "bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500";
        case 2:
            return "bg-gradient-to-br from-gray-300 to-slate-400 border-gray-500";
        case 3:
            return "bg-gradient-to-br from-orange-300 to-amber-400 border-orange-500";
        default:
            return "bg-gray-100 border-gray-300";
    }
};

const getRankIcon = (rank) => {
    switch (rank) {
        case 1:
            return <Trophy className="w-5 h-5 text-yellow-600" />;
        case 2:
            return <Trophy className="w-5 h-5 text-slate-600" />;
        case 3:
            return <Trophy className="w-5 h-5 text-orange-600" />;
        default:
            return null;
    }
};

const AnimatedNumber = ({ value, duration = 1500 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animation = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const nextValue = Math.floor(progress * value);
            setDisplayValue(nextValue);
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        };
        requestAnimationFrame(animation);
    }, [value, duration]);

    return <span>{displayValue}</span>;
};


// -----------------------------------------------------------------------------
// Reusable Components
// -----------------------------------------------------------------------------

const DonutChart = ({ percentage, displayPercentage, presentColor, absentColor }) => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={absentColor} strokeWidth={strokeWidth} fill="transparent" className="opacity-20" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={presentColor} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                    {displayPercentage}%
                </span>
            </div>
        </div>
    );
};

const CourseCard = ({ course, index, animate }) => {
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => {
                setProgressWidth(course.progress);
            }, 200 + index * 100);
            return () => clearTimeout(timer);
        }
    }, [course.progress, index, animate]);

    return (
        <div key={course.title} className={`${course.bgColor} rounded-2xl sm:rounded-3xl p-5 text-gray-800 shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 flex flex-col border border-white/20 relative overflow-hidden group`} style={{ animationDelay: `${index * 150}ms` }}>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex items-start justify-between mb-3 relative z-10">
                <h3 className="font-bold text-sm leading-tight pr-2">{course.title}</h3>
                <div className="w-9 h-9 bg-white/30 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                    {getCourseIcon(course.title)}
                </div>
            </div>
            <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Present: {course.present}</span>
                    <span>Absent: {course.totalDays - course.present}</span>
                </div>
                <div className="text-xs text-center text-gray-600">
                    {course.present}/{course.totalDays} days attended
                </div>
            </div>
            <div className="mt-auto">
                <div className="flex items-center justify-between">
                    <div className="w-full bg-black/20 rounded-full h-2.5 mr-3 shadow-inner">
                        <div
                            className={`h-2.5 rounded-full ${course.progressColor} shadow-lg relative overflow-hidden transition-all duration-[2000ms] ease-out`}
                            style={{ width: `${progressWidth}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-base font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {animate ? <AnimatedNumber value={course.progress} /> : 0}%
                    </p>
                </div>
            </div>
        </div>
    );
};

const TopCoderCard = ({ coder, index, animate }) => (
    <div key={coder.rank} className={`${getRankBadge(coder.rank)} relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 min-h-[160px]`} style={{ animationDelay: `${index * 100}ms` }}>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
        <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md bg-black/30 backdrop-blur-md">
            {coder.rank}
        </div>
        <div>
            <h3 className="font-bold text-base text-gray-800 mb-2 flex items-center truncate">
                {coder.name}
                {index === 0 && <span className="ml-2 text-yellow-600">👑</span>}
            </h3>
            <div className="flex flex-wrap gap-1 text-xs text-gray-700 mb-2">
                <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md">
                    <span className="font-semibold text-green-700">GFG:</span> {animate ? <AnimatedNumber value={coder.scores.gfg} /> : 0}
                </div>
                <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md">
                    <span className="font-semibold text-yellow-700">LC:</span> {animate ? <AnimatedNumber value={coder.scores.leetcode} /> : 0}
                </div>
                <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md">
                    <span className="font-semibold text-blue-700">CC:</span> {animate ? <AnimatedNumber value={coder.scores.codechef} /> : 0}
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg mt-2 self-start">
            {getRankIcon(coder.rank)}
            <span className="font-bold text-[#071225] text-lg">
                {animate ? <AnimatedNumber value={coder.totalScore} /> : 0}
            </span>
        </div>
    </div>
);


// -----------------------------------------------------------------------------
// Main Dashboard Component
// -----------------------------------------------------------------------------

const backendUrl = import.meta.env.VITE_BASE_URL;
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
    "SKILLNEXT BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5204" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5204" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5204" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5204" } ]
    },
    "SKILLNEXT BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ]
    },
    "SKILLNEXT BATCH-3": {
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
const maxCodingScores = {
    GeeksforGeeks: 3000,
    LeetCode: 8000,
    CodeChef: 500,
};

const StudentDashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const navigate = useNavigate();
    
    // State for animated values
    const [animatedAttendance, setAnimatedAttendance] = useState(0);
    const [animatedDisplayAttendance, setAnimatedDisplayAttendance] = useState(0);

    const courseMapping = {
        'CP': { title: "Competitive Programming", bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50", progressColor: "bg-gradient-to-r from-blue-600 to-purple-600" },
        'JFS': { title: "Java Full Stack", bgColor: "bg-gradient-to-br from-orange-100 via-orange-50 to-red-50", progressColor: "bg-gradient-to-r from-orange-600 to-red-600" },
        'AWS': { title: "Amazon Web Services", bgColor: "bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50", progressColor: "bg-gradient-to-r from-purple-600 to-indigo-600" },
        'DBMS': { title: "Database Management System", bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50", progressColor: "bg-gradient-to-r from-green-600 to-teal-600" }
    };

    useEffect(() => {
        const fetchStudentData = async () => {
            let dataFetched = false;
            try {
                const rollno = sessionStorage.getItem('userIdentifier');
                if (!rollno) throw new Error('User session not found. Please log in again.');

                const response = await fetch(`${backendUrl}/api/Student/getDashboardData`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "rollno": rollno }),
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred' }));
                    throw new Error(errorData.message || `Could not fetch data. Status: ${response.status}`);
                }

                const data = await response.json();
                sessionStorage.setItem("batch", data.student.batch);
                setStudentData(data);
                dataFetched = true;

            } catch (err) {
                console.error('Dashboard Error:', err.message);
                sessionStorage.clear();
                navigate('/', { replace: true });
            } finally {
                setIsLoading(false);
                if (dataFetched) {
                    setTimeout(() => setAnimate(true), 100);
                }
            }
        };
        fetchStudentData();
    }, [navigate]);
    
    const overallAttendance = useMemo(() => {
        if (!studentData?.attendance?.overallAttendance) return 0;
        const { totalDays, presentDays } = studentData.attendance.overallAttendance;
        return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    }, [studentData]);

    // Effect for animating the donut chart
    useEffect(() => {
        if (animate) {
            setAnimatedAttendance(overallAttendance); // Animate the circle stroke
            
            // Animate the text number
            let start = 0;
            const end = overallAttendance;
            if (start === end) return;
            
            const duration = 1500;
            const incrementTime = (duration / end) || 50;
            
            const timer = setInterval(() => {
                start += 1;
                setAnimatedDisplayAttendance(start);
                if (start >= end) clearInterval(timer);
            }, incrementTime);
            
            return () => clearInterval(timer);
        }
    }, [animate, overallAttendance]);


    const getCourseData = useMemo(() => {
        if (!studentData?.attendance?.courseAttendance) return [];
        return Object.entries(studentData.attendance.courseAttendance).map(([courseCode, attendance]) => {
            const courseInfo = courseMapping[courseCode];
            if (!courseInfo) return null;
            const progress = attendance.totalDays > 0 ? Math.round((attendance.presentDays / attendance.totalDays) * 100) : 0;
            return {
                title: courseInfo.title,
                progress,
                present: attendance.presentDays,
                totalDays: attendance.totalDays,
                bgColor: courseInfo.bgColor,
                progressColor: courseInfo.progressColor
            };
        }).filter(Boolean);
    }, [studentData, courseMapping]);

    const getCodingScores = useMemo(() => {
        if (!studentData?.codingPerformance?.scores) return [];
        const { scores } = studentData.codingPerformance;
        return Object.entries(maxCodingScores).map(([platform, maxScore]) => {
            let currentScore = 0;
            if (platform === "GeeksforGeeks") currentScore = scores.gfg || 0;
            else if (platform === "LeetCode") currentScore = scores.leetcode || 0;
            else if (platform === "CodeChef") currentScore = scores.codechef || 0;
            return { platform, score: currentScore, maxScore };
        });
    }, [studentData]);

    const getTopCoders = useMemo(() => {
        if (!studentData?.topCoders) return [];
        return studentData.topCoders.map((student, index) => ({
            rank: index + 1,
            name: student.rollno,
            totalScore: student.totalScore,
            scores: {
                gfg: student.scores.gfg || 0,
                leetcode: student.scores.leetcode || 0,
                codechef: student.scores.codechef || 0
            }
        }));
    }, [studentData]);

    const getTodaysSchedule = useMemo(() => {
        const studentBatch = studentData?.student?.batch;
        if (!studentBatch) return [];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[new Date().getDay()];
        const batchTimetable = batchWiseTimetable[studentBatch];
        return batchTimetable?.[dayName] || [];
    }, [studentData]);

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

    if (!studentData) {
        return null;
    }

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] sm:rounded-bl-[3rem] sm:rounded-br-[3rem] relative overflow-hidden pb-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-50">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10 mt-6">
                        <div className={`w-full md:w-3/4 bg-white/10 backdrop-blur-lg text-white rounded-2xl sm:rounded-3xl p-4 shadow-2xl border border-white/10 relative overflow-hidden transform transition-all duration-1000 delay-300 flex flex-col justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            <h2 className="text-base sm:text-lg font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Today's Timetable</h2>
                            {getTodaysSchedule.length > 0 ? (
                                getTodaysSchedule.map((session, index) => {
                                    const [startTime, endTime] = session.time.split(' - ');
                                    const courseInfo = courseMapping[session.subject] || { title: session.subject };
                                    return (
                                        <div key={index} className="flex items-center justify-between bg-black/20 p-3 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm flex-shrink-0">
                                                    {getCourseIcon(courseInfo.title)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm sm:text-base text-white">{courseInfo.title}</p>
                                                    <p className="text-xs text-gray-300">Room No: {session.room}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm sm:text-base text-white">{startTime}</p>
                                                <p className="text-xs text-gray-400">{endTime}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center bg-black/20 p-3 rounded-xl h-[68px]">
                                    <CalendarOff className="w-5 h-5 mr-3 text-gray-400" />
                                    <p className="font-semibold text-sm sm:text-base text-white">No classes scheduled for today!</p>
                                </div>
                            )}
                        </div>

                        <div className={`w-full md:w-1/4 bg-white/10 backdrop-blur-lg text-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden transform transition-all duration-1000 delay-400 h-full flex flex-col items-center justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50"></div>
                            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent absolute top-2">Overall Attendance</h2>
                            <div className="relative z-10 mt-4">
                                <DonutChart 
                                    percentage={animatedAttendance} 
                                    displayPercentage={animatedDisplayAttendance}
                                    presentColor="#60A5FA" 
                                    absentColor="#374151" 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-white transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            Your Courses
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {getCourseData.map((course, index) => (
                                <CourseCard key={course.title} course={course} index={index} animate={animate} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className={`lg:col-span-1 space-y-6 transform transition-all duration-1000 delay-800 ${animate ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 relative overflow-hidden group h-full">
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                            <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#071225] flex items-center">
                                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
                                    Coding Performance
                                </h2>
                            </div>
                            <div className="relative z-10">
                                <BarChart data={getCodingScores} />
                            </div>
                        </div>
                    </div>
                    <div className={`lg:col-span-2 transform transition-all duration-1000 delay-1000 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 h-full relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-purple-50/50"></div>
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 relative z-10 gap-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#071225] flex items-center">
                                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-yellow-600" />
                                    Top Coders
                                </h2>
                                <div className="text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full shadow-lg font-semibold flex-shrink-0">
                                    🏆 Leaderboard
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                {getTopCoders.length > 0 ? getTopCoders.map((coder, index) => (
                                    <TopCoderCard key={coder.rank} coder={coder} index={index} animate={animate} />
                                )) : (
                                    <div className="col-span-3 text-center text-gray-500 py-8">
                                        <p>No coding data available for the leaderboard.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentDashboardPage;