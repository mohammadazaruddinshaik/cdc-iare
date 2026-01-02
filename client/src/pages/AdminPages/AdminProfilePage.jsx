// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//     User, Mail, Lock, X, Eye, EyeOff, 
//     Loader2, CheckCircle, AlertTriangle, 
//     ShieldCheck, Fingerprint, Edit, Save, 
//     Calendar, Activity
// } from 'lucide-react';
// import Header from '../../components/Header'; 
// import { useAuth } from '../../context/AuthContext'; 
// import Loader from '../../components/Loader'; // IMPORTED LOADER

// // --- CONFIGURATION ---
// const backendUrl = import.meta.env.VITE_BASE_URL;

// // --- SUB-COMPONENTS ---

// const ProfileDetailCard = ({ icon, label, value, variant = 'default' }) => {
//     const variants = {
//         default: 'bg-white/80 border-white/50 hover:shadow-xl',
//         primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-blue-100',
//         secondary: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-purple-100'
//     };

//     return (
//         <div className={`${variants[variant]} backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:-translate-y-1 h-full group`}>
//             <div className="flex items-start gap-4">
//                 <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
//                     {React.cloneElement(icon, {
//                         className: "w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors"
//                     })}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                     <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
//                     <p className="font-bold text-gray-800 text-lg break-words leading-tight">{value}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const PasswordInput = ({ id, label, value, onChange, placeholder }) => {
//     const [showPassword, setShowPassword] = useState(false);
//     return (
//         <div className="space-y-2">
//             <label className="block text-xs font-bold text-gray-400 uppercase ml-1" htmlFor={id}>
//                 {label}
//             </label>
//             <div className="relative">
//                 <input
//                     type={showPassword ? 'text' : 'password'}
//                     id={id}
//                     value={value}
//                     onChange={onChange}
//                     placeholder={placeholder}
//                     className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
//                     required
//                 />
//                 <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
//                 >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//             </div>
//         </div>
//     );
// };

// const StatusMessage = ({ type, message }) => {
//     const types = {
//         success: { bg: 'bg-green-500/20', text: 'text-green-300', icon: <CheckCircle size={20} /> },
//         error: { bg: 'bg-red-500/20', text: 'text-red-300', icon: <AlertTriangle size={20} /> },
//     };
//     const config = types[type] || types.error;
//     return (
//         <div className={`${config.bg} ${config.text} p-4 rounded-xl border border-current/20 flex items-center gap-3 animate-fade-in`}>
//             {config.icon}
//             <span className="font-medium text-sm">{message}</span>
//         </div>
//     );
// };

// // --- MODALS ---

// const UpdateProfileModal = ({ isOpen, onClose, currentUser, onUpdate }) => {
//     const [formData, setFormData] = useState(currentUser || { name: '', email: '' });
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         if (currentUser) setFormData(currentUser);
//     }, [currentUser, isOpen]);

//     if (!isOpen) return null;

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         // Simulate API call - Replace with actual update logic if needed
//         setTimeout(() => {
//             onUpdate(formData);
//             setIsLoading(false);
//             onClose();
//         }, 1000);
//     };

//     return (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
//             <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0A1B3A] to-[#071225] rounded-2xl border border-white/20 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
//                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                
//                 <h2 className="text-2xl font-bold text-white mb-6">Update Profile</h2>
                
//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     <div>
//                         <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
//                         <input 
//                             type="text" 
//                             value={formData.name} 
//                             onChange={e => setFormData({...formData, name: e.target.value})}
//                             className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
//                         <input 
//                             type="email" 
//                             value={formData.email} 
//                             onChange={e => setFormData({...formData, email: e.target.value})}
//                             className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
//                         />
//                     </div>

//                     <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
//                         <button type="button" onClick={onClose} className="py-2.5 px-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium" disabled={isLoading}>Cancel</button>
//                         <button type="submit" className="py-2.5 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 text-sm" disabled={isLoading}>
//                             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                             {isLoading ? 'Saving...' : 'Save Changes'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// const ChangePasswordModal = ({ isOpen, onClose, adminId }) => {
//     const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//     const [isLoading, setIsLoading] = useState(false);
//     const [message, setMessage] = useState({ text: '', type: '' });

//     useEffect(() => {
//         if (isOpen) {
//             setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
//             setMessage({ text: '', type: '' });
//         }
//     }, [isOpen]);

//     if (!isOpen) return null;

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage({ text: '', type: '' });

//         if (passwords.newPassword !== passwords.confirmPassword) {
//             setMessage({ text: "New passwords do not match.", type: 'error' });
//             return;
//         }
//         if (passwords.newPassword.length < 6) {
//              setMessage({ text: "Password must be at least 6 characters.", type: 'error' });
//             return;
//         }

//         setIsLoading(true);

//         const payload = {
//             username: adminId,
//             oldPassword: passwords.oldPassword,
//             newPassword: passwords.newPassword
//         };

//         try {
//             const response = await fetch(`${backendUrl}/api/auth/change-password`, {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//                 credentials: "include"
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.message || "Failed to update password.");
//             }

//             setMessage({ text: data.message || "Password updated successfully!", type: 'success' });
            
//             setTimeout(() => onClose(), 2000);

//         } catch (err) {
//             setMessage({ text: err.message, type: 'error' });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
//             <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0A1B3A] to-[#071225] rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
//                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                
//                 <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
//                 <p className="text-gray-400 text-sm mb-6">Secure your administrator account.</p>

//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     <PasswordInput id="old" label="Current Password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} placeholder="Current Password" />
//                     <PasswordInput id="new" label="New Password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} placeholder="New Password" />
//                     <PasswordInput id="confirm" label="Confirm Password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} placeholder="Confirm Password" />
                    
//                     {message.text && <StatusMessage type={message.type} message={message.text} />}

//                     <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
//                         <button type="button" onClick={onClose} className="py-2.5 px-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium" disabled={isLoading}>Cancel</button>
//                         <button type="submit" className="py-2.5 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2 text-sm" disabled={isLoading}>
//                             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
//                             {isLoading ? 'Updating...' : 'Update Password'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// // --- MAIN PAGE ---

// const AdminProfilePage = () => {
//     const { user: authUser, logout } = useAuth();
//     const navigate = useNavigate();

//     const [user, setUser] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [animate, setAnimate] = useState(false);
//     const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
//     const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);

//     useEffect(() => {
//         if (!authUser) {
//             navigate('/');
//             return;
//         }

//         const timer = setTimeout(() => setAnimate(true), 100);

//         const fetchAdminData = async () => {
//             try {
//                 const response = await fetch(`${backendUrl}/api/admin/profile-data`, {
//                     method: "GET",
//                     credentials: "include"
//                 });
                
//                 if (response.status === 401 || response.status === 403) {
//                     logout();
//                     return;
//                 }

//                 if (!response.ok) throw new Error("Failed to fetch profile.");
                
//                 const data = await response.json();
                
//                 if (data.admin) {
//                     setUser({
//                         id: data.admin.adminId,
//                         name: data.admin.name,
//                         email: data.admin.email,
//                         role: 'Administrator',
//                         profilePhoto: `https://ui-avatars.com/api/?name=${data.admin.name.replace(/\s/g, '+')}&background=1F2937&color=BFDBFE&font-size=0.4&rounded=true&size=176`
//                     });
//                 }
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchAdminData();
//         return () => clearTimeout(timer);
//     }, [authUser, navigate, logout]);

//     const handleProfileUpdate = (updatedData) => {
//         setUser(prev => ({ ...prev, ...updatedData }));
//     };

//     // --- LOADING CHECK ---
//     if (isLoading) {
//         return <Loader />;
//     }

//     if (!user) return null;

//     return (
//         <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
//             {/* Header Section */}
//             <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[3rem] rounded-br-[3rem] relative overflow-hidden">
//                 <div className="absolute inset-0 overflow-hidden">
//                     <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
//                     <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
//                 </div>

//                 <div className="px-4 sm:px-6 lg:px-8 relative z-10">
//                     <Header animate={animate} />
//                     <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-6"></div>

//                     <div className={`py-12 lg:min-h-[40vh] flex items-center transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
//                         <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto gap-8">
//                             <div className="flex flex-col md:flex-row items-center gap-8 text-white">
//                                 <div className="relative flex-shrink-0 group">
//                                     <img src={user.profilePhoto} alt="Admin" className="w-40 h-40 rounded-full border-4 border-white/30 shadow-2xl object-cover" />
//                                     <div className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full border-2 border-[#0A1B3A]">
//                                         <ShieldCheck className="w-5 h-5 text-white" />
//                                     </div>
//                                 </div>
//                                 <div className="flex-grow text-center md:text-left space-y-3">
//                                     <div>
//                                         <h1 className="text-3xl sm:text-4xl font-bold mb-2">{user.name}</h1>
//                                         <div className="flex items-center justify-center md:justify-start gap-2 text-blue-200">
//                                             <Fingerprint className="w-5 h-5" />
//                                             <span className="font-mono text-lg">{user.id}</span>
//                                         </div>
//                                     </div>
//                                     <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
//                                         <ShieldCheck className="w-4 h-4 text-emerald-400" />
//                                         <span className="text-sm font-medium text-emerald-100">System Administrator</span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="flex flex-col gap-3 w-full md:w-auto">
//                                 <button onClick={() => setIsUpdateProfileModalOpen(true)} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg backdrop-blur-sm border border-white/10 w-full md:w-48">
//                                     <Edit size={18} /> Edit Profile
//                                 </button>
//                                 <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30 w-full md:w-48">
//                                     <Lock size={18} /> Password
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Details Section */}
//             <main className="px-4 sm:px-6 lg:px-8 py-12 relative z-10 max-w-6xl mx-auto -mt-8">
//                 <div className={`transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         <ProfileDetailCard 
//                             icon={<User />} 
//                             label="Full Name" 
//                             value={user.name} 
//                             variant="primary" 
//                         />
//                         <ProfileDetailCard 
//                             icon={<Fingerprint />} 
//                             label="Admin ID" 
//                             value={user.id} 
//                         />
//                         <ProfileDetailCard 
//                             icon={<Mail />} 
//                             label="Email Address" 
//                             value={user.email} 
//                             variant="secondary"
//                         />
//                         <ProfileDetailCard 
//                             icon={<ShieldCheck />} 
//                             label="Role" 
//                             value={user.role} 
//                             variant="primary"
//                         />
//                         <ProfileDetailCard 
//                             icon={<Activity />} 
//                             label="Account Status" 
//                             value="Active" 
//                         />
//                         <ProfileDetailCard 
//                             icon={<Calendar />} 
//                             label="Last Login" 
//                             value={new Date().toLocaleDateString()} 
//                             variant="secondary"
//                         />
//                     </div>
//                 </div>
//             </main>

//             {/* Modals */}
//             <UpdateProfileModal 
//                 isOpen={isUpdateProfileModalOpen} 
//                 onClose={() => setIsUpdateProfileModalOpen(false)} 
//                 currentUser={user} 
//                 onUpdate={handleProfileUpdate} 
//             />
//             <ChangePasswordModal 
//                 isOpen={isPasswordModalOpen} 
//                 onClose={() => setIsPasswordModalOpen(false)} 
//                 adminId={user.id} 
//             />
//         </div>
//     );
// };

// export default AdminProfilePage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, Mail, Lock, X, Eye, EyeOff, 
    Loader2, CheckCircle, AlertTriangle, 
    ShieldCheck, Fingerprint, Edit, Save, 
    Calendar, Activity
} from 'lucide-react';
import Header from '../../components/Header'; 
import { useAuth } from '../../context/AuthContext'; 
import Loader from '../../components/Loader'; 
import CryptoJS from 'crypto-js'; // Import CryptoJS

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

// --- SUB-COMPONENTS ---

const ProfileDetailCard = ({ icon, label, value, variant = 'default' }) => {
    const variants = {
        default: 'bg-white/80 border-white/50 hover:shadow-xl',
        primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-blue-100',
        secondary: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-purple-100'
    };

    return (
        <div className={`${variants[variant]} backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:-translate-y-1 h-full group`}>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    {React.cloneElement(icon, {
                        className: "w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors"
                    })}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-bold text-gray-800 text-lg break-words leading-tight">{value}</p>
                </div>
            </div>
        </div>
    );
};

const PasswordInput = ({ id, label, value, onChange, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase ml-1" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
};

const StatusMessage = ({ type, message }) => {
    const types = {
        success: { bg: 'bg-green-500/20', text: 'text-green-300', icon: <CheckCircle size={20} /> },
        error: { bg: 'bg-red-500/20', text: 'text-red-300', icon: <AlertTriangle size={20} /> },
    };
    const config = types[type] || types.error;
    return (
        <div className={`${config.bg} ${config.text} p-4 rounded-xl border border-current/20 flex items-center gap-3 animate-fade-in`}>
            {config.icon}
            <span className="font-medium text-sm">{message}</span>
        </div>
    );
};

// --- MODALS ---

const UpdateProfileModal = ({ isOpen, onClose, currentUser, onUpdate }) => {
    const [formData, setFormData] = useState(currentUser || { name: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser) setFormData(currentUser);
    }, [currentUser, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call - Replace with actual update logic if needed
        setTimeout(() => {
            onUpdate(formData);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0A1B3A] to-[#071225] rounded-2xl border border-white/20 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                
                <h2 className="text-2xl font-bold text-white mb-6">Update Profile</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="py-2.5 px-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-2.5 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 text-sm" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose, adminId }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (isOpen) {
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ text: '', type: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ text: "New passwords do not match.", type: 'error' });
            return;
        }
        if (passwords.newPassword.length < 6) {
             setMessage({ text: "Password must be at least 6 characters.", type: 'error' });
            return;
        }

        setIsLoading(true);

        const payload = {
            username: adminId,
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword
        };

        try {
            // PATCH: Encrypt Request
            const encryptedBody = encryptData(payload);

            const response = await fetch(`${backendUrl}/api/auth/change-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: encryptedBody }),
                credentials: "include"
            });

            const rawJson = await response.json();
            // PATCH: Decrypt Response
            const data = rawJson.data ? decryptData(rawJson.data) : rawJson;

            if (!response.ok) {
                throw new Error(data.message || "Failed to update password.");
            }

            setMessage({ text: data.message || "Password updated successfully!", type: 'success' });
            
            setTimeout(() => onClose(), 2000);

        } catch (err) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0A1B3A] to-[#071225] rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                
                <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
                <p className="text-gray-400 text-sm mb-6">Secure your administrator account.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <PasswordInput id="old" label="Current Password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} placeholder="Current Password" />
                    <PasswordInput id="new" label="New Password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} placeholder="New Password" />
                    <PasswordInput id="confirm" label="Confirm Password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} placeholder="Confirm Password" />
                    
                    {message.text && <StatusMessage type={message.type} message={message.text} />}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="py-2.5 px-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-2.5 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2 text-sm" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const AdminProfilePage = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);

    useEffect(() => {
        if (!authUser) {
            navigate('/');
            return;
        }

        const timer = setTimeout(() => setAnimate(true), 100);

        const fetchAdminData = async () => {
            try {
                // GET Request: Plain Params, Response Decrypted
                const response = await fetch(`${backendUrl}/api/admin/profile-data`, {
                    method: "GET",
                    credentials: "include"
                });
                
                if (response.status === 401 || response.status === 403) {
                    logout();
                    return;
                }

                if (!response.ok) throw new Error("Failed to fetch profile.");
                
                const rawJson = await response.json();
                // DECRYPT RESPONSE
                const data = rawJson.data ? decryptData(rawJson.data) : rawJson;
                
                if (data.admin) {
                    setUser({
                        id: data.admin.adminId,
                        name: data.admin.name,
                        email: data.admin.email,
                        role: 'Administrator',
                        profilePhoto: `https://ui-avatars.com/api/?name=${data.admin.name.replace(/\s/g, '+')}&background=1F2937&color=BFDBFE&font-size=0.4&rounded=true&size=176`
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
        return () => clearTimeout(timer);
    }, [authUser, navigate, logout]);

    const handleProfileUpdate = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    // --- LOADING CHECK ---
    if (isLoading) {
        return <Loader />;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[3rem] rounded-br-[3rem] relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-6"></div>

                    <div className={`py-12 lg:min-h-[40vh] flex items-center transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto gap-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-white">
                                <div className="relative flex-shrink-0 group">
                                    <img src={user.profilePhoto} alt="Admin" className="w-40 h-40 rounded-full border-4 border-white/30 shadow-2xl object-cover" />
                                    <div className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full border-2 border-[#0A1B3A]">
                                        <ShieldCheck className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-grow text-center md:text-left space-y-3">
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{user.name}</h1>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-blue-200">
                                            <Fingerprint className="w-5 h-5" />
                                            <span className="font-mono text-lg">{user.id}</span>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-medium text-emerald-100">System Administrator</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <button onClick={() => setIsUpdateProfileModalOpen(true)} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg backdrop-blur-sm border border-white/10 w-full md:w-48">
                                    <Edit size={18} /> Edit Profile
                                </button>
                                <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30 w-full md:w-48">
                                    <Lock size={18} /> Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <main className="px-4 sm:px-6 lg:px-8 py-12 relative z-10 max-w-6xl mx-auto -mt-8">
                <div className={`transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ProfileDetailCard 
                            icon={<User />} 
                            label="Full Name" 
                            value={user.name} 
                            variant="primary" 
                        />
                        <ProfileDetailCard 
                            icon={<Fingerprint />} 
                            label="Admin ID" 
                            value={user.id} 
                        />
                        <ProfileDetailCard 
                            icon={<Mail />} 
                            label="Email Address" 
                            value={user.email} 
                            variant="secondary"
                        />
                        <ProfileDetailCard 
                            icon={<ShieldCheck />} 
                            label="Role" 
                            value={user.role} 
                            variant="primary"
                        />
                        <ProfileDetailCard 
                            icon={<Activity />} 
                            label="Account Status" 
                            value="Active" 
                        />
                        <ProfileDetailCard 
                            icon={<Calendar />} 
                            label="Last Login" 
                            value={new Date().toLocaleDateString()} 
                            variant="secondary"
                        />
                    </div>
                </div>
            </main>

            {/* Modals */}
            <UpdateProfileModal 
                isOpen={isUpdateProfileModalOpen} 
                onClose={() => setIsUpdateProfileModalOpen(false)} 
                currentUser={user} 
                onUpdate={handleProfileUpdate} 
            />
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
                adminId={user.id} 
            />
        </div>
    );
};

export default AdminProfilePage;