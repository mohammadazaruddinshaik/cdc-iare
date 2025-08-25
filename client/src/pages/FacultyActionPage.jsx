import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QrCode, UserCheck, ArrowRight, User, LogOut, Menu, X } from 'lucide-react';

import Header from '../components/Header';

// --- Main Faculty Action Page Component ---
const FacultyActionPage = () => {
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Set user role for demonstration
        localStorage.setItem("userRole", "faculty");
        // Trigger animation on component mount
        setTimeout(() => setAnimate(true), 100);
    }, []);

    const actionItems = [
        { 
            title: "Scan QR Code", 
            icon: <QrCode className="w-8 h-8 text-blue-600" />, 
            description: "Use the camera to scan a student's QR code for quick attendance marking.", 
            bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50", 
            path: "/post-attendance" // <-- UPDATED PATH
        },
        { 
            title: "Mark Attendance Manually", 
            icon: <UserCheck className="w-8 h-8 text-green-600" />, 
            description: "Select a batch and session to manually update the attendance roster.", 
            bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50", 
            path: "/faculty/mark-attendance" 
        },
    ];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex flex-col">
            {/* Header Section */}
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full shadow-2xl relative">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10 py-2">
                    <Header animate={animate} />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-4xl mx-auto">
                    <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#071225]">Attendance Options</h1>
                        <p className="text-gray-600 mt-2 text-base md:text-lg">Choose your preferred method to mark attendance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {actionItems.map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => navigate(item.path)} 
                                className={`${item.bgColor} rounded-2xl p-6 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl flex flex-col border border-white/50 relative overflow-hidden group cursor-pointer ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} 
                                style={{ transitionDelay: `${400 + index * 150}ms` }}
                            >
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <div className="flex items-center justify-center w-16 h-16 bg-white/50 rounded-2xl shadow-md backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 mb-4">
                                    {item.icon}
                                </div>

                                <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 flex-grow">{item.description}</p>
                                
                                <div className="flex items-center justify-end mt-auto">
                                    <div className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm self-end shadow-md flex items-center gap-2">
                                        Proceed <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultyActionPage;
