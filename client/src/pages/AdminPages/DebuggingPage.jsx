import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Bug, PlayCircle, Loader2, AlertTriangle, CheckCircle2,
    Layers, Users, Database, Trash2, PlusCircle, Sparkles, ChevronDown,
    ShieldAlert, Terminal, Clock, ListChecks
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const backendUrl = import.meta.env.VITE_BASE_URL;

const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// --- Run Confirmation Modal (shared by both tools) ---
// requireTyping gates the genuinely destructive tool (doc-validator can delete/insert
// documents) behind a typed confirmation; the read-mostly totals fixer just needs one click.
const RunConfirmModal = ({ title, description, endpoint, requireTyping, isRunning, onCancel, onConfirm }) => {
    const [input, setInput] = useState('');
    const isMatch = !requireTyping || input.trim().toLowerCase() === 'run';

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                    <ShieldAlert size={26} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-4">{description}</p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 mb-5">
                    <Terminal size={12} /> PUT {endpoint}
                </div>
                {requireTyping && (
                    <input
                        type="text"
                        placeholder='Type "run" to confirm'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isRunning}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 text-center font-bold focus:border-amber-500 outline-none focus:ring-2 focus:ring-amber-100 transition-all disabled:bg-gray-50"
                        autoFocus
                        autoComplete="off"
                    />
                )}
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={isRunning} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isMatch || isRunning}
                        className={`flex-[1.5] py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isMatch ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isRunning ? <><Loader2 className="animate-spin" size={18} /> Running...</> : <>Run Now</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TONE_CLASSES = {
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
};

const StatTile = ({ icon, label, value, tone = 'slate' }) => (
    <div className={`rounded-xl border p-3 flex flex-col ${TONE_CLASSES[tone]}`}>
        <div className="flex items-center gap-1.5 mb-1 opacity-70">{icon}<span className="text-[10px] font-black uppercase tracking-wide">{label}</span></div>
        <span className="text-xl font-black">{value}</span>
    </div>
);

const ToolErrorBox = ({ message }) => (
    <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
        <p className="text-sm text-rose-700 font-semibold">{message}</p>
    </div>
);

// --- Tool 1: Validate Attendance Totals ---
// PUT /api/admin/validate-attendance-totals — recomputes each student's overall/course
// attendance counters and corrects drift. Read-mostly (only "updates", never deletes),
// so it only needs a single-click confirmation.
const ValidateAttendanceTool = () => {
    const { logout } = useAuth();
    const endpoint = '/api/admin/validate-attendance-totals';

    const [showConfirm, setShowConfirm] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [lastRun, setLastRun] = useState(null);
    const [expandedSem, setExpandedSem] = useState(null);

    const run = async () => {
        setIsRunning(true);
        setError(null);
        try {
            const res = await fetch(`${backendUrl}${endpoint}`, { method: 'PUT', credentials: 'include' });
            if (res.status === 401 || res.status === 403) { logout(); return; }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Validation failed.');
            setResult(data);
            setLastRun(new Date());
        } catch (err) {
            setError(err.message);
            setResult(null);
        } finally {
            setIsRunning(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {showConfirm && (
                <RunConfirmModal
                    title="Validate Attendance Totals"
                    description="Recomputes and syncs every student's overall/course attendance counters across all semesters and batches. Fixes drift — does not delete anything."
                    endpoint={endpoint}
                    requireTyping={false}
                    isRunning={isRunning}
                    onCancel={() => !isRunning && setShowConfirm(false)}
                    onConfirm={run}
                />
            )}

            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <ListChecks size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Validate Attendance Totals</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-md">Recalculates each student's overall/course attendance counters and fixes any mismatches.</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-400 mt-2">
                            <Terminal size={11} /> PUT {endpoint}
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowConfirm(true)} disabled={isRunning} className="flex items-center gap-2 shrink-0 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                    {isRunning ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />} Run
                </button>
            </div>

            <div className="p-5">
                {error ? (
                    <ToolErrorBox message={error} />
                ) : !result ? (
                    <p className="text-sm text-gray-400 font-medium text-center py-6">Not run yet this session.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                            <StatTile icon={<Layers size={12} />} label="Semesters" value={result.summary.semestersChecked} tone="purple" />
                            <StatTile icon={<Database size={12} />} label="Collections" value={result.summary.collectionsChecked} tone="blue" />
                            <StatTile icon={<Users size={12} />} label="Students Checked" value={result.summary.studentsChecked} tone="slate" />
                            <StatTile icon={<CheckCircle2 size={12} />} label="Students Updated" value={result.summary.studentsUpdated} tone={result.summary.studentsUpdated > 0 ? 'amber' : 'emerald'} />
                        </div>
                        {lastRun && <p className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mb-4"><Clock size={10} /> Last run at {formatTime(lastRun)}</p>}

                        <div className="space-y-2">
                            {Object.entries(result.semesters || {}).map(([sem, semData]) => {
                                const isOpen = expandedSem === sem;
                                return (
                                    <div key={sem} className="border border-gray-100 rounded-xl overflow-hidden">
                                        <button onClick={() => setExpandedSem(isOpen ? null : sem)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <span className="text-sm font-bold text-gray-700">Sem {sem}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-gray-400">{semData.collections} batches</span>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${semData.studentsUpdated > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{semData.studentsUpdated} updated</span>
                                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>
                                        {isOpen && (
                                            <div className="divide-y divide-gray-100">
                                                {(semData.collectionsData || []).map(batchRow => (
                                                    <div key={batchRow.batch} className="flex items-center justify-between px-4 py-2.5">
                                                        <span className="text-xs font-bold text-gray-700">{batchRow.batch}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] text-gray-400 font-semibold">{batchRow.studentsChecked} checked</span>
                                                            {batchRow.updated > 0 ? (
                                                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{batchRow.updated} fixed</span>
                                                            ) : (
                                                                <span className="text-[11px] font-bold text-emerald-600">In sync</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Tool 2: Document Validator ---
// PUT /api/admin/doc-validator — scans every student document and can clean, delete, or
// insert records. Genuinely destructive, so it's gated behind a typed "run" confirmation.
const DocValidatorTool = () => {
    const { logout } = useAuth();
    const endpoint = '/api/admin/doc-validator';

    const [showConfirm, setShowConfirm] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [lastRun, setLastRun] = useState(null);

    const run = async () => {
        setIsRunning(true);
        setError(null);
        try {
            const res = await fetch(`${backendUrl}${endpoint}`, { method: 'PUT', credentials: 'include' });
            if (res.status === 401 || res.status === 403) { logout(); return; }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Document validation failed.');
            setResult(data);
            setLastRun(new Date());
        } catch (err) {
            setError(err.message);
            setResult(null);
        } finally {
            setIsRunning(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {showConfirm && (
                <RunConfirmModal
                    title="Run Document Validator"
                    description="Scans every student document across all semesters — cleans malformed fields, deletes orphaned records, and inserts any missing ones. This can permanently delete or create documents."
                    endpoint={endpoint}
                    requireTyping={true}
                    isRunning={isRunning}
                    onCancel={() => !isRunning && setShowConfirm(false)}
                    onConfirm={run}
                />
            )}

            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <ShieldAlert size={20} className="text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Document Validator</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-md">Cleans, deletes, or inserts student documents across every semester. Destructive — use with care.</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-400 mt-2">
                            <Terminal size={11} /> PUT {endpoint}
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowConfirm(true)} disabled={isRunning} className="flex items-center gap-2 shrink-0 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                    {isRunning ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />} Run
                </button>
            </div>

            <div className="p-5">
                {error ? (
                    <ToolErrorBox message={error} />
                ) : !result ? (
                    <p className="text-sm text-gray-400 font-medium text-center py-6">Not run yet this session.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
                            <StatTile icon={<Layers size={12} />} label="Semesters" value={result.summary.semesters} tone="purple" />
                            <StatTile icon={<Users size={12} />} label="Checked" value={result.summary.studentsChecked} tone="slate" />
                            <StatTile icon={<Sparkles size={12} />} label="Cleaned" value={result.summary.cleaned} tone={result.summary.cleaned > 0 ? 'amber' : 'emerald'} />
                            <StatTile icon={<Trash2 size={12} />} label="Deleted" value={result.summary.deleted} tone={result.summary.deleted > 0 ? 'rose' : 'emerald'} />
                            <StatTile icon={<PlusCircle size={12} />} label="Inserted" value={result.summary.inserted} tone={result.summary.inserted > 0 ? 'blue' : 'emerald'} />
                        </div>
                        {lastRun && <p className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mb-4"><Clock size={10} /> Last run at {formatTime(lastRun)}</p>}

                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="hidden sm:grid grid-cols-5 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                <span>Sem</span><span>Checked</span><span>Cleaned</span><span>Deleted</span><span>Inserted</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {(result.semesterWise || []).map(row => (
                                    <div key={row.sem} className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-4 py-2.5 items-center">
                                        <span className="text-xs font-bold text-gray-800">Sem {row.sem}</span>
                                        <span className="text-xs font-semibold text-gray-500">{row.checked} checked</span>
                                        <span className={`text-xs font-bold ${row.cleaned > 0 ? 'text-amber-600' : 'text-gray-300'}`}>{row.cleaned} cleaned</span>
                                        <span className={`text-xs font-bold ${row.deleted > 0 ? 'text-rose-600' : 'text-gray-300'}`}>{row.deleted} deleted</span>
                                        <span className={`text-xs font-bold ${row.inserted > 0 ? 'text-blue-600' : 'text-gray-300'}`}>{row.inserted} inserted</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const DebuggingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        setTimeout(() => setAnimate(true), 100);
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] text-gray-800 font-sans">
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
                            <Bug className="w-6 h-6 text-blue-300" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-white">Debugging</h1>
                            <p className="text-slate-400 text-xs lg:text-sm">Run maintenance & data-integrity checks directly against the live database.</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                    <ValidateAttendanceTool />
                    <DocValidatorTool />
                </div>
            </main>
        </div>
    );
};

export default DebuggingPage;
