import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getInquiries } from "../../api/inquiryApi";

export default function Inquiries() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [inquiries, setInquiries] = useState([]);

    const [loading, setLoading] = useState(false);

    // Fetch inquiries from database
    const loadInquiries = async () => {
        setLoading(true);
        try {
            const response = await getInquiries();
            const dataList = response.data.data || [];
            
            // Map database keys to state model
            const mapped = dataList.map(inq => ({
                id: inq.id,
                name: inq.name,
                detail: inq.phone,
                email: inq.email,
                phone: inq.phone,
                state: inq.state,
                city: inq.city,
                district: inq.district,
                currentOccupation: inq.current_occupation,
                fieldOfOccupation: inq.field_of_occupation,
                businessLocation: inq.business_location,
                inquirySource: inq.inquiry_source,
                minBudget: Number(inq.min_budget),
                maxBudget: Number(inq.max_budget)
            }));
            
            setInquiries(mapped);

            // Select auto redirect ID or default to first
            if (location.state?.selectId) {
                const autoSelect = mapped.find(inq => inq.id === location.state.selectId);
                if (autoSelect) {
                    setSelectedInquiry(autoSelect);
                }
                navigate(location.pathname, { replace: true, state: {} });
            } else if (mapped.length > 0) {
                setSelectedInquiry(mapped[0]);
            }
        } catch (err) {
            console.error("Failed to load inquiries from database:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInquiries();
    }, [location.state, navigate, location.pathname]);

    // Filter inquiries based on search input
    const filteredInquiries = inquiries.filter(inquiry => {
        const query = searchQuery.toLowerCase();
        return (
            inquiry.name.toLowerCase().includes(query) ||
            inquiry.detail.toLowerCase().includes(query) ||
            (inquiry.email && inquiry.email.toLowerCase().includes(query)) ||
            (inquiry.city && inquiry.city.toLowerCase().includes(query))
        );
    });

    // Ensure the first filtered item is selected if current selection is filtered out
    useEffect(() => {
        if (filteredInquiries.length > 0) {
            const isStillPresent = filteredInquiries.some(inq => inq.id === selectedInquiry?.id);
            if (!isStillPresent) {
                setSelectedInquiry(filteredInquiries[0]);
            }
        } else {
            setSelectedInquiry(null);
        }
    }, [searchQuery, inquiries]);

    const getInitials = (name) => {
        if (!name) return "?";
        return name.trim().charAt(0).toUpperCase();
    };

    const formatCurrency = (val) => {
        if (!val) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Navigation Header */}
            <Navbar title="ERP System" />

            {/* Main CRM Workspace (2-Column Setup) */}
            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
                
                {/* Left Column: Inquiry list with Search & Create Button */}
                <div className="w-80 md:w-96 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col overflow-hidden">
                    
                    {/* Top Section: Action Button */}
                    <div className="p-4 pb-2">
                        <button
                            onClick={() => navigate("/user/inquiries/create")}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#6804a1] hover:bg-[#52037e] text-white font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Inquiry
                        </button>
                    </div>

                    {/* Search Input Box */}
                    <div className="px-4 py-2">
                        <div className="relative flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="absolute left-4 w-5 h-5 text-slate-400"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search name, phone, email, city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder-slate-400 transition-all duration-150"
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
                                <span className="text-xs font-semibold text-slate-400 mt-3">Loading inquiries...</span>
                            </div>
                        ) : filteredInquiries.length > 0 ? (
                            filteredInquiries.map((inquiry) => {
                                const isSelected = selectedInquiry?.id === inquiry.id;
                                return (
                                    <div
                                        key={inquiry.id}
                                        onClick={() => setSelectedInquiry(inquiry)}
                                        className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                                            isSelected
                                                ? "bg-indigo-50/80 border-indigo-200/80 shadow-xs"
                                                : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-[#d4b24f]/15 border border-[#d4b24f]/25 text-[#a37e1a] flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                                            {getInitials(inquiry.name)}
                                        </div>

                                        {/* Contact Meta */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 truncate">
                                                {inquiry.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                                {inquiry.detail}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-slate-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                <span className="text-xs font-semibold">No inquiries found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Display Details / Action Workspace */}
                <div className="flex-1 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col overflow-hidden">
                    {selectedInquiry ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Profile Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[#d4b24f]/15 border border-[#d4b24f]/25 text-[#a37e1a] flex items-center justify-center font-bold text-2xl shadow-xs">
                                        {getInitials(selectedInquiry.name)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">{selectedInquiry.name}</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{selectedInquiry.inquirySource || "Direct Lead"}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedInquiry(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Detailed Fields Grid */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                                {/* Basic Info Section */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                                        Personal & Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                                            <span className="text-sm font-semibold text-slate-800 break-all">{selectedInquiry.email || "N/A"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.phone || "N/A"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inquiry Source</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.inquirySource || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Info Section */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                                        Location Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">State</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.state || "N/A"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">City</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.city || "N/A"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">District</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.district || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Occupation & Setup Info Section */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                                        Occupation & Business Profile
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Occupation</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.currentOccupation || "N/A"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Field of Occupation</span>
                                            <span className="text-sm font-semibold text-slate-800">{selectedInquiry.fieldOfOccupation || "N/A"}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Business Setup</span>
                                            <span className="text-sm font-semibold text-slate-800 capitalize">
                                                {selectedInquiry.businessLocation === "own" ? "Own Property" : selectedInquiry.businessLocation === "rental" ? "Rental Property" : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Info Section */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                                        Budget Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Minimum Budget</span>
                                            <span className="text-lg font-bold text-emerald-700">{formatCurrency(selectedInquiry.minBudget)}</span>
                                        </div>
                                        <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                                            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block mb-1">Maximum Budget</span>
                                            <span className="text-lg font-bold text-violet-700">{formatCurrency(selectedInquiry.maxBudget)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
                            <span className="text-slate-600 font-semibold text-base">
                                Select a contact from the list
                            </span>
                            <span className="text-slate-400 text-sm mt-1">
                                to view details, log calls, set reminders, and send messages.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
