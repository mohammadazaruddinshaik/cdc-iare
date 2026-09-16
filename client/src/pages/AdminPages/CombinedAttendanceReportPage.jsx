import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileImage, Download, Calendar, Info } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';


// --- Reusable Helper Components ---

const SpinnerOverlay = ({ isLoading }) => {
    if (!isLoading) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="w-14 h-14 border-4 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
};

const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const baseStyle = "fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 text-white rounded-lg shadow-xl text-sm font-semibold transition-all duration-300 transform animate-fade-in-up z-[110]";
    const typeStyle = type === 'error' ? 'bg-red-500' : 'bg-green-500';

    return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};


// --- Main Page Component ---
const CombinedAttendanceReportPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [animate, setAnimate] = useState(false);

    // Form State
    const [date, setDate] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        setDate(new Date().toISOString().split("T")[0]);
        setTimeout(() => setAnimate(true), 100);
    }, [user, navigate]);

    const showToast = (message, type = 'info') => {
        setToast({ message, type, visible: true });
    };

    const handleDownload = async () => {
        // Validation
        if (!date) {
            showToast("⚠️ Please select a date.", 'error');
            return;
        }

        setIsLoading(true);

        // Construct Query Params
        const params = new URLSearchParams();
        params.append("date", date);
        params.append("format", "png");

        const url = `${backendUrl}/api/admin/combined-attendance-report?${params.toString()}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: "include"
            });

            if (response.status === 401 || response.status === 403) {
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Download failed. No records found.");
            }

            // --- BINARY DOWNLOAD LOGIC ---
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const filename = `CDC-Day-Attendance-Summary-${date}.png`;

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            a.remove();
            URL.revokeObjectURL(blobUrl);

            showToast("✅ Report downloaded successfully.", 'success');
        } catch (error) {
            console.error("Download Error:", error);
            showToast(`❌ ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <style>{`
                /* Custom styles for better aesthetics */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; transition: transform 0.2s; }
                input[type="date"]::-webkit-calendar-picker-indicator:hover { transform: scale(1.1); }
            `}</style>

            <SpinnerOverlay isLoading={isLoading} />
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast({ ...toast, visible: false })}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>

                <div className="w-full px-4 sm:px-6 lg:px-8 py-2 relative z-50">
                    <Header animate={animate} />
                </div>

                <main className="w-full flex justify-center items-start pt-4 pb-20 px-4 relative z-10">
                    {/* Compact Form Container */}
                    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 w-full max-w-md flex flex-col shadow-2xl border border-white/10 transition-all duration-700 ease-out ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                        {/* Compact Header */}
                        <div className="text-center mb-5">
                            <div className="mx-auto h-10 w-10 bg-violet-500/10 rounded-full flex items-center justify-center border-2 border-violet-400/30">
                                <FileImage className="h-5 w-5 text-violet-300" />
                            </div>
                            <h1 className="mt-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                                CDC Day Attendance Summary
                            </h1>
                            <p className="text-gray-400 mt-1 text-xs max-w-xs mx-auto">
                                Generate a combined attendance summary report for a specific date.
                            </p>
                        </div>

                        <div className="space-y-4">

                            {/* 1. Date Selection */}
                            <div className="space-y-1.5">
                                <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                                    <Calendar size={16} /> Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                />
                            </div>

                            {/* 2. Download Button */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="block text-sm font-semibold text-gray-300 text-center">
                                    Format
                                </label>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={isLoading || !date}
                                    className="group w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 text-white font-semibold rounded-xl shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-violet-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm"
                                >
                                    <Download size={16} />
                                    Download PNG
                                </button>
                            </div>
                        </div>

                        {/* Info Footer */}
                        <div className={`mt-5 p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2 transition-opacity duration-500 delay-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                            <Info size={16} className="text-violet-300 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-gray-400 leading-tight">
                                Report is generated as a single combined PNG image summarizing attendance across all sessions for the selected date.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default CombinedAttendanceReportPage;
