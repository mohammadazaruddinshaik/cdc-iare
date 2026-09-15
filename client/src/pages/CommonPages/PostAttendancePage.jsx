import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode'; 
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleDashboard';
import { 
    Check, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, 
    Users, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
    Loader2, ShieldCheck, CameraOff, Info, Clock, Wifi, 
    WifiOff, Signal, Lock, Layers, Calendar, Filter,
    FileWarning, AlertCircle, Unlock, ChevronUp
} from 'lucide-react';

// Environment Variable
const BACKEND_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// --- UTILITIES ---
const toggleFullScreen = (action) => {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (action === 'enter' && !doc.fullscreenElement && requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => console.log("Fullscreen blocked:", err));
    } else if (action === 'exit' && doc.fullscreenElement && cancelFullScreen) {
        cancelFullScreen.call(doc).catch(err => {});
    }
};

const calculatePercentage = (present, total) => {
    if (!total || total === 0) return 0;
    return Math.round((present / total) * 100);
};

// ============================================================================
// 1. VISUAL SUB-COMPONENTS (V1 Visuals)
// ============================================================================

const CircularProgress = ({ percentage, size = 140, strokeWidth = 10, label = "Total" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="transparent" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">{percentage}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</span>
            </div>
        </div>
    );
};

const ScannerOverlay = ({ cooldown }) => (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
        {cooldown === 0 && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-laser z-20 opacity-80"></div>
        )}
        
        {/* V1 Blue Corners */}
        <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-t-[6px] border-l-[6px] border-blue-500 rounded-tl-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-t-[6px] border-r-[6px] border-blue-500 rounded-tr-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-b-[6px] border-l-[6px] border-blue-500 rounded-bl-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        <div className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-b-[6px] border-r-[6px] border-blue-500 rounded-br-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

        {/* V1 Countdown Overlay */}
        {cooldown > 0 && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] tabular-nums">
                    {cooldown}
                </div>
                <p className="text-blue-200 font-bold mt-2 text-lg uppercase tracking-widest">Next Scan In</p>
            </div>
        )}
    </div>
);

