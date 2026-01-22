import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
    Clock, ArrowLeft, ListOrdered, Database, Code, 
    Printer, User, Terminal, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    }
};

const AssessmentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [themeId] = useState(() => {
        if (location.state?.theme && THEMES[location.state.theme]) return location.state.theme;
        return localStorage.getItem('app-theme') || 'midnight';
    });
    const theme = THEMES[themeId];

    const API_RESPONSE = {
        studentInfo: { name: "KOMMURI POOJITHA", rollno: "23951A66C3" },
        examSummary: {
            examName: "Advanced Algorithms Challenge",
            totalMarksObtained: 25,
            maxPossibleMarks: 30,
            accuracy: "83%",
            rank: 1
        },
        submissions: [
            { 
                problemNo: 1, 
                title: "Knapsack DP", 
                status: "Accepted", 
                marksGet: 15, 
                maxMarks: 15, 
                timeTaken: "120", 
                memoryUsed: "2048", 
                lastCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Dynamic Programming Tabulation\n    return 0;\n}` 
            },
            { 
                problemNo: 2, 
                title: "Binary Tree Path", 
                status: "Accepted", 
                marksGet: 10, 
                maxMarks: 10, 
                timeTaken: "45", 
                memoryUsed: "512", 
                lastCode: `/** Binary tree logic **/` 
            },
            { 
                problemNo: 3, 
                title: "Graph Coloring", 
                status: "Wrong Answer", 
                marksGet: 0, 
                maxMarks: 5, 
                timeTaken: "15", 
                memoryUsed: "128", 
                lastCode: `// Missing constraints logic...` 
            }
        ]
    };

    const avatarUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${API_RESPONSE.studentInfo.rollno}/${API_RESPONSE.studentInfo.rollno}.jpg`;

    const scrollToQuestion = (idx) => {
        const el = document.getElementById(`question-${idx}`);
        if (el) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`min-h-screen w-full ${theme.bg} ${theme.text} font-sans transition-colors duration-500`}>
            
            {/* Background Grids */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {themeId === 'midnight' && (
                     <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)] opacity-50" />
                     </div>
                )}
            </div>

            {/* --- HEADER --- */}
            <header className={`sticky top-0 z-[60] border-b ${theme.header} w-full`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${theme.subtext} hover:text-white transition-colors`}>
                        <ArrowLeft size={18} /> Exit Analysis
                    </button>
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className={theme.accent} />
                        <h1 className="font-black text-sm tracking-tight truncate">
                            {API_RESPONSE.examSummary.examName}
                        </h1>
                    </div>
                    <button className={`p-2.5 rounded-xl border ${theme.border} hover:bg-white/5 transition-colors`}>
                        <Printer size={18} />
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    
                    {/* --- SIDEBAR --- */}
                    <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-28 space-y-6 z-20">
                        <div className={`rounded-3xl border ${theme.card} p-8 text-center`}>
                            <div className="flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 transition duration-1000"></div>
                                    <img 
                                        src={avatarUrl}
                                        alt="Student Avatar"
                                        className="relative w-24 h-24 rounded-2xl object-cover border-2 border-white/10 shadow-2xl"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${API_RESPONSE.studentInfo.name}&background=6366f1&color=fff`; }}
                                    />
                                </div>
                                <h2 className="text-base font-black mb-1 leading-tight">{API_RESPONSE.studentInfo.name}</h2>
                                <p className={`text-[10px] font-mono font-bold ${theme.subtext} mb-8 uppercase tracking-wider`}>{API_RESPONSE.studentInfo.rollno}</p>

                                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 w-full">
                                    <span className="text-5xl font-black text-indigo-400 tracking-tighter">
                                        {API_RESPONSE.examSummary.totalMarksObtained}
                                    </span>
                                    <div className="h-[2px] w-8 bg-current opacity-20 my-2"></div>
                                    <span className={`text-xl font-bold opacity-40`}>
                                        {API_RESPONSE.examSummary.maxPossibleMarks}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className={`p-3 rounded-2xl bg-white/5 border ${theme.border}`}>
                                    <div className="text-lg font-black">{API_RESPONSE.examSummary.accuracy}</div>
                                    <div className="text-[8px] font-bold uppercase opacity-40 tracking-tighter">Accuracy</div>
                                </div>
                                <div className={`p-3 rounded-2xl bg-white/5 border ${theme.border}`}>
                                    <div className="text-lg font-black text-emerald-400">#{API_RESPONSE.examSummary.rank}</div>
                                    <div className="text-[8px] font-bold uppercase opacity-40 tracking-tighter">Class Rank</div>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-3xl border ${theme.card} p-6`}>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 flex items-center gap-2">
                                <ListOrdered size={14} /> Problem Map
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {API_RESPONSE.submissions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => scrollToQuestion(i)}
                                        className={`aspect-square rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                                            s.status === 'Accepted' 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' 
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* --- FEED --- */}
                    <div className="flex-1 space-y-8 min-w-0">
                        <div className={`flex flex-col border-b pb-6 ${theme.border}`}>
                            <h2 className="text-2xl font-black tracking-tight">Technical Analysis</h2>
                            <p className={`text-sm mt-1 ${theme.subtext}`}>Detailed review of your submitted logic and complexity markers.</p>
                        </div>

                        <AnimatePresence>
                            {API_RESPONSE.submissions.map((sub, idx) => (
                                <motion.div 
                                    key={idx} 
                                    id={`question-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-3xl border ${theme.card} overflow-hidden`}
                                >
                                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01]">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border ${theme.border} text-lg ${sub.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {String(sub.problemNo).padStart(2, '0')}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{sub.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${sub.status === 'Accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                                        {sub.status}
                                                    </span>
                                                    <div className={`flex items-center gap-2 text-[10px] font-mono ${theme.subtext}`}>
                                                        <Clock size={12} /> {sub.timeTaken}ms
                                                        <span className="opacity-20">•</span>
                                                        <Database size={12} /> {sub.memoryUsed}KB
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black">{sub.marksGet} <span className="text-sm opacity-30">/ {sub.maxMarks}</span></div>
                                            <div className="text-[9px] font-bold uppercase opacity-30 tracking-widest">Points Secured</div>
                                        </div>
                                    </div>

                                    {/* Code Editor */}
                                    <div className={`border-t ${theme.border}`}>
                                        <div className={`px-4 py-3 flex justify-between items-center ${themeId === 'light' ? 'bg-slate-100' : 'bg-[#020617]/50'}`}>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                                            </div>
                                            <div className="flex items-center gap-2 opacity-40">
                                                <Code size={12} />
                                                <span className="text-[10px] font-mono tracking-wider">solution.cpp</span>
                                            </div>
                                        </div>
                                        <div className="h-[350px]">
                                            <Editor
                                                height="100%"
                                                theme={themeId === 'light' ? 'light' : 'vs-dark'}
                                                defaultLanguage="cpp"
                                                value={sub.lastCode}
                                                options={{ 
                                                    readOnly: true, 
                                                    minimap: { enabled: false }, 
                                                    fontSize: 14, 
                                                    scrollBeyondLastLine: false,
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    padding: { top: 20 }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="text-center py-20 opacity-20">
                            <CheckCircle2 className="mx-auto mb-2" size={32} />
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Review Complete</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssessmentResult;