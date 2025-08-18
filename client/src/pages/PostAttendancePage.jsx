import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Check, Lock, Users, UserCheck, UserX, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, Group, ArrowLeft, CheckCircle2 } from 'lucide-react';

// Helper function to format date to YYYY-MM-DD
const getFormattedDate = () => new Date().toISOString().split('T')[0];

// --- Visual Donut Chart Component ---
const AttendanceDonutChart = ({ present, total }) => {
    const percentage = total > 0 ? (present / total) * 100 : 0;
    const circumference = 2 * Math.PI * 54; // r=54
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-green-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
                <circle
                    className="text-green-500 transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="54"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-gray-700">{percentage.toFixed(1)}%</span>
                <span className="text-sm text-gray-500">Present</span>
            </div>
        </div>
    );
};


const PostAttendance = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('splash');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [scanResult, setScanResult] = useState({ message: 'Point camera at QR code', type: 'info' });
    const [lastScanned, setLastScanned] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [facultyIdInput, setFacultyIdInput] = useState('');
    const [reportData, setReportData] = useState(null);
    const [scanCount, setScanCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [exitConfirmCount, setExitConfirmCount] = useState(0);

    const scannerRef = useRef(null);
    const scannedStudents = useRef(new Set());
    const exitConfirmTimeout = useRef(null);

    // --- EFFECT FOR SCANNER LIFECYCLE & Fullscreen ---
    useEffect(() => {
        const stopScanner = () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Scanner stop failed:", err));
            }
        };

        const startScanner = () => {
            const qrScanner = new Html5Qrcode('reader');
            scannerRef.current = qrScanner;
            const qrboxSize = window.innerWidth < 768 ? 200 : 250;
            const config = { fps: 15, qrbox: { width: qrboxSize, height: qrboxSize }, aspectRatio: 1.0 };
            
            qrScanner.start({ facingMode: 'environment' }, config, onScanSuccess)
                .catch(err => {
                    console.error("QR Scanner failed to start.", err);
                    setScanResult({ message: 'CAMERA ERROR: Please grant permission.', type: 'error' });
                });
        };

        if (view === 'scanner') {
            startScanner();
        } else {
            stopScanner();
        }

        return () => stopScanner();
    }, [view]);

    // --- HANDLERS ---
    const handleExitFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };

    const handleEnterFullScreen = () => {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().then(() => setView('selection')).catch(() => setView('selection'));
        } else {
            setView('selection');
        }
    };
    
    const handleStartScanning = (e) => {
        e.preventDefault();
        if (!selectedBatch || !selectedCourse) return;
        localStorage.setItem('sessionBatch', selectedBatch);
        localStorage.setItem('sessionCourse', selectedCourse);
        setView('scanner');
    };

    const onScanSuccess = (decodedText) => {
        if (scannerRef.current.lastScanned === decodedText) return;
        scannerRef.current.lastScanned = decodedText;

        const rollMatch = decodedText.match(/Roll No:\s*([A-Z0-9]+)/i);
        const rollno = rollMatch ? rollMatch[1].trim().toUpperCase() : null;
        
        if (!rollno) {
            setLastScanned(null);
            return setScanResult({ message: 'Invalid QR format', type: 'error' });
        }
        if (scannedStudents.current.has(rollno)) {
            setLastScanned(rollno);
            return setScanResult({ message: `Roll No Already Scanned`, type: 'warning' });
        }
        
        scannedStudents.current.add(rollno);
        setLastScanned(rollno);
        setScanCount(scannedStudents.current.size);
        setScanResult({ message: `Successfully Scanned!`, type: 'success' });
    };

    const handleProcessReport = async () => {
        const enteredId = facultyIdInput.trim();
        const storedFacultyId = localStorage.getItem("userIdentifier") || "IARE10970";
        if (enteredId.toLowerCase() !== storedFacultyId.toLowerCase()) {
            return alert("Faculty ID does not match. Please try again.");
        }
        
        setIsSubmitting(true);
        
        const formatCollectionName = (batch) => `attendance_${batch.toLowerCase().replace(' batch', '')}`;

        const requestBody = {
            collectionName: formatCollectionName(selectedBatch),
            date: getFormattedDate(),
            course: selectedCourse,
            presentArrays: Array.from(scannedStudents.current),
        };

        try {
            const response = await fetch('http://localhost:5000/api/Faculty/Mark-Attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to mark attendance.');
            }
            
            setReportData({
                message: result.message,
                total: result.totalMarked,
                presentCount: result.presentiesCount,
                absentCount: result.absenteesList.length,
                presentList: requestBody.presentArrays.sort(),
                absentList: result.absenteesList.sort(),
            });
            
            // Graceful state transition to prevent errors
            setIsModalOpen(false);
            setTimeout(() => {
                setView('analytics');
                handleExitFullScreen();
            }, 400); // Short delay for smooth UI transition

        } catch (error) {
            console.error("API Error:", error);
            alert(`Error: ${error.message}`);
            setIsSubmitting(false); // Reset submitting state on error
        }
    };

    const handleGoBack = () => {
        if (exitConfirmTimeout.current) clearTimeout(exitConfirmTimeout.current);

        if (exitConfirmCount === 0) {
            setExitConfirmCount(1);
            setScanResult({ message: 'Are you sure you want to exit?', type: 'warning' });
            exitConfirmTimeout.current = setTimeout(() => setExitConfirmCount(0), 4000);
        } else if (exitConfirmCount === 1) {
            setExitConfirmCount(2);
            setScanResult({ message: 'This will clear all scanned data. Confirm exit?', type: 'error' });
             exitConfirmTimeout.current = setTimeout(() => setExitConfirmCount(0), 4000);
        } else {
            handleExitFullScreen();
            scannedStudents.current.clear();
            setScanCount(0);
            setView('selection');
            setExitConfirmCount(0);
            setScanResult({ message: 'Point camera at a QR code', type: 'info' });
        }
    };
    
    // --- RENDER FUNCTIONS ---

    const renderSplashView = () => (
        <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Attendance Portal</h1>
            <p className="text-gray-500 mt-4 text-lg sm:text-xl">Click below to start a new session.</p>
            <button onClick={handleEnterFullScreen} className="mt-8 bg-blue-600 text-white py-4 px-12 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-300 flex items-center justify-center gap-3 mx-auto">
                <ArrowRight size={24} /> Start Session
            </button>
        </div>
    );

    const renderSelectionView = () => (
        <div className="w-11/12 max-w-sm sm:max-w-md mx-auto transition-all duration-500 animate-fade-in">
            <form onSubmit={handleStartScanning} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 sm:space-y-8 border-4 border-gray-50 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Create Session</h1>
                <p className="text-gray-500 -mt-2 text-sm sm:text-base">Select a batch and course to begin</p>
                <div className="space-y-5 text-left">
                    <div className="group relative">
                         <label className="text-sm font-semibold text-gray-600">Batch</label>
                         <div className="flex items-center mt-2">
                             <Group className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20}/>
                             <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base sm:text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer">
                                 <option value="" disabled>Select Batch</option>
                                 <option value="SKILLUP-1">SKILLUP BATCH-1</option><option value="SKILLUP-2">SKILLUP BATCH-2</option><option value="SKILLUP-3">SKILLUP BATCH-3</option>
                                 <option value="SKILLNEXT-1">SKILLNEXT BATCH-1</option><option value="SKILLNEXT-2">SKILLNEXT BATCH-2</option><option value="SKILLNEXT-3">SKILLNEXT BATCH-3</option>
                                 <option value="SKILLBRIDGE-1">SKILLBRIDGE BATCH-1</option><option value="SKILLBRIDGE-2">SKILLBRIDGE BATCH-2</option><option value="SKILLBRIDGE-3">SKILLBRIDGE BATCH-3</option>
                                 <option value="SKILLBRIDGE-4">SKILLBRIDGE BATCH-4</option><option value="SKILLBRIDGE-5">SKILLBRIDGE BATCH-5</option>
                             </select>
                             <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
                         </div>
                    </div>
                     <div className="group relative">
                         <label className="text-sm font-semibold text-gray-600">Course / Session</label>
                          <div className="flex items-center mt-2">
                             <BookOpen className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20}/>
                             <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base sm:text-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer">
                                 <option value="" disabled>Select Course</option>
                                 <option value="CP">CP</option><option value="JFS">JFS</option>
                                 <option value="DBMS">DBMS</option><option value="AWS">AWS</option>
                             </select>
                             <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
                         </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 sm:py-4 mt-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-300 flex items-center justify-center gap-3">
                    <ScanLine size={24} /> Begin Scanning
                </button>
            </form>
        </div>
    );
    
    const renderScannerView = () => {
        const resultColorClass = {
            success: 'border-green-400 text-green-300',
            warning: 'border-yellow-400 text-yellow-300',
            error: 'border-red-400 text-red-400',
            info: 'border-blue-400 text-blue-300'
        }[scanResult.type];

        return (
            <div className="w-full h-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center gap-2 sm:gap-3 p-2 justify-center animate-fade-in text-white">
                <div className="w-full text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                    <p className="font-bold text-md sm:text-lg">{selectedBatch}</p>
                    <p className="text-xs sm:text-sm text-blue-300">{selectedCourse}</p>
                </div>
                <div className="relative w-full aspect-square bg-black/50 backdrop-blur-xl rounded-3xl p-1 sm:p-2 shadow-2xl border border-white/10 scanner-container">
                    <div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div>
                    <div className="scanner-laser"></div>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
                    <div className={`h-20 sm:h-24 bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border ${resultColorClass} transition-colors duration-300 flex flex-col items-center justify-center text-center`}>
                        {scanResult.type === 'success' ? (
                            <div className="animate-fade-in">
                                <Check className="mx-auto" size={24} />
                                <p className="font-bold text-lg sm:text-xl mt-1 tracking-wider">{lastScanned}</p>
                                <p className="text-xs">{scanResult.message}</p>
                            </div>
                        ) : (
                             <div className="px-2">
                                <p className="font-bold text-lg sm:text-xl tracking-wider">{lastScanned}</p>
                                <p className="font-semibold text-xs sm:text-sm">{scanResult.message}</p>
                            </div>
                        )}
                    </div>
                     <div className="h-20 sm:h-24 bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-blue-300">Scanned</p>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <UserCheck className="mt-1" size={20}/>
                            <p className="font-bold text-4xl sm:text-5xl tracking-tighter">{scanCount}</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 mt-1 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3">
                    <Check size={24} /> Finish & Process
                </button>
                <button onClick={handleGoBack} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm hover:bg-gray-500/50 transition-all duration-300 flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    };
    
    const renderAnalyticsView = () => !reportData ? null : (
        <div className="w-11/12 max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-gray-800 animate-fade-in">
            <div className="text-center" style={{ animationDelay: '100ms', animationName: 'fade-in' }}>
                <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2"/>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Attendance Report</h1>
                <p className="text-green-600 font-semibold mt-1">{reportData.message}</p>
                <p className="text-gray-500 text-md sm:text-lg mt-2">{selectedBatch} - {selectedCourse}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-6 sm:my-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                 <AttendanceDonutChart present={reportData.presentCount} total={reportData.total} />
                 <div className="grid grid-cols-3 md:grid-cols-1 gap-4 w-full md:w-auto">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center"><Users className="mx-auto text-blue-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.total}</p><p className="text-gray-500 font-semibold text-sm">Total</p></div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center"><UserCheck className="mx-auto text-green-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.presentCount}</p><p className="text-gray-500 font-semibold text-sm">Present</p></div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center"><UserX className="mx-auto text-red-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.absentCount}</p><p className="text-gray-500 font-semibold text-sm">Absent</p></div>
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-green-600">Present Roll Numbers ({reportData.presentCount})</h3>
                    <div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">
                        {reportData.presentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>)}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-red-600">Absent Roll Numbers ({reportData.absentCount})</h3>
                    <div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">
                        {reportData.absentList.length > 0 ? reportData.absentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>) : <p className="text-gray-400 p-1">None</p>}
                    </div>
                </div>
            </div>
            <button onClick={() => navigate('/faculty/dashboard')} className="w-full bg-gray-700 text-white py-3 mt-6 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '700ms' }}>
                <LogOut size={24}/> Finish & Exit
            </button>
        </div>
    );

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm text-center text-gray-800 animate-fade-in">
                <Lock size={40} className="mx-auto text-blue-500 mb-4"/>
                <h3 className="font-bold text-2xl mb-2">Faculty Verification</h3>
                <p className="text-gray-500 mb-6">Enter your Faculty ID to finalize the report.</p>
                <input type="password" value={facultyIdInput} onChange={(e) => setFacultyIdInput(e.target.value)} placeholder="Enter Faculty ID" className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-lg"/>
                <div className="flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition" disabled={isSubmitting}>Cancel</button>
                    <button onClick={handleProcessReport} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center font-sans p-2 sm:p-4 relative overflow-hidden bg-gray-100">
             <style>{`
                 .scanner-container { animation: pulse-border 2s infinite; }
                 .scanner-laser {
                     position: absolute; top: 0; left: 0; right: 0;
                     height: 3px; background: #38bdf8;
                     box-shadow: 0 0 10px 2px #38bdf8;
                     animation: laser-beam 2.5s infinite linear;
                 }
                 @keyframes laser-beam { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } }
                 @keyframes pulse-border { 0%, 100% { border-color: rgba(255, 255, 255, 0.1); } 50% { border-color: #38bdf8; } }
                 @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                 .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
             `}</style>
            <div className={`absolute inset-0 transition-opacity duration-500 ${view === 'selection' || view === 'scanner' ? 'opacity-100' : 'opacity-0'}`} >
                 <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div>
            </div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {view === 'splash' && renderSplashView()}
              {view === 'selection' && renderSelectionView()}
              {view === 'scanner' && renderScannerView()}
              {view === 'analytics' && renderAnalyticsView()}
            </div>
            {isModalOpen && renderModal()}
        </div>
    );
};

export default PostAttendance;