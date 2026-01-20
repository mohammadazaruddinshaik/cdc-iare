import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    X, FileText, Clock, BarChart3, 
    CheckCircle2, XCircle, Brain, LayoutDashboard, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTS ---
import Header from '../../components/Header';
import Loader from '../../components/Loader';

// --- CONFIG ---
const backendUrl = (import.meta.env.VITE_BASE_URL || "http://localhost:5000").replace(/\/$/, '');

// --- COMPONENT: TEXT-ONLY STAT CARD ---
const StatCard = ({ label, value, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.4 }}
        className="relative overflow-hidden bg-[#0F172A]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-start group hover:border-white/10 transition-all hover:-translate-y-1"
    >
        <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}-500/10 blur-[30px] rounded-full group-hover:bg-${color}-500/20 transition-all duration-500`}></div>
        
        <span className="text-3xl font-black text-white tracking-tight leading-none mb-2">
            {value}
        </span>
        <span className={`text-[10px] font-bold text-${color}-400 uppercase tracking-widest opacity-80`}>
            {label}
        </span>
    </motion.div>
);

// --- COMPONENT: REPORT MODAL ---
const ReportModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    const scrollToQuestion = (index) => {
        const element = document.getElementById(`question-${index}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const getScoreColor = (score, total) => {
        if(total === 0) return 'text-slate-400';
        const percentage = (score / total) * 100;
        if (percentage >= 80) return 'text-emerald-400';
        if (percentage >= 50) return 'text-amber-400';
        return 'text-rose-400';
    };

    const accuracy = quiz.totalQuestions > 0 ? Math.round((quiz.score / quiz.totalQuestions) * 100) : 0;

    return (
        <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <motion.div 
                className="relative bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full max-w-7xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5 flex flex-col md:flex-row"
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            >
                {/* Left Column */}
                <div className="w-full md:w-[350px] lg:w-[400px] bg-[#0F172A]/30 border-r border-white/5 flex flex-col h-full overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
                                {quiz.sessionCode}
                            </span>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                {new Date(quiz.date).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white leading-tight mb-6">{quiz.paperTitle}</h2>
                        
                        <div className="bg-[#020617]/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full -mr-10 -mt-10"></div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Your Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-5xl font-black ${getScoreColor(quiz.score, quiz.totalQuestions)}`}>
                                    {quiz.score}
                                </span>
                                <span className="text-lg text-slate-500 font-bold">/ {quiz.totalQuestions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/5">
                        <div className="bg-[#0F172A]/30 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-xl font-black text-white">#{quiz.rank}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Rank</span>
                        </div>
                        <div className="bg-[#0F172A]/30 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-xl font-black text-white">{accuracy}%</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Accuracy</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Question Navigator</p>
                        <div className="grid grid-cols-5 gap-3">
                            {quiz.reportCard?.map((q, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => scrollToQuestion(idx)}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border transition-all hover:scale-105 active:scale-95
                                        ${q.isCorrect 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'}
                                    `}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col h-full bg-transparent relative">
                    <div className="absolute top-6 right-6 z-20">
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition backdrop-blur-md border border-white/5">
                            <X size={20}/>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                        {(!quiz.reportCard || quiz.reportCard.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40">
                                <FileText size={48} className="mb-4 stroke-1"/>
                                <p>No detailed analysis available.</p>
                            </div>
                        ) : (
                            quiz.reportCard.map((q, idx) => {
                                const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0;
                                let correctAnsId = null;
                                let correctAnsArr = [];
                                try {
                                    if (q.correctOption && typeof q.correctOption === 'string') {
                                        const parsed = JSON.parse(q.correctOption);
                                        if(parsed.type === 'checkbox') correctAnsArr = parsed.answer || [];
                                        else correctAnsId = parsed.answer;
                                    }
                                } catch (e) {}

                                return (
                                    <div id={`question-${idx}`} key={idx} className="group relative pl-6 transition-all duration-500">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${q.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                                        <div className="mb-6">
                                            <div className="flex items-center gap-3 mb-3 opacity-60">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded text-xs">
                                                    <Clock size={10} /> {q.timeTakenSeconds || q.timeTaken || 0}s
                                                </div>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-slate-200 leading-snug">
                                                {q.questionText || <span className="text-slate-500 italic">Question text unavailable</span>}
                                            </h3>
                                        </div>
                                        <div className="space-y-3 mb-6 max-w-3xl">
                                            {hasOptions ? (
                                                q.options.map((opt) => {
                                                    const isSelected = opt._id === q.selectedOption || opt._id === q.userSelectedOptionId;
                                                    const isCorrect = opt._id === correctAnsId || correctAnsArr.includes(opt._id) || opt.isCorrect;
                                                    let cardStyle = "bg-[#0F172A] border-white/5 text-slate-400 hover:border-white/10";
                                                    let icon = null;
                                                    if (isCorrect) {
                                                        cardStyle = "bg-emerald-500/5 border-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.05)]";
                                                        icon = <CheckCircle2 size={18} className="text-emerald-400 shrink-0"/>;
                                                    } else if (isSelected && !isCorrect) {
                                                        cardStyle = "bg-rose-500/5 border-rose-500/20 text-rose-200";
                                                        icon = <XCircle size={18} className="text-rose-400 shrink-0"/>;
                                                    }
                                                    return (
                                                        <div key={opt._id} className={`relative flex items-center gap-4 p-4 rounded-xl border ${cardStyle} transition-all`}>
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected || isCorrect ? 'border-transparent' : 'border-slate-600'}`}>
                                                                {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>}
                                                            </div>
                                                            <div className="flex-1 text-sm font-medium leading-relaxed">{opt.text}</div>
                                                            {icon}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-5 rounded-xl border border-dashed border-white/10 bg-[#0F172A]/50 text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center gap-3">
                                                    <LayoutDashboard size={16} /> Interactive / No Options Data
                                                </div>
                                            )}
                                        </div>
                                        {q.explanation && q.explanation !== "No explanation provided." && (
                                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 max-w-3xl">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Brain size={16} className="text-blue-400"/>
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Explanation</p>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed opacity-90">{q.explanation}</p>
                                            </div>
                                        )}
                                        {idx !== quiz.reportCard.length - 1 && (
                                            <div className="w-full h-px bg-white/5 my-10 max-w-4xl"></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        <div className="h-20"></div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN PAGE COMPONENT ---
const QuizDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/student/quiz`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const res = await response.json();
                if (res.success) {
                    setData(res);
                }
            } catch (error) {
                console.error("Failed to fetch quiz data:", error);
            } finally {
                setLoading(false);
                setAnimate(true);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader />;

    if (!data || !data.profile) return (
        <div className="min-h-screen bg-[#071225] text-white flex items-center justify-center">
            <p className="text-slate-500">No profile data found.</p>
        </div>
    );

    const { profile, recentActivity } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-32 relative overflow-hidden selection:bg-blue-500/30">
            <div className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-10 relative z-10">
                
                {/* 1. Welcome Section */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 pb-2">
                                Quiz Dashboard
                            </span>
                        </h1>
                    </div>
                    <button 
                        onClick={() => navigate('/student/quiz/join')} 
                        className="group relative px-8 py-4 rounded-[2rem] bg-white text-[#0F172A] font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 min-w-[180px]"
                    >
                        Join Quiz
                        <ArrowUpRight size={16} className="text-[#0F172A] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"/>
                    </button>
                </div>

                {/* 2. Minimal Text-Only Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Global Rank" value={`#${profile.globalRank}`} color="amber" delay={0.1}/>
                    <StatCard label="Quiz Score" value={profile.totalScore} color="blue" delay={0.2}/>
                    <StatCard label="Attempts" value={profile.totalQuizzes} color="emerald" delay={0.3}/>
                    <StatCard label="Accuracy" value={profile.accuracy === "N/A" ? "-" : profile.accuracy} color="rose" delay={0.4}/>
                </div>

                {/* 3. Recent Activity List */}
                <div className={`space-y-6 transition-all duration-700 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-3 px-2">
                       
                        <h3 className="text-xl font-black text-white tracking-tight">Recent Quizzes</h3>
                    </div>

                    <div className="grid gap-3">
                        {recentActivity.length === 0 ? (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]">
                                <p className="text-slate-500 font-bold">No quizzes attempted yet.</p>
                            </div>
                        ) : (
                            recentActivity.map((item, index) => {
                                const dateObj = new Date(item.date);
                                const month = dateObj.toLocaleString('default', { month: 'short' });
                                const day = dateObj.getDate();

                                return (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index + 0.3 }}
                                        onClick={() => setSelectedQuiz(item)}
                                        className="group relative bg-[#0F172A]/40 border border-white/5 hover:border-white/20 hover:bg-[#0F172A]/80 rounded-[1.5rem] p-4 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-2xl hover:-translate-y-1"
                                    >
                                        {/* 1. Date Box */}
                                        <div className="w-16 h-16 rounded-[1.2rem] flex flex-col items-center justify-center border shadow-inner transition-colors bg-gradient-to-br from-slate-700/20 to-slate-800/20 border-slate-700/30 text-white shrink-0">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{month}</span>
                                            <span className="text-2xl font-black">{day}</span>
                                        </div>
                                        
                                        {/* 2. Title & Code */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors truncate mb-1.5">
                                                {item.paperTitle}
                                            </h4>
                                            <span className="self-start bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono text-[10px] text-slate-400">
                                                {item.sessionCode}
                                            </span>
                                        </div>

                                        {/* 3. Clean Stats (Rank & Score) */}
                                        <div className="flex items-center gap-6 border-l border-white/10 pl-6 h-10">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Rank</p>
                                                <p className="text-base font-black text-amber-500">#{item.rank}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Score</p>
                                                <p className="text-base font-black text-white">
                                                    {item.score}<span className="text-xs text-slate-600">/{item.totalQuestions}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* 4. Action Arrow Button (Far Right) */}
                                        <div className="flex items-center justify-center pl-2">
                                            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-500 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-blue-500/25">
                                                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* --- MODAL --- */}
            <AnimatePresence>
                {selectedQuiz && (
                    <ReportModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizDashboard;