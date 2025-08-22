import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Search, Edit, Loader2, Check, AlertCircle, Users, ChevronDown, UserCheck, UserX, PlusCircle, Trash2, Briefcase, Camera, Building, BookOpen, KeyRound, ShieldQuestion, XCircle, Filter, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// Backend URL for API calls
const backendUrl = "https://iareattendancemgmt.onrender.com";

// --- Reusable Header Component ---
const Header = ({ animate }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userData, setUserData] = useState({ primary: '', secondary: '' });
    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        try { if (userRole === 'admin') { setUserData({ primary: 'Admin', secondary: 'Administrator' }); }
        } catch (error) { console.error("Failed to get user data from localStorage:", error); setUserData({ primary: 'Error', secondary: 'Data Error' }); }
    }, [userRole]);

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return {
            link: isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
            underline: isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        };
    };

    const handleLogout = () => {
        localStorage.clear(); sessionStorage.clear(); setIsMobileMenuOpen(false); navigate('/');
    };

    const navLinks = [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/leaderboard', label: 'Leaderboard' },
        { path: '/admin/timetable', label: 'Time Table' },
        { path: '/admin/attendance', label: 'Attendance' },
    ];
    const profilePath = '/admin/profile';

    return (
        <header className="text-white py-2 relative z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 sm:space-x-8">
                    <div className="lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-colors">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                    <div className={`flex items-center space-x-2 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
                        <Link to="/admin/dashboard" className="relative">
                            <span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CDC PORTAL</span>
                        </Link>
                    </div>
                    <nav className={`hidden lg:flex space-x-6 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
                        {navLinks.map((navLink) => (
                            <Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} relative group transition-all duration-300 hover:scale-105 text-sm`}>
                                {navLink.label}
                                <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass(navLink.path).underline} transition-transform duration-300`}></div>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className={`relative transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`} onClick={() => navigate(profilePath)}>
                        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden sm:block pr-2">
                                <p className="text-sm font-semibold text-white">{userData.primary}</p>
                                <p className="text-xs text-gray-300">{userData.secondary}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
                        <button onClick={handleLogout} className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-300 group" aria-label="Logout">
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
            <div className={`lg:hidden absolute top-full left-0 right-0 bg-gray-900/80 backdrop-blur-md mt-2 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <nav className="flex flex-col p-4">
                    {navLinks.map((navLink) => ( <Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}> {navLink.label} </Link> ))}
                    <div className="border-t border-white/20 my-2"></div>
                    <Link to={profilePath} className={`${getLinkClass(profilePath).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}>My Profile</Link>
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-400 w-full py-3 px-3 rounded-md hover:bg-red-500/10 text-center text-lg font-semibold">Logout</button>
                </nav>
            </div>
        </header>
    );
};

// --- Section Header Component ---
const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div>
        <h2 className="text-md lg:text-lg font-bold text-white">{title}</h2>
    </div>
);

// --- MOCK DATABASE & CONFIG ---
const mockFacultyDB = [
    { id: 1, facultyid: 'IARE10795', name: 'Dr. B Surekha Reddy', designation: 'Assistant Professor', subjects_assigned: ['CP', 'AWS'], batches_assigned: ['SKILLUP BATCH-2'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE10795_0.png' },
    { id: 2, facultyid: 'IARE10800', name: 'Mr. John Doe', designation: 'Associate Professor', subjects_assigned: ['JFS'], batches_assigned: ['SKILLNEXT BATCH-1', 'SKILLNEXT BATCH-3'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE10800_0.png' },
    { id: 3, facultyid: 'IARE10970', name: 'Dr. Jane Smith', designation: 'Professor', subjects_assigned: ['DBMS', 'JFS', 'CP'], batches_assigned: ['SKILLBRIDGE BATCH-1', 'SKILLBRIDGE BATCH-4'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE10970_0.png' },
    { id: 4, facultyid: 'IARE11234', name: 'Mr. Alex Ray', designation: 'Assistant Professor', subjects_assigned: ['DBMS'], batches_assigned: ['SKILLUP BATCH-1', 'SKILLUP BATCH-3'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE11234_0.png' },
    { id: 5, facultyid: 'IARE11555', name: 'Ms. Sarah Chen', designation: 'System Administrator', subjects_assigned: [], batches_assigned: ['SKILLBRIDGE BATCH-2'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE11555_0.png' },
    { id: 6, facultyid: 'IARE11667', name: 'Dr. Michael Brown', designation: 'Professor', subjects_assigned: ['AWS', 'DBMS'], batches_assigned: [], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE11667_0.png' },
    { id: 7, facultyid: 'IARE12001', name: 'Dr. Emily White', designation: 'Professor', subjects_assigned: ['CP', 'JFS'], batches_assigned: ['SKILLUP BATCH-3'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE12001_0.png' },
    { id: 8, facultyid: 'IARE12002', name: 'Mr. Chris Green', designation: 'Assistant Professor', subjects_assigned: ['AWS'], batches_assigned: ['SKILLBRIDGE BATCH-5'], profilePhoto: 'https://www.iare.ac.in/sites/default/files/IARE12002_0.png' },
];
const designations = ["Associate Professor", "Assistant Professor", "Professor", "System Administrator", "Software developer", "Programmer"];
const subjects = ["CP", "AWS", "DBMS", "JFS"];
const availableBatches = { "SKILLUP": ["1", "2", "3"], "SKILLNEXT": ["1", "2", "3"], "SKILLBRIDGE": ["1", "2", "3", "4", "5"] };

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

// --- ENHANCED Batch Selector ---
const BatchSelector = ({ selectedBatches, onBatchChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    
    useEffect(() => { const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);

    const handleBatchSelection = (program, batchNumber) => { const batchName = `${program} BATCH-${batchNumber}`; const newSelection = selectedBatches.includes(batchName) ? selectedBatches.filter(b => b !== batchName) : [...selectedBatches, batchName]; onBatchChange(newSelection); };
    
    const filteredBatches = Object.entries(availableBatches).map(([program, batches]) => {
        const filtered = batches.filter(batch => `${program} BATCH-${batch}`.toLowerCase().includes(searchTerm.toLowerCase()));
        return [program, filtered];
    }).filter(([, batches]) => batches.length > 0);

    const getButtonLabel = () => {
        if (selectedBatches.length === 0) return <span className="text-gray-500">Select batches...</span>;
        if (selectedBatches.length > 2) return `${selectedBatches.length} batches selected`;
        return selectedBatches.join(', ');
    };

    return (<div className="relative" ref={dropdownRef}><label className="text-sm font-semibold text-gray-700">Assign Batches</label><button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full p-2.5 mt-1 bg-white border border-gray-300 rounded-lg text-sm flex justify-between items-center text-left`}><span className="truncate pr-2">{getButtonLabel()}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && (<div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20 overscroll-contain">
        <div className="p-2 border-b border-gray-200"><div className="relative"><Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Search batches..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-1.5 pl-8 text-sm border-gray-300 rounded-md"/></div></div>
        <div className="max-h-48 overflow-y-auto">{filteredBatches.map(([program, batches]) => (<div key={program} className="p-2"><h4 className="font-semibold text-xs text-gray-700 px-2">{program}</h4><div className="grid grid-cols-3 gap-2 mt-1">{batches.map(batch => (<label key={batch} className="flex items-center text-sm text-gray-700 p-2 rounded-md hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={selectedBatches.includes(`${program} BATCH-${batch}`)} onChange={() => handleBatchSelection(program, batch)} className={`h-4 w-4 text-blue-600 rounded focus:ring-blue-500`} /><span className="ml-2">{batch}</span></label>))}</div></div>))}</div>
    </div>)}</div>);
};

// --- 1. View All Faculty Component (MINIMAL UI) ---
const ViewAllFaculty = ({ animate, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [designationFilter, setDesignationFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const filteredFaculty = React.useMemo(() => {
        return mockFacultyDB
            .filter(f => designationFilter === 'All' || f.designation === designationFilter)
            .filter(f =>
                f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.facultyid.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, designationFilter]);
    
    const paginatedFaculty = filteredFaculty.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredFaculty.length / ITEMS_PER_PAGE);

    return (
        <div className={`bg-slate-50 rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Faculty Directory</h3>
                    <p className="text-sm text-gray-500 mt-1">{filteredFaculty.length} member(s) found.</p>
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
                    <div className="relative w-full md:w-72">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="relative w-full md:w-56">
                        <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select value={designationFilter} onChange={e => {setDesignationFilter(e.target.value); setCurrentPage(1);}} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm appearance-none">
                            <option value="All">All Designations</option>
                            {designations.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {paginatedFaculty.length > 0 ? (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedFaculty.map(faculty => (
                        <div key={faculty.id} className="bg-white rounded-xl border border-gray-200/80 transition-shadow duration-300 hover:shadow-lg flex flex-col">
                            <div className="p-5 flex-grow flex flex-col">
                                <div className="flex items-start gap-4 mb-4">
                                    <img className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" src={faculty.profilePhoto} alt={faculty.name} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${faculty.name.replace(' ', '+')}&background=random&color=fff`; }} />
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-gray-800">{faculty.name}</h3>
                                        <p className="text-sm font-medium text-sky-600">{faculty.facultyid}</p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><Briefcase size={12} /> {faculty.designation}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-grow">
                                    <div className="min-h-[4rem]">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subjects</h4>
                                        <div className="flex flex-wrap gap-2">{faculty.subjects_assigned.length > 0 ? faculty.subjects_assigned.map(s => <InfoTag key={s} icon={<BookOpen size={12} />} text={s} color="border-purple-200 bg-purple-50 text-purple-700" />) : <p className="text-xs text-gray-500">No subjects assigned.</p>}</div>
                                    </div>
                                    <div className="min-h-[4rem]">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Batches</h4>
                                        <div className="flex flex-wrap gap-2">{faculty.batches_assigned.length > 0 ? faculty.batches_assigned.map(b => <InfoTag key={b} icon={<Building size={12} />} text={b} color="border-green-200 bg-green-50 text-green-700" />) : <p className="text-xs text-gray-500">No batches assigned.</p>}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50/70 p-3 mt-auto flex justify-end gap-2 rounded-b-xl">
                                <button onClick={() => onAction('find', faculty)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"><Edit size={14} /> Edit</button>
                                <button onClick={() => onAction('delete', faculty)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-100 hover:bg-red-200 transition-colors"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 enabled:hover:bg-gray-200"><ChevronLeft size={20}/></button>
                        <span className="text-sm font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 enabled:hover:bg-gray-200"><ChevronRight size={20}/></button>
                    </div>
                )}
                </>
            ) : (
                <div className="text-center py-16"><XCircle className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-semibold text-gray-800">No Faculty Found</h3><p className="mt-1 text-sm text-gray-500">Your search and filter criteria did not match any faculty.</p></div>
            )}
        </div>
    );
};

// --- 2. Add Faculty Component ---
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
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Onboard New Faculty</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button></div>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">{facultyList.map((faculty, index) => (
                    <div key={faculty.id} className="bg-white/70 p-4 rounded-xl border border-gray-200 relative">
                        <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-gray-700">Faculty Entry #{index + 1}</h4>{facultyList.length > 1 && (<button type="button" onClick={() => handleRemoveRow(faculty.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><Trash2 size={16} /></button>)}</div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm font-semibold text-gray-700">Faculty ID</label><input type="text" name="facultyid" value={faculty.facultyid} onChange={(e) => handleInputChange(faculty.id, e)} required className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                <div><label className="text-sm font-semibold text-gray-700">Full Name</label><input type="text" name="name" value={faculty.name} onChange={(e) => handleInputChange(faculty.id, e)} required className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                                <div className="md:col-span-2"><label className="text-sm font-semibold text-gray-700">Designation</label><select name="designation" value={faculty.designation} onChange={(e) => handleInputChange(faculty.id, e)} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{designations.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                            </div>
                            <div><label className="text-sm font-semibold text-gray-700">Assign Subjects</label><div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">{subjects.map(subject => (<label key={subject} className="flex items-center text-sm text-gray-700 font-medium"><input type="checkbox" checked={faculty.subjects_assigned.includes(subject)} onChange={() => handleSubjectChange(faculty.id, subject)} className="h-4 w-4 text-blue-600 rounded" /><span className="ml-2">{subject}</span></label>))}</div></div>
                            <div><BatchSelector selectedBatches={faculty.batches_assigned} onBatchChange={(batches) => handleBatchChange(faculty.id, batches)}/></div>
                        </div>
                    </div>
                ))}</div>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <button type="button" onClick={handleAddRow} disabled={facultyList.length >= 10} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"><PlusCircle size={18} /> Add Another Entry</button>
                    <button type="submit" className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"><Check size={18} /> Submit All</button>
                </div>
            </form>
        </div>
    );
};

// --- 3. Find & Modify Component ---
const ModifyFacultyPanel = ({ animate, preloadedFaculty, onCancel }) => {
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [faculty, setFaculty] = useState(null);
    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [updatePassword, setUpdatePassword] = useState(false);
    
    useEffect(() => { if (preloadedFaculty) { setFaculty(preloadedFaculty); setSearchId(preloadedFaculty.facultyid); handleEdit(preloadedFaculty); } }, [preloadedFaculty]);
    
    const handleSearch = (e) => { e.preventDefault(); if (!searchId) return; setIsSearching(true); setFaculty(null); setMessage(''); setTimeout(() => { const result = mockFacultyDB.find(f => f.facultyid.toLowerCase() === searchId.toLowerCase()); if (result) { setFaculty(result); setEditData(result); } else { setMessage('Faculty ID not found.'); } setIsSearching(false); }, 1000); };
    const handleEdit = (facultyToEdit) => { if (facultyToEdit) { setEditData(facultyToEdit); setIsEditing(true); setUpdatePassword(false); } };
    const handleUpdate = (e) => { e.preventDefault(); console.log("Updating with payload:", editData); if(updatePassword){ console.log("PASSWORD RESET REQUESTED!");} setFaculty(editData); setIsEditing(false); alert('Faculty updated successfully!'); onCancel(); };
    const handleDelete = () => { console.log("Deleting:", faculty.facultyid); setShowDeleteModal(false); setFaculty(null); alert(`Faculty ${faculty.name} has been deleted.`); onCancel(); };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Find & Modify Faculty</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><XCircle size={24}/></button></div>
            
            {!faculty && (<div>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4"><input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Enter Faculty ID to begin..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /><button type="submit" disabled={isSearching} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-5 rounded-lg text-sm flex items-center justify-center disabled:bg-gray-400 w-32">{isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search size={16} className="mr-2"/>Search</>}</button></form>
                {message && <p className="text-center text-sm font-semibold text-gray-600 my-4">{message}</p>}
            </div>)}
            
            {faculty && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 p-6 rounded-2xl border border-gray-200 sticky top-28">
                            <div className="relative w-24 h-24 mx-auto"><img src={faculty.profilePhoto} alt="Profile" className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover" /><div className="absolute bottom-0 right-0 p-2 bg-gray-200 rounded-full shadow-md"><Camera size={16} className="text-gray-600" /></div></div>
                            <div className="text-center mt-4">
                                <h2 className="text-xl font-bold text-gray-800">{faculty.name}</h2>
                                <p className="font-semibold text-blue-700">{faculty.facultyid}</p>
                                <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-2"><Briefcase size={16} className="text-gray-500"/>{faculty.designation}</p>
                            </div>
                            {!isEditing && (
                                <div className="mt-6 flex justify-center gap-2">
                                    <button onClick={() => handleEdit(faculty)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2"><Edit size={16}/> Edit Profile</button>
                                    <button onClick={() => setShowDeleteModal(true)} title="Delete" className="bg-red-100 hover:bg-red-200 text-red-700 p-2.5 rounded-lg"><UserX size={16}/></button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {isEditing && editData ? (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <fieldset className="p-4 border rounded-lg bg-white/50 border-gray-200"><legend className="text-sm font-bold text-gray-700 px-2">Profile Information</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"><div><label className="text-sm font-semibold text-gray-700">Faculty ID</label><input type="text" value={editData.facultyid} readOnly className="mt-1 w-full p-2.5 bg-gray-100 border-gray-300 rounded-lg text-sm cursor-not-allowed" /></div><div><label className="text-sm font-semibold text-gray-700">Name</label><input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /></div><div className="md:col-span-2"><label className="text-sm font-semibold text-gray-700">Designation</label><select value={editData.designation} onChange={e => setEditData({...editData, designation: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{designations.map(d => <option key={d} value={d}>{d}</option>)}</select></div></div></fieldset>
                                <fieldset className="p-4 border rounded-lg bg-white/50 border-gray-200"><legend className="text-sm font-bold text-gray-700 px-2">Academic Assignments</legend><div className="mt-2"><BatchSelector selectedBatches={editData.batches_assigned || []} onBatchChange={(batches) => setEditData({...editData, batches_assigned: batches})} /></div></fieldset>
                                <fieldset className="p-4 border rounded-lg bg-white/50 border-gray-200"><legend className="text-sm font-bold text-gray-700 px-2">Security</legend><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={updatePassword} onChange={(e) => setUpdatePassword(e.target.checked)} className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500" /> <span className="font-semibold text-gray-700">Reset Password</span></label>{updatePassword && (<div className="mt-3 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded-r-md"><p>On save, the password will be reset to the default: <strong className="font-mono">cdc@faculty_25</strong></p></div>)}</fieldset>
                                <div className="flex justify-end gap-4 mt-2"><button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg text-sm">Cancel</button><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm">Save Changes</button></div>
                            </form>
                        ) : ( <div className="text-gray-500 text-center py-10"><p>Click "Edit Profile" to modify this faculty member's details.</p></div> )}
                    </div>
                </div>
            )}
            <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirm Deletion" message={`Are you sure you want to delete ${faculty?.name}? This action is permanent.`} confirmText="Yes, Delete" theme="danger" />
        </div>
    );
};

// --- Main Manage Faculty Page Component ---
const ManageFacultyPage = () => {
    const [animate, setAnimate] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    const [preloadedFaculty, setPreloadedFaculty] = useState(null);
    const [facultyToDelete, setFacultyToDelete] = useState(null); // <-- State for delete modal

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    const tabs = [
        { id: 'view', label: 'Directory', icon: <Users size={16} /> },
        { id: 'add', label: 'Onboard Faculty', icon: <UserCheck size={16} /> },
        { id: 'find', label: 'Find & Modify', icon: <Search size={16} /> },
    ];

    // UPDATED: Handles 'delete' action separately to show modal
    const handleAction = (action, data = null) => {
        if (action === 'delete') {
            setFacultyToDelete(data);
        } else {
            setPreloadedFaculty(data);
            setActiveTab(action);
        }
    };

    const handleDeleteConfirm = () => {
        console.log("DELETING FACULTY:", facultyToDelete.facultyid);
        // Add actual deletion logic here (e.g., API call)
        alert(`Faculty ${facultyToDelete.name} has been deleted.`);
        setFacultyToDelete(null); // Close modal and reset state
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
                        <SectionHeader title="Faculty Management" animate={animate} delay={300} />
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
                    <ViewAllFaculty animate={animate} onAction={handleAction} />
                </div>
                <div className={activeTab === 'add' ? 'block' : 'hidden'}>
                    <AddFacultyForm animate={animate} onCancel={() => handleAction('view')} />
                </div>
                 <div className={activeTab === 'find' ? 'block' : 'hidden'}>
                    <ModifyFacultyPanel animate={animate} preloadedFaculty={preloadedFaculty} onCancel={() => handleAction('view')} />
                </div>
            </main>
            
            <ConfirmationModal
                isOpen={!!facultyToDelete}
                onClose={() => setFacultyToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete ${facultyToDelete?.name}? This action cannot be undone.`}
                confirmText="Yes, Delete"
                theme="danger"
            />
        </div>
    );
};

export default ManageFacultyPage;