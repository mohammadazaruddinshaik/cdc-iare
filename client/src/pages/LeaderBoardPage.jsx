/**
 * @file LeaderBoardPage.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 18 Aug 2025
 * @description A responsive, role-aware leaderboard page with smooth scrolling and a custom-styled scrollbar.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, Medal, Award, Search, Crown, ListOrdered, ExternalLink, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import Header from '../components/Header';

// --- REUSABLE GLASS SKELETON LOADER ---
const GlassSkeletonLoader = () => (
    <div className="animate-pulse w-full max-w-7xl mx-auto">
        {/* Podium Skeleton - Hidden on mobile */}
        <div className="hidden md:block mb-12">
            <div className="flex items-end justify-center text-center max-w-5xl mx-auto h-64 lg:h-72 gap-1">
                <div className="w-1/3 h-[85%] bg-white/5 backdrop-blur-xl rounded-t-xl border border-white/10"></div>
                <div className="w-1/3 h-full bg-white/5 backdrop-blur-xl rounded-t-2xl border border-white/10"></div>
                <div className="w-1/3 h-[75%] bg-white/5 backdrop-blur-xl rounded-t-xl border border-white/10"></div>
            </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-white/10 rounded-lg"></div>
                <div className="h-10 bg-white/10 rounded-lg"></div>
            </div>
        </div>
        
        {/* Table Skeleton */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
             {/* Desktop header skeleton */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-white/10">
                <div className="h-4 bg-white/10 rounded col-span-1"></div>
                <div className="h-4 bg-white/10 rounded col-span-5"></div>
                <div className="h-4 bg-white/10 rounded col-span-1"></div>
                <div className="h-4 bg-white/10 rounded col-span-1"></div>
                <div className="h-4 bg-white/10 rounded col-span-1"></div>
                <div className="h-4 bg-white/10 rounded col-span-3"></div>
            </div>
            <div className="mt-4 space-y-4">
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="flex md:grid md:grid-cols-12 gap-4 items-center">
                        <div className="w-8 h-8 bg-white/10 rounded-md"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                            <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                        </div>
                        <div className="hidden md:block md:col-span-1 h-5 bg-white/10 rounded-md"></div>
                        <div className="hidden md:block md:col-span-1 h-5 bg-white/10 rounded-md"></div>
                        <div className="hidden md:block md:col-span-1 h-5 bg-white/10 rounded-md"></div>
                        <div className="w-24 md:w-auto md:col-span-3 h-8 bg-white/10 rounded-md"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


const LeaderBoardPage = () => {
    // --- STATE MANAGEMENT ---
    const [allCoders, setAllCoders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [animate, setAnimate] = useState(false);
    const itemsPerPage = 25;

    const userRole = localStorage.getItem('userRole');
    const currentUserIdentifier = localStorage.getItem('userIdentifier');
    
    // --- REFS FOR SCROLLING & DROPDOWN ---
    const batchDropdownRef = useRef(null);
    const rankingsRef = useRef(null); // Ref for the rankings section

    // --- EFFECTS ---
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        const handleClickOutside = (event) => {
            if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
                setIsBatchDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);
                const BASE_URL = 'http://localhost:5000/api';
                let endpoint = '/Faculty/getLeaderboardData/'; // Default for faculty and admin
                if (userRole === 'student' && currentUserIdentifier) {
                    endpoint = `/Student/getLeaderboardData/${currentUserIdentifier}`;
                }
                const apiUrl = `${BASE_URL}${endpoint}`;
                
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const response = await fetch(apiUrl);

                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                const data = await response.json();
                const coderArray = data.AllCoders || data.coders || data.students || [];

                const processedData = coderArray
                    .map(coder => ({ ...coder, name: `${coder.rollno}` }))
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((coder, index) => ({ ...coder, rank: index + 1 }));

                setAllCoders(processedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
                setError(err.message);
                setAllCoders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboardData();
    }, [userRole, currentUserIdentifier]);

    // --- MEMOIZED DERIVED STATE ---
    const batches = useMemo(() => ['All', ...[...new Set(allCoders.map(c => c.batch))].sort()], [allCoders]);
    const topThree = useMemo(() => allCoders.slice(0, 3), [allCoders]);

    const filteredCandidates = useMemo(() => {
        return allCoders.filter(candidate =>
            (candidate.rollno.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedBatch === 'All' || candidate.batch === selectedBatch)
        );
    }, [allCoders, searchTerm, selectedBatch]);

    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredCandidates]);

    const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    const currentUserData = useMemo(() => allCoders.find(c => c.rollno === currentUserIdentifier), [allCoders, currentUserIdentifier]);
    
    // --- HANDLER FOR PAGE CHANGE WITH SMOOTH SCROLL ---
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        rankingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- HELPER & RENDER COMPONENTS ---
    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-blue-300';
    };

    const PlatformScoreLink = ({ score, handle, platformName, baseColor, hoverColor }) => (
        <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
                <span className={`font-bold text-sm lg:text-base ${baseColor} truncate`}>{score || 0}</span>
                {handle && (
                    <a href={handle} target="_blank" rel="noopener noreferrer" title={`View ${platformName} Profile`} className={`${hoverColor} transition-opacity opacity-60 hover:opacity-100`}>
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>
            <span className={`text-xs ${baseColor} opacity-80 truncate w-full text-center`}>{platformName}</span>
        </div>
    );
    
    const renderPodium = () => (
        <div className="hidden md:block mb-12 group">
            <div className="flex items-end justify-center text-center max-w-5xl mx-auto h-64 lg:h-72 transform-gpu transition-all duration-500 group-hover:scale-105 gap-1">
                <div className="relative w-1/3 h-[85%] pt-6 pb-4 px-3 bg-slate-800/50 border-2 border-slate-600 rounded-t-xl shadow-lg transition-shadow duration-300 group-hover:shadow-slate-500/20">
                    <span className="absolute top-2 right-3 text-3xl lg:text-4xl font-bold text-slate-600/50">2</span>
                    <Medal className="w-7 h-7 lg:w-8 lg:h-8 mx-auto text-slate-300 mb-2" />
                    <h3 className="text-sm font-bold text-white truncate" title={topThree[1]?.name}>{topThree[1]?.name || 'N/A'}</h3>
                    <div className="text-xl lg:text-2xl font-bold text-slate-200 my-2">{topThree[1]?.totalScore || 0}</div>
                    <div className="flex gap-1 pt-2 border-t border-slate-700 px-1">
                        <PlatformScoreLink score={topThree[1]?.scores?.leetcode} handle={topThree[1]?.handles?.leetcode} platformName="LC" baseColor="text-slate-300" hoverColor="hover:text-white" />
                        <PlatformScoreLink score={topThree[1]?.scores?.gfg} handle={topThree[1]?.handles?.gfg} platformName="GFG" baseColor="text-slate-300" hoverColor="hover:text-white" />
                        <PlatformScoreLink score={topThree[1]?.scores?.codechef} handle={topThree[1]?.handles?.codechef} platformName="CC" baseColor="text-slate-300" hoverColor="hover:text-white" />
                    </div>
                </div>
                <div className="relative w-1/3 h-full pt-8 pb-5 px-3 bg-yellow-900/30 border-2 border-yellow-500 rounded-t-2xl shadow-2xl shadow-yellow-500/20 z-10 transition-shadow duration-300 group-hover:shadow-yellow-400/30">
                    <span className="absolute top-2 right-3 text-4xl lg:text-5xl font-bold text-yellow-600/30">1</span>
                    <div className="relative w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2"><div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-50"></div><Crown className="relative w-10 h-10 lg:w-12 lg:h-12 text-yellow-300" /></div>
                    <h3 className="text-base font-bold text-white truncate" title={topThree[0]?.name}>{topThree[0]?.name || 'N/A'}</h3>
                    <div className="text-2xl lg:text-3xl font-bold text-yellow-100 my-2">{topThree[0]?.totalScore || 0}</div>
                    <div className="flex gap-1 pt-3 border-t border-yellow-600/50 px-1">
                        <PlatformScoreLink score={topThree[0]?.scores?.leetcode} handle={topThree[0]?.handles?.leetcode} platformName="LC" baseColor="text-yellow-200" hoverColor="hover:text-white" />
                        <PlatformScoreLink score={topThree[0]?.scores?.gfg} handle={topThree[0]?.handles?.gfg} platformName="GFG" baseColor="text-yellow-200" hoverColor="hover:text-white" />
                        <PlatformScoreLink score={topThree[0]?.scores?.codechef} handle={topThree[0]?.handles?.codechef} platformName="CC" baseColor="text-yellow-200" hoverColor="hover:text-white" />
                    </div>
                </div>
                <div className="relative w-1/3 h-[75%] pt-6 pb-4 px-3 bg-orange-900/40 border-2 border-orange-700 rounded-t-xl shadow-lg transition-shadow duration-300 group-hover:shadow-orange-500/20">
                    <span className="absolute top-2 right-3 text-3xl lg:text-4xl font-bold text-orange-800/50">3</span>
                    <Award className="w-7 h-7 lg:w-8 lg:h-8 mx-auto text-orange-400 mb-2" />
                    <h3 className="text-sm font-bold text-white truncate" title={topThree[2]?.name}>{topThree[2]?.name || 'N/A'}</h3>
                    <div className="text-xl lg:text-2xl font-bold text-orange-200 my-2">{topThree[2]?.totalScore || 0}</div>
                    <div className="flex gap-1 pt-2 border-t border-orange-800 px-1">
                        <PlatformScoreLink score={topThree[2]?.scores?.leetcode} handle={topThree[2]?.handles?.leetcode} platformName="LC" baseColor="text-orange-300" hoverColor="hover:text-white" />
                        <PlatformScoreLink score={topThree[2]?.scores?.gfg} handle={topThree[2]?.handles?.gfg} platformName="GFG" baseColor="text-orange-300" hoverColor="hover:text-white" />
                        <PlatformScoreLink score={topThree[2]?.scores?.codechef} handle={topThree[2]?.handles?.codechef} platformName="CC" baseColor="text-orange-300" hoverColor="hover:text-white" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredCandidates.length);

        const pages = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
            const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                <div className="text-sm text-gray-400">
                    Showing <span className="font-bold text-white">{startIndex + 1}</span>-<span className="font-bold text-white">{endIndex}</span> of <span className="font-bold text-white">{filteredCandidates.length}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 sm:px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors">&laquo;</button>
                    
                    {startPage > 1 && (
                        <><button onClick={() => handlePageChange(1)} className="px-3 py-1 rounded-md text-sm bg-white/10 hover:bg-white/20 transition-colors">1</button>
                        <span className="text-gray-400 self-end">...</span></>
                    )}

                    {pages.map(pageNum => (
                        <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-8 h-8 sm:w-auto sm:px-3 sm:py-1 rounded-md text-sm transition-colors ${currentPage === pageNum ? 'bg-blue-500 text-white font-bold' : 'bg-white/10 hover:bg-white/20'}`}>{pageNum}</button>
                    ))}
                    
                    {endPage < totalPages && (
                        <><span className="text-gray-400 self-end">...</span>
                        <button onClick={() => handlePageChange(totalPages)} className="px-3 py-1 rounded-md text-sm bg-white/10 hover:bg-white/20 transition-colors">{totalPages}</button></>
                    )}

                    <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors">&raquo;</button>
                </div>
            </div>
        );
    };
    
    // --- MAIN RENDER ---
    return (
        <>
            {/* --- CUSTOM SCROLLBAR STYLES --- */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.4);
                    border-radius: 10px;
                    border: 3px solid transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.6);
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white">
                <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                    <Header animate={animate} />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
                </div>
                <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto pb-24">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 lg:mb-8 gap-4">
                            <h1 className="text-3xl lg:text-4xl font-bold flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                <Trophy className="w-8 h-8 mr-3 text-yellow-400" /> Leaderboard
                            </h1>
                        </div>
                        {loading ? <GlassSkeletonLoader /> : error ? <div>Error: {error}</div> : (
                            <>
                                {renderPodium()}
                                <div className="relative z-30 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 mb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="text" placeholder="Search by roll no..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors" />
                                        </div>
                                        <div className="relative" ref={batchDropdownRef}>
                                            <button onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors">
                                                <span>{selectedBatch === 'All' ? 'All Batches' : selectedBatch}</span>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isBatchDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isBatchDropdownOpen && (
                                                <ul className="absolute top-full mt-2 w-full bg-[#071225]/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20 custom-scrollbar">
                                                    {batches.map(batch => (
                                                        <li key={batch} onClick={() => { setSelectedBatch(batch); setCurrentPage(1); setIsBatchDropdownOpen(false); }} className="px-4 py-2 text-white hover:bg-white/10 cursor-pointer">
                                                            {batch === 'All' ? 'All Batches' : batch}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Attach the ref to this container */}
                                <div ref={rankingsRef}>
                                    <div className="flex items-center gap-3 mb-4 mt-8"><ListOrdered className="w-6 h-6 text-blue-300" /><h2 className="text-xl lg:text-2xl font-semibold text-white">All Rankings</h2></div>
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-bold text-sm text-gray-400 border-b border-white/10">
                                            <div className="col-span-1">Rank</div><div className="col-span-5">Student</div>
                                            <div className="col-span-1 text-center">LeetCode</div><div className="col-span-1 text-center">GFG</div>
                                            <div className="col-span-1 text-center">CodeChef</div><div className="col-span-3 text-right">Total Score</div>
                                        </div>
                                        {/* Add custom-scrollbar class to the scrollable div */}
                                        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                                            <div className="divide-y divide-white/5">
                                                {paginatedCandidates.map(coder => (
                                                    <div key={coder.rollno} className={`transition-all duration-300 hover:bg-white/10 ${coder.rollno === currentUserIdentifier ? 'bg-blue-500/20' : ''}`}>
                                                        <div className="md:hidden p-3">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`font-bold text-lg w-8 text-center ${getRankColor(coder.rank)}`}>#{coder.rank}</span>
                                                                    <div>
                                                                        <div className="font-semibold text-white">{coder.name}</div>
                                                                        <div className="text-xs text-gray-400">{coder.batch}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold text-xl text-white">{coder.totalScore}</div>
                                                                    <div className="text-xs text-gray-400">Total Score</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="hidden md:grid grid-cols-12 gap-4 items-center p-3 lg:p-4">
                                                            <div className={`col-span-1 font-bold text-base lg:text-lg ${getRankColor(coder.rank)}`}>#{coder.rank}</div>
                                                            <div className="col-span-5"><div className="font-semibold text-sm">{coder.name}</div></div>
                                                            <div className="col-span-1 flex items-center justify-center gap-2 text-sm text-gray-200">{coder.scores.leetcode} {coder.handles?.leetcode && <a href={coder.handles.leetcode} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="opacity-50 hover:opacity-100" /></a>}</div>
                                                            <div className="col-span-1 flex items-center justify-center gap-2 text-sm text-gray-200">{coder.scores.gfg} {coder.handles?.gfg && <a href={coder.handles.gfg} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="opacity-50 hover:opacity-100" /></a>}</div>
                                                            <div className="col-span-1 flex items-center justify-center gap-2 text-sm text-gray-200">{coder.scores.codechef} {coder.handles?.codechef && <a href={coder.handles.codechef} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="opacity-50 hover:opacity-100" /></a>}</div>
                                                            <div className="col-span-3 text-right font-bold text-lg lg:text-xl text-white">{coder.totalScore}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {renderPagination()}
                                </div>
                            </>
                        )}
                    </div>
                    {userRole === 'student' && currentUserData && !loading && (
                        <div className={`fixed bottom-4 left-4 right-4 z-50 transform-gpu transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                            <div className="max-w-7xl mx-auto">
                                <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`font-bold text-2xl ${getRankColor(currentUserData.rank)}`}>#{currentUserData.rank}</div>
                                        <div>
                                            <div className="font-semibold text-white text-lg">{currentUserData.name}</div>
                                            <div className="text-sm text-blue-200">Your Current Position</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-2xl text-white">{currentUserData.totalScore}</div>
                                        <div className="text-sm text-blue-200">Total Score</div>
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
