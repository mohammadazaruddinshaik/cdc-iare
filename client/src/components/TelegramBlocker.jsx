import React, { useState, useEffect } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

const TelegramBlocker = ({ children }) => {
    const [debugUA, setDebugUA] = useState('');
    
    // --- STATE INITIALIZATION ---
    const [isBlocked, setIsBlocked] = useState(() => {
        if (typeof window === 'undefined') return false;

        const ua = window.navigator.userAgent.toLowerCase();
        const referrer = document.referrer ? document.referrer.toLowerCase() : '';

        // 1. CHECK USER AGENT (Standard)
        const isTelegramUA = ua.includes('telegram') || ua.includes('tg/');
        
        // 2. CHECK REFERRER (New: Did they come from the app?)
        // Telegram often leaves a referrer like "android-app://org.telegram.messenger"
        const isTelegramReferrer = referrer.includes('telegram') || referrer.includes('org.telegram');

        // 3. CHECK WEBVIEW SIGNATURES (Android)
        // "wv" = WebView. "Version/" is also a strong indicator of WebView on Android.
        const isAndroidWebView = /android/.test(ua) && (/wv/.test(ua) || /version\//.test(ua));

        return isTelegramUA || isTelegramReferrer || isAndroidWebView;
    });

    const [copied, setCopied] = useState(false);

    // --- EFFECT: WATCH FOR LATE INJECTION ---
    useEffect(() => {
        setDebugUA(navigator.userAgent); // For debugging

        // Telegram sometimes injects its proxy object 1-2 seconds AFTER load.
        // We poll for it briefly.
        const interval = setInterval(() => {
            if (window.TelegramWebviewProxy !== undefined) {
                setIsBlocked(true);
                clearInterval(interval);
            }
        }, 500);

        // Stop checking after 5 seconds to save resources
        const timeout = setTimeout(() => clearInterval(interval), 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // Lock Scroll if blocked
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
        } catch (err) { console.error(err); }
    };

    // --- RENDER ---

    if (!isBlocked) {
        // RENDER THE APP (But keep the debug ribbon visible for you to check)
        return (
            <>
                {children}
                {/* KEEP THIS DEBUG BAR VISIBLE TEMPORARILY.
                   Ask a student to send a screenshot of this bar if it STILL fails.
                */}
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, 
                    background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '10px', 
                    padding: '8px', zIndex: 99999, pointerEvents: 'none', textAlign: 'center'
                }}>
                    DEBUG: {debugUA} | Ref: {document.referrer}
                </div>
            </>
        );
    }

    // BLOCK SCREEN
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 font-sans min-h-[100dvh] overflow-hidden overscroll-none touch-none">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-rose-100 relative overflow-hidden z-10">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-rose-100">
                    <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">Browser Not Supported</h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                    Please open in Chrome to use the Camera.
                </p>

                <div className="relative group">
                    <button onClick={handleCopyLink} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-95 flex items-center justify-center gap-2">
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider">Paste in Chrome</p>
                </div>
            </div>
        </div>
    );
};

export default TelegramBlocker;