import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, Download, CheckCircle, Calendar, Info, ChevronDown } from 'lucide-react';
import Header from '../components/Header';

// --- Reusable Helper Components (Styled for Dark Theme) ---

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


// --- Main Page Component ---
const BatchWiseReport = () => {
    const [animate, setAnimate] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

    useEffect(() => {
        // Sets a default date to today for the date input
        localStorage.setItem("userRole", "admin");
        setDate(new Date().toISOString().split("T")[0]);
        setTimeout(() => setAnimate(true), 100);
    }, []);

    const backendUrl = "http://localhost:5000";

    const batches = [
        { value: "attendance_skillup-1", label: "SKILLUP BATCH-1" },
        { value: "attendance_skillup-2", label: "SKILLUP BATCH-2" },
        { value: "attendance_skillup-3", label: "SKILLUP BATCH-3" },
        { value: "attendance_skillnext-1", label: "SKILLNEXT BATCH-1" },
        { value: "attendance_skillnext-2", label: "SKILLNEXT BATCH-2" },
        { value: "attendance_skillnext-3", label: "SKILLNEXT BATCH-3" },
        { value: "attendance_skillbridge-1", label: "SKILLBRIDGE BATCH-1" },
        { value: "attendance_skillbridge-2", label: "SKILLBRIDGE BATCH-2" },
        { value: "attendance_skillbridge-3", label: "SKILLBRIDGE BATCH-3" },
        { value: "attendance_skillbridge-4", label: "SKILLBRIDGE BATCH-4" },
        { value: "attendance_skillbridge-5", label: "SKILLBRIDGE BATCH-5" }
    ];

    const showToast = (message, type = 'info') => {
        setToast({ message, type, visible: true });
    };

    const getShortBatchName = (fullBatchName) => {
        const batchPart = fullBatchName.split("_")[1]?.toUpperCase() || "";
        const [type, number] = batchPart.split("-");
        let code = "NA";
        if (type === "SKILLUP") code = "SU";
        else if (type === "SKILLNEXT") code = "SN";
        else if (type === "SKILLBRIDGE") code = "SB";
        return `V-${code}${number}`;
    };
    
    const formatDateForFilename = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split("-");
        return `${day}-${month}-${year}`;
    };

    const handleDownload = async (format) => {
        if (!selectedBatch || !date) {
            showToast("⚠️ Please select a batch and a date.", 'error');
            return;
        }
        setIsLoading(true);

        const params = new URLSearchParams();
        params.append("batch", selectedBatch);
        params.append("date", date);

        const isPdf = format === 'pdf';
        const endpoint = isPdf
            ? `/api/Admin/attendance-batch-report-pdf`
            : `/api/Admin/attendance-batch-report-excel`;
        
        const fileExtension = isPdf ? 'pdf' : 'xlsx';
        const url = `${backendUrl}${endpoint}?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Download failed. No records found for the selection.");
            }

            const shortBatch = getShortBatchName(selectedBatch);
            const formattedDate = formatDateForFilename(date);
            const filename = `${shortBatch}-${formattedDate}-AttendanceReport.${fileExtension}`;

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
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast({ ...toast, visible: false })}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-2 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>

                <main className="w-full flex justify-center items-start pt-4 pb-20 px-4">
                    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-2xl flex flex-col shadow-2xl border border-white/10 transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        
                        <div className="text-center mb-8">
                            <div className="mx-auto h-14 w-14 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-blue-400/30">
                                <Download className="h-7 w-7 text-blue-300" />
                            </div>
                            <h1 className="mt-4 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                                Batch-Wise Daily Report
                            </h1>
                            
                        </div>
                        
                     
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
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
                            <div className="space-y-2 relative">
                                <label className="block text-md font-semibold text-gray-300">
                                    2. Select Batch
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-[#0A1B3A] text-gray-400">Select a Batch</option>
                                        {batches.map((batch) => (
                                            <option key={batch.value} value={batch.value} className="bg-[#0A1B3A] text-white">
                                                {batch.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 pt-6 border-t border-white/10">
                                <label className="block text-md font-semibold text-gray-300 text-center">
                                    3. Choose Format & Download
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleDownload('pdf')}
                                        disabled={isLoading || !selectedBatch || !date}
                                        className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileText size={20} />
                                        PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload('excel')}
                                        disabled={isLoading || !selectedBatch || !date}
                                        className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileSpreadsheet size={20} />
                                        Excel
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

export default BatchWiseReport;
