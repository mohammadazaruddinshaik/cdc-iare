import React, { useState, useEffect } from 'react';
import { Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';

const TelegramBlocker = ({ children }) => {
    const [debugUA, setDebugUA] = useState('');

    // 1. Run detection IMMEDIATELY (Lazy Initializer)
    const [isBlocked, setIsBlocked] = useState(() => {
        if (typeof window === 'undefined') return false;

        const ua = window.navigator.userAgent; // Keep original case for reading
        const lowerUA = ua.toLowerCase();
        
        // --- DETECTION LOGIC ---

        // 1. iOS Detection (Easy)
        // Telegram iOS explicitly says "Telegram"
        const isIOS = /iphone|ipad|ipod/.test(lowerUA);
        const isTelegramIOS = isIOS && (lowerUA.includes('telegram') || window.TelegramWebviewProxy);

        // 2. Android Detection (Hard)
        const isAndroid = /android/.test(lowerUA);
        
        // THE FIX: 
        // Real Chrome on Android looks like: "... Chrome/100.0.0 Mobile Safari/..."
        // Telegram/WebViews look like: "... Version/4.0 Chrome/100.0.0 Mobile Safari/..."
        // The presence of "wv" OR "version/" is the smoking gun for an in-app browser.
        const isAndroidWebView = isAndroid && (
            lowerUA.includes('wv') || 
            lowerUA.includes('version/') || 
            lowerUA.includes('fban') || // Facebook
            lowerUA.includes('fbav') || // Facebook
            lowerUA.includes('instagram') 
        );

        // 3. Strict Mode: If it's Android but doesn't have "chrome" or "firefox", it's likely a wrapper.
        // (Optional: safer to keep commented out unless the above fails)
        // const isSuspiciousAndroid = isAndroid && !lowerUA.includes('chrome') && !lowerUA.includes('firefox');

        return isTelegramIOS || isAndroidWebView;
    });

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Set Debug UA for visibility
        setDebugUA(window.navigator.userAgent);
        
        if (isBlocked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isBlocked]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // --- RENDER ---

    // 1. If clean browser, show the App
    if (!isBlocked) {
        return children;
    }

    // 2. If blocked, show the "Stop" screen
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 font-sans min-h-[100dvh] overflow-hidden overscroll-none touch-none">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 -z-10"></div>
            
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-rose-100 relative overflow-hidden z-10">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-rose-100">
                    <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">Browser Not Supported</h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                    This browser blocks camera access.
                </p>

                {/* Android-Specific Instruction */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 text-left relative">
                    <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Android Users
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-600 text-xs">1</div>
                            <p className="text-xs font-semibold text-slate-600">
                                Tap the <strong className="text-slate-900">3 dots (⋮)</strong> in the top right.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-600 text-xs">2</div>
                            <p className="text-xs font-semibold text-slate-600">
                                Select <strong className="text-slate-900">Open in Chrome</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <button 
                        onClick={handleCopyLink} 
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? "Link Copied!" : "Copy Link manually"}
                    </button>
                </div>
            </div>

            {/* DEBUG RIBBON: This will help us find the issue if it persists */}
            <div className="absolute bottom-0 left-0 w-full bg-black/80 text-white/50 text-[10px] p-2 break-all font-mono text-center z-0">
                User Agent: {debugUA}
            </div>
        </div>
    );
};

export default TelegramBlocker;