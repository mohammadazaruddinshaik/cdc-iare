import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, XCircle, Clock, 
    Home, Share2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

/* --- THEME HELPER --- */
const getTheme = (isDarkMode) => ({
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textSecondary: isDarkMode ? "text-slate-400" : "text-slate-500",
    border: isDarkMode ? "border-slate-800" : "border-slate-200",
    card: isDarkMode ? "bg-[#1E293B]/60 backdrop-blur-md border-slate-700/50" : "bg-white border-slate-200",
});

const StudentResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const resultData = location.state;

    const [isDarkMode] = useState(true); 
    const t = getTheme(isDarkMode);

    /* --- SECURITY & REDIRECTS --- */
    useEffect(() => {
        if (!resultData) {
            navigate('/student/dashboard', { replace: true });
        }
        
        // Prevent Back Button
        window.history.pushState(null, document.title, window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, document.title, window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [resultData, navigate]);

    if (!resultData) return null;

    const { name, score, totalQuestions, correct, wrong, accuracy, rank, responses } = resultData;
    const isPass = parseFloat(accuracy) >= 40;

    return (
        <div className={`min-h-screen bg-[#050B14] ${t.text} font-sans selection:bg-blue-500/30`}>
            {isPass && <Confetti numberOfPieces={100} recycle={false} gravity={0.15} />}

            <main className="max-w-5xl mx-auto px-6 py-12">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Assessment Result</h1>
                        <p className={`${t.textSecondary} text-xs font-medium mt-1 uppercase tracking-widest`}>Candidate: {name}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/student/dashboard', { replace: true })}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E293B] border border-slate-700 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <Home size={16} /> Dashboard
                    </button>
                </header>

                {/* --- SCORE SUMMARY CARD --- */}
                <section className={`p-8 md:p-12 rounded-3xl border mb-8 flex flex-col md:flex-row items-center justify-between gap-12 ${t.card}`}>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Total Achievement</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-8xl font-black tracking-tighter">{score}</span>
                            <span className="text-2xl font-bold opacity-30">/ {totalQuestions}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 w-full md:w-auto">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Accuracy</span>
                            <span className="text-xl font-bold text-blue-400">{accuracy}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Global Rank</span>
                            <span className="text-xl font-bold text-white">#{rank}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Correct</span>
                            <span className="text-xl font-bold text-emerald-500">{correct}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Wrong</span>
                            <span className="text-xl font-bold text-rose-500">{wrong}</span>
                        </div>
                    </div>
                </section>

                {/* --- DETAILED ANALYSIS TABLE --- */}
                <section className={`rounded-3xl border overflow-hidden ${t.card}`}>
                    <div className="px-8 py-5 border-b border-inherit bg-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest">Question Breakdown</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-inherit bg-black/20">
                                    <th className="px-8 py-4">Reference</th>
                                    <th className="px-8 py-4 text-center">Outcome</th>
                                    <th className="px-8 py-4 text-center">Time Taken</th>
                                    <th className="px-8 py-4 text-right">Marks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {responses.map((res, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-blue-500/50 uppercase tracking-tighter">Q-{(idx + 1).toString().padStart(2, '0')}</span>
                                                <span className="text-sm font-bold text-white uppercase tracking-tight">Question {idx + 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {res.isCorrect === true ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                                                    <CheckCircle2 size={12} /> Correct
                                                </span>
                                            ) : res.isCorrect === false ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase">
                                                    <XCircle size={12} /> Incorrect
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Skipped</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="text-xs font-mono font-bold text-slate-400">
                                                {res.timeTakenSeconds}s
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`text-sm font-black font-mono ${res.marks > 0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                                                {res.marks > 0 ? `+${res.marks}` : res.marks}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- FOOTER ACTIONS --- */}
                <footer className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                        Share Result <Share2 size={16} />
                    </button>
                </footer>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                body { background-color: #050B14; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StudentResultPage;