import React, { useState, useEffect } from 'react';
import { Users, UserCheck, CalendarCheck, Download, FileText, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
// --- Mock Data ---

const mockAdminData = {
    stats: {
        totalStudents: 450,
        totalFaculty: 25,
    }
};


// --- Main Admin Dashboard Component ---

const AdminDashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Simulate fetching data
        const fetchAdminData = () => {
            try {
                // In a real app, you would fetch data from an API
                setAdminData(mockAdminData);
                
                setTimeout(() => {
                    setIsLoading(false);
                    setAnimate(true);
                }, 800);

            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError('Failed to load dashboard data.');
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#071225] border-t-transparent"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-[#071225] opacity-20"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const managementActions = [
        { title: "Manage Students", icon: <Users className="w-8 h-8 text-blue-600" />, count: adminData.stats.totalStudents, description: "View, Add, or Edit Student Details", bgColor: "bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50" },
        { title: "Manage Faculty", icon: <UserCheck className="w-8 h-8 text-green-600" />, count: adminData.stats.totalFaculty, description: "View, Add, or Edit Faculty Details", bgColor: "bg-gradient-to-br from-green-100 via-green-50 to-teal-50" },
        { title: "Manage Attendance", icon: <CalendarCheck className="w-8 h-8 text-purple-600" />, description: "Mark or Update Student Attendance", bgColor: "bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50" }
    ];

    const reportActions = [
        { title: "Session Report", icon: <ArrowRight className="w-6 h-6"/>, bgColor: "bg-gradient-to-br from-green-100 to-teal-100" },
        { title: "Batch Wise Report", icon: <ArrowRight className="w-6 h-6"/>, bgColor: "bg-gradient-to-br from-green-100 to-teal-100" },
        { title: "Monthly Report", icon: <Download className="w-6 h-6"/>, bgColor: "bg-gradient-to-br from-green-100 to-teal-100" }
    ];

    return (
        <div className="min-h-screen text-gray-800 font-sans bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] overflow-x-hidden">
            <div className="bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] w-full rounded-bl-[2rem] rounded-br-[2rem] sm:rounded-bl-[3rem] sm:rounded-br-[3rem] relative overflow-hidden pb-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                </div>
                
                <div className="px-4 sm:px-6 lg:px-8 relative z-50">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                    
                    {/* Management Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10 mt-6">
                        {managementActions.map((action, index) => (
                             <div key={index} className={`${action.bgColor} rounded-2xl sm:rounded-3xl p-5 text-gray-800 shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 flex flex-col border border-white/20 relative overflow-hidden group ${animate ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: `${300 + index * 150}ms`}}>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                                <div className="flex items-start justify-between mb-2 relative z-10">
                                    <h3 className="font-bold text-lg leading-tight pr-2">{action.title}</h3>
                                    <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                                        {action.icon}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-4 h-8">{action.description}</p>
                                <div className="flex items-end justify-between mt-auto">
                                    {action.count ? 
                                        <p className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">{action.count}</p>
                                        : <div/>
                                    }
                                    <button className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors self-end shadow-lg">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Download Reports Section */}
                    <div className="mt-8">
                        <div className="flex items-center mb-4">
                            <Download className="w-6 h-6 mr-3 text-green-400" />
                            <h2 className="text-xl font-bold text-white">Reports</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
                            {reportActions.map((report, index) => (
                                <button key={index} className={`${report.bgColor} rounded-2xl sm:rounded-3xl p-5 text-gray-800 shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 flex items-center justify-between border border-white/20 relative overflow-hidden group ${animate ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: `${600 + index * 150}ms`}}>
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0 mr-4">
                                            <FileText className="w-7 h-7 text-green-700" />
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{report.title}</h3>
                                    </div>
                                    <div className="text-green-800 group-hover:text-black group-hover:translate-x-1 transition-all">
                                        {report.icon}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
