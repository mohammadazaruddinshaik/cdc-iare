import React, { useState, useEffect } from 'react';
import { 
    Search, 
    User, 
    Mail, 
    Hash, 
    GitBranch, 
    Users, 
    Lock, 
    Eye, 
    EyeOff, 
    Loader2,
    UserCog,
    CheckCircle
} from 'lucide-react';
import Header from '../components/Header';

// Password Input Component
const PasswordInput = ({ id, label, value, onChange, error, placeholder }) => {
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
                    placeholder={placeholder}
                    className={`w-full bg-white/10 border rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-indigo-500'
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
};

// Profile Detail Component
const ProfileDetail = ({ icon, label, value }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex flex-col items-center">
        <div className="flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-3 rounded-xl border border-white/10 mb-3">
            {icon}
        </div>
        <p className="text-sm text-gray-300 mb-1 font-medium">{label}</p>
        <p className="font-semibold text-white text-lg leading-tight text-center">{value || 'N/A'}</p>
    </div>
);

// Main Update Student Component
const UpdateStudentPage = () => {
    const [animate, setAnimate] = useState(false);
    const [searchRollNo, setSearchRollNo] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = async () => {
        if (!searchRollNo.trim()) {
            setSearchError('Please enter a roll number');
            return;
        }

        setLoading(true);
        setSearchError('');
        setUpdateMessage({ type: '', text: '' });
        setStudentData(null); // Clear previous data on new search

        try {
            const response = await fetch(`http://localhost:5000/api/Faculty/getStudentData/${searchRollNo.trim()}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Student not found or server error' }));
                throw new Error(errorData.message);
            }

            const data = await response.json();
            
            // Construct the full student data object for the UI
            setStudentData({
                ...data,
                // The API doesn't return a name, so we use the rollno as a placeholder
                name: data.rollno, 
                profilePhoto: `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${data.rollno}/${data.rollno}.jpg`
            });

        } catch (error) {
            setSearchError(error.message || 'Failed to fetch student data');
            setStudentData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        const validationErrors = {};
        if (!passwordData.newPassword) {
            validationErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) { // Example minimum length
            validationErrors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setUpdateLoading(true);
        setUpdateMessage({ type: '', text: '' });
        setErrors({});

        try {
            const response = await fetch('http://localhost:5000/api/Faculty/ResetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: "faculty",
                    targetRole: "student",
                    username: studentData.rollno,
                    ResetPassword: passwordData.newPassword
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update password');
            }

            setUpdateMessage({ type: 'success', text: result.message || 'Password updated successfully!' });
            setPasswordData({ newPassword: '', confirmPassword: '' });

        } catch (error) {
            setUpdateMessage({ type: 'error', text: error.message || 'An unknown error occurred.' });
        } finally {
            setUpdateLoading(false);
        }
    };

    const handlePasswordChange = (field) => (e) => {
        setPasswordData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="fixed top-0 left-1/4 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-600 opacity-20 blur-[120px]"></div>
            <div className="fixed top-1/2 right-1/4 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-purple-600 opacity-15 blur-[100px]"></div>

            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>

            <main className="pt-10 pb-12 max-w-6xl mx-auto px-6 lg:px-12">
                <div className={`mb-8 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <UserCog className="w-8 h-8 mr-3 text-indigo-400" />
                        Update Student
                    </h1>
                    <p className="text-gray-400">Search for a student and update their profile information</p>
                </div>

                <div className={`bg-gray-800/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 mb-8 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Search className="w-6 h-6 mr-3 text-indigo-400" />
                        Search Student
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchRollNo}
                                onChange={(e) => {
                                    setSearchRollNo(e.target.value.toUpperCase());
                                    setSearchError('');
                                    setUpdateMessage({ type: '', text: '' });
                                }}
                                placeholder="Enter student roll number"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {searchError && <p className="text-red-400 text-sm mt-2">{searchError}</p>}
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
                            ) : (
                                <><Search className="w-5 h-5" /> Search</>
                            )}
                        </button>
                    </div>
                </div>

                {studentData && (
                    <div className={`bg-gray-800/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-col p-4">
                            <img
                                src={studentData.profilePhoto}
                                alt="Student Profile"
                                className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl object-cover mb-4"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/128x128/6366f1/ffffff?text=' + (studentData.name?.charAt(0) || 'S');
                                }}
                            />
                            <h2 className="text-2xl font-bold text-white">{studentData.name}</h2>
                            <p className="text-indigo-200">{studentData.rollno}</p>
                        </div>

                        <div className="p-8">
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileDetail icon={<Mail size={20} className="text-indigo-400" />} label="Email" value={studentData.email} />
                                <ProfileDetail icon={<GitBranch size={20} className="text-indigo-400" />} label="Branch" value={studentData.branch} />
                                <ProfileDetail icon={<Users size={20} className="text-indigo-400" />} label="Batch" value={studentData.batch} />
                            </div>

                            <div className="border-t border-white/10 pt-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Lock className="w-6 h-6 mr-3 text-indigo-400" />
                                    Update Password
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                                    <PasswordInput id="new-password" label="New Password" value={passwordData.newPassword} onChange={handlePasswordChange('newPassword')} error={errors.newPassword} placeholder="Enter new password" />
                                    <PasswordInput id="confirm-password" label="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange('confirmPassword')} error={errors.confirmPassword} placeholder="Confirm new password" />
                                </div>
                                <div className="flex justify-end mb-4 mt-6">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={updateLoading || !passwordData.newPassword}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-orange-600/30 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updateLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                                        ) : (
                                            <><Lock className="w-5 h-5" /> Update Password</>
                                        )}
                                    </button>
                                </div>
                                {updateMessage.text && (
                                    <div className={`p-4 rounded-xl text-center font-medium ${updateMessage.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            {updateMessage.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                            {updateMessage.text}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!studentData && !loading && (
                    <div className={`text-center text-gray-400 transform transition-all duration-1000 delay-600 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                            <UserCog className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <p className="text-lg">Enter a student's roll number to view their profile</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UpdateStudentPage;