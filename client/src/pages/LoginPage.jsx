import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// The base URL for your API is now loaded from environment variables.
// This is the standard, secure way to handle configuration.
const API_URL = 'http://localhost:5000';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const getRole = (uname) => {
        if (uname.startsWith('2')) return 'student';
        if (uname.toUpperCase().startsWith('IARE')) return 'faculty';
        if (uname.toLowerCase().startsWith('cdc')) return 'admin';
        return null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        const role = getRole(username);
        if (!role) {
            setError('Invalid username format. Could not determine user role.');
            return;
        }

        setIsLoading(true);

        try {
            // Use the API_URL from the environment variable.
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                // **PRODUCTION CHANGE: Store the authentication token.**
                // The server should return a token (e.g., a JWT) upon successful login.
                // We store this token in localStorage to use for future authenticated requests.
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    console.log('Login successful, token stored.');
                    navigate('/dashboard');
                } else {
                    // This handles cases where the server gives a 200 OK but no token.
                    setError('Login successful, but no authentication token was received.');
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
            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-8 shadow-2xl border border-white/10">
                <h2 className="text-3xl font-bold text-center text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    CDC Portal Login
                </h2>
                <p className="text-center text-gray-400 mb-8">Welcome back, please login to continue.</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center animate-pulse">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="ml-2">Logging in...</span>
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