import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Trophy, Search, Calendar, Clock, Layers, 
    ArrowLeft, ArrowRight, Loader2, Plus, X, Globe,
    Trash2, Edit3, Send, Eye, MoreVertical, 
    CheckCircle, AlertCircle, Timer, Hash,
    Users, Code2, LayoutList, CalendarClock,
    Terminal, Settings, Info, ChevronDown, AlertTriangle, 
    Type, FileText, Save, RefreshCw, Download, FileBarChart,
    Cpu, PenTool, Variable, Box
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

// Main Problem Types (For Manual Mode)
const PROBLEM_TYPES = [
    'ARRAY_INT', 'ARRAY_STR', 'ARRAY_CHAR', 'STRING', 
    'CHAR', 'MATRIX', 'TREE', 'GRAPH', 'SINGLE_INT'
];

// Data Types for AI Input Configuration (Readable Labels)
const DATA_TYPES_AI = [
    { value: 'SINGLE_INT', label: 'Single Integer' },
    { value: 'STRING', label: 'String' },
    { value: 'ARRAY_INT', label: 'Array (Integer)' },
    { value: 'ARRAY_STR', label: 'Array (String)' },
    { value: 'MATRIX', label: 'Matrix' },
    { value: 'TREE', label: 'Tree' },
    { value: 'GRAPH', label: 'Graph' }
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
    const [generalError, setGeneralError] = useState(null);
    const [constraintMode, setConstraintMode] = useState('MANUAL'); // 'MANUAL' or 'CUSTOM' (AI)
    
    const [problem, setProblem] = useState({
        id: Date.now(),
        title: '', description: '', inputFormat: '', outputFormat: '',
        problemType: 'ARRAY_INT', marks: 10, difficulty: 'Medium', timeAllocated: 20,
        constraints: '', 
        maxConstraints: { n: 100, minVal: 1, maxVal: 1000, charset: 'abcdefghijklmnopqrstuvwxyz', aiInputs: [] },
        testCases: [{ input: '', output: '', explanation: '', isPublic: true }],
        referenceSolution: '', solutionLanguage: 'python'
    });

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setGeneralError(null);
            if (initialData) {
                setProblem(initialData);
                // Determine mode logic: Multi-input or explicit 'MULTIPLE' type defaults to Custom/AI
                if (initialData.problemType === 'MULTIPLE' || (initialData.maxConstraints?.aiInputs?.length > 0) || (initialData.constraints && initialData.constraints.length > 50)) {
                    setConstraintMode('CUSTOM');
                } else {
                    setConstraintMode('MANUAL');
                }
            } else {
                setProblem({
                    id: Date.now(),
                    title: '', description: '', inputFormat: '', outputFormat: '',
                    problemType: 'ARRAY_INT', marks: 10, difficulty: 'Medium', timeAllocated: 20,
                    constraints: '',
                    maxConstraints: { n: 100, minVal: 1, maxVal: 1000, charset: 'abcdefghijklmnopqrstuvwxyz', aiInputs: [] },
                    testCases: [{ input: '', output: '', explanation: '', isPublic: true }],
                    referenceSolution: '', solutionLanguage: 'python'
                });
                setConstraintMode('MANUAL');
            }
            setActiveTab('statement');
        }
    }, [isOpen, initialData]);

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

    // --- AI INPUT HANDLERS ---
    const handleAiInputCountChange = (count) => {
        const newCount = Math.max(1, Math.min(10, parseInt(count) || 1));
        const currentInputs = problem.maxConstraints.aiInputs || [];
        
        let newInputs = [...currentInputs];
        if (newInputs.length < newCount) {
            const toAdd = newCount - newInputs.length;
            for(let i=0; i<toAdd; i++) {
                newInputs.push({ type: 'SINGLE_INT', name: `Input ${newInputs.length + 1}` });
            }
        } else if (newInputs.length > newCount) {
            newInputs = newInputs.slice(0, newCount);
        }
        
        handleConstraintChange('aiInputs', newInputs);
    };

    const updateAiInputType = (index, type) => {
        const newInputs = [...(problem.maxConstraints.aiInputs || [])];
        if(newInputs[index]) newInputs[index].type = type;
        handleConstraintChange('aiInputs', newInputs);
    };

    // Auto-generate constraints string in MANUAL mode
    useEffect(() => {
        if (constraintMode === 'MANUAL' && problem.problemType && problem.problemType !== 'MULTIPLE') {
            const config = CONSTRAINT_CONFIG[problem.problemType] || CONSTRAINT_CONFIG.ARRAY_INT;
            const c = problem.maxConstraints;
            let str = "";
            
            if (config.showN) str += `1 <= ${config.nLabel.replace(/\(N\)/g, 'N').trim()} <= ${c.n}`;
            if (config.showMinMax) {
                if (str) str += ", ";
                str += `${c.minVal} <= element <= ${c.maxVal}`;
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
            // In AI mode, we ensure the backend knows it's multiple/complex
            if (constraintMode === 'CUSTOM') {
                problem.problemType = 'MULTIPLE';
            }
            onSave(problem);
        } else {
            setGeneralError("Please complete all required fields.");
            if (errors.referenceSolution) setActiveTab('solution');
            else if (errors.constraints) setActiveTab('logic');
            else if (errors.testCases) setActiveTab('cases');
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
            <div className="bg-white w-full max-w-[95rem] h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Challenge' : 'New Challenge'}</h3>
                        <p className="text-sm text-gray-500 font-medium">Define problem details & cases.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">Save</button>
                    </div>
                </div>

                {generalError && (
                    <div className="bg-red-50 px-8 py-3 border-b border-red-100 flex items-center gap-2 text-sm font-bold text-red-600">
                        <AlertTriangle size={16}/> {generalError}
                    </div>
                )}

                {/* --- TOP GRID (Removed Data Type) --- */}
                <div className="px-8 py-6 grid grid-cols-12 gap-6 border-b border-gray-100 bg-gray-50/30 shrink-0">
                    <div className="col-span-6">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Title <span className="text-red-500">*</span></label>
                        <input value={problem.title} onChange={(e) => handleChange('title', e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`} placeholder="e.g. Number Sorting"/>
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
                    <TabBtn id="statement" label="1. Problem Statement" hasError={errors.description || errors.inputFormat || errors.outputFormat} />
                    <TabBtn id="cases" label="2. Test Cases (Public)" hasError={errors.testCases} />
                    <TabBtn id="logic" label="3. Logic & Constraints" hasError={errors.constraints} />
                    <TabBtn id="solution" label="4. Reference Solution" hasError={errors.referenceSolution} />
                </div>

                <div className="flex-grow overflow-y-auto p-8 bg-gray-50/50">
                    {/* --- TAB 1: STATEMENT --- */}
                    {activeTab === 'statement' && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><FileText size={14}/> Description <span className="text-red-500">*</span></label>
                                <textarea value={problem.description} onChange={(e) => handleChange('description', e.target.value)} className={`w-full h-64 p-4 border rounded-2xl text-sm leading-relaxed resize-none outline-none focus:ring-2 focus:ring-blue-50 transition-all ${errors.description ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 bg-white'}`} placeholder="Describe the task clearly..."/>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Input Instructions <span className="text-red-500">*</span></label>
                                    <textarea value={problem.inputFormat} onChange={(e) => handleChange('inputFormat', e.target.value)} className={`w-full h-32 p-4 border rounded-2xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-50 transition-all ${errors.inputFormat ? 'border-red-300' : 'border-gray-200 bg-white'}`} placeholder="e.g. The first line contains T..."/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Output Instructions <span className="text-red-500">*</span></label>
                                    <textarea value={problem.outputFormat} onChange={(e) => handleChange('outputFormat', e.target.value)} className={`w-full h-32 p-4 border rounded-2xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-50 transition-all ${errors.outputFormat ? 'border-red-300' : 'border-gray-200 bg-white'}`} placeholder="e.g. Print result on new line..."/>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: TEST CASES --- */}
                    {activeTab === 'cases' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-center mb-6">
                                <Info size={18} className="text-blue-600"/>
                                <p className="text-sm text-blue-700">Add sample/public cases here. <span className="font-bold">Hidden cases are generated automatically</span> based on constraints.</p>
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
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Input</label><textarea value={tc.input} onChange={e => {const n=[...problem.testCases]; n[idx].input=e.target.value; setProblem(p=>({...p, testCases:n}))}} className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"/></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Output</label><textarea value={tc.output} onChange={e => {const n=[...problem.testCases]; n[idx].output=e.target.value; setProblem(p=>({...p, testCases:n}))}} className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"/></div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100/50">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Explanation (Optional)</label>
                                            <textarea value={tc.explanation || ''} onChange={e => {const n=[...problem.testCases]; n[idx].explanation=e.target.value; setProblem(p=>({...p, testCases:n}))}} className="w-full h-16 p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6"><button onClick={() => setProblem(p => ({...p, testCases: [...p.testCases, {input:'', output:'', explanation:'', isPublic:true}]}))} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"><Plus size={16}/> Add Sample Case</button></div>
                        </div>
                    )}

                    {/* --- TAB 3: LOGIC & CONSTRAINTS --- */}
                    {activeTab === 'logic' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Settings size={16} className="text-gray-500"/> Constraint Configuration</h4>
                                </div>
                                
                                {/* 1. TOGGLE */}
                                <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 max-w-md">
                                    <button 
                                        onClick={() => setConstraintMode('MANUAL')} 
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${constraintMode === 'MANUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <PenTool size={14}/> Manual (Single)
                                    </button>
                                    <button 
                                        onClick={() => setConstraintMode('CUSTOM')} 
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${constraintMode === 'CUSTOM' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Cpu size={14}/> AI (Multiple/Complex)
                                    </button>
                                </div>

                                {/* 2. DYNAMIC CONFIGURATION AREA */}
                                <div className="mb-8">
                                    {constraintMode === 'MANUAL' ? (
                                        <div className="animate-in fade-in space-y-5">
                                            {/* MANUAL: SINGLE DATA TYPE */}
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Data Type</label>
                                                <div className="relative">
                                                    <select 
                                                        value={problem.problemType} 
                                                        onChange={(e) => {
                                                            handleChange('problemType', e.target.value);
                                                        }} 
                                                        className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                                                    >
                                                        {PROBLEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                                </div>
                                            </div>

                                            {/* MANUAL: N, MIN, MAX */}
                                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100/50 space-y-4">
                                                {config.showN && <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">{config.nLabel}</label><input type="number" value={problem.maxConstraints.n} onChange={e => handleConstraintChange('n', parseInt(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"/></div>}
                                                {config.showMinMax && <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">Min Value</label><input type="number" value={problem.maxConstraints.minVal} onChange={e => handleConstraintChange('minVal', parseInt(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"/></div>
                                                    <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">Max Value</label><input type="number" value={problem.maxConstraints.maxVal} onChange={e => handleConstraintChange('maxVal', parseInt(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"/></div>
                                                </div>}
                                                {config.showCharset && (
                                                    <div><label className="text-[10px] font-bold text-gray-700 block mb-1.5">Charset</label><input type="text" value={problem.maxConstraints.charset} onChange={e => handleConstraintChange('charset', e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono bg-white" placeholder="a-z"/></div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in space-y-6">
                                            {/* AI: NUMBER OF INPUTS */}
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Number of Input Variables</label>
                                                <div className="flex items-center gap-4">
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        max="10"
                                                        value={problem.maxConstraints.aiInputs?.length || 1} 
                                                        onChange={e => handleAiInputCountChange(e.target.value)} 
                                                        className="w-24 p-3 border border-gray-200 rounded-xl text-center font-bold text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                                    />
                                                    <span className="text-xs text-gray-400">Define how many separate inputs the solution takes.</span>
                                                </div>
                                            </div>

                                            {/* AI: SPACIOUS DATA TYPE SELECTION FOR EACH INPUT */}
                                            <div className="space-y-3">
                                                {(problem.maxConstraints.aiInputs || []).map((input, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-purple-200 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-700">Input Variable {idx + 1}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-1/2">
                                                            <div className="relative">
                                                                <select 
                                                                    value={input.type} 
                                                                    onChange={e => updateAiInputType(idx, e.target.value)} 
                                                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white cursor-pointer"
                                                                >
                                                                    {DATA_TYPES_AI.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                                                                </select>
                                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 3. VISIBLE CONSTRAINTS TEXT (ALWAYS AT BOTTOM) */}
                                <div className="pt-6 border-t border-gray-100">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block flex justify-between">
                                        <span>Visible Constraints Text <span className="text-red-500">*</span></span>
                                        {constraintMode === 'MANUAL' && <span className="text-blue-500 font-normal normal-case flex items-center gap-1"><CheckCircle size={10}/> Auto-generated</span>}
                                    </label>
                                    <textarea 
                                        value={problem.constraints} 
                                        onChange={(e) => handleChange('constraints', e.target.value)}
                                        readOnly={constraintMode === 'MANUAL'}
                                        className={`w-full h-32 p-4 border rounded-xl text-sm font-mono outline-none resize-none transition-all ${constraintMode === 'MANUAL' ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-purple-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 shadow-sm'}`}
                                        placeholder={constraintMode === 'CUSTOM' ? "1 <= T <= 100\n1 <= N <= 10^5\n..." : "Generated automatically..."}
                                    />
                                    {errors.constraints && <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1"><AlertCircle size={12}/> Constraint text is required.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 4: REFERENCE SOLUTION --- */}
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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        contestId: '', title: '', semester: '',
        date: new Date().toISOString().slice(0, 10),
        startTime: '10:00', endTime: '12:00', batches: []
    });

    const [problems, setProblems] = useState([]);
    const [editingProblem, setEditingProblem] = useState(null);
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [fetchingBatches, setFetchingBatches] = useState(false);
    const [noBatchesFound, setNoBatchesFound] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setErrors({});
            setNoBatchesFound(false);
            if (initialData) {
                let d = '', s = '', e = '';
                try {
                    const startObj = new Date(initialData.startTime);
                    const endObj = new Date(initialData.endTime);
                    d = startObj.toISOString().slice(0, 10);
                    s = startObj.getHours().toString().padStart(2, '0') + ':' + startObj.getMinutes().toString().padStart(2, '0');
                    e = endObj.getHours().toString().padStart(2, '0') + ':' + endObj.getMinutes().toString().padStart(2, '0');
                } catch(err){ console.error("Date parse error", err); }
                
                setFormData({
                    contestId: initialData.examId || '',
                    title: initialData.examName || '',
                    semester: initialData.semester || '', 
                    date: d || new Date().toISOString().slice(0, 10),
                    startTime: s || '10:00', endTime: e || '12:00',
                    batches: initialData.batches || []
                });
                
                setProblems(initialData.problems ? JSON.parse(JSON.stringify(initialData.problems)) : []);
                if (initialData.semester) handleSemesterChange(initialData.semester, false);
            } else {
                setFormData({ contestId: '', title: '', semester: '', date: new Date().toISOString().slice(0, 10), startTime: '10:00', endTime: '12:00', batches: [] });
                setProblems([]);
                setAvailableBatches([]);
            }
        }
    }, [isOpen, initialData]);

    const handleSemesterChange = async (sem, clearBatches = true) => {
        setFormData(prev => ({ ...prev, semester: sem, batches: clearBatches ? [] : prev.batches }));
        if (errors.semester) setErrors(p => ({...p, semester: null}));
        setNoBatchesFound(false); 
        if (!sem) return;
        setFetchingBatches(true);
        try {
            const res = await fetch(`${API_URL}/api/get-sem-info/${sem}`, { credentials: 'include' });
            if (res.status === 404) { setAvailableBatches([]); setNoBatchesFound(true); return; }
            const data = await res.json();
            setAvailableBatches(data.success && data.data ? data.data.batches : []);
        } catch (e) { console.error(e); setAvailableBatches([]); } finally { setFetchingBatches(false); }
    };

    const toggleBatch = (batch) => {
        setFormData(p => ({ ...p, batches: p.batches.includes(batch) ? p.batches.filter(b=>b!==batch) : [...p.batches, batch] }));
        if (errors.batches) setErrors(p => ({...p, batches: null}));
    };

    const handleStartTimeChange = (e) => {
        const newStart = e.target.value;
        if (!newStart) return;
        const [h, m] = newStart.split(':').map(Number);
        const endH = (h + 2) % 24;
        const newEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, startTime: newStart, endTime: newEnd }));
        if(errors.startTime) setErrors(p => ({...p, startTime: null}));
    };

    const handleIdChange = (e) => {
        const val = e.target.value.toUpperCase();
        // RESTRICTED TO ALPHANUMERIC AND MAX 6 CHARS (STRICTLY)
        if (/^[A-Z0-9]*$/.test(val) && val.length <= 6) {
             setFormData(prev => ({ ...prev, contestId: val }));
             if(errors.contestId) setErrors(p => ({...p, contestId: null}));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.contestId.trim()) newErrors.contestId = "ID Required";
        if (formData.contestId.length < 3) newErrors.contestId = "Min 3 chars";
        if (!formData.title.trim()) newErrors.title = "Name Required";
        if (!formData.semester) newErrors.semester = "Select Semester";
        if (formData.batches.length === 0) newErrors.batches = "Select Batches";
        if (!formData.date) newErrors.date = "Required";
        if (!formData.startTime) newErrors.startTime = "Required";
        if (!formData.endTime) newErrors.endTime = "Required";
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

        return {
            examId: formData.contestId,
            examName: formData.title,
            semester: formData.semester, 
            status: targetStatus, // Dynamic Status from Buttons
            generationMode: "AI", // Explicitly added as per requirement
            batches: formData.batches,
            startTime: startISO,
            endTime: endISO,
            problems: problems.map((p, i) => {
                const cleanedConstraints = { ...p.maxConstraints };
                if (!cleanedConstraints.charset) delete cleanedConstraints.charset;
                const refSol = {
                    languageId: LANGUAGE_MAP[p.solutionLanguage]?.id || 71,
                    code: p.referenceSolution
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
                    constraints: p.constraints, // Added visible constraints string
                    maxConstraints: cleanedConstraints, // Includes aiInputs
                    referenceSolution: refSol,
                    testCases: p.testCases 
                };
            })
        };
    };

    const handleFinalSubmit = async (targetStatus) => {
        if (problems.length === 0) {
            onSuccess({ type: 'error', message: 'Please add at least one problem.' });
            return;
        }
        setLoading(true);
        try {
            const payload = constructPayload(targetStatus);
            const isEdit = !!initialData;
            const endpoint = isEdit ? `${API_URL}/api/faculty/modify-exam` : `${API_URL}/api/create-exam`;
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
            } else { 
                throw new Error(data.message); 
            }
        } catch (e) { 
            onSuccess({ type: 'error', message: e.message }); 
        } finally { 
            setLoading(false); 
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[95rem] h-[92vh] flex flex-col overflow-hidden">
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                            <span className={initialData ? "text-blue-600" : "text-gray-400"}>{initialData ? 'Edit Mode' : 'Create Mode'}</span> <span className="text-gray-300">/</span> <span className={step===1 ? 'text-blue-600' : 'text-gray-400'}>Setup</span> <span className="text-gray-300">/</span> <span className={step===2 ? 'text-blue-600' : 'text-gray-400'}>Content</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{formData.title || 'Untitled Assessment'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-grow overflow-y-auto px-8 py-8 bg-gray-50/50">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Basic Details</h4>
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Code <span className="text-red-500">*</span></label><input value={formData.contestId} onChange={handleIdChange} disabled={!!initialData} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.contestId ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} ${initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} placeholder="6 CHARS"/></div>
                                    <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Title <span className="text-red-500">*</span></label><input value={formData.title} onChange={e=>{setFormData({...formData, title:e.target.value}); if(errors.title) setErrors({...errors, title:null})}} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`} placeholder="e.g. Midterm Programming Assessment"/></div>
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Date <span className="text-red-500">*</span></label><input type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 ${errors.date ? 'border-red-500' : 'border-gray-200'}`}/></div>
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Start <span className="text-red-500">*</span></label><input type="time" value={formData.startTime} onChange={handleStartTimeChange} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 ${errors.startTime ? 'border-red-500' : 'border-gray-200'}`}/></div>
                                    <div className="col-span-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">End <span className="text-red-500">*</span></label><input type="time" value={formData.endTime} onChange={e=>setFormData({...formData, endTime:e.target.value})} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 ${errors.endTime ? 'border-red-500' : 'border-gray-200'}`}/></div>
                                </div>
                            </div>
                            
                            <div className={`bg-white p-6 rounded-[1.5rem] border shadow-sm ${errors.semester || errors.batches ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'}`}>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Target Students</h4>
                                <div className="flex gap-3 mb-6 overflow-x-auto pb-1">{SEMESTER_OPTIONS.map(sem => (<button key={sem} onClick={()=>handleSemesterChange(sem)} className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all ${formData.semester===sem?'bg-slate-900 text-white shadow-md':'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{sem}</button>))}</div>
                                {formData.semester && (
                                    <div className="p-6 bg-slate-50 rounded-2xl flex flex-wrap gap-3 border border-slate-100 min-h-[80px] items-center">
                                            {fetchingBatches ? <div className="flex items-center gap-2 text-slate-400 text-sm font-medium"><Loader2 size={16} className="animate-spin"/> Syncing classes...</div> : 
                                             noBatchesFound ? <div className="flex items-center gap-2 text-gray-400 text-sm font-medium"><AlertCircle size={16} /> No classes found for Sem {formData.semester}.</div> : 
                                             availableBatches.length > 0 ? availableBatches.map(b => (
                                                <button key={b} onClick={()=>toggleBatch(b)} className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${formData.batches.includes(b)?'bg-blue-600 text-white border-blue-600 shadow-sm':'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                                                    {formData.batches.includes(b) ? <CheckCircle size={14} className="text-white"/> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"/>} {b}
                                                </button>
                                            )) : <span className="text-sm text-gray-400 italic">Select a semester above.</span>}
                                    </div>
                                )}
                                {(errors.semester || errors.batches) && <p className="text-xs text-red-500 font-bold mt-3 flex items-center gap-1.5"><AlertTriangle size={14}/> {errors.semester ? "Select semester." : "Select at least one class."}</p>}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div className="flex justify-between items-center">
                                <div><h3 className="text-lg font-bold text-gray-900">Challenges</h3><p className="text-xs text-gray-500 mt-0.5">Manage coding problems.</p></div>
                                <button onClick={()=>{setEditingProblem(null); setIsProblemModalOpen(true)}} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"><Plus size={16}/> Add Challenge</button>
                            </div>
                            
                            {problems.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[1.5rem] bg-white/50">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Code2 className="text-gray-400" size={32}/></div>
                                    <h4 className="text-gray-800 font-bold text-lg">No content yet</h4>
                                    <p className="text-gray-500 text-sm mt-1">Add at least one challenge.</p>
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
                                                        <span className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">{p.difficulty}</span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">{p.marks} Pts</span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">{p.timeAllocated} Mins</span>
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
                            <button onClick={() => handleFinalSubmit('Draft')} disabled={loading} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save as Draft
                            </button>
                            <button onClick={() => handleFinalSubmit('Published')} disabled={loading} className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <Loader2 className="animate-spin" size={18}/> : initialData ? <RefreshCw size={18}/> : <Send size={18}/>} 
                                {initialData ? 'Modify Contest' : 'Publish Assessment'}
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
    const navigate = useNavigate();
    
    // State to hold categorized exams
    const [categorizedExams, setCategorizedExams] = useState({
        all: [],
        published: [],
        drafts: [],
        myExams: []
    });
    
    const [loading, setLoading] = useState(true);
    // DEFAULT SHOW LIVE TAB
    const [activeTab, setActiveTab] = useState('Live'); 
    
    // Modal States
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [statusModal, setStatusModal] = useState(null);
    const [editingContest, setEditingContest] = useState(null);
    const [animate, setAnimate] = useState(false);

    // Track downloading state for specific exam IDs
    const [downloadingId, setDownloadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

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
                    timeAllocated: p.timeAllocated || 20, 
                    // MAP THE CONSTRAINTS STRING HERE
                    constraints: p.constraints || '', 
                    // MAP AI INPUTS AND OTHER CONSTRAINTS
                    maxConstraints: p.maxConstraints || { n: 100, minVal: 1, maxVal: 1000, charset: 'abcdefghijklmnopqrstuvwxyz', aiInputs: [] },
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

    const handleDeleteExam = async (examId) => {
        if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;

        setDeletingId(examId);
        try {
            const res = await fetch(`${API_URL}/api/faculty/delete-exam`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId: examId }), 
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                setStatusModal({ type: 'success', message: 'Exam deleted successfully' });
                fetchContests();
            } else {
                setStatusModal({ type: 'error', message: data.message || 'Failed to delete exam' });
            }
        } catch (e) {
            setStatusModal({ type: 'error', message: 'Network error occurred during deletion' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownloadReport = async (examId) => {
        setDownloadingId(examId);
        try {
            const res = await fetch(`${API_URL}/api/faculty/reports/exam-report?examId=${examId}`, {
                credentials: 'include'
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${examId}_Report.xlsx`; 
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                setStatusModal({ type: 'error', message: 'Failed to download report.' });
            }
        } catch (e) {
            setStatusModal({ type: 'error', message: 'Network error during download.' });
        } finally {
            setDownloadingId(null);
        }
    };

    // --- FILTER LOGIC FOR NEW TABS ---
    const getFilteredContests = () => {
        switch(activeTab) {
            case 'Live':
                return categorizedExams.all.filter(c => {
                    // Logic: Start Time <= Current Time <= End Time
                    const now = new Date();
                    const start = new Date(c.startTime);
                    const end = new Date(c.endTime);
                    return now >= start && now <= end;
                });
            case 'Published':
                return categorizedExams.published;
            case 'Drafts':
                return categorizedExams.drafts;
            case 'My Drafts & Published':
                return categorizedExams.myExams;
            default:
                return categorizedExams.all;
        }
    };

    const filteredContests = getFilteredContests();

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Live': return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
            case 'Upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Past': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200'; 
        }
    };

    if (!user) return null;
    if (loading && categorizedExams.all.length === 0) return <Loader />;

    return (
        <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
            <ContestWizardModal 
                isOpen={isWizardOpen} 
                onClose={()=>setIsWizardOpen(false)} 
                onSuccess={(s) => {
                    setStatusModal(s);
                    if (s.type === 'success') fetchContests();
                }} 
                initialData={editingContest} 
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
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-xl scale-105' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
                                    >
                                        {activeTab === tab && <CheckCircle size={14} className="text-blue-600"/>}
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleCreate} 
                                className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-bold text-base flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-105 transition-all transform w-full md:w-auto justify-center"
                            >
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
                                    <div 
                                        key={c._id || i} 
                                        className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300 flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            {/* Status Badge */}
                                            {activeTab === 'My Drafts & Published' ? (
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-2 ${c.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {c.status}
                                                </span>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-2 ${getStatusStyle(status)}`}>
                                                    {status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                                    {status}
                                                </span>
                                            )}
                                            
                                            {/* ACTION BUTTONS - ALWAYS VISIBLE, NO HOVER OPACITY */}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => {e.stopPropagation(); handleDownloadReport(c.examId)}} 
                                                    disabled={downloadingId === c.examId}
                                                    title="Download Report"
                                                    className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50 border border-gray-200"
                                                >
                                                    {downloadingId === c.examId ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}
                                                </button>

                                                <button 
                                                    onClick={(e) => {e.stopPropagation(); handleEdit(c)}} 
                                                    title="Modify Contest"
                                                    className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200"
                                                >
                                                    <Edit3 size={14}/>
                                                </button>

                                                <button 
                                                    onClick={(e) => {e.stopPropagation(); handleDeleteExam(c.examId)}}
                                                    disabled={deletingId === c.examId}
                                                    title="Delete Exam"
                                                    className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 border border-gray-200"
                                                >
                                                    {deletingId === c.examId ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-auto">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Code2 size={16} className="text-blue-500"/>
                                                <span className="text-xs font-bold text-gray-400 font-mono tracking-wider">{c.examId}</span>
                                            </div>
                                            <h4 className="text-lg font-extrabold text-gray-900 mb-2 leading-tight transition-colors line-clamp-2">
                                                {c.examName}
                                            </h4>
                                            
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                    <Layers size={12}/> Sem {c.semester}
                                                </span>
                                                <span className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                    <Users size={12}/> {c.batches?.length || 0} Batches
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                    <CalendarClock size={14} className="text-gray-400"/> {new Date(c.startTime).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                                <p className="text-sm font-bold text-gray-700 flex items-center justify-end gap-1.5">
                                                    <Timer size={14} className="text-gray-400"/> {formatDuration(c.startTime, c.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                    <Terminal size={24} className="text-gray-300"/>
                                </div>
                                <h4 className="font-bold text-base text-gray-600">No {activeTab} Challenges</h4>
                                <p className="text-xs text-gray-400 mt-1">There are no coding assessments in this category.</p>
                                {activeTab !== 'My Drafts & Published' && (
                                    <button onClick={handleCreate} className="mt-6 text-blue-600 font-bold text-xs hover:underline">Create New Challenge</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultyContestPage;