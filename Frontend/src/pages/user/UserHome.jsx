import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getInProcessFranchises } from "../../api/inProcessFranchiseApi";
import { getUnreadReminders, markReminderAsRead } from "../../api/reminderApi";
import toast from "react-hot-toast";

export default function UserHome() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin" || user.role === "super admin";

    const [franchises, setFranchises] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loadingFranchises, setLoadingFranchises] = useState(false);
    const [loadingReminders, setLoadingReminders] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

    const loadDashboardData = async () => {
        setLoadingFranchises(true);
        try {
            const res = await getInProcessFranchises();
            setFranchises(res.data.data || []);
        } catch (err) {
            console.error("Failed to load in process franchises:", err);
            toast.error("Failed to load franchises.");
        } finally {
            setLoadingFranchises(false);
        }

        setLoadingReminders(true);
        try {
            const res = await getUnreadReminders();
            setReminders(res.data.data || []);
        } catch (err) {
            console.error("Failed to load reminders:", err);
        } finally {
            setLoadingReminders(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleMarkAsRead = async (reminderId) => {
        try {
            await markReminderAsRead(reminderId);
            toast.success("Reminder marked as read");
            setReminders(prev => prev.filter(r => r.id !== reminderId));
        } catch (err) {
            console.error("Failed to mark reminder as read:", err);
            toast.error("Failed to update reminder.");
        }
    };

    const displayedFranchises = franchises.slice(0, 4);
    const displayedReminders = reminders.slice(0, 3);

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar title="CRM Dashboard" />

            {/* Main Content Container */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#6804a1] to-[#45026c] rounded-2xl p-4 sm:p-5 shadow-md text-white mb-6 transition-all hover:shadow-lg">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="relative z-10">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Welcome back, {user.name || "Guest"}!
                        </h1>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    
                    {/* Left & Middle: In-Process Franchises */}
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex-1 flex flex-col justify-between">
                            <div>
                                <div className="mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 text-purple-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                            </svg>
                                            In-Process Franchises
                                        </h2>
                                        <p className="text-slate-500 text-xs mt-1">
                                            {isAdmin ? "Showing all franchises currently in onboarding phase" : "Showing franchises created or assigned to you"}
                                        </p>
                                    </div>
                                </div>

                                {loadingFranchises ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : displayedFranchises.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayedFranchises.map((franchise) => (
                                            <div
                                                key={franchise.id}
                                                onClick={() => navigate(`/user/in-process-franchises/${franchise.id}`)}
                                                className="group flex flex-col justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 relative overflow-hidden"
                                            >
                                                {/* Top Subtle Border highlight */}
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500 group-hover:to-indigo-500 transition-all duration-300" />
                                                
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors line-clamp-1">
                                                            {franchise.partner_name}
                                                        </h3>
                                                        {franchise.store_name && (
                                                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                                                {franchise.store_name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                                                        {/* Email */}
                                                        <div className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                            </svg>
                                                            <span className="truncate">{franchise.partner_email || "N/A"}</span>
                                                        </div>
                                                        {/* Mobile */}
                                                        <div className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                                            </svg>
                                                            <span>{franchise.partner_mobile}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>City: <strong className="text-slate-700">{franchise.city}</strong></span>
                                                    <span className="text-purple-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                        View Stage
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-slate-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
                                        </svg>
                                        <p className="text-xs">No In-Process Franchises found.</p>
                                    </div>
                                )}
                            </div>

                            {franchises.length > 4 && (
                                <div className="mt-6 text-center border-t border-slate-100 pt-4 flex items-center justify-center">
                                    <button
                                        onClick={() => navigate('/user/in-process-franchises')}
                                        className="px-5 py-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all cursor-pointer hover:shadow-sm flex items-center gap-1.5"
                                    >
                                        View More ({franchises.length - 4} more)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Reminders */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 text-purple-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.04 9.04 0 0 1-1.801 1.344 6.4 6.4 0 0 1-5.52.036 9.028 9.028 0 0 1-1.653-1.022A1.85 1.85 0 0 0 5 18.068V19.5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-1.432a1.85 1.85 0 0 0-.583-1.347ZM12 2.25c-3.728 0-6.75 3.022-6.75 6.75v3.45a9.023 9.023 0 0 1-.954 4.027c-.23.424-.078.956.34 1.182A.92.92 0 0 0 5.068 17.7h13.864a.92.92 0 0 0 .432-.12c.42-.227.57-.76.34-1.183a9.022 9.022 0 0 1-.954-4.027V9c0-3.728-3.022-6.75-6.75-6.75Z" />
                                    </svg>
                                    Reminders
                                </h2>
                                <p className="text-slate-500 text-xs mt-1">
                                    Your unread follow-up and inquiry reminders
                                </p>
                            </div>

                            {loadingReminders ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : reminders.length > 0 ? (
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                    {displayedReminders.map((reminder) => {
                                        return (
                                            <div
                                                key={reminder.id}
                                                className="p-4 rounded-xl border transition-all flex items-start gap-3 relative group bg-[#fcfaff]/50 border-purple-100/70"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                                        <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800">
                                                            Reminder
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {formatDate(reminder.reminder_date)} ({reminder.reminder_time})
                                                        </span>
                                                    </div>
                                                    {reminder.inquiry_name && (
                                                        <div className="text-[11px] text-slate-500 font-bold mb-1">
                                                            Inquiry: <span className="text-slate-800">{reminder.inquiry_name}</span>
                                                        </div>
                                                    )}
                                                    <p className="text-slate-700 text-xs font-semibold leading-relaxed break-words">
                                                        {reminder.reminder_text}
                                                    </p>
                                                    {reminder.inquiry_id && (
                                                        <button 
                                                            onClick={() => navigate('/user/inquiries', { state: { selectId: reminder.inquiry_id } })}
                                                            className="mt-2 text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-0.5"
                                                        >
                                                            Go to Inquiry
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleMarkAsRead(reminder.id)}
                                                    className="flex w-6 h-6 items-center justify-center rounded-md border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50 text-slate-400 hover:text-purple-600 shadow-sm cursor-pointer transition-colors"
                                                    title="Mark as Read"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-slate-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                    </svg>
                                    <p className="text-xs">No active reminders today!</p>
                                </div>
                            )}
                        </div>

                        {reminders.length > 3 && (
                            <div className="mt-4 text-center border-t border-slate-100 pt-3">
                                <button
                                    onClick={() => setIsReminderModalOpen(true)}
                                    className="w-full py-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-all cursor-pointer hover:shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    View More ({reminders.length - 3} more)
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Reminders List Modal */}
            {isReminderModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100">
                        {/* Modal Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">All Reminders</h3>
                                <p className="text-xs text-purple-100/80">List of all active reminders set on inquiries</p>
                            </div>
                            <button
                                onClick={() => setIsReminderModalOpen(false)}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {reminders.map((reminder) => {
                                return (
                                    <div
                                        key={reminder.id}
                                        className="p-4 rounded-xl border transition-all flex items-start gap-3 relative group bg-[#fcfaff]/50 border-purple-100/70"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                                <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800">
                                                    Reminder
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium">
                                                    {formatDate(reminder.reminder_date)} ({reminder.reminder_time})
                                                </span>
                                            </div>
                                            {reminder.inquiry_name && (
                                                <div className="text-[11px] text-slate-500 font-bold mb-1">
                                                    Inquiry: <span className="text-slate-800">{reminder.inquiry_name}</span>
                                                </div>
                                            )}
                                            <p className="text-slate-700 text-xs font-semibold leading-relaxed break-words">
                                                {reminder.reminder_text}
                                            </p>
                                            {reminder.inquiry_id && (
                                                <button 
                                                    onClick={() => {
                                                        setIsReminderModalOpen(false);
                                                        navigate('/user/inquiries', { state: { selectId: reminder.inquiry_id } });
                                                    }}
                                                    className="mt-2 text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-0.5"
                                                >
                                                    Go to Inquiry
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleMarkAsRead(reminder.id)}
                                            className="flex w-6 h-6 items-center justify-center rounded-md border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50 text-slate-400 hover:text-purple-600 shadow-sm cursor-pointer transition-colors"
                                            title="Mark as Read"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setIsReminderModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

