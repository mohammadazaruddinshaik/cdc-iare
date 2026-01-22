import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Menu, 
  PanelLeftClose, PanelLeftOpen, Sun, Moon, 
  LayoutGrid, Star, ShieldAlert, Ban, Maximize,
  ListTodo, Activity, CheckCircle2, Clock, Loader2, 
  WifiOff, SignalLow, Image as ImageIcon, Lock, Wifi 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* --- 0. CONFIGURATION --- */
const BACKEND_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000"; 
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_URL || "https://iare-data.s3.ap-south-1.amazonaws.com/uploads";

/* --- 1. ATMOSPHERE & THEME --- */
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

/* --- 2. ANIMATION VARIANTS --- */
const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, opacity: { duration: 0.2 } } },
  exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0, scale: 0.95, transition: { type: "spring", stiffness: 300, damping: 25, opacity: { duration: 0.2 } } })
};

/* --- 3. MODALS --- */
const SubmitReviewModal = ({ isOpen, onClose, onConfirm, answers, quizData, isDarkMode, jumpToQuestion, isSubmitting, submitError }) => {
    if (!isOpen) return null;
    const attempted = Object.keys(answers).length;
    const total = quizData.length;
    const skipped = total - attempted;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-2xl p-6 md:p-8 rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <div className="text-center mb-6">
                    <ListTodo size={48} className="mx-auto text-blue-500 mb-3" />
                    <h2 className="text-2xl font-black">Submission Summary</h2>
                    <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Review your status before final submission</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-100 border-emerald-200'}`}>
                        <div className={`text-3xl font-black ${isDarkMode ? 'text-emerald-500' : 'text-emerald-700'}`}>{attempted}</div>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-70">Attempted</div>
                    </div>
                    <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-200'}`}>
                        <div className={`text-3xl font-black ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`}>{skipped}</div>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-70">Skipped</div>
                    </div>
                </div>

                {submitError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center flex items-center justify-center gap-2"
                    >
                        <ShieldAlert size={16} />
                        {submitError}
                    </motion.div>
                )}

                <div className="flex-1 overflow-y-auto min-h-[150px] mb-6 pr-2 custom-scrollbar">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {quizData.map((q, idx) => {
                             const isAnswered = answers[q._id];
                             let btnClass = isAnswered 
                                ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border-emerald-300") 
                                : (isDarkMode ? "bg-slate-800 text-slate-500 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-200");
                             return ( <button key={q._id} onClick={() => jumpToQuestion(idx)} className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold border transition-transform hover:scale-110 ${btnClass}`}>{idx + 1}</button> );
                        })}
                    </div>
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-inherit">
                    <button onClick={onClose} disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Review Answers</button>
                    <button onClick={onConfirm} disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (submitError ? "Retry Submit" : "Confirm Finish")}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Updated Warning Modal: Removed hardcoded "/5" logic, now uses dynamic warningsLeft
const WarningModal = ({ isOpen, onClose, warningsLeft, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md p-6 rounded-2xl border-2 border-red-500 bg-[#0F172A] text-white text-center shadow-2xl">
                <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black mb-2">Security Warning</h2>
                <p className="text-slate-300 mb-6">
                    {message || "Focus lost detected."}
                </p>
                {warningsLeft !== undefined && (
                     <div className="inline-block px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm mb-6">
                        {warningsLeft} warning{warningsLeft !== 1 ? 's' : ''} remaining
                     </div>
                )}
                <button onClick={onClose} className="w-full py-3 bg-red-600 rounded-xl font-bold uppercase tracking-wider hover:bg-red-500 transition-colors">Resume Quiz</button>
            </motion.div>
        </div>
    );
};

const LockoutModal = ({ message }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
        <div className="text-center text-white max-w-lg">
            <Ban size={64} className="text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-black mb-4">Quiz Locked</h1>
            <p className="text-slate-400 mb-8">
                {message || "Security violation limit exceeded. Your session is being auto-submitted."}
            </p>
        </div>
    </div>
);

const FullscreenGate = ({ onEnter }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
        <div className="text-center text-white">
            <Maximize size={48} className="text-indigo-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-4">Secure Environment</h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">This assessment requires full-screen mode. Exiting full-screen or switching tabs will be recorded as a violation.</p>
            <button onClick={onEnter} className="w-full py-4 px-8 bg-indigo-600 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors">Enable Fullscreen</button>
        </div>
    </div>
);

/* --- 4. MAIN COMPONENT --- */
const QuizActivePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- DATA RETRIEVAL ---
  const apiData = location.state || {};
  const { student, session, questions } = apiData;
  const activeSessionCode = apiData.sessionCode; 

  // [SECURITY 1] ENFORCED ENTRY GUARD
  useEffect(() => {
    if (!questions || !session || !activeSessionCode) {
        navigate('/quiz/join', { replace: true });
    }
  }, [questions, session, activeSessionCode, navigate]);

  // --- STATE ---
  const initialTheme = location.state?.theme === 'light' ? false : true;
  const [isDarkMode, setIsDarkMode] = useState(initialTheme);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState(new Set()); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ online: true, effectiveType: '4g' });
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(session?.durationMinutes ? session.durationMinutes * 60 : 2700); // 45min fallback if null

  // Security State
  const [hasStarted, setHasStarted] = useState(false);
  // REMOVED: violationCount (local counting). 
  // ADDED: warningsLeft (server state).
  const [warningsLeft, setWarningsLeft] = useState(undefined); 
  const [isLocked, setIsLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  
  const t = getTheme(isDarkMode);
  const currentQ = questions ? questions[currentQIndex] : null;

  /* --- HANDLERS --- */
  
  const submitAnswerBackground = async (qId, selectedOption, timeTaken) => {
      try {
          await fetch(`${BACKEND_URL}/api/student/quiz/submit-answer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                  sessionCode: activeSessionCode, 
                  questionId: qId,
                  selectedOption: selectedOption,
                  timeTaken: timeTaken
              })
          });
          setLockedQuestions(prev => new Set(prev).add(qId));
      } catch (error) { 
          console.error("Background Save Error:", error); 
      }
  };

  const handleSelect = (optionId) => {
    if (isLocked || isSubmitting || lockedQuestions.has(currentQ._id)) return;
    setAnswers(prev => ({ ...prev, [currentQ._id]: optionId }));
  };

  const navigateQuestion = (newIndex) => {
      if (newIndex === currentQIndex) return;
      
      const currentAnswer = answers[currentQ._id];
      if (currentAnswer && !lockedQuestions.has(currentQ._id)) {
          const timeTaken = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
          submitAnswerBackground(currentQ._id, currentAnswer, timeTaken);
      }

      setDirection(newIndex > currentQIndex ? 1 : -1);
      setCurrentQIndex(newIndex);
      setQuestionStartTime(Date.now());
      setMobileMenuOpen(false);
  };

  const finishQuiz = useCallback(async () => {
      if(isSubmitting) return; 
      setIsSubmitting(true);
      setSubmitError(null); 
      
      try {
          const response = await fetch(`${BACKEND_URL}/api/student/quiz/finish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ sessionCode: activeSessionCode })
          });
          const result = await response.json();
          
          if (result.success) {
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
              navigate('/student/quiz/result', { 
                  state: { ...result.data, theme: isDarkMode ? 'dark' : 'light' }, 
                  replace: true 
              });
          } else {
              setSubmitError(result.message || "Submission failed.");
              setIsSubmitting(false);
          }
      } catch (error) {
          console.error("Finish Error", error);
          setSubmitError("Network connection failed.");
          setIsSubmitting(false);
      }
  }, [activeSessionCode, navigate, isSubmitting, isDarkMode]);

  /* --- NETWORK & SECURITY EFFECTS --- */
  useEffect(() => {
    const updateConnectionStatus = () => {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        setConnectionStatus({ online: navigator.onLine, effectiveType: connection ? connection.effectiveType : '4g' });
    };
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    return () => {
        window.removeEventListener('online', updateConnectionStatus);
        window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  useEffect(() => {
    const preventRefresh = (e) => {
        if ((e.ctrlKey && e.key === 'r') || e.key === 'F5' || (e.metaKey && e.key === 'r')) e.preventDefault();
    };
    const handleBeforeUnload = (e) => {
        if (!isSubmitting) { e.preventDefault(); e.returnValue = "Quiz in progress!"; }
    };
    window.addEventListener('keydown', preventRefresh);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('keydown', preventRefresh);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitting]);

  // --- DYNAMIC VIOLATION HANDLER ---
  const handleViolation = useCallback(async (type) => {
      if (isLocked || !hasStarted || isSubmitting) return;

      try {
        const response = await fetch(`${BACKEND_URL}/api/student/quiz/violation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                sessionCode: activeSessionCode,
                violationType: type
            })
        });

        const data = await response.json();

        // 1. DYNAMIC WARNING
        if (data.action === "WARN") {
            setServerMessage(data.message);
            // Server dictates how many are left. No hardcoded config needed.
            setWarningsLeft(data.warningsLeft); 
            setShowWarning(true);
        }
        
        // 2. DYNAMIC TERMINATION
        else if (data.action === "TERMINATE") {
            setServerMessage(data.message);
            setIsLocked(true);
            finishQuiz();
        }

      } catch (error) {
          console.error("Violation logging error:", error);
          // If server is unreachable during a violation, we default to a generic warning
          // without locking out immediately to prevent unfair kick-outs during glitches.
          setServerMessage("Please return to the quiz immediately.");
          setShowWarning(true);
      }
  }, [isLocked, hasStarted, isSubmitting, activeSessionCode, finishQuiz]);

  useEffect(() => {
      if (!hasStarted) return;
      
      const handleFS = () => { if (!document.fullscreenElement) handleViolation('fullscreen'); };
      const handleVis = () => { if (document.hidden) handleViolation('tabswitch'); };
      const handleBlur = () => handleViolation('tabswitch');
      const handleContextMenu = (e) => { e.preventDefault(); handleViolation('contextmenu'); };

      document.addEventListener('fullscreenchange', handleFS);
      document.addEventListener('visibilitychange', handleVis);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
          document.removeEventListener('fullscreenchange', handleFS);
          document.removeEventListener('visibilitychange', handleVis);
          window.removeEventListener('blur', handleBlur);
          document.removeEventListener('contextmenu', handleContextMenu);
      };
  }, [hasStarted, handleViolation]);

  useEffect(() => {
    if (!hasStarted || isLocked || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); finishQuiz(); return 0; }
          return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isLocked, isSubmitting, finishQuiz]);

  const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().then(() => setHasStarted(true)).catch(() => setHasStarted(true));
      else setHasStarted(true);
  };

  if (!questions || !session) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isUrgent = timeLeft < 300; 

  const hasLongText = currentQ.options.some(opt => opt.text.length > 60);
  const useGridLayout = !hasLongText && currentQ.options.length > 1;

  /* --- RENDER COMPONENTS --- */
  const NetworkIndicator = () => {
      const isWeak = connectionStatus.effectiveType === '2g' || connectionStatus.effectiveType === 'slow-2g';
      return (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300
              ${!connectionStatus.online ? 'bg-red-500/10 text-red-500 border-red-500/20' : isDarkMode 
                  ? (isWeak ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500')
                  : (isWeak ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700')
              }`}
          >
              {!connectionStatus.online ? <WifiOff size={16} /> : isWeak ? <SignalLow size={16} /> : <Wifi size={16} />}
              <span className="text-xs font-bold uppercase hidden sm:block">
                  {!connectionStatus.online ? 'Offline' : isWeak ? 'Weak Signal' : 'Connected'}
              </span>
          </div>
      );
  };

  const QuizAtlas = () => {
    // Dynamic URL construction
    const avatarUrl = `${ASSET_BASE_URL}/STUDENTS/${student?.rollno}/${student?.rollno}.jpg`;

    return (
        <div className={`flex flex-col h-full border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-8 flex flex-col items-center text-center gap-3 border-b border-inherit">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/50 bg-slate-200 shadow-inner flex-shrink-0">
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${student?.name}&background=random`; }} 
                  />
              </div>
              <div className="space-y-0.5">
                  <h3 className={`font-bold text-sm leading-tight uppercase ${t.text}`}>{student?.name}</h3>
                  <p className={`text-[10px] font-bold tracking-widest opacity-50 uppercase ${t.text}`}>{student?.rollno}</p>
                  <p className={`text-[10px] font-bold tracking-widest opacity-50 uppercase ${t.text}`}>{student?.batch}</p>
              </div>
          </div>

          <div className="p-5 pb-2 border-b border-inherit flex items-center gap-2">
             <LayoutGrid size={16} className="text-indigo-400" />
             <span className={`text-xs font-black uppercase tracking-widest ${t.textSecondary}`}>Question Map</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                 const isActive = currentQIndex === idx;
                 const isAnswered = answers[q._id];
                 const isLocked = lockedQuestions.has(q._id);
                 let btnClass = isActive 
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400 scale-105"
                    : isLocked ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border border-emerald-300")
                    : isAnswered ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200")
                    : (isDarkMode ? "bg-[#1E293B] text-slate-500 border border-slate-800" : "bg-white text-slate-400 border border-slate-200");
                 
                 return ( 
                    <button key={q._id} onClick={() => navigateQuestion(idx)} className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative ${btnClass}`}>
                        {idx + 1}
                    </button> 
                 )
              })}
            </div>
          </div>
          <div className={`p-5 mt-auto border-t ${t.border}`}>
              <button 
                onClick={() => { 
                    const currentAnswer = answers[currentQ._id];
                    if(currentAnswer) {
                        const timeTaken = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
                        submitAnswerBackground(currentQ._id, currentAnswer, timeTaken);
                    }
                    setIsReviewing(true); 
                }} 
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg ${t.primaryBtn}`}
              >
                  Final Submit
              </button>
          </div>
        </div>
    );
  };

  return (
    <div className={`h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors duration-500 ${t.text} select-none`}>
      {!hasStarted && <FullscreenGate onEnter={enterFullscreen} />}
      {isLocked && <LockoutModal message={serverMessage} />}
      <WarningModal 
        isOpen={showWarning} 
        onClose={() => { setShowWarning(false); enterFullscreen(); }} 
        warningsLeft={warningsLeft}
        message={serverMessage}
      />
      
      <SubmitReviewModal 
        isOpen={isReviewing} 
        onClose={() => { setIsReviewing(false); setSubmitError(null); }} 
        onConfirm={finishQuiz} 
        answers={answers} 
        quizData={questions} 
        isDarkMode={isDarkMode} 
        jumpToQuestion={(idx) => { navigateQuestion(idx); setIsReviewing(false); }} 
        isSubmitting={isSubmitting} 
        submitError={submitError} 
      />
      
      <Atmosphere isDarkMode={isDarkMode} />

      <header className={`h-20 border-b flex items-center justify-between px-6 z-20 relative backdrop-blur-md flex-shrink-0 ${isDarkMode ? 'bg-[#0F172A]/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 rounded-xl text-slate-400">{sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}</button>
            <button className="lg:hidden p-2 rounded-xl" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
            <div className="hidden sm:block ml-2">
                <h1 className="text-lg font-black">{session?.title}</h1>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${isDarkMode ? 'text-emerald-500' : 'text-emerald-700'}`}><CheckCircle2 size={12} /> Live Session</div>
            </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono font-bold border ${isUrgent ? 'bg-rose-500 text-white border-rose-600' : (isDarkMode ? 'bg-[#1E293B] text-blue-400 border-slate-700' : 'bg-white text-slate-700 border-slate-200 shadow-sm')}`}>
                {isUrgent ? <Activity size={18} className="animate-pulse" /> : <Clock size={18} />}
                <span className="text-lg tracking-widest">{formatTime(timeLeft)}</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
             <NetworkIndicator />
            <div onClick={() => setIsDarkMode(!isDarkMode)} className="relative h-10 w-20 rounded-full cursor-pointer p-1 bg-slate-800 border border-slate-700">
                <div className="flex justify-between items-center w-full h-full px-1.5"><Moon size={16} className={isDarkMode ? "text-white" : "text-slate-400"} /><Sun size={16} className={!isDarkMode ? "text-orange-500" : "text-slate-600"} /></div>
                <motion.div layout className={`absolute top-1 bottom-1 w-[34px] rounded-full shadow-sm ${isDarkMode ? 'left-1 bg-slate-600' : 'right-1 bg-white'}`} />
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <AnimatePresence initial={false} mode="wait">
            {sidebarOpen && ( 
                <motion.aside 
                    key="sidebar"
                    initial={{ width: 0, opacity: 0 }} 
                    animate={{ width: 280, opacity: 1 }} 
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="hidden lg:block h-full border-r border-inherit overflow-hidden whitespace-nowrap flex-shrink-0"
                >
                    <QuizAtlas />
                </motion.aside> 
            )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-32 scroll-smooth custom-scrollbar">
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div 
                    key={currentQ._id} 
                    custom={direction} 
                    variants={slideVariants} 
                    initial="enter" 
                    animate="center" 
                    exit="exit" 
                    className="max-w-4xl mx-auto w-full flex flex-col min-h-full"
                >
                        <div className="flex justify-between items-center mb-6">
                            <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>Question {currentQIndex + 1}</span>
                            <div className="flex gap-2">
                                {lockedQuestions.has(currentQ._id) && (
                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                                        <Lock size={12} /> Answered
                                    </span>
                                )}
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase border flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-100 border-amber-200 text-amber-700'}`}>
                                    <Star size={12} fill="currentColor"/> {currentQ.marks} Pts
                                </span>
                            </div>
                        </div>

                        {/* --- QUESTION BOX --- */}
                        <div className={`p-8 md:p-10 rounded-[2rem] mb-8 flex flex-col gap-6 ${t.card}`}>
                            <h2 className="text-xl md:text-3xl font-bold leading-relaxed">{currentQ.questionText}</h2>
                            
                            {currentQ.image && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full relative rounded-2xl overflow-hidden border border-inherit bg-black/5"
                                >
                                    <img 
                                        src={currentQ.image} 
                                        alt="Question Visual" 
                                        className="w-full h-auto max-h-[350px] object-contain mx-auto"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-lg text-white">
                                        <ImageIcon size={14} />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* --- OPTIONS LIST --- */}
                        <div className={useGridLayout ? "grid grid-cols-1 md:grid-cols-2 gap-4 mb-auto" : "space-y-3 mb-auto"}>
                        {currentQ.options.map((opt) => {
                            const isSelected = answers[currentQ._id] === opt._id;
                            const isLocked = lockedQuestions.has(currentQ._id);
                            return (
                                <div 
                                    key={opt._id} 
                                    onClick={() => handleSelect(opt._id)} 
                                    className={`group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all 
                                        ${isSelected ? t.optionActive : t.optionIdle}
                                        ${isLocked ? 'cursor-not-allowed opacity-75 grayscale-[0.3]' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={`font-medium ${isSelected ? t.text : t.textSecondary}`}>{opt.text}</span>
                                </div>
                            )
                        })}
                        </div>

                        {/* --- NAVIGATION --- */}
                        <div className="flex justify-between pt-8 mt-auto pb-4">
                            <button 
                                onClick={() => navigateQuestion(Math.max(0, currentQIndex - 1))} 
                                disabled={currentQIndex === 0} 
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${t.navBtn}`}
                            >
                                <ChevronLeft size={20} /> Prev
                            </button>
                            
                            {currentQIndex === questions.length - 1 ? ( 
                                <button 
                                    onClick={() => {
                                        const currentAnswer = answers[currentQ._id];
                                        if(currentAnswer) {
                                            const timeTaken = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
                                            submitAnswerBackground(currentQ._id, currentAnswer, timeTaken);
                                        }
                                        setIsReviewing(true); 
                                    }} 
                                    className={`px-8 py-3 rounded-xl font-bold ${t.primaryBtn}`}
                                >
                                    Submit
                                </button> 
                            ) : ( 
                                <button 
                                    onClick={() => navigateQuestion(Math.min(questions.length - 1, currentQIndex + 1))} 
                                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold ${t.primaryBtn}`}
                                >
                                    Next <ChevronRight size={20} />
                                </button> 
                            )}
                        </div>
                </motion.div>
            </AnimatePresence>
        </main>
        
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div className="absolute inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0F172A]"><QuizAtlas /></motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 20px; }
      `}} />
    </div>
  );
};

export default QuizActivePage;