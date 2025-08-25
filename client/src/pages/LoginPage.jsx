// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// The base URL for your API. In a real app, this should be in a .env file.
const API_URL = 'http://localhost:5000';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // 1. Initialize the navigate function from the useNavigate hook
    const navigate = useNavigate();
    
    // // This is a client-side role determination. 
    // // For better security, the role should ideally be sent from the server upon successful login.
    // const getRole = (uname) => {
    //     if (uname.startsWith('2')) return 'student';
    //     if (uname.toUpperCase().startsWith('IARE')) return 'faculty';
    //     if (uname.toLowerCase().startsWith('cdc')) return 'admin';
    //     return null; // Return null if no role matches
    // };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password}),
                // credentials: "include",
            });
            
            const data = await response.json();
            const role = data.role;
            if (response.ok) {
                localStorage.setItem("userIdentifier", username.toUpperCase());
                localStorage.setItem("userRole", role); 
                switch (role) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'faculty':
                        navigate('/faculty/dashboard');
                        break;
                    case 'student':
                        navigate('/student/dashboard');
                        break;
                    default:
                        // Fallback for an unexpected role
                        setError("Login successful, but role is unknown.");
                        break;
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login request failed:', err);
            setError('An error occurred. Please check your network and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
            </div>
            
            {/* Login Form Card */}
            <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-center text-white mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    CDC Portal Login
                </h2>
                <p className="text-center text-gray-400 text-sm mb-6">Welcome back, please login to continue.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-red-400 text-xs text-center pt-1 animate-pulse">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                <span>Login</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
