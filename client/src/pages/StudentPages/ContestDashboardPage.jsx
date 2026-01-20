// import React, { useState, useEffect } from 'react';
// import { ArrowRight, Clock, Terminal, AlertCircle, Loader2, PlayCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate, useParams } from 'react-router-dom';

// const backendUrl = import.meta.env.VITE_BASE_URL;

// // --- COMPONENT: DIFFICULTY BADGE ---
// const DifficultyBadge = ({ level }) => {
//     const colors = {
//         Easy: "text-emerald-700 bg-emerald-100 border-emerald-200",
//         Medium: "text-amber-700 bg-amber-100 border-amber-200",
//         Hard: "text-rose-700 bg-rose-100 border-rose-200"
//     };
//     const safeLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Medium';
    
//     return (
//         <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${colors[safeLevel] || colors.Medium}`}>
//             {safeLevel}
//         </span>
//     );
// };

// const ContestDashboard = () => {
//     const navigate = useNavigate();
//     const { contestId } = useParams(); 
    
//     const [contestData, setContestData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [timeLeft, setTimeLeft] = useState('00:00:00');
//     const [hoveredId, setHoveredId] = useState(null);

//     // --- FINISH EXAM STATES ---
//     const [showFinishModal, setShowFinishModal] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // --- 1. FETCH DATA ---
//     useEffect(() => {
//         const fetchExamDetails = async () => {
//             try {
//                 const targetId = contestId || 'SPRINT-2';
//                 const response = await fetch(`${backendUrl}/api/student/get-exam-details/${targetId}`, {
//                     method: 'GET',
//                     headers: { 'Content-Type': 'application/json' },
//                     credentials: 'include'
//                 });

//                 const json = await response.json();

//                 if (json.success) {
//                     setContestData(json.data);
//                 } else {
//                     setError('Failed to load contest details.');
//                 }
//             } catch (err) {
//                 console.error(err);
//                 setError('Network error. Please try again.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchExamDetails();
//     }, [contestId]);

//     // --- 2. TIMER LOGIC ---
//     useEffect(() => {
//         if (!contestData?.endTime) return;

//         const interval = setInterval(() => {
//             const end = new Date(contestData.endTime).getTime();
//             const now = new Date().getTime();
//             const distance = end - now;

//             if (distance < 0) {
//                 setTimeLeft("ENDED");
//                 clearInterval(interval);
//             } else {
//                 const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//                 const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//                 const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
//                 const h = hours < 10 ? `0${hours}` : hours;
//                 const m = minutes < 10 ? `0${minutes}` : minutes;
//                 const s = seconds < 10 ? `0${seconds}` : seconds;
                
//                 setTimeLeft(`${h}:${m}:${s}`);
//             }
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [contestData]);

//     // --- 3. FINISH EXAM LOGIC ---
//     const handleFinalSubmit = async () => {
//         setIsSubmitting(true);
//         try {
//             const payload = {
//                 examId: contestData?.examId || contestId
//             };

//             const response = await fetch(`${backendUrl}/api/student/final-submit`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//                 credentials: 'include'
//             });

//             const json = await response.json();

//             if (json.success) {
//                 // Navigate to a success page or back to dashboard
//                 // Assuming route '/student/dashboard' exists, or replace with '/'
//                 navigate('/student/dashboard'); 
//             } else {
//                 alert(json.message || "Failed to submit exam.");
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Network error occurred during submission.");
//         } finally {
//             setIsSubmitting(false);
//             setShowFinishModal(false);
//         }
//     };

//     if (loading) return (
//         <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
//             <Loader2 className="animate-spin text-blue-600" size={32} />
//         </div>
//     );

//     if (error || !contestData) return (
//         <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-red-500 font-bold gap-2">
//             <AlertCircle /> {error || "No data found"}
//         </div>
//     );

//     // --- 4. CALCULATE STATS ---
//     const totalUserMarks = contestData.problems.reduce((sum, p) => sum + (p.marksObtained || 0), 0);
//     const totalMaxScore = contestData.problems.reduce((sum, p) => sum + (p.maxMarks || 0), 0);

//     const handleProblemClick = (problemId) => {
//         navigate(`/contests/${contestData.examId}/problem/${problemId}`);
//     };

//     return (
//         <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden relative pb-10">
//             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none"></div>

//             {/* --- HEADER --- */}
//             <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
//                 <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
//                             <Terminal className="text-white" size={20} />
//                         </div>
//                         <div className="hidden sm:block">
//                             <h1 className="font-black text-lg text-slate-900 tracking-tight leading-none">
//                                 {contestData.examName}
//                             </h1>
//                             <div className="flex items-center gap-2 mt-1">
//                                 <span className={`w-1.5 h-1.5 rounded-full ${timeLeft === 'ENDED' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
//                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                                     {timeLeft === 'ENDED' ? 'Exam Ended' : 'Live Contest'}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//                         <div className="flex flex-col items-center">
//                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Time Remaining</span>
//                             <div className={`font-mono font-black text-2xl tracking-wider ${timeLeft === 'ENDED' ? 'text-red-500' : 'text-slate-900'}`}>
//                                 {timeLeft}
//                             </div>
//                         </div>
//                     </div>

//                     <div>
//                         <button 
//                             onClick={() => setShowFinishModal(true)}
//                             className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-95"
//                         >
//                             Finish Exam
//                         </button>
//                     </div>
//                 </div>
//             </header>

//             <main className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative z-10">
//                 <div className="space-y-6">
//                      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
//                         <div>
//                             <h2 className="text-xl font-bold text-slate-900">Problem Set</h2>
//                             <p className="text-slate-500 text-sm mt-1">Select a challenge to begin coding.</p>
//                         </div>
                        
//                         <div className="text-right">
//                             <span className="block text-2xl font-black text-slate-900 leading-none">
//                                 {totalUserMarks} <span className="text-slate-300 text-lg">/ {totalMaxScore}</span>
//                             </span>
//                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Score</span>
//                         </div>
//                     </div>

//                     <div className="grid gap-4">
//                         <AnimatePresence>
//                             {contestData.problems.map((prob, idx) => {
//                                 const status = prob.status; 
//                                 const isSolved = status === 'Accepted' || status === 'Solved';
//                                 const isInProgress = status === 'In-Progress';
//                                 const isNotAttempted = status === 'Not Attempted';

//                                 return (
//                                     <motion.div
//                                         key={prob.problemNo} 
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: idx * 0.05 }}
//                                         onMouseEnter={() => setHoveredId(prob.problemNo)}
//                                         onMouseLeave={() => setHoveredId(null)}
//                                         className={`
//                                             relative rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300 group bg-white
//                                             ${isSolved 
//                                                 ? 'border-emerald-100 bg-emerald-50/10' 
//                                                 : isInProgress 
//                                                     ? 'border-amber-200 bg-amber-50/10' 
//                                                     : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50'
//                                             }
//                                         `}
//                                     >
//                                         <div className={`
//                                             w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold border transition-colors shrink-0
//                                             ${isSolved
//                                                 ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
//                                                 : isInProgress
//                                                     ? 'bg-amber-100 border-amber-200 text-amber-600'
//                                                     : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100'}
//                                         `}>
//                                             {String(prob.problemNo).padStart(2, '0')}
//                                         </div>

//                                         <div className="flex-1 w-full">
//                                             <h3 className={`text-lg font-bold mb-1 transition-colors ${isSolved ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-700'}`}>
//                                                 {prob.title}
//                                             </h3>
//                                             <div className="flex items-center gap-4">
//                                                 <DifficultyBadge level={prob.difficulty} />
//                                                 <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
//                                                     <Clock size={12} />
//                                                     {prob.timeAllocated} Mins
//                                                 </div>
//                                                 {!isNotAttempted && (
//                                                     <span className={`text-[10px] font-bold uppercase tracking-wide ${isSolved ? 'text-emerald-600' : 'text-amber-600'}`}>
//                                                         {status}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center justify-between w-full sm:w-auto gap-8">
//                                             <div className="text-right">
//                                                 <span className={`block font-black text-lg ${isSolved ? 'text-emerald-600' : isInProgress ? 'text-amber-600' : 'text-slate-900'}`}>
//                                                     {prob.marksObtained} 
//                                                     <span className="text-slate-400 text-base"> / {prob.maxMarks}</span>
//                                                 </span>
//                                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
//                                             </div>
                                            
