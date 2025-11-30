import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// --- ICONS (as SVG components) ---
const Check = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const Lock = ({ size = 40, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const UserCheck = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>;
const LogOut = ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const ScanLine = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="7" y1="12" x2="17" y2="12"></line></svg>;
const ArrowRight = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const BookOpen = ({ className, size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ChevronDown = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const Users = ({ size = 20, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ArrowLeft = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const CheckCircle2 = ({ size = 48, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const XCircle = ({ size = 48, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const AlertTriangle = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const Loader2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const ShieldQuestion = ({ size = 48, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const CameraOff = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>;
const Info = ({ size = 48, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const Eye = ({ size = 20, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOff = ({ size = 20, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>;


// --- GLOBAL CONFIGURATION & HELPERS ---
const BACKEND_URL = import.meta.env.VITE_BASE_URL;
const getFormattedDate = () => new Date().toISOString().split('T')[0];
const COURSES = ["CP", "JFS","DBS"];

const ROLE_CONFIG = {
    faculty: {
        title: "Faculty Attendance Portal",
        sessionTitle: "Mark Session Attendance",
        reportTitle: "Attendance Report",
        verificationTitle: "Faculty Verification",
        idPlaceholder: "Enter Faculty ID",
        apiPath: '/api/Faculty/Mark-Attendance',
        batches: [
            { value: "SKILLUP-1", label: "SKILLUP BATCH-1" },
            { value: "SKILLUP-2", label: "SKILLUP BATCH-2" },
            { value: "SKILLUP-3", label: "SKILLUP BATCH-3" },
            { value: "SKILLNEXT-1", label: "SKILLNEXT BATCH-1" },
            { value: "SKILLNEXT-2", label: "SKILLNEXT BATCH-2" },
            { value: "SKILLNEXT-3", label: "SKILLNEXT BATCH-3" },
            { value: "SKILLBRIDGE-1", label: "SKILLBRIDGE BATCH-1" },
            { value: "SKILLBRIDGE-2", label: "SKILLBRIDGE BATCH-2" },
            { value: "SKILLBRIDGE-3", label: "SKILLBRIDGE BATCH-3" },
            { value: "SKILLBRIDGE-4", label: "SKILLBRIDGE BATCH-4" },
            { value: "SKILLBRIDGE-5", label: "SKILLBRIDGE BATCH-5" },
            { value: "SKILLBRIDGE-6", label: "SKILLBRIDGE BATCH-6" }
        ],
        
        dashboardPath: '/faculty/dashboard',
        formatCollection: (batchValue) => `attendance_${batchValue.toLowerCase().replace(' batch', '')}`
    },
    admin: {
        title: "Admin Attendance Portal",
        sessionTitle: "Mark Session Attendance",
        reportTitle: "Admin Attendance Report",
        verificationTitle: "Admin Verification",
        idPlaceholder: "Enter Admin ID",
        apiPath: '/api/Admin/Mark-Attendance',
        batches: [
            { value: "attendance_skillup-1", label: "Skillup-1" },
            { value: "attendance_skillup-2", label: "Skillup-2" },
            { value: "attendance_skillup-3", label: "Skillup-3" },
            { value: "attendance_skillnext-1", label: "Skillnext-1" },
            { value: "attendance_skillnext-2", label: "Skillnext-2" },
            { value: "attendance_skillnext-3", label: "Skillnext-3" },
            { value: "attendance_skillbridge-1", label: "Skillbridge-1" },
            { value: "attendance_skillbridge-2", label: "Skillbridge-2" },
            { value: "attendance_skillbridge-3", label: "Skillbridge-3" },
            { value: "attendance_skillbridge-4", label: "Skillbridge-4" },
            { value: "attendance_skillbridge-5", label: "Skillbridge-5" },
            { value: "attendance_skillbridge-6", label: "Skillbridge-6" }
        ],
        dashboardPath: '/admin/dashboard',
        formatCollection: (batchValue) => batchValue
    }
};

async function fetchApi(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch (e) {
                errorBody = await response.text();
            }
            const errorMessage = typeof errorBody === 'object' && errorBody.message ? errorBody.message : `Server responded with status ${response.status}.`;
            throw new Error(errorMessage);
        }
        const contentType = response.headers.get("content-type");
        if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
            return null;
        }
        return response.json();
    } catch (networkError) {
        if (networkError.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to the server. Please check your network connection.`);
        }
        throw networkError;
    }
}

// --- UI COMPONENTS ---

const UserMessageModal = ({ message, type, onClose }) => {
    if (!message) return null;
    const icons = { error: <XCircle size={48} className="mx-auto text-red-500 mb-4" />, info: <Info size={48} className="mx-auto text-blue-500 mb-4" /> };
    const titles = { error: "An Error Occurred", info: "Please Note" };
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
                {icons[type] || <Info size={48} className="mx-auto text-blue-500 mb-4" />}
                <h3 className="text-xl font-bold text-slate-900">{titles[type] || 'Info'}</h3>
                <p className="text-slate-600 mt-2 mb-6 whitespace-pre-wrap">{message}</p>
                <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">Acknowledge</button>
            </div>
        </div>
    );
};

const ExitConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
                <ShieldQuestion size={48} className="mx-auto text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Exit Session?</h3>
                <p className="text-slate-600 mt-2 mb-6">Are you sure? Scanned data will be lost.</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Stay</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">Yes, Exit</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
function PostAttendancePage() {
    const navigate = useNavigate();
    const { Html5Qrcode } = window;

    const [view, setView] = useState('splash');
    const [config, setConfig] = useState(ROLE_CONFIG.faculty);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [scanResult, setScanResult] = useState({ rollno: null, message: 'Point camera at QR code', type: 'info' });
    const [scanCount, setScanCount] = useState(0);
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [idInput, setIdInput] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [userMessage, setUserMessage] = useState({ text: null, type: 'info' });
    const [lastSuccessfulScan, setLastSuccessfulScan] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [isIdVisible, setIsIdVisible] = useState(false);

    const validStudents = useRef(new Set());
    const scannedData = useRef(new Map());
    const onScanSuccessRef = useRef(null);
    
    useEffect(() => {
        const userRole = sessionStorage.getItem("userRole") || 'faculty';
        setConfig(ROLE_CONFIG[userRole] || ROLE_CONFIG.faculty);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (scannedData.current.size > 0) {
                const message = "You have unsaved attendance data. Are you sure you want to leave?";
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    useEffect(() => {
        const manageFullscreen = async () => {
            try {
                if (view === 'scanner' && !document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                } else if (view !== 'scanner' && document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            } catch (err) {
                console.warn("Fullscreen management failed:", err.message);
            }
        };
        manageFullscreen();
    }, [view]);

    const onScanSuccess = useCallback((decodedText) => {
        if (isScanningPaused) return;
        setIsScanningPaused(true);
        let result;
        let rollno = null;

        try {
            const parsedData = JSON.parse(decodedText);
            rollno = parsedData?.rollno?.trim().toUpperCase();
            if (!rollno) throw new Error("Invalid QR data structure.");
        } catch (error) {
            result = { rollno: 'INVALID', message: 'Invalid QR Format', type: 'error' };
        }

        if (!result) {
            if (scannedData.current.has(rollno)) {
                result = { rollno, message: 'Already Scanned', type: 'warning' };
            } else if (!validStudents.current.has(rollno)) {
                result = { rollno, message: 'Not from this batch', type: 'error' };
            } else {
                const hashValue = JSON.parse(decodedText).hash || "";
                scannedData.current.set(rollno, hashValue);
                setScanCount(scannedData.current.size);
                const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollno}/${rollno}.jpg`;
                
                const img = new Image(); // Preload image
                img.src = photoUrl;
                
                result = { rollno, message: 'Verified!', type: 'success', photoUrl };
                setLastSuccessfulScan({ rollno, photoUrl });
            }
        }
        
        setScanResult(result);
        setTimeout(() => {
            setScanResult({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
            setIsScanningPaused(false);
        }, 2500);
    }, [isScanningPaused]);

    onScanSuccessRef.current = onScanSuccess;

    useEffect(() => {
        if (view !== 'scanner') {
            return;
        }

        if (!Html5Qrcode) {
            setCameraError("QR scanning library not available. Please refresh.");
            return;
        }

        let isMounted = true;
        setCameraError(null);
        
        const html5QrCode = new Html5Qrcode('reader');

        const stableOnScanSuccessProxy = (decodedText, decodedResult) => {
            onScanSuccessRef.current(decodedText, decodedResult);
        };

        const startCamera = async () => {
            try {
                const qrboxSize = window.innerWidth < 768 ? 250 : 300;
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } },
                    stableOnScanSuccessProxy
                );
            } catch (err) {
                console.error("Camera start failed:", err);
                if (isMounted) {
                    let message = "Could not start the camera.";
                    if (err.name === "NotAllowedError") {
                        message = "Camera permission denied. Please allow access in browser settings.";
                    } else if (err.name === "NotFoundError") {
                        message = "No camera was found on this device.";
                    } else if (err.name === "NotReadableError") {
                        message = "Camera is already in use or a hardware error occurred.";
                    }
                    setCameraError(message);
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(error => {
                    console.error("Failed to stop the QR scanner.", error);
                });
            }
        };
    }, [view, Html5Qrcode]);

    const handleStartScanning = async (e) => {
        e.preventDefault();
        if (!selectedBatch || !selectedCourse) return;
        setView('loading');
        setLastSuccessfulScan(null);

        try {
            const collectionName = config.formatCollection(selectedBatch);
            const userRole = sessionStorage.getItem("userRole") || 'faculty';
            const apiUrl = `${BACKEND_URL}/api/${userRole === 'admin' ? 'Admin' : 'Faculty'}/getStudentsByBatch/${collectionName}`;
            
            const data = await fetchApi(apiUrl, { method: "GET", credentials: "include" });

            if (!data || !Array.isArray(data.students)) {
                throw new Error("Invalid student data from server.");
            }
            validStudents.current = new Set(data.students);
            scannedData.current = new Map();
            setScanCount(0);
            setView('scanner');
        } catch (error) {
            setUserMessage({ text: error.message, type: 'error' });
            setView('selection');
        }
    };

    const handleProcessReport = async () => {
        const storedId = sessionStorage.getItem("userIdentifier");
        if (!idInput || idInput.trim().toLowerCase() !== storedId?.toLowerCase()) {
            setUserMessage({ text: "The ID you entered does not match.", type: 'error' });
            return;
        }
        setIsSubmitting(true);

        const requestBody = {
            collectionName: config.formatCollection(selectedBatch),
            date: getFormattedDate(),
            course: selectedCourse,
            presentMap: Object.fromEntries(scannedData.current)
        };
        try {
            const url = `${BACKEND_URL}${config.apiPath}`;
            const result = await fetchApi(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                credentials: "include"
            });
            setReportData(result);
            scannedData.current.clear();
            setIsVerificationModalOpen(false);
            setView('analytics');
        } catch (error) {
            setUserMessage({ text: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmExit = () => navigate(config.dashboardPath);
    
    // --- RENDER FUNCTIONS ---
    const renderSplashView = () => (
        <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{config.title}</h1>
            <p className="text-gray-500 mt-4 text-lg sm:text-xl">Click below to start a new session.</p>
            <button onClick={() => setView('selection')} className="mt-8 bg-blue-600 text-white py-4 px-12 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto">
                <ArrowRight /> Start Session
            </button>
        </div>
    );
    
    const renderLoadingView = () => (
        <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <h2 className="text-2xl font-bold">Preparing Session...</h2>
            <p className="text-blue-300 mt-2">Fetching student list for {selectedCourse}.</p>
        </div>
    );

    const renderSelectionView = () => (
        <div className="w-full max-w-lg mx-auto transition-all duration-500 animate-fade-in p-4 relative">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse animation-delay-2000"></div>
            <div className="bg-gradient-to-br from-white/90 to-gray-100/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-200 text-center">
                <div className="relative w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
                    <BookOpen className="w-12 h-12" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 animate-fade-in">{config.sessionTitle}</h1>
                <p className="text-gray-500 mt-3 text-base sm:text-lg animate-fade-in">Select a batch and course to begin.</p>
                <form onSubmit={handleStartScanning} className="space-y-6 text-left mt-10">
                    <div className="animate-fade-in">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Batch</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Users className="text-gray-400" size={20} />
                            </span>
                            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer">
                                <option value="" disabled>Choose a batch...</option>
                                {config.batches.map(batch => <option key={batch.value} value={batch.value}>{batch.label}</option>)}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="text-gray-400 w-5 h-5" />
                            </span>
                        </div>
                    </div>
                    <div className="animate-fade-in">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Course / Session</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <BookOpen className="text-gray-400" size={20}/>
                            </span>
                            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer">
                                <option value="" disabled>Choose a course...</option>
                                {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="text-gray-400 w-5 h-5" />
                            </span>
                        </div>
                    </div>
                    <div className="animate-fade-in pt-4">
                        <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-3">
                            <ScanLine /> Begin Scanning
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    
    const renderScannerView = () => {
        const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
        const borderColor = {
            info: 'border-blue-400',
            success: 'border-green-500',
            warning: 'border-yellow-500',
            error: 'border-red-500',
        }[scanResult.type] || 'border-blue-400';

        return (
            <div className="w-full h-full flex flex-col items-center gap-2 p-2 justify-center animate-fade-in text-white">
                <div className="w-full max-w-sm flex flex-col gap-2">
                    <div className="w-full text-center bg-black/30 backdrop-blur-sm p-1 rounded-xl border border-white/10">
                        <p className="font-bold text-md">{batchLabel}</p><p className="text-xs text-blue-300">{selectedCourse}</p>
                    </div>
                    <div className={`relative w-full aspect-square bg-black rounded-3xl p-2 shadow-2xl border-4 ${cameraError ? 'border-red-500' : borderColor} transition-colors duration-300`}>
                        <div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div>
                        
                        {cameraError && (
                             <div className="absolute inset-2 flex flex-col items-center justify-center bg-black/80 text-center p-4 rounded-2xl">
                                <CameraOff className="w-16 h-16 text-red-400 mb-4"/>
                                <p className="font-bold text-red-400">Camera Failed to Start</p>
                                <p className="text-sm text-white mt-2">{cameraError}</p>
                            </div>
                        )}

                        {!isScanningPaused && !cameraError && <div className="scanner-laser"></div>}
                        
                        {isScanningPaused && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 rounded-2xl animate-fade-in text-center">
                                {scanResult.photoUrl ? (
                                    <img src={scanResult.photoUrl} alt="Student" className={`w-24 h-24 rounded-full border-4 ${borderColor} object-cover mb-3`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : null}
                                <p className="font-bold text-xl tracking-wider text-white">{scanResult.rollno || '-----'}</p>
                                <p className={`font-semibold text-md mt-1 ${scanResult.type === 'success' ? 'text-green-400' : scanResult.type === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>{scanResult.message}</p>
                            </div>
                        )}
                    </div>
                    {lastSuccessfulScan && (
                        <div className="w-full bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-green-400/50 flex items-center gap-3 animate-fade-in">
                            <img src={lastSuccessfulScan.photoUrl} alt="Last Scanned" className="w-12 h-12 rounded-full border-2 border-green-400 object-cover" onError={(e) => { e.currentTarget.classList.add('hidden'); }} />
                            <div>
                                <p className="text-xs text-green-300 font-semibold">LAST SCANNED</p>
                                <p className="font-bold text-xl tracking-wider">{lastSuccessfulScan.rollno}</p>
                            </div>
                        </div>
                    )}
                    <div className="w-full bg-black/30 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2"><UserCheck size={20}/> Scanned</div>
                        <p className="font-bold text-3xl tracking-tighter">{scanCount}</p>
                    </div>
                    <button onClick={() => setIsVerificationModalOpen(true)} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50" disabled={scanCount === 0}>
                        <Check /> Finish & Process
                    </button>
                    <button onClick={() => setIsExitModalOpen(true)} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                        <ArrowLeft /> Exit Session
                    </button>
                </div>
            </div>
        );
    };

    const renderAnalyticsView = () => {
        if (!reportData) return <div className="text-center text-gray-600"><Loader2 className="animate-spin w-8 h-8 mx-auto" /><p>Generating report...</p></div>;
        return (
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl text-gray-800 animate-fade-in overflow-hidden">
                <div className="p-6">
                    <div className="text-center">
                        <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Attendance Submitted</h1>
                        <p className="text-gray-500 mt-2">{reportData.message}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center my-8">
                        <div className="bg-blue-50 p-4 rounded-lg"><p className="text-3xl font-bold text-blue-600">{reportData.totalMarked || 0}</p><p className="text-sm font-semibold text-blue-500 mt-1">TOTAL</p></div>
                        <div className="bg-green-50 p-4 rounded-lg"><p className="text-3xl font-bold text-green-600">{reportData.presentiesCount || 0}</p><p className="text-sm font-semibold text-green-500 mt-1">PRESENT</p></div>
                        <div className="bg-red-50 p-4 rounded-lg"><p className="text-3xl font-bold text-red-600">{reportData.absenteesCount || 0}</p><p className="text-sm font-semibold text-red-500 mt-1">ABSENT</p></div>
                    </div>
                    {reportData.mismatchedStudents && reportData.mismatchedStudents.length > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                           <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                                <div>
                                    <p className="font-bold text-yellow-800">Mismatched QR Codes</p>
                                    <p className="text-sm text-yellow-700">Invalid QRs: {reportData.mismatchedStudents.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t">
                    <button onClick={() => navigate(config.dashboardPath)} className="w-full bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3">
                        <LogOut /> Return to Dashboard
                    </button>
                </div>
            </div>
        );
    };
    
    const renderVerificationModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center animate-fade-in">
                <Lock className="mx-auto text-blue-500 mb-4" />
                <h3 className="font-bold text-2xl mb-2">{config.verificationTitle}</h3>
                <p className="text-gray-500 mb-6">Enter your ID to finalize.</p>
                <div className="relative w-full mb-6">
                    <input 
                        type={isIdVisible ? 'text' : 'password'} 
                        value={idInput} 
                        onChange={(e) => setIdInput(e.target.value)} 
                        placeholder={config.idPlaceholder} 
                        className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="button"
                        onClick={() => setIsIdVisible(!isIdVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800 focus:outline-none"
                        aria-label="Toggle ID visibility"
                    >
                        {isIdVisible ? <EyeOff /> : <Eye />}
                    </button>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setIsVerificationModalOpen(false)} className="flex-1 bg-gray-200 py-3 rounded-lg font-semibold" disabled={isSubmitting}>Cancel</button>
                    <button onClick={handleProcessReport} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center" disabled={!idInput || isSubmitting}>
                        {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Processing...</> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderView = () => {
        switch (view) {
            case 'splash': return renderSplashView();
            case 'selection': return renderSelectionView();
            case 'loading': return renderLoadingView();
            case 'scanner': return renderScannerView();
            case 'analytics': return renderAnalyticsView();
            default: return renderSplashView();
        }
    };
    
     return (
        <div className={`min-h-screen w-full flex items-center justify-center font-sans p-2 sm:p-4 relative overflow-hidden bg-gray-100`}>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .scanner-laser {
                    position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #38bdf8;
                    box-shadow: 0 0 10px 2px #38bdf8; animation: laser-beam 2.5s infinite linear;
                }
                @keyframes laser-beam { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
             {(view === 'loading' || view === 'scanner' || view === 'selection') && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div>
            )}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {renderView()}
            </div>
            <UserMessageModal message={userMessage.text} type={userMessage.type} onClose={() => setUserMessage({ text: null, type: 'info' })} />
            {isVerificationModalOpen && renderVerificationModal()}
            <ExitConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={handleConfirmExit} />
        </div>
    );
};

export default PostAttendancePage;