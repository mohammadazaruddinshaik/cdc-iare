import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import {
    Check, Lock, Users, UserCheck, UserX, LogOut, ScanLine, ArrowRight, BookOpen,
    ChevronDown, Group, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2,
    ShieldQuestion, CameraOff, Info
} from 'lucide-react';

// --- GLOBAL CONFIGURATION ---
const BACKEND_URL = "http://localhost:5000"; 
const getFormattedDate = () => new Date().toISOString().split('T')[0];
const COURSES = ["CP", "JFS", "DBMS", "AWS"];

const ROLE_CONFIG = {
    faculty: {
        title: "Faculty Attendance Portal",
        sessionTitle: "Create Session",
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
        ],
        dashboardPath: '/faculty/dashboard',
        formatCollection: (batchValue) => `attendance_${batchValue.toLowerCase().replace(' batch', '')}`
    },
    admin: {
        title: "Admin Attendance Portal",
        sessionTitle: "Create Admin Session",
        reportTitle: "Admin Attendance Report",
        verificationTitle: "Admin Verification",
        idPlaceholder: "Enter Admin ID",
        apiPath: '/api/Admin/Mark-Attendance',
        batches: [
            { value: "attendance_skillup-1", label: "Skillup-1" }, { value: "attendance_skillup-2", label: "Skillup-2" }, { value: "attendance_skillup-3", label: "Skillup-3" },
            { value: "attendance_skillnext-1", label: "Skillnext-1" }, { value: "attendance_skillnext-2", label: "Skillnext-2" }, { value: "attendance_skillnext-3", label: "Skillnext-3" },
            { value: "attendance_skillbridge-1", label: "Skillbridge-1" }, { value: "attendance_skillbridge-2", label: "Skillbridge-2" }, { value: "attendance_skillbridge-3", label: "Skillbridge-3" }, { value: "attendance_skillbridge-4", label: "Skillbridge-4" }, { value: "attendance_skillbridge-5", label: "Skillbridge-5" }
        ],
        dashboardPath: '/admin/dashboard',
        formatCollection: (batchValue) => batchValue
    }
};

// --- API HELPER ---
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
            throw new Error(`Cannot connect to the server at ${BACKEND_URL}. Please check your network connection.`);
        }
        throw networkError;
    }
}

// --- REUSABLE UI COMPONENTS ---
const AttendanceDonutChart = ({ present, total }) => {
    const percentage = total > 0 ? (present / total) * 100 : 0;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-200" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
                <circle
                    className="text-green-500 transition-all duration-1000 ease-out"
                    strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" stroke="currentColor" fill="transparent"
                    r="54" cx="60" cy="60" transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-gray-700">{percentage.toFixed(0)}%</span>
                <span className="text-sm text-gray-500">Present</span>
            </div>
        </div>
    );
};

const UserMessageModal = ({ message, type, onClose }) => {
    if (!message) return null;
    const icons = { error: <XCircle size={48} className="mx-auto text-red-500 mb-4" />, info: <Info size={48} className="mx-auto text-blue-500 mb-4" /> };
    const titles = { error: "An Error Occurred", info: "Please Note" };
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
                {icons[type] || icons.info}
                <h3 className="text-xl font-bold text-slate-900">{titles[type] || titles.info}</h3>
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
                <p className="text-slate-600 mt-2 mb-6">Are you sure? All scanned data will be lost and you will return to the dashboard.</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Stay</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">Yes, Exit</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN ATTENDANCE COMPONENT ---
const PostAttendancePage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('splash');
    const [config, setConfig] = useState(ROLE_CONFIG.faculty);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [scanResult, setScanResult] = useState({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
    const [scanCount, setScanCount] = useState(0);
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [idInput, setIdInput] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [userMessage, setUserMessage] = useState({ text: null, type: 'info' });

    const scannerRef = useRef(null);
    const validStudents = useRef(new Set());
    const scannedData = useRef(new Map());
    const isStoppingScanner = useRef(false);
    
    useEffect(() => {
        const userRole = localStorage.getItem("userRole") || 'faculty';
        setConfig(ROLE_CONFIG[userRole] || ROLE_CONFIG.faculty);
    }, []);

    useEffect(() => {
        if (view === 'analytics' && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    }, [view]);

    useEffect(() => {
        const stopScanner = async () => {
            if (scannerRef.current && !isStoppingScanner.current) {
                try {
                    const state = scannerRef.current.getState();
                    if (state === Html5QrcodeScannerState.SCANNING) {
                        isStoppingScanner.current = true;
                        await scannerRef.current.stop();
                    }
                } catch (err) {
                    // This error is logged but doesn't stop the app. It's a known issue
                    // with the library when components re-render quickly.
                    console.log("Scanner stop error (ignorable):", err.message);
                } finally {
                    isStoppingScanner.current = false;
                }
            }
        };
        const startScanner = async () => {
            if (view !== 'scanner' || isScanningPaused) return;
            if (!document.getElementById('reader')) {
                setTimeout(startScanner, 100);
                return;
            }
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode('reader');
            }
            try {
                const state = scannerRef.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING) {
                    return;
                }
                const qrboxSize = window.innerWidth < 768 ? 220 : 300;
                const config = { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } };
                await scannerRef.current.start(
                    { facingMode: 'environment' },
                    config,
                    onScanSuccess
                );
            } catch (err) {
                setScanResult({ rollno: null, message: 'CAMERA ERROR', type: 'error', photoUrl: <CameraOff className="w-16 h-16 text-red-400" /> });
            }
        };

        if (view === 'scanner') startScanner();
        else stopScanner();

        return () => { stopScanner(); };
    }, [view, isScanningPaused]);

    const handleStartScanning = async (e) => {
        e.preventDefault();
        if (!selectedBatch || !selectedCourse) return;
        setView('loading');
        try {
            const collectionName = config.formatCollection(selectedBatch);
            const url = `${BACKEND_URL}/api/Admin/getStudentsByBatch/${collectionName}`;
            const data = await fetchApi(url);
            if (!data || !Array.isArray(data.students)) {
                throw new Error("Data format from server is invalid.");
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

    const onScanSuccess = (decodedText) => {
        if (isScanningPaused) return;
        setIsScanningPaused(true);
        let result;
        let rollno = null;
        try {
            const parsedData = JSON.parse(decodedText);
            if (parsedData && typeof parsedData.rollno === 'string' && parsedData.rollno.trim()) {
                rollno = parsedData.rollno.trim().toUpperCase();
            } else {
                throw new Error("Invalid QR data structure.");
            }
        } catch (error) {
            result = { rollno: 'INVALID', message: 'Invalid QR Format', type: 'error' };
            setScanResult(result);
            setTimeout(() => {
                setScanResult({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
                setIsScanningPaused(false);
            }, 3000);
            return;
        }

        if (scannedData.current.has(rollno)) {
            result = { rollno, message: 'Already Scanned', type: 'warning' };
        } else if (!validStudents.current.has(rollno)) {
            result = { rollno, message: 'Not from this batch', type: 'error' };
        } else {
            let hashValue = "";
            try {
                const parsed = JSON.parse(decodedText);
                hashValue = parsed.hash || "";
            } catch {}
            scannedData.current.set(rollno, hashValue);
            setScanCount(scannedData.current.size);
            const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollno}/${rollno}.jpg`;
            result = { rollno, message: 'Verified!', type: 'success', photoUrl };
        }
        setScanResult(result);
        setTimeout(() => {
            setScanResult({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
            setIsScanningPaused(false);
        }, 3000);
    };

    const handleProcessReport = async () => {
        const storedId = localStorage.getItem("userIdentifier");
        if (idInput.trim().toLowerCase() !== storedId?.toLowerCase()) {
            setUserMessage({ text: "The ID you entered does not match. Please try again.", type: 'error' });
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
            });
            setReportData({ ...result });
            setIsVerificationModalOpen(false);
            setView('analytics');
        } catch (error) {
            setUserMessage({ text: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEnterFullScreen = () => { document.documentElement.requestFullscreen().catch(() => {}); setView('selection'); };
    const handleConfirmExit = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        navigate(config.dashboardPath);
    };

    // --- RENDER FUNCTIONS ---
    const renderSplashView = () => (
        <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{config.title}</h1>
            <p className="text-gray-500 mt-4 text-lg sm:text-xl">Click below to start a new session.</p>
            <button onClick={handleEnterFullScreen} className="mt-8 bg-blue-600 text-white py-4 px-12 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto">
                <ArrowRight size={24} /> Start Session
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
        <div className="w-full max-w-md mx-auto transition-all duration-500 animate-fade-in p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border-4 border-gray-50 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{config.sessionTitle}</h1>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Select a batch and course to begin</p>
                <form onSubmit={handleStartScanning} className="space-y-6 text-left mt-8">
                    <div className="relative">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Batch</label>
                        <Group className="absolute left-4 top-11 text-gray-400" size={20}/>
                        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
                            <option value="" disabled>Choose a batch...</option>
                            {config.batches.map(batch => <option key={batch.value} value={batch.value}>{batch.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-11 text-gray-400 pointer-events-none"/>
                    </div>
                    <div className="relative">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Course / Session</label>
                        <BookOpen className="absolute left-4 top-11 text-gray-400" size={20}/>
                        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
                            <option value="" disabled>Choose a course...</option>
                            {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-11 text-gray-400 pointer-events-none"/>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-4 mt-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                        <ScanLine size={24} /> Begin Scanning
                    </button>
                </form>
            </div>
        </div>
    );

    const renderScannerView = () => {
        const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
        return (
            <div className="w-full h-full max-w-sm md:max-w-md lg:max-w-lg mx-auto flex flex-col items-center gap-3 p-2 justify-center animate-fade-in text-white">
                <div className="w-full text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                    <p className="font-bold text-lg">{batchLabel}</p><p className="text-xs text-blue-300">{selectedCourse}</p>
                </div>
                <div className="relative w-full aspect-square bg-black/50 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border-2 border-white/10 scanner-container">
                    <div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div>
                    {!isScanningPaused && <div className="scanner-laser"></div>}
                    {isScanningPaused && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 rounded-2xl animate-fade-in text-center">
                            {scanResult.photoUrl && typeof scanResult.photoUrl === 'string' && (
                                <img src={scanResult.photoUrl} alt="Student" className="w-40 h-40 rounded-full border-4 border-green-400 object-cover mb-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            )}
                            {scanResult.type === 'error' && scanResult.message === 'CAMERA ERROR' && scanResult.photoUrl}
                            <p className="font-bold text-2xl tracking-wider text-white">{scanResult.rollno || '-----'}</p>
                            <p className={`font-semibold text-lg mt-1 ${scanResult.type === 'success' ? 'text-green-400' : scanResult.type === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>{scanResult.message}</p>
                        </div>
                    )}
                </div>
                <div className="w-full bg-black/30 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2"><UserCheck size={24}/><p className="font-semibold text-lg">Scanned</p></div>
                    <p className="font-bold text-4xl tracking-tighter">{scanCount}</p>
                </div>
                <button onClick={() => setIsVerificationModalOpen(true)} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 mt-1 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-3">
                    <Check size={24} /> Finish & Process
                </button>
                <button onClick={() => setIsExitModalOpen(true)} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm hover:bg-gray-500/50 transition flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Go Back to Dashboard
                </button>
            </div>
        );
    };

    const renderAnalyticsView = () => {
        if (!reportData) return <div className="text-white">Generating report...</div>;
        const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
        return (
            <div className="w-11/12 max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-gray-800 animate-fade-in">
                <div className="text-center">
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2"/>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Attendance Summary</h1>
                    <div className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-semibold text-gray-700">{batchLabel}</span>
                        <span className="mx-2">|</span>
                        <span className="font-semibold text-gray-700">{selectedCourse}</span>
                    </div>
                </div>
                
                <div className="my-8">
                    <AttendanceDonutChart present={reportData.presentiesCount || 0} total={reportData.totalMarked || 0} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="bg-blue-50 p-4 rounded-xl text-center"><Users className="mx-auto text-blue-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.totalMarked || 0}</p><p className="text-gray-500 font-semibold text-sm">Total Students</p></div>
                    <div className="bg-green-50 p-4 rounded-xl text-center"><UserCheck className="mx-auto text-green-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.presentiesCount || 0}</p><p className="text-gray-500 font-semibold text-sm">Present</p></div>
                    <div className="bg-red-50 p-4 rounded-xl text-center"><UserX className="mx-auto text-red-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.absenteesCount || 0}</p><p className="text-gray-500 font-semibold text-sm">Absent</p></div>
                </div>

                {Array.isArray(reportData.mismatchedStudents) && reportData.mismatchedStudents.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold text-lg mb-2 text-yellow-600 text-center">Mismatched Scans</h3>
                        <div className="h-24 bg-yellow-50 rounded-lg p-3 overflow-y-auto border border-yellow-200">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {reportData.mismatchedStudents.map(roll => (
                                    <span key={roll} className="bg-yellow-200 text-yellow-800 font-mono text-xs font-semibold px-2 py-1 rounded-full">{roll}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={() => navigate(config.dashboardPath)} className="w-full bg-gray-700 text-white py-3 mt-8 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3">
                    <LogOut size={24}/> Finish & Exit
                </button>
            </div>
        );
    };

    const renderVerificationModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm text-center text-gray-800 animate-fade-in">
                <Lock size={40} className="mx-auto text-blue-500 mb-4"/>
                <h3 className="font-bold text-2xl mb-2">{config.verificationTitle}</h3>
                <p className="text-gray-500 mb-6">Enter your ID to finalize the report.</p>
                <input type="password" value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder={config.idPlaceholder} className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-lg"/>
                <div className="flex gap-4">
                    <button onClick={() => setIsVerificationModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300" disabled={isSubmitting}>Cancel</button>
                    <button onClick={handleProcessReport} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center" disabled={!idInput || isSubmitting}>
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
        <div className="min-h-screen w-full flex items-center justify-center font-sans p-2 sm:p-4 relative overflow-hidden bg-gray-100">
            <style>{`
                .scanner-container { animation: pulse-border 2s infinite; }
                @keyframes pulse-border { 0%, 100% { border-color: rgba(59, 130, 246, 0.4); } 50% { border-color: rgba(59, 130, 246, 1); } }
                .scanner-laser {
                    position: absolute; top: 0; left: 0; right: 0;
                    height: 3px; background: #38bdf8;
                    box-shadow: 0 0 10px 2px #38bdf8;
                    animation: laser-beam 2s infinite linear;
                }
                @keyframes laser-beam { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } }
                @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
            {view !== 'splash' && view !== 'analytics' && (
                <div className="absolute inset-0 transition-opacity duration-500 opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div>
                </div>
            )}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {renderView()}
            </div>
            <UserMessageModal 
                message={userMessage.text} 
                type={userMessage.type} 
                onClose={() => setUserMessage({ text: null, type: 'info' })} 
            />
            {isVerificationModalOpen && renderVerificationModal()}
            <ExitConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={handleConfirmExit} />
        </div>
    );
};

export default PostAttendancePage;
