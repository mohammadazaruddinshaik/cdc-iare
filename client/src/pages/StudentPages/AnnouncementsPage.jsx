import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Calendar, Clock, AlertTriangle, 
    ExternalLink, Info, Megaphone, 
    ArrowRight, Bell, X,
    FileText, ClipboardCheck, UserPlus,
    BarChart3, ShieldAlert, Link as LinkIcon,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader'; 

const API_URL = import.meta.env.VITE_BASE_URL;

// --- STYLING CONFIGURATION ---
const CATEGORY_STYLES = {
    GENERAL: {
        gradient: 'from-blue-500/20 to-cyan-500/5',
        text: 'text-blue-300',
        border: 'border-blue-500/30',
        icon: <Info className="w-3.5 h-3.5" />,
    },
    EVENTS: {
        gradient: 'from-purple-500/20 to-pink-500/5',
        text: 'text-purple-300',
        border: 'border-purple-500/30',
        icon: <Calendar className="w-3.5 h-3.5" />,
    },
    FORMS: {
        gradient: 'from-amber-500/20 to-orange-500/5',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
        icon: <FileText className="w-3.5 h-3.5" />,
    },
    ASSESSMENTS: {
        gradient: 'from-red-500/20 to-rose-500/5',
        text: 'text-red-300',
        border: 'border-red-500/30',
        icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    },
    REGISTRATIONS: {
        gradient: 'from-emerald-500/20 to-teal-500/5',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
        icon: <UserPlus className="w-3.5 h-3.5" />,
    },
    DEFAULT: {
        gradient: 'from-slate-500/20 to-gray-500/5',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        icon: <Megaphone className="w-3.5 h-3.5" />,
    }
};

const getPriorityStyle = (priority) => {
    switch (priority) {
        case 3: return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'URGENT', pulse: true };
        case 2: return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'IMPORTANT', pulse: false };
        default: return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'NORMAL', pulse: false };
    }
};

const getCategoryStyle = (cat) => CATEGORY_STYLES[cat?.toUpperCase()] || CATEGORY_STYLES.DEFAULT;

// --- MAIN COMPONENT ---
const InboxPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [availableCategories, setAvailableCategories] = useState(['ALL']);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch Logic
    useEffect(() => {
        if (!user) { navigate('/'); return; }
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/student/get-announcements`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include",
                });
                if (response.status === 401 || response.status === 403) { logout(); return; }
                const data = await response.json();
                if (data.success && Array.isArray(data.announcements)) {
                    setMessages(data.announcements);
                    const cats = ['ALL', ...new Set(data.announcements.map(a => a.category?.toUpperCase() || 'GENERAL'))];
                    setAvailableCategories(cats);
                }
            } catch (err) { console.error("Inbox fetch error:", err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [user, navigate, logout]);

    const filteredData = useMemo(() => {
        return messages.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = activeFilter === 'ALL' || (item.category?.toUpperCase() || 'GENERAL') === activeFilter;
            return matchesSearch && matchesFilter;
        }).sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [messages, searchTerm, activeFilter]);

    if (loading) return <Loader />;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#071225] text-white font-sans pb-20 relative overflow-hidden selection:bg-blue-500/30">
            
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-30"></div>
            </div>

            {/* Header */}
            <div className="px-4 sm:px-6 relative z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent my-4"></div>
            </div>

            <main className="relative z-10 px-4 sm:px-6 py-4 max-w-7xl mx-auto space-y-8">
                
                {/* 1. Page Title & Search */}
                <div className={`flex flex-col md:flex-row justify-between items-end gap-6 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                                Campus Inbox
                            </span>
                            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium text-sm md:text-base">Stay in sync with everything happening around you.</p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 group-focus-within:opacity-60 transition duration-500 blur-sm"></div>
                        <div className="relative flex items-center bg-[#0F172A] border border-white/10 rounded-xl shadow-xl">
                            <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none rounded-xl"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 p-1 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Filter Tabs */}
                <div className={`flex flex-wrap gap-2 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {availableCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`
                                relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                border border-transparent overflow-hidden group
                                ${activeFilter === cat 
                                    ? 'bg-white text-[#071225] shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                    : 'bg-[#1E293B]/40 text-slate-400 hover:bg-[#1E293B] hover:text-white border-white/5 hover:border-white/10'}
                            `}
                        >
                            <span className="relative z-10">{cat}</span>
                            {activeFilter === cat && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* 3. Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => {
                                const style = getCategoryStyle(item.category);
                                const priority = getPriorityStyle(item.priority || 1);
                                const dateObj = new Date(item.createdAt);
                                
                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="h-full"
                                    >
                                        <div className={`
                                            group relative h-full flex flex-col justify-between
                                            bg-[#0F172A]/60 backdrop-blur-xl
                                            border border-white/5 hover:border-white/20
                                            rounded-[2rem] p-6 overflow-hidden
                                            transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] hover:-translate-y-1
                                        `}>
                                            
                                            {/* Top Decorative Gradient */}
                                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${style.gradient} opacity-50`}></div>
                                            
                                            {/* Card Content Wrapper */}
                                            <div className="relative z-10 flex flex-col h-full">
                                                
                                                {/* Header: Date & Badges */}
                                                <div className="flex justify-between items-start mb-5">
                                                    <div className="flex flex-col gap-2">
                                                        {/* Category Badge */}
                                                        <span className={`
                                                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                                                            text-[10px] font-bold uppercase tracking-widest border
                                                            bg-gradient-to-r ${style.gradient} ${style.text} ${style.border}
                                                        `}>
                                                            {style.icon}
                                                            {item.category || 'GENERAL'}
                                                        </span>

                                                        {/* Priority Badge */}
                                                        {item.priority > 1 && (
                                                            <span className={`
                                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg 
                                                                text-[9px] font-bold uppercase tracking-wider border w-fit
                                                                ${priority.bg} ${priority.border} ${priority.text}
                                                                ${priority.pulse ? 'animate-pulse' : ''}
                                                            `}>
                                                                <BarChart3 size={10} /> {priority.label}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Modern Date Box */}
                                                    <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl w-14 h-14 backdrop-blur-md group-hover:bg-white/10 transition-colors">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-xl font-black text-white">{dateObj.getDate()}</span>
                                                    </div>
                                                </div>

                                                {/* Main Content */}
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-4">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Meta Info (Due Date / Mandatory) */}
                                                {(item.isMandatory || item.deadline) && (
                                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                                        {item.isMandatory && (
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                                                                <ShieldAlert size={12} /> Required
                                                            </div>
                                                        )}
                                                        {item.deadline && (
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                                                                <Clock size={12} /> Due: {new Date(item.deadline).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Actions Footer */}
                                                <div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-2.5">
                                                    {item.googleSheetUrl && (
                                                        <a 
                                                            href={item.googleSheetUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:scale-[1.02]"
                                                        >
                                                            <ExternalLink size={14} /> 
                                                            Action Required
                                                        </a>
                                                    )}
                                                    {item.linkUrl && (
                                                        <a 
                                                            href={item.linkUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={`
                                                                flex items-center justify-between w-full px-4 py-2.5 
                                                                rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10
                                                                text-xs font-bold text-blue-300 uppercase tracking-wide transition-all group/link
                                                                ${item.googleSheetUrl ? '' : 'bg-blue-500/5 border-blue-500/10'}
                                                            `}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <LinkIcon size={14}/> Open Resource
                                                            </span>
                                                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            // Elegant Empty State
                            <div className="col-span-full min-h-[40vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
                                <div className="w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                                    <Bell className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
                                <p className="text-slate-400 max-w-sm">
                                    {searchTerm 
                                        ? `We couldn't find any announcements matching "${searchTerm}".` 
                                        : "Your inbox is clear. Check back later for updates from the campus."}
                                </p>
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-bold underline decoration-blue-500/30 underline-offset-4 hover:decoration-blue-400 transition-all"
                                    >
                                        Clear Search Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default InboxPage;