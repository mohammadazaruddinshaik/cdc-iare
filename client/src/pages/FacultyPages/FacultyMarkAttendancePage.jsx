// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//     Search, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, 
//     Users, ChevronDown, UserX, ClipboardCheck, 
//     BookOpen, Calendar, BarChart3, Filter, GraduationCap,
//     AlertTriangle, XCircle
// } from 'lucide-react';
// import Header from '../../components/Header'
// import { useAuth } from '../../context/AuthContext'; 

// // --- CONFIGURATION ---
// const backendUrl = import.meta.env.VITE_BASE_URL;

// // --- CONSTANTS ---
// const semesters = [
//     { value: "I", label: "Semester I" }, { value: "II", label: "Semester II" },
//     { value: "III", label: "Semester III" }, { value: "IV", label: "Semester IV" },
//     { value: "V", label: "Semester V" }, { value: "VI", label: "Semester VI" },
//     { value: "VII", label: "Semester VII" }, { value: "VIII", label: "Semester VIII" }
// ];

// // --- UTILS ---
// const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
// };

// // --- COMPONENTS ---

// const NativeSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
//     return (
//         <div className={`relative w-full ${disabled ? 'opacity-50' : ''}`}>
//             {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"><Icon size={18} /></div>}
//             <div className="relative">
//                 <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full p-3 ${Icon ? 'pl-10' : 'pl-3'} pr-10 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none transition-all disabled:cursor-not-allowed cursor-pointer`}>
//                     <option value="" disabled hidden>{placeholder}</option>
//                     {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//                 </select>
//                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={16} /></div>
//             </div>
//         </div>
//     );
// };

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, children }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl transform transition-all scale-100 border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
//                 <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-3xl flex-shrink-0">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><ClipboardCheck size={20} /></div>
//                         <div><h3 className="text-lg font-bold text-gray-800">{title}</h3><p className="text-xs text-gray-500">Action Confirmation</p></div>
//                     </div>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XCircle size={20}/></button>
//                 </div>
//                 <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
//                 <div className="flex justify-end gap-3 p-5 bg-gray-50 rounded-b-3xl border-t border-gray-100 flex-shrink-0">
//                     <button onClick={onClose} className="py-2.5 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">Cancel</button>
//                     <button onClick={onConfirm} disabled={isSubmitting} className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed">
//                         {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : confirmText}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- LOGIC HOOK ---
// const useFacultyAttendance = () => {
//     const { logout } = useAuth();
//     const [formData, setFormData] = useState({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
    
//     // State to store the full configuration from the API
//     const [semesterConfig, setSemesterConfig] = useState([]); 
    
//     const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
//     const [students, setStudents] = useState([]);
//     const [selection, setSelection] = useState([]); 
//     const [loading, setLoading] = useState(false);
//     const [fetchingInfo, setFetchingInfo] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });
//     const [mode, setMode] = useState('present'); 
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isPosted, setIsPosted] = useState(false);

//     const resetForm = () => {
//         setFormData({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setStudents([]); setSelection([]); setSearchTerm(''); setMessage({ type: '', text: '' });
//         setIsPosted(false);
//     };

//     // 1. Fetch Semester Config (Batches + Courses)
//     const handleSemesterChange = async (semValue) => {
//         // Reset state on semester change
//         setFormData(prev => ({ ...prev, semester: semValue || '', batch: '', course: '' }));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setStudents([]); setSelection([]); setMessage({ type: '', text: '' }); setIsPosted(false);

//         if (!semValue) return;

//         setFetchingInfo(true); 
//         try {
//             // Updated Endpoint
//             const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
//             if (res.status === 401 || res.status === 403) { logout(); return; }
            
//             const data = await res.json();
//             if (data.success && data.data && data.data.config) {
//                 const config = data.data.config;
//                 setSemesterConfig(config); // Store raw config for later use
                
//                 // Populate Batches dropdown immediately
//                 setFetchedData({
//                     batches: config.map(item => ({ value: item.name, label: item.name })),
//                     courses: [] // Courses are dependent on batch selection
//                 });
//             }
//         } catch (err) { 
//             setMessage({ type: 'error', text: "Unable to load semester configuration." }); 
//         } finally { 
//             setFetchingInfo(false); 
//         }
//     };

//     // 2. Dynamic Course Update (Effect)
//     useEffect(() => {
//         // When batch changes, find its specific courses from semesterConfig
//         if (formData.batch && semesterConfig.length > 0) {
//             const selectedBatchConfig = semesterConfig.find(item => item.name === formData.batch);
            
//             if (selectedBatchConfig && selectedBatchConfig.availableCourses) {
//                 const courses = selectedBatchConfig.availableCourses.map(c => ({ value: c, label: c }));
//                 setFetchedData(prev => ({ ...prev, courses }));
                
//                 // If previously selected course is not in the new batch's list, clear it
//                 if (formData.course && !selectedBatchConfig.availableCourses.includes(formData.course)) {
//                     setFormData(prev => ({ ...prev, course: '' }));
//                 }
//             } else {
//                 setFetchedData(prev => ({ ...prev, courses: [] }));
//             }
//         } else {
//             // No batch selected or no config
//             setFetchedData(prev => ({ ...prev, courses: [] }));
//         }
//     }, [formData.batch, semesterConfig]); // Run whenever batch or config changes

//     // 3. Fetch Students
//     const handleFetchStudents = async (e) => {
//         e.preventDefault();
//         setLoading(true); setMessage({ type: '', text: '' }); setStudents([]); setSelection([]); setIsPosted(false);
//         try {
//             const url = `${backendUrl}/api/students-by-batch?semname=${formData.semester}&batch=${formData.batch}`;
//             const res = await fetch(url, { method: "GET", credentials: "include" });
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
            
//             // Check if attendance already exists
//             if (data.message && data.message.toLowerCase().includes("already posted")) {
//                 setIsPosted(true);
//                 setMessage({ type: 'warning', text: data.message });
//                 return;
//             }

//             const sorted = (data.students || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
//             setStudents(sorted);
//             if(sorted.length === 0) setMessage({type:'info', text: "No students registered in this batch."});
            
//         } catch (err) { setMessage({ type: 'error', text: "Failed to fetch student list." }); } 
//         finally { setLoading(false); }
//     };

//     // 4. Submit Attendance
//     const handleSubmit = async () => {
//         setSubmitting(true);
//         const payload = { 
//             semname: formData.semester, 
//             course: formData.course, 
//             batch: formData.batch, 
//             date: formData.date, 
//             status: mode, 
//             students: selection 
//         };
        
//         try {
//             const res = await fetch(`${backendUrl}/api/attendance-session-post`, {
//                 method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: "include"
//             });
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
            
//             if (data.message && data.message.toLowerCase().includes("attendance already posted")) {
//                 setIsPosted(true);
//                 setMessage({ type: 'warning', text: data.message });
//                 setIsPreviewOpen(false);
//                 setSubmitting(false);
//                 return; 
//             }

//             if (res.ok) {
//                 setMessage({ type: 'success', text: data.message });
//                 setStudents([]); setSelection([]); setIsPreviewOpen(false); setTimeout(resetForm, 3000);
//             } else { setMessage({ type: 'error', text: data.message || "Operation failed." }); }
//         } catch (err) { setMessage({ type: 'error', text: "Server error." }); } 
//         finally { setSubmitting(false); }
//     };

//     return {
//         formData, setFormData, fetchedData, students, selection, setSelection,
//         loading, fetchingInfo, submitting, message, setMessage, mode, setMode,
//         isPreviewOpen, setIsPreviewOpen, searchTerm, setSearchTerm,
//         handleSemesterChange, handleFetchStudents, handleSubmit, resetForm,
//         isPosted
//     };
// };

// // --- MAIN PAGE COMPONENT ---
// const FacultyMarkAttendancePage = () => {
//     const { user } = useAuth(); 
//     const [animate, setAnimate] = useState(false);
//     const navigate = useNavigate();
    
//     // Use the logic hook
//     const logic = useFacultyAttendance();

//     // Filtering logic for the UI
//     const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
//     const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
    
//     const toggleSelectAll = () => logic.setSelection(prev => 
//         isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]
//     );

//     // Lists for Preview Modal
//     const presentList = logic.mode === 'present' ? logic.selection : logic.students.filter(s => !logic.selection.includes(s));
//     const absentList = logic.mode === 'present' ? logic.students.filter(s => !logic.selection.includes(s)) : logic.selection;

//     useEffect(() => {
//         if (!user) navigate('/'); // Basic protection
//         setTimeout(() => setAnimate(true), 100);
//     }, [user, navigate]);

//     // Render helpers
//     const getMessageStyle = (type) => {
//         if(type === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
//         if(type === 'error') return 'bg-red-50 text-red-700 border-red-100';
//         if(type === 'warning') return 'bg-amber-50 text-amber-800 border-amber-100';
//         return 'bg-blue-50 text-blue-700 border-blue-100';
//     };

//     if (!user) return null;

//     return (
//         <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden pb-10">
//             {/* Header */}
//             <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full shadow-2xl relative">
//                 <div className="px-4 sm:px-6 lg:px-8 relative z-10 py-2">
//                     <Header animate={animate} />
//                 </div>
//             </header>

//             <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10 max-w-7xl mx-auto -mt-4">
                
//                 {/* Main Card */}
//                 <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    
//                     {/* Header Row */}
//                     <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
//                         <div>
//                             <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Mark Attendance</h3>
//                             <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
//                                 <Calendar size={14}/> {formatDate(logic.formData.date)}
//                             </p>
//                         </div>
//                         <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium">
//                             <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset
//                         </button>
//                     </div>

//                     {/* ALREADY POSTED VIEW */}
//                     {logic.isPosted ? (
//                         <div className="flex flex-col items-center justify-center py-16 px-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
//                             <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={40}/></div>
//                             <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance Already Recorded</h4>
//                             <p className="text-gray-600 max-w-md mx-auto mb-6">{logic.message.text}</p>
//                             <div className="flex gap-4 text-sm text-gray-500 font-medium bg-white px-6 py-3 rounded-xl border border-amber-100 shadow-sm">
//                                 <span className="flex items-center gap-2"><BookOpen size={14}/> {logic.formData.course}</span>
//                                 <span className="w-px h-5 bg-gray-300"></span>
//                                 <span className="flex items-center gap-2"><Users size={14}/> {logic.formData.batch}</span>
//                             </div>
//                         </div>
//                     ) : (
//                         /* NORMAL FORM VIEW */
//                         <>
//                             {/* Semester Selection */}
//                             <div className="mb-8">
//                                 <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-400 uppercase tracking-wider"><GraduationCap size={16}/> Select Semester</div>
//                                 <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
//                                     {semesters.map((sem) => (
//                                         <button key={sem.value} onClick={() => logic.handleSemesterChange(logic.formData.semester === sem.value ? null : sem.value)} className={`snap-start flex-shrink-0 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all duration-300 font-bold text-sm relative overflow-hidden group ${logic.formData.semester === sem.value ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white'}`}>
//                                             {logic.formData.semester === sem.value && <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-xl"></div>}{sem.label}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Configuration Form */}
//                             <div className={`transition-all duration-500 ease-in-out ${logic.formData.semester ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
//                                 <div className="bg-gray-50/50 rounded-2xl border border-gray-200 p-6 relative">
//                                     {!logic.formData.semester && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center text-gray-400 font-medium italic backdrop-blur-[1px]">Select a semester to proceed</div>}
//                                     <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider"><Filter size={16}/> Configure Session</div>
                                    
//                                     <form onSubmit={logic.handleFetchStudents} className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={logic.fetchedData.batches} value={logic.formData.batch} onChange={(v)=>logic.setFormData(p=>({...p, batch:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Batch"} icon={Users} disabled={!logic.formData.semester || logic.fetchingInfo} /></div>
//                                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={logic.fetchedData.courses} value={logic.formData.course} onChange={(v)=>logic.setFormData(p=>({...p, course:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Course"} icon={BookOpen} disabled={!logic.formData.semester || logic.fetchingInfo || !logic.formData.batch} /></div>
//                                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" value={logic.formData.date} onChange={(e)=>logic.setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm" /></div>
//                                         <div className="md:col-span-3 mt-2 flex justify-end">
//                                              <button type="submit" disabled={logic.loading || !logic.formData.batch || !logic.formData.course} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none transform active:scale-95">
//                                                 {logic.loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} {logic.loading ? 'Fetching Roster...' : 'Get Student List'}
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>

//                             {/* Alert Messages */}
//                             {logic.message.text && !logic.isPreviewOpen && (
//                                 <div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${getMessageStyle(logic.message.type)}`}>
//                                     <div className={`p-1.5 rounded-full ${logic.message.type==='success'?'bg-emerald-200':logic.message.type==='warning'?'bg-amber-200':logic.message.type==='error'?'bg-red-200':'bg-blue-200'}`}>
//                                         {logic.message.type==='success'?<Check size={14} className="text-emerald-800"/>:logic.message.type==='warning'?<AlertTriangle size={14} className="text-amber-800"/>:<AlertCircle size={14} className={logic.message.type==='error'?'text-red-800':'text-blue-800'}/>}
//                                     </div>
//                                     {logic.message.text}
//                                 </div>
//                             )}

//                             {/* Student List & Selection Area */}
//                             {logic.students.length > 0 && !logic.loading && (
//                                 <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
//                                     <div className="flex flex-col md:flex-row gap-6 mb-6">
                                        
//                                         {/* Left Panel: Mode & Stats */}
//                                         <div className="md:w-1/3 space-y-4">
//                                             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
//                                                 <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={64} /></div>
//                                                 <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Class Strength</p>
//                                                 <h4 className="text-3xl font-bold">{logic.students.length} <span className="text-lg font-normal opacity-80">Students</span></h4>
//                                             </div>
//                                             <div className="bg-gray-50 rounded-2xl p-1 border border-gray-200 flex text-sm font-bold">
//                                                 <button onClick={() => logic.setMode('present')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'present' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Check size={16}/> Select Present</button>
//                                                 <button onClick={() => logic.setMode('absent')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><UserX size={16}/> Select Absent</button>
//                                             </div>
//                                         </div>

//                                         {/* Right Panel: Student Grid */}
//                                         <div className="md:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
//                                             <div className="p-4 border-b border-gray-100 flex gap-3 items-center bg-gray-50/50 rounded-t-2xl">
//                                                 <div className="relative flex-1">
//                                                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                                                     <input type="text" placeholder="Search Roll Number..." value={logic.searchTerm} onChange={e=>logic.setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none" />
//                                                 </div>
//                                                 <button onClick={toggleSelectAll} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${isAllSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
//                                                     {isAllSelected ? <CheckSquare size={14}/> : <CheckSquare size={14} className="opacity-50"/>}{isAllSelected ? 'Deselect All' : 'Select All'}
//                                                 </button>
//                                             </div>
//                                             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
//                                                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//                                                     {filteredStudents.map(rollNo => {
//                                                         const isSelected = logic.selection.includes(rollNo);
//                                                         const matchIndex = rollNo.toLowerCase().indexOf(logic.searchTerm.toLowerCase());
//                                                         const highlight = logic.searchTerm && matchIndex >= 0 ? (<>{rollNo.substring(0, matchIndex)}<span className="bg-yellow-200 text-gray-900">{rollNo.substring(matchIndex, matchIndex + logic.searchTerm.length)}</span>{rollNo.substring(matchIndex + logic.searchTerm.length)}</>) : rollNo;
                                                        
//                                                         let borderColor = 'border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-white';
//                                                         let iconColor = 'bg-gray-200 group-hover:bg-blue-200';
                                                        
//                                                         if (isSelected) {
//                                                             borderColor = logic.mode === 'present' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50';
//                                                             iconColor = logic.mode === 'present' ? 'bg-blue-500' : 'bg-red-500';
//                                                         }

//                                                         return (
//                                                             <div key={rollNo} onClick={() => {
//                                                                 logic.setSelection(prev => prev.includes(rollNo) ? prev.filter(r => r !== rollNo) : [...prev, rollNo]);
//                                                             }} className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 flex items-center justify-between group overflow-hidden ${borderColor}`}>
//                                                                 <span className={`font-mono text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>{highlight}</span>
//                                                                 <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${iconColor}`}>{isSelected && <Check size={12} className="text-white" />}</div>
//                                                             </div>
//                                                         );
//                                                     })}
//                                                 </div>
//                                             </div>
//                                             <div className="p-4 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl flex justify-end">
//                                                 <button onClick={() => logic.setIsPreviewOpen(true)} className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-gray-300 hover:-translate-y-1 transition-all flex items-center gap-2">
//                                                     Review & Submit <ChevronDown size={14} className="-rotate-90"/>
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </main>

//             {/* Confirmation Modal */}
//             <ConfirmationModal isOpen={logic.isPreviewOpen} onClose={() => logic.setIsPreviewOpen(false)} onConfirm={logic.handleSubmit} title="Confirm Attendance" confirmText="Submit Attendance" isSubmitting={logic.submitting}>
//                 <div className="space-y-6">
//                     <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
//                         <div className="flex items-center gap-3 pr-4 border-r border-gray-200"><div className="bg-white p-2 rounded-lg border border-gray-100"><BookOpen size={16} className="text-blue-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Course</p><p className="text-sm font-bold text-gray-800">{logic.formData.course}</p></div></div>
//                         <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg border border-gray-100"><Users size={16} className="text-purple-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Batch</p><p className="text-sm font-bold text-gray-800">{logic.formData.batch}</p></div></div>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
//                         {/* Present Column */}
//                         <div className="border border-green-200 bg-green-50/30 rounded-2xl flex flex-col overflow-hidden">
//                             <div className="p-3 bg-green-100 border-b border-green-200 flex justify-between items-center">
//                                 <div className="flex items-center gap-2 text-green-800 font-bold"><Check size={16} strokeWidth={3}/> Present</div>
//                                 <span className="bg-white text-green-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-green-200">{presentList.length}</span>
//                             </div>
//                             <div className="p-3 overflow-y-auto flex-grow custom-scrollbar">
//                                 <div className="flex flex-wrap gap-2">
//                                     {presentList.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-green-200 text-green-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>))}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Absent Column */}
//                         <div className="border border-red-200 bg-red-50/30 rounded-2xl flex flex-col overflow-hidden">
//                             <div className="p-3 bg-red-100 border-b border-red-200 flex justify-between items-center">
//                                 <div className="flex items-center gap-2 text-red-800 font-bold"><UserX size={16} strokeWidth={3}/> Absent</div>
//                                 <span className="bg-white text-red-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-red-200">{absentList.length}</span>
//                             </div>
//                             <div className="p-3 overflow-y-auto flex-grow custom-scrollbar">
//                                 <div className="flex flex-wrap gap-2">
//                                     {absentList.length > 0 ? absentList.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-red-200 text-red-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No absentees</div>}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </ConfirmationModal>
//         </div>
//     );
// };

