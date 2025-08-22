import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Search, Edit, Loader2, Check, AlertCircle, Users, ChevronDown, UserCheck, UserX, PlusCircle, Trash2, Briefcase, Camera, Building, BookOpen, KeyRound, ShieldQuestion, XCircle, Filter, BadgeCheck, CalendarCheck, AlertTriangle, FileUp, UserPlus, Code2 } from 'lucide-react';
import Header from '../components/Header';


// --- Section Header Component ---
const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div>
        <h2 className="text-md lg:text-lg font-bold text-white">{title}</h2>
    </div>
);

// --- MOCK DATABASE & CONFIG for STUDENTS ---
const mockStudentDB = [
    { id: 1, rollno: "20BD1A0501", name: "Aarav Sharma", branch: "CSE", batch: "SKILLUP-2", handles: { leetcode: "aarav_s", gfg: "aarav_gfg", codechef: "aarav_cc", hackerank: "aarav_hr" } },
    { id: 2, rollno: "20BD1A0402", name: "Diya Patel", branch: "IT", batch: "SKILLNEXT-1", handles: { leetcode: "diya_p", gfg: "diya_gfg", codechef: "diya_cc", hackerank: "diya_hr" } },
    { id: 3, rollno: "20BD1A0203", name: "Rohan Gupta", branch: "ECE", batch: "SKILLBRIDGE-1", handles: { leetcode: "rohan_g", gfg: "rohan_gfg", codechef: "rohan_cc", hackerank: "rohan_hr" } },
    { id: 4, rollno: "21BD1A0564", name: "Priya Singh", branch: "CSE", batch: "SKILLUP-2", handles: { leetcode: "priya_s", gfg: "priya_gfg", codechef: "priya_cc", hackerank: "priya_hr" } },
    { id: 5, rollno: "21BD1A1205", name: "Vikram Kumar", branch: "MECH", batch: "SKILLUP-3", handles: { leetcode: "vikram_k", gfg: "vikram_gfg", codechef: "vikram_cc", hackerank: "vikram_hr" } },
];
const branches = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const batches = ["SKILLUP-1", "SKILLUP-2", "SKILLUP-3", "SKILLNEXT-1", "SKILLNEXT-2", "SKILLBRIDGE-1"];

// --- Helper & UI Components ---
const InfoTag = ({ icon, text, color }) => (<div className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-full border ${color}`}>{icon}<span>{text}</span></div>);
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, theme = 'danger' }) => {
    if (!isOpen) return null;
    const colors = {
        danger: { bg: 'bg-red-100', icon: <AlertTriangle className="h-6 w-6 text-red-600" />, button: 'bg-red-600 hover:bg-red-700' },
        warning: { bg: 'bg-yellow-100', icon: <ShieldQuestion className="h-6 w-6 text-yellow-600" />, button: 'bg-yellow-500 hover:bg-yellow-600' }
    };
    const selectedTheme = colors[theme];
    return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}><div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}><div className="flex items-start"><div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${selectedTheme.bg} mr-4`}>{selectedTheme.icon}</div><div><h3 className="text-lg font-bold text-slate-900">{title}</h3><p className="text-sm text-slate-600 mt-2">{message}</p></div></div><div className="flex justify-end gap-4 mt-6"><button onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Cancel</button><button onClick={onConfirm} className={`py-2 px-4 text-white rounded-lg font-semibold transition-colors ${selectedTheme.button}`}>{confirmText}</button></div></div></div>);
};

