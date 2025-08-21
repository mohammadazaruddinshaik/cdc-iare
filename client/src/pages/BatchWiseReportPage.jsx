import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, Download, CheckCircle } from 'lucide-react';

// You may need to adjust this path based on your project structure.
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
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

    // Ensure userRole is set for the Header component to function correctly
    useEffect(() => {
        localStorage.setItem("userRole", "admin");
        setTimeout(() => setAnimate(true), 100);
    }, []);

    const backendUrl = "https://iareattendancemgmt.onrender.com";

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
    
    const getTodayDateFormatted = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDownload = async (format) => {
        if (!selectedBatch) {
            showToast("⚠️ Please select a batch first.", 'error');
            return;
        }
        setIsLoading(true);

        const isPdf = format === 'pdf';
        const endpoint = isPdf
            ? `/api/admin/attendance/complete-report-pdf/${selectedBatch}`
            : `/api/admin/attendance/complete-report/${selectedBatch}`;
        
        const fileExtension = isPdf ? 'pdf' : 'xlsx';
        const url = `${backendUrl}${endpoint}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Download failed. Report may not be available.");
            }

            const shortBatch = getShortBatchName(selectedBatch);
            const today = getTodayDateFormatted();
            const filename = `${shortBatch}-${today}-CompleteReport.${fileExtension}`;

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
            {/* Custom Scrollbar Styling */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; }
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
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>

                <main className="flex justify-center items-center pt-10 pb-20 px-4">
                    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-8 sm:p-10 max-w-2xl w-full shadow-2xl border border-white/10 transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        
                        <div className="text-center mb-8">
                            <div className="mx-auto h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-blue-400/30">
                                <Download className="h-8 w-8 text-blue-300" />
                            </div>
                            <h1 className="mt-4 text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                                Complete Batch Report
                            </h1>
                            <p className="mt-2 text-md text-gray-400">
                                Download the full attendance history for a single batch.
                            </p>
                        </div>
                        
                        <div className="space-y-8">
                            {/* --- ENHANCED BATCH SELECTION --- */}
                            <div className="space-y-3">
                                <label className="block text-md font-semibold text-gray-300">
                                    1. Select Batch
                                </label>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 bg-black/20 p-4 rounded-xl border border-white/10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {batches.map((batch) => {
                                            const isSelected = selectedBatch === batch.value;
                                            return (
                                                <button
                                                    key={batch.value}
                                                    onClick={() => setSelectedBatch(batch.value)}
                                                    className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white shadow-lg'
                                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent hover:border-white/20'
                                                    }`}
                                                >
                                                    {batch.label}
                                                    {isSelected && <CheckCircle size={18} className="flex-shrink-0"/>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* --- DOWNLOAD SECTION --- */}
                            <div className="space-y-3 pt-6 border-t border-white/10">
                                <label className="block text-md font-semibold text-gray-300">
                                    2. Choose Format & Download
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleDownload('pdf')}
                                        disabled={isLoading || !selectedBatch}
                                        className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
                                    >
                                        <FileText size={20} />
                                        PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload('excel')}
                                        disabled={isLoading || !selectedBatch}
                                        className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
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