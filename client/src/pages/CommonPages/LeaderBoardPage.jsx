import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, LayoutGrid, List, 
    ChevronLeft, ChevronRight, X, User, Filter,
    Sparkles, Trophy, Medal, Star
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext'; 
import Loader from '../../components/Loader';

// --- ASSET IMPORTS (Keep your existing paths) ---
import lcImg from '../../assets/leetcode.webp';
import gfgImg from '../../assets/gfg.png'; // Update path
import ccImg from '../../assets/codechef.png'; // Update path
import ghImg from '../../assets/github.png'; // Update path

const ASSETS = {
    leetcode: lcImg,
    gfg: gfgImg,
    codechef: ccImg,
    github: ghImg,
    hackerrank: null
};

// --- CONFIGURATION ---
const PODIUM_STYLES = {
    1: {
        wrapper: 'order-2 z-20 -mt-8 scale-105',
        bg: 'bg-gradient-to-b from-yellow-500/10 to-[#0F172A]/80',
        border: 'border-yellow-500/30',
        glow: 'from-yellow-500/20',
        rankCircle: 'border-yellow-400 text-yellow-400 bg-[#0A1B3A] shadow-[0_0_20px_rgba(250,204,21,0.4)]',
        text: 'text-yellow-100'
    },
    2: {
        wrapper: 'order-1 z-10 mt-8',
        bg: 'bg-gradient-to-b from-slate-400/10 to-[#0F172A]/80',
        border: 'border-slate-400/20',
        glow: 'from-slate-400/20',
        rankCircle: 'border-slate-300 text-slate-300 bg-[#0A1B3A] shadow-[0_0_20px_rgba(203,213,225,0.3)]',
        text: 'text-slate-200'
    },
    3: {
        wrapper: 'order-3 z-10 mt-8',
        bg: 'bg-gradient-to-b from-orange-500/10 to-[#0F172A]/80',
        border: 'border-orange-500/20',
        glow: 'from-orange-500/20',
        rankCircle: 'border-orange-400 text-orange-400 bg-[#0A1B3A] shadow-[0_0_20px_rgba(251,146,60,0.3)]',
        text: 'text-orange-100'
    }
};

const BRAND_STYLES = {
    leetcode: { border: 'border-[#ffa116]/40', bg: 'bg-[#ffa116]/5 hover:bg-[#ffa116]/10', text: 'text-[#ffa116]' },
    gfg: { border: 'border-[#2f8d46]/40', bg: 'bg-[#2f8d46]/5 hover:bg-[#2f8d46]/10', text: 'text-[#2f8d46]' },
    codechef: { border: 'border-[#5b4638]/50', bg: 'bg-[#5b4638]/5 hover:bg-[#5b4638]/10', text: 'text-[#d4a485]' },
    github: { border: 'border-white/30', bg: 'bg-white/5 hover:bg-white/10', text: 'text-slate-200' },
};

// --- SUB-COMPONENTS ---

const ListRankBadge = ({ rank }) => {
    if (rank > 3) return <span className="text-sm font-mono font-bold text-slate-500">#{rank}</span>;
    
    const colors = {
        1: 'border-yellow-500 text-yellow-400 shadow-yellow-500/20 bg-yellow-500/10',
        2: 'border-slate-400 text-slate-300 shadow-slate-500/20 bg-slate-400/10',
        3: 'border-orange-500 text-orange-400 shadow-orange-500/20 bg-orange-500/10'
    };

    return (
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-sm ${colors[rank]} shadow-lg`}>
            {rank}
        </div>
    );
};

const StudentAvatar = ({ rollNo, size = "md", rank }) => {
    const [error, setError] = useState(false);
    useEffect(() => setError(false), [rollNo]);

    const formattedRoll = rollNo ? rollNo.toUpperCase() : '';
    const imgSrc = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${formattedRoll}/${formattedRoll}.jpg`;
    
    const sizeClasses = { sm: "w-10 h-10", md: "w-12 h-12 lg:w-14 lg:h-14", lg: "w-20 h-20", xl: "w-24 h-24" };
    
    const isPodium = rank <= 3 && size === 'xl'; 
    const ringColor = isPodium 
        ? (rank === 1 ? 'ring-yellow-500' : rank === 2 ? 'ring-slate-400' : 'ring-orange-500') 
        : 'ring-white/10 group-hover:ring-blue-400/50';

    return (
        <div className={`relative ${sizeClasses[size]} flex-shrink-0 transition-all duration-500`}>
            <div className={`relative w-full h-full rounded-full p-[3px] ring-2 ${ringColor} bg-[#071225] overflow-hidden shadow-2xl z-10 transition-all`}>
                {!error ? (
                    <img src={imgSrc} alt="Student" onError={() => setError(true)} className="w-full h-full object-cover rounded-full" />
                ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={size === 'xl' ? 40 : 18} />
                    </div>
                )}
            </div>
        </div>
    );
};

const BrandTile = ({ type, score, url, compact = false }) => {
    const style = BRAND_STYLES[type] || BRAND_STYLES.github;
    const assetSrc = ASSETS[type];
    const numericScore = score ? parseInt(score, 10) : 0;
    const displayScore = isNaN(numericScore) ? 0 : numericScore;

    const Content = () => (
        <div className={`
            flex items-center justify-between rounded-xl border backdrop-blur-md 
            transition-all duration-300 group w-full h-full
            ${style.border} ${style.bg} hover:border-opacity-100 border-opacity-30 shadow-sm
            ${compact ? 'px-3 py-1.5' : 'px-3 py-2'}
        `}>
            <div className="shrink-0 flex items-center justify-center">
                {assetSrc ? (
                    <img src={assetSrc} alt={type} className={`${compact ? 'w-4 h-4' : 'w-4 h-4 lg:w-5 lg:h-5'} object-contain filter-none opacity-90 group-hover:opacity-100 transition-opacity`} />
                ) : (
                    <div className={`${compact ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 lg:w-6 lg:h-6 text-[10px]'} rounded-full flex items-center justify-center font-black border border-white/20 text-slate-400 bg-white/10`}>
                        {type.substring(0,1).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex items-center ml-3 min-w-0">
                <span className={`font-mono font-bold tracking-tight group-hover:text-white transition-colors truncate ${style.text} ${compact ? 'text-xs' : 'text-sm'}`}>
                    {displayScore}
                </span>
            </div>
        </div>
    );

    if (url) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full hover:-translate-y-0.5 transition-transform" title={`${type}: ${displayScore}`}>
                <Content />
            </a>
        );
    }
    return <div className="block h-full opacity-60 grayscale cursor-not-allowed"><Content /></div>;
};

// --- HERO CARD (PODIUM) ---
const HeroCard = ({ coder, rank }) => {
    if (!coder) return null;
    const isWinner = rank === 1;
    const styles = PODIUM_STYLES[rank];
    
    return (
        <div className={`relative group transition-all duration-700 ease-out flex-1 min-w-[260px] max-w-[340px] ${styles.wrapper}`}>
            <div className={`
                relative backdrop-blur-xl rounded-[2rem] p-5 pb-6
                ${styles.bg} ${styles.border} border
                hover:-translate-y-4 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500
                flex flex-col items-center h-full justify-between animate-fade-in-up
            `}>
                <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${styles.glow} to-transparent opacity-40 blur-[40px] rounded-t-[2rem]`}></div>
                
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
                        <StudentAvatar rollNo={coder.displayId} rank={rank} size={isWinner ? "xl" : "lg"} />
                        <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full border-[3px] flex items-center justify-center z-20 font-black text-base shadow-xl ${styles.rankCircle}`}>
                            {rank}
                        </div>
                    </div>
                    
                    <div className="mt-1 text-center w-full space-y-1.5">
                        <h3 className={`text-lg font-bold truncate px-2 leading-tight tracking-tight ${styles.text}`}>{coder.displayName}</h3>
                        <div className="flex justify-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg bg-black/30 text-slate-400 border border-white/5">{coder.displayId}</span>
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">{coder.batch}</span>
                        </div>
                    </div>
                    
                    <div className="my-4 w-full bg-black/20 rounded-xl py-3 border border-white/5 text-center shadow-inner group-hover:border-white/10 transition-colors">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.25em] mb-0.5 block">Total Score</span>
                        <div className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                            {(coder.totalScore || 0).toLocaleString()}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <BrandTile type="leetcode" score={coder.scores?.leetcode} url={coder.handles?.leetcode} compact={false} />
                        <BrandTile type="gfg" score={coder.scores?.gfg} url={coder.handles?.gfg} compact={false} />
                        <BrandTile type="codechef" score={coder.scores?.codechef} url={coder.handles?.codechef} compact={false} />
                        <BrandTile type="github" score={coder.scores?.github} url={coder.handles?.github} compact={false} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ENHANCED STUDENT STICKY FOOTER ---
const StudentStickyFooter = ({ myData }) => {
    if (!myData) return null;

    // Rank Badge logic for the footer
    const rankColor = myData.rank === 1 ? 'bg-yellow-500 text-yellow-950 border-yellow-400' 
                    : myData.rank === 2 ? 'bg-slate-300 text-slate-900 border-slate-200' 
                    : myData.rank === 3 ? 'bg-orange-400 text-orange-950 border-orange-300' 
                    : 'bg-blue-600 text-white border-blue-500';

    return (
        <div className="fixed bottom-2 sm:bottom-6 left-0 right-0 z-50 flex justify-center animate-slide-up px-2 sm:px-4 pointer-events-none">
            {/* Main Container - Pointer events auto to allow interaction within container */}
            <div className="pointer-events-auto w-full max-w-5xl bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] p-2 sm:p-3 pr-4 sm:pr-6 flex items-center justify-between ring-1 ring-white/5 relative overflow-hidden">
                
                {/* Decorative Background Glows */}
                <div className="absolute top-0 left-1/4 w-1/2 h-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 right-10 w-32 h-32 bg-purple-500/10 blur-2xl pointer-events-none"></div>

                {/* LEFT: Identity */}
                <div className="flex items-center gap-3 sm:gap-4 relative z-10 shrink-0">
                    <div className="relative group cursor-pointer">
                        {/* Avatar */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-blue-500/50 transition-colors">
                            <img 
                                src={`https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${myData.displayId}/${myData.displayId}.jpg`} 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                                alt="Me" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    
                   <div className="flex flex-col justify-center items-start gap-1"> 
                        {/* BADGE: Switched to Sky-400 for pop, added subtle shadow */}
                        <span className="text-[10px] sm:text-xs font-mono font-semibold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)] w-fit">
                            {myData.displayId}
                        </span>
                        
                        <div className="flex items-center gap-2">
                            {/* RANK: Added drop-shadow to make white text stand out */}
                            <span className="text-sm sm:text-base font-bold text-white drop-shadow-md leading-tight">
                                #{myData.rank}
                            </span>
                            {/* TROPHY: brightened fill opacity for a 'glow' effect */}
                            {myData.rank <= 3 && (
                                <Trophy size={14} className="text-yellow-400 fill-yellow-400/40 drop-shadow-sm" />
                            )}
                        </div>
                    </div>
                </div>

                {/* CENTER: Platform Stats (Scrollable on mobile) */}
                <div className="flex-1 mx-3 sm:mx-6 overflow-x-auto no-scrollbar mask-image-fade py-1">
                    <div className="flex items-center gap-2 sm:gap-3 w-max sm:mx-auto">
                        <div className="w-[100px] sm:w-[130px] shrink-0 h-9 sm:h-10">
                            <BrandTile type="leetcode" score={myData.scores?.leetcode} compact={true} />
                        </div>
                        <div className="w-[100px] sm:w-[130px] shrink-0 h-9 sm:h-10">
                            <BrandTile type="gfg" score={myData.scores?.gfg} compact={true} />
                        </div>
                        <div className="w-[100px] sm:w-[130px] shrink-0 h-9 sm:h-10">
                            <BrandTile type="codechef" score={myData.scores?.codechef} compact={true} />
                        </div>
                        <div className="w-[100px] sm:w-[130px] shrink-0 h-9 sm:h-10 hidden lg:block">
                            <BrandTile type="github" score={myData.scores?.github} compact={true} />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Total Score */}
                <div className="flex flex-col items-end border-l border-white/10 pl-3 sm:pl-5 shrink-0 relative z-10 min-w-[80px]">
                    <span className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-bold mb-0.5">Total</span>
                    <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-white leading-none drop-shadow-sm filter">
                        {(myData.totalScore || 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const LeaderBoardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [allCoders, setAllCoders] = useState([]);
    const [availableBatches, setAvailableBatches] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    
    const [myData, setMyData] = useState(null);
    
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false); 
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const itemsPerPage = viewMode === 'list' ? 12 : 8;

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) return; 

        const fetchData = async () => {
            try {
                const url = `${import.meta.env.VITE_BASE_URL}/api/leaderboard`;
                const res = await fetch(url, { method: 'GET', credentials: 'include' });

                if (res.status === 401 || res.status === 403) {
                    logout();
                    return; 
                }

                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                const data = await res.json();
                
                if (data.batches && Array.isArray(data.batches)) {
                    setAvailableBatches(['All', ...data.batches.sort()]);
                }

                const toTitleCase = (str) => str?.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Student';
                const rawArray = data.AllCoders || [];

                const parsed = rawArray.map(c => ({
                    ...c,
                    displayName: toTitleCase(c.name),
                    displayId: c.rollno,
                    batch: c.batch,
                    totalScore: c.totalScore ? parseInt(c.totalScore, 10) : 0,
                    scores: c.scores || {},
                    handles: c.handles || {}
                }))
                .sort((a,b) => b.totalScore - a.totalScore)
                .map((c, i) => ({...c, rank: i + 1}));

                setAllCoders(parsed);

                if (data.myPosition) {
                    const studentData = parsed.find(c => c.rank === data.myPosition);
                    setMyData(studentData);
                }

            } catch (e) {
                console.error("Leaderboard fetch error:", e);
            } finally {
                setLoading(false);
                setTimeout(() => setAnimate(true), 100);
            }
        };
        fetchData();
    }, [user, logout]);

    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return allCoders.filter(c => 
            (selectedBatch === 'All' || c.batch === selectedBatch) &&
            (c.displayName.toLowerCase().includes(lowerSearch) || c.displayId.toLowerCase().includes(lowerSearch))
        );
    }, [allCoders, searchTerm, selectedBatch]);

    const showHeroSection = isDesktop && currentPage === 1 && !searchTerm && selectedBatch === 'All' && filteredData.length > 0;
    
    const topThree = filteredData.slice(0, 3);
    const effectiveData = showHeroSection ? filteredData.slice(3) : filteredData;
    
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return effectiveData.slice(start, start + itemsPerPage);
    }, [effectiveData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(effectiveData.length / itemsPerPage);

    const isSearchExpanded = isSearchFocused || searchTerm.length > 0;
    const searchContainerClasses = isSearchExpanded 
        ? 'w-full md:w-96 px-4 bg-[#0F172A] border-white/20' 
        : 'w-10 h-10 md:w-10 md:h-10 justify-center bg-white/5 border-transparent hover:bg-white/10 cursor-pointer';

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans ${myData ? 'pb-28 sm:pb-36' : 'pb-10'}`}>
            
            <div className="relative px-3 sm:px-6 lg:px-8 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="px-3 sm:px-6 lg:px-8 py-4 max-w-[1500px] mx-auto space-y-8 lg:space-y-12">
                
                {/* Header Section */}
                <div className={`flex flex-col md:flex-row justify-between items-end mb-8 gap-6 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white tracking-tight drop-shadow-sm flex items-center gap-4">
                             Leaderboard
                        </h1>
                    </div>
                    
                    <div className="flex gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg w-full md:w-auto">
                        <div className="bg-[#0F172A]/40 px-6 py-3 text-center flex-1 md:flex-none min-w-[100px] transition-colors hover:bg-[#0F172A]/60">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Students</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono">{allCoders.length || '-'}</div>
                        </div>
                        <div className="bg-[#0F172A]/40 px-6 py-3 text-center border-l border-white/5 flex-1 md:flex-none min-w-[100px] transition-colors hover:bg-[#0F172A]/60">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Top Score</div>
                            <div className="text-xl md:text-2xl font-bold text-blue-400 font-mono">{(allCoders[0]?.totalScore || 0)}</div>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                {showHeroSection && (
                    <div className="hidden lg:flex flex-row justify-center items-end gap-6 xl:gap-10 mb-20 min-h-[400px]">
                        {topThree[1] && <HeroCard coder={topThree[1]} rank={2} />}
                        {topThree[0] && <HeroCard coder={topThree[0]} rank={1} />}
                        {topThree[2] && <HeroCard coder={topThree[2]} rank={3} />}
                    </div>
                )}

                {/* Controls - EXPANDING SEARCH, FILTER, & TOP PAGINATION */}
                <div className="sticky top-6 z-40 mb-8 flex justify-center">
                    <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-2 ring-1 ring-white/5 transition-all duration-300">
                        
                        {/* SEARCH */}
                        <div 
                            className={`relative flex items-center transition-all duration-500 ease-spring rounded-full h-10 border ${searchContainerClasses}`}
                            onClick={() => !isSearchExpanded && document.getElementById('search-input').focus()}
                        >
                            <div className={`text-slate-400 pointer-events-none transition-colors duration-300 ${isSearchExpanded ? '' : 'mx-auto'}`}>
                                <Search size={16} />
                            </div>
                            
                            <input 
                                id="search-input"
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className={`bg-transparent text-white text-sm font-bold placeholder-slate-500 focus:outline-none ml-2 transition-all duration-300 ${isSearchExpanded ? 'w-full opacity-100' : 'w-0 opacity-0 p-0'}`}
                            />
                            
                            {searchTerm && (
                                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="w-px h-6 bg-white/10"></div>
                        
                        {/* FILTERS & VIEWS */}
                        <div className="flex gap-2">
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Filter size={14} /></div>
                                <select 
                                    value={selectedBatch}
                                    onChange={(e) => { setSelectedBatch(e.target.value); setCurrentPage(1); }}
                                    className="appearance-none bg-transparent hover:bg-white/5 text-white rounded-full py-2 pl-9 pr-8 text-sm font-bold border border-transparent cursor-pointer transition-colors focus:outline-none focus:bg-white/10 h-10"
                                >
                                    {availableBatches.map(b => <option key={b} value={b} className="bg-[#0F172A] text-white">{b === 'All' ? 'All' : b}</option>)}
                                </select>
                            </div>

                            <div className="flex bg-white/5 rounded-full p-1 gap-1 border border-white/5 h-10 items-center">
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:text-white'}`}><List size={16} /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={16} /></button>
                            </div>
                        </div>

                        {/* TOP PAGINATION */}
                        {totalPages > 1 && (
                            <>
                                <div className="w-px h-6 bg-white/10 hidden md:block"></div>
                                <div className="flex items-center gap-2 hidden md:flex px-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-mono font-bold text-slate-400 select-none">
                                        {currentPage}<span className="text-slate-600 mx-1">/</span>{totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage >= totalPages}
                                        className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* List/Grid Views */}
                {paginatedData.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/10 border-dashed max-w-2xl mx-auto">
                        <Sparkles className="mx-auto text-slate-500 mb-4" size={40} />
                        <h3 className="text-xl font-bold text-white mb-1">No students found</h3>
                        <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="space-y-4">
                        <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 rounded-2xl border border-white/5 items-center select-none">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-4 pl-2">Student Profile</div>
                            <div className="col-span-5 text-center">Platform Stats</div>
                            <div className="col-span-2 text-right pr-4">Total Score</div>
                        </div>
                        {paginatedData.map((coder) => (
                            <div key={coder.displayId} className={`relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 lg:py-4 lg:px-10 transition-all duration-300 group hover:shadow-xl hover:-translate-y-0.5 ${myData?.displayId === coder.displayId ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}>
                                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:gap-6 items-center">
                                    <div className="lg:hidden flex items-center gap-4 w-full border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <ListRankBadge rank={coder.rank} />
                                            <StudentAvatar rollNo={coder.displayId} rank={coder.rank} size="md" />
                                            <div>
                                                <h4 className="font-bold text-white text-base truncate">{coder.displayName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/10 font-bold">{coder.batch}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{coder.displayId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex justify-center col-span-1"><ListRankBadge rank={coder.rank} /></div>
                                    <div className="hidden lg:flex w-full col-span-4 items-center gap-5 pl-2">
                                        <StudentAvatar rollNo={coder.displayId} rank={coder.rank} size="md" />
                                        <div className="min-w-0 flex-grow">
                                            <h4 className="font-bold text-white text-lg truncate group-hover:text-blue-300 transition-colors">{coder.displayName}</h4>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-xs font-mono font-bold text-slate-400">{coder.displayId}</span>
                                                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-md text-slate-400 border border-white/10">{coder.batch}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full lg:col-span-5 flex justify-center">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3 w-full max-w-2xl">
                                            <BrandTile type="leetcode" score={coder.scores?.leetcode} url={coder.handles?.leetcode} />
                                            <BrandTile type="gfg" score={coder.scores?.gfg} url={coder.handles?.gfg} />
                                            <BrandTile type="codechef" score={coder.scores?.codechef} url={coder.handles?.codechef} />
                                            <BrandTile type="github" score={coder.scores?.github} url={coder.handles?.github} />
                                        </div>
                                    </div>
                                    <div className="w-full lg:col-span-2 flex lg:block justify-between lg:text-right items-center pt-2 lg:pt-0">
                                        <span className="lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Score</span>
                                        <span className="text-xl lg:text-2xl font-black text-white tracking-tighter tabular-nums">{(coder.totalScore || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedData.map((coder) => (
                            <div key={coder.displayId} className={`relative bg-white/5 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-[2rem] p-6 pt-12 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group ${myData?.displayId === coder.displayId ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}>
                                <div className="absolute top-5 left-5"><ListRankBadge rank={coder.rank} /></div>
                                <div className="flex flex-col items-center text-center mb-8">
                                    <StudentAvatar rollNo={coder.displayId} rank={coder.rank} size="lg" />
                                    <div className="mt-5 space-y-1">
                                        <h4 className="font-bold text-white text-xl truncate px-2 group-hover:text-blue-300 transition-colors">{coder.displayName}</h4>
                                        <div className="flex justify-center gap-2">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/20 px-2 py-1 rounded-lg border border-white/10">{coder.displayId}</span>
                                            <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">{coder.batch}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-auto">
                                    <div className="grid grid-cols-2 gap-3">
                                        <BrandTile type="leetcode" score={coder.scores?.leetcode} url={coder.handles?.leetcode} />
                                        <BrandTile type="gfg" score={coder.scores?.gfg} url={coder.handles?.gfg} />
                                        <BrandTile type="codechef" score={coder.scores?.codechef} url={coder.handles?.codechef} />
                                        <BrandTile type="github" score={coder.scores?.github} url={coder.handles?.github} />
                                    </div>
                                    <div className="flex justify-between items-center pt-5 border-t border-white/10">
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Score</span>
                                        <span className="text-2xl font-black text-white tabular-nums">{(coder.totalScore || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Pagination */}
                {totalPages > 1 && (
                    <div className="mt-20 flex justify-center pb-10">
                        <div className="inline-flex bg-[#0F172A] rounded-full p-2 border border-white/10 shadow-2xl ring-1 ring-white/5 gap-4 items-center transition-all hover:scale-105">
                            <button 
                                onClick={() => { setCurrentPage(p => Math.max(1, p-1)); window.scrollTo({top:0, behavior:'smooth'}); }}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-white"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center px-6 font-mono text-sm text-slate-400 border-x border-white/5 h-5">
                                <span className="text-white font-bold mr-2">{currentPage}</span> / <span className="ml-2">{totalPages}</span>
                            </div>
                            <button 
                                onClick={() => { setCurrentPage(p => Math.min(totalPages, p+1)); window.scrollTo({top:0, behavior:'smooth'}); }}
                                disabled={currentPage >= totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-white"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {myData && <StudentStickyFooter myData={myData} />}
        </div>
    );
};

export default LeaderBoardPage;