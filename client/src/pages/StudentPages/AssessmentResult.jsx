import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
    CheckCircle2, XCircle, Clock, ArrowLeft, 
    ListOrdered, Database, Code, 
    AlertCircle, Printer, Download, User, Terminal, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Use the exact theme object from your dashboard
const THEMES = {
    light: {
        id: 'light',
        bg: "bg-slate-50",
        text: "text-slate-900",
        subtext: "text-slate-500",
        border: "border-slate-200",
        card: "bg-white border-slate-200 shadow-sm",
        header: "bg-white/90 border-slate-200",
        accent: "text-blue-600",
        button: "bg-slate-900 text-white hover:bg-blue-600",
    },
    midnight: {
        id: 'midnight',
        bg: "bg-[#020617]",
        text: "text-white",
        subtext: "text-slate-400",
        border: "border-white/10",
        card: "bg-[#0F172A]/60 backdrop-blur-md border-white/5",
        header: "bg-[#020617]/80 border-white/5 backdrop-blur-xl",
        accent: "text-indigo-400",
        button: "bg-indigo-600 text-white hover:bg-indigo-500",
    },
    dark: {
        id: 'dark',
        bg: "bg-[#050505]", 
        text: "text-neutral-100",
        subtext: "text-neutral-500",
        border: "border-neutral-800",
        card: "bg-[#171717]/80 backdrop-blur-md border-neutral-800",
        header: "bg-[#050505]/80 border-neutral-800 backdrop-blur-xl",
        accent: "text-white",
        button: "bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700",
    }
};

const AssessmentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ⚡️ Theme sync with Dashboard
    const [themeId] = useState(() => {
        if (location.state?.theme && THEMES[location.state.theme]) return location.state.theme;
        return localStorage.getItem('app-theme') || 'midnight';
    });
    const theme = THEMES[themeId];

    // ⚡️ Retrieve Data from Navigation State
    const resultData = location.state?.resultData;

    // Redirect if no data found (e.g. direct access via URL)
    useEffect(() => {
        if (!resultData) {
            navigate('/student/dashboard');
        }
    }, [resultData, navigate]);

    if (!resultData) return <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}><Loader2 className="animate-spin text-indigo-500" /></div>;

    const scrollToQuestion = (idx) => {
        const el = document.getElementById(`question-${idx}`);
        if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    };

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-indigo-500/30 transition-colors duration-500`}>
            
            {/* Background Grids (Matches your Dashboard) */}
            <div className="fixed inset-0 pointer-events-none">
                {themeId === 'midnight' && (
                     <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                     </div>
                )}
                {themeId === 'dark' && (
                    <div className="absolute inset-0 bg-[#050505]">
                         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>
                )}
            </div>

            {/* --- HEADER --- */}
            <header className={`sticky top-0 z-50 border-b ${theme.header}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => navigate('/student/dashboard')} className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${theme.subtext} hover:text-white transition-colors`}>
                        <ArrowLeft size={18} /> Home
                    </button>
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className={theme.accent} />
                        <h1 className="font-black text-sm tracking-tight">{resultData.examSummary?.examName || "Assessment Result"}</h1>
                    </div>
                    <button className={`p-2.5 rounded-xl border ${theme.border} hover:bg-white/5`}>
                        <Printer size={18} />
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    
                    {/* --- SIDEBAR --- */}
                    <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-28 space-y-6">
                        {/* Profile & Scoring Card */}
                        <div className={`rounded-3xl border ${theme.card} p-8 text-center`}>
                            <div className="flex items-center gap-4 text-left mb-8 pb-6 border-b border-white/5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black leading-tight">{resultData.studentInfo?.name || "Student"}</h2>
                                    <p className={`text-[10px] font-mono font-bold ${theme.subtext}`}>{resultData.studentInfo?.rollno || "ID: N/A"}</p>
                                </div>
                            </div>

                            {/* Scoring Display */}
                            <div className="flex flex-col items-center justify-center py-4">
                                <span className="text-5xl font-black tracking-tighter">{resultData.examSummary?.totalMarksObtained || 0}</span>
                                <div className={`h-1 w-12 rounded-full my-2 ${themeId === 'light' ? 'bg-slate-200' : 'bg-white/10'}`} />
                                <span className={`text-xl font-bold ${theme.subtext}`}>{resultData.examSummary?.maxPossibleMarks || 0}</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 opacity-40">Total Score</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <div className={`p-3 rounded-2xl bg-white/5 border ${theme.border}`}>
                                    <div className="text-lg font-black">{resultData.examSummary?.accuracy || "0%"}</div>
                                    <div className="text-[8px] font-bold uppercase opacity-40">Accuracy</div>
                                </div>
                                <div className={`p-3 rounded-2xl bg-white/5 border ${theme.border}`}>
                                    <div className="text-lg font-black text-indigo-400">#{resultData.examSummary?.rank || "-"}</div>
                                    <div className="text-[8px] font-bold uppercase opacity-40">Rank</div>
                                </div>
                            </div>
                        </div>

                        {/* Problem Map */}
                        <div className={`rounded-3xl border ${theme.card} p-6`}>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 flex items-center gap-2">
                                <ListOrdered size={14} /> Problem Map
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {resultData.submissions && resultData.submissions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => scrollToQuestion(i)}
                                        className={`aspect-square rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                                            s.status === 'Accepted' || s.status === 'Solved'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* --- REPORT FEED --- */}
                    <div className="flex-1 space-y-8">
                        <div className={`flex items-end justify-between border-b pb-6 ${theme.border}`}>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Analysis Report</h2>
                                <p className={`text-sm ${theme.subtext}`}>Review your code logic and complexity.</p>
                            </div>
                            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${theme.border} text-[10px] font-bold uppercase tracking-wider hover:bg-white/5`}>
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <AnimatePresence>
                            {resultData.submissions && resultData.submissions.map((sub, idx) => (
                                <motion.div 
                                    key={idx} 
                                    id={`question-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-3xl border ${theme.card} overflow-hidden`}
                                >
                                    {/* Sub Header */}
                                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${theme.border}`}>
                                                {sub.problemNo}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{sub.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${sub.status === 'Accepted' || sub.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {sub.status}
                                                    </span>
                                                    <div className={`flex items-center gap-2 text-[10px] font-mono ${theme.subtext}`}>
                                                        <Clock size={12} /> {sub.timeTaken || 0}ms
                                                        <Database size={12} /> {sub.memoryUsed || 0}KB
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black">{sub.marksGet || sub.marksObtained || 0} <span className="text-sm opacity-30">/ {sub.maxMarks}</span></div>
                                            <div className="text-[9px] font-bold uppercase opacity-30 tracking-widest">Points Secured</div>
                                        </div>
                                    </div>

                                    {/* Code Window */}
                                    <div className={`border-t ${theme.border}`}>
                                        <div className={`px-4 py-2 flex justify-between items-center ${themeId === 'light' ? 'bg-slate-100' : 'bg-white/5'}`}>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                                            </div>
                                            <div className="flex items-center gap-2 opacity-40">
                                                <Code size={12} />
                                                <span className="text-[10px] font-mono">solution.cpp</span>
                                            </div>
                                        </div>
                                        <div className="h-[300px]">
                                            <Editor
                                                height="100%"
                                                theme={themeId === 'light' ? 'light' : 'vs-dark'}
                                                defaultLanguage="cpp"
                                                value={sub.lastCode || "// No code submitted"}
                                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssessmentResult;