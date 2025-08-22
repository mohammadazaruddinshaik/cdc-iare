import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Lock, X, Eye, EyeOff, Camera, Edit, Loader2 } from 'lucide-react';
import Header from '../components/Header';

// --- Main Admin Profile Page Component ---
const AdminProfilePage = () => {
    const [user, setUser] = useState({
        details: {
            name: "Dr. B Padmaja",
            id: "ADMIN001",
            email: "admin1@iare.ac.in",
        },
        profilePhoto: `https://ui-avatars.com/api/?name=Dr+B+Padmaja&background=818cf8&color=fff&size=256`,
    });

    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleProfileUpdate = (updatedData) => {
        setUser(prev => ({ ...prev, details: { ...prev.details, ...updatedData } }));
        alert("Profile updated successfully!");
    };

    const profileDetails = [
        { icon: <Shield size={20} className="text-indigo-400" />, label: "Admin ID", value: user.details.id },
        { icon: <User size={20} className="text-indigo-400" />, label: "Full Name", value: user.details.name },
        { icon: <Mail size={20} className="text-indigo-400" />, label: "Email Address", value: user.details.email },
    ];

    return (
        // FIX: Added React Fragment wrapper <> ... </>
        <>
            <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4">
                <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                <div className="w-full max-w-5xl">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>

                <main className={`w-full max-w-5xl transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-gray-800/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative flex-shrink-0">
                                    <img src={user.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full border-4 border-gray-800/50 shadow-lg object-cover" />
                                    <button onClick={() => alert("Photo upload feature coming soon!")} className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-full transition-all transform hover:scale-110 shadow-md">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{user.details.name}</h1>
                                        <p className="text-indigo-300 font-medium text-sm">{user.details.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setIsUpdateProfileModalOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                                            <Edit size={14} /> Update
                                        </button>
                                        <button onClick={() => setIsResetPasswordModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/30">
                                            <Lock size={14} /> Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-white/10 mt-6 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {profileDetails.map((detail, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="bg-gray-900/30 p-3 rounded-lg border border-white/10">{detail.icon}</div>
                                        <div>
                                            <p className="text-xs text-gray-400">{detail.label}</p>
                                            <p className="font-semibold text-white text-sm">{detail.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ResetPasswordModal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} userId={user.details.id} />
            <UpdateProfileModal isOpen={isUpdateProfileModalOpen} onClose={() => setIsUpdateProfileModalOpen(false)} currentUser={user.details} onUpdate={handleProfileUpdate} />
        </>
    );
};

// --- Password Input Component ---
const PasswordInput = ({ id, label, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor={id}>{label}</label>
            <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id={id} value={value} onChange={onChange} className="w-full bg-white/10 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 border-white/20 focus:ring-indigo-500 transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-indigo-400 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
};

// --- Reset Password Modal ---
const ResetPasswordModal = ({ isOpen, onClose, userId }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        setIsLoading(true);
        console.log("Submitting password change for:", { userId, ...passwords });
        setTimeout(() => {
            setIsLoading(false);
            alert("Password changed successfully! (Simulated)");
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-gray-800/90 rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"><X size={20} /></button>
                <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
                <p className="text-gray-400 mb-6 text-sm">Update your password for enhanced security.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput id="old-password" label="Current Password" value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} />
                    <PasswordInput id="new-password" label="New Password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
                    <PasswordInput id="confirm-password" label="Confirm New Password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2 text-sm" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Update Profile Modal ---
const UpdateProfileModal = ({ isOpen, onClose, currentUser, onUpdate }) => {
    const [formData, setFormData] = useState(currentUser);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData(currentUser);
    }, [currentUser, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("Updating profile with:", formData);
        setTimeout(() => {
            setIsLoading(false);
            onUpdate(formData);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-gray-800/90 rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"><X size={20} /></button>
                <h2 className="text-2xl font-bold text-white mb-2">Update Profile</h2>
                <p className="text-gray-400 mb-6 text-sm">Edit your personal information.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/10 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 border-white/20 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/10 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 border-white/20 focus:ring-indigo-500" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2 text-sm" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProfilePage;