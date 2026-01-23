import React, { useState, useEffect } from 'react';
import { 
    Search, Calendar, Clock, Layers, 
    ArrowLeft, ArrowRight, Loader2, Plus, X, 
    Trash2, Edit3, Send, CheckCircle, AlertTriangle, 
    Timer, Code2, Settings, Info, ChevronDown, 
    FileText, Save, RefreshCw, Download, Terminal, 
    AlertCircle, Sparkles, Cpu
} from 'lucide-react';
import Header from '../../components/Header'; 
import { useAuth } from '../../context/AuthContext'; 
import Loader from '../../components/Loader'; 

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const SEMESTER_OPTIONS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

// Judge0 Language ID Mapping
const LANGUAGE_MAP = {
    'cpp': { id: 54, label: 'C++ (GCC 9.2)' },
    'java': { id: 62, label: 'Java (OpenJDK 13)' },
    'python': { id: 71, label: 'Python (3.8.1)' }
};

const ID_TO_LANGUAGE = { 54: 'cpp', 62: 'java', 71: 'python' };

const PROBLEM_TYPES = [
    'ARRAY_INT', 'ARRAY_STR', 'ARRAY_CHAR', 'STRING', 
    'CHAR', 'MATRIX', 'TREE', 'GRAPH', 'SINGLE_INT'
];

const CONSTRAINT_CONFIG = {
    ARRAY_INT:  { showN: true,  showMinMax: true,  showCharset: false, nLabel: "List Size (N)" },
    ARRAY_STR:  { showN: true,  showMinMax: false, showCharset: true,  nLabel: "List Size (N)" },
    ARRAY_CHAR: { showN: true,  showMinMax: false, showCharset: true,  nLabel: "List Size (N)" },
    STRING:     { showN: true,  showMinMax: false, showCharset: true,  nLabel: "Text Length (N)" },
    CHAR:       { showN: false, showMinMax: false, showCharset: true,  nLabel: "" },
    MATRIX:     { showN: true,  showMinMax: true,  showCharset: false, nLabel: "Total Cells (N)" },
    TREE:       { showN: true,  showMinMax: false, showCharset: false, nLabel: "Node Count (N)" },
    GRAPH:      { showN: true,  showMinMax: false, showCharset: false, nLabel: "Node Count (N)" },
    SINGLE_INT: { showN: false, showMinMax: true,  showCharset: false, nLabel: "" },
    MULTIPLE:   { showN: false, showMinMax: false, showCharset: false, nLabel: "" }
};

// --- HELPERS ---
const calculateStatus = (contest) => {
    if (!contest || contest.status === 'Draft') return 'Draft';
    try {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);
        if (now < start) return 'Upcoming';
        if (now >= start && now <= end) return 'Live';
        return 'Past';
    } catch (e) { return 'Draft'; }
};

const formatDuration = (start, end) => {
    try {
        const s = new Date(start);
        const e = new Date(end);
        const diff = (e - s) / 1000 / 60; 
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return `${h}h ${m > 0 ? m + 'm' : ''}`;
    } catch (e) { return 'N/A'; }
};

// --- COMPONENT: SECTION HEADER ---
const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
);

