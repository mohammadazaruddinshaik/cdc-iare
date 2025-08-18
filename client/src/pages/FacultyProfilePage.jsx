import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Book, Briefcase, Loader2, Lock, X, Eye, EyeOff } from 'lucide-react';
import Header from '../components/Header'; // Assuming Header is in a separate file

// Main Component: Faculty's own profile page
const FacultyProfilePage = () => {
    // --- State for fetched data, loading, and errors ---
    const [facultyData, setFacultyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for UI controls ---
    const [animate, setAnimate] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Trigger animation on component mount
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    // --- Effect for fetching profile data from the backend ---
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const facultyId = localStorage.getItem('userIdentifier');
                if (!facultyId) {
                    throw new Error("Faculty identifier not found in local storage.");
                }
                const response = await fetch(`http://localhost:5000/api/Faculty/getProfileData/${facultyId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.faculty) {
                    setFacultyData({
                        id: data.faculty.facultyid,
                        name: data.faculty.name,
                        email: data.faculty.email,
                        subjects: data.faculty.subjects_assigned || [],
                        batches: data.faculty.batches_assigned || [],
                        profilePhoto: `https://placehold.co/256x256/818cf8/ffffff?text=${data.faculty.name.charAt(0)}`,
                    });
                } else {
                    throw new Error("Faculty data not found in the response.");
                }
                setError(null);
            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                setError(err.message);
                setFacultyData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const renderLoading = () => (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
            <p className="mt-4 text-lg text-gray-300">Loading Your Profile...</p>
        </div>
    );

    const renderError = () => (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <div className="text-center bg-red-900/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-red-400">Failed to Load Profile</h2>
                <p className="text-red-300 mt-2">Could not fetch your data from the server.</p>
                <p className="text-sm text-gray-500 mt-4">Error: {error}</p>
            </div>
        </div>
    );
    
    if (loading) return renderLoading();
    if (error || !facultyData) return renderError();

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Background decorative elements */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="fixed top-0 left-1/4 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-600 opacity-20 blur-[120px]"></div>
            <div className="fixed top-1/2 right-1/4 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-purple-600 opacity-15 blur-[100px]"></div>

            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>
            <main className="pt-10 pb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className={`bg-gray-800/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="px-8 md:px-12 py-12">
                            {/* Profile Header */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8">
                                <img src={facultyData.profilePhoto} alt="Profile" className="w-48 h-48 rounded-full border-8 border-gray-800/50 shadow-2xl object-cover transition-transform duration-500 hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/818cf8/ffffff?text=AZ'; }} />
                                <div className="text-center sm:text-left pb-4">
                                    <h1 className="text-3xl font-bold tracking-tight text-white">{facultyData.name}</h1>
                                    <p className="text-indigo-300 font-medium mt-1">{facultyData.id}</p>
                                </div>
                            </div>
                            {/* Details Section */}
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 space-y-6">
                                    <h3 className="text-xl font-semibold text-white border-b-2 border-indigo-500/50 pb-2">Contact Information</h3>
                                    <ProfileDetail icon={<Mail size={22} className="text-indigo-400" />} label="Email Address" value={facultyData.email} />
                                </div>
                                <div className="md:col-span-2 space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white border-b-2 border-indigo-500/50 pb-2 mb-4">Subjects Assigned</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {facultyData.subjects.length > 0 ? facultyData.subjects.map(subject => (<InfoPill key={subject} icon={<Book size={16} />} text={subject} />)) : <p className="text-gray-400">No subjects assigned.</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white border-b-2 border-indigo-500/50 pb-2 mb-4">Batches Assigned</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {facultyData.batches.length > 0 ? facultyData.batches.map(batch => (<InfoPill key={batch} icon={<Briefcase size={16} />} text={batch} />)) : <p className="text-gray-400">No batches assigned.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Button */}
                            <div className="mt-12 pt-8 border-t border-white/10 flex justify-end">
                                <button onClick={handleOpenModal} className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-600/30">
                                    <Lock size={20} />
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

// --- Sub-Components ---

const ProfileDetail = ({ icon, label, value }) => (
    <div className="bg-white/5 p-5 rounded-xl transition-all duration-300 hover:bg-white/10 border border-transparent hover:border-white/20">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-gray-900/30 p-3 rounded-lg border border-white/10">{icon}</div>
            <div>
                <p className="text-sm text-gray-400 font-medium">{label}</p>
                <p className="font-semibold text-white text-base break-all">{value}</p>
            </div>
        </div>
    </div>
);

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
            <label className="block text-sm font-medium text-gray-300 mb-3" htmlFor={id}>{label}</label>
            <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id={id} value={value} onChange={onChange} className={`w-full bg-white/10 border rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-indigo-500'}`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-indigo-400 transition-colors">
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
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
            console.error("Password update error:", err);
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
            <div className="relative w-full max-w-lg bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-10" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"><X size={24} /></button>
                <div className="mb-8"><h2 className="text-3xl font-bold text-white mb-3">Change Password</h2><p className="text-gray-400">Update your password for enhanced security.</p></div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <PasswordInput id="old-password" label="Current Password" value={passwords.oldPassword} onChange={handleChange('oldPassword')} error={errors.oldPassword} />
                    <PasswordInput id="new-password" label="New Password" value={passwords.newPassword} onChange={handleChange('newPassword')} error={errors.newPassword} />
                    <PasswordInput id="confirm-password" label="Confirm New Password" value={passwords.confirmPassword} onChange={handleChange('confirmPassword')} error={errors.confirmPassword} />
                    
                    {apiMessage.text && (<div className={`mt-4 text-center text-sm font-medium p-3 rounded-lg ${apiMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{apiMessage.text}</div>)}

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="py-3 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2" disabled={isLoading}>
                            {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FacultyProfilePage