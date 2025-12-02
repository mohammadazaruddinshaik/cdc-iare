/**
 * @file LeaderBoardPage.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 11 Sep 2025
 * @description Enhanced leaderboard with interactive 'Your Ranking' footer and polished mobile visuals.
 * @version 6.1.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Trophy, Medal, Award, Search, Crown, ListOrdered, ExternalLink, ChevronDown, 
    ChevronLeft, ChevronRight, Sparkles, X
} from 'lucide-react';
import Header from '../components/Header';

// --- Skeleton Loader ---
const GlassSkeletonLoader = () => (
    <div className="animate-pulse w-full max-w-7xl mx-auto">
        <div className="hidden md:flex justify-center items-end gap-6 mb-16 mt-8 max-w-4xl mx-auto h-64">
            <div className="w-48 h-56 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 translate-y-4"></div>
            <div className="w-52 h-64 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 z-10 -translate-y-4"></div>
            <div className="w-48 h-56 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 translate-y-4"></div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mt-8">
            <div className="space-y-3">
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="h-14 bg-white/5 rounded-xl w-full"></div>
                ))}
            </div>
        </div>
    </div>
);

const LeaderBoardPage = () => {
    const [allCoders, setAllCoders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [animate, setAnimate] = useState(false);
    
    // Limit to 25 items
    const itemsPerPage = 25;

    const navigate = useNavigate();
    const userRole = sessionStorage.getItem('userRole');
    const currentUserIdentifier = sessionStorage.getItem('userIdentifier');
    
    const batchDropdownRef = useRef(null);
    const rankingsRef = useRef(null);

    // Initial Load Animation
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Dropdown Outside Click Handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
                setIsBatchDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Data Fetching
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);
                const BASE_URL = import.meta.env.VITE_BASE_URL;
                
                let endpoint = '/api/Faculty/getLeaderBoardData/';
                if (userRole === 'student' && currentUserIdentifier) {
                    endpoint = `/api/Student/getLeaderBoardData/${currentUserIdentifier}`;
                } else if (userRole === 'admin') {
                    endpoint = '/api/Admin/getLeaderboardData/';
                }
                
                const response = await fetch(`${BASE_URL}${endpoint}`, { 
                    method: "GET", 
                    credentials: "include" 
                });

                if (!response.ok){
                    sessionStorage.clear();
                    navigate('/', { replace: true });
                    return; 
                }
                
                const data = await response.json();
                const coderArray = data.AllCoders || data.coders || data.students || [];

                const processedData = coderArray
                    .map(coder => ({ 
                        ...coder, 
                        displayName: coder.name || coder.rollno, 
                        displayId: coder.rollno
                    }))
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((coder, index) => ({ ...coder, rank: index + 1 }));

                setAllCoders(processedData);

            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
                sessionStorage.clear();
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [userRole, currentUserIdentifier, navigate]);

    // Filtering & Sorting
    const batches = useMemo(() => {
        const uniqueBatches = [...new Set(allCoders.map(c => c.batch))].sort();
        return ['All', ...uniqueBatches];
    }, [allCoders]);

    const topThree = useMemo(() => allCoders.slice(0, 3), [allCoders]);

    const filteredCandidates = useMemo(() => {
        return allCoders.filter(candidate =>
            (candidate.displayId.toLowerCase().includes(searchTerm.toLowerCase()) || 
             candidate.displayName.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedBatch === 'All' || candidate.batch === selectedBatch)
        );
    }, [allCoders, searchTerm, selectedBatch]);

    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredCandidates]);

    const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    const currentUserData = useMemo(() => allCoders.find(c => c.rollno === currentUserIdentifier), [allCoders, currentUserIdentifier]);
    
    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            rankingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-slate-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-blue-300';
    };

    // Sub-components
    const ListPlatformScore = ({ score, handle }) => (
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-200">
            <span className="font-medium">{score || 0}</span>
            {handle && (
                <a href={handle} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity text-blue-300">
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
    );

    const PodiumPlatformScore = ({ score, handle, platformName, baseColor, hoverColor }) => (
        <div className="flex flex-col items-center flex-1">
            <a href={handle} target="_blank" rel="noopener noreferrer" className={`group flex flex-col items-center ${handle ? 'cursor-pointer' : 'cursor-default'}`}>
                <span className={`font-bold text-xs lg:text-sm ${baseColor} ${handle ? hoverColor : ''} transition-colors`}>{score || 0}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${baseColor} opacity-50`}>{platformName.slice(0, 4)}</span>
            </a>
        </div>
    );

    // --- Modern Podium Card ---
    const PodiumCard = ({ data, rank, delay }) => {
        if (!data) return <div className="hidden md:block w-full"></div>;
        const isFirst = rank === 1;
        const isSecond = rank === 2;

        let styles = {
            container: "", border: "", glow: "", hoverGlow: "", text: "", iconColor: "", bgGradient: "", badge: ""
        };

        if (isFirst) {
            styles = {
                container: "scale-110 z-10 -translate-y-6 hover:scale-[1.12]",
                border: "border-yellow-500/50",
                glow: "shadow-[0_0_50px_-10px_rgba(234,179,8,0.3)]",
                hoverGlow: "group-hover:shadow-[0_0_60px_-5px_rgba(234,179,8,0.5)]",
                text: "text-yellow-400",
                iconColor: "text-yellow-300",
                bgGradient: "bg-gradient-to-b from-yellow-400/20 via-[#0A1B3A]/90 to-[#0A1B3A]/80",
                badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
            };
        } else if (isSecond) {
            styles = {
                container: "translate-y-2 z-0 hover:-translate-y-2 hover:scale-[1.02]",
                border: "border-slate-400/50",
                glow: "shadow-[0_0_30px_-10px_rgba(148,163,184,0.2)]",
                hoverGlow: "group-hover:shadow-[0_0_40px_-5px_rgba(148,163,184,0.3)]",
                text: "text-slate-300",
                iconColor: "text-slate-300",
                bgGradient: "bg-gradient-to-b from-slate-300/10 via-[#0A1B3A]/90 to-[#0A1B3A]/80",
                badge: "bg-slate-500/20 text-slate-300 border-slate-400/50"
            };
        } else {
            styles = {
                container: "translate-y-2 z-0 hover:-translate-y-2 hover:scale-[1.02]",
                border: "border-orange-500/50",
                glow: "shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]",
                hoverGlow: "group-hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.3)]",
                text: "text-orange-400",
                iconColor: "text-orange-400",
                bgGradient: "bg-gradient-to-b from-orange-400/10 via-[#0A1B3A]/90 to-[#0A1B3A]/80",
                badge: "bg-orange-500/20 text-orange-300 border-orange-500/50"
            };
        }

        return (
            <div className={`relative flex-1 min-w-[140px] max-w-[220px] transition-all duration-700 ease-out transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} ${styles.container} group`} style={{ transitionDelay: `${delay}ms` }}>
                {isFirst && <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce z-20"><Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" fill="currentColor" fillOpacity={0.3} /></div>}
                <div className={`relative flex flex-col items-center p-5 rounded-2xl backdrop-blur-xl border ${styles.border} ${styles.bgGradient} ${styles.glow} ${styles.hoverGlow} transition-shadow duration-500 h-full`}>
                    <div className={`absolute -top-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-lg ${styles.badge}`}>
                        {rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place'}
                    </div>
                    <div className={`mb-3 mt-2 p-3 rounded-full border border-white/10 bg-white/5 ${styles.iconColor} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                        {isFirst ? <Trophy size={32} /> : isSecond ? <Medal size={28} /> : <Award size={28} />}
                    </div>
                    <div className="w-full text-center mb-1 min-h-[3.5rem] flex items-center justify-center">
                        <h3 className="font-bold text-white text-sm lg:text-base leading-tight line-clamp-2 break-words w-full" title={data.displayName}>
                            {data.displayName}
                        </h3>
                    </div>
                    <div className={`text-3xl lg:text-4xl font-black ${styles.text} mb-4 tracking-tighter`}>{data.totalScore}</div>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between w-full gap-1">
                        <PodiumPlatformScore score={data.scores?.leetcode} handle={data.handles?.leetcode} platformName="Leet" baseColor={styles.text} hoverColor="hover:text-white" />
                        <PodiumPlatformScore score={data.scores?.gfg} handle={data.handles?.gfg} platformName="GFG" baseColor={styles.text} hoverColor="hover:text-white" />
                        <PodiumPlatformScore score={data.scores?.codechef} handle={data.handles?.codechef} platformName="Chef" baseColor={styles.text} hoverColor="hover:text-white" />
                    </div>
                </div>
            </div>
        );
    };
    
    // --- Pagination Controls ---
    const PaginationControls = ({ position = "bottom" }) => {
        if (totalPages <= 1) return null;
        const isTop = position === "top";
        return (
            <div className={`flex items-center gap-2 ${isTop ? 'scale-90 origin-right' : ''}`}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg transition-colors bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white`} title="Previous Page">
                    <ChevronLeft size={isTop ? 16 : 18} />
                </button>
                {isTop ? (
                    <span className="text-xs font-medium text-gray-400 min-w-[60px] text-center"><span className="text-white">{currentPage}</span> / {totalPages}</span>
                ) : (
                    <div className="flex items-center gap-1"><span className="text-sm font-medium text-white px-2">Page {currentPage} of {totalPages}</span></div>
                )}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition-colors bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white`} title="Next Page">
                    <ChevronRight size={isTop ? 16 : 18} />
                </button>
            </div>
        );
    };

    // --- Footer Link Component ---
    const FooterPlatformLink = ({ score, handle, name }) => {
        const Content = () => (
            <div className={`flex flex-col items-center group/item ${!handle ? 'opacity-80' : ''}`}>
                <div className="flex items-center gap-1">
                    <span className={`font-bold text-lg sm:text-xl text-white ${handle ? 'group-hover/item:text-blue-300' : ''} transition-colors`}>{score || 0}</span>
                    {handle && <ExternalLink size={10} className="text-blue-300 opacity-50 group-hover/item:opacity-100 transition-opacity -mt-1" />}
                </div>
                <span className="text-[10px] uppercase text-gray-400 font-medium tracking-wider">{name}</span>
            </div>
        );

        if (handle) {
            return (
                <a href={handle} target="_blank" rel="noopener noreferrer" className="block px-2 py-1 rounded hover:bg-white/5 transition-all">
                    <Content />
                </a>
            );
        }
        return <Content />;
    };

    return (
        <>
            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background-color:rgba(156,163,175,.4);border-radius:10px} @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-up { animation: slideUpFade 0.5s ease-out forwards; }`}</style>
            <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white overflow-x-hidden">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>

                <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto pb-28">
                        <div className={`transition-all duration-700 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
                             <h1 className="text-3xl lg:text-4xl font-bold flex items-center justify-center lg:justify-start gap-3 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-12">
                                 Leaderboard <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse" />
                            </h1>
                        </div>
                        
                        {loading ? <GlassSkeletonLoader /> : (
                            <>
                                <div className="hidden md:flex justify-center items-center gap-4 lg:gap-8 mb-20 mt-10 max-w-4xl mx-auto px-4 perspective-1000">
                                    <PodiumCard data={topThree[1]} rank={2} delay={200} />
                                    <PodiumCard data={topThree[0]} rank={1} delay={0} />
                                    <PodiumCard data={topThree[2]} rank={3} delay={400} />
                                </div>
                                
                                <div ref={rankingsRef} className="scroll-mt-6 relative">
                                    <div className="relative z-30 flex flex-col gap-4 mb-4 mt-8 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
                                                <div className="flex items-center gap-3">
                                                    <ListOrdered className="w-6 h-6 text-blue-300" />
                                                    <h2 className="text-xl font-semibold text-white">Complete Rankings</h2>
                                                </div>
                                                <div className="md:ml-4 border-l border-white/10 pl-4"><PaginationControls position="top" /></div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="relative flex-grow md:grow-0 md:w-64 group">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                                                    <input type="text" placeholder="Search name or ID..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-8 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-all" />
                                                    {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
                                                </div>
                                                <div className="relative w-40" ref={batchDropdownRef}>
                                                    <button onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)} className="flex items-center justify-between gap-2 w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 focus:border-blue-400 transition-all">
                                                        <span className="truncate">{selectedBatch === 'All' ? 'All Batches' : selectedBatch}</span>
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBatchDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isBatchDropdownOpen && (
                                                        <ul className="absolute top-full right-0 mt-2 w-full bg-[#0E1629] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 custom-scrollbar p-1">
                                                            {batches.map(batch => (<li key={batch} onClick={() => { setSelectedBatch(batch); setCurrentPage(1); setIsBatchDropdownOpen(false); }} className="px-3 py-2 text-gray-300 hover:text-white hover:bg-blue-500/20 rounded-lg cursor-pointer text-sm transition-colors">{batch === 'All' ? 'All Batches' : batch}</li>))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-bold text-xs uppercase text-gray-400 border-b border-white/10 bg-black/20 tracking-wider">
                                            <div className="col-span-1">Rank</div><div className="col-span-5">Student</div><div className="col-span-1 text-center">LeetCode</div><div className="col-span-1 text-center">GFG</div><div className="col-span-1 text-center">CodeChef</div><div className="col-span-3 text-right pr-4">Total Score</div>
                                        </div>
                                        <div className="min-h-[200px] custom-scrollbar">
                                            {paginatedCandidates.length > 0 ? (
                                                <div className="divide-y divide-white/5">
                                                    {paginatedCandidates.map((coder, index) => (
                                                        <div key={coder.rollno} style={{ animationDelay: `${index * 50}ms` }} className={`opacity-0 animate-slide-up transition-all duration-200 hover:bg-white/10 ${coder.rollno === currentUserIdentifier ? 'bg-blue-600/20 hover:bg-blue-600/30' : ''}`}>
                                                            <div className="md:hidden p-4 space-y-3">
                                                                <div className="flex justify-between items-center"><div className="flex items-center gap-4"><span className={`font-bold text-lg w-8 text-center ${getRankColor(coder.rank)}`}>#{coder.rank}</span><div><div className="font-semibold text-white">{coder.displayName}</div><div className="text-xs text-gray-400">{coder.batch}</div></div></div><div className="text-right"><div className="font-bold text-xl text-white">{coder.totalScore}</div><div className="text-xs text-gray-400">Total</div></div></div>
                                                                <div className="flex justify-around pt-3 border-t border-white/10 text-xs"><ListPlatformScore score={coder.scores.leetcode} handle={coder.handles?.leetcode} /><ListPlatformScore score={coder.scores.gfg} handle={coder.handles?.gfg} /><ListPlatformScore score={coder.scores.codechef} handle={coder.handles?.codechef} /></div>
                                                            </div>
                                                            <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                                                                <div className={`col-span-1 font-bold text-lg ${getRankColor(coder.rank)} pl-2`}>#{coder.rank}</div>
                                                                <div className="col-span-5"><div className="font-semibold text-sm text-white">{coder.displayName}</div>{coder.displayName !== coder.displayId && (<div className="text-xs text-gray-500 mt-0.5">{coder.displayId}</div>)}</div>
                                                                <div className="col-span-1 text-center"><ListPlatformScore score={coder.scores.leetcode} handle={coder.handles?.leetcode} /></div><div className="col-span-1 text-center"><ListPlatformScore score={coder.scores.gfg} handle={coder.handles?.gfg} /></div><div className="col-span-1 text-center"><ListPlatformScore score={coder.scores.codechef} handle={coder.handles?.codechef} /></div><div className="col-span-3 text-right font-bold text-xl text-white pr-4">{coder.totalScore}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 px-4 animate-slide-up"><div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><Search className="w-8 h-8 text-gray-500" /></div><p className="text-gray-300 font-semibold">No students found</p><p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-center"><PaginationControls position="bottom" /></div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* ENHANCED INTERACTIVE FOOTER */}
                    {userRole === 'student' && currentUserData && !loading && (
                        <div className={`fixed bottom-4 left-4 right-4 z-50 transition-all duration-700 ease-out ${animate ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                            <div className="max-w-7xl mx-auto">
                                {/* Visual Upgrade: Added gradient background and stronger border */}
                                <div className="bg-gradient-to-r from-[#0A1B3A]/95 via-[#112240]/95 to-[#0A1B3A]/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/10">
                                    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 sm:gap-6">
                                        
                                        {/* Rank & Name Section */}
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start border-b sm:border-b-0 border-white/10 pb-3 sm:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`absolute inset-0 blur-md opacity-40 ${getRankColor(currentUserData.rank).replace('text-', 'bg-')}`}></div>
                                                    <div className={`relative font-black text-3xl ${getRankColor(currentUserData.rank)} drop-shadow-sm`}>#{currentUserData.rank}</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-lg leading-tight">{currentUserData.displayName}</div>
                                                    <div className="text-[10px] text-blue-200 font-bold tracking-widest uppercase opacity-80">Your Ranking</div>
                                                </div>
                                            </div>
                                            {/* Mobile Total Score (Shown in top row on small screens for better space usage) */}
                                            <div className="sm:hidden text-right">
                                                <div className="font-black text-2xl text-white">{currentUserData.totalScore}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Total</div>
                                            </div>
                                        </div>

                                        {/* Scores Section */}
                                        <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                            <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                                                <FooterPlatformLink score={currentUserData.scores?.leetcode} handle={currentUserData.handles?.leetcode} name="LeetCode" />
                                                <FooterPlatformLink score={currentUserData.scores?.gfg} handle={currentUserData.handles?.gfg} name="GFG" />
                                                <FooterPlatformLink score={currentUserData.scores?.codechef} handle={currentUserData.handles?.codechef} name="CodeChef" />
                                            </div>
                                            
                                            {/* Desktop Divider & Total Score */}
                                            <div className="hidden sm:block h-10 w-px bg-white/10"></div>
                                            <div className="hidden sm:block text-right">
                                                <div className="font-black text-3xl text-white tracking-tight">{currentUserData.totalScore}</div>
                                                <div className="text-xs text-blue-200 font-medium tracking-wider uppercase">Total Score</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default LeaderBoardPage;