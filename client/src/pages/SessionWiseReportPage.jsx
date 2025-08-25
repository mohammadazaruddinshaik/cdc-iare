import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, Download, Calendar, Clock, CheckSquare, Eye, X } from 'lucide-react';
import Header from '../components/Header';
// --- Reusable Helper Components ---

const SpinnerOverlay = ({ isLoading }) => {
    if (!isLoading) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-14 h-14 border-4 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
};

const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const baseStyle = "fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 text-white rounded-lg shadow-xl text-sm font-semibold";
    const typeStyle = type === 'error' ? 'bg-red-500' : 'bg-green-500';

    return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};

// --- New Preview Modal Component ---
const PreviewModal = ({ isOpen, onClose, batches }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#0A1B3A] border border-white/20 rounded-2xl shadow-xl max-w-md w-full relative transition-all duration-300 transform scale-100 opacity-100">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Scheduled Batches</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 max-h-80 overflow-y-auto custom-scrollbar">
                    {batches.length > 0 ? (
                        <ul className="space-y-2">
                            {batches.map((batchName, index) => (
                                <li key={index} className="bg-white/5 p-3 rounded-lg text-gray-300 text-sm">
                                    {batchName}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No batches found for this selection.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const SessionReport = () => {
    const [animate, setAnimate] = useState(false);
    const [date, setDate] = useState('');
    const [session, setSession] = useState('');
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
    const [isPreviewVisible, setIsPreviewVisible] = useState(false); // State for modal

    // --- Data for Automatic Batch Selection (now includes labels) ---
    const batchesData = [
        { id: "b1", value: "attendance_skillup-1", label: "SKILLUP BATCH-1" },
        { id: "b2", value: "attendance_skillup-2", label: "SKILLUP BATCH-2" },
        { id: "b3", value: "attendance_skillup-3", label: "SKILLUP BATCH-3" },
        { id: "b4", value: "attendance_skillnext-1", label: "SKILLNEXT BATCH-1" },
        { id: "b5", value: "attendance_skillnext-2", label: "SKILLNEXT BATCH-2" },
        { id: "b6", value: "attendance_skillnext-3", label: "SKILLNEXT BATCH-3" },
        { id: "b7", value: "attendance_skillbridge-1", label: "SKILLBRIDGE BATCH-1" },
        { id: "b8", value: "attendance_skillbridge-2", label: "SKILLBRIDGE BATCH-2" },
        { id: "b9", value: "attendance_skillbridge-3", label: "SKILLBRIDGE BATCH-3" },
        { id: "b10", value: "attendance_skillbridge-4", label: "SKILLBRIDGE BATCH-4" },
        { id: "b11", value: "attendance_skillbridge-5", label: "SKILLBRIDGE BATCH-5" }
    ];

    const batchMapByDayAndSession = {
        Mon: { FN: ["b1", "b2", "b4", "b5", "b7", "b8", "b9"], AN: ["b3", "b6", "b10", "b11"] },
        Tue: { FN: ["b1", "b2", "b4", "b5", "b7", "b8", "b9"], AN: ["b3", "b6", "b10", "b11"] },
        Wed: { FN: ["b1", "b2", "b4", "b5", "b7", "b8", "b9"], AN: ["b3", "b6", "b10", "b11"] },
        Thu: { AN: ["b1", "b2", "b4", "b5", "b7", "b8", "b9"], FN: ["b3", "b6", "b10", "b11"] },
        Fri: { AN: ["b1", "b2", "b4", "b5", "b7", "b8", "b9"], FN: ["b3", "b6", "b10", "b11"] },
        Sat: { AN: ["b1", "b2", "b4", "b5", "b7", "b8", "b9"], FN: ["b3", "b6", "b10", "b11"] }
    };
    // --- End of Data ---

    useEffect(() => {
        localStorage.setItem("userRole", "admin");
        setDate(new Date().toISOString().split("T")[0]);
        setTimeout(() => setAnimate(true), 100);
    }, []);

    useEffect(() => {
        if (date && session) {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const weekday = days[new Date(date).getDay()];
            const scheduledBatchIds = batchMapByDayAndSession[weekday]?.[session] || [];
            const batchValues = scheduledBatchIds
                .map(id => batchesData.find(b => b.id === id)?.value)
                .filter(Boolean);
            setSelectedBatches(batchValues);
        } else {
            setSelectedBatches([]);
        }
    }, [date, session]);
    
    // Derived state for the modal content
    const selectedBatchLabels = selectedBatches
        .map(value => batchesData.find(b => b.value === value)?.label)
        .filter(Boolean);

    // --- MODIFIED: Set the correct base URL ---
    const backendUrl =  import.meta.env.VITE_BASE_URL;

    const showToast = (message, type = 'info') => {
        setToast({ message, type, visible: true });
    };

    const formatDateForFilename = (isoDate) => {
        const [year, month, day] = isoDate.split("-");
        return `${day}-${month}-${year}`;
    };

    const handleDownload = async (format) => {
        if (!date || !session) {
            showToast("⚠️ Please select a date and session.", 'error');
            return;
        }
        if (selectedBatches.length === 0) {
             showToast("ℹ️ No batches are scheduled for this date and session.", 'info');
             return;
        }
        setIsLoading(true);

        const params = new URLSearchParams();
        selectedBatches.forEach(batch => params.append("batch", batch));
        params.append("date", date);
        params.append("session", session);

        const isPdf = format === 'pdf';
        
        // --- MODIFIED: Updated endpoint logic to match the required routes ---
        const endpoint = isPdf
            ? `/api/Admin/attendance-Session-report-pdf`
            : `/api/Admin/attendance-Session-report-excel`;
        
        const fileExtension = isPdf ? 'pdf' : 'xlsx';
        const url = `${backendUrl}${endpoint}?${params.toString()}`;

        try {
            const response = await fetch(url, {method: "GET", credentials: "include"});
            if (!response.ok) {
                throw new Error("Download failed. No records found for the selection.");
            }
            
            const formattedDate = formatDateForFilename(date);
            const filename = `VSEM_${session}-${formattedDate}-AttendanceReport.${fileExtension}`;

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
            
            showToast(`✅ ${format.toUpperCase()} report downloaded successfully.`, 'success');
        } catch (error) {
            console.error("Download Error:", error);
            showToast(`❌ ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
            `}</style>
            
            <SpinnerOverlay isLoading={isLoading} />
            {toast.visible && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, visible: false })} />}
            <PreviewModal isOpen={isPreviewVisible} onClose={() => setIsPreviewVisible(false)} batches={selectedBatchLabels} />

            <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>

                <main className="flex justify-center items-center pt-10 pb-20 px-4">
                    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/10 transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="text-center mb-6">
                            <div className="mx-auto h-14 w-14 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-blue-400/30">
                                <Download className="h-7 w-7 text-blue-300" />
                            </div>
                            <h1 className="mt-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                                Session Wise Report
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                Reports are generated based on the daily schedule.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label htmlFor="date" className="flex items-center gap-2 text-md font-semibold text-gray-300">
                                        <Calendar size={18}/> 1. Select Date
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-md font-semibold text-gray-300">
                                        <Clock size={18}/> 2. Select Session
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setSession('FN')} className={`p-3 rounded-lg text-sm font-semibold transition-all ${session === 'FN' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>Forenoon (FN)</button>
                                        <button onClick={() => setSession('AN')} className={`p-3 rounded-lg text-sm font-semibold transition-all ${session === 'AN' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>Afternoon (AN)</button>
                                    </div>
                                </div>
                            </div>

                            {/* --- BATCHES FEEDBACK WITH PREVIEW --- */}
                            <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-md text-white flex items-center gap-2">
                                        <CheckSquare size={18} className="text-green-400"/> Auto-Selected Batches
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Based on the schedule for the chosen date & session.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-300">{selectedBatches.length}</p>
                                    <button 
                                        onClick={() => setIsPreviewVisible(true)}
                                        disabled={selectedBatches.length === 0}
                                        className="text-xs flex items-center gap-1 text-blue-300 hover:text-blue-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Eye size={14}/> View
                                    </button>
                                </div>
                            </div>

                            {/* --- Download section --- */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="block text-md font-semibold text-gray-300 text-center">
                                    3. Download Report
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleDownload('pdf')}
                                        disabled={isLoading || selectedBatches.length === 0}
                                        className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileText size={20} /> PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload('excel')}
                                        disabled={isLoading || selectedBatches.length === 0}
                                        className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileSpreadsheet size={20} /> Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default SessionReport;
