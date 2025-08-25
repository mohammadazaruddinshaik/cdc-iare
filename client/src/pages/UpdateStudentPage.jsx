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
    CheckCircle,
    KeyRound,
    GraduationCap
} from 'lucide-react';
import Header from '../components/Header'; // Assuming this is the correct path to your Header component

// This helper function safely processes the JSON response from the server.
async function processResponse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred and the server sent back a JSON error.');
        }
        return data;
    } else {
        throw new Error('The server sent an unexpected response. This could be a temporary issue. Please try again.');
    }
}

// A reusable component to display student details.
const ProfileDetail = ({ icon, label, value }) => (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-col items-center">
        <div className="flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-2 rounded-lg border border-white/10 mb-2">
            {icon}
        </div>
        <p className="text-xs text-gray-300 mb-1 font-medium">{label}</p>
        <p className="font-semibold text-white text-base leading-tight text-center">{value || 'N/A'}</p>
    </div>
);

// The main component for updating student profiles and resetting passwords.
const UpdateStudentPage = () => {
    const [animate, setAnimate] = useState(false);
    const [searchRollNo, setSearchRollNo] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
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
        setStudentData(null);
        try {
            const response = await fetch(`http://localhost:5000/api/Faculty/getStudentData/${searchRollNo.trim()}`);
            const data = await processResponse(response);
            setStudentData({
                ...data,
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

    const handleResetPassword = async () => {
        setUpdateLoading(true);
        setUpdateMessage({ type: '', text: '' });
        try {
            const response = await fetch('http://localhost:5000/api/Faculty/ResetPassword', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: "faculty",
                    username: studentData.rollno,
                })
            });
            const result = await processResponse(response);
            setUpdateMessage({ type: 'success', text: result.message || 'Password reset successfully!' });
        } catch (error) {
            setUpdateMessage({ type: 'error', text: error.message || 'An unknown error occurred.' });
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="fixed inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="fixed top-0 left-1/4 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-indigo-600 opacity-20 blur-[100px]"></div>
            <div className="fixed top-1/2 right-1/4 -z-10 m-auto h-[200px] w-[200px] rounded-full bg-purple-600 opacity-15 blur-[80px]"></div>

            <div className="px-4 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-2"></div>
            </div>

            <main className="pt-8 pb-10 max-w-4xl mx-auto px-4 lg:px-8">
                <div className={`mb-6 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center">
                        <UserCog className="w-6 h-6 mr-2 text-indigo-400" />
                        Update Student
                    </h1>
                    <p className="text-gray-400 text-sm">Search for a student to view their profile and reset their password.</p>
                </div>

                <div className={`bg-gray-800/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 mb-6 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Search className="w-5 h-5 mr-2 text-indigo-400" />
                        Search Student
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchRollNo}
                                onChange={(e) => {
                                    setSearchRollNo(e.target.value.toUpperCase());
                                    setSearchError('');
                                    setUpdateMessage({ type: '', text: '' });
                                }}
                                placeholder="Enter roll number"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {searchError && <p className="text-red-400 text-xs mt-1">{searchError}</p>}
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                            ) : (
                                <><Search className="w-4 h-4" /> Search</>
                            )}
                        </button>
                    </div>
                </div>

                {studentData && (
                    <div className={`bg-gray-800/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="relative h-36 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-col p-4">
                            <img
                                src={studentData.profilePhoto}
                                alt="Student Profile"
                                className="w-24 h-24 rounded-full border-2 border-white/20 shadow-xl object-cover mb-2"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/96x96/6366f1/ffffff?text=' + (studentData.name?.charAt(0) || 'S');
                                }}
                            />
                            <h2 className="text-xl font-bold text-white">{studentData.name}</h2>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ProfileDetail icon={<GraduationCap size={16} className="text-indigo-400" />} label="Branch" value={studentData.branch} />
                                <ProfileDetail icon={<Users size={16} className="text-indigo-400" />} label="Batch" value={studentData.batch} />
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    <KeyRound className="w-5 h-5 mr-2 text-indigo-400" />
                                    Reset Password
                                </h3>
                                
                                <p className="text-gray-400 mb-4 text-center text-sm">
                                    Clicking the button below will reset the student's password to a default password which is pat@2025. This action is immediate.
                                </p>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={updateLoading}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-300 shadow-lg shadow-orange-600/30 disabled:opacity-50 flex items-center gap-2 text-sm"
                                    >
                                        {updateLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                                        ) : (
                                            <><KeyRound className="w-4 h-4" /> Reset Password</>
                                        )}
                                    </button>
                                </div>
                                {updateMessage.text && (
                                    <div className={`mt-4 p-3 rounded-lg text-center font-medium text-sm ${updateMessage.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            {updateMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
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
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                            <UserCog className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                            <p className="text-base">Enter a student's roll number to view their profile</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UpdateStudentPage;