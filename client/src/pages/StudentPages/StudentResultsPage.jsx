import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, XCircle, Clock, ArrowLeft, 
    ListOrdered, FileText, Brain, LayoutDashboard, 
    Printer, User, Hash, AlertCircle, BarChart3,
    Trophy
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

// --- CONFIGURATION ---
const ANIMATION = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

// --- HELPER 1: AVATAR COMPONENT ---
const StudentAvatar = ({ rollno }) => {
    const [imgError, setImgError] = useState(false);
    const imageUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollno}/${rollno}.jpg`;

    if (imgError || !rollno) {
        return (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <User size={28} />
            </div>
        );
    }

    return (
        <img 
            src={imageUrl} 
            alt={rollno}
            onError={() => setImgError(true)}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-lg shadow-black/40 shrink-0 bg-[#0F172A]"
        />
    );
};

// --- HELPER 2: HEADER ---
const ResultHeader = ({ title, onBack, isDark }) => (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b ${isDark ? 'bg-[#020617]/90 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button 
                onClick={onBack} 
                className={`flex items-center gap-3 transition-colors group ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
                <div className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/5 group-hover:bg-white/10' : 'bg-slate-100 border-slate-200 group-hover:bg-slate-200'}`}>
                    <ArrowLeft size={18} />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-2">
                <FileText className="text-blue-500 hidden sm:block" size={18} />
                <h1 className={`text-sm md:text-base font-black uppercase tracking-widest truncate max-w-[200px] sm:max-w-md ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {title}
                </h1>
            </div>

            <button 
                onClick={() => window.print()} 
                className={`p-2.5 rounded-lg border border-transparent transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                title="Print Report"
            >
                <Printer size={20} />
            </button>
        </div>
    </header>
);

// --- HELPER 3: COMPACT CHART WITH "TRADITIONAL" SCORE ---
const PerformanceChart = ({ correct, wrong, skipped, totalScore, totalQuestions, isDark }) => {
    const data = [
        { name: 'Correct', value: correct, color: '#10B981' },
        { name: 'Wrong', value: wrong, color: '#F43F5E' },
        { name: 'Skipped', value: skipped, color: '#F59E0B' },
    ].filter(d => d.value > 0);

    const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: isDark ? '#1E293B' : '#E2E8F0' }];

    // Determine grade color
    const percentage = (totalScore / totalQuestions) * 100;
    const gradeColor = percentage >= 40 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600');

    return (
        <div className="flex flex-row items-center justify-between gap-4 w-full relative z-20">
            {/* Reduced Size Chart */}
            <div className="relative w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            // FIX APPLIED HERE: Reduced radii slightly to prevent clipping on Windows (DPI scaling)
                            innerRadius={50} 
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={5}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            allowEscapeViewBox={{ x: true, y: true }}
                            contentStyle={{ 
                                backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                                borderColor: isDark ? '#334155' : '#E2E8F0', 
                                borderRadius: '8px', 
                                color: isDark ? '#fff' : '#0F172A',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                zIndex: 100
                            }}
                            itemStyle={{ color: isDark ? '#fff' : '#0F172A' }}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Traditional "Paper Grade" Style Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <div className="relative flex items-center justify-center transform -rotate-12">
                        <span className={`text-4xl font-black italic tracking-tighter ${gradeColor} drop-shadow-lg`}>
                            {totalScore}
                        </span>
                        <span className={`text-2xl font-black italic text-slate-500 mx-1`}>/</span>
                        <span className={`text-xl font-bold italic text-slate-500 mt-2`}>
                            {totalQuestions}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col gap-3 pr-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct</span>
                    <span className={`text-xs font-bold ml-auto ${isDark ? 'text-white' : 'text-slate-800'}`}>{correct}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wrong</span>
                    <span className={`text-xs font-bold ml-auto ${isDark ? 'text-white' : 'text-slate-800'}`}>{wrong}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skip</span>
                    <span className={`text-xs font-bold ml-auto ${isDark ? 'text-white' : 'text-slate-800'}`}>{skipped}</span>
                </div>
            </div>
        </div>
    );
};

// --- HELPER 4: QUESTION CARD ---
const QuestionCard = ({ question, index, isDark }) => {
    const hasOptions = question.options && question.options.length > 0;
    
    let correctAnsIds = [];
    try {
        if (question.correctOption) {
            const parsed = typeof question.correctOption === 'string' ? JSON.parse(question.correctOption) : question.correctOption;
            if (parsed.type === 'checkbox') correctAnsIds = parsed.answer || [];
            else correctAnsIds = [parsed.answer];
        }
    } catch (e) {}

    const cardBg = isDark ? "bg-[#0F172A]/40 border-white/5 hover:border-white/10" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm";
    const textMain = isDark ? "text-slate-200" : "text-slate-800";
    const textSub = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <motion.div 
            id={`question-${index}`} 
            initial={ANIMATION.initial}
            whileInView={ANIMATION.animate}
            viewport={{ once: true, margin: "-50px" }}
            className={`group relative border rounded-3xl p-6 md:p-8 scroll-mt-28 transition-all ${cardBg}`}
        >
            <div className={`absolute left-0 top-8 bottom-8 w-1 rounded-r-full ${question.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'} opacity-40 group-hover:opacity-100 transition-all`}></div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pl-2">
                <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                       {index + 1}
                    </span>
                    {question.type && (
                        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                            {question.type}
                        </span>
                    )}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <Clock size={14} className="text-slate-500" />
                    <span className={`text-xs font-mono font-bold ${textSub}`}>
                        {question.timeTakenSeconds || question.timeTaken || 0}s
                    </span>
                </div>
            </div>

            <h3 className={`text-lg md:text-xl font-bold leading-relaxed mb-8 pl-2 ${textMain}`}>
                {question.questionText}
            </h3>

            <div className="space-y-3 mb-8 pl-1 max-w-4xl">
                {hasOptions ? (
                    question.options.map((opt) => {
                        const isSelected = opt._id === question.selectedOption || opt._id === question.userSelectedOptionId;
                        const isCorrect = correctAnsIds.includes(opt._id) || opt.isCorrect;
                        
                        let styles = isDark ? "bg-[#020617]/50 border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600";
                        let Icon = null;

                        if (isCorrect) {
                            styles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 ring-1 ring-emerald-500/20";
                            Icon = CheckCircle2;
                        } else if (isSelected) {
                            styles = "bg-rose-500/10 border-rose-500/30 text-rose-600 ring-1 ring-rose-500/20";
                            Icon = XCircle;
                        }

                        return (
                            <div key={opt._id} className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${styles}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected || isCorrect ? 'border-transparent' : 'border-slate-400'}`}>
                                    {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                                </div>
                                <span className="flex-1 text-sm font-medium">{opt.text}</span>
                                {Icon && <Icon size={18} className={isCorrect ? "text-emerald-500" : "text-rose-500"} />}
                            </div>
                        );
                    })
                ) : (
                    <div className={`p-6 rounded-xl border border-dashed flex items-center justify-center gap-3 ${isDark ? 'border-white/10 bg-white/[0.02] text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
                        <LayoutDashboard size={18} />
                        <span className="text-sm font-medium">Interactive Question (No options displayed)</span>
                    </div>
                )}
            </div>

            {question.explanation && question.explanation !== "No explanation provided." && (
                <div className={`relative overflow-hidden rounded-2xl p-6 border ${isDark ? 'bg-blue-950/20 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex items-center gap-2 mb-3 text-blue-500">
                        <span className="text-xs font-black uppercase tracking-widest">Explanation</span>
                    </div>
                    <p className={`text-sm leading-7 font-medium opacity-90 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {question.explanation}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
const StudentResultsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        if (!location.state) navigate('/student/dashboard', { replace: true });
    }, [location, navigate]);

    if (!location.state) return null;

    const {
        studentName = "Candidate",
        rollno = "N/A",
        quizTitle = "Assessment Report",
        totalScore = 0,
        totalQuestions = 0,
        correctAnswers = 0,
        wrongAnswers = 0,
        accuracy = "0%",
        rank = "-",
        reportCard = []
    } = location.state;

    // --- THEME LOGIC ---
    const isDark = location.state.theme !== 'light';

    const numericAccuracy = parseFloat(accuracy.toString().replace('%', ''));
    const isPass = numericAccuracy >= 40;
    const skippedCount = totalQuestions - (correctAnswers + wrongAnswers);

    const scrollToQuestion = (idx) => {
        const el = document.getElementById(`question-${idx}`);
        if (el) {
            const yOffset = -120;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            el.classList.add('ring-2', 'ring-blue-500');
            setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 1500);
        }
    };

    const pageBg = isDark ? "bg-[#020617] text-slate-200" : "bg-slate-50 text-slate-800";
    const sidebarCardBg = isDark ? "bg-[#0F172A]/60 border-white/5 shadow-xl" : "bg-white border-slate-200 shadow-md";
    const textMain = isDark ? "text-white" : "text-slate-900";
    const textSub = isDark ? "text-slate-500" : "text-slate-400";

    return (
        <div className={`min-h-screen font-sans selection:bg-blue-500/30 ${pageBg}`}>
            {isPass && <Confetti numberOfPieces={200} recycle={false} gravity={0.15} colors={['#10B981', '#3B82F6']} />}
            
            <ResultHeader title={quizTitle} onBack={() => navigate('/student/dashboard')} isDark={isDark} />

            <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* --- LEFT SIDEBAR (STICKY + SCROLLABLE) --- */}
                    <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24">
                        {/* This container handles the scrolling. 
                            If content (Navigator + Chart + Profile) > Viewport, THIS scrolls.
                            The Main page scroll is for the Detailed Analysis on the right.
                        */}
                        <div className="flex flex-col gap-6 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2 pb-2">
                            
                            {/* 1. Candidate Card */}
                            <div className={`${sidebarCardBg} border rounded-3xl p-6 backdrop-blur-sm shrink-0`}>
                                <div className="flex items-center gap-5">
                                    <StudentAvatar rollno={rollno} />
                                    <div className="overflow-hidden min-w-0">
                                        <h2 className={`text-xl font-bold truncate ${textMain}`}>{studentName}</h2>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                                <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{rollno}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPass ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                                {isPass ? 'PASSED' : 'IMPROVE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Stats & Chart */}
                            <div className={`${sidebarCardBg} border rounded-3xl p-5 backdrop-blur-sm shrink-0 overflow-visible`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
                                        <BarChart3 size={14} /> Analytics
                                    </h3>
                                </div>

                                <PerformanceChart 
                                    correct={correctAnswers}
                                    wrong={wrongAnswers}
                                    skipped={skippedCount}
                                    totalScore={totalScore}
                                    totalQuestions={totalQuestions}
                                    isDark={isDark}
                                />

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`text-xl font-black ${textMain}`}>{accuracy}</div>
                                        <div className={`text-[9px] font-bold uppercase tracking-widest ${textSub}`}>Accuracy</div>
                                    </div>
                                    <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`text-xl font-black flex items-center justify-center gap-0.5 ${textMain}`}>
                                            <span className="text-xs text-amber-500">#</span>{rank}
                                        </div>
                                        <div className={`text-[9px] font-bold uppercase tracking-widest ${textSub}`}>Rank</div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Navigator Grid */}
                            <div className={`${sidebarCardBg} border rounded-3xl p-6 backdrop-blur-sm shrink-0`}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${textSub}`}>
                                        <ListOrdered size={14} /> Question Navigator
                                    </h3>
                                    <span className={`text-[10px] font-bold ${textSub}`}>{reportCard.length} Items</span>
                                </div>
                                <div className="grid grid-cols-6 lg:grid-cols-6 gap-2">
                                    {reportCard.map((q, idx) => {
                                        let btnClass = isDark ? "bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300" : "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600";
                                        
                                        if (q.isCorrect) btnClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20";
                                        else if (!q.userSelectedOptionId) btnClass = "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20";
                                        else btnClass = "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20";

                                        return (
                                            <button 
                                                key={idx}
                                                onClick={() => scrollToQuestion(idx)}
                                                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-all active:scale-95 ${btnClass}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* --- RIGHT CONTENT --- */}
                    <main className="flex-1 min-w-0 pb-20">
                        <div className="mb-6 flex items-center gap-3">
                            <h2 className={`text-2xl font-black tracking-tight ${textMain}`}>Detailed Analysis</h2>
                            <div className={`h-px flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>
                        </div>
                        
                        <div className="space-y-6">
                            {reportCard.length > 0 ? (
                                reportCard.map((question, idx) => (
                                    <QuestionCard key={idx} question={question} index={idx} isDark={isDark} />
                                ))
                            ) : (
                                <div className={`flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl ${isDark ? 'border-white/5 bg-white/[0.01] text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
                                    <AlertCircle size={48} className="mb-4 opacity-50" />
                                    <p className="font-bold">No detailed analysis data available.</p>
                                </div>
                            )}
                        </div>
                    </main>

                </div>
            </div>

            {/* Print & Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.2)'}; }
                @media print {
                    header, aside { display: none !important; }
                    main { width: 100% !important; display: block !important; }
                    body { background: white !important; color: black !important; }
                    .border { border-color: #ddd !important; }
                }
            `}} />
        </div>
    );
};

export default StudentResultsPage;