// --- COMPONENT: DELETE CONFIRMATION MODAL ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, examName, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 scale-100 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto shadow-sm border border-red-100">
                    <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Assessment?</h3>
                <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-gray-800">"{examName}"</span>? This action is permanent and cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isDeleting} className="flex-1 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm border border-gray-200">Cancel</button>
                    <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all text-sm flex items-center justify-center gap-2">
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: CODE EDITOR ---
const CodeEditor = ({ value, onChange, language, onLanguageChange }) => (
    <div className="flex flex-col h-full rounded-xl overflow-hidden shadow-sm border border-gray-300">
        <div className="bg-[#2d2d2d] px-4 py-3 border-b border-[#3d3d3d] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <Terminal size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">Reference Solution</span>
            </div>
            <div className="relative group">
                <select 
                    value={language} 
                    onChange={(e) => onLanguageChange(e.target.value)} 
                    className="appearance-none bg-[#3d3d3d] text-gray-200 text-xs font-mono py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer border border-[#505050] hover:border-gray-400 transition-colors"
                >
                    {Object.keys(LANGUAGE_MAP).map(key => <option key={key} value={key}>{LANGUAGE_MAP[key].label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
        </div>
        <div className="flex-grow relative bg-[#1e1e1e]">
            <textarea 
                value={value} 
                onChange={onChange} 
                className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-4 outline-none resize-none font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-transparent" 
                placeholder={`# Paste your working ${language} solution here.`} 
                spellCheck="false" 
            />
        </div>
    </div>
);

// --- COMPONENT: PROBLEM EDITOR ---
const ProblemEditorModal = ({ isOpen, onClose, onSave, initialData }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('statement');
    const [errors, setErrors] = useState({});
    const [constraintMode, setConstraintMode] = useState('MANUAL'); 

    const [problem, setProblem] = useState({
        id: Date.now(),
        title: '', description: '', inputFormat: '', outputFormat: '',
        problemType: 'ARRAY_INT', marks: 10, difficulty: 'Medium', timeAllocated: 20,
        constraints: '', 
        maxConstraints: { n: 100, minVal: 1, maxVal: 1000, charset: 'abcdefghijklmnopqrstuvwxyz' },
        testCases: [{ input: '', output: '', explanation: '', isPublic: true }],
        referenceSolution: '', solutionLanguage: 'python'
    });

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData) {
                setProblem(initialData);
                if (initialData.problemType === 'MULTIPLE') setConstraintMode('AI');
                else setConstraintMode('MANUAL');
            } else {
                setProblem({
                    id: Date.now(),
                    title: '', description: '', inputFormat: '', outputFormat: '',
                    problemType: 'ARRAY_INT', marks: 10, difficulty: 'Medium', timeAllocated: 20,
                    constraints: '',
                    maxConstraints: { n: 100, minVal: 1, maxVal: 1000, charset: 'abcdefghijklmnopqrstuvwxyz' },
                    testCases: [{ input: '', output: '', explanation: '', isPublic: true }],
                    referenceSolution: '', solutionLanguage: 'python'
                });
                setConstraintMode('MANUAL');
            }
            setActiveTab('statement');
        }
    }, [isOpen, initialData]);

    const toggleConstraintMode = (mode) => {
        setConstraintMode(mode);
        setProblem(prev => {
            const isSwitchingToAI = mode === 'AI';
            const newType = isSwitchingToAI ? 'MULTIPLE' : (prev.problemType === 'MULTIPLE' ? 'ARRAY_INT' : prev.problemType);
            return { ...prev, problemType: newType, constraints: prev.constraints };
        });
    };

    const handleChange = (field, value) => {
        setProblem(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleConstraintChange = (field, value) => {
        setProblem(prev => {
            const updatedMax = { ...prev.maxConstraints, [field]: value };
            return { ...prev, maxConstraints: updatedMax };
        });
    };

    useEffect(() => {
        if (constraintMode === 'MANUAL') {
            const config = CONSTRAINT_CONFIG[problem.problemType] || CONSTRAINT_CONFIG.ARRAY_INT;
            const c = problem.maxConstraints;
            let str = "";
            if (config.showN) str += `1 <= ${config.nLabel.replace(/\(N\)/g, 'N').trim()} <= ${c.n}`;
            if (config.showMinMax) {
                if (str) str += "\n";
                str += `${c.minVal} <= element <= ${c.maxVal}`;
            }
            if (config.showCharset) {
                if (str) str += "\n";
                str += `Characters: [${c.charset}]`;
            }
            setProblem(prev => ({ ...prev, constraints: str }));
        }
    }, [problem.maxConstraints, problem.problemType, constraintMode]);

    const validate = () => {
        const newErrors = {};
        if (!problem.title.trim()) newErrors.title = "Required";
        if (!problem.description.trim()) newErrors.description = "Required";
        if (!problem.inputFormat.trim()) newErrors.inputFormat = "Required";
        if (!problem.outputFormat.trim()) newErrors.outputFormat = "Required";
        if (!problem.referenceSolution.trim()) newErrors.referenceSolution = "Required";
        if (!problem.constraints.trim()) newErrors.constraints = "Required";

        const hasValidTestCase = problem.testCases.length > 0 && problem.testCases.every(tc => tc.input.trim() && tc.output.trim());
        if (!hasValidTestCase) newErrors.testCases = "Complete all test cases";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(problem);
        } else {
            if (errors.referenceSolution) setActiveTab('solution');
            else if (errors.testCases) setActiveTab('cases');
            else if (errors.constraints) setActiveTab('logic');
            else setActiveTab('statement');
        }
    };

    const config = CONSTRAINT_CONFIG[problem.problemType] || CONSTRAINT_CONFIG.ARRAY_INT;
    const TabBtn = ({ id, label, hasError }) => (
        <button onClick={() => setActiveTab(id)} className={`relative px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-[2px] transition-all ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'} ${hasError ? 'text-red-500' : ''}`}>
            {label}
            {hasError && <span className="absolute top-3 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white w-full max-w-[85rem] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Challenge' : 'New Challenge'}</h3>
                        <p className="text-sm text-gray-500 font-medium">Define problem logic.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">Save Challenge</button>
                    </div>
                </div>

                <div className="px-8 py-6 grid grid-cols-12 gap-6 border-b border-gray-100 bg-gray-50/30 shrink-0">
                    <div className="col-span-6">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Title <span className="text-red-500">*</span></label>
                        <input value={problem.title} onChange={(e) => handleChange('title', e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`} placeholder="e.g. Search in Rotated Array"/>
                        {errors.title && <p className="text-[10px] text-red-500 font-bold mt-1">Title is required.</p>}
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Difficulty</label>
                        <select value={problem.difficulty} onChange={(e) => handleChange('difficulty', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"><option>Easy</option><option>Medium</option><option>Hard</option></select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Marks</label>
                        <input type="number" value={problem.marks} onChange={(e) => handleChange('marks', parseInt(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Time (Mins)</label>
                        <input type="number" value={problem.timeAllocated} onChange={(e) => handleChange('timeAllocated', parseInt(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 px-8 bg-white shrink-0">
                    <TabBtn id="statement" label="1. Statement" hasError={errors.description || errors.inputFormat || errors.outputFormat} />
                    <TabBtn id="logic" label="2. Logic & Constraints" hasError={errors.constraints} />
                    <TabBtn id="cases" label="3. Test Cases" hasError={errors.testCases} />
                    <TabBtn id="solution" label="4. Solution" hasError={errors.referenceSolution} />
                </div>

                <div className="flex-grow overflow-y-auto p-8 bg-gray-50/50">
                    {activeTab === 'statement' && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><FileText size={14}/> Description <span className="text-red-500">*</span></label>
                                <textarea value={problem.description} onChange={(e) => handleChange('description', e.target.value)} className={`w-full h-40 p-4 border rounded-2xl text-sm leading-relaxed resize-none outline-none focus:ring-2 focus:ring-blue-50 transition-all ${errors.description ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 bg-white'}`} placeholder="Describe the task clearly..."/>
                                {errors.description && <p className="text-[10px] text-red-500 font-bold mt-1">Description required.</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Input Format <span className="text-red-500">*</span></label>
                                    <textarea value={problem.inputFormat} onChange={(e) => handleChange('inputFormat', e.target.value)} className={`w-full h-32 p-4 border rounded-2xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-50 transition-all ${errors.inputFormat ? 'border-red-300' : 'border-gray-200 bg-white'}`} placeholder="e.g. First line N..."/>
                                    {errors.inputFormat && <p className="text-[10px] text-red-500 font-bold mt-1">Input format required.</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Output Format <span className="text-red-500">*</span></label>
                                    <textarea value={problem.outputFormat} onChange={(e) => handleChange('outputFormat', e.target.value)} className={`w-full h-32 p-4 border rounded-2xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-50 transition-all ${errors.outputFormat ? 'border-red-300' : 'border-gray-200 bg-white'}`} placeholder="e.g. Print result..."/>
                                    {errors.outputFormat && <p className="text-[10px] text-red-500 font-bold mt-1">Output format required.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logic' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Settings size={16} className="text-gray-500"/> Constraint Configuration</h4>
                                </div>
                                
                                <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 max-w-md">
                                    <button onClick={() => toggleConstraintMode('MANUAL')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${constraintMode === 'MANUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Code2 size={14}/> Guided (Standard)</button>
                                    <button onClick={() => toggleConstraintMode('AI')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${constraintMode === 'AI' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Sparkles size={14}/> Flexible (AI Mode)</button>
                                </div>
                                
                                <div className="space-y-6">
                                    {constraintMode === 'MANUAL' && (
                                        <div className="animate-in fade-in space-y-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Data Type</label>
                                                <div className="relative">
                                                    <select value={problem.problemType} onChange={(e) => handleChange('problemType', e.target.value)} className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none">
                                                        {PROBLEM_TYPES.filter(t => t !== 'MULTIPLE').map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 space-y-5">
                                                {config.showN && <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">{config.nLabel}</label><input type="number" value={problem.maxConstraints.n} onChange={e => handleConstraintChange('n', parseInt(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"/></div>}
                                                {config.showMinMax && <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">Min Value</label><input type="number" value={problem.maxConstraints.minVal} onChange={e => handleConstraintChange('minVal', parseInt(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"/></div>
                                                    <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">Max Value</label><input type="number" value={problem.maxConstraints.maxVal} onChange={e => handleConstraintChange('maxVal', parseInt(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"/></div>
                                                </div>}
                                                {config.showCharset && <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">Charset</label><input type="text" value={problem.maxConstraints.charset} onChange={e => handleConstraintChange('charset', e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono bg-white" placeholder='abcdefghijklmnopqrstuvwxyz' /></div>}
                                            </div>
                                        </div>
                                    )}
                                    {constraintMode === 'AI' && (
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3 animate-in fade-in">
                                            <Cpu className="text-purple-600 shrink-0" size={20}/>
                                            <div><h5 className="text-sm font-bold text-purple-900">Advanced AI Mode</h5><p className="text-xs text-purple-700 mt-1">Enter your constraints as text below.</p></div>
                                        </div>
                                    )}
                                    <div className="pt-6 border-t border-gray-100 mt-6">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block flex justify-between">
                                            <span>Constraints Text <span className="text-red-500">*</span></span>
                                            {constraintMode === 'MANUAL' && <span className="text-blue-500 font-normal normal-case flex items-center gap-1"><CheckCircle size={10}/> Auto-generated</span>}
                                        </label>
                                        <textarea value={problem.constraints} onChange={(e) => handleChange('constraints', e.target.value)} readOnly={constraintMode === 'MANUAL'} className={`w-full h-32 p-4 border rounded-xl text-sm font-mono outline-none resize-none transition-all ${constraintMode === 'MANUAL' ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-purple-200 focus:ring-2 focus:ring-purple-100 text-gray-800'}`} placeholder={constraintMode === 'AI' ? "e.g. 1 <= N <= 1000\n-10^4 <= K <= 10^4\nArray elements are distinct." : "Constraints will appear here..."}/>
                                        {errors.constraints && <p className="text-[10px] text-red-500 font-bold mt-1">Constraints text is required.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cases' && (
                        <div className="max-w-7xl mx-auto">
                             <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-center mb-6">
                                <Info size={18} className="text-blue-600"/>
                                <p className="text-sm text-blue-700">Add sample/public cases here. Hidden cases are generated automatically by <strong>{constraintMode === 'AI' ? 'AI' : 'Judge0 logic'}</strong>.</p>
                            </div>
                            <div className="space-y-6">
                                {problem.testCases.map((tc, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl border shadow-sm relative bg-white border-gray-200">
                                        <div className="absolute top-4 right-4 flex gap-2 items-center">
                                            <div className="text-[10px] px-3 py-1 rounded-lg font-extrabold uppercase tracking-wide border bg-emerald-50 text-emerald-600 border-emerald-100">Public Case</div>
                                            {problem.testCases.length > 1 && (
                                                <button onClick={() => setProblem(p => ({...p, testCases: p.testCases.filter((_,i)=>i!==idx)}))} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Input</label><textarea value={tc.input} onChange={e => {const n=[...problem.testCases]; n[idx].input=e.target.value; setProblem(p=>({...p, testCases:n}))}} className="w-full h-24 p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"/></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Output</label><textarea value={tc.output} onChange={e => {const n=[...problem.testCases]; n[idx].output=e.target.value; setProblem(p=>({...p, testCases:n}))}} className="w-full h-24 p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"/></div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100/50">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Explanation</label>
                                            <input value={tc.explanation || ''} onChange={e => {const n=[...problem.testCases]; n[idx].explanation=e.target.value; setProblem(p=>({...p, testCases:n}))}} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6"><button onClick={() => setProblem(p => ({...p, testCases: [...p.testCases, {input:'', output:'', explanation:'', isPublic:true}]}))} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"><Plus size={16}/> Add Sample Case</button></div>
                        </div>
                    )}

                    {activeTab === 'solution' && (
                        <div className="h-full flex flex-col" style={{minHeight: '600px'}}>
                             {errors.referenceSolution && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14}/> Reference solution code is required for validation.</div>}
                            <CodeEditor value={problem.referenceSolution} onChange={e => handleChange('referenceSolution', e.target.value)} language={problem.solutionLanguage} onLanguageChange={v => handleChange('solutionLanguage', v)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MODAL: MAIN WIZARD ---
const ContestWizardModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [step, setStep] = useState(1);
    const [submittingAction, setSubmittingAction] = useState(null); // 'Draft' | 'Published' | null
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        contestId: '', title: '', semester: '',
        date: new Date().toISOString().slice(0, 10),
        startTime: '15:30', endTime: '18:30', batches: []
    });

    const [problems, setProblems] = useState([]);
    const [editingProblem, setEditingProblem] = useState(null);
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [fetchingBatches, setFetchingBatches] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setErrors({});
            setSubmittingAction(null);
            if (initialData) {
                let d = '', s = '', e = '';
                try {
                    const startObj = new Date(initialData.startTime);
                    const endObj = new Date(initialData.endTime);
                    d = startObj.toISOString().slice(0, 10);
                    s = startObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                    e = endObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                } catch(err){ console.error("Date Parse Error:", err); }
                
                setFormData({
                    contestId: initialData.examId || '',
                    title: initialData.examName || '',
                    semester: initialData.semester || '', 
                    date: d || new Date().toISOString().slice(0, 10),
                    startTime: s || '09:00', endTime: e || '11:00',
                    batches: initialData.batches || []
                });
                setProblems(initialData.problems ? JSON.parse(JSON.stringify(initialData.problems)) : []);
                if (initialData.semester) handleSemesterChange(initialData.semester, false);
            } else {
                setFormData({ contestId: '', title: '', semester: '', date: new Date().toISOString().slice(0, 10), startTime: '09:00', endTime: '11:00', batches: [] });
                setProblems([]);
                setAvailableBatches([]);
            }
        }
    }, [isOpen, initialData]);

    const handleSemesterChange = async (sem, clearBatches = true) => {
        setFormData(prev => ({ ...prev, semester: sem, batches: clearBatches ? [] : prev.batches }));
        if (errors.semester) setErrors(p => ({...p, semester: null}));
        if (!sem) return;
        setFetchingBatches(true);
        try {
            const res = await fetch(`${API_URL}/api/get-sem-info/${sem}`, { credentials: 'include' });
            if (res.status === 404) { setAvailableBatches([]); return; }
            const data = await res.json();
            setAvailableBatches(data.success && data.data ? data.data.batches : []);
        } catch (e) { console.error(e); setAvailableBatches([]); } finally { setFetchingBatches(false); }
    };

    const toggleBatch = (batch) => {
        setFormData(p => ({ ...p, batches: p.batches.includes(batch) ? p.batches.filter(b=>b!==batch) : [...p.batches, batch] }));
        if (errors.batches) setErrors(p => ({...p, batches: null}));
    };

    const handleIdChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setFormData(prev => ({ ...prev, contestId: value }));
            if (errors.contestId) setErrors(prev => ({ ...prev, contestId: null }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.contestId.trim()) newErrors.contestId = "Required";
        else if (formData.contestId.length !== 6) newErrors.contestId = "Must be exactly 6 digits";
        if (!formData.title.trim()) newErrors.title = "Required";
        if (!formData.semester) newErrors.semester = "Required";
        if (formData.batches.length === 0) newErrors.batches = "Select Batches";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => { if (validateStep1()) setStep(2); };
    
    const saveProblem = (p) => {
        setProblems(prev => {
            const idx = prev.findIndex(item => item.id === p.id);
            if (idx >= 0) { const updated = [...prev]; updated[idx] = p; return updated; }
            return [...prev, p];
        });
        setIsProblemModalOpen(false);
    };
    
    const deleteProblem = (id) => setProblems(prev => prev.filter(p => p.id !== id));

   const constructPayload = (targetStatus) => {
        const startISO = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
        const endISO = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();
        const isAiMode = problems.some(p => p.problemType === 'MULTIPLE');

        return {
            examId: formData.contestId,
            examName: formData.title,
            semester: formData.semester, 
            status: targetStatus,
            generationMode: isAiMode ? "AI" : "MANUAL", 
            batches: formData.batches,
            startTime: startISO,
            endTime: endISO,
            problems: problems.map((p, i) => {
                const maxConstraints = {
                    maxN: p.maxConstraints?.n || 100,
                    maxValue: p.maxConstraints?.maxVal || 1000,
                    ...(p.maxConstraints?.charset && { charset: p.maxConstraints.charset }),
                    ...(p.maxConstraints?.minVal !== undefined && { minValue: p.maxConstraints.minVal }),
                };
                return {
                    problemNo: i + 1,
                    title: p.title,
                    difficulty: p.difficulty,
                    description: p.description,
                    inputFormat: p.inputFormat,
                    outputFormat: p.outputFormat,
                    problemType: p.problemType,
                    marks: p.marks,
                    timeAllocated: p.timeAllocated,
                    constraints: p.constraints,
                    maxConstraints: maxConstraints,
                    referenceSolution: { languageId: LANGUAGE_MAP[p.solutionLanguage]?.id || 71, code: p.referenceSolution },
                    testCases: p.testCases 
                };
            })
        };
    };

    const handleFinalSubmit = async (targetStatus) => {
        if (problems.length === 0) { onSuccess({ type: 'error', message: 'Please add at least one problem.' }); return; }
        setSubmittingAction(targetStatus);
        try {
            const payload = constructPayload(targetStatus);
            const isEdit = !!initialData;
            const endpoint = isEdit ? `${API_URL}/api/faculty/modify-exam` : `${API_URL}/api/faculty/create-exam`;
            const method = isEdit ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) { 
                onSuccess({ type: 'success', message: data.message, details: data }); 
                onClose(); 
            } else { throw new Error(data.message); }
        } catch (e) { onSuccess({ type: 'error', message: e.message }); } finally { setSubmittingAction(null); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[95rem] h-[92vh] flex flex-col overflow-hidden">
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                            <span className="text-blue-600">{initialData ? 'Edit Exam' : 'New Exam'}</span> <span className="text-gray-300">/</span> {step === 1 ? 'Details' : 'Content'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{formData.title || 'Untitled Exam'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-grow overflow-y-auto px-8 py-8 bg-gray-50/50">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Exam Configuration</h4>
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Exam ID <span className="text-red-500">*</span></label>
                                        <input value={formData.contestId} onChange={handleIdChange} maxLength={6} disabled={!!initialData} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-blue-100 ${errors.contestId ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${!!initialData ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} placeholder="754822"/>
                                        {errors.contestId && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.contestId}</p>}
                                    </div>
                                    <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Exam Name <span className="text-red-500">*</span></label><input value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} placeholder="Data Structures Advanced"/>
                                        {errors.title && <p className="text-[10px] text-red-500 font-bold mt-1">Title is required.</p>}
                                    </div>
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Date <span className="text-red-500">*</span></label><input type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/></div>
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Start <span className="text-red-500">*</span></label><input type="time" value={formData.startTime} onChange={e=>setFormData({...formData, startTime:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/></div>
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">End <span className="text-red-500">*</span></label><input type="time" value={formData.endTime} onChange={e=>setFormData({...formData, endTime:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"/></div>
                                </div>
                            </div>
                            
                            <div className={`bg-white p-6 rounded-[1.5rem] border shadow-sm ${errors.semester || errors.batches ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'}`}>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Target Audience <span className="text-red-500">*</span></h4>
                                <div className="flex gap-3 mb-6 overflow-x-auto pb-1">{SEMESTER_OPTIONS.map(sem => (<button key={sem} onClick={()=>handleSemesterChange(sem)} className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all ${formData.semester===sem?'bg-slate-900 text-white shadow-md':'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{sem}</button>))}</div>
                                {formData.semester && (
                                    <div className="p-6 bg-slate-50 rounded-2xl flex flex-wrap gap-3 border border-slate-100 min-h-[80px] items-center">
                                            {fetchingBatches ? <div className="flex items-center gap-2 text-slate-400 text-sm font-medium"><Loader2 size={16} className="animate-spin"/> Syncing classes...</div> : 
                                             availableBatches.length > 0 ? availableBatches.map(b => (
                                                <button key={b} onClick={()=>toggleBatch(b)} className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${formData.batches.includes(b)?'bg-blue-600 text-white border-blue-600 shadow-sm':'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                                                    {formData.batches.includes(b) ? <CheckCircle size={14} className="text-white"/> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"/>} {b}
                                                </button>
                                            )) : <span className="text-sm text-gray-400 italic">No batches found.</span>}
                                    </div>
                                )}
                                {(errors.semester || errors.batches) && <p className="text-[10px] text-red-500 font-bold mt-3 flex items-center gap-1"><AlertTriangle size={12}/> Please select semester and at least one batch.</p>}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div className="flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-gray-900">Problem Set</h3><p className="text-xs text-gray-500 mt-0.5">Define problems using Manual or AI modes.</p></div>
                                <button onClick={()=>{setEditingProblem(null); setIsProblemModalOpen(true)}} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"><Plus size={16}/> Add Problem</button>
                            </div>
                            
                            {problems.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[1.5rem] bg-white/50">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Code2 className="text-gray-400" size={32}/></div>
                                    <h4 className="text-gray-800 font-bold text-lg">No content yet</h4>
                                    <p className="text-gray-500 text-sm mt-1">Add problems to populate the exam.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {problems.map((p, idx) => (
                                        <div key={p.id} onClick={()=>{setEditingProblem(p); setIsProblemModalOpen(true)}} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group">
                                            <div className="flex items-center gap-5">
                                                <span className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 font-mono group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">#{idx+1}</span>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-base mb-1.5">{p.title}</h4>
                                                    <div className="flex gap-3 text-[10px] text-gray-500 font-bold uppercase">
                                                        <span className={`px-2 py-1 rounded-lg border ${p.problemType === 'MULTIPLE' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-100 border-gray-200'}`}>{p.problemType === 'MULTIPLE' ? 'AI / Complex' : p.problemType}</span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">{p.marks} Pts</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={(e)=>{e.stopPropagation(); deleteProblem(p.id)}} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
                    {step === 2 ? <button onClick={()=>setStep(1)} className="text-sm font-bold text-gray-500 flex items-center gap-2 hover:text-gray-900 transition-colors"><ArrowLeft size={16}/> Back</button> : <div/>}
                    
                    {step === 1 ? (
                        <button onClick={handleNext} className="px-10 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-3 hover:bg-black transition-colors shadow-lg active:scale-95 ml-auto">Next: Content <ArrowRight size={16}/></button>
                    ) : (
                        <div className="flex gap-4 ml-auto">
                            <button 
                                onClick={() => handleFinalSubmit('Draft')} 
                                disabled={submittingAction !== null} 
                                className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingAction === 'Draft' ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save as Draft
                            </button>
                            <button 
                                onClick={() => handleFinalSubmit('Published')} 
                                disabled={submittingAction !== null} 
                                className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingAction === 'Published' ? <Loader2 className="animate-spin" size={18}/> : initialData ? <RefreshCw size={18}/> : <Send size={18}/>} 
                                {initialData ? 'Update/Publish Exam' : 'Publish Exam'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ProblemEditorModal isOpen={isProblemModalOpen} onClose={()=>setIsProblemModalOpen(false)} onSave={saveProblem} initialData={editingProblem} />
        </div>
    );
};

// --- MAIN PAGE ---
const FacultyContestPage = () => {
    const { user } = useAuth();
    const [categorizedExams, setCategorizedExams] = useState({ all: [], published: [], drafts: [], myExams: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Live'); 
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [statusModal, setStatusModal] = useState(null);
    const [editingContest, setEditingContest] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    // DELETE STATE
    const [deleteConfirmation, setDeleteConfirmation] = useState({ id: null, title: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { 
        if (user) fetchContests(); 
        setTimeout(() => setAnimate(true), 100);
    }, [user]);

    const fetchContests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/get-all-exams`, {credentials: 'include'});
            const data = await res.json();
            if(data.success) {
                setCategorizedExams({
                    all: data.data.all || [],
                    published: data.data.published || [],
                    drafts: data.data.drafts || [],
                    myExams: data.data.myExams || []
                });
            }
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCreate = () => { setEditingContest(null); setIsWizardOpen(true); };
    
    const handleEdit = async (summaryContest) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/get-exam-details/${summaryContest.examId}`, { credentials: 'include' });
            const response = await res.json();
            
            if (response.success) {
                const detailedData = response.data;
                const mappedProblems = detailedData.problems.map(p => ({
                    id: p._id || Date.now() + Math.random(), 
                    title: p.title, 
                    description: p.description, 
                    inputFormat: p.inputFormat, 
                    outputFormat: p.outputFormat,
                    problemType: p.problemType, 
                    marks: p.marks, 
                    difficulty: p.difficulty, 
                    timeAllocated: p.timeAllocated || 30, 
                    constraints: p.constraints || '', 
                    maxConstraints: { 
                        n: p.maxConstraints?.maxN || 100, 
                        minVal: p.maxConstraints?.minValue || 1, 
                        maxVal: p.maxConstraints?.maxValue || 1000, 
                        charset: p.maxConstraints?.charset || 'abcdefghijklmnopqrstuvwxyz' 
                    },
                    testCases: (p.testCases || []).filter(tc => tc.isPublic),
                    referenceSolution: p.referenceSolution?.code || '',
                    solutionLanguage: ID_TO_LANGUAGE[p.referenceSolution?.languageId] || 'python'
                }));

                setEditingContest({ ...detailedData, problems: mappedProblems });
                setIsWizardOpen(true);
            } else { 
                setStatusModal({ type: 'error', message: 'Failed to fetch assessment details.' }); 
            }
        } catch (e) { 
            setStatusModal({ type: 'error', message: 'Network error occurred.' }); 
        } finally { 
            setLoading(false); 
        }
    };

    const confirmDelete = (examId, examName) => {
        setDeleteConfirmation({ id: examId, title: examName });
    };

    const handleDeleteExam = async () => {
        if (!deleteConfirmation.id) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/faculty/delete-exam`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId: deleteConfirmation.id }), 
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setStatusModal({ type: 'success', message: 'Exam deleted successfully' });
                fetchContests();
            } else {
                setStatusModal({ type: 'error', message: data.message });
            }
        } catch (e) {
            setStatusModal({ type: 'error', message: 'Network error occurred' });
        } finally {
            setIsDeleting(false);
            setDeleteConfirmation({ id: null, title: '' });
        }
    };

    const handleDownloadReport = async (examId) => {
        setDownloadingId(examId);
        try {
            const res = await fetch(`${API_URL}/api/faculty/reports/exam-report?examId=${examId}`, { credentials: 'include' });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${examId}_Report.pdf`; 
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else { setStatusModal({ type: 'error', message: 'Failed to download report.' }); }
        } catch (e) { setStatusModal({ type: 'error', message: 'Network error.' }); } finally { setDownloadingId(null); }
    };

    const getFilteredContests = () => {
        switch(activeTab) {
            case 'Live': return categorizedExams.all.filter(c => {
                const now = new Date();
                return now >= new Date(c.startTime) && now <= new Date(c.endTime);
            });
            case 'Published': return categorizedExams.published;
            case 'Drafts': return categorizedExams.drafts;
            case 'My Drafts & Published': return categorizedExams.myExams;
            default: return categorizedExams.all;
        }
    };

    const filteredContests = getFilteredContests();

    if (!user) return null;
    if (loading && categorizedExams.all.length === 0) return <Loader />;

    return (
        <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
            <ContestWizardModal isOpen={isWizardOpen} onClose={()=>setIsWizardOpen(false)} onSuccess={(s) => { setStatusModal(s); if (s.type === 'success') fetchContests(); }} initialData={editingContest} />
            
            <DeleteConfirmationModal 
                isOpen={!!deleteConfirmation.id} 
                onClose={() => setDeleteConfirmation({ id: null, title: '' })} 
                onConfirm={handleDeleteExam} 
                examName={deleteConfirmation.title} 
                isDeleting={isDeleting}
            />

            {statusModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={()=>setStatusModal(null)}>
                    <div className="bg-white p-10 rounded-[2rem] shadow-2xl text-center max-w-md border border-gray-100" onClick={e=>e.stopPropagation()}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm ${statusModal.type==='success'?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-600'}`}>
                            {statusModal.type==='success'?<CheckCircle size={40}/>:<AlertTriangle size={40}/>}
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{statusModal.type==='success'?'Success':'Action Failed'}</h3>
                        <p className="text-gray-500 mb-8 text-base font-medium leading-relaxed">{statusModal.message}</p>
                        <button onClick={()=>setStatusModal(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 text-sm">Continue</button>
                    </div>
                </div>
            )}

            <div className="bg-[#0F172A] pb-32 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="px-6 pt-6 relative z-10 w-full max-w-[95rem] mx-auto">
                    <Header animate={animate} />
                    <div className="mt-8 mb-6">
                        <SectionHeader title="Contest Management" animate={animate} delay={200} />
                        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="flex flex-wrap gap-3">
                                {['Live', 'Published', 'Drafts', 'My Drafts & Published'].map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-xl scale-105' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}>
                                        {activeTab === tab && <CheckCircle size={14} className="text-blue-600"/>}{tab}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleCreate} className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-bold text-base flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-105 transition-all transform w-full md:w-auto justify-center">
                                <Plus size={20} strokeWidth={3} /> Create Contest
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="px-4 -mt-24 relative z-20 w-full max-w-[95rem] mx-auto">
                <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContests.length > 0 ? (
                            filteredContests.map((c, i) => {
                                const status = calculateStatus(c);
                                return (
                                    <div key={c._id || i} className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300 flex flex-col hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-2 ${status === 'Live' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status}</span>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => {e.stopPropagation(); handleDownloadReport(c.examId)}} disabled={downloadingId === c.examId} title="Download Report" className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-gray-200">{downloadingId === c.examId ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}</button>
                                                <button onClick={(e) => {e.stopPropagation(); handleEdit(c)}} title="Modify Contest" className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200"><Edit3 size={14}/></button>
                                                <button onClick={(e) => {e.stopPropagation(); confirmDelete(c.examId, c.examName)}} title="Delete Exam" className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                        <div className="mb-auto">
                                            <div className="flex items-center gap-2 mb-2"><Code2 size={16} className="text-blue-500"/><span className="text-xs font-bold text-gray-400 font-mono tracking-wider">{c.examId}</span></div>
                                            <h4 className="text-lg font-extrabold text-gray-900 mb-2 leading-tight transition-colors line-clamp-2">{c.examName}</h4>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Layers size={12}/> Sem {c.semester}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-6">
                                            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p><p className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {new Date(c.startTime).toLocaleDateString()}</p></div>
                                            <div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p><p className="text-sm font-bold text-gray-700 flex items-center justify-end gap-1.5"><Timer size={14} className="text-gray-400"/> {formatDuration(c.startTime, c.endTime)}</p></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Terminal size={24} className="text-gray-300 mb-4"/>
                                <h4 className="font-bold text-base text-gray-600">No {activeTab} Challenges</h4>
                                {activeTab !== 'My Drafts & Published' && <button onClick={handleCreate} className="mt-2 text-blue-600 font-bold text-xs hover:underline">Create New Challenge</button>}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultyContestPage;