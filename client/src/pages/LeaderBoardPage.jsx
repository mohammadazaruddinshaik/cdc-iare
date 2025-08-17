/**
 * @file LeaderBoardPage.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 18 Aug 2025
 * @description A responsive leaderboard page with a visually striking podium for top performers, including clickable profile links.
 * Features include global search, dynamic filtering, intelligent pagination,
 * a dynamic sticky card, and a comprehensive skeleton loading animation.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
    Trophy, 
    Medal, 
    Award, 
    Search,
    Crown,
    ListOrdered,
    ExternalLink
} from 'lucide-react';
import Header from '../components/Header'; // Assuming Header component exists

// --- Leaderboard Component ---
const LeaderBoardPage = () => {
    // --- State for fetched data, loading, and errors ---
    const [allCoders, setAllCoders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- States for UI controls ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [animate, setAnimate] = useState(false);
    const itemsPerPage = 10;
    
    // --- User-specific data ---
    const currentUserRollNo = localStorage.getItem("rollno");

    // --- Effect for initial animation ---
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // --- Effect for fetching data from the backend ---
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                const response = await fetch(`http://localhost:5000/api/Student/getLeaderBoardData/${currentUserRollNo}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();

                const processedData = data.AllCoders.map(coder => ({
                    ...coder,
                    name: `${coder.rollno}`,
                    batch: coder.batch,
                })).sort((a, b) => b.totalScore - a.totalScore);

                setAllCoders(processedData);
                setError(null);
            } catch (err) {
                console.error("Error fetching leaderboard data:", err);
                setError(err.message);
                setAllCoders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [currentUserRollNo]);

    const batches = ['All', ...[...new Set(allCoders.map(c => c.batch))].sort()];
    
    const filteredCandidates = useMemo(() => {
        return allCoders.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  candidate.rollno.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBatch = selectedBatch === 'All' || candidate.batch === selectedBatch;
            return matchesSearch && matchesBatch;
        });
    }, [allCoders, searchTerm, selectedBatch]);

    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, itemsPerPage, filteredCandidates]);

    const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    const topThree = allCoders.slice(0, 3);

    const currentUserData = useMemo(() => allCoders.find(c => c.rollno === currentUserRollNo), [allCoders, currentUserRollNo]);
    const currentUserRank = useMemo(() => allCoders.findIndex(c => c.rollno === currentUserRollNo) + 1, [allCoders, currentUserRollNo]);
    
    const currentUserFilteredRank = useMemo(() => {
        if (!currentUserData) return 0;
        const index = filteredCandidates.findIndex(c => c.rollno === currentUserRollNo);
        return index !== -1 ? index + 1 : 0;
    }, [filteredCandidates, currentUserData, currentUserRollNo]);

    const isFilterActive = searchTerm !== '' || selectedBatch !== 'All';

    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-400'; // Gold
        if (rank === 2) return 'text-gray-300';   // Silver
        if (rank === 3) return 'text-orange-400'; // Bronze
        return 'text-blue-300';                   // Default theme color
    };

    const LeaderboardSkeleton = () => (
        <div className="animate-pulse">
            <div className="mb-12">
                <div className="flex items-end justify-center text-center max-w-5xl mx-auto">
                    <div className="w-1/3 h-48 bg-slate-700/50 rounded-t-xl"></div>
                    <div className="w-1/3 h-56 bg-slate-700/50 rounded-t-xl"></div>
                    <div className="w-1/3 h-48 bg-slate-700/50 rounded-t-xl"></div>
                </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 sm:p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-10 bg-slate-700/50 rounded-lg"></div>
                    <div className="h-10 bg-slate-700/50 rounded-lg"></div>
                </div>
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden p-4">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-white/10">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className={`${i === 0 ? 'col-span-1' : i === 1 ? 'col-span-5' : i === 5 ? 'col-span-3' : 'col-span-1'} h-4 bg-slate-700/50 rounded`}></div>
                    ))}
                </div>
                <div className="mt-4 space-y-4">
                    {Array(itemsPerPage).fill(0).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 h-6 bg-slate-700/50 rounded-md"></div>
                            <div className="col-span-5 space-y-2">
                                <div className="h-4 w-3/4 bg-slate-700/50 rounded"></div>
                                <div className="h-3 w-1/2 bg-slate-700/50 rounded"></div>
                            </div>
                            <div className="hidden md:block col-span-1 h-5 bg-slate-700/50 rounded-md"></div>
                            <div className="hidden md:block col-span-1 h-5 bg-slate-700/50 rounded-md"></div>
                            <div className="hidden md:block col-span-1 h-5 bg-slate-700/50 rounded-md"></div>
                            <div className="col-span-3 col-start-10 h-6 bg-slate-700/50 rounded-md"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="flex justify-center items-center h-64 bg-red-900/20 rounded-lg">
            <div className="text-xl text-red-400">Error: Could not fetch data. {error}</div>
        </div>
    );

    const PlatformScoreLink = ({ score, handle, platformName, baseColor, hoverColor, size = "lg" }) => (
        <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="flex items-center gap-1">
                <span className={`font-bold ${size === 'lg' ? 'text-sm' : 'text-base'} ${baseColor} truncate`}>
                    {score || 0}
                </span>
                {handle && (
                    <a 
                        href={handle} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title={`View ${platformName} Profile`} 
                        className={`${hoverColor} transition-opacity opacity-60 hover:opacity-100 flex-shrink-0`}
                    >
                        <ExternalLink size={size === 'lg' ? 12 : 14} />
                    </a>
                )}
            </div>
            <span className={`text-xs ${baseColor} opacity-80 truncate w-full text-center`}>
                {platformName}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white">
            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto pb-24">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h1 className="text-3xl sm:text-4xl font-bold flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            <Trophy className="w-8 h-8 mr-3 text-yellow-400" /> Leaderboard
                        </h1>
                    </div>

                    {loading ? <LeaderboardSkeleton /> : error ? renderError() : (
                        <>
                            <div className="mb-12 group">
                                <div className="flex items-end justify-center text-center max-w-5xl mx-auto h-72 transform-gpu transition-all duration-500 group-hover:scale-105 gap-1">
                                    <div className="relative w-1/3 h-[85%] pt-8 pb-4 px-3 bg-slate-800/50 border-2 border-slate-600 rounded-t-xl shadow-lg overflow-hidden">
                                        <span className="absolute top-2 right-3 text-4xl font-bold text-slate-600/50">2</span>
                                        <Medal className="w-8 h-8 mx-auto text-slate-300 mb-2"/>
                                        <div className="px-1 mb-1">
                                            <h3 className="text-sm font-bold text-white truncate" title={topThree[1]?.name}>
                                                {topThree[1]?.name || 'N/A'}
                                            </h3>
                                           
                                        </div>
                                        <div className="text-2xl font-bold text-slate-200 mb-3">
                                            {topThree[1]?.totalScore || 0}
                                        </div>
                                        <div className="flex gap-1 pt-2 border-t border-slate-700 px-1">
                                            <PlatformScoreLink score={topThree[1]?.scores?.leetcode} handle={topThree[1]?.handles?.leetcode} platformName="LC" baseColor="text-slate-300" hoverColor="hover:text-white" size="lg"/>
                                            <PlatformScoreLink score={topThree[1]?.scores?.gfg} handle={topThree[1]?.handles?.gfg} platformName="GFG" baseColor="text-slate-300" hoverColor="hover:text-white" size="lg" />
                                            <PlatformScoreLink score={topThree[1]?.scores?.codechef} handle={topThree[1]?.handles?.codechef} platformName="CC" baseColor="text-slate-300" hoverColor="hover:text-white" size="lg" />
                                        </div>
                                    </div>
                                    <div className="relative w-1/3 h-full pt-10 pb-5 px-3 bg-yellow-900/30 border-2 border-yellow-500 rounded-t-2xl shadow-2xl shadow-yellow-500/20 z-10 overflow-hidden">
                                        <span className="absolute top-2 right-3 text-5xl font-bold text-yellow-600/30">1</span>
                                        <div className="relative w-12 h-12 mx-auto mb-2">
                                            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-50"></div>
                                            <Crown className="relative w-12 h-12 text-yellow-300"/>
                                        </div>
                                        <div className="px-1 mb-2">
                                            <h3 className="text-base font-bold text-white truncate" title={topThree[0]?.name}>
                                                {topThree[0]?.name || 'N/A'}
                                            </h3>
                                            <p className="text-yellow-300 text-xs truncate" title={topThree[0]?.rollno}>
                                                {topThree[0]?.rollno}
                                            </p>
                                        </div>
                                        <div className="text-3xl font-bold text-yellow-100 mb-3">
                                            {topThree[0]?.totalScore || 0}
                                        </div>
                                        <div className="flex gap-1 pt-3 border-t border-yellow-600/50 px-1">
                                            <PlatformScoreLink score={topThree[0]?.scores?.leetcode} handle={topThree[0]?.handles?.leetcode} platformName="LC" baseColor="text-yellow-200" hoverColor="hover:text-white" size="xl" />
                                            <PlatformScoreLink score={topThree[0]?.scores?.gfg} handle={topThree[0]?.handles?.gfg} platformName="GFG" baseColor="text-yellow-200" hoverColor="hover:text-white" size="xl" />
                                            <PlatformScoreLink score={topThree[0]?.scores?.codechef} handle={topThree[0]?.handles?.codechef} platformName="CC" baseColor="text-yellow-200" hoverColor="hover:text-white" size="xl" />
                                        </div>
                                    </div>
                                    <div className="relative w-1/3 h-[75%] pt-8 pb-4 px-3 bg-orange-900/40 border-2 border-orange-700 rounded-t-xl shadow-lg overflow-hidden">
                                        <span className="absolute top-2 right-3 text-4xl font-bold text-orange-800/50">3</span>
                                        <Award className="w-8 h-8 mx-auto text-orange-400 mb-2"/>
                                        <div className="px-1 mb-1">
                                            <h3 className="text-sm font-bold text-white truncate" title={topThree[2]?.name}>
                                                {topThree[2]?.name || 'N/A'}
                                            </h3>
                                            <p className="text-orange-400 text-xs truncate" title={topThree[2]?.rollno}>
                                                {topThree[2]?.rollno}
                                            </p>
                                        </div>
                                        <div className="text-2xl font-bold text-orange-200 mb-3">
                                            {topThree[2]?.totalScore || 0}
                                        </div>
                                        <div className="flex gap-1 pt-2 border-t border-orange-800 px-1">
                                            <PlatformScoreLink score={topThree[2]?.scores?.leetcode} handle={topThree[2]?.handles?.leetcode} platformName="LC" baseColor="text-orange-300" hoverColor="hover:text-white" size="lg" />
                                            <PlatformScoreLink score={topThree[2]?.scores?.gfg} handle={topThree[2]?.handles?.gfg} platformName="GFG" baseColor="text-orange-300" hoverColor="hover:text-white" size="lg" />
                                            <PlatformScoreLink score={topThree[2]?.scores?.codechef} handle={topThree[2]?.handles?.codechef} platformName="CC" baseColor="text-orange-300" hoverColor="hover:text-white" size="lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by roll no..." 
                                            value={searchTerm} 
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value); 
                                                setCurrentPage(1);
                                            }} 
                                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors" 
                                        />
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={selectedBatch} 
                                            onChange={(e) => {
                                                setSelectedBatch(e.target.value); 
                                                setCurrentPage(1);
                                            }} 
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none appearance-none transition-colors cursor-pointer"
                                            style={{
                                                background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E\') no-repeat right 1rem center/10px 10px, linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.05))'
                                            }}
                                        >
                                            {batches.map(batch => (
                                                <option key={batch} value={batch} className="bg-[#0A1B3A] text-white">
                                                    {batch === 'All' ? 'All Batches' : batch}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {(searchTerm || selectedBatch !== 'All') && (
                                    <div className="mt-3 text-sm text-gray-400">
                                        Showing {filteredCandidates.length} of {allCoders.length} students
                                        {searchTerm && ` matching "${searchTerm}"`}
                                        {selectedBatch !== 'All' && ` from ${selectedBatch} batch`}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3 mb-4 mt-8">
                                <ListOrdered className="w-6 h-6 text-blue-300"/>
                                <h2 className="text-2xl font-semibold text-white">All Rankings</h2>
                            </div>

                            <div>
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-bold text-sm text-gray-400 border-b border-white/10">
                                        <div className="col-span-1">Rank</div>
                                        <div className="col-span-5">Student</div>
                                        <div className="col-span-1 text-center">LeetCode</div>
                                        <div className="col-span-1 text-center">GFG</div>
                                        <div className="col-span-1 text-center">CodeChef</div>
                                        <div className="col-span-3 text-right">Total Score</div>
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/50 hover:scrollbar-thumb-blue-500 scrollbar-track-white/10 scrollbar-thumb-rounded-full">
                                        {paginatedCandidates.length > 0 ? paginatedCandidates.map((coder, index) => {
                                            const displayRank = (currentPage - 1) * itemsPerPage + index + 1;
                                            
                                            // --- FIX: Use a unique identifier like 'rollno' instead of '_id' ---
                                            const actualGlobalRank = allCoders.findIndex(c => c.rollno === coder.rollno) + 1;
                                            
                                            return (
                                                <div key={coder.rollno} className={`p-4 border-b border-white/5 transition-all duration-300 hover:bg-white/10 ${coder.rollno === currentUserRollNo ? 'bg-blue-500/20' : ''}`}>
                                                    <div className="md:hidden">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`font-bold text-lg ${getRankColor(actualGlobalRank)}`}>
                                                                    #{displayRank}
                                                                    {isFilterActive && actualGlobalRank !== displayRank && (
                                                                        <span className="text-xs text-gray-400 ml-1">
                                                                            (#{actualGlobalRank})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold">{coder.name}</div>
                                                                    <div className="text-gray-400 text-xs">{coder.rollno}</div>
                                                                </div>
                                                            </div>
                                                            <div className="font-bold text-xl text-white">{coder.totalScore}</div>
                                                        </div>
                                                        <div className="flex justify-around bg-black/20 p-2 rounded-lg text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                {coder.scores.leetcode} LC 
                                                                {coder.handles?.leetcode && (<a href={coder.handles.leetcode} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} className="opacity-50"/></a>)}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {coder.scores.gfg} GFG 
                                                                {coder.handles?.gfg && (<a href={coder.handles.gfg} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} className="opacity-50"/></a>)}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {coder.scores.codechef} CC 
                                                                {coder.handles?.codechef && (<a href={coder.handles.codechef} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} className="opacity-50"/></a>)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                                        <div className={`col-span-1 font-bold text-lg ${getRankColor(actualGlobalRank)}`}>
                                                            #{displayRank}
                                                            {isFilterActive && actualGlobalRank !== displayRank && (
                                                                <div className="text-xs text-gray-400">
                                                                    (#{actualGlobalRank})
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-span-5">
                                                            <div className="font-semibold">{coder.name}</div>
                                                        </div>
                                                        <div className="col-span-1 text-center text-gray-200 flex items-center justify-center gap-2">
                                                            {coder.scores.leetcode}
                                                            {coder.handles?.leetcode && (<a href={coder.handles.leetcode} target="_blank" rel="noopener noreferrer" title="View LeetCode Profile"><ExternalLink size={14} className="opacity-50 hover:opacity-100 transition-opacity"/></a>)}
                                                        </div>
                                                        <div className="col-span-1 text-center text-gray-200 flex items-center justify-center gap-2">
                                                            {coder.scores.gfg}
                                                            {coder.handles?.gfg && (<a href={coder.handles.gfg} target="_blank" rel="noopener noreferrer" title="View GFG Profile"><ExternalLink size={14} className="opacity-50 hover:opacity-100 transition-opacity"/></a>)}
                                                        </div>
                                                        <div className="col-span-1 text-center text-gray-200 flex items-center justify-center gap-2">
                                                            {coder.scores.codechef}
                                                            {coder.handles?.codechef && (<a href={coder.handles.codechef} target="_blank" rel="noopener noreferrer" title="View CodeChef Profile"><ExternalLink size={14} className="opacity-50 hover:opacity-100 transition-opacity"/></a>)}
                                                        </div>
                                                        <div className="col-span-3 text-right font-bold text-xl text-white">{coder.totalScore}</div>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center p-8 text-gray-400">
                                                No students found matching your criteria.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center mt-6 gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                            disabled={currentPage === 1} 
                                            className="px-4 py-2 bg-white/10 rounded-lg mx-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors">
                                            &laquo; Prev
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) { pageNum = i + 1; } 
                                                else if (currentPage <= 3) { pageNum = i + 1; } 
                                                else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; } 
                                                else { pageNum = currentPage - 2 + i; }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-1 rounded-md text-sm transition-colors ${ currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20' }`}>
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                            disabled={currentPage === totalPages} 
                                            className="px-4 py-2 bg-white/10 rounded-lg mx-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors">
                                            Next &raquo;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {currentUserData && (
                    <div className="sticky bottom-4 -mt-24 max-w-7xl mx-auto z-20 px-4">
                        <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-blue-300/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="font-semibold">
                                    <div className={`font-bold text-xl ${getRankColor(currentUserRank)}`}>
                                        Overall Rank: #{currentUserRank}
                                    </div>
                                    {isFilterActive && currentUserFilteredRank > 0 && (
                                        <div className="text-xs text-blue-200 mt-1">
                                            (Filtered Rank: #{currentUserFilteredRank})
                                        </div>
                                    )}
                                </div>
                                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                                <div className="font-semibold text-lg">{currentUserData.name}</div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="text-center flex items-center gap-1.5">
                                    <div className="font-bold">{currentUserData.scores.leetcode}</div>
                                    <div className="text-xs opacity-80">LeetCode</div>
                                    {currentUserData.handles?.leetcode && (<a href={currentUserData.handles.leetcode} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white"><ExternalLink size={12} /></a>)}
                                </div>
                                <div className="text-center flex items-center gap-1.5">
                                    <div className="font-bold">{currentUserData.scores.gfg}</div>
                                    <div className="text-xs opacity-80">GFG</div>
                                    {currentUserData.handles?.gfg && (<a href={currentUserData.handles.gfg} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white"><ExternalLink size={12} /></a>)}
                                </div>
                                <div className="text-center flex items-center gap-1.5">
                                    <div className="font-bold">{currentUserData.scores.codechef}</div>
                                    <div className="text-xs opacity-80">CodeChef</div>
                                    {currentUserData.handles?.codechef && (<a href={currentUserData.handles.codechef} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white"><ExternalLink size={12} /></a>)}
                                </div>
                                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                                <div className="text-right">
                                    <div className="font-bold text-2xl">{currentUserData.totalScore}</div>
                                    <div className="text-xs opacity-80">Total Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaderBoardPage;