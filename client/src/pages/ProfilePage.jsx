import React, { useState, useEffect } from 'react';
import { 
    Mail, Hash, Lock, X, Eye, EyeOff, 
    Loader2, Maximize, LogOut, GraduationCap, Users
} from 'lucide-react';

import Header from '../components/Header';

// --- UI & HELPER COMPONENTS ---

const ProfileDetailCard = ({ icon, label, value }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                {React.cloneElement(icon, { className: "w-6 h-6 text-blue-600" })}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="font-bold text-gray-800 text-base break-all">{value}</p>
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
                <input
                    type={showPassword ? 'text' : 'password'} id={id} value={value} onChange={onChange}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 ring-red-500/50' : 'border-white/20 focus:ring-blue-500/50'}`}
                    required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-1.5">{error}</p>}
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose, rollNo }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

    useEffect(() => { if (isOpen) { setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' }); setErrors({}); setApiMessage({ type: '', text: '' }); setIsLoading(false); }}, [isOpen]);
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
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/Student/UpdatePassword', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: "student", username: rollNo, oldPassword: passwords.oldPassword, newPassword: passwords.newPassword }),
            });
            const result = await response.json();
            if (response.ok) {
                setApiMessage({ type: 'success', text: 'Password updated! Logging you out...' });
                setTimeout(() => { localStorage.clear(); window.location.href = '/'; }, 2000);
            } else {
                setApiMessage({ type: 'error', text: result.message || 'Update failed. Please try again.' });
                setIsLoading(false);
            }
        } catch (err) {
            setApiMessage({ type: 'error', text: 'An unexpected error occurred.' });
            setIsLoading(false);
        }
    };
    
    const handleChange = (field) => (e) => {
        setPasswords(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-[#0A1B3A]/90 rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                <div className="mb-6"><h2 className="text-2xl font-bold text-white">Change Password</h2></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput id="old-password" label="Current Password" value={passwords.oldPassword} onChange={handleChange('oldPassword')} error={errors.oldPassword} />
                    <PasswordInput id="new-password" label="New Password" value={passwords.newPassword} onChange={handleChange('newPassword')} error={errors.newPassword} />
                    <PasswordInput id="confirm-password" label="Confirm New Password" value={passwords.confirmPassword} onChange={handleChange('confirmPassword')} error={errors.confirmPassword} />
                    {apiMessage.text && (<div className={`mt-4 text-center text-sm font-medium p-3 rounded-lg ${apiMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{apiMessage.text}</div>)}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FullScreenQRCodeModal = ({ isOpen, onClose, qrImage, profilePhoto, name, rollNo, batch }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => setCurrentTime(new Date()), 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 w-screen h-screen bg-gray-900/80 backdrop-blur-xl flex flex-col items-center justify-center z-[60] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-gray-800 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Left Side: Student Info */}
                <div className="w-full md:w-1/2 flex flex-col items-center text-center">
                     <img src={profilePhoto} alt="Profile" className="w-48 h-48 rounded-full border-8 border-blue-200 shadow-2xl object-cover mb-4" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${name.replace(/ /g, '+')}&background=BFDBFE&color=1E3A8A&font-size=0.4&rounded=true&size=192`; }} />
                     <h2 className="text-4xl font-bold">{name}</h2>
                     <p className="text-xl text-gray-500 font-mono mt-1">{rollNo}</p>
                     <p className="mt-2 bg-blue-100 text-blue-800 font-semibold px-4 py-1 rounded-full">{batch}</p>
                </div>
                {/* Right Side: QR Code and Time */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-2xl shadow-lg w-full max-w-sm aspect-square">
                        <img src={qrImage} alt="Fullscreen QR Code" className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.src = 'https://placehold.co/512x512/ffffff/000000?text=Error'; }} />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="font-semibold text-lg">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="font-mono text-2xl text-blue-600">{currentTime.toLocaleTimeString('en-US')}</p>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="absolute top-5 right-5 text-white/70 bg-black/20 hover:bg-black/40 transition-colors rounded-full p-2">
                <X size={24} />
            </button>
        </div>
    );
};


// --- MAIN PROFILE PAGE COMPONENT ---
const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [isFullScreenQrOpen, setIsFullScreenQrOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const rollno = localStorage.getItem('userIdentifier');
                if (!rollno) throw new Error("Roll number not found.");
                const response = await fetch('http://localhost:5000/api/Student/getProfileData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rollno }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (data.student) {
                    setUserData({
                        name: data.student.name, rollNo: data.student.rollno, branch: data.student.branch,
                        batch: data.student.batch, email: data.student.email, qrImage: data.student.qrLink,
                        profilePhoto: `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${data.student.rollno}/${data.student.rollno}.jpg`,
                    });
                } else { throw new Error("Student data not found."); }
                setError(null);
            } catch (err) {
                setError(err.message);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const renderLoading = () => (<div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB]"><div className="animate-spin rounded-full h-16 w-16 border-4 border-[#071225] border-t-transparent"></div></div>);
    const renderError = () => (<div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] p-4"><div className="text-center bg-white rounded-lg shadow-lg p-8"><h2 className="text-xl font-bold text-red-600">Failed to Load Profile</h2><p className="text-gray-600 mt-2">Could not fetch data. Please try again later.</p><p className="text-xs text-gray-400 mt-4">Error: {error}</p></div></div>);
    
    if (loading) return renderLoading();
    if (error || !userData) return renderError();

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] sm:rounded-bl-[3rem] sm:rounded-br-[3rem] relative overflow-hidden pb-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                    
                    <div className={`mt-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-white">
                            <img src={userData.profilePhoto} alt="Profile" className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl object-cover flex-shrink-0" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${userData.name.replace(/ /g, '+')}&background=1F2937&color=BFDBFE&font-size=0.4&rounded=true&size=128`; }} />
                            <div className="flex-grow text-center md:text-left">
                                <h1 className="text-3xl lg:text-4xl font-bold">{userData.name}</h1>
                                <p className="text-blue-300 font-mono text-lg">{userData.rollNo}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <main className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <ProfileDetailCard icon={<Hash />} label="Roll Number" value={userData.rollNo} />
                           <ProfileDetailCard icon={<Mail />} label="Email Address" value={userData.email} />
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <ProfileDetailCard icon={<GraduationCap />} label="Branch" value={userData.branch} />
                           <ProfileDetailCard icon={<Users />} label="Batch" value={userData.batch} />
                        </div>
                    </div>

                    {/* Right Column: Actions Panel */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 space-y-6">
                         <div className="text-center">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Digital ID Card</h3>
                            <div className="p-2 bg-white rounded-lg shadow-md inline-block">
                                <img src={userData.qrImage} alt="QR Code" className="w-32 h-32 rounded-md" onError={(e) => { e.target.src = 'https://placehold.co/128x128/ffffff/000000?text=Error'; }} />
                            </div>
                            <button onClick={() => setIsFullScreenQrOpen(true)} className="mt-4 w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                <Maximize size={16} /> View Fullscreen QR
                            </button>
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Account Security</h3>
                            <p className="text-sm text-gray-600 mb-4">Update your password for enhanced security.</p>
                            <button onClick={() => setIsModalOpen(true)} className="w-full bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2">
                                <Lock size={16} /> Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rollNo={userData.rollNo} />
            <FullScreenQRCodeModal 
                isOpen={isFullScreenQrOpen} 
                onClose={() => setIsFullScreenQrOpen(false)} 
                qrImage={userData.qrImage}
                profilePhoto={userData.profilePhoto}
                name={userData.name}
                rollNo={userData.rollNo}
                batch={userData.batch}
            />
        </div>
    );
};

export default ProfilePage;
