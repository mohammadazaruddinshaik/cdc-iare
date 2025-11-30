import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import {
    ScanLine, ArrowRight, CheckCircle,
    Loader2, ShieldQuestion, CameraOff,
    Check, ArrowLeft, Layers, ChevronDown, UserCheck, XCircle, CheckCircle2, AlertTriangle
} from 'lucide-react';

// --- GLOBAL CONFIGURATION ---
const BACKEND_URL = import.meta.env.VITE_BASE_URL || ''; // Your backend URL
const getFormattedDate = () => new Date().toISOString().split('T')[0];

// --- API HELPER ---
async function fetchApi(url, options = {}) {
    try {
        const response = await fetch(url, { ...options, credentials: 'include' });
        if (!response.ok) {
            let errorBody;
            try { errorBody = await response.json(); } catch (e) { errorBody = await response.text(); }
            const errorMessage = typeof errorBody === 'object' && errorBody.message ? errorBody.message : `Server responded with status ${response.status}.`;
            throw new Error(errorMessage);
        }
        if (response.status === 204) return null;
        return response.json();
    } catch (networkError) {
        if (networkError.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to the server. Please check your network connection.`);
        }
        throw networkError;
    }
}

const batchWiseTimetable = {
    "SKILLUP BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5102" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ]
    },
    "SKILLUP BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5106" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ]
    },
    "SKILLUP BATCH-3": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5104" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ]
    },
    "SKILLNEXT BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5204" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5204" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5204" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5204" } ]
    },
     "SKILLNEXT BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5104" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ]
    },
    "SKILLNEXT BATCH-3": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5102" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ]
    },
    "SKILLBRIDGE BATCH-1": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5101" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ]
    },
    "SKILLBRIDGE BATCH-2": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5005" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5005" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5005" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5005" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5005" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5005" } ]
    },
    "SKILLBRIDGE BATCH-3": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5201" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5201" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5201" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5201" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5201" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5201" } ]
    },
    "SKILLBRIDGE BATCH-4": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5101" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ]
    },
    "SKILLBRIDGE BATCH-5": {
      Monday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
      Tuesday: [ { time: "1:15PM - 3:50PM", subject: "DBS", room: "5106" } ],
      Wednesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
      Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
      Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
      Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ]
    },
    "SKILLBRIDGE BATCH-6": {
      Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5301" } ],
      Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5301" } ],
      Wednesday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5301" } ],
      Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5301" } ],
      Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5301" } ],
      Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5301" } ]
    }
};

// const batchWiseTimetable = {
//     "SKILLUP BATCH-1": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5102" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "AWS", room: "5102" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ]
//     },
//     "SKILLUP BATCH-2": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "AWS", room: "5106" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5106" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ]
//     },
//     "SKILLUP BATCH-3": {
//       Monday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" } ],
//       Tuesday: [ { time: "1:15PM - 3:50PM", subject: "AWS", room: "5104" } ],
//       Wednesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ]
//     },
//     "SKILLNEXT BATCH-1": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5204" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5204" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5204" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5204" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5204" } ]
//     },
//     "SKILLNEXT BATCH-2": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5104" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5104" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5104" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5104" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5104" } ]
//     },
//     "SKILLNEXT BATCH-3": {
//       Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5102" } ],
//       Tuesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5102" } ],
//       Wednesday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5102" } ],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ]
//     },
//     "SKILLBRIDGE BATCH-1": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5101" } ]
//     },
//     "SKILLBRIDGE BATCH-2": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5005" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5005" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5005" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5005" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5005" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5005" } ]
//     },
//     "SKILLBRIDGE BATCH-3": {
//       Monday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5201" } ],
//       Tuesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5201" } ],
//       Wednesday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5201" } ],
//       Thursday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5201" } ],
//       Friday: [ { time: "1:15PM - 3:50PM", subject: "DBMS", room: "5201" } ],
//       Saturday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5201" } ]
//     },
//     "SKILLBRIDGE BATCH-4": {
//       Monday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5101" } ],
//       Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
//       Wednesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5101" } ],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5101" } ]
//     },
//     "SKILLBRIDGE BATCH-5": {
//       Monday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
//       Tuesday: [ { time: "1:15PM - 3:50PM", subject: "CP", room: "5106" } ],
//       Wednesday: [ { time: "1:15PM - 3:50PM", subject: "JFS", room: "5106" } ],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "DBMS", room: "5106" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ]
//     }
// };

// const batchWiseTimetable = {
//     "SKILLUP BATCH-1": {
//       Monday: [],
//       Tuesday: [],
//       Wednesday: [],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5102" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5102" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5102" } ]
//     },
//     "SKILLNEXT BATCH-1": {
//       Monday: [],
//       Tuesday: [],
//       Wednesday: [],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5101" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5101" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5101" } ]
//     },
//     "SKILLNEXT BATCH-2": {
//       Monday: [],
//       Tuesday: [],
//        Wednesday: [],
//       Thursday: [ { time: "9:30AM - 12:15PM", subject: "JFS", room: "5106" } ],
//       Friday: [ { time: "9:30AM - 12:15PM", subject: "CP", room: "5106" } ],
//       Saturday: [ { time: "9:30AM - 12:15PM", subject: "DBS", room: "5106" } ]
//     }
// };

const formatBatchLabel = (fullName) => {
    const parts = fullName.split(' ');
    if (parts.length < 2) return fullName;
    const name = parts[0];
    const number = parts[1].split('-')[1];
    let prefix = '';
    if (name.startsWith('SKILLUP')) prefix = 'SU';
    else if (name.startsWith('SKILLNEXT')) prefix = 'SN';
    else if (name.startsWith('SKILLBRIDGE')) prefix = 'SB';
    else return fullName;
    return `${prefix}-${number}`;
};

const formatBatchForApi = (fullName) => `attendance_${fullName.toLowerCase().replace(' batch', '')}`;

const BATCHES = Object.keys(batchWiseTimetable).map(key => ({
    value: key,
    label: key,
    display: formatBatchLabel(key)
}));

const ExitConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
                <ShieldQuestion size={48} className="mx-auto text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Exit Session?</h3>
                <p className="text-slate-600 mt-2 mb-6">All scanned data for this session will be lost. Are you sure you want to exit?</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Stay</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">Yes, Exit</button>
                </div>
            </div>
        </div>
    );
};

const UserMessageModal = ({ message, type, onClose }) => {
    if (!message) return null;
    const icons = { error: <XCircle size={48} className="mx-auto text-red-500 mb-4" /> };
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
                {icons[type]}
                <h3 className="text-xl font-bold text-slate-900">An Error Occurred</h3>
                <p className="text-slate-600 mt-2 mb-6 whitespace-pre-wrap">{message}</p>
                <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">Acknowledge</button>
            </div>
        </div>
    );
};

const MultiBatchAttendancePage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('splash');
    const [tempSelectedBatches, setTempSelectedBatches] = useState([]);
    const [selections, setSelections] = useState([]);
    const [globalCourse, setGlobalCourse] = useState('');
    const [activeSession, setActiveSession] = useState(null);
    const [scanResult, setScanResult] = useState({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
    const [lastScanned, setLastScanned] = useState(null);
    const [scanCount, setScanCount] = useState(0);
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [userMessage, setUserMessage] = useState({ text: null, type: 'info' });
    
    const scannerRef = useRef(null);
    const isStoppingScanner = useRef(false);
    const validStudents = useRef(new Map());
    const scannedData = useRef(new Map());

    // --- State & Logic Hooks ---
    useEffect(() => {
        try { const savedState = sessionStorage.getItem('attendanceSession'); if (savedState) { const { savedTempBatches, savedSelections } = JSON.parse(savedState); setTempSelectedBatches(savedTempBatches || []); setSelections(savedSelections || []); } } catch (error) { console.error("Failed to parse saved session state:", error); sessionStorage.removeItem('attendanceSession'); }
    }, []);

    useEffect(() => {
        const stateToSave = { savedTempBatches: tempSelectedBatches, savedSelections: selections };
        sessionStorage.setItem('attendanceSession', JSON.stringify(stateToSave));
    }, [tempSelectedBatches, selections]);
    
    useEffect(() => {
        const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
        const currentSelectionsMap = new Map(selections.map(s => [s.batch, s.course]));
        const newSelections = tempSelectedBatches.map(batchValue => {
            const todaysSchedule = batchWiseTimetable[batchValue]?.[today];
            return { batch: batchValue, course: currentSelectionsMap.get(batchValue) || (todaysSchedule?.length > 0 ? todaysSchedule[0].subject : '') };
        });
        setSelections(newSelections);
    }, [tempSelectedBatches]);

    useEffect(() => {
        if (globalCourse) setSelections(prev => prev.map(s => ({ ...s, course: globalCourse })));
    }, [globalCourse]);

    // --- Browser Event Hooks ---
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (scannedData.current.size > 0) {
                const message = "Are you sure you want to refresh? All unsaved attendance data for this session will be lost.";
                event.preventDefault();
                event.returnValue = message;
                return message;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // --- Scanner Lifecycle Hook ---
    useEffect(() => {
        const stopScanner = async () => { if (scannerRef.current && !isStoppingScanner.current) { try { const state = scannerRef.current.getState(); if (state === Html5QrcodeScannerState.SCANNING) { isStoppingScanner.current = true; await scannerRef.current.stop(); } } catch (err) { console.log("Scanner stop error (ignorable):", err.message); } finally { isStoppingScanner.current = false; } } };
        const startScanner = async () => { if (view !== 'scanner' || isScanningPaused) return; if (!document.getElementById('reader')) { setTimeout(startScanner, 100); return; } if (!scannerRef.current) { scannerRef.current = new Html5Qrcode('reader', { experimentalFeatures: { useOffscreenCanvas: true } }); } try { const state = scannerRef.current.getState(); if (state === Html5QrcodeScannerState.SCANNING) return; const qrboxSize = window.innerWidth < 768 ? 280 : 320; const config = { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } }; await scannerRef.current.start({ facingMode: 'environment' }, config, onScanSuccess); } catch (err) { setScanResult({ rollno: null, message: 'CAMERA ERROR', type: 'error', photoUrl: <CameraOff className="w-16 h-16 text-red-400" /> }); } };
        if (view === 'scanner') startScanner(); else stopScanner();
        return () => { stopScanner(); };
    }, [view, isScanningPaused]);

    // --- Event Handlers ---
    const handleBatchToggle = (batchValue) => { setTempSelectedBatches(prev => prev.includes(batchValue) ? prev.filter(b => b !== batchValue) : [...prev, batchValue]); };
    const handleAllBatchesToggle = () => { setTempSelectedBatches(prev => prev.length === BATCHES.length ? [] : BATCHES.map(b => b.value)); };
    const handleCourseChange = (index, courseValue) => { const newSelections = [...selections]; newSelections[index].course = courseValue; setSelections(newSelections); setGlobalCourse(''); };
    const handleConfirmExit = () => { sessionStorage.removeItem('attendanceSession'); navigate('/admin/dashboard'); }
    const handleEnterFullScreen = () => { document.documentElement.requestFullscreen().catch(() => {}); setView('selection'); };

    const handleStartScanning = async (e) => {
        e.preventDefault();
        if (selections.some(s => !s.course)) { setUserMessage({ text: 'Please assign a course to every selected batch.', type: 'error' }); return; }
        setView('loading');
        try {
            const batchApiNames = selections.map(s => formatBatchForApi(s.batch));
            const url = `${BACKEND_URL}/api/Faculty/getStudentsByBatches?batches=${batchApiNames.join(',')}`;
            const data = await fetchApi(url);
            const studentMap = new Map();
            for (const batchApiName in data.batches) {
                data.batches[batchApiName].students.forEach(studentRollNo => {
                    studentMap.set(studentRollNo, batchApiName);
                });
            }
            validStudents.current = studentMap;
            setActiveSession(selections);
            scannedData.current = new Map();
            setScanCount(0);
            setLastScanned(null);
            sessionStorage.removeItem('attendanceSession');
            setView('scanner');
        } catch (error) {
            setUserMessage({ text: error.message, type: 'error' });
            setView('selection');
        }
    };
    
    const onScanSuccess = (decodedText) => {
        if (isScanningPaused) return;
        setIsScanningPaused(true);
        let result, rollno = null;
        try { const parsedData = JSON.parse(decodedText); rollno = parsedData?.rollno?.trim().toUpperCase(); if (!rollno) throw new Error("Invalid QR."); } catch (error) { result = { rollno: 'INVALID', message: 'Invalid QR Format', type: 'error' }; }
        
        if (rollno) {
            const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollno}/${rollno}.jpg`;
            if (scannedData.current.has(rollno)) { 
                result = { rollno, message: 'Already Scanned', type: 'warning', photoUrl };
            } else if (!validStudents.current.has(rollno)) { 
                result = { rollno, message: 'Not in this session', type: 'error', photoUrl };
            } else {
                const hashValue = JSON.parse(decodedText).hash || "";
                scannedData.current.set(rollno, hashValue);
                setScanCount(scannedData.current.size);
                result = { rollno, message: 'Verified!', type: 'success', photoUrl };
            }
        }
        
        setLastScanned({ rollno: result.rollno, photoUrl: result.photoUrl, type: result.type });
        setScanResult(result);
        setTimeout(() => { setScanResult({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null }); setIsScanningPaused(false); }, 2500);
    };

    const handleFinishAndPost = async () => {
        setIsSubmitting(true);
        const requestBody = { date: getFormattedDate(), batches: {} };
        const selectionsMap = new Map(selections.map(s => [formatBatchForApi(s.batch), s.course]));
        for (const [rollno, hash] of scannedData.current.entries()) {
            const batchApiName = validStudents.current.get(rollno);
            if (batchApiName) {
                if (!requestBody.batches[batchApiName]) {
                    requestBody.batches[batchApiName] = { course: selectionsMap.get(batchApiName) || '', presentMap: {} };
                }
                requestBody.batches[batchApiName].presentMap[rollno] = hash;
            }
        }
        try {
            const url = `${BACKEND_URL}/api/Faculty/MarkAllBatchAttendance`;
            const result = await fetchApi(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            setReportData(result);
            setView('analytics');
        } catch (error) {
            setUserMessage({ text: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER FUNCTIONS ---
    const renderSplashView = () => ( <div className="text-center animate-fade-in"><h1 className="text-4xl sm:text-5xl font-bold text-gray-800">QR Attendance</h1><p className="text-gray-500 mt-4 text-lg sm:text-xl">Start a new scanning session.</p><button onClick={handleEnterFullScreen} className="mt-8 bg-blue-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"><ArrowRight size={22} /> Start Session</button></div> );
    const renderLoadingView = () => ( <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in"><Loader2 className="w-12 h-12 animate-spin mb-4" /> <h2 className="text-xl font-bold">Preparing Session...</h2> <p className="text-sm text-blue-300">Fetching student data.</p></div> );
    const renderSelectionView = () => { /* Unchanged from previous version */ const isAllBatchesSelected = tempSelectedBatches.length > 0 && tempSelectedBatches.length === BATCHES.length; const allPossibleCourses = [...new Set(selections.flatMap(s => [...new Set(Object.values(batchWiseTimetable[s.batch] || {}).flatMap(day => day.map(d => d.subject)))]) )].map(c => ({ value: c, label: c })); const selectStyles = "w-full bg-gray-100 border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"; return ( <> <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 pb-28"> <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8"> <div className="text-center mb-6"> <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Create Attendance Session</h1> <p className="text-gray-500 mt-2 text-sm font-semibold">STEP 1: SELECT BATCHES</p> </div> <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3"> <button type="button" onClick={handleAllBatchesToggle} className={`relative text-center p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isAllBatchesSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 hover:border-gray-300'}`}> {isAllBatchesSelected && <CheckCircle size={18} className="absolute top-1.5 right-1.5 text-indigo-600 bg-white rounded-full"/>} <Layers size={20} className={isAllBatchesSelected ? 'text-indigo-600' : 'text-gray-500'}/> <p className="font-bold text-xs sm:text-sm text-gray-800">All Batches</p> </button> {BATCHES.map(batch => { const isSelected = tempSelectedBatches.includes(batch.value); return ( <button type="button" key={batch.value} onClick={() => handleBatchToggle(batch.value)} className={`relative text-center p-3 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 hover:border-gray-300'}`}> {isSelected && <CheckCircle size={18} className="absolute top-1.5 right-1.5 text-blue-600 bg-white rounded-full"/>} <p className="font-bold text-sm sm:text-base text-gray-800">{batch.display}</p> </button>); })} </div> </div> {tempSelectedBatches.length > 0 && ( <div className="animate-fade-in mt-8 bg-white rounded-xl shadow-lg p-6 sm:p-8"> <div className="text-center mb-6"> <p className="text-gray-500 text-sm font-semibold">STEP 2: CONFIRM COURSES</p> </div> <div className="relative max-w-md mx-auto mb-6"> <select value={globalCourse} onChange={(e) => setGlobalCourse(e.target.value)} className={selectStyles}> <option value="">Optional: Apply a course to all...</option> {allPossibleCourses.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> <ChevronDown className="absolute right-3 top-1.2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> </div> <div className="space-y-3"> {selections.map((selection, index) => { const batchInfo = BATCHES.find(b => b.value === selection.batch); const courseOptions = [...new Set(Object.values(batchWiseTimetable[selection.batch] || {}).flatMap(day => day.map(d => d.subject)))].map(c => ({ value: c, label: c })); return ( <div key={selection.batch} className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0 p-3 border-t first:border-t-0"> <p className="w-full sm:w-1/2 font-semibold text-sm text-gray-800">{batchInfo?.label}</p> <div className="relative w-full sm:w-1/2"> <select value={selection.course} onChange={(e) => handleCourseChange(index, e.target.value)} className={selectStyles}> <option value="">Select a Course...</option> {courseOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> </div> </div> ); })} </div> </div> )} </div> {tempSelectedBatches.length > 0 && ( <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200"> <div className="max-w-4xl mx-auto"> <button onClick={handleStartScanning} disabled={selections.some(s => !s.course)} className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold text-base hover:bg-green-700 transition shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"> Start Scanning <ScanLine size={20} /> </button> </div> </div> )} </> ); };
    const renderAnalyticsView = () => { /* Unchanged from previous version */ if (!reportData) return <div className="text-center text-white"><Loader2 className="animate-spin w-8 h-8 mx-auto" /><p>Loading report...</p></div>; return ( <div className="w-full max-w-2xl bg-gray-50 rounded-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]"> <div className="p-6 text-center border-b"> <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2" /> <h1 className="text-2xl font-bold text-gray-800">Attendance Processed</h1> <p className="text-gray-500 mt-2">{reportData.message}</p> </div> <div className="flex-grow p-6 space-y-4 overflow-y-auto"> {reportData.results.map(result => { const batchLabel = BATCHES.find(b => formatBatchForApi(b.value) === result.batch)?.label || result.batch; if (result.status === 'skipped') { return ( <div key={result.batch} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg"> <h3 className="font-bold text-yellow-800">{batchLabel}</h3> <div className="flex items-center mt-2"> <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 shrink-0" /> <p className="text-sm text-yellow-700">{result.message}</p> </div> </div> ); } return ( <div key={result.batch} className="bg-white border rounded-lg p-4"> <h3 className="font-bold text-gray-800">{batchLabel}</h3> <div className="grid grid-cols-3 gap-4 text-center my-4"> <div className="bg-blue-50 p-2 rounded-lg"><p className="text-2xl font-bold text-blue-600">{result.totalMarked || 0}</p><p className="text-xs font-semibold text-blue-500 mt-1">TOTAL</p></div> <div className="bg-green-50 p-2 rounded-lg"><p className="text-2xl font-bold text-green-600">{result.presentiesCount || 0}</p><p className="text-xs font-semibold text-green-500 mt-1">PRESENT</p></div> <div className="bg-red-50 p-2 rounded-lg"><p className="text-2xl font-bold text-red-600">{result.absenteesCount || 0}</p><p className="text-xs font-semibold text-red-500 mt-1">ABSENT</p></div> </div> {result.mismatchedStudents?.length > 0 && ( <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-md"> <span className="font-semibold">Mismatched QRs:</span> {result.mismatchedStudents.join(', ')} </div> )} </div> ); })} </div> <div className="p-4 bg-gray-100 border-t"> <button onClick={() => navigate('/admin/dashboard')} className="w-full bg-gray-700 text-white py-3 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3">Done</button> </div> </div> ); };

    const renderScannerView = () => {
        if (!activeSession) { return <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in"><Loader2 className="w-12 h-12 animate-spin mb-4" /> <h2 className="text-xl font-bold">Initializing Scanner...</h2></div>; }
        const borderColor = { info: 'border-blue-400', success: 'border-green-500', warning: 'border-yellow-500', error: 'border-red-500' }[scanResult.type] || 'border-blue-400';
        const lastScannedBorder = { success: 'border-green-400', warning: 'border-yellow-400', error: 'border-red-400' }[lastScanned?.type] || 'border-gray-500';

        return (
            <div className="w-full h-full md:max-w-md lg:max-w-lg mx-auto flex flex-col items-center gap-4 px-1 sm:p-2 justify-center animate-fade-in text-white">
                <div className="w-full text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                    <h2 className="font-bold text-lg">Multi-Batch Session</h2>
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {activeSession.map(s => (<div key={s.batch} className="bg-white/10 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{formatBatchLabel(s.batch)} - <span className="font-bold">{s.course}</span></div>))}
                    </div>
                </div>

                <div className={`relative w-full aspect-square bg-black rounded-3xl p-2 shadow-2xl border-4 ${borderColor} transition-colors duration-300`}>
                    <div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div>
                    {!isScanningPaused && <div className="scanner-laser"></div>}
                    {isScanningPaused && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 rounded-2xl animate-fade-in text-center">
                            {scanResult.photoUrl && typeof scanResult.photoUrl === 'string' ? ( <img src={scanResult.photoUrl} alt="Student" className={`w-32 h-32 rounded-full border-4 ${borderColor} object-cover mb-4`} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> ) : null}
                            <p className="font-bold text-2xl tracking-wider text-white">{scanResult.rollno || '-----'}</p>
                            <p className={`font-semibold text-lg mt-1 ${scanResult.type === 'success' ? 'text-green-400' : scanResult.type === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>{scanResult.message}</p>
                        </div>
                    )}
                </div>

                {lastScanned && (
                    <div className="w-full bg-black/30 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/10 flex items-center gap-4 animate-fade-in">
                        <img src={lastScanned.photoUrl} alt="Last Scanned" className={`w-12 h-12 rounded-full object-cover border-2 ${lastScannedBorder} bg-gray-700`} onError={(e) => { e.target.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; }} />
                        <div>
                            <p className="text-xs text-gray-400">Last Scanned</p>
                            <p className="font-bold text-lg text-white tracking-wider">{lastScanned.rollno}</p>
                        </div>
                    </div>
                )}

                <div className="w-full bg-black/30 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2"><UserCheck size={24} /><p className="font-semibold text-lg">Scanned</p></div>
                    <p className="font-bold text-4xl tracking-tighter">{scanCount}</p>
                </div>
                
                <div className="w-full mt-1 space-y-2">
                    <button onClick={handleFinishAndPost} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50" disabled={scanCount === 0 || isSubmitting}>
                        {isSubmitting ? <><Loader2 className="animate-spin mr-2"/>Submitting...</> : <><Check size={24}/>Finish & Post Report</>}
                    </button>
                    <button onClick={() => setIsExitModalOpen(true)} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm hover:bg-gray-500/50 transition flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Go Back & Discard
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen w-full font-sans relative ${
            (view === 'selection' || view === 'splash' || view === 'analytics')
                ? 'bg-gray-50'
                : 'bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]'
        }`}>
            <style>{`.animate-fade-in { animation: fade-in 0.6s ease-out forwards; } @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } } .scanner-laser { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #38bdf8; box-shadow: 0 0 10px 2px #38bdf8; animation: laser-beam 2.5s infinite linear; } @keyframes laser-beam { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } }`}</style>
            
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4">
                {{'splash': renderSplashView(), 'selection': renderSelectionView(), 'loading': renderLoadingView(), 'scanner': renderScannerView(), 'analytics': renderAnalyticsView()}[view]}
            </div>
            
            <UserMessageModal message={userMessage.text} type={userMessage.type} onClose={() => setUserMessage({ text: null, type: 'info' })} />
            {isExitModalOpen && <ExitConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={handleConfirmExit} />}
        </div>
    );
};

export default MultiBatchAttendancePage;