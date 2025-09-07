import React, { useState, useEffect, useRef } from 'react';
import { FileText, Sheet, Download, AlertTriangle, CheckCircle, ChevronUp, Loader2, XCircle, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

// --- Configuration & Helpers ---
const backendUrl = import.meta.env.VITE_BASE_URL;

const batchOptions = [
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
    { value: "attendance_skillbridge-5", label: "SKILLBRIDGE BATCH-5" },
];

const getShortBatchName = (fullBatchName) => {
    const batchPart = fullBatchName.split("_")[1]?.toUpperCase() || "";
    const [type, number] = batchPart.split("-");
    let code = "NA";
    if (type === "SKILLUP") code = "SU";
    else if (type === "SKILLNEXT") code = "SN";
    else if (type === "SKILLBRIDGE") code = "SB";
    return `V-${code}${number}`;
};

// --- Main Component ---
const ViewAttendanceReport = () => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState({ type: null, status: 'idle' });
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    const dropdownRef = useRef(null);
    const [animateHeader, setAnimateHeader] = useState(false);
    const navigate = useNavigate(); // <-- Initialize useNavigate

    useEffect(() => {
        setTimeout(() => setAnimateHeader(true), 100);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showFeedback = (msg, type) => {
        setFeedback({ msg, type });
        setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
    };

    const handleDownload = async (fileType) => {
        if (!selectedBatch || !selectedDate) {
            showFeedback("Please select a batch and a date.", 'error');
            return;
        }
        
        setDownloadStatus({ type: fileType, status: 'loading' });
        setFeedback({ msg: '', type: '' });

        const url = fileType === 'pdf'
            ? `${backendUrl}/api/Faculty/batch-report-pdf?batch=${selectedBatch.value}&date=${selectedDate}`
            : `${backendUrl}/api/Faculty/batch-report-excel?batch=${selectedBatch.value}&date=${selectedDate}`;

        const fileExtension = fileType === 'pdf' ? 'pdf' : 'xlsx';
        const successMessage = `${fileType.toUpperCase()} report generated successfully.`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Network response failed");
            }

            const shortBatch = getShortBatchName(selectedBatch.value);
            const [year, month, day] = selectedDate.split('-');
            const formattedDate = `${day}-${month}-${year}`;
            const filename = `${shortBatch}-${formattedDate}-Attendance.${fileExtension}`;

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(blobUrl);
            showFeedback(successMessage, 'success');
            setDownloadStatus({ type: fileType, status: 'success' });

        } catch (error) {
            console.error("Download error:", error);
            // **UPDATED ERROR HANDLING**
            sessionStorage.clear(); // Clear storage
            navigate('/', { replace: true }); // Redirect to login page
        } finally {
            // This timeout will now primarily affect the success state visually
            setTimeout(() => setDownloadStatus({ type: null, status: 'idle' }), 2000);
        }
    };

    const renderButtonIcon = (type, IconComponent) => {
        const currentStatus = downloadStatus.type === type ? downloadStatus.status : 'idle';
        
        switch(currentStatus) {
            case 'loading': return <Loader2 className="w-6 h-6 animate-spin" />;
            case 'success': return <CheckCircle className="w-6 h-6" />;
            case 'error': return <XCircle className="w-6 h-6" />;
            default: return <IconComponent className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen font-sans bg-slate-900 text-white flex flex-col relative overflow-hidden">
            <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>

            <header className="relative z-20 w-full shrink-0 bg-slate-900/50 backdrop-blur-sm">
                <div className="px-2 sm:px-6 lg:px-8 py-2">
                    <Header animate={animateHeader} />
                </div>
            </header>

            <main className="relative z-10 flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4 border border-white/10 shadow-lg">
                            <Download className="w-8 h-8 text-sky-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Download Report</h2>
                        <p className="text-slate-400 mt-1">Select batch and date to generate the report.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Batch</label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="relative w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-sm cursor-pointer flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <span className={selectedBatch ? "text-white" : "text-slate-400"}>
                                        {selectedBatch ? selectedBatch.label : 'Please select a batch'}
                                    </span>
                                    <ChevronUp className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-0' : 'rotate-180'}`} />
                                </button>
                                {isDropdownOpen && (
                                    <ul className="absolute top-full mt-2 w-full bg-slate-700 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                        {batchOptions.map(option => (
                                            <li
                                                key={option.value}
                                                className="px-4 py-2 text-white hover:bg-sky-500/20 cursor-pointer"
                                                onClick={() => { setSelectedBatch(option); setIsDropdownOpen(false); }}
                                            >
                                                {option.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="report-date" className="block text-sm font-medium text-slate-300 mb-2">
                                Date
                            </label>
                            <input
                                id="report-date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        <div className="flex items-start justify-center gap-8 pt-4">
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    title="Download PDF"
                                    onClick={() => handleDownload('pdf')}
                                    disabled={downloadStatus.status === 'loading'}
                                    className={`w-16 h-16 flex items-center justify-center bg-slate-700/80 border border-white/10 hover:bg-slate-600 text-red-400 font-semibold rounded-full shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${downloadStatus.type === 'pdf' && downloadStatus.status === 'loading' ? 'animate-pulse' : ''} ${downloadStatus.type === 'pdf' && downloadStatus.status === 'success' ? 'bg-green-500/30 !text-green-400' : ''} ${downloadStatus.type === 'pdf' && downloadStatus.status === 'error' ? 'bg-red-500/30 !text-red-400' : ''}`}
                                >
                                    {renderButtonIcon('pdf', FileText)}
                                </button>
                                <span className="text-xs text-slate-400 font-medium">PDF</span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <button
                                    title="Download Excel"
                                    onClick={() => handleDownload('excel')}
                                    disabled={downloadStatus.status === 'loading'}
                                    className={`w-16 h-16 flex items-center justify-center bg-slate-700/80 border border-white/10 hover:bg-slate-600 text-green-400 font-semibold rounded-full shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${downloadStatus.type === 'excel' && downloadStatus.status === 'loading' ? 'animate-pulse' : ''} ${downloadStatus.type === 'excel' && downloadStatus.status === 'success' ? 'bg-green-500/30 !text-green-400' : ''} ${downloadStatus.type === 'excel' && downloadStatus.status === 'error' ? 'bg-red-500/30 !text-red-400' : ''}`}
                                >
                                    {renderButtonIcon('excel', Sheet)}
                                </button>
                                <span className="text-xs text-slate-400 font-medium">Excel</span>
                            </div>
                        </div>
                    </div>

                    {feedback.msg && (
                        <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-opacity duration-300 ${feedback.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                            {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                            <span>{feedback.msg}</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ViewAttendanceReport;