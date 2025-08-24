// // import React, { useState, useEffect, useRef } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { Html5Qrcode } from 'html5-qrcode';
// // import { Check, Lock, Users, UserCheck, UserX, LogOut, ScanLine, ArrowRight, BookOpen, ChevronDown, Group, ArrowLeft, CheckCircle2 } from 'lucide-react';

// // // --- GLOBAL CONFIGURATION ---

// // const backendUrl = "https://iareattendancemgmt.onrender.com";
// // const getFormattedDate = () => new Date().toISOString().split('T')[0];

// // const courses = ["CP", "JFS", "DBMS", "AWS"];

// // // Role-specific settings are now in one place
// // const roleConfig = {
// //     faculty: {
// //         title: "Faculty Attendance Portal",
// //         sessionTitle: "Create Session",
// //         reportTitle: "Attendance Report",
// //         verificationTitle: "Faculty Verification",
// //         idPlaceholder: "Enter Faculty ID",
// //         // Normalize faculty batches to have the same structure for easier rendering
// //         batches: [
// //             { value: "SKILLUP-1", label: "SKILLUP BATCH-1" }, { value: "SKILLUP-2", label: "SKILLUP BATCH-2" }, { value: "SKILLUP-3", label: "SKILLUP BATCH-3" },
// //             { value: "SKILLNEXT-1", label: "SKILLNEXT BATCH-1" }, { value: "SKILLNEXT-2", label: "SKILLNEXT BATCH-2" }, { value: "SKILLNEXT-3", label: "SKILLNEXT BATCH-3" },
// //             { value: "SKILLBRIDGE-1", label: "SKILLBRIDGE BATCH-1" }, { value: "SKILLBRIDGE-2", label: "SKILLBRIDGE BATCH-2" }, { value: "SKILLBRIDGE-3", label: "SKILLBRIDGE BATCH-3" },
// //             { value: "SKILLBRIDGE-4", label: "SKILLBRIDGE BATCH-4" }, { value: "SKILLBRIDGE-5", label: "SKILLBRIDGE BATCH-5" },
// //         ],
// //         dashboardPath: '/faculty/dashboard',
// //         // Function to format the collection name for the API call
// //         formatCollection: (batchValue) => `attendance_${batchValue.toLowerCase().replace(' batch', '')}`
// //     },
// //     admin: {
// //         title: "Admin Attendance Portal",
// //         sessionTitle: "Create Admin Session",
// //         reportTitle: "Admin Attendance Report",
// //         verificationTitle: "Admin Verification",
// //         idPlaceholder: "Enter Admin ID",
// //         batches: [
// //             { value: "attendance_skillup-1", label: "Skillup-1" }, { value: "attendance_skillup-2", label: "Skillup-2" }, { value: "attendance_skillup-3", label: "Skillup-3" },
// //             { value: "attendance_skillnext-1", label: "Skillnext-1" }, { value: "attendance_skillnext-2", label: "Skillnext-2" }, { value: "attendance_skillnext-3", label: "Skillnext-3" },
// //             { value: "attendance_skillbridge-1", label: "Skillbridge-1" }, { value: "attendance_skillbridge-2", label: "Skillbridge-2" }, { value: "attendance_skillbridge-3", label: "Skillbridge-3" }, { value: "attendance_skillbridge-4", label: "Skillbridge-4" }, { value: "attendance_skillbridge-5", label: "Skillbridge-5" }
// //         ],
// //         dashboardPath: '/admin/dashboard',
// //         // For admin, the value is already the collection name, so no formatting is needed
// //         formatCollection: (batchValue) => batchValue
// //     }
// // };

// // // --- Reusable Donut Chart Component ---
// // const AttendanceDonutChart = ({ present, total }) => {
// //     // ... (Component code remains the same)
// //     const percentage = total > 0 ? (present / total) * 100 : 0;
// //     const circumference = 2 * Math.PI * 54;
// //     const offset = circumference - (percentage / 100) * circumference;
// //     return (
// //         <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
// //             <svg className="w-full h-full" viewBox="0 0 120 120">
// //                 <circle className="text-green-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
// //                 <circle
// //                     className="text-green-500 transition-all duration-1000 ease-out"
// //                     strokeWidth="12"
// //                     strokeDasharray={circumference}
// //                     strokeDashoffset={offset}
// //                     strokeLinecap="round"
// //                     stroke="currentColor"
// //                     fill="transparent"
// //                     r="54"
// //                     cx="60"
// //                     cy="60"
// //                     transform="rotate(-90 60 60)"
// //                 />
// //             </svg>
// //             <div className="absolute inset-0 flex flex-col items-center justify-center">
// //                 <span className="text-3xl sm:text-4xl font-bold text-gray-700">{percentage.toFixed(1)}%</span>
// //                 <span className="text-sm text-gray-500">Present</span>
// //             </div>
// //         </div>
// //     );
// // };


// // // ===================================================================
// // // --- THE SINGLE, UNIFIED POST-ATTENDANCE COMPONENT ---
// // // ===================================================================

// // const PostAttendancePage = () => {
// //     const navigate = useNavigate();
// //     const [view, setView] = useState('splash');
// //     const [config, setConfig] = useState(roleConfig.faculty); // Default to faculty
// //     const [selectedBatch, setSelectedBatch] = useState('');
// //     const [selectedCourse, setSelectedCourse] = useState('');
// //     const [scanResult, setScanResult] = useState({ message: 'Point camera at QR code', type: 'info' });
// //     const [lastScanned, setLastScanned] = useState(null);
// //     const [isModalOpen, setIsModalOpen] = useState(false);
// //     const [idInput, setIdInput] = useState('');
// //     const [reportData, setReportData] = useState(null);
// //     const [scanCount, setScanCount] = useState(0);
// //     const [isSubmitting, setIsSubmitting] = useState(false);
// //     const [exitConfirmCount, setExitConfirmCount] = useState(0);

// //     const scannerRef = useRef(null);
// //     const scannedStudents = useRef(new Set());
// //     const exitConfirmTimeout = useRef(null);
    
// //     // --- EFFECT TO SET CONFIGURATION BASED ON ROLE ---
// //     useEffect(() => {
// //         const userRole = localStorage.getItem("userRole") || 'faculty';
// //         setConfig(roleConfig[userRole] || roleConfig.faculty);
// //     }, []);


// //     // --- EFFECT FOR SCANNER LIFECYCLE ---
// //     useEffect(() => {
// //         const stopScanner = () => {
// //             if (scannerRef.current?.isScanning) {
// //                 scannerRef.current.stop().catch(err => console.error("Scanner stop failed:", err));
// //             }
// //         };

// //         const startScanner = () => {
// //             const qrScanner = new Html5Qrcode('reader');
// //             scannerRef.current = qrScanner;
// //             const qrboxSize = window.innerWidth < 768 ? 200 : 250;
// //             const config = { fps: 15, qrbox: { width: qrboxSize, height: qrboxSize }, aspectRatio: 1.0 };
            
// //             qrScanner.start({ facingMode: 'environment' }, config, onScanSuccess)
// //                 .catch(err => {
// //                     console.error("QR Scanner failed to start.", err);
// //                     setScanResult({ message: 'CAMERA ERROR: Please grant permission.', type: 'error' });
// //                 });
// //         };

// //         if (view === 'scanner') {
// //             startScanner();
// //         } else {
// //             stopScanner();
// //         }

// //         return () => stopScanner();
// //     }, [view]);

// //     // --- GENERIC HANDLERS ---
// //     const handleExitFullScreen = () => {
// //         if (document.fullscreenElement) document.exitFullscreen();
// //     };

// //     const handleEnterFullScreen = () => {
// //         const element = document.documentElement;
// //         if (element.requestFullscreen) {
// //             element.requestFullscreen().then(() => setView('selection')).catch(() => setView('selection'));
// //         } else {
// //             setView('selection');
// //         }
// //     };
    
// //     const handleStartScanning = (e) => {
// //         e.preventDefault();
// //         if (!selectedBatch || !selectedCourse) return;
// //         setView('scanner');
// //     };

