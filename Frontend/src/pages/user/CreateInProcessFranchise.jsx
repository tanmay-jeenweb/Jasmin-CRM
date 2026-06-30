import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createInProcessFranchise, getActiveUsers } from "../../api/inProcessFranchiseApi";
import { getCompanyBrands } from "../../api/companyBrandApi";
import { toast } from "react-hot-toast";

export default function CreateInProcessFranchise() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [companyBrands, setCompanyBrands] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        partnerName: "",
        partnerMobile: "",
        partnerEmail: "",
        city: "",
        district: "",
        state: "",
        franchiseCategory: "",
        tentativeOpeningDate: "",
        finalOpeningDate: "",
        bdmArea: "",
        inquiryManagerId: "",
        storeName: "JASMIN",
    });

    // Error states for validation
    const [errors, setErrors] = useState({});

    // Fetch active users and company brands
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await getActiveUsers();
                setUsers(response.data.data || []);
            } catch (err) {
                console.error("Failed to load active users:", err);
                toast.error("Failed to load inquiry managers.");
            } finally {
                setLoadingUsers(false);
            }
        };
        const fetchBrands = async () => {
            try {
                const response = await getCompanyBrands();
                setCompanyBrands(response.data.data || []);
            } catch (err) {
                console.error("Failed to load company brands:", err);
                toast.error("Failed to load company brands.");
            }
        };
        fetchUsers();
        fetchBrands();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation constraints
        if (!formData.partnerName.trim()) newErrors.partnerName = "Partner Name is required";
        if (!formData.partnerMobile.trim()) newErrors.partnerMobile = "Partner Mobile is required";
        if (!formData.partnerEmail.trim()) newErrors.partnerEmail = "Partner Email is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.district.trim()) newErrors.district = "District is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.tentativeOpeningDate) newErrors.tentativeOpeningDate = "Tentative Opening Date is required";
        if (!formData.bdmArea.trim()) newErrors.bdmArea = "BDM Area is required";
        if (!formData.inquiryManagerId) newErrors.inquiryManagerId = "Inquiry Manager is required";
        if (!formData.storeName) newErrors.storeName = "Store Name is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please resolve the validation errors");
            return;
        }

        setSaving(true);
        try {
            const response = await createInProcessFranchise({
                inquiryId: null, // direct creation has no inquiry_id
                partnerName: formData.partnerName.trim(),
                partnerMobile: formData.partnerMobile.trim(),
                partnerEmail: formData.partnerEmail.trim(),
                city: formData.city.trim(),
                district: formData.district.trim(),
                state: formData.state.trim(),
                franchiseCategory: formData.franchiseCategory.trim(),
                tentativeOpeningDate: formData.tentativeOpeningDate,
                finalOpeningDate: formData.finalOpeningDate || null,
                bdmArea: formData.bdmArea.trim(),
                inquiryManagerId: formData.inquiryManagerId,
                storeName: formData.storeName
            });

            if (response.data.success) {
                toast.success("In Process Franchise created successfully!");
                navigate("/user/in-process-franchises");
            } else {
                toast.error(response.data.message || "Failed to create franchise");
            }
        } catch (err) {
            console.error("Error creating franchise:", err);
            toast.error(err?.response?.data?.message || "Failed to create franchise.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                    <div className="bg-[#6804a1] px-6 py-5 text-white flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Create In Process Franchise</h2>
                            <p className="text-white/70 text-xs mt-1 font-medium">
                                Fill in the details below to directly register a new in-process franchise.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/user/in-process-franchises")}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-3.5 rounded-lg border border-white/15 transition-all cursor-pointer focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Franchise List
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {/* Section 1: Partner Information */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
                                Partner Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Partner Name *</label>
                                    <input
                                        type="text"
                                        name="partnerName"
                                        value={formData.partnerName}
                                        onChange={handleChange}
                                        placeholder="Enter partner name"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.partnerName ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.partnerName && <p className="text-xs text-red-500 mt-1">{errors.partnerName}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Partner Mobile No. *</label>
                                    <input
                                        type="text"
                                        name="partnerMobile"
                                        value={formData.partnerMobile}
                                        onChange={handleChange}
                                        placeholder="Enter mobile number"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.partnerMobile ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.partnerMobile && <p className="text-xs text-red-500 mt-1">{errors.partnerMobile}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Partner Email *</label>
                                    <input
                                        type="email"
                                        name="partnerEmail"
                                        value={formData.partnerEmail}
                                        onChange={handleChange}
                                        placeholder="partner@example.com"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.partnerEmail ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.partnerEmail && <p className="text-xs text-red-500 mt-1">{errors.partnerEmail}</p>}
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
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
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
                                        placeholder="Enter district"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.district ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.state ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Franchise Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
                                Franchise Setup Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Franchise Category</label>
                                    <input
                                        type="text"
                                        name="franchiseCategory"
                                        value={formData.franchiseCategory}
                                        onChange={handleChange}
                                        placeholder="Category (optional)"
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">BDM Area *</label>
                                    <input
                                        type="text"
                                        name="bdmArea"
                                        value={formData.bdmArea}
                                        onChange={handleChange}
                                        placeholder="Enter BDM area"
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.bdmArea ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.bdmArea && <p className="text-xs text-red-500 mt-1">{errors.bdmArea}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Inquiry Manager *</label>
                                    <select
                                        name="inquiryManagerId"
                                        value={formData.inquiryManagerId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer ${
                                            errors.inquiryManagerId ? "border-red-500" : "border-slate-200"
                                        }`}
                                    >
                                        <option value="">Select Inquiry Manager...</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.inquiryManagerId && <p className="text-xs text-red-500 mt-1">{errors.inquiryManagerId}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Tentative Opening Date *</label>
                                    <input
                                        type="date"
                                        name="tentativeOpeningDate"
                                        value={formData.tentativeOpeningDate}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                            errors.tentativeOpeningDate ? "border-red-500" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.tentativeOpeningDate && <p className="text-xs text-red-500 mt-1">{errors.tentativeOpeningDate}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Final Opening Date</label>
                                    <input
                                        type="date"
                                        name="finalOpeningDate"
                                        value={formData.finalOpeningDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Store Brand */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">
                                Store Brand Selection
                            </h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2.5">Store Name *</label>
                                <div className="flex flex-wrap gap-6 mt-1">
                                    {companyBrands.length > 0 ? (
                                        companyBrands.map((brand) => (
                                            <label key={brand.id} className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                                                <input
                                                    type="radio"
                                                    name="storeName"
                                                    value={brand.brand_name}
                                                    checked={formData.storeName === brand.brand_name}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1]"
                                                />
                                                {brand.brand_name}
                                            </label>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No brands available in Company Brand Master</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-100 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/user/in-process-franchises")}
                                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all duration-150 cursor-pointer text-center"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-[#6804a1] hover:bg-[#52037e] text-white font-semibold rounded-xl transition-all duration-200 shadow-md cursor-pointer text-center"
                                disabled={saving || loadingUsers}
                            >
                                {saving ? "Creating..." : "Save Franchise"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
