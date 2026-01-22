import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Clock, Search, CheckCircle2, 
    AlertCircle, FileQuestion, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTEGRATIONS ---
import api from '../../api/axiosConfig'; 
import ErrorDisplay from '../../components/ErrorDisplay'; 
import { useNetworkStatus } from '../../hooks/Network';

// --- HELPER: FORMAT DURATION ---
const getDurationString = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} Mins`;
};

// --- HELPER: TIME CALCULATION ---
const calculateTimeLeft = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        const diff = start - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return { status: 'Starts In', time: `${h}h ${m}m ${s}s` };
    } else if (now >= start && now < end) {
        const diff = end - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return { status: 'Ends In', time: `${h}h ${m}m ${s}s` };
    } else {
        return { status: 'Status', time: 'Ended' };
    }
};

// --- COMPONENT: LIVE COUNTDOWN ---
const LiveTimer = ({ startTime, endTime }) => {
    const [timerData, setTimerData] = useState(() => calculateTimeLeft(startTime, endTime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimerData(calculateTimeLeft(startTime, endTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, endTime]);

    return (
        <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{timerData.status}</p>
            <p className="font-mono font-bold text-indigo-600 text-sm">{timerData.time}</p>
        </div>
    );
};

// --- COMPONENT: BACKGROUND ATMOSPHERE ---
const DataStreamBackground = () => {
    const leftPhrases = ["BATTLE OF LOGIC", "TIME MATTERS", "EVERY SECOND COUNTS", "PROVE YOUR SKILL", "FOCUS", "ADAPT", "WIN"];
    const rightPhrases = ["RISE HIGHER", "STAY AHEAD", "MIND OVER TIME", "SHARP THINKING", "LOGIC", "SPEED", "ACCURACY"];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 selection:bg-none">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-slate-100 opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] opacity-60"></div>
            <div className="absolute left-4 top-0 bottom-0 w-40 overflow-hidden opacity-10 hidden md:block">
                <motion.div animate={{ y: [0, -1000] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="flex flex-col gap-12 text-right font-black text-xs tracking-[0.2em] text-slate-400">
                    {[...leftPhrases, ...leftPhrases, ...leftPhrases, ...leftPhrases].map((item, i) => (
                        <span key={`l-${i}`} className="whitespace-nowrap">{item}</span>
                    ))}
                </motion.div>
            </div>
            <div className="absolute right-4 top-0 bottom-0 w-40 overflow-hidden opacity-10 hidden md:block">
                <motion.div animate={{ y: [-1000, 0] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="flex flex-col gap-12 text-left font-black text-xl tracking-tighter text-indigo-300">
                    {[...rightPhrases, ...rightPhrases, ...rightPhrases, ...rightPhrases].map((item, i) => (
                        <span key={`r-${i}`} className="whitespace-nowrap">{item}</span>
                    ))}
                </motion.div>
            </div>
            <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const ContestEntry = () => {
    const navigate = useNavigate();
    const isOnline = useNetworkStatus(); // ⚡️ NETWORK CHECK
    
    const [examId, setExamId] = useState('');
    const [status, setStatus] = useState('IDLE'); 
    const [apiData, setApiData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const verifyExamId = async (code) => {
    if (!code) return;
    setStatus('LOADING');
    setErrorMsg('');

    try {
        const response = await api.post('/api/student/enter', { inputExamId: code });
        const data = response.data;

        if (data.success) {
            setTimeout(() => {
                setApiData(data);
                setStatus('SUCCESS');
            }, 800);
        } else {
            // This handles cases where the server returns 200 OK but success: false
            setStatus('ERROR');
            setErrorMsg(data.message || 'Contest ID is Invalid');
        }
    } catch (e) {
        // --- ADD THIS LOGIC ---
        console.error("API Error:", e);
        setStatus('ERROR');
        
        // Handle different types of error messages
        const message = e.response?.data?.message || e.message || 'Server connection failed';
        setErrorMsg(message);
    }
};
    // --- AUTO FETCH LOGIC ---
    useEffect(() => {
        if (examId.length === 6) {
            verifyExamId(examId);
        }
    }, [examId]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && examId.length >= 1) {
            verifyExamId(examId);
        }
    };

    const handleStartContest = () => {
        if (apiData) {
            // ⚡️ FIX: Pass correct ID to URL
            const contestId = apiData.examId; 
            
            navigate(`/contests/${contestId}/instructions`, { 
                state: { contestData: apiData },
                replace: true 
            });
        }
    };

    // ⚡️ OFFLINE RENDER
    if (!isOnline) {
        return <ErrorDisplay type="offline" />;
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-slate-900 overflow-hidden">
            <DataStreamBackground />

            <div className="relative z-10 w-full max-w-[580px] px-6">
                <motion.div layout className="text-center mb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block mb-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                        Not Just Code
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4 leading-[0.95]">
                        It’s a Battle <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Of Logic.
                        </span>
                    </h1>
                    <p className="text-slate-500 font-bold text-lg tracking-wide uppercase">
                        Where logic outperforms luck.
                    </p>
                </motion.div>

                <motion.div 
                    layout
                    className={`
                        relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500
                        ${status === 'SUCCESS' ? 'shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] ring-4 ring-indigo-50 border-indigo-100' : 
                          status === 'ERROR' ? 'shadow-2xl shadow-red-200/50 ring-4 ring-red-50 border-red-100' : 
                          'shadow-2xl shadow-slate-200/80 border border-white'}
                    `}
                >
                    <div className="p-3">
                        <div className="relative group">
                            <input
                                type="text"
                                value={examId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length <= 6) {
                                        setExamId(val);
                                        if(status !== 'IDLE') setStatus('IDLE');
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter Code"
                                maxLength={6}
                                className={`
                                    w-full h-24 text-center text-3xl font-black tracking-wider rounded-[2rem] outline-none transition-all duration-300 font-mono uppercase
                                    placeholder:font-sans placeholder:text-slate-200 placeholder:text-xl placeholder:tracking-widest placeholder:font-bold
                                    ${status === 'LOADING' ? 'bg-indigo-50/50 text-indigo-600' : 'bg-white hover:bg-slate-50/50 text-slate-800'}
                                    ${status === 'ERROR' ? 'text-red-500 bg-red-50/50' : ''}
                                `}
                            />
                            
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => verifyExamId(examId)}>
                                <AnimatePresence mode="wait">
                                    {status === 'IDLE' && (
                                        <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-slate-100 p-3 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                                            <ArrowRight size={24} />
                                        </motion.div>
                                    )}
                                    {status === 'LOADING' && (
                                        <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }} transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }} className="bg-indigo-100 p-3 rounded-full text-indigo-600 border border-indigo-200">
                                            <Search size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === 'SUCCESS' && (
                                        <motion.div key="success" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="bg-emerald-500 p-3 rounded-full text-white shadow-lg shadow-emerald-200">
                                            <CheckCircle2 size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === 'ERROR' && (
                                        <motion.div key="error" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} className="bg-red-500 p-3 rounded-full text-white shadow-lg shadow-red-200">
                                            <AlertCircle size={24} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {status === 'ERROR' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-center pb-4 px-6">
                                <p className="text-sm font-bold text-red-500 bg-red-50 py-2 rounded-xl border border-red-100">{errorMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {status === 'SUCCESS' && apiData && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", bounce: 0.3 }} className="overflow-hidden">
                                <div className="px-8 pb-8 pt-2">
                                    <div className="w-full h-px bg-slate-100 mb-6"></div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{apiData.examName}</h2>
                                            <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded text-yellow-700 w-fit">
                                                <AlertCircle size={12} />
                                                <p className="text-[10px] font-bold uppercase tracking-wide">{apiData.message}</p>
                                            </div>
                                        </div>
                                        <LiveTimer startTime={apiData.startTime} endTime={apiData.endTime} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                                                <p className="font-bold text-slate-900">{getDurationString(apiData.startTime, apiData.endTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileQuestion size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Problems</p>
                                                <p className="font-bold text-slate-900">{apiData.problemsCount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="px-3 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600 flex items-center gap-2">
                                            <Layers size={12} /> Sem: {apiData.semester}
                                        </div>
                                        {apiData.batches.map((batch, idx) => (
                                            <div key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs font-bold text-indigo-600">
                                                {batch}
                                            </div>
                                        ))}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartContest}
                                        className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:shadow-indigo-300 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <span>View Instructions</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default ContestEntry;