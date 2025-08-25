import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { 
  Trophy, 
  Code, 
  Database, 
  Cloud,
  Clock,
  Calendar,
  ClipboardCheck,
  UserCog,
  BookOpen,
  Download,
  User,
  LogOut,
  Menu,
  X 
} from 'lucide-react';
import Header from '../components/Header';


const batchWiseTimetable = {
  "SKILLUP BATCH-1": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5102", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5102", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5102", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "AWS", room: "5102", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5102", type: "Lecture" }]
  },
  "SKILLUP BATCH-2": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "AWS", room: "5106", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5106", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5106", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5106", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5106", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106", type: "Lecture" }]
  },
  "SKILLUP BATCH-3": {
    Monday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104", type: "Lecture" }],
    Tuesday: [{ time: "1:15PM - 3:50PM", subject: "AWS", room: "5104", type: "Lecture" }],
    Wednesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5104", type: "Lecture" }],
    Thursday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104", type: "Lecture" }],
    Friday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104", type: "Lecture" }],
    Saturday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104", type: "Lecture" }]
  },
  "SKILLNEXT BATCH-1": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5204", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5204", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5204", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5204", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5204", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5204", type: "Lecture" }]
  },
  "SKILLNEXT BATCH-2": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5104", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5104", type: "Lecture" }]
  },
  "SKILLNEXT BATCH-3": {
    Monday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5102", type: "Lecture" }],
    Tuesday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5102", type: "Lecture" }],
    Wednesday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5102", type: "Lecture" }],
    Thursday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102", type: "Lecture" }],
    Friday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5102", type: "Lecture" }],
    Saturday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102", type: "Lecture" }]
  },
  "SKILLBRIDGE BATCH-1": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5101", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5101", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5101", type: "Lecture" }]
  },
  "SKILLBRIDGE BATCH-2": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5005", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5005", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5005", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5005", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5005", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5005", type: "Lecture" }]
  },
  "SKILLBRIDGE BATCH-3": {
    Monday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5201", type: "Lecture" }],
    Tuesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5201", type: "Lecture" }],
    Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5201", type: "Lecture" }],
    Thursday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5201", type: "Lecture" }],
    Friday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5201", type: "Lecture" }],
    Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5201", type: "Lecture" }]
  },
  "SKILLBRIDGE BATCH-4": {
    Monday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5101", type: "Lecture" }],
    Tuesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101", type: "Lecture" }],
    Wednesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101", type: "Lecture" }],
    Thursday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5101", type: "Lecture" }],
    Friday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101", type: "Lecture" }],
    Saturday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5101", type: "Lecture" }]
  },
  "SKILLBRIDGE BATCH-5": {
    Monday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106", type: "Lecture" }],
    Tuesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106", type: "Lecture" }],
    Wednesday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5106", type: "Lecture" }],
    Thursday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5106", type: "Lecture" }],
    Friday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5106", type: "Lecture" }],
    Saturday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5106", type: "Lecture" }]
  }
};


// --- UTILITY FUNCTIONS ---
const getCourseIcon = (subject) => {
  if (subject.includes("JFS")) return <Code className="w-5 h-5 text-orange-400" />;
  if (subject.includes("CP")) return <Code className="w-5 h-5 text-blue-400" />;
  if (subject.includes("DBMS")) return <Database className="w-5 h-5 text-green-400" />;
  if (subject.includes("AWS")) return <Cloud className="w-5 h-5 text-purple-400" />;
  return <BookOpen className="w-5 h-5 text-gray-400" />;
};

const getRankBadge = (rank) => {
  if (rank === 1) return "bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500";
  if (rank === 2) return "bg-gradient-to-br from-gray-300 to-slate-400 border-gray-500";
  if (rank === 3) return "bg-gradient-to-br from-orange-300 to-amber-400 border-orange-500";
  return "bg-gray-100 border-gray-300";
};

const getRankIcon = (rank) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-600" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-slate-600" />;
  if (rank === 3) return <Trophy className="w-5 h-5 text-orange-600" />;
  return null;
};


// --- FACULTY DASHBOARD COMPONENT ---
const FacultyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userIdentifier = localStorage.getItem('userIdentifier');

        if (!userIdentifier) {
          throw new Error("Faculty ID not found. Please log in again.");
        }
        
        const response = await fetch(`http://localhost:5000/api/Faculty/getDashboardData/${userIdentifier}`, {
          method : "GET",
          credentials: "include"
        });
        
        if (!response.ok) {
            let errorMessage = `HTTP error! Status: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) { /* Ignore if response is not JSON */ }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setDashboardData(data);

        localStorage.setItem('userRole', 'faculty');
        localStorage.setItem("facultybatches", JSON.stringify(data.faculty.batches_assigned));

        // Use setTimeout to create a smoother loading transition
        setTimeout(() => {
            setLoading(false);
            setAnimate(true);
        }, 800);

      } catch (err) {
        console.error("API Error:", err);
        setError(err.message || "An unknown error occurred.");
        setLoading(false);
        setAnimate(true); // Animate the error message in
      }
    };

    fetchDashboardData();
  }, []);

  const handleSessionClick = (batch, subject, time) => {
    navigate('/faculty/update-student', { state: { batch, subject, time } });
  };

  // --- RENDER LOGIC ---

  if (loading) {
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
      <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center p-4">
        <div className={`bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto transform transition-all duration-500 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate('/login')} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
      return null; // Should not be reached if loading/error states are handled
  }

  // --- DATA PREPARATION FOR RENDERING ---
  const { faculty, topCoders } = dashboardData;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  
  let todaySchedule = [];
  faculty.batches_assigned.forEach(batchName => {
      const scheduleForBatch = batchWiseTimetable[batchName];
      if (scheduleForBatch && scheduleForBatch[today]) {
          scheduleForBatch[today].forEach(session => {
              todaySchedule.push({ ...session, batch: batchName, icon: getCourseIcon(session.subject) });
          });
      }
  });

  todaySchedule.sort((a, b) => a.time.localeCompare(b.time));
  const displayedSchedule = todaySchedule.slice(0, 3);
  
  const rankedTopCoders = topCoders.map((coder, index) => ({
      ...coder,
      rank: index + 1
  }));

  return (
    <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
      <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-b-[3rem] relative overflow-hidden pb-8">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <Header animate={animate} />
          <div className="space-y-8 mt-6">
            <div className={`transform transition-all duration-1000 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Calendar className="w-5 h-5 mr-3"/>Today's Schedule</h2>
              {displayedSchedule.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {displayedSchedule.map((classInfo, idx) => (
                    <div key={idx} className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl p-5 shadow-2xl border border-white/10 cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:bg-black/30 hover:-translate-y-1" onClick={() => handleSessionClick(classInfo.batch, classInfo.subject, classInfo.time)}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-base mb-1.5 text-white">{classInfo.subject} ({classInfo.batch})</p>
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{classInfo.type}</span>
                        </div>
                        <div className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center shadow-lg flex-shrink-0">{classInfo.icon}</div>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1.5 mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{classInfo.time}</span></div>
                        <p className="text-xs pl-6">Room No: {classInfo.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (<div className="text-center text-gray-400 bg-white/5 backdrop-blur-xl rounded-xl p-10 shadow-2xl border border-white/10">No classes scheduled for today.</div>)}
            </div>
            
            <div className={`transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-xl font-bold text-white mb-4">Quick Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div onClick={() => navigate('/faculty/action')} className="bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 rounded-2xl p-5 text-gray-800 shadow-lg transition-all hover:-translate-y-1 hover:scale-105 flex flex-col border border-white/20 relative cursor-pointer overflow-hidden group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-sm leading-tight pr-2">Post Attendance</h3>
                    <div className="w-9 h-9 bg-white/30 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0"><ClipboardCheck className="w-5 h-5 text-blue-600" /></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Mark student attendance for classes.</p>
                </div>
                <div onClick={() => navigate('/faculty/reports')} className="bg-gradient-to-br from-green-100 via-green-50 to-teal-50 rounded-2xl p-5 text-gray-800 shadow-lg transition-all hover:-translate-y-1 hover:scale-105 flex flex-col border border-white/20 relative cursor-pointer overflow-hidden group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-sm leading-tight pr-2">Download Reports</h3>
                    <div className="w-9 h-9 bg-white/30 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0"><Download className="w-5 h-5 text-green-600" /></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Download performance reports.</p>
                </div>
                <div onClick={() => navigate('/faculty/update-student')} className="bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 rounded-2xl p-5 text-gray-800 shadow-lg transition-all hover:-translate-y-1 hover:scale-105 flex flex-col border border-white/20 relative cursor-pointer overflow-hidden group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-sm leading-tight pr-2">Update Student</h3>
                    <div className="w-9 h-9 bg-white/30 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0"><UserCog className="w-5 h-5 text-purple-600" /></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Modify student details or scores.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className={`transform transition-all duration-1000 delay-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 h-full relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 relative z-10 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#071225] flex items-center"><Trophy className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-yellow-600" />Top Coders</h2>
                <div className="text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full shadow-lg font-semibold flex-shrink-0">🏆 Leaderboard</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                {rankedTopCoders.map((coder, index) => (
                  <div key={coder.rollno} className={`${getRankBadge(coder.rank)} relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 min-h-[160px]`} style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md bg-black/30 backdrop-blur-md">{coder.rank}</div>
                    <div>
                      <h3 className="font-bold text-base text-gray-800 mb-2 flex items-center truncate">{coder.rollno}{coder.rank === 1 && <span className="ml-2 text-yellow-600">👑</span>}</h3>
                      <div className="flex flex-wrap gap-1 text-xs text-gray-700 mb-2">
                        <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md"><span className="font-semibold">LC:</span> {coder.scores.leetcode}</div>
                        <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md"><span className="font-semibold">GFG:</span> {coder.scores.gfg}</div>
                        <div className="bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md"><span className="font-semibold">CC:</span> {coder.scores.codechef}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg mt-2 self-start">
                      {getRankIcon(coder.rank)}
                      <span className="font-bold text-[#071225] text-lg">{coder.totalScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
