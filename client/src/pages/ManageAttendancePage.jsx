import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Search, QrCode, Edit, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, Users, ChevronDown, UserX, ClipboardCheck } from 'lucide-react';

// --- CONFIGURATION ---
const backendUrl = "http://localhost:5000";

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
        try {
            const identifier = localStorage.getItem("userIdentifier");
            if (userRole === 'faculty') {
                const name = localStorage.getItem("userName") || "Faculty Name";
                setUserData({ primary: name, secondary: identifier || 'N/A' });
            } else if (userRole === 'student') {
                const batch = localStorage.getItem("batch");
                setUserData({ primary: identifier || 'N/A', secondary: batch || 'N/A' });
            } else if (userRole === 'admin') {
                setUserData({ primary: 'Admin', secondary: 'Administrator' });
            }
        } catch (error) {
            console.error("Failed to get user data from localStorage:", error);
            setUserData({ primary: 'Error', secondary: 'Data Error' });
        }
    }, [userRole]);

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return {
            link: isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white',
            underline: isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        };
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    let navLinks = [];
    let dashboardPath = '/';
    let profilePath = '/profile';

    if (userRole === 'faculty' || userRole === 'admin') {
        dashboardPath = `/${userRole}/dashboard`;
        profilePath = `/${userRole}/profile`;
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: `/${userRole}/leaderboard`, label: 'Leaderboard' },
            { path: `/${userRole}/timetable`, label: 'Time Table' },
            { path: `/${userRole}/attendance`, label: 'Attendance Board' },
        ];
    } else if (userRole === 'student') {
        dashboardPath = '/student/dashboard';
        profilePath = '/student/profile';
        navLinks = [
            { path: dashboardPath, label: 'Dashboard' },
            { path: '/leaderboard', label: 'LeaderBoard' },
            { path: '/timetable', label: 'Time Table' },
            { path: '/logs', label: 'Logs' },
        ];
    }

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
                        <Link to={dashboardPath} className="relative">
                            <span className="font-bold text-white text-lg sm:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                CDC PORTAL
                            </span>
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
                    {navLinks.map((navLink) => (
                        <Link key={navLink.path} to={navLink.path} className={`${getLinkClass(navLink.path).link} py-3 px-3 rounded-md hover:bg-white/10 text-center text-lg`}>
                            {navLink.label}
                        </Link>
                    ))}
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

// --- Data for forms ---
const courses = ["CP", "JFS", "DBMS", "AWS"];
const batches = [
    { value: "attendance_skillup-1", label: "Skillup-1" }, { value: "attendance_skillup-2", label: "Skillup-2" }, { value: "attendance_skillup-3", label: "Skillup-3" },
    { value: "attendance_skillnext-1", label: "Skillnext-1" }, { value: "attendance_skillnext-2", label: "Skillnext-2" }, { value: "attendance_skillnext-3", label: "Skillnext-3" },
    { value: "attendance_skillbridge-1", label: "Skillbridge-1" }, { value: "attendance_skillbridge-2", label: "Skillbridge-2" }, { value: "attendance_skillbridge-3", label: "Skillbridge-3" }, { value: "attendance_skillbridge-4", label: "Skillbridge-4" }, { value: "attendance_skillbridge-5", label: "Skillbridge-5" }
];

// --- Custom Modern Select Component ---
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
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full p-2 border border-gray-200 rounded-md text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredOptions.map(option => (
                            <li key={option.value} onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                                setSearchTerm('');
                            }} className="p-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center justify-between">
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

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <ClipboardCheck size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {children}
                </div>
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


// --- 1. Mark Attendance Component ---
const MarkAttendanceForm = ({ animate }) => {
    const initialFormState = { batch: '', course: '', date: new Date().toISOString().substring(0, 10) };
    const [formData, setFormData] = useState(initialFormState);
    const [students, setStudents] = useState([]);
    const [selection, setSelection] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [markMode, setMarkMode] = useState('present');
    const [lastSubmission, setLastSubmission] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const resetForm = () => {
        setFormData(initialFormState);
        setStudents([]);
        setSelection([]);
        setLastSubmission(null);
        setMessage({ type: '', text: '' });
    };

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
        setLastSubmission(null);

        try {
            const res = await fetch(`${backendUrl}/api/Admin/getStudentsByBatch/${formData.batch}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();

            const fetchedRollNumbers = (data.students || []).filter(rollno => typeof rollno === 'string');
            fetchedRollNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

            setStudents(fetchedRollNumbers);
            setSelection([]);

        } catch (err) {
            setMessage({ type: 'error', text: err.message || "Failed to fetch students." });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (rollNo) => {
        setSelection(prev => prev.includes(rollNo) ? prev.filter(r => r !== rollNo) : [...prev, rollNo]);
    };

    const handleSelectAll = (isChecked) => {
        setSelection(isChecked ? students : []);
    };

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
            const response = await fetch(`${backendUrl}/api/Admin/Mark-Session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
            setLastSubmission(payload);

            setStudents([]);
            setSelection([]);
            setIsPreviewOpen(false);

            setTimeout(() => {
                resetForm();
            }, 4000);

        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to submit attendance.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Mark Session Attendance</h3>
                    <p className="text-sm text-gray-500 mt-1">Follow the steps to mark attendance for a session.</p>
                </div>
                <button onClick={resetForm} className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"><RefreshCw size={14} /> Reset Form</button>
            </div>

            {/* Step 1: Setup */}
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

            {message.text && !isPreviewOpen && (<div className={`mt-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />} {message.text}</div>)}

            {loading && <div className="text-center py-12"><Loader2 className="mx-auto h-10 w-10 text-blue-600 animate-spin" /><p className="mt-2 text-gray-600">Fetching Roster...</p></div>}

            {students.length > 0 && !loading && (
                <form onSubmit={handlePreview} className="mt-6 p-4 border-2 border-dashed rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg">2</div>
                        <h4 className="text-lg font-bold text-gray-700">Select Students</h4>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4 p-3 bg-white rounded-lg border">
                        <div>
                            <p className="font-bold text-gray-800">Marking Mode</p>
                            <p className="text-sm text-gray-600">Choose whether to select presenties or absenties.</p>
                        </div>
                        <div className="flex items-center p-1 bg-gray-200 rounded-full">
                            <button type="button" onClick={() => setMarkMode('present')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${markMode === 'present' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>Mark Presenties</button>
                            <button type="button" onClick={() => setMarkMode('absent')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${markMode === 'absent' ? 'bg-white text-red-600 shadow' : 'text-gray-600'}`}>Mark Absenties</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Total: {students.length} | Selected: {selection.length}</p>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={students.length > 0 && selection.length === students.length} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /> Select All</label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-2 p-2 bg-white border rounded-lg">
                        {students.map(rollNo => (
                            <label key={rollNo} className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selection.includes(rollNo) ? (markMode === 'present' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50') : 'border-gray-200 hover:border-gray-400'}`}>
                                <input type="checkbox" checked={selection.includes(rollNo)} onChange={() => handleCheckboxChange(rollNo)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="text-sm font-medium text-gray-700 font-mono">{rollNo}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-md flex items-center gap-2">
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
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
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


// --- 2. Update Attendance Component (FIXED) ---
const UpdateAttendanceForm = ({ animate }) => {
    const initialFormState = { batch: '', course: '', date: new Date().toISOString().substring(0, 10) };
    const [formData, setFormData] = useState(initialFormState);
    const [studentList, setStudentList] = useState([]);
    const [selection, setSelection] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [fetchMode, setFetchMode] = useState('absent');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    const resetForm = () => {
        setFormData(initialFormState);
        setStudentList([]);
        setSelection([]);
        setMessage({ type: '', text: '' });
        setIsPreviewOpen(false);
        setLastUpdate(null);
    };

    const handleGetStudents = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setStudentList([]);
        setSelection([]);
        setLastUpdate(null);

        try {
            const { batch, date, course } = formData;
            if (!batch || !date || !course) {
                setMessage({ type: 'error', text: "Please fill all fields." });
                setLoading(false);
                return;
            }

            const res = await fetch(`${backendUrl}/api/Admin/getAbsenties?batch=${batch}&date=${date}&course=${course}&status=${fetchMode}`);

            if (res.status === 404) {
                const readableDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                setMessage({
                    type: 'error',
                    text: `No attendance record was found for ${course} on ${readableDate}. Please ensure the selected date corresponds with the official course schedule.`
                });
                setLoading(false);
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (!Array.isArray(data.students) || data.students.length === 0) {
                 setMessage({ type: 'info', text: `No students were marked as '${fetchMode}' for this session. Nothing to update.`});
                 setStudentList([]);
            } else {
                 const rollNos = data.students.map(s => s.rollno);
                 setStudentList(rollNos.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
                 setSelection([]);
                 setMessage({ type: 'info', text: `Found ${rollNos.length} student(s) marked as '${fetchMode}'. Select students below to change their status to '${fetchMode === 'absent' ? 'present' : 'absent'}'.` });
            }

        } catch (err) {
            setMessage({ type: 'error', text: err.message || `Failed to fetch ${fetchMode} students.` });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (rollNo) => {
        setSelection(prev => {
            if (prev.includes(rollNo)) {
                return prev.filter(r => r !== rollNo);
            } else {
                return [...prev, rollNo];
            }
        });
    };

    const handleSelectAll = (isChecked) => {
        setSelection(isChecked ? studentList : []);
    };

    const handlePreviewUpdate = (e) => {
        e.preventDefault();
        if (selection.length === 0) {
            setMessage({ type: 'error', text: "Please select at least one student to update." });
            return;
        }
        setMessage({ type: '', text: '' });
        setIsPreviewOpen(true);
    };

    const handleSubmitUpdate = async () => {
        setSubmitting(true);
        const newStatus = fetchMode === 'absent' ? 'present' : 'absent';
        const payload = {
            course: formData.course,
            students: selection,
            batch: formData.batch,
            date: formData.date,
            status: newStatus
        };

        try {
            const res = await fetch(`${backendUrl}/api/Admin/updateAttendance`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            await res.json();
            setMessage({ type: 'success', text: `Success! Updated ${selection.length} student(s) to '${newStatus}'.` });
            setLastUpdate(payload);
            setStudentList([]);
            setSelection([]);
            setIsPreviewOpen(false);

        } catch (err) {
            setMessage({ type: 'error', text: err.message || "Error updating attendance." });
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const newStatus = fetchMode === 'absent' ? 'present' : 'absent';

    return (
        <div className={`bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Update Past Attendance</h3>
                    <p className="text-sm text-gray-600 mt-1">Fetch a list of students to change their attendance status.</p>
                </div>
                <button onClick={resetForm} className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-200 transition-colors"><RefreshCw size={14} /> Reset Form</button>
            </div>

            <div className="p-4 border-2 border-dashed rounded-xl border-gray-300 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg">1</div>
                    <h4 className="text-lg font-bold text-gray-800">Find Session Records</h4>
                </div>
                <form onSubmit={handleGetStudents}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label className="text-xs font-semibold text-gray-700">Batch</label><CustomSelect options={batches} value={formData.batch} onChange={(value) => setFormData(p => ({ ...p, batch: value }))} placeholder="Select a Batch" /></div>
                        <div><label className="text-xs font-semibold text-gray-700">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} required className="w-full p-2.5 mt-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-900" /></div>
                        <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-700 block mb-2">Course</label><div className="flex flex-wrap gap-3">{courses.map(course => (<div key={course}><input type="radio" name="course" id={`update-${course}`} value={course} checked={formData.course === course} onChange={(e) => setFormData(p => ({ ...p, course: e.target.value }))} required className="hidden peer" /><label htmlFor={`update-${course}`} className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg cursor-pointer peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 hover:bg-blue-50">{course}</label></div>))}</div></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center p-1 bg-gray-200 rounded-full">
                            <button type="button" onClick={() => { setFetchMode('absent'); setStudentList([]); setSelection([]); }} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${fetchMode === 'absent' ? 'bg-white text-red-600 shadow-lg' : 'text-gray-600'}`}>Fetch Absenties</button>
                            <button type="button" onClick={() => { setFetchMode('present'); setStudentList([]); setSelection([]); }} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${fetchMode === 'present' ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-600'}`}>Fetch Presenties</button>
                        </div>
                        <button type="submit" disabled={loading || !formData.course || !formData.batch} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md flex items-center gap-2 disabled:bg-blue-300">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} Get List
                        </button>
                    </div>
                </form>
            </div>

            {message.text && !isPreviewOpen && (<div className={`mt-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-800' : message.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />} {message.text}</div>)}

            {lastUpdate && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white"><ClipboardCheck size={20} /></div>
                        <h3 className="text-lg font-bold text-green-800">Update Successful</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg border"><p className="text-xs text-gray-500">Batch</p><p className="font-semibold text-gray-800">{batches.find(b => b.value === lastUpdate.batch)?.label}</p></div>
                        <div className="bg-white p-3 rounded-lg border"><p className="text-xs text-gray-500">Course</p><p className="font-semibold text-gray-800">{lastUpdate.course}</p></div>
                        <div className="bg-white p-3 rounded-lg border"><p className="text-xs text-gray-500">New Status</p><p className={`font-semibold capitalize ${lastUpdate.status === 'present' ? 'text-green-600' : 'text-red-600'}`}>{lastUpdate.status}</p></div>
                        <div className="bg-white p-3 rounded-lg border"><p className="text-xs text-gray-500">Students Updated</p><p className="font-semibold text-gray-800">{lastUpdate.students.length}</p></div>
                    </div>
                </div>
            )}

            {studentList.length > 0 && !loading && (
                <form onSubmit={handlePreviewUpdate} className="mt-6 p-4 border-2 border-dashed rounded-xl border-gray-300 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg">2</div>
                        <h4 className="text-lg font-bold text-gray-800">Update Status</h4>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800">Students Marked as <span className={`capitalize ${fetchMode === 'absent' ? 'text-red-600' : 'text-green-600'}`}>{fetchMode}</span> ({studentList.length})</h3>
                        <div className="flex items-center gap-4">
                             <button type="button" onClick={() => handleSelectAll(false)} className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1.5">
                                 <UserX size={14} /> Deselect All
                             </button>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={studentList.length > 0 && selection.length === studentList.length} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /> Select All
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-2 p-2 bg-white border border-gray-200 rounded-lg">
                        {studentList.map(rollNo => {
                            const isSelected = selection.includes(rollNo);
                            const newStatus = fetchMode === 'absent' ? 'present' : 'absent';
                            return (
                                <label key={rollNo} className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? (newStatus === 'present' ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100') : 'border-gray-200 hover:border-blue-500 bg-white'}`}>
                                    <input type="checkbox" checked={isSelected} onChange={() => handleCheckboxChange(rollNo)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-gray-900 font-mono">{rollNo}</span>
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-md flex items-center gap-2">
                            Preview Changes
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} onConfirm={handleSubmitUpdate} title="Confirm Attendance Update" confirmText="Confirm & Update" isSubmitting={submitting}>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-yellow-100 border border-yellow-300 text-sm text-yellow-800">
                        You are about to change the status of <strong>{selection.length} student(s)</strong> from <strong className="capitalize">{fetchMode}</strong> to <strong className="capitalize">{newStatus}</strong>. Please review the details below before confirming.
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Batch</p><p className="font-semibold text-gray-800">{batches.find(b => b.value === formData.batch)?.label}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Course</p><p className="font-semibold text-gray-800">{formData.course}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-xs text-gray-500">Date</p><p className="font-semibold text-gray-800">{formData.date}</p></div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Selected Roll Numbers for Update ({selection.length}):</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
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


// --- Main Attendance Page Component ---
const AttendancePage = () => {
    const [animate, setAnimate] = useState(false);
    const [activeTab, setActiveTab] = useState('mark');
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    const tabs = [
        { id: 'mark', label: 'Mark Session', icon: <CheckSquare size={16} /> },
        { id: 'update', label: 'Update Records', icon: <Edit size={16} /> },
        { id: 'scan', label: 'Scan QR', icon: <QrCode size={16} /> },
    ];

    const handleTabClick = (tabId) => {
        if (tabId === 'scan') {
            navigate('/post-attendance'); 
        } else {
            setActiveTab(tabId);
        }
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
                        <SectionHeader title="Attendance Management" animate={animate} delay={300} />
                        <div className={`p-1.5 bg-white/10 backdrop-blur-sm rounded-xl inline-flex items-center gap-2 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
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
                <div className={activeTab === 'mark' ? 'block' : 'hidden'}>
                    <MarkAttendanceForm animate={animate} />
                </div>
                <div className={activeTab === 'update' ? 'block' : 'hidden'}>
                    <UpdateAttendanceForm animate={animate} />
                </div>
            </main>
        </div>
    );
};

export default AttendancePage;