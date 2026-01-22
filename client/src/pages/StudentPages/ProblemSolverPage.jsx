import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
    ChevronLeft, Timer, ChevronDown, RotateCcw, Play, Loader2, Rocket,
    Check, X, Edit3, ShieldAlert, Maximize,
    Plus, Terminal, Cpu, Zap, CornerDownRight, Box, 
    LayoutTemplate, Columns, Minus, AlertOctagon, 
    Award, Info, Hash 
} from 'lucide-react';

// ⚠️ MAKE SURE THIS PATH IS CORRECT FOR YOUR PROJECT
import api from '../../api/axiosConfig'; 

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- CONSTANTS ---
const LANGUAGE_MAP = { 'cpp': 54, 'java': 62, 'python': 71 };
const LANGUAGES = [
    { id: 'cpp', name: 'C++', label: 'C++ (GCC 9.2)' },
    { id: 'java', name: 'Java', label: 'Java (OpenJDK 13)' },
    { id: 'python', name: 'Python', label: 'Python (3.8.1)' },
];
const STARTER_CODE = {
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // code here\n    return 0;\n}`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // code here\n    }\n}`,
    python: `import sys\n\n# Read all input from stdin\n# Use split() if you need tokens, or splitlines() for lines\ninput_data = sys.stdin.read().split()\n\n# Your logic here\n# n = int(input_data[0])\n# ...\n`,
};

// --- THEME DEFINITIONS ---
const THEMES = {
    light: {
        id: 'light',
        isDark: false,
        appBg: "bg-[#F1F5F9]", 
        panelBg: "bg-white",
        headerBg: "bg-white/90 backdrop-blur-xl border-b border-slate-200",
        textMain: "text-slate-600",
        textHead: "text-slate-900",
        textSec: "text-slate-400",
        border: "border-slate-200", 
        inputBg: "bg-slate-50",
        inputBoxHighContrast: "bg-[#1e293b] text-white border-slate-300 placeholder:text-slate-500",
        codeBlock: "bg-slate-100 border-slate-200 text-slate-800 shadow-sm", 
        codeHeader: "bg-[#F8FAFC] border-b border-slate-200",
        accentPrimary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-300",
        monaco: "light",
        scrollTrack: "bg-slate-200",
        modalOverlay: "bg-slate-900/10",
        successBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        errorBadge: "bg-rose-50 text-rose-700 border-rose-200",
        selectedLayout: "ring-2 ring-slate-900 bg-slate-50"
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
        inputBoxHighContrast: "bg-[#1e293b] text-slate-100 border-slate-700 placeholder:text-slate-500",
        codeBlock: "bg-[#020617] border-white/5 text-slate-200", 
        codeHeader: "bg-[#1e293b]/50 border-b border-white/5", 
        accentPrimary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/30", 
        monaco: "vs-dark", 
        scrollTrack: "bg-slate-800/20", 
        modalOverlay: "bg-[#020617]/80", 
        successBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", 
        errorBadge: "bg-rose-500/10 text-rose-400 border-rose-500/20", 
        selectedLayout: "ring-2 ring-indigo-500 bg-white/5" 
    },
    dark: { 
        id: 'dark', 
        isDark: true, 
        appBg: "bg-[#000000]", 
        panelBg: "bg-[#121212]", 
        headerBg: "bg-[#121212]/80 backdrop-blur-xl border border-neutral-800", 
        textMain: "text-neutral-400", 
        textHead: "text-neutral-200", 
        textSec: "text-neutral-500", 
        border: "border-neutral-800", 
        inputBg: "bg-[#000000]", 
        inputBoxHighContrast: "bg-[#1A1A1A] text-neutral-200 border-neutral-700 placeholder:text-neutral-600",
        codeBlock: "bg-[#0a0a0a] border-neutral-800 text-neutral-300", 
        codeHeader: "bg-[#121212] border-b border-neutral-800", 
        accentPrimary: "bg-neutral-100 text-black hover:bg-neutral-300", 
        monaco: "vs-dark", 
        scrollTrack: "bg-neutral-900", 
        modalOverlay: "bg-black/90", 
        successBadge: "bg-emerald-900/20 text-emerald-500 border-emerald-900/30", 
        errorBadge: "bg-rose-900/20 text-rose-500 border-rose-900/30", 
        selectedLayout: "ring-2 ring-neutral-500 bg-neutral-900" 
    }
};

// --- DIFFICULTY COLOR HELPER ---
const getDifficultyColor = (difficulty, themeId) => {
    const diff = (difficulty || 'Medium').toLowerCase();
    if (themeId === 'light') {
        if (diff === 'easy') return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (diff === 'medium') return "bg-amber-100 text-amber-700 border-amber-200";
        if (diff === 'hard') return "bg-rose-100 text-rose-700 border-rose-200";
    } else if (themeId === 'midnight') {
        if (diff === 'easy') return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (diff === 'medium') return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (diff === 'hard') return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    } else { // Dark
        if (diff === 'easy') return "bg-emerald-900/20 text-emerald-500 border-emerald-900/30";
        if (diff === 'medium') return "bg-amber-900/20 text-amber-500 border-amber-900/30";
        if (diff === 'hard') return "bg-rose-900/20 text-rose-500 border-rose-900/30";
    }
    return "bg-slate-100 text-slate-700";
};

const ProblemSolverPage = () => {
    const { contestId, problemId } = useParams(); 
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve State
    const { contestData, theme: stateTheme } = location.state || {};
    
    // Theme Logic
    const [themeId, setThemeId] = useState(() => (stateTheme && THEMES[stateTheme]) ? stateTheme : (localStorage.getItem('app-theme') || 'light'));
    const theme = THEMES[themeId] || THEMES['light'];
    useEffect(() => { localStorage.setItem('app-theme', themeId); }, [themeId]);

    // Layout State
    const [layoutMode, setLayoutMode] = useState('default'); 
    const [showLayoutModal, setShowLayoutModal] = useState(false);
    const [showLangSelector, setShowLangSelector] = useState(false);
    
    // Sizing
    const [sidebarWidth, setSidebarWidth] = useState(50); 
    const [consoleSize, setConsoleSize] = useState(30); 
    
    const [isDragging, setIsDragging] = useState(false); 
    
    // ⚡️ SECURITY LOCK: Initialize based on current fullscreen state
    const [isLocked, setIsLocked] = useState(() => !document.fullscreenElement);

    // Data
    const [problemDetails, setProblemDetails] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);

    // Editor
    const [language, setLanguage] = useState('python'); 
    const [codeMap, setCodeMap] = useState({ cpp: STARTER_CODE.cpp, java: STARTER_CODE.java, python: STARTER_CODE.python });
    const [fontSize, setFontSize] = useState(14);
    const [status, setStatus] = useState('idle');
    const [timeLeftDisplay, setTimeLeftDisplay] = useState('00:00:00');
    const [cursorPosition, setCursorPosition] = useState({ ln: 1, col: 1 });
      
    // Timer & Refs
    const [secondsRemaining, setSecondsRemaining] = useState(null);
    const isAutoSubmitting = useRef(false);
    const codeRef = useRef(codeMap[language]);
    const languageRef = useRef(language);

    // Results & Cases
    const [executionResults, setExecutionResults] = useState(null); 
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [testCases, setTestCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState(1);

    // Refs
    const sidebarWidthRef = useRef(sidebarWidth);
    const consoleSizeRef = useRef(consoleSize);
    const dragTargetRef = useRef(null); 
    const textareaRef = useRef(null); 
    const textareaRefs = useRef({}); 
    const editorRef = useRef(null);

    // --- DISABLE INSPECT & CONTEXT MENU ---
    useEffect(() => {
        const handleContextMenu = (e) => { e.preventDefault(); };
        const handleKeyDown = (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) || (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
                e.preventDefault();
            }
        };
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // --- LAYOUT SWITCH HANDLER ---
    const handleLayoutSwitch = (mode) => {
        setLayoutMode(mode);
        setShowLayoutModal(false);
        if (mode === 'default') {
            setSidebarWidth(50);
            setConsoleSize(30);
        } else {
            setSidebarWidth(33.33);
            setConsoleSize(50);
        }
    };

    const handleCodeChange = (newCode) => {
        codeRef.current = newCode;
        setCodeMap(prev => ({ ...prev, [language]: newCode }));
    };
    useEffect(() => { languageRef.current = language; }, [language]);

    // --- FULL SCREEN & LOCK LOGIC ---
    const enterFullScreen = async () => {
        const elem = document.documentElement;
        try { if (elem.requestFullscreen) { await elem.requestFullscreen(); setIsLocked(false); } } catch (err) { console.error(err); }
    };
    
    useEffect(() => {
        const handleChange = () => { 
            if (!document.fullscreenElement) setIsLocked(true); 
            else setIsLocked(false); 
        };
        const handleVis = () => { 
            if (document.hidden) setIsLocked(true); 
        };
        
        // Initial check
        if(document.fullscreenElement) setIsLocked(false);

        document.addEventListener('fullscreenchange', handleChange);
        document.addEventListener('visibilitychange', handleVis);
        return () => { document.removeEventListener('fullscreenchange', handleChange); document.removeEventListener('visibilitychange', handleVis); };
    }, []);

    // --- MONACO ---
    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => setCursorPosition({ ln: e.position.lineNumber, col: e.position.column }));
        editor.onKeyDown((e) => { if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyV' || e.code === 'KeyC' || e.code === 'KeyX')) { e.preventDefault(); e.stopPropagation(); } });
        const container = editor.getContainerDomNode();
        container.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); });
        container.addEventListener('paste', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
        container.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
    };

    // --- SUBMISSION ---
    const executeSubmission = async (isAuto = false) => {
        if (status === 'submitting' || status === 'autosubmitting') return;
        setStatus(isAuto ? 'autosubmitting' : 'submitting');
        
        try {
            const submitResponse = await api.post('/api/student/submit-problem', {
                examId: contestId, 
                problemId: problemId, 
                languageId: LANGUAGE_MAP[languageRef.current], 
                code: codeRef.current 
            });
            const submitJson = submitResponse.data;

            if (isAuto) {
                const finalResponse = await api.post('/api/student/final-submit', { examId: contestId });
                if (finalResponse.data.success) {
                    setSubmissionResult({ 
                        status: "Time's Up", 
                        passedCount: submitJson.passedCount || 0, 
                        totalCases: submitJson.totalPrivateCases || 0, 
                        marksEarned: submitJson.marksEarned || 0, 
                        totalMarks: submitJson.totalMarks || 10, 
                        message: "Exam auto-submitted successfully.", 
                        isAuto: true 
                    });
                    setShowSubmitModal(true);
                    setTimeout(() => navigate(`/contests/result`, {
                        state: { resultData: finalResponse.data.data, theme: themeId }
                    }), 3000); 
                }
            } else {
                const passed = submitJson.passedCount || 0;
                const total = submitJson.totalPrivateCases || 0;
                let message = submitJson.message;
                
                if (!message) {
                    if (passed === total && total > 0) message = "Perfect! All test cases passed.";
                    else if (passed > 0) message = "Good effort! Some test cases passed.";
                    else message = "All test cases failed. Try again.";
                }

                setSubmissionResult({ 
                    status: submitJson.success ? submitJson.status : "Error", 
                    passedCount: passed, 
                    totalCases: total, 
                    marksEarned: submitJson.marksEarned || 0, 
                    message: message, 
                    isAuto: false 
                });
                setShowSubmitModal(true);
            }
        } catch (err) {
            if(!isAuto) { setSubmissionResult({ status: "Network Error", message: "Please check your connection" }); setShowSubmitModal(true); }
        } finally { setStatus('idle'); }
    };

    // --- TIMER ---
    useEffect(() => {
        if (!contestData?.endTime) return;
        const updateTimer = () => {
            const end = new Date(contestData.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;
            if (distance <= 0) {
                setTimeLeftDisplay("00:00:00"); setSecondsRemaining(0);
                if (!isAutoSubmitting.current) { isAutoSubmitting.current = true; executeSubmission(true); }
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

    const getTimerStyles = () => {
        if (secondsRemaining === null) return cn("bg-transparent border-transparent", theme.textMain);
        if (secondsRemaining < 60) return "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse shadow-sm";
        if (secondsRemaining < 300) return "bg-amber-500/10 text-amber-500 border-amber-500/30";
        return cn(theme.inputBg, theme.border, theme.textSec);
    };

    // --- FETCH DATA ---
    const normalizeProblemData = (data) => ({
        problemNo: data.problemNo || "?",
        title: data.title || "Problem",
        description: data.description || "No description.",
        inputFormat: data.inputFormat || "Not specified.",
        outputFormat: data.outputFormat || "Not specified.",
        constraints: data.constraints || "",
        difficulty: data.difficulty || "Medium",
        lastCode: data.lastCode,
        publicTestCases: data.publicTestCases || []
    });

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoadingProblem(true);
                const response = await api.get(`/api/student/get-problem-details/${problemId}`);
                const data = response.data.data || response.data;
                if (data) {
                    const normalized = normalizeProblemData(data);
                    setProblemDetails(normalized);
                    
                    const formattedCases = normalized.publicTestCases.map((tc, i) => ({
                        id: i + 1, type: 'sample', input: tc.input, output: tc.output, explanation: tc.explanation
                    }));
                    setTestCases(formattedCases);
                    if (formattedCases.length > 0) setSelectedCaseId(1);
                    if (data.lastCode) setCodeMap(prev => ({ ...prev, [language]: data.lastCode }));
                }
            } catch (err) { console.error("Error fetching problem:", err); } 
            finally { setLoadingProblem(false); }
        };
        if (problemId) fetchProblem();
    }, [problemId]); 

    // --- RUN CODE ---
    const handleRun = async () => {
        setStatus('running'); setExecutionResults(null);
        const customTestCasesPayload = testCases.filter(tc => tc.type === 'custom').map(tc => ({ 
            input: String(tc.input), 
            output: tc.output || "" 
        }));

        try {
            const response = await api.post('/api/student/run', {
                examId: contestId, problemId: problemId, languageId: LANGUAGE_MAP[language],
                code: codeMap[language], customTestCases: customTestCasesPayload 
            });
            const json = response.data;
            if (json.success && json.results) {
                const results = json.results.map((res, index) => {
                    const originalCase = testCases[index];
                    if (!originalCase) return null;
                    return {
                        id: originalCase.id,
                        status: res.status, passed: res.passed, input: res.input,
                        expectedOutput: res.expectedOutput, actualOutput: res.actualOutput,
                        stderr: res.stderr, compileOutput: res.compile_output, 
                        time: `${res.time}s`, memory: `${Math.round(res.memory / 1024)}MB` 
                    };
                }).filter(Boolean);
                setExecutionResults(results);
            }
        } catch (err) { console.error("Run error:", err); } 
        finally { setStatus('idle'); }
    };

    // --- HELPERS ---
    const handleAddCase = () => {
        if (testCases.length < 3) { 
            const maxId = testCases.length > 0 ? Math.max(...testCases.map(t => t.id)) : 0;
            setTestCases([...testCases, { id: maxId + 1, input: "", type: 'custom' }]);
            setSelectedCaseId(maxId + 1);
            setExecutionResults(null); 
        }
    };

    const handleDeleteCase = (id) => {
        if (testCases.find(t => t.id === id)?.type === 'sample') return; 
        const newCases = testCases.filter(t => t.id !== id);
        setTestCases(newCases);
        if (selectedCaseId === id && newCases.length > 0) setSelectedCaseId(newCases[0].id);
    };

    const getCaseLabel = (tc) => `Case ${tc.id}`;

    // --- RESIZE LOGIC ---
    const adjustTextareaHeight = (id = null) => {
        let target = null;
        if (id !== null && textareaRefs.current[id]) target = textareaRefs.current[id];
        else if (textareaRef.current) target = textareaRef.current;
        if (target) { target.style.height = 'auto'; target.style.height = `${target.scrollHeight}px`; }
    };

    useEffect(() => {
        if (layoutMode === 'default') adjustTextareaHeight();
        else testCases.forEach(tc => adjustTextareaHeight(tc.id));
    }, [testCases, selectedCaseId, layoutMode]);

    const handleMouseDown = (target) => (e) => {
        e.preventDefault(); setIsDragging(true); dragTargetRef.current = target;
        const startX = e.clientX; const startY = e.clientY;
        const startSidebarW = sidebarWidthRef.current; const startConsoleS = consoleSizeRef.current;
        const onMove = (e) => {
            if (dragTargetRef.current === 'sidebar') {
                setSidebarWidth(Math.min(60, Math.max(20, startSidebarW + ((e.clientX - startX) / window.innerWidth) * 100)));
            } else if (dragTargetRef.current === 'console') {
                if (layoutMode === 'default') setConsoleSize(Math.min(85, Math.max(10, startConsoleS + ((startY - e.clientY) / window.innerHeight) * 100)));
                else setConsoleSize(Math.min(60, Math.max(20, startConsoleS + ((startX - e.clientX) / window.innerWidth) * 100)));
            }
        };
        const onUp = () => { setIsDragging(false); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    };

    useEffect(() => { sidebarWidthRef.current = sidebarWidth; }, [sidebarWidth]);
    useEffect(() => { consoleSizeRef.current = consoleSize; }, [consoleSize]);

    if (loadingProblem) return <div className={cn("h-screen w-full flex items-center justify-center", theme.appBg)}><Loader2 className={cn("animate-spin", theme.isDark ? "text-indigo-500" : "text-slate-900")} size={40}/></div>;

    const currentResult = executionResults ? (executionResults.find(r => r.id === selectedCaseId) || executionResults[0]) : null;
    const currentCase = testCases.find(t => t.id === selectedCaseId);

    // --- RENDER HELPERS ---
    const isPassed = submissionResult?.passedCount === submissionResult?.totalCases;

    return (
        <div className={cn("flex flex-col h-screen w-full font-sans overflow-hidden text-sm selection:bg-blue-500/30 relative", theme.appBg, theme.textMain)}>
            
            {/* 🛡️ SECURITY LOCKOUT MODAL 🛡️ */}
            {isLocked && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl backdrop-saturate-150 animate-in fade-in duration-300">
                    <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-slate-200 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-pulse"><ShieldAlert size={32} /></div>
                        <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Lockout</h2><p className="text-slate-500 mt-2 font-medium">Session locked. Resume to continue.</p></div>
                        <button onClick={enterFullScreen} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"><Maximize size={18} /> Resume Session</button>
                    </div>
                </div>
            )}

            {isDragging && <div className={cn("absolute inset-0 z-[100]", (dragTargetRef.current === 'sidebar' || (layoutMode === 'split' && dragTargetRef.current === 'console')) ? 'cursor-col-resize' : 'cursor-row-resize')} />}
            
            {/* --- LAYOUT SETTINGS MODAL --- */}
            {showLayoutModal && (
                <div className={cn("fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200", theme.modalOverlay)}>
                    <div className="fixed inset-0" onClick={() => setShowLayoutModal(false)}></div>
                    <div className={cn("w-[500px] rounded-2xl shadow-2xl border overflow-hidden relative z-10", theme.panelBg, theme.border)}>
                        <div className={cn("px-6 py-4 border-b flex justify-between items-center", theme.border)}>
                            <h3 className={cn("font-bold text-lg", theme.textHead)}>Editor Layout</h3>
                            <button onClick={() => setShowLayoutModal(false)} className="hover:opacity-70"><X size={18}/></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <button onClick={() => handleLayoutSwitch('default')} className={cn("p-4 rounded-xl border-2 transition-all text-left group", layoutMode === 'default' ? theme.selectedLayout : "border-transparent hover:bg-black/5")}>
                                <div className="aspect-video bg-slate-200 rounded-lg mb-3 border-2 border-slate-300 relative overflow-hidden flex p-1 gap-1">
                                    <div className="h-full w-1/2 bg-slate-400/50 rounded-sm"></div>
                                    <div className="h-full w-1/2 flex flex-col gap-1">
                                        <div className="h-2/3 bg-slate-400/50 rounded-sm"></div>
                                        <div className="h-1/3 bg-slate-400/30 rounded-sm"></div>
                                    </div>
                                </div>
                                <div className="font-bold text-sm">Default</div>
                                <div className="text-xs opacity-60">Balanced Reading</div>
                            </button>
                            <button onClick={() => handleLayoutSwitch('split')} className={cn("p-4 rounded-xl border-2 transition-all text-left group", layoutMode === 'split' ? theme.selectedLayout : "border-transparent hover:bg-black/5")}>
                                <div className="aspect-video bg-slate-200 rounded-lg mb-3 border-2 border-slate-300 relative overflow-hidden flex p-1 gap-1">
                                    <div className="h-full w-1/3 bg-slate-400/50 rounded-sm"></div>
                                    <div className="h-full w-2/3 flex gap-1">
                                        <div className="h-full w-1/2 bg-slate-400/50 rounded-sm"></div>
                                        <div className="h-full w-1/2 bg-slate-400/30 rounded-sm"></div>
                                    </div>
                                </div>
                                <div className="font-bold text-sm">Side-by-Side</div>
                                <div className="text-xs opacity-60">3-Column Layout</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- RESET MODAL --- */}
            {showResetModal && (
                <div className={cn("fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200", theme.modalOverlay)}>
                    <div className={cn("w-[400px] rounded-2xl shadow-2xl border overflow-hidden", theme.panelBg, theme.border)}>
                        <div className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center"><RotateCcw size={24} /></div>
                            <div className="space-y-1"><h3 className={cn("text-lg font-bold", theme.textHead)}>Reset Code?</h3><p className={cn("text-xs opacity-70 px-4", theme.textSec)}>This will discard your current changes.</p></div>
                        </div>
                        <div className={cn("flex border-t divide-x h-12", theme.border, theme.isDark ? "divide-white/10" : "divide-slate-200")}>
                            <button onClick={() => setShowResetModal(false)} className={cn("flex-1 text-xs font-bold hover:bg-black/5 transition-colors", theme.textSec)}>Cancel</button>
                            <button onClick={() => { handleCodeChange(STARTER_CODE[language]); setShowResetModal(false); }} className="flex-1 text-xs font-bold text-rose-500 hover:bg-rose-500/5 transition-colors">Confirm Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ⚡️ SUBMISSION RESULT MODAL (With Red/Green Boxes) --- */}
            {showSubmitModal && submissionResult && (
                <div className={cn("fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md animate-in fade-in zoom-in-95 duration-300", theme.modalOverlay)}>
                    <div className={cn("w-full max-w-md rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col", theme.panelBg, theme.border)}>
                        
                        {/* Header */}
                        <div className={cn("px-6 py-4 border-b flex items-center justify-between shrink-0 bg-opacity-50", theme.border, theme.headerBg)}>
                            <h3 className={cn("font-black text-lg tracking-tight flex items-center gap-2", theme.textHead)}>
                                <Award size={20} className={isPassed ? "text-emerald-500" : "text-amber-500"} />
                                {submissionResult.isAuto ? "Auto Submitted" : "Submission Result"}
                            </h3>
                            <button onClick={() => setShowSubmitModal(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors"><X size={18}/></button>
                        </div>

                        {/* Body - Test Case Grid */}
                        <div className="p-8 flex flex-col items-center justify-center gap-6">
                            
                            <div className="text-center space-y-1">
                                <h4 className={cn("text-2xl font-black tracking-tight", isPassed ? "text-emerald-500" : "text-amber-500")}>
                                    {isPassed ? "Excellent Work!" : "Some Tests Failed"}
                                </h4>
                                <p className={cn("text-sm opacity-60", theme.textMain)}>
                                    {submissionResult.message}
                                </p>
                            </div>

                            {/* ⚡️ TEST CASE BOXES GRID */}
                            <div className="flex flex-wrap items-center justify-center gap-2 max-w-[300px]">
                                {Array.from({ length: submissionResult.totalCases }).map((_, index) => {
                                    // Visual logic: First 'passedCount' are green, rest are red
                                    const isCasePassed = index < submissionResult.passedCount;
                                    return (
                                        <div 
                                            key={index} 
                                            className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all hover:scale-110 cursor-default",
                                                isCasePassed 
                                                    ? "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 shadow-md" 
                                                    : "bg-rose-500 border-rose-600 text-white shadow-rose-200 shadow-md"
                                            )}
                                            title={isCasePassed ? "Passed" : "Failed"}
                                        >
                                            {isCasePassed ? <Check size={20} strokeWidth={3}/> : <X size={20} strokeWidth={3}/>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={cn("px-4 py-2 rounded-full border text-xs font-mono font-bold uppercase tracking-widest", theme.border, theme.inputBg)}>
                                Score: {submissionResult.marksEarned} / {submissionResult.totalMarks || 10}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className={cn("p-4 border-t bg-black/5 flex gap-3 shrink-0", theme.border)}>
                            <button onClick={() => setShowSubmitModal(false)} className={cn("flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors hover:bg-black/5", theme.textSec)}>
                                Keep Coding
                            </button>
                            {(isPassed && !submissionResult.isAuto) && (
                                <button 
                                    onClick={() => navigate(`/contests/${contestId}/live`, { state: { contestData, theme: themeId } })} 
                                    className={cn("flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:-translate-y-0.5", theme.accentPrimary)}
                                >
                                    Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <header className={cn("shrink-0 z-20 px-2 pt-2 relative", theme.appBg)}>
                <div className={cn("h-16 rounded-2xl flex items-center justify-between px-6 border shadow-sm backdrop-blur-xl transition-all", theme.headerBg, theme.border)}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(`/contests/${contestId}/live`, { state: { contestData: contestData, theme: themeId } })} 
                            className={cn("p-2 rounded-lg border hover:scale-105 active:scale-95 transition-all", theme.panelBg, theme.border, theme.textSec)}
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        <div><h1 className={cn("font-bold text-base tracking-tight uppercase opacity-80", theme.textHead)}>{contestData?.examName || "Contest"}</h1></div>
                    </div>
                    <div className={cn("absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold transition-all duration-500 text-sm", getTimerStyles())}>
                        <Timer size={14} className={cn(secondsRemaining < 300 && "animate-pulse")} /> <span className="tracking-wider">{timeLeftDisplay}</span>
                    </div>
                    <div className="w-8"></div> 
                </div>
            </header>

            {/* --- WORKSPACE --- */}
            <div className="flex-1 flex overflow-hidden p-2 gap-2">
                {/* 1. LEFT PANEL */}
                <div style={{ width: `${sidebarWidth}%` }} className={cn("h-full flex flex-col rounded-2xl overflow-hidden border relative group shadow-sm", theme.panelBg, theme.border)}>
                    <div className={cn("p-6 border-b shrink-0 bg-opacity-50", theme.border)}>
                         <div className="flex items-start justify-between gap-4">
                            <h1 className={cn("text-2xl font-bold leading-tight", theme.textHead)}>{problemDetails?.problemNo || "?"}. {problemDetails?.title || "Problem Title"}</h1>
                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0", getDifficultyColor(problemDetails?.difficulty, themeId))}>{problemDetails?.difficulty || "Medium"}</span>
                        </div>
                    </div>
                    <div className={cn("flex-1 overflow-y-auto p-8 custom-scrollbar", theme.scrollTrack)}>
                        {problemDetails ? (
                            <div className={cn("space-y-6 text-sm leading-7 font-medium", theme.textMain)}>
                                <p className="whitespace-pre-wrap">{problemDetails.description}</p>
                                
                                <div className="pt-2"><h3 className={cn("text-xs font-black uppercase tracking-widest mb-2 opacity-90", theme.textHead)}>Input Format</h3><p className="opacity-90 whitespace-pre-wrap">{problemDetails.inputFormat}</p></div>
                                <div className="pt-2"><h3 className={cn("text-xs font-black uppercase tracking-widest mb-2 opacity-90", theme.textHead)}>Output Format</h3><p className="opacity-90 whitespace-pre-wrap">{problemDetails.outputFormat}</p></div>

                                <div>
                                    <h3 className={cn("text-xs font-black uppercase tracking-widest mb-4 opacity-90 flex items-center gap-2", theme.textHead)}><Hash size={14}/> Examples</h3>
                                    <div className="space-y-4">
                                        {testCases.filter(tc => tc.type === 'sample').map((tc, idx) => (
                                            <div key={idx} className={cn("rounded-xl border overflow-hidden", theme.border, theme.inputBg)}>
                                                <div className={cn("px-4 py-2 border-b text-[10px] font-bold uppercase tracking-widest opacity-60", theme.border)}>Example {idx + 1}</div>
                                                <div className="p-4 space-y-3">
                                                    <div><span className="text-[10px] font-bold uppercase opacity-50 block mb-1">Input</span><div className={cn("font-mono text-xs p-2 rounded border whitespace-pre", theme.codeBlock)}>{tc.input}</div></div>
                                                    <div><span className="text-[10px] font-bold uppercase opacity-50 block mb-1">Output</span><div className={cn("font-mono text-xs p-2 rounded border whitespace-pre", theme.codeBlock)}>{tc.output}</div></div>
                                                    {tc.explanation && <div className={cn("text-xs p-3 rounded border bg-blue-500/5 text-blue-600 border-blue-500/10")}><span className="font-bold block mb-1">Explanation:</span> {tc.explanation}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div><h3 className={cn("text-xs font-black uppercase tracking-widest mb-2 opacity-90", theme.textHead)}>Constraints</h3><ul className="list-disc pl-4 space-y-1 opacity-90">{problemDetails.constraints?.split(',').map((c, i) => <li key={i}>{c.trim()}</li>)}</ul></div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2"><Info size={32} /><p>Select a problem to view details</p></div>
                        )}
                    </div>
                </div>

                <div onMouseDown={handleMouseDown('sidebar')} className={cn("w-2 -ml-2 -mr-2 z-30 cursor-col-resize flex flex-col justify-center items-center group opacity-0 hover:opacity-100 transition-opacity", theme.textSec)}><div className={cn("w-1 h-8 rounded-full transition-colors", theme.isDark ? "bg-slate-600 group-hover:bg-blue-500" : "bg-gray-300 group-hover:bg-black")}></div></div>

                <div style={{ width: `${100 - sidebarWidth}%` }} className={cn("flex h-full gap-2", layoutMode === 'default' ? "flex-col" : "flex-row")}>
                    
                    {/* --- EDITOR PANEL --- */}
                    <div className={cn("flex-1 flex flex-col rounded-2xl overflow-hidden border shadow-sm relative", theme.panelBg, theme.border)}>
                        <div className={cn("h-14 flex items-center justify-between px-4 border-b shrink-0 relative z-20", theme.border, theme.headerBg)}>
                            <div className="relative">
                                <button onClick={() => { setShowLangSelector(!showLangSelector); }} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-black/5", theme.border, theme.inputBg)}>
                                    <span className="text-xs font-bold">{LANGUAGES.find(l => l.id === language)?.name}</span><ChevronDown size={12} className={cn("opacity-50 transition-transform", showLangSelector && "rotate-180")}/>
                                </button>
                                {showLangSelector && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowLangSelector(false)}></div>
                                        <div className={cn("absolute top-full left-0 mt-2 w-56 rounded-xl border shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100 overflow-hidden", theme.panelBg, theme.border)}>
                                            {LANGUAGES.map(lang => (
                                                <button key={lang.id} onClick={() => { setLanguage(lang.id); setShowLangSelector(false); }} className={cn("w-full px-4 py-2.5 text-xs font-medium text-left flex justify-between items-center transition-colors", language === lang.id ? "bg-blue-500 text-white" : "hover:bg-black/5")}>{lang.label}{language === lang.id && <Check size={12}/>}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowResetModal(true)} className={cn("p-2 rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500 text-slate-500", theme.textSec)} title="Reset Code"><RotateCcw size={16} /></button>
                                <div className={cn("flex items-center gap-1 p-1 rounded-lg border", theme.border, theme.inputBg)}>
                                    <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} className={cn("p-1.5 rounded-md hover:bg-black/5 transition-colors", theme.textMain)}><Minus size={12}/></button>
                                    <span className="text-[10px] font-mono w-8 text-center">{fontSize}px</span>
                                    <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} className={cn("p-1.5 rounded-md hover:bg-black/5 transition-colors", theme.textMain)}><Plus size={12}/></button>
                                </div>
                                <button onClick={() => setShowLayoutModal(true)} className={cn("p-2 rounded-lg border hover:bg-black/5 transition-colors text-blue-500 bg-blue-500/5 border-blue-500/20", theme.panelBg)} title={`Layout`}>
                                    {layoutMode === 'default' ? <LayoutTemplate size={16} /> : <Columns size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 relative">
                            <Editor 
                                height="100%" 
                                language={language} 
                                value={codeMap[language]} 
                                onMount={handleEditorDidMount}
                                onChange={handleCodeChange} 
                                theme={theme.monaco} 
                                options={{ minimap: { enabled: false }, fontSize, padding: { top: 20, bottom: 80 }, fontFamily: 'JetBrains Mono, monospace', scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', cursorStyle: 'line', contextmenu: false }} 
                            />
                            <div className={cn("absolute bottom-2 left-6 z-10 text-[10px] font-mono opacity-40 pointer-events-none transition-opacity", theme.textMain)}>Ln {cursorPosition.ln}, Col {cursorPosition.col}</div>
                        </div>

                        <div className="absolute bottom-6 right-8 flex items-center gap-3 z-50 pointer-events-auto">
                            <button onClick={() => handleRun(false)} disabled={status !== 'idle'} className={cn("h-10 px-5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0", theme.isDark ? "bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700" : "bg-white/90 border-white text-gray-800 hover:bg-white")}>{status === 'running' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />} Run</button>
                            <button onClick={() => executeSubmission(false)} disabled={status !== 'idle'} className={cn("h-10 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/20 backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0", theme.accentPrimary)}>{(status === 'submitting' || status === 'autosubmitting') ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />} Submit</button>
                        </div>
                    </div>

                    <div onMouseDown={handleMouseDown('console')} className={cn("z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group", layoutMode === 'default' ? "h-2 w-full -mt-2 -mb-2 cursor-row-resize flex-col" : "w-2 h-full -ml-2 -mr-2 cursor-col-resize flex-col")}><div className={cn("rounded-full transition-colors", layoutMode === 'default' ? "w-12 h-1" : "w-1 h-12", theme.isDark ? "bg-slate-600 group-hover:bg-blue-500" : "bg-gray-300 group-hover:bg-black")}></div></div>

                    {/* === CONSOLE PANEL === */}
                    <div style={layoutMode === 'default' ? { height: `${consoleSize}%` } : { width: `${consoleSize}%` }} className={cn("flex flex-col rounded-2xl overflow-hidden border transition-all ease-linear duration-75 shadow-sm", theme.panelBg, theme.border)}>
                        <div className={cn("h-10 border-b flex items-center justify-between px-2 shrink-0 select-none bg-opacity-50 z-10 overflow-hidden", theme.border, theme.headerBg)}>
                            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient pr-4 pl-2">
                                {testCases.map((tc, i) => {
                                    const res = executionResults && executionResults.find(r => r.id === tc.id);
                                    return (
                                        <div key={tc.id} className="relative group">
                                            <button onClick={() => setSelectedCaseId(tc.id)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border flex items-center gap-2 whitespace-nowrap shrink-0 pr-6", selectedCaseId === tc.id ? (theme.isDark ? "bg-blue-500/10 border-blue-500/40 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700") : "border-transparent opacity-60 hover:opacity-100 hover:bg-black/5")}>
                                                <span className="uppercase tracking-wider opacity-70">{getCaseLabel(tc)}</span>
                                                {res && <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm ml-1", res.passed ? "bg-emerald-500" : "bg-rose-500")} />}
                                            </button>
                                            {tc.type === 'custom' && <button onClick={(e) => { e.stopPropagation(); handleDeleteCase(tc.id); }} className={cn("absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 hover:text-rose-500 text-slate-400")}><X size={10} strokeWidth={3} /></button>}
                                        </div>
                                    );
                                })}
                                {testCases.length < 3 && <button onClick={handleAddCase} className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors border border-dashed hover:border-solid", theme.border, theme.textSec, "hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500")}><Plus size={10} strokeWidth={3}/></button>}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col p-4 overflow-hidden relative min-h-0">
                            {currentResult ? (
                                <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                                    <div className="flex items-center justify-between shrink-0 bg-opacity-50 p-1">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm border", currentResult.passed ? theme.successBadge : theme.errorBadge)}>
                                                {currentResult.passed ? <Check size={14} strokeWidth={3}/> : <X size={14} strokeWidth={3}/>} {currentResult.status}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono", theme.border, theme.isDark ? "bg-slate-800/50" : "bg-slate-100")}><Zap size={10} className="text-amber-500"/><span className="font-bold">{currentResult.time}</span></div>
                                                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono", theme.border, theme.isDark ? "bg-slate-800/50" : "bg-slate-100")}><Cpu size={10} className="text-blue-500"/><span className="font-bold">{currentResult.memory}</span></div>
                                            </div>
                                        </div>
                                        <button onClick={() => setExecutionResults(null)} className={cn("p-2 rounded-lg transition-colors border shadow-sm hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-blue-500", theme.panelBg, theme.border)} title="Edit Input"><Edit3 size={14}/></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                                        <div className="flex flex-col gap-4">
                                            <div className={cn("rounded-xl border overflow-hidden shadow-sm", theme.border)}>
                                                <div className={cn("px-3 py-2 flex items-center gap-2", theme.codeHeader)}><CornerDownRight size={12} className="opacity-50"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70">Input</span></div>
                                                <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre", theme.codeBlock, theme.textMain)}>{currentResult.input}</div>
                                            </div>
                                            {(currentResult.stderr || (!currentResult.passed && currentResult.status !== 'Wrong Answer')) ? (
                                                <div className={cn("rounded-xl border overflow-hidden shadow-sm transition-all border-rose-500/30 shadow-rose-900/10")}>
                                                    <div className={cn("px-3 py-2 flex items-center justify-between", theme.isDark ? "bg-rose-950/30" : "bg-rose-50")}><div className="flex items-center gap-2"><AlertOctagon size={12} className="text-rose-500"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70 text-rose-500">Error Log</span></div></div>
                                                    <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar text-rose-500", theme.isDark ? "bg-[#0B1221]" : "bg-white")}><pre className="whitespace-pre">{currentResult.stderr || currentResult.compileOutput || "Unknown Error"}</pre></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={cn("rounded-xl border overflow-hidden shadow-sm transition-all", currentResult.passed ? (theme.isDark ? "border-emerald-500/30 shadow-emerald-900/10" : "border-emerald-200 shadow-emerald-100") : (theme.isDark ? "border-rose-500/30 shadow-rose-900/10" : "border-rose-200 shadow-rose-100"))}>
                                                        <div className={cn("px-3 py-2 flex items-center justify-between", theme.isDark ? "bg-black/20" : "bg-gray-50")}><div className="flex items-center gap-2"><Terminal size={12} className={currentResult.passed ? "text-emerald-500" : "text-rose-500"}/><span className={cn("text-[10px] font-black uppercase tracking-widest opacity-70", currentResult.passed ? "text-emerald-500" : "text-rose-500")}>Your Output</span></div></div>
                                                        <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre", theme.isDark ? "bg-[#0B1221]" : "bg-white")}>{currentResult.actualOutput}</div>
                                                    </div>
                                                    {(currentResult.expectedOutput) && (
                                                        <div className={cn("rounded-xl border overflow-hidden shadow-sm", theme.border)}>
                                                            <div className={cn("px-3 py-2 flex items-center gap-2", theme.codeHeader)}><Box size={12} className="opacity-50"/><span className="text-[10px] font-black uppercase tracking-widest opacity-70">Expected Output</span></div>
                                                            <div className={cn("p-3 font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre", theme.codeBlock, theme.textSec)}>{currentResult.expectedOutput}</div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200 pt-2">
                                    <div className="flex justify-between items-end mb-2 shrink-0 px-1"><span className={cn("text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2", theme.textHead)}><Edit3 size={12}/> Input</span></div>
                                    <div className={cn("w-full relative group transition-all rounded-xl border overflow-hidden p-1 focus-within:ring-2 focus-within:ring-blue-500/50 shadow-inner overflow-y-auto custom-scrollbar", theme.inputBoxHighContrast)}>
                                        <textarea 
                                            ref={el => { if(el) textareaRefs.current[selectedCaseId] = el; }}
                                            value={currentCase?.input || ""} 
                                            readOnly={currentCase?.type === 'sample'} // ⚡️ SAMPLE CASES READ-ONLY
                                            onChange={e => { 
                                                const val = e.target.value; 
                                                setTestCases(prev => prev.map(t => t.id === selectedCaseId ? {...t, input: val} : t)); 
                                                adjustTextareaHeight(selectedCaseId);
                                            }} 
                                            rows={1} 
                                            className={cn("w-full bg-transparent outline-none p-4 font-mono text-xs resize-none block whitespace-pre overflow-x-auto h-full", currentCase?.type === 'sample' && "opacity-60 cursor-not-allowed")} 
                                            placeholder={currentCase?.type === 'sample' ? "Sample input (Read Only)" : "Enter test case input...\n(Use newlines for multiple inputs)"}
                                            spellCheck={false} 
                                        />
                                    </div>
                                </div>
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
            `}</style>
        </div>
    );
};

export default ProblemSolverPage;