import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Code, 
    Database, 
    Cloud,
    Clock,
    Calendar,
    BookOpen,
    QrCode,
    ClipboardList,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import Header from '../components/Header';

// Timetable data (as provided in the previous version)
const batchWiseTimetable = {
    "SKILLUP BATCH-1": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5102", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5102", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5102", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "AWS", room: "5102", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5102", type: "Lecture" }] },
    "SKILLUP BATCH-2": { Monday: [{ time: "9:30AM - 12:15PM", subject: "AWS", room: "5106", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5106", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5106", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5106", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5106", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106", type: "Lecture" }] },
    "SKILLUP BATCH-3": { Monday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104", type: "Lecture" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "AWS", room: "5104", type: "Lecture" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5104", type: "Lecture" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104", type: "Lecture" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104", type: "Lecture" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104", type: "Lecture" }] },
    "SKILLNEXT BATCH-1": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5204", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5204", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5204", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5204", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5204", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5204", type: "Lecture" }] },
    "SKILLNEXT BATCH-2": { Monday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5104", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5104", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5104", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5104", type: "Lecture" }] },
    "SKILLNEXT BATCH-3": { Monday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5102", type: "Lecture" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5102", type: "Lecture" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5102", type: "Lecture" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102", type: "Lecture" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5102", type: "Lecture" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5102", type: "Lecture" }] },
    "SKILLBRIDGE BATCH-1": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5101", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5101", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5101", type: "Lecture" }] },
    "SKILLBRIDGE BATCH-2": { Monday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5005", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5005", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5005", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5005", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5005", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5005", type: "Lecture" }] },
    "SKILLBRIDGE BATCH-3": { Monday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5201", type: "Lecture" }], Tuesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5201", type: "Lecture" }], Wednesday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5201", type: "Lecture" }], Thursday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5201", type: "Lecture" }], Friday: [{ time: "1:15PM - 3:50PM", subject: "DBMS", room: "5201", type: "Lecture" }], Saturday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5201", type: "Lecture" }] },
    "SKILLBRIDGE BATCH-4": { Monday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5101", type: "Lecture" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101", type: "Lecture" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5101", type: "Lecture" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5101", type: "Lecture" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5101", type: "Lecture" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5101", type: "Lecture" }] },
    "SKILLBRIDGE BATCH-5": { Monday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106", type: "Lecture" }], Tuesday: [{ time: "1:15PM - 3:50PM", subject: "CP", room: "5106", type: "Lecture" }], Wednesday: [{ time: "1:15PM - 3:50PM", subject: "JFS", room: "5106", type: "Lecture" }], Thursday: [{ time: "9:30AM - 12:15PM", subject: "CP", room: "5106", type: "Lecture" }], Friday: [{ time: "9:30AM - 12:15PM", subject: "DBMS", room: "5106", type: "Lecture" }], Saturday: [{ time: "9:30AM - 12:15PM", subject: "JFS", room: "5106", type: "Lecture" }] }
};

const getCourseIcon = (subject) => {
    if (subject.includes("JFS")) return <Code className="w-8 h-8 text-orange-500" />;
    if (subject.includes("CP")) return <Code className="w-8 h-8 text-blue-500" />;
    if (subject.includes("DBMS")) return <Database className="w-8 h-8 text-green-500" />;
    if (subject.includes("AWS")) return <Cloud className="w-8 h-8 text-purple-500" />;
    return <BookOpen className="w-8 h-8 text-gray-500" />;
};

// --- SUB-COMPONENTS for the new workflow ---

// Step 1: Grid of course boxes
const CourseSelectionGrid = ({ schedule, onSelectCourse, animate }) => (
    <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 1: Select a Course</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedule.map((course, index) => (
                <button
                    key={index}
                    onClick={() => onSelectCourse(course)}
                    className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left transition-all duration-700 delay-${index * 100} hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 group ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    <div className="flex items-start justify-between mb-4">
                        {getCourseIcon(course.subject)}
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-1 rounded-full">{course.type}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{course.subject}</h3>
                    <p className="text-slate-500 font-medium">{course.batch}</p>
                    <div className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{course.time}</span>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

// Step 2: Boxes for choosing attendance method
const AttendanceMethodSelection = ({ course, onBack, animate }) => {
    const navigate = useNavigate();
    return (
        <div className={`transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-semibold mb-6 hover:text-slate-800 transition-colors">
                <ArrowLeft size={18} />
                Back to Courses
            </button>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{course.subject}</h2>
                <p className="text-slate-500 font-medium">{course.batch}</p>
                <div className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.time} (Room: {course.room})</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 2: Choose Attendance Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    onClick={() => navigate('/faculty/attendance/qr', { state: { course } })}
                    className="bg-slate-800 text-white p-8 rounded-2xl text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-slate-900 hover:shadow-2xl transform hover:-translate-y-1"
                >
                    <QrCode className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold">Scan QR Code</h3>
                    <p className="text-slate-400 mt-1 text-sm">Generate a QR code for students to scan.</p>
                </div>
                <div 
                    onClick={() => navigate('/faculty/attendance/manual', { state: { course } })}
                    className="bg-slate-200 text-slate-800 p-8 rounded-2xl text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-slate-300 hover:shadow-2xl transform hover:-translate-y-1"
                >
                    <ClipboardList className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold">Manual Entry</h3>
                    <p className="text-slate-500 mt-1 text-sm">Mark attendance using a checklist.</p>
                </div>
            </div>
        </div>
    );
};


// --- MAIN POST ATTENDANCE PAGE COMPONENT ---
const FacultyAttendancePage = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        try {
            setLoading(true);
            const facultyBatches = JSON.parse(localStorage.getItem('facultybatches'));
            if (!facultyBatches || facultyBatches.length === 0) {
                throw new Error("No assigned batches found. Please contact an administrator.");
            }
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const today = days[new Date().getDay()];
            
            let todaySchedule = [];
            facultyBatches.forEach(batchName => {
                const scheduleForBatch = batchWiseTimetable[batchName];
                if (scheduleForBatch && scheduleForBatch[today]) {
                    scheduleForBatch[today].forEach(session => {
                        todaySchedule.push({ ...session, batch: batchName });
                    });
                }
            });
            todaySchedule.sort((a, b) => a.time.localeCompare(b.time));
            setSchedule(todaySchedule);
        } catch (err) {
            setError(err.message);
        } finally {
            setTimeout(() => {
                setLoading(false);
                setAnimate(true);
            }, 500);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen text-slate-800 font-sans bg-slate-50">
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-b-[2rem] relative overflow-hidden pb-8">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={true} />
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Post Attendance</h1>
                    <p className="text-slate-500">
                        {selectedCourse ? `Marking attendance for ${selectedCourse.subject}.` : "Select a course from your schedule to begin."}
                    </p>
                </div>
                
                {error && (<div className="text-center bg-red-100 text-red-700 rounded-lg p-6 border border-red-200"><h3 className="font-bold">Could not load schedule</h3><p>{error}</p></div>)}

                {!error && schedule.length > 0 && (
                    selectedCourse ? (
                        <AttendanceMethodSelection 
                            course={selectedCourse} 
                            onBack={() => setSelectedCourse(null)}
                            animate={animate}
                        />
                    ) : (
                        <CourseSelectionGrid 
                            schedule={schedule} 
                            onSelectCourse={setSelectedCourse}
                            animate={animate}
                        />
                    )
                )}

                {!error && schedule.length === 0 && (
                    <div className="text-center bg-white rounded-lg p-10 border border-slate-200 shadow-md">
                        <Calendar className="w-16 h-16 mx-auto text-green-400" />
                        <h3 className="mt-4 text-xl font-bold text-slate-800">All Clear!</h3>
                        <p className="text-slate-500 mt-2">You have no classes scheduled for today.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FacultyAttendancePage;