// //     const onScanSuccess = (decodedText) => {
// //         if (scannerRef.current.lastScanned === decodedText) return;
// //         scannerRef.current.lastScanned = decodedText;

// //         const rollMatch = decodedText.match(/Roll No:\s*([A-Z0-9]+)/i);
// //         const rollno = rollMatch ? rollMatch[1].trim().toUpperCase() : null;
        
// //         if (!rollno) {
// //             setLastScanned(null);
// //             return setScanResult({ message: 'Invalid QR format', type: 'error' });
// //         }
// //         if (scannedStudents.current.has(rollno)) {
// //             setLastScanned(rollno);
// //             return setScanResult({ message: `Already Scanned`, type: 'warning' });
// //         }
        
// //         scannedStudents.current.add(rollno);
// //         setLastScanned(rollno);
// //         setScanCount(scannedStudents.current.size);
// //         setScanResult({ message: `Successfully Scanned!`, type: 'success' });
// //     };

// //     const handleProcessReport = async () => {
// //         const storedId = localStorage.getItem("userIdentifier");
// //         if (idInput.trim().toLowerCase() !== storedId?.toLowerCase()) {
// //             return alert("ID does not match. Please try again.");
// //         }
        
// //         setIsSubmitting(true);
        
// //         const requestBody = {
// //             collectionName: config.formatCollection(selectedBatch),
// //             date: getFormattedDate(),
// //             course: selectedCourse,
// //             presentArrays: Array.from(scannedStudents.current),
// //         };

// //         try {
// //             const response = await fetch(`${backendUrl}/api/Faculty/Mark-Attendance`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify(requestBody),
// //             });

// //             const result = await response.json();
// //             if (!response.ok) throw new Error(result.message || 'Failed to mark attendance.');
            
// //             setReportData({
// //                 message: result.message,
// //                 total: result.totalMarked,
// //                 presentCount: result.presentiesCount,
// //                 absentCount: result.absenteesList.length,
// //                 presentList: requestBody.presentArrays.sort(),
// //                 absentList: result.absenteesList.sort(),
// //             });
            
// //             setIsModalOpen(false);
// //             setTimeout(() => {
// //                 setView('analytics');
// //                 handleExitFullScreen();
// //             }, 400);

// //         } catch (error) {
// //             console.error("API Error:", error);
// //             alert(`Error: ${error.message}`);
// //             setIsSubmitting(false);
// //         }
// //     };

// //     const handleGoBack = () => {
// //         // ... (This logic remains the same)
// //         if (exitConfirmTimeout.current) clearTimeout(exitConfirmTimeout.current);
// //         if (exitConfirmCount === 0) {
// //             setExitConfirmCount(1);
// //             setScanResult({ message: 'Are you sure?', type: 'warning' });
// //             exitConfirmTimeout.current = setTimeout(() => setExitConfirmCount(0), 4000);
// //         } else {
// //             handleExitFullScreen();
// //             scannedStudents.current.clear();
// //             setScanCount(0);
// //             setView('selection');
// //             setExitConfirmCount(0);
// //             setScanResult({ message: 'Point camera at a QR code', type: 'info' });
// //         }
// //     };
    
// //     // --- DYNAMIC RENDER FUNCTIONS ---
// //     const renderSplashView = () => (
// //         <div className="text-center animate-fade-in">
// //             <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{config.title}</h1>
// //             <p className="text-gray-500 mt-4 text-lg sm:text-xl">Click below to start a new session.</p>
// //             <button onClick={handleEnterFullScreen} className="mt-8 bg-blue-600 text-white py-4 px-12 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-300 flex items-center justify-center gap-3 mx-auto">
// //                 <ArrowRight size={24} /> Start Session
// //             </button>
// //         </div>
// //     );

// //     const renderSelectionView = () => (
// //         <div className="w-11/12 max-w-sm sm:max-w-md mx-auto transition-all duration-500 animate-fade-in">
// //             <form onSubmit={handleStartScanning} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 sm:space-y-8 border-4 border-gray-50 text-center">
// //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 sm:w-10 sm:h-10" /></div>
// //                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{config.sessionTitle}</h1>
// //                 <p className="text-gray-500 -mt-2 text-sm sm:text-base">Select a batch and course to begin</p>
// //                 <div className="space-y-5 text-left">
// //                     <div className="group relative">
// //                          <label className="text-sm font-semibold text-gray-600">Batch</label>
// //                          <div className="flex items-center mt-2">
// //                              <Group className="absolute left-4 text-gray-400 group-focus-within:text-blue-600" size={20}/>
// //                              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
// //                                  <option value="" disabled>Select Batch</option>
// //                                  {config.batches.map(batch => <option key={batch.value} value={batch.value}>{batch.label}</option>)}
// //                              </select>
// //                              <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
// //                          </div>
// //                     </div>
// //                     <div className="group relative">
// //                          <label className="text-sm font-semibold text-gray-600">Course / Session</label>
// //                           <div className="flex items-center mt-2">
// //                              <BookOpen className="absolute left-4 text-gray-400 group-focus-within:text-blue-600" size={20}/>
// //                              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
// //                                  <option value="" disabled>Select Course</option>
// //                                  {courses.map(course => <option key={course} value={course}>{course}</option>)}
// //                              </select>
// //                              <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
// //                          </div>
// //                     </div>
// //                 </div>
// //                 <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 sm:py-4 mt-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
// //                     <ScanLine size={24} /> Begin Scanning
// //                 </button>
// //             </form>
// //         </div>
// //     );
    
// //     const renderScannerView = () => {
// //         const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
// //         // ... (The scanner UI remains the same)
// //         return (
// //             <div className="w-full h-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center gap-2 sm:gap-3 p-2 justify-center animate-fade-in text-white">
// //                 <div className="w-full text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10"><p className="font-bold text-md sm:text-lg">{batchLabel}</p><p className="text-xs sm:text-sm text-blue-300">{selectedCourse}</p></div>
// //                 <div className="relative w-full aspect-square bg-black/50 backdrop-blur-xl rounded-3xl p-1 sm:p-2 shadow-2xl border border-white/10 scanner-container"><div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div><div className="scanner-laser"></div></div>
// //                 <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
// //                     <div className={`h-20 sm:h-24 bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border ${scanResult.type === 'success' ? 'border-green-400' : 'border-red-400'} flex flex-col items-center justify-center text-center`}><p className="font-bold text-lg sm:text-xl tracking-wider">{lastScanned}</p><p className="font-semibold text-xs sm:text-sm">{scanResult.message}</p></div>
// //                     <div className="h-20 sm:h-24 bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center"><p className="text-xs text-blue-300">Scanned</p><div className="flex items-center gap-1 sm:gap-2"><UserCheck className="mt-1" size={20}/><p className="font-bold text-4xl sm:text-5xl tracking-tighter">{scanCount}</p></div></div>
// //                 </div>
// //                 <button onClick={() => setIsModalOpen(true)} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 mt-1 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-3"><Check size={24} /> Finish & Process</button>
// //                 <button onClick={handleGoBack} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm hover:bg-gray-500/50 transition flex items-center justify-center gap-2"><ArrowLeft size={16} /> Go Back</button>
// //             </div>
// //         );
// //     };
    
// //     const renderAnalyticsView = () => {
// //         if (!reportData) return null;
// //         const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
        
