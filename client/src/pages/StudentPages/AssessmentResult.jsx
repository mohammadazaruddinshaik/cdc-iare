import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
    CheckCircle2, XCircle, Clock, ArrowLeft, 
    ListOrdered, Database, Code, 
    User, Terminal, Loader2, Copy, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ⚡️ Enhanced Theme Object
const THEMES = {
    light: {
        id: 'light',
        bg: "bg-slate-50",
        text: "text-slate-900",
        subtext: "text-slate-500",
        border: "border-slate-200",
        card: "bg-white border-slate-200 shadow-sm",
        header: "bg-white/80 border-slate-200 backdrop-blur-md",
        accent: "text-blue-600",
        navHover: "hover:text-slate-900", // Fixed: Hover color for light mode
        codeHeader: "bg-slate-100 border-b border-slate-200",
        successBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
        errorBadge: "bg-rose-50 text-rose-600 border-rose-200",
        scoreGradient: "from-slate-900 to-slate-600"
    },
    midnight: {
        id: 'midnight',
        bg: "bg-[#020617]",
        text: "text-white",
        subtext: "text-slate-400",
        border: "border-white/10",
        card: "bg-[#0F172A]/40 backdrop-blur-xl border-white/5 shadow-2xl",
        header: "bg-[#020617]/80 border-white/5 backdrop-blur-xl",
        accent: "text-indigo-400",
        navHover: "hover:text-white",
        codeHeader: "bg-white/5 border-b border-white/5",
        successBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        errorBadge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        scoreGradient: "from-indigo-400 to-cyan-300"
    },
    dark: {
        id: 'dark',
        bg: "bg-[#050505]", 
        text: "text-neutral-100",
        subtext: "text-neutral-500",
        border: "border-neutral-800",
        card: "bg-[#121212]/90 backdrop-blur-md border-neutral-800",
        header: "bg-[#050505]/80 border-neutral-800 backdrop-blur-xl",
        accent: "text-white",
        navHover: "hover:text-white",
        codeHeader: "bg-[#1A1A1A] border-b border-neutral-800",
        successBadge: "bg-emerald-900/20 text-emerald-500 border-emerald-800",
        errorBadge: "bg-rose-900/20 text-rose-500 border-rose-800",
        scoreGradient: "from-white to-neutral-500"
    }
};

const AssessmentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ⚡️ Theme sync
    const [themeId] = useState(() => {
        if (location.state?.theme && THEMES[location.state.theme]) return location.state.theme;
        return localStorage.getItem('app-theme') || 'midnight';
    });
    const theme = THEMES[themeId];

    // ⚡️ Retrieve Data
    const resultData = location.state?.resultData;

    useEffect(() => {
        if (!resultData) {
            navigate('/student/dashboard');
        }
    }, [resultData, navigate]);

    if (!resultData) return <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}><Loader2 className="animate-spin text-indigo-500" /></div>;

    const scrollToQuestion = (idx) => {
        const el = document.getElementById(`question-${idx}`);
        if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
    };

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-indigo-500/30 transition-colors duration-500`}>
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {themeId === 'midnight' && (
                     <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%)]" />
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                     </div>
                )}
            </div>

            {/* --- HEADER --- */}
            <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${theme.header}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/student/dashboard')} 
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${theme.subtext} ${theme.navHover} transition-colors`}
                    >
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border bg-opacity-50 border-opacity-50" style={{ borderColor: 'inherit' }}>
                        <Terminal size={14} className={theme.accent} />
                        <span className="opacity-20 text-xs">|</span>
                        <h1 className="font-bold text-xs tracking-wide uppercase">{resultData.examSummary?.examName || "Result"}</h1>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* --- SIDEBAR (Sticky) --- */}
                    <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24 space-y-6">
                        
                        {/* Profile & Scoring Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`rounded-3xl border ${theme.card} p-8 text-center relative overflow-hidden group`}
                        >
                            {/* Subtle Glow Effect */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none`} />

                            <div className="flex items-center gap-4 text-left mb-8 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border shadow-lg ${themeId === 'light' ? 'bg-white border-slate-100 text-slate-700' : 'bg-white/5 border-white/10 text-white'}`}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black leading-tight">{resultData.studentInfo?.name || "Student"}</h2>
                                    <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${theme.subtext}`}>{resultData.studentInfo?.rollno || "ID: N/A"}</p>
                                </div>
                            </div>

                            {/* Scoring Display */}
                            <div className="flex flex-col items-center justify-center py-2 relative z-10">
                                <span className={`text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${theme.scoreGradient}`}>
                                    {resultData.examSummary?.totalMarksObtained || 0}
                                </span>
                                <div className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1 mb-6">
                                    of {resultData.examSummary?.maxPossibleMarks || 0} Points
                                </div>
                            </div>

                    
                        </motion.div>

                        {/* Problem Map */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`rounded-3xl border ${theme.card} p-6`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <ListOrdered size={14} /> Problem Map
                                </h3>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {resultData.submissions && resultData.submissions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => scrollToQuestion(i)}
                                        title={s.title}
                                        className={`aspect-square rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                                            s.status === 'Accepted' || s.status === 'Solved'
                                            ? `${theme.successBadge} border-opacity-30 bg-opacity-20` 
                                            : `${theme.errorBadge} border-opacity-30 bg-opacity-20`
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </aside>

                    {/* --- REPORT FEED --- */}
                    <div className="flex-1 space-y-8 min-w-0">
                        <div className={`flex items-end justify-between border-b pb-6 ${theme.border}`}>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    Analysis <Zap size={24} className="text-yellow-500 fill-yellow-500" />
                                </h2>
                                <p className={`text-sm mt-2 ${theme.subtext}`}>Detailed breakdown of your code logic and performance.</p>
                            </div>
                        </div>

                        <AnimatePresence>
                            {resultData.submissions && resultData.submissions.map((sub, idx) => (
                                <motion.div 
                                    key={idx} 
                                    id={`question-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${theme.card}`}
                                >
                                    {/* Sub Header */}
                                    <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex gap-5">
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg border ${theme.border} ${themeId === 'light' ? 'bg-slate-50' : 'bg-white/5'}`}>
                                                {sub.problemNo}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg leading-tight mb-2">{sub.title}</h4>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${sub.status === 'Accepted' || sub.status === 'Solved' ? theme.successBadge : theme.errorBadge}`}>
                                                        {sub.status === 'Accepted' ? <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Accepted</span> : <span className="flex items-center gap-1"><XCircle size={12} /> {sub.status}</span>}
                                                    </span>
                                                    <div className={`flex items-center gap-3 text-[11px] font-mono font-medium ${theme.subtext}`}>
                                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {sub.timeTaken || 0}ms</span>
                                                        <span className="flex items-center gap-1.5"><Database size={12} /> {sub.memoryUsed || 0}KB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 bg-opacity-5 rounded-xl px-4 py-2 border border-transparent">
                                            <div className="text-2xl font-black tabular-nums">{sub.marksGet || sub.marksObtained || 0} <span className="text-sm opacity-40 font-bold">/ {sub.maxMarks}</span></div>
                                        </div>
                                    </div>

                                    {/* Code Window */}
                                    <div className="relative group">
                                        <div className={`px-4 py-3 flex justify-between items-center ${theme.codeHeader}`}>
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                            </div>
                                            <div className="flex items-center gap-2 opacity-50">
                                                <Code size={12} />
                                                <span className="text-[10px] font-mono font-medium">source_code.{resultData.examSummary?.language || 'cpp'}</span>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className={`p-1.5 rounded-md hover:bg-black/10 transition-colors ${theme.subtext}`}>
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-[300px] relative">
                                            <Editor
                                                height="100%"
                                                theme={themeId === 'light' ? 'light' : 'vs-dark'}
                                                defaultLanguage="cpp"
                                                value={sub.lastCode || "// No code submitted for this problem."}
                                                options={{ 
                                                    readOnly: true, 
                                                    minimap: { enabled: false }, 
                                                    fontSize: 13, 
                                                    fontFamily: 'JetBrains Mono, monospace',
                                                    scrollBeyondLastLine: false,
                                                    padding: { top: 16, bottom: 16 },
                                                    renderLineHighlight: 'none'
                                                }}
                                            />
                                            {/* Corner Gradient Overlay */}
                                            <div className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t ${themeId === 'light' ? 'from-white' : 'from-[#1e1e1e]'} to-transparent opacity-50`} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {(!resultData.submissions || resultData.submissions.length === 0) && (
                            <div className={`text-center py-20 rounded-3xl border border-dashed ${theme.border}`}>
                                <Ghost size={40} className={`mx-auto mb-4 ${theme.subtext}`} />
                                <p className={theme.subtext}>No submissions found for this assessment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssessmentResult;