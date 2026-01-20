import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { 
    ChevronLeft, Timer, ChevronDown, RotateCcw, Play, Loader2, Rocket,
    Check, AlertTriangle, X,
    Copy, Info, Hash, Edit3,
    Plus, Terminal,
    Cpu, Zap, CornerDownRight, Box, LayoutTemplate, Columns, Minus, AlertOctagon, Trash2, CheckCircle2, Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
};

// --- LANGUAGE MAPPING ---
const LANGUAGE_MAP = {
    'cpp': 54,
    'java': 62,
    'python': 71,
};

const LANGUAGES = [
    { id: 'cpp', name: 'C++', label: 'C++ (GCC 9.2)' },
    { id: 'java', name: 'Java', label: 'Java (OpenJDK 13)' },
    { id: 'python', name: 'Python', label: 'Python (3.8.1)' },
];

// --- THEME DEFINITIONS ---
const THEMES = {
    light: {
        id: 'light',
        isDark: false,
        appBg: "bg-[#F1F5F9]",
        panelBg: "bg-[#FFFFFF]",
        headerBg: "bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-slate-200/50",
        textMain: "text-slate-700",
        textHead: "text-slate-900",
        textSec: "text-slate-500",
        border: "border-slate-200",
        inputBg: "bg-[#F8FAFC]",
        codeBlock: "bg-[#F8FAFC] border-slate-200",
        codeHeader: "bg-[#f1f5f9] border-b border-slate-200",
        accentPrimary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-400/20",
        monaco: "light",
        scrollTrack: "bg-slate-100",
        modalOverlay: "bg-slate-900/20",
        successBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        errorBadge: "bg-rose-100 text-rose-700 border-rose-200"
    },
    midnight: {
        id: 'midnight',
        isDark: true,
        appBg: "bg-[#020617]",
        panelBg: "bg-[#0F172A]",
        headerBg: "bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/5",
        textMain: "text-slate-300",
        textHead: "text-white",
        textSec: "text-slate-400",
        border: "border-white/10",
        inputBg: "bg-[#020617]",
        codeBlock: "bg-[#020617] border-white/5",
        codeHeader: "bg-[#1e293b]/50 border-b border-white/5",
        accentPrimary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20",
        monaco: "vs-dark",
        scrollTrack: "bg-slate-800/20",
        modalOverlay: "bg-[#020617]/80",
        successBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        errorBadge: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    },
    dark: {
        id: 'dark',
        isDark: true,
        appBg: "bg-[#050505]",
        panelBg: "bg-[#171717]",
        headerBg: "bg-[#171717]/90 backdrop-blur-xl border-b border-neutral-800",
        textMain: "text-neutral-300",
        textHead: "text-neutral-100",
        textSec: "text-neutral-500",
        border: "border-neutral-800",
        inputBg: "bg-[#0a0a0a]",
        codeBlock: "bg-[#0a0a0a] border-neutral-800",
        codeHeader: "bg-[#171717] border-b border-neutral-800",
        accentPrimary: "bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700",
        monaco: "vs-dark",
        scrollTrack: "bg-neutral-900",
        modalOverlay: "bg-black/80",
        successBadge: "bg-emerald-900/20 text-emerald-500 border-emerald-900/30",
        errorBadge: "bg-rose-900/20 text-rose-500 border-rose-900/30"
    }
};

const STARTER_CODE = {
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // code here\n    return 0;\n}`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // code here\n    }\n}`,
    python: `import sys\n\n# Reading input from stdin\ninput_data = sys.stdin.read().split()\n\n# Your logic here\n# n = int(input_data[0])\n# ...\n`,
    javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8');\n// code here`
};

