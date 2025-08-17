import React, { useState, useEffect } from 'react';
import { User, Mail, Hash, GitBranch, Users, QrCode, Lock, X, Eye, EyeOff, Camera, Edit, Loader2 } from 'lucide-react';
import Header from '../components/Header'

// Main Profile Page Component
const ProfilePage = () => {
    // --- State for fetched data, loading, and errors ---
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for UI controls ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [isFullScreenQrOpen, setIsFullScreenQrOpen] = useState(false);

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
                // Retrieve the roll number from localStorage.
                const rollno = localStorage.getItem('rollno');

                if (!rollno) {
                    throw new Error("Roll number not found in local storage.");
                }

                const response = await fetch('http://localhost:5000/api/Student/getProfileData', {
                    method: 'POST', // Changed to POST method
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rollno: rollno }), // Send rollno in the request body
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();

                // --- Adapt backend data for frontend compatibility ---
                if (data.student) {
                    setUserData({
                        name: data.student.name,
                        rollNo: data.student.rollno,
                        branch: data.student.branch,
                        batch: data.student.batch,
                        email: data.student.email,
                        qrImage: data.student.qrLink,
                        profilePhoto: `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${data.student.rollno}/${data.student.rollno}.jpg`,
                        bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop',
                    });
                } else {
                    throw new Error("Student data not found in the response.");
                }
                
                setError(null);
            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                setError(err.message);
                setUserData(null); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []); // Empty dependency array ensures this runs only once on mount.


    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const openFullScreenQr = () => setIsFullScreenQrOpen(true);
    const closeFullScreenQr = () => setIsFullScreenQrOpen(false);
    
    // --- Render loading state ---
    const renderLoading = () => (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
            <p className="mt-4 text-lg text-gray-300">Loading Profile...</p>
        </div>
    );

    // --- Render error state ---
    const renderError = () => (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <div className="text-center bg-red-900/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-red-400">Failed to Load Profile</h2>
                <p className="text-red-300 mt-2">Could not fetch data from the server. Please try again later.</p>
                <p className="text-sm text-gray-500 mt-4">Error: {error}</p>
            </div>
        </div>
    );
    
    // --- Main render logic ---
    if (loading) {
        return renderLoading();
    }

    if (error || !userData) {
        return renderError();
    }

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
                {/* Wider container */}
                <div className="max-w-8xl mx-auto px-6 lg:px-12">
                    <div
                        className={`bg-gray-800/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-1000 ease-out
                            ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        {/* Enhanced Banner */}
                        <div className="relative h-72 bg-cover bg-center" style={{ backgroundImage: `url(${userData.bannerImage})` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                        </div>

                        <div className="px-12 pb-12">
                            {/* Profile Section - Wider Layout */}
                            <div className="flex flex-col xl:flex-row items-end gap-12 -mt-28">
                                {/* Profile Image & Basic Info */}
                                <div className="flex-shrink-0 text-center xl:text-center">
                                    <div className="relative inline-block">
                                        <img
                                            src={userData.profilePhoto}
                                            alt="Profile"
                                            className="w-64 h-64 rounded-full border-8 border-gray-800/50 shadow-2xl object-cover mx-auto xl:mx-0 transition-transform duration-500 hover:scale-105"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/818cf8/ffffff?text=AZ'; }}
                                        />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-white mt-8 mb-3">{userData.name}</h1>
                                </div>

                                {/* Details Grid - Wider */}
                                <div className="flex-grow w-full grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                    <div className="lg:col-span-3 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <ProfileDetail icon={<Hash size={22} className="text-indigo-400" />} label="Roll Number" value={userData.rollNo} />
                                        <ProfileDetail icon={<GitBranch size={22} className="text-indigo-400" />} label="Branch" value={userData.branch} />
                                        <ProfileDetail icon={<Users size={22} className="text-indigo-400" />} label="Batch" value={userData.batch} />
                                        <ProfileDetail icon={<Mail size={22} className="text-indigo-400" />} label="Email" value={userData.email} />
                                    </div>

                                    {/* QR Code Card */}
                                    <div className="lg:col-span-1 xl:col-span-2 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl transition-transform duration-500 hover:scale-105 hover:shadow-indigo-500/20 border border-white/20">
                                        
                                        <img
                                            src={userData.qrImage}
                                            alt="QR Code"
                                            className="w-48 h-48 rounded-2xl shadow-lg"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/ffffff/000000?text=Error'; }}
                                        />
                                        <button 
                                            onClick={openFullScreenQr} 
                                            className="mt-4 bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                                        >
                                            View Full Screen
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button - Enhanced */}
                            <div className="mt-16 pt-8 border-t border-white/10 flex justify-center xl:justify-end">
                                <button
                                    onClick={handleOpenModal}
                                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-indigo-600/30"
                                >
                                    <Lock size={20} />
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ChangePasswordModal isOpen={isModalOpen} onClose={handleCloseModal} rollNo={userData.rollNo} />
            {userData && (
                <FullScreenQRCodeModal 
                    isOpen={isFullScreenQrOpen} 
                    onClose={closeFullScreenQr} 
                    qrImage={userData.qrImage}
                    profilePhoto={userData.profilePhoto}
                    name={userData.name}
                    rollNo={userData.rollNo}
                />
            )}
        </div>
    );
};

// Enhanced Profile Detail Component
const ProfileDetail = ({ icon, label, value }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
        <div className="flex items-center gap-5">
            <div className="flex-shrink-0 bg-gray-900/30 backdrop-blur-sm p-4 rounded-2xl border border-white/10">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-300 mb-2 font-medium">{label}</p>
                <p className="font-semibold text-white text-lg leading-tight">{value}</p>
            </div>
        </div>
    </div>
);

// Enhanced Password Input with Show/Hide toggle
const PasswordInput = ({ id, label, value, onChange, error }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-3" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-white/10 border rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 transition-all ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-indigo-500'
                    }`}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
};

// Enhanced Modal Component with API Logic
const ChangePasswordModal = ({ isOpen, onClose, rollNo }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

    // Reset state when modal is closed/opened
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
            const response = await fetch('http://localhost:5000/api/Student/UpdatePassword', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                // CHANGED: Removed the 'role' field from the request body
                body: JSON.stringify({
                    role : "student",
                    username: rollNo,
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) { // status 200
                // CHANGED: Update message and implement logout logic
                setApiMessage({ type: 'success', text: 'Password updated successfully! Logging you out...' });
                setTimeout(() => {
                    localStorage.clear(); // Clear all session data
                    window.location.href = '/'; // Redirect to login page
                }, 2000);
            } else {
                setApiMessage({ type: 'error', text: result.message || 'Update failed. Please try again later.' });
            }
        } catch (err) {
            console.error("Password update error:", err);
            setApiMessage({ type: 'error', text: 'An unexpected error occurred. Please check your connection.' });
        } finally {
            // Keep loading true on success to prevent user interaction before redirect
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
                    
                    {apiMessage.text && (
                        <div className={`mt-4 text-center text-sm font-medium p-3 rounded-lg ${
                            apiMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                            {apiMessage.text}
                        </div>
                    )}

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

// Digital ID Card / Full Screen QR Code Modal Component
const FullScreenQRCodeModal = ({ isOpen, onClose, qrImage, profilePhoto, name, rollNo }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" 
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-xl text-center transform transition-transform duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center justify-center">
                    <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg mb-4"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/818cf8/ffffff?text=AZ'; }}
                    />
                    <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                    <p className="text-gray-500 mb-6">{rollNo}</p>
                    <img
                        src={qrImage}
                        alt="Full Screen QR Code"
                        className="rounded-2xl w-full max-w-xl h-auto"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/ffffff/000000?text=Error'; }}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full p-2"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};


export default ProfilePage