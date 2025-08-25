import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    User, LogOut, Search, Edit, Loader2, Check, AlertCircle, Users, 
    ChevronDown, UserCheck, PlusCircle, Trash2, Briefcase, Building, 
    XCircle, Filter, FileUp, UserPlus, Code2, KeyRound, ChevronLeft, ChevronRight
} from 'lucide-react';
import Header from '../components/Header'; // Assuming Header is in a components folder

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api/Admin';
const branches = ["CSE", "CSE (AI&ML)", "CSE (CS)","CSE (DS)","IT", "ECE", "EEE", "MECH", "CIVIL"];
const batches = ["SKILLUP BATCH-1", "SKILLUP BATCH-2", "SKILLUP BATCH-3", "SKILLNEXT BATCH-1", "SKILLNEXT BATCH-2","SKILLNEXT BATCH-3", "SKILLBRIDGE BATCH-1","SKILLBRIDGE BATCH-2","SKILLBRIDGE BATCH-3","SKILLBRIDGE BATCH-4","SKILLBRIDGE BATCH-5"];

// --- HELPER & UI COMPONENTS ---

const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div>
        <h2 className="text-md lg:text-lg font-bold text-white">{title}</h2>
    </div>
);

const InfoTag = ({ icon, text, color }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-full border ${color}`}>
        {icon}
        <span>{text}</span>
    </div>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, icon, colorClass }) => {
    if (!isOpen) return null;
    const Icon = icon || AlertCircle;
    const color = colorClass || 'red';
    const colorStyles = {
        red: { iconContainer: 'bg-red-100', icon: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' },
        amber: { iconContainer: 'bg-amber-100', icon: 'text-amber-600', button: 'bg-amber-600 hover:bg-amber-700' },
        blue: { iconContainer: 'bg-blue-100', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' }
    };
    const styles = colorStyles[color] || colorStyles.red;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300" onClick={onClose}>
            {/* FIX: Removed 'scale-95' and 'opacity-0' to allow the animation to work correctly. */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full mr-4 ${styles.iconContainer}`}><Icon className={`h-6 w-6 ${styles.icon}`} /></div>
                    <div><h3 className="text-lg font-bold text-slate-900">{title}</h3><p className="text-sm text-slate-600 mt-2">{message}</p></div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                    <button type="button" onClick={onConfirm} className={`py-2 px-4 text-white rounded-lg font-semibold transition-colors ${styles.button}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};


const Toast = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const icons = { success: <Check size={20} />, error: <AlertCircle size={20} /> };
    const colors = { success: 'bg-green-600', error: 'bg-red-600' };
    useEffect(() => { const timer = setTimeout(onDismiss, 4000); return () => clearTimeout(timer); }, [onDismiss]);
    return (
        <div className={`fixed bottom-5 right-5 flex items-center gap-4 p-4 rounded-xl text-white shadow-2xl z-[150] animate-fade-in-up ${colors[type]}`}>
            {icons[type]} <p className="font-semibold">{message}</p> <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/20"><XCircle size={18} /></button>
        </div>
    );
};

const FilterDropdown = ({ options, value, onChange, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { setIsOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelect = (option) => { onChange(option); setIsOpen(false); };
    return (
        <div className="relative w-full sm:w-48" ref={dropdownRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-2.5 bg-white border border-gray-300 rounded-lg text-sm">
                <span className="flex items-center gap-2 text-gray-700"><Filter size={16} className="text-gray-400" />{value === 'All' ? title : value}</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {options.map((option) => ( <button key={option} type="button" onClick={() => handleSelect(option)} className={`w-full text-left p-2.5 text-sm hover:bg-gray-100 ${value === option ? 'font-semibold bg-gray-100 text-blue-600' : 'text-gray-800'}`}>{option === 'All' ? title : option}</button> ))}
                </div>
            )}
        </div>
    );
};

const StatusIndicator = ({ isLoading, error, hasNoResults }) => {
    if (isLoading) {
        return (
            <div className="text-center py-16 flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-sky-600 animate-spin" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">Fetching Student Records...</h3>
                <p className="mt-1 text-sm text-gray-500">Just a moment, we're gathering the data.</p>
            </div>
        );
    }
    if (error) {
        const friendlyMessage = (error.message.includes("Failed to fetch") || error.message.includes("Network"))
            ? "We couldn't connect to the server. Please check your internet connection and try again."
            : "An unexpected problem occurred. Please try again later.";
        return (
            <div className="text-center py-16 flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">Oops! Something went wrong.</h3>
                <p className="mt-1 text-sm text-gray-500">{friendlyMessage}</p>
            </div>
        );
    }
    if (hasNoResults) {
        return (
            <div className="text-center py-16 flex flex-col items-center">
                <XCircle className="h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-semibold text-gray-800">No Students Found</h3>
                <p className="mt-1 text-sm text-gray-500">Your search and filter settings didn't match any students.</p>
            </div>
        );
    }
    return null;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next <ChevronRight size={16} />
            </button>
        </div>
    );
};

// --- 1. VIEW ALL STUDENTS (Directory) ---
const ViewAllStudents = ({ animate, students, isLoading, error, onAction, onDelete, onResetPassword }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [batchFilter, setBatchFilter] = useState('All');
    const [studentToAction, setStudentToAction] = useState({ action: null, data: null });
    const [currentPage, setCurrentPage] = useState(1);
    const STUDENTS_PER_PAGE = 12;

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredStudents = React.useMemo(() => {
        if (!students) return [];
        setCurrentPage(1); 
        return students
            .filter(s => branchFilter === 'All' || s.branch === branchFilter)
            .filter(s => batchFilter === 'All' || s.batch === batchFilter)
            .filter(s =>
                s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                s.rollno.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
    }, [debouncedSearchTerm, branchFilter, batchFilter, students]);

    const handleConfirm = () => {
        if (!studentToAction.data) return;
        if (studentToAction.action === 'delete') onDelete(studentToAction.data.rollno);
        else if (studentToAction.action === 'resetPassword') onResetPassword(studentToAction.data.rollno);
        setStudentToAction({ action: null, data: null });
    };

    const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    const endIndex = startIndex + STUDENTS_PER_PAGE;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    const countText = () => {
        if (isLoading) return 'Loading...';
        if (error) return 'Data unavailable';
        const total = filteredStudents.length;
        if (total === 0) return '0 students found.';
        const startNum = startIndex + 1;
        const endNum = Math.min(endIndex, total);
        return `Showing ${startNum}-${endNum} of ${total} students.`;
    };
    
    return (
        <>
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Student Directory</h3>
                        <p className="text-sm text-gray-500 mt-1">{countText()}</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input type="text" placeholder="Search by name or roll no..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <FilterDropdown options={['All', ...branches]} value={branchFilter} onChange={setBranchFilter} title="All Branches" />
                        <FilterDropdown options={['All', ...batches]} value={batchFilter} onChange={setBatchFilter} title="All Batches" />
                    </div>
                </div>

                <StatusIndicator 
                    isLoading={isLoading} 
                    error={error} 
                    hasNoResults={!isLoading && !error && paginatedStudents.length === 0}
                />
                
                {!isLoading && !error && paginatedStudents.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedStudents.map((student, index) => (
                                <div 
                                    key={student.rollno} 
                                    className="bg-white/70 rounded-2xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 opacity-0 animate-fade-in-up hover:shadow-lg hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="p-5 flex-grow">
                                        <div className="flex items-center gap-4">
                                            <img className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm" src={`https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${student.rollno}/${student.rollno}.jpg`} alt={student.name} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${student.name.replace(/ /g, '+')}&background=EBF4FF&color=0284C7&font-size=0.45&rounded=true`; }} />
                                            <div className="flex-grow"><h3 className="text-lg font-bold text-gray-800">{student.name}</h3><p className="text-sm font-medium text-sky-600">{student.rollno}</p></div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-200/80 flex flex-wrap gap-2">
                                            <InfoTag icon={<Briefcase size={12} />} text={student.branch} color="border-purple-200 bg-purple-50 text-purple-700" />
                                            <InfoTag icon={<Building size={12} />} text={student.batch} color="border-green-200 bg-green-50 text-green-700" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/70 p-3 rounded-b-2xl flex justify-end gap-2">
                                        <button onClick={() => setStudentToAction({ action: 'resetPassword', data: student })} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-amber-600 bg-amber-100 hover:bg-amber-200 transition-colors"><KeyRound size={14} /> Reset Pass</button>
                                        <button onClick={() => onAction('find', student)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"><Edit size={14} /> Edit</button>
                                        <button onClick={() => setStudentToAction({ action: 'delete', data: student })} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-100 hover:bg-red-200 transition-colors"><Trash2 size={14} /> Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
            
            <ConfirmationModal isOpen={studentToAction.action === 'delete'} onClose={() => setStudentToAction({ action: null, data: null })} onConfirm={handleConfirm} title="Confirm Student Deletion" message={`Are you sure you want to delete ${studentToAction.data?.name} (${studentToAction.data?.rollno})? This action cannot be undone.`} confirmText="Yes, Delete Student" icon={AlertCircle} colorClass="red" />
            <ConfirmationModal isOpen={studentToAction.action === 'resetPassword'} onClose={() => setStudentToAction({ action: null, data: null })} onConfirm={handleConfirm} title="Confirm Password Reset" message={`Are you sure you want to reset the password for ${studentToAction.data?.name} (${studentToAction.data?.rollno})? Their password will be set to their roll number.`} confirmText="Yes, Reset Password" icon={KeyRound} colorClass="amber" />
        </>
    );
};

// --- 2. ADD STUDENT ---
const AddStudentForm = ({ animate, onCancel, onStudentAdded }) => {
    const [addMode, setAddMode] = useState('solo');
    const initialStudentState = { rollno: "", name: "", branch: "CSE", batch: "SKILLUP BATCH-2", handles: { leetcode: "", gfg: "", codechef: "", hackerank: "" } };
    const [studentData, setStudentData] = useState(initialStudentState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleInputChange = (e) => { const { name, value } = e.target; setStudentData(prev => ({ ...prev, [name]: value })); };
    const handleHandleChange = (e) => { const { name, value } = e.target; setStudentData(prev => ({ ...prev, handles: { ...prev.handles, [name]: value } })); };
    const handleFileChange = (e) => { if (e.target.files.length > 0) { setCsvFile(e.target.files[0]); } };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (addMode === 'bulk') {
            onStudentAdded(false, 'Bulk upload is not yet available.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/addStudent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
                credentials: "include"
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            await response.json();
            onStudentAdded(true, 'Student added successfully!');
            onCancel();
        } catch (error) {
            onStudentAdded(false, 'Failed to add student. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Onboard New Students</h3>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button>
            </div>
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setAddMode('solo')} className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold -mb-px border-b-2 ${addMode === 'solo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><UserPlus size={16}/> Single Entry</button>
                <button onClick={() => setAddMode('bulk')} className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold -mb-px border-b-2 ${addMode === 'bulk' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><FileUp size={16}/> Bulk Upload via CSV</button>
            </div>
            <form onSubmit={handleSubmit}>
                {addMode === 'solo' ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-semibold text-gray-700">Roll Number</label><input type="text" name="rollno" value={studentData.rollno} onChange={handleInputChange} required className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" placeholder="e.g., 20BD1A0501" /></div>
                            <div><label className="text-sm font-semibold text-gray-700">Full Name</label><input type="text" name="name" value={studentData.name} onChange={handleInputChange} required className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" placeholder="e.g., John Doe" /></div>
                            <div><label className="text-sm font-semibold text-gray-700">Branch</label><select name="branch" value={studentData.branch} onChange={handleInputChange} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{branches.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                            <div><label className="text-sm font-semibold text-gray-700">Batch</label><select name="batch" value={studentData.batch} onChange={handleInputChange} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{batches.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                        </div>
                        <fieldset className="p-4 border rounded-lg bg-white/50 border-gray-200"><legend className="text-sm font-bold text-gray-700 px-2 flex items-center gap-2"><Code2 size={16} /> Coding Handles</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div><label className="text-xs font-semibold text-gray-600">LeetCode</label><input type="text" name="leetcode" value={studentData.handles.leetcode} onChange={handleHandleChange} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" placeholder="username" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">GeeksForGeeks</label><input type="text" name="gfg" value={studentData.handles.gfg} onChange={handleHandleChange} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" placeholder="username" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">CodeChef</label><input type="text" name="codechef" value={studentData.handles.codechef} onChange={handleHandleChange} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" placeholder="username" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">HackerRank</label><input type="text" name="hackerank" value={studentData.handles.hackerank} onChange={handleHandleChange} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" placeholder="username" /></div>
                        </div></fieldset>
                    </div>
                ) : (
                    <div className="text-center">
                        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <div onClick={() => fileInputRef.current.click()} className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-10 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 transition-colors">
                            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm font-semibold text-gray-600">{csvFile ? `Selected: ${csvFile.name}` : 'Click to upload a .CSV file'}</p>
                            <p className="mt-1 text-xs text-gray-500">CSV format: rollno, name, branch, batch, leetcode, gfg, codechef, hackerank</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200">
                    <button type="submit" disabled={isSubmitting} className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 w-32 disabled:bg-gray-400">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} /> Submit</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- 3. FIND & MODIFY STUDENT ---
const ReadOnlyInfo = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
);

const ModifyStudentPanel = ({ animate, preloadedStudent, onCancel, allStudents, onStudentUpdated, onStudentDeleted }) => {
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [student, setStudent] = useState(null);
    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    useEffect(() => {
        if (preloadedStudent) {
            setStudent(preloadedStudent);
            setSearchId(preloadedStudent.rollno);
            setIsEditing(false);
        } else {
            setStudent(null);
            setSearchId('');
            setIsEditing(false);
        }
    }, [preloadedStudent]);
    
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchId) return;
        setIsSearching(true);
        setStudent(null);
        setMessage('');
        setTimeout(() => {
            const result = allStudents.find(s => s.rollno.toLowerCase() === searchId.toLowerCase());
            if (result) {
                setStudent(result);
            } else {
                setMessage('A student with that Roll No. could not be found.');
            }
            setIsSearching(false);
        }, 500);
    };

    const handleEdit = (studentToEdit) => {
        if (studentToEdit) {
            setEditData({ ...studentToEdit, handles: { ...studentToEdit.handles } });
            setIsEditing(true);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const payload = { rollno: editData.rollno, ...editData };
        try {
            const response = await fetch(`${API_BASE_URL}/updateStudent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            await response.json();
            onStudentUpdated(true, 'Student details updated successfully!');
            onCancel();
        } catch (error) {
            onStudentUpdated(false, 'Failed to update student. Please try again.');
        }
    };

    const handleDelete = async () => {
        onStudentDeleted(student.rollno);
        setShowDeleteModal(false);
        onCancel();
    };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Find & Modify Student</h3>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button>
            </div>
            {!student && (
                <div>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Enter Student Roll No. to begin..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" />
                        <button type="submit" disabled={isSearching} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-5 rounded-lg text-sm flex items-center justify-center disabled:bg-gray-400 w-32">
                            {isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search size={16} className="mr-2"/>Search</>}
                        </button>
                    </form>
                    {message && <p className="text-center text-sm font-semibold text-gray-600 my-4">{message}</p>}
                </div>
            )}
            {student && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 p-6 rounded-2xl border border-gray-200 sticky top-28 text-center">
                            <img className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto" src={`https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${student.rollno}/${student.rollno}.jpg`} alt={student.name} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${student.name.replace(/ /g, '+')}&background=EBF4FF&color=0284C7&font-size=0.45&rounded=true&size=96`; }}/>
                            <div className="mt-4"><h2 className="text-xl font-bold text-gray-800">{student.name}</h2><p className="font-semibold text-blue-700">{student.rollno}</p></div>
                            <div className="mt-6 flex justify-center gap-2">
                                {!isEditing && <button onClick={() => handleEdit(student)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2"><Edit size={16}/> Edit Profile</button>}
                                <button onClick={() => setShowDeleteModal(true)} title="Delete" className="bg-red-100 hover:bg-red-200 text-red-700 p-2.5 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {isEditing && editData ? (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-sm font-semibold text-gray-700">Roll Number</label><input type="text" value={editData.rollno} readOnly className="mt-1 w-full p-2.5 bg-gray-100 border-gray-300 rounded-lg text-sm cursor-not-allowed" /></div>
                                    <div><label className="text-sm font-semibold text-gray-700">Name</label><input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-sm font-semibold text-gray-700">Branch</label><select value={editData.branch} onChange={e => setEditData({...editData, branch: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{branches.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                    <div><label className="text-sm font-semibold text-gray-700">Batch</label><select value={editData.batch} onChange={e => setEditData({...editData, batch: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{batches.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                </div>
                                <fieldset className="p-4 border rounded-lg bg-white/50 border-gray-200"><legend className="text-sm font-bold text-gray-700 px-2 flex items-center gap-2"><Code2 size={16}/> Coding Handles</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div><label className="text-xs font-semibold text-gray-600">LeetCode</label><input type="text" value={editData.handles.leetcode} onChange={e => setEditData({...editData, handles: {...editData.handles, leetcode: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-600">GeeksForGeeks</label><input type="text" value={editData.handles.gfg} onChange={e => setEditData({...editData, handles: {...editData.handles, gfg: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-600">CodeChef</label><input type="text" value={editData.handles.codechef} onChange={e => setEditData({...editData, handles: {...editData.handles, codechef: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-600">HackerRank</label><input type="text" value={editData.handles.hackerank} onChange={e => setEditData({...editData, handles: {...editData.handles, hackerank: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                </div></fieldset>
                                <div className="flex justify-end gap-4 mt-2"><button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg text-sm">Cancel</button><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm">Save Changes</button></div>
                            </form>
                        ) : (
                            <div className="space-y-6 bg-white/70 p-6 rounded-2xl border border-gray-200">
                                <div><h4 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-2">Academic Information</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"><ReadOnlyInfo label="Branch" value={student.branch} /><ReadOnlyInfo label="Batch" value={student.batch} /></div></div>
                                <div><h4 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-2">Coding Handles</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"><ReadOnlyInfo label="LeetCode" value={student.handles?.leetcode} /><ReadOnlyInfo label="GeeksForGeeks" value={student.handles?.gfg} /><ReadOnlyInfo label="CodeChef" value={student.handles?.codechef} /><ReadOnlyInfo label="HackerRank" value={student.handles?.hackerank} /></div></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirm Deletion" message={`Are you sure you want to delete ${student?.name}? This action is permanent.`} confirmText="Yes, Delete" icon={AlertCircle} colorClass="red" />
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const ManageStudentPage = () => {
    const [animate, setAnimate] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    const [preloadedStudent, setPreloadedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/getViewStudents`, {method: "GET", credentials: "include"});
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setStudents(data.AllStudents || []);
        } catch (err) {
            setError(err);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [fetchStudents]);

    const handleAction = (tabId, data = null) => {
        setPreloadedStudent(data);
        setActiveTab(tabId);
    };
    
    const showToast = (type, message) => setToast({ type, message });

    const handleStudentAdded = (success, message) => {
        showToast(success ? 'success' : 'error', message);
        if (success) {
            fetchStudents();
        }
    };

    const handleStudentUpdated = (success, message) => {
        showToast(success ? 'success' : 'error', message);
        if (success) {
            fetchStudents();
        }
    };

    const handleStudentDelete = async (rollno) => {
        try {
            const response = await fetch(`${API_BASE_URL}/deleteStudent`, {
                method: 'DELETE', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollno }),
                credentials: "include"
            });
            if (!response.ok) throw new Error('Failed to delete student.');
            await response.json();
            showToast('success', 'Student deleted successfully!');
            fetchStudents();
        } catch (err) {
            showToast('error', err.message);
        }
    };
    
    const handlePasswordReset = async (username) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ResetPassword`, {
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, role: 'student' }), 
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Could not reset password.' }));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }
            
            const result = await response.json();
            showToast('success', result.message || `Password for ${username} has been reset.`);
        } catch (err) {
            showToast('error', err.message);
        }
    };

    const tabs = [
        { id: 'view', label: 'Directory', icon: <Users size={16} /> },
        { id: 'add', label: 'Onboard Students', icon: <UserPlus size={16} /> },
        { id: 'find', label: 'Find & Modify', icon: <Search size={16} /> },
    ];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-slate-100 overflow-x-hidden">
            <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 pb-6 lg:pb-8 pt-2">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3"></div>
                    <section>
                        <SectionHeader title="Student Management" animate={animate} delay={300} />
                        <div className={`p-1.5 bg-white/10 backdrop-blur-sm rounded-xl inline-flex items-center gap-2 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleAction(tab.id, null)}
                                    className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-md' : 'text-white hover:bg-white/20'}`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </header>
            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
                <div className={activeTab === 'view' ? 'block' : 'hidden'}>
                    <ViewAllStudents 
                        animate={animate} 
                        students={students} 
                        isLoading={isLoading} 
                        error={error} 
                        onAction={handleAction} 
                        onDelete={handleStudentDelete}
                        onResetPassword={handlePasswordReset}
                    />
                </div>
                <div className={activeTab === 'add' ? 'block' : 'hidden'}>
                    <AddStudentForm 
                        animate={animate} 
                        onCancel={() => handleAction('view')}
                        onStudentAdded={handleStudentAdded}
                    />
                </div>
                <div className={activeTab === 'find' ? 'block' : 'hidden'}>
                    <ModifyStudentPanel 
                        animate={animate} 
                        preloadedStudent={preloadedStudent} 
                        onCancel={() => handleAction('view')}
                        allStudents={students}
                        onStudentUpdated={handleStudentUpdated}
                        onStudentDeleted={handleStudentDelete}
                    />
                </div>
            </main>
        </div>
    );
};

export default ManageStudentPage;