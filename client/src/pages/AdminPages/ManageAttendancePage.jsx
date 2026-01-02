// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//     Search, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, 
//     Users, ChevronDown, UserX, ClipboardCheck, Trash2, 
//     BookOpen, Calendar, BarChart3, Filter, QrCode, Edit, GraduationCap,
//     AlertTriangle, XCircle, Lock
// } from 'lucide-react';
// import Header from '../../components/Header';
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

// const SectionHeader = ({ title, animate, delay }) => (
//     <div className={`flex items-center mb-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
//         <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
//         <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
//     </div>
// );

// // --- NATIVE SELECT ---
// const NativeSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
//     return (
//         <div className={`relative w-full ${disabled ? 'opacity-50' : ''}`}>
//             {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"><Icon size={18} /></div>}
//             <div className="relative">
//                 <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full p-3 ${Icon ? 'pl-10' : 'pl-3'} pr-10 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none transition-all disabled:cursor-not-allowed cursor-pointer font-medium`}>
//                     <option value="" disabled hidden>{placeholder}</option>
//                     {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//                 </select>
//                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={16} /></div>
//             </div>
//         </div>
//     );
// };

// // --- STATUS MODAL (New Component for Result Messages) ---
// const StatusModal = ({ isOpen, onClose, type, title, message }) => {
//     if (!isOpen) return null;
//     const isSuccess = type === 'success';

//     return (
//         // Clean Overlay: bg-black/50 only, NO backdrop-blur
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-gray-100" onClick={e => e.stopPropagation()}>
//                 <div className={`${isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} p-6 text-center border-b`}>
//                     <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
//                         {isSuccess ? <Check size={32} strokeWidth={3} /> : <AlertTriangle size={32} strokeWidth={3} />}
//                     </div>
//                     <h3 className={`text-xl font-bold ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>{title}</h3>
//                 </div>
//                 <div className="p-6">
//                     <p className="text-center text-gray-600 text-sm mb-6 font-medium leading-relaxed">
//                         {message}
//                     </p>
//                     <button 
//                         onClick={onClose} 
//                         className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
//                     >
//                         {isSuccess ? 'Done' : 'Close'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- CONFIRMATION MODAL ---
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, isConfirmDisabled = false, children, confirmButtonColor = "blue" }) => {
//     if (!isOpen) return null;
    
//     const getColors = () => {
//         if(confirmButtonColor === 'red') return "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30";
//         return "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30";
//     }

//     return (
//         // Clean Overlay: bg-black/50 only, NO backdrop-blur
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all scale-100 border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
//                 {/* Header: Solid gray background (bg-gray-50), no transparency */}
//                 <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-3xl flex-shrink-0">
//                     <div className="flex items-center gap-3">
//                         <div className={`p-2.5 rounded-xl ${confirmButtonColor === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}><ClipboardCheck size={20} /></div>
//                         <div><h3 className="text-lg font-bold text-gray-800">{title}</h3><p className="text-xs text-gray-500">Action Confirmation</p></div>
//                     </div>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XCircle size={20}/></button>
//                 </div>
//                 <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
//                 <div className="flex justify-end gap-3 p-5 bg-gray-50 rounded-b-3xl border-t border-gray-100 flex-shrink-0">
//                     <button onClick={onClose} className="py-2.5 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">Cancel</button>
//                     <button onClick={onConfirm} disabled={isSubmitting || isConfirmDisabled} className={`py-2.5 px-6 bg-gradient-to-r ${getColors()} text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}>
//                         {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : confirmText}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- SHARED FORM LOGIC HOOK ---
// const useAttendanceForm = (endpoint, method, isUpdate = false) => {
//     const { logout } = useAuth();
//     const [formData, setFormData] = useState({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
//     const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
//     const [semesterConfig, setSemesterConfig] = useState([]);
    
//     const [students, setStudents] = useState([]);
//     const [selection, setSelection] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [fetchingInfo, setFetchingInfo] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });
//     const [mode, setMode] = useState(isUpdate ? 'absent' : 'present'); 
//     const [fetchStatus, setFetchStatus] = useState('present'); 
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isPosted, setIsPosted] = useState(false);

//     const resetForm = () => {
//         setFormData({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setStudents([]); setSelection([]); setSearchTerm(''); setMessage({ type: '', text: '' });
//         setIsPosted(false);
//         if(isUpdate) setFetchStatus('present');
//     };

//     const handleSemesterChange = async (semValue) => {
//         setFormData(prev => ({ ...prev, semester: semValue || '', batch: '', course: '' }));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setStudents([]); setSelection([]); setMessage({ type: '', text: '' }); setIsPosted(false);

//         if (!semValue) return;

//         setFetchingInfo(true); 
//         try {
//             const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
//             if (res.status === 401 || res.status === 403) { logout(); return; }
//             const data = await res.json();
//             if (data.success && data.data && data.data.config) {
//                 const config = data.data.config;
//                 setSemesterConfig(config);
//                 setFetchedData({
//                     batches: config.map(item => ({ value: item.name, label: item.name })),
//                     courses: []
//                 });
//             }
//         } catch (err) { setMessage({ type: 'error', text: "Unable to load details." }); } finally { setFetchingInfo(false); }
//     };

//     useEffect(() => {
//         if (formData.batch && semesterConfig.length > 0) {
//             const batchItem = semesterConfig.find(item => item.name === formData.batch);
//             const courses = batchItem ? batchItem.availableCourses : [];
//             setFetchedData(prev => ({ ...prev, courses: courses.map(c => ({ value: c, label: c })) }));
//             if (formData.course && !courses.includes(formData.course)) { setFormData(prev => ({ ...prev, course: '' })); }
//         } else { setFetchedData(prev => ({ ...prev, courses: [] })); }
//     }, [formData.batch, semesterConfig]);

//     const handleFetchStudents = async (e) => {
//         e.preventDefault();
//         setLoading(true); setMessage({ type: '', text: '' }); setStudents([]); setSelection([]); setIsPosted(false);
//         try {
//             let url;
//             if (isUpdate) {
//                 const params = new URLSearchParams({ semname: formData.semester, batch: formData.batch, date: formData.date, course: formData.course, status: fetchStatus });
//                 url = `${backendUrl}/api/admin/get-students-for-attendance-updation?${params.toString()}`;
//             } else {
//                 url = `${backendUrl}/api/students-by-batch?semname=${formData.semester}&batch=${formData.batch}`;
//             }

//             const res = await fetch(url, { method: "GET", credentials: "include" });
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
            
//             if (data.message && data.message.toLowerCase().includes("already posted")) {
//                 setIsPosted(true); setMessage({ type: 'warning', text: data.message }); return;
//             }
//             if (data.message && data.message.toLowerCase().includes("no attendance logs found")) {
//                 setMessage({ type: 'error', text: data.message }); return;
//             }

//             const sorted = (data.students || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
//             setStudents(sorted);
//             if(sorted.length === 0) {
//                 setMessage({type:'info', text: isUpdate ? `No students found with status '${fetchStatus}'.` : "No students registered in this batch."});
//             }
            
//         } catch (err) { setMessage({ type: 'error', text: "Failed to fetch student list." }); } finally { setLoading(false); }
//     };

//     const handleSubmit = async () => {
//         if (isUpdate && selection.length === 0) return setMessage({type: 'error', text: 'Select students to update.'});
//         setSubmitting(true);
//         const payload = { semname: formData.semester, course: formData.course, batch: formData.batch, date: formData.date, status: mode, students: selection };
//         try {
//             const res = await fetch(`${backendUrl}${endpoint}`, {
//                 method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: "include"
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
//                 setMessage({ type: 'success', text: isUpdate ? `${data.message} (${data.updatedCount} updated)` : data.message });
//                 setStudents([]); setSelection([]); setIsPreviewOpen(false); setTimeout(resetForm, 3000);
//             } else { setMessage({ type: 'error', text: data.message || "Operation failed." }); }
//         } catch (err) { setMessage({ type: 'error', text: "Server error." }); } finally { setSubmitting(false); }
//     };

//     return {
//         formData, setFormData, fetchedData, students, selection, setSelection,
//         loading, fetchingInfo, submitting, message, setMessage, mode, setMode,
//         isPreviewOpen, setIsPreviewOpen, searchTerm, setSearchTerm, fetchStatus, setFetchStatus,
//         handleSemesterChange, handleFetchStudents, handleSubmit, resetForm,
//         isPosted
//     };
// };

// // --- MARK ATTENDANCE FORM ---
// const MarkAttendanceForm = ({ animate }) => {
//     const logic = useAttendanceForm('/api/attendance-session-post', 'POST', false);
    
//     const presentList = logic.mode === 'present' ? logic.selection : logic.students.filter(s => !logic.selection.includes(s));
//     const absentList = logic.mode === 'present' ? logic.students.filter(s => !logic.selection.includes(s)) : logic.selection;

//     const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
//     const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
//     const toggleSelectAll = () => logic.setSelection(prev => isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]);

//     return (
//         <AttendanceUIWrapper 
//             animate={animate} title="Mark Attendance" logic={logic} filteredStudents={filteredStudents} isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll}
//             confirmTitle="Confirm Attendance" confirmButtonText="Confirm Attendance"
//         >
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[400px]">
//                 <StudentListColumn title="Present" count={presentList.length} list={presentList} color="green" icon={Check} />
//                 <StudentListColumn title="Absent" count={absentList.length} list={absentList} color="red" icon={UserX} />
//             </div>
//         </AttendanceUIWrapper>
//     );
// };

// // --- UPDATE ATTENDANCE FORM ---
// const UpdateAttendanceForm = ({ animate }) => {
//     const logic = useAttendanceForm('/api/admin/handle-update-attendance', 'PATCH', true);
//     const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
//     const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
//     const toggleSelectAll = () => logic.setSelection(prev => isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]);

//     return (
//         <AttendanceUIWrapper 
//             animate={animate} title="Update Records" logic={logic} filteredStudents={filteredStudents} isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll}
//             confirmTitle="Confirm Updates" confirmButtonText={`Update to ${logic.mode === 'present' ? 'Present' : 'Absent'}`} isUpdateMode={true}
//         >
//             <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-sm text-blue-800 flex items-center gap-2">
//                 <AlertCircle size={16}/> Changing status of <strong>{logic.selection.length}</strong> student(s) to <strong>{logic.mode.toUpperCase()}</strong>.
//             </div>
//             <div className="border border-gray-200 bg-gray-50 rounded-2xl flex flex-col overflow-hidden h-[300px]">
//                 <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center"><div className="font-bold text-gray-700">Selected Students</div><span className="bg-white text-gray-800 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">{logic.selection.length}</span></div>
//                 <div className="p-3 overflow-y-auto flex-grow custom-scrollbar"><div className="flex flex-wrap gap-2">{logic.selection.length > 0 ? logic.selection.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-gray-300 text-gray-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No students selected</div>}</div></div>
//             </div>
//         </AttendanceUIWrapper>
//     );
// };

// // --- REUSABLE UI WRAPPER ---
// const AttendanceUIWrapper = ({ animate, title, logic, filteredStudents, isAllSelected, toggleSelectAll, children, confirmTitle, confirmButtonText, isUpdateMode = false }) => {
//     const getMessageStyle = (type) => {
//         if(type === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
//         if(type === 'error') return 'bg-red-50 text-red-700 border-red-100';
//         if(type === 'warning') return 'bg-amber-50 text-amber-800 border-amber-100';
//         return 'bg-blue-50 text-blue-700 border-blue-100';
//     };
    
//     if (logic.isPosted) {
//         return (
//             <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//                 <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
//                     <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset</button>
//                 </div>
                
//                 <div className="flex flex-col items-center justify-center py-16 px-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
//                     <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={40}/></div>
//                     <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance Already Recorded</h4>
//                     <p className="text-gray-600 max-w-md mx-auto mb-6">{logic.message.text}</p>
//                     <div className="flex gap-4 text-sm text-gray-500 font-medium bg-white px-6 py-3 rounded-xl border border-amber-100 shadow-sm">
//                         <span className="flex items-center gap-2"><BookOpen size={14}/> {logic.formData.course}</span>
//                         <span className="w-px h-5 bg-gray-300"></span>
//                         <span className="flex items-center gap-2"><Users size={14}/> {logic.formData.batch}</span>
//                         <span className="w-px h-5 bg-gray-300"></span>
//                         <span className="flex items-center gap-2"><Calendar size={14}/> {formatDate(logic.formData.date)}</span>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//             <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
//                 <div><h3 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h3><p className="text-gray-500 mt-1 flex items-center gap-2 text-sm"><Calendar size={14}/> {formatDate(logic.formData.date)}</p></div>
//                 <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset</button>
//             </div>

//             <div className="mb-8">
//                 <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-400 uppercase tracking-wider"><GraduationCap size={16}/> Select Semester</div>
//                 <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
//                     {semesters.map((sem) => (
//                         <button key={sem.value} onClick={() => logic.handleSemesterChange(logic.formData.semester === sem.value ? null : sem.value)} className={`snap-start flex-shrink-0 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all duration-300 font-bold text-sm relative overflow-hidden group ${logic.formData.semester === sem.value ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white'}`}>
//                             {logic.formData.semester === sem.value && <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-xl"></div>}{sem.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             <div className={`transition-all duration-500 ease-in-out ${logic.formData.semester ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
//                 <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 relative overflow-visible">
//                     {!logic.formData.semester && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center text-gray-400 font-medium italic backdrop-blur-[1px]">Select a semester to proceed</div>}
//                     <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider"><Filter size={16}/> Configure Session</div>
//                     <form onSubmit={logic.handleFetchStudents} className={`grid grid-cols-1 ${isUpdateMode ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-5`}>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={logic.fetchedData.batches} value={logic.formData.batch} onChange={(v)=>logic.setFormData(p=>({...p, batch:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Batch"} icon={Users} disabled={!logic.formData.semester || logic.fetchingInfo} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={logic.fetchedData.courses} value={logic.formData.course} onChange={(v)=>logic.setFormData(p=>({...p, course:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Course"} icon={BookOpen} disabled={!logic.formData.semester || logic.fetchingInfo || !logic.formData.batch} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" value={logic.formData.date} onChange={(e)=>logic.setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm" /></div>
//                         {isUpdateMode && (<div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Fetch Status</label><div className="relative"><select value={logic.fetchStatus} onChange={(e) => logic.setFetchStatus(e.target.value)} className="w-full p-3 pl-3 pr-10 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none cursor-pointer"><option value="present">Present</option><option value="absent">Absent</option></select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/></div></div>)}
//                         <div className={`${isUpdateMode ? 'md:col-span-4' : 'md:col-span-3'} mt-2 flex justify-end`}>
//                              <button type="submit" disabled={logic.loading || !logic.formData.batch || !logic.formData.course} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none transform active:scale-95">
//                                 {logic.loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} {logic.loading ? 'Fetching Roster...' : 'Get Student List'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>

//             {logic.message.text && !logic.isPreviewOpen && (<div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${getMessageStyle(logic.message.type)}`}><div className={`p-1.5 rounded-full ${logic.message.type==='success'?'bg-emerald-200':logic.message.type==='warning'?'bg-amber-200':logic.message.type==='error'?'bg-red-200':'bg-blue-200'}`}>{logic.message.type==='success'?<Check size={14} className="text-emerald-800"/>:logic.message.type==='warning'?<AlertTriangle size={14} className="text-amber-800"/>:<AlertCircle size={14} className={logic.message.type==='error'?'text-red-800':'text-blue-800'}/>}</div>{logic.message.text}</div>)}

//             {logic.students.length > 0 && !logic.loading && (
//                 <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
//                     <div className="flex flex-col md:flex-row gap-6 mb-6">
//                         <div className="md:w-1/3 space-y-4">
//                             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
//                                 <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={64} /></div>
//                                 <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">{isUpdateMode ? 'Search Results' : 'Class Strength'}</p>
//                                 <h4 className="text-3xl font-bold">{logic.students.length} <span className="text-lg font-normal opacity-80">Students</span></h4>
//                                 {isUpdateMode && <div className="mt-2 pt-2 border-t border-white/20 text-xs text-blue-100">Showing students marked <strong>{logic.fetchStatus.toUpperCase()}</strong></div>}
//                             </div>
//                             <div className="bg-gray-50 rounded-2xl p-1 border border-gray-200 flex text-sm font-bold">
//                                 <button onClick={() => logic.setMode('present')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'present' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Check size={16}/> {isUpdateMode ? 'Set Present' : 'Present'}</button>
//                                 <button onClick={() => logic.setMode('absent')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><UserX size={16}/> {isUpdateMode ? 'Set Absent' : 'Absent'}</button>
//                             </div>
//                         </div>
//                         <div className="md:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
//                             <div className="p-4 border-b border-gray-100 flex gap-3 items-center bg-gray-50 rounded-t-2xl">
//                                 <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search Roll Number..." value={logic.searchTerm} onChange={e=>logic.setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none" /></div>
//                                 <button onClick={toggleSelectAll} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${isAllSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{isAllSelected ? <CheckSquare size={14}/> : <CheckSquare size={14} className="opacity-50"/>}{isAllSelected ? 'Deselect All' : 'Select All'}</button>
//                             </div>
//                             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
//                                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//                                     {filteredStudents.map(rollNo => {
//                                         const isSelected = logic.selection.includes(rollNo);
//                                         const matchIndex = rollNo.toLowerCase().indexOf(logic.searchTerm.toLowerCase());
//                                         const highlight = logic.searchTerm && matchIndex >= 0 ? (<>{rollNo.substring(0, matchIndex)}<span className="bg-yellow-200 text-gray-900">{rollNo.substring(matchIndex, matchIndex + logic.searchTerm.length)}</span>{rollNo.substring(matchIndex + logic.searchTerm.length)}</>) : rollNo;
                                        
//                                         let borderColor = 'border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-white';
//                                         let iconColor = 'bg-gray-200 group-hover:bg-blue-200';
                                        
//                                         if (isSelected) {
//                                             if (isUpdateMode) {
//                                                 borderColor = logic.mode === 'present' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
//                                                 iconColor = logic.mode === 'present' ? 'bg-green-500' : 'bg-red-500';
//                                             } else {
//                                                 borderColor = logic.mode === 'present' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50';
//                                                 iconColor = logic.mode === 'present' ? 'bg-blue-500' : 'bg-red-500';
//                                             }
//                                         }

//                                         return (
//                                             <div key={rollNo} onClick={() => {
//                                                 logic.setSelection(prev => prev.includes(rollNo) ? prev.filter(r => r !== rollNo) : [...prev, rollNo]);
//                                             }} className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 flex items-center justify-between group overflow-hidden ${borderColor}`}>
//                                                 <span className={`font-mono text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>{highlight}</span>
//                                                 <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${iconColor}`}>{isSelected && <Check size={12} className="text-white" />}</div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                             <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
//                                 <button onClick={(e) => { e.preventDefault(); if(logic.selection.length===0 && isUpdateMode){ logic.setMessage({type:'error', text:'Select at least one student.'}); return;} logic.setIsPreviewOpen(true); }} className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-gray-300 hover:-translate-y-1 transition-all flex items-center gap-2">
//                                     {isUpdateMode ? 'Review Updates' : 'Review & Submit'} <ChevronDown size={14} className="-rotate-90"/>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <ConfirmationModal isOpen={logic.isPreviewOpen} onClose={() => logic.setIsPreviewOpen(false)} onConfirm={logic.handleSubmit} title={confirmTitle} confirmText={confirmButtonText} isSubmitting={logic.submitting}>
//                 <div className="space-y-6">
//                     <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
//                         <div className="flex items-center gap-3 pr-4 border-r border-gray-200"><div className="bg-white p-2 rounded-lg border border-gray-100"><BookOpen size={16} className="text-blue-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Course</p><p className="text-sm font-bold text-gray-800">{logic.formData.course}</p></div></div>
//                         <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg border border-gray-100"><Users size={16} className="text-purple-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Batch</p><p className="text-sm font-bold text-gray-800">{logic.formData.batch}</p></div></div>
//                     </div>
//                     {children}
//                 </div>
//             </ConfirmationModal>
//         </div>
//     );
// };

// const StudentListColumn = ({ title, count, list, color, icon: Icon }) => (
//     <div className={`border border-${color}-200 bg-${color}-50/30 rounded-2xl flex flex-col overflow-hidden`}>
//         <div className={`p-3 bg-${color}-100 border-b border-${color}-200 flex justify-between items-center`}><div className={`flex items-center gap-2 text-${color}-800 font-bold`}><Icon size={16} strokeWidth={3}/> {title}</div><span className={`bg-white text-${color}-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-${color}-200`}>{count}</span></div>
//         <div className="p-3 overflow-y-auto flex-grow custom-scrollbar"><div className="flex flex-wrap gap-2">{list.length > 0 ? list.map(roll => (<span key={roll} className={`px-3 py-1 bg-white border border-${color}-200 text-${color}-800 text-xs font-mono font-bold rounded-lg shadow-sm`}>{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No students marked {title.toLowerCase()}</div>}</div></div>
//     </div>
// );


// // --- DELETE ATTENDANCE FORM (FIXED UI & LOGIC) ---
// const DeleteAttendanceForm = ({ animate }) => {
//     const { logout } = useAuth();
//     const [formData, setFormData] = useState({ semname: '', course: '', batch: '', date: new Date().toISOString().substring(0, 10) });
//     const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
//     // Config state
//     const [semesterConfig, setSemesterConfig] = useState([]);
    
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });
    
//     // Modal States
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [confirmInput, setConfirmInput] = useState('');
//     const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', title: '', message: '' });

//     const resetForm = () => {
//         setFormData(prev => ({...prev, semname: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10)}));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setMessage({ type: '', text: '' });
//     };

//     const handleSemesterChange = async (semValue) => {
//         setFormData(prev => ({ ...prev, semname: semValue, batch: '', course: '' }));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
        
//         if (!semValue) return;

//         try {
//             const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
            
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
//             if (data.success && data.data && data.data.config) {
//                 const config = data.data.config;
//                 setSemesterConfig(config);
//                 setFetchedData({
//                     batches: config.map(item => ({ value: item.name, label: item.name })),
//                     courses: [] 
//                 });
//             }
//         } catch (err) { setMessage({ type: 'error', text: "Unable to load semester details." }); }
//     };

//     useEffect(() => {
//         if (formData.batch && semesterConfig.length > 0) {
//             const batchItem = semesterConfig.find(item => item.name === formData.batch);
//             const courses = batchItem ? batchItem.availableCourses : [];
//             setFetchedData(prev => ({
//                 ...prev,
//                 courses: courses.map(c => ({ value: c, label: c }))
//             }));
            
//             if (formData.course && !courses.includes(formData.course)) {
//                  setFormData(prev => ({ ...prev, course: '' }));
//             }
//         } else {
//              setFetchedData(prev => ({ ...prev, courses: [] }));
//         }
//     }, [formData.batch, semesterConfig]);

//     const initiateDelete = (e) => {
//         e.preventDefault();
//         setMessage({ type: '', text: '' });
//         if (!formData.semname || !formData.course || !formData.batch || !formData.date) {
//             setMessage({ type: 'error', text: 'All fields are required.' });
//             return;
//         }
//         setIsDeleteModalOpen(true);
//         setConfirmInput('');
//     };

//     const confirmDelete = async () => {
//         setLoading(true); setMessage({ type: '', text: '' });
//         try {
//             const res = await fetch(`${backendUrl}/api/admin/delete-attendance-log`, {
//                 method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData), credentials: "include"
//             });
            
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
            
//             // --- CLOSE CONFIRM MODAL REGARDLESS OF OUTCOME ---
//             setIsDeleteModalOpen(false);

//             if (res.ok) {
//                 setStatusModal({ isOpen: true, type: 'success', title: 'Deleted!', message: data.message });
//                 setTimeout(() => resetForm(), 3000);
//             } else { 
//                 // --- OPEN ERROR STATUS MODAL ---
//                 setStatusModal({ isOpen: true, type: 'error', title: 'Deletion Failed', message: data.message || 'Failed to delete.' });
//             }
//         } catch (err) { 
//             setIsDeleteModalOpen(false);
//             setStatusModal({ isOpen: true, type: 'error', title: 'System Error', message: 'Server error occurred.' });
//         } finally { setLoading(false); }
//     };

//     return (
//         <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//             <div className="flex gap-3 mb-6 items-center text-red-600"><Trash2 size={24}/><h3 className="text-2xl font-bold">Delete Records</h3></div>
//             <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
//                 <div className="bg-red-100 p-2 rounded-full text-red-600 mt-0.5"><AlertTriangle size={18} /></div>
//                 <div><h4 className="text-sm font-bold text-red-800">Irreversible Action</h4><p className="text-xs text-red-600 mt-1">Records cannot be recovered once deleted.</p></div>
//             </div>

//             <form onSubmit={initiateDelete}>
//                 <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Semester</label><div className="relative"><select name="semname" value={formData.semname} onChange={(e) => handleSemesterChange(e.target.value)} className="w-full p-3 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl outline-none"><option value="" disabled hidden>Select Sem</option>{semesters.map((sem) => (<option key={sem.value} value={sem.value}>{sem.label}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/></div></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={fetchedData.batches} value={formData.batch} onChange={(val) => setFormData(prev => ({...prev, batch: val}))} placeholder="Select Batch" icon={Users} disabled={!formData.semname} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={fetchedData.courses} value={formData.course} onChange={(val) => setFormData(prev => ({...prev, course: val}))} placeholder="Select Course" icon={BookOpen} disabled={!formData.semname || !formData.batch} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" name="date" value={formData.date} onChange={(e)=>setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none" /></div>
//                     </div>
//                 </div>
//                 <div className="flex justify-end">
//                     <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/30 flex items-center gap-2 transform active:scale-95">
//                         <Trash2 size={18} /> Delete Permanently
//                     </button>
//                 </div>
//             </form>
            
//             {message.text && !isDeleteModalOpen && (<div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}><div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>{message.type === 'success' ? <Check size={14} className="text-emerald-800"/> : <AlertCircle size={14} className="text-red-800"/>}</div>{message.text}</div>)}
            
//             {/* Delete Confirmation Modal */}
//             <ConfirmationModal 
//                 isOpen={isDeleteModalOpen} 
//                 onClose={() => setIsDeleteModalOpen(false)} 
//                 onConfirm={confirmDelete} 
//                 title="Confirm Deletion" 
//                 confirmText="Permanently Delete" 
//                 isSubmitting={loading}
//                 isConfirmDisabled={confirmInput !== 'confirm'}
//                 confirmButtonColor="red"
//             >
//                 <div className="space-y-4">
//                     <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 text-sm">
//                         You are about to delete attendance records for <strong>{formData.batch}</strong> on <strong>{formData.date}</strong>. This action cannot be undone.
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Type confirm to proceed</label>
//                         <div className="relative">
//                             <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
//                             <input 
//                                 type="text" 
//                                 placeholder="confirm" 
//                                 value={confirmInput} 
//                                 onChange={(e) => setConfirmInput(e.target.value)} 
//                                 className="w-full p-3 pl-10 border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-mono"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </ConfirmationModal>

//             {/* Status Modal for Success/Error */}
//             <StatusModal 
//                 isOpen={statusModal.isOpen} 
//                 onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} 
//                 type={statusModal.type} 
//                 title={statusModal.title} 
//                 message={statusModal.message} 
//             />
//         </div>
//     );
// };

// // --- Main Page Wrapper ---
// const AttendancePage = () => {
//     const { user } = useAuth();
//     const [animate, setAnimate] = useState(false);
//     const [activeTab, setActiveTab] = useState('mark');
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!user) navigate('/');
//         setTimeout(() => setAnimate(true), 100); 
//     }, [user, navigate]);
    
//     const tabs = [
//         { id: 'mark', label: 'Mark Attendance', icon: CheckSquare },
//         { id: 'update', label: 'Update Records', icon: Edit },
//         { id: 'delete', label: 'Delete Records', icon: Trash2 }, 
//         { id: 'scan', label: 'Scan QR', icon: QrCode },
//     ];

//     if (!user) return null;

//     return (
//         <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
//             <div className="bg-[#0F172A] pb-32 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
//                 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
//                 <div className="px-6 pt-6 relative z-10 max-w-7xl mx-auto">
//                     <Header animate={animate} />
//                     <div className="mt-8 mb-6">
//                         <SectionHeader title="Attendance Portal" animate={animate} delay={200} />
//                         <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//                             {tabs.map(tab => (
//                                 <button key={tab.id} onClick={() => tab.id === 'scan' ? navigate('/faculty/action') : setActiveTab(tab.id)}
//                                     className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-xl scale-105' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}>
//                                     <tab.icon size={16} /> {tab.label}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <main className="px-4 -mt-24 relative z-20 max-w-7xl mx-auto">
//                 {activeTab === 'mark' && <MarkAttendanceForm animate={animate} />}
//                 {activeTab === 'update' && <UpdateAttendanceForm animate={animate} />}
//                 {activeTab === 'delete' && <DeleteAttendanceForm animate={animate} />}
//             </main>
//         </div>
//     );
// };

// export default AttendancePage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//     Search, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, 
//     Users, ChevronDown, UserX, ClipboardCheck, Trash2, 
//     BookOpen, Calendar, BarChart3, Filter, QrCode, Edit, GraduationCap,
//     AlertTriangle, XCircle, Lock
// } from 'lucide-react';
// import Header from '../../components/Header';
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

// const SectionHeader = ({ title, animate, delay }) => (
//     <div className={`flex items-center mb-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
//         <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
//         <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
//     </div>
// );

// // --- NATIVE SELECT ---
// const NativeSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
//     return (
//         <div className={`relative w-full ${disabled ? 'opacity-50' : ''}`}>
//             {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"><Icon size={18} /></div>}
//             <div className="relative">
//                 <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full p-3 ${Icon ? 'pl-10' : 'pl-3'} pr-10 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none transition-all disabled:cursor-not-allowed cursor-pointer font-medium`}>
//                     <option value="" disabled hidden>{placeholder}</option>
//                     {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//                 </select>
//                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={16} /></div>
//             </div>
//         </div>
//     );
// };

// // --- STATUS MODAL (New Component for Result Messages) ---
// const StatusModal = ({ isOpen, onClose, type, title, message }) => {
//     if (!isOpen) return null;
//     const isSuccess = type === 'success';

//     return (
//         // Clean Overlay: bg-black/50 only, NO backdrop-blur
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-gray-100" onClick={e => e.stopPropagation()}>
//                 <div className={`${isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} p-6 text-center border-b`}>
//                     <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
//                         {isSuccess ? <Check size={32} strokeWidth={3} /> : <AlertTriangle size={32} strokeWidth={3} />}
//                     </div>
//                     <h3 className={`text-xl font-bold ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>{title}</h3>
//                 </div>
//                 <div className="p-6">
//                     <p className="text-center text-gray-600 text-sm mb-6 font-medium leading-relaxed">
//                         {message}
//                     </p>
//                     <button 
//                         onClick={onClose} 
//                         className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
//                     >
//                         {isSuccess ? 'Done' : 'Close'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- CONFIRMATION MODAL ---
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, isConfirmDisabled = false, children, confirmButtonColor = "blue" }) => {
//     if (!isOpen) return null;
    
//     const getColors = () => {
//         if(confirmButtonColor === 'red') return "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30";
//         return "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30";
//     }

//     return (
//         // Clean Overlay: bg-black/50 only, NO backdrop-blur
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all scale-100 border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
//                 {/* Header: Solid gray background (bg-gray-50), no transparency */}
//                 <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-3xl flex-shrink-0">
//                     <div className="flex items-center gap-3">
//                         <div className={`p-2.5 rounded-xl ${confirmButtonColor === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}><ClipboardCheck size={20} /></div>
//                         <div><h3 className="text-lg font-bold text-gray-800">{title}</h3><p className="text-xs text-gray-500">Action Confirmation</p></div>
//                     </div>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XCircle size={20}/></button>
//                 </div>
//                 <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
//                 <div className="flex justify-end gap-3 p-5 bg-gray-50 rounded-b-3xl border-t border-gray-100 flex-shrink-0">
//                     <button onClick={onClose} className="py-2.5 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">Cancel</button>
//                     <button onClick={onConfirm} disabled={isSubmitting || isConfirmDisabled} className={`py-2.5 px-6 bg-gradient-to-r ${getColors()} text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}>
//                         {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : confirmText}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- SHARED FORM LOGIC HOOK ---
// const useAttendanceForm = (endpoint, method, isUpdate = false) => {
//     const { logout } = useAuth();
//     const [formData, setFormData] = useState({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
//     const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
//     const [semesterConfig, setSemesterConfig] = useState([]);
    
//     const [students, setStudents] = useState([]);
//     const [selection, setSelection] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [fetchingInfo, setFetchingInfo] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });
//     const [mode, setMode] = useState(isUpdate ? 'absent' : 'present'); 
//     const [fetchStatus, setFetchStatus] = useState('present'); 
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isPosted, setIsPosted] = useState(false);

//     const resetForm = () => {
//         setFormData({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setStudents([]); setSelection([]); setSearchTerm(''); setMessage({ type: '', text: '' });
//         setIsPosted(false);
//         if(isUpdate) {
//             setFetchStatus('present');
//             setMode('absent'); // Reset mode to opposite of default fetch status
//         } else {
//             setMode('present');
//         }
//     };

//     const handleSemesterChange = async (semValue) => {
//         setFormData(prev => ({ ...prev, semester: semValue || '', batch: '', course: '' }));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setStudents([]); setSelection([]); setMessage({ type: '', text: '' }); setIsPosted(false);

//         if (!semValue) return;

//         setFetchingInfo(true); 
//         try {
//             const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
//             if (res.status === 401 || res.status === 403) { logout(); return; }
//             const data = await res.json();
//             if (data.success && data.data && data.data.config) {
//                 const config = data.data.config;
//                 setSemesterConfig(config);
//                 setFetchedData({
//                     batches: config.map(item => ({ value: item.name, label: item.name })),
//                     courses: []
//                 });
//             }
//         } catch (err) { setMessage({ type: 'error', text: "Unable to load details." }); } finally { setFetchingInfo(false); }
//     };

//     useEffect(() => {
//         if (formData.batch && semesterConfig.length > 0) {
//             const batchItem = semesterConfig.find(item => item.name === formData.batch);
//             const courses = batchItem ? batchItem.availableCourses : [];
//             setFetchedData(prev => ({ ...prev, courses: courses.map(c => ({ value: c, label: c })) }));
//             if (formData.course && !courses.includes(formData.course)) { setFormData(prev => ({ ...prev, course: '' })); }
//         } else { setFetchedData(prev => ({ ...prev, courses: [] })); }
//     }, [formData.batch, semesterConfig]);

//     const handleFetchStudents = async (e) => {
//         e.preventDefault();
//         setLoading(true); setMessage({ type: '', text: '' }); setStudents([]); setSelection([]); setIsPosted(false);
//         try {
//             let url;
//             if (isUpdate) {
//                 const params = new URLSearchParams({ semname: formData.semester, batch: formData.batch, date: formData.date, course: formData.course, status: fetchStatus });
//                 url = `${backendUrl}/api/admin/get-students-for-attendance-updation?${params.toString()}`;
//             } else {
//                 url = `${backendUrl}/api/students-by-batch?semname=${formData.semester}&batch=${formData.batch}`;
//             }

//             const res = await fetch(url, { method: "GET", credentials: "include" });
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
            
//             if (data.message && data.message.toLowerCase().includes("already posted")) {
//                 setIsPosted(true); setMessage({ type: 'warning', text: data.message }); return;
//             }
//             if (data.message && data.message.toLowerCase().includes("no attendance logs found")) {
//                 setMessage({ type: 'error', text: data.message }); return;
//             }

//             const sorted = (data.students || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
//             setStudents(sorted);
//             if(sorted.length === 0) {
//                 setMessage({type:'info', text: isUpdate ? `No students found with status '${fetchStatus}'.` : "No students registered in this batch."});
//             }
            
//         } catch (err) { setMessage({ type: 'error', text: "Failed to fetch student list." }); } finally { setLoading(false); }
//     };

//     const handleSubmit = async () => {
//         if (isUpdate && selection.length === 0) return setMessage({type: 'error', text: 'Select students to update.'});
//         setSubmitting(true);
//         const payload = { semname: formData.semester, course: formData.course, batch: formData.batch, date: formData.date, status: mode, students: selection };
//         try {
//             const res = await fetch(`${backendUrl}${endpoint}`, {
//                 method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: "include"
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
//                 setMessage({ type: 'success', text: isUpdate ? `${data.message} (${data.updatedCount} updated)` : data.message });
//                 setStudents([]); setSelection([]); setIsPreviewOpen(false); setTimeout(resetForm, 3000);
//             } else { setMessage({ type: 'error', text: data.message || "Operation failed." }); }
//         } catch (err) { setMessage({ type: 'error', text: "Server error." }); } finally { setSubmitting(false); }
//     };

//     return {
//         formData, setFormData, fetchedData, students, selection, setSelection,
//         loading, fetchingInfo, submitting, message, setMessage, mode, setMode,
//         isPreviewOpen, setIsPreviewOpen, searchTerm, setSearchTerm, fetchStatus, setFetchStatus,
//         handleSemesterChange, handleFetchStudents, handleSubmit, resetForm,
//         isPosted
//     };
// };

// // --- MARK ATTENDANCE FORM ---
// const MarkAttendanceForm = ({ animate }) => {
//     const logic = useAttendanceForm('/api/attendance-session-post', 'POST', false);
    
//     const presentList = logic.mode === 'present' ? logic.selection : logic.students.filter(s => !logic.selection.includes(s));
//     const absentList = logic.mode === 'present' ? logic.students.filter(s => !logic.selection.includes(s)) : logic.selection;

//     const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
//     const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
//     const toggleSelectAll = () => logic.setSelection(prev => isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]);

//     return (
//         <AttendanceUIWrapper 
//             animate={animate} title="Mark Attendance" logic={logic} filteredStudents={filteredStudents} isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll}
//             confirmTitle="Confirm Attendance" confirmButtonText="Confirm Attendance"
//         >
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[400px]">
//                 <StudentListColumn title="Present" count={presentList.length} list={presentList} color="green" icon={Check} />
//                 <StudentListColumn title="Absent" count={absentList.length} list={absentList} color="red" icon={UserX} />
//             </div>
//         </AttendanceUIWrapper>
//     );
// };

// // --- UPDATE ATTENDANCE FORM ---
// const UpdateAttendanceForm = ({ animate }) => {
//     const logic = useAttendanceForm('/api/admin/handle-update-attendance', 'PATCH', true);
//     const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
//     const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
//     const toggleSelectAll = () => logic.setSelection(prev => isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]);

//     return (
//         <AttendanceUIWrapper 
//             animate={animate} title="Update Records" logic={logic} filteredStudents={filteredStudents} isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll}
//             confirmTitle="Confirm Updates" confirmButtonText={`Update to ${logic.mode === 'present' ? 'Present' : 'Absent'}`} isUpdateMode={true}
//         >
//             <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-sm text-blue-800 flex items-center gap-2">
//                 <AlertCircle size={16}/> Changing status of <strong>{logic.selection.length}</strong> student(s) to <strong>{logic.mode.toUpperCase()}</strong>.
//             </div>
//             <div className="border border-gray-200 bg-gray-50 rounded-2xl flex flex-col overflow-hidden h-[300px]">
//                 <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center"><div className="font-bold text-gray-700">Selected Students</div><span className="bg-white text-gray-800 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">{logic.selection.length}</span></div>
//                 <div className="p-3 overflow-y-auto flex-grow custom-scrollbar"><div className="flex flex-wrap gap-2">{logic.selection.length > 0 ? logic.selection.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-gray-300 text-gray-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No students selected</div>}</div></div>
//             </div>
//         </AttendanceUIWrapper>
//     );
// };

// // --- REUSABLE UI WRAPPER ---
// const AttendanceUIWrapper = ({ animate, title, logic, filteredStudents, isAllSelected, toggleSelectAll, children, confirmTitle, confirmButtonText, isUpdateMode = false }) => {
//     const getMessageStyle = (type) => {
//         if(type === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
//         if(type === 'error') return 'bg-red-50 text-red-700 border-red-100';
//         if(type === 'warning') return 'bg-amber-50 text-amber-800 border-amber-100';
//         return 'bg-blue-50 text-blue-700 border-blue-100';
//     };
    
//     if (logic.isPosted) {
//         return (
//             <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//                 <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
//                     <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset</button>
//                 </div>
                
//                 <div className="flex flex-col items-center justify-center py-16 px-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
//                     <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={40}/></div>
//                     <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance Already Recorded</h4>
//                     <p className="text-gray-600 max-w-md mx-auto mb-6">{logic.message.text}</p>
//                     <div className="flex gap-4 text-sm text-gray-500 font-medium bg-white px-6 py-3 rounded-xl border border-amber-100 shadow-sm">
//                         <span className="flex items-center gap-2"><BookOpen size={14}/> {logic.formData.course}</span>
//                         <span className="w-px h-5 bg-gray-300"></span>
//                         <span className="flex items-center gap-2"><Users size={14}/> {logic.formData.batch}</span>
//                         <span className="w-px h-5 bg-gray-300"></span>
//                         <span className="flex items-center gap-2"><Calendar size={14}/> {formatDate(logic.formData.date)}</span>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//             <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
//                 <div><h3 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h3><p className="text-gray-500 mt-1 flex items-center gap-2 text-sm"><Calendar size={14}/> {formatDate(logic.formData.date)}</p></div>
//                 <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset</button>
//             </div>

//             <div className="mb-8">
//                 <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-400 uppercase tracking-wider"><GraduationCap size={16}/> Select Semester</div>
//                 <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
//                     {semesters.map((sem) => (
//                         <button key={sem.value} onClick={() => logic.handleSemesterChange(logic.formData.semester === sem.value ? null : sem.value)} className={`snap-start flex-shrink-0 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all duration-300 font-bold text-sm relative overflow-hidden group ${logic.formData.semester === sem.value ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white'}`}>
//                             {logic.formData.semester === sem.value && <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-xl"></div>}{sem.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             <div className={`transition-all duration-500 ease-in-out ${logic.formData.semester ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
//                 <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 relative overflow-visible">
//                     {!logic.formData.semester && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center text-gray-400 font-medium italic backdrop-blur-[1px]">Select a semester to proceed</div>}
//                     <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider"><Filter size={16}/> Configure Session</div>
//                     <form onSubmit={logic.handleFetchStudents} className={`grid grid-cols-1 ${isUpdateMode ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-5`}>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={logic.fetchedData.batches} value={logic.formData.batch} onChange={(v)=>logic.setFormData(p=>({...p, batch:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Batch"} icon={Users} disabled={!logic.formData.semester || logic.fetchingInfo} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={logic.fetchedData.courses} value={logic.formData.course} onChange={(v)=>logic.setFormData(p=>({...p, course:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Course"} icon={BookOpen} disabled={!logic.formData.semester || logic.fetchingInfo || !logic.formData.batch} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" value={logic.formData.date} onChange={(e)=>logic.setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm" /></div>
                        
//                         {/* --- MODIFIED FETCH STATUS DROPDOWN --- */}
//                         {isUpdateMode && (
//                             <div className="space-y-1">
//                                 <label className="text-xs font-semibold text-gray-500 ml-1">Fetch Status</label>
//                                 <div className="relative">
//                                     <select 
//                                         value={logic.fetchStatus} 
//                                         onChange={(e) => {
//                                             const val = e.target.value;
//                                             logic.setFetchStatus(val);
//                                             // LOGIC UPDATE: Auto switch mode based on fetch status
//                                             logic.setMode(val === 'present' ? 'absent' : 'present');
//                                         }} 
//                                         className="w-full p-3 pl-3 pr-10 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none cursor-pointer"
//                                     >
//                                         <option value="present">Present</option>
//                                         <option value="absent">Absent</option>
//                                     </select>
//                                     <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
//                                 </div>
//                             </div>
//                         )}
//                         {/* -------------------------------------- */}

//                         <div className={`${isUpdateMode ? 'md:col-span-4' : 'md:col-span-3'} mt-2 flex justify-end`}>
//                              <button type="submit" disabled={logic.loading || !logic.formData.batch || !logic.formData.course} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none transform active:scale-95">
//                                 {logic.loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} {logic.loading ? 'Fetching Roster...' : 'Get Student List'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>

//             {logic.message.text && !logic.isPreviewOpen && (<div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${getMessageStyle(logic.message.type)}`}><div className={`p-1.5 rounded-full ${logic.message.type==='success'?'bg-emerald-200':logic.message.type==='warning'?'bg-amber-200':logic.message.type==='error'?'bg-red-200':'bg-blue-200'}`}>{logic.message.type==='success'?<Check size={14} className="text-emerald-800"/>:logic.message.type==='warning'?<AlertTriangle size={14} className="text-amber-800"/>:<AlertCircle size={14} className={logic.message.type==='error'?'text-red-800':'text-blue-800'}/>}</div>{logic.message.text}</div>)}

//             {logic.students.length > 0 && !logic.loading && (
//                 <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
//                     <div className="flex flex-col md:flex-row gap-6 mb-6">
//                         <div className="md:w-1/3 space-y-4">
//                             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
//                                 <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={64} /></div>
//                                 <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">{isUpdateMode ? 'Search Results' : 'Class Strength'}</p>
//                                 <h4 className="text-3xl font-bold">{logic.students.length} <span className="text-lg font-normal opacity-80">Students</span></h4>
//                                 {isUpdateMode && <div className="mt-2 pt-2 border-t border-white/20 text-xs text-blue-100">Showing students marked <strong>{logic.fetchStatus.toUpperCase()}</strong></div>}
//                             </div>
//                             <div className="bg-gray-50 rounded-2xl p-1 border border-gray-200 flex text-sm font-bold">
//                                 <button onClick={() => logic.setMode('present')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'present' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Check size={16}/> {isUpdateMode ? 'Set Present' : 'Present'}</button>
//                                 <button onClick={() => logic.setMode('absent')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><UserX size={16}/> {isUpdateMode ? 'Set Absent' : 'Absent'}</button>
//                             </div>
//                         </div>
//                         <div className="md:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
//                             <div className="p-4 border-b border-gray-100 flex gap-3 items-center bg-gray-50 rounded-t-2xl">
//                                 <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search Roll Number..." value={logic.searchTerm} onChange={e=>logic.setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none" /></div>
//                                 <button onClick={toggleSelectAll} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${isAllSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{isAllSelected ? <CheckSquare size={14}/> : <CheckSquare size={14} className="opacity-50"/>}{isAllSelected ? 'Deselect All' : 'Select All'}</button>
//                             </div>
//                             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
//                                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//                                     {filteredStudents.map(rollNo => {
//                                         const isSelected = logic.selection.includes(rollNo);
//                                         const matchIndex = rollNo.toLowerCase().indexOf(logic.searchTerm.toLowerCase());
//                                         const highlight = logic.searchTerm && matchIndex >= 0 ? (<>{rollNo.substring(0, matchIndex)}<span className="bg-yellow-200 text-gray-900">{rollNo.substring(matchIndex, matchIndex + logic.searchTerm.length)}</span>{rollNo.substring(matchIndex + logic.searchTerm.length)}</>) : rollNo;
                                        
//                                         let borderColor = 'border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-white';
//                                         let iconColor = 'bg-gray-200 group-hover:bg-blue-200';
                                        
//                                         if (isSelected) {
//                                             if (isUpdateMode) {
//                                                 borderColor = logic.mode === 'present' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
//                                                 iconColor = logic.mode === 'present' ? 'bg-green-500' : 'bg-red-500';
//                                             } else {
//                                                 borderColor = logic.mode === 'present' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50';
//                                                 iconColor = logic.mode === 'present' ? 'bg-blue-500' : 'bg-red-500';
//                                             }
//                                         }

//                                         return (
//                                             <div key={rollNo} onClick={() => {
//                                                 logic.setSelection(prev => prev.includes(rollNo) ? prev.filter(r => r !== rollNo) : [...prev, rollNo]);
//                                             }} className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 flex items-center justify-between group overflow-hidden ${borderColor}`}>
//                                                 <span className={`font-mono text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>{highlight}</span>
//                                                 <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${iconColor}`}>{isSelected && <Check size={12} className="text-white" />}</div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                             <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
//                                 <button onClick={(e) => { e.preventDefault(); if(logic.selection.length===0 && isUpdateMode){ logic.setMessage({type:'error', text:'Select at least one student.'}); return;} logic.setIsPreviewOpen(true); }} className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-gray-300 hover:-translate-y-1 transition-all flex items-center gap-2">
//                                     {isUpdateMode ? 'Review Updates' : 'Review & Submit'} <ChevronDown size={14} className="-rotate-90"/>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <ConfirmationModal isOpen={logic.isPreviewOpen} onClose={() => logic.setIsPreviewOpen(false)} onConfirm={logic.handleSubmit} title={confirmTitle} confirmText={confirmButtonText} isSubmitting={logic.submitting}>
//                 <div className="space-y-6">
//                     <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
//                         <div className="flex items-center gap-3 pr-4 border-r border-gray-200"><div className="bg-white p-2 rounded-lg border border-gray-100"><BookOpen size={16} className="text-blue-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Course</p><p className="text-sm font-bold text-gray-800">{logic.formData.course}</p></div></div>
//                         <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg border border-gray-100"><Users size={16} className="text-purple-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Batch</p><p className="text-sm font-bold text-gray-800">{logic.formData.batch}</p></div></div>
//                     </div>
//                     {children}
//                 </div>
//             </ConfirmationModal>
//         </div>
//     );
// };

// const StudentListColumn = ({ title, count, list, color, icon: Icon }) => (
//     <div className={`border border-${color}-200 bg-${color}-50/30 rounded-2xl flex flex-col overflow-hidden`}>
//         <div className={`p-3 bg-${color}-100 border-b border-${color}-200 flex justify-between items-center`}><div className={`flex items-center gap-2 text-${color}-800 font-bold`}><Icon size={16} strokeWidth={3}/> {title}</div><span className={`bg-white text-${color}-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-${color}-200`}>{count}</span></div>
//         <div className="p-3 overflow-y-auto flex-grow custom-scrollbar"><div className="flex flex-wrap gap-2">{list.length > 0 ? list.map(roll => (<span key={roll} className={`px-3 py-1 bg-white border border-${color}-200 text-${color}-800 text-xs font-mono font-bold rounded-lg shadow-sm`}>{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No students marked {title.toLowerCase()}</div>}</div></div>
//     </div>
// );


// // --- DELETE ATTENDANCE FORM (FIXED UI & LOGIC) ---
// const DeleteAttendanceForm = ({ animate }) => {
//     const { logout } = useAuth();
//     const [formData, setFormData] = useState({ semname: '', course: '', batch: '', date: new Date().toISOString().substring(0, 10) });
//     const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
//     // Config state
//     const [semesterConfig, setSemesterConfig] = useState([]);
    
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });
    
//     // Modal States
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [confirmInput, setConfirmInput] = useState('');
//     const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', title: '', message: '' });

//     const resetForm = () => {
//         setFormData(prev => ({...prev, semname: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10)}));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
//         setMessage({ type: '', text: '' });
//     };

//     const handleSemesterChange = async (semValue) => {
//         setFormData(prev => ({ ...prev, semname: semValue, batch: '', course: '' }));
//         setFetchedData({ batches: [], courses: [] });
//         setSemesterConfig([]);
        
//         if (!semValue) return;

//         try {
//             const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
            
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
//             if (data.success && data.data && data.data.config) {
//                 const config = data.data.config;
//                 setSemesterConfig(config);
//                 setFetchedData({
//                     batches: config.map(item => ({ value: item.name, label: item.name })),
//                     courses: [] 
//                 });
//             }
//         } catch (err) { setMessage({ type: 'error', text: "Unable to load semester details." }); }
//     };

//     useEffect(() => {
//         if (formData.batch && semesterConfig.length > 0) {
//             const batchItem = semesterConfig.find(item => item.name === formData.batch);
//             const courses = batchItem ? batchItem.availableCourses : [];
//             setFetchedData(prev => ({
//                 ...prev,
//                 courses: courses.map(c => ({ value: c, label: c }))
//             }));
            
//             if (formData.course && !courses.includes(formData.course)) {
//                  setFormData(prev => ({ ...prev, course: '' }));
//             }
//         } else {
//              setFetchedData(prev => ({ ...prev, courses: [] }));
//         }
//     }, [formData.batch, semesterConfig]);

//     const initiateDelete = (e) => {
//         e.preventDefault();
//         setMessage({ type: '', text: '' });
//         if (!formData.semname || !formData.course || !formData.batch || !formData.date) {
//             setMessage({ type: 'error', text: 'All fields are required.' });
//             return;
//         }
//         setIsDeleteModalOpen(true);
//         setConfirmInput('');
//     };

//     const confirmDelete = async () => {
//         setLoading(true); setMessage({ type: '', text: '' });
//         try {
//             const res = await fetch(`${backendUrl}/api/admin/delete-attendance-log`, {
//                 method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData), credentials: "include"
//             });
            
//             if (res.status === 401 || res.status === 403) { logout(); return; }

//             const data = await res.json();
            
//             // --- CLOSE CONFIRM MODAL REGARDLESS OF OUTCOME ---
//             setIsDeleteModalOpen(false);

//             if (res.ok) {
//                 setStatusModal({ isOpen: true, type: 'success', title: 'Deleted!', message: data.message });
//                 setTimeout(() => resetForm(), 3000);
//             } else { 
//                 // --- OPEN ERROR STATUS MODAL ---
//                 setStatusModal({ isOpen: true, type: 'error', title: 'Deletion Failed', message: data.message || 'Failed to delete.' });
//             }
//         } catch (err) { 
//             setIsDeleteModalOpen(false);
//             setStatusModal({ isOpen: true, type: 'error', title: 'System Error', message: 'Server error occurred.' });
//         } finally { setLoading(false); }
//     };

