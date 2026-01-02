// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Html5Qrcode } from 'html5-qrcode'; 
// import { useAuth } from '../../context/AuthContext';
// import { 
//     Check, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, 
//     Users, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
//     Loader2, ShieldCheck, CameraOff, Info, Clock, Wifi, 
//     WifiOff, Signal, Lock, Layers, Calendar
// } from 'lucide-react';

// // Environment Variable
// const BACKEND_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// // --- UTILITIES FOR FULLSCREEN ---
// const toggleFullScreen = (action) => {
//     const doc = window.document;
//     const docEl = doc.documentElement;

//     const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
//     const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

//     if (action === 'enter' && !doc.fullscreenElement && requestFullScreen) {
//         requestFullScreen.call(docEl).catch(err => console.log("Fullscreen blocked:", err));
//     } else if (action === 'exit' && doc.fullscreenElement && cancelFullScreen) {
//         cancelFullScreen.call(doc);
//     }
// };

// // ============================================================================
// // 1. VISUAL COMPONENTS
// // ============================================================================

// const ScannerOverlay = ({ cooldown }) => (
//     <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
//         {cooldown === 0 && (
//             <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-laser z-20 opacity-80"></div>
//         )}
//         <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-t-[6px] border-l-[6px] border-blue-500 rounded-tl-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
//         <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-t-[6px] border-r-[6px] border-blue-500 rounded-tr-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
//         <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-b-[6px] border-l-[6px] border-blue-500 rounded-bl-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
//         <div className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-b-[6px] border-r-[6px] border-blue-500 rounded-br-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

//         {cooldown > 0 && (
//             <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
//                 <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] tabular-nums">
//                     {cooldown}
//                 </div>
//                 <p className="text-blue-200 font-bold mt-2 text-lg uppercase tracking-widest">Next Scan In</p>
//             </div>
//         )}
//     </div>
// );

// const SessionTimer = ({ startTime }) => {
//     const [seconds, setSeconds] = useState(0);
//     useEffect(() => {
//         const timer = setInterval(() => setSeconds(s => s + 1), 1000);
//         return () => clearInterval(timer);
//     }, []);

//     const formatDuration = (sec) => {
//         const h = Math.floor(sec / 3600);
//         const m = Math.floor((sec % 3600) / 60);
//         const s = sec % 60;
//         return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//     };

//     return (
//         <div className="flex flex-col items-end">
//             <div className="flex items-center gap-2 text-white bg-black/30 px-3 py-1.5 rounded-full text-xs md:text-sm font-mono border border-blue-500/20 backdrop-blur-md">
//                 <Clock className="w-3 h-3 md:w-4 md:h-4 animate-pulse text-blue-400" />
//                 <span>{formatDuration(seconds)}</span>
//             </div>
//         </div>
//     );
// };

// const HeaderNetworkStatus = ({ isOnline }) => (
//     <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold transition-colors duration-300 ${isOnline ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
//         {isOnline ? <Signal className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
//         <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
//     </div>
// );

// const NetworkIndicator = ({ isOnline }) => {
//     const style = isOnline 
//         ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', label: 'Strong' }
//         : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', label: 'Offline' };

//     return (
//         <div className={`${style.bg} ${style.border} border p-3 rounded-2xl flex flex-col items-center justify-center transition-colors duration-300`}>
//             {isOnline ? <Signal className={`w-5 h-5 ${style.text}`} /> : <WifiOff className={`w-5 h-5 ${style.text}`} />}
//             <span className={`text-[10px] font-bold uppercase mt-1 ${style.text}`}>Signal</span>
//             <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
//         </div>
//     );
// };

// // ============================================================================
// // 2. MAIN COMPONENT
// // ============================================================================
// export default function AttendanceScanner() {
//     const { user } = useAuth();
//     const navigate = useNavigate();

//     // --- State ---
//     const [view, setView] = useState('splash');
//     const [semester, setSemester] = useState('');
//     const [batch, setBatch] = useState('');
//     const [course, setCourse] = useState('');
//     const [semesterConfig, setSemesterConfig] = useState([]); 
//     const [availableBatches, setAvailableBatches] = useState([]);
//     const [availableCourses, setAvailableCourses] = useState([]);
//     const [validStudentSet, setValidStudentSet] = useState(new Set());
//     const [attendanceReport, setAttendanceReport] = useState(null); 
//     const [isLoadingData, setIsLoadingData] = useState(false);
//     const [isOnline, setIsOnline] = useState(navigator.onLine);
//     const [sessionStartTime, setSessionStartTime] = useState(null);

//     // Scanner
//     const [scanResult, setScanResult] = useState({ rollNumber: null, message: 'Align QR Code', type: 'info' });
//     const [presentMap, setPresentMap] = useState({});
//     const [scanCount, setScanCount] = useState(0);
//     const [isPaused, setIsPaused] = useState(false);
//     const [cooldown, setCooldown] = useState(0); 
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [lastScanned, setLastScanned] = useState(null);
//     const [cameraError, setCameraError] = useState(null);
    
//     // UI
//     const [userMsg, setUserMsg] = useState({ text: null, type: 'info' });
//     const [showExitModal, setShowExitModal] = useState(false);
//     const [showFinishConfirm, setShowFinishConfirm] = useState(false);

//     const scanCallback = useRef(null);
//     const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

//     // ========================================================================
//     // CRITICAL: DISABLE GESTURES & LOCK NAVIGATION
//     // ========================================================================
//     useEffect(() => {
//         if (view === 'scanner') {
//             // 1. Prevent Swipe Gestures
//             document.body.style.overscrollBehavior = 'none';
//             document.body.style.touchAction = 'none';
//             document.body.style.overflow = 'hidden';

//             // 2. Trap "Back" Button
//             window.history.pushState({ page: 'scanner' }, document.title, window.location.href);

//             const handlePopState = (event) => {
//                 event.preventDefault();
//                 // Push state again to keep them trapped
//                 window.history.pushState({ page: 'scanner' }, document.title, window.location.href);
//                 // Force Modal
//                 setShowExitModal(true); 
//             };

//             // 3. Detect Native Fullscreen Exit (Esc / Gestures)
//             const handleFullScreenChange = () => {
//                 const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
//                 if (!isFullScreen && view === 'scanner') {
//                     // User broke out of fullscreen -> Prompt Exit or Force back
//                     setShowExitModal(true);
//                 }
//             };

//             // 4. Prevent Reload
//             const handleBeforeUnload = (e) => {
//                 e.preventDefault();
//                 e.returnValue = ''; 
//             };

//             window.addEventListener('popstate', handlePopState);
//             window.addEventListener('beforeunload', handleBeforeUnload);
//             document.addEventListener('fullscreenchange', handleFullScreenChange);
//             document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
//             document.addEventListener('mozfullscreenchange', handleFullScreenChange);
//             document.addEventListener('msfullscreenchange', handleFullScreenChange);

//             return () => {
//                 document.body.style.overscrollBehavior = '';
//                 document.body.style.touchAction = '';
//                 document.body.style.overflow = '';
//                 window.removeEventListener('popstate', handlePopState);
//                 window.removeEventListener('beforeunload', handleBeforeUnload);
//                 document.removeEventListener('fullscreenchange', handleFullScreenChange);
//                 document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
//                 document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
//                 document.removeEventListener('msfullscreenchange', handleFullScreenChange);
//             };
//         }
//     }, [view]);

//     // ========================================================================
//     // OTHER EFFECTS
//     // ========================================================================

//     useEffect(() => {
//         let timer;
//         if (cooldown > 0) {
//             timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
//         } else if (cooldown === 0 && isPaused && scanResult.type === 'success') {
//             setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' });
//             setIsPaused(false);
//         }
//         return () => clearInterval(timer);
//     }, [cooldown, isPaused, scanResult.type]);

//     useEffect(() => {
//         setSemesterConfig([]); setAvailableBatches([]); setAvailableCourses([]); setBatch(''); setCourse('');
//         if (!semester) return;
//         const fetchConfig = async () => {
//             setIsLoadingData(true);
//             try {
//                 const response = await fetch(`${BACKEND_URL}/api/get-sem-config/${semester}`, { method: 'GET', credentials: 'include' });
//                 const result = await response.json();
//                 if (result.success && result.data?.config) {
//                     setSemesterConfig(result.data.config);
//                     setAvailableBatches(result.data.config.map(item => item.name));
//                 }
//             } catch (err) { console.error(err); setUserMsg({ text: "Failed to load config.", type: "error" }); } 
//             finally { setIsLoadingData(false); }
//         };
//         fetchConfig();
//     }, [semester]);

//     useEffect(() => {
//         if (!batch || semesterConfig.length === 0) { setAvailableCourses([]); setCourse(''); return; }
//         const batchConfig = semesterConfig.find(item => item.name === batch);
//         setAvailableCourses(batchConfig?.availableCourses || []);
//         setCourse('');
//     }, [batch, semesterConfig]);

//     useEffect(() => {
//         if (view !== 'scanner') return;
//         setCameraError(null);
//         let mounted = true;
//         const scanner = new Html5Qrcode('qr-reader');

//         const startScanner = async () => {
//             try {
//                 const isMobile = window.innerWidth < 768;
//                 const config = { fps: 30, aspectRatio: isMobile ? 0.75 : 1.777 }; 
//                 await scanner.start({ facingMode: 'environment' }, config, (decoded) => scanCallback.current?.(decoded), () => {});
//             } catch (err) { if (mounted) setCameraError("Camera permission denied or HTTPS required."); }
//         };
//         startScanner();
//         return () => { mounted = false; if(scanner.isScanning) scanner.stop().catch(console.error); };
//     }, [view]);

//     // ========================================================================
//     // LOGIC
//     // ========================================================================

//     const handleFetchStudents = async (e) => {
//         e.preventDefault();
//         if (!semester || !batch || !course) return;
//         setIsLoadingData(true);
//         try {
//             const response = await fetch(`${BACKEND_URL}/api/students-by-batch/?semname=${semester}&batch=${batch}`, { method: 'GET', credentials: 'include' });
//             const result = await response.json();
//             if (result.students && Array.isArray(result.students)) {
//                 setValidStudentSet(new Set(result.students));
//                 setView('preview');
//             } else { setUserMsg({ text: "No students found.", type: "error" }); }
//         } catch { setUserMsg({ text: "Error fetching students.", type: "error" }); } 
//         finally { setIsLoadingData(false); }
//     };

//     const handleStartScanning = () => {
//         // TRIGGER FULLSCREEN
//         toggleFullScreen('enter');
//         setSessionStartTime(new Date());
//         setView('scanner');
//     };

//     const handleExitSession = () => {
//         // EXIT FULLSCREEN ON CONFIRMED EXIT
//         toggleFullScreen('exit');
//         const destination = user?.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard';
//         navigate(destination, { replace: true });
//     };

//     const handleCancelExit = () => {
//         setShowExitModal(false);
//         // If user cancels exit, Force Fullscreen Again
//         toggleFullScreen('enter');
//     };

//     const handleScan = useCallback((text) => {
//         if (isPaused || cooldown > 0) return;
//         setIsPaused(true);

//         let roll = null, qrDataValue = null;
//         try {
//             const data = JSON.parse(text);
//             if (data.rollno) {
//                 roll = data.rollno.trim().toUpperCase();
//                 qrDataValue = data.hash; 
//             } else {
//                 roll = data.rollno?.trim().toUpperCase();
//                 qrDataValue = data.hash || data.qrData; 
//             }
//             if (!roll) throw new Error();
//         } catch {
//             if (text.length > 5 && text.length < 15) { 
//                 roll = text.trim().toUpperCase(); 
//                 qrDataValue = text; 
//             }
//         }

//         if (roll) {
//             if (presentMap[roll]) {
//                 setScanResult({ rollNumber: roll, message: 'Already Scanned', type: 'warning' });
//                 setTimeout(() => { 
//                     setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); 
//                     setIsPaused(false); 
//                 }, 3500);
//             } else if (validStudentSet.has(roll)) {
//                 setPresentMap(prev => ({ ...prev, [roll]: qrDataValue }));
//                 setScanCount(prev => prev + 1);
//                 const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/${roll}.jpg`;
                
//                 setScanResult({ rollNumber: roll, message: 'Verified', type: 'success', photo: photoUrl });
//                 setLastScanned({ rollNumber: roll, photo: photoUrl, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) });
//                 setCooldown(10);
//             } else {
//                 setScanResult({ rollNumber: roll, message: 'Not in Batch', type: 'error' });
//                 setTimeout(() => { 
//                     setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); 
//                     setIsPaused(false); 
//                 }, 3500);
//             }
//         } else {
//             setScanResult({ rollNumber: 'INVALID', message: 'Invalid QR', type: 'error' });
//             setTimeout(() => { 
//                 setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); 
//                 setIsPaused(false); 
//             }, 3500);
//         }
//     }, [isPaused, cooldown, presentMap, validStudentSet]);

//     scanCallback.current = handleScan;

//     const submitAttendance = async () => {
//         setShowFinishConfirm(false);
//         setIsSubmitting(true);
//         const payload = {
//             semname: semester, batch, date: new Date().toISOString().split('T')[0], course, presentMap
//         };
//         try {
//             const response = await fetch(`${BACKEND_URL}/api/attendance-mark-qr`, {
//                 method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
//             });
//             const result = await response.json(); 