// //         return (
// //             <div className="w-11/12 max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-gray-800 animate-fade-in">
// //                 <div className="text-center"><CheckCircle2 size={48} className="mx-auto text-green-500 mb-2"/><h1 className="text-2xl sm:text-4xl font-bold text-gray-800">{config.reportTitle}</h1><p className="text-green-600 font-semibold mt-1">{reportData.message}</p><p className="text-gray-500 text-md sm:text-lg mt-2">{batchLabel} - {selectedCourse}</p></div>
// //                 <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-6 sm:my-8"><AttendanceDonutChart present={reportData.presentCount} total={reportData.total} /><div className="grid grid-cols-3 md:grid-cols-1 gap-4 w-full md:w-auto"><div className="bg-blue-50 p-4 rounded-xl text-center"><Users className="mx-auto text-blue-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.total}</p><p className="text-gray-500 font-semibold text-sm">Total</p></div><div className="bg-green-50 p-4 rounded-xl text-center"><UserCheck className="mx-auto text-green-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.presentCount}</p><p className="text-gray-500 font-semibold text-sm">Present</p></div><div className="bg-red-50 p-4 rounded-xl text-center"><UserX className="mx-auto text-red-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.absentCount}</p><p className="text-gray-500 font-semibold text-sm">Absent</p></div></div></div>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"><div><h3 className="font-bold text-lg mb-2 text-green-600">Present ({reportData.presentCount})</h3><div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">{reportData.presentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>)}</div></div><div><h3 className="font-bold text-lg mb-2 text-red-600">Absent ({reportData.absentCount})</h3><div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">{reportData.absentList.length > 0 ? reportData.absentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>) : <p className="text-gray-400 p-1">None</p>}</div></div></div>
// //                 <button onClick={() => navigate(config.dashboardPath)} className="w-full bg-gray-700 text-white py-3 mt-6 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3"><LogOut size={24}/> Finish & Exit</button>
// //             </div>
// //         );
// //     };

// //     const renderModal = () => (
// //         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// //             <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm text-center text-gray-800 animate-fade-in">
// //                 <Lock size={40} className="mx-auto text-blue-500 mb-4"/>
// //                 <h3 className="font-bold text-2xl mb-2">{config.verificationTitle}</h3>
// //                 <p className="text-gray-500 mb-6">Enter your ID to finalize the report.</p>
// //                 <input type="password" value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder={config.idPlaceholder} className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-lg"/>
// //                 <div className="flex gap-4">
// //                     <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300" disabled={isSubmitting}>Cancel</button>
// //                     <button onClick={handleProcessReport} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Confirm'}</button>
// //                 </div>
// //             </div>
// //         </div>
// //     );
    
// //     return (
// //         <div className="min-h-screen w-full flex items-center justify-center font-sans p-2 sm:p-4 relative overflow-hidden bg-gray-100">
// //              <style>{`.scanner-container{animation:pulse-border 2s infinite}@keyframes pulse-border{0%,100%{border-color:rgba(255,255,255,.1)}50%{border-color:#38bdf8}}.scanner-laser{position:absolute;top:0;left:0;right:0;height:3px;background:#38bdf8;box-shadow:0 0 10px 2px #38bdf8;animation:laser-beam 2.5s infinite linear}@keyframes laser-beam{0%{top:5%}50%{top:95%}100%{top:5%}}@keyframes fade-in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}.animate-fade-in{animation:fade-in .5s ease-out forwards}`}</style>
// //             <div className={`absolute inset-0 transition-opacity duration-500 ${view === 'selection' || view === 'scanner' ? 'opacity-100' : 'opacity-0'}`}><div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div></div>
// //             <div className="relative z-10 w-full h-full flex items-center justify-center">
// //               {view === 'splash' && renderSplashView()}
// //               {view === 'selection' && renderSelectionView()}
// //               {view === 'scanner' && renderScannerView()}
// //               {view === 'analytics' && renderAnalyticsView()}
// //             </div>
// //             {isModalOpen && renderModal()}
// //         </div>
// //     );
// // };

// // export default PostAttendancePage;
// import React, { useState, useEffect, useRef } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// // The Html5Qrcode library is loaded via a script tag, so the direct import is removed.
// import { User, LogOut, Menu, X, Search, QrCode, Edit, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, Users, ChevronDown, UserCheck, UserX, FileUp, ClipboardCheck, ArrowRight, BookOpen, Group, ScanLine, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';

// // --- CONFIGURATION ---
// const backendUrl = "https://iareattendancemgmt.onrender.com";
// const getFormattedDate = () => new Date().toISOString().split('T')[0];

// const courses = ["CP", "JFS", "DBMS", "AWS"];

// const roleConfig = {
//     faculty: {
//         title: "Faculty Attendance Portal",
//         sessionTitle: "Create Session",
//         reportTitle: "Attendance Report",
//         verificationTitle: "Faculty Verification",
//         idPlaceholder: "Enter Faculty ID",
//         batches: [
//             { value: "SKILLUP-1", label: "SKILLUP BATCH-1" }, { value: "SKILLUP-2", label: "SKILLUP BATCH-2" }, { value: "SKILLUP-3", label: "SKILLUP BATCH-3" },
//             { value: "SKILLNEXT-1", label: "SKILLNEXT BATCH-1" }, { value: "SKILLNEXT-2", label: "SKILLNEXT BATCH-2" }, { value: "SKILLNEXT-3", label: "SKILLNEXT BATCH-3" },
//             { value: "SKILLBRIDGE-1", label: "SKILLBRIDGE BATCH-1" }, { value: "SKILLBRIDGE-2", label: "SKILLBRIDGE BATCH-2" }, { value: "SKILLBRIDGE-3", label: "SKILLBRIDGE BATCH-3" },
//             { value: "SKILLBRIDGE-4", label: "SKILLBRIDGE BATCH-4" }, { value: "SKILLBRIDGE-5", label: "SKILLBRIDGE BATCH-5" },
//         ],
//         dashboardPath: '/faculty/dashboard',
//         formatCollection: (batchValue) => `attendance_${batchValue.toLowerCase().replace(' batch', '')}`
//     },
//     admin: {
//         title: "Admin Attendance Portal",
//         sessionTitle: "Create Admin Session",
//         reportTitle: "Admin Attendance Report",
//         verificationTitle: "Admin Verification",
//         idPlaceholder: "Enter Admin ID",
//         batches: [
//             { value: "attendance_skillup-1", label: "Skillup-1" }, { value: "attendance_skillup-2", label: "Skillup-2" }, { value: "attendance_skillup-3", label: "Skillup-3" },
//             { value: "attendance_skillnext-1", label: "Skillnext-1" }, { value: "attendance_skillnext-2", label: "Skillnext-2" }, { value: "attendance_skillnext-3", label: "Skillnext-3" },
//             { value: "attendance_skillbridge-1", label: "Skillbridge-1" }, { value: "attendance_skillbridge-2", label: "Skillbridge-2" }, { value: "attendance_skillbridge-3", label: "Skillbridge-3" }, { value: "attendance_skillbridge-4", label: "Skillbridge-4" }, { value: "attendance_skillbridge-5", label: "Skillbridge-5" }
//         ],
//         dashboardPath: '/admin/dashboard',
//         formatCollection: (batchValue) => batchValue
//     }
// };

// // --- Reusable Donut Chart Component ---
// const AttendanceDonutChart = ({ present, total }) => {
//     const percentage = total > 0 ? (present / total) * 100 : 0;
//     const circumference = 2 * Math.PI * 54;
//     const offset = circumference - (percentage / 100) * circumference;
//     return (
//         <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
//             <svg className="w-full h-full" viewBox="0 0 120 120">
//                 <circle className="text-green-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
//                 <circle
//                     className="text-green-500 transition-all duration-1000 ease-out"
//                     strokeWidth="12"
//                     strokeDasharray={circumference}
//                     strokeDashoffset={offset}
//                     strokeLinecap="round"
//                     stroke="currentColor"
//                     fill="transparent"
//                     r="54"
//                     cx="60"
//                     cy="60"
//                     transform="rotate(-90 60 60)"
//                 />
//             </svg>
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <span className="text-3xl sm:text-4xl font-bold text-gray-700">{percentage.toFixed(1)}%</span>
//                 <span className="text-sm text-gray-500">Present</span>
//             </div>
//         </div>
//     );
// };

// // --- Reusable Confirmation Modal ---
// const ExitConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
//                 <ShieldQuestion size={48} className="mx-auto text-yellow-500 mb-4" />
//                 <h3 className="text-xl font-bold text-slate-900">{title}</h3>
//                 <p className="text-slate-600 mt-2 mb-6">{message}</p>
//                 <div className="flex gap-4">
//                     <button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Stay</button>
//                     <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">{confirmText}</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ===================================================================
// // --- THE SINGLE, UNIFIED POST-ATTENDANCE COMPONENT ---
// // ===================================================================

// const PostAttendancePage = () => {
//     const navigate = useNavigate();
//     const [view, setView] = useState('splash');
//     const [config, setConfig] = useState(roleConfig.faculty);
//     const [selectedBatch, setSelectedBatch] = useState('');
//     const [selectedCourse, setSelectedCourse] = useState('');
//     const [scanResult, setScanResult] = useState({ message: 'Point camera at QR code', type: 'info' });
//     const [lastScanned, setLastScanned] = useState(null);
//     const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
//     const [isExitModalOpen, setIsExitModalOpen] = useState(false);
//     const [idInput, setIdInput] = useState('');
//     const [reportData, setReportData] = useState(null);
//     const [scanCount, setScanCount] = useState(0);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [scannerState, setScannerState] = useState('stopped'); // 'stopped', 'starting', 'running', 'stopping'

//     const scannerRef = useRef(null);
//     const scannedStudents = useRef(new Set());
    
//     useEffect(() => {
//         const userRole = localStorage.getItem("userRole") || 'faculty';
//         setConfig(roleConfig[userRole] || roleConfig.faculty);

//         const scriptId = 'html5-qrcode-script';
//         if (!document.getElementById(scriptId)) {
//             const script = document.createElement('script');
//             script.id = scriptId;
//             script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
//             script.async = true;
//             document.head.appendChild(script);
//         }
//     }, []);

//     useEffect(() => {
//         const startScanner = () => {
//             if (scannerState !== 'stopped' || typeof window.Html5Qrcode === 'undefined') {
//                 if (typeof window.Html5Qrcode === 'undefined') setTimeout(startScanner, 100);
//                 return;
//             }
//             if (!document.getElementById('reader')) return;

//             setScannerState('starting');
//             const qrScanner = new window.Html5Qrcode('reader');
//             scannerRef.current = qrScanner;
//             const qrboxSize = window.innerWidth < 768 ? 200 : 250;
//             const config = { fps: 15, qrbox: { width: qrboxSize, height: qrboxSize }, aspectRatio: 1.0 };
            
//             qrScanner.start({ facingMode: 'environment' }, config, onScanSuccess)
//                 .then(() => setScannerState('running'))
//                 .catch(err => {
//                     console.error("QR Scanner failed to start.", err);
//                     setScanResult({ message: 'CAMERA ERROR: Please grant permission.', type: 'error' });
//                     setScannerState('stopped');
//                 });
//         };

//         const stopScanner = () => {
//             if (scannerState !== 'running' || !scannerRef.current?.isScanning) return;
//             setScannerState('stopping');
//             scannerRef.current.stop()
//                 .then(() => setScannerState('stopped'))
//                 .catch(err => {
//                     console.error("Scanner stop failed:", err);
//                     setScannerState('stopped');
//                 });
//         };

//         if (view === 'scanner') {
//             startScanner();
//         } else {
//             stopScanner();
//         }

//         return () => {
//             if (scannerRef.current?.isScanning) {
//                 stopScanner();
//             }
//         };
//     }, [view, scannerState]);

//     useEffect(() => {
//         const preventGestures = (e) => e.preventDefault();
//         if (view === 'scanner') {
//             document.body.style.overscrollBehavior = 'contain';
//             document.body.addEventListener('touchmove', preventGestures, { passive: false });
//         } else {
//             document.body.style.overscrollBehavior = 'auto';
//             document.body.removeEventListener('touchmove', preventGestures);
//         }
//         return () => {
//             document.body.style.overscrollBehavior = 'auto';
//             document.body.removeEventListener('touchmove', preventGestures);
//         };
//     }, [view]);

//     const handleExitFullScreen = () => {
//         if (document.fullscreenElement) document.exitFullscreen();
//     };

//     const handleEnterFullScreen = () => {
//         const element = document.documentElement;
//         if (element.requestFullscreen) {
//             element.requestFullscreen().then(() => setView('selection')).catch(() => setView('selection'));
//         } else {
//             setView('selection');
//         }
//     };
    
//     const handleStartScanning = (e) => {
//         e.preventDefault();
//         if (!selectedBatch || !selectedCourse) return;
//         setView('scanner');
//     };

//     const onScanSuccess = (decodedText) => {
//         if (scannerRef.current.lastScanned === decodedText) return;
//         scannerRef.current.lastScanned = decodedText;

//         const rollMatch = decodedText.match(/Roll No:\s*([A-Z0-9]+)/i);
//         const rollno = rollMatch ? rollMatch[1].trim().toUpperCase() : null;
        
//         if (!rollno) {
//             setLastScanned(null);
//             return setScanResult({ message: 'Invalid QR format', type: 'error' });
//         }
//         if (scannedStudents.current.has(rollno)) {
//             setLastScanned(rollno);
//             return setScanResult({ message: `Already Scanned`, type: 'warning' });
//         }
        
//         scannedStudents.current.add(rollno);
//         setLastScanned(rollno);
//         setScanCount(scannedStudents.current.size);
//         setScanResult({ message: `Successfully Scanned!`, type: 'success' });
//     };

//     const handleProcessReport = async () => {
//         const storedId = localStorage.getItem("userIdentifier");
//         if (idInput.trim().toLowerCase() !== storedId?.toLowerCase()) {
//             return alert("ID does not match. Please try again.");
//         }
        
//         setIsSubmitting(true);
        
//         const requestBody = {
//             collectionName: config.formatCollection(selectedBatch),
//             date: getFormattedDate(),
//             course: selectedCourse,
//             presentArrays: Array.from(scannedStudents.current),
//         };

//         try {
//             const response = await fetch(`${backendUrl}/api/Faculty/Mark-Attendance`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(requestBody),
//             });

//             const result = await response.json();
//             if (!response.ok) throw new Error(result.message || 'Failed to mark attendance.');
            
//             setReportData({
//                 message: result.message,
//                 total: result.totalMarked,
//                 presentCount: result.presentiesCount,
//                 absentCount: result.absenteesList.length,
//                 presentList: requestBody.presentArrays.sort(),
//                 absentList: result.absenteesList.sort(),
//             });
            
//             setIsVerificationModalOpen(false);
//             setTimeout(() => {
//                 setView('analytics');
//                 handleExitFullScreen();
//             }, 400);

//         } catch (error) {
//             console.error("API Error:", error);
//             alert(`Error: ${error.message}`);
//             setIsSubmitting(false);
//         }
//     };

//     const handleConfirmExit = () => {
//         handleExitFullScreen();
//         setIsExitModalOpen(false);
//         navigate(config.dashboardPath);
//     };
    
//     const renderSplashView = () => (
//         <div className="text-center animate-fade-in">
//             <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{config.title}</h1>
//             <p className="text-gray-500 mt-4 text-lg sm:text-xl">Click below to start a new session in full-screen mode.</p>
//             <button onClick={handleEnterFullScreen} className="mt-8 bg-blue-600 text-white py-4 px-12 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-300 flex items-center justify-center gap-3 mx-auto">
//                 <ArrowRight size={24} /> Start Session
//             </button>
//         </div>
//     );

//     const renderSelectionView = () => (
//         <div className="w-11/12 max-w-sm sm:max-w-md mx-auto transition-all duration-500 animate-fade-in">
//             <form onSubmit={handleStartScanning} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 sm:space-y-8 border-4 border-gray-50 text-center">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 sm:w-10 sm:h-10" /></div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{config.sessionTitle}</h1>
//                 <p className="text-gray-500 -mt-2 text-sm sm:text-base">Select a batch and course to begin</p>
//                 <div className="space-y-5 text-left">
//                     <div className="group relative">
//                          <label className="text-sm font-semibold text-gray-600">Batch</label>
//                          <div className="flex items-center mt-2">
//                              <Group className="absolute left-4 text-gray-400 group-focus-within:text-blue-600" size={20}/>
//                              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
//                                  <option value="" disabled>Select Batch</option>
//                                  {config.batches.map(batch => <option key={batch.value} value={batch.value}>{batch.label}</option>)}
//                              </select>
//                              <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
//                          </div>
//                     </div>
//                     <div className="group relative">
//                          <label className="text-sm font-semibold text-gray-600">Course / Session</label>
//                           <div className="flex items-center mt-2">
//                              <BookOpen className="absolute left-4 text-gray-400 group-focus-within:text-blue-600" size={20}/>
//                              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
//                                  <option value="" disabled>Select Course</option>
//                                  {courses.map(course => <option key={course} value={course}>{course}</option>)}
//                              </select>
//                              <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
//                          </div>
//                     </div>
//                 </div>
//                 <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 sm:py-4 mt-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
//                     <ScanLine size={24} /> Begin Scanning
//                 </button>
//             </form>
//         </div>
//     );
    
