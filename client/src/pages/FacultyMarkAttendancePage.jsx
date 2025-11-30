import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Search, QrCode, Edit, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, Users, ChevronDown, UserX, ClipboardCheck } from 'lucide-react';
import Header from '../components/Header';

// --- CONFIGURATION & DATA ---
const backendUrl = import.meta.env.VITE_BASE_URL;
const courses = ["CP", "JFS", "DBS"];
const batches = [
    { value: "attendance_skillup-1", label: "Skillup-1" }, { value: "attendance_skillup-2", label: "Skillup-2" }, { value: "attendance_skillup-3", label: "Skillup-3" },
    { value: "attendance_skillnext-1", label: "Skillnext-1" }, { value: "attendance_skillnext-2", label: "Skillnext-2" }, { value: "attendance_skillnext-3", label: "Skillnext-3" },
    { value: "attendance_skillbridge-1", label: "Skillbridge-1" }, { value: "attendance_skillbridge-2", label: "Skillbridge-2" }, { value: "attendance_skillbridge-3", label: "Skillbridge-3" }, { value: "attendance_skillbridge-4", label: "Skillbridge-4" }, { value: "attendance_skillbridge-5", label: "Skillbridge-5" }, { value: "attendance_skillbridge-6", label: "Skillbridge-6" }
];

// const batches = [
//     { value: "attendance_skillup-1", label: "Skillup-1" },
//     { value: "attendance_skillnext-1", label: "Skillnext-1" }, { value: "attendance_skillnext-2", label: "Skillnext-2" }, ];

// --- HELPER COMPONENTS ---

const CustomSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={ref}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 mt-1 bg-white border border-gray-300 rounded-lg text-sm text-left flex justify-between items-center">
                <span className={selectedOption ? 'text-gray-800' : 'text-gray-500'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2">
                        <input type="text" placeholder="Search..." className="w-full p-2 border border-gray-200 rounded-md text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredOptions.map(option => (
                            <li key={option.value} onClick={() => { onChange(option.value); setIsOpen(false); setSearchTerm(''); }} className="p-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center justify-between">
                                {option.label}
                                {value === option.value && <Check size={16} className="text-blue-600" />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><ClipboardCheck size={20} /></div>
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
                <div className="flex justify-end gap-4 p-4 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={isSubmitting} className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 w-44 disabled:bg-blue-300">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MARK ATTENDANCE FORM LOGIC AND UI ---
const MarkAttendanceForm = ({ animate }) => {
    const initialFormState = { batch: '', course: '', date: new Date().toISOString().substring(0, 10) };
    const [formData, setFormData] = useState(initialFormState);
    const [students, setStudents] = useState([]);
    const [selection, setSelection] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [markMode, setMarkMode] = useState('present');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const resetForm = () => {
        setFormData(initialFormState);
        setStudents([]);
        setSelection([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    // --- BUG FIX: This useEffect now only resets the student list when the BATCH changes. ---
    useEffect(() => {
        if (students.length > 0) {
            setStudents([]);
            setSelection([]);
            setSearchTerm('');
            setMessage({ type: 'info', text: "Batch has changed. Please fetch the new student list." });
        }
    }, [formData.batch]);

    const handleFetchStudents = async (e) => {
        e.preventDefault();
        if (!formData.batch || !formData.course) {
            setMessage({ type: 'error', text: "Please select a batch and course." });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        setStudents([]);
        setSelection([]);
        setSearchTerm('');

        try {
            const res = await fetch(`${backendUrl}/api/Faculty/getStudentsByBatch/${formData.batch}`, { method: "GET", credentials: "include" });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            const fetchedRollNumbers = (data.students || []).filter(rollno => typeof rollno === 'string');
            fetchedRollNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            setStudents(fetchedRollNumbers);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || "Failed to fetch students." });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (rollNo) => {
        setSelection(prev => prev.includes(rollNo) ? prev.filter(r => r !== rollNo) : [...prev, rollNo]);
    };

    const filteredStudents = students.filter(rollNo =>
        rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelection(prevSelection => [...new Set([...prevSelection, ...filteredStudents])]);
        } else {
            setSelection(prevSelection => prevSelection.filter(s => !filteredStudents.includes(s)));
        }
    };
    
    const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selection.includes(s));

    const handlePreview = (e) => {
        e.preventDefault();
        if (selection.length === 0) {
            setMessage({ type: 'error', text: `Please select students to mark as ${markMode}.` });
            return;
        }
        setMessage({ type: '', text: '' });
        setIsPreviewOpen(true);
    };

    const handleSubmitAttendance = async () => {
        setSubmitting(true);
        const payload = {
            course: formData.course,
            students: selection,
            batch: formData.batch,
            date: formData.date,
            status: markMode
        };
        try {
            const response = await fetch(`${backendUrl}/api/Faculty/Mark-Session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `An error occurred. Status: ${response.status}`);
            }
            const batchLabel = batches.find(b => b.value === formData.batch)?.label || formData.batch;
            setMessage({
                type: 'success',
                text: `Success! Marked ${selection.length} students as ${markMode} for ${batchLabel}.`
            });
            setStudents([]);
            setSelection([]);
            setIsPreviewOpen(false);
            setTimeout(resetForm, 4000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to submit attendance.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Mark Session Attendance</h3>
                    <p className="text-sm text-gray-500 mt-1">Follow the steps to mark attendance for a session.</p>
                </div>
                <button onClick={resetForm} className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"><RefreshCw size={14} /> Reset Form</button>
            </div>

            <div className="p-4 border-2 border-dashed rounded-xl bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg">1</div>
                    <h4 className="text-lg font-bold text-gray-700">Session Setup</h4>
                </div>
                <form onSubmit={handleFetchStudents} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div><label className="text-xs font-semibold text-gray-600">Batch</label><CustomSelect options={batches} value={formData.batch} onChange={(value) => setFormData(p => ({ ...p, batch: value }))} placeholder="Select a Batch" /></div>
                    <div><label className="text-xs font-semibold text-gray-600">Course</label><CustomSelect options={courses.map(c => ({ value: c, label: c }))} value={formData.course} onChange={(value) => setFormData(p => ({ ...p, course: value }))} placeholder="Select a Course" /></div>
                    <div><label htmlFor="date-mark" className="text-xs font-semibold text-gray-600">Date</label><input type="date" id="date-mark" name="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} required className="w-full p-2.5 mt-1 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                    <button type="submit" disabled={loading || !formData.batch || !formData.course} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:bg-blue-300">{loading ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />} Get Students</button>
                </form>
            </div>
            
            {message.text && !isPreviewOpen && (<div className={`mt-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-800' : message.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />} {message.text}</div>)}
            {loading && <div className="text-center py-12"><Loader2 className="mx-auto h-10 w-10 text-blue-600 animate-spin" /><p className="mt-2 text-gray-600">Fetching Roster...</p></div>}

            {students.length > 0 && !loading && (
                <form onSubmit={handlePreview} className="mt-6 p-4 border-2 border-dashed rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg">2</div>
                        <h4 className="text-lg font-bold text-gray-700">Select Students</h4>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 p-3 bg-white rounded-lg border">
                        <div>
                            <p className="font-bold text-gray-800">Marking Mode</p>
                            <p className="text-sm text-gray-600">Choose whether to select presentees or absentees.</p>
                        </div>
                        <div className="flex items-center p-1 bg-gray-200 rounded-full">
                            <button type="button" onClick={() => setMarkMode('present')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${markMode === 'present' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>Mark Presentees</button>
                            <button type="button" onClick={() => setMarkMode('absent')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${markMode === 'absent' ? 'bg-white text-red-600 shadow' : 'text-gray-600'}`}>Mark Absentees</button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3 p-3 bg-white rounded-lg border">
                       <div className="relative w-full sm:w-auto">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search Roll No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Showing: <span className="font-bold">{filteredStudents.length}</span> of {students.length} | Selected: <span className="font-bold">{selection.length}</span></p>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setSelection([])} className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1.5 font-semibold"><UserX size={14} /> Deselect All</button>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={isAllFilteredSelected} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /> 
                               Select All Visible
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-2 p-2 bg-white border rounded-lg">
                        {filteredStudents.map(rollNo => {
                            const isSelected = selection.includes(rollNo);
                            const cardClasses = isSelected
                                ? (markMode === 'present'
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-red-500 bg-red-50 ring-2 ring-red-200')
                                : 'border-gray-200 bg-white hover:border-blue-400';
                            
                            return (
                                <div key={rollNo} onClick={() => handleCheckboxChange(rollNo)} className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between ${cardClasses}`}>
                                    <span className="font-mono font-semibold text-gray-800 text-sm">{rollNo}</span>
                                    <div className={`w-5 h-5 flex items-center justify-center rounded-full transition-all ${isSelected ? (markMode === 'present' ? 'bg-blue-600' : 'bg-red-600') : 'bg-gray-300'}`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" checked={isSelected} readOnly className="hidden" />
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md flex items-center gap-2">
                            Preview Attendance
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} onConfirm={handleSubmitAttendance} title="Confirm Attendance Submission" confirmText="Confirm & Submit" isSubmitting={submitting}>
                <div className="space-y-4">
                    {message.text && (<div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{message.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />} {message.text}</div>)}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Batch</p><p className="font-semibold text-gray-800">{batches.find(b => b.value === formData.batch)?.label}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Course</p><p className="font-semibold text-gray-800">{formData.course}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Date</p><p className="font-semibold text-gray-800">{formData.date}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Status to Mark</p><p className={`font-semibold capitalize ${markMode === 'present' ? 'text-green-600' : 'text-red-600'}`}>{markMode}</p></div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Selected Roll Numbers ({selection.length} Total):</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
                            {selection.map(rollNo => (
                                <span key={rollNo} className="text-xs font-mono bg-white text-gray-700 rounded px-2 py-1 text-center border">{rollNo}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </ConfirmationModal>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const FacultyMarkAttendancePage = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        sessionStorage.setItem("userRole", "faculty");
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full shadow-2xl relative">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 py-2">
                    <Header animate={animate} />
                </div>
            </header>
            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
                <MarkAttendanceForm animate={animate} />
            </main>
        </div>
    );
};

export default FacultyMarkAttendancePage;