import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';

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
            setError('Invalid username or password');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role })
            });

            const data = await response.json();

            if (response.ok) {
               console.log('Login successful.');
                navigate('/dashboard');
            } else {
                setError(data.message || 'Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred. Please check your network and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] p-4 font-sans">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="relative w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-blue-500/20 rounded-full mb-4 border border-blue-400/30">
                        <ShieldCheck className="w-8 h-8 text-blue-300" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        CDC Login
                    </h2>
                    <p className="text-gray-400 mb-8">Enter your credentials to continue.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Username</label>
                        <input
                            type="text"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Password</label>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center animate-pulse">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="ml-2">Verifying...</span>
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
