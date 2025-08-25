import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Book, Briefcase, Loader2, Lock, X, Eye, EyeOff } from 'lucide-react';
import Header from '../components/Header'; // Assuming Header is in a separate file

// --- Sub-Components (Unchanged) ---
const InfoPill = ({ icon, text }) => (
    <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-300 font-medium py-2 px-4 rounded-full border border-indigo-500/30">
        {icon}
        <span>{text}</span>
    </div>
);

const PasswordInput = ({ id, label, value, onChange, error }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor={id}>{label}</label>
            <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id={id} value={value} onChange={onChange} className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-indigo-500'}`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-indigo-400 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose, facultyId }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
            setApiMessage({ type: '', text: '' });
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validatePasswords = () => {
        const newErrors = {};
        if (!passwords.oldPassword) newErrors.oldPassword = 'Current password is required';
        if (!passwords.newPassword) newErrors.newPassword = 'New password is required';
        else if (passwords.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
        if (passwords.newPassword !== passwords.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ type: '', text: '' });
        const validationErrors = validatePasswords();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/Faculty/UpdatePassword', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: facultyId,
                    role: "faculty",
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword,
                }),
                credentials: "include"
            });
            const result = await response.json();
            if (response.ok) {
                setApiMessage({ type: 'success', text: 'Password updated! Logging you out...' });
                setTimeout(() => {
                    localStorage.clear();
                    navigate('/');
                }, 2000);
            } else {
                setApiMessage({ type: 'error', text: result.message || 'Update failed. Please try again.' });
            }
        } catch (err) {
            setApiMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            if (apiMessage.type !== 'success') {
                setIsLoading(false);
            }
        }
    };
    
    const handleChange = (field) => (e) => {
        setPasswords(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"><X size={24} /></button>
                <div className="mb-6"><h2 className="text-2xl font-bold text-white mb-2">Change Password</h2><p className="text-gray-400">Update your password for enhanced security.</p></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput id="old-password" label="Current Password" value={passwords.oldPassword} onChange={handleChange('oldPassword')} error={errors.oldPassword} />
                    <PasswordInput id="new-password" label="New Password" value={passwords.newPassword} onChange={handleChange('newPassword')} error={errors.newPassword} />
                    <PasswordInput id="confirm-password" label="Confirm New Password" value={passwords.confirmPassword} onChange={handleChange('confirmPassword')} error={errors.confirmPassword} />
                    
                    {apiMessage.text && (<div className={`mt-4 text-center text-sm font-medium p-3 rounded-lg ${apiMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{apiMessage.text}</div>)}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2" disabled={isLoading}>
                            {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component: Faculty's own profile page ---
const FacultyProfilePage = () => {
    const [facultyData, setFacultyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        const ProfileData = async () => {
            try {
                setLoading(true);
                const facultyId = localStorage.getItem('userIdentifier');
                if (!facultyId) throw new Error("Faculty ID not found.");
                
                const response = await fetch(`http://localhost:5000/api/Faculty/getProfileData/${facultyId}`, {method :"GET", credentials: "include"});
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                if (data.faculty) {
                    setFacultyData({
                        id: data.faculty.facultyid,
                        name: data.faculty.name,
                        email: data.faculty.email,
                        subjects: data.faculty.subjects_assigned || [],
                        batches: data.faculty.batches_assigned || [],
                        profilePhoto: `https://www.iare.ac.in/sites/default/files/${facultyId}_0.png`,
                    });
                } else {
                    throw new Error("Faculty data not found in response.");
                }
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    if (loading) return (<div className="flex flex-col justify-center items-center h-screen bg-gray-900"><Loader2 className="w-12 h-12 animate-spin text-indigo-400" /><p className="mt-4 text-lg text-gray-300">Loading Your Profile...</p></div>);
    if (error || !facultyData) return (<div className="flex justify-center items-center h-screen bg-gray-900"><div className="text-center bg-red-900/20 rounded-lg p-6"><h2 className="text-2xl font-bold text-red-400">Failed to Load Profile</h2><p className="text-red-300 mt-2">Could not fetch your data.</p><p className="text-sm text-gray-500 mt-4">Error: {error}</p></div></div>);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="fixed top-0 left-1/4 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-600 opacity-20 blur-[120px]"></div>
            <div className="fixed top-1/2 right-1/4 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-purple-600 opacity-15 blur-[100px]"></div>

            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>
            <main className="pt-8 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className={`bg-gray-800/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6">
                                <img src={facultyData.profilePhoto} alt="Profile" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-6 border-gray-800/50 shadow-2xl object-cover transition-transform duration-500 hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/818cf8/ffffff?text=AZ'; }} />
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{facultyData.name}</h1>
                                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-indigo-300">
                                        <p className="font-semibold flex items-center gap-2">
                                            <User size={16} />
                                            {facultyData.id}
                                        </p>
                                        <a href={`mailto:${facultyData.email}`} className="font-semibold flex items-center gap-2 hover:text-white transition-colors">
                                            <Mail size={16} />
                                            {facultyData.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white border-b-2 border-indigo-500/50 pb-2 mb-4">Subjects Assigned</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {facultyData.subjects.length > 0 ? facultyData.subjects.map(subject => (<InfoPill key={subject} icon={<Book size={16} />} text={subject} />)) : <p className="text-gray-400">No subjects assigned.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white border-b-2 border-indigo-500/50 pb-2 mb-4">Batches Assigned</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {facultyData.batches.length > 0 ? facultyData.batches.map(batch => (<InfoPill key={batch} icon={<Briefcase size={16} />} text={batch} />)) : <p className="text-gray-400">No batches assigned.</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
                                {/* CHANGED: Button style is now minimal and outlined */}
                                <button 
                                    onClick={handleOpenModal} 
                                    className="flex items-center gap-2 border border-slate-600 text-slate-300 font-bold py-2 px-5 rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-slate-700 hover:text-white hover:border-slate-500"
                                >
                                    <Lock size={18} />
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <ChangePasswordModal isOpen={isModalOpen} onClose={handleCloseModal} facultyId={facultyData.id} />
        </div>
    );
};

export default FacultyProfilePage;