const StepWizardHeader = ({ currentStep }) => {
    const steps = [ { id: 1, label: "Sem" }, { id: 2, label: "Batch" }, { id: 3, label: "Map" }, { id: 4, label: "Check" } ];
    return (
        <div className="w-full mb-6 px-2">
            <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
                <div className="absolute left-0 top-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;
                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-md' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
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

const HeaderNetworkStatus = ({ isOnline }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border backdrop-blur-md text-xs font-bold transition-all duration-300 shadow-sm ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
        {isOnline ? <Signal className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
        <span className="hidden sm:inline tracking-wider">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
);

const SessionTimer = ({ startTime }) => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);
    const formatDuration = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    return (
        <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-mono border border-white/10 backdrop-blur-md shadow-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 animate-pulse" />
            <span className="tracking-widest font-bold">{formatDuration(seconds)}</span>
        </div>
    );
};

const NetworkIndicator = ({ isOnline }) => {
    const style = isOnline 
        ? { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', label: 'Strong' }
        : { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', label: 'Offline' };
    return (
        <div className={`${style.bg} ${style.border} border-2 p-3 rounded-2xl flex flex-col items-center justify-center transition-colors duration-300 h-full min-h-[90px]`}>
            {isOnline ? <Signal className={`w-5 h-5 sm:w-6 sm:h-6 ${style.text} mb-1`} /> : <WifiOff className={`w-5 h-5 sm:w-6 sm:h-6 ${style.text} mb-1`} />}
            <span className={`text-[9px] sm:text-[10px] font-black uppercase ${style.text} opacity-70`}>Network</span>
            <span className={`text-xs sm:text-sm font-bold ${style.text}`}>{style.label}</span>
        </div>
    );
};

const NetworkErrorModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[1000] p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-xs sm:max-w-sm w-full border-4 border-rose-100 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"><WifiOff className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 animate-pulse"/></div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-3">No Connection</h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed mb-6 sm:mb-8">You need internet to submit. <strong className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Do not refresh</strong> or you will lose your scanned list.</p>
            <button onClick={onClose} className="w-full py-3.5 sm:py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-base sm:text-lg transition-colors shadow-lg active:scale-95">Check Again</button>
        </div>
    </div>
);

const ConfirmModal = ({ message, onConfirm, onCancel, textToType, isUsernameCheck, validateNet }) => {
    const [confirmInput, setConfirmInput] = useState('');
    const validationTarget = isUsernameCheck ? textToType : (textToType || "CONFIRM");
    const displayHint = isUsernameCheck ? "YOUR USERNAME" : (textToType || "CONFIRM");
    
    const isMatch = confirmInput.trim().toUpperCase() === (validationTarget || "").toUpperCase();
    const isDestructive = !isUsernameCheck;
    const activeColor = isDestructive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700';
    const shadowColor = isDestructive ? 'shadow-rose-500/30' : 'shadow-blue-500/30';

    const handleConfirmClick = () => {
         if (validateNet && !validateNet()) return;
         onConfirm();
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-start justify-center p-4 overflow-y-auto pt-20 sm:items-center sm:pt-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onCancel}></div>
            <div className="bg-white relative z-10 w-full max-w-sm rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 p-6 sm:p-8 border border-white/20 max-h-[85dvh] overflow-y-auto">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    {isDestructive ? <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" /> : <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-center text-slate-900 mb-2 leading-tight">Confirmation</h3>
                <p className="text-slate-500 text-center mb-6 sm:mb-8 text-sm font-medium leading-relaxed px-1">{message}</p>
                <div className="mb-6 sm:mb-8 relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none">
                        {isMatch ? <Unlock className={`w-5 h-5 ${isDestructive ? 'text-rose-500' : 'text-blue-500'} transition-colors`} /> : <Lock className="w-5 h-5 text-slate-300 transition-colors" />}
                    </div>
                    <input 
                        type="text" 
                        className={`w-full bg-slate-50 border-2 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-4 text-center font-black tracking-[0.15em] text-lg sm:text-xl uppercase outline-none transition-all duration-300 ${isMatch ? (isDestructive ? 'border-rose-500 text-rose-600 bg-rose-50/10' : 'border-blue-500 text-blue-600 bg-blue-50/10') : 'border-slate-200 text-slate-400 focus:border-slate-400 focus:bg-white'}`} 
                        placeholder={displayHint} 
                        value={confirmInput} 
                        onChange={(e) => setConfirmInput(e.target.value)} 
                        autoFocus 
                        autoComplete="off"
                    />
                    <p className="text-[10px] text-center font-bold text-slate-400 mt-2 sm:mt-3 uppercase tracking-wider">Type <span className="text-slate-800">"{displayHint}"</span> to unlock</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3.5 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors text-xs sm:text-sm active:scale-95">Cancel</button>
                    <button onClick={handleConfirmClick} disabled={!isMatch} className={`flex-[1.5] py-3.5 sm:py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 ${isMatch ? `${activeColor} ${shadowColor} scale-100` : 'bg-slate-300 cursor-not-allowed scale-95 opacity-70'}`}>{isMatch ? (isDestructive ? 'Exit Session' : 'Confirm') : 'Locked'} {isMatch && <ArrowRight className="w-4 h-4" />}</button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================
export default function MultiBatchAttendancePage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Role Security Check
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/', { replace: true });
                return;
            }
            if (user.role !== 'admin' && user.role !== 'faculty' && user.role !== 'guest_faculty') {
                navigate('/unauthorized', { replace: true });
                return;
            }
        }
    }, [user, loading, navigate]);

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
    const [showNetworkErrorModal, setShowNetworkErrorModal] = useState(false);

    const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    const scanCallback = useRef(null);
    const processingRef = useRef(false);

    useEffect(() => {
        const update = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', update); window.addEventListener('offline', update);
        return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
    }, []);

    const checkInternetConnection = useCallback(() => {
        if (!navigator.onLine) {
            setShowNetworkErrorModal(true);
            return false;
        }
        return true;
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (view === 'scanner') {
                event.preventDefault();
                event.returnValue = true;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [view]);

    useEffect(() => {
        if (view === 'scanner') {
            document.body.style.overscrollBehavior = 'none';
            document.body.style.touchAction = 'none';
            document.body.style.overflow = 'hidden';
            window.history.pushState({ page: 'scanner' }, document.title, window.location.href);
            
            const handlePopState = (e) => { 
                e.preventDefault();
                window.history.pushState({ page: 'scanner' }, document.title, window.location.href); 
                setShowExitModal(true); 
            };
            const handleFS = () => { if (!document.fullscreenElement && view === 'scanner') setShowExitModal(true); };

            window.addEventListener('popstate', handlePopState);
            document.addEventListener('fullscreenchange', handleFS);
            
            return () => { 
                document.body.style.overscrollBehavior = '';
                document.body.style.touchAction = '';
                document.body.style.overflow = '';
                window.removeEventListener('popstate', handlePopState);
                document.removeEventListener('fullscreenchange', handleFS);
            };
        }
    }, [view]);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' });
                        setIsPaused(false);
                        processingRef.current = false;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    useEffect(() => {
        if (view !== 'scanner') return;
        setCameraError(null);
        let mounted = true;
        const scanner = new Html5Qrcode('qr-reader');
        const startScanner = async () => {
            try {
                const isMobile = window.innerWidth < 768;
                const config = { 
                    fps: 30, 
                    aspectRatio: isMobile ? 0.75 : 1.777,
                    qrbox: { width: 250, height: 250 } 
                }; 
                await scanner.start({ facingMode: 'environment' }, config, (decoded) => scanCallback.current?.(decoded), () => {});
            } catch (err) { if (mounted) setCameraError("Camera permission denied."); }
        };
        startScanner();
        return () => { mounted = false; if(scanner.isScanning) scanner.stop().catch(console.error); };
    }, [view]);

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
        navigate(getDashboardPath(user?.role), { replace: true });
    };

    const handleScan = useCallback((text) => {
        if (processingRef.current || isPaused || cooldown > 0) return;
        processingRef.current = true;
        setIsPaused(true);

        let roll = null;
        let qrDataHash = null;

        try {
            const data = JSON.parse(text);
            if (data.rollno && (data.hash || data.qrData)) {
                roll = data.rollno.trim().toUpperCase();
                qrDataHash = data.hash || data.qrData;
            } else throw new Error();
        } catch (error) {
            setScanResult({ rollNumber: 'INVALID', message: 'Unknown QR Format', type: 'error' });
            setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); processingRef.current = false; }, 2000);
            return;
        }

        if (roll) {
            if (scannedData.has(roll)) {
                setScanResult({ rollNumber: roll, message: 'Already Scanned', type: 'warning' });
                setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); processingRef.current = false; }, 2500);
            } 
            else if (validStudentMap.has(roll)) {
                const studentBatch = validStudentMap.get(roll);
                setScannedData(prev => new Map(prev).set(roll, qrDataHash)); 
                setScanCount(prev => prev + 1);
                const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/${roll}.jpg`;
                setScanResult({ rollNumber: roll, message: `Verified (${studentBatch})`, type: 'success', photo: photoUrl });
                setLastScanned({ rollNumber: roll, photo: photoUrl, batch: studentBatch, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
                setCooldown(3); 
            } 
            else {
                setScanResult({ rollNumber: roll, message: 'Not in selected batches', type: 'error' });
                setTimeout(() => { setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); setIsPaused(false); processingRef.current = false; }, 3000);
            }
        }
    }, [isPaused, cooldown, scannedData, validStudentMap]);

    scanCallback.current = handleScan;

    const handleFinishClick = () => {
        if (checkInternetConnection()) setShowFinishConfirm(true);
    };

    const submitAttendance = async () => {
        if (!checkInternetConnection()) return;
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }
    if (!user) return null;

    // --- RENDER VIEWS ---

    const renderSplash = () => (
        <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 animate-fade-in min-h-[60vh] sm:min-h-[80vh] relative">
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                <button onClick={() => navigate(getDashboardPath(user?.role))} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white transition-all text-sm sm:text-base"><ArrowLeft className="w-4 h-4" /> Dashboard</button>
            </div>
            <div className="mb-8 sm:mb-10 relative mt-10">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <Layers className="w-20 h-20 sm:w-24 sm:h-24 text-blue-600 relative z-10" />
            </div>
            <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tight mb-4">Multi-Batch</h1>
            <p className="text-slate-500 text-sm sm:text-lg font-medium max-w-md">Simultaneous high-speed scanning for multiple sections.</p>
            <button onClick={() => setView('sem-select')} className="mt-8 sm:mt-12 bg-slate-900 text-white py-4 sm:py-5 px-10 sm:px-12 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 active:scale-95 group w-full sm:w-auto justify-center">
                Configure Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
        </div>
    );

    const renderSemSelection = () => (
        <div className="w-full max-w-lg mx-auto p-4 h-[calc(100dvh-2rem)] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/50 flex flex-col overflow-hidden max-h-full">
                <div className="p-6 pb-2 shrink-0 z-10 bg-white/50">
                    <StepWizardHeader currentStep={1} />
                    <div className="flex items-center gap-3 mt-4">
                        <button onClick={() => setView('splash')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                        <div><h1 className="text-2xl font-bold text-slate-900 leading-none">Select Semester</h1><p className="text-xs text-slate-500 mt-1 font-medium">Choose academic session</p></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SEMESTERS.map(sem => (
                            <button key={sem} onClick={() => handleSemesterSelect(sem)} disabled={isLoading} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group h-24 active:scale-95 ${semester === sem ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                                {isLoading && semester === sem ? <Loader2 className="animate-spin text-blue-600 w-5 h-5"/> : <Calendar className={`w-5 h-5 ${semester === sem ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}/>}
                                <span className={`font-bold text-lg ${semester === sem ? 'text-blue-700' : 'text-slate-600'}`}>{sem}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBatchSelection = () => (
        <div className="w-full max-w-lg mx-auto p-4 h-[calc(100dvh-2rem)] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/50 flex flex-col overflow-hidden max-h-full">
                <div className="p-6 pb-2 shrink-0 z-10 bg-white/50">
                    <StepWizardHeader currentStep={2} />
                    <div className="flex items-center gap-3 mt-4">
                        <button onClick={() => setView('sem-select')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                        <div><h1 className="text-2xl font-bold text-slate-900 leading-none">Select Batches</h1><p className="text-xs text-slate-500 mt-1 font-medium">Semester {semester} sections</p></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                        {semesterConfig.map(config => {
                            const isSelected = selectedBatches.includes(config.name);
                            return (
                                <button key={config.name} onClick={() => toggleBatch(config.name)} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left active:scale-95 ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <div><span className="block font-black text-slate-900 text-lg">{config.name}</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{config.availableCourses?.length || 0} Courses</span></div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'border-2 border-slate-200'}`}>{isSelected && <Check size={14} strokeWidth={3} />}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6 pt-2 shrink-0 bg-white/50 border-t border-slate-100 flex gap-3">
                    <button onClick={() => setView('sem-select')} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">Back</button>
                    <button onClick={handleBatchesNext} disabled={selectedBatches.length === 0} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50">Next <ArrowRight size={16}/></button>
                </div>
            </div>
        </div>
    );

    const renderCourseMapping = () => (
        <div className="w-full max-w-lg mx-auto p-4 h-[calc(100dvh-2rem)] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/50 flex flex-col overflow-hidden max-h-full">
                <div className="p-6 pb-2 shrink-0 z-10 bg-white/50">
                    <StepWizardHeader currentStep={3} />
                    <div className="flex items-center gap-3 mt-4">
                        <button onClick={() => setView('batches')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                        <div><h1 className="text-2xl font-bold text-slate-900 leading-none">Map Courses</h1><p className="text-xs text-slate-500 mt-1 font-medium">Assign subjects to batches</p></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {selectedBatches.map(batchName => {
                        const config = semesterConfig.find(c => c.name === batchName);
                        const courses = config?.availableCourses || [];
                        return (
                            <div key={batchName} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">{batchName} Course</label>
                                <select value={batchCourseMap[batchName] || ''} onChange={(e) => updateBatchCourse(batchName, e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:border-blue-500 outline-none transition-colors text-sm">
                                    <option value="">Select Course...</option>
                                    {courses.map(course => <option key={course} value={course}>{course}</option>)}
                                </select>
                            </div>
                        );
                    })}
                </div>
                <div className="p-6 pt-2 shrink-0 bg-white/50 border-t border-slate-100 flex gap-3">
                    <button onClick={() => setView('batches')} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">Back</button>
                    <button onClick={handleCoursesNext} disabled={isLoading} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next <ArrowRight size={16}/></>}</button>
                </div>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="w-full max-w-lg mx-auto p-4 h-[calc(100dvh-2rem)] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/50 flex flex-col overflow-hidden max-h-full">
                <div className="p-6 pb-2 shrink-0 z-10 bg-white/50">
                    <StepWizardHeader currentStep={4} />
                    <div className="flex items-center gap-3 mt-4">
                        <button onClick={() => setView('courses')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                        <div><h1 className="text-2xl font-bold text-slate-900 leading-none">Session Check</h1><p className="text-xs text-slate-500 mt-1 font-medium">Verify before scanning</p></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-center"><span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Semester</span><span className="text-xl font-black text-blue-900 mt-0.5">{semester}</span></div>
                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center"><span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Total Students</span><span className="text-xl font-black text-emerald-900 mt-0.5">{validStudentMap.size}</span></div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Section Mappings</span>
                        {selectedBatches.map(b => (
                            <div key={b} className="flex justify-between items-center text-xs bg-white p-3 rounded-xl border border-slate-200/60 font-medium">
                                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">{b}</span>
                                <span className="text-slate-600 font-semibold truncate max-w-[200px]">{batchCourseMap[b]}</span>
                            </div>
                        ))}
                    </div>
                    <NetworkIndicator isOnline={isOnline} />
                </div>
                <div className="p-6 pt-2 shrink-0 bg-white/50 border-t border-slate-100 flex gap-3">
                    <button onClick={() => setView('courses')} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">Back</button>
                    <button onClick={handleStartScanning} className="w-2/3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">Start Scanning <ScanLine size={18}/></button>
                </div>
            </div>
        </div>
    );

    const renderScanner = () => (
        <div className="fixed inset-0 bg-slate-950 flex flex-col z-[100] overflow-hidden select-none">
            {/* Top Bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <HeaderNetworkStatus isOnline={isOnline} />
                    <SessionTimer startTime={sessionStartTime} />
                </div>
                <button onClick={() => setShowExitModal(true)} className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-full font-bold text-xs transition-all"><LogOut size={14} /> Finish</button>
            </div>

            {/* Main Scanner Section */}
            <div className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 gap-4 overflow-hidden relative">
                {/* Left/Main Camera View */}
                <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                    <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] sm:aspect-square bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
                        <div id="qr-reader" className="absolute inset-0 w-full h-full object-cover"></div>
                        <ScannerOverlay cooldown={cooldown} />
                        {cameraError && (
                            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-40">
                                <CameraOff className="w-12 h-12 text-rose-500 mb-3" />
                                <p className="text-white font-bold mb-1">Camera Error</p>
                                <p className="text-slate-400 text-xs">{cameraError}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right/Bottom Feedback Panel */}
                <div className="w-full lg:w-96 flex flex-col gap-3 shrink-0">
                    {/* Live Counter Widget */}
                    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Present</span>
                            <h2 className="text-4xl font-black text-white tracking-tight mt-1">{scanCount}</h2>
                        </div>
                        <CircularProgress percentage={calculatePercentage(scanCount, validStudentMap.size)} size={80} strokeWidth={8} label="Scanned" />
                    </div>

                    {/* Dynamic Feedback Card */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                        scanResult.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        scanResult.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                        scanResult.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-slate-900/80 border-white/10 text-white'
                    }`}>
                        <div className="w-14 h-14 rounded-xl bg-white/10 shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                            {scanResult.photo ? (
                                <img src={scanResult.photo} alt="Student" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'}} />
                            ) : (
                                <ScanLine className="w-6 h-6 text-slate-400" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block">{scanResult.rollNumber || 'SYSTEM READY'}</span>
                            <h3 className="text-lg font-black truncate mt-0.5">{scanResult.message}</h3>
                        </div>
                    </div>

                    {/* Last Scanned Quick Ticket */}
                    {lastScanned && (
                        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                                <img src={lastScanned.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" onError={(e)=>{e.target.style.display='none'}} />
                                <div>
                                    <span className="text-xs font-bold text-white block">{lastScanned.rollNumber}</span>
                                    <span className="text-[10px] text-slate-400 uppercase">Batch {lastScanned.batch}</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{lastScanned.timestamp}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <ConfirmModal 
                    message="Exiting the session will prompt confirmation to submit attendance." 
                    textToType="CONFIRM"
                    onConfirm={handleFinishClick} 
                    onCancel={() => setShowExitModal(false)} 
                    validateNet={checkInternetConnection}
                />
            )}

            {/* Finish Submission Confirm Modal */}
            {showFinishConfirm && (
                <ConfirmModal 
                    message={`You are about to submit attendance for ${scanCount} students across ${selectedBatches.length} batches.`} 
                    textToType={user?.username}
                    isUsernameCheck={true}
                    onConfirm={submitAttendance} 
                    onCancel={() => setShowFinishConfirm(false)} 
                    validateNet={checkInternetConnection}
                />
            )}

            {/* Network Error Modal */}
            {showNetworkErrorModal && (
                <NetworkErrorModal onClose={() => setShowNetworkErrorModal(false)} />
            )}
        </div>
    );

    const renderSummary = () => (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-in fade-in duration-500 min-h-screen flex flex-col justify-center">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-6 sm:p-10">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 size={40} strokeWidth={2.5}/></div>
                <h1 className="text-3xl sm:text-4xl font-black text-center text-slate-900 mb-2">Attendance Submitted</h1>
                <p className="text-slate-500 text-center text-sm font-medium mb-8">Successfully recorded across multi-batch sections.</p>
                
                <div className="space-y-3 mb-8">
                    {attendanceReport && Object.entries(attendanceReport.batchSummaries || {}).map(([batchName, count]) => (
                        <div key={batchName} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-800">Batch {batchName}</span>
                            <span className="bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-xl text-sm">{count} Marked</span>
                        </div>
                    ))}
                </div>

                <button onClick={() => navigate(getDashboardPath(user?.role))} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-base transition-all shadow-xl active:scale-95">Return to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col">
            {view === 'splash' && renderSplash()}
            {view === 'sem-select' && renderSemSelection()}
            {view === 'batches' && renderBatchSelection()}
            {view === 'courses' && renderCourseMapping()}
            {view === 'preview' && renderPreview()}
            {view === 'scanner' && renderScanner()}
            {view === 'summary' && renderSummary()}

            {userMsg.text && (
                <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-4 flex items-center gap-3">
                    <span>{userMsg.text}</span>
                    <button onClick={() => setUserMsg({ text: null, type: 'info' })} className="text-slate-400 hover:text-white">✕</button>
                </div>
            )}
        </div>
    );
}