//     const renderScannerView = () => {
//         const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
//         const scanStatusColor = 
//             scanResult.type === 'success' ? 'border-green-400 text-green-300' :
//             scanResult.type === 'warning' ? 'border-yellow-400 text-yellow-300' :
//             scanResult.type === 'error' ? 'border-red-400 text-red-300' :
//             'border-white/10 text-white';

//         return (
//             <div className="w-full h-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center gap-2 sm:gap-3 p-2 justify-center animate-fade-in text-white">
//                 <div className="w-full text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10"><p className="font-bold text-md sm:text-lg">{batchLabel}</p><p className="text-xs sm:text-sm text-blue-300">{selectedCourse}</p></div>
//                 <div className="relative w-full aspect-square bg-black/50 backdrop-blur-xl rounded-3xl p-1 sm:p-2 shadow-2xl border border-white/10 scanner-container"><div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div><div className="scanner-laser"></div></div>
//                 <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
//                     <div className={`h-20 sm:h-24 bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border ${scanStatusColor} flex flex-col items-center justify-center text-center transition-colors`}>
//                         <p className="font-bold text-lg sm:text-xl tracking-wider">{lastScanned || '-----'}</p>
//                         <p className="font-semibold text-xs sm:text-sm">{scanResult.message}</p>
//                     </div>
//                     <div className="h-20 sm:h-24 bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center">
//                         <p className="text-xs text-blue-300">Scanned</p>
//                         <div className="flex items-center gap-1 sm:gap-2">
//                             <UserCheck className="mt-1" size={20}/>
//                             <p className="font-bold text-4xl sm:text-5xl tracking-tighter">{scanCount}</p>
//                         </div>
//                     </div>
//                 </div>
//                 <button onClick={() => setIsVerificationModalOpen(true)} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 mt-1 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-3"><Check size={24} /> Finish & Process</button>
//                 <button onClick={() => setIsExitModalOpen(true)} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm hover:bg-gray-500/50 transition flex items-center justify-center gap-2">
//                     <ArrowLeft size={16} /> Go Back
//                 </button>
//             </div>
//         );
//     };
    
//     const renderAnalyticsView = () => {
//         if (!reportData) return null;
//         const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
        
//         return (
//             <div className="w-11/12 max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-gray-800 animate-fade-in">
//                 <div className="text-center">
//                     <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2"/>
//                     <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">{config.reportTitle}</h1>
//                     <p className="text-green-600 font-semibold mt-1">{reportData.message}</p>
//                     <p className="text-gray-500 text-md sm:text-lg mt-2">{batchLabel} - {selectedCourse}</p>
//                 </div>
//                 <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-6 sm:my-8">
//                     <AttendanceDonutChart present={reportData.presentCount} total={reportData.total} />
//                     <div className="grid grid-cols-3 md:grid-cols-1 gap-4 w-full md:w-auto">
//                         <div className="bg-blue-50 p-4 rounded-xl text-center"><Users className="mx-auto text-blue-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.total}</p><p className="text-gray-500 font-semibold text-sm">Total</p></div>
//                         <div className="bg-green-50 p-4 rounded-xl text-center"><UserCheck className="mx-auto text-green-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.presentCount}</p><p className="text-gray-500 font-semibold text-sm">Present</p></div>
//                         <div className="bg-red-50 p-4 rounded-xl text-center"><UserX className="mx-auto text-red-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.absentCount}</p><p className="text-gray-500 font-semibold text-sm">Absent</p></div>
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
//                     <div>
//                         <h3 className="font-bold text-lg mb-2 text-green-600">Present ({reportData.presentCount})</h3>
//                         <div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">{reportData.presentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>)}</div>
//                     </div>
//                     <div>
//                         <h3 className="font-bold text-lg mb-2 text-red-600">Absent ({reportData.absentCount})</h3>
//                         <div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">{reportData.absentList.length > 0 ? reportData.absentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>) : <p className="text-gray-400 p-1">None</p>}</div>
//                     </div>
//                 </div>
//                 <button onClick={() => navigate(config.dashboardPath)} className="w-full bg-gray-700 text-white py-3 mt-6 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3">
//                     <LogOut size={24}/> Finish & Exit
//                 </button>
//             </div>
//         );
//     };

//     const renderVerificationModal = () => (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm text-center text-gray-800 animate-fade-in">
//                 <Lock size={40} className="mx-auto text-blue-500 mb-4"/>
//                 <h3 className="font-bold text-2xl mb-2">{config.verificationTitle}</h3>
//                 <p className="text-gray-500 mb-6">Enter your ID to finalize the report.</p>
//                 <input type="password" value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder={config.idPlaceholder} className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-lg"/>
//                 <div className="flex gap-4">
//                     <button onClick={() => setIsVerificationModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300" disabled={isSubmitting}>Cancel</button>
//                     <button onClick={handleProcessReport} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Confirm'}</button>
//                 </div>
//             </div>
//         </div>
//     );
    
//     return (
//         <div className="min-h-screen w-full flex items-center justify-center font-sans p-2 sm:p-4 relative overflow-hidden bg-gray-100">
//              <style>{`.scanner-container{animation:pulse-border 2s infinite}@keyframes pulse-border{0%,100%{border-color:rgba(255,255,255,.1)}50%{border-color:#38bdf8}}.scanner-laser{position:absolute;top:0;left:0;right:0;height:3px;background:#38bdf8;box-shadow:0 0 10px 2px #38bdf8;animation:laser-beam 2.s infinite linear}@keyframes laser-beam{0%{top:5%}50%{top:95%}100%{top:5%}}@keyframes fade-in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}.animate-fade-in{animation:fade-in .5s ease-out forwards}`}</style>
//             <div className={`absolute inset-0 transition-opacity duration-500 ${view === 'selection' || view === 'scanner' ? 'opacity-100' : 'opacity-0'}`}><div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div></div>
//             <div className="relative z-10 w-full h-full flex items-center justify-center">
//               {view === 'splash' && renderSplashView()}
//               {view === 'selection' && renderSelectionView()}
//               {view === 'scanner' && renderScannerView()}
//               {view === 'analytics' && renderAnalyticsView()}
//             </div>
//             {isVerificationModalOpen && renderVerificationModal()}
//             <ExitConfirmationModal 
//                 isOpen={isExitModalOpen}
//                 onClose={() => setIsExitModalOpen(false)}
//                 onConfirm={handleConfirmExit}
//                 title="Exit Session?"
//                 message="Are you sure you want to exit? All scanned attendance data for this session will be lost."
//                 confirmText="Yes, Exit"
//             />
//         </div>
//     );
// };

// export default PostAttendancePage;


// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Html5Qrcode } from 'html5-qrcode';
// import {
//     Check, Lock, Users, UserCheck, UserX, LogOut, ScanLine, ArrowRight, BookOpen,
//     ChevronDown, Group, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldQuestion, CameraOff
// } from 'lucide-react';

// // --- GLOBAL CONFIGURATION ---
// const BACKEND_URL = "http://localhost:5000"; // IMPORTANT: Ensure this matches your server's address
// const getFormattedDate = () => new Date().toISOString().split('T')[0];
// const COURSES = ["CP", "JFS", "DBMS", "AWS"];