//             if (response.ok) {
//                 setAttendanceReport({ ...result, status: 'success' });
//                 setView('summary');
//                 toggleFullScreen('exit');
//             } else {
//                 const msg = result.message || "Submission failed";
//                 if (msg.toLowerCase().includes("already posted")) {
//                     setAttendanceReport({ message: msg, status: 'error' });
//                     setView('summary');
//                     toggleFullScreen('exit');
//                     return; 
//                 }
//                 throw new Error(msg);
//             }
//         } catch (error) { 
//             setUserMsg({ text: error.message, type: "error" }); 
//         } finally { 
//             setIsSubmitting(false); 
//         }
//     };

//     // ========================================================================
//     // RENDER
//     // ========================================================================

//     const renderSplash = () => (
//         <div className="flex flex-col items-center justify-center text-center px-6 animate-fade-in min-h-[80vh]">
//             <div className="mb-8 relative">
//                 <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
//                 {user?.role === 'admin' ? <ShieldCheck className="w-20 h-20 text-blue-600 relative z-10" /> : <BookOpen className="w-20 h-20 text-blue-600 relative z-10" />}
//             </div>
//             <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
//                 {user?.role === 'admin' ? 'Admin Portal' : 'Faculty Portal'}
//             </h1>
//             <p className="text-slate-500 mt-4 text-base sm:text-lg max-w-md">Secure attendance management with real-time network monitoring</p>
//             <button onClick={() => setView('selection')} className="mt-12 bg-slate-900 text-white py-4 px-10 rounded-2xl font-bold text-lg hover:bg-slate-800 transition shadow-xl flex items-center gap-3 group w-full sm:w-auto justify-center">
//                 Start Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
//             </button>
//         </div>
//     );

//     const renderSelection = () => (
//         <div className="w-full max-w-lg mx-auto p-4 animate-fade-in flex flex-col justify-center min-h-[80vh]">
//             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
//                 <div className="flex items-center justify-between mb-8 relative z-10">
//                     <div className="flex items-center gap-3">
//                         <button onClick={() => setView('splash')} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"><ArrowLeft className="w-6 h-6" /></button>
//                         <h2 className="text-2xl font-bold text-slate-800">Session Setup</h2>
//                     </div>
//                     <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><Layers className="w-5 h-5" /></div>
//                 </div>

//                 <form onSubmit={handleFetchStudents} className="space-y-6 relative z-10">
//                     <div className="space-y-2">
//                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Academic Semester</label>
//                         <div className="relative group">
//                             <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
//                             <select value={semester} onChange={e => setSemester(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl py-4 pl-12 pr-10 font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-base">
//                                 <option value="" disabled>Select Semester</option>
//                                 {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
//                             </select>
//                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
//                         </div>
//                     </div>
//                     <div className="space-y-2">
//                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Student Batch</label>
//                         <div className="relative group">
//                             <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
//                             <select value={batch} onChange={e => setBatch(e.target.value)} required disabled={!semester} className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl py-4 pl-12 pr-10 font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base">
//                                 <option value="" disabled>{isLoadingData ? "Loading..." : "Select Batch"}</option>
//                                 {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
//                             </select>
//                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
//                         </div>
//                     </div>
//                     <div className="space-y-2">
//                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Course Code</label>
//                         <div className="relative group">
//                             <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
//                             <select value={course} onChange={e => setCourse(e.target.value)} required disabled={!batch} className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl py-4 pl-12 pr-10 font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base">
//                                 <option value="" disabled>{(!batch) ? "Select Batch First" : "Select Course"}</option>
//                                 {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
//                             </select>
//                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
//                         </div>
//                     </div>
//                     <button type="submit" disabled={isLoadingData || !batch || !course} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-95">
//                         {isLoadingData ? <Loader2 className="animate-spin w-5 h-5"/> : <>Proceed <ArrowRight className="w-5 h-5"/></>}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );

//     const renderPreview = () => (
//         // Minimal Pre-Flight Container (h-auto my-auto max-w-lg)
//         <div className="w-full max-w-lg mx-auto p-4 animate-fade-in flex flex-col justify-center h-auto my-auto">
//              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
//                 <div className="bg-slate-900 p-5 text-white relative overflow-hidden">
//                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
//                     <h2 className="text-xl font-bold relative z-10">Pre-Flight Check</h2>
//                     <p className="text-slate-400 relative z-10 mt-1 text-xs">{validStudentSet.size} students loaded</p>
//                 </div>
//                 <div className="p-5">
//                     <div className="grid grid-cols-2 gap-3 mb-4">
//                         <NetworkIndicator isOnline={isOnline} />
//                         <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl flex flex-col items-center justify-center text-center">
//                             <Clock className="text-blue-600 mb-1 w-4 h-4" />
//                             <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Time</span>
//                             <span className="text-sm font-bold text-blue-900">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
//                         </div>
//                     </div>
//                     <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
//                         <div className="flex justify-between items-center border-b border-slate-200 pb-2">
//                             <span className="text-slate-500 font-medium text-xs">Batch</span>
//                             <span className="text-slate-900 font-bold text-sm">{batch} <span className="text-slate-400 text-[10px] font-normal">({semester})</span></span>
//                         </div>
//                         <div className="flex justify-between items-center pt-1">
//                             <span className="text-slate-500 font-medium text-xs">Course</span>
//                             <span className="text-slate-900 font-bold text-sm truncate max-w-[120px]">{course}</span>
//                         </div>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-2">
//                         <button onClick={() => setView('selection')} className="flex-1 py-3 bg-white border-2 border-slate-200 font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-sm">Back</button>
//                         <button onClick={handleStartScanning} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition active:scale-95 text-sm"><ShieldCheck className="w-4 h-4" /> Start Safe Mode</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderScanner = () => (
//         <div className="w-full h-full flex flex-col p-2 md:p-4 animate-fade-in relative max-w-7xl mx-auto touch-none select-none">
//             <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white mb-3 md:mb-6 shadow-lg">
//                 <div className="flex flex-col"><h3 className="font-bold text-lg md:text-xl leading-tight">{batch} &bull; {semester}</h3><p className="text-slate-300 text-xs md:text-sm truncate max-w-[150px] md:max-w-xs">{course}</p></div>
//                 <div className="flex items-center gap-2 md:gap-4"><HeaderNetworkStatus isOnline={isOnline} /><SessionTimer startTime={sessionStartTime} /><button onClick={() => setShowExitModal(true)} className="bg-red-500/20 p-2 rounded-full hover:bg-red-500/40 text-red-300 transition-colors"><LogOut className="w-5 h-5" /></button></div>
//             </div>
//             <div className="flex flex-col items-center justify-start flex-1 gap-4 md:gap-6">
//                 <div className="relative w-full max-w-5xl h-[60vh] md:h-auto md:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
//                     <ScannerOverlay cooldown={cooldown} />
//                     <style>{`#qr-reader { border: none !important; width: 100% !important; height: 100% !important; background: transparent !important; } #qr-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; border-radius: 1.5rem !important; } #qr-reader__scan_region { background: transparent !important; }`}</style>
//                     <div id="qr-reader" className="w-full h-full object-cover opacity-100"></div>
//                     {cameraError && (<div className="absolute inset-0 z-20 bg-slate-900/95 flex flex-col items-center justify-center text-center p-6"><CameraOff className="w-12 h-12 text-red-500 mb-4" /><h3 className="text-xl font-bold text-white">Camera Error</h3><p className="text-slate-400 mt-2 text-sm">{cameraError}</p></div>)}
//                     {isPaused && scanResult.message && cooldown === 0 && (
//                         <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in zoom-in duration-200 text-center">
//                              {scanResult.photo && (<div className="relative mb-4"><img src={scanResult.photo} alt="Student" className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${scanResult.type === 'success' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'border-red-500'} object-cover`} onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${scanResult.rollNumber}&background=random`}/>{scanResult.type === 'success' && <div className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full border-4 border-black"><Check className="w-6 h-6"/></div>}</div>)}
//                             <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-widest drop-shadow-lg break-all mx-4 leading-tight">{scanResult.rollNumber}</h2>
//                             <div className="mt-4 mx-4"><span className={`inline-block text-sm sm:text-lg md:text-xl font-bold px-6 py-3 rounded-full border break-words whitespace-normal max-w-full leading-tight shadow-xl ${scanResult.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/50' : scanResult.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>{scanResult.message}</span></div>
//                         </div>
//                     )}
//                 </div>
//                 <div className="w-full max-w-xl">
//                      {lastScanned ? (
//                          <div key={lastScanned.rollNumber} className="bg-white/95 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-xl flex items-center justify-between border border-white/50 animate-in slide-in-from-bottom duration-500">
//                             <div className="flex items-center gap-4"><img src={lastScanned.photo} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-200 object-cover border-2 border-white shadow-md" alt="Student" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${lastScanned.rollNumber}&background=random`}/><div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last Verified</p><p className="font-black text-slate-800 text-xl md:text-2xl">{lastScanned.rollNumber}</p></div></div>
//                             <div className="text-right flex flex-col items-end gap-1"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200"><Check className="w-3 h-3"/> {lastScanned.timestamp}</span><span className="text-xs font-bold text-slate-400">#{scanCount}</span></div>
//                          </div>
//                     ) : (
//                         <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-white/40"><ScanLine className="w-5 h-5 animate-pulse" /><span className="text-sm">Ready to scan...</span></div>
//                     )}
//                 </div>
//                 <div className="w-full max-w-xl mt-2 pb-4">
//                     {/* BUTTON: "Finish" */}
//                     <button onClick={() => setShowFinishConfirm(true)} className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100" disabled={scanCount === 0 || isSubmitting}>
//                         {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle2 className="w-5 h-5"/> Finish ({scanCount})</>}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderSummary = () => {
//         if (attendanceReport?.status === 'error') {
//             return (
//                 <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-center p-8 m-4 border-2 border-amber-100">
//                     <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-amber-200 shadow-lg animate-bounce"><AlertTriangle className="w-10 h-10" /></div>
//                     <h2 className="text-3xl font-bold text-slate-900 mb-2">Submission Failed</h2>
//                     <p className="text-slate-500 mb-6 px-4">{attendanceReport.message}</p>
//                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-8">
//                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><Info size={14}/> Session Details</div>
//                         <div className="grid grid-cols-2 gap-4"><div><span className="text-xs text-slate-500 block">Batch</span><span className="font-bold text-slate-800">{batch}</span></div><div><span className="text-xs text-slate-500 block">Date</span><span className="font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span></div></div>
//                     </div>
//                     <button onClick={handleExitSession} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Return to Dashboard</button>
//                 </div>
//             );
//         }
//         return (
//              <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-center p-8 m-4">
//                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-lg"><CheckCircle2 className="w-10 h-10" /></div>
//                 {attendanceReport ? (
//                     <>
//                         <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
//                         <p className="text-slate-500 mt-2">{attendanceReport.message}</p>
//                         <div className="grid grid-cols-3 gap-3 mt-8">
//                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[10px] text-slate-500 font-bold uppercase">Total</p><p className="text-2xl font-black text-slate-900">{attendanceReport.totalMarked}</p></div>
//                             <div className="bg-green-50 p-3 rounded-xl border border-green-100"><p className="text-[10px] text-green-600 font-bold uppercase">Present</p><p className="text-2xl font-black text-green-700">{attendanceReport.presentiesCount}</p></div>
//                             <div className="bg-red-50 p-3 rounded-xl border border-red-100"><p className="text-[10px] text-red-600 font-bold uppercase">Absent</p><p className="text-2xl font-black text-red-700">{attendanceReport.absenteesCount}</p></div>
//                         </div>
//                         {attendanceReport.mismatchedStudents && attendanceReport.mismatchedStudents.filter(s => s).length > 0 && (
//                             <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl text-left">
//                                 <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2"><AlertTriangle className="w-4 h-4"/> Mismatched / Invalid</div>
//                                 <div className="flex flex-wrap gap-2">{attendanceReport.mismatchedStudents.filter(s => s).map((roll, idx) => (<span key={idx} className="bg-white px-2 py-1 rounded border border-amber-200 text-xs font-mono text-amber-800">{roll}</span>))}</div>
//                             </div>
//                         )}
//                     </>
//                 ) : <p className="text-slate-500">Report data not available.</p>}
//                 <button onClick={handleExitSession} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Return to Dashboard</button>
//              </div>
//         );
//     };

//     const ConfirmModal = ({ message, onConfirm, onCancel, requireTyping }) => {
//         const [confirmInput, setConfirmInput] = useState('');
//         // NOTE: Strictly require typing "EXIT" on exit attempts
//         const requiredText = requireTyping ? "EXIT" : user?.username || user?.name || "CONFIRM";
//         const isMatch = confirmInput.trim().toUpperCase() === requiredText.toUpperCase();
        
//         return (
//             <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
//                 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in scale-95 duration-200">
//                     <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
//                     <h3 className="text-xl font-bold text-center mb-2">Confirmation</h3>
//                     <p className="text-slate-600 text-center mb-6">{message}</p>
//                     <div className="mb-4">
//                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{requireTyping ? "Type EXIT to confirm" : "Type your username to confirm"}</label>
//                         <div className="relative">
//                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                             <input type="text" placeholder={requireTyping ? "EXIT" : "Enter your username"} className="w-full p-3 pl-10 border-2 border-slate-200 rounded-xl font-mono text-center font-bold tracking-widest focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all uppercase" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} autoFocus />
//                         </div>
//                     </div>
//                     <div className="flex gap-3">
//                         <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors">Cancel</button>
//                         <button onClick={onConfirm} disabled={!isMatch} className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${isMatch ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>{isMatch ? <Check size={18}/> : <Lock size={18}/>} Confirm</button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className={`min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden transition-colors duration-500 ${view === 'scanner' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
//             <style>{`@keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes scan-laser { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .animate-scan-laser { animation: scan-laser 2.5s ease-in-out infinite; }`}</style>
//             {view !== 'scanner' && (<><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 -z-10"></div><div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div><div className="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div></>)}
//             <div className="w-full h-full relative z-10 flex items-center justify-center">
//                 {view === 'splash' && renderSplash()}
//                 {view === 'selection' && renderSelection()}
//                 {view === 'preview' && renderPreview()}
//                 {view === 'scanner' && renderScanner()}
//                 {view === 'summary' && renderSummary()}
//             </div>
//             {/* FORCE 'EXIT' TYPING WHEN EXITING SESSION */}
//             {showExitModal && <ConfirmModal message="Are you sure you want to end this session? All unsaved data will be lost." requireTyping={true} onConfirm={handleExitSession} onCancel={handleCancelExit} />}
//             {showFinishConfirm && <ConfirmModal message="Finish scanning and submit attendance?" requireTyping={false} onConfirm={submitAttendance} onCancel={() => setShowFinishConfirm(false)} />}
//             {userMsg.text && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 animate-fade-in border border-slate-200">{userMsg.type === 'error' ? <AlertTriangle className="text-red-500"/> : <Info className="text-blue-500"/>}<p className="font-medium text-slate-800">{userMsg.text}</p><button onClick={() => setUserMsg({text: null})}><XCircle className="w-5 h-5 text-slate-400"/></button></div>}
//         </div>
//     );
// }



import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode'; 
import { useAuth } from '../../context/AuthContext';
import { 
    Check, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, 
    Users, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
    Loader2, ShieldCheck, CameraOff, Info, Clock, Wifi, 
    WifiOff, Signal, Lock, Layers, Calendar
} from 'lucide-react';
import CryptoJS from 'crypto-js'; // Import CryptoJS

// Environment Variable
const BACKEND_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const EncDec_SECRET_KEY = import.meta.env.VITE_ENC_SECRET_KEY; // Get Secret Key

// --- ENCRYPTION / DECRYPTION UTILS ---

const encryptData = (data) => {
    try {
        if (!data) return null;
        const strData = typeof data === 'object' ? JSON.stringify(data) : String(data);
        return CryptoJS.AES.encrypt(strData, EncDec_SECRET_KEY).toString();
    } catch (err) {
        console.error("Encryption Error:", err);
        return null;
    }
};

const decryptData = (ciphertext) => {
    try {
        if (!ciphertext) return null;
        const bytes = CryptoJS.AES.decrypt(ciphertext, EncDec_SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;
        try {
            return JSON.parse(decryptedString);
        } catch (e) {
            return decryptedString;
        }
    } catch (err) {
        console.error("Decryption Error:", err);
        return null;
    }
};

// ============================================================================
// 1. VISUAL COMPONENTS
// ============================================================================

const toggleFullScreen = (action) => {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (action === 'enter' && !doc.fullscreenElement && requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => console.log("Fullscreen blocked:", err));
    } else if (action === 'exit' && doc.fullscreenElement && cancelFullScreen) {
        cancelFullScreen.call(doc);
    }
};

const ScannerOverlay = ({ cooldown }) => (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
        {cooldown === 0 && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-laser z-20 opacity-80"></div>
        )}
        <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-t-[6px] border-l-[6px] border-blue-500 rounded-tl-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-t-[6px] border-r-[6px] border-blue-500 rounded-tr-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-b-[6px] border-l-[6px] border-blue-500 rounded-bl-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        <div className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-b-[6px] border-r-[6px] border-blue-500 rounded-br-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

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
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-white bg-black/30 px-3 py-1.5 rounded-full text-xs md:text-sm font-mono border border-blue-500/20 backdrop-blur-md">
                <Clock className="w-3 h-3 md:w-4 md:h-4 animate-pulse text-blue-400" />
                <span>{formatDuration(seconds)}</span>
            </div>
        </div>
    );
};

const HeaderNetworkStatus = ({ isOnline }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold transition-colors duration-300 ${isOnline ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
        {isOnline ? <Signal className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
);

const NetworkIndicator = ({ isOnline }) => {
    const style = isOnline 
        ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', label: 'Strong' }
        : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', label: 'Offline' };

    return (
        <div className={`${style.bg} ${style.border} border p-3 rounded-2xl flex flex-col items-center justify-center transition-colors duration-300`}>
            {isOnline ? <Signal className={`w-5 h-5 ${style.text}`} /> : <WifiOff className={`w-5 h-5 ${style.text}`} />}
            <span className={`text-[10px] font-bold uppercase mt-1 ${style.text}`}>Signal</span>
            <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
        </div>
    );
};

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================
export default function AttendanceScanner() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- State ---
    const [view, setView] = useState('splash');
    const [semester, setSemester] = useState('');
    const [batch, setBatch] = useState('');
    const [course, setCourse] = useState('');
    const [semesterConfig, setSemesterConfig] = useState([]); 
    const [availableBatches, setAvailableBatches] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [validStudentSet, setValidStudentSet] = useState(new Set());
    const [attendanceReport, setAttendanceReport] = useState(null); 
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [sessionStartTime, setSessionStartTime] = useState(null);

    // Scanner
    const [scanResult, setScanResult] = useState({ rollNumber: null, message: 'Align QR Code', type: 'info' });
    const [presentMap, setPresentMap] = useState({});
    const [scanCount, setScanCount] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [cooldown, setCooldown] = useState(0); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastScanned, setLastScanned] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    
    // UI
    const [userMsg, setUserMsg] = useState({ text: null, type: 'info' });
    const [showExitModal, setShowExitModal] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    const scanCallback = useRef(null);
    const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

    // ========================================================================
    // CRITICAL: DISABLE GESTURES & LOCK NAVIGATION
    // ========================================================================
    useEffect(() => {
        if (view === 'scanner') {
            document.body.style.overscrollBehavior = 'none';
            document.body.style.touchAction = 'none';
            document.body.style.overflow = 'hidden';

            window.history.pushState({ page: 'scanner' }, document.title, window.location.href);

            const handlePopState = (event) => {
                event.preventDefault();
                window.history.pushState({ page: 'scanner' }, document.title, window.location.href);
                setShowExitModal(true); 
            };

            const handleFullScreenChange = () => {
                const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                if (!isFullScreen && view === 'scanner') {
                    setShowExitModal(true);
                }
            };

            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = ''; 
            };

            window.addEventListener('popstate', handlePopState);
            window.addEventListener('beforeunload', handleBeforeUnload);
            document.addEventListener('fullscreenchange', handleFullScreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.addEventListener('mozfullscreenchange', handleFullScreenChange);
            document.addEventListener('msfullscreenchange', handleFullScreenChange);

            return () => {
                document.body.style.overscrollBehavior = '';
                document.body.style.touchAction = '';
                document.body.style.overflow = '';
                window.removeEventListener('popstate', handlePopState);
                window.removeEventListener('beforeunload', handleBeforeUnload);
                document.removeEventListener('fullscreenchange', handleFullScreenChange);
                document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
                document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
                document.removeEventListener('msfullscreenchange', handleFullScreenChange);
            };
        }
    }, [view]);

    // ========================================================================
    // OTHER EFFECTS
    // ========================================================================

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        } else if (cooldown === 0 && isPaused && scanResult.type === 'success') {
            setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' });
            setIsPaused(false);
        }
        return () => clearInterval(timer);
    }, [cooldown, isPaused, scanResult.type]);

    useEffect(() => {
        setSemesterConfig([]); setAvailableBatches([]); setAvailableCourses([]); setBatch(''); setCourse('');
        if (!semester) return;
        const fetchConfig = async () => {
            setIsLoadingData(true);
            try {
                // GET Request: Response Decrypted
                const response = await fetch(`${BACKEND_URL}/api/get-sem-config/${semester}`, { method: 'GET', credentials: 'include' });
                const rawJson = await response.json();
                const result = rawJson.data ? decryptData(rawJson.data) : rawJson;

                if (result.success && result.data?.config) {
                    setSemesterConfig(result.data.config);
                    setAvailableBatches(result.data.config.map(item => item.name));
                }
            } catch (err) { console.error(err); setUserMsg({ text: "Failed to load config.", type: "error" }); } 
            finally { setIsLoadingData(false); }
        };
        fetchConfig();
    }, [semester]);

    useEffect(() => {
        if (!batch || semesterConfig.length === 0) { setAvailableCourses([]); setCourse(''); return; }
        const batchConfig = semesterConfig.find(item => item.name === batch);
        setAvailableCourses(batchConfig?.availableCourses || []);
        setCourse('');
    }, [batch, semesterConfig]);

    useEffect(() => {
        if (view !== 'scanner') return;
        setCameraError(null);
        let mounted = true;
        const scanner = new Html5Qrcode('qr-reader');

        const startScanner = async () => {
            try {
                const isMobile = window.innerWidth < 768;
                const config = { fps: 30, aspectRatio: isMobile ? 0.75 : 1.777 }; 
                await scanner.start({ facingMode: 'environment' }, config, (decoded) => scanCallback.current?.(decoded), () => {});
            } catch (err) { if (mounted) setCameraError("Camera permission denied or HTTPS required."); }
        };
        startScanner();
        return () => { mounted = false; if(scanner.isScanning) scanner.stop().catch(console.error); };
    }, [view]);

    // ========================================================================
    // LOGIC
    // ========================================================================

    const handleFetchStudents = async (e) => {
        e.preventDefault();
        if (!semester || !batch || !course) return;
        setIsLoadingData(true);
        try {
            // GET Request: Response Decrypted
            const response = await fetch(`${BACKEND_URL}/api/students-by-batch/?semname=${semester}&batch=${batch}`, { method: 'GET', credentials: 'include' });
            const rawJson = await response.json();
            const result = rawJson.data ? decryptData(rawJson.data) : rawJson;

            if (result.students && Array.isArray(result.students)) {
                setValidStudentSet(new Set(result.students));
                setView('preview');
            } else { setUserMsg({ text: "No students found.", type: "error" }); }
        } catch { setUserMsg({ text: "Error fetching students.", type: "error" }); } 
        finally { setIsLoadingData(false); }
    };

    const handleStartScanning = () => {
        toggleFullScreen('enter');
        setSessionStartTime(new Date());
        setView('scanner');
    };

    const handleExitSession = () => {
        toggleFullScreen('exit');
        const destination = user?.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard';
        navigate(destination, { replace: true });
    };

    const handleCancelExit = () => {
        setShowExitModal(false);
        toggleFullScreen('enter');
    };

    const handleScan = useCallback((text) => {
        if (isPaused || cooldown > 0) return;
        setIsPaused(true);

        let roll = null, qrDataValue = null;
        try {
            const data = JSON.parse(text);
            if (data.rollno) {
                roll = data.rollno.trim().toUpperCase();
                qrDataValue = data.hash; 
            } else {
                roll = data.rollno?.trim().toUpperCase();
                qrDataValue = data.hash || data.qrData; 
            }
            if (!roll) throw new Error();
        } catch {
            if (text.length > 5 && text.length < 15) { 
                roll = text.trim().toUpperCase(); 
                qrDataValue = text; 
            }
        }

        if (roll) {
            if (presentMap[roll]) {
                setScanResult({ rollNumber: roll, message: 'Already Scanned', type: 'warning' });
                setTimeout(() => { 
                    setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); 
                    setIsPaused(false); 
                }, 3500);
            } else if (validStudentSet.has(roll)) {
                setPresentMap(prev => ({ ...prev, [roll]: qrDataValue }));
                setScanCount(prev => prev + 1);
                const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/${roll}.jpg`;
                
                setScanResult({ rollNumber: roll, message: 'Verified', type: 'success', photo: photoUrl });
                setLastScanned({ rollNumber: roll, photo: photoUrl, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) });
                setCooldown(10);
            } else {
                setScanResult({ rollNumber: roll, message: 'Not in Batch', type: 'error' });
                setTimeout(() => { 
                    setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); 
                    setIsPaused(false); 
                }, 3500);
            }
        } else {
            setScanResult({ rollNumber: 'INVALID', message: 'Invalid QR', type: 'error' });
            setTimeout(() => { 
                setScanResult({ rollNumber: null, message: 'Align QR Code', type: 'info' }); 
                setIsPaused(false); 
            }, 3500);
        }
    }, [isPaused, cooldown, presentMap, validStudentSet]);

    scanCallback.current = handleScan;

    const submitAttendance = async () => {
        setShowFinishConfirm(false);
        setIsSubmitting(true);
        const payload = {
            semname: semester, batch, date: new Date().toISOString().split('T')[0], course, presentMap
        };
        try {
            // POST Request: ENCRYPT Body
            const encryptedBody = encryptData(payload);

            const response = await fetch(`${BACKEND_URL}/api/attendance-mark-qr`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ data: encryptedBody }), 
                credentials: 'include'
            });
            
            const rawJson = await response.json(); 
            // POST Request: DECRYPT Response
            const result = rawJson.data ? decryptData(rawJson.data) : rawJson;

            if (response.ok) {
                setAttendanceReport({ ...result, status: 'success' });
                setView('summary');
                toggleFullScreen('exit');
            } else {
                const msg = result.message || "Submission failed";
                if (msg.toLowerCase().includes("already posted")) {
                    setAttendanceReport({ message: msg, status: 'error' });
                    setView('summary');
                    toggleFullScreen('exit');
                    return; 
                }
                throw new Error(msg);
            }
        } catch (error) { 
            setUserMsg({ text: error.message, type: "error" }); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    const renderSplash = () => (
        <div className="flex flex-col items-center justify-center text-center px-6 animate-fade-in min-h-[80vh]">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                {user?.role === 'admin' ? <ShieldCheck className="w-20 h-20 text-blue-600 relative z-10" /> : <BookOpen className="w-20 h-20 text-blue-600 relative z-10" />}
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
                {user?.role === 'admin' ? 'Admin Portal' : 'Faculty Portal'}
            </h1>
            <p className="text-slate-500 mt-4 text-base sm:text-lg max-w-md">Secure attendance management with real-time network monitoring</p>
            <button onClick={() => setView('selection')} className="mt-12 bg-slate-900 text-white py-4 px-10 rounded-2xl font-bold text-lg hover:bg-slate-800 transition shadow-xl flex items-center gap-3 group w-full sm:w-auto justify-center">
                Start Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
        </div>
    );

    const renderSelection = () => (
        <div className="w-full max-w-lg mx-auto p-4 animate-fade-in flex flex-col justify-center min-h-[80vh]">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView('splash')} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"><ArrowLeft className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-bold text-slate-800">Session Setup</h2>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><Layers className="w-5 h-5" /></div>
                </div>

                <form onSubmit={handleFetchStudents} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Academic Semester</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            <select value={semester} onChange={e => setSemester(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl py-4 pl-12 pr-10 font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-base">
                                <option value="" disabled>Select Semester</option>
                                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Student Batch</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            <select value={batch} onChange={e => setBatch(e.target.value)} required disabled={!semester} className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl py-4 pl-12 pr-10 font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base">
                                <option value="" disabled>{isLoadingData ? "Loading..." : "Select Batch"}</option>
                                {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Course Code</label>
                        <div className="relative group">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            <select value={course} onChange={e => setCourse(e.target.value)} required disabled={!batch} className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl py-4 pl-12 pr-10 font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base">
                                <option value="" disabled>{(!batch) ? "Select Batch First" : "Select Course"}</option>
                                {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoadingData || !batch || !course} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-95">
                        {isLoadingData ? <Loader2 className="animate-spin w-5 h-5"/> : <>Proceed <ArrowRight className="w-5 h-5"/></>}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="w-full max-w-lg mx-auto p-4 animate-fade-in flex flex-col justify-center h-auto my-auto">
             <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h2 className="text-xl font-bold relative z-10">Pre-Flight Check</h2>
                    <p className="text-slate-400 relative z-10 mt-1 text-xs">{validStudentSet.size} students loaded</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <NetworkIndicator isOnline={isOnline} />
                        <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl flex flex-col items-center justify-center text-center">
                            <Clock className="text-blue-600 mb-1 w-4 h-4" />
                            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Time</span>
                            <span className="text-sm font-bold text-blue-900">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-medium text-xs">Batch</span>
                            <span className="text-slate-900 font-bold text-sm">{batch} <span className="text-slate-400 text-[10px] font-normal">({semester})</span></span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-500 font-medium text-xs">Course</span>
                            <span className="text-slate-900 font-bold text-sm truncate max-w-[120px]">{course}</span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => setView('selection')} className="flex-1 py-3 bg-white border-2 border-slate-200 font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-sm">Back</button>
                        <button onClick={handleStartScanning} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition active:scale-95 text-sm"><ShieldCheck className="w-4 h-4" /> Start Safe Mode</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderScanner = () => (
        <div className="w-full h-full flex flex-col p-2 md:p-4 animate-fade-in relative max-w-7xl mx-auto touch-none select-none">
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white mb-3 md:mb-6 shadow-lg">
                <div className="flex flex-col"><h3 className="font-bold text-lg md:text-xl leading-tight">{batch} &bull; {semester}</h3><p className="text-slate-300 text-xs md:text-sm truncate max-w-[150px] md:max-w-xs">{course}</p></div>
                <div className="flex items-center gap-2 md:gap-4"><HeaderNetworkStatus isOnline={isOnline} /><SessionTimer startTime={sessionStartTime} /><button onClick={() => setShowExitModal(true)} className="bg-red-500/20 p-2 rounded-full hover:bg-red-500/40 text-red-300 transition-colors"><LogOut className="w-5 h-5" /></button></div>
            </div>
            <div className="flex flex-col items-center justify-start flex-1 gap-4 md:gap-6">
                <div className="relative w-full max-w-5xl h-[60vh] md:h-auto md:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                    <ScannerOverlay cooldown={cooldown} />
                    <style>{`#qr-reader { border: none !important; width: 100% !important; height: 100% !important; background: transparent !important; } #qr-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; border-radius: 1.5rem !important; } #qr-reader__scan_region { background: transparent !important; }`}</style>
                    <div id="qr-reader" className="w-full h-full object-cover opacity-100"></div>
                    {cameraError && (<div className="absolute inset-0 z-20 bg-slate-900/95 flex flex-col items-center justify-center text-center p-6"><CameraOff className="w-12 h-12 text-red-500 mb-4" /><h3 className="text-xl font-bold text-white">Camera Error</h3><p className="text-slate-400 mt-2 text-sm">{cameraError}</p></div>)}
                    {isPaused && scanResult.message && cooldown === 0 && (
                        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in zoom-in duration-200 text-center">
                             {scanResult.photo && (<div className="relative mb-4"><img src={scanResult.photo} alt="Student" className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${scanResult.type === 'success' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'border-red-500'} object-cover`} onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${scanResult.rollNumber}&background=random`}/>{scanResult.type === 'success' && <div className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full border-4 border-black"><Check className="w-6 h-6"/></div>}</div>)}
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-widest drop-shadow-lg break-all mx-4 leading-tight">{scanResult.rollNumber}</h2>
                            <div className="mt-4 mx-4"><span className={`inline-block text-sm sm:text-lg md:text-xl font-bold px-6 py-3 rounded-full border break-words whitespace-normal max-w-full leading-tight shadow-xl ${scanResult.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/50' : scanResult.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>{scanResult.message}</span></div>
                        </div>
                    )}
                </div>
                <div className="w-full max-w-xl">
                     {lastScanned ? (
                         <div key={lastScanned.rollNumber} className="bg-white/95 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-xl flex items-center justify-between border border-white/50 animate-in slide-in-from-bottom duration-500">
                            <div className="flex items-center gap-4"><img src={lastScanned.photo} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-200 object-cover border-2 border-white shadow-md" alt="Student" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${lastScanned.rollNumber}&background=random`}/><div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last Verified</p><p className="font-black text-slate-800 text-xl md:text-2xl">{lastScanned.rollNumber}</p></div></div>
                            <div className="text-right flex flex-col items-end gap-1"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200"><Check className="w-3 h-3"/> {lastScanned.timestamp}</span><span className="text-xs font-bold text-slate-400">#{scanCount}</span></div>
                         </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-white/40"><ScanLine className="w-5 h-5 animate-pulse" /><span className="text-sm">Ready to scan...</span></div>
                    )}
                </div>
                <div className="w-full max-w-xl mt-2 pb-4">
                    {/* BUTTON: "Finish" */}
                    <button onClick={() => setShowFinishConfirm(true)} className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100" disabled={scanCount === 0 || isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : <><CheckCircle2 className="w-5 h-5"/> Finish ({scanCount})</>}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSummary = () => {
        if (attendanceReport?.status === 'error') {
            return (
                <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-center p-8 m-4 border-2 border-amber-100">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-amber-200 shadow-lg animate-bounce"><AlertTriangle className="w-10 h-10" /></div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Submission Failed</h2>
                    <p className="text-slate-500 mb-6 px-4">{attendanceReport.message}</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><Info size={14}/> Session Details</div>
                        <div className="grid grid-cols-2 gap-4"><div><span className="text-xs text-slate-500 block">Batch</span><span className="font-bold text-slate-800">{batch}</span></div><div><span className="text-xs text-slate-500 block">Date</span><span className="font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span></div></div>
                    </div>
                    <button onClick={handleExitSession} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Return to Dashboard</button>
                </div>
            );
        }
        return (
             <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-center p-8 m-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-lg"><CheckCircle2 className="w-10 h-10" /></div>
                {attendanceReport ? (
                    <>
                        <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
                        <p className="text-slate-500 mt-2">{attendanceReport.message}</p>
                        <div className="grid grid-cols-3 gap-3 mt-8">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[10px] text-slate-500 font-bold uppercase">Total</p><p className="text-2xl font-black text-slate-900">{attendanceReport.totalMarked}</p></div>
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100"><p className="text-[10px] text-green-600 font-bold uppercase">Present</p><p className="text-2xl font-black text-green-700">{attendanceReport.presentiesCount}</p></div>
                            <div className="bg-red-50 p-3 rounded-xl border border-red-100"><p className="text-[10px] text-red-600 font-bold uppercase">Absent</p><p className="text-2xl font-black text-red-700">{attendanceReport.absenteesCount}</p></div>
                        </div>
                        {attendanceReport.mismatchedStudents && attendanceReport.mismatchedStudents.filter(s => s).length > 0 && (
                            <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl text-left">
                                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2"><AlertTriangle className="w-4 h-4"/> Mismatched / Invalid</div>
                                <div className="flex flex-wrap gap-2">{attendanceReport.mismatchedStudents.filter(s => s).map((roll, idx) => (<span key={idx} className="bg-white px-2 py-1 rounded border border-amber-200 text-xs font-mono text-amber-800">{roll}</span>))}</div>
                            </div>
                        )}
                    </>
                ) : <p className="text-slate-500">Report data not available.</p>}
                <button onClick={handleExitSession} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Return to Dashboard</button>
             </div>
        );
    };

    const ConfirmModal = ({ message, onConfirm, onCancel, requireTyping }) => {
        const [confirmInput, setConfirmInput] = useState('');
        // NOTE: Strictly require typing "EXIT" on exit attempts
        const requiredText = requireTyping ? "EXIT" : user?.username || user?.name || "CONFIRM";
        const isMatch = confirmInput.trim().toUpperCase() === requiredText.toUpperCase();
        
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in scale-95 duration-200">
                    <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                    <h3 className="text-xl font-bold text-center mb-2">Confirmation</h3>
                    <p className="text-slate-600 text-center mb-6">{message}</p>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{requireTyping ? "Type EXIT to confirm" : "Type your username to confirm"}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder={requireTyping ? "EXIT" : "Enter your username"} className="w-full p-3 pl-10 border-2 border-slate-200 rounded-xl font-mono text-center font-bold tracking-widest focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all uppercase" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors">Cancel</button>
                        <button onClick={onConfirm} disabled={!isMatch} className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${isMatch ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>{isMatch ? <Check size={18}/> : <Lock size={18}/>} Confirm</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden transition-colors duration-500 ${view === 'scanner' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
            <style>{`@keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes scan-laser { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .animate-scan-laser { animation: scan-laser 2.5s ease-in-out infinite; }`}</style>
            {view !== 'scanner' && (<><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 -z-10"></div><div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div><div className="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div></>)}
            <div className="w-full h-full relative z-10 flex items-center justify-center">
                {view === 'splash' && renderSplash()}
                {view === 'selection' && renderSelection()}
                {view === 'preview' && renderPreview()}
                {view === 'scanner' && renderScanner()}
                {view === 'summary' && renderSummary()}
            </div>
            {/* FORCE 'EXIT' TYPING WHEN EXITING SESSION */}
            {showExitModal && <ConfirmModal message="Are you sure you want to end this session? All unsaved data will be lost." requireTyping={true} onConfirm={handleExitSession} onCancel={handleCancelExit} />}
            {showFinishConfirm && <ConfirmModal message="Finish scanning and submit attendance?" requireTyping={false} onConfirm={submitAttendance} onCancel={() => setShowFinishConfirm(false)} />}
            {userMsg.text && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-3 animate-fade-in border border-slate-200">{userMsg.type === 'error' ? <AlertTriangle className="text-red-500"/> : <Info className="text-blue-500"/>}<p className="font-medium text-slate-800">{userMsg.text}</p><button onClick={() => setUserMsg({text: null})}><XCircle className="w-5 h-5 text-slate-400"/></button></div>}
        </div>
    );
}