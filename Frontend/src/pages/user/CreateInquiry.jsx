import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getInquirySources } from "../../api/inquirySourceApi";
import { createInquiry as createInquiryApi } from "../../api/inquiryApi";
import { toast } from "react-hot-toast";

export default function CreateInquiry() {
    const navigate = useNavigate();
    const [sources, setSources] = useState([]);
    const [loadingSources, setLoadingSources] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        state: "",
        city: "",
        district: "",
        currentOccupation: "",
        fieldOfOccupation: "",
        businessLocation: "own", // default radio
        inquirySource: "",
        minBudget: "",
        maxBudget: "",
    });

    // Error states for validation
    const [errors, setErrors] = useState({});

    // Fetch Inquiry Source Master values
    useEffect(() => {
        const fetchSources = async () => {
            setLoadingSources(true);
            try {
                const response = await getInquirySources();
                setSources(response.data.data || []);
            } catch (err) {
                console.error("Failed to load inquiry sources from backend:", err);
                // Fallback dummy sources if API fails
                setSources([
                    { id: "s1", source_name: "Google Search" },
                    { id: "s2", source_name: "Social Media" },
                    { id: "s3", source_name: "Referral" },
                    { id: "s4", source_name: "Website" },
                    { id: "s5", source_name: "Newspaper Ad" }
                ]);
            } finally {
                setLoadingSources(false);
            }
        };
        fetchSources();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors for this field as the user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation constraints
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.district.trim()) newErrors.district = "District is required";
        if (!formData.currentOccupation.trim()) newErrors.currentOccupation = "Current occupation is required";
        if (!formData.fieldOfOccupation.trim()) newErrors.fieldOfOccupation = "Field of occupation is required";
        if (!formData.inquirySource) newErrors.inquirySource = "Inquiry source is required";

        const minBudgetVal = Number(formData.minBudget);
        const maxBudgetVal = Number(formData.maxBudget);

        if (!formData.minBudget || isNaN(minBudgetVal)) {
            newErrors.minBudget = "Minimum Budget is required";
        } else if (minBudgetVal < 1000000) {
            newErrors.minBudget = "Minimum Budget must not be less than 10,00,000";
        }

        if (!formData.maxBudget || isNaN(maxBudgetVal)) {
            newErrors.maxBudget = "Maximum Budget is required";
        } else if (maxBudgetVal < 5000000) {
            newErrors.maxBudget = "Maximum Budget must not be less than 50,00,000";
        } else if (minBudgetVal && maxBudgetVal < minBudgetVal) {
            newErrors.maxBudget = "Maximum Budget must be greater than or equal to Minimum Budget";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please resolve the validation errors");
            return;
        }

        // Save inquiry to backend database
        const saveToBackend = async () => {
            try {
                const response = await createInquiryApi({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    state: formData.state,
                    city: formData.city,
                    district: formData.district,
                    currentOccupation: formData.currentOccupation,
                    fieldOfOccupation: formData.fieldOfOccupation,
                    businessLocation: formData.businessLocation,
                    inquirySource: formData.inquirySource,
                    minBudget: minBudgetVal,
                    maxBudget: maxBudgetVal
                });

                if (response.data.success) {
                    toast.success("Inquiry created successfully!");
                    const newId = response.data.data.id;
                    navigate("/user/inquiries", { state: { selectId: newId } });
                } else {
                    toast.error(response.data.message || "Failed to save inquiry");
                }
            } catch (err) {
                console.error("Error saving inquiry to database:", err);
                toast.error(err?.response?.data?.message || "Internal server error. Failed to save inquiry.");
            }
        };
        saveToBackend();
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
            <Navbar title="ERP System" />

            <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                    <div className="bg-[#6804a1] px-6 py-5 text-white flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Create Inquiry</h2>
                            <p className="text-white/70 text-xs mt-1 font-medium">
                                Fill in the details below to log a new prospect inquiry.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/user/inquiries")}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-3.5 rounded-lg border border-white/15 transition-all cursor-pointer focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Inquiries
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {/* Section 1: Basic Information */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.name ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.email ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone Number *</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +91 9988776655"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.phone ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Address Information */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
                                Address & Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="e.g. Maharashtra"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.state ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Mumbai"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.city ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">District *</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        placeholder="e.g. Thane"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.district ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Occupation & Business */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
                                Occupation & Business Setup
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Current Occupation *</label>
                                    <input
                                        type="text"
                                        name="currentOccupation"
                                        value={formData.currentOccupation}
                                        onChange={handleChange}
                                        placeholder="e.g. Businessman, Software Engineer"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.currentOccupation ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.currentOccupation && <p className="text-xs text-red-500 mt-1">{errors.currentOccupation}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Field of Occupation *</label>
                                    <input
                                        type="text"
                                        name="fieldOfOccupation"
                                        value={formData.fieldOfOccupation}
                                        onChange={handleChange}
                                        placeholder="e.g. Retail, Information Technology"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.fieldOfOccupation ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.fieldOfOccupation && <p className="text-xs text-red-500 mt-1">{errors.fieldOfOccupation}</p>}
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="block text-xs font-bold text-slate-600 mb-2">Business Location Setup *</label>
                                <div className="flex gap-6 mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                                        <input
                                            type="radio"
                                            name="businessLocation"
                                            value="own"
                                            checked={formData.businessLocation === "own"}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1]"
                                        />
                                        Own Property
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                                        <input
                                            type="radio"
                                            name="businessLocation"
                                            value="rental"
                                            checked={formData.businessLocation === "rental"}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1]"
                                        />
                                        Rental Property
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Budget & Source */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
                                Inquiry Source & Budget
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Inquiry Source *</label>
                                    <select
                                        name="inquirySource"
                                        value={formData.inquirySource}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer ${
                                            errors.inquirySource ? "border-red-500" : "border-slate-200"
                                        }`}
                                    >
                                        <option value="">Select source...</option>
                                        {sources.map((src) => (
                                            <option key={src.id} value={src.source_name}>
                                                {src.source_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.inquirySource && <p className="text-xs text-red-500 mt-1">{errors.inquirySource}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Minimum Budget *</label>
                                    <input
                                        type="number"
                                        name="minBudget"
                                        value={formData.minBudget}
                                        onChange={handleChange}
                                        placeholder="Min (e.g. 1000000)"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.minBudget ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Must be at least 10,00,000</p>
                                    {errors.minBudget && <p className="text-xs text-red-500 mt-1">{errors.minBudget}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Maximum Budget *</label>
                                    <input
                                        type="number"
                                        name="maxBudget"
                                        value={formData.maxBudget}
                                        onChange={handleChange}
                                        placeholder="Max (e.g. 5000000)"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.maxBudget ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Must be at least 50,00,000</p>
                                    {errors.maxBudget && <p className="text-xs text-red-500 mt-1">{errors.maxBudget}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-100 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/user/inquiries")}
                                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all duration-150 cursor-pointer text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-[#6804a1] hover:bg-[#52037e] text-white font-semibold rounded-xl transition-all duration-200 shadow-md cursor-pointer text-center"
                            >
                                Save Inquiry
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
