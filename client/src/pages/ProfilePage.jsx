import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail, Lock, X, Eye, EyeOff,
    Loader2, Maximize, GraduationCap, Users,
    User, QrCode,
    CheckCircle, AlertTriangle, Info,
    BadgeCheck
} from 'lucide-react';
import Header from '../components/Header';

// --- UI & HELPER COMPONENTS ---
const backendUrl = import.meta.env.VITE_BASE_URL;

const ProfileDetailCard = ({ icon, label, value, description, variant = 'default' }) => {
    const variants = {
        default: 'bg-white/80 border-white/50 hover:shadow-xl',
        primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-blue-100',
        secondary: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-purple-100'
    };

    return (
        <div className={`${variants[variant]} backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:-translate-y-1 h-full group`}>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(icon, {
                        className: "w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors"
                    })}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-bold text-gray-800 text-lg break-words leading-tight">{value}</p>
                    {description && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PasswordInput = ({ id, label, value, onChange, error, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        error
                            ? 'border-red-500 ring-red-500/50 focus:ring-red-500/50'
                            : 'border-white/20 focus:ring-blue-500/50 focus:border-blue-500/50'
                    }`}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

const StatusMessage = ({ type, message }) => {
    const types = {
        success: { bg: 'bg-green-500/20', text: 'text-green-300', icon: <CheckCircle size={20} /> },
        error: { bg: 'bg-red-500/20', text: 'text-red-300', icon: <AlertTriangle size={20} /> },
        info: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: <Info size={20} /> }
    };
    const config = types[type] || types.info;
    return (
        <div className={`${config.bg} ${config.text} p-4 rounded-xl border border-current/20 flex items-center gap-3`}>
            {config.icon}
            <span className="font-medium">{message}</span>
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose, rollNo, navigate }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

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
            const response = await fetch(`${backendUrl}/api/Student/UpdatePassword`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: "student",
                    username: rollNo,
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                }),
                credentials: "include",
            });
            
            if (!response.ok) {
                const result = await response.json().catch(() => ({ message: 'Failed to update passwrod! Please try again :(' }));
            }

            const result = await response.json();
            setApiMessage({ type: 'success', text: result.message || 'Password updated successfully! Logging you out...' });
            setTimeout(() => {
                sessionStorage.clear();
                navigate('/', { replace: true });
            }, 2000);

        } catch (err) {
            console.error("Password update error:", err.message);
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    const handleChange = (field) => (e) => {
        setPasswords(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0A1B3A]/95 to-[#071225]/95 rounded-2xl border border-white/20 shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                    <X size={24} />
                </button>
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">Change Password</h2>
                    <p className="text-gray-400 text-sm">Update your password to keep your account secure.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <PasswordInput id="old-password" label="Current Password" placeholder="Enter your current password" value={passwords.oldPassword} onChange={handleChange('oldPassword')} error={errors.oldPassword} />
                    <PasswordInput id="new-password" label="New Password" placeholder="Enter a new password (min. 8 characters)" value={passwords.newPassword} onChange={handleChange('newPassword')} error={errors.newPassword} />
                    <PasswordInput id="confirm-password" label="Confirm New Password" placeholder="Confirm your new password" value={passwords.confirmPassword} onChange={handleChange('confirmPassword')} error={errors.confirmPassword} />
                    {apiMessage.text && <StatusMessage type={apiMessage.type} message={apiMessage.text} />}
                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <button type="button" onClick={onClose} className="py-3 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2" disabled={isLoading}>
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
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 w-screen h-screen bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center z-[60] p-4 lg:p-8 animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-4xl text-gray-800 flex flex-col lg:flex-row items-center gap-6 lg:gap-12 border border-gray-200">
                <div className="w-full lg:w-1/3 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <img src={profilePhoto} alt="Profile" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-200 shadow-2xl object-cover"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${name.replace(/ /g, '+')}&background=BFDBFE&color=1E3A8A&font-size=0.4&rounded=true&size=160`; }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 p-2 rounded-full border-2 border-white shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{name}</h2>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                            <BadgeCheck className="w-4 h-4" />
                            <p className="text-sm sm:text-md font-mono">{rollNo}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Users className="w-3 h-3 text-blue-600" />
                            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full text-xs">{batch}</span>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 flex flex-col items-center space-y-6 mt-6 lg:mt-0">
                    <div className="relative w-full aspect-square p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-2 border-gray-200">
                        <img src={qrImage} alt="Digital ID QR Code" className="w-full h-full object-contain rounded-2xl" draggable="false"
                            onError={(e) => { e.target.src = 'https://placehold.co/800x800/f8fafc/64748b?text=QR+Code+Error'; }}
                        />
                        <div className="absolute -top-3 -left-3 bg-blue-600 p-2 rounded-xl shadow-lg">
                            <QrCode className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 bg-black/30 hover:bg-black/50 transition-all rounded-full p-3 hover:scale-110" aria-label="Close fullscreen view">
                <X size={28} />
            </button>
        </div>
    );
};

const ProfileSkeletonLoader = () => (
    <div className="animate-pulse">
        <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[3rem] rounded-br-[3rem]">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-2 h-[88px]">
                    <div className="h-14 w-32 bg-white/10 rounded-lg"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-48 bg-white/10 rounded-full"></div>
                        <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                    </div>
                </div>
                <div className="w-full h-px bg-white/10 my-6"></div>
                <div className="py-12 lg:min-h-[50vh] flex items-center">
                    <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-12 lg:gap-16">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="w-44 h-44 rounded-full bg-white/10 flex-shrink-0"></div>
                            <div className="space-y-4 text-center lg:text-left">
                                <div className="h-10 w-72 bg-white/10 rounded-lg mx-auto lg:mx-0"></div>
                                <div className="h-6 w-48 bg-white/10 rounded-lg mx-auto lg:mx-0"></div>
                                <div className="flex gap-3 justify-center lg:justify-start">
                                    <div className="h-8 w-24 bg-white/10 rounded-full"></div>
                                    <div className="h-8 w-32 bg-white/10 rounded-full"></div>
                                </div>
                                <div className="h-10 w-40 bg-white/10 rounded-full mx-auto lg:mx-0 mt-2"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4 mt-8 lg:mt-0">
                            <div className="w-48 h-48 bg-white/20 p-4 rounded-2xl">
                                <div className="w-full h-full bg-white/10 rounded-xl"></div>
                            </div>
                            <div className="h-4 w-48 bg-white/10 rounded-lg"></div>
                            <div className="h-12 w-52 bg-white/10 rounded-lg mt-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <main className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="h-10 w-1/3 bg-gray-300 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
            </div>
        </main>
    </div>
);


// --- MAIN PROFILE PAGE COMPONENT ---
const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [isFullScreenQrOpen, setIsFullScreenQrOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const rollno = sessionStorage.getItem('userIdentifier');
                if (!rollno){
                    sessionStorage.clear();
                    navigate('/', { replace: true });
                }

                const fetchDataPromise = fetch(`${backendUrl}/api/Student/getProfileData`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rollno }),
                    credentials: "include",
                });
                const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1500));

                const [response] = await Promise.all([fetchDataPromise, minDelayPromise]);

                if (!response.ok) {
                    sessionStorage.clear();
                    navigate('/', { replace: true });
                }

                const data = await response.json();
                if (data.student) {
                    setUserData({
                        name: data.student.name,
                        rollNo: data.student.rollno,
                        branch: data.student.branch,
                        batch: data.student.batch,
                        email: data.student.email,
                        qrImage: data.student.qrLink,
                        profilePhoto: `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${data.student.rollno}/${data.student.rollno}.jpg`,
                    });
                } else {
                      sessionStorage.clear();
                      navigate('/', { replace: true });
                }
            } catch (err) {
                sessionStorage.clear();
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [navigate]);

    if (loading) {
        if (isMobile) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-[#071225] to-[#0A1B3A] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                </div>
            );
        }
        return <ProfileSkeletonLoader />;
    }

    if (!userData) return null;

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

                    <div className={`py-12 lg:min-h-[50vh] flex items-center transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-12 lg:gap-16">
                            <div className="flex flex-col lg:flex-row items-center gap-8 text-white">
                                <div className="relative flex-shrink-0">
                                    <img src={userData.profilePhoto} alt="Profile" className="w-44 h-44 rounded-full border-4 border-white/30 shadow-2xl object-cover"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${userData.name.replace(/ /g, '+')}&background=1F2937&color=BFDBFE&font-size=0.4&rounded=true&size=176`; }}
                                    />
                                </div>
                                <div className="flex-grow text-center lg:text-left space-y-4">
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{userData.name}</h1>
                                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                                            <Users className="w-5 h-5 text-blue-300" />
                                            <p className="text-blue-300 font-mono text-lg sm:text-xl">{userData.rollNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                            <GraduationCap className="w-4 h-4" />
                                            <span className="text-sm font-medium">{userData.branch}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm font-medium">{userData.batch}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex justify-center lg:justify-start">
                                        {/* NEW: Updated button color with a gradient */}
                                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
                                            <Lock size={14} />
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4 text-white text-center flex-shrink-0 mt-8 lg:mt-0">
                                <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
                                    <img src={userData.qrImage} alt="QR Code" className="w-48 h-48 rounded-xl" draggable="false"
                                        onError={(e) => { e.target.src = 'https://placehold.co/192x192/f8fafc/64748b?text=QR+Error'; }}
                                    />
                                </div>
                                <div className="max-w-xs">
                                    <h4 className="font-semibold text-lg">Digital ID Card</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        👉 Note: This QR code updates in real time for maximum security.
                                    </p>
                                </div>
                                <button onClick={() => setIsFullScreenQrOpen(true)} className="mt-2 flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-sm justify-center shadow-lg shadow-blue-600/30">
                                    <Maximize size={16} />
                                    View Fullscreen QR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="px-4 sm:px-6 lg:px-8 py-12 relative z-10 max-w-7xl mx-auto">
                <div className={`transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <section>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileDetailCard icon={<User />} label="Full Name" value={userData.name}  variant="primary" />
                            <ProfileDetailCard icon={<Users />} label="Roll Number" value={userData.rollNo} />
                            <ProfileDetailCard icon={<Mail />} label="Email Address" value={userData.email}  />
                            <ProfileDetailCard icon={<GraduationCap />} label="Branch" value={userData.branch}  variant="secondary" />
                            <ProfileDetailCard icon={<Users />} label="Batch" value={userData.batch} />
                            <ProfileDetailCard icon={<CheckCircle />} label="Academic Status" value="Active"  variant="primary" />
                        </div>
                    </section>
                </div>
            </main>

            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rollNo={userData.rollNo} navigate={navigate} />
            <FullScreenQRCodeModal isOpen={isFullScreenQrOpen} onClose={() => setIsFullScreenQrOpen(false)} qrImage={userData.qrImage} profilePhoto={userData.profilePhoto} name={userData.name} rollNo={userData.rollNo} batch={userData.batch} />
        </div>
    );
};

export default ProfilePage;