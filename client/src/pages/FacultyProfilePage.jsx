import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Book, Briefcase, Loader2, Lock, X, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import Header from '../components/Header';

// --- UI & HELPER COMPONENTS (Adapted from Student Profile) ---
const backendUrl = import.meta.env.VITE_BASE_URL;

const ProfileDetailCard = ({ icon, label, value, description }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full group">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(icon, {
                    className: "w-6 h-6 text-blue-600 group-hover:text-indigo-700 transition-colors"
                })}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
                <p className="font-bold text-gray-800 text-lg break-words leading-tight">{value}</p>
                {description && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{description}</p>}
            </div>
        </div>
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
            const response = await fetch(`${backendUrl}/api/Faculty/UpdatePassword`, {
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
                    sessionStorage.clear();
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


// --- MAIN COMPONENT ---
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
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const facultyId = sessionStorage.getItem('userIdentifier');
                if (!facultyId) throw new Error("Faculty ID not found.");
                
                const response = await fetch(`${backendUrl}/api/Faculty/getProfileData/${facultyId}`, {method :"GET", credentials: "include"});
                if (!response.ok){
                    sessionStorage.clear();
                    navigate('/', { replace: true });
                }
                
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

    if (loading) return (<div className="flex flex-col justify-center items-center h-screen bg-gray-900"><Loader2 className="w-12 h-12 animate-spin text-indigo-400" /><p className="mt-4 text-lg text-gray-300">Loading Your Profile...</p></div>);
    if (error || !facultyData) return (<div className="flex justify-center items-center h-screen bg-gray-900"><div className="text-center bg-red-900/20 rounded-lg p-6"><h2 className="text-2xl font-bold text-red-400">Failed to Load Profile</h2><p className="text-red-300 mt-2">Could not fetch your data.</p><p className="text-sm text-gray-500 mt-4">Error: {error}</p></div></div>);

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[3rem] rounded-br-[3rem] relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-6"></div>

                    <div className={`py-12 flex items-center transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-12 lg:gap-16">
                            <div className="flex flex-col lg:flex-row items-center gap-8 text-white">
                                <div className="relative flex-shrink-0">
                                    <img src={facultyData.profilePhoto} alt="Profile" className="w-44 h-44 rounded-full border-4 border-white/30 shadow-2xl object-cover"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${facultyData.name.replace(/ /g, '+')}&background=1F2937&color=BFDBFE&font-size=0.4&rounded=true&size=176`; }}
                                    />
                                </div>
                                <div className="flex-grow text-center lg:text-left space-y-4">
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{facultyData.name}</h1>
                                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-blue-300 text-lg">
                                            <p className="font-mono flex items-center gap-2"><User size={18} /> {facultyData.id}</p>
                                            <a href={`mailto:${facultyData.email}`} className="font-medium flex items-center gap-2 hover:text-white transition-colors">
                                                <Mail size={18} /> {facultyData.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex justify-center lg:justify-start">
                                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium hover:bg-white/20 transition-colors">
                                            <Lock size={14} /> Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="px-4 sm:px-6 lg:px-8 py-12 relative z-10 max-w-7xl mx-auto">
                <div className={`transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <section>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Assigned Responsibilities</h2>
                            <p className="text-gray-600">Your currently assigned subjects and batches.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileDetailCard 
                                icon={<Book />} 
                                label="Subjects Assigned" 
                                value={facultyData.subjects.length > 0 ? facultyData.subjects.join(', ') : 'No subjects assigned'}
                                description="List of courses you are responsible for."
                            />
                            <ProfileDetailCard 
                                icon={<Briefcase />} 
                                label="Batches Assigned" 
                                value={facultyData.batches.length > 0 ? facultyData.batches.join(', ') : 'No batches assigned'}
                                description="Groups of students you are currently mentoring."
                            />
                        </div>
                    </section>
                </div>
            </main>

            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} facultyId={facultyData.id} />
        </div>
    );
};

export default FacultyProfilePage;