//                                             {isSolved ? (
//                                                 <button 
//                                                     onClick={() => handleProblemClick(prob.problemId)}
//                                                     className="h-10 px-6 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider hover:bg-emerald-200 transition-all flex items-center gap-2"
//                                                 >
//                                                     Solved <CheckCircle2 size={14} />
//                                                 </button>
//                                             ) : isInProgress ? (
//                                                 <button 
//                                                     onClick={() => handleProblemClick(prob.problemId)}
//                                                     className="h-10 px-6 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 shadow-md shadow-amber-200 transition-all flex items-center gap-2 active:scale-95"
//                                                 >
//                                                     Continue <PlayCircle size={14} />
//                                                 </button>
//                                             ) : (
//                                                 <button 
//                                                     onClick={() => handleProblemClick(prob.problemId)}
//                                                     className="h-10 px-6 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-600 shadow-sm hover:shadow-blue-200 transition-all flex items-center gap-2 group-hover:translate-x-1"
//                                                 >
//                                                     Solve <ArrowRight size={14} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </motion.div>
//                                 );
//                             })}
//                         </AnimatePresence>
//                     </div>
//                 </div>
//             </main>

//             {/* --- FINISH EXAM MODAL --- */}
//             <AnimatePresence>
//                 {showFinishModal && (
//                     <motion.div 
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
//                     >
//                         <motion.div 
//                             initial={{ scale: 0.95, opacity: 0, y: 10 }}
//                             animate={{ scale: 1, opacity: 1, y: 0 }}
//                             exit={{ scale: 0.95, opacity: 0, y: 10 }}
//                             className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
//                         >
//                             <button 
//                                 onClick={() => setShowFinishModal(false)}
//                                 className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
//                             >
//                                 <X size={20} />
//                             </button>

//                             <div className="flex flex-col items-center text-center space-y-4">
//                                 <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
//                                     <AlertTriangle size={32} />
//                                 </div>
                                
//                                 <div>
//                                     <h3 className="text-xl font-black text-slate-900">Finish Exam?</h3>
//                                     <p className="text-sm text-slate-500 mt-2 leading-relaxed">
//                                         Are you sure you want to submit? You won't be able to change your answers after this.
//                                     </p>
//                                 </div>

//                                 <div className="flex w-full gap-3 mt-4">
//                                     <button 
//                                         onClick={() => setShowFinishModal(false)}
//                                         className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button 
//                                         onClick={handleFinalSubmit}
//                                         disabled={isSubmitting}
//                                         className="flex-1 py-3 rounded-xl bg-slate-900 font-bold text-sm text-white hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
//                                     >
//                                         {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Yes, Submit"}
//                                     </button>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default ContestDashboard;


import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, Terminal, AlertCircle, Loader2, PlayCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// --- THEME CONFIGURATION ---
const THEMES = {
    light: {
        bg: "bg-[#F8FAFC]",
        text: "text-slate-900",
        subtext: "text-slate-500",
        card: "bg-white border-slate-200 hover:shadow-blue-100/50",
        header: "bg-white/90 border-slate-200",
        accent: "text-blue-600",
        button: "bg-slate-900 text-white hover:bg-blue-600",
        modal: "bg-white text-slate-900"
    },
    dark: { // Midnight
        bg: "bg-[#020617]",
        text: "text-white",
        subtext: "text-slate-400",
        card: "bg-slate-900/50 border-slate-800 hover:border-indigo-500/50",
        header: "bg-[#020617]/90 border-slate-800",
        accent: "text-indigo-400",
        button: "bg-indigo-600 text-white hover:bg-indigo-500",
        modal: "bg-[#0f172a] border border-slate-800 text-white"
    }
};

// --- COMPONENT: DIFFICULTY BADGE ---
const DifficultyBadge = ({ level }) => {
    const colors = {
        Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        Hard: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    };
    const safeLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Medium';
    
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${colors[safeLevel] || colors.Medium}`}>
            {safeLevel}
        </span>
    );
};

const ContestDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { contestId } = useParams(); 
    
    // --- 1. GET INITIAL DATA ---
    const passedData = location.state?.contestData;
    const activeThemeStr = location.state?.theme === 'dark' ? 'dark' : 'light';
    const theme = THEMES[activeThemeStr];

    const [contestData, setContestData] = useState(passedData || null);
    const [loading, setLoading] = useState(!passedData); 
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState('00:00:00');
    
    // UI States
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 2. FETCH DATA (USING GET-EXAM-DETAILS) ---
    // Reverted to use 'get-exam-details' to ensure problemId is always present for navigation.
    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                if(!contestData) setLoading(true);

                const response = await fetch(`${backendUrl}/api/student/get-exam-details/${contestId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                const json = await response.json();

                if (json.success) {
                    setContestData(json.data);
                } else {
                    if(!contestData) setError('Failed to load contest details.');
                }
            } catch (err) {
                console.error(err);
                if(!contestData) setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchExamDetails();
    }, [contestId]);

    // --- 3. TIMER LOGIC ---
    useEffect(() => {
        if (!contestData?.endTime) return;

        const interval = setInterval(() => {
            const end = new Date(contestData.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("ENDED");
                clearInterval(interval);
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                const h = hours < 10 ? `0${hours}` : hours;
                const m = minutes < 10 ? `0${minutes}` : minutes;
                const s = seconds < 10 ? `0${seconds}` : seconds;
                
                setTimeLeft(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contestData]);

    // --- 4. FINAL SUBMIT LOGIC ---
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${backendUrl}/api/student/final-submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId: contestId }),
                credentials: 'include'
            });

            const json = await response.json();

            if (json.success) {
                navigate('/student/dashboard'); 
            } else {
                alert(json.message || "Failed to submit exam.");
            }
        } catch (err) {
            console.error(err);
            alert("Network error occurred during submission.");
        } finally {
            setIsSubmitting(false);
            setShowFinishModal(false);
        }
    };

    // --- 5. NAVIGATION ---
    const handleProblemClick = (problemId) => {
        if (!problemId) {
            console.error("Problem ID is missing from API data:", contestData);
            return;
        }
        
        navigate(`/contests/${contestId}/problem/${problemId}`, {
            state: { 
                contestData, 
                theme: activeThemeStr 
            }
        });
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
            <Loader2 className={`animate-spin ${theme.accent}`} size={32} />
        </div>
    );

    if (error || !contestData) return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bg} text-red-500 font-bold gap-2`}>
            <AlertCircle /> {error || "No data found"}
        </div>
    );

    // Safe access with optional chaining to prevent crashes
    const problemsList = contestData.problems || [];
    const totalUserMarks = problemsList.reduce((sum, p) => sum + (p.marksObtained || 0), 0);
    const totalMaxScore = problemsList.reduce((sum, p) => sum + (p.maxMarks || 0), 0);

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-indigo-500/30 overflow-x-hidden relative pb-10 transition-colors duration-500`}>
            {/* Background Grid */}
            <div className={`absolute inset-0 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none ${activeThemeStr === 'dark' ? 'opacity-[0.05]' : 'opacity-[0.1]'}`}></div>

            {/* --- HEADER --- */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${theme.header}`}>
                <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${activeThemeStr === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-white'}`}>
                            <Terminal size={20} />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-lg tracking-tight leading-none">
                                {contestData.examName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${timeLeft === 'ENDED' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.subtext}`}>
                                    {timeLeft === 'ENDED' ? 'Exam Ended' : 'Live Contest'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timer Display */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-50`}>Time Remaining</span>
                            <div className={`font-mono font-black text-2xl tracking-wider ${timeLeft === 'ENDED' ? 'text-red-500' : ''}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button 
                            onClick={() => setShowFinishModal(true)}
                            className={`text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg transition-all transform active:scale-95 ${activeThemeStr === 'dark' ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white'}`}
                        >
                            Finish Exam
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative z-10">
                <div className="space-y-6">
                    {/* Stats Bar */}
                     <div className={`flex items-end justify-between border-b pb-4 ${activeThemeStr === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div>
                            <h2 className="text-xl font-bold">Problem Set</h2>
                            <p className={`text-sm mt-1 ${theme.subtext}`}>Select a challenge to begin coding.</p>
                        </div>
                        
                        <div className="text-right">
                            <span className="block text-3xl font-black leading-none">
                                {totalUserMarks} <span className={`text-lg opacity-40`}>/ {totalMaxScore}</span>
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>Total Score</span>
                        </div>
                    </div>

                    {/* Problem List */}
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {problemsList.length > 0 ? (
                                problemsList.map((prob, idx) => {
                                    const status = prob.status || "Not Attempted"; 
                                    const isSolved = status === 'Accepted' || status === 'Solved';
                                    const isInProgress = status === 'In-Progress';
                                    
                                    return (
                                        <motion.div
                                            key={prob.problemNo} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`
                                                relative rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300 group
                                                ${theme.card}
                                                ${isSolved && activeThemeStr === 'light' ? 'bg-emerald-50/30 border-emerald-100' : ''}
                                                ${isSolved && activeThemeStr === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
                                            `}
                                        >
                                            {/* ID Badge */}
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold border transition-colors shrink-0
                                                ${isSolved
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                    : isInProgress
                                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                        : activeThemeStr === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}
                                            `}>
                                                {String(prob.problemNo).padStart(2, '0')}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 w-full">
                                                <h3 className={`text-lg font-bold mb-1 transition-colors ${isSolved ? 'opacity-60' : 'group-hover:text-indigo-500'}`}>
                                                    {prob.title}
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <DifficultyBadge level={prob.difficulty} />
                                                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${theme.subtext}`}>
                                                        <Clock size={12} />
                                                        {prob.timeAllocated || 20} Mins
                                                    </div>
                                                    {status !== 'Not Attempted' && (
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isSolved ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                                                <div className="text-right">
                                                    <span className={`block font-black text-lg ${isSolved ? 'text-emerald-500' : isInProgress ? 'text-amber-500' : ''}`}>
                                                        {prob.marksObtained} 
                                                        <span className="text-base opacity-40"> / {prob.maxMarks}</span>
                                                    </span>
                                                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Points</span>
                                                </div>
                                                
                                                {isSolved ? (
                                                    <button 
                                                        onClick={() => handleProblemClick(prob.problemId)}
                                                        className="h-10 px-6 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                                                    >
                                                        Solved <CheckCircle2 size={14} />
                                                    </button>
                                                ) : isInProgress ? (
                                                    <button 
                                                        onClick={() => handleProblemClick(prob.problemId)}
                                                        className="h-10 px-6 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95"
                                                    >
                                                        Resume <PlayCircle size={14} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleProblemClick(prob.problemId)}
                                                        className={`h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 group-hover:translate-x-1 ${theme.button}`}
                                                    >
                                                        Solve <ArrowRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className={`text-center py-10 opacity-50 ${theme.subtext}`}>No problems found.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* --- FINISH EXAM MODAL --- */}
            <AnimatePresence>
                {showFinishModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className={`rounded-3xl p-8 max-w-sm w-full shadow-2xl relative ${theme.modal}`}
                        >
                            <button 
                                onClick={() => setShowFinishModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-500/10 transition-colors opacity-50 hover:opacity-100"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-2">
                                    <AlertTriangle size={32} />
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-black">Finish Exam?</h3>
                                    <p className={`text-sm mt-2 leading-relaxed opacity-70`}>
                                        Are you sure you want to submit? You won't be able to change your answers after this.
                                    </p>
                                </div>

                                <div className="flex w-full gap-3 mt-4">
                                    <button 
                                        onClick={() => setShowFinishModal(false)}
                                        className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-colors ${activeThemeStr === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 ${theme.button}`}
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Yes, Submit"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContestDashboard;