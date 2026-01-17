import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, Layers, Loader2, Square, 
    CheckCircle, AlertTriangle, Users, Calendar, RefreshCw,
    BarChart3, Trash2, FileText, ChevronRight
} from 'lucide-react';
import Header from '../../components/Header'; 
import { useAuth } from '../../context/AuthContext'; 

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// --- SHARED COMPONENTS ---
const StatusModal = ({ type, title, message, onClose }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center max-w-sm w-full border border-gray-100 mx-4" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {type === 'success' ? <CheckCircle size={32}/> : <AlertTriangle size={32}/>}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">{title || (type === 'success' ? 'Success' : 'Error')}</h3>
            <p className="text-gray-500 mb-6 text-sm font-medium leading-relaxed">{message}</p>
            <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 text-sm">Dismiss</button>
        </div>
    </div>
);

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmColor="bg-red-600 hover:bg-red-700", confirmText="Confirm" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-gray-100 mx-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
                <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3.5 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2 ${confirmColor}`}>
                        {loading && <Loader2 size={16} className="animate-spin"/>} {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
);

// --- MAIN PAGE ---
const FacultySessionPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);
    
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [statusModal, setStatusModal] = useState(null); 
    const [endModal, setEndModal] = useState(null); 
    const [deleteModal, setDeleteModal] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { 
        setTimeout(() => setAnimate(true), 100);
        fetchSessions();
        const interval = setInterval(fetchSessions, 30000); 
        return () => clearInterval(interval);
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${API_URL}/api/faculty/quiz/sessions`, { credentials: 'include' });
            const data = await res.json();
            if (data.status) {
                const sorted = (data.sessions || []).sort((a, b) => {
                    if (a.status === 'live' && b.status !== 'live') return -1;
                    if (a.status !== 'live' && b.status === 'live') return 1;
                    return new Date(b.startTime) - new Date(a.startTime);
                });
                setSessions(sorted);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleEndSession = async () => {
        if (!endModal) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/quiz/end-session`, { 
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ sessionCode: endModal.sessionCode }), credentials: 'include' 
            });
            const data = await res.json();
            setEndModal(null);
            if (data.success) { setStatusModal({ type: 'success', title: 'Session Ended', message: data.message }); fetchSessions(); } 
            else setStatusModal({ type: 'error', message: data.message });
        } catch (error) { setEndModal(null); setStatusModal({ type: 'error', message: "Network error occurred." }); } 
        finally { setActionLoading(false); }
    };

    const handleDeleteSession = async () => {
        if (!deleteModal) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/quiz/delete-session/${deleteModal.sessionCode}`, { 
                method: 'DELETE', credentials: 'include' 
            });
            const data = await res.json();
            setDeleteModal(null);
            if (data.success) { setStatusModal({ type: 'success', title: 'Deleted', message: data.message }); fetchSessions(); } 
            else setStatusModal({ type: 'error', message: data.message });
        } catch (error) { setDeleteModal(null); setStatusModal({ type: 'error', message: "Network error occurred." }); } 
        finally { setActionLoading(false); }
    };

    return (
        <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
            {statusModal && <StatusModal {...statusModal} onClose={() => setStatusModal(null)} />}
            <ConfirmationModal isOpen={!!endModal} title="End Session?" message={`Stop session ${endModal?.sessionCode}? Students can no longer submit.`} onConfirm={handleEndSession} onCancel={() => setEndModal(null)} loading={actionLoading} confirmText="End Session"/>
            <ConfirmationModal isOpen={!!deleteModal} title="Delete Session?" message={`Delete session ${deleteModal?.sessionCode} and ALL its reports? This is irreversible.`} onConfirm={handleDeleteSession} onCancel={() => setDeleteModal(null)} loading={actionLoading} confirmText="Delete Forever"/>

            <div className="bg-[#0F172A] pb-32 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                <div className="px-6 pt-6 relative z-10 w-full max-w-[95rem] mx-auto">
                    <Header animate={animate} />
                    <div className="mt-8 mb-6">
                        <SectionHeader title="Session Monitor" animate={animate} delay={200} />
                        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div><h1 className="text-3xl font-bold text-white">Live & Past Sessions</h1><p className="text-slate-300 text-sm mt-1">Monitor active quizzes and view participation history.</p></div>
                            <button onClick={() => { setLoading(true); fetchSessions(); }} className="px-6 py-3 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-white/10"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh Data</button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="px-4 -mt-24 relative z-20 w-full max-w-[95rem] mx-auto">
                <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 min-h-[500px] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {loading ? <div className="flex flex-col items-center justify-center py-24 text-gray-400"><Loader2 size={40} className="animate-spin mb-4 text-blue-500" /><p>Syncing Sessions...</p></div> : sessions.length === 0 ? (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200"><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100"><Activity size={24} className="text-blue-400"/></div><h4 className="font-bold text-base text-gray-600">No Sessions Found</h4><p className="text-xs text-gray-400 mt-1">Start a quiz from the "Manage Quizzes" page to see it here.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session) => (
                                <div key={session._id} className={`group relative bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${session.status === 'live' ? 'border-blue-200 ring-4 ring-blue-50/50' : 'border-gray-100 opacity-90 hover:opacity-100'}`}>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-2 ${session.status === 'live' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                {session.status === 'live' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                                                {session.status.toUpperCase()}
                                            </span>
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-lg text-[10px] font-bold font-mono flex items-center gap-1"><FileText size={10}/> {session.paperCode}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {session.status === 'live' && (
                                                <button onClick={() => setEndModal(session)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100" title="End Session"><Square size={16} className="fill-red-500"/></button>
                                            )}
                                            <button onClick={() => setDeleteModal(session)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Session"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6 text-center bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session Code</p>
                                        <h3 className="text-4xl font-mono font-bold text-blue-600 tracking-wider">{session.sessionCode}</h3>
                                    </div>
                                    
                                    <div className="space-y-3 mt-auto">
                                        <div className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <span className="text-gray-500 flex items-center gap-2 font-medium"><Users size={16} className="text-blue-400"/> Participants</span>
                                            <span className="font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded-md">{session.totalParticipantsCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <span className="text-gray-500 flex items-center gap-2 font-medium"><Layers size={16} className="text-emerald-400"/> Batch</span>
                                            <span className="font-bold text-gray-900 text-right truncate max-w-[120px]">{typeof session.targetBatch === 'string' ? session.targetBatch : Object.values(session.targetBatches || {}).flat().join(', ')}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 text-gray-400 mt-2">
                                            <span className="flex items-center gap-1.5"><Calendar size={12}/> Started</span>
                                            <span className="font-mono">{new Date(session.startTime).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* --- ANALYTICS BUTTON (Updated) --- */}
                                    <button 
                                        onClick={() => navigate(`/faculty/sessions/${session.sessionCode}/analytics`)}
                                        className="w-full mt-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-sm"
                                    >
                                        <BarChart3 size={14} /> Analytics <ChevronRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FacultySessionPage;