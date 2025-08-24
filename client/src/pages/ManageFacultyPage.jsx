import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Search, Edit, Loader2, Check, AlertCircle, Users, ChevronDown, UserCheck, PlusCircle, Trash2, Briefcase, Camera, Building, BookOpen, KeyRound, ShieldQuestion, XCircle, Filter, ChevronLeft, ChevronRight, AlertTriangle, Mail, RefreshCcw } from 'lucide-react';

// --- Reusable Header Component ---
const Header = ({ animate }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userData, setUserData] = useState({ primary: '', secondary: '' });
    const userRole = localStorage.getItem("userRole");

    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
    useEffect(() => { try { if (userRole === 'admin') { setUserData({ primary: 'Admin', secondary: 'Administrator' }); } } catch (error) { console.error("Failed to get user data from localStorage:", error); setUserData({ primary: 'Error', secondary: 'Data Error' }); } }, [userRole]);

    const getLinkClass = (path) => ({
        link: location.pathname === path ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
        underline: location.pathname === path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
    });

    const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); setIsMobileMenuOpen(false); navigate('/'); };
    const navLinks = [{ path: '/admin/dashboard', label: 'Dashboard' }, { path: '/admin/leaderboard', label: 'Leaderboard' }, { path: '/admin/timetable', label: 'Time Table' }, { path: '/admin/attendance', label: 'Attendance' }];
    const profilePath = '/admin/profile';

    return (
        <header className="text-white py-2 relative z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 sm:space-x-8">
                    <div className="lg:hidden"><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus-outline-none p-2 rounded-md hover:bg-white/10 transition-colors">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button></div>
                    <div className={`flex items-center space-x-2 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}><Link to="/admin/dashboard" className="relative"><span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CDC PORTAL</span></Link></div>
                    <nav className={`hidden lg:flex space-x-6 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>{navLinks.map((navLink) => (<Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} relative group transition-all duration-300 hover:scale-105 text-sm`}>{navLink.label}<div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform ${getLinkClass(navLink.path).underline} transition-transform duration-300`}></div></Link>))}</nav>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className={`relative transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`} onClick={() => navigate(profilePath)}><div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300"><User className="w-4 h-4 text-white" /></div><div className="hidden sm:block pr-2"><p className="text-sm font-semibold text-white">{userData.primary}</p><p className="text-xs text-gray-300">{userData.secondary}</p></div></div></div>
                    <div className={`flex items-center transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}><button onClick={handleLogout} className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-300 group" aria-label="Logout"><LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" /></button></div>
                </div>
            </div>
            <div className={`lg:hidden absolute top-full left-0 right-0 bg-gray-900/80 backdrop-blur-md mt-2 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg shadow-xl ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}><nav className="flex flex-col p-4">{navLinks.map((navLink) => (<Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}> {navLink.label} </Link>))}<div className="border-t border-white/20 my-2"></div><Link to={profilePath} className={`${getLinkClass(profilePath).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}>My Profile</Link><button onClick={handleLogout} className="text-red-500 hover:text-red-400 w-full py-3 px-3 rounded-md hover:bg-red-500/10 text-center text-lg font-semibold">Logout</button></nav></div>
        </header>
    );
};

const SectionHeader = ({ title, animate, delay }) => (<div className={`flex items-center mb-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}><div className="w-1 h-5 bg-white/50 rounded-full mr-3"></div><h2 className="text-md lg:text-lg font-bold text-white">{title}</h2></div>);

// --- CONFIG & HELPERS ---
const API_BASE_URL = 'http://localhost:5000/api/Admin';
const subjects = ["CP", "AWS", "DBMS", "JFS"];
const availableBatches = { "SKILLUP": ["1", "2", "3"], "SKILLNEXT": ["1", "2", "3"], "SKILLBRIDGE": ["1", "2", "3", "4", "5"] };

// --- UI COMPONENTS ---
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
const Toast = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const icons = { success: <Check size={20} />, error: <AlertCircle size={20} /> };
    const colors = { success: 'bg-green-600', error: 'bg-red-600' };
    useEffect(() => { const timer = setTimeout(onDismiss, 4000); return () => clearTimeout(timer); }, [onDismiss]);
    return (<div className={`fixed bottom-5 right-5 flex items-center gap-4 p-4 rounded-xl text-white shadow-2xl z-[150] animate-fade-in-up ${colors[type]}`}> {icons[type]}<p className="font-semibold">{message}</p><button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/20" aria-label="Dismiss"><XCircle size={18} /></button></div>);
};
const StatusIndicator = ({ isLoading, error, hasNoResults }) => {
    if (isLoading) return (<div className="text-center py-16 flex flex-col items-center"><Loader2 className="h-12 w-12 text-sky-600 animate-spin" /><h3 className="mt-4 text-lg font-semibold text-gray-800">Fetching Faculty Records...</h3><p className="mt-1 text-sm text-gray-500">Just a moment, we're gathering the data.</p></div>);
    if (error) {
        const friendlyMessage = (error.message.includes("fetch")) ? "Could not connect to the server. Please check your internet and try again." : "An unexpected problem occurred. Please try again later.";
        return (<div className="text-center py-16 flex flex-col items-center"><AlertCircle className="h-12 w-12 text-red-500" /><h3 className="mt-4 text-lg font-semibold text-gray-800">Oops! Something went wrong.</h3><p className="mt-1 text-sm text-gray-500">{friendlyMessage}</p></div>);
    }
    if (hasNoResults) return (<div className="text-center py-16 flex flex-col items-center"><XCircle className="h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-semibold text-gray-800">No Faculty Found</h3><p className="mt-1 text-sm text-gray-500">Your search and filter settings didn't match any faculty.</p></div>);
    return null;
};
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={16} /> Previous</button>
            <span className="text-sm font-medium text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next <ChevronRight size={16} /></button>
        </div>
    );
};
const BatchSelector = ({ selectedBatches, onBatchChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => { const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    const handleBatchSelection = (program, batchNumber) => { const batchName = `${program} BATCH-${batchNumber}`; const newSelection = selectedBatches.includes(batchName) ? selectedBatches.filter(b => b !== batchName) : [...selectedBatches, batchName]; onBatchChange(newSelection); };
    const getButtonLabel = () => { if (selectedBatches.length === 0) return <span className="text-gray-500">Select batches...</span>; if (selectedBatches.length > 2) return `${selectedBatches.length} batches selected`; return selectedBatches.join(', '); };
    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-semibold text-gray-700">Assign Batches</label>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full p-2.5 mt-1 bg-white border border-gray-300 rounded-lg text-sm flex justify-between items-center text-left`}>
                <span className="truncate pr-2">{getButtonLabel()}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-30">
                    <div className="max-h-56 overflow-y-auto p-2">
                        {Object.entries(availableBatches).map(([program, batches]) => (
                            <div key={program} className="p-2">
                                <h4 className="font-semibold text-xs text-gray-700 px-2">{program}</h4>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {batches.map(batch => (
                                        <label key={batch} className="flex items-center text-sm text-gray-700 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <input type="checkbox" checked={selectedBatches.includes(`${program} BATCH-${batch}`)} onChange={() => handleBatchSelection(program, batch)} className={`h-4 w-4 text-blue-600 rounded focus:ring-blue-500`} />
                                            <span className="ml-2">{batch}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
const DisplayTags = ({ items, icon, color, limit = 3 }) => {
    if (!items || items.length === 0) {
        return <p className="text-xs text-gray-500">Not assigned.</p>;
    }
    const displayedItems = items.slice(0, limit);
    const hiddenItemsCount = items.length - limit;
    return (
        <div className="flex flex-wrap gap-2 items-center">
            {displayedItems.map(item => <InfoTag key={item} icon={icon} text={item} color={color} />)}
            {hiddenItemsCount > 0 && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 py-1 px-2 rounded-full">
                    +{hiddenItemsCount} more
                </span>
            )}
        </div>
    );
};

// --- 1. View All Faculty Component ---
const ViewAllFaculty = ({ animate, facultyList, isLoading, error, onAction, designations }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [designationFilter, setDesignationFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const filteredFaculty = useMemo(() => {
        if (!facultyList) return [];
        return facultyList
            .filter(f => designationFilter === 'All' || f.designation === designationFilter)
            .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.facultyid.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, designationFilter, facultyList]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, designationFilter]);

    const totalPages = Math.ceil(filteredFaculty.length / ITEMS_PER_PAGE);
    const paginatedFaculty = filteredFaculty.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const areFiltersActive = searchTerm !== '' || designationFilter !== 'All';

    return (
        <div className={`bg-slate-50 rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div><h3 className="text-xl font-bold text-gray-800">Faculty Directory</h3><p className="text-sm text-gray-500 mt-1">{!isLoading && !error ? `${filteredFaculty.length} member(s) found.` : 'Loading...'}</p></div>
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
                    <div className="relative w-full md:w-64"><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                    <div className="relative w-full md:w-52"><Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><select value={designationFilter} onChange={e => setDesignationFilter(e.target.value)} className="w-full p-2.5 pl-10 bg-white border border-gray-300 rounded-lg text-sm appearance-none"><option value="All">All Designations</option>{designations.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    {areFiltersActive && <button onClick={() => { setSearchTerm(''); setDesignationFilter('All');}} className="p-2.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-lg transition-colors" aria-label="Clear filters"><RefreshCcw size={18} /></button>}
                </div>
            </div>
            <StatusIndicator isLoading={isLoading} error={error} hasNoResults={!isLoading && !error && paginatedFaculty.length === 0} />
            {!isLoading && !error && paginatedFaculty.length > 0 && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {paginatedFaculty.map((faculty, index) => (
                            <div key={faculty.facultyid} className="bg-white rounded-xl border border-gray-200/80 transition-shadow duration-300 hover:shadow-xl flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex items-start gap-4 mb-4">
                                        <img className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" src={`https://www.iare.ac.in/sites/default/files/${faculty.facultyid}_0.png` || `https://ui-avatars.com/api/?name=${faculty.name.replace(' ', '+')}&background=random&color=fff`} alt={faculty.name} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${faculty.name.replace(' ', '+')}&background=random&color=fff`; }} />
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-lg font-bold text-gray-800 truncate">{faculty.name}</h3>
                                            <p className="text-sm font-medium text-sky-600">{faculty.facultyid}</p>
                                            {faculty.email && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 break-all"><Mail size={12} /> {faculty.email}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-4 flex-grow">
                                        <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Designation</h4><InfoTag icon={<Briefcase size={12} />} text={faculty.designation} color="border-gray-200 bg-gray-50 text-gray-700" /></div>
                                        <div className="min-h-[4rem]"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subjects</h4><DisplayTags items={faculty.subjects_assigned} icon={<BookOpen size={12} />} color="border-purple-200 bg-purple-50 text-purple-700" /></div>
                                        <div className="min-h-[4rem]"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Batches</h4><DisplayTags items={faculty.batches_assigned} icon={<Building size={12} />} color="border-green-200 bg-green-50 text-green-700" /></div>
                                    </div>
                                </div>
                                <div className="bg-gray-50/70 p-3 mt-auto flex justify-end gap-2 rounded-b-xl">
                                    <button onClick={() => onAction('find', faculty)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"><Edit size={14} /> Modify</button>
                                    <button onClick={() => onAction('delete', faculty)} className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-100 hover:bg-red-200 transition-colors"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}
        </div>
    );
};

// --- 2. Add Faculty Component ---
const AddFacultyForm = ({ animate, onCancel, onFacultyAdded, allFaculty }) => {
    const initialFacultyState = { name: '', facultyid: '', email: '', designation: 'Assistant Professor', subjects_assigned: [], batches_assigned: [] };
    const [facultyData, setFacultyData] = useState(initialFacultyState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!facultyData.name.trim()) newErrors.name = "Full Name is required.";
        if (!facultyData.facultyid.trim()) {
            newErrors.facultyid = "Faculty ID is required.";
        } else if (allFaculty.some(f => f.facultyid.toLowerCase() === facultyData.facultyid.trim().toLowerCase())) {
            newErrors.facultyid = "This Faculty ID already exists.";
        }
        if (!facultyData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(facultyData.email)) {
            newErrors.email = "Email address is invalid.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleInputChange = (e) => { const { name, value } = e.target; setFacultyData(prev => ({ ...prev, [name]: value })); };
    const handleSubjectChange = (subject) => { setFacultyData(prev => ({ ...prev, subjects_assigned: prev.subjects_assigned.includes(subject) ? prev.subjects_assigned.filter(s => s !== subject) : [...prev.subjects_assigned, subject] })); };
    const handleBatchChange = (batches) => { setFacultyData(prev => ({ ...prev, batches_assigned: batches })); };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        await onFacultyAdded(facultyData);
        setIsSubmitting(false);
    };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Onboard New Faculty</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800" aria-label="Close form"><XCircle size={24}/></button></div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    <div><label className="text-sm font-semibold text-gray-700">Full Name</label><input type="text" name="name" value={facultyData.name} onChange={handleInputChange} className={`mt-1 w-full p-2.5 bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm`} /><p className="text-xs text-red-600 h-4 mt-1">{errors.name}</p></div>
                    <div><label className="text-sm font-semibold text-gray-700">Faculty ID</label><input type="text" name="facultyid" value={facultyData.facultyid} onChange={handleInputChange} className={`mt-1 w-full p-2.5 bg-white border ${errors.facultyid ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm`} /><p className="text-xs text-red-600 h-4 mt-1">{errors.facultyid}</p></div>
                    <div className="md:col-span-2"><label className="text-sm font-semibold text-gray-700">Email Address</label><input type="email" name="email" value={facultyData.email} onChange={handleInputChange} className={`mt-1 w-full p-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm`} /><p className="text-xs text-red-600 h-4 mt-1">{errors.email}</p></div>
                    <div className="md:col-span-2"><label className="text-sm font-semibold text-gray-700">Designation</label><select name="designation" value={facultyData.designation} onChange={handleInputChange} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{[...new Set(allFaculty.map(f => f.designation))].sort().map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                </div>
                <div><label className="text-sm font-semibold text-gray-700">Assign Subjects</label><div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">{subjects.map(subject => (<label key={subject} className="flex items-center text-sm text-gray-700 font-medium"><input type="checkbox" checked={facultyData.subjects_assigned.includes(subject)} onChange={() => handleSubjectChange(subject)} className="h-4 w-4 text-blue-600 rounded" /><span className="ml-2">{subject}</span></label>))}</div></div>
                <div><BatchSelector selectedBatches={facultyData.batches_assigned} onBatchChange={handleBatchChange}/></div>
                <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200">
                    <button type="submit" disabled={isSubmitting} className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 w-36 disabled:bg-gray-400">{isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} /> Add Faculty</>}</button>
                </div>
            </form>
        </div>
    );
};

// --- 3. Find & Modify Component ---
const ModifyFacultyPanel = ({ animate, preloadedFaculty, allFaculty, onCancel, onFacultyUpdated }) => {
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [faculty, setFaculty] = useState(null);
    const [editData, setEditData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    
    useEffect(() => { if (preloadedFaculty) { setFaculty(preloadedFaculty); setEditData(preloadedFaculty); } }, [preloadedFaculty]);
    
    const handleSearch = (e) => { e.preventDefault(); if (!searchId) return; setIsSearching(true); setMessage(''); setTimeout(() => { const result = allFaculty.find(f => f.facultyid.toLowerCase() === searchId.toLowerCase()); if (result) { setFaculty(result); setEditData(result); } else { setMessage('Faculty ID not found.'); } setIsSearching(false); }, 500); };
    
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onFacultyUpdated(editData);
        setIsSubmitting(false);
    };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Find & Modify Faculty</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800" aria-label="Close panel"><XCircle size={24}/></button></div>
            {!faculty && (<div><form onSubmit={handleSearch} className="flex gap-2 mb-4"><input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Enter Faculty ID to begin..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /><button type="submit" disabled={isSearching} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-5 rounded-lg text-sm flex items-center justify-center disabled:bg-gray-400 w-32">{isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search size={16} className="mr-2"/>Search</>}</button></form>{message && <p className="text-center text-sm font-semibold text-gray-600 my-4">{message}</p>}</div>)}
            {faculty && editData && (
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-semibold text-gray-700">Full Name</label><input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="text-sm font-semibold text-gray-700">Faculty ID</label><input type="text" value={editData.facultyid} readOnly className="mt-1 w-full p-2.5 bg-gray-100 border-gray-300 rounded-lg text-sm cursor-not-allowed" /></div>
                        <div className="md:col-span-2"><label className="text-sm font-semibold text-gray-700">Email Address</label><input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} required className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm" /></div>
                        <div className="md:col-span-2"><label className="text-sm font-semibold text-gray-700">Designation</label><select value={editData.designation} onChange={e => setEditData({...editData, designation: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm">{[...new Set(allFaculty.map(f => f.designation))].sort().map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    </div>
                    <div><label className="text-sm font-semibold text-gray-700">Assign Subjects</label><div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">{subjects.map(subject => (<label key={subject} className="flex items-center text-sm text-gray-700 font-medium"><input type="checkbox" checked={editData.subjects_assigned?.includes(subject)} onChange={() => setEditData(prev => ({ ...prev, subjects_assigned: prev.subjects_assigned?.includes(subject) ? prev.subjects_assigned.filter(s => s !== subject) : [...(prev.subjects_assigned || []), subject] }))} className="h-4 w-4 text-blue-600 rounded" /><span className="ml-2">{subject}</span></label>))}</div></div>
                    <div><BatchSelector selectedBatches={editData.batches_assigned || []} onBatchChange={(batches) => setEditData({...editData, batches_assigned: batches})} /></div>
                    <div className="flex justify-end gap-4 mt-2 pt-6 border-t border-gray-200"><button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg text-sm">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm w-40 flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}</button></div>
                </form>
            )}
        </div>
    );
};

// --- Main Manage Faculty Page Component ---
const ManageFacultyPage = () => {
    const [animate, setAnimate] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    const [preloadedFaculty, setPreloadedFaculty] = useState(null);
    const [facultyToDelete, setFacultyToDelete] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [facultyList, setFacultyList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFaculty = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/getViewFaculty`);
            if (!response.ok) throw new Error("Network response was not ok.");
            const data = await response.json();
            setFacultyList(Array.isArray(data) ? data : []); 
        } catch (err) {
            setError(err);
            setFacultyList([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchFaculty(); }, [fetchFaculty]);
    useEffect(() => { const timer = setTimeout(() => setAnimate(true), 100); return () => clearTimeout(timer); }, []);

    const dynamicDesignations = useMemo(() => {
        if (!facultyList || facultyList.length === 0) return [];
        const designationsSet = new Set(facultyList.map(f => f.designation));
        return Array.from(designationsSet).sort();
    }, [facultyList]);

    const showToast = (type, message) => setToast({ type, message });
    const handleAction = (action, data = null) => {
        if (action === 'delete') {
            setFacultyToDelete(data);
        } else {
            setPreloadedFaculty(data);
            setActiveTab(action);
        }
    };
    const handleAddFaculty = async (facultyData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/addFaculty`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(facultyData) });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Failed to add faculty.'); }
            showToast('success', 'Faculty added successfully!');
            fetchFaculty();
            setActiveTab('view');
        } catch (err) { showToast('error', err.message); }
    };
    const handleUpdateFaculty = async (facultyData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/updateFaculty`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(facultyData) });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Failed to update faculty.'); }
            showToast('success', 'Faculty updated successfully!');
            fetchFaculty();
            setActiveTab('view');
        } catch (err) { showToast('error', err.message); }
    };
    const handleDeleteConfirm = async () => {
        if (!facultyToDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/deleteFaculty`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facultyid: facultyToDelete.facultyid }) });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Failed to delete faculty.'); }
            showToast('success', `Faculty ${facultyToDelete.name} has been deleted.`);
            fetchFaculty();
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setFacultyToDelete(null);
        }
    };
    
    const tabs = [{ id: 'view', label: 'Directory', icon: <Users size={16} /> }, { id: 'add', label: 'Onboard Faculty', icon: <UserCheck size={16} /> }, { id: 'find', label: 'Find & Modify', icon: <Search size={16} /> }];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[1.5rem] rounded-br-[1.5rem] sm:rounded-bl-[2rem] sm:rounded-br-[2rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden"><div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div><div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div></div>
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 pb-6 lg:pb-8 pt-2">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3"></div>
                    <section><SectionHeader title="Faculty Management" animate={animate} delay={300} /><div className={`p-1.5 bg-white/10 backdrop-blur-sm rounded-xl inline-flex items-center gap-2 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>{tabs.map(tab => (<button key={tab.id} onClick={() => { setActiveTab(tab.id); setPreloadedFaculty(null); }} className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-md' : 'text-white hover:bg-white/20'}`}>{tab.icon}<span className="hidden sm:inline">{tab.label}</span></button>))}</div></section>
                </div>
            </header>
            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
                <div className={activeTab === 'view' ? 'block' : 'hidden'}><ViewAllFaculty animate={animate} facultyList={facultyList} isLoading={isLoading} error={error} onAction={handleAction} designations={dynamicDesignations} /></div>
                <div className={activeTab === 'add' ? 'block' : 'hidden'}><AddFacultyForm animate={animate} onCancel={() => setActiveTab('view')} onFacultyAdded={handleAddFaculty} allFaculty={facultyList} /></div>
                <div className={activeTab === 'find' ? 'block' : 'hidden'}><ModifyFacultyPanel animate={animate} preloadedFaculty={preloadedFaculty} allFaculty={facultyList} onCancel={() => setActiveTab('view')} onFacultyUpdated={handleUpdateFaculty} /></div>
            </main>
            <ConfirmationModal isOpen={!!facultyToDelete} onClose={() => setFacultyToDelete(null)} onConfirm={handleDeleteConfirm} title="Confirm Deletion" message={`Are you sure you want to permanently delete ${facultyToDelete?.name}? This action cannot be undone.`} confirmText="Yes, Delete" theme="danger" />
        </div>
    );
};

export default ManageFacultyPage;