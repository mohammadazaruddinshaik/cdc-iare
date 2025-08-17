import React, { useState, useEffect } from 'react';
import { Trophy, BarChart3, CalendarOff } from 'lucide-react';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import Header from '../components/Header';
import { getCourseIcon, getRankBadge, getRankIcon } from '../utils/helpers';

// Batch-wise timetable data
const batchWiseTimetable = {
    "SKILLUP BATCH-1": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5102" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5102" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "AWS", room: "5102" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" }] },
    "SKILLUP BATCH-2": { Monday: [{ time: "9:30AM - 12:15PM", subject: "AWS", room: "5106" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5106" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5106" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106" }] },
    "SKILLUP BATCH-3": { Monday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "AWS", room: "5104" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5104" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" }] },
    "SKILLNEXT-1": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5204" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5204" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5204" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5204" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5204" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5204" }] },
    "SKILLNEXT-2": { Monday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5104" }] },
    "SKILLNEXT-3": { Monday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5102" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5102" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102" }] },
    "SKILLBRIDGE BATCH-1": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5101" }] },
    "SKILLBRIDGE BATCH-2": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5005" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5005" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5005" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5005" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5005" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5005" }] },
    "SKILLBRIDGE BATCH-3": { Monday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5201" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5201" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5201" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5201" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5201" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5201" }] },
    "SKILLBRIDGE BATCH-4": { Monday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5101" }] },
    "SKILLBRIDGE BATCH-5": { Monday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5106" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5106" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" }] }
};

// Update this constant with the newly calculated maximums
const maxCodingScores = {
    GeeksforGeeks: 3000,
    LeetCode: 8000,
    CodeChef: 500,
};
const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState(null);

    const courseMapping = {
        'CP': { title: "Competitive Programming", bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50", progressColor: "bg-gradient-to-r from-blue-600 to-purple-600" },
        'JFS': { title: "Java Full Stack", bgColor: "bg-gradient-to-br from-orange-100 via-orange-50 to-red-50", progressColor: "bg-gradient-to-r from-orange-600 to-red-600" },
        'AWS': { title: "Amazon Web Services", bgColor: "bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50", progressColor: "bg-gradient-to-r from-purple-600 to-indigo-600" },
        'DBMS': { title: "Database Management System", bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50", progressColor: "bg-gradient-to-r from-green-600 to-teal-600" }
    };

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const rollno = localStorage.getItem('rollno');
                if (!rollno) {
                    throw new Error('Roll number not found in localStorage');
                }

                const response = await fetch('http://localhost:5000/api/Student/getDashboardData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "rollno": rollno })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                localStorage.setItem("batch", data.student.batch);
                setStudentData(data);
                
                setTimeout(() => {
                    setIsLoading(false);
                    setAnimate(true);
                }, 800);
                
            } catch (err) {
                console.error('Error fetching student data:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    const getCourseData = () => {
        if (!studentData?.attendance?.courseAttendance) return [];
        return Object.entries(studentData.attendance.courseAttendance).map(([courseCode, attendance]) => {
            const courseInfo = courseMapping[courseCode];
            if (!courseInfo) return null;
            
            const progress = attendance.totalDays > 0 ? Math.round((attendance.presentDays / attendance.totalDays) * 100) : 0;
            
            return {
                title: courseInfo.title,
                progress: progress,
                present: attendance.presentDays,
                totalDays: attendance.totalDays,
                bgColor: courseInfo.bgColor,
                progressColor: courseInfo.progressColor
            };
        }).filter(Boolean);
    };

    const getCodingScores = () => {
        if (!studentData?.codingPerformance?.scores) return [];
        const { scores } = studentData.codingPerformance;
        return Object.entries(maxCodingScores).map(([platform, maxScore]) => {
            let currentScore = 0;
            if (platform === "GeeksforGeeks") currentScore = scores.gfg || 0;
            else if (platform === "LeetCode") currentScore = scores.leetcode || 0;
            else if (platform === "CodeChef") currentScore = scores.codechef || 0;

            return { platform, score: currentScore, maxScore };
        });
    };
    
    const getTopCoders = () => {
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
    };

    const getOverallAttendance = () => {
        if (!studentData?.attendance?.overallAttendance) return 0;
        const { totalDays, presentDays } = studentData.attendance.overallAttendance;
        return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    };

    const getTodaysSchedule = () => {
        const studentBatch = studentData?.student?.batch;
        if (!studentBatch) return [];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[new Date().getDay()];
        const batchTimetable = batchWiseTimetable[studentBatch];
        return batchTimetable?.[dayName] || [];
    };

    const courseData = React.useMemo(getCourseData, [studentData]);
    const codingScores = React.useMemo(getCodingScores, [studentData]);
    const topCoders = React.useMemo(getTopCoders, [studentData]);
    const overallAttendance = React.useMemo(getOverallAttendance, [studentData]);
    const todaysSchedule = React.useMemo(getTodaysSchedule, [studentData]);

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

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
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
                        <div className={`w-full md:w-3/5 bg-white/10 backdrop-blur-lg text-white rounded-2xl sm:rounded-3xl p-4 shadow-2xl border border-white/10 relative overflow-hidden transform transition-all duration-1000 delay-300 flex flex-col justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            <h2 className="text-base sm:text-lg font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Today's Timetable</h2>
                            {todaysSchedule.length > 0 ? (
                                todaysSchedule.map((session, index) => {
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
                        <div className={`w-full md:w-2/5 bg-white/10 backdrop-blur-lg text-white rounded-2xl sm:rounded-3xl p-4 shadow-2xl border border-white/10 relative overflow-hidden transform transition-all duration-1000 delay-400 h-full flex flex-col items-center justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50"></div>
                            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent absolute top-2">Overall Attendance</h2>
                            <div className="relative z-10 mt-4">
                                <DonutChart percentage={overallAttendance} presentColor="#60A5FA" absentColor="#374151" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-white transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            Your Courses
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {courseData.map((course, index) => (
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
                                                <div className={`h-2.5 rounded-full ${course.progressColor} shadow-lg relative overflow-hidden transition-all duration-1000 ease-out`} style={{ width: `${course.progress}%` }}>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                                </div>
                                            </div>
                                            <p className="text-base font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                                {course.progress}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
                                <BarChart data={codingScores} />
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
                                {topCoders.length > 0 ? topCoders.map((coder, index) => (
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
                                                <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md"><span className="font-semibold">GFG:</span> {coder.scores.gfg}</div>
                                                <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md"><span className="font-semibold">LC:</span> {coder.scores.leetcode}</div>
                                                <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md"><span className="font-semibold">CC:</span> {coder.scores.codechef}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg mt-2 self-start">
                                            {getRankIcon(coder.rank)}
                                            <span className="font-bold text-[#071225] text-lg">{coder.totalScore}</span>
                                        </div>
                                    </div>
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

export default DashboardPage;