import React, { useState, useEffect } from 'react';
import { Copy, Check, Globe, AlertTriangle, ExternalLink } from 'lucide-react';

const TelegramBlocker = ({ children }) => {
    // 1. Run detection IMMEDIATELY (before render) to prevent "flashing" the broken app
    const [isBlocked, setIsBlocked] = useState(() => {
        if (typeof window === 'undefined') return false; // Server-side safety

        const ua = window.navigator.userAgent.toLowerCase();
        
        // --- DETECTION LOGIC ---
        
        // 1. Telegram specific (mostly iOS/Desktop)
        const isTelegram = ua.includes('telegram') || window.TelegramWebviewProxy !== undefined;
        
        // 2. Generic Android WebView (Critical for Telegram Android)
        // Standard Chrome on Android does NOT contain "wv" or "version/x.x" combined with Chrome
        const isAndroidWebView = /android/.test(ua) && (/wv/.test(ua) || /version\//.test(ua));

        // 3. Instagram/Facebook/Messenger (just in case)
        const isMeta = ua.includes('instagram') || ua.includes('fbav') || ua.includes('fban');

        // Block if any of these are true
        return isTelegram || isAndroidWebView || isMeta;
    });

    const [copied, setCopied] = useState(false);

    // Lock scroll if blocked so they can't swipe away easily
    useEffect(() => {
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
            
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-rose-100 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-rose-100">
                    <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">Browser Not Supported</h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                    Telegram's browser breaks the camera and location features.
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
                                Tap the <strong className="text-slate-900">3 dots (⋮)</strong> in the top right corner.
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
                    <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
                        Paste in Chrome or Safari
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TelegramBlocker;