// const ROLE_CONFIG = {
//     faculty: {
//         title: "Faculty Attendance Portal",
//         sessionTitle: "Create Session",
//         reportTitle: "Attendance Report",
//         verificationTitle: "Faculty Verification",
//         idPlaceholder: "Enter Faculty ID",
//         batches: [
//             { value: "SKILLUP-1", label: "SKILLUP BATCH-1" },
//             { value: "SKILLUP-2", label: "SKILLUP BATCH-2" },
//             { value: "SKILLUP-3", label: "SKILLUP BATCH-3" },
//             { value: "SKILLNEXT-1", label: "SKILLNEXT BATCH-1" },
//             { value: "SKILLNEXT-2", label: "SKILLNEXT BATCH-2" },
//             { value: "SKILLNEXT-3", label: "SKILLNEXT BATCH-3" },
//             { value: "SKILLBRIDGE-1", label: "SKILLBRIDGE BATCH-1" },
//         ],
//         dashboardPath: '/faculty/dashboard',
//         formatCollection: (batchValue) => `attendance_${batchValue.toLowerCase().replace(' batch', '')}`
//     },
//     admin: { /* ... Admin Configuration ... */ }
// };

// // --- ENHANCED API HELPER FUNCTION ---
// async function fetchApi(url, options = {}) {
//     try {
//         const response = await fetch(url, options);

//         if (!response.ok) {
//             let errorBody = await response.text();
//             const detailedMessage = `Server Error: Status ${response.status} (${response.statusText}).\nResponse snippet: "${errorBody.substring(0, 150)}..."`;
//             throw new Error(detailedMessage);
//         }
        
//         const contentType = response.headers.get("content-type");
//         if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
//             return null;
//         }

//         return response.json();

//     } catch (networkError) {
//         if (networkError.message.includes('Failed to fetch')) {
//              throw new Error(`Network Error: Could not connect to the API at ${BACKEND_URL}. Is the server running?`);
//         }
//         throw networkError; // Re-throw other errors (like the one we created above)
//     }
// }

// // --- REUSABLE UI COMPONENTS ---

// const AttendanceDonutChart = ({ present, total }) => {
//     const percentage = total > 0 ? (present / total) * 100 : 0;
//     const circumference = 2 * Math.PI * 54;
//     const offset = circumference - (percentage / 100) * circumference;
//     return (
//         <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
//             <svg className="w-full h-full" viewBox="0 0 120 120">
//                 <circle className="text-gray-200" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
//                 <circle
//                     className="text-green-500 transition-all duration-1000 ease-out"
//                     strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset}
//                     strokeLinecap="round" stroke="currentColor" fill="transparent"
//                     r="54" cx="60" cy="60" transform="rotate(-90 60 60)"
//                 />
//             </svg>
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <span className="text-3xl sm:text-4xl font-bold text-gray-700">{percentage.toFixed(0)}%</span>
//                 <span className="text-sm text-gray-500">Present</span>
//             </div>
//         </div>
//     );
// };

// const ExitConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
//                 <ShieldQuestion size={48} className="mx-auto text-yellow-500 mb-4" />
//                 <h3 className="text-xl font-bold text-slate-900">Exit Session?</h3>
//                 <p className="text-slate-600 mt-2 mb-6">Are you sure? All scanned data for this session will be lost.</p>
//                 <div className="flex gap-4">
//                     <button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Stay</button>
//                     <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">Yes, Exit</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ===================================================================
// // --- MAIN ATTENDANCE COMPONENT ---
// // ===================================================================

// const PostAttendancePage = () => {
//     const navigate = useNavigate();
//     const [view, setView] = useState('splash');
//     const [config, setConfig] = useState(ROLE_CONFIG.faculty);
//     const [selectedBatch, setSelectedBatch] = useState('');
//     const [selectedCourse, setSelectedCourse] = useState('');
//     const [scanResult, setScanResult] = useState({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
//     const [scanCount, setScanCount] = useState(0);
//     const [isScanningPaused, setIsScanningPaused] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [reportData, setReportData] = useState(null);
//     const [idInput, setIdInput] = useState('');
//     const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
//     const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    
//     const scannerRef = useRef(null);
//     const validStudents = useRef(new Set());
//     const scannedData = useRef(new Map());
    
//     useEffect(() => {
//         const userRole = localStorage.getItem("userRole") || 'faculty';
//         setConfig(ROLE_CONFIG[userRole] || ROLE_CONFIG.faculty);
//     }, []);

//     useEffect(() => {
//         const stopScanner = () => {
//             if (scannerRef.current && scannerRef.current.getState() === 2) {
//                 scannerRef.current.stop().catch(err => console.error("Scanner stop failed:", err));
//             }
//         };
//         const startScanner = () => {
//             if (view !== 'scanner' || isScanningPaused) return;
//             const qrScanner = new Html5Qrcode('reader');
//             scannerRef.current = qrScanner;
//             const qrboxSize = window.innerWidth < 768 ? 220 : 280;
//             const config = { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } };
//             qrScanner.start({ facingMode: 'environment' }, config, onScanSuccess)
//                 .catch(err => {
//                     console.error("QR Scanner failed to start:", err);
//                     setScanResult({ rollno: null, message: 'CAMERA ERROR', type: 'error', photoUrl: <CameraOff className="w-16 h-16 text-red-400" /> });
//                 });
//         };
//         if (view === 'scanner') startScanner();
//         else stopScanner();
//         return () => stopScanner();
//     }, [view, isScanningPaused]);

//     // --- MAIN LOGIC FUNCTIONS ---

//     const handleStartScanning = async (e) => {
//         e.preventDefault();
//         if (!selectedBatch || !selectedCourse) return;
//         setView('loading');
//         const fetchStartTime = Date.now();
//         try {
//             const collectionName = config.formatCollection(selectedBatch);
//             const url = `${BACKEND_URL}/api/Admin/getStudentsByBatch/${collectionName}`;
//             const data = await fetchApi(url);
//             if (!data || !Array.isArray(data.students)) {
//                  throw new Error("Data format from server is invalid. Expected { students: [...] }.");
//             }
//             validStudents.current = new Set(data.students);
//             const elapsedTime = Date.now() - fetchStartTime;
//             const remainingTime = 2000 - elapsedTime;
//             setTimeout(() => setView('scanner'), remainingTime > 0 ? remainingTime : 0);
//         } catch (error) {
//             console.error("Critical Error in handleStartScanning:", error);
//             alert(`Could not start session. \nReason: ${error.message}`);
//             setView('selection');
//         }
//     };
    
//     const onScanSuccess = (decodedText) => {
//         if (isScanningPaused) return;
//         setIsScanningPaused(true);
//         const rollMatch = decodedText.match(/Roll No:\s*([A-Z0-9]+)/i);
//         const rollno = rollMatch ? rollMatch[1].trim().toUpperCase() : null;
//         let result;
//         if (!rollno) {
//             result = { rollno: 'INVALID', message: 'Invalid QR Format', type: 'error' };
//         } else if (scannedData.current.has(rollno)) {
//             result = { rollno, message: 'Already Scanned', type: 'warning' };
//         } else if (!validStudents.current.has(rollno)) {
//             result = { rollno, message: 'Not from this batch', type: 'error' };
//         } else {
//             scannedData.current.set(rollno, decodedText);
//             setScanCount(scannedData.current.size);
//             const photoUrl = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollno}/${rollno}.jpg`;
//             result = { rollno, message: 'Verified!', type: 'success', photoUrl };
//         }
//         setScanResult(result);
//         setTimeout(() => {
//             setScanResult({ rollno: null, message: 'Point camera at QR code', type: 'info', photoUrl: null });
//             setIsScanningPaused(false);
//         }, 2000);
//     };

//     const handleProcessReport = async () => {
//         const storedId = localStorage.getItem("userIdentifier");
//         if (idInput.trim().toLowerCase() !== storedId?.toLowerCase()) {
//             return alert("ID does not match. Please try again.");
//         }
//         setIsSubmitting(true);
//         const requestBody = {
//             collectionName: config.formatCollection(selectedBatch),
//             date: getFormattedDate(),
//             course: selectedCourse,
//             presentMap: Object.fromEntries(scannedData.current),
//         };
//         try {
//             const url = `${BACKEND_URL}/api/Faculty/Mark-Attendance`;
//             const result = await fetchApi(url, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(requestBody),
//             });
//             setReportData({
//                 message: result.message,
//                 total: result.totalMarked || 0,
//                 presentCount: result.presentiesCount || 0,
//                 absentCount: result.absenteesCount || 0,
//                 presentList: Array.from(scannedData.current.keys()).sort(),
//                 absentList: result.absenteesList || [],
//             });
//             setIsVerificationModalOpen(false);
//             setTimeout(() => {
//                 setView('analytics');
//                 handleExitFullScreen();
//             }, 400);
//         } catch (error) {
//             console.error("API Error:", error);
//             alert(`Error: ${error.message}`);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
    
//     // --- UI Navigation & Fullscreen ---
//     const handleEnterFullScreen = () => { document.documentElement.requestFullscreen().catch(() => {}); setView('selection'); };
//     const handleExitFullScreen = () => { if (document.fullscreenElement) document.exitFullscreen(); };
//     const handleConfirmExit = () => {
//         handleExitFullScreen();
//         scannedData.current.clear();
//         setScanCount(0);
//         setView('selection');
//         setIsExitModalOpen(false);
//     };
    
//     // --- RENDER FUNCTIONS FOR EACH VIEW ---
//     const renderSplashView = () => (
//         <div className="text-center animate-fade-in">
//             <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{config.title}</h1>
//             <p className="text-gray-500 mt-4 text-lg sm:text-xl">Click below to start a new session.</p>
//             <button onClick={handleEnterFullScreen} className="mt-8 bg-blue-600 text-white py-4 px-12 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto">
//                 <ArrowRight size={24} /> Start Session
//             </button>
//         </div>
//     );
    
//     const renderLoadingView = () => (
//         <div className="flex flex-col items-center justify-center text-white text-center animate-fade-in">
//             <Loader2 className="w-16 h-16 animate-spin mb-4" />
//             <h2 className="text-2xl font-bold">Preparing Session...</h2>
//             <p className="text-blue-300 mt-2">Fetching student list for {selectedCourse}.</p>
//         </div>
//     );

//     const renderSelectionView = () => (
//         <div className="w-11/12 max-w-sm sm:max-w-md mx-auto transition-all duration-500 animate-fade-in">
//             <form onSubmit={handleStartScanning} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 sm:space-y-8 border-4 border-gray-50 text-center">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 sm:w-10 sm:h-10" /></div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{config.sessionTitle}</h1>
//                 <p className="text-gray-500 -mt-2 text-sm sm:text-base">Select a batch and course to begin</p>
//                 <div className="space-y-5 text-left">
//                     <div className="group relative">
//                          <label className="text-sm font-semibold text-gray-600">Batch</label>
//                          <div className="flex items-center mt-2">
//                              <Group className="absolute left-4 text-gray-400 group-focus-within:text-blue-600" size={20}/>
//                              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
//                                  <option value="" disabled>Select Batch</option>
//                                  {config.batches.map(batch => <option key={batch.value} value={batch.value}>{batch.label}</option>)}
//                              </select>
//                              <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
//                          </div>
//                     </div>
//                     <div className="group relative">
//                          <label className="text-sm font-semibold text-gray-600">Course / Session</label>
//                          <div className="flex items-center mt-2">
//                              <BookOpen className="absolute left-4 text-gray-400 group-focus-within:text-blue-600" size={20}/>
//                              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="pl-12 pr-10 appearance-none w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-base text-gray-700 focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
//                                  <option value="" disabled>Select Course</option>
//                                  {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
//                              </select>
//                              <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none"/>
//                          </div>
//                     </div>
//                 </div>
//                 <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 sm:py-4 mt-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
//                     <ScanLine size={24} /> Begin Scanning
//                 </button>
//             </form>
//         </div>
//     );
    
//     const renderScannerView = () => {
//         const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
//         const ResultIcon = () => {
//             switch (scanResult.type) {
//                 case 'success': return <CheckCircle2 className="w-10 h-10 text-green-400" />;
//                 case 'warning': return <AlertTriangle className="w-10 h-10 text-yellow-400" />;
//                 case 'error': return <XCircle className="w-10 h-10 text-red-400" />;
//                 default: return <ScanLine className="w-10 h-10 text-blue-400" />;
//             }
//         };
//         return (
//             <div className="w-full h-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center gap-3 p-2 justify-center animate-fade-in text-white">
//                 <div className="w-full text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10">
//                     <p className="font-bold text-lg">{batchLabel}</p><p className="text-xs text-blue-300">{selectedCourse}</p>
//                 </div>
//                 <div className="relative w-full aspect-square bg-black/50 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border-2 border-white/10 scanner-container">
//                     <div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div>
//                     {!isScanningPaused && <div className="scanner-laser"></div>}
//                     {scanResult.photoUrl && typeof scanResult.photoUrl === 'string' && (
//                         <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl animate-fade-in">
//                             <img src={scanResult.photoUrl} alt="Student" className="w-48 h-48 rounded-full border-4 border-green-400 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
//                         </div>
//                     )}
//                     {scanResult.type === 'error' && scanResult.message === 'CAMERA ERROR' && (
//                         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl animate-fade-in">
//                             {scanResult.photoUrl} <p className="mt-4 text-center font-semibold">Camera permission denied or camera not found.</p>
//                         </div>
//                     )}
//                 </div>
//                 <div className="w-full grid grid-cols-3 gap-3">
//                     <div className="col-span-2 bg-black/30 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/10 flex items-center gap-4">
//                         <ResultIcon />
//                         <div><p className="font-bold text-xl tracking-wider">{scanResult.rollno || '-----'}</p><p className="font-semibold text-sm">{scanResult.message}</p></div>
//                     </div>
//                     <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/10 flex flex-col items-center justify-center text-center">
//                         <p className="text-xs text-blue-300">Scanned</p>
//                         <div className="flex items-center gap-2"><UserCheck className="mt-1" size={20}/><p className="font-bold text-5xl tracking-tighter">{scanCount}</p></div>
//                     </div>
//                 </div>
//                 <button onClick={() => setIsVerificationModalOpen(true)} className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 mt-1 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-3">
//                     <Check size={24} /> Finish & Process
//                 </button>
//                 <button onClick={() => setIsExitModalOpen(true)} className="w-full bg-gray-600/50 text-white py-2 rounded-xl font-semibold text-sm hover:bg-gray-500/50 transition flex items-center justify-center gap-2">
//                     <ArrowLeft size={16} /> Go Back
//                 </button>
//             </div>
//         );
//     };
    
//     const renderAnalyticsView = () => {
//         if (!reportData) return <div className="text-white">Generating report...</div>;
//         const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
//         return (
//             <div className="w-11/12 max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-gray-800 animate-fade-in">
//                 <div className="text-center">
//                     <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2"/>
//                     <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">{config.reportTitle}</h1>
//                     <p className="text-green-600 font-semibold mt-1">{reportData.message}</p>
//                     <p className="text-gray-500 text-md sm:text-lg mt-2">{batchLabel} - {selectedCourse}</p>
//                 </div>
//                 <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-6 sm:my-8">
//                     <AttendanceDonutChart present={reportData.presentCount} total={reportData.total} />
//                     <div className="grid grid-cols-3 md:grid-cols-1 gap-4 w-full md:w-auto">
//                         <div className="bg-blue-50 p-4 rounded-xl text-center"><Users className="mx-auto text-blue-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.total}</p><p className="text-gray-500 font-semibold text-sm">Total</p></div>
//                         <div className="bg-green-50 p-4 rounded-xl text-center"><UserCheck className="mx-auto text-green-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.presentCount}</p><p className="text-gray-500 font-semibold text-sm">Present</p></div>
//                         <div className="bg-red-50 p-4 rounded-xl text-center"><UserX className="mx-auto text-red-500 mb-1" size={24}/><p className="text-3xl font-bold">{reportData.absentCount}</p><p className="text-gray-500 font-semibold text-sm">Absent</p></div>
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
//                     <div>
//                         <h3 className="font-bold text-lg mb-2 text-green-600">Present ({reportData.presentCount})</h3>
//                         <div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">{reportData.presentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>)}</div>
//                     </div>
//                     <div>
//                         <h3 className="font-bold text-lg mb-2 text-red-600">Absent ({reportData.absentCount})</h3>
//                         <div className="h-40 bg-gray-50 rounded-lg p-3 overflow-y-auto border">{reportData.absentList.length > 0 ? reportData.absentList.map(roll => <p key={roll} className="py-1 font-mono text-sm">{roll}</p>) : <p className="text-gray-400 p-1">None</p>}</div>
//                     </div>
//                 </div>
//                 <button onClick={() => navigate(config.dashboardPath)} className="w-full bg-gray-700 text-white py-3 mt-6 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3">
//                     <LogOut size={24}/> Finish & Exit
//                 </button>
//             </div>
//         );
//     };

//     const renderVerificationModal = () => (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm text-center text-gray-800 animate-fade-in">
//                 <Lock size={40} className="mx-auto text-blue-500 mb-4"/>
//                 <h3 className="font-bold text-2xl mb-2">{config.verificationTitle}</h3>
//                 <p className="text-gray-500 mb-6">Enter your ID to finalize the report.</p>
//                 <input type="password" value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder={config.idPlaceholder} className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-lg"/>
//                 <div className="flex gap-4">
//                     <button onClick={() => setIsVerificationModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300" disabled={isSubmitting}>Cancel</button>
//                     <button onClick={handleProcessReport} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center" disabled={!idInput || isSubmitting}>
//                         {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Processing...</> : 'Confirm'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
    
//     // This function decides which view to show
//     const renderView = () => {
//         switch (view) {
//             case 'splash': return renderSplashView();
//             case 'selection': return renderSelectionView();
//             case 'loading': return renderLoadingView();
//             case 'scanner': return renderScannerView();
//             case 'analytics': return renderAnalyticsView();
//             default: return renderSplashView();
//         }
//     };
    
//     return (
//         <div className="min-h-screen w-full flex items-center justify-center font-sans p-2 sm:p-4 relative overflow-hidden bg-gray-100">
//              <style>{`
//                 .scanner-container { animation: pulse-border 2s infinite; }
//                 @keyframes pulse-border { 0%, 100% { border-color: rgba(59, 130, 246, 0.4); } 50% { border-color: rgba(59, 130, 246, 1); } }
//                 .scanner-laser {
//                     position: absolute; top: 0; left: 0; right: 0;
//                     height: 3px; background: #38bdf8;
//                     box-shadow: 0 0 10px 2px #38bdf8;
//                     animation: laser-beam 2s infinite linear;
//                 }
//                 @keyframes laser-beam { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } }
//                 @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
//                 .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
//              `}</style>
//             <div className={`absolute inset-0 transition-opacity duration-500 ${['selection', 'scanner', 'loading', 'analytics'].includes(view) ? 'opacity-100' : 'opacity-0'}`}>
//                 <div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"/>
//             </div>
//             {/* The background needs to be different for the analytics view */}
//             {view !== 'analytics' && <div className={`absolute inset-0 transition-opacity duration-500 ${['selection', 'scanner', 'loading'].includes(view) ? 'opacity-100' : 'opacity-0'}`}><div className="absolute inset-0 bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225]"></div></div>}
            
//             <div className="relative z-10 w-full h-full flex items-center justify-center">
//                 {renderView()}
//             </div>
            
//             {isVerificationModalOpen && renderVerificationModal()}
//             <ExitConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={handleConfirmExit} />
//         </div>
//     );
// };

// export default PostAttendancePage;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import html2canvas from 'html2canvas';
// import { Loader2, AlertTriangle, Users, CheckCircle, XCircle } from 'lucide-react';

import {
  Check, Lock, Users, UserCheck, UserX, LogOut, ScanLine, ArrowRight, BookOpen,
  ChevronDown, Group, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2,
  ShieldQuestion, CameraOff, FileJson, Info, Download, Camera,CheckCircle
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

// --- UI COMPONENTS ---
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
  const [isJsonVisible, setIsJsonVisible] = useState(false);

  const scannerRef = useRef(null);
  const reportRef = useRef(null);
  const validStudents = useRef(new Set());
  const scannedData = useRef(new Map());

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
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === Html5QrcodeScannerState.SCANNING) {
            await scannerRef.current.stop();
          }
        } catch (err) {
          // ignore
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

  useEffect(() => {
    const preventGestures = (e) => e.preventDefault();
    if (view === 'scanner') {
      document.body.style.overscrollBehavior = 'contain';
      document.body.addEventListener('touchmove', preventGestures, { passive: false });
    }
    return () => {
      document.body.style.overscrollBehavior = 'auto';
      document.body.removeEventListener('touchmove', preventGestures);
    };
  }, [view]);

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
    // Store only hash, not full JSON string
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
      setUserMessage({ text: "The ID you entered does not match the stored identifier. Please try again.", type: 'error' });
      return;
    }
    setIsSubmitting(true);
    const presentObj = Object.fromEntries(scannedData.current);
    const requestBody = {
      collectionName: config.formatCollection(selectedBatch),
      date: getFormattedDate(),
      course: selectedCourse,
      presentMap: presentObj
    };
    console.log(requestBody);
    try {
      const url = `${BACKEND_URL}/api/Faculty/Mark-Attendance`;
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

  const handleScreenshot = () => {
    if (!reportRef.current) return;
    html2canvas(reportRef.current, {
      useCORS: true,
      backgroundColor: '#f8fafc',
      scale: 2
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `Attendance-Report-${selectedBatch}-${getFormattedDate()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleEnterFullScreen = () => {
    document.documentElement.requestFullscreen().catch(() => {});
    setView('selection');
  };

  const handleConfirmExit = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    navigate(config.dashboardPath);
  };

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
    if (!reportData) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 text-center animate-fade-in min-h-[30vh]">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-300">Generating Report...</h2>
            </div>
        );
    }

    const { message, totalMarked, presentiesCount, absenteesCount, mismatchedStudents } = reportData;
    const batchLabel = config.batches.find(b => b.value === selectedBatch)?.label || selectedBatch;
    const formattedDate = new Date(getFormattedDate()).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div
            className="max-w-3xl w-full bg-[#0A1B3A] text-white rounded-2xl shadow-2xl p-6 sm:p-8 mx-auto animate-fade-in"
            ref={reportRef}
        >
            {/* Header */}
            <header className="text-center mb-10">
                <div className="mx-auto h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                    {config.reportTitle}
                </h1>
                <p className="text-md text-gray-400 font-medium mt-1">{batchLabel} - {selectedCourse}</p>
                <p className="text-xs text-gray-500 font-mono mt-2">{formattedDate}</p>
            </header>

            {/* Success message */}
            <section className="mb-10 text-center">
                <p className="text-gray-300 font-medium text-lg">{message}</p>
            </section>

            {/* Stats grid with subtle card design */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-10">
                {/* Total Students */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                    <Users className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                    <p className="text-4xl font-bold text-white mb-1">{totalMarked}</p>
                    <p className="uppercase text-gray-400 tracking-wide text-sm">Total</p>
                </div>
                {/* Present */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                    <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-400" />
                    <p className="text-4xl font-bold text-white mb-1">{presentiesCount}</p>
                    <p className="uppercase text-gray-400 tracking-wide text-sm">Present</p>
                </div>
                {/* Absent */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                    <XCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
                    <p className="text-4xl font-bold text-white mb-1">{absenteesCount}</p>
                    <p className="uppercase text-gray-400 tracking-wide text-sm">Absent</p>
                </div>
            </section>

            {/* Mismatched students */}
            {Array.isArray(mismatchedStudents) && mismatchedStudents.length > 0 && (
                <section className="border border-yellow-700 bg-yellow-900/30 rounded-lg p-5 mb-10">
                    <h2 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle size={20} aria-hidden="true" />
                        Mismatched QR Codes
                    </h2>
                    <p className="text-yellow-300 mb-4 text-sm">
                        The following roll numbers did not match the batch and require review:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {mismatchedStudents.map((roll) => (
                            <span
                                key={roll}
                                className="inline-block bg-yellow-800 text-yellow-200 text-xs font-mono px-3 py-1 rounded-full shadow-inner"
                            >
                                {roll}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Back to dashboard button */}
            <section className="text-center">
                <button
                    type="button"
                    onClick={() => navigate(config.dashboardPath)}
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-700 text-white font-semibold rounded-full shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-600 transition-all duration-300 transform hover:scale-105"
                >
                    <span className="text-sm">Back to Dashboard</span>
                </button>
            </section>
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