// export default FacultyMarkAttendancePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, 
    Users, ChevronDown, UserX, ClipboardCheck, 
    BookOpen, Calendar, BarChart3, Filter, GraduationCap,
    AlertTriangle, XCircle
} from 'lucide-react';
import Header from '../../components/Header'
import { useAuth } from '../../context/AuthContext'; 
import CryptoJS from 'crypto-js'; // Import CryptoJS

// --- CONFIGURATION ---
const backendUrl = import.meta.env.VITE_BASE_URL;
const EncDec_SECRET_KEY = import.meta.env.VITE_ENC_SECRET_KEY; // Ensure this is in your .env

// --- ENCRYPTION / DECRYPTION UTILS ---

const encryptData = (data) => {
    try {
        if (!data) return null;
        const strData = typeof data === 'object' ? JSON.stringify(data) : String(data);
        return CryptoJS.AES.encrypt(strData, EncDec_SECRET_KEY).toString();
    } catch (err) {
        console.error("Encryption Error:", err);
        return null;
    }
};

const decryptData = (ciphertext) => {
    try {
        if (!ciphertext) return null;
        const bytes = CryptoJS.AES.decrypt(ciphertext, EncDec_SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;
        try {
            return JSON.parse(decryptedString);
        } catch (e) {
            return decryptedString;
        }
    } catch (err) {
        console.error("Decryption Error:", err);
        return null;
    }
};

// --- CONSTANTS ---
const semesters = [
    { value: "I", label: "Semester I" }, { value: "II", label: "Semester II" },
    { value: "III", label: "Semester III" }, { value: "IV", label: "Semester IV" },
    { value: "V", label: "Semester V" }, { value: "VI", label: "Semester VI" },
    { value: "VII", label: "Semester VII" }, { value: "VIII", label: "Semester VIII" }
];

// --- UTILS ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// --- COMPONENTS ---

const NativeSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
    return (
        <div className={`relative w-full ${disabled ? 'opacity-50' : ''}`}>
            {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"><Icon size={18} /></div>}
            <div className="relative">
                <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full p-3 ${Icon ? 'pl-10' : 'pl-3'} pr-10 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none transition-all disabled:cursor-not-allowed cursor-pointer`}>
                    <option value="" disabled hidden>{placeholder}</option>
                    {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={16} /></div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl transform transition-all scale-100 border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-3xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><ClipboardCheck size={20} /></div>
                        <div><h3 className="text-lg font-bold text-gray-800">{title}</h3><p className="text-xs text-gray-500">Action Confirmation</p></div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XCircle size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
                <div className="flex justify-end gap-3 p-5 bg-gray-50 rounded-b-3xl border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose} className="py-2.5 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">Cancel</button>
                    <button onClick={onConfirm} disabled={isSubmitting} className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- LOGIC HOOK ---
const useFacultyAttendance = () => {
    const { logout } = useAuth();
    const [formData, setFormData] = useState({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
    
    // State to store the full configuration from the API
    const [semesterConfig, setSemesterConfig] = useState([]); 
    
    const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
    const [students, setStudents] = useState([]);
    const [selection, setSelection] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [fetchingInfo, setFetchingInfo] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mode, setMode] = useState('present'); 
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPosted, setIsPosted] = useState(false);

    const resetForm = () => {
        setFormData({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
        setFetchedData({ batches: [], courses: [] });
        setSemesterConfig([]);
        setStudents([]); setSelection([]); setSearchTerm(''); setMessage({ type: '', text: '' });
        setIsPosted(false);
    };

    // 1. Fetch Semester Config (GET Request)
    const handleSemesterChange = async (semValue) => {
        setFormData(prev => ({ ...prev, semester: semValue || '', batch: '', course: '' }));
        setFetchedData({ batches: [], courses: [] });
        setSemesterConfig([]);
        setStudents([]); setSelection([]); setMessage({ type: '', text: '' }); setIsPosted(false);

        if (!semValue) return;

        setFetchingInfo(true); 
        try {
            // GET Request: Plain URL params
            const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
            if (res.status === 401 || res.status === 403) { logout(); return; }
            
            const rawJson = await res.json();
            // DECRYPT RESPONSE: Check for encrypted 'data' key
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;

            if (data.success && data.data && data.data.config) {
                const config = data.data.config;
                setSemesterConfig(config); // Store raw config for later use
                
                setFetchedData({
                    batches: config.map(item => ({ value: item.name, label: item.name })),
                    courses: [] 
                });
            }
        } catch (err) { 
            setMessage({ type: 'error', text: "Unable to load semester configuration." }); 
        } finally { 
            setFetchingInfo(false); 
        }
    };

    // 2. Dynamic Course Update (Effect)
    useEffect(() => {
        if (formData.batch && semesterConfig.length > 0) {
            const selectedBatchConfig = semesterConfig.find(item => item.name === formData.batch);
            
            if (selectedBatchConfig && selectedBatchConfig.availableCourses) {
                const courses = selectedBatchConfig.availableCourses.map(c => ({ value: c, label: c }));
                setFetchedData(prev => ({ ...prev, courses }));
                
                if (formData.course && !selectedBatchConfig.availableCourses.includes(formData.course)) {
                    setFormData(prev => ({ ...prev, course: '' }));
                }
            } else {
                setFetchedData(prev => ({ ...prev, courses: [] }));
            }
        } else {
            setFetchedData(prev => ({ ...prev, courses: [] }));
        }
    }, [formData.batch, semesterConfig]); 

    // 3. Fetch Students (GET Request)
    const handleFetchStudents = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: '', text: '' }); setStudents([]); setSelection([]); setIsPosted(false);
        try {
            const url = `${backendUrl}/api/students-by-batch?semname=${formData.semester}&batch=${formData.batch}`;
            // GET Request: Plain URL params
            const res = await fetch(url, { method: "GET", credentials: "include" });
            if (res.status === 401 || res.status === 403) { logout(); return; }

            const rawJson = await res.json();
            // DECRYPT RESPONSE
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;
            
            if (data.message && data.message.toLowerCase().includes("already posted")) {
                setIsPosted(true);
                setMessage({ type: 'warning', text: data.message });
                return;
            }

            const sorted = (data.students || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            setStudents(sorted);
            if(sorted.length === 0) setMessage({type:'info', text: "No students registered in this batch."});
            
        } catch (err) { setMessage({ type: 'error', text: "Failed to fetch student list." }); } 
        finally { setLoading(false); }
    };

    // 4. Submit Attendance (POST Request)
    const handleSubmit = async () => {
        setSubmitting(true);
        const payload = { 
            semname: formData.semester, 
            course: formData.course, 
            batch: formData.batch, 
            date: formData.date, 
            status: mode, 
            students: selection 
        };
        
        try {
            // POST Request: ENCRYPT Request Body
            const encryptedBody = encryptData(payload);

            const res = await fetch(`${backendUrl}/api/attendance-session-post`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ payload: encryptedBody }), // Send Encrypted Data
                credentials: "include"
            });

            if (res.status === 401 || res.status === 403) { logout(); return; }

            const rawJson = await res.json();
            // DECRYPT Response
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;
            
            if (data.message && data.message.toLowerCase().includes("attendance already posted")) {
                setIsPosted(true);
                setMessage({ type: 'warning', text: data.message });
                setIsPreviewOpen(false);
                setSubmitting(false);
                return; 
            }

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                setStudents([]); setSelection([]); setIsPreviewOpen(false); setTimeout(resetForm, 3000);
            } else { setMessage({ type: 'error', text: data.message || "Operation failed." }); }
        } catch (err) { setMessage({ type: 'error', text: "Server error." }); } 
        finally { setSubmitting(false); }
    };

    return {
        formData, setFormData, fetchedData, students, selection, setSelection,
        loading, fetchingInfo, submitting, message, setMessage, mode, setMode,
        isPreviewOpen, setIsPreviewOpen, searchTerm, setSearchTerm,
        handleSemesterChange, handleFetchStudents, handleSubmit, resetForm,
        isPosted
    };
};

// --- MAIN PAGE COMPONENT ---
const FacultyMarkAttendancePage = () => {
    const { user } = useAuth(); 
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();
    
    // Use the logic hook
    const logic = useFacultyAttendance();

    // Filtering logic for the UI
    const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
    const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
    
    const toggleSelectAll = () => logic.setSelection(prev => 
        isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]
    );

    // Lists for Preview Modal
    const presentList = logic.mode === 'present' ? logic.selection : logic.students.filter(s => !logic.selection.includes(s));
    const absentList = logic.mode === 'present' ? logic.students.filter(s => !logic.selection.includes(s)) : logic.selection;

    useEffect(() => {
        if (!user) navigate('/'); // Basic protection
        setTimeout(() => setAnimate(true), 100);
    }, [user, navigate]);

    // Render helpers
    const getMessageStyle = (type) => {
        if(type === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if(type === 'error') return 'bg-red-50 text-red-700 border-red-100';
        if(type === 'warning') return 'bg-amber-50 text-amber-800 border-amber-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    if (!user) return null;

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden pb-10">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full shadow-2xl relative">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 py-2">
                    <Header animate={animate} />
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10 max-w-7xl mx-auto -mt-4">
                
                {/* Main Card */}
                <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Mark Attendance</h3>
                            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                                <Calendar size={14}/> {formatDate(logic.formData.date)}
                            </p>
                        </div>
                        <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium">
                            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset
                        </button>
                    </div>

                    {/* ALREADY POSTED VIEW */}
                    {logic.isPosted ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={40}/></div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance Already Recorded</h4>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">{logic.message.text}</p>
                            <div className="flex gap-4 text-sm text-gray-500 font-medium bg-white px-6 py-3 rounded-xl border border-amber-100 shadow-sm">
                                <span className="flex items-center gap-2"><BookOpen size={14}/> {logic.formData.course}</span>
                                <span className="w-px h-5 bg-gray-300"></span>
                                <span className="flex items-center gap-2"><Users size={14}/> {logic.formData.batch}</span>
                            </div>
                        </div>
                    ) : (
                        /* NORMAL FORM VIEW */
                        <>
                            {/* Semester Selection */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-400 uppercase tracking-wider"><GraduationCap size={16}/> Select Semester</div>
                                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                    {semesters.map((sem) => (
                                        <button key={sem.value} onClick={() => logic.handleSemesterChange(logic.formData.semester === sem.value ? null : sem.value)} className={`snap-start flex-shrink-0 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all duration-300 font-bold text-sm relative overflow-hidden group ${logic.formData.semester === sem.value ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white'}`}>
                                            {logic.formData.semester === sem.value && <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-xl"></div>}{sem.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Configuration Form */}
                            <div className={`transition-all duration-500 ease-in-out ${logic.formData.semester ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-200 p-6 relative">
                                    {!logic.formData.semester && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center text-gray-400 font-medium italic backdrop-blur-[1px]">Select a semester to proceed</div>}
                                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider"><Filter size={16}/> Configure Session</div>
                                    
                                    <form onSubmit={logic.handleFetchStudents} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={logic.fetchedData.batches} value={logic.formData.batch} onChange={(v)=>logic.setFormData(p=>({...p, batch:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Batch"} icon={Users} disabled={!logic.formData.semester || logic.fetchingInfo} /></div>
                                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={logic.fetchedData.courses} value={logic.formData.course} onChange={(v)=>logic.setFormData(p=>({...p, course:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Course"} icon={BookOpen} disabled={!logic.formData.semester || logic.fetchingInfo || !logic.formData.batch} /></div>
                                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" value={logic.formData.date} onChange={(e)=>logic.setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm" /></div>
                                        <div className="md:col-span-3 mt-2 flex justify-end">
                                             <button type="submit" disabled={logic.loading || !logic.formData.batch || !logic.formData.course} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none transform active:scale-95">
                                                {logic.loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} {logic.loading ? 'Fetching Roster...' : 'Get Student List'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Alert Messages */}
                            {logic.message.text && !logic.isPreviewOpen && (
                                <div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${getMessageStyle(logic.message.type)}`}>
                                    <div className={`p-1.5 rounded-full ${logic.message.type==='success'?'bg-emerald-200':logic.message.type==='warning'?'bg-amber-200':logic.message.type==='error'?'bg-red-200':'bg-blue-200'}`}>
                                        {logic.message.type==='success'?<Check size={14} className="text-emerald-800"/>:logic.message.type==='warning'?<AlertTriangle size={14} className="text-amber-800"/>:<AlertCircle size={14} className={logic.message.type==='error'?'text-red-800':'text-blue-800'}/>}
                                    </div>
                                    {logic.message.text}
                                </div>
                            )}

                            {/* Student List & Selection Area */}
                            {logic.students.length > 0 && !logic.loading && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                                        
                                        {/* Left Panel: Mode & Stats */}
                                        <div className="md:w-1/3 space-y-4">
                                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={64} /></div>
                                                <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Class Strength</p>
                                                <h4 className="text-3xl font-bold">{logic.students.length} <span className="text-lg font-normal opacity-80">Students</span></h4>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-1 border border-gray-200 flex text-sm font-bold">
                                                <button onClick={() => logic.setMode('present')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'present' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Check size={16}/> Select Present</button>
                                                <button onClick={() => logic.setMode('absent')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><UserX size={16}/> Select Absent</button>
                                            </div>
                                        </div>

                                        {/* Right Panel: Student Grid */}
                                        <div className="md:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
                                            <div className="p-4 border-b border-gray-100 flex gap-3 items-center bg-gray-50/50 rounded-t-2xl">
                                                <div className="relative flex-1">
                                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input type="text" placeholder="Search Roll Number..." value={logic.searchTerm} onChange={e=>logic.setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none" />
                                                </div>
                                                <button onClick={toggleSelectAll} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${isAllSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                                    {isAllSelected ? <CheckSquare size={14}/> : <CheckSquare size={14} className="opacity-50"/>}{isAllSelected ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {filteredStudents.map(rollNo => {
                                                        const isSelected = logic.selection.includes(rollNo);
                                                        const matchIndex = rollNo.toLowerCase().indexOf(logic.searchTerm.toLowerCase());
                                                        const highlight = logic.searchTerm && matchIndex >= 0 ? (<>{rollNo.substring(0, matchIndex)}<span className="bg-yellow-200 text-gray-900">{rollNo.substring(matchIndex, matchIndex + logic.searchTerm.length)}</span>{rollNo.substring(matchIndex + logic.searchTerm.length)}</>) : rollNo;
                                                        
                                                        let borderColor = 'border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-white';
                                                        let iconColor = 'bg-gray-200 group-hover:bg-blue-200';
                                                        
                                                        if (isSelected) {
                                                            borderColor = logic.mode === 'present' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50';
                                                            iconColor = logic.mode === 'present' ? 'bg-blue-500' : 'bg-red-500';
                                                        }

                                                        return (
                                                            <div key={rollNo} onClick={() => {
                                                                logic.setSelection(prev => prev.includes(rollNo) ? prev.filter(r => r !== rollNo) : [...prev, rollNo]);
                                                            }} className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 flex items-center justify-between group overflow-hidden ${borderColor}`}>
                                                                <span className={`font-mono text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>{highlight}</span>
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${iconColor}`}>{isSelected && <Check size={12} className="text-white" />}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="p-4 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl flex justify-end">
                                                <button onClick={() => logic.setIsPreviewOpen(true)} className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-gray-300 hover:-translate-y-1 transition-all flex items-center gap-2">
                                                    Review & Submit <ChevronDown size={14} className="-rotate-90"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            <ConfirmationModal isOpen={logic.isPreviewOpen} onClose={() => logic.setIsPreviewOpen(false)} onConfirm={logic.handleSubmit} title="Confirm Attendance" confirmText="Submit Attendance" isSubmitting={logic.submitting}>
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 pr-4 border-r border-gray-200"><div className="bg-white p-2 rounded-lg border border-gray-100"><BookOpen size={16} className="text-blue-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Course</p><p className="text-sm font-bold text-gray-800">{logic.formData.course}</p></div></div>
                        <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg border border-gray-100"><Users size={16} className="text-purple-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Batch</p><p className="text-sm font-bold text-gray-800">{logic.formData.batch}</p></div></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                        {/* Present Column */}
                        <div className="border border-green-200 bg-green-50/30 rounded-2xl flex flex-col overflow-hidden">
                            <div className="p-3 bg-green-100 border-b border-green-200 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-green-800 font-bold"><Check size={16} strokeWidth={3}/> Present</div>
                                <span className="bg-white text-green-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-green-200">{presentList.length}</span>
                            </div>
                            <div className="p-3 overflow-y-auto flex-grow custom-scrollbar">
                                <div className="flex flex-wrap gap-2">
                                    {presentList.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-green-200 text-green-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>))}
                                </div>
                            </div>
                        </div>

                        {/* Absent Column */}
                        <div className="border border-red-200 bg-red-50/30 rounded-2xl flex flex-col overflow-hidden">
                            <div className="p-3 bg-red-100 border-b border-red-200 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-red-800 font-bold"><UserX size={16} strokeWidth={3}/> Absent</div>
                                <span className="bg-white text-red-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-red-200">{absentList.length}</span>
                            </div>
                            <div className="p-3 overflow-y-auto flex-grow custom-scrollbar">
                                <div className="flex flex-wrap gap-2">
                                    {absentList.length > 0 ? absentList.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-red-200 text-red-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No absentees</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ConfirmationModal>
        </div>
    );
};

export default FacultyMarkAttendancePage;