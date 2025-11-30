import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    QrCode,
    UserCheck,
    ArrowRight,
    Layers,
} from 'lucide-react';

import Header from '../components/Header';

// --- Main Faculty Action Page Component ---
const FacultyActionPage = () => {
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulating role setting, in a real app this would be handled by auth context
        sessionStorage.setItem("userRole", "faculty");
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);

    const actionItems = [
        {
            title: "Scan for a Single Batch",
            icon: <QrCode className="w-8 h-8 text-blue-600" />,
            description: "Use the camera to scan QR codes for one specific batch in a session.",
            bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50",
            path: "/post-attendance"
        },
        {
            title: "Multi-Batch QR Scan",
            icon: <Layers className="w-8 h-8 text-sky-600" />,
            description: "Scan QR codes for multiple classes in a single, streamlined session.",
            bgColor: "bg-gradient-to-br from-sky-50 to-indigo-100",
            path: "/post-attendance-multiple"
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
        <div className="min-h-screen text-gray-800 font-sans bg-gray-50 flex flex-col">
            {/* Header Section */}
            <header className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full shadow-lg sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8 py-3">
                    <Header animate={animate} />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl mx-auto">
                    <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Attendance Options</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {actionItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(item.path)}
                                // UPDATED: Responsive padding and overflow-hidden
                                className={`${item.bgColor} rounded-2xl p-4 md:p-6 text-gray-800 shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl flex flex-col border border-white/50 relative overflow-hidden group cursor-pointer ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                                style={{ transitionDelay: `${400 + index * 150}ms` }}
                            >
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>

                                {/* UPDATED: Responsive icon container size */}
                                <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/60 rounded-2xl shadow-md backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 mb-4">
                                    {item.icon}
                                </div>

                                {/* UPDATED: Responsive title font size */}
                                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">{item.title}</h3>
                                
                                {/* UPDATED: Description is now hidden on mobile (hidden) and shown on medium screens up (md:block) */}
                                <p className="hidden md:block text-sm text-gray-600 mb-6 flex-grow">{item.description}</p>
                                
                                <div className="flex items-center justify-end mt-auto">
                                    <div className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm self-end shadow-md flex items-center gap-2 group-hover:bg-gray-900 transition-colors">
                                        Proceed <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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