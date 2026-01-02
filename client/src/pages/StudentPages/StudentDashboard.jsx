// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Trophy, CalendarOff, BookOpen, Clock, MapPin, Database, Cloud, Code, Coffee, Server, AlertCircle, User } from 'lucide-react';
// import BarChart from '../../components/BarChart';
// import Header from '../../components/Header';
// import { useAuth } from '../../context/AuthContext'; 
// import Loader from '../../components/Loader'; 

// // --- ASSET IMPORTS ---
// import leetcodeLogo from '../../assets/leetcode.webp';
// import gfgLogo from '../../assets/leetcode.webp'; 
// import codechefLogo from '../../assets/leetcode.webp'; 
// import githubLogo from '../../assets/leetcode.webp'; 

// // Fallback helper
// const getLogo = (importName, fallbackUrl) => importName || fallbackUrl;

// // --- CONFIGURATION ---
// const platformLogos = {
//     LeetCode: getLogo(leetcodeLogo, "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png"),
//     GeeksforGeeks: getLogo(gfgLogo, "https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg"),
//     CodeChef: getLogo(codechefLogo, "https://cdn.iconscout.com/icon/free/png-256/free-codechef-3628685-3029910.png"),
//     GitHub: getLogo(githubLogo, "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
// };

// // Default Themes for Unknown Courses
// const defaultThemes = [
//     { bg: "bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-50", progress: "bg-gradient-to-r from-indigo-600 to-purple-600" },
//     { bg: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50", progress: "bg-gradient-to-r from-emerald-600 to-teal-600" },
//     { bg: "bg-gradient-to-br from-rose-100 via-rose-50 to-pink-50", progress: "bg-gradient-to-r from-rose-600 to-pink-600" },
//     { bg: "bg-gradient-to-br from-amber-100 via-amber-50 to-orange-50", progress: "bg-gradient-to-r from-amber-600 to-orange-600" },
//     { bg: "bg-gradient-to-br from-cyan-100 via-cyan-50 to-sky-50", progress: "bg-gradient-to-r from-cyan-600 to-sky-600" },
// ];

// // --- SPECIFIC COURSE CONFIGURATION ---
// const knownCourses = {
//     'CP': { 
//         title: "Competitive Programming", 
//         icon: <Code className="w-5 h-5 text-blue-700" />,
//         bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50", 
//         progressColor: "bg-gradient-to-r from-blue-600 to-indigo-600" 
//     },
//     'JFS': { 
//         title: "Java Full Stack", 
//         icon: <Coffee className="w-5 h-5 text-orange-700" />,
//         bgColor: "bg-gradient-to-br from-orange-100 via-orange-50 to-red-50", 
//         progressColor: "bg-gradient-to-r from-orange-600 to-red-600" 
//     },
//     'DBS': { 
//         title: "Database Solutions", 
//         icon: <Database className="w-5 h-5 text-emerald-700" />,
//         bgColor: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50", 
//         progressColor: "bg-gradient-to-r from-emerald-600 to-green-600" 
//     },
//     'DBMS': { 
//         title: "Database Mgmt Systems", 
//         icon: <Server className="w-5 h-5 text-teal-700" />,
//         bgColor: "bg-gradient-to-br from-teal-100 via-teal-50 to-cyan-50", 
//         progressColor: "bg-gradient-to-r from-teal-600 to-cyan-600" 
//     },
//     'AWS': { 
//         title: "Amazon Web Services", 
//         icon: <Cloud className="w-5 h-5 text-yellow-700" />,
//         bgColor: "bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-50", 
//         progressColor: "bg-gradient-to-r from-yellow-500 to-orange-500" 
//     }
// };

// // --- HELPER COMPONENTS ---

// const getRankBadge = (rank) => {
//     if (rank === 1) return "bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500 shadow-yellow-200/50";
//     if (rank === 2) return "bg-gradient-to-br from-gray-300 to-slate-400 border-gray-500 shadow-gray-200/50";
//     if (rank === 3) return "bg-gradient-to-br from-orange-300 to-amber-400 border-orange-500 shadow-orange-200/50";
//     return "bg-gray-100 border-gray-300";
// };

// const getRankIcon = (rank) => {
//     if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-700" />;
//     if (rank === 2) return <Trophy className="w-6 h-6 text-slate-700" />;
//     if (rank === 3) return <Trophy className="w-6 h-6 text-orange-800" />;
//     return null;
// };

// const resolveCourseInfo = (courseCode, index = 0) => {
//     const safeCode = courseCode ? courseCode.trim() : "Unknown";
    
//     // Case 1: It is a Known Course
//     if (knownCourses[safeCode]) {
//         const kc = knownCourses[safeCode];
//         return {
//             title: kc.title, 
//             icon: kc.icon, 
//             theme: {
//                 bg: kc.bgColor,
//                 progress: kc.progressColor
//             }
//         };
//     }

//     // Case 2: Fallback for unknown courses
//     const themeIndex = index % defaultThemes.length;
//     return {
//         title: safeCode, 
//         icon: <BookOpen className="w-5 h-5 text-gray-700" />, 
//         theme: defaultThemes[themeIndex]
//     };
// };

// const AnimatedNumber = ({ value, duration = 1500 }) => {
//     const [displayValue, setDisplayValue] = useState(0);

//     useEffect(() => {
//         let startTime = null;
//         const animation = (currentTime) => {
//             if (!startTime) startTime = currentTime;
//             const progress = Math.min((currentTime - startTime) / duration, 1);
//             const nextValue = Math.floor(progress * value);
//             setDisplayValue(nextValue);
//             if (progress < 1) {
//                 requestAnimationFrame(animation);
//             }
//         };
//         requestAnimationFrame(animation);
//     }, [value, duration]);

//     return <span>{displayValue}</span>;
// };

// const DonutChart = ({ percentage, displayPercentage, presentColor, absentColor }) => {
//     const size = 100; 
//     const strokeWidth = 10;
//     const radius = (size - strokeWidth) / 2;
//     const circumference = 2 * Math.PI * radius;
//     const validPercentage = isNaN(percentage) ? 0 : percentage;
//     const offset = circumference - (validPercentage / 100) * circumference;

//     return (
//         <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
//             <svg className="transform -rotate-90" width={size} height={size}>
//                 <circle cx={size / 2} cy={size / 2} r={radius} stroke={absentColor} strokeWidth={strokeWidth} fill="transparent" className="opacity-20" />
//                 <circle cx={size / 2} cy={size / 2} r={radius} stroke={presentColor} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
//             </svg>
//             <div className="absolute inset-0 flex items-center justify-center">
//                 <span className="text-xl font-bold text-white">
//                     {displayPercentage}%
//                 </span>
//             </div>
//         </div>
//     );
// };

// // --- COMPACT COURSE CARD ---
// const CourseCard = ({ course, index, animate }) => {
//     const [progressWidth, setProgressWidth] = useState(0);

//     useEffect(() => {
//         if (animate) {
//             const timer = setTimeout(() => {
//                 setProgressWidth(course.progress);
//             }, 200 + index * 100);
//             return () => clearTimeout(timer);
//         }
//     }, [course.progress, index, animate]);

//     return (
//         <div className={`${course.bgColor} rounded-2xl p-4 text-gray-800 shadow-xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 flex flex-col border border-white/20 relative overflow-hidden group ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${index * 100}ms` }}>
//             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
            
//             <div className="flex items-start justify-between mb-3 relative z-10">
//                 <h3 className="font-bold text-base leading-tight pr-2">{course.title}</h3>
//                 <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
//                     {course.icon}
//                 </div>
//             </div>
            
//             <div className="mb-3 space-y-1">
//                 <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
//                     <span>Present: {course.present}</span>
//                     <span>Absent: {course.totalDays - course.present}</span>
//                 </div>
//                 <div className="text-[10px] text-center text-gray-500 uppercase tracking-wide">
//                     {course.present}/{course.totalDays} sessions
//                 </div>
//             </div>
            
//             <div className="mt-auto">
//                 <div className="flex items-center justify-between">
//                     <div className="w-full bg-black/10 rounded-full h-2 mr-3 shadow-inner">
//                         <div
//                             className={`h-2 rounded-full ${course.progressColor} shadow-md relative overflow-hidden transition-all duration-[2000ms] ease-out`}
//                             style={{ width: `${progressWidth}%` }}
//                         >
//                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
//                         </div>
//                     </div>
//                     <p className="text-lg font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
//                         {animate ? <AnimatedNumber value={course.progress} /> : 0}%
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- TOP CODER CARD ---
// const TopCoderCard = ({ coder, index, animate }) => (
//     <div key={index} 
//          className={`${getRankBadge(coder.rank)} relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between transition-all duration-700 ease-out hover:shadow-2xl hover:-translate-y-2 hover:scale-105 min-h-[180px] ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} 
//          style={{ transitionDelay: `${index * 150}ms` }}>
        
//         <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
        
//         <div className="flex justify-between items-start mb-4 relative z-10">
//             <div className="flex-1 pr-2">
//                 <h3 className="font-bold text-lg text-gray-900 flex items-center tracking-wide">
//                     {coder.name} 
//                 </h3>
//             </div>
//             <div className="flex items-center justify-center w-10 h-10 bg-white/40 backdrop-blur-md rounded-full shadow-lg border border-white/30">
//                 <span className="font-black text-gray-800 text-lg">
//                    #{coder.rank}
//                 </span>
//             </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
//             {coder.scores.leetcode > 0 && (
//                 <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
//                     <img src={platformLogos.LeetCode} alt="LC" className="w-5 h-5 object-contain" />
//                     <span className="text-xs font-bold text-gray-800">{coder.scores.leetcode}</span>
//                 </div>
//             )}
//             {coder.scores.gfg > 0 && (
//                 <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
//                     <img src={platformLogos.GeeksforGeeks} alt="GFG" className="w-5 h-5 object-contain" />
//                     <span className="text-xs font-bold text-gray-800">{coder.scores.gfg}</span>
//                 </div>
//             )}
//             {coder.scores.codechef > 0 && (
//                  <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
//                     <img src={platformLogos.CodeChef} alt="CC" className="w-5 h-5 object-contain" />
//                     <span className="text-xs font-bold text-gray-800">{coder.scores.codechef}</span>
//                 </div>
//             )}
//             {coder.scores.github > 0 && (
//                  <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
//                     <img src={platformLogos.GitHub} alt="GH" className="w-5 h-5 object-contain opacity-80" />
//                     <span className="text-xs font-bold text-gray-800">{coder.scores.github}</span>
//                 </div>
//             )}
//         </div>

