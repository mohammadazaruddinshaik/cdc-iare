import React from 'react';
import { WifiOff, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// --- FLEXIBLE ERROR COMPONENT ---
const ErrorDisplay = ({ 
    type = 'offline', // 'offline' | 'api' | 'lockout'
    title, 
    message, 
    onRetry 
}) => {
    
    // Config based on error type
    const config = {
        offline: {
            icon: WifiOff,
            color: 'text-red-500',
            bg: 'bg-red-50',
            pulse: 'bg-red-100',
            defaultTitle: 'Connection Lost',
            defaultMsg: 'We cannot verify your session integrity. Please check your network connection.'
        },
        api: {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            pulse: 'bg-amber-100',
            defaultTitle: 'System Error',
            defaultMsg: 'We encountered an issue connecting to the server.'
        },
        lockout: {
            icon: XCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            pulse: 'bg-rose-100',
            defaultTitle: 'Access Denied',
            defaultMsg: 'You have been locked out due to a violation of contest rules.'
        }
    };

    const activeConfig = config[type] || config.offline;
    const Icon = activeConfig.icon;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Icon Circle */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative ${activeConfig.bg}`}>
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${activeConfig.pulse}`}></div>
                    <Icon className={`${activeConfig.color} w-10 h-10 relative z-10`} strokeWidth={2} />
                </div>
                
                {/* Text Content */}
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    {title || activeConfig.defaultTitle}
                </h2>
                
                <p className="text-slate-500 font-medium mb-8 leading-relaxed px-4">
                    {message || activeConfig.defaultMsg}
                </p>

                {/* Action Button (Only show if onRetry is provided, or if it's offline show waiting status) */}
                {type === 'offline' ? (
                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 rounded-xl text-slate-600 text-sm font-bold animate-pulse">
                        <WifiOff size={16} />
                        <span>Waiting for network...</span>
                    </div>
                ) : (
                    onRetry && (
                        <button 
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                        >
                            <RefreshCw size={16} />
                            <span>Try Again</span>
                        </button>
                    )
                )}
            </motion.div>
        </div>
    );
};

export default ErrorDisplay;