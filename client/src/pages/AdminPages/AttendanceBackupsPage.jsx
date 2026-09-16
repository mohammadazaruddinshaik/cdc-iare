import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, DatabaseBackup, Trash2, Loader2, AlertTriangle,
    CalendarDays, Layers, Users, ChevronDown, RefreshCw, Inbox
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const backendUrl = import.meta.env.VITE_BASE_URL;

// --- Toast ---
const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const typeStyle = type === 'error' ? 'bg-red-500' : 'bg-emerald-500';
    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 text-white rounded-lg shadow-xl text-sm font-semibold z-[100] ${typeStyle}`}>
            {message}
        </div>
    );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ target, onClose, onConfirm, isDeleting }) => {
    const [confirmInput, setConfirmInput] = useState('');
    const isMatch = confirmInput.trim().toLowerCase() === 'delete';

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Trash2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Backup</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Permanently delete the backup for <strong>{target.sem}-{target.batch}</strong> ({target.session}) on <strong>{target.date}</strong>?
                    This removes {target.count} student record{target.count === 1 ? '' : 's'}.
                    <br />Type <span className="font-bold text-red-600">"delete"</span> to confirm.
                </p>
                <input
                    type="text"
                    placeholder="Type delete..."
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    disabled={isDeleting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 text-center font-bold focus:border-red-500 outline-none focus:ring-2 focus:ring-red-100 transition-all disabled:bg-gray-50"
                    autoFocus
                    autoComplete="off"
                />
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isMatch || isDeleting}
                        className={`flex-[1.5] py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isMatch ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isDeleting ? <><Loader2 className="animate-spin" size={18} /> Deleting...</> : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SessionBadge = ({ session }) => {
    const isFN = session === 'FN';
    return (
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${isFN ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {isFN ? 'Forenoon' : 'Afternoon'}
        </span>
    );
};

// --- Main Page Component ---

const AttendanceBackupsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [animate, setAnimate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [summary, setSummary] = useState({ totalSemesters: 0, totalBatches: 0 });

    const [semFilter, setSemFilter] = useState('All');
    const [expandedKey, setExpandedKey] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (type, message) => setToast({ visible: true, type, message });

    const fetchBackups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${backendUrl}/api/admin/get-all-backups`, {
                method: 'GET',
                credentials: 'include'
            });

            if (res.status === 401 || res.status === 403) { logout(); return; }
            if (!res.ok) throw new Error('Network response was not ok');

            const result = await res.json();
            if (!result.success) throw new Error(result.message || 'Failed to fetch backups');

            setRawData(result.data || {});
            setSummary({ totalSemesters: result.totalSemesters || 0, totalBatches: result.totalBatches || 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setAnimate(true);
        }
    }, [logout]);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchBackups();
    }, [user, navigate, fetchBackups]);

    // Flatten nested backup data into a flat list of records
    const records = useMemo(() => {
        if (!rawData) return [];
        const list = [];
        Object.entries(rawData).forEach(([sem, semObj]) => {
            const batches = semObj?.batches || {};
            Object.entries(batches).forEach(([batch, sessions]) => {
                Object.entries(sessions || {}).forEach(([session, dates]) => {
                    Object.entries(dates || {}).forEach(([date, rolls]) => {
                        const rollList = Array.isArray(rolls) ? rolls : [];
                        list.push({
                            key: `${sem}|${batch}|${session}|${date}`,
                            sem, batch, session, date,
                            rolls: rollList,
                            count: rollList.length
                        });
                    });
                });
            });
        });
        list.sort((a, b) =>
            b.date.localeCompare(a.date) ||
            a.sem.localeCompare(b.sem) ||
            a.batch.localeCompare(b.batch) ||
            a.session.localeCompare(b.session)
        );
        return list;
    }, [rawData]);

    const semesters = useMemo(() => {
        const unique = Array.from(new Set(records.map(r => r.sem)));
        return unique.sort();
    }, [records]);

    const visibleRecords = useMemo(() => {
        if (semFilter === 'All') return records;
        return records.filter(r => r.sem === semFilter);
    }, [records, semFilter]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${backendUrl}/api/delete-backup`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sem: deleteTarget.sem,
                    batch: deleteTarget.batch,
                    session: deleteTarget.session,
                    date: deleteTarget.date
                }),
                credentials: 'include'
            });

            if (res.status === 401 || res.status === 403) { logout(); return; }

            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'Failed to delete backup');

            showToast('success', result.message || 'Backup deleted successfully.');
            setDeleteTarget(null);
            fetchBackups();
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] text-gray-800 font-sans">
            {toast.visible && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, visible: false })} />}
            {deleteTarget && (
                <DeleteConfirmationModal
                    target={deleteTarget}
                    isDeleting={isDeleting}
                    onClose={() => !isDeleting && setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[1.5rem] rounded-br-[1.5rem] sm:rounded-bl-[2rem] sm:rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 pb-6 lg:pb-8 pt-2">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3"></div>

                    <button onClick={() => navigate('/admin/dashboard')} className="group flex items-center text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                            <DatabaseBackup className="w-6 h-6 text-blue-300" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-white">Attendance Backups</h1>
                            <p className="text-slate-400 text-xs lg:text-sm">Recovered attendance records saved outside the main submission flow.</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Stats + Refresh */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-gray-700">{summary.totalSemesters}</span>
                            <span className="text-xs text-gray-400 font-medium">Semesters</span>
                        </div>
                        <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-bold text-gray-700">{summary.totalBatches}</span>
                            <span className="text-xs text-gray-400 font-medium">Batches</span>
                        </div>
                        <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold text-gray-700">{records.length}</span>
                            <span className="text-xs text-gray-400 font-medium">Backup Entries</span>
                        </div>
                    </div>
                    <button onClick={fetchBackups} disabled={isLoading} className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>

                {/* Semester Filter Tabs */}
                {semesters.length > 0 && (
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                        <button onClick={() => setSemFilter('All')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${semFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                            All Semesters
                        </button>
                        {semesters.map(sem => (
                            <button key={sem} onClick={() => setSemFilter(sem)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${semFilter === sem ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                                Semester {sem}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm font-semibold">Loading backups...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600 font-semibold mb-4">{error}</p>
                        <button onClick={fetchBackups} className="text-sm font-bold text-white bg-gray-900 px-5 py-2.5 rounded-xl">Retry</button>
                    </div>
                ) : visibleRecords.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                        <Inbox className="w-10 h-10 mx-auto mb-3" />
                        <p className="text-sm font-semibold">No backup records found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>Semester</span><span>Batch</span><span>Session</span><span>Date</span><span>Students</span><span className="text-right">Actions</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {visibleRecords.map(record => {
                                const isExpanded = expandedKey === record.key;
                                return (
                                    <div key={record.key}>
                                        <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 px-4 md:px-6 py-4 items-center hover:bg-gray-50/60 transition-colors">
                                            <span className="text-sm font-bold text-gray-800">Sem {record.sem}</span>
                                            <span className="text-sm font-semibold text-gray-600">{record.batch}</span>
                                            <span><SessionBadge session={record.session} /></span>
                                            <span className="text-sm font-medium text-gray-600">{record.date}</span>
                                            <button onClick={() => setExpandedKey(isExpanded ? null : record.key)} className="flex items-center gap-1.5 text-sm font-bold text-gray-700 w-fit">
                                                {record.count} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                            <div className="flex justify-end col-span-2 md:col-span-1">
                                                <button
                                                    onClick={() => setDeleteTarget(record)}
                                                    title="Delete Backup"
                                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-100 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="px-4 md:px-6 pb-4 -mt-1 bg-gray-50/40">
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {record.rolls.length === 0 ? (
                                                        <span className="text-xs text-gray-400 font-medium">No roll numbers recorded.</span>
                                                    ) : record.rolls.map((roll, i) => (
                                                        <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-mono font-bold text-gray-700 shadow-sm">{roll}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AttendanceBackupsPage;