// --- 1. View All Students Component (ENHANCED) ---
const ViewAllStudents = ({ animate, onAction }) => {
    const [students, setStudents] = useState(mockStudentDB);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [batchFilter, setBatchFilter] = useState('All');
    const [studentToDelete, setStudentToDelete] = useState(null);

    const filteredStudents = React.useMemo(() => {
        return students
            .filter(s => branchFilter === 'All' || s.branch === branchFilter)
            .filter(s => batchFilter === 'All' || s.batch === batchFilter)
            .filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.rollno.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, branchFilter, batchFilter, students]);

    const handleDeleteConfirm = () => {
        if (studentToDelete) {
            setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
            setStudentToDelete(null); 
        }
    };

    return (
        <>
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Student Directory</h3>
                        <p className="text-sm text-gray-500 mt-1">{filteredStudents.length} student(s) found.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search by name or roll no..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div className="relative w-full sm:w-48">
                             <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm appearance-none">
                                <option value="All">All Branches</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-48">
                             <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm appearance-none">
                                <option value="All">All Batches</option>
                                {batches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="bg-white/70 rounded-2xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                <div className="p-5 flex-grow">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
                                            <p className="text-sm font-medium text-sky-600">{student.rollno}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200/80 flex flex-wrap gap-2">
                                        <InfoTag icon={<Briefcase size={12} />} text={student.branch} color="border-purple-200 bg-purple-50 text-purple-700" />
                                        <InfoTag icon={<Building size={12} />} text={student.batch} color="border-green-200 bg-green-50 text-green-700" />
                                    </div>
                                </div>
                                <div className="bg-gray-50/70 p-3 rounded-b-2xl flex justify-end gap-2">
                                    <button onClick={() => onAction('find', student)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"><Edit size={14} /> Edit</button>
                                    <button onClick={() => setStudentToDelete(student)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-100 hover:bg-red-200 transition-colors"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16"><XCircle className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-semibold text-gray-800">No Students Found</h3><p className="mt-1 text-sm text-gray-500">Your search and filter criteria did not match any student.</p></div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!studentToDelete}
                onClose={() => setStudentToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Student Deletion"
                message={`Are you absolutely sure you want to delete ${studentToDelete?.name} (${studentToDelete?.rollno})? This action cannot be undone.`}
                confirmText="Yes, Delete Student"
                theme="danger"
            />
        </>
    );
};


// --- 2. Add Student Component (Unchanged) ---
const AddStudentForm = ({ animate, onCancel }) => {
    const [addMode, setAddMode] = useState('solo'); // 'solo' or 'bulk'
    const initialStudentState = { rollno: "", name: "", branch: "CSE", batch: "SKILLUP-2", handles: { leetcode: "", gfg: "", codechef: "", hackerank: "" } };
    const [studentData, setStudentData] = useState(initialStudentState);
    const [csvFile, setCsvFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => { const { name, value } = e.target; setStudentData(prev => ({ ...prev, [name]: value })); };
    const handleHandleChange = (e) => { const { name, value } = e.target; setStudentData(prev => ({ ...prev, handles: { ...prev.handles, [name]: value } })); };
    const handleFileChange = (e) => { if (e.target.files.length > 0) { setCsvFile(e.target.files[0]); } };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (addMode === 'solo') {
            console.log("Submitting single student:", studentData);
            alert('Student added successfully! (Check console for data)');
        } else {
            if (csvFile) {
                console.log("Submitting CSV for bulk upload:", csvFile);
                alert('CSV submitted for processing! (Check console for file object)');
            } else {
                alert('Please select a CSV file to upload.');
                return;
            }
        }
        onCancel();
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
                    <button type="submit" className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"><Check size={18} /> Submit</button>
                </div>
            </form>
        </div>
    );
};

// --- 3. Find & Modify Student Component (Unchanged) ---
const ModifyStudentPanel = ({ animate, preloadedStudent, onCancel }) => {
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [student, setStudent] = useState(null);
    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    useEffect(() => { if (preloadedStudent) { setStudent(preloadedStudent); setSearchId(preloadedStudent.rollno); handleEdit(preloadedStudent); } }, [preloadedStudent]);
    
    const handleSearch = (e) => { e.preventDefault(); if (!searchId) return; setIsSearching(true); setStudent(null); setMessage(''); setTimeout(() => { const result = mockStudentDB.find(s => s.rollno.toLowerCase() === searchId.toLowerCase()); if (result) { setStudent(result); setEditData({...result, resetPassword: false }); } else { setMessage('Student with that Roll No. not found.'); } setIsSearching(false); }, 1000); };
    const handleEdit = (studentToEdit) => { if (studentToEdit) { setEditData({...studentToEdit, resetPassword: false }); setIsEditing(true); } };
    const handleUpdate = (e) => { e.preventDefault(); console.log("Updating with PATCH payload:", editData); setStudent(editData); setIsEditing(false); alert('Student updated successfully! (Check console for payload)'); onCancel(); };
    const handleDelete = () => { console.log("Deleting:", student.rollno); setShowDeleteModal(false); setStudent(null); alert(`Student ${student.name} has been deleted.`); onCancel(); };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Find & Modify Student</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button></div>
            
            {!student && (<div>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4"><input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Enter Student Roll No. to begin..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /><button type="submit" disabled={isSearching} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-5 rounded-lg text-sm flex items-center justify-center disabled:bg-gray-400 w-32">{isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search size={16} className="mr-2"/>Search</>}</button></form>
                {message && <p className="text-center text-sm font-semibold text-gray-600 my-4">{message}</p>}
            </div>)}
            
            {student && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 p-6 rounded-2xl border border-gray-200 sticky top-28 text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg mx-auto">{student.name.charAt(0)}</div>
                            <div className="mt-4">
                                <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                                <p className="font-semibold text-blue-700">{student.rollno}</p>
                            </div>
                            {!isEditing && (
                                <div className="mt-6 flex justify-center gap-2">
                                    <button onClick={() => handleEdit(student)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2"><Edit size={16}/> Edit Profile</button>
                                    <button onClick={() => setShowDeleteModal(true)} title="Delete" className="bg-red-100 hover:bg-red-200 text-red-700 p-2.5 rounded-lg"><UserX size={16}/></button>
                                </div>
                            )}
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
                                    <div><label className="text-xs font-semibold text-gray-600">LeetCode</label><input type="text" name="leetcode" value={editData.handles.leetcode} onChange={e => setEditData({...editData, handles: {...editData.handles, leetcode: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-600">GeeksForGeeks</label><input type="text" name="gfg" value={editData.handles.gfg} onChange={e => setEditData({...editData, handles: {...editData.handles, gfg: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-600">CodeChef</label><input type="text" name="codechef" value={editData.handles.codechef} onChange={e => setEditData({...editData, handles: {...editData.handles, codechef: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-600">HackerRank</label><input type="text" name="hackerank" value={editData.handles.hackerank} onChange={e => setEditData({...editData, handles: {...editData.handles, hackerank: e.target.value}})} className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                </div></fieldset>
                                <fieldset className="p-4 border border-red-300 rounded-lg bg-red-50/50"><legend className="text-sm font-bold text-red-700 px-2">Security</legend>
                                    <label className="flex items-center text-sm font-medium cursor-pointer"><input type="checkbox" checked={editData.resetPassword} onChange={e => setEditData({...editData, resetPassword: e.target.checked })} className="h-4 w-4 text-red-600 rounded focus:ring-red-500" /><span className="ml-2 text-red-700 flex items-center gap-2"><KeyRound size={16}/> Reset Password</span></label>
                                    <p className="text-xs text-red-600 mt-1 ml-6">Checking this box will reset the student's password to their Roll Number.</p>
                                </fieldset>
                                <div className="flex justify-end gap-4 mt-2"><button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg text-sm">Cancel</button><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm">Save Changes</button></div>
                            </form>
                        ) : ( <div className="text-gray-500 text-center py-10"><p>Click "Edit Profile" to modify this student's details.</p></div> )}
                    </div>
                </div>
            )}
            <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirm Deletion" message={`Are you sure you want to delete ${student?.name}? This action is permanent.`} confirmText="Yes, Delete" theme="danger" />
        </div>
    );
};

// --- Main Manage Student Page Component ---
const ManageStudentPage = () => {
    const [animate, setAnimate] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    const [preloadedStudent, setPreloadedStudent] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    const tabs = [
        { id: 'view', label: 'Directory', icon: <Users size={16} /> },
        { id: 'add', label: 'Onboard Students', icon: <UserCheck size={16} /> },
        { id: 'find', label: 'Find & Modify', icon: <Search size={16} /> },
    ];

    const handleAction = (tabId, data = null) => {
        setPreloadedStudent(data);
        setActiveTab(tabId);
    };

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[1.5rem] rounded-br-[1.5rem] sm:rounded-bl-[2rem] sm:rounded-br-[2rem] relative overflow-hidden shadow-2xl">
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
                    <ViewAllStudents animate={animate} onAction={handleAction} />
                </div>
                <div className={activeTab === 'add' ? 'block' : 'hidden'}>
                    <AddStudentForm animate={animate} onCancel={() => handleAction('view')} />
                </div>
                 <div className={activeTab === 'find' ? 'block' : 'hidden'}>
                    <ModifyStudentPanel animate={animate} preloadedStudent={preloadedStudent} onCancel={() => handleAction('view')} />
                </div>
            </main>
        </div>
    );
};

export default ManageStudentPage;