//         <div className="mt-auto pt-3 border-t border-black/5 flex justify-between items-center relative z-10">
//              <div className="flex items-center space-x-2 text-gray-700">
//                 {getRankIcon(coder.rank)}
//                 <span className="text-xs font-bold uppercase tracking-widest text-gray-800/70">Total Score</span>
//              </div>
//              <span className="font-black text-2xl text-gray-900">
//                 {animate ? <AnimatedNumber value={coder.totalScore} /> : 0}
//             </span>
//         </div>
//     </div>
// );

// const backendUrl = import.meta.env.VITE_BASE_URL;

// const maxCodingScores = {
//     LeetCode: 500,
//     CodeChef: 500,
//     GeeksforGeeks: 500,
//     GitHub: 500
// };

// const StudentDashboardPage = () => {
//     const { logout } = useAuth();
    
//     const [isLoading, setIsLoading] = useState(true);
//     const [animate, setAnimate] = useState(false);
//     const [studentData, setStudentData] = useState(null);
//     const navigate = useNavigate();
    
//     const [animatedAttendance, setAnimatedAttendance] = useState(0);
//     const [animatedDisplayAttendance, setAnimatedDisplayAttendance] = useState(0);

//     useEffect(() => {
//         const fetchStudentData = async () => {
//             let dataFetched = false;
//             try {
//                 const response = await fetch(`${backendUrl}/api/student/get-dashboard-data`, {
//                     method: 'GET',
//                     headers: { 'Content-Type': 'application/json' },
//                     credentials: "include", 
//                 });

//                 if (response.status === 401 || response.status === 403) {
//                     logout(); 
//                     throw new Error("Unauthorized");
//                 }

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({ message: 'Server error' }));
//                     throw new Error(errorData.message || `Status: ${response.status}`);
//                 }

//                 const data = await response.json();
//                 setStudentData(data);
//                 dataFetched = true;

//             } catch (err) {
//                 console.error('Dashboard Error:', err.message);
//             } finally {
//                 setIsLoading(false);
//                 if (dataFetched) {
//                     setTimeout(() => setAnimate(true), 100);
//                 }
//             }
//         };
//         fetchStudentData();
//     }, [navigate, logout]);
    
//     const overallAttendance = useMemo(() => {
//         if (!studentData?.attendance?.overallAttendance) return 0;
//         const { totalDays, presentDays } = studentData.attendance.overallAttendance;
//         if (totalDays === 0) return 0;
//         return Math.round((presentDays / totalDays) * 100);
//     }, [studentData]);

//     useEffect(() => {
//         if (animate) {
//             setAnimatedAttendance(overallAttendance);
            
//             let start = 0;
//             const end = overallAttendance;
            
//             if (end === 0) {
//                 setAnimatedDisplayAttendance(0);
//                 return;
//             }

//             const duration = 1500;
//             const incrementTime = (duration / end) || 50;
            
//             const timer = setInterval(() => {
//                 start += 1;
//                 setAnimatedDisplayAttendance(start);
//                 if (start >= end) clearInterval(timer);
//             }, incrementTime);
            
//             return () => clearInterval(timer);
//         }
//     }, [animate, overallAttendance]);

//     const getCourseData = useMemo(() => {
//         if (!studentData?.attendance?.courseAttendance) return [];
//         return Object.entries(studentData.attendance.courseAttendance).map(([courseCode, attendance], index) => {
//             const courseDetails = resolveCourseInfo(courseCode, index);
//             const progress = attendance.totalDays > 0 ? Math.round((attendance.presentDays / attendance.totalDays) * 100) : 0;
            
//             return {
//                 title: courseDetails.title,
//                 icon: courseDetails.icon,
//                 progress,
//                 present: attendance.presentDays,
//                 totalDays: attendance.totalDays,
//                 bgColor: courseDetails.theme.bg,
//                 progressColor: courseDetails.theme.progress
//             };
//         });
//     }, [studentData]);

//     const getCodingScores = useMemo(() => {
//         if (!studentData?.codingPerformance?.scores) return [];
//         const { scores } = studentData.codingPerformance;
        
//         return [
//             { platform: "LeetCode", logo: platformLogos.LeetCode, score: scores.leetcode || 0, maxScore: maxCodingScores.LeetCode },
//             { platform: "CodeChef", logo: platformLogos.CodeChef, score: scores.codechef || 0, maxScore: maxCodingScores.CodeChef },
//             { platform: "GeeksforGeeks", logo: platformLogos.GeeksforGeeks, score: scores.gfg || 0, maxScore: maxCodingScores.GeeksforGeeks },
//             { platform: "GitHub", logo: platformLogos.GitHub, score: scores.github || 0, maxScore: maxCodingScores.GitHub },
//         ];
//     }, [studentData]);

//     const getTopCoders = useMemo(() => {
//         if (!studentData?.topCoders) return [];
//         return studentData.topCoders.map((student, index) => ({
//             rank: index + 1,
//             name: student.rollno, 
//             totalScore: student.totalScore,
//             scores: {
//                 gfg: student.scores?.gfg || 0,
//                 leetcode: student.scores?.leetcode || 0,
//                 codechef: student.scores?.codechef || 0,
//                 github: student.scores?.github || 0
//             }
//         }));
//     }, [studentData]);

//     const getTodaysSchedule = useMemo(() => {
//         return studentData?.todaySchedule || [];
//     }, [studentData]);

//     const isCodingDataAvailable = useMemo(() => {
//         return getCodingScores.some(item => item.score > 0);
//     }, [getCodingScores]);

//     const isLeaderboardAvailable = useMemo(() => {
//         return getTopCoders.some(student => student.totalScore > 0);
//     }, [getTopCoders]);


//     if (isLoading) {
//         return <Loader />;
//     }

//     if (!studentData) {
//         return null;
//     }

//     const CodingEmptyState = ({ title }) => (
//         <div className="flex flex-col items-center justify-center h-full py-12 text-center">
//             <div className="bg-gray-100 p-4 rounded-full mb-4">
//                 <AlertCircle className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">{title} Unavailable</h3>
//             <p className="text-gray-500 text-sm max-w-xs mx-auto">
//                 Metrics will appear here once you participate in coding challenges.
//             </p>
//         </div>
//     );

//     return (
//         <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
//             {/* --- DARK BLUE HEADER SECTION --- */}
//             <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] sm:rounded-bl-[3rem] sm:rounded-br-[3rem] relative overflow-hidden pb-8">
//                 <div className="absolute inset-0 overflow-hidden">
//                     <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
//                     <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
//                 </div>
//                 <div className="px-4 sm:px-6 lg:px-8 relative z-50">
//                     <Header animate={animate} />
//                     <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                    
//                     <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10 mt-6 items-stretch">
                        
//                         {/* --- TIMETABLE SECTION --- */}
//                         <div className={`w-full md:w-3/4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/10 relative overflow-hidden transform transition-all duration-1000 delay-300 flex flex-col justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
//                             {/* Decorative Glow */}
//                             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
                            
//                             {/* Header centered horizontally */}
//                             <h2 className="text-lg sm:text-xl font-bold mb-3 bg-gradient-to-r from-blue-100 to-indigo-200 bg-clip-text text-transparent flex items-center justify-start gap-2">
//                                 <Clock size={20} className="text-blue-300" /> Today's Timetable
//                             </h2>

//                             {getTodaysSchedule.length > 0 ? (
//                                 <div className="space-y-2">
//                                     {getTodaysSchedule.map((session, index) => {
//                                         const displayTime = `${session.startTime} - ${session.endTime}`;
//                                         const facultyName = session.faculty && session.faculty.length > 0 ? session.faculty[0].name : "Faculty";

//                                         return (
//                                             <div key={index} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors py-3 px-4 rounded-xl border-l-4 border-blue-500 shadow-sm relative overflow-hidden group">
//                                                 <div className="flex items-center space-x-3 relative z-10">
//                                                     <div>
//                                                         <p className="font-bold text-sm text-white group-hover:text-blue-200 transition-colors">{session.subject}</p>
//                                                         <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
//                                                             <span className="flex items-center gap-1"><User size={12} className="text-blue-300"/> {facultyName}</span>
//                                                             <span className="flex items-center gap-1"><MapPin size={12}/> {session.roomNo}</span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-right relative z-10">
//                                                     <p className="font-bold text-sm text-white tracking-wide">{displayTime}</p>
//                                                     <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">{session.session}</p>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             ) : (
//                                 <div className="flex flex-col items-center justify-center h-full bg-white/5 p-4 rounded-xl border border-dashed border-white/20">
//                                     <CalendarOff className="w-8 h-8 mb-2 text-gray-400" />
//                                     <p className="font-semibold text-sm sm:text-base text-gray-300">No classes scheduled!</p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* --- ATTENDANCE SECTION --- */}
//                         <div className={`w-full md:w-1/4 bg-gradient-to-br from-[#1e1b4b]/60 to-[#0f172a]/60 backdrop-blur-xl text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-indigo-500/20 relative overflow-hidden transform transition-all duration-1000 delay-400 flex flex-col items-center justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
//                              {/* Decorative Glows */}
//                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
//                             <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

//                             <h2 className="text-base font-bold text-white mb-2 relative z-10">Attendance</h2>
                            
//                             <div className="relative z-10 mt-1 p-2 bg-indigo-950/30 rounded-full shadow-inner border border-white/5">
//                                 <DonutChart 
//                                     percentage={animatedAttendance} 
//                                     displayPercentage={animatedDisplayAttendance}
//                                     presentColor="#818cf8" 
//                                     absentColor="#1e293b" 
//                                 />
//                             </div>
//                         </div>
//                     </div>
                    
//                     {/* --- COURSES GRID (MOVED HERE TO MATCH V1 LOCATION) --- */}
//                     <div className="mt-8">
//                         <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-white transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
//                             Your Courses
//                         </h2>
//                         {getCourseData.length > 0 ? (
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                                 {getCourseData.map((course, index) => (
//                                     <CourseCard key={index} course={course} index={index} animate={animate} />
//                                 ))}
//                             </div>
//                         ) : (
//                              <div className={`w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex items-center justify-center border border-white/10 gap-3 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
//                                 <BookOpen className="w-6 h-6 text-white/70" />
//                                 <p className="text-white text-base font-medium">No active course enrollments found.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* --- WHITE BODY SECTION --- */}
//             <div className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Coding Performance */}
//                     <div className={`lg:col-span-1 space-y-6 transform transition-all duration-1000 delay-800 ${animate ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
//                         <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 relative overflow-hidden group h-full">
//                             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                            
//                             <div className="flex items-center justify-between mb-6 relative z-10">
//                                 <h2 className="text-xl sm:text-2xl font-bold text-[#071225] flex items-center">
//                                     Your Coding Performance
//                                 </h2>
//                             </div>
//                             <div className="relative z-10 h-full">
//                                 {isCodingDataAvailable ? (
//                                     <BarChart data={getCodingScores} />
//                                 ) : (
//                                     <CodingEmptyState title="Performance" />
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Top Coders Leaderboard */}
//                     <div className={`lg:col-span-2 transform transition-all duration-1000 delay-1000 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
//                         <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 h-full relative overflow-hidden group">
//                             <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-purple-50/50"></div>
//                             <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
//                             <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                            
//                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 relative z-10 gap-4">
//                                 <h2 className="text-2xl sm:text-3xl font-bold text-[#071225] flex items-center">
//                                     Top Coders
//                                 </h2>
//                             </div>
                            
//                             {isLeaderboardAvailable ? (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
//                                     {getTopCoders.map((coder, index) => (
//                                         <TopCoderCard key={index} coder={coder} index={index} animate={animate} />
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="relative z-10">
//                                     <CodingEmptyState title="Leaderboard" />
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
// export default StudentDashboardPage;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, CalendarOff, BookOpen, Clock, MapPin, Database, Cloud, Code, Coffee, Server, AlertCircle, User } from 'lucide-react';
import BarChart from '../../components/BarChart';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext'; 
import Loader from '../../components/Loader'; 

// --- ASSET IMPORTS ---
import leetcodeLogo from '../../assets/leetcode.webp';
import gfgLogo from '../../assets/leetcode.webp'; 
import codechefLogo from '../../assets/leetcode.webp'; 
import githubLogo from '../../assets/leetcode.webp'; 

// Fallback helper
const getLogo = (importName, fallbackUrl) => importName || fallbackUrl;

// --- CONFIGURATION ---
const platformLogos = {
    LeetCode: getLogo(leetcodeLogo, "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png"),
    GeeksforGeeks: getLogo(gfgLogo, "https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg"),
    CodeChef: getLogo(codechefLogo, "https://cdn.iconscout.com/icon/free/png-256/free-codechef-3628685-3029910.png"),
    GitHub: getLogo(githubLogo, "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
};

// Default Themes for Unknown Courses
const defaultThemes = [
    { bg: "bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-50", progress: "bg-gradient-to-r from-indigo-600 to-purple-600" },
    { bg: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50", progress: "bg-gradient-to-r from-emerald-600 to-teal-600" },
    { bg: "bg-gradient-to-br from-rose-100 via-rose-50 to-pink-50", progress: "bg-gradient-to-r from-rose-600 to-pink-600" },
    { bg: "bg-gradient-to-br from-amber-100 via-amber-50 to-orange-50", progress: "bg-gradient-to-r from-amber-600 to-orange-600" },
    { bg: "bg-gradient-to-br from-cyan-100 via-cyan-50 to-sky-50", progress: "bg-gradient-to-r from-cyan-600 to-sky-600" },
];

// --- SPECIFIC COURSE CONFIGURATION ---
const knownCourses = {
    'CP': { 
        title: "Competitive Programming", 
        icon: <Code className="w-5 h-5 text-blue-700" />,
        bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50", 
        progressColor: "bg-gradient-to-r from-blue-600 to-indigo-600" 
    },
    'JFS': { 
        title: "Java Full Stack", 
        // 
        icon: <Coffee className="w-5 h-5 text-orange-700" />,
        bgColor: "bg-gradient-to-br from-orange-100 via-orange-50 to-red-50", 
        progressColor: "bg-gradient-to-r from-orange-600 to-red-600" 
    },
    'DBS': { 
        title: "Database Solutions", 
        icon: <Database className="w-5 h-5 text-emerald-700" />,
        bgColor: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50", 
        progressColor: "bg-gradient-to-r from-emerald-600 to-green-600" 
    },
    'DBMS': { 
        title: "Database Mgmt Systems",
        // 
        icon: <Server className="w-5 h-5 text-teal-700" />,
        bgColor: "bg-gradient-to-br from-teal-100 via-teal-50 to-cyan-50", 
        progressColor: "bg-gradient-to-r from-teal-600 to-cyan-600" 
    },
    'AWS': { 
        title: "Amazon Web Services", 
        // 
        icon: <Cloud className="w-5 h-5 text-yellow-700" />,
        bgColor: "bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-50", 
        progressColor: "bg-gradient-to-r from-yellow-500 to-orange-500" 
    }
};

// --- HELPER COMPONENTS ---

const getRankBadge = (rank) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500 shadow-yellow-200/50";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-slate-400 border-gray-500 shadow-gray-200/50";
    if (rank === 3) return "bg-gradient-to-br from-orange-300 to-amber-400 border-orange-500 shadow-orange-200/50";
    return "bg-gray-100 border-gray-300";
};

const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-700" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-slate-700" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-800" />;
    return null;
};

const resolveCourseInfo = (courseCode, index = 0) => {
    const safeCode = courseCode ? courseCode.trim() : "Unknown";
    
    // Case 1: It is a Known Course
    if (knownCourses[safeCode]) {
        const kc = knownCourses[safeCode];
        return {
            title: kc.title, 
            icon: kc.icon, 
            theme: {
                bg: kc.bgColor,
                progress: kc.progressColor
            }
        };
    }

    // Case 2: Fallback for unknown courses
    const themeIndex = index % defaultThemes.length;
    return {
        title: safeCode, 
        icon: <BookOpen className="w-5 h-5 text-gray-700" />, 
        theme: defaultThemes[themeIndex]
    };
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

const DonutChart = ({ percentage, displayPercentage, presentColor, absentColor }) => {
    const size = 100; 
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const validPercentage = isNaN(percentage) ? 0 : percentage;
    const offset = circumference - (validPercentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={absentColor} strokeWidth={strokeWidth} fill="transparent" className="opacity-20" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={presentColor} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                    {displayPercentage}%
                </span>
            </div>
        </div>
    );
};

// --- COMPACT COURSE CARD ---
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
        <div className={`${course.bgColor} rounded-2xl p-4 text-gray-800 shadow-xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 flex flex-col border border-white/20 relative overflow-hidden group ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${index * 100}ms` }}>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="flex items-start justify-between mb-3 relative z-10">
                <h3 className="font-bold text-base leading-tight pr-2">{course.title}</h3>
                <div className="w-10 h-10 bg-white/40 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                    {course.icon}
                </div>
            </div>
            
            <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>Present: {course.present}</span>
                    <span>Absent: {course.totalDays - course.present}</span>
                </div>
                <div className="text-[10px] text-center text-gray-500 uppercase tracking-wide">
                    {course.present}/{course.totalDays} sessions
                </div>
            </div>
            
            <div className="mt-auto">
                <div className="flex items-center justify-between">
                    <div className="w-full bg-black/10 rounded-full h-2 mr-3 shadow-inner">
                        <div
                            className={`h-2 rounded-full ${course.progressColor} shadow-md relative overflow-hidden transition-all duration-[2000ms] ease-out`}
                            style={{ width: `${progressWidth}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {animate ? <AnimatedNumber value={course.progress} /> : 0}%
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- TOP CODER CARD ---
const TopCoderCard = ({ coder, index, animate }) => (
    <div key={index} 
         className={`${getRankBadge(coder.rank)} relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between transition-all duration-700 ease-out hover:shadow-2xl hover:-translate-y-2 hover:scale-105 min-h-[180px] ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} 
         style={{ transitionDelay: `${index * 150}ms` }}>
        
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex-1 pr-2">
                <h3 className="font-bold text-lg text-gray-900 flex items-center tracking-wide">
                    {coder.name} 
                </h3>
            </div>
            <div className="flex items-center justify-center w-10 h-10 bg-white/40 backdrop-blur-md rounded-full shadow-lg border border-white/30">
                <span className="font-black text-gray-800 text-lg">
                   #{coder.rank}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
            {coder.scores.leetcode > 0 && (
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
                    <img src={platformLogos.LeetCode} alt="LC" className="w-5 h-5 object-contain" />
                    <span className="text-xs font-bold text-gray-800">{coder.scores.leetcode}</span>
                </div>
            )}
            {coder.scores.gfg > 0 && (
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
                    <img src={platformLogos.GeeksforGeeks} alt="GFG" className="w-5 h-5 object-contain" />
                    <span className="text-xs font-bold text-gray-800">{coder.scores.gfg}</span>
                </div>
            )}
            {coder.scores.codechef > 0 && (
                 <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
                    <img src={platformLogos.CodeChef} alt="CC" className="w-5 h-5 object-contain" />
                    <span className="text-xs font-bold text-gray-800">{coder.scores.codechef}</span>
                </div>
            )}
            {coder.scores.github > 0 && (
                 <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm transition-transform hover:scale-105">
                    <img src={platformLogos.GitHub} alt="GH" className="w-5 h-5 object-contain opacity-80" />
                    <span className="text-xs font-bold text-gray-800">{coder.scores.github}</span>
                </div>
            )}
        </div>

        <div className="mt-auto pt-3 border-t border-black/5 flex justify-between items-center relative z-10">
             <div className="flex items-center space-x-2 text-gray-700">
                {getRankIcon(coder.rank)}
                <span className="text-xs font-bold uppercase tracking-widest text-gray-800/70">Total Score</span>
             </div>
             <span className="font-black text-2xl text-gray-900">
                {animate ? <AnimatedNumber value={coder.totalScore} /> : 0}
            </span>
        </div>
    </div>
);

const backendUrl = import.meta.env.VITE_BASE_URL;

const maxCodingScores = {
    LeetCode: 500,
    CodeChef: 500,
    GeeksforGeeks: 500,
    GitHub: 500
};

const StudentDashboardPage = () => {
    const { logout } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const navigate = useNavigate();
    
    const [animatedAttendance, setAnimatedAttendance] = useState(0);
    const [animatedDisplayAttendance, setAnimatedDisplayAttendance] = useState(0);

    useEffect(() => {
        const fetchStudentData = async () => {
            let dataFetched = false;
            try {
                const response = await fetch(`${backendUrl}/api/student/get-dashboard-data`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include", 
                });

                if (response.status === 401 || response.status === 403) {
                    logout(); 
                    throw new Error("Unauthorized");
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                    throw new Error(errorData.message || `Status: ${response.status}`);
                }

                const data = await response.json();
                setStudentData(data);
                dataFetched = true;

            } catch (err) {
                console.error('Dashboard Error:', err.message);
            } finally {
                setIsLoading(false);
                if (dataFetched) {
                    setTimeout(() => setAnimate(true), 100);
                }
            }
        };
        fetchStudentData();
    }, [navigate, logout]);
    
    const overallAttendance = useMemo(() => {
        if (!studentData?.attendance?.overallAttendance) return 0;
        const { totalDays, presentDays } = studentData.attendance.overallAttendance;
        if (totalDays === 0) return 0;
        return Math.round((presentDays / totalDays) * 100);
    }, [studentData]);

    useEffect(() => {
        if (animate) {
            setAnimatedAttendance(overallAttendance);
            
            let start = 0;
            const end = overallAttendance;
            
            if (end === 0) {
                setAnimatedDisplayAttendance(0);
                return;
            }

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
        return Object.entries(studentData.attendance.courseAttendance).map(([courseCode, attendance], index) => {
            const courseDetails = resolveCourseInfo(courseCode, index);
            const progress = attendance.totalDays > 0 ? Math.round((attendance.presentDays / attendance.totalDays) * 100) : 0;
            
            return {
                title: courseDetails.title,
                icon: courseDetails.icon,
                progress,
                present: attendance.presentDays,
                totalDays: attendance.totalDays,
                bgColor: courseDetails.theme.bg,
                progressColor: courseDetails.theme.progress
            };
        });
    }, [studentData]);

    const getCodingScores = useMemo(() => {
        if (!studentData?.codingPerformance?.scores) return [];
        const { scores } = studentData.codingPerformance;
        
        return [
            { platform: "LeetCode", logo: platformLogos.LeetCode, score: scores.leetcode || 0, maxScore: maxCodingScores.LeetCode },
            { platform: "CodeChef", logo: platformLogos.CodeChef, score: scores.codechef || 0, maxScore: maxCodingScores.CodeChef },
            { platform: "GeeksforGeeks", logo: platformLogos.GeeksforGeeks, score: scores.gfg || 0, maxScore: maxCodingScores.GeeksforGeeks },
            { platform: "GitHub", logo: platformLogos.GitHub, score: scores.github || 0, maxScore: maxCodingScores.GitHub },
        ];
    }, [studentData]);

    const getTopCoders = useMemo(() => {
        if (!studentData?.topCoders) return [];
        return studentData.topCoders.map((student, index) => ({
            rank: index + 1,
            name: student.rollno, 
            totalScore: student.totalScore,
            scores: {
                gfg: student.scores?.gfg || 0,
                leetcode: student.scores?.leetcode || 0,
                codechef: student.scores?.codechef || 0,
                github: student.scores?.github || 0
            }
        }));
    }, [studentData]);

    const getTodaysSchedule = useMemo(() => {
        return studentData?.todaySchedule || [];
    }, [studentData]);

    const isCodingDataAvailable = useMemo(() => {
        return getCodingScores.some(item => item.score > 0);
    }, [getCodingScores]);

    const isLeaderboardAvailable = useMemo(() => {
        return getTopCoders.some(student => student.totalScore > 0);
    }, [getTopCoders]);


    if (isLoading) {
        return <Loader />;
    }

    if (!studentData) {
        return null;
    }

    const CodingEmptyState = ({ title }) => (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title} Unavailable</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Metrics will appear here once you participate in coding challenges.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            {/* --- DARK BLUE HEADER SECTION --- */}
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] sm:rounded-bl-[3rem] sm:rounded-br-[3rem] relative overflow-hidden pb-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-50">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                    
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10 mt-6 items-stretch">
                        
                        {/* --- TIMETABLE SECTION --- */}
                        <div className={`w-full md:w-3/4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/10 relative overflow-hidden transform transition-all duration-1000 delay-300 flex flex-col justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
                            
                            {/* Header centered horizontally */}
                            <h2 className="text-lg sm:text-xl font-bold mb-3 bg-gradient-to-r from-blue-100 to-indigo-200 bg-clip-text text-transparent flex items-center justify-start gap-2">
                                <Clock size={20} className="text-blue-300" /> Today's Timetable
                            </h2>

                            {getTodaysSchedule.length > 0 ? (
                                <div className="space-y-2">
                                    {getTodaysSchedule.map((session, index) => {
                                        const displayTime = `${session.startTime} - ${session.endTime}`;
                                        const facultyName = session.faculty && session.faculty.length > 0 ? session.faculty[0].name : "Faculty";

                                        return (
                                            <div key={index} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors py-3 px-4 rounded-xl border-l-4 border-blue-500 shadow-sm relative overflow-hidden group">
                                                <div className="flex items-center space-x-3 relative z-10">
                                                    <div>
                                                        <p className="font-bold text-sm text-white group-hover:text-blue-200 transition-colors">{session.subject}</p>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                            <span className="flex items-center gap-1"><User size={12} className="text-blue-300"/> {facultyName}</span>
                                                            <span className="flex items-center gap-1"><MapPin size={12}/> {session.roomNo}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right relative z-10">
                                                    <p className="font-bold text-sm text-white tracking-wide">{displayTime}</p>
                                                    <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">{session.session}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full bg-white/5 p-4 rounded-xl border border-dashed border-white/20">
                                    <CalendarOff className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="font-semibold text-sm sm:text-base text-gray-300">No classes scheduled!</p>
                                </div>
                            )}
                        </div>

                        {/* --- ATTENDANCE SECTION --- */}
                        <div className={`w-full md:w-1/4 bg-gradient-to-br from-[#1e1b4b]/60 to-[#0f172a]/60 backdrop-blur-xl text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-indigo-500/20 relative overflow-hidden transform transition-all duration-1000 delay-400 flex flex-col items-center justify-center ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                             {/* Decorative Glows */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                            <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

                            <h2 className="text-base font-bold text-white mb-2 relative z-10">Attendance</h2>
                            
                            <div className="relative z-10 mt-1 p-2 bg-indigo-950/30 rounded-full shadow-inner border border-white/5">
                                <DonutChart 
                                    percentage={animatedAttendance} 
                                    displayPercentage={animatedDisplayAttendance}
                                    presentColor="#818cf8" 
                                    absentColor="#1e293b" 
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* --- COURSES GRID (MOVED HERE TO MATCH V1 LOCATION) --- */}
                    <div className="mt-8">
                        <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-white transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                            Your Courses
                        </h2>
                        {getCourseData.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {getCourseData.map((course, index) => (
                                    <CourseCard key={index} course={course} index={index} animate={animate} />
                                ))}
                            </div>
                        ) : (
                             <div className={`w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex items-center justify-center border border-white/10 gap-3 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                                <BookOpen className="w-6 h-6 text-white/70" />
                                <p className="text-white text-base font-medium">No active course enrollments found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- WHITE BODY SECTION --- */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coding Performance */}
                    <div className={`lg:col-span-1 space-y-6 transform transition-all duration-1000 delay-800 ${animate ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 relative overflow-hidden group h-full">
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#071225] flex items-center">
                                    Your Coding Performance
                                </h2>
                            </div>
                            <div className="relative z-10 h-full">
                                {isCodingDataAvailable ? (
                                    <BarChart data={getCodingScores} />
                                ) : (
                                    <CodingEmptyState title="Performance" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Coders Leaderboard */}
                    <div className={`lg:col-span-2 transform transition-all duration-1000 delay-1000 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 h-full relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-purple-50/50"></div>
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 relative z-10 gap-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#071225] flex items-center">
                                    Top Coders
                                </h2>
                            </div>
                            
                            {isLeaderboardAvailable ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                    {getTopCoders.map((coder, index) => (
                                        <TopCoderCard key={index} coder={coder} index={index} animate={animate} />
                                    ))}
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <CodingEmptyState title="Leaderboard" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentDashboardPage;