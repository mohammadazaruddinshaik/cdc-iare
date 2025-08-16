/**
 * @file LeaderBoardPage.jsx
 * @author Shaik Mohammad Azaruddin
 * @date 17 Aug 2025
 * @description A responsive leaderboard page component for displaying coder rankings.
 * Features include search, filtering by branch and rank range, pagination,
 * a podium view for the top 3, and a sticky card for the current user's rank.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
    Trophy, 
    Filter, 
    ChevronDown, 
    Medal, 
    Award, 
    Search,
    Crown,
    ListOrdered
} from 'lucide-react';
import Header from '../components/Header'; // Assuming Header component exists

// --- Mock Data Generation ---
const generateMockCandidates = () => {
    const branches = ['CSE', 'CSE(AI & ML)', 'CSE(AI & DS)', 'IT', 'ECE', 'EEE', 'MECH'];
    const batches = ['SU-B1', 'SU-B2', 'SU-B3', 'SU-B4', 'SU-B5'];
    const names = [
        'Shaik Mohammad Azaruddin', 'Priyansh Gupta', 'Ananya Sharma', 'Rahul Kumar', 
        'Divya Singh', 'Sai Kiran', 'Arjun Reddy', 'Nithin Chowdary', 'Meghana Sri', 
        'Manoj Kumar', 'Priya Patel', 'Vikram Singh', 'Sneha Reddy', 'Karthik Raj',
        'Aditi Sharma', 'Rohit Kumar', 'Kavya Nair', 'Aditya Gupta', 'Sruthi Reddy'
    ];

    const candidates = [];
    
    for (let i = 0; i < 200; i++) {
        const leetcodeBase = Math.max(50, 800 - (i * 3) + Math.random() * 200);
        const gfgBase = Math.max(30, 700 - (i * 2.5) + Math.random() * 150);
        const codechefBase = Math.max(20, 500 - (i * 2) + Math.random() * 100);
        
        const scores = {
            leetcode: Math.floor(leetcodeBase),
            gfg: Math.floor(gfgBase),
            codechef: Math.floor(codechefBase)
        };

        candidates.push({
            _id: `candidate_${i}`,
            rollno: `23951A66${String(i + 1).padStart(2, '0')}`,
            name: i < names.length ? names[i] : `Student ${i + 1}`,
            branch: branches[i % branches.length],
            batch: batches[i % batches.length],
            scores,
            totalScore: scores.leetcode + scores.gfg + scores.codechef,
        });
    }
    
    // Ensure specific top candidates are always present with high scores
    candidates[0] = { ...candidates[0], rollno: "23951A66H8", name: "Shaik Mohammad Azaruddin", branch: "CSE(AI & ML)", scores: { leetcode: 850, gfg: 720, codechef: 600 }, totalScore: 2170 };
    candidates[1] = { ...candidates[1], rollno: "23951A66F5", name: "Priyansh Gupta", branch: "CSE", scores: { leetcode: 820, gfg: 700, codechef: 580 }, totalScore: 2100 };
    candidates[2] = { ...candidates[2], rollno: "23951A66G7", name: "Ananya Sharma", branch: "IT", scores: { leetcode: 800, gfg: 680, codechef: 560 }, totalScore: 2040 };

    return candidates.sort((a, b) => b.totalScore - a.totalScore);
};

// --- Leaderboard Component ---
const LeaderBoardPage = () => {
    const [candidates] = useState(generateMockCandidates());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedRange, setSelectedRange] = useState('1-25'); // Changed initial state
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [animate, setAnimate] = useState(false);
    const itemsPerPage = 10;
    
    const currentUserRollNo = "23951A66H8"; // Hardcoded for demonstration

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const branches = ['All', ...new Set(candidates.map(c => c.branch))];
    
    // --- UPDATED: New rank ranges ---
    const rankRanges = [
        '1-25', '26-50', '51-75', '76-100', 
        '101-125', '126-150', '151-175', '176-200'
    ];

    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  candidate.rollno.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBranch = selectedBranch === 'All' || candidate.branch === selectedBranch;
            return matchesSearch && matchesBranch;
        });
    }, [candidates, searchTerm, selectedBranch]);

    const rangedCandidates = useMemo(() => {
        const [start, end] = selectedRange.split('-').map(Number);
        return filteredCandidates.slice(start - 1, end);
    }, [selectedRange, filteredCandidates]);

    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return rangedCandidates.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, itemsPerPage, rangedCandidates]);

    const totalPages = Math.ceil(rangedCandidates.length / itemsPerPage);
    const topThree = candidates.slice(0, 3);
    const currentUserData = candidates.find(c => c.rollno === currentUserRollNo);
    const currentUserRank = candidates.findIndex(c => c.rollno === currentUserRollNo) + 1;

    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-blue-300';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] text-white">
            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <Header animate={animate} />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
            </div>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* --- Page Title --- */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h1 className="text-3xl sm:text-4xl font-bold flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
                            Leaderboard
                        </h1>
                         <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-lg px-4 py-2 border border-white/10 hover:bg-white/20 transition-all duration-300"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* --- Top 3 Champions --- */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 max-w-5xl mx-auto">
                            {/* Rank 2 */}
                            <div className="w-full md:w-1/3 order-2 md:order-1">
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-500 text-center">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                                        <Medal className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white truncate">{topThree[1]?.name || 'N/A'}</h3>
                                    <p className="text-gray-400 text-xs mb-1">{topThree[1]?.rollno}</p>
                                    <div className="text-3xl font-bold text-gray-200 mt-2">{topThree[1]?.totalScore}</div>
                                </div>
                            </div>
                            {/* Rank 1 */}
                            <div className="w-full md:w-1/3 order-1 md:order-2 -mb-6 md:mb-0">
                                <div className="bg-white/10 backdrop-blur-xl rounded-t-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-yellow-400 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-pulse">
                                        <Crown className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white truncate">{topThree[0]?.name}</h3>
                                    <p className="text-yellow-300 text-xs mb-1">{topThree[0]?.rollno}</p>
                                    <div className="text-4xl font-bold text-yellow-100 mt-2">{topThree[0]?.totalScore}</div>
                                </div>
                            </div>
                            {/* Rank 3 */}
                            <div className="w-full md:w-1/3 order-3 md:order-3">
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-orange-500 text-center">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center">
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white truncate">{topThree[2]?.name || 'N/A'}</h3>
                                    <p className="text-orange-400 text-xs mb-1">{topThree[2]?.rollno}</p>
                                    <div className="text-3xl font-bold text-orange-200 mt-2">{topThree[2]?.totalScore}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- MOVED & ENHANCED: Filters Section (Collapsible) --- */}
                    {showFilters && (
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 mb-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or roll no..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none appearance-none"
                                    style={{ background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E\') no-repeat right 1rem center/10px 10px, linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.05))' }}
                                >
                                    {branches.map(branch => (
                                        <option key={branch} value={branch} className="bg-[#0A1B3A] text-white">{branch}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedRange}
                                    onChange={(e) => { setSelectedRange(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none appearance-none"
                                    style={{ background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E\') no-repeat right 1rem center/10px 10px, linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.05))' }}
                                >
                                    {rankRanges.map(range => (
                                        <option key={range} value={range} className="bg-[#0A1B3A] text-white">Ranks {range}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Leaderboard Table Section Title --- */}
                    <div className="flex items-center gap-3 mb-4 mt-8">
                        <ListOrdered className="w-6 h-6 text-blue-300"/>
                        <h2 className="text-2xl font-semibold text-white">All Rankings</h2>
                    </div>

                    {/* --- Leaderboard Table --- */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-bold text-sm text-gray-400 border-b border-white/10">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-5">Student</div>
                            <div className="col-span-1 text-center">LeetCode</div>
                            <div className="col-span-1 text-center">GFG</div>
                            <div className="col-span-1 text-center">CodeChef</div>
                            <div className="col-span-3 text-right">Total Score</div>
                        </div>
                        {/* --- ADDED: Custom Scrollbar Styling --- */}
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800/80 scrollbar-track-white/10">
                            {paginatedCandidates.length > 0 ? paginatedCandidates.map((coder) => {
                                const rank = candidates.findIndex(c => c._id === coder._id) + 1;
                                return (
                                    <div key={coder._id} className={`p-4 border-b border-white/5 transition-all duration-300 hover:bg-white/10 ${coder.rollno === currentUserRollNo ? 'bg-blue-500/20' : ''}`}>
                                        {/* Mobile View */}
                                        <div className="md:hidden">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`font-bold text-lg ${getRankColor(rank)}`}>#{rank}</div>
                                                    <div>
                                                        <div className="font-semibold">{coder.name}</div>
                                                        <div className="text-gray-400 text-xs">{coder.rollno}</div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-xl text-white">{coder.totalScore}</div>
                                            </div>
                                            <div className="flex justify-around bg-black/20 p-2 rounded-lg text-xs">
                                                <div><span className="font-semibold">{coder.scores.leetcode}</span> LC</div>
                                                <div><span className="font-semibold">{coder.scores.gfg}</span> GFG</div>
                                                <div><span className="font-semibold">{coder.scores.codechef}</span> CC</div>
                                            </div>
                                        </div>
                                        {/* Desktop View */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                            <div className={`col-span-1 font-bold text-lg ${getRankColor(rank)}`}>#{rank}</div>
                                            <div className="col-span-5">
                                                <div className="font-semibold">{coder.name}</div>
                                                <div className="text-gray-400 text-xs">{coder.rollno}</div>
                                            </div>
                                            <div className="col-span-1 text-center text-gray-200">{coder.scores.leetcode}</div>
                                            <div className="col-span-1 text-center text-gray-200">{coder.scores.gfg}</div>
                                            <div className="col-span-1 text-center text-gray-200">{coder.scores.codechef}</div>
                                            <div className="col-span-3 text-right font-bold text-xl text-white">{coder.totalScore}</div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center p-8 text-gray-400">No students found matching your criteria.</div>
                            )}
                        </div>
                    </div>
                    
                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white/10 rounded-md mx-1 disabled:opacity-50">&laquo; Prev</button>
                            <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white/10 rounded-md mx-1 disabled:opacity-50">Next &raquo;</button>
                        </div>
                    )}
                </div>

                {/* --- Sticky User Position Card --- */}
                {currentUserData && (
                    <div className="sticky bottom-4 mt-8 max-w-7xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-blue-300/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`font-bold text-xl ${getRankColor(currentUserRank)}`}>Your Rank: #{currentUserRank}</div>
                                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                                <div className="font-semibold text-lg">{currentUserData.name}</div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="text-center"><div className="font-bold">{currentUserData.scores.leetcode}</div><div className="text-xs opacity-80">LeetCode</div></div>
                                <div className="text-center"><div className="font-bold">{currentUserData.scores.gfg}</div><div className="text-xs opacity-80">GFG</div></div>
                                <div className="text-center"><div className="font-bold">{currentUserData.scores.codechef}</div><div className="text-xs opacity-80">CodeChef</div></div>
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