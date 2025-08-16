import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { User, Mail, Hash, GitBranch, Users, QrCode, Lock, X, Eye, EyeOff, Camera, Edit } from 'lucide-react';

// Main Profile Page Component
const ProfilePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    // Trigger animation on component mount
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Dummy user data - same as original
    const userData = {
        name: 'Shaik Mohammad Azaruddin',
        rollNo: 'B21CS001',
        branch: 'Computer Science & Engineering(AI & ML)',
        batch: 'SKILLUP - 2',
        email: '23951a66h8@iare.ac.in',
        profilePhoto: 'https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/23951A66H8/23951A66H8.jpg',
        qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=B21CS001',
        bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop',
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Background decorative elements */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="fixed top-0 left-1/4 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-600 opacity-20 blur-[120px]"></div>
            <div className="fixed top-1/2 right-1/4 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-purple-600 opacity-15 blur-[100px]"></div>

 <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-fit bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
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
                            <div className="flex flex-col xl:flex-row items-start gap-12 -mt-28">
                                {/* Profile Image & Basic Info */}
                                <div className="flex-shrink-0 text-center xl:text-center">
                                    <div className="relative inline-block">
                                        <img
                                            src={userData.profilePhoto}
                                            alt="Profile"
                                            className="w-66 h-66 rounded-full border-8 border-gray-800/50 shadow-2xl object-cover mx-auto xl:mx-0 transition-transform duration-500 hover:scale-105"
                                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/818cf8/ffffff?text=AZ'; }}
                                        />
                                      
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-white mt-8 mb-3">{userData.name}</h1>
                                </div>

                                {/* Details Grid - Wider */}
                                <div className="flex-grow w-full grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-12 xl:mt-0">
                                    <div className="lg:col-span-3 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10 h-5">
                                        <ProfileDetail icon={<Hash size={22} className="text-indigo-400"/>} label="Roll Number" value={userData.rollNo} />
                                        <ProfileDetail icon={<GitBranch size={22} className="text-indigo-400"/>} label="Branch" value={userData.branch} />
                                        <ProfileDetail icon={<Users size={22} className="text-indigo-400"/>} label="Batch" value={userData.batch} />
                                        <ProfileDetail icon={<Mail size={22} className="text-indigo-400"/>} label="Email" value={userData.email} />
                                    </div>
                                    
                                    {/* QR Code - Enhanced with Better Glass Effect */}
                                    <div className="lg:col-span-1 xl:col-span-2 flex flex-col items-center justify-center p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl transition-transform duration-500 hover:scale-105 hover:shadow-indigo-500/20 border border-white/20">
                                        <div className="mb-4">
                                            <QrCode size={32} className="text-gray-600 mx-auto" />
                                        </div>
                                        <img
                                            src={userData.qrImage}
                                            alt="QR Code"
                                            className="w-52 h-52 rounded-2xl shadow-lg"
                                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/ffffff/000000?text=Error'; }}
                                        />
                                        <p className="text-sm text-gray-700 font-bold mt-4 tracking-wide">STUDENT ID</p>
                                        <p className="text-xs text-gray-500 font-medium">{userData.rollNo}</p>
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
            
            <ChangePasswordModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

// Enhanced Profile Detail Component
const ProfileDetail = ({ icon, label, value }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:translate-y-1 border border-white/20">
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

// Enhanced Modal Component
const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const validatePasswords = () => {
        const newErrors = {};
        
        if (!passwords.oldPassword) newErrors.oldPassword = 'Current password is required';
        if (!passwords.newPassword) newErrors.newPassword = 'New password is required';
        if (passwords.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
        if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        return newErrors;
    };

    const handleSubmit = () => {
        const validationErrors = validatePasswords();
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Password change submitted");
            setIsLoading(false);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
            onClose();
        }, 2000);
    };

    const handleChange = (field, value) => {
        setPasswords(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="relative w-full max-w-lg bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-10 transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"
                >
                    <X size={24} />
                </button>
                
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-3">Change Password</h2>
                    <p className="text-gray-400">Update your password to keep your account secure</p>
                </div>

                <div className="space-y-8">
                    <PasswordInput 
                        id="old-password" 
                        label="Current Password" 
                        value={passwords.oldPassword}
                        onChange={(e) => handleChange('oldPassword', e.target.value)}
                        error={errors.oldPassword}
                    />
                    <PasswordInput 
                        id="new-password" 
                        label="New Password" 
                        value={passwords.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        error={errors.newPassword}
                    />
                    <PasswordInput 
                        id="confirm-password" 
                        label="Confirm New Password" 
                        value={passwords.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}
                    />
                    
                    <div className="flex justify-end gap-4 pt-6">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="py-4 px-8 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            className="py-4 px-8 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            )}
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Security Tips */}
                <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <h4 className="text-blue-400 font-semibold mb-3">Security Tips:</h4>
                    <ul className="text-gray-400 text-sm space-y-2">
                        <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
                        <li>• Don't reuse passwords from other accounts</li>
                        <li>• Consider using a password manager</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;