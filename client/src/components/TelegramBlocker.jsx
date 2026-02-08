import React, { useState, useEffect } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, Globe } from 'lucide-react';

const TelegramBlocker = ({ children }) => {
    const [isTelegram, setIsTelegram] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        // Detect Telegram in User-Agent or specific Telegram Webview objects
        const isTg = ua.includes('telegram') || window.TelegramWebviewProxy !== undefined;
        
        if (isTg) {
            setIsTelegram(true);
            // Prevent scrolling on the blocker screen
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // If NOT Telegram, render the app normally
    if (!isTelegram) {
        return children;
    }

    // If Telegram, render the blocking screen
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in font-sans min-h-[100dvh]">
            {/* Background Effects matching your app theme */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 -z-10"></div>
            
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-blue-50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-3">External Browser Required</h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                    This application does not support the Telegram in-app browser. Please use <strong className="text-slate-800">Chrome</strong>, <strong className="text-slate-800">Safari</strong>, or your default browser.
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">How to open:</p>
                    
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">1</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 leading-snug">
                            Tap the <strong className="text-slate-900">3 dots (⋮)</strong> in the top corner of this screen.
                        </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">2</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 leading-snug">
                            Select <strong className="text-slate-900">Open in Chrome</strong> or <strong className="text-slate-900">Open in Browser</strong>.
                        </p>
                    </div>
                </div>

                <div className="relative group">
                    <button 
                        onClick={handleCopyLink} 
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? "Link Copied!" : "Copy Link to Clipboard"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TelegramBlocker;