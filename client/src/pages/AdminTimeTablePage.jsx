import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Code, Cloud, Database, Filter, User, LogOut, Menu, X } from 'lucide-react';

import Header from '../components/Header';


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

// --- Subject Details Mapping ---
const subjectDetails = {
  'CP': { title: 'Competitive Programming', icon: <Code className="w-5 h-5 text-white" /> },
  'JFS': { title: 'Java Full Stack', icon: <Code className="w-5 h-5 text-white" /> },
  'AWS': { title: 'Amazon Web Services', icon: <Cloud className="w-5 h-5 text-white" /> },
  'DBMS': { title: 'Database Management', icon: <Database className="w-5 h-5 text-white" /> },
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetablePage = () => {
  const [animate, setAnimate] = useState(false);
  const [view, setView] = useState('today'); // 'today' or 'week'
  const [allBatches, setAllBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetableData, setTimetableData] = useState([]);

  useEffect(() => {
    sessionStorage.setItem("userRole", "admin");
    
    const batches = Object.keys(batchWiseTimetable);
    setAllBatches(batches);
    if (batches.length > 0) {
      setSelectedBatch(batches[0]);
    }

    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (view === 'today') {
      const todaySchedule = allBatches.map(batch => {
        const batchTimetable = batchWiseTimetable[batch];
        const dailyClasses = batchTimetable[today] || [];
        const formattedClasses = dailyClasses.map(classInfo => {
          const details = subjectDetails[classInfo.subject] || { title: classInfo.subject, icon: null };
          return { ...classInfo, subject: details.title, icon: details.icon, type: 'Lecture' };
        });
        return { batchName: batch, schedule: formattedClasses };
      });
      setTimetableData(todaySchedule);
    } else {
      if (!selectedBatch) {
        setTimetableData([]);
        return;
      }
      const batchTimetable = batchWiseTimetable[selectedBatch];
      const weeklySchedule = daysOfWeek.map(day => {
        const dailyClasses = batchTimetable[day] || [];
        const formattedClasses = dailyClasses.map(classInfo => {
          const details = subjectDetails[classInfo.subject] || { title: classInfo.subject, icon: null };
          return { ...classInfo, subject: details.title, icon: details.icon, type: 'Lecture' };
        });
        return { day, schedule: formattedClasses };
      });
      setTimetableData(weeklySchedule);
    }
  }, [view, selectedBatch, allBatches]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white">
      <div className="px-4 sm:px-6 lg:px-8 relative z-10">
        <Header animate={animate} />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Master Timetable
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg border border-white/20">
                <button onClick={() => setView('today')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === 'today' ? 'bg-white text-gray-900' : 'text-white'}`}>Today's Schedule</button>
                <button onClick={() => setView('week')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === 'week' ? 'bg-white text-gray-900' : 'text-white'}`}>Batch Wise (Week)</button>
              </div>
              {view === 'week' && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-300"/>
                  <select
                    value={selectedBatch}
                    onChange={e => setSelectedBatch(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    {allBatches.map(batch => (
                      <option key={batch} value={batch} className="bg-[#071225] text-white">
                        {batch}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {view === 'today' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {timetableData.map((batchData, index) => (
                <div key={batchData.batchName} className={`bg-white/5 backdrop-blur-xl rounded-xl p-5 shadow-2xl border border-white/10 flex flex-col transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${index * 100}ms` }}>
                  <h2 className="text-lg font-bold text-white mb-4">{batchData.batchName}</h2>
                  <div className="space-y-4">
                    {batchData.schedule.length > 0 ? (
                      batchData.schedule.map((classInfo, classIndex) => (
                        <div key={classIndex} className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{classInfo.subject}</p>
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{classInfo.type}</span>
                            </div>
                            <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center shadow-lg flex-shrink-0">{classInfo.icon}</div>
                          </div>
                          <div className="text-xs text-gray-300 flex items-center gap-2 pt-2 border-t border-white/10">
                            <Clock className="w-3 h-3" />
                            <span>{classInfo.time} (Room: {classInfo.room})</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 bg-black/20 rounded-lg p-4">No classes scheduled today.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {timetableData.map((dayData, index) => (
                <div key={dayData.day} className={`bg-white/5 backdrop-blur-xl rounded-xl p-5 shadow-2xl border border-white/10 flex flex-col transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${index * 100}ms` }}>
                  <h2 className="text-xl font-bold text-white mb-4">{dayData.day}</h2>
                  <div className="space-y-4">
                    {dayData.schedule.length > 0 ? (
                      dayData.schedule.map((classInfo, classIndex) => (
                        <div key={classIndex} className="bg-black/20 rounded-lg p-4">
                           <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-medium text-base mb-1.5">{classInfo.subject}</p>
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{classInfo.type}</span>
                            </div>
                            <div className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center shadow-lg flex-shrink-0">{classInfo.icon}</div>
                           </div>
                           <div className="text-sm text-gray-300 space-y-1.5 mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{classInfo.time}</span>
                            </div>
                            <p className="text-xs pl-6">Room No: {classInfo.room}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 bg-black/20 rounded-lg p-4">No classes scheduled.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTimetablePage;
