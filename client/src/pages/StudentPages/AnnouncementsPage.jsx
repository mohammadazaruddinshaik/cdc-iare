import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Calendar, Clock, 
    ExternalLink, Info, Megaphone, 
    ArrowRight, Bell, X,
    FileText, ClipboardCheck, UserPlus,
    Star, ShieldAlert, Sparkles, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader'; 

const API_URL = import.meta.env.VITE_BASE_URL;

// --- STYLING CONFIGURATION ---
const CATEGORY_STYLES = {
    GENERAL: {
        gradient: 'from-blue-500/20 to-blue-600/5',
        text: 'text-blue-300',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        icon: <Info className="w-4 h-4" />,
    },
    EVENTS: {
        gradient: 'from-fuchsia-500/20 to-purple-600/5',
        text: 'text-fuchsia-300',
        border: 'border-fuchsia-500/30',
        bg: 'bg-fuchsia-500/10',
        icon: <Calendar className="w-4 h-4" />,
    },
    FORMS: {
        gradient: 'from-amber-500/20 to-yellow-600/5',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        icon: <FileText className="w-4 h-4" />,
    },
    ASSESSMENTS: {
        gradient: 'from-rose-500/20 to-red-600/5',
        text: 'text-rose-300',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        icon: <ClipboardCheck className="w-4 h-4" />,
    },
    REGISTRATIONS: {
        gradient: 'from-emerald-500/20 to-green-600/5',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        icon: <UserPlus className="w-4 h-4" />,
    },
    DEFAULT: {
        gradient: 'from-slate-500/20 to-gray-600/5',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        bg: 'bg-slate-500/10',
        icon: <Megaphone className="w-4 h-4" />,
    }
};

const getCategoryStyle = (cat) => CATEGORY_STYLES[cat?.toUpperCase()] || CATEGORY_STYLES.DEFAULT;

// --- DETAIL MODAL COMPONENT ---
const AnnouncementModal = ({ item, onClose }) => {
    if (!item) return null;
    const style = getCategoryStyle(item.category);
    const dateObj = new Date(item.createdAt);
    
    // Determine the ONE primary link to show
    const primaryLink = item.googleSheetUrl || item.linkUrl;
    const linkLabel = item.googleSheetUrl ? "Action Required" : "Open Resource";

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#0F172A] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Modal Header - Clean, no overflowing gradients */}
                <div className="p-8 border-b border-white/5 bg-[#1E293B]">
                    <div className="flex justify-between items-start mb-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
                            {style.icon} {item.category || 'GENERAL'}
                        </span>
                        <button onClick={onClose} className="p-2 bg-black/20 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight pr-4 mb-2">{item.title}</h2>
                    <p className="text-white/60 text-sm font-medium flex items-center gap-2">
                        <Clock size={14}/> Posted on {dateObj.toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </p>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Metadata Grid */}
                    {(item.isMandatory || item.deadline) && (
                        <div className="flex flex-wrap gap-3">
                            {item.isMandatory && (
                                <div className="flex items-center gap-2 text-xs font-bold text-rose-300 bg-rose-500/10 px-4 py-2.5 rounded-full border border-rose-500/20 w-fit">
                                    <ShieldAlert size={14} /> Mandatory
                                </div>
                            )}
                            {item.deadline && (
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-4 py-2.5 rounded-full border border-amber-500/20 w-fit">
                                    <Clock size={14} /> Due: {new Date(item.deadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base font-medium">
                            {item.description}
                        </p>
                    </div>
                </div>

                {/* Modal Footer (Action) */}
                {primaryLink && (
                    <div className="p-8 border-t border-white/5 bg-black/20">
                        <a 
                            href={primaryLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-blue-600/20 active:scale-95"
                        >
                            {linkLabel} <ExternalLink size={18} /> 
                        </a>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// --- MAIN PAGE COMPONENT ---
const InboxPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [availableCategories, setAvailableCategories] = useState(['ALL']);
    
    // Modal State
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
                    const uniqueCats = new Set(data.announcements.map(a => a.category ? a.category.toUpperCase() : 'GENERAL'));
                    setAvailableCategories(['ALL', ...Array.from(uniqueCats).sort()]);
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
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans pb-20 relative overflow-hidden selection:bg-blue-500/30">
            
            {/* Header */}
            <div className="px-4 sm:px-6 relative z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
            </div>

            <main className="relative z-10 px-4 sm:px-6 py-6 max-w-7xl mx-auto space-y-12">
                
                {/* 1. Page Title & Search */}
                <div className={`flex flex-col md:flex-row justify-between items-end gap-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 pb-2">
                                Campus Inbox
                            </span>
                            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse mb-2" />
                        </h1>
                        <p className="text-slate-400 font-medium text-base mt-2">Important updates and announcements.</p>
                    </div>

                    <div className="relative group w-full md:w-96">
                        <div className="relative flex items-center bg-[#0F172A] border border-white/10 rounded-full shadow-xl hover:border-white/20 transition-colors h-14">
                            <Search className="absolute left-5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-12 py-3 bg-transparent text-base text-white placeholder-slate-500 focus:outline-none rounded-full font-medium"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-4 p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Filter Tabs */}
                <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {availableCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`
                                relative px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300
                                border
                                ${activeFilter === cat 
                                    ? 'bg-white text-[#071225] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transform -translate-y-0.5' 
                                    : 'bg-[#1E293B]/40 text-slate-400 border-white/5 hover:bg-[#1E293B] hover:text-white hover:border-white/20'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 3. Cards Grid (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => {
                                const style = getCategoryStyle(item.category);
                                const dateObj = new Date(item.createdAt);
                                
                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="h-full"
                                    >
                                        <div 
                                            className={`
                                                group relative h-full flex flex-col justify-between
                                                bg-[#0F172A]/60 backdrop-blur-xl
                                                border border-white/5 hover:border-white/20
                                                rounded-[2.5rem] p-8 min-h-[280px]
                                                transition-all duration-500 hover:shadow-2xl hover:bg-[#0F172A]/80 cursor-pointer
                                            `}
                                            onClick={() => setSelectedAnnouncement(item)}
                                        >
                                            
                                            <div className="relative z-10 flex flex-col h-full">
                                                
                                                {/* Header: Date & Category */}
                                                <div className="flex justify-between items-start mb-8">
                                                    {/* Clean Category Badge */}
                                                    <span className={`
                                                        inline-flex items-center gap-2 px-4 py-2 rounded-full
                                                        text-[10px] font-black uppercase tracking-widest border
                                                        ${style.bg} ${style.text} ${style.border}
                                                    `}>
                                                        {style.icon} {item.category || 'GENERAL'}
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="block text-3xl font-black text-white leading-none">
                                                            {dateObj.getDate()}
                                                        </span>
                                                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                                                            {dateObj.toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="mb-8 flex-1">
                                                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors line-clamp-2">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-base text-slate-400 leading-relaxed font-medium line-clamp-3">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Footer: View More */}
                                                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-5">
                                                    {/* Updated Priority Indicator */}
                                                    {item.priority >= 2 ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                                            <Star size={12} fill="currentColor" /> Important
                                                        </span>
                                                    ) : <span></span>}

                                                    <button 
                                                        className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full transition-all group-hover:translate-x-1"
                                                    >
                                                        View Details <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            // Empty State
                            <div className="col-span-full min-h-[50vh] flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                                    <Bell className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
                                <p className="text-slate-400 text-base max-w-md">
                                    {searchTerm 
                                        ? `No results found for "${searchTerm}"` 
                                        : "Your inbox is clear. Check back later for updates."}
                                </p>
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-all"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* --- MODAL --- */}
            <AnimatePresence>
                {selectedAnnouncement && (
                    <AnnouncementModal 
                        item={selectedAnnouncement} 
                        onClose={() => setSelectedAnnouncement(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default InboxPage;