import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, UserCog, Trash2, Search, User, LogOut, ChevronDown, Edit, UserX, AlertTriangle, KeyRound, Loader2, Building, BadgeCheck, BookOpen, ShieldQuestion, Camera, List, ChevronLeft, ChevronRight, XCircle, PlusCircle } from 'lucide-react';

// --- MOCK DATABASE & CONFIG ---
const mockFacultyDB = [
    { id: 1, facultyid: 'IARE10795', name: 'Dr. B Surekha Reddy', designation: 'Assistant Professor', subjects_assigned: ['CP', 'AWS'], batches_assigned: ['SKILLUP BATCH-2'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE10795_0.png' },
    { id: 2, facultyid: 'IARE10800', name: 'Mr. John Doe', designation: 'Associate Professor', subjects_assigned: ['JFS'], batches_assigned: ['SKILLNEXT BATCH-1', 'SKILLNEXT BATCH-3'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE10800_0.png' },
    { id: 3, facultyid: 'IARE10970', name: 'Dr. Jane Smith', designation: 'Professor', subjects_assigned: ['DBMS', 'JFS', 'CP'], batches_assigned: ['SKILLBRIDGE BATCH-1', 'SKILLBRIDGE BATCH-4'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE10970_0.png' },
    { id: 4, facultyid: 'IARE11234', name: 'Mr. Alex Ray', designation: 'Assistant Professor', subjects_assigned: ['DBMS'], batches_assigned: ['SKILLUP BATCH-1', 'SKILLUP BATCH-3'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE11234_0.png' },
    { id: 5, facultyid: 'IARE11555', name: 'Ms. Sarah Chen', designation: 'System Administrator', subjects_assigned: [], batches_assigned: ['SKILLBRIDGE BATCH-2'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE11555_0.png' },
    { id: 6, facultyid: 'IARE11667', name: 'Dr. Michael Brown', designation: 'Professor', subjects_assigned: ['AWS', 'DBMS'], batches_assigned: ['SKILLNEXT BATCH-2'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE11667_0.png' },
];
const designations = ["Associate Professor", "Assistant Professor", "Professor", "System Administrator", "Software developer", "Programmer"];
const subjects = ["CP", "AWS", "DBMS", "JFS"];

// --- Reusable Header Component ---
const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="text-white py-2 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-8"><Link to="/admin/dashboard" className="relative"><span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CDC PORTAL</span></Link></div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/20 cursor-pointer" onClick={() => navigate('/admin/profile')}><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"><User className="w-4 h-4 text-white" /></div><div className="hidden sm:block pr-2"><p className="text-sm font-semibold text-white">Admin</p><p className="text-xs text-gray-300">Administrator</p></div></div>
          <button onClick={() => navigate('/')} className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20" aria-label="Logout"><LogOut className="w-5 h-5 text-red-400" /></button>
        </div>
      </div>
    </header>
  );
};

// --- Helper & UI Components ---
const SectionHeader = ({ title }) => (<div className="flex items-center mb-4"><div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div><h2 className="text-md lg:text-lg font-bold text-white">{title}</h2></div>);
const Spinner = ({ text }) => (<div className="flex flex-col justify-center items-center py-20 gap-4"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /><p className="text-sm font-semibold text-gray-600">{text}</p></div>);
const InfoTag = ({ icon, text, color }) => (<div className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-full border ${color}`}>{icon}<span>{text}</span></div>);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, theme = 'danger' }) => {
    if (!isOpen) return null;
    const colors = {
        danger: { bg: 'bg-red-100', icon: <AlertTriangle className="h-6 w-6 text-red-600" />, button: 'bg-red-600 hover:bg-red-700' },
        warning: { bg: 'bg-yellow-100', icon: <ShieldQuestion className="h-6 w-6 text-yellow-600" />, button: 'bg-yellow-500 hover:bg-yellow-600' }
    };
    const selectedTheme = colors[theme];
    return (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}><div className="flex items-start"><div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${selectedTheme.bg} mr-4`}>{selectedTheme.icon}</div><div><h3 className="text-lg font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-600 mt-2">{message}</p></div></div><div className="flex justify-end gap-4 mt-6"><button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button><button onClick={onConfirm} className={`py-2 px-4 text-white rounded-lg font-semibold transition-colors ${selectedTheme.button}`}>{confirmText}</button></div></div></div>);
};

const BatchSelector = ({ selectedBatches, onBatchChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const availableBatches = { "SKILLUP": ["1", "2", "3"], "SKILLNEXT": ["1", "2", "3"], "SKILLBRIDGE": ["1", "2", "3", "4", "5"] };
    useEffect(() => { const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    const handleBatchSelection = (program, batchNumber) => { const batchName = `${program} BATCH-${batchNumber}`; const newSelection = selectedBatches.includes(batchName) ? selectedBatches.filter(b => b !== batchName) : [...selectedBatches, batchName]; onBatchChange(newSelection); };
    return (<div className="relative" ref={dropdownRef}><label className="text-xs font-semibold text-gray-600">Assign Batches</label><button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 mt-1 bg-white border border-black/30 rounded-lg text-sm flex justify-between items-center text-left"><span className="truncate pr-2">{selectedBatches.length > 0 ? selectedBatches.join(', ') : <span className="text-gray-500">Select Batches</span>}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && (<div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">{Object.entries(availableBatches).map(([program, batches]) => (<div key={program} className="p-2"><h4 className="font-semibold text-xs text-gray-700 px-2">{program}</h4><div className="grid grid-cols-3 gap-2 mt-1">{batches.map(batch => (<label key={batch} className="flex items-center text-sm text-gray-700 p-2 rounded-md hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={selectedBatches.includes(`${program} BATCH-${batch}`)} onChange={() => handleBatchSelection(program, batch)} className="h-4 w-4 text-blue-600 rounded" /><span className="ml-2">{batch}</span></label>))}</div></div>))}</div>)}</div>);
};

// --- Section 1: Add Faculty Panel ---
const AddFacultyForm = ({ animate, onCancel }) => {
    const initialFacultyState = { id: Date.now(), facultyid: '', name: '', designation: 'Assistant Professor', subjects_assigned: [], batches_assigned: [] };
    const [facultyList, setFacultyList] = useState([initialFacultyState]);
    const handleAddRow = () => { if (facultyList.length < 10) setFacultyList([...facultyList, { ...initialFacultyState, id: Date.now() }]); };
    const handleRemoveRow = (id) => { setFacultyList(facultyList.filter(faculty => faculty.id !== id)); };
    const handleInputChange = (id, event) => { const { name, value } = event.target; setFacultyList(facultyList.map(f => f.id === id ? { ...f, [name]: value } : f)); };
    const handleSubjectChange = (id, subject) => { setFacultyList(facultyList.map(f => f.id === id ? { ...f, subjects_assigned: f.subjects_assigned.includes(subject) ? f.subjects_assigned.filter(s => s !== subject) : [...f.subjects_assigned, subject] } : f)); };
    const handleBatchChange = (id, batches) => { setFacultyList(facultyList.map(f => f.id === id ? { ...f, batches_assigned: batches } : f)); };
    const handleSubmit = (e) => { e.preventDefault(); console.log("Submitting Faculty Data:", facultyList); alert('Faculty data submitted! (Check console)'); onCancel(); };

    return (
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="text-xl font-bold text-gray-800">Add New Faculty</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button></div>
            <form onSubmit={handleSubmit}><div className="space-y-6">{facultyList.map((faculty, index) => (
                <div key={faculty.id} className="bg-white/70 p-4 rounded-xl border border-gray-200 relative">
                    <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-gray-700">Faculty Entry #{index + 1}</h4>{facultyList.length > 1 && (<button type="button" onClick={() => handleRemoveRow(faculty.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>)}</div>
                    <div className="space-y-4">
                        <fieldset className="p-4 border rounded-lg bg-white/50"><legend className="text-sm font-bold text-gray-700 px-2">Profile Information</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"><div><label className="text-xs font-semibold text-gray-600 block mb-1">Faculty ID</label><input type="text" name="facultyid" value={faculty.facultyid} onChange={(e) => handleInputChange(faculty.id, e)} required className="w-full p-2.5 bg-white border border-black/30 rounded-lg text-sm" /></div><div><label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label><input type="text" name="name" value={faculty.name} onChange={(e) => handleInputChange(faculty.id, e)} required className="w-full p-2.5 bg-white border border-black/30 rounded-lg text-sm" /></div><div className="md:col-span-2"><label className="text-xs font-semibold text-gray-600 block mb-1">Designation</label><select name="designation" value={faculty.designation} onChange={(e) => handleInputChange(faculty.id, e)} className="w-full p-2.5 bg-white border border-black/30 rounded-lg text-sm">{designations.map(d => <option key={d} value={d}>{d}</option>)}</select></div></div></fieldset>
                        <fieldset className="p-4 border rounded-lg bg-white/50"><legend className="text-sm font-bold text-gray-700 px-2">Academic Assignments</legend><label className="text-xs font-semibold text-gray-600 block mb-2 pt-2">Assign Subjects</label><div className="flex flex-wrap gap-x-6 gap-y-2">{subjects.map(subject => (<label key={subject} className="flex items-center text-sm text-gray-700"><input type="checkbox" checked={faculty.subjects_assigned.includes(subject)} onChange={() => handleSubjectChange(faculty.id, subject)} className="h-4 w-4 text-blue-600 rounded" /><span className="ml-2">{subject}</span></label>))}</div></fieldset>
                        <fieldset className="p-4 border rounded-lg bg-white/50"><legend className="text-sm font-bold text-gray-700 px-2">Batch Assignments</legend><BatchSelector selectedBatches={faculty.batches_assigned} onBatchChange={(batches) => handleBatchChange(faculty.id, batches)} /></fieldset>
                    </div>
                </div>
            ))}</div><div className="flex items-center justify-between mt-6 pt-6 border-t">
                <button type="button" onClick={handleAddRow} disabled={facultyList.length >= 10} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"><PlusCircle size={18} /> Add Another</button>
                <ActionButton type="submit">Submit All</ActionButton>
            </div></form>
        </div>
    );
};

// --- Section 2: "View All Faculty" Panel ---
const AllFacultyView = ({ animate, onAction }) => {
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const filteredData = mockFacultyDB.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()) || f.facultyid.toLowerCase().includes(filter.toLowerCase()));
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (<div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 ${animate ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"><h3 className="text-xl font-bold text-gray-800">All Faculty Members ({mockFacultyDB.length})</h3><div className="relative w-full md:w-auto"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Filter by name or ID..." value={filter} onChange={e => {setFilter(e.target.value); setCurrentPage(1);}} className="w-full md:w-64 p-2 pl-10 bg-white border border-black/30 rounded-lg text-sm"/></div></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-200/60"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Designation</th><th className="px-6 py-3">Assignments</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
            <tbody>{paginatedData.map((faculty) => (<tr key={faculty.id} className="bg-white/70 border-b hover:bg-gray-100/50">
                <th className="px-6 py-4 font-medium text-gray-900 flex items-center gap-4"><img className="w-10 h-10 rounded-full object-cover" src={faculty.profilePhoto} alt={faculty.name} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${faculty.name.replace(' ', '+')}&background=random&color=fff`; }}/><div><div>{faculty.name}</div><div className="text-xs text-gray-500">{faculty.facultyid}</div></div></th>
                <td className="px-6 py-4">{faculty.designation}</td>
                <td className="px-6 py-4"><div className="flex flex-wrap gap-1.5">{faculty.subjects_assigned.map(s => <InfoTag key={s} icon={<BookOpen size={12}/>} text={s} color="border-purple-200 bg-purple-50 text-purple-700"/>)}{faculty.batches_assigned.map(b => <InfoTag key={b} icon={<Building size={12}/>} text={b} color="border-green-200 bg-green-50 text-green-700"/>)}</div></td>
                <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => onAction('update', faculty)} title="Edit" className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"><Edit size={16}/></button><button onClick={() => onAction('delete', faculty)} title="Delete" className="p-2 text-red-600 hover:bg-red-100 rounded-md"><Trash2 size={16}/></button></div></td>
            </tr>))}</tbody>
        </table></div>
        {totalPages > 1 && (<div className="flex justify-between items-center pt-4 mt-4 border-t"><span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span><div className="inline-flex items-center -space-x-px"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button></div></div>)}
    </div>);
};

// --- Section 3: "Find & Modify" Panel ---
const FacultyActionsPanel = ({ animate, action, preloadedFaculty, onActionSuccess, onCancel }) => {
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [faculty, setFaculty] = useState(null);
    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [updatePassword, setUpdatePassword] = useState(false);
    
    useEffect(() => { if (preloadedFaculty) { setFaculty(preloadedFaculty); setSearchId(preloadedFaculty.facultyid); if(action === 'update') handleEdit(); else if(action === 'delete') setShowDeleteModal(true); } }, [preloadedFaculty, action]);
    const handleSearch = (e) => { e.preventDefault(); if (!searchId) return; setIsSearching(true); setFaculty(null); setMessage(''); setTimeout(() => { const result = mockFacultyDB.find(f => f.facultyid.toLowerCase() === searchId.toLowerCase()); if (result) setFaculty(result); else setMessage('Faculty ID not found.'); setIsSearching(false); }, 1000); };
    const handleEdit = () => { setEditData(faculty); setIsEditing(true); setUpdatePassword(false); };
    const handleUpdate = (e) => { e.preventDefault(); const payload = { ...editData }; if (updatePassword) payload.password = 'cdc@faculty_25'; console.log("Updating with payload:", payload); setFaculty(payload); setIsEditing(false); setMessage('Faculty details updated successfully!'); setTimeout(() => { onActionSuccess(); }, 1500); };
    const handleDelete = () => { console.log("Deleting:", faculty.facultyid); setShowDeleteModal(false); setFaculty(null); setMessage(`Faculty ${faculty.name} has been deleted.`); onActionSuccess(); };

    return (
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="text-xl font-bold text-gray-800">Find & Modify Faculty</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button></div>
            {!isEditing && (
                <div>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4"><input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Enter Faculty ID to begin..." className="w-full p-2.5 bg-white border border-black/30 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" /><button type="submit" disabled={isSearching} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-5 rounded-lg text-sm shadow-md flex items-center justify-center disabled:bg-gray-400 w-32">{isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search size={16} className="mr-2"/>Search</>}</button></form>
                    {message && <p className="text-center text-sm font-semibold text-gray-600 my-4">{message}</p>}
                    {isSearching && <Spinner text="Searching..." />}
                </div>
            )}
            {faculty && (
                <div className="mt-6 animate-fadeInUp">{isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6"><div className="p-4 border rounded-lg bg-white/50"><h4 className="text-md font-bold text-gray-700 mb-4">Profile Information</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-gray-600 block mb-1">Faculty ID</label><input type="text" value={editData.facultyid} readOnly className="w-full p-2.5 mt-1 bg-gray-100 border-gray-300 rounded-lg text-sm cursor-not-allowed" /></div><div><label className="text-xs font-semibold text-gray-600 block mb-1">Name</label><input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full p-2.5 mt-1 bg-white border border-black/30 rounded-lg text-sm" /></div><div className="md:col-span-2"><label className="text-xs font-semibold text-gray-600 block mb-1">Designation</label><select value={editData.designation} onChange={e => setEditData({...editData, designation: e.target.value})} className="w-full p-2.5 mt-1 bg-white border border-black/30 rounded-lg text-sm"> {designations.map(d => <option key={d} value={d}>{d}</option>)}</select></div></div></div><div className="p-4 border rounded-lg bg-white/50"><h4 className="text-md font-bold text-gray-700 mb-4">Academic Assignments</h4><label className="text-xs font-semibold text-gray-600 block mb-2">Subjects Assigned</label><div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">{subjects.map(subject => (<label key={subject} className="flex items-center text-sm text-gray-700"><input type="checkbox" checked={(editData.subjects_assigned || []).includes(subject)} onChange={() => { const subs = editData.subjects_assigned || []; setEditData({...editData, subjects_assigned: subs.includes(subject) ? subs.filter(s => s !== subject) : [...subs, subject]}) }} className="h-4 w-4 text-blue-600 rounded" /><span className="ml-2">{subject}</span></label>))}</div></div><div className="p-4 border rounded-lg bg-white/50"><h4 className="text-md font-bold text-gray-700 mb-4">Batch Assignments</h4><BatchSelector selectedBatches={editData.batches_assigned || []} onBatchChange={(batches) => setEditData({...editData, batches_assigned: batches})} /></div><div className="p-4 border rounded-lg bg-white/50"><h4 className="text-md font-bold text-gray-700 mb-4">Security</h4><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={updatePassword} onChange={(e) => setUpdatePassword(e.target.checked)} className="h-4 w-4 text-blue-600 rounded" /> <span className="font-semibold text-gray-700">Reset Password</span></label>{updatePassword && (<div className="mt-3 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm"><p>On save, the password will be reset to the default: <strong className="font-mono">cdc@faculty_25</strong></p></div>)}</div><div className="flex justify-end gap-4 mt-2"><button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg text-sm">Cancel</button><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm">Save Changes</button></div></form>
                ) : (
                    <div className="bg-white/60 p-6 rounded-xl border border-gray-200"><div className="flex flex-col sm:flex-row items-start gap-6"><div className="relative"><img src={faculty.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${faculty.name.replace(' ', '+')}&background=random&color=fff`; }} /><div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-md"><Camera size={16} className="text-gray-600" /></div></div><div className="flex-grow"><div className="flex justify-between items-start"><div><h4 className="font-bold text-gray-900 text-2xl">{faculty.name}</h4><p className="font-semibold text-blue-700">{faculty.facultyid}</p><p className="text-sm text-gray-600 mt-1 flex items-center gap-2"><BadgeCheck size={16} className="text-gray-500"/>{faculty.designation}</p></div><div className="flex gap-2 flex-shrink-0"><button onClick={handleEdit} title="Edit" className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-full"><Edit size={16}/></button><button onClick={() => setShowDeleteModal(true)} title="Delete" className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full"><UserX size={16}/></button></div></div><div className="mt-4 pt-4 border-t"><h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Assignments</h5><div className="flex flex-wrap gap-2">{faculty.subjects_assigned.map(s => <InfoTag key={s} icon={<BookOpen size={12}/>} text={s} color="border-purple-200 bg-purple-50 text-purple-700"/>)}{faculty.batches_assigned.map(b => <InfoTag key={b} icon={<Building size={12}/>} text={b} color="border-green-200 bg-green-50 text-green-700"/>)}</div></div></div></div></div>
                )}</div>
            )}
            <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirm Deletion" message={`Are you sure you want to delete ${faculty?.name}? This action is permanent.`} confirmText="Yes, Delete" theme="danger" />
        </div>
    );
};

// --- Main Manage Faculty Page Component ---
const ManageFacultyPage = () => {
    const [animate, setAnimate] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [preloadedFaculty, setPreloadedFaculty] = useState(null);

    useEffect(() => { localStorage.setItem("userRole", "admin"); setTimeout(() => setAnimate(true), 100); }, []);

    const facultyActions = [
        { id: 'view_all', title: "View All Faculty", icon: <List className="w-8 h-8 text-indigo-600" /> },
        { id: 'add', title: "Add New Faculty", icon: <UserPlus className="w-8 h-8 text-green-600" /> },
        { id: 'find', title: "Find & Modify", icon: <UserCog className="w-8 h-8 text-blue-600" /> },
    ];
    
    const handleActionClick = (actionId, data = null) => {
        setIsLoadingAction(true);
        setActiveAction(null);
        setPreloadedFaculty(data);
        setTimeout(() => { setActiveAction(actionId); setIsLoadingAction(false); }, 400);
    };

    const renderActivePanel = () => {
        if (isLoadingAction) return <Spinner text="Loading Interface..." />;
        if (!activeAction) return <div className="text-center py-20 bg-white/60 rounded-2xl shadow-inner"><h3 className="font-bold text-lg text-gray-700">Welcome to Faculty Management</h3><p className="text-sm text-gray-500 mt-2">Please select an action above to begin.</p></div>;
        switch (activeAction) {
            case 'view_all': return <AllFacultyView animate={animate} onAction={(action, faculty) => handleActionClick(action, faculty)} />;
            case 'add': return <AddFacultyForm animate={animate} onCancel={() => setActiveAction(null)} />;
            case 'find': case 'update': case 'delete': return <FacultyActionsPanel animate={animate} action={activeAction} preloadedFaculty={preloadedFaculty} onActionSuccess={() => handleActionClick(null)} onCancel={() => setActiveAction(null)} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; translateY(0); } } .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }`}</style>
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden"><div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div><div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div></div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 pb-8 pt-2">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3"></div>
                    <section>
                        <SectionHeader title="Faculty Management" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {facultyActions.map((item) => (
                                <div key={item.id} onClick={() => handleActionClick(item.id)} className={`bg-white/10 backdrop-blur-md p-4 rounded-2xl text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 hover:bg-white/20 flex items-center gap-4 cursor-pointer ${activeAction === item.id ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-400' : 'border border-white/20'}`}>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">{item.icon}</div>
                                    <span className="font-semibold text-sm">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </header>
            <main className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="animate-fadeInUp">
                    {renderActivePanel()}
                </div>
            </main>
        </div>
    );
};

export default ManageFacultyPage;