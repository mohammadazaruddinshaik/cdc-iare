import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
    Clock, ShieldAlert, CheckCircle2, 
    Terminal, Cpu, FileCode2, 
    AlertOctagon, ChevronRight, MonitorX, 
    Eye, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// ==========================================
// 1. HELPER FUNCTIONS & SUB-COMPONENTS
// ==========================================

const getDurationString = (startStr, endStr) => {
    if (!startStr || !endStr) return "N/A";
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} Mins`;
};

const GridBackground = () => (
    <div className="fixed inset-0 pointer-events-none bg-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>
);

const SpecCard = ({ icon: Icon, label, value, sub }) => (
    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="font-bold text-slate-900">{value}</p>
            </div>
        </div>
        {sub && <span className="text-xs font-mono text-slate-400">{sub}</span>}
    </div>
);

const SystemCheck = ({ label, status }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <span className="text-xs font-medium text-slate-600 font-mono">{label}</span>
        <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'OK' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {status}
            </span>
            {status === 'OK' && <CheckCircle2 size={12} className="text-emerald-500" />}
        </div>
    </div>
);

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

const ContestInstructions = () => {
    // --- Hooks & State ---
    const navigate = useNavigate();
    const location = useLocation();
    const { contestId } = useParams();
    
    const [agreed, setAgreed] = useState(false);
    const [isSystemReady, setIsSystemReady] = useState(false);

    // --- Data Processing ---
    const backendData = location.state?.contestData || null;

    // Construct the config object from backend data, with safe fallbacks
    const config = {
        title: backendData ? backendData.examName : "Unknown Contest",
        id: contestId || "N/A",
        duration: backendData ? getDurationString(backendData.startTime, backendData.endTime) : "--",
        problemCount: backendData ? backendData.problemsCount : 0,
        maxScore: backendData ? (backendData.problemsCount * 100) : 0, 
        // Note: Unless backend sends languages, we keep these static or use a default list
        languages: ["C++20 (GCC)", "Java 17", "Python 3.10", "Node.js"], 
    };

    // --- Side Effects ---
    useEffect(() => {
        // Simulate checking system requirements (Network, Browser, etc.)
        const timer = setTimeout(() => {
            setIsSystemReady(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // --- Handlers ---
    const handleStart = () => {
        if (agreed && isSystemReady) {
            // Navigate to the live contest page, carrying the data forward
            navigate(`/contests/${contestId}/live`, { 
                state: { contestData: backendData } 
            });
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 pb-24">
            <GridBackground />

            {/* HEADER */}
            <div className="relative bg-white border-b border-slate-200 pt-8 pb-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-100">
                                Protocol Briefing
                            </span>
                            <span className="text-slate-400 text-xs font-mono">ID: {config.id}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            {config.title}
                        </h1>
                    </div>
                    
                    {/* Header Status Widget */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment Status</p>
                            <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                ONLINE
                            </p>
                        </div>
                        <button className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                            <Terminal size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <main className="relative max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: RULES */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Operational Parameters */}
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                    >
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <Cpu size={20} className="text-blue-600" />
                            Operational Parameters
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SpecCard icon={Clock} label="Time Limit" value={config.duration} sub="Hard Stop" />
                            <SpecCard icon={FileCode2} label="Problems" value={config.problemCount} sub="Algorithmic" />
                            <SpecCard icon={Terminal} label="Max Score" value={config.maxScore} sub="Points" />
                            <SpecCard icon={CheckCircle2} label="Test Cases" value="Hidden" sub="System Tests" />
                        </div>

                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Allowed Stacks</h3>
                            <div className="flex flex-wrap gap-2">
                                {config.languages.map(lang => (
                                    <span key={lang} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg font-mono">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* Zero Tolerance Policy */}
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-red-50/50 rounded-2xl p-6 border border-red-100"
                    >
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-700">
                            <ShieldAlert size={20} />
                            Zero Tolerance Policy
                        </h2>
                        <p className="text-sm text-red-600/80 font-medium mb-6 leading-relaxed">
                            This contest environment is monitored by automated proctoring systems. 
                            Any violation of the following integrity protocols will result in immediate disqualification.
                        </p>

                        <div className="grid gap-3">
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 shadow-sm">
                                <MonitorX className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-xs font-bold text-red-700 uppercase">Tab Switching Detected</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Focus lost events are logged. Excessive switching triggers auto-submit.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 shadow-sm">
                                <Eye className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-xs font-bold text-red-700 uppercase">Plagiarism Scan</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">MOSS algorithm compares code against all participants and online repos.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 shadow-sm">
                                <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-xs font-bold text-red-700 uppercase">Copilot / AI Restricted</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Use of AI assistants, clipboard history tools, or extensions is prohibited.</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* RIGHT COLUMN: SYSTEM CHECK */}
                <div className="space-y-6">
                    
                    {/* System Integrity Check */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg shadow-slate-200/50"
                    >
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertOctagon size={16} className="text-blue-500" /> System Integrity
                        </h3>
                        <div className="space-y-1">
                            <SystemCheck label="Network Latency" status="OK" />
                            <SystemCheck label="Compiler Services" status="OK" />
                            <SystemCheck label="Browser Compatibility" status="OK" />
                            <SystemCheck label="Anti-Cheat Daemon" status="OK" />
                            <SystemCheck label="Session Token" status={isSystemReady ? "OK" : "VERIFYING..."} />
                        </div>
                    </motion.div>

                    {/* Scoring Rules Box */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl"
                    >
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Scoring Rules</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>+100 pts per solved problem.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>Time is a tie-breaker factor.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 font-bold">•</span>
                                <span>-10 mins penalty for wrong submissions.</span>
                            </li>
                        </ul>
                    </motion.div>

                </div>
            </main>

            {/* FIXED BOTTOM ACTION BAR */}
            <motion.div 
                initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.5 }}
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 z-50"
            >
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Agreement Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                            {agreed && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                        <span className="text-sm font-medium text-slate-600 select-none">
                            I accept the <span className="text-slate-900 font-bold">Rules of Engagement</span> and certify that I will not cheat.
                        </span>
                    </label>

                    {/* Start Button */}
                    <button 
                        onClick={handleStart}
                        disabled={!agreed || !isSystemReady}
                        className={`
                            flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all
                            ${agreed && isSystemReady
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:scale-105 cursor-pointer' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        <span>Initialize Contest</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </motion.div>

        </div>
    );
};

export default ContestInstructions;