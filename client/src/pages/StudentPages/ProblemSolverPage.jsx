import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Editor from "@monaco-editor/react";
import { 
    Terminal, ChevronLeft, Timer, Settings,
    ChevronDown, RotateCcw, Play, Loader2, Rocket,
    Check, Minus, Plus, AlertTriangle, Code2, X,
    Sun, Moon, Trophy, CheckCircle2, XCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useParams, useNavigate } from 'react-router-dom';

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- CONSTANTS ---
const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const LANGUAGE_ID_MAP = {
    'cpp': 54,
    'java': 91,
    'python': 71,
    'javascript': 63
};

const LANGUAGES = [
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
];

const STARTER_CODE = {
    cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Read input and print output\n    return 0;\n}`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Read input and print output\n    }\n}`,
    python: `import sys\n\ndef solve():\n    # Read input from sys.stdin\n    pass\n\nsolve()`,
    javascript: `// Read input from stdin\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\n// Write solution`
};

const ProblemSolverPage = () => {
    // --- ROUTING CONTEXT ---
    const { contestId, problemId } = useParams(); 
    const navigate = useNavigate();

    // --- STATE ---
    const [isDarkMode, setIsDarkMode] = useState(true); 
    const [leftWidth, setLeftWidth] = useState(40); 
    const [bottomHeight, setBottomHeight] = useState(35); 
    const [timeLeft, setTimeLeft] = useState(45 * 60); 
    const [isDragging, setIsDragging] = useState(false); 
    
    // Problem Data State
    const [problemDetails, setProblemDetails] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const [contestName, setContestName] = useState("Loading Contest...");

    // Editor State
    const [language, setLanguage] = useState('python'); 
    const [code, setCode] = useState(STARTER_CODE['python']);
    const [fontSize, setFontSize] = useState(14);
    
    // UI Toggles
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false); 
    const [resetSuccess, setResetSuccess] = useState(false);

    // Execution & Test Case State
    const [testCases, setTestCases] = useState([]);
    const [activeTab, setActiveTab] = useState('cases'); 
    
    // STATUS: 'idle' | 'running' | 'submitting' | 'success'
    const [status, setStatus] = useState('idle');
    const [executionResults, setExecutionResults] = useState(null); // For Run Code
    const [submissionResult, setSubmissionResult] = useState(null); // For Submit Code
    const [selectedCaseId, setSelectedCaseId] = useState(null);

    // Refs
    const leftWidthRef = useRef(leftWidth);
    const bottomHeightRef = useRef(bottomHeight);
    const textareaRef = useRef(null);
    const dragDirectionRef = useRef(null); 

    // --- THEME ENGINE ---
    const theme = isDarkMode ? {
        mode: 'dark',
        appBg: "bg-[#0f172a]",
        cardBg: "bg-[#1e293b]",
        headerBg: "bg-[#1e293b]/90",
        textMain: "text-gray-100",
        textSec: "text-slate-400",
        border: "border-slate-700",
        inputBg: "bg-black/40",
        accentPrimary: "bg-blue-600 text-white hover:bg-blue-500", 
        accentSecondary: "bg-slate-700/60 text-white hover:bg-slate-700",
        success: "text-green-400",
        successBg: "bg-green-600 text-white hover:bg-green-500 shadow-green-900/40", 
        error: "text-rose-500",
        timerAlert: "bg-rose-500 text-white border-rose-600",
        tabActive: "text-white font-bold",
        tabInactive: "text-slate-500",
        tabLine: "bg-blue-500",
        prose: "prose-invert", 
        codeBlock: "bg-black/40 border-slate-700 text-white",
        monaco: "vs-dark",
        exampleCard: "bg-[#0f172a]/50 border-slate-700"
    } : {
        mode: 'light',
        appBg: "bg-white",
        cardBg: "bg-gray-50",
        headerBg: "bg-white/90",
        textMain: "text-black",
        textSec: "text-gray-500",
        border: "border-gray-200",
        inputBg: "bg-white border border-gray-300",
        accentPrimary: "bg-black text-white hover:bg-gray-800", 
        accentSecondary: "bg-gray-200 text-black hover:bg-gray-300", 
        success: "text-black",
        successBg: "bg-green-500 text-white hover:bg-green-600 shadow-green-200", 
        error: "text-black",
        timerAlert: "bg-black text-white border-black", 
        tabActive: "text-black font-bold",
        tabInactive: "text-gray-400",
        tabLine: "bg-black",
        prose: "prose-stone", 
        codeBlock: "bg-white border-gray-300 text-black",
        monaco: "light",
        exampleCard: "bg-white border-gray-200"
    };

    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; 
            textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`; 
        }
    }, [selectedCaseId, testCases, activeTab]);

    useEffect(() => { leftWidthRef.current = leftWidth; }, [leftWidth]);
    useEffect(() => { bottomHeightRef.current = bottomHeight; }, [bottomHeight]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoadingProblem(true);
            try {
                setContestName(contestId.replace(/-/g, ' '));
                const res = await fetch(`${API_URL}/api/student/get-problem-details/${problemId}`, {credentials: 'include'});
                const data = await res.json();
                
                if (data.success && data.data) {
                    setProblemDetails(data.data);
                    
                    if (data.data.publicTestCases) {
                        const formattedCases = data.data.publicTestCases.map((tc, index) => ({
                            id: index + 1,
                            type: 'sample',
                            input: tc.input,
                            expected: tc.output,
                            explanation: tc.explanation || ''
                        }));
                        setTestCases(formattedCases);
                        setSelectedCaseId(formattedCases[0]?.id || 1);
                    } else {
                        setTestCases([{ id: 1, type: 'custom', input: '', expected: '' }]);
                    }

                    if (data.data.lastCode && data.data.lastCode.trim() !== "") {
                        setCode(data.data.lastCode);
                    } else {
                        setCode(STARTER_CODE[language]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoadingProblem(false);
            }
        };

        if(problemId) fetchData();
    }, [problemId, contestId]);

    // --- HANDLERS ---
    const handleMouseDown = (direction) => (e) => {
        e.preventDefault();
        setIsDragging(true);
        dragDirectionRef.current = direction;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = leftWidthRef.current;
        const startHeight = bottomHeightRef.current;
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        const onMouseMove = (moveEvent) => {
            if (dragDirectionRef.current === 'horizontal') {
                const delta = moveEvent.clientX - startX;
                const newWidth = startWidth + (delta / winWidth) * 100;
                if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
            } else {
                const delta = startY - moveEvent.clientY; 
                const newHeight = startHeight + (delta / winHeight) * 100;
                if (newHeight > 10 && newHeight < 80) setBottomHeight(newHeight);
            }
        };

        const onMouseUp = () => {
            setIsDragging(false);
            dragDirectionRef.current = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleLanguageChange = (langId) => {
        setLanguage(langId);
        setCode(STARTER_CODE[langId]);
        setShowLangMenu(false);
    };

    const handleResetClick = () => setShowResetModal(true);

    const confirmReset = () => {
        setCode(STARTER_CODE[language]);
        setShowResetModal(false);
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 1200);
    };

    const handleTestCaseChange = (e) => {
        const newVal = e.target.value;
        setTestCases(prev => prev.map(tc => 
            tc.id === selectedCaseId ? { ...tc, input: newVal } : tc
        ));
    };

    const handleAddTestCase = () => {
        if (testCases.length >= 5) {
            alert("Maximum 5 test cases allowed.");
            return;
        }
        const newId = testCases.length > 0 ? Math.max(...testCases.map(t => t.id)) + 1 : 1;
        const newCase = { id: newId, type: 'custom', input: '', expected: '' };
        setTestCases([...testCases, newCase]);
        setSelectedCaseId(newId);
    };

    const handleDeleteTestCase = (id, e) => {
        e.stopPropagation();
        if (testCases.length <= 1) return;
        const newCases = testCases.filter(t => t.id !== id);
        setTestCases(newCases);
        if (selectedCaseId === id) setSelectedCaseId(newCases[0].id);
    };

    // --- EXECUTE CODE LOGIC (RUN & SUBMIT) ---
    const executeCode = async (mode) => {
        if (!problemDetails) return;

        if (mode === 'run') {
            setStatus('running');
            setActiveTab('result');
            setExecutionResults(null);
            setSubmissionResult(null); // Clear previous submit results
            
            try {
                const payload = {
                    examId: contestId,
                    problemId: problemId,
                    languageId: LANGUAGE_ID_MAP[language],
                    code: code
                };

                const res = await fetch(`${API_URL}/api/student/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });

                const data = await res.json();

                if (data.success) {
                    setExecutionResults(data.results);
                } else {
                    setExecutionResults([{ 
                        status: 'Error', 
                        stderr: data.message || 'Execution failed.',
                        passed: false 
                    }]);
                }

            } catch (error) {
                console.error("Run error", error);
                setExecutionResults([{ status: 'Network Error', stderr: 'Failed to connect.', passed: false }]);
            } finally {
                setStatus('idle');
            }

        } else if (mode === 'submit') {
            setStatus('submitting');
            setActiveTab('result');
            setExecutionResults(null); // Clear previous run results
            setSubmissionResult(null);

            try {
                const payload = {
                    examId: contestId,
                    problemId: problemId,
                    languageId: LANGUAGE_ID_MAP[language],
                    code: code
                };

                const res = await fetch(`${API_URL}/api/student/submit-problem`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });

                const data = await res.json();

                // Handle both API success true/false scenarios
                if (data.success) {
                    setSubmissionResult({
                        success: true,
                        passedCount: data.passedCount,
                        totalPrivateCases: data.totalPrivateCases,
                        marksEarned: data.marksEarned,
                        status: data.status
                    });
                    setStatus('success');
                } else {
                    setSubmissionResult({
                        success: false,
                        status: "Submission Failed",
                        message: data.message || "An unknown error occurred."
                    });
                    setStatus('idle');
                }

            } catch (error) {
                console.error("Submit error", error);
                setSubmissionResult({
                    success: false,
                    status: "Network Error",
                    message: "Failed to submit code. Check connection."
                });
                setStatus('idle');
            } finally {
                // Reset status to idle after delay if it was success
                if(status !== 'idle') {
                    setTimeout(() => setStatus('idle'), 3000);
                }
            }
        }
    };

    const currentLangObj = LANGUAGES.find(l => l.id === language);
    const currentTestCase = testCases.find(c => c.id === selectedCaseId);

    if (loadingProblem) {
        return (
            <div className={cn("flex items-center justify-center h-screen w-full", theme.appBg, theme.textMain)}>
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-screen w-full font-sans overflow-hidden selection:bg-gray-500/30 relative transition-colors duration-300", theme.appBg, theme.textMain)}>
            
            {isDragging && (
                <div className={cn(
                    "absolute inset-0 z-[9999]",
                    dragDirectionRef.current === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize'
                )}></div>
            )}

            {/* RESET MODAL */}
            {showResetModal && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={cn("w-[400px] p-6 rounded-3xl border shadow-2xl transition-colors", theme.cardBg, theme.border)}>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isDarkMode ? "bg-rose-500/20 text-rose-500" : "bg-black text-white")}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className={cn("text-lg font-bold mb-1", theme.textMain)}>Reset Code?</h3>
                                <p className={cn("text-xs", theme.textSec)}>Revert to default template? This cannot be undone.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button onClick={() => setShowResetModal(false)} className={cn("px-4 py-2.5 rounded-xl text-xs font-bold transition-colors", isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-200")}>Cancel</button>
                                <button onClick={confirmReset} className={cn("px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg", isDarkMode ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/20" : "bg-black text-white hover:bg-gray-800")}>Yes, Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className={cn("h-14 flex items-center justify-between px-4 shrink-0 z-40 border-b backdrop-blur-sm transition-colors relative", theme.headerBg, theme.border)}>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/contests/${contestId}`)}
                        className={cn("p-2 rounded-xl border transition-all active:scale-95 group", theme.cardBg, theme.border)}
                    >
                        <ChevronLeft size={18} className={cn("transition-transform group-hover:-translate-x-0.5", theme.textSec)} />
                    </button>
                    <h1 className="font-bold text-base tracking-tight uppercase">{contestName}</h1>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-2 rounded-full border shadow-sm transition-all duration-300", 
                        timeLeft < 300 ? theme.timerAlert : cn(theme.cardBg, theme.border)
                    )}>
                        <Timer size={16} className={timeLeft < 300 ? "animate-pulse" : ""} />
                        <span className="text-xl font-mono font-bold tracking-widest tabular-nums leading-none mt-[2px]">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)} 
                        className={cn("p-2 rounded-xl border transition-all hover:bg-opacity-80", theme.cardBg, theme.border, theme.textMain)}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            {/* WORKSPACE */}
            <div className="flex-1 flex overflow-hidden p-2 gap-2 relative">
                
                {/* LEFT PANEL */}
                <div 
                    style={{ width: `${leftWidth}%` }} 
                    className={cn("h-full flex flex-col rounded-3xl overflow-hidden border relative z-10 transition-colors", theme.cardBg, theme.border, isDragging && "pointer-events-none select-none")}
                >
                    <div className={cn("p-5 border-b flex items-center justify-between", theme.border)}>
                        <h1 className="text-xl font-black">{problemDetails?.problemNo}. {problemDetails?.title}</h1>
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                            isDarkMode ? "bg-amber-900/20 text-amber-500 border-amber-800" : "bg-black text-white border-black"
                        )}>
                            {problemDetails?.difficulty}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar p-6">
                        <style>{`
                            .prose code { color: ${isDarkMode ? '#e2e8f0' : '#000'} !important; background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; padding: 2px 4px; rounded: 4px; }
                        `}</style>
                        
                        <div className={cn("prose prose-sm max-w-none space-y-6", theme.prose)}>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Description</h3>
                                <p className="leading-relaxed">{problemDetails?.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className={cn("p-4 rounded-xl border text-xs", theme.exampleCard)}>
                                    <h3 className="font-bold text-[10px] uppercase opacity-70 mb-2 flex items-center gap-2">Input Format</h3>
                                    <p className="opacity-90 font-mono">{problemDetails?.inputFormat}</p>
                                </div>
                                 <div className={cn("p-4 rounded-xl border text-xs", theme.exampleCard)}>
                                    <h3 className="font-bold text-[10px] uppercase opacity-70 mb-2 flex items-center gap-2">Output Format</h3>
                                    <p className="opacity-90 font-mono">{problemDetails?.outputFormat}</p>
                                </div>
                                <div className={cn("p-4 rounded-xl border text-xs", theme.exampleCard)}>
                                    <h3 className="font-bold text-[10px] uppercase opacity-70 mb-2 flex items-center gap-2"><AlertTriangle size={12}/> Constraints</h3>
                                    <p className="opacity-90 font-mono">{problemDetails?.constraints}</p>
                                </div>
                            </div>

                            {problemDetails?.publicTestCases && problemDetails.publicTestCases.length > 0 && (
                                <div className="space-y-4 mt-8 border-t pt-6 border-dashed border-gray-500/30">
                                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <CheckCircleIcon /> Examples
                                    </h3>
                                    {problemDetails.publicTestCases.map((tc, idx) => (
                                        <div key={idx} className={cn("rounded-xl border overflow-hidden", theme.exampleCard)}>
                                            <div className={cn("px-4 py-2 border-b flex items-center justify-between", theme.border, isDarkMode ? "bg-black/20" : "bg-gray-100")}>
                                                <span className="text-[10px] font-bold uppercase opacity-70">Example {idx + 1}</span>
                                            </div>
                                            <div className="p-4 grid grid-cols-1 gap-4">
                                                <div>
                                                    <div className="text-[10px] uppercase opacity-50 mb-1">Input</div>
                                                    <div className={cn("font-mono text-sm p-2 rounded-lg", theme.codeBlock)}>{tc.input}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase opacity-50 mb-1">Output</div>
                                                    <div className={cn("font-mono text-sm p-2 rounded-lg", theme.codeBlock)}>{tc.output}</div>
                                                </div>
                                                {tc.explanation && (
                                                    <div className="text-xs opacity-80 italic mt-1 border-l-2 border-blue-500 pl-3">
                                                        <span className="font-bold">Explanation:</span> {tc.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* H-DRAG */}
                <div onMouseDown={handleMouseDown('horizontal')} className="w-2 -ml-2 -mr-2 cursor-col-resize z-50 flex items-center justify-center group hover:scale-110 transition-transform">
                    <div className={cn("w-1 h-8 rounded-full transition-colors", isDarkMode ? "bg-slate-700 group-hover:bg-blue-500" : "bg-gray-300 group-hover:bg-black")}></div>
                </div>

                {/* RIGHT PANEL */}
                <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col h-full gap-2 relative">
                    
                    {/* TOP: EDITOR */}
                    <div className={cn("flex-1 flex flex-col rounded-3xl overflow-hidden border relative z-10 transition-colors", theme.cardBg, theme.border)}>
                        <div className={cn("h-12 flex items-center justify-between px-4 border-b", theme.border, isDarkMode ? "bg-black/20" : "bg-gray-100/50")}>
                            <div className="flex items-center gap-3">
                                <div className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-green-400" : "text-black")}>
                                    <Code2 size={14} />
                                    <span>Code</span>
                                </div>
                                <div className={cn("h-4 w-[1px]", isDarkMode ? "bg-slate-700" : "bg-gray-300")}></div>
                                <div className="relative">
                                    <button onClick={() => setShowLangMenu(!showLangMenu)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-colors", theme.border, theme.inputBg)}>
                                        {currentLangObj.name} <ChevronDown size={12} />
                                    </button>
                                    {showLangMenu && (
                                        <div className={cn("absolute top-full left-0 mt-2 w-40 rounded-2xl border shadow-xl p-1 z-50 flex flex-col backdrop-blur-xl", theme.cardBg, theme.border)}>
                                            {LANGUAGES.map(lang => (
                                                <button key={lang.id} onClick={() => handleLanguageChange(lang.id)} className={cn("w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex justify-between items-center transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-200")}>
                                                    {lang.name} {language === lang.id && <Check size={12} className={isDarkMode ? "text-blue-400" : "text-black"} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative">
                                <button onClick={() => setShowSettings(!showSettings)} className={cn("p-1.5 rounded-xl transition-all", showSettings ? theme.accentPrimary : `${theme.textSec} hover:bg-gray-200/20`)}>
                                    <Settings size={16} />
                                </button>
                                {showSettings && (
                                    <div className={cn("absolute top-full right-0 mt-2 w-48 rounded-2xl border shadow-xl p-4 z-50 backdrop-blur-xl", theme.cardBg, theme.border)}>
                                        <div className="flex flex-col gap-3">
                                            <p className={cn("text-[10px] font-bold uppercase tracking-wider", theme.textSec)}>Font Size</p>
                                            <div className={cn("flex items-center justify-between rounded-lg p-1 border", isDarkMode ? "bg-black/30 border-white/5" : "bg-white border-gray-200")}>
                                                <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="p-1 hover:opacity-70"><Minus size={14}/></button>
                                                <span className="text-xs font-mono font-bold">{fontSize}px</span>
                                                <button onClick={() => setFontSize(Math.min(22, fontSize + 1))} className="p-1 hover:opacity-70"><Plus size={14}/></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button onClick={handleResetClick} className={cn("p-1.5 rounded-xl transition-colors", theme.textSec, isDarkMode ? "hover:bg-rose-500 hover:text-white" : "hover:bg-gray-200 hover:text-black")}>
                                    {resetSuccess ? <Check size={16} className={theme.success} /> : <RotateCcw size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className={cn("flex-1 relative group overflow-hidden", isDragging && "pointer-events-none")}>
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={setCode}
                                theme={theme.monaco}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: fontSize,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    padding: { top: 16, bottom: 60 },
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                }}
                            />
                            
                            <div className="absolute bottom-4 right-6 flex items-center gap-3 z-20 pointer-events-none">
                                <button 
                                    onClick={() => executeCode('run')} 
                                    disabled={status !== 'idle'} 
                                    className={cn("pointer-events-auto px-5 py-2.5 rounded-xl font-bold text-[10px] transition-all uppercase tracking-wider flex items-center gap-2 shadow-xl backdrop-blur-md border border-white/5", theme.accentSecondary)}
                                >
                                    {status === 'running' ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                                    Run
                                </button>

                                <button 
                                    onClick={() => executeCode('submit')} 
                                    disabled={status !== 'idle'} 
                                    className={cn(
                                        "pointer-events-auto px-6 py-2.5 rounded-xl font-bold text-[10px] transition-all duration-500 shadow-xl uppercase tracking-wider flex items-center gap-2 backdrop-blur-md border overflow-hidden relative min-w-[100px] justify-center", 
                                        status === 'success' ? theme.successBg : cn("border-white/10", theme.accentPrimary),
                                        (status === 'submitting' || status === 'success') ? "scale-105" : "hover:scale-105"
                                    )}
                                >
                                    <div className="relative w-4 h-4 mr-1">
                                        <div className={cn("absolute inset-0 transition-all duration-500 ease-in-out", status === 'submitting' ? "-translate-y-12 opacity-0" : "translate-y-0 opacity-100")}>
                                            {status !== 'success' && <Rocket size={14} />}
                                        </div>
                                        <div className={cn("absolute inset-0 transition-all duration-500 ease-in-out flex items-center justify-center", status === 'submitting' ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0")}>
                                             <Loader2 size={14} className="animate-spin" />
                                        </div>
                                        <div className={cn("absolute inset-0 transition-all duration-300 ease-out flex items-center justify-center", status === 'success' ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                                             <Check size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <span className="relative">
                                        {status === 'idle' && "Submit"}
                                        {status === 'submitting' && "Sending..."}
                                        {status === 'success' && "Success"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* V-DRAG */}
                    <div onMouseDown={handleMouseDown('vertical')} className="h-2 -mt-2 -mb-2 cursor-row-resize z-50 flex items-center justify-center group hover:scale-110 transition-transform">
                         <div className={cn("w-12 h-1 rounded-full transition-colors", isDarkMode ? "bg-slate-700 group-hover:bg-blue-500" : "bg-gray-300 group-hover:bg-black")}></div>
                    </div>

                    {/* BOTTOM PANEL: TEST CASES & OUTPUT */}
                    <div style={{ height: `${bottomHeight}%` }} className={cn("flex flex-col rounded-3xl overflow-hidden border shadow-sm transition-all relative z-10", theme.cardBg, theme.border)}>
                        <div className={cn("flex items-center px-6 border-b h-10 shrink-0 gap-6", theme.border, isDarkMode ? "bg-black/20" : "bg-gray-100/50")}>
                            <button onClick={() => setActiveTab('cases')} className={cn("h-full text-[10px] uppercase tracking-wider relative transition-colors", activeTab === 'cases' ? theme.tabActive : theme.tabInactive)}>
                                Test Cases {activeTab === 'cases' && <span className={cn("absolute bottom-0 left-0 w-full h-0.5 rounded-t-full", theme.tabLine)}></span>}
                            </button>
                            <button onClick={() => setActiveTab('result')} className={cn("h-full text-[10px] uppercase tracking-wider relative transition-colors", activeTab === 'result' ? theme.tabActive : theme.tabInactive)}>
                                Output {activeTab === 'result' && <span className={cn("absolute bottom-0 left-0 w-full h-0.5 rounded-t-full", theme.tabLine)}></span>}
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar p-4 flex flex-col">
                            {activeTab === 'cases' ? (
                                <div className="space-y-3 flex flex-col">
                                    <div className="flex gap-2 shrink-0 items-center overflow-x-auto no-scrollbar pb-1">
                                        {testCases.map((c, i) => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => setSelectedCaseId(c.id)} 
                                                className={cn(
                                                    "px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap group flex items-center gap-2", 
                                                    selectedCaseId === c.id 
                                                        ? theme.accentPrimary
                                                        : cn("hover:opacity-100", theme.inputBg, theme.textSec)
                                                )}
                                            >
                                                <span>Case {i + 1}</span>
                                                {c.type !== 'sample' && testCases.length > 1 && (
                                                    <span 
                                                        onClick={(e) => handleDeleteTestCase(c.id, e)}
                                                        className={cn("p-0.5 rounded-md text-current opacity-0 group-hover:opacity-100 transition-all", isDarkMode ? "hover:bg-white/20 hover:text-white" : "hover:bg-black/10 hover:text-black")}
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                        <button onClick={handleAddTestCase} className={cn("px-3 py-1.5 rounded-lg border border-dashed transition-all flex items-center justify-center hover:opacity-100", theme.border, theme.textSec, isDarkMode ? "hover:text-white hover:border-slate-400" : "hover:text-black hover:border-black")}>
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    
                                    <div className={cn("w-full rounded-xl border relative overflow-hidden group shrink-0 transition-colors", theme.inputBg, theme.border)}>
                                         <div className="p-4">
                                            <textarea
                                                ref={textareaRef}
                                                value={currentTestCase?.input || ''}
                                                onChange={handleTestCaseChange}
                                                className={cn("w-full bg-transparent text-xs font-mono resize-none outline-none border-none overflow-hidden leading-relaxed", isDarkMode ? "text-slate-300 placeholder:text-slate-600" : "text-black placeholder:text-gray-400")}
                                                spellCheck={false}
                                                placeholder="Enter input here..."
                                            />
                                         </div>
                                    </div>
                                    {currentTestCase?.type === 'sample' && (
                                        <div className="mt-2 text-xs opacity-70 p-2 border rounded-lg border-dashed border-gray-500/30">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold uppercase text-[10px]">Expected Output:</span>
                                                <span className="font-mono bg-black/10 px-2 py-0.5 rounded">{currentTestCase.expected}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    {/* 1. If Submission Result Exists (Submit Clicked) */}
                                    {submissionResult ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {/* Status Icon */}
                                            <div className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4",
                                                submissionResult.status === 'Accepted' 
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/20"
                                            )}>
                                                {submissionResult.status === 'Accepted' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                                            </div>

                                            <div className="text-center space-y-1">
                                                <h3 className={cn("text-2xl font-black tracking-tight", submissionResult.status === 'Accepted' ? "text-emerald-400" : "text-red-400")}>
                                                    {submissionResult.status}
                                                </h3>
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Submission Result</p>
                                            </div>

                                            {/* Stats Grid */}
                                            {submissionResult.success && (
                                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                                    <div className={cn("p-4 rounded-2xl border text-center space-y-1", theme.inputBg, theme.border)}>
                                                        <div className="text-[10px] font-bold uppercase opacity-50">Test Cases</div>
                                                        <div className="text-xl font-mono font-bold flex items-center justify-center gap-2">
                                                            <Check size={16} className="text-emerald-500" />
                                                            {submissionResult.passedCount} <span className="opacity-30">/</span> {submissionResult.totalPrivateCases}
                                                        </div>
                                                    </div>
                                                    <div className={cn("p-4 rounded-2xl border text-center space-y-1", theme.inputBg, theme.border)}>
                                                        <div className="text-[10px] font-bold uppercase opacity-50">Marks</div>
                                                        <div className="text-xl font-mono font-bold flex items-center justify-center gap-2">
                                                            <Trophy size={16} className="text-amber-500" />
                                                            {submissionResult.marksEarned}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {!submissionResult.success && submissionResult.message && (
                                                 <div className="max-w-md p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono text-center">
                                                    {submissionResult.message}
                                                 </div>
                                            )}
                                        </div>

                                    /* 2. If Run Results Exist (Run Clicked) */
                                    ) : executionResults ? (
                                        <div className="space-y-4">
                                            {executionResults.map((res, i) => (
                                                <div key={i} className={cn("p-4 rounded-xl border text-xs font-mono", theme.inputBg, theme.border)}>
                                                    <div className="flex justify-between items-center mb-3 border-b pb-2 border-white/10">
                                                        <span className="font-bold opacity-70">Test Case {i + 1}</span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold", 
                                                            res.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                                        )}>
                                                            {res.status || 'Unknown Status'}
                                                        </span>
                                                    </div>
                                                    {res.input && (
                                                        <div className="mb-3">
                                                            <div className="text-[10px] uppercase opacity-50 mb-1">Input</div>
                                                            <div className="bg-black/20 p-2 rounded whitespace-pre-wrap">{res.input}</div>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="text-[10px] uppercase opacity-50 mb-1">Expected Output</div>
                                                            <div className="bg-black/20 p-2 rounded whitespace-pre-wrap min-h-[30px]">{res.expectedOutput || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase opacity-50 mb-1">Your Output</div>
                                                            <div className={cn("p-2 rounded whitespace-pre-wrap min-h-[30px]", res.passed ? "bg-black/20" : "bg-red-500/10 text-red-400")}>
                                                                {res.actualOutput || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {res.stderr && (
                                                        <div className="mt-3 text-rose-500 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                                                            <div className="text-[10px] uppercase opacity-70 mb-1 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Runtime Error</div>
                                                            <pre className="whitespace-pre-wrap">{res.stderr}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                    /* 3. Empty State */
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                                            <Terminal size={24} className="mb-2" />
                                            {status === 'running' || status === 'submitting' ? (
                                                <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                                    {status === 'running' ? 'Running Code...' : 'Submitting Solution...'}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Execute code to see output</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#cbd5e1'}; border-radius: 10px; transition: background 0.3s; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#475569' : '#94a3b8'}; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default ProblemSolverPage;