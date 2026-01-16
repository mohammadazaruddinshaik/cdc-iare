import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Check, Menu, X, 
  PanelLeftClose, PanelLeftOpen, Trophy, Sun, Moon, 
  Timer, LayoutGrid, Star, ShieldAlert, Ban, Maximize,
  ListTodo, CheckCircle2, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* --- 0. SECURITY CONFIG --- */
const SECURITY_CONFIG = {
    MAX_VIOLATIONS: 3,
    VIOLATION_WEIGHTS: { TAB_SWITCH: 1, FULLSCREEN_EXIT: 1, RIGHT_CLICK: 0.5 }
};

/* --- 1. MOCK DATA --- */
const QUIZ_DATA = [
    { "_id": "q1", "questionText": "Which concept of OOP allows a subclass to provide a specific implementation?", "type": "mcq", "marks": 1, "options": [{ "_id": "opt1a", "text": "Encapsulation" }, { "_id": "opt1b", "text": "Polymorphism" }], "correct": "opt1b" },
    { "_id": "q2", "questionText": "Which of the following are the four main pillars of OOP?", "type": "checkbox", "marks": 2, "options": [{ "_id": "opt2a", "text": "Encapsulation" }, { "_id": "opt2c", "text": "Inheritance" }, { "_id": "opt2d", "text": "Polymorphism" }, { "_id": "opt2e", "text": "Abstraction" }], "correct": ["opt2a", "opt2c", "opt2d", "opt2e"] },
    { "_id": "q3", "questionText": "In Java, which access modifier is private?", "type": "mcq", "marks": 1, "options": [{ "_id": "opt3a", "text": "public" }, { "_id": "opt3b", "text": "private" }], "correct": "opt3b" },
    { "_id": "q4", "questionText": "Analyze the code: 'class Dog extends Animal'. What relationship does this establish?", "type": "mcq", "marks": 1, "options": [{ "_id": "opt4a", "text": "IS-A Relationship" }, { "_id": "opt4b", "text": "HAS-A Relationship" }], "correct": "opt4a" },
    { "_id": "q5", "questionText": "What implies hiding the internal implementation details?", "type": "mcq", "marks": 5, "options": [{ "_id": "opt5a", "text": "Inheritance" }, { "_id": "opt5b", "text": "Abstraction" }], "correct": "opt5b" },
    ...Array.from({ length: 15 }).map((_, i) => ({
        "_id": `q${i+6}`,
        "questionText": `Demo Question ${i+6}: What is the output of the following code snippet?`,
        "type": "mcq",
        "marks": 1,
        "options": [{ "_id": "a", "text": "Option A" }, { "_id": "b", "text": "Option B" }],
        "correct": "a"
    }))
];

/* --- 2. ATMOSPHERE & THEME --- */
const Atmosphere = ({ isDarkMode }) => (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700 z-0 ${isDarkMode ? 'bg-[#050B14]' : 'bg-slate-50'}`}>
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: isDarkMode ? [0.2, 0.4, 0.2] : [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] ${isDarkMode ? 'bg-indigo-900/40' : 'bg-blue-100'}`}
        />
    </div>
);

const getTheme = (isDarkMode) => ({
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textSecondary: isDarkMode ? "text-slate-400" : "text-slate-500",
    border: isDarkMode ? "border-slate-800" : "border-slate-200",
    card: isDarkMode ? "bg-[#1E293B]/60 backdrop-blur-md border-slate-700/50 shadow-xl" : "bg-white/80 backdrop-blur-md border-slate-200 shadow-xl shadow-slate-200/40",
    optionIdle: isDarkMode ? "bg-[#1E293B]/80 border-slate-700 hover:bg-[#334155]" : "bg-white/80 border-slate-200 hover:border-blue-400 hover:shadow-md",
    optionActive: isDarkMode ? "bg-blue-600/20 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]" : "bg-blue-50/50 border-blue-600 shadow-sm",
    navBtn: isDarkMode ? "bg-[#1E293B] hover:bg-slate-800 text-white border border-slate-700" : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
    primaryBtn: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30",
});

/* --- 3. ANIMATION VARIANTS (ENHANCED FLOW) --- */
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50, // Slide in from right (next) or left (prev)
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25 }, // Snappier spring
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 }
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50, // Slide out to right (prev) or left (next)
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 }
    }
  })
};

/* --- 4. MODALS & SUB-COMPONENTS --- */
const WarningModal = ({ isOpen, onClose, violationCount, maxViolations }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md p-6 rounded-2xl border-2 border-red-500 bg-[#0F172A] text-white text-center shadow-2xl">
                <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black mb-2">Security Warning</h2>
                <p className="text-slate-300 mb-6">Focus lost detected. Warning <span className="text-red-400 font-bold">{violationCount}/{maxViolations}</span>.</p>
                <button onClick={onClose} className="w-full py-3 bg-red-600 rounded-xl font-bold uppercase tracking-wider">Resume Quiz</button>
            </motion.div>
        </div>
    );
};

const LockoutModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
        <div className="text-center text-white max-w-lg">
            <Ban size={64} className="text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-black mb-4">Quiz Locked</h1>
            <p className="text-slate-400 mb-8">Multiple violations detected. Your responses have been submitted for review.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-800 rounded-xl font-bold border border-slate-700">Return Home</button>
        </div>
    </div>
);

const FullscreenGate = ({ onEnter }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
        <div className="text-center text-white">
            <Maximize size={48} className="text-indigo-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-4">Secure Environment</h1>
            <button onClick={onEnter} className="w-full py-4 px-8 bg-indigo-600 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30">Enable Fullscreen</button>
        </div>
    </div>
);

/* --- 5. MAIN COMPONENT --- */
const QuizActivePage = () => {
  const location = useLocation();
  const initialTheme = location.state?.selectedTheme === 'light' ? false : true;

  // State
  const [isDarkMode, setIsDarkMode] = useState(initialTheme);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [direction, setDirection] = useState(0); // For sliding animation
  const [answers, setAnswers] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Security
  const [hasStarted, setHasStarted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  const t = getTheme(isDarkMode);
  const currentQ = QUIZ_DATA[currentQIndex];

  // --- SECURITY LOGIC ---
  const handleViolation = useCallback((type) => {
      if (isSubmitted || isLocked || !hasStarted) return;
      const weight = SECURITY_CONFIG.VIOLATION_WEIGHTS[type] || 1;
      setViolationCount(prev => {
          const newCount = prev + weight;
          if (newCount >= SECURITY_CONFIG.MAX_VIOLATIONS) { setIsLocked(true); handleSubmit(true); return newCount; }
          setShowWarning(true);
          return newCount;
      });
  }, [isSubmitted, isLocked, hasStarted]);

  const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().then(() => setHasStarted(true)).catch(() => setHasStarted(true));
      else setHasStarted(true);
  };

  useEffect(() => {
      if (!hasStarted) return;
      const handleFS = () => { if (!document.fullscreenElement) handleViolation('FULLSCREEN_EXIT'); };
      const handleVis = () => { if (document.hidden) handleViolation('TAB_SWITCH'); };
      const handleBlur = () => handleViolation('TAB_SWITCH');
      
      document.addEventListener('fullscreenchange', handleFS);
      document.addEventListener('visibilitychange', handleVis);
      window.addEventListener('blur', handleBlur);
      return () => {
          document.removeEventListener('fullscreenchange', handleFS);
          document.removeEventListener('visibilitychange', handleVis);
          window.removeEventListener('blur', handleBlur);
      };
  }, [hasStarted, handleViolation]);

  useEffect(() => {
      const preventDefault = (e) => e.preventDefault();
      document.addEventListener('contextmenu', preventDefault);
      return () => document.removeEventListener('contextmenu', preventDefault);
  }, []);

  // --- TIMER ---
  useEffect(() => {
    if (!hasStarted || isSubmitted || isLocked) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); handleSubmit(false); return 0; }
          return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isSubmitted, isLocked]);

  // --- QUIZ LOGIC ---
  const handleSubmit = (forced = false) => {
      setIsSubmitted(true);
      if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
  };

  const handleSelect = (optionId) => {
    if (isSubmitted || isLocked) return; 
    if (currentQ.type === 'checkbox') {
      const currentAns = answers[currentQ._id] || [];
      const newAns = currentAns.includes(optionId) ? currentAns.filter(id => id !== optionId) : [...currentAns, optionId];
      setAnswers({ ...answers, [currentQ._id]: newAns });
    } else {
      setAnswers({ ...answers, [currentQ._id]: optionId });
    }
  };

  const navigateQuestion = (newIndex) => {
      // Calculate direction: +1 if moving forward, -1 if backward
      const newDirection = newIndex > currentQIndex ? 1 : -1;
      setDirection(newDirection);
      setCurrentQIndex(newIndex);
      setMobileMenuOpen(false);
  };

  const isSelected = (optionId) => {
      if (currentQ.type === 'checkbox') return (answers[currentQ._id] || []).includes(optionId);
      return answers[currentQ._id] === optionId;
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // --- INTERNAL COMPONENT: ATLAS (SIDEBAR) RESTORED ---
  const QuizAtlas = () => (
    <div className={`flex flex-col h-full border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* 1. Atlas Header */}
      <div className="p-5 pb-4 border-b border-inherit">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shadow-sm border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                <LayoutGrid size={18} />
            </div>
            <div>
                <h2 className={`text-sm font-black uppercase tracking-wide ${t.text}`}>Question Atlas</h2>
                <p className={`text-[10px] font-bold ${t.textSecondary}`}>{Object.keys(answers).length} / {QUIZ_DATA.length} Answered</p>
            </div>
         </div>
      </div>

      {/* 2. Grid */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        <div className="grid grid-cols-5 gap-2">
          {QUIZ_DATA.map((q, idx) => {
             const isActive = currentQIndex === idx;
             const isAnswered = answers[q._id] && (Array.isArray(answers[q._id]) ? answers[q._id].length > 0 : true);
             
             // Dynamic Styles for Atlas Buttons
             let btnClass = "";
             if (isActive) btnClass = "bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-1 ring-blue-400 font-black z-10 scale-105";
             else if (isAnswered) btnClass = isDarkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border border-emerald-200";
             else btnClass = isDarkMode ? "bg-[#1E293B] text-slate-500 border border-slate-800 hover:bg-slate-800" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50";

             return (
                <button
                  key={q._id}
                  onClick={() => navigateQuestion(idx)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${btnClass}`}
                >
                  {idx + 1}
                </button>
             )
          })}
        </div>
      </div>

      {/* 3. Restored Footer: Legend & Submit */}
      <div className={`p-5 mt-auto border-t ${t.border} bg-opacity-50`}>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-1 mb-4">
              <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-emerald-100 border border-emerald-300'}`}></div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${t.textSecondary}`}>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-300'}`}></div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${t.textSecondary}`}>Skipped</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${t.textSecondary}`}>Current Question</span>
              </div>
          </div>

          {/* Submit Button */}
          <button 
              onClick={() => { setMobileMenuOpen(false); handleSubmit(false); }}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 ${t.primaryBtn}`}
          >
              Final Submit
          </button>
      </div>
    </div>
  );

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-500 ${t.text} select-none`}>
      
      {!hasStarted && <FullscreenGate onEnter={enterFullscreen} />}
      {isLocked && <LockoutModal />}
      <WarningModal isOpen={showWarning} onClose={() => { setShowWarning(false); enterFullscreen(); }} violationCount={Math.floor(violationCount)} maxViolations={SECURITY_CONFIG.MAX_VIOLATIONS} />

      <Atmosphere isDarkMode={isDarkMode} />

      <header className={`h-20 border-b flex items-center justify-between px-6 z-20 flex-shrink-0 relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A]/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`hidden lg:flex p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
            </button>
            <button className={`lg:hidden p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
            </button>
            <div className="hidden lg:block">
                <h1 className="text-xl font-black tracking-tight">CDC Assessment</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>SECURE</div>
            </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono font-bold border transition-all duration-500 ${timeLeft < 300 ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : isDarkMode ? 'bg-[#1E293B] text-blue-400 border-slate-700 shadow-lg' : 'bg-white text-slate-700 border-slate-200 shadow-sm'}`}>
                <Timer size={18} /> <span className="text-lg tracking-widest min-w-[60px] text-center">{formatTime(timeLeft)}</span>
            </div>
        </div>
        <div onClick={() => setIsDarkMode(!isDarkMode)} className={`relative h-10 w-20 rounded-full cursor-pointer p-1 transition-colors duration-300 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
            <div className="flex justify-between items-center w-full h-full px-1.5 z-10 relative"><Moon size={16} className={isDarkMode ? "text-white" : "text-slate-400"} /><Sun size={16} className={!isDarkMode ? "text-orange-500" : "text-slate-600"} /></div>
            <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 30 }} className={`absolute top-1 bottom-1 w-[34px] rounded-full shadow-sm z-0 ${isDarkMode ? 'left-1 bg-slate-600' : 'right-1 bg-white'}`} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <AnimatePresence initial={false}>
            {sidebarOpen && (
                <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`hidden lg:block h-full shadow-2xl z-10 overflow-hidden border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <QuizAtlas />
                </motion.aside>
            )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto relative transition-colors duration-500 p-4 md:p-10">
            {isSubmitted && !isLocked && (
                 <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
                    <Trophy size={64} className="text-yellow-500 mb-6" />
                    <h2 className="text-4xl font-black mb-2">Quiz Completed!</h2>
                    <p className="text-slate-500">Your answers have been securely recorded.</p>
                    <button onClick={() => window.location.reload()} className={`mt-8 px-8 py-3 font-bold rounded-xl ${t.primaryBtn}`}>Back to Dashboard</button>
                </div>
            )}

            {!isSubmitted && (
                /* --- KEY CHANGE: FLOW ANIMATION --- */
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div 
                        key={currentQ._id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="max-w-4xl mx-auto w-full flex flex-col h-full"
                    >
                         <div className="flex justify-between items-center mb-6">
                            <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>Question {currentQIndex + 1}</span>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase border flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}><Star size={12} fill="currentColor"/> {currentQ.marks} Pts</span>
                         </div>

                         <div className={`p-8 md:p-10 rounded-[2rem] mb-8 ${t.card}`}>
                             <h2 className="text-xl md:text-3xl font-bold leading-relaxed">{currentQ.questionText}</h2>
                         </div>

                         <div className="space-y-3 mb-auto">
                            {currentQ.options.map((opt) => {
                                const active = isSelected(opt._id);
                                const isCheckbox = currentQ.type === 'checkbox';
                                return (
                                    <div key={opt._id} onClick={() => handleSelect(opt._id)} className={`group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${active ? t.optionActive : t.optionIdle}`}>
                                        <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center transition-all duration-200 rounded-full border-2 ${active ? 'bg-blue-600 border-blue-600' : isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                                            {active && (isCheckbox ? <Check size={14} className="text-white" strokeWidth={4} /> : <div className="w-2.5 h-2.5 bg-white rounded-full" />)}
                                        </div>
                                        <span className={`font-medium ${active ? t.text : t.textSecondary}`}>{opt.text}</span>
                                    </div>
                                )
                            })}
                         </div>

                         <div className="flex justify-between pt-6 mt-8">
                            <button onClick={() => navigateQuestion(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${t.navBtn}`}><ChevronLeft size={20} /> Prev</button>
                            {currentQIndex === QUIZ_DATA.length - 1 ? (
                                <button onClick={() => handleSubmit(false)} className={`px-8 py-3 rounded-xl font-bold ${t.primaryBtn}`}>Submit</button>
                            ) : (
                                <button onClick={() => navigateQuestion(Math.min(QUIZ_DATA.length - 1, currentQIndex + 1))} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold ${t.primaryBtn}`}>Next <ChevronRight size={20} /></button>
                            )}
                         </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </main>
        
        <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div className="absolute inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className={`absolute left-0 top-0 bottom-0 w-[280px] shadow-2xl ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
                    <QuizAtlas />
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizActivePage;