import React, { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet, Download, Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import Header from '../components/Header'; // Adjust path if necessary

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

    const baseStyle = "fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 text-white rounded-lg shadow-xl text-sm font-semibold z-[100]";
    const typeStyle = type === 'error' ? 'bg-red-500' : 'bg-green-500';

    return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};

const DatePicker = ({ selectedDate, onSelectDate, label, icon, disabledDates }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState('bottom');
    const popoverRef = useRef(null);

    const handleToggle = () => {
        if (popoverRef.current) {
            const rect = popoverRef.current.getBoundingClientRect();
            if (window.innerHeight - rect.bottom < 350) {
                setPosition('top');
            } else {
                setPosition('bottom');
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (date) => {
        if (date) onSelectDate(date);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const positionClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

    return (
        <div className="relative" ref={popoverRef}>
            <label className="flex items-center gap-2 text-md font-semibold text-gray-300 mb-3">
                {icon} {label}
            </label>
            <button
                type="button"
                onClick={handleToggle}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex justify-between items-center"
            >
                <span>{selectedDate ? format(selectedDate, 'dd MMMM, yyyy') : 'Select a date'}</span>
                <Calendar size={18} className="text-gray-400"/>
            </button>
            {isOpen && (
                <div className={`absolute w-max z-50 bg-[#0A1B3A] border border-white/20 rounded-xl shadow-2xl p-2 ${positionClass}`}>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        disabled={disabledDates}
                        initialFocus
                        modifiersClassNames={{
                            selected: 'day-selected',
                            today: 'day-today',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// --- Main Monthly Report Page Component ---

const MonthlyReport = () => {
    const [animate, setAnimate] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

    useEffect(() => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setToDate(today);
        setFromDate(firstDayOfMonth);
        setTimeout(() => setAnimate(true), 100);
    }, []);

    const showToast = (message, type = 'info') => {
        setToast({ message, type, visible: true });
    };

    const handleDownload = async () => {
        if (!fromDate || !toDate) {
            showToast("⚠️ Please select both a 'From' and 'To' date.", 'error');
            return;
        }
        if (fromDate > toDate) {
            showToast("⚠️ 'From Date' cannot be after 'To Date'.", 'error');
            return;
        }

        setIsLoading(true);

        try {
            const backendUrl = "http://localhost:5000";
            const fromDateFormatted = format(fromDate, 'yyyy-MM-dd');
            const toDateFormatted = format(toDate, 'yyyy-MM-dd');
            const params = new URLSearchParams({ from: fromDateFormatted, to: toDateFormatted });
            const url = `${backendUrl}/api/Admin/attendance-monthly-excel?${params.toString()}`;

            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                throw new Error(`Download failed. Server responded with status ${response.status}.`);
            }

            const blob = await response.blob();
            if (blob.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                throw new Error("Invalid file format received. The server may have sent an error.");
            }
            const blobUrl = URL.createObjectURL(blob);
            const filename = `MonthlyReport_${format(fromDate, 'dd-MM-yyyy')}_to_${format(toDate, 'dd-MM-yyyy')}.xlsx`;
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            a.remove();
            URL.revokeObjectURL(blobUrl);

            showToast(`✅ Excel report downloaded successfully.`, 'success');

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
                /* Your existing styles are perfect, no changes needed */
                .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #3b82f6; --rdp-background-color: #60a5fa; color: #d1d5db; }
                .rdp-months { padding: 1em; }
                .rdp-caption_label { font-size: 1.125rem; font-weight: bold; color: #fff; }
                .rdp-nav_button { color: #9ca3af; }
                .rdp-head_cell { color: #6b7280; font-weight: 600; }
                .day-today { font-weight: bold; color: #60a5fa !important; background-color: rgba(96, 165, 250, 0.1) !important; }
                .day-selected { color: #fff !important; font-weight: bold; }
            `}</style>
            
            <SpinnerOverlay isLoading={isLoading} />
            {toast.visible && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, visible: false })} />}

            <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>

                <main className="flex justify-center items-center pt-10 pb-20 px-4">
                    {/* CHANGED: Container size is now fixed and centered */}
                    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-[600px] h-[550px] flex flex-col justify-center shadow-2xl border border-white/10 transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="text-center mb-8">
                            <div className="mx-auto h-14 w-14 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-blue-400/30">
                                <Download className="h-7 w-7 text-blue-300" />
                            </div>
                            <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                                Monthly Report
                            </h1>
                            <p className="mt-2 text-md text-gray-400">
                                Select a date range to generate a consolidated report.
                            </p>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DatePicker 
                                    selectedDate={fromDate}
                                    onSelectDate={setFromDate}
                                    label="1. From Date"
                                    icon={<Calendar size={18}/>}
                                    disabledDates={{ after: toDate }}
                                />
                                <DatePicker 
                                    selectedDate={toDate}
                                    onSelectDate={setToDate}
                                    label="2. To Date"
                                    icon={<Calendar size={18}/>}
                                    disabledDates={{ before: fromDate }}
                                />
                            </div>

                            <div className="space-y-3 pt-6 border-t border-white/10">
                                <label className="block text-md font-semibold text-gray-300 text-center">
                                    3. Download Report
                                </label>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        disabled={isLoading}
                                        className="group w-full max-w-xs flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A1B3A] focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileSpreadsheet size={20} /> Download in Excel
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

export default MonthlyReport;
