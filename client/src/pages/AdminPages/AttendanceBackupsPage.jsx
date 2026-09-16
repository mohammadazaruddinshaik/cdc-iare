import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, DatabaseBackup, Trash2, Loader2, AlertTriangle,
    CalendarDays, Layers, Users, RefreshCw, Inbox,
    Search, X, ShieldCheck, Eye, Send, BookOpen, CheckCircle2, AlertCircle,
    UserCheck, UserX
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

const formatDate = (dateStr) => {
    try {
        const d = new Date(`${dateStr}T00:00:00`);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const calculatePercentage = (present, total) => {
    if (!total || total === 0) return 0;
    return Math.round((present / total) * 100);
};

// Same donut-ring treatment as the QR PostAttendancePage summary screen, so a posted result
// here feels like the same product instead of a bare toast.
const CircularProgress = ({ percentage, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="transparent" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#postGradient)" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="postGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800 tracking-tight">{percentage}%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Present</span>
            </div>
        </div>
    );
};

const SessionBadge = ({ session }) => {
    const isFN = session === 'FN';
    return (
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border whitespace-nowrap ${isFN ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {isFN ? 'Forenoon' : 'Afternoon'}
        </span>
    );
};

// --- Roll Number Preview Modal ---
// Purpose: this is the ONLY place roll numbers are ever shown. The table just shows a count.
const RollPreviewModal = ({ record, onClose }) => (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Sem {record.sem} · {record.batch}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{formatDate(record.date)} &middot; {record.session === 'FN' ? 'Forenoon' : 'Afternoon'}</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={18} />
                </button>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Users size={14} className="text-gray-500" />
                <span className="text-sm font-bold text-gray-700">{record.presentCount} student{record.presentCount === 1 ? '' : 's'}</span>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
                {record.rollnos.length === 0 ? (
                    <p className="text-sm text-gray-400 font-medium text-center py-6">No roll numbers recorded.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {record.rollnos.map((roll, i) => (
                            <span key={i} className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold text-gray-700">{roll}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

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
                    Permanently delete the backup for <strong>Sem {target.sem} - {target.batch}</strong> ({target.session === 'FN' ? 'Forenoon' : 'Afternoon'}) on <strong>{formatDate(target.date)}</strong>?
                    This removes {target.presentCount} student record{target.presentCount === 1 ? '' : 's'}.
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

// --- Post Attendance Modal ---
// Course is never guessed — it's whatever the admin explicitly picks from this batch's
// availableCourses list (GET /api/get-sem-config/{sem}, matched by batch name).
const PostAttendanceModal = ({ target, onClose, onConfirm, isPosting }) => {
    const [course, setCourse] = useState('');
    const hasCourses = target.candidates.length > 0;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                    <Send size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Post Attendance</h3>
                <p className="text-gray-500 text-sm mb-5 text-center">
                    Sem {target.record.sem} · {target.record.batch} · {target.record.session === 'FN' ? 'Forenoon' : 'Afternoon'} · {formatDate(target.record.date)}
                </p>

                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Students to mark present</span>
                    <span className="text-sm font-black text-gray-800">{target.record.presentCount}</span>
                </div>
                <p className="flex items-start gap-1.5 text-[11px] text-gray-400 font-medium mb-4 px-1">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                    Every other enrolled student in this batch will be marked absent for this course on this date.
                </p>

                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Course</label>
                {hasCourses ? (
                    <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-700 outline-none focus:border-indigo-400 transition-all mb-1"
                        autoFocus
                    >
                        <option value="">Select course...</option>
                        {target.candidates.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    <>
                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 mb-1 opacity-70 cursor-not-allowed" aria-disabled="true">
                            <BookOpen size={16} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-400">No courses configured</span>
                        </div>
                        <p className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold mb-1">
                            <AlertCircle size={12} />
                            Batch "{target.record.batch}" has no availableCourses in Sem {target.record.sem}'s config.
                        </p>
                    </>
                )}

                <div className="flex gap-3 mt-5">
                    <button onClick={onClose} disabled={isPosting} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(course)}
                        disabled={!course || isPosting}
                        className={`flex-[1.5] py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${course ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isPosting ? <><Loader2 className="animate-spin" size={18} /> Posting...</> : <>Post Attendance</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Post Attendance Result Modal ---
// Mirrors PostAttendancePage.jsx's post-submit summary card, but built from the real
// HandleSessionPostAttendance response: no `success` flag (a 200 status is the only success
// signal), and counts come back as presentCount/absentCount/updatedCount for the WHOLE batch
// roster — not just the roll numbers we sent as present.
const PostResultModal = ({ result, onClose }) => {
    const { record, course, status, message, presentCount, absentCount, updatedCount } = result;
    const hasBreakdown = typeof presentCount === 'number' && typeof absentCount === 'number';
    const total = hasBreakdown ? presentCount + absentCount : null;
    const rate = hasBreakdown ? calculatePercentage(presentCount, total) : null;
    const hasMismatch = hasBreakdown && typeof updatedCount === 'number' && updatedCount < total;

    if (status !== 'success') {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Posting Failed</h3>
                    <p className="text-gray-500 text-sm mb-2">{message || 'Something went wrong while posting attendance.'}</p>
                    <p className="text-xs text-gray-400 font-medium mb-6">Sem {record.sem} · {record.batch} · {course} · {formatDate(record.date)}</p>
                    <button onClick={onClose} className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold transition-colors">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-5 text-center border-b border-gray-100">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Attendance Posted</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-1">Sem {record.sem} · {record.batch} · {course}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{formatDate(record.date)} &middot; {record.session === 'FN' ? 'Forenoon' : 'Afternoon'}</p>
                </div>

                <div className="p-6">
                    {message && <p className="text-xs text-center text-gray-500 font-medium mb-5">{message}</p>}

                    {hasBreakdown ? (
                        <>
                            <div className="flex justify-center mb-5">
                                <CircularProgress percentage={rate} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-5">
                                <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-lg font-black text-gray-900">{total}</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100">
                                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mb-1">Present</p>
                                    <p className="text-lg font-black text-emerald-700">{presentCount}</p>
                                </div>
                                <div className="bg-rose-50 p-3 rounded-2xl text-center border border-rose-100">
                                    <p className="text-[9px] text-rose-600 font-black uppercase tracking-wider mb-1">Absent</p>
                                    <p className="text-lg font-black text-rose-700">{absentCount}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium text-center mb-5">
                                Present/Absent reflects every student enrolled in Sem {record.sem} {record.batch}, not just this backup's {record.presentCount}.
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl py-4 mb-5">
                            <UserCheck size={18} className="text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700">{record.presentCount} student{record.presentCount === 1 ? '' : 's'} marked present</span>
                        </div>
                    )}

                    {hasMismatch && (
                        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2">
                            <UserX size={14} className="text-amber-700 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-800 font-semibold">
                                Only {updatedCount} of {total} student records were actually updated — the rest didn't match a roll number in this batch's roster.
                            </p>
                        </div>
                    )}

                    <button onClick={onClose} className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
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
    const [searchTerm, setSearchTerm] = useState('');
    const [previewRecord, setPreviewRecord] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const [semConfigCache, setSemConfigCache] = useState({});
    const [resolvingKey, setResolvingKey] = useState(null);
    const [postTarget, setPostTarget] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [postedKeys, setPostedKeys] = useState(new Set());
    const [postResult, setPostResult] = useState(null);

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

    // Flatten the nested { sem -> batches -> batch -> session -> date -> { presentCount, rollnos } }
    // payload into one flat list of rows. Sessions/batches with no dates simply produce no rows.
    const records = useMemo(() => {
        if (!rawData) return [];
        const list = [];
        Object.entries(rawData).forEach(([sem, semObj]) => {
            const batches = semObj?.batches || {};
            Object.entries(batches).forEach(([batch, sessions]) => {
                ['FN', 'AN'].forEach(session => {
                    const dates = sessions?.[session] || {};
                    Object.entries(dates).forEach(([date, info]) => {
                        const rollnos = Array.isArray(info?.rollnos) ? info.rollnos : [];
                        const presentCount = typeof info?.presentCount === 'number' ? info.presentCount : rollnos.length;
                        list.push({ key: `${sem}|${batch}|${session}|${date}`, sem, batch, session, date, presentCount, rollnos });
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

    const semesters = useMemo(() => Array.from(new Set(records.map(r => r.sem))).sort(), [records]);

    const totalStudents = useMemo(() => records.reduce((sum, r) => sum + r.presentCount, 0), [records]);

    const visibleRecords = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return records.filter(r => {
            if (semFilter !== 'All' && r.sem !== semFilter) return false;
            if (term && !r.rollnos.some(roll => roll.toLowerCase().includes(term))) return false;
            return true;
        });
    }, [records, semFilter, searchTerm]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${backendUrl}/api/admin/delete-backup`, {
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

    // Each semester's batch config (and each batch's availableCourses) is fetched on demand
    // and cached per sem, since multiple backup rows usually share the same sem.
    const ensureSemConfigLoaded = async (sem) => {
        if (semConfigCache[sem]) return semConfigCache[sem];
        const res = await fetch(`${backendUrl}/api/get-sem-config/${sem}`, { method: 'GET', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { logout(); return []; }
        const result = await res.json();
        const config = result.success && Array.isArray(result.data?.config) ? result.data.config : [];
        setSemConfigCache(prev => ({ ...prev, [sem]: config }));
        return config;
    };

    const handlePostAttendanceClick = async (record) => {
        setResolvingKey(record.key);
        try {
            const config = await ensureSemConfigLoaded(record.sem);
            const batchConfig = config.find(c => c.name === record.batch);
            setPostTarget({ record, candidates: batchConfig?.availableCourses || [] });
        } catch {
            showToast('error', 'Could not load this semester\'s course config.');
        } finally {
            setResolvingKey(null);
        }
    };

    const handlePostAttendanceConfirm = async (course) => {
        if (!postTarget || !course) return;
        const { record } = postTarget;
        setIsPosting(true);
        try {
            const res = await fetch(`${backendUrl}/api/attendance-session-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semname: record.sem,
                    course,
                    batch: record.batch,
                    date: record.date,
                    status: 'present',
                    students: record.rollnos
                }),
                credentials: 'include'
            });

            if (res.status === 401 || res.status === 403) { logout(); return; }

            // This route has no `success` flag — a 200 status is the only success signal,
            // and it replies with presentCount/absentCount/updatedCount (not *ies/*ees).
            const result = await res.json();
            const succeeded = res.ok;

            setPostTarget(null);
            setPostResult({
                status: succeeded ? 'success' : 'error',
                message: result.message,
                presentCount: result.presentCount,
                absentCount: result.absentCount,
                updatedCount: result.updatedCount,
                record,
                course
            });

            if (succeeded) setPostedKeys(prev => new Set([...prev, record.key]));
        } catch (err) {
            setPostTarget(null);
            setPostResult({ status: 'error', message: err.message, record, course });
        } finally {
            setIsPosting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] text-gray-800 font-sans">
            {toast.visible && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, visible: false })} />}
            {previewRecord && <RollPreviewModal record={previewRecord} onClose={() => setPreviewRecord(null)} />}
            {deleteTarget && (
                <DeleteConfirmationModal
                    target={deleteTarget}
                    isDeleting={isDeleting}
                    onClose={() => !isDeleting && setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
            {postTarget && (
                <PostAttendanceModal
                    target={postTarget}
                    isPosting={isPosting}
                    onClose={() => !isPosting && setPostTarget(null)}
                    onConfirm={handlePostAttendanceConfirm}
                />
            )}
            {postResult && <PostResultModal result={postResult} onClose={() => setPostResult(null)} />}

            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[1.5rem] rounded-br-[1.5rem] sm:rounded-bl-[2rem] sm:rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
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
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Layers className="w-4 h-4 text-blue-600" /></div>
                        <div><p className="text-lg font-black text-gray-800 leading-none">{summary.totalSemesters}</p><p className="text-[11px] text-gray-400 font-semibold">Semesters</p></div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><Users className="w-4 h-4 text-purple-600" /></div>
                        <div><p className="text-lg font-black text-gray-800 leading-none">{summary.totalBatches}</p><p className="text-[11px] text-gray-400 font-semibold">Batches</p></div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-emerald-600" /></div>
                        <div><p className="text-lg font-black text-gray-800 leading-none">{records.length}</p><p className="text-[11px] text-gray-400 font-semibold">Backup Entries</p></div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-rose-600" /></div>
                        <div><p className="text-lg font-black text-gray-800 leading-none">{totalStudents}</p><p className="text-[11px] text-gray-400 font-semibold">Students Recorded</p></div>
                    </div>
                </div>

                {/* Filters + Search + Refresh */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <button onClick={() => setSemFilter('All')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${semFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                            All Semesters
                        </button>
                        {semesters.map(sem => (
                            <button key={sem} onClick={() => setSemFilter(sem)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${semFilter === sem ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                                Semester {sem}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search roll number..."
                                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-52"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button onClick={fetchBackups} disabled={isLoading} className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>
                </div>

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
                        <p className="text-sm font-semibold">{searchTerm ? `No backups found for roll numbers matching "${searchTerm}".` : 'No backup records found.'}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="hidden md:grid grid-cols-[0.7fr_0.9fr_0.9fr_1.2fr_0.9fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>Semester</span><span>Batch</span><span>Session</span><span>Date</span><span>Students</span><span className="text-right">Actions</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {visibleRecords.map(record => {
                                const isPosted = postedKeys.has(record.key);
                                const isResolving = resolvingKey === record.key;
                                return (
                                    <div key={record.key} className="grid grid-cols-2 md:grid-cols-[0.7fr_0.9fr_0.9fr_1.2fr_0.9fr_auto] gap-3 md:gap-4 px-4 md:px-6 py-4 items-center hover:bg-gray-50/60 transition-colors">
                                        <span className="text-sm font-bold text-gray-800">Sem {record.sem}</span>
                                        <span className="text-sm font-semibold text-gray-600">{record.batch}</span>
                                        <span><SessionBadge session={record.session} /></span>
                                        <span className="text-sm font-medium text-gray-600">{formatDate(record.date)}</span>

                                        <button onClick={() => setPreviewRecord(record)} className="flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 w-fit transition-colors" title="Preview roll numbers">
                                            <Users size={13} className="text-gray-400" /> {record.presentCount} <Eye size={13} className="text-gray-400 ml-0.5" />
                                        </button>

                                        <div className="flex justify-end items-center gap-2 col-span-2 md:col-span-1">
                                            {isPosted ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                                    <CheckCircle2 size={15} /> Posted
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handlePostAttendanceClick(record)}
                                                    disabled={isResolving}
                                                    title="Post this backup as official attendance"
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-500 hover:text-white border border-indigo-100 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                                                >
                                                    {isResolving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Post Attendance
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDeleteTarget(record)}
                                                title="Delete Backup"
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