//     return (
//         <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//             <div className="flex gap-3 mb-6 items-center text-red-600"><Trash2 size={24}/><h3 className="text-2xl font-bold">Delete Records</h3></div>
//             <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
//                 <div className="bg-red-100 p-2 rounded-full text-red-600 mt-0.5"><AlertTriangle size={18} /></div>
//                 <div><h4 className="text-sm font-bold text-red-800">Irreversible Action</h4><p className="text-xs text-red-600 mt-1">Records cannot be recovered once deleted.</p></div>
//             </div>

//             <form onSubmit={initiateDelete}>
//                 <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Semester</label><div className="relative"><select name="semname" value={formData.semname} onChange={(e) => handleSemesterChange(e.target.value)} className="w-full p-3 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl outline-none"><option value="" disabled hidden>Select Sem</option>{semesters.map((sem) => (<option key={sem.value} value={sem.value}>{sem.label}</option>))}</select></div></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={fetchedData.batches} value={formData.batch} onChange={(val) => setFormData(prev => ({...prev, batch: val}))} placeholder="Select Batch" icon={Users} disabled={!formData.semname} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={fetchedData.courses} value={formData.course} onChange={(val) => setFormData(prev => ({...prev, course: val}))} placeholder="Select Course" icon={BookOpen} disabled={!formData.semname || !formData.batch} /></div>
//                         <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" name="date" value={formData.date} onChange={(e)=>setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none" /></div>
//                     </div>
//                 </div>
//                 <div className="flex justify-end">
//                     <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/30 flex items-center gap-2 transform active:scale-95">
//                         <Trash2 size={18} /> Delete Permanently
//                     </button>
//                 </div>
//             </form>
            
//             {message.text && !isDeleteModalOpen && (<div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}><div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>{message.type === 'success' ? <Check size={14} className="text-emerald-800"/> : <AlertCircle size={14} className="text-red-800"/>}</div>{message.text}</div>)}
            
//             {/* Delete Confirmation Modal */}
//             <ConfirmationModal 
//                 isOpen={isDeleteModalOpen} 
//                 onClose={() => setIsDeleteModalOpen(false)} 
//                 onConfirm={confirmDelete} 
//                 title="Confirm Deletion" 
//                 confirmText="Permanently Delete" 
//                 isSubmitting={loading}
//                 isConfirmDisabled={confirmInput !== 'confirm'}
//                 confirmButtonColor="red"
//             >
//                 <div className="space-y-4">
//                     <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 text-sm">
//                         You are about to delete attendance records for <strong>{formData.batch}</strong> on <strong>{formData.date}</strong>. This action cannot be undone.
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Type confirm to proceed</label>
//                         <div className="relative">
//                             <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
//                             <input 
//                                 type="text" 
//                                 placeholder="confirm" 
//                                 value={confirmInput} 
//                                 onChange={(e) => setConfirmInput(e.target.value)} 
//                                 className="w-full p-3 pl-10 border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-mono"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </ConfirmationModal>

//             {/* Status Modal for Success/Error */}
//             <StatusModal 
//                 isOpen={statusModal.isOpen} 
//                 onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} 
//                 type={statusModal.type} 
//                 title={statusModal.title} 
//                 message={statusModal.message} 
//             />
//         </div>
//     );
// };

// // --- Main Page Wrapper ---
// const AttendancePage = () => {
//     const { user } = useAuth();
//     const [animate, setAnimate] = useState(false);
//     const [activeTab, setActiveTab] = useState('mark');
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!user) navigate('/');
//         setTimeout(() => setAnimate(true), 100); 
//     }, [user, navigate]);
    
//     const tabs = [
//         { id: 'mark', label: 'Mark Attendance', icon: CheckSquare },
//         { id: 'update', label: 'Update Records', icon: Edit },
//         { id: 'delete', label: 'Delete Records', icon: Trash2 }, 
//         { id: 'scan', label: 'Scan QR', icon: QrCode },
//     ];

//     if (!user) return null;

//     return (
//         <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
//             <div className="bg-[#0F172A] pb-32 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
//                 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
//                 <div className="px-6 pt-6 relative z-10 max-w-7xl mx-auto">
//                     <Header animate={animate} />
//                     <div className="mt-8 mb-6">
//                         <SectionHeader title="Attendance Portal" animate={animate} delay={200} />
//                         <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//                             {tabs.map(tab => (
//                                 <button key={tab.id} onClick={() => tab.id === 'scan' ? navigate('/faculty/action') : setActiveTab(tab.id)}
//                                     className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-xl scale-105' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}>
//                                     <tab.icon size={16} /> {tab.label}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <main className="px-4 -mt-24 relative z-20 max-w-7xl mx-auto">
//                 {activeTab === 'mark' && <MarkAttendanceForm animate={animate} />}
//                 {activeTab === 'update' && <UpdateAttendanceForm animate={animate} />}
//                 {activeTab === 'delete' && <DeleteAttendanceForm animate={animate} />}
//             </main>
//         </div>
//     );
// };

// export default AttendancePage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, CheckSquare, Loader2, Check, AlertCircle, RefreshCw, 
    Users, ChevronDown, UserX, ClipboardCheck, Trash2, 
    BookOpen, Calendar, BarChart3, Filter, QrCode, Edit, GraduationCap,
    AlertTriangle, XCircle, Lock
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext'; 
import CryptoJS from 'crypto-js'; // Import CryptoJS

// --- CONFIGURATION ---
const backendUrl = import.meta.env.VITE_BASE_URL;
const EncDec_SECRET_KEY = import.meta.env.VITE_ENC_SECRET_KEY; // Get Secret Key

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

const SectionHeader = ({ title, animate, delay }) => (
    <div className={`flex items-center mb-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
);

// --- NATIVE SELECT ---
const NativeSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
    return (
        <div className={`relative w-full ${disabled ? 'opacity-50' : ''}`}>
            {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"><Icon size={18} /></div>}
            <div className="relative">
                <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full p-3 ${Icon ? 'pl-10' : 'pl-3'} pr-10 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none transition-all disabled:cursor-not-allowed cursor-pointer font-medium`}>
                    <option value="" disabled hidden>{placeholder}</option>
                    {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={16} /></div>
            </div>
        </div>
    );
};

// --- STATUS MODAL (New Component for Result Messages) ---
const StatusModal = ({ isOpen, onClose, type, title, message }) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';

    return (
        // Clean Overlay: bg-black/50 only, NO backdrop-blur
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-gray-100" onClick={e => e.stopPropagation()}>
                <div className={`${isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} p-6 text-center border-b`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {isSuccess ? <Check size={32} strokeWidth={3} /> : <AlertTriangle size={32} strokeWidth={3} />}
                    </div>
                    <h3 className={`text-xl font-bold ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-center text-gray-600 text-sm mb-6 font-medium leading-relaxed">
                        {message}
                    </p>
                    <button 
                        onClick={onClose} 
                        className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                    >
                        {isSuccess ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CONFIRMATION MODAL ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, confirmText, isSubmitting, isConfirmDisabled = false, children, confirmButtonColor = "blue" }) => {
    if (!isOpen) return null;
    
    const getColors = () => {
        if(confirmButtonColor === 'red') return "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30";
        return "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30";
    }

    return (
        // Clean Overlay: bg-black/50 only, NO backdrop-blur
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all scale-100 border border-gray-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header: Solid gray background (bg-gray-50), no transparency */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-3xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${confirmButtonColor === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}><ClipboardCheck size={20} /></div>
                        <div><h3 className="text-lg font-bold text-gray-800">{title}</h3><p className="text-xs text-gray-500">Action Confirmation</p></div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XCircle size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
                <div className="flex justify-end gap-3 p-5 bg-gray-50 rounded-b-3xl border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose} className="py-2.5 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">Cancel</button>
                    <button onClick={onConfirm} disabled={isSubmitting || isConfirmDisabled} className={`py-2.5 px-6 bg-gradient-to-r ${getColors()} text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SHARED FORM LOGIC HOOK ---
const useAttendanceForm = (endpoint, method, isUpdate = false) => {
    const { logout } = useAuth();
    const [formData, setFormData] = useState({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
    const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
    const [semesterConfig, setSemesterConfig] = useState([]);
    
    const [students, setStudents] = useState([]);
    const [selection, setSelection] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingInfo, setFetchingInfo] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mode, setMode] = useState(isUpdate ? 'absent' : 'present'); 
    const [fetchStatus, setFetchStatus] = useState('present'); 
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPosted, setIsPosted] = useState(false);

    const resetForm = () => {
        setFormData({ semester: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10) });
        setFetchedData({ batches: [], courses: [] });
        setSemesterConfig([]);
        setStudents([]); setSelection([]); setSearchTerm(''); setMessage({ type: '', text: '' });
        setIsPosted(false);
        if(isUpdate) {
            setFetchStatus('present');
            setMode('absent'); // Reset mode to opposite of default fetch status
        } else {
            setMode('present');
        }
    };

    const handleSemesterChange = async (semValue) => {
        setFormData(prev => ({ ...prev, semester: semValue || '', batch: '', course: '' }));
        setFetchedData({ batches: [], courses: [] });
        setSemesterConfig([]);
        setStudents([]); setSelection([]); setMessage({ type: '', text: '' }); setIsPosted(false);

        if (!semValue) return;

        setFetchingInfo(true); 
        try {
            // GET Request: Plain URL Params
            const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
            if (res.status === 401 || res.status === 403) { logout(); return; }
            const rawJson = await res.json();
            // DECRYPT RESPONSE
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;

            if (data.success && data.data && data.data.config) {
                const config = data.data.config;
                setSemesterConfig(config);
                setFetchedData({
                    batches: config.map(item => ({ value: item.name, label: item.name })),
                    courses: []
                });
            }
        } catch (err) { setMessage({ type: 'error', text: "Unable to load details." }); } finally { setFetchingInfo(false); }
    };

    useEffect(() => {
        if (formData.batch && semesterConfig.length > 0) {
            const batchItem = semesterConfig.find(item => item.name === formData.batch);
            const courses = batchItem ? batchItem.availableCourses : [];
            setFetchedData(prev => ({ ...prev, courses: courses.map(c => ({ value: c, label: c })) }));
            if (formData.course && !courses.includes(formData.course)) { setFormData(prev => ({ ...prev, course: '' })); }
        } else { setFetchedData(prev => ({ ...prev, courses: [] })); }
    }, [formData.batch, semesterConfig]);

    const handleFetchStudents = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: '', text: '' }); setStudents([]); setSelection([]); setIsPosted(false);
        try {
            let url;
            if (isUpdate) {
                const params = new URLSearchParams({ semname: formData.semester, batch: formData.batch, date: formData.date, course: formData.course, status: fetchStatus });
                url = `${backendUrl}/api/admin/get-students-for-attendance-updation?${params.toString()}`;
            } else {
                url = `${backendUrl}/api/students-by-batch?semname=${formData.semester}&batch=${formData.batch}`;
            }

            // GET Request: Plain URL Params
            const res = await fetch(url, { method: "GET", credentials: "include" });
            if (res.status === 401 || res.status === 403) { logout(); return; }

            const rawJson = await res.json();
            // DECRYPT RESPONSE
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;
            
            if (data.message && data.message.toLowerCase().includes("already posted")) {
                setIsPosted(true); setMessage({ type: 'warning', text: data.message }); return;
            }
            if (data.message && data.message.toLowerCase().includes("no attendance logs found")) {
                setMessage({ type: 'error', text: data.message }); return;
            }

            const sorted = (data.students || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            setStudents(sorted);
            if(sorted.length === 0) {
                setMessage({type:'info', text: isUpdate ? `No students found with status '${fetchStatus}'.` : "No students registered in this batch."});
            }
            
        } catch (err) { setMessage({ type: 'error', text: "Failed to fetch student list." }); } finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (isUpdate && selection.length === 0) return setMessage({type: 'error', text: 'Select students to update.'});
        setSubmitting(true);
        const payload = { semname: formData.semester, course: formData.course, batch: formData.batch, date: formData.date, status: mode, students: selection };
        try {
            // POST/PATCH: ENCRYPT Body
            const encryptedBody = encryptData(payload);

            const res = await fetch(`${backendUrl}${endpoint}`, {
                method: method, headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ data: encryptedBody }), 
                credentials: "include"
            });
            if (res.status === 401 || res.status === 403) { logout(); return; }

            const rawJson = await res.json();
            // DECRYPT RESPONSE
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;
            
            if (data.message && data.message.toLowerCase().includes("attendance already posted")) {
                setIsPosted(true);
                setMessage({ type: 'warning', text: data.message });
                setIsPreviewOpen(false);
                setSubmitting(false);
                return; 
            }

            if (res.ok) {
                setMessage({ type: 'success', text: isUpdate ? `${data.message} (${data.updatedCount} updated)` : data.message });
                setStudents([]); setSelection([]); setIsPreviewOpen(false); setTimeout(resetForm, 3000);
            } else { setMessage({ type: 'error', text: data.message || "Operation failed." }); }
        } catch (err) { setMessage({ type: 'error', text: "Server error." }); } finally { setSubmitting(false); }
    };

    return {
        formData, setFormData, fetchedData, students, selection, setSelection,
        loading, fetchingInfo, submitting, message, setMessage, mode, setMode,
        isPreviewOpen, setIsPreviewOpen, searchTerm, setSearchTerm, fetchStatus, setFetchStatus,
        handleSemesterChange, handleFetchStudents, handleSubmit, resetForm,
        isPosted
    };
};

// --- MARK ATTENDANCE FORM ---
const MarkAttendanceForm = ({ animate }) => {
    const logic = useAttendanceForm('/api/attendance-session-post', 'POST', false);
    
    const presentList = logic.mode === 'present' ? logic.selection : logic.students.filter(s => !logic.selection.includes(s));
    const absentList = logic.mode === 'present' ? logic.students.filter(s => !logic.selection.includes(s)) : logic.selection;

    const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
    const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
    const toggleSelectAll = () => logic.setSelection(prev => isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]);

    return (
        <AttendanceUIWrapper 
            animate={animate} title="Mark Attendance" logic={logic} filteredStudents={filteredStudents} isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll}
            confirmTitle="Confirm Attendance" confirmButtonText="Confirm Attendance"
        >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[400px]">
                <StudentListColumn title="Present" count={presentList.length} list={presentList} color="green" icon={Check} />
                <StudentListColumn title="Absent" count={absentList.length} list={absentList} color="red" icon={UserX} />
            </div>
        </AttendanceUIWrapper>
    );
};

// --- UPDATE ATTENDANCE FORM ---
const UpdateAttendanceForm = ({ animate }) => {
    const logic = useAttendanceForm('/api/admin/handle-update-attendance', 'PATCH', true);
    const filteredStudents = logic.students.filter(r => r.toLowerCase().includes(logic.searchTerm.toLowerCase()));
    const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => logic.selection.includes(s));
    const toggleSelectAll = () => logic.setSelection(prev => isAllSelected ? prev.filter(s => !filteredStudents.includes(s)) : [...new Set([...prev, ...filteredStudents])]);

    return (
        <AttendanceUIWrapper 
            animate={animate} title="Update Records" logic={logic} filteredStudents={filteredStudents} isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll}
            confirmTitle="Confirm Updates" confirmButtonText={`Update to ${logic.mode === 'present' ? 'Present' : 'Absent'}`} isUpdateMode={true}
        >
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-sm text-blue-800 flex items-center gap-2">
                <AlertCircle size={16}/> Changing status of <strong>{logic.selection.length}</strong> student(s) to <strong>{logic.mode.toUpperCase()}</strong>.
            </div>
            <div className="border border-gray-200 bg-gray-50 rounded-2xl flex flex-col overflow-hidden h-[300px]">
                <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center"><div className="font-bold text-gray-700">Selected Students</div><span className="bg-white text-gray-800 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">{logic.selection.length}</span></div>
                <div className="p-3 overflow-y-auto flex-grow custom-scrollbar"><div className="flex flex-wrap gap-2">{logic.selection.length > 0 ? logic.selection.map(roll => (<span key={roll} className="px-3 py-1 bg-white border border-gray-300 text-gray-800 text-xs font-mono font-bold rounded-lg shadow-sm">{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No students selected</div>}</div></div>
            </div>
        </AttendanceUIWrapper>
    );
};

// --- REUSABLE UI WRAPPER ---
const AttendanceUIWrapper = ({ animate, title, logic, filteredStudents, isAllSelected, toggleSelectAll, children, confirmTitle, confirmButtonText, isUpdateMode = false }) => {
    const getMessageStyle = (type) => {
        if(type === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if(type === 'error') return 'bg-red-50 text-red-700 border-red-100';
        if(type === 'warning') return 'bg-amber-50 text-amber-800 border-amber-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };
    
    if (logic.isPosted) {
        return (
            <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset</button>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={40}/></div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance Already Recorded</h4>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">{logic.message.text}</p>
                    <div className="flex gap-4 text-sm text-gray-500 font-medium bg-white px-6 py-3 rounded-xl border border-amber-100 shadow-sm">
                        <span className="flex items-center gap-2"><BookOpen size={14}/> {logic.formData.course}</span>
                        <span className="w-px h-5 bg-gray-300"></span>
                        <span className="flex items-center gap-2"><Users size={14}/> {logic.formData.batch}</span>
                        <span className="w-px h-5 bg-gray-300"></span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> {formatDate(logic.formData.date)}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div><h3 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h3><p className="text-gray-500 mt-1 flex items-center gap-2 text-sm"><Calendar size={14}/> {formatDate(logic.formData.date)}</p></div>
                <button onClick={logic.resetForm} className="group flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-medium"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset</button>
            </div>

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

            <div className={`transition-all duration-500 ease-in-out ${logic.formData.semester ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 relative overflow-visible">
                    {!logic.formData.semester && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center text-gray-400 font-medium italic backdrop-blur-[1px]">Select a semester to proceed</div>}
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider"><Filter size={16}/> Configure Session</div>
                    <form onSubmit={logic.handleFetchStudents} className={`grid grid-cols-1 ${isUpdateMode ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-5`}>
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={logic.fetchedData.batches} value={logic.formData.batch} onChange={(v)=>logic.setFormData(p=>({...p, batch:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Batch"} icon={Users} disabled={!logic.formData.semester || logic.fetchingInfo} /></div>
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={logic.fetchedData.courses} value={logic.formData.course} onChange={(v)=>logic.setFormData(p=>({...p, course:v}))} placeholder={logic.fetchingInfo ? "Loading..." : "Select Course"} icon={BookOpen} disabled={!logic.formData.semester || logic.fetchingInfo || !logic.formData.batch} /></div>
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" value={logic.formData.date} onChange={(e)=>logic.setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm" /></div>
                        
                        {/* --- MODIFIED FETCH STATUS DROPDOWN --- */}
                        {isUpdateMode && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Fetch Status</label>
                                <div className="relative">
                                    <select 
                                        value={logic.fetchStatus} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            logic.setFetchStatus(val);
                                            // LOGIC UPDATE: Auto switch mode based on fetch status
                                            logic.setMode(val === 'present' ? 'absent' : 'present');
                                        }} 
                                        className="w-full p-3 pl-3 pr-10 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 block appearance-none outline-none cursor-pointer"
                                    >
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                                </div>
                            </div>
                        )}
                        {/* -------------------------------------- */}

                        <div className={`${isUpdateMode ? 'md:col-span-4' : 'md:col-span-3'} mt-2 flex justify-end`}>
                             <button type="submit" disabled={logic.loading || !logic.formData.batch || !logic.formData.course} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none transform active:scale-95">
                                {logic.loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} {logic.loading ? 'Fetching Roster...' : 'Get Student List'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {logic.message.text && !logic.isPreviewOpen && (<div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${getMessageStyle(logic.message.type)}`}><div className={`p-1.5 rounded-full ${logic.message.type==='success'?'bg-emerald-200':logic.message.type==='warning'?'bg-amber-200':logic.message.type==='error'?'bg-red-200':'bg-blue-200'}`}>{logic.message.type==='success'?<Check size={14} className="text-emerald-800"/>:logic.message.type==='warning'?<AlertTriangle size={14} className="text-amber-800"/>:<AlertCircle size={14} className={logic.message.type==='error'?'text-red-800':'text-blue-800'}/>}</div>{logic.message.text}</div>)}

            {logic.students.length > 0 && !logic.loading && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="md:w-1/3 space-y-4">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={64} /></div>
                                <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">{isUpdateMode ? 'Search Results' : 'Class Strength'}</p>
                                <h4 className="text-3xl font-bold">{logic.students.length} <span className="text-lg font-normal opacity-80">Students</span></h4>
                                {isUpdateMode && <div className="mt-2 pt-2 border-t border-white/20 text-xs text-blue-100">Showing students marked <strong>{logic.fetchStatus.toUpperCase()}</strong></div>}
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-1 border border-gray-200 flex text-sm font-bold">
                                <button onClick={() => logic.setMode('present')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'present' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Check size={16}/> {isUpdateMode ? 'Set Present' : 'Present'}</button>
                                <button onClick={() => logic.setMode('absent')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${logic.mode === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><UserX size={16}/> {isUpdateMode ? 'Set Absent' : 'Absent'}</button>
                            </div>
                        </div>
                        <div className="md:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
                            <div className="p-4 border-b border-gray-100 flex gap-3 items-center bg-gray-50 rounded-t-2xl">
                                <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search Roll Number..." value={logic.searchTerm} onChange={e=>logic.setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none" /></div>
                                <button onClick={toggleSelectAll} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${isAllSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{isAllSelected ? <CheckSquare size={14}/> : <CheckSquare size={14} className="opacity-50"/>}{isAllSelected ? 'Deselect All' : 'Select All'}</button>
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
                                            if (isUpdateMode) {
                                                borderColor = logic.mode === 'present' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
                                                iconColor = logic.mode === 'present' ? 'bg-green-500' : 'bg-red-500';
                                            } else {
                                                borderColor = logic.mode === 'present' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50';
                                                iconColor = logic.mode === 'present' ? 'bg-blue-500' : 'bg-red-500';
                                            }
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
                            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                                <button onClick={(e) => { e.preventDefault(); if(logic.selection.length===0 && isUpdateMode){ logic.setMessage({type:'error', text:'Select at least one student.'}); return;} logic.setIsPreviewOpen(true); }} className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-gray-300 hover:-translate-y-1 transition-all flex items-center gap-2">
                                    {isUpdateMode ? 'Review Updates' : 'Review & Submit'} <ChevronDown size={14} className="-rotate-90"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal isOpen={logic.isPreviewOpen} onClose={() => logic.setIsPreviewOpen(false)} onConfirm={logic.handleSubmit} title={confirmTitle} confirmText={confirmButtonText} isSubmitting={logic.submitting}>
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 pr-4 border-r border-gray-200"><div className="bg-white p-2 rounded-lg border border-gray-100"><BookOpen size={16} className="text-blue-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Course</p><p className="text-sm font-bold text-gray-800">{logic.formData.course}</p></div></div>
                        <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg border border-gray-100"><Users size={16} className="text-purple-500"/></div><div><p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Batch</p><p className="text-sm font-bold text-gray-800">{logic.formData.batch}</p></div></div>
                    </div>
                    {children}
                </div>
            </ConfirmationModal>
        </div>
    );
};

const StudentListColumn = ({ title, count, list, color, icon: Icon }) => (
    <div className={`border border-${color}-200 bg-${color}-50/30 rounded-2xl flex flex-col overflow-hidden`}>
        <div className={`p-3 bg-${color}-100 border-b border-${color}-200 flex justify-between items-center`}><div className={`flex items-center gap-2 text-${color}-800 font-bold`}><Icon size={16} strokeWidth={3}/> {title}</div><span className={`bg-white text-${color}-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-${color}-200`}>{count}</span></div>
        <div className="p-3 overflow-y-auto flex-grow custom-scrollbar"><div className="flex flex-wrap gap-2">{list.length > 0 ? list.map(roll => (<span key={roll} className={`px-3 py-1 bg-white border border-${color}-200 text-${color}-800 text-xs font-mono font-bold rounded-lg shadow-sm`}>{roll}</span>)) : <div className="w-full text-center text-gray-400 text-xs py-10 italic">No students marked {title.toLowerCase()}</div>}</div></div>
    </div>
);


// --- DELETE ATTENDANCE FORM (FIXED UI & LOGIC) ---
const DeleteAttendanceForm = ({ animate }) => {
    const { logout } = useAuth();
    const [formData, setFormData] = useState({ semname: '', course: '', batch: '', date: new Date().toISOString().substring(0, 10) });
    const [fetchedData, setFetchedData] = useState({ batches: [], courses: [] });
    // Config state
    const [semesterConfig, setSemesterConfig] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmInput, setConfirmInput] = useState('');
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', title: '', message: '' });

    const resetForm = () => {
        setFormData(prev => ({...prev, semname: '', batch: '', course: '', date: new Date().toISOString().substring(0, 10)}));
        setFetchedData({ batches: [], courses: [] });
        setSemesterConfig([]);
        setMessage({ type: '', text: '' });
    };

    const handleSemesterChange = async (semValue) => {
        setFormData(prev => ({ ...prev, semname: semValue, batch: '', course: '' }));
        setFetchedData({ batches: [], courses: [] });
        setSemesterConfig([]);
        
        if (!semValue) return;

        try {
            // GET Request: Plain Params, Decrypted Response
            const res = await fetch(`${backendUrl}/api/get-sem-config/${semValue}`, { method: "GET", credentials: "include" });
            
            if (res.status === 401 || res.status === 403) { logout(); return; }

            const rawJson = await res.json();
            // DECRYPT RESPONSE
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;

            if (data.success && data.data && data.data.config) {
                const config = data.data.config;
                setSemesterConfig(config);
                setFetchedData({
                    batches: config.map(item => ({ value: item.name, label: item.name })),
                    courses: [] 
                });
            }
        } catch (err) { setMessage({ type: 'error', text: "Unable to load semester details." }); }
    };

    useEffect(() => {
        if (formData.batch && semesterConfig.length > 0) {
            const batchItem = semesterConfig.find(item => item.name === formData.batch);
            const courses = batchItem ? batchItem.availableCourses : [];
            setFetchedData(prev => ({
                ...prev,
                courses: courses.map(c => ({ value: c, label: c }))
            }));
            
            if (formData.course && !courses.includes(formData.course)) {
                 setFormData(prev => ({ ...prev, course: '' }));
            }
        } else {
             setFetchedData(prev => ({ ...prev, courses: [] }));
        }
    }, [formData.batch, semesterConfig]);

    const initiateDelete = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!formData.semname || !formData.course || !formData.batch || !formData.date) {
            setMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }
        setIsDeleteModalOpen(true);
        setConfirmInput('');
    };

    const confirmDelete = async () => {
        setLoading(true); setMessage({ type: '', text: '' });
        try {
            // DELETE: Encrypt Body
            const encryptedBody = encryptData(formData);

            const res = await fetch(`${backendUrl}/api/admin/delete-attendance-log`, {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ data: encryptedBody }), 
                credentials: "include"
            });
            
            if (res.status === 401 || res.status === 403) { logout(); return; }

            const rawJson = await res.json();
            // DELETE: Decrypt Response
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;
            
            // --- CLOSE CONFIRM MODAL REGARDLESS OF OUTCOME ---
            setIsDeleteModalOpen(false);

            if (res.ok) {
                setStatusModal({ isOpen: true, type: 'success', title: 'Deleted!', message: data.message });
                setTimeout(() => resetForm(), 3000);
            } else { 
                // --- OPEN ERROR STATUS MODAL ---
                setStatusModal({ isOpen: true, type: 'error', title: 'Deletion Failed', message: data.message || 'Failed to delete.' });
            }
        } catch (err) { 
            setIsDeleteModalOpen(false);
            setStatusModal({ isOpen: true, type: 'error', title: 'System Error', message: 'Server error occurred.' });
        } finally { setLoading(false); }
    };

    return (
        <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex gap-3 mb-6 items-center text-red-600"><Trash2 size={24}/><h3 className="text-2xl font-bold">Delete Records</h3></div>
            <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="bg-red-100 p-2 rounded-full text-red-600 mt-0.5"><AlertTriangle size={18} /></div>
                <div><h4 className="text-sm font-bold text-red-800">Irreversible Action</h4><p className="text-xs text-red-600 mt-1">Records cannot be recovered once deleted.</p></div>
            </div>

            <form onSubmit={initiateDelete}>
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Semester</label><div className="relative"><select name="semname" value={formData.semname} onChange={(e) => handleSemesterChange(e.target.value)} className="w-full p-3 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl outline-none"><option value="" disabled hidden>Select Sem</option>{semesters.map((sem) => (<option key={sem.value} value={sem.value}>{sem.label}</option>))}</select></div></div>
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Batch</label><NativeSelect options={fetchedData.batches} value={formData.batch} onChange={(val) => setFormData(prev => ({...prev, batch: val}))} placeholder="Select Batch" icon={Users} disabled={!formData.semname} /></div>
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Course</label><NativeSelect options={fetchedData.courses} value={formData.course} onChange={(val) => setFormData(prev => ({...prev, course: val}))} placeholder="Select Course" icon={BookOpen} disabled={!formData.semname || !formData.batch} /></div>
                        <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 ml-1">Date</label><input type="date" name="date" value={formData.date} onChange={(e)=>setFormData(p=>({...p, date:e.target.value}))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none" /></div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/30 flex items-center gap-2 transform active:scale-95">
                        <Trash2 size={18} /> Delete Permanently
                    </button>
                </div>
            </form>
            
            {message.text && !isDeleteModalOpen && (<div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}><div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>{message.type === 'success' ? <Check size={14} className="text-emerald-800"/> : <AlertCircle size={14} className="text-red-800"/>}</div>{message.text}</div>)}
            
            {/* Delete Confirmation Modal */}
            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={confirmDelete} 
                title="Confirm Deletion" 
                confirmText="Permanently Delete" 
                isSubmitting={loading}
                isConfirmDisabled={confirmInput !== 'confirm'}
                confirmButtonColor="red"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 text-sm">
                        You are about to delete attendance records for <strong>{formData.batch}</strong> on <strong>{formData.date}</strong>. This action cannot be undone.
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">Type confirm to proceed</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="confirm" 
                                value={confirmInput} 
                                onChange={(e) => setConfirmInput(e.target.value)} 
                                className="w-full p-3 pl-10 border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>
            </ConfirmationModal>

            {/* Status Modal for Success/Error */}
            <StatusModal 
                isOpen={statusModal.isOpen} 
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} 
                type={statusModal.type} 
                title={statusModal.title} 
                message={statusModal.message} 
            />
        </div>
    );
};

// --- Main Page Wrapper ---
const AttendancePage = () => {
    const { user } = useAuth();
    const [animate, setAnimate] = useState(false);
    const [activeTab, setActiveTab] = useState('mark');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
        setTimeout(() => setAnimate(true), 100); 
    }, [user, navigate]);
    
    const tabs = [
        { id: 'mark', label: 'Mark Attendance', icon: CheckSquare },
        { id: 'update', label: 'Update Records', icon: Edit },
        { id: 'delete', label: 'Delete Records', icon: Trash2 }, 
        { id: 'scan', label: 'Scan QR', icon: QrCode },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen font-sans bg-[#F3F4F6] pb-10">
            <div className="bg-[#0F172A] pb-32 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                <div className="px-6 pt-6 relative z-10 max-w-7xl mx-auto">
                    <Header animate={animate} />
                    <div className="mt-8 mb-6">
                        <SectionHeader title="Attendance Portal" animate={animate} delay={200} />
                        <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => tab.id === 'scan' ? navigate('/faculty/action') : setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-xl scale-105' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}>
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <main className="px-4 -mt-24 relative z-20 max-w-7xl mx-auto">
                {activeTab === 'mark' && <MarkAttendanceForm animate={animate} />}
                {activeTab === 'update' && <UpdateAttendanceForm animate={animate} />}
                {activeTab === 'delete' && <DeleteAttendanceForm animate={animate} />}
            </main>
        </div>
    );
};

export default AttendancePage;