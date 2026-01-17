import React, { useState, useEffect, useRef } from 'react';
import { 
    BrainCircuit, FileSpreadsheet, Layers, 
    ArrowLeft, Loader2, Plus, X, Trash2, Save, 
    CheckCircle, AlertCircle, Timer, FileQuestion, 
    Sparkles, BookOpen, AlertTriangle, Upload, FileText, 
    Play, Calendar
} from 'lucide-react';
import Header from '../../components/Header'; 
import { useAuth } from '../../context/AuthContext'; 

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const SEMESTER_OPTIONS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

// --- SHARED: STATUS MODAL ---
const StatusModal = ({ type, title, message, subMessage, onClose }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center max-w-sm w-full border border-gray-100 mx-4" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {type === 'success' ? <CheckCircle size={32}/> : <AlertTriangle size={32}/>}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">{title || (type === 'success' ? 'Success' : 'Error')}</h3>
            <p className="text-gray-500 mb-6 text-sm font-medium leading-relaxed">{message}</p>
            {subMessage && (
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Session Code</p>
                    <div className="text-3xl font-mono font-bold text-blue-600 tracking-widest">{subMessage}</div>
                </div>
            )}
            <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 text-sm">
                {type === 'success' ? 'Done' : 'Dismiss'}
            </button>
        </div>
    </div>
);

// --- SHARED: CONFIRMATION MODAL ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-gray-100 mx-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
                <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all active:scale-95 text-sm flex items-center justify-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin"/>} Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: SESSION START MODAL ---
const SessionStartModal = ({ isOpen, onClose, paperDetails, onSuccess }) => {
    const [semester, setSemester] = useState('');
    const [batches, setBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(isOpen) {
            setSemester('');
            setBatches([]);
            setSelectedBatches([]);
            setError(null);
        }
    }, [isOpen]);

    const handleSemesterChange = async (sem) => {
        setSemester(sem);
        setBatches([]);
        setSelectedBatches([]);
        setLoadingBatches(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/get-sem-info/${sem}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data) {
                setBatches(data.data.batches || []);
            } else {
                setBatches([]); 
            }
        } catch (e) {
            console.error(e);
            setError("Failed to load batches. Please check your connection.");
        } finally {
            setLoadingBatches(false);
        }
    };

    const toggleBatch = (batch) => {
        setSelectedBatches(prev => prev.includes(batch) ? prev.filter(b => b !== batch) : [...prev, batch]);
    };

    const handleStart = async () => {
        if (!semester || selectedBatches.length === 0) {
            setError("Please select a semester and at least one batch.");
            return;
        }
        setStarting(true);
        try {
            const payload = {
                paperCode: paperDetails.paperCode,
                targetBatches: {
                    [semester]: selectedBatches
                }
            };

            const res = await fetch(`${API_URL}/api/faculty/quiz/start-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                onSuccess(data); 
                onClose();
            } else {
                setError(data.message || "Failed to start session. Server returned an error.");
            }
        } catch (e) {
            setError("Network error occurred. Please try again.");
        } finally {
            setStarting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Play size={20} className="text-blue-600 fill-blue-100"/> Start Session</h2>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{paperDetails?.title} ({paperDetails?.paperCode})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-8 bg-gray-50/50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                            <AlertCircle size={16}/> {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Select Semester</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                {SEMESTER_OPTIONS.map(sem => (
                                    <button 
                                        key={sem} 
                                        onClick={() => handleSemesterChange(sem)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${semester === sem ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}
                                    >
                                        {sem}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`transition-opacity duration-300 ${semester ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Select Batches</label>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 min-h-[100px]">
                                {loadingBatches ? (
                                    <div className="flex items-center justify-center h-full text-gray-400 gap-2 text-sm"><Loader2 size={16} className="animate-spin"/> Loading batches...</div>
                                ) : batches.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {batches.map(batch => (
                                            <button 
                                                key={batch}
                                                onClick={() => toggleBatch(batch)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${selectedBatches.includes(batch) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                {selectedBatches.includes(batch) ? <CheckCircle size={12}/> : <div className="w-3 h-3 rounded-full border-2 border-gray-300"/>}
                                                {batch}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">{semester ? 'No batches found.' : 'Select a semester first.'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                    <button 
                        onClick={handleStart} 
                        disabled={starting || !semester || selectedBatches.length === 0}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {starting ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Start Session
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: SECTION HEADER ---
const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
);

// --- MODAL: QUIZ WIZARD ---
const QuizWizardModal = ({ isOpen, onClose, onQuizCreated, onShowStatus }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [genMode, setGenMode] = useState('AI');
    const [errors, setErrors] = useState({});
    
    const [excelFile, setExcelFile] = useState(null);
    const fileInputRef = useRef(null);

    const [metaData, setMetaData] = useState({ title: '', subject: '', facultyId: 'iare1024', totalMarks: 30, durationMinutes: 45 });
    const [aiConfig, setAiConfig] = useState({ topic: '', difficulty: 'Medium', count: 10 });
    const [questions, setQuestions] = useState([]);
    const [createdQuizData, setCreatedQuizData] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setExcelFile(e.target.files[0]);
            if (errors.file) setErrors({...errors, file: null});
        }
    };

    const handleGenerate = async () => {
        const newErrors = {};
        if (!metaData.title) newErrors.title = "Required";
        if (!metaData.subject) newErrors.subject = "Required";
        if (genMode === 'AI' && !aiConfig.topic) newErrors.topic = "Required";
        if (genMode === 'EXCEL' && !excelFile) newErrors.file = "Required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        try {
            if (genMode === 'AI') {
                const res = await fetch(`${API_URL}/api/faculty/quiz/generate-ai`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aiConfig),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) { setQuestions(data.data); setStep(2); } 
                else onShowStatus('error', data.message || "AI Generation Failed");
            } else {
                const formData = new FormData();
                Object.keys(metaData).forEach(key => formData.append(key, metaData[key]));
                formData.append('file', excelFile);
                const res = await fetch(`${API_URL}/api/faculty/quiz/create-excel`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) { 
                    setQuestions(data.data.questions); 
                    setCreatedQuizData({ paperCode: data.data.paperCode, title: metaData.title }); 
                    setStep(2); 
                } else onShowStatus('error', data.message || "Excel Parsing Failed");
            }
        } catch (error) { onShowStatus('error', "Network error. Please try again."); } 
        finally { setLoading(false); }
    };

    const handleFinalSave = async () => {
        if (genMode === 'EXCEL' && createdQuizData) {
            onQuizCreated(createdQuizData); 
            return;
        }
        setLoading(true);
        try {
            const payload = { ...metaData, questions };
            const res = await fetch(`${API_URL}/api/faculty/quiz/save-ai-quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                onQuizCreated({ paperCode: data.paperCode, title: metaData.title }); 
            } else {
                onShowStatus('error', data.message || "Failed to save quiz");
            }
        } catch (error) { onShowStatus('error', "Save failed due to network error"); } 
        finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[95rem] h-[92vh] flex flex-col overflow-hidden">
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                            <span className="text-blue-600">Quiz Creator</span> <span className="text-gray-300">/</span> <span className={step===1 ? 'text-blue-600' : 'text-gray-400'}>{step===1?'Config':'Review'}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{step === 1 ? 'Configure Assessment' : 'Review Questions'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-grow overflow-y-auto px-8 py-8 bg-gray-50/50">
                    {step === 1 && (
                        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                                <button onClick={() => setGenMode('AI')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${genMode === 'AI' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><BrainCircuit size={16} /> AI Generator</button>
                                <button onClick={() => setGenMode('EXCEL')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${genMode === 'EXCEL' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><FileSpreadsheet size={16} /> Excel Upload</button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> Basic Details</h4>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Title *</label><input value={metaData.title} onChange={(e) => setMetaData({...metaData, title: e.target.value})} className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`} placeholder="e.g. Mid-Sem Exam"/></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Subject *</label><input value={metaData.subject} onChange={(e) => setMetaData({...metaData, subject: e.target.value})} className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`} placeholder="e.g. CP"/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Duration (Min)</label><input type="number" value={metaData.durationMinutes} onChange={(e) => setMetaData({...metaData, durationMinutes: parseInt(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/></div>
                                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Total Marks</label><input type="number" value={metaData.totalMarks} onChange={(e) => setMetaData({...metaData, totalMarks: parseInt(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/></div>
                                    </div>
                                </div>
                                <div className={`p-8 rounded-[1.5rem] border space-y-6 transition-colors ${genMode === 'AI' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${genMode === 'AI' ? 'text-blue-600' : 'text-emerald-500'}`}><Sparkles size={14} /> {genMode} Config</h4>
                                    {genMode === 'AI' ? (
                                        <>
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Topics *</label><textarea value={aiConfig.topic} onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})} className={`w-full h-32 px-4 py-3 border rounded-xl text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-blue-200 transition-all ${errors.topic ? 'border-red-500 bg-red-50' : 'border-blue-200 bg-white'}`} placeholder="Topics..."/></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Difficulty</label><select value={aiConfig.difficulty} onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})} className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl text-sm font-bold outline-none"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                                <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Count</label><input type="number" value={aiConfig.count} onChange={(e) => setAiConfig({...aiConfig, count: parseInt(e.target.value)})} min={1} max={50} className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm font-bold outline-none"/></div>
                                            </div>
                                        </>
                                    ) : (
                                        <div onClick={() => fileInputRef.current?.click()} className={`h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${errors.file ? 'border-red-300 bg-red-50' : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'}`}>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv"/>
                                            {excelFile ? <div className="text-center"><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-100 mx-auto"><FileSpreadsheet size={32} className="text-emerald-500"/></div><p className="text-sm font-bold text-emerald-800">{excelFile.name}</p></div> : <div className="text-center p-6"><Upload size={32} className="text-emerald-400 mb-2 mx-auto"/><p className="text-sm font-bold text-emerald-700">Upload Excel</p></div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-1 gap-4">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                        <div className="flex gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">Q{idx + 1}</span>
                                            <div className="w-full">
                                                <p className="font-bold text-gray-800 text-sm mb-3">{q.questionText}</p>
                                                {q.image && <img src={q.image} alt="Visual" className="max-h-48 rounded-lg border mb-3 object-cover"/>}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                    {q.options && q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                            {opt.isCorrect && <CheckCircle size={12}/>} {opt.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
                    {step === 2 ? <button onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 flex items-center gap-2 hover:text-gray-900"><ArrowLeft size={16}/> Back</button> : <div />}
                    {step === 1 ? (
                        <button onClick={handleGenerate} disabled={loading} className={`px-10 py-3.5 text-white rounded-xl font-bold text-sm flex items-center gap-3 shadow-lg active:scale-95 ml-auto disabled:opacity-50 ${genMode === 'AI' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{loading ? <Loader2 className="animate-spin" size={16}/> : genMode === 'AI' ? <Sparkles size={16}/> : <Upload size={16}/>} Process</button>
                    ) : (
                        <button onClick={handleFinalSave} disabled={loading} className="px-10 py-3.5 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-gray-900 active:scale-95 disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save & Continue</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const FacultyQuizPage = () => {
    const { user } = useAuth(); 
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    
    const [quizzes, setQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    
    // Modal States
    const [statusModal, setStatusModal] = useState(null); 
    const [deleteModal, setDeleteModal] = useState(null); 
    const [sessionModalData, setSessionModalData] = useState(null); 
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { 
        setTimeout(() => setAnimate(true), 100);
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        setLoadingQuizzes(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/quiz/papers`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setQuizzes(data.papers || []);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/quiz/delete-paper/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            setDeleteModal(null);
            if (data.success) {
                setStatusModal({ type: 'success', title: 'Deleted', message: data.message });
                fetchPapers();
            } else {
                setStatusModal({ type: 'error', message: data.message || "Delete failed" });
            }
        } catch (error) {
            setDeleteModal(null);
            setStatusModal({ type: 'error', message: "Network error during deletion" });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
            {/* --- MODALS --- */}
            <QuizWizardModal 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)}
                onShowStatus={(type, msg) => setStatusModal({type, message: msg})}
                onQuizCreated={(quizData) => {
                    setIsWizardOpen(false);
                    fetchPapers(); 
                    setSessionModalData(quizData); 
                }}
            />
            
            <SessionStartModal 
                isOpen={!!sessionModalData}
                onClose={() => setSessionModalData(null)}
                paperDetails={sessionModalData}
                onSuccess={(data) => {
                    setStatusModal({ 
                        type: 'success', 
                        title: 'Session Started', 
                        message: `The quiz "${data.paperTitle}" is live. Share the code below.`,
                        subMessage: data.sessionCode 
                    });
                }}
            />

            {statusModal && (
                <StatusModal 
                    type={statusModal.type} 
                    title={statusModal.title}
                    message={statusModal.message} 
                    subMessage={statusModal.subMessage}
                    onClose={() => setStatusModal(null)} 
                />
            )}

            {deleteModal && (
                <ConfirmationModal 
                    isOpen={!!deleteModal} 
                    title="Delete Quiz?" 
                    message={`Are you sure you want to delete "${deleteModal?.title}"? This action cannot be undone.`} 
                    onConfirm={confirmDelete} 
                    onCancel={() => setDeleteModal(null)} 
                    loading={deleteLoading} 
                />
            )}

            {/* Dark Header Background */}
            <div className="bg-[#0F172A] pb-32 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="px-6 pt-6 relative z-10 w-full max-w-[95rem] mx-auto">
                    <Header animate={animate} />
                    
                    <div className="mt-8 mb-6">
                        <SectionHeader title="Quiz Management" animate={animate} delay={200} />
                        
                        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div>
                                <h1 className="text-3xl font-bold text-white">All Quizzes</h1>
                                <p className="text-slate-300 text-sm mt-1">Manage, Edit and Start AI/Excel Assessments</p>
                            </div>

                            <button onClick={() => setIsWizardOpen(true)} className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-bold text-base flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-105 transition-all transform w-full md:w-auto justify-center">
                                <Plus size={20} strokeWidth={3} /> Create New Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="px-4 -mt-24 relative z-20 w-full max-w-[95rem] mx-auto">
                <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 min-h-[500px] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    
                    {loadingQuizzes ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                            <p>Loading Papers...</p>
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100"><BrainCircuit size={24} className="text-blue-400"/></div>
                            <h4 className="font-bold text-base text-gray-600">No Quizzes Found</h4>
                            <p className="text-xs text-gray-400 mt-1">Create your first assessment using AI or Excel.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => (
                                <div key={quiz._id} className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-1 ${quiz.creationSource === 'excel' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {quiz.creationSource === 'excel' ? <FileSpreadsheet size={10} /> : <Sparkles size={10} />}
                                                {quiz.creationSource || 'AI'}
                                            </span>
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase">{quiz.subject}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {/* Start Session Button */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSessionModalData({ paperCode: quiz.paperCode, title: quiz.title }); }}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                                title="Start Session"
                                            >
                                                <Play size={16} className="fill-blue-600"/>
                                            </button>
                                            {/* Delete Button */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setDeleteModal({ id: quiz._id, title: quiz.title }); }}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Quiz"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 font-bold font-mono bg-gray-50 px-2 py-1 rounded w-fit">
                                            <FileText size={12} /> {quiz.paperCode}
                                        </div>
                                        <h3 className="text-lg font-extrabold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-50 grid grid-cols-3 gap-2 text-center">
                                        <div><p className="text-[10px] font-bold text-gray-400 uppercase">Questions</p><p className="text-sm font-bold text-gray-700 flex items-center justify-center gap-1"><FileQuestion size={14} className="text-gray-300"/> {quiz.questions?.length || 0}</p></div>
                                        <div className="border-l border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase">Marks</p><p className="text-sm font-bold text-gray-700">{quiz.totalMarks}</p></div>
                                        <div className="border-l border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase">Mins</p><p className="text-sm font-bold text-gray-700 flex items-center justify-center gap-1"><Timer size={14} className="text-gray-300"/> {quiz.durationMinutes}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FacultyQuizPage;