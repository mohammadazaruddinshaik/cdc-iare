import React, { useState, useMemo, useEffect } from 'react';
import { 
    Search, LayoutGrid, List, 
    ChevronLeft, ChevronRight, X, User, Filter,
    Download, ShieldCheck, FileText, Image, Loader2, FileDown
} from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext'; 

// --- ASSET IMPORTS ---
import lcImg from '../../assets/leetcode.webp';
import gfgImg from '../../assets/gfg.png';
import ccImg from '../../assets/codechef.png';
import ghImg from '../../assets/github.png';

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
        wrapper: 'order-2 z-20 -mt-2 lg:-mt-4 scale-100 lg:scale-105', 
        bg: 'bg-[#0F172A]/90 backdrop-blur-xl',
        border: 'border-yellow-500/50',
        rankCircle: 'border-yellow-400 text-yellow-400 bg-[#0F172A] shadow-[0_0_25px_rgba(250,204,21,0.5)]',
        text: 'text-yellow-100',
        shadow: 'shadow-[0_0_50px_-10px_rgba(234,179,8,0.2)]'
    },
    2: {
        wrapper: 'order-1 z-10 mt-6 scale-95 lg:scale-95', 
        bg: 'bg-[#0F172A]/90 backdrop-blur-xl',
        border: 'border-slate-400/30',
        rankCircle: 'border-slate-300 text-slate-300 bg-[#0F172A] shadow-[0_0_25px_rgba(203,213,225,0.3)]',
        text: 'text-slate-200',
        shadow: 'shadow-[0_0_50px_-10px_rgba(148,163,184,0.1)]'
    },
    3: {
        wrapper: 'order-3 z-10 mt-6 scale-95 lg:scale-95', 
        bg: 'bg-[#0F172A]/90 backdrop-blur-xl',
        border: 'border-orange-500/30',
        rankCircle: 'border-orange-400 text-orange-400 bg-[#0F172A] shadow-[0_0_25px_rgba(251,146,60,0.3)]',
        text: 'text-orange-100',
        shadow: 'shadow-[0_0_50px_-10px_rgba(249,115,22,0.1)]'
    }
};

const BRAND_STYLES = {
    leetcode: { border: 'border-[#ffa116]/40', bg: 'bg-[#ffa116]/5 hover:bg-[#ffa116]/10', text: 'text-[#ffa116]' },
    gfg: { border: 'border-[#2f8d46]/40', bg: 'bg-[#2f8d46]/5 hover:bg-[#2f8d46]/10', text: 'text-[#4ade80]' },
    codechef: { border: 'border-[#d4a485]/40', bg: 'bg-[#5b4638]/10 hover:bg-[#5b4638]/20', text: 'text-[#e6c0a6]' },
    github: { border: 'border-white/20', bg: 'bg-white/5 hover:bg-white/10', text: 'text-slate-200' },
};

// --- SKELETON LOADER ---
const SkeletonList = () => (
    <div className="space-y-4 animate-pulse">
        <div className="hidden lg:grid grid-cols-12 gap-6 px-8 py-4 bg-white/5 rounded-xl border border-white/5">
            <div className="col-span-1 h-3 bg-slate-700/50 rounded mx-auto w-8"></div>
            <div className="col-span-4 h-3 bg-slate-700/50 rounded w-32"></div>
            <div className="col-span-5 h-3 bg-slate-700/50 rounded mx-auto w-48"></div>
            <div className="col-span-2 h-3 bg-slate-700/50 rounded ml-auto w-16"></div>
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-[#0F172A]/60 border border-white/5 rounded-2xl flex items-center px-4 lg:px-8 gap-6">
                <div className="w-8 h-8 rounded-full bg-slate-700/30"></div>
                <div className="w-10 h-10 rounded-full bg-slate-700/30 shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-700/30 rounded w-48"></div>
                </div>
                <div className="w-20 h-6 bg-slate-700/30 rounded ml-auto"></div>
            </div>
        ))}
    </div>
);

// --- SUB-COMPONENTS ---

const MobileBlocker = ({ onUnlock }) => (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Desktop Recommended</h2>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed text-sm">
            This dashboard is optimized for larger screens.
        </p>
        <button 
            onClick={onUnlock}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-300"
        >
            Continue Anyway
        </button>
    </div>
);

const ListRankBadge = ({ rank }) => {
    if (rank > 3) return <span className="text-sm font-mono font-bold text-slate-500 w-8 text-center">#{rank}</span>;
    const colors = {
        1: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
        2: 'border-slate-400 text-slate-300 bg-slate-400/10',
        3: 'border-orange-500 text-orange-400 bg-orange-500/10'
    };
    return (
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm ${colors[rank]}`}>
            {rank}
        </div>
    );
};

const StudentAvatar = ({ rollNo, size = "md", rank }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [error, setError] = useState(false);
    
    useEffect(() => {
        setImgLoaded(false);
        setError(false);
    }, [rollNo]);

    const formattedRoll = rollNo ? rollNo.toUpperCase() : '';
    const imgSrc = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${formattedRoll}/${formattedRoll}.jpg`;
    
    const sizeClasses = { 
        sm: "w-9 h-9", 
        md: "w-11 h-11 lg:w-12 lg:h-12", 
        lg: "w-14 h-14 lg:w-16 lg:h-16", 
        xl: "w-18 h-18 lg:w-20 lg:h-20" 
    };
    
    const isPodium = rank <= 3 && size === 'xl'; 
    const ringColor = isPodium 
        ? (rank === 1 ? 'ring-yellow-500' : rank === 2 ? 'ring-slate-400' : 'ring-orange-500') 
        : 'ring-white/10 group-hover:ring-blue-400/50';

    return (
        <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
            <div className={`relative w-full h-full rounded-full p-[2px] ring-2 ${ringColor} bg-[#071225] overflow-hidden shadow-2xl z-10`}>
                {!error ? (
                    <>
                        {!imgLoaded && (
                            <div className="absolute inset-0 bg-slate-800 animate-pulse z-20 flex items-center justify-center">
                                <User size={size === 'sm' ? 12 : 16} className="text-slate-600 opacity-50" />
                            </div>
                        )}
                        <img 
                            src={imgSrc} 
                            alt="Student" 
                            loading="lazy"
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setError(true)} 
                            className={`w-full h-full object-cover rounded-full transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    </>
                ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <User size={size === 'xl' ? 32 : (size === 'sm' ? 14 : 20)} />
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
    const Container = url ? 'a' : 'div';
    const containerProps = url 
        ? { href: url, target: "_blank", rel: "noopener noreferrer", className: "block h-full hover:opacity-80 transition-opacity cursor-pointer" }
        : { className: "block h-full cursor-default" };

    return (
        <Container {...containerProps}>
             <div className={`
                flex items-center justify-between rounded-lg border backdrop-blur-md 
                transition-all duration-300 w-full h-full
                ${style.border} ${style.bg} hover:border-opacity-100 border-opacity-30
                ${compact ? 'px-2 py-1' : 'px-3 py-1.5'}
            `}>
                <div className="shrink-0 flex items-center justify-center">
                    {assetSrc ? (
                        <img src={assetSrc} alt={type} loading="lazy" className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} object-contain opacity-90`} />
                    ) : (
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                    )}
                </div>
                <div className="flex items-center ml-2 min-w-0">
                    <span className={`font-mono font-bold tracking-tight truncate ${style.text} ${compact ? 'text-[10px]' : 'text-xs'}`}>
                        {displayScore}
                    </span>
                </div>
            </div>
        </Container>
    );
};

// --- HERO CARD (PODIUM) ---
const HeroCard = ({ coder, rank }) => {
    if (!coder) return null;
    const styles = PODIUM_STYLES[rank];
    
    return (
        <div className={`relative group transition-all duration-700 ease-out flex-1 lg:min-w-[180px] lg:max-w-[240px] xl:min-w-[240px] xl:max-w-[300px] ${styles.wrapper}`}>
            <div className={`
                relative rounded-3xl 
                p-3 lg:p-4 
                ${styles.bg} ${styles.border} ${styles.shadow} border
                hover:-translate-y-1 hover:shadow-2xl transition-all duration-500
                flex flex-col items-center h-full justify-between
            `}>
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="relative mb-3 lg:mb-4 transform group-hover:scale-105 transition-transform duration-500">
                        <StudentAvatar rollNo={coder.displayId} rank={rank} size={rank === 1 ? "xl" : "lg"} />
                        <div className={`absolute -bottom-2 -right-1 w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 flex items-center justify-center z-20 font-black text-sm shadow-xl ${styles.rankCircle}`}>
                            {rank}
                        </div>
                    </div>
                    
                    <div className="mt-1 text-center w-full space-y-0.5">
                        <h3 className={`text-base lg:text-lg font-bold truncate px-2 leading-tight tracking-tight ${styles.text}`}>{coder.displayName}</h3>
                        <div className="flex justify-center gap-2 pt-1">
                            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">{coder.displayId}</span>
                        </div>
                    </div>
                    
                    <div className="my-2 lg:my-3 w-full bg-black/20 rounded-lg py-1.5 border border-white/5 text-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block">Total Score</span>
                        <div className="text-xl lg:text-2xl font-black text-white tracking-tighter">
                            {(coder.totalScore || 0).toLocaleString()}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 w-full">
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

// --- FOOTER ---
const StudentStickyFooter = ({ myData }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!myData) return null;

    return (
        <div className={`fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}>
            <div className="pointer-events-auto w-full max-w-4xl bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 pr-4 flex items-center justify-between ring-1 ring-white/10">
                
                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <img 
                            src={`https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${myData.displayId}/${myData.displayId}.jpg`} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                            alt="Me" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center"> 
                        <span className="text-[10px] font-mono font-semibold text-slate-400">{myData.displayId}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">Rank #{myData.rank}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex flex-1 mx-4 gap-2 justify-center">
                    <div className="w-24 h-8"><BrandTile type="leetcode" score={myData.scores?.leetcode} compact={true} /></div>
                    <div className="w-24 h-8"><BrandTile type="gfg" score={myData.scores?.gfg} compact={true} /></div>
                    <div className="w-24 h-8"><BrandTile type="codechef" score={myData.scores?.codechef} compact={true} /></div>
                    <div className="w-24 h-8"><BrandTile type="github" score={myData.scores?.github} compact={true} /></div>

                </div>

                <div className="flex flex-col items-end border-l border-white/10 pl-4 shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Total</span>
                    <span className="text-xl font-black text-white leading-none">
                        {(myData.totalScore || 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const LeaderBoardPage = () => {
    const { user, logout } = useAuth();
    
    const [allCoders, setAllCoders] = useState([]);
    const [availableBatches, setAvailableBatches] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    
    const [myData, setMyData] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // --- ADMIN EXPORT STATE ---
    const [pdfLimit, setPdfLimit] = useState(''); // Limit for PDF only
    const [downloadingType, setDownloadingType] = useState(null); // 'pdf' | 'png' | 'all' | null
    
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileList, setShowMobileList] = useState(false);

    const itemsPerPage = viewMode === 'list' ? 12 : 8;

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsDesktop(width >= 1024);
            setIsMobile(width < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // --- ADMIN DOWNLOAD LOGIC ---
    const handleDownload = async (actionType) => {
        if (downloadingType) return;
        setDownloadingType(actionType);

        const baseUrl = import.meta.env.VITE_BASE_URL;
        let url = '';
        let fileName = 'leaderboard';
        let extension = '';

        // Configure based on action type
        if (actionType === 'pdf_custom') {
            if (!pdfLimit) { 
                alert("Please enter a student limit for the PDF report."); 
                setDownloadingType(null); return; 
            }
            url = `${baseUrl}/api/admin/get-leaderboard?limit=${pdfLimit}`;
            fileName = `Report_Top_${pdfLimit}`;
            extension = 'pdf';
        } else if (actionType === 'pdf_all') {
            url = `${baseUrl}/api/admin/get-leaderboard?limit=all`;
            fileName = `Report_Full_Leaderboard`;
            extension = 'pdf';
        } else if (actionType === 'png') {
            // PNG Export - No Limit logic required
            url = `${baseUrl}/api/admin/get-leaderboard-img`;
            fileName = `Snapshot_Leaderboard`;
            extension = 'png';
        }

        try {
            const response = await fetch(url, { method: 'GET', credentials: 'include' });
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${fileName}.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Export error:", error);
            alert("Export failed. Please check the network or server.");
        } finally {
            setDownloadingType(null);
        }
    };

    useEffect(() => {
        if (!user) return; 

        const fetchData = async () => {
            try {
                const start = Date.now();
                const url = `${import.meta.env.VITE_BASE_URL}/api/leaderboard`;
                const res = await fetch(url, { method: 'GET', credentials: 'include' });

                if (res.status === 401 || res.status === 403) { logout(); return; }
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                
                const data = await res.json();
                
                if (data.batches) setAvailableBatches(['All', ...data.batches.sort()]);

                const toTitleCase = (str) => str?.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Student';
                
                const parsed = (data.AllCoders || []).map(c => ({
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

                const delta = Date.now() - start;
                if (delta < 800) await new Promise(r => setTimeout(r, 800 - delta));

                setAllCoders(parsed);
                if (data.myPosition) setMyData(parsed.find(c => c.rank === data.myPosition));

            } catch (e) { console.error("Leaderboard fetch error:", e); } finally {
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
    const effectiveData = (showHeroSection && !isMobile) ? filteredData.slice(3) : filteredData;
    
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return effectiveData.slice(start, start + itemsPerPage);
    }, [effectiveData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(effectiveData.length / itemsPerPage);

    if (isMobile && !showMobileList) {
        return <MobileBlocker onUnlock={() => setShowMobileList(true)} />;
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white font-sans ${myData ? 'pb-24 sm:pb-32' : 'pb-10'}`}>
            
            <div className="relative px-4 pt-4 pb-6 z-20">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4"></div>
            </div>

            <main className="px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[95%] 2xl:max-w-[1600px] mx-auto py-2 space-y-6 lg:space-y-10">
                
                {/* --- TITLE --- */}
                <div className={`flex flex-col gap-6 mb-2 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                         <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 pb-2">
                                Leaderboard
                            </span>
                        </h1>
                    </div>
                </div>

                {/* --- ADMIN EXPORT ZONE (SPLIT LAYOUT) --- */}
                {user?.role === 'admin' && (
                    <div className="animate-fade-in-up grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                        
                        {/* SECTION 1: PDF EXPORTS (WITH LIMIT) */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-blue-500/20 rounded-2xl p-5 shadow-lg group hover:border-blue-500/30 transition-all">
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 ring-1 ring-blue-500/20">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Document Reports (PDF)</h3>
                                    <p className="text-xs text-slate-400">Generate printable lists</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={pdfLimit}
                                        onChange={(e) => setPdfLimit(e.target.value)}
                                        placeholder="Limit (e.g. 100)"
                                        className="bg-[#020617]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
                                    />
                                    <button 
                                        onClick={() => handleDownload('pdf_custom')}
                                        disabled={!!downloadingType}
                                        className="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-wait text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                                    >
                                        {downloadingType === 'pdf_custom' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        Get PDF
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleDownload('pdf_all')}
                                    disabled={!!downloadingType}
                                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:cursor-wait border border-white/5 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                                >
                                    {downloadingType === 'pdf_all' ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                                    Download Full Database Report
                                </button>
                            </div>
                        </div>

                        {/* SECTION 2: PNG EXPORTS (NO LIMIT) */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-purple-500/20 rounded-2xl p-5 shadow-lg group hover:border-purple-500/30 transition-all flex flex-col">
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 ring-1 ring-purple-500/20">
                                    <Image size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Visual Snapshots (PNG)</h3>
                                    <p className="text-xs text-slate-400">Shareable leaderboard image</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center space-y-3">
                                <button 
                                    onClick={() => handleDownload('png')}
                                    disabled={!!downloadingType}
                                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-wait text-white px-3 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {downloadingType === 'png' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                    Download Leaderboard Image
                                </button>
                                <div className="text-center text-[10px] text-purple-200/50">
                                    Generates a visual snapshot of the current leaderboard state.
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* --- LOADING SKELETON --- */}
                {loading ? (
                    <div className="animate-fade-in"><SkeletonList /></div>
                ) : (
                    <>
                        {/* Hero Section (Podium) */}
                        {showHeroSection && (
                            <div className="hidden lg:flex flex-row justify-center items-end gap-3 lg:gap-6 mb-12 min-h-[250px] animate-fade-in-up">
                                {filteredData[1] && <HeroCard coder={filteredData[1]} rank={2} />}
                                {filteredData[0] && <HeroCard coder={filteredData[0]} rank={1} />}
                                {filteredData[2] && <HeroCard coder={filteredData[2]} rank={3} />}
                            </div>
                        )}

                        {/* Controls Toolbar */}
                        <div className="sticky top-4 z-40 mb-6 flex justify-center">
                            <div className={`
                                bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-2 ring-1 ring-white/5 transition-all duration-300
                                ${isMobile ? 'w-full justify-between px-3' : ''}
                            `}>
                                <div className={`relative flex items-center transition-all duration-500 rounded-full h-10 border border-transparent bg-white/5 hover:bg-white/10 ${isMobile ? 'flex-1 mr-2' : 'w-64 focus-within:w-80 px-4'}`}>
                                    <div className={`text-slate-400 pointer-events-none ${isMobile ? 'ml-3' : ''}`}><Search size={16} /></div>
                                    <input 
                                        type="text" 
                                        placeholder={isMobile ? "Search..." : "Search student..."}
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="bg-transparent text-white text-sm font-bold placeholder-slate-500 focus:outline-none ml-2 w-full h-full rounded-full"
                                    />
                                    {searchTerm && <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white mr-3"><X size={14} /></button>}
                                </div>

                                {!isMobile && <div className="w-px h-6 bg-white/10"></div>}

                                <div className="flex gap-2 shrink-0">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Filter size={14} /></div>
                                        <select 
                                            value={selectedBatch}
                                            onChange={(e) => { setSelectedBatch(e.target.value); setCurrentPage(1); }}
                                            className="appearance-none bg-white/5 hover:bg-white/10 text-white rounded-full py-2 pl-9 pr-8 text-sm font-bold border border-transparent cursor-pointer transition-colors focus:outline-none h-10"
                                        >
                                            {availableBatches.map(b => <option key={b} value={b} className="bg-[#0F172A] text-white">{b === 'All' ? 'All' : b}</option>)}
                                        </select>
                                    </div>

                                    {!isMobile && (
                                        <div className="flex bg-white/5 rounded-full p-1 gap-1 border border-white/5 h-10 items-center">
                                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:text-white'}`}><List size={16} /></button>
                                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={16} /></button>
                                        </div>
                                    )}
                                </div>

                                {totalPages > 1 && !isMobile && (
                                    <>
                                        <div className="w-px h-6 bg-white/10"></div>
                                        <div className="flex items-center gap-1 px-2">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                                            <span className="text-xs font-mono font-bold text-slate-400 select-none">{currentPage}/{totalPages}</span>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* --- LIST / GRID CONTENT --- */}
                        <div key={`${currentPage}-${selectedBatch}-${searchTerm}`} className="animate-slide-up-fade">
                            {paginatedData.length === 0 ? (
                                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed max-w-xl mx-auto">
                                    <h3 className="text-lg font-bold text-white mb-1">No students found</h3>
                                </div>
                            ) : (
                                <div className={viewMode === 'list' || isMobile ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                                    
                                    {!isMobile && viewMode === 'list' && (
                                        <div className="grid grid-cols-12 gap-6 px-10 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 rounded-xl border border-white/5 items-center select-none">
                                            <div className="col-span-1 text-center">Rank</div>
                                            <div className="col-span-4 pl-2">Student Profile</div>
                                            <div className="col-span-5 text-center">Stats</div>
                                            <div className="col-span-2 text-right pr-4">Score</div>
                                        </div>
                                    )}

                                    {paginatedData.map((coder) => (
                                        <div key={coder.displayId} 
                                            className={`
                                                relative bg-[#0F172A]/60 border border-white/5 rounded-xl transition-all duration-300 group
                                                ${viewMode === 'grid' && !isMobile ? 'p-5 flex flex-col items-center hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/20' : 'p-3 lg:px-8 lg:py-3 hover:bg-[#1E293B]/50 hover:border-white/10'}
                                                ${myData?.displayId === coder.displayId ? 'ring-1 ring-blue-500/50 bg-blue-500/5' : ''}
                                            `}
                                        >
                                            {isMobile ? (
                                                <div className="flex items-center justify-between gap-3 p-1">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="font-mono font-bold text-slate-500 text-sm w-6 text-center">#{coder.rank}</span>
                                                        <StudentAvatar rollNo={coder.displayId} rank={coder.rank} size="sm" />
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-white text-sm truncate">{coder.displayName}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono">{coder.displayId}</div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right pl-2">
                                                        <div className="font-black text-white text-base tracking-tight">
                                                            {coder.totalScore.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                viewMode === 'list' ? (
                                                    <div className="grid grid-cols-12 gap-6 items-center">
                                                        <div className="col-span-1 flex justify-center"><ListRankBadge rank={coder.rank} /></div>
                                                        <div className="col-span-4 flex items-center gap-4 pl-2">
                                                            <StudentAvatar rollNo={coder.displayId} rank={coder.rank} size="md" />
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-white text-base truncate group-hover:text-blue-300 transition-colors">{coder.displayName}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-mono font-bold text-slate-400">{coder.displayId}</span>
                                                                    <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-blue-200 border border-white/10">{coder.batch}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-5 flex justify-center">
                                                            <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
                                                                <BrandTile type="leetcode" score={coder.scores?.leetcode} url={coder.handles?.leetcode} />
                                                                <BrandTile type="gfg" score={coder.scores?.gfg} url={coder.handles?.gfg} />
                                                                <BrandTile type="codechef" score={coder.scores?.codechef} url={coder.handles?.codechef} />
                                                                <BrandTile type="github" score={coder.scores?.github} url={coder.handles?.github} />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 text-right pr-4">
                                                            <span className="text-xl font-black text-white tracking-tighter tabular-nums">{(coder.totalScore || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="absolute top-4 left-4"><ListRankBadge rank={coder.rank} /></div>
                                                        <StudentAvatar rollNo={coder.displayId} rank={coder.rank} size="lg" />
                                                        <div className="mt-4 text-center w-full">
                                                            <h4 className="font-bold text-white text-lg truncate px-1 group-hover:text-blue-300 transition-colors">{coder.displayName}</h4>
                                                            <div className="flex justify-center gap-2 mt-2">
                                                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/30 px-2 py-0.5 rounded border border-white/10">{coder.displayId}</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full mt-4 space-y-3">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <BrandTile type="leetcode" score={coder.scores?.leetcode} url={coder.handles?.leetcode} />
                                                                <BrandTile type="gfg" score={coder.scores?.gfg} url={coder.handles?.gfg} />
                                                                <BrandTile type="codechef" score={coder.scores?.codechef} url={coder.handles?.codechef} />
                                                                <BrandTile type="github" score={coder.scores?.github} url={coder.handles?.github} />
                                                            </div>
                                                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase">Total</span>
                                                                <span className="text-xl font-black text-white">{(coder.totalScore || 0).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bottom Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center pb-8">
                                <div className="inline-flex bg-[#0F172A] rounded-full p-2 border border-white/10 shadow-lg ring-1 ring-white/5 gap-4 items-center">
                                    <button 
                                        onClick={() => { setCurrentPage(p => Math.max(1, p-1)); }}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-white"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex items-center px-4 font-mono text-sm text-slate-400 border-x border-white/5 h-4">
                                        <span className="text-white font-bold mr-2">{currentPage}</span> / <span className="ml-2">{totalPages}</span>
                                    </div>
                                    <button 
                                        onClick={() => { setCurrentPage(p => Math.min(totalPages, p+1)); }}
                                        disabled={currentPage >= totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-white"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {myData && <StudentStickyFooter myData={myData} />}
        </div>
    );
};

export default LeaderBoardPage;