const ProblemSolverPage = () => {
    const { contestId, problemId } = useParams(); 
    const location = useLocation();
    const navigate = useNavigate();

    // --- CONTEXT ---
    const { contestData, theme: initialThemeId } = location.state || {};
    const themeId = THEMES[initialThemeId] ? initialThemeId : 'light';
    const theme = THEMES[themeId];

    // --- STATE ---
    const [layoutMode, setLayoutMode] = useState('classic'); 
    const [showLangSelector, setShowLangSelector] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(35); 
    const [consoleSize, setConsoleSize] = useState(40); 
    const [isDragging, setIsDragging] = useState(false); 
    
    // Data
    const [problemDetails, setProblemDetails] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const [copiedId, setCopiedId] = useState(null); 

    // Editor & Execution
    const [language, setLanguage] = useState('python'); 
    const [code, setCode] = useState("");
    const [fontSize, setFontSize] = useState(14);
    const [status, setStatus] = useState('idle');
    const [timeLeftDisplay, setTimeLeftDisplay] = useState('00:00:00');
    const [cursorPosition, setCursorPosition] = useState({ ln: 1, col: 1 });
    
    // Timer Logic State
    const [secondsRemaining, setSecondsRemaining] = useState(null);
    const isAutoSubmitting = useRef(false);
    
    // Refs for Auto-Submit (To avoid stale closures in setInterval)
    const codeRef = useRef(code);
    const languageRef = useRef(language);

    // Results
    const [executionResults, setExecutionResults] = useState(null); 
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    
    // Test Case Management
    const [testCases, setTestCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState(1);

    // Refs
    const sidebarWidthRef = useRef(sidebarWidth);
    const consoleSizeRef = useRef(consoleSize);
    const dragTargetRef = useRef(null); 
    const textareaRef = useRef(null); 
    const textareaRefs = useRef({}); 
    const editorRef = useRef(null);

    // Update refs whenever code/language changes
    useEffect(() => { codeRef.current = code; }, [code]);
    useEffect(() => { languageRef.current = language; }, [language]);

    // --- MONACO SETUP ---
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => {
            setCursorPosition({ ln: e.position.lineNumber, col: e.position.column });
        });
    };

    // --- RESIZE LOGIC ---
    const adjustTextareaHeight = (id = null) => {
        if (id !== null) {
            const el = textareaRefs.current[id];
            if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
        } else {
            if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; }
        }
    };

    useEffect(() => {
        if (layoutMode === 'classic') adjustTextareaHeight();
        else testCases.forEach(tc => adjustTextareaHeight(tc.id));
    }, [testCases, selectedCaseId, layoutMode]);

    // --- EXECUTE SUBMISSION (AUTO & MANUAL) ---
    const executeSubmission = async (isAuto = false) => {
        if (status === 'submitting' || status === 'autosubmitting') return;
        
        setStatus(isAuto ? 'autosubmitting' : 'submitting');
        
        try {
            // 1. Always submit the current problem code first to save progress
            const submitResponse = await fetch(`${backendUrl}/api/student/submit-problem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    examId: contestId,
                    problemId: problemId,
                    languageId: LANGUAGE_MAP[languageRef.current], // Use Ref for latest value
                    code: codeRef.current // Use Ref for latest value
                })
            });

            const submitJson = await submitResponse.json();

            // 2. If Auto-Submit, trigger Final Submit for the Exam
            if (isAuto) {
                const finalResponse = await fetch(`${backendUrl}/api/student/final-submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ examId: contestId }),
                    credentials: 'include'
                });
                
                const finalJson = await finalResponse.json();

                if (finalJson.success) {
                    setSubmissionResult({
                        status: "Time's Up",
                        passedCount: submitJson.passedCount || 0,
                        totalCases: submitJson.totalPrivateCases || 0,
                        marksEarned: submitJson.marksEarned || 0,
                        message: "Exam auto-submitted successfully.",
                        isAuto: true
                    });
                    setShowSubmitModal(true);
                    
                    // Navigate to dashboard after 3 seconds
                    setTimeout(() => navigate('/student/dashboard'), 3000); 
                }
            } else {
                // Manual Submission Logic
                if (submitJson.success) {
                    setSubmissionResult({
                        status: submitJson.status, 
                        passedCount: submitJson.passedCount,
                        totalCases: submitJson.totalPrivateCases,
                        marksEarned: submitJson.marksEarned,
                        isAuto: false
                    });
                    setShowSubmitModal(true);
                } else {
                    // Using modal for errors instead of alert
                    setSubmissionResult({
                        status: "Error",
                        passedCount: 0,
                        totalCases: 0,
                        message: submitJson.message || "Submission Failed"
                    });
                    setShowSubmitModal(true);
                }
            }

        } catch (err) {
            console.error("Submit error:", err);
            if(!isAuto) {
                setSubmissionResult({
                    status: "Network Error",
                    message: "Please check your connection"
                });
                setShowSubmitModal(true);
            }
        } finally {
            setStatus('idle');
        }
    };

    // --- TIMER SYNCHRONIZATION ---
    useEffect(() => {
        if (!contestData?.endTime) return;

        const updateTimer = () => {
            const end = new Date(contestData.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance <= 0) {
                setTimeLeftDisplay("00:00:00");
                setSecondsRemaining(0);
                
                // Trigger Auto Submit once
                if (!isAutoSubmitting.current) {
                    isAutoSubmitting.current = true;
                    executeSubmission(true); 
                }
                return;
            }

            setSecondsRemaining(Math.floor(distance / 1000));

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            setTimeLeftDisplay(`${hours < 10 ? '0'+hours : hours}:${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [contestData]);

    // --- TIMER STYLE LOGIC ---
    const getTimerStyles = () => {
        if (secondsRemaining === null) return cn(theme.panelBg, theme.border, theme.textMain);
        
        // Critical: Less than 60 seconds (Red + Pulse)
        if (secondsRemaining < 60) {
            return "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.3)]";
        }
        // Warning: Less than 5 minutes (Amber)
        if (secondsRemaining < 300) {
            return "bg-amber-500/10 text-amber-500 border-amber-500/30";
        }
        // Normal
        return cn(theme.panelBg, theme.border, theme.textSec);
    };

    // --- FETCH PROBLEM DETAILS ---
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoadingProblem(true);
                const response = await fetch(`${backendUrl}/api/student/get-problem-details/${problemId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const json = await response.json();

                if (json.success && json.data) {
                    setProblemDetails(json.data);
                    
                    const formattedCases = (json.data.publicTestCases || []).map((tc, i) => ({
                        id: i + 1, 
                        type: 'sample', 
                        input: tc.input, 
                        output: tc.output, 
                        explanation: tc.explanation
                    }));

                    setTestCases(formattedCases);
                    if (formattedCases.length > 0) setSelectedCaseId(1);
                    
                    if (!code) {
                        const backendCode = json.data.lastCode || STARTER_CODE[language];
                        setCode(backendCode);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProblem(false);
            }
        };
        if (problemId) fetchProblem();
    }, [problemId]); 

    // --- ACTIONS ---
    const handleCopy = (text, id) => {
        copyToClipboard(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // --- EXECUTE RUN CODE ---
    const handleRun = async () => {
        setStatus('running');
        setExecutionResults(null);

        const customTestCasesPayload = testCases
            .filter(tc => tc.type === 'custom')
            .map(tc => ({
                input: tc.input,
                output: tc.output || "" 
            }));

        try {
            const response = await fetch(`${backendUrl}/api/student/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    examId: contestId,
                    problemId: problemId,
                    languageId: LANGUAGE_MAP[language],
                    code: code,
                    customTestCases: customTestCasesPayload 
                })
            });

            const json = await response.json();

            if (json.success && json.results) {
                const results = json.results.map((res, index) => {
                    const originalCase = testCases[index];
                    return {
                        id: originalCase ? originalCase.id : index + 1,
                        status: res.status, 
                        passed: res.passed, 
                        input: res.input,
                        expectedOutput: res.expectedOutput,
                        actualOutput: res.actualOutput,
                        stderr: res.stderr, 
                        compileOutput: res.compile_output, 
                        time: `${res.time}s`,
                        memory: `${Math.round(res.memory / 1024)}MB` 
                    };
                });
                setExecutionResults(results);
            }
        } catch (err) {
            console.error("Run error:", err);
        } finally {
            setStatus('idle');
        }
    };

    // --- UI HELPERS ---
    const handleLayoutChange = (mode) => {
        setLayoutMode(mode);
        if (mode === 'replit') {
            setSidebarWidth(30);
            setConsoleSize(42.85); 
        } else {
            setSidebarWidth(35);
            setConsoleSize(40);
        }
    };

    const handleAddCase = () => {
        if (testCases.length < 4) {
            const maxId = testCases.length > 0 ? Math.max(...testCases.map(t => t.id)) : 0;
            const newId = maxId + 1;
            setTestCases([...testCases, { id: newId, input: "", type: 'custom' }]);
            setSelectedCaseId(newId);
            setExecutionResults(null); 
        }
    };

    const handleDeleteCase = (id) => {
        const targetCase = testCases.find(t => t.id === id);
        if (targetCase?.type === 'sample') return; 

        const newCases = testCases.filter(t => t.id !== id);
        setTestCases(newCases);
        
        if (selectedCaseId === id && newCases.length > 0) {
            setSelectedCaseId(newCases[0].id);
        }
    };

    const clearResults = () => {
        setExecutionResults(null);
    };

    const getCaseLabel = (tc) => {
        if (tc.type === 'sample') {
            const idx = testCases.filter(t => t.type === 'sample').findIndex(t => t.id === tc.id);
            return `Sample ${idx + 1}`;
        } else {
            const idx = testCases.filter(t => t.type === 'custom').findIndex(t => t.id === tc.id);
            return `Case ${idx + 1}`;
        }
    };

    // Drag Logic
    const handleMouseDown = (target) => (e) => {
        e.preventDefault(); 
        setIsDragging(true); 
        dragTargetRef.current = target;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startSidebarW = sidebarWidthRef.current;
        const startConsoleS = consoleSizeRef.current;

        const onMove = (e) => {
            if (dragTargetRef.current === 'sidebar') {
                const newWidth = Math.min(60, Math.max(20, startSidebarW + ((e.clientX - startX) / window.innerWidth) * 100));
                setSidebarWidth(newWidth);
            } else if (dragTargetRef.current === 'console') {
                if (layoutMode === 'classic') {
                    const newHeight = Math.min(85, Math.max(10, startConsoleS + ((startY - e.clientY) / window.innerHeight) * 100));
                    setConsoleSize(newHeight);
                } else {
                    const newWidth = Math.min(60, Math.max(20, startConsoleS + ((startX - e.clientX) / window.innerWidth) * 100));
                    setConsoleSize(newWidth);
                }
            }
        };
        const onUp = () => { 
            setIsDragging(false); 
            document.removeEventListener('mousemove', onMove); 
            document.removeEventListener('mouseup', onUp); 
        };
        document.addEventListener('mousemove', onMove); 
        document.addEventListener('mouseup', onUp);
    };

    useEffect(() => { sidebarWidthRef.current = sidebarWidth; }, [sidebarWidth]);
    useEffect(() => { consoleSizeRef.current = consoleSize; }, [consoleSize]);

    if (loadingProblem) return <div className={cn("h-screen w-full flex items-center justify-center", theme.appBg)}><Loader2 className={cn("animate-spin", theme.isDark ? "text-indigo-500" : "text-slate-900")} size={40}/></div>;

    const currentResult = executionResults ? (executionResults.find(r => r.id === selectedCaseId) || executionResults[0]) : null;

    return (
        <div className={cn("flex flex-col h-screen w-full font-sans overflow-hidden text-sm selection:bg-blue-500/30", theme.appBg, theme.textMain)}>
            
            {isDragging && <div className={cn("absolute inset-0 z-[100]", (dragTargetRef.current === 'sidebar' || (layoutMode === 'replit' && dragTargetRef.current === 'console')) ? 'cursor-col-resize' : 'cursor-row-resize')} />}
            
            {/* --- RESET MODAL --- */}
            {showResetModal && (
                <div className={cn("fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200", theme.modalOverlay)}>
                    <div className={cn("w-[400px] rounded-2xl shadow-2xl border overflow-hidden", theme.panelBg, theme.border)}>
                        <div className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                <RotateCcw size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className={cn("text-lg font-bold", theme.textHead)}>Reset Code?</h3>
                                <p className={cn("text-xs opacity-70 px-4", theme.textSec)}>This will discard your current changes.</p>
                            </div>
                        </div>
                        <div className={cn("flex border-t divide-x h-12", theme.border, theme.isDark ? "divide-white/10" : "divide-slate-200")}>
                            <button onClick={() => setShowResetModal(false)} className={cn("flex-1 text-xs font-bold hover:bg-black/5 transition-colors", theme.textSec)}>Cancel</button>
                            <button onClick={() => { setCode(STARTER_CODE[language]); setShowResetModal(false); }} className="flex-1 text-xs font-bold text-rose-500 hover:bg-rose-500/5 transition-colors">Confirm Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUBMISSION RESULT MODAL --- */}
            {showSubmitModal && submissionResult && (
                <div className={cn("fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md animate-in fade-in zoom-in-95 duration-300", theme.modalOverlay)}>
                    <div className={cn("w-full max-w-md rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col", theme.panelBg, theme.border)}>
                        <div className={cn("px-6 py-4 border-b flex items-center justify-between shrink-0", theme.border, theme.headerBg)}>
                            <h3 className={cn("font-black text-lg tracking-tight flex items-center gap-2", theme.textHead)}>
                                {submissionResult.isAuto && <Clock className="text-amber-500 mr-2" size={20} />}
                                {submissionResult.isAuto ? "Time's Up!" : "Submission Result"}
                            </h3>
                            <button onClick={() => setShowSubmitModal(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors"><X size={18}/></button>
                        </div>
                        <div className="p-12 flex flex-col items-center gap-8">
                            
                            {submissionResult.isAuto && (
                                <div className="text-center -mt-4 mb-2">
                                    <p className="text-amber-500 font-bold text-sm uppercase tracking-wide">Auto-Submitted Successfully</p>
                                </div>
                            )}

                            <div className="relative shrink-0">
                                {/* FIXED: Removed rotation to prevent cut-off */}
                                <div className={cn("w-48 h-48 rounded-full border-[8px] flex flex-col items-center justify-center shadow-xl", 
                                    submissionResult.status === "Error" ? "border-rose-500 text-rose-500 bg-rose-500/5" :
                                    submissionResult.passedCount === submissionResult.totalCases ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-amber-500 text-amber-500 bg-amber-500/5"
                                )}>
                                    {submissionResult.status === "Error" ? (
                                        <AlertTriangle size={64} />
                                    ) : (
                                        <>
                                            <span className="text-6xl font-black tracking-tighter">
                                                {submissionResult.passedCount}
                                                <span className="text-3xl opacity-60 font-bold">/{submissionResult.totalCases}</span>
                                            </span>
                                            <span className="text-sm font-bold uppercase tracking-widest mt-1 opacity-80">Passed</span>
                                        </>
                                    )}
                                </div>
                                <div className={cn("absolute -bottom-2 -right-4 px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest border-2 shadow-md",
                                     theme.panelBg,
                                     submissionResult.status === "Error" ? "border-rose-500 text-rose-500" :
                                     submissionResult.passedCount === submissionResult.totalCases ? "border-emerald-500 text-emerald-500" : "border-amber-500 text-amber-500"
                                )}>{submissionResult.status}</div>
                            </div>
                            {submissionResult.message && <p className="text-center text-sm opacity-70 px-4">{submissionResult.message}</p>}
                        </div>
                        <div className={cn("p-4 border-t bg-black/5 flex gap-3 shrink-0", theme.border)}>
                            <button onClick={() => setShowSubmitModal(false)} className={cn("flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors hover:bg-black/5", theme.textSec)}>Close</button>
                            {(submissionResult.passedCount === submissionResult.totalCases && submissionResult.status !== "Error" && !submissionResult.isAuto) && (
                                <button onClick={() => setShowSubmitModal(false)} className={cn("flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:-translate-y-0.5", theme.accentPrimary)}>Next Problem</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <header className={cn("h-16 shrink-0 border-b flex items-center justify-between px-6 z-20", theme.headerBg, theme.border)}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className={cn("p-2 rounded-lg border hover:scale-105 active:scale-95 transition-all", theme.panelBg, theme.border, theme.textSec)}><ChevronLeft size={20}/></button>
                    <div><h1 className={cn("font-bold text-base tracking-tight uppercase opacity-80", theme.textHead)}>
                        {contestData?.examName || "Contest"}
                    </h1></div>
                </div>
                
                {/* --- ENHANCED TIMER DISPLAY --- */}
                <div className={cn("absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 rounded-2xl border font-mono font-black transition-all duration-500", getTimerStyles())}>
                    <Timer size={20} className={cn(secondsRemaining < 300 && "animate-pulse")} /> 
                    <span className="text-3xl tracking-widest">{timeLeftDisplay}</span>
                </div>

                <div className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border opacity-50", theme.border)}>
                    {themeId} Mode
                </div>
            </header>

            {/* --- WORKSPACE (Maintains Previous Logic) --- */}
            <div className="flex-1 flex overflow-hidden p-1 gap-1">
                {/* ... (Rest of the Workspace Layout Remains the Same as previous successful step) ... */}
                {/* I am omitting the repetitive layout code here for brevity as it is identical to the previous improved version, just ensure you paste this Header/Logic into that file structure. */}
                {/* IF YOU NEED THE FULL FILE AGAIN WITH LAYOUT, I CAN PROVIDE IT. BUT THIS HEADER + LOGIC IS THE KEY CHANGE. */}
                
                {/* 1. LEFT PANEL: PROBLEM INFO */}
                <div style={{ width: `${sidebarWidth}%` }} className={cn("h-full flex flex-col rounded-2xl overflow-hidden border relative group", theme.panelBg, theme.border)}>
                    <div className={cn("p-6 border-b shrink-0 bg-opacity-50", theme.border)}>
                         <div className="flex items-start justify-between gap-4">
                            <h1 className={cn("text-2xl font-bold leading-tight", theme.textHead)}>{problemDetails?.problemNo}. {problemDetails?.title}</h1>
                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0", theme.isDark ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-black text-white")}>{problemDetails?.difficulty}</span>
                        </div>
                    </div>
                    <div className={cn("flex-1 overflow-y-auto p-8 custom-scrollbar", theme.scrollTrack)}>
                        <div className={cn("space-y-6 text-sm leading-7 font-medium", theme.textMain)}>
                            <p className="whitespace-pre-wrap">{problemDetails?.description}</p>
                            <div className="pt-2"><h3 className={cn("text-xs font-black uppercase tracking-widest mb-2 opacity-90", theme.textHead)}>Input Format</h3><p className="opacity-90 whitespace-pre-wrap">{problemDetails?.inputFormat}</p></div>
                            <div className="pt-2"><h3 className={cn("text-xs font-black uppercase tracking-widest mb-2 opacity-90", theme.textHead)}>Constraints</h3><ul className="list-disc pl-4 space-y-1 opacity-90">{problemDetails?.constraints?.split(',').map((c, i) => <li key={i}>{c.trim()}</li>)}</ul></div>
                        </div>
                        <div className={cn("my-10 border-t border-dashed opacity-30", theme.border)}></div>
                         <div className="space-y-6">
                             <div className={cn("flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40", theme.textHead)}><Hash size={14} /> Examples</div>
                            {testCases.filter(tc => tc.type === 'sample').map((tc, idx) => (
                                <div key={idx} className={cn("rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md", theme.panelBg, theme.border)}>
                                    <div className={cn("px-4 py-3 border-b flex justify-between items-center", theme.border, theme.isDark ? "bg-black/20" : "bg-gray-50/80")}>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Example {idx + 1}</div>
                                        <button onClick={() => handleCopy(tc.input, `in-${idx}`)} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors", copiedId === `in-${idx}` ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-black/5 opacity-50 hover:opacity-100")}>{copiedId === `in-${idx}` ? <Check size={12}/> : <Copy size={12}/>} {copiedId === `in-${idx}` ? "Copied" : "Copy Input"}</button>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-1.5"><div className="text-[10px] font-bold uppercase tracking-wider opacity-40 pl-1">Input</div><div className={cn("font-mono text-sm p-3 rounded-xl whitespace-pre overflow-x-auto", theme.isDark ? "bg-[#020617] text-slate-300 border border-slate-800" : "bg-gray-50 text-gray-700 border border-gray-200")}>{tc.input}</div></div>
                                        <div className="space-y-1.5"><div className="text-[10px] font-bold uppercase tracking-wider opacity-40 pl-1">Output</div><div className={cn("font-mono text-sm p-3 rounded-xl relative overflow-hidden whitespace-pre overflow-x-auto", theme.isDark ? "bg-[#020617] text-emerald-400 border border-emerald-900/30" : "bg-gray-50 text-emerald-700 border border-emerald-200")}><div className={cn("absolute left-0 top-0 bottom-0 w-1", theme.isDark ? "bg-emerald-500/50" : "bg-emerald-500")}></div><div className="pl-2">{tc.output}</div></div></div>
                                        {tc.explanation && (<div className={cn("mt-4 text-xs p-3 rounded-xl flex gap-3", theme.isDark ? "bg-blue-500/5 text-blue-200" : "bg-blue-50 text-blue-800")}><Info size={16} className="shrink-0 opacity-60 mt-0.5" /><div className="leading-relaxed opacity-90"><span className="font-bold opacity-70 block mb-1 text-[10px] uppercase">Explanation</span>{tc.explanation}</div></div>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-10"></div>
                    </div>
                </div>

                <div onMouseDown={handleMouseDown('sidebar')} className={cn("w-2 -ml-1 -mr-1 z-30 cursor-col-resize flex flex-col justify-center items-center group opacity-0 hover:opacity-100 transition-opacity", theme.textSec)}><div className={cn("w-1 h-8 rounded-full transition-colors", theme.isDark ? "bg-slate-600 group-hover:bg-blue-500" : "bg-gray-300 group-hover:bg-black")}></div></div>

                {/* 2. RIGHT CONTAINER */}
                <div style={{ width: `${100 - sidebarWidth}%` }} className={cn("flex h-full gap-1", layoutMode === 'classic' ? "flex-col" : "flex-row")}>
                    
                    {/* --- EDITOR PANEL --- */}
                    <div className={cn("flex-1 flex flex-col rounded-2xl overflow-hidden border shadow-sm relative", theme.panelBg, theme.border)}>
                        <div className={cn("h-14 flex items-center justify-between px-4 border-b shrink-0 relative z-20", theme.border, theme.headerBg)}>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => { setShowLangSelector(!showLangSelector); }}
                                    className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-black/5", theme.border, theme.inputBg)}
                                >
                                    <span className="text-xs font-bold">{LANGUAGES.find(l => l.id === language)?.name}</span>
                                    <ChevronDown size={12} className={cn("opacity-50 transition-transform", showLangSelector && "rotate-180")}/>
                                </button>
                                {showLangSelector && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowLangSelector(false)}></div>
                                        <div className={cn("absolute top-full left-0 mt-2 w-56 rounded-xl border shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100 overflow-hidden", theme.panelBg, theme.border)}>
                                            {LANGUAGES.map(lang => (
                                                <button 
                                                    key={lang.id} 
                                                    onClick={() => { setLanguage(lang.id); setCode(STARTER_CODE[lang.id]); setShowLangSelector(false); }} 
                                                    className={cn("w-full px-4 py-2.5 text-xs font-medium text-left flex justify-between items-center transition-colors", language === lang.id ? "bg-blue-500 text-white" : "hover:bg-black/5")}
                                                >
                                                    {lang.label}
                                                    {language === lang.id && <Check size={12}/>}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowResetModal(true)} className={cn("p-2 rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500 text-slate-500", theme.textSec)} title="Reset Code">
                                    <RotateCcw size={16} />
                                </button>
                                <div className={cn("flex items-center gap-1 p-1 rounded-lg border", theme.border, theme.inputBg)}>
                                    <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} className={cn("p-1.5 rounded-md hover:bg-black/5 transition-colors", theme.textMain)}><Minus size={12}/></button>
                                    <span className="text-[10px] font-mono w-8 text-center">{fontSize}px</span>
                                    <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} className={cn("p-1.5 rounded-md hover:bg-black/5 transition-colors", theme.textMain)}><Plus size={12}/></button>
                                </div>
                                <button onClick={() => handleLayoutChange(layoutMode === 'classic' ? 'replit' : 'classic')} className={cn("p-2 rounded-lg border hover:bg-black/5 transition-colors text-blue-500 bg-blue-500/5 border-blue-500/20", theme.panelBg)} title={`Switch Layout`}>
                                    {layoutMode === 'classic' ? <LayoutTemplate size={16} /> : <Columns size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 relative">
                            <Editor 
                                height="100%" 
                                language={language} 
                                value={code} 
                                onMount={handleEditorDidMount}
                                onChange={setCode} 
                                theme={theme.monaco} 
                                options={{ 
                                    minimap: { enabled: false }, 
                                    fontSize, 
                                    padding: { top: 20, bottom: 80 }, 
                                    fontFamily: 'JetBrains Mono, monospace', 
                                    scrollBeyondLastLine: false, 
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    cursorStyle: 'line'
                                }} 
                            />
                            <div className={cn("absolute bottom-2 left-6 z-10 text-[10px] font-mono opacity-40 pointer-events-none transition-opacity", theme.textMain)}>
                                Ln {cursorPosition.ln}, Col {cursorPosition.col}
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-8 flex items-center gap-3 z-50 pointer-events-auto">
                            <button onClick={() => executeSubmission(false)} disabled={status !== 'idle'} className={cn("h-10 px-5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0", theme.isDark ? "bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700" : "bg-white/90 border-white text-gray-800 hover:bg-white")}>
                                {status === 'running' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />} Run
                            </button>
                            <button onClick={() => executeSubmission(false)} disabled={status !== 'idle'} className={cn("h-10 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/20 backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0", theme.accentPrimary)}>
                                {(status === 'submitting' || status === 'autosubmitting') ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />} Submit
                            </button>
                        </div>
                    </div>

                    <div onMouseDown={handleMouseDown('console')} className={cn("z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group", layoutMode === 'classic' ? "h-2 w-full -mt-1 -mb-1 cursor-row-resize flex-col" : "w-2 h-full -ml-1 -mr-1 cursor-col-resize flex-col")}>
                        <div className={cn("rounded-full transition-colors", layoutMode === 'classic' ? "w-12 h-1" : "w-1 h-12", theme.isDark ? "bg-slate-600 group-hover:bg-blue-500" : "bg-gray-300 group-hover:bg-black")}></div>
                    </div>

                    {/* === CONSOLE PANEL === */}
                    <div style={layoutMode === 'classic' ? { height: `${consoleSize}%` } : { width: `${consoleSize}%` }} className={cn("flex flex-col rounded-2xl overflow-hidden border transition-all ease-linear duration-75", theme.panelBg, theme.border)}>
                        
                        {/* CLASSIC MODE HEADER (TABS) */}
                        {layoutMode === 'classic' && (
                            <div className={cn("h-10 border-b flex items-center justify-between px-2 shrink-0 select-none bg-opacity-50 z-10 overflow-hidden", theme.border, theme.headerBg)}>
                                <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient pr-4 pl-2">
                                    {testCases.map((tc, i) => {
                                        const res = executionResults && executionResults.find(r => r.id === tc.id);
                                        return (
                                            <div key={tc.id} className="relative group">
                                                <button 
                                                    onClick={() => setSelectedCaseId(tc.id)} 
                                                    className={cn("px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border flex items-center gap-2 whitespace-nowrap shrink-0 pr-6", 
                                                        selectedCaseId === tc.id ? (theme.isDark ? "bg-blue-500/10 border-blue-500/40 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700") : "border-transparent opacity-60 hover:opacity-100 hover:bg-black/5"
                                                    )}
                                                >
                                                    <span className="uppercase tracking-wider opacity-70">{getCaseLabel(tc)}</span>
                                                    {res && <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm ml-1", res.passed ? "bg-emerald-500" : "bg-rose-500")} />}
                                                </button>
                                                
                                                {/* DELETE BUTTON (CLASSIC MODE) */}
                                                {tc.type === 'custom' && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteCase(tc.id); }}
                                                        className={cn("absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 hover:text-rose-500 text-slate-400")}
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {testCases.length < 4 && (
                                        <button onClick={handleAddCase} className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors border border-dashed hover:border-solid", theme.border, theme.textSec, "hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500")}><Plus size={10} strokeWidth={3}/></button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* REPLIT MODE HEADER (NO TABS) */}
                        {layoutMode === 'replit' && (
                            <div className={cn("h-10 border-b flex items-center justify-between px-4 shrink-0 select-none bg-opacity-50 z-10", theme.border, theme.headerBg)}>
                                <span className="text-xs font-black uppercase tracking-widest opacity-70">Test Cases</span>
                                {testCases.length < 4 && (
                                    <button onClick={handleAddCase} className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-black/5", theme.textSec)}><Plus size={14}/></button>
                                )}
                            </div>
                        )}

                        {/* CONTENT AREA */}
                        <div className="flex-1 flex flex-col p-4 overflow-hidden relative min-h-0">
                            
                            {/* REPLIT VIEW: VERTICAL CARD LIST */}
                            {layoutMode === 'replit' ? (
                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pb-10">
                                    {testCases.map((tc, i) => {
                                        const res = executionResults && executionResults.find(r => r.id === tc.id);
                                        return (
                                            <div key={tc.id} className={cn("rounded-xl border overflow-hidden transition-all relative group", theme.border, theme.isDark ? "bg-white/5" : "bg-white")}>
                                                {/* Header */}
                                                <div className={cn("px-4 py-2.5 flex items-center justify-between border-b bg-opacity-50", theme.border, theme.headerBg)}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-black uppercase tracking-widest opacity-80">{getCaseLabel(tc)}</span>
                                                        {res && (
                                                            <>
                                                                <div className={cn("w-[1px] h-3 bg-current opacity-20")}></div>
                                                                <div className="flex items-center gap-2 text-[10px] font-mono opacity-60">
                                                                    <span className="flex items-center gap-1"><Zap size={10}/> {res.time}</span>
                                                                    <span className="flex items-center gap-1"><Cpu size={10}/> {res.memory}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {res ? (
                                                            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border", 
                                                                res.passed ? theme.successBadge : theme.errorBadge
                                                            )}>
                                                                {res.passed ? <Check size={10} strokeWidth={3}/> : <X size={10} strokeWidth={3}/>}
                                                                {res.passed ? "Passed" : "Failed"}
                                                            </div>
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-current opacity-20"></div>
                                                        )}
                                                        {/* DELETE BUTTON (REPLIT MODE) */}
                                                        {tc.type === 'custom' && (
                                                            <button 
                                                                onClick={() => handleDeleteCase(tc.id)} 
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-rose-500/20 hover:text-rose-500 rounded-md text-slate-400"
                                                                title="Delete Case"
                                                            >
                                                                <Trash2 size={12}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2 opacity-50"><CornerDownRight size={12}/><span className="text-[10px] font-bold uppercase tracking-widest">Input</span></div>
                                                        <div className={cn("rounded-lg p-3 border transition-colors focus-within:ring-2 focus-within:ring-blue-500/20", theme.border, theme.inputBg)}>
                                                            <textarea 
                                                                ref={el => textareaRefs.current[tc.id] = el}
                                                                value={tc.input} 
                                                                onChange={e => { const val = e.target.value; setTestCases(prev => prev.map(t => t.id === tc.id ? {...t, input: val} : t)); adjustTextareaHeight(tc.id); }}
                                                                rows={1}
                                                                className={cn("w-full bg-transparent outline-none font-mono text-xs resize-none placeholder:opacity-20 block leading-relaxed whitespace-pre overflow-x-auto", theme.textMain)}
                                                                placeholder="Enter test case input..."
                                                                spellCheck={false}
                                                                style={{ minHeight: '20px', overflow: 'hidden' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {res && (
                                                        <div className="space-y-4">
                                                            {(res.stderr || (!res.passed && res.status !== 'Wrong Answer')) ? (
                                                                <div className={cn("rounded-xl border overflow-hidden shadow-sm transition-all border-rose-500/30 shadow-rose-900/10")}>
                                                                    <div className={cn("px-3 py-2 flex items-center justify-between", theme.isDark ? "bg-rose-950/30" : "bg-rose-50")}><div className="flex items-center gap-2"><AlertOctagon size={12} className="text-rose-500"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70 text-rose-500">Error Log</span></div></div>
                                                                    <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar text-rose-500", theme.isDark ? "bg-[#0B1221]" : "bg-white")}>
                                                                        <pre className="whitespace-pre">{res.stderr || res.compileOutput || "Unknown Error"}</pre>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2 opacity-50"><Terminal size={12}/><span className="text-[10px] font-bold uppercase tracking-widest">Your Output</span></div>
                                                                        <div className={cn("font-mono text-xs p-3 rounded-lg border break-all whitespace-pre overflow-x-auto", theme.border, res.passed ? (theme.isDark ? "text-emerald-400 bg-emerald-500/5" : "text-emerald-700 bg-emerald-50") : (theme.isDark ? "text-rose-400 bg-rose-500/5" : "text-rose-700 bg-rose-50"))}>{res.actualOutput}</div>
                                                                    </div>
                                                                    {/* Only show Expected Output if it's a sample case or custom case with output defined */}
                                                                    {(tc.type === 'sample' || tc.output) && (
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-2 opacity-50"><Box size={12}/><span className="text-[10px] font-bold uppercase tracking-widest">Expected Output</span></div>
                                                                            <div className={cn("font-mono text-xs p-3 rounded-lg border break-all opacity-70 whitespace-pre overflow-x-auto", theme.border, theme.isDark ? "bg-white/5" : "bg-gray-100")}>{res.expectedOutput || tc.output}</div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* CLASSIC VIEW: SINGLE ACTIVE CASE */
                                currentResult ? (
                                    <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                                        <div className="flex items-center justify-between shrink-0 bg-opacity-50 p-1">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm border", currentResult.passed ? theme.successBadge : theme.errorBadge)}>
                                                    {currentResult.passed ? <Check size={14} strokeWidth={3}/> : <X size={14} strokeWidth={3}/>} {currentResult.status}
                                                </div>
                                                <div className="h-4 w-[1px] bg-current opacity-10"></div>
                                                <div className="flex gap-2">
                                                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono", theme.border, theme.isDark ? "bg-slate-800/50" : "bg-slate-100")}><Zap size={10} className="text-amber-500"/><span className="font-bold">{currentResult.time}</span></div>
                                                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono", theme.border, theme.isDark ? "bg-slate-800/50" : "bg-slate-100")}><Cpu size={10} className="text-blue-500"/><span className="font-bold">{currentResult.memory}</span></div>
                                                </div>
                                            </div>
                                            <button onClick={clearResults} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border shadow-sm", theme.panelBg, theme.border, "hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-blue-500")}><Edit3 size={12}/> Edit Input</button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                                            <div className="flex flex-col gap-4">
                                                <div className={cn("rounded-xl border overflow-hidden shadow-sm", theme.border)}>
                                                    <div className={cn("px-3 py-2 flex items-center gap-2", theme.codeHeader)}><CornerDownRight size={12} className="opacity-50"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70">Input</span></div>
                                                    <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre overflow-x-auto", theme.codeBlock, theme.textMain)}>{currentResult.input}</div>
                                                </div>
                                                
                                                {(currentResult.stderr || (!currentResult.passed && currentResult.status !== 'Wrong Answer')) ? (
                                                    <div className={cn("rounded-xl border overflow-hidden shadow-sm transition-all border-rose-500/30 shadow-rose-900/10")}>
                                                        <div className={cn("px-3 py-2 flex items-center justify-between", theme.isDark ? "bg-rose-950/30" : "bg-rose-50")}><div className="flex items-center gap-2"><AlertOctagon size={12} className="text-rose-500"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70 text-rose-500">Error Log</span></div></div>
                                                        <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar text-rose-500", theme.isDark ? "bg-[#0B1221]" : "bg-white")}>
                                                            <pre className="whitespace-pre">{currentResult.stderr || currentResult.compileOutput || "Unknown Error"}</pre>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className={cn("rounded-xl border overflow-hidden shadow-sm transition-all", currentResult.passed ? (theme.isDark ? "border-emerald-500/30 shadow-emerald-900/10" : "border-emerald-200 shadow-emerald-100") : (theme.isDark ? "border-rose-500/30 shadow-rose-900/10" : "border-rose-200 shadow-rose-100"))}>
                                                            <div className={cn("px-3 py-2 flex items-center justify-between", theme.isDark ? "bg-black/20" : "bg-gray-50")}><div className="flex items-center gap-2"><Terminal size={12} className={currentResult.passed ? "text-emerald-500" : "text-rose-500"}/><span className={cn("text-[10px] font-black uppercase tracking-widest opacity-70", currentResult.passed ? "text-emerald-500" : "text-rose-500")}>Your Output</span></div></div>
                                                            <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre overflow-x-auto", theme.isDark ? "bg-[#0B1221]" : "bg-white")}>{currentResult.actualOutput}</div>
                                                        </div>
                                                        {/* Only show Expected Output if it's a sample or has been defined */}
                                                        {(testCases.find(t => t.id === selectedCaseId)?.type === 'sample' || currentResult.expectedOutput) && (
                                                            <div className={cn("rounded-xl border overflow-hidden shadow-sm", theme.border)}>
                                                                <div className={cn("px-3 py-2 flex items-center gap-2", theme.codeHeader)}><Box size={12} className="opacity-50"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70">Expected Output</span></div>
                                                                <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre overflow-x-auto", theme.codeBlock, theme.textSec)}>{currentResult.expectedOutput}</div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200 pt-2">
                                        <div className="flex justify-between items-end mb-2 shrink-0 px-1"><span className={cn("text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2", theme.textHead)}><Edit3 size={12}/> Custom Input</span></div>
                                        <div className={cn("w-full relative group transition-all rounded-xl border overflow-hidden p-1 focus-within:ring-4 focus-within:ring-blue-500/10 shadow-inner overflow-y-auto custom-scrollbar", theme.inputBg, theme.border)}>
                                            <textarea ref={textareaRef} value={testCases.find(t => t.id === selectedCaseId)?.input || ""} onChange={e => { const val = e.target.value; setTestCases(prev => prev.map(t => t.id === selectedCaseId ? {...t, input: val} : t)); adjustTextareaHeight(); }} rows={1} className={cn("w-full bg-transparent outline-none p-4 font-mono text-xs resize-none placeholder:opacity-20 block whitespace-pre overflow-x-auto", theme.textMain)} placeholder="Enter your test case input here..." spellCheck={false} style={{ minHeight: '40px', overflow: 'hidden' }} />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 99px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .mask-gradient { -webkit-mask-image: linear-gradient(to right, black 95%, transparent 100%); mask-image: linear-gradient(to right, black 95%, transparent 100%); }
            `}</style>
        </div>
    );
};

export default ProblemSolverPage;