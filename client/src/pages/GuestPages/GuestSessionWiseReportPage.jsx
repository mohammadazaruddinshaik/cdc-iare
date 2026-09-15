import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3, Download, GraduationCap, Loader2, FileText } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const backendUrl = import.meta.env.VITE_BASE_URL;
const sessions = [
    { value: 'FN', label: 'Forenoon' },
    { value: 'AN', label: 'Afternoon' },
];

const getTodayISO = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const normalizeSemester = (value) => String(value ?? '').replace(/[-_\s]*SEM(ESTER)?$/i, '').trim();

const GuestSessionWiseReportPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [semester, setSemester] = useState('');
    const [date, setDate] = useState(getTodayISO());
    const [session, setSession] = useState('FN');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const semesterOptions = useMemo(() => {
        const assigned = Array.isArray(user?.sem) ? user.sem : [user?.sem];
        return [...new Set(assigned.map(normalizeSemester).filter(Boolean))];
    }, [user?.sem]);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        setSemester((current) => current || semesterOptions[0] || '');
    }, [user, navigate, semesterOptions]);

    const handleDownload = async (event) => {
        event.preventDefault();
        if (!semester || !date || !session) {
            setMessage({ type: 'error', text: 'Choose a semester, date and session.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const params = new URLSearchParams({ semname: semester, date, session });
            const response = await fetch(
                `${backendUrl}/api/guest_faculty/download-session-report-pdf?${params.toString()}`,
                { method: 'GET', credentials: 'include' }
            );

            if (response.status === 401 || response.status === 403) {
                logout();
                return;
            }

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || 'No report was found for these selections.');
            }

            const blob = await response.blob();
            if (!blob.size) throw new Error('The server returned an empty report.');

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Session-Report_${semester}_${session}_${date}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: 'Session report downloaded successfully.' });
        } catch (error) {
            console.error('Guest session report download error:', error);
            setMessage({ type: 'error', text: error.message || 'Report download failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E5E7EB] text-slate-900">
            <header className="rounded-b-[2rem] bg-gradient-to-br from-[#071225] via-[#0A1B3A] to-[#071225] px-4 pb-6 shadow-2xl sm:px-6 lg:px-8">
                <Header animate />
            </header>

            <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <button
                    type="button"
                    onClick={() => navigate('/guest/dashboard')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to dashboard
                </button>

                <div className="w-full">
                    <form onSubmit={handleDownload} className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 sm:p-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Download Session Report</h1>
                                <p className="text-sm text-slate-500">Select details to generate your PDF</p>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <GraduationCap className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                    Semester
                                </span>
                                <select
                                    value={semester}
                                    onChange={(event) => setSemester(event.target.value)}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                >
                                    <option value="" disabled>Select semester</option>
                                    {semesterOptions.map((option) => <option key={option} value={option}>Semester {option}</option>)}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                    Date
                                </span>
                                <input
                                    type="date"
                                    value={date}
                                    max={getTodayISO()}
                                    onChange={(event) => setDate(event.target.value)}
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </label>

                            <fieldset>
                                <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Clock3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                    Session
                                </legend>
                                <div className="grid h-11 grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                                    {sessions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setSession(option.value)}
                                            className={`rounded-lg text-xs font-semibold transition ${session === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            {option.value}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        </div>

                        {message.text && (
                            <p className={`mt-5 rounded-lg px-3 py-2 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`} role="status">
                                {message.text}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !semester}
                            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#071225] px-5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A1B3A] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                            {isLoading ? 'Generating report...' : 'Download PDF'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default GuestSessionWiseReportPage;