import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logoutUser } from "../api/authApi";
import { usePermission } from "../context/PermissionContext";
import toast from "react-hot-toast";
import { getUnreadReminders, markReminderAsRead } from "../api/reminderApi";

const logo = "/Jasmin-Logo.png";


export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [isOpen, setIsOpen] = useState(false);
    const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [prevNotificationIds, setPrevNotificationIds] = useState(new Set());
    const [hasUnseen, setHasUnseen] = useState(false);
    const { hasPermission } = usePermission();

    const fetchNotifications = async () => {
        if (!user.id) return;
        try {
            const res = await getUnreadReminders();
            if (res.data?.success) {
                const newList = res.data.data || [];
                setNotifications(newList);

                // Toast only on updates after initial load
                if (prevNotificationIds.size > 0) {
                    let hasNew = false;
                    newList.forEach(item => {
                        if (!prevNotificationIds.has(item.id)) {
                            hasNew = true;
                            toast.success(`Reminder: ${item.reminder_text}`, {
                                icon: '⏰',
                                duration: 6000
                            });
                            if (Notification.permission === "granted") {
                                new Notification("Jasmin CRM Reminder", {
                                    body: item.reminder_text,
                                    icon: logo
                                });
                            }
                        }
                    });
                    if (hasNew && !isNotificationsOpen) {
                        setHasUnseen(true);
                    }
                } else {
                    if (newList.length > 0 && !isNotificationsOpen) {
                        setHasUnseen(true);
                    }
                }

                const newIds = new Set(newList.map(item => item.id));
                setPrevNotificationIds(newIds);
            }
        } catch (error) {
            console.error("Failed to fetch unread reminders:", error);
        }
    };

    const handleDismissReminder = async (id) => {
        try {
            await markReminderAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setPrevNotificationIds(prev => {
                const updated = new Set(prev);
                updated.delete(id);
                return updated;
            });
        } catch (error) {
            console.error("Failed to dismiss reminder:", error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (user.id) {
            fetchNotifications();
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (isOpen && !e.target.closest("#custom-nav-dropdown")) {
                setIsOpen(false);
            }
            if (isProfileOpen && !e.target.closest("#profile-dropdown")) {
                setIsProfileOpen(false);
            }
            if (isNotificationsOpen && !e.target.closest("#notifications-dropdown")) {
                setIsNotificationsOpen(false);
            }
            if (isApprovalsOpen && !e.target.closest("#approvals-dropdown-container")) {
                setIsApprovalsOpen(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [isOpen, isProfileOpen, isNotificationsOpen]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("loginTime");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    };

    const userModules = user.modules || [];
    const isAdmin = user.role === "admin";

    const allMasters = [
        {
            name: "User Master",
            path: "/admin/dashboard",
            adminOnly: true,
            icon: "fa-solid fa-users-gear",
            color: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
            activeColor: "bg-emerald-100 text-emerald-700",
            desc: "Manage user profiles & account statuses"
        },
        {
            name: "User Types Master",
            path: "/admin/user-types",
            masterKey: "user_type",
            icon: "fa-solid fa-user-shield",
            color: "bg-violet-50 text-violet-600 border border-violet-100/50",
            activeColor: "bg-violet-100 text-violet-700",
            desc: "Configure access roles & permissions"
        },
        {
            name: "Label Master",
            path: "/admin/labels",
            masterKey: "label_master",
            icon: "fa-solid fa-tags",
            color: "bg-pink-50 text-pink-600 border border-pink-100/50",
            activeColor: "bg-pink-100 text-pink-700",
            desc: "Manage system-wide labels"
        },
        {
            name: "Inquiry Source Master",
            path: "/admin/inquiry-sources",
            masterKey: "inquiry_source_master",
            icon: "fa-solid fa-share-nodes",
            color: "bg-cyan-50 text-cyan-600 border border-cyan-100/50",
            activeColor: "bg-cyan-100 text-cyan-700",
            desc: "Manage lead/inquiry sources"
        },
        {
            name: "Company Brand Master",
            path: "/admin/company-brands",
            masterKey: "company_brand_master",
            icon: "fa-solid fa-copyright",
            color: "bg-orange-50 text-orange-600 border border-orange-100/50",
            activeColor: "bg-orange-100 text-orange-700",
            desc: "Manage company brands"
        },
        {
            name: "Document Type Master",
            path: "/admin/documents",
            masterKey: "document_master",
            icon: "fa-solid fa-file-invoice",
            color: "bg-blue-50 text-blue-600 border border-blue-100/50",
            activeColor: "bg-blue-100 text-blue-700",
            desc: "Manage document types"
        },
        {
            name: "Team Role Master",
            path: "/admin/team-roles",
            masterKey: "team_role_master",
            icon: "fa-solid fa-user-tie",
            color: "bg-amber-50 text-amber-600 border border-amber-100/50",
            activeColor: "bg-amber-100 text-amber-700",
            desc: "Manage team roles"
        },
        {
            name: "Call Outcome Master",
            path: "/admin/call-outcomes",
            masterKey: "call_outcome_master",
            icon: "fa-solid fa-phone-slash",
            color: "bg-indigo-50 text-indigo-600 border border-indigo-100/50",
            activeColor: "bg-indigo-100 text-indigo-700",
            desc: "Manage call outcomes"
        }
    ];

    const availableMasters = allMasters.filter(m => {
        if (m.adminOnly) return isAdmin;
        if (m.masterKey) return hasPermission(m.masterKey, "read");
        if (m.module) return isAdmin || userModules.includes(m.module);
        return true;
    });



    return (
        <nav className="bg-white shadow-sm border-b border-slate-200 flex flex-col relative z-50">
            {/* First Row */}
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-40">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Jasmin Logo" className="h-12 w-auto" />
                </div>

                <div className="flex items-center gap-6">
                    {/* Notification Dropdown */}
                    <div className="relative" id="notifications-dropdown">
                        <button
                            onClick={() => {
                                setIsNotificationsOpen(!isNotificationsOpen);
                                if (!isNotificationsOpen) {
                                    setHasUnseen(false);
                                }
                            }}
                            className="text-slate-500 hover:text-indigo-600 transition-colors relative cursor-pointer focus:outline-none flex items-center justify-center p-1.5 rounded-full hover:bg-slate-50"
                            title="Notifications"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                            {hasUnseen && notifications.length > 0 && (
                                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* Header */}
                                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-800">Active Reminders</h3>
                                    {notifications.length > 0 && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                            {notifications.length} active
                                        </span>
                                    )}
                                </div>

                                {/* List */}
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8 text-slate-300 mx-auto mb-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.961 8.961 0 0 1-2.3-5.523m5.455 1.31s.515-3.064 1.391-4.882c.114-.236.29-.452.508-.606a5.976 5.976 0 0 1 7.98 0c.218.154.394.37.508.606.876 1.818 1.391 4.882 1.391 4.882M18.857 17.082a23.848 23.848 0 0 0 5.454-1.31 8.962 8.962 0 0 0-2.3-5.523m-3.15 11.33c.705-1.666 1.346-3.707 1.346-5.81a8.95 8.95 0 0 0-1.347-4.882M18.857 17.082a24.257 24.257 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M9 9h.008v.008H9V9Zm3 0h.008v.008H12V9Zm3 0h.008v.008H15V9Z" />
                                            </svg>
                                            <p className="text-xs text-slate-500">No active reminders</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => {
                                            const timeString = notif.reminder_time.slice(0, 5); // HH:MM
                                            const dateString = new Date(notif.reminder_date).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric'
                                            });

                                            return (
                                                <div key={notif.id} className="p-3 hover:bg-slate-50 flex items-start gap-2.5 transition-colors group">
                                                    {/* Indicator */}
                                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                                                    
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-700 font-medium break-words">
                                                            {notif.reminder_text}
                                                        </p>
                                                        {notif.inquiry_name && (
                                                            <button
                                                                onClick={() => {
                                                                    setIsNotificationsOpen(false);
                                                                    navigate("/user/inquiries");
                                                                }}
                                                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline mt-1 block text-left"
                                                            >
                                                                Inquiry: {notif.inquiry_name}
                                                            </button>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {dateString} at {timeString}
                                                        </span>
                                                    </div>

                                                    {/* Dismiss button */}
                                                    <button
                                                        onClick={() => handleDismissReminder(notif.id)}
                                                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-100 transition-all shrink-0 cursor-pointer self-center"
                                                        title="Mark as read"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Profile Dropdown */}
                    <div className="relative" id="profile-dropdown">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer focus:outline-none"
                            title="User menu"
                        >
                            {/* Profile Avatar Icon */}
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm">
                                {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <span className="hidden sm:inline text-sm font-semibold text-slate-700">{user.name || "User"}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* User Info Header */}
                                <div className="px-4 py-2.5 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name || "User"}</p>
                                    {user.email && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                                    )}
                                </div>

                                {/* Menu Items */}
                                <div className="px-1.5 py-1">
                                    <button
                                        onClick={() => {
                                            navigate("/profile");
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all duration-150 cursor-pointer text-left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        Your Profile
                                    </button>
                                </div>

                                <div className="border-t border-slate-100 my-1"></div>

                                <div className="px-1.5 py-1">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-semibold transition-all duration-150 cursor-pointer text-left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-red-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.75 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Second Row: Custom Navigation & Master Dropdown */}
            {user.role && (
                <div className="bg-[#6804a1] border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-0 flex flex-wrap items-center gap-4">
                    <div className="flex items-center relative z-30" id="custom-nav-dropdown">
                        {/* User Dashboard Tab */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    navigate("/user/home");
                                }}
                                className={`flex items-center justify-between w-40 px-4 py-2.5 text-sm border-r border-l border-white/10 rounded-none focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${
                                    location.pathname === "/user/home" ? "bg-white/15" : "bg-[#6804a1] hover:bg-white/5"
                                }`}
                            >
                                <span className="flex items-center gap-2.5 truncate mx-auto">
                                    <span className="font-semibold text-white truncate">User Dashboard</span>
                                </span>
                            </button>
                        </div>

                        {/* Inquiry Tab */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    navigate("/user/inquiries");
                                }}
                                className={`flex items-center justify-between w-40 px-4 py-2.5 text-sm border-r border-white/10 rounded-none focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${
                                    location.pathname === "/user/inquiries" ? "bg-white/15" : "bg-[#6804a1] hover:bg-white/5"
                                }`}
                            >
                                <span className="flex items-center gap-2.5 truncate mx-auto">
                                    <span className="font-semibold text-white truncate">Inquiry</span>
                                </span>
                            </button>
                        </div>

                        {/* In Process Franchise Tab */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    navigate("/user/in-process-franchises");
                                }}
                                className={`flex items-center justify-between w-48 px-4 py-2.5 text-sm border-r border-white/10 rounded-none focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${
                                    location.pathname.startsWith("/user/in-process-franchises") ? "bg-white/15" : "bg-[#6804a1] hover:bg-white/5"
                                }`}
                            >
                                <span className="flex items-center gap-2.5 truncate mx-auto">
                                    <span className="font-semibold text-white truncate">In Process Franchise</span>
                                </span>
                            </button>
                        </div>

                        {/* Franchise Tab */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    navigate("/user/franchises");
                                }}
                                className={`flex items-center justify-between w-40 px-4 py-2.5 text-sm border-r border-white/10 rounded-none focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${
                                    location.pathname.startsWith("/user/franchises") ? "bg-white/15" : "bg-[#6804a1] hover:bg-white/5"
                                }`}
                            >
                                <span className="flex items-center gap-2.5 truncate mx-auto">
                                    <span className="font-semibold text-white truncate">Franchise</span>
                                </span>
                            </button>
                        </div>

                        {/* Approvals Dropdown */}
                        {isAdmin && (
                            <div className="relative" id="approvals-dropdown-container">
                                <button
                                    onClick={() => setIsApprovalsOpen(!isApprovalsOpen)}
                                    className={`flex items-center justify-between w-40 px-4 py-2.5 text-sm border-r border-white/10 rounded-none focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${
                                        isApprovalsOpen || location.pathname.startsWith("/admin/store-details-approval") || location.pathname.startsWith("/admin/deposit-stock-approval") ? "bg-white/15" : "bg-[#6804a1] hover:bg-white/5"
                                    }`}
                                >
                                    <span className="flex items-center gap-2.5 truncate mx-auto">
                                        <span className="font-semibold text-white truncate">Approvals</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2.5}
                                            stroke="currentColor"
                                            className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isApprovalsOpen ? "rotate-180 text-white" : ""}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </span>
                                </button>

                                {isApprovalsOpen && (
                                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex flex-col gap-1.5">
                                            <button
                                                onClick={() => {
                                                    navigate("/admin/store-details-approval");
                                                    setIsApprovalsOpen(false);
                                                }}
                                                className={`relative group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left border border-transparent ${
                                                    location.pathname === "/admin/store-details-approval"
                                                        ? "bg-indigo-50/70 text-indigo-700 font-semibold border-indigo-100/50"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                                                }`}
                                            >
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm shrink-0 ${
                                                    location.pathname === "/admin/store-details-approval" ? "bg-indigo-100/80 text-indigo-700" : "bg-slate-100/80 text-slate-500 group-hover:scale-105"
                                                }`}>
                                                    <i className="fa-solid fa-store text-xs"></i>
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-semibold leading-snug py-0.5 transition-colors whitespace-normal break-words ${
                                                        location.pathname === "/admin/store-details-approval" ? "text-indigo-900 font-bold" : "text-slate-800 group-hover:text-slate-950"
                                                    }`}>
                                                        Store Details Approval
                                                    </p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    navigate("/admin/deposit-stock-approval");
                                                    setIsApprovalsOpen(false);
                                                }}
                                                className={`relative group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left border border-transparent ${
                                                    location.pathname === "/admin/deposit-stock-approval"
                                                        ? "bg-indigo-50/70 text-indigo-700 font-semibold border-indigo-100/50"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                                                }`}
                                            >
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm shrink-0 ${
                                                    location.pathname === "/admin/deposit-stock-approval" ? "bg-indigo-100/80 text-indigo-700" : "bg-slate-100/80 text-slate-500 group-hover:scale-105"
                                                }`}>
                                                    <i className="fa-solid fa-file-invoice text-xs"></i>
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-semibold leading-snug py-0.5 transition-colors whitespace-normal break-words ${
                                                        location.pathname === "/admin/deposit-stock-approval" ? "text-indigo-900 font-bold" : "text-slate-800 group-hover:text-slate-950"
                                                    }`}>
                                                        Deposit & Stock Approval
                                                    </p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Masters Dropdown */}
                        {availableMasters.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className={`flex items-center justify-between w-40 px-4 py-2.5 text-sm border-r border-white/10 rounded-none focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${
                                        isOpen ? "bg-white/15" : "bg-[#6804a1] hover:bg-white/5"
                                    }`}
                                >
                                    <span className="flex items-center gap-2.5 truncate mx-auto">
                                        <span className="font-semibold text-white truncate">Masters</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2.5}
                                            stroke="currentColor"
                                            className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex flex-col gap-1.5">
                                            {availableMasters.map((m, idx) => {
                                                const isActive = location.pathname === m.path;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            navigate(m.path);
                                                            setIsOpen(false);
                                                        }}
                                                        className={`relative group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left border border-transparent ${isActive
                                                            ? "bg-indigo-50/70 text-indigo-700 font-semibold border-indigo-100/50"
                                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                                                            }`}
                                                    >
                                                        {/* Side Highlight Bar */}
                                                        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md transition-all duration-200 ${isActive ? "bg-indigo-600 scale-y-100" : "bg-transparent scale-y-0 group-hover:scale-y-50 group-hover:bg-slate-300"
                                                            }`} />

                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm shrink-0 ${isActive ? "bg-indigo-100/80 text-indigo-700" : "bg-slate-100/80 text-slate-500 group-hover:scale-105"
                                                            }`}>
                                                            <i className={`${m.icon || "fa-solid fa-folder"} text-xs`}></i>
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className={`text-sm font-semibold leading-snug py-0.5 transition-colors whitespace-normal break-words ${isActive ? "text-indigo-900 font-bold" : "text-slate-800 group-hover:text-slate-950"
                                                                }`}>
                                                                {m.name}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
