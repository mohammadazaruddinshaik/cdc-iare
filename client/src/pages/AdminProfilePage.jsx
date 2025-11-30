import React, { useState, useEffect } from 'react';
import { 
    UserCircle, 
    AtSign, 
    Lock, 
    X, 
    Eye, 
    EyeOff, 
    Camera, 
    Edit, 
    Loader2,
    Fingerprint,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import Header from '../components/Header'; 

const backendUrl =  import.meta.env.VITE_BASE_URL;

// --- Main Admin Profile Page Component ---
const AdminProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        
        const fetchAdminData = async () => {
            try {
                const adminId = sessionStorage.getItem("userIdentifier");
                if (!adminId) {
                    throw new Error("Admin ID not found. Please log in again.");
                }

                const response = await fetch(`${backendUrl}/api/Admin/getProfileData/${adminId}`, {method : "GET",credentials: "include"});
                
                if (!response.ok) {
                    throw new Error("Failed to fetch profile data.");
                }
                
                const data = await response.json();
                
                // The API returns { admin: { adminId, email, name } }
                // We'll adapt it to the component's state structure
                setUser({
                    details: {
                        id: data.admin.adminId,
                        name: data.admin.name,
                        email: data.admin.email,
                    },
                    profilePhoto: `https://ui-avatars.com/api/?name=${data.admin.name.replace(/\s/g, '+')}&background=818cf8&color=fff&size=256`,
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
        return () => clearTimeout(timer);
    }, []);

    const handleProfileUpdate = (updatedData) => {
        setUser(prev => ({ ...prev, details: { ...prev.details, ...updatedData } }));
        // In a real app, you would also make an API call here to update the user's name/email.
        console.log("Profile updated successfully!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">
                <p>{error}</p>
            </div>
        );
    }
    
    // This check ensures user is not null before rendering
    if (!user) return null;

    const profileDetails = [
        { icon: <Fingerprint size={20} className="text-indigo-400" />, label: "Admin ID", value: user.details.id },
        { icon: <UserCircle size={20} className="text-indigo-400" />, label: "Full Name", value: user.details.name },
        { icon: <AtSign size={20} className="text-indigo-400" />, label: "Email Address", value: user.details.email },
    ];

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white font-sans">
                <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                <header className="w-full border-b border-white/10 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-40">
                    <div className="w-full max-w-7xl mx-auto">
                        <Header animate={animate} />
                    </div>
                </header>

                <main className={`w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-3xl font-bold text-white mb-8">Administrator Profile</h1>
                    
                    <div className="bg-gray-800/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="relative flex-shrink-0 group">
                                <img src={user.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full border-4 border-gray-800/50 shadow-lg object-cover" />
                                <button 
                                    onClick={() => console.log("Photo upload feature coming soon!")} 
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <Camera size={24} />
                                </button>
                            </div>
                            <div className="w-full">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{user.details.name}</h2>
                                        <p className="text-indigo-300 font-medium">{user.details.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                        <button onClick={() => setIsUpdateProfileModalOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                                            <Edit size={14} /> Update
                                        </button>
                                        <button onClick={() => setIsResetPasswordModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/30">
                                            <Lock size={14} /> Password
                                        </button>
                                    </div>
                                </div>
                                <div className="border-t border-white/10 my-6"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profileDetails.map((detail, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-gray-900/30 p-4 rounded-lg border border-white/10">
                                            <div className="bg-gray-800/50 p-3 rounded-lg">{detail.icon}</div>
                                            <div>
                                                <p className="text-xs text-gray-400">{detail.label}</p>
                                                <p className="font-semibold text-white text-sm">{detail.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ResetPasswordModal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} username={user.details.id} />
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
const ResetPasswordModal = ({ isOpen, onClose, username }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    useEffect(() => {
        if (isOpen) {
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setIsLoading(false);
            setMessage({ text: '', type: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ text: "New passwords do not match. Please re-enter.", type: 'error' });
            return;
        }
        if (passwords.newPassword.length < 6) {
             setMessage({ text: "New password must be at least 6 characters long.", type: 'error' });
            return;
        }

        setIsLoading(true);

        const payload = {
            username: username,
            role: "admin",
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword
        };

        try {
            const response = await fetch(`${backendUrl}/api/Admin/UpdatePassword`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                // Use the error message from the API if available
                throw new Error(data.error || "An unknown error occurred.");
            }

            setMessage({ text: data.message || "Password updated successfully!", type: 'success' });
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-gray-800/90 rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"><X size={20} /></button>
                <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
                <p className="text-gray-400 mb-6 text-sm">Update your password for enhanced security.</p>
                
                {message.text && (
                    <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 text-sm ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

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
        // SIMULATED API CALL - replace with your actual API endpoint for updating profile
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
