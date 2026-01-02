import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

import { Html5Qrcode } from "html5-qrcode";
import { 
    Check, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, 
    Users, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
    Loader2, ShieldCheck, CameraOff, Info, Clock, Wifi, 
    WifiOff, Signal, Lock, Layers, Calendar, ChevronRight, LayoutGrid, Filter, List,
    XOctagon, FileWarning, AlertCircle
} from 'lucide-react';

// Environment Variable
const BACKEND_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// ============================================================================
// 1. UTILITY & VISUAL COMPONENTS
// ============================================================================

const toggleFullScreen = (action) => {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (action === 'enter' && !doc.fullscreenElement && requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => console.log("Fullscreen blocked:", err));
    } else if (action === 'exit' && doc.fullscreenElement && cancelFullScreen) {
        cancelFullScreen.call(doc).catch(err => {});
    }
};

const HeaderNetworkStatus = ({ isOnline }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold transition-colors duration-300 ${isOnline ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
        {isOnline ? <Signal className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
);

// --- Enhanced Compact Stepper ---
const StepWizardHeader = ({ currentStep }) => {
    const steps = [ { id: 1, label: "Sem" }, { id: 2, label: "Batch" }, { id: 3, label: "Map" }, { id: 4, label: "Check" } ];
    return (
        <div className="w-full mb-4 px-1">
            <div className="flex justify-between items-center relative">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
                {/* Active Progress Line */}
                <div className="absolute left-0 top-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
                
                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;
                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-md' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider hidden sm:block ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const WizardLayout = ({ title, subtitle, children, onBack, stepIndex, footer }) => (
    <div className="w-full max-w-lg mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 flex flex-col overflow-hidden max-h-full">
            <div className="p-6 pb-2 shrink-0 z-10 bg-white/50">
                <StepWizardHeader currentStep={stepIndex} />
                <div className="flex items-center gap-3 mt-4">
                    {onBack && <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none">{title}</h1>
                        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                {children}
            </div>
            {footer && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    {footer}
                </div>
            )}
        </div>
    </div>
);

const ScannerOverlay = ({ cooldown }) => (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
        {cooldown === 0 && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-laser z-20 opacity-80"></div>}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-500 rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-500 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-500 rounded-bl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-500 rounded-br-3xl"></div>
        {cooldown > 0 && (
            <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-200">
                <div className="text-7xl font-black text-white drop-shadow-[0_0_25px_rgba(59,130,246,1)] tabular-nums scale-110">{cooldown}</div>
                <p className="text-blue-200 font-bold mt-2 text-xl uppercase tracking-widest drop-shadow-md">Next Scan In</p>
            </div>
        )}
    </div>
);

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================
export default function MultiBatchAttendancePage() {
    const { user } = useAuth();
    const { Html5Qrcode } = window;
    const navigate = useNavigate();

    // State
    const [view, setView] = useState('splash');
    const [semester, setSemester] = useState('');
    const [semesterConfig, setSemesterConfig] = useState([]); 
    const [selectedBatches, setSelectedBatches] = useState([]); 
    const [batchCourseMap, setBatchCourseMap] = useState({});
    const [globalCourse, setGlobalCourse] = useState('');
    const [validStudentMap, setValidStudentMap] = useState(new Map()); 
    const [scannedData, setScannedData] = useState(new Map()); 
    
    // UI State
    const [scanCount, setScanCount] = useState(0);
    const [attendanceReport, setAttendanceReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [userMsg, setUserMsg] = useState({ text: null, type: 'info' });
    
    // Scanner
    const [scanResult, setScanResult] = useState({ rollNumber: null, message: 'Align QR Code', type: 'info' });
    const [isPaused, setIsPaused] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastScanned, setLastScanned] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    const scanCallback = useRef(null);

    // --- Effects: Network Status ---
    useEffect(() => {
        const update = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', update); window.addEventListener('offline', update);
        return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
    }, []);

    // --- Effects: Gestures & Mobile Lock ---
    useEffect(() => {
        if (view === 'scanner') {
            // Disable swipe navigation, pull-to-refresh, and pinch-zoom behavior
            document.body.style.overscrollBehavior = 'none';
            document.body.style.touchAction = 'pan-x pan-y'; // Allow scrolling scanning result lists but stop bounce
            
            // Push state for back button handling
            window.history.pushState({ page: 'scanner' }, document.title, window.location.href);
            const handlePopState = (e) => { 
                e.preventDefault();
                window.history.pushState({ page: 'scanner' }, document.title, window.location.href); 
                setShowExitModal(true); 
            };
            
            window.addEventListener('popstate', handlePopState);
            
            return () => { 
                document.body.style.overscrollBehavior = 'auto';
                document.body.style.touchAction = 'auto';
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [view]);

    // --- Cooldown Timer ---
    useEffect(() => {
        let timer;
        if (cooldown > 0) timer = setInterval(() => setCooldown(p => p - 1), 1000);
        else if (cooldown === 0 && isPaused && scanResult.type === 'success') { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }
        return () => clearInterval(timer);
    }, [cooldown, isPaused, scanResult.type]);

    // --- Scanner Initialization ---
    useEffect(() => {
        if (view !== 'scanner' || !Html5Qrcode) return;
        setCameraError(null);
        let mounted = true;
        const scanner = new Html5Qrcode('qr-reader');
        const startScanner = async () => {
            try {
                const isMobile = window.innerWidth < 768;
                await scanner.start({ facingMode: 'environment' }, { fps: 30, aspectRatio: isMobile ? 0.75 : 1.777 }, (decoded) => scanCallback.current?.(decoded), () => {});
            } catch (err) { if (mounted) setCameraError("Camera permission denied."); }
        };
        startScanner();
        return () => { mounted = false; if(scanner.isScanning) scanner.stop().catch(console.error); };
    }, [view]);

    // --- Logic ---
    const handleSemesterSelect = async (sem) => {
        setSemester(sem);
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/get-sem-config/${sem}`, { method: 'GET', credentials: 'include' });
            const result = await response.json();
            if (result.success && result.data?.config) {
                setSemesterConfig(result.data.config);
                setView('batches');
            } else { setUserMsg({ text: "No config found.", type: "error" }); }
        } catch { setUserMsg({ text: "Fetch failed.", type: "error" }); } 
        finally { setIsLoading(false); }
    };

    const toggleBatch = (batchName) => setSelectedBatches(prev => prev.includes(batchName) ? prev.filter(b => b !== batchName) : [...prev, batchName]);

    const handleBatchesNext = () => {
        if(selectedBatches.length === 0) return setUserMsg({ text: "Select batches.", type: "error" });
        const initialMap = {};
        selectedBatches.forEach(b => initialMap[b] = batchCourseMap[b] || ""); 
        setBatchCourseMap(initialMap);
        setView('courses');
    };

    const updateBatchCourse = (batchName, courseName) => setBatchCourseMap(prev => ({ ...prev, [batchName]: courseName }));
    
    const applyGlobalCourse = (courseName) => {
        setGlobalCourse(courseName);
        const newMap = {};
        selectedBatches.forEach(b => {
            const config = semesterConfig.find(c => c.name === b);
            if (config && config.availableCourses.includes(courseName)) {
                newMap[b] = courseName;
            } else {
                newMap[b] = batchCourseMap[b]; 
            }
        });
        setBatchCourseMap(newMap);
    };

    const handleCoursesNext = async () => {
        const missing = selectedBatches.some(b => !batchCourseMap[b]);
        if (missing) return setUserMsg({ text: "Map all courses.", type: "error" });

        setIsLoading(true);
        try {
            const newValidMap = new Map();
            await Promise.all(selectedBatches.map(async (b) => {
                const res = await fetch(`${BACKEND_URL}/api/students-by-batch/?semname=${semester}&batch=${b}`, { method: 'GET', credentials: 'include' });
                const data = await res.json();
                if (data.students) data.students.forEach(roll => newValidMap.set(roll, b));
            }));
            if (newValidMap.size === 0) throw new Error("No students found.");
            setValidStudentMap(newValidMap);
            setView('preview');
        } catch { setUserMsg({ text: "Error loading students.", type: "error" }); } 
        finally { setIsLoading(false); }
    };

    const handleStartScanning = () => {
        toggleFullScreen('enter');
        setSessionStartTime(new Date());
        setView('scanner');
    };

    const handleExitSession = () => {
        toggleFullScreen('exit');
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard', { replace: true });
    };

    // Scanner Parsing Logic
    const handleScan = useCallback((text) => {
        if (isPaused || cooldown > 0) return;
        setIsPaused(true);
        let roll = null, qrDataHash = null;
        try {
            const data = JSON.parse(text);
            roll = data.rollno ? data.rollno.trim().toUpperCase() : data.rollno?.trim().toUpperCase();
            qrDataHash = data.hash || data.qrData;
            if (!roll) throw new Error();
        } catch { if (text.length > 5 && text.length < 15) { roll = text.trim().toUpperCase(); qrDataHash = text; } }

        if (roll) {
            if (scannedData.get(roll)) {
                setScanResult({ rollNumber: roll, message: 'Already Scanned', type: 'warning' });
                setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }, 2500);
            } else if (validStudentMap.has(roll)) {
                const studentBatch = validStudentMap.get(roll);
                setScannedData(prev => new Map(prev).set(roll, qrDataHash)); 
                setScanCount(prev => prev + 1);
                const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/${roll}.jpg`;
                setScanResult({ rollNumber: roll, message: `Verified (${studentBatch})`, type: 'success', photo: photoUrl });
                setLastScanned({ rollNumber: roll, photo: photoUrl, batch: studentBatch, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) });
                setCooldown(10);
            } else {
                setScanResult({ rollNumber: roll, message: 'Not in selected batches', type: 'error' });
                setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }, 3000);
            }
        } else {
            setScanResult({ rollNumber: 'INVALID', message: 'Invalid QR Data', type: 'error' });
            setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }, 3000);
        }
    }, [isPaused, cooldown, scannedData, validStudentMap]);

    scanCallback.current = handleScan;

    const submitAttendance = async () => {
        setShowFinishConfirm(false);
        setIsSubmitting(true);
        const batchesPayload = {};
        selectedBatches.forEach(batchKey => { batchesPayload[batchKey] = { course: batchCourseMap[batchKey], presentMap: {} }; });
        scannedData.forEach((hash, roll) => {
            const batchKey = validStudentMap.get(roll);
            if (batchesPayload[batchKey]) batchesPayload[batchKey].presentMap[roll] = hash;
        });

        try {
            const response = await fetch(`${BACKEND_URL}/api/attendance-mark-multiple-qr`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semname: semester, date: new Date().toISOString().split('T')[0], batches: batchesPayload }), credentials: 'include'
            });
            const result = await response.json(); 
            if (response.ok) { 
                setAttendanceReport(result);
                setView('summary');
                toggleFullScreen('exit'); 
            } else {
                throw new Error(result.message || "Failed to submit attendance");
            }
        } catch (error) { setUserMsg({ text: error.message, type: "error" }); } 
        finally { setIsSubmitting(false); }
    };

    // ========================================================================
    // 3. RENDER FUNCTIONS
    // ========================================================================

    const renderSplash = () => (
        <div className="flex flex-col items-center justify-center text-center px-6 animate-fade-in min-h-[80vh] relative">
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                <button onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white transition-all"><ArrowLeft className="w-4 h-4" /> Dashboard</button>
            </div>
            <div className="mb-8 relative mt-10">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <Layers className="w-24 h-24 text-blue-600 relative z-10" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-2">Multi-Batch Mode</h1>
            <p className="text-slate-500 text-lg max-w-md">Simultaneous high-speed scanning for multiple sections.</p>
            <button onClick={() => setView('sem-select')} className="mt-12 bg-slate-900 text-white py-4 px-12 rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl shadow-slate-300 flex items-center gap-3 group active:scale-95 duration-200">
                Configure Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
        </div>
    );

    const renderSemSelection = () => (
        <WizardLayout title="Select Semester" subtitle="Choose academic session" stepIndex={1} onBack={() => setView('splash')}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SEMESTERS.map(sem => (
                    <button key={sem} onClick={() => handleSemesterSelect(sem)} disabled={isLoading} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group h-24 ${semester === sem ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-400 hover:bg-slate-50'}`}>
                        {isLoading && semester === sem ? <Loader2 className="animate-spin text-blue-600 w-5 h-5"/> : <Calendar className={`w-5 h-5 ${semester === sem ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}/>}
                        <span className={`font-bold text-lg ${semester === sem ? 'text-blue-700' : 'text-slate-600'}`}>{sem}</span>
                    </button>
                ))}
            </div>
        </WizardLayout>
    );

    const renderBatchSelection = () => (
        <WizardLayout 
            title="Select Batches" 
            subtitle={`${selectedBatches.length} batches selected`}
            stepIndex={2} 
            onBack={() => setView('sem-select')}
            footer={
                <button onClick={handleBatchesNext} disabled={selectedBatches.length === 0} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                    Next Step <ArrowRight className="w-4 h-4"/>
                </button>
            }
        >
            <div className="flex justify-end mb-4 sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b border-slate-50">
                <button onClick={() => setSelectedBatches(selectedBatches.length === semesterConfig.length ? [] : semesterConfig.map(c => c.name))} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    {selectedBatches.length === semesterConfig.length ? "Deselect All" : "Select All"}
                </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {semesterConfig.map(configItem => {
                    const isSelected = selectedBatches.includes(configItem.name);
                    return (
                        <button key={configItem.name} onClick={() => toggleBatch(configItem.name)} 
                            className={`py-2 px-1 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center h-16 ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105' : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'}`}>
                            <span className="font-bold text-sm">{configItem.name}</span>
                            <span className={`text-[9px] uppercase font-bold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{configItem.totalCourses} Sub</span>
                        </button>
                    )
                })}
            </div>
        </WizardLayout>
    );

    const renderCourseMapping = () => {
        const allCourses = [...new Set(semesterConfig.flatMap(c => c.availableCourses || []))];
        return (
            <WizardLayout 
                title="Map Courses" 
                subtitle="Assign subject to each batch"
                stepIndex={3} 
                onBack={() => setView('batches')}
                footer={
                    <button onClick={handleCoursesNext} disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg">
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Load Students <ArrowRight className="w-4 h-4"/></>}
                    </button>
                }
            >
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs whitespace-nowrap"><Filter size={14}/> Set All To:</div>
                    <div className="relative w-full">
                        <select value={globalCourse} onChange={(e) => applyGlobalCourse(e.target.value)} className="w-full p-2 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400 outline-none">
                            <option value="">Select Course...</option>
                            {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none"/>
                    </div>
                </div>
                <div className="space-y-2">
                    {selectedBatches.map(batchName => {
                        const config = semesterConfig.find(c => c.name === batchName);
                        const batchCourses = config?.availableCourses || [];
                        return (
                            <div key={batchName} className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                                <div className="w-10 h-8 bg-blue-50 rounded-md flex items-center justify-center font-black text-blue-700 text-xs shrink-0">{batchName}</div>
                                <div className="flex-grow relative">
                                    <select 
                                        value={batchCourseMap[batchName]} 
                                        onChange={(e) => updateBatchCourse(batchName, e.target.value)} 
                                        className="w-full py-1.5 pl-2 pr-6 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 appearance-none cursor-pointer outline-none focus:border-blue-400"
                                    >
                                        <option value="">Select...</option>
                                        {batchCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none"/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </WizardLayout>
        );
    };

    const renderPreview = () => (
        <WizardLayout 
            title="Pre-Flight" 
            subtitle="Ready to scan"
            stepIndex={4} 
            onBack={() => setView('courses')}
            footer={
                <button onClick={handleStartScanning} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition active:scale-95 text-lg">
                    <ShieldCheck className="w-5 h-5" /> Start Safe Mode
                </button>
            }
        >
            <div className="bg-slate-900 text-white p-5 rounded-2xl mb-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h3 className="text-3xl font-black">{validStudentMap.size}</h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Students Loaded</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-blue-400">{selectedBatches.length}</h3>
                        <p className="text-slate-500 text-xs font-medium uppercase">Batches</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex-grow flex flex-col mb-2">
                <div className="px-4 py-2 border-b border-slate-200 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                    <span>Batch</span>
                    <span>Course</span>
                </div>
                <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {selectedBatches.map(b => (
                        <div key={b} className="flex justify-between px-3 py-2 bg-white rounded-lg border border-slate-100 text-xs">
                            <span className="font-bold text-slate-700">{b}</span>
                            <span className="font-mono text-slate-500 bg-slate-50 px-1.5 rounded">{batchCourseMap[b]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </WizardLayout>
    );

    const renderScanner = () => (
        <div className="w-full h-full flex flex-col p-2 md:p-4 animate-fade-in relative max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white mb-3 md:mb-6 shadow-lg z-20">
                <div className="flex flex-col">
                    <h3 className="font-bold text-lg md:text-xl leading-tight text-white">Multi-Batch Scanning</h3>
                    <p className="text-slate-300 text-xs md:text-sm font-medium">{selectedBatches.length} Active Batches</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <HeaderNetworkStatus isOnline={isOnline} />
                    <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-300" />
                        <span className="font-mono font-bold text-sm">
                            {sessionStartTime ? Math.floor((new Date() - sessionStartTime)/1000/60) + "m" : "0m"}
                        </span>
                    </div>
                    <button onClick={() => setShowExitModal(true)} className="bg-red-500/20 p-2 rounded-full hover:bg-red-500/40 text-red-300 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Scanner Area */}
            <div className="flex flex-col items-center justify-start flex-1 gap-4 md:gap-6 relative z-10">
                <div className="relative w-full max-w-5xl h-[65vh] md:h-auto md:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-slate-800">
                    <ScannerOverlay cooldown={cooldown} />
                    <style>{`#qr-reader { border: none !important; width: 100% !important; height: 100% !important; } #qr-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }`}</style>
                    <div id="qr-reader" className="w-full h-full object-cover"></div>

                    {/* --- CENTERED MODAL VIEW FOR ERRORS/SUCCESS --- */}
                    {isPaused && scanResult.message && cooldown === 0 && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200">
                            <div className={`
                                relative bg-white 
                                rounded-3xl shadow-2xl 
                                p-6 md:p-8 
                                w-[85%] max-w-sm md:max-w-md 
                                flex flex-col items-center justify-center 
                                text-center animate-in zoom-in-95 duration-200
                                border-b-8
                                ${scanResult.type === 'success' ? 'border-green-500' : 
                                  scanResult.type === 'warning' ? 'border-amber-500' : 'border-red-500'}
                            `}>
                                <div className="mb-4 relative">
                                    {scanResult.photo ? (
                                        <div className={`p-1 rounded-full border-4 ${scanResult.type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
                                            <img 
                                                src={scanResult.photo} 
                                                alt="Student" 
                                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg"
                                                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${scanResult.rollNumber || 'User'}&background=random`}
                                            />
                                        </div>
                                    ) : (
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${scanResult.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                                            {scanResult.type === 'error' ? <XOctagon size={40} /> : <AlertTriangle size={40} />}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                                    {scanResult.rollNumber || "Scan Error"}
                                </h2>
                                <div className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base uppercase tracking-wider
                                    ${scanResult.type === 'success' ? 'bg-green-100 text-green-700' : 
                                      scanResult.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                                `}>
                                    {scanResult.message}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Last Scanned Card */}
                <div className="w-full max-w-xl">
                     {lastScanned ? (
                         <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl flex items-center justify-between border border-white/50 animate-in slide-in-from-bottom duration-500">
                            <div className="flex items-center gap-4">
                                <img src={lastScanned.photo} className="w-14 h-14 rounded-full bg-slate-200 object-cover border-2 border-white shadow-md" alt="Student" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${lastScanned.rollNumber}&background=random`}/>
                                <div><p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">{lastScanned.batch}</p><p className="font-black text-slate-900 text-2xl">{lastScanned.rollNumber}</p></div>
                            </div>
                            <div className="text-right"><span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 mb-1 justify-end"><Clock className="w-3 h-3"/> {lastScanned.timestamp}</span><span className="text-sm font-bold text-slate-400">Count: {scanCount}</span></div>
                         </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-white/40 h-[88px]"><ScanLine className="w-5 h-5 animate-pulse" /><span className="text-sm">Waiting for scan...</span></div>
                    )}
                </div>
                
                <div className="w-full max-w-xl mt-auto pb-4">
                    <button onClick={() => setShowFinishConfirm(true)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100" disabled={scanCount === 0 || isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle2 className="w-5 h-5"/> Finish Session ({scanCount})</>}</button>
                </div>
            </div>
        </div>
    );

    // --- REVISED SUMMARY RENDER (Human Readable / Specific Logic) ---
    const renderSummary = () => {
        if (!attendanceReport || !attendanceReport.results) return null;

        const { message, results } = attendanceReport;

        return (
             <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-center p-6 m-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-blue-200 shadow-lg"><CheckCircle2 className="w-8 h-8" /></div>
                <h2 className="text-2xl font-bold text-slate-900">Processing Complete</h2>
                <p className="text-slate-500 text-sm mt-1 mb-6 border-b border-slate-100 pb-4">{message}</p>
                
                <div className="grid grid-cols-1 gap-4 text-left">
                    {results.map((res, idx) => {
                        // Clean batch name: "VI-SEM-attendance-SU1" -> "SU1"
                        const cleanBatchName = res.batch.replace(/.*-attendance-/, '');
                        
                        if (res.status === 'skipped') {
                            return (
                                <div key={idx} className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                                    <div className="flex items-start gap-3">
                                        <FileWarning className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{cleanBatchName} <span className="text-xs font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">Skipped</span></h3>
                                            <p className="text-sm text-slate-600 mt-1">{res.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Updated Status (Success)
                        const totalStudents = res.presentiesCount + res.absenteesCount;
                        const percentage = totalStudents > 0 ? Math.round((res.presentiesCount / totalStudents) * 100) : 0;
                        const hasMismatched = res.mismatchedStudents && res.mismatchedStudents.length > 0;

                        return (
                            <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-900 text-lg">{cleanBatchName} <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">Updated</span></h3>
                                    <span className="text-2xl font-black text-slate-800">{percentage}%</span>
                                </div>
                                
                                <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
                                    <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                                        <span className="block text-xl font-bold text-green-600">{res.presentiesCount}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                                        <span className="block text-xl font-bold text-red-500">{res.absenteesCount}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Absent</span>
                                    </div>
                                </div>

                                {hasMismatched && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
                                        <div className="flex items-center gap-2 text-red-600 mb-2">
                                            <AlertCircle size={14} />
                                            <span className="text-xs font-bold uppercase">Mismatched Scans ({res.mismatchedStudents.length})</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {res.mismatchedStudents.map(s => (
                                                <span key={s} className="text-[10px] font-mono font-bold bg-white text-red-500 px-2 py-1 rounded border border-red-100">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button onClick={handleExitSession} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Return to Dashboard</button>
             </div>
        );
    };

    // --- REVISED CONFIRM MODAL (Supports custom required text, hides user string in UI) ---
    const ConfirmModal = ({ message, onConfirm, onCancel, textToType, isUsernameCheck }) => {
        const [confirmInput, setConfirmInput] = useState('');
        
        // If checking username, use the user object, else use the explicit textToType (e.g. "EXIT FULL MODE")
        const requiredText = isUsernameCheck ? user?.username : textToType;
        const isMatch = confirmInput.trim().toUpperCase() === (requiredText || "").toUpperCase();
        
        // UI Display text logic: 
        // If checking username, show generic "Type your username".
        // If checking specific word (Exit), show "Type 'EXIT FULL MODE'".
        const labelText = isUsernameCheck 
            ? "Type your username to confirm" 
            : <span>Type <span className="text-slate-900 font-black">"{textToType}"</span> to confirm</span>;

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                    <h3 className="text-xl font-bold text-center mb-2">Confirmation Required</h3>
                    <p className="text-slate-600 text-center mb-6 text-sm">{message}</p>
                    <div className="mb-6 relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">{labelText}</label>
                        <Lock className="absolute left-3 top-9 text-slate-300 w-5 h-5"/>
                        <input type="text" placeholder="Type here..." className="w-full p-3 pl-10 border-2 border-slate-200 rounded-xl font-mono text-center font-bold tracking-widest focus:border-blue-500 outline-none uppercase" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} autoFocus />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors">Cancel</button>
                        <button onClick={onConfirm} disabled={!isMatch} className={`flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isMatch ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>Confirm</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden transition-colors duration-500 ${view === 'scanner' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
            <style>{`@keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes scan-laser { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .animate-scan-laser { animation: scan-laser 2.5s ease-in-out infinite; } #qr-reader { border: none !important; width: 100% !important; height: 100% !important; }`}</style>
            
            {view !== 'scanner' && (
                <>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 -z-10"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
                </>
            )}

            <div className="w-full h-full relative z-10 flex items-center justify-center">
                {view === 'splash' && renderSplash()}
                {view === 'sem-select' && renderSemSelection()}
                {view === 'batches' && renderBatchSelection()}
                {view === 'courses' && renderCourseMapping()}
                {view === 'preview' && renderPreview()}
                {view === 'scanner' && renderScanner()}
                {view === 'summary' && renderSummary()}
            </div>

            {/* EXIT CONFIRMATION: Requires "EXIT FULL MODE" */}
            {showExitModal && (
                <ConfirmModal 
                    message="Are you sure you want to end this session? All unsaved data will be lost." 
                    textToType="EXIT FULL MODE"
                    isUsernameCheck={false}
                    onConfirm={handleExitSession} 
                    onCancel={() => setShowExitModal(false)} 
                />
            )}
            
            {/* SUBMIT CONFIRMATION: Requires Username, but UI doesn't show it */}
            {showFinishConfirm && (
                <ConfirmModal 
                    message={`Submit attendance for ${scanCount} students across ${selectedBatches.length} batches?`} 
                    isUsernameCheck={true}
                    onConfirm={submitAttendance} 
                    onCancel={() => setShowFinishConfirm(false)} 
                />
            )}
            
            {userMsg.text && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 animate-fade-in border border-slate-200">{userMsg.type === 'error' ? <AlertTriangle className="text-red-500"/> : <Info className="text-blue-500"/>}<p className="font-medium text-slate-800">{userMsg.text}</p><button onClick={() => setUserMsg({text: null})}><XCircle className="w-5 h-5 text-slate-400"/></button></div>}
        </div>
    );
}

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext'; 

// import { Html5Qrcode } from "html5-qrcode";
// import { 
//     Check, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, 
//     Users, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
//     Loader2, ShieldCheck, CameraOff, Info, Clock, Wifi, 
//     WifiOff, Signal, Lock, Layers, Calendar, ChevronRight, LayoutGrid, Filter, List,
//     XOctagon, FileWarning, AlertCircle
// } from 'lucide-react';
// import CryptoJS from 'crypto-js'; // Import CryptoJS

// // Environment Variable
// const BACKEND_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
// const EncDec_SECRET_KEY = import.meta.env.VITE_ENC_SECRET_KEY; // Get Secret Key

// // --- ENCRYPTION / DECRYPTION UTILS ---

// const encryptData = (data) => {
//     try {
//         if (!data) return null;
//         const strData = typeof data === 'object' ? JSON.stringify(data) : String(data);
//         return CryptoJS.AES.encrypt(strData, EncDec_SECRET_KEY).toString();
//     } catch (err) {
//         console.error("Encryption Error:", err);
//         return null;
//     }
// };

// const decryptData = (ciphertext) => {
//     try {
//         if (!ciphertext) return null;
//         const bytes = CryptoJS.AES.decrypt(ciphertext, EncDec_SECRET_KEY);
//         const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
//         if (!decryptedString) return null;
//         try {
//             return JSON.parse(decryptedString);
//         } catch (e) {
//             return decryptedString;
//         }
//     } catch (err) {
//         console.error("Decryption Error:", err);
//         return null;
//     }
// };

// // ============================================================================
// // 1. UTILITY & VISUAL COMPONENTS
// // ============================================================================

// const toggleFullScreen = (action) => {
//     const doc = window.document;
//     const docEl = doc.documentElement;
//     const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
//     const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

//     if (action === 'enter' && !doc.fullscreenElement && requestFullScreen) {
//         requestFullScreen.call(docEl).catch(err => console.log("Fullscreen blocked:", err));
//     } else if (action === 'exit' && doc.fullscreenElement && cancelFullScreen) {
//         cancelFullScreen.call(doc).catch(err => {});
//     }
// };

// const HeaderNetworkStatus = ({ isOnline }) => (
//     <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold transition-colors duration-300 ${isOnline ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
//         {isOnline ? <Signal className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
//         <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
//     </div>
// );

// // --- Enhanced Compact Stepper ---
// const StepWizardHeader = ({ currentStep }) => {
//     const steps = [ { id: 1, label: "Sem" }, { id: 2, label: "Batch" }, { id: 3, label: "Map" }, { id: 4, label: "Check" } ];
//     return (
//         <div className="w-full mb-4 px-1">
//             <div className="flex justify-between items-center relative">
//                 {/* Background Line */}
//                 <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
//                 {/* Active Progress Line */}
//                 <div className="absolute left-0 top-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
                
//                 {steps.map((step) => {
//                     const isCompleted = step.id < currentStep;
//                     const isActive = step.id === currentStep;
//                     return (
//                         <div key={step.id} className="flex flex-col items-center bg-white px-2">
//                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-md' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
//                                 {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
//                             </div>
//                             <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider hidden sm:block ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</span>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// const WizardLayout = ({ title, subtitle, children, onBack, stepIndex, footer }) => (
//     <div className="w-full max-w-lg mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
//         <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 flex flex-col overflow-hidden max-h-full">
//             <div className="p-6 pb-2 shrink-0 z-10 bg-white/50">
//                 <StepWizardHeader currentStep={stepIndex} />
//                 <div className="flex items-center gap-3 mt-4">
//                     {onBack && <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>}
//                     <div>
//                         <h1 className="text-2xl font-bold text-slate-900 leading-none">{title}</h1>
//                         {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
//                     </div>
//                 </div>
//             </div>
//             <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
//                 {children}
//             </div>
//             {footer && (
//                 <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
//                     {footer}
//                 </div>
//             )}
//         </div>
//     </div>
// );

// const ScannerOverlay = ({ cooldown }) => (
//     <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
//         {cooldown === 0 && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-laser z-20 opacity-80"></div>}
//         <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-500 rounded-tl-3xl"></div>
//         <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-500 rounded-tr-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-500 rounded-bl-3xl"></div>
//         <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-500 rounded-br-3xl"></div>
//         {cooldown > 0 && (
//             <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-200">
//                 <div className="text-7xl font-black text-white drop-shadow-[0_0_25px_rgba(59,130,246,1)] tabular-nums scale-110">{cooldown}</div>
//                 <p className="text-blue-200 font-bold mt-2 text-xl uppercase tracking-widest drop-shadow-md">Next Scan In</p>
//             </div>
//         )}
//     </div>
// );

// // ============================================================================
// // 2. MAIN COMPONENT
// // ============================================================================
// export default function MultiBatchAttendancePage() {
//     const { user } = useAuth();
//     const { Html5Qrcode } = window;
//     const navigate = useNavigate();

//     // State
//     const [view, setView] = useState('splash');
//     const [semester, setSemester] = useState('');
//     const [semesterConfig, setSemesterConfig] = useState([]); 
//     const [selectedBatches, setSelectedBatches] = useState([]); 
//     const [batchCourseMap, setBatchCourseMap] = useState({});
//     const [globalCourse, setGlobalCourse] = useState('');
//     const [validStudentMap, setValidStudentMap] = useState(new Map()); 
//     const [scannedData, setScannedData] = useState(new Map()); 
    
//     // UI State
//     const [scanCount, setScanCount] = useState(0);
//     const [attendanceReport, setAttendanceReport] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isOnline, setIsOnline] = useState(navigator.onLine);
//     const [sessionStartTime, setSessionStartTime] = useState(null);
//     const [userMsg, setUserMsg] = useState({ text: null, type: 'info' });
    
//     // Scanner
//     const [scanResult, setScanResult] = useState({ rollNumber: null, message: 'Align QR Code', type: 'info' });
//     const [isPaused, setIsPaused] = useState(false);
//     const [cooldown, setCooldown] = useState(0);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [lastScanned, setLastScanned] = useState(null);
//     const [cameraError, setCameraError] = useState(null);
//     const [showExitModal, setShowExitModal] = useState(false);
//     const [showFinishConfirm, setShowFinishConfirm] = useState(false);

//     const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
//     const scanCallback = useRef(null);

//     // --- Effects: Network Status ---
//     useEffect(() => {
//         const update = () => setIsOnline(navigator.onLine);
//         window.addEventListener('online', update); window.addEventListener('offline', update);
//         return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
//     }, []);

//     // --- Effects: Gestures & Mobile Lock ---
//     useEffect(() => {
//         if (view === 'scanner') {
//             // Disable swipe navigation, pull-to-refresh, and pinch-zoom behavior
//             document.body.style.overscrollBehavior = 'none';
//             document.body.style.touchAction = 'pan-x pan-y'; // Allow scrolling scanning result lists but stop bounce
            
//             // Push state for back button handling
//             window.history.pushState({ page: 'scanner' }, document.title, window.location.href);
//             const handlePopState = (e) => { 
//                 e.preventDefault();
//                 window.history.pushState({ page: 'scanner' }, document.title, window.location.href); 
//                 setShowExitModal(true); 
//             };
            
//             window.addEventListener('popstate', handlePopState);
            
//             return () => { 
//                 document.body.style.overscrollBehavior = 'auto';
//                 document.body.style.touchAction = 'auto';
//                 window.removeEventListener('popstate', handlePopState);
//             };
//         }
//     }, [view]);

//     // --- Cooldown Timer ---
//     useEffect(() => {
//         let timer;
//         if (cooldown > 0) timer = setInterval(() => setCooldown(p => p - 1), 1000);
//         else if (cooldown === 0 && isPaused && scanResult.type === 'success') { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }
//         return () => clearInterval(timer);
//     }, [cooldown, isPaused, scanResult.type]);

//     // --- Scanner Initialization ---
//     useEffect(() => {
//         if (view !== 'scanner' || !Html5Qrcode) return;
//         setCameraError(null);
//         let mounted = true;
//         const scanner = new Html5Qrcode('qr-reader');
//         const startScanner = async () => {
//             try {
//                 const isMobile = window.innerWidth < 768;
//                 await scanner.start({ facingMode: 'environment' }, { fps: 30, aspectRatio: isMobile ? 0.75 : 1.777 }, (decoded) => scanCallback.current?.(decoded), () => {});
//             } catch (err) { if (mounted) setCameraError("Camera permission denied."); }
//         };
//         startScanner();
//         return () => { mounted = false; if(scanner.isScanning) scanner.stop().catch(console.error); };
//     }, [view]);

//     // --- Logic ---
//     const handleSemesterSelect = async (sem) => {
//         setSemester(sem);
//         setIsLoading(true);
//         try {
//             // GET Request: Plain URL params, Response Decrypted
//             const response = await fetch(`${BACKEND_URL}/api/get-sem-config/${sem}`, { method: 'GET', credentials: 'include' });
//             const rawJson = await response.json();
//             // DECRYPT RESPONSE
//             const result = rawJson.data ? decryptData(rawJson.data) : rawJson;

//             if (result.success && result.data?.config) {
//                 setSemesterConfig(result.data.config);
//                 setView('batches');
//             } else { setUserMsg({ text: "No config found.", type: "error" }); }
//         } catch { setUserMsg({ text: "Fetch failed.", type: "error" }); } 
//         finally { setIsLoading(false); }
//     };

//     const toggleBatch = (batchName) => setSelectedBatches(prev => prev.includes(batchName) ? prev.filter(b => b !== batchName) : [...prev, batchName]);

//     const handleBatchesNext = () => {
//         if(selectedBatches.length === 0) return setUserMsg({ text: "Select batches.", type: "error" });
//         const initialMap = {};
//         selectedBatches.forEach(b => initialMap[b] = batchCourseMap[b] || ""); 
//         setBatchCourseMap(initialMap);
//         setView('courses');
//     };

//     const updateBatchCourse = (batchName, courseName) => setBatchCourseMap(prev => ({ ...prev, [batchName]: courseName }));
    
//     const applyGlobalCourse = (courseName) => {
//         setGlobalCourse(courseName);
//         const newMap = {};
//         selectedBatches.forEach(b => {
//             const config = semesterConfig.find(c => c.name === b);
//             if (config && config.availableCourses.includes(courseName)) {
//                 newMap[b] = courseName;
//             } else {
//                 newMap[b] = batchCourseMap[b]; 
//             }
//         });
//         setBatchCourseMap(newMap);
//     };

//     const handleCoursesNext = async () => {
//         const missing = selectedBatches.some(b => !batchCourseMap[b]);
//         if (missing) return setUserMsg({ text: "Map all courses.", type: "error" });

//         setIsLoading(true);
//         try {
//             const newValidMap = new Map();
//             await Promise.all(selectedBatches.map(async (b) => {
//                 // GET Request: Plain URL params, Response Decrypted
//                 const res = await fetch(`${BACKEND_URL}/api/students-by-batch/?semname=${semester}&batch=${b}`, { method: 'GET', credentials: 'include' });
//                 const rawJson = await res.json();
//                 // DECRYPT RESPONSE
//                 const data = rawJson.data ? decryptData(rawJson.data) : rawJson;

//                 if (data.students) data.students.forEach(roll => newValidMap.set(roll, b));
//             }));
//             if (newValidMap.size === 0) throw new Error("No students found.");
//             setValidStudentMap(newValidMap);
//             setView('preview');
//         } catch { setUserMsg({ text: "Error loading students.", type: "error" }); } 
//         finally { setIsLoading(false); }
//     };

//     const handleStartScanning = () => {
//         toggleFullScreen('enter');
//         setSessionStartTime(new Date());
//         setView('scanner');
//     };

//     const handleExitSession = () => {
//         toggleFullScreen('exit');
//         navigate(user?.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard', { replace: true });
//     };

//     // Scanner Parsing Logic
//     const handleScan = useCallback((text) => {
//         if (isPaused || cooldown > 0) return;
//         setIsPaused(true);
//         let roll = null, qrDataHash = null;
//         try {
//             const data = JSON.parse(text);
//             roll = data.rollno ? data.rollno.trim().toUpperCase() : data.rollno?.trim().toUpperCase();
//             qrDataHash = data.hash || data.qrData;
//             if (!roll) throw new Error();
//         } catch { if (text.length > 5 && text.length < 15) { roll = text.trim().toUpperCase(); qrDataHash = text; } }

//         if (roll) {
//             if (scannedData.get(roll)) {
//                 setScanResult({ rollNumber: roll, message: 'Already Scanned', type: 'warning' });
//                 setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }, 2500);
//             } else if (validStudentMap.has(roll)) {
//                 const studentBatch = validStudentMap.get(roll);
//                 setScannedData(prev => new Map(prev).set(roll, qrDataHash)); 
//                 setScanCount(prev => prev + 1);
//                 const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/${roll}.jpg`;
//                 setScanResult({ rollNumber: roll, message: `Verified (${studentBatch})`, type: 'success', photo: photoUrl });
//                 setLastScanned({ rollNumber: roll, photo: photoUrl, batch: studentBatch, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) });
//                 setCooldown(10);
//             } else {
//                 setScanResult({ rollNumber: roll, message: 'Not in selected batches', type: 'error' });
//                 setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }, 3000);
//             }
//         } else {
//             setScanResult({ rollNumber: 'INVALID', message: 'Invalid QR Data', type: 'error' });
//             setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); }, 3000);
//         }
//     }, [isPaused, cooldown, scannedData, validStudentMap]);

//     scanCallback.current = handleScan;

//     const submitAttendance = async () => {
//         setShowFinishConfirm(false);
//         setIsSubmitting(true);
//         const batchesPayload = {};
//         selectedBatches.forEach(batchKey => { batchesPayload[batchKey] = { course: batchCourseMap[batchKey], presentMap: {} }; });
//         scannedData.forEach((hash, roll) => {
//             const batchKey = validStudentMap.get(roll);
//             if (batchesPayload[batchKey]) batchesPayload[batchKey].presentMap[roll] = hash;
//         });

//         try {
//             const payload = { semname: semester, date: new Date().toISOString().split('T')[0], batches: batchesPayload };
//             // POST Request: ENCRYPT Body
//             const encryptedBody = encryptData(payload);

//             const response = await fetch(`${BACKEND_URL}/api/attendance-mark-multiple-qr`, {
//                 method: 'POST', headers: { 'Content-Type': 'application/json' }, 
//                 body: JSON.stringify({ payload: encryptedBody }), 
//                 credentials: 'include'
//             });
            
//             const rawJson = await response.json();
//             // POST Request: DECRYPT Response
//             const result = rawJson.data ? decryptData(rawJson.data) : rawJson;

//             if (response.ok) { 
//                 setAttendanceReport(result);
//                 setView('summary');
//                 toggleFullScreen('exit'); 
//             } else {
//                 throw new Error(result.message || "Failed to submit attendance");
//             }
//         } catch (error) { setUserMsg({ text: error.message, type: "error" }); } 
//         finally { setIsSubmitting(false); }
//     };

//     // ========================================================================
//     // 3. RENDER FUNCTIONS
//     // ========================================================================

//     const renderSplash = () => (
//         <div className="flex flex-col items-center justify-center text-center px-6 animate-fade-in min-h-[80vh] relative">
//             <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
//                 <button onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white transition-all"><ArrowLeft className="w-4 h-4" /> Dashboard</button>
//             </div>
//             <div className="mb-8 relative mt-10">
//                 <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
//                 <Layers className="w-24 h-24 text-blue-600 relative z-10" />
//             </div>
//             <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-2">Multi-Batch Mode</h1>
//             <p className="text-slate-500 text-lg max-w-md">Simultaneous high-speed scanning for multiple sections.</p>
//             <button onClick={() => setView('sem-select')} className="mt-12 bg-slate-900 text-white py-4 px-12 rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl shadow-slate-300 flex items-center gap-3 group active:scale-95 duration-200">
//                 Configure Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
//             </button>
//         </div>
//     );

//     const renderSemSelection = () => (
//         <WizardLayout title="Select Semester" subtitle="Choose academic session" stepIndex={1} onBack={() => setView('splash')}>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 {SEMESTERS.map(sem => (
//                     <button key={sem} onClick={() => handleSemesterSelect(sem)} disabled={isLoading} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group h-24 ${semester === sem ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-400 hover:bg-slate-50'}`}>
//                         {isLoading && semester === sem ? <Loader2 className="animate-spin text-blue-600 w-5 h-5"/> : <Calendar className={`w-5 h-5 ${semester === sem ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}/>}
//                         <span className={`font-bold text-lg ${semester === sem ? 'text-blue-700' : 'text-slate-600'}`}>{sem}</span>
//                     </button>
//                 ))}
//             </div>
//         </WizardLayout>
//     );

//     const renderBatchSelection = () => (
//         <WizardLayout 
//             title="Select Batches" 
//             subtitle={`${selectedBatches.length} batches selected`}
//             stepIndex={2} 
//             onBack={() => setView('sem-select')}
//             footer={
//                 <button onClick={handleBatchesNext} disabled={selectedBatches.length === 0} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
//                     Next Step <ArrowRight className="w-4 h-4"/>
//                 </button>
//             }
//         >
//             <div className="flex justify-end mb-4 sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b border-slate-50">
//                 <button onClick={() => setSelectedBatches(selectedBatches.length === semesterConfig.length ? [] : semesterConfig.map(c => c.name))} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
//                     {selectedBatches.length === semesterConfig.length ? "Deselect All" : "Select All"}
//                 </button>
//             </div>
//             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
//                 {semesterConfig.map(configItem => {
//                     const isSelected = selectedBatches.includes(configItem.name);
//                     return (
//                         <button key={configItem.name} onClick={() => toggleBatch(configItem.name)} 
//                             className={`py-2 px-1 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center h-16 ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105' : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'}`}>
//                             <span className="font-bold text-sm">{configItem.name}</span>
//                             <span className={`text-[9px] uppercase font-bold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{configItem.totalCourses} Sub</span>
//                         </button>
//                     )
//                 })}
//             </div>
//         </WizardLayout>
//     );

//     const renderCourseMapping = () => {
//         const allCourses = [...new Set(semesterConfig.flatMap(c => c.availableCourses || []))];
//         return (
//             <WizardLayout 
//                 title="Map Courses" 
//                 subtitle="Assign subject to each batch"
//                 stepIndex={3} 
//                 onBack={() => setView('batches')}
//                 footer={
//                     <button onClick={handleCoursesNext} disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg">
//                         {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Load Students <ArrowRight className="w-4 h-4"/></>}
//                     </button>
//                 }
//             >
//                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
//                     <div className="flex items-center gap-2 text-slate-600 font-bold text-xs whitespace-nowrap"><Filter size={14}/> Set All To:</div>
//                     <div className="relative w-full">
//                         <select value={globalCourse} onChange={(e) => applyGlobalCourse(e.target.value)} className="w-full p-2 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400 outline-none">
//                             <option value="">Select Course...</option>
//                             {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
//                         </select>
//                         <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none"/>
//                     </div>
//                 </div>
//                 <div className="space-y-2">
//                     {selectedBatches.map(batchName => {
//                         const config = semesterConfig.find(c => c.name === batchName);
//                         const batchCourses = config?.availableCourses || [];
//                         return (
//                             <div key={batchName} className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
//                                 <div className="w-10 h-8 bg-blue-50 rounded-md flex items-center justify-center font-black text-blue-700 text-xs shrink-0">{batchName}</div>
//                                 <div className="flex-grow relative">
//                                     <select 
//                                         value={batchCourseMap[batchName]} 
//                                         onChange={(e) => updateBatchCourse(batchName, e.target.value)} 
//                                         className="w-full py-1.5 pl-2 pr-6 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 appearance-none cursor-pointer outline-none focus:border-blue-400"
//                                     >
//                                         <option value="">Select...</option>
//                                         {batchCourses.map(c => <option key={c} value={c}>{c}</option>)}
//                                     </select>
//                                     <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none"/>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </WizardLayout>
//         );
//     };

//     const renderPreview = () => (
//         <WizardLayout 
//             title="Pre-Flight" 
//             subtitle="Ready to scan"
//             stepIndex={4} 
//             onBack={() => setView('courses')}
//             footer={
//                 <button onClick={handleStartScanning} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition active:scale-95 text-lg">
//                     <ShieldCheck className="w-5 h-5" /> Start Safe Mode
//                 </button>
//             }
//         >
//             <div className="bg-slate-900 text-white p-5 rounded-2xl mb-4 relative overflow-hidden shrink-0">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
//                 <div className="relative z-10 flex justify-between items-end">
//                     <div>
//                         <h3 className="text-3xl font-black">{validStudentMap.size}</h3>
//                         <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Students Loaded</p>
//                     </div>
//                     <div className="text-right">
//                         <h3 className="text-xl font-bold text-blue-400">{selectedBatches.length}</h3>
//                         <p className="text-slate-500 text-xs font-medium uppercase">Batches</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex-grow flex flex-col mb-2">
//                 <div className="px-4 py-2 border-b border-slate-200 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
//                     <span>Batch</span>
//                     <span>Course</span>
//                 </div>
//                 <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
//                     {selectedBatches.map(b => (
//                         <div key={b} className="flex justify-between px-3 py-2 bg-white rounded-lg border border-slate-100 text-xs">
//                             <span className="font-bold text-slate-700">{b}</span>
//                             <span className="font-mono text-slate-500 bg-slate-50 px-1.5 rounded">{batchCourseMap[b]}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </WizardLayout>
//     );

//     const renderScanner = () => (
//         <div className="w-full h-full flex flex-col p-2 md:p-4 animate-fade-in relative max-w-7xl mx-auto">
//             {/* Header */}
//             <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white mb-3 md:mb-6 shadow-lg z-20">
//                 <div className="flex flex-col">
//                     <h3 className="font-bold text-lg md:text-xl leading-tight text-white">Multi-Batch Scanning</h3>
//                     <p className="text-slate-300 text-xs md:text-sm font-medium">{selectedBatches.length} Active Batches</p>
//                 </div>
//                 <div className="flex items-center gap-2 md:gap-4">
//                     <HeaderNetworkStatus isOnline={isOnline} />
//                     <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
//                         <Clock className="w-4 h-4 text-blue-300" />
//                         <span className="font-mono font-bold text-sm">
//                             {sessionStartTime ? Math.floor((new Date() - sessionStartTime)/1000/60) + "m" : "0m"}
//                         </span>
//                     </div>
//                     <button onClick={() => setShowExitModal(true)} className="bg-red-500/20 p-2 rounded-full hover:bg-red-500/40 text-red-300 transition-colors">
//                         <LogOut className="w-5 h-5" />
//                     </button>
//                 </div>
//             </div>

//             {/* Scanner Area */}
//             <div className="flex flex-col items-center justify-start flex-1 gap-4 md:gap-6 relative z-10">
//                 <div className="relative w-full max-w-5xl h-[65vh] md:h-auto md:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-slate-800">
//                     <ScannerOverlay cooldown={cooldown} />
//                     <style>{`#qr-reader { border: none !important; width: 100% !important; height: 100% !important; } #qr-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }`}</style>
//                     <div id="qr-reader" className="w-full h-full object-cover"></div>

//                     {/* --- CENTERED MODAL VIEW FOR ERRORS/SUCCESS --- */}
//                     {isPaused && scanResult.message && cooldown === 0 && (
//                         <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200">
//                             <div className={`
//                                 relative bg-white 
//                                 rounded-3xl shadow-2xl 
//                                 p-6 md:p-8 
//                                 w-[85%] max-w-sm md:max-w-md 
//                                 flex flex-col items-center justify-center 
//                                 text-center animate-in zoom-in-95 duration-200
//                                 border-b-8
//                                 ${scanResult.type === 'success' ? 'border-green-500' : 
//                                   scanResult.type === 'warning' ? 'border-amber-500' : 'border-red-500'}
//                             `}>
//                                 <div className="mb-4 relative">
//                                     {scanResult.photo ? (
//                                         <div className={`p-1 rounded-full border-4 ${scanResult.type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
//                                             <img 
//                                                 src={scanResult.photo} 
//                                                 alt="Student" 
//                                                 className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg"
//                                                 onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${scanResult.rollNumber || 'User'}&background=random`}
//                                             />
//                                         </div>
//                                     ) : (
//                                         <div className={`w-20 h-20 rounded-full flex items-center justify-center ${scanResult.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
//                                             {scanResult.type === 'error' ? <XOctagon size={40} /> : <AlertTriangle size={40} />}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
//                                     {scanResult.rollNumber || "Scan Error"}
//                                 </h2>
//                                 <div className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base uppercase tracking-wider
//                                     ${scanResult.type === 'success' ? 'bg-green-100 text-green-700' : 
//                                       scanResult.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
//                                 `}>
//                                     {scanResult.message}
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Last Scanned Card */}
//                 <div className="w-full max-w-xl">
//                      {lastScanned ? (
//                          <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl flex items-center justify-between border border-white/50 animate-in slide-in-from-bottom duration-500">
//                             <div className="flex items-center gap-4">
//                                 <img src={lastScanned.photo} className="w-14 h-14 rounded-full bg-slate-200 object-cover border-2 border-white shadow-md" alt="Student" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${lastScanned.rollNumber}&background=random`}/>
//                                 <div><p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">{lastScanned.batch}</p><p className="font-black text-slate-900 text-2xl">{lastScanned.rollNumber}</p></div>
//                             </div>
//                             <div className="text-right"><span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 mb-1 justify-end"><Clock className="w-3 h-3"/> {lastScanned.timestamp}</span><span className="text-sm font-bold text-slate-400">Count: {scanCount}</span></div>
//                          </div>
//                     ) : (
//                         <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-white/40 h-[88px]"><ScanLine className="w-5 h-5 animate-pulse" /><span className="text-sm">Waiting for scan...</span></div>
//                     )}
//                 </div>
                
//                 <div className="w-full max-w-xl mt-auto pb-4">
//                     <button onClick={() => setShowFinishConfirm(true)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100" disabled={scanCount === 0 || isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle2 className="w-5 h-5"/> Finish Session ({scanCount})</>}</button>
//                 </div>
//             </div>
//         </div>
//     );

//     // --- REVISED SUMMARY RENDER (Human Readable / Specific Logic) ---
//     const renderSummary = () => {
//         if (!attendanceReport || !attendanceReport.results) return null;

//         const { message, results } = attendanceReport;

//         return (
//              <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-center p-6 m-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
//                 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-blue-200 shadow-lg"><CheckCircle2 className="w-8 h-8" /></div>
//                 <h2 className="text-2xl font-bold text-slate-900">Processing Complete</h2>
//                 <p className="text-slate-500 text-sm mt-1 mb-6 border-b border-slate-100 pb-4">{message}</p>
                
//                 <div className="grid grid-cols-1 gap-4 text-left">
//                     {results.map((res, idx) => {
//                         // Clean batch name: "VI-SEM-attendance-SU1" -> "SU1"
//                         const cleanBatchName = res.batch.replace(/.*-attendance-/, '');
                        
//                         if (res.status === 'skipped') {
//                             return (
//                                 <div key={idx} className="bg-amber-50 rounded-xl p-5 border border-amber-200">
//                                     <div className="flex items-start gap-3">
//                                         <FileWarning className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
//                                         <div>
//                                             <h3 className="font-bold text-slate-800 text-lg">{cleanBatchName} <span className="text-xs font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">Skipped</span></h3>
//                                             <p className="text-sm text-slate-600 mt-1">{res.message}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         }

//                         // Updated Status (Success)
//                         const totalStudents = res.presentiesCount + res.absenteesCount;
//                         const percentage = totalStudents > 0 ? Math.round((res.presentiesCount / totalStudents) * 100) : 0;
//                         const hasMismatched = res.mismatchedStudents && res.mismatchedStudents.length > 0;

//                         return (
//                             <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
//                                 <div className="flex justify-between items-center mb-4">
//                                     <h3 className="font-bold text-slate-900 text-lg">{cleanBatchName} <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">Updated</span></h3>
//                                     <span className="text-2xl font-black text-slate-800">{percentage}%</span>
//                                 </div>
                                
//                                 <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
//                                     <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
//                                 </div>
                                
//                                 <div className="grid grid-cols-2 gap-4 mb-4">
//                                     <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
//                                         <span className="block text-xl font-bold text-green-600">{res.presentiesCount}</span>
//                                         <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
//                                     </div>
//                                     <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
//                                         <span className="block text-xl font-bold text-red-500">{res.absenteesCount}</span>
//                                         <span className="text-[10px] uppercase font-bold text-slate-400">Absent</span>
//                                     </div>
//                                 </div>

//                                 {hasMismatched && (
//                                     <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
//                                         <div className="flex items-center gap-2 text-red-600 mb-2">
//                                             <AlertCircle size={14} />
//                                             <span className="text-xs font-bold uppercase">Mismatched Scans ({res.mismatchedStudents.length})</span>
//                                         </div>
//                                         <div className="flex flex-wrap gap-2">
//                                             {res.mismatchedStudents.map(s => (
//                                                 <span key={s} className="text-[10px] font-mono font-bold bg-white text-red-500 px-2 py-1 rounded border border-red-100">{s}</span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>

//                 <button onClick={handleExitSession} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Return to Dashboard</button>
//              </div>
//         );
//     };

//     // --- REVISED CONFIRM MODAL (Supports custom required text, hides user string in UI) ---
//     const ConfirmModal = ({ message, onConfirm, onCancel, textToType, isUsernameCheck }) => {
//         const [confirmInput, setConfirmInput] = useState('');
        
//         // If checking username, use the user object, else use the explicit textToType (e.g. "EXIT FULL MODE")
//         const requiredText = isUsernameCheck ? user?.username : textToType;
//         const isMatch = confirmInput.trim().toUpperCase() === (requiredText || "").toUpperCase();
        
//         // UI Display text logic: 
//         // If checking username, show generic "Type your username".
//         // If checking specific word (Exit), show "Type 'EXIT FULL MODE'".
//         const labelText = isUsernameCheck 
//             ? "Type your username to confirm" 
//             : <span>Type <span className="text-slate-900 font-black">"{textToType}"</span> to confirm</span>;

//         return (
//             <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in zoom-in-95 duration-200">
//                 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
//                     <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
//                     <h3 className="text-xl font-bold text-center mb-2">Confirmation Required</h3>
//                     <p className="text-slate-600 text-center mb-6 text-sm">{message}</p>
//                     <div className="mb-6 relative">
//                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">{labelText}</label>
//                         <Lock className="absolute left-3 top-9 text-slate-300 w-5 h-5"/>
//                         <input type="text" placeholder="Type here..." className="w-full p-3 pl-10 border-2 border-slate-200 rounded-xl font-mono text-center font-bold tracking-widest focus:border-blue-500 outline-none uppercase" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} autoFocus />
//                     </div>
//                     <div className="flex gap-3">
//                         <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors">Cancel</button>
//                         <button onClick={onConfirm} disabled={!isMatch} className={`flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isMatch ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>Confirm</button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className={`min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden transition-colors duration-500 ${view === 'scanner' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
//             <style>{`@keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes scan-laser { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .animate-scan-laser { animation: scan-laser 2.5s ease-in-out infinite; } #qr-reader { border: none !important; width: 100% !important; height: 100% !important; }`}</style>
            
//             {view !== 'scanner' && (
//                 <>
//                     <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 -z-10"></div>
//                     <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//                     <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
//                 </>
//             )}

//             <div className="w-full h-full relative z-10 flex items-center justify-center">
//                 {view === 'splash' && renderSplash()}
//                 {view === 'sem-select' && renderSemSelection()}
//                 {view === 'batches' && renderBatchSelection()}
//                 {view === 'courses' && renderCourseMapping()}
//                 {view === 'preview' && renderPreview()}
//                 {view === 'scanner' && renderScanner()}
//                 {view === 'summary' && renderSummary()}
//             </div>

//             {/* EXIT CONFIRMATION: Requires "EXIT FULL MODE" */}
//             {showExitModal && (
//                 <ConfirmModal 
//                     message="Are you sure you want to end this session? All unsaved data will be lost." 
//                     textToType="EXIT FULL MODE"
//                     isUsernameCheck={false}
//                     onConfirm={handleExitSession} 
//                     onCancel={() => setShowExitModal(false)} 
//                 />
//             )}
            
//             {/* SUBMIT CONFIRMATION: Requires Username, but UI doesn't show it */}
//             {showFinishConfirm && (
//                 <ConfirmModal 
//                     message={`Submit attendance for ${scanCount} students across ${selectedBatches.length} batches?`} 
//                     isUsernameCheck={true}
//                     onConfirm={submitAttendance} 
//                     onCancel={() => setShowFinishConfirm(false)} 
//                 />
//             )}
            
//             {userMsg.text && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 animate-fade-in border border-slate-200">{userMsg.type === 'error' ? <AlertTriangle className="text-red-500"/> : <Info className="text-blue-500"/>}<p className="font-medium text-slate-800">{userMsg.text}</p><button onClick={() => setUserMsg({text: null})}><XCircle className="w-5 h-5 text-slate-400"/></button></div>}
//         </div>
//     );
// }