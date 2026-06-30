import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  getInProcessFranchiseById,
  getActiveUsers,
  updateInProcessFranchise,
  approveFindStoreForm,
  rejectFindStoreForm
} from "../../api/inProcessFranchiseApi";
import { getDocuments } from "../../api/documentApi";
import { getCompanyBrands } from "../../api/companyBrandApi";
import toast from "react-hot-toast";

import FindStoreForm from "./components/FindStoreForm";
import AgreementGstForm from "./components/AgreementGstForm";
import DocPrepForm from "./components/DocPrepForm";
import StorePlanningForm from "./components/StorePlanningForm";
import StoreAmbianceForm from "./components/StoreAmbianceForm";
import FranchiseTeamForm from "./components/FranchiseTeamForm";
import FranchiseMarketingForm from "./components/FranchiseMarketingForm";
import FranchiseInstallationForm from "./components/FranchiseInstallationForm";
import FranchiseSwipeMachineForm from "./components/FranchiseSwipeMachineForm";
import FranchiseTrainingForm from "./components/FranchiseTrainingForm";
import FranchiseDepositStockForm from "./components/FranchiseDepositStockForm";

export default function InProcessFranchiseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Stages and user checks
  const [activeStage, setActiveStage] = useState("store-operations");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [companyBrands, setCompanyBrands] = useState([]);

  // Form states for editable fields (top level details)
  const [tentativeOpeningDate, setTentativeOpeningDate] = useState("");
  const [finalOpeningDate, setFinalOpeningDate] = useState("");
  const [bdmArea, setBdmArea] = useState("");
  const [inquiryManagerId, setInquiryManagerId] = useState("");
  const [storeName, setStoreName] = useState("");

  // Admin approval states
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [processingAdminAction, setProcessingAdminAction] = useState(false);

  // Master docs list for Agreement & GST
  const [masterDocs, setMasterDocs] = useState([]);

  const [openAccordion, setOpenAccordion] = useState("find-store");
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);

  const getLocalDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [franchiseRes, usersRes, docsRes, brandsRes] = await Promise.all([
          getInProcessFranchiseById(id),
          getActiveUsers(),
          getDocuments().catch(() => ({ data: { success: false, data: [] } })),
          getCompanyBrands().catch(() => ({ data: { success: false, data: [] } }))
        ]);
        
        if (docsRes.data?.success) {
          const allDocs = docsRes.data.data || [];
          const loadedMasterDocs = allDocs.filter(d => d.is_required === 1 || d.is_required === true);
          setMasterDocs(loadedMasterDocs);
        }

        if (franchiseRes.data?.success) {
          const f = franchiseRes.data.data;
          setFranchise(f);
          // Initialize form states
          setTentativeOpeningDate(getLocalDateString(f.tentative_opening_date));
          setFinalOpeningDate(getLocalDateString(f.final_opening_date));
          setBdmArea(f.bdm_area || "");
          setInquiryManagerId(f.inquiry_manager_id || "");
          setStoreName(f.store_name || "JASMIN");
        } else {
          toast.error("Failed to fetch franchise details.");
        }
        
        if (usersRes.data?.success) {
          setUsers(usersRes.data.data || []);
        }

        if (brandsRes.data?.success) {
          setCompanyBrands(brandsRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load details:", err);
        toast.error("Error loading details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleSaveChanges = async () => {
    if (!tentativeOpeningDate) return toast.error("Tentative Opening Date is required");
    if (!bdmArea.trim()) return toast.error("BDM Area is required");
    if (!inquiryManagerId) return toast.error("Inquiry Manager is required");
    if (!storeName) return toast.error("Store Name is required");

    setSaving(true);
    try {
      const response = await updateInProcessFranchise(id, {
        partnerName: franchise.partner_name,
        partnerMobile: franchise.partner_mobile,
        partnerEmail: franchise.partner_email || "",
        city: franchise.city,
        district: franchise.district,
        state: franchise.state,
        franchiseCategory: franchise.franchise_category || "",
        tentativeOpeningDate,
        finalOpeningDate: finalOpeningDate || null,
        bdmArea: bdmArea.trim(),
        inquiryManagerId,
        storeName
      });

      if (response.data.success) {
        toast.success("Franchise updated successfully!");
        // Refresh the franchise details to keep them in sync
        const res = await getInProcessFranchiseById(id);
        if (res.data?.success) {
          setFranchise(res.data.data);
        }
      } else {
        toast.error(response.data.message || "Failed to update franchise");
      }
    } catch (err) {
      console.error("Error updating franchise:", err);
      toast.error(err?.response?.data?.message || "Failed to update franchise.");
    } finally {
      setSaving(false);
    }
  };

  const UPLOADS_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "/uploads")
    : "http://localhost:5000/uploads";

  const getFileUrl = (filename) => {
    if (!filename) return "";
    return `${UPLOADS_BASE_URL}/${filename}`;
  };

  const reloadFranchiseData = async () => {
    try {
      const res = await getInProcessFranchiseById(id);
      if (res.data?.success) {
        setFranchise(res.data.data);
      }
    } catch (err) {
      console.error("Failed to reload data:", err);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this store location submission?")) return;
    setProcessingAdminAction(true);
    try {
      const res = await approveFindStoreForm(id);
      if (res.data?.success) {
        toast.success("Find Store details approved!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to approve store details");
      }
    } catch (err) {
      console.error("Error approving store details:", err);
      toast.error(err?.response?.data?.message || "Failed to approve store details.");
    } finally {
      setProcessingAdminAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error("Rejection reason is required");
    setProcessingAdminAction(true);
    try {
      const res = await rejectFindStoreForm(id, rejectionReason.trim());
      if (res.data?.success) {
        toast.success("Find Store details rejected.");
        setShowRejectForm(false);
        setRejectionReason("");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to reject store details");
      }
    } catch (err) {
      console.error("Error rejecting store details:", err);
      toast.error(err?.response?.data?.message || "Failed to reject store details.");
    } finally {
      setProcessingAdminAction(false);
    }
  };

  const stages = [
    { id: "store-operations", name: "Store operations" },
    { id: "teams-marketing", name: "Teams and marketing" },
    { id: "installation-training", name: "Installation and training" },
    { id: "finance-pricing", name: "Finance and pricing" },
    { id: "insurance", name: "Insurance" }
  ];

  const findStoreStatus = franchise?.findStore?.status || "not-submitted";
  const isUnlocked = franchise?.findStore?.status === "approved";

  const handleStageClick = (stageId) => {
    if (stageId === "store-operations") {
      setActiveStage(stageId);
      setOpenAccordion("find-store");
      return;
    }

    if (!isUnlocked) {
      toast.error("Please complete and get approval for 'Find Store' in Store operations to unlock this stage.");
      return;
    }

    setActiveStage(stageId);
    if (stageId === "teams-marketing") {
      setOpenAccordion("team");
    } else if (stageId === "installation-training") {
      setOpenAccordion("installation");
    } else if (stageId === "finance-pricing") {
      setOpenAccordion("deposit-stock");
    } else {
      setOpenAccordion(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-[#6804a1] rounded-full animate-spin"></div>
            <p className="text-slate-500 font-semibold text-sm animate-pulse">Loading franchise details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Franchise Not Found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              The franchise record you are looking for does not exist or has been deleted.
            </p>
            <button
              onClick={() => navigate("/user/in-process-franchises")}
              className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumbs and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {franchise.partner_name}
              <span className="text-xs bg-[#f5f3ff] text-[#6804a1] border border-indigo-100 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {franchise.store_name}
              </span>
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              BDM Area: <span className="font-semibold text-slate-700">{franchise.bdm_area}</span> • Inquiry Manager: <span className="font-semibold text-slate-700">{franchise.inquiry_manager_name || "N/A"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/user/in-process-franchises")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-xs py-1.5 px-3 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Franchise List
            </button>
          </div>
        </div>

        {/* Contact Details Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800">Contact details</h2>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
            {/* Row 1 */}
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">Partner Name</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.partner_name}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">Partner Mobile</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.partner_mobile}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">City</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.city}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">District</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.district}</span>
            </div>

            {/* Row 2 */}
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">State</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.state || "\u00A0"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">Franchise category</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.franchise_category || "\u00A0"}</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tentative Opening Date</label>
              <input
                type="date"
                value={tentativeOpeningDate}
                onChange={(e) => setTentativeOpeningDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Final Opening Date :</label>
              <input
                type="date"
                value={finalOpeningDate}
                onChange={(e) => setFinalOpeningDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">BDM Area :</label>
              <input
                type="text"
                value={bdmArea}
                onChange={(e) => setBdmArea(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Inquiry Manager :</label>
              <select
                value={inquiryManagerId}
                onChange={(e) => setInquiryManagerId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] bg-white"
              >
                <option value="">Select Inquiry Manager</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 4 - Store Name */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Store Name :</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {companyBrands.length > 0 ? (
                  companyBrands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-500 uppercase">
                      <input
                        type="radio"
                        name="storeName"
                        value={brand.brand_name}
                        checked={storeName === brand.brand_name}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] accent-[#6804a1]"
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
        </div>

        {/* Stages Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-md p-2 mb-8 flex flex-wrap gap-2">
          {stages.map((stage) => {
            const isStageLocked = stage.id !== "store-operations" && !isUnlocked;
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(stage.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#6804a1] text-white shadow-md shadow-purple-100"
                    : isStageLocked
                    ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                }`}
              >
                {stage.name}
                {isStageLocked && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content: Store Operations */}
        {activeStage === "store-operations" && (
          <div className="space-y-6">
            {/* Status Banner */}
            {findStoreStatus === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <span className="w-2 h-2 bg-amber-600 rounded-full animate-ping"></span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Pending Approval</h4>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Store details have been submitted and are currently awaiting administrative review. Other stages will unlock automatically once approved.
                  </p>
                  {franchise.findStore?.submitted_by_name && (
                    <p className="text-[10px] text-amber-500 mt-1.5 font-semibold">
                      Submitted by {franchise.findStore.submitted_by_name} on {formatDate(franchise.findStore.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {findStoreStatus === "approved" && showApprovedBanner && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm relative">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-800">Submission Approved</h4>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Store location data has been verified and approved. All other setup stages are now unlocked!
                  </p>
                  {franchise.findStore?.approved_by_name && (
                    <p className="text-[10px] text-emerald-500 mt-1.5 font-semibold">
                      Approved by {franchise.findStore.approved_by_name} on {formatDate(franchise.findStore.approved_at)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowApprovedBanner(false)}
                  className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100/50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {findStoreStatus === "rejected" && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-800">Submission Rejected</h4>
                  <p className="text-xs text-rose-600 mt-0.5">
                    Reason: <span className="font-bold text-rose-800">{franchise.findStore?.rejection_reason || "No details provided."}</span>
                  </p>
                  <p className="text-[10px] text-rose-500 mt-1 font-semibold">
                    Please modify the incorrect fields below and submit again for verification.
                  </p>
                </div>
              </div>
            )}

            {findStoreStatus === "not-submitted" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Find Store Submission Pending</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please submit the location mapping fields. Once approved, the subsequent stages will open automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Accordion 1: Find Store Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "find-store" ? null : "find-store")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Find Store Details
                </span>
                <span className="flex items-center gap-3">
                  {findStoreStatus === "approved" && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Approved</span>
                  )}
                  {findStoreStatus === "pending" && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                  )}
                  {findStoreStatus === "rejected" && (
                    <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-bold uppercase">Rejected</span>
                  )}
                  {findStoreStatus === "not-submitted" && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold uppercase">Not Submitted</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "find-store" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "find-store" && (
                <div className="p-6">
                  <FindStoreForm
                    franchiseId={id}
                    findStoreData={franchise.findStore}
                    findStoreStatus={findStoreStatus}
                    reloadFranchiseData={reloadFranchiseData}
                    getFileUrl={getFileUrl}
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Agreement and GST */}
            {isUnlocked && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "agreement-gst" ? null : "agreement-gst")}
                  className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Agreement and GST
                  </span>
                  <span className="flex items-center gap-3">
                    {franchise?.agreementGst && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "agreement-gst" ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {openAccordion === "agreement-gst" && (
                  <div className="p-6">
                    <AgreementGstForm
                      franchiseId={id}
                      agreementGstData={franchise.agreementGst}
                      masterDocs={masterDocs}
                      reloadFranchiseData={reloadFranchiseData}
                      getFileUrl={getFileUrl}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Accordion 3: Document Preparation */}
            {isUnlocked && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "doc-prep" ? null : "doc-prep")}
                  className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Document Preparation
                  </span>
                  <span className="flex items-center gap-3">
                    {franchise?.docPrep && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "doc-prep" ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {openAccordion === "doc-prep" && (
                  <div className="p-6">
                    <DocPrepForm
                      franchiseId={id}
                      docPrepData={franchise.docPrep}
                      reloadFranchiseData={reloadFranchiseData}
                      getFileUrl={getFileUrl}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Accordion 4: Store Planning */}
            {isUnlocked && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "store-planning" ? null : "store-planning")}
                  className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Store Planning
                  </span>
                  <span className="flex items-center gap-3">
                    {franchise?.storePlanning && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "store-planning" ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {openAccordion === "store-planning" && (
                  <div className="p-6">
                    <StorePlanningForm
                      franchiseId={id}
                      storePlanningData={franchise.storePlanning}
                      reloadFranchiseData={reloadFranchiseData}
                      getFileUrl={getFileUrl}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Accordion 5: Store ambiance */}
            {isUnlocked && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "store-ambiance" ? null : "store-ambiance")}
                  className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Store ambiance
                  </span>
                  <span className="flex items-center gap-3">
                    {franchise?.storeAmbiance && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "store-ambiance" ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {openAccordion === "store-ambiance" && (
                  <div className="p-6">
                    <StoreAmbianceForm
                      franchiseId={id}
                      storeAmbianceData={franchise.storeAmbiance}
                      reloadFranchiseData={reloadFranchiseData}
                      getFileUrl={getFileUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Teams and Marketing Stage */}
        {activeStage === "teams-marketing" && (
          <div className="space-y-4">
            {/* Accordion 1: Team */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "team" ? null : "team")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20c-2.302 0-4.474-.685-6.294-1.859A4.125 4.125 0 0 1 7.5 14.25c1.472 0 2.793.774 3.537 1.95M20.25 8.253a3.75 3.75 0 1 0-3.75-3.75 3.75 3.75 0 0 0 3.75 3.75ZM9 10.5a3.75 3.75 0 1 0-3.75-3.75A3.75 3.75 0 0 0 9 10.5Z" />
                  </svg>
                  Team
                </span>
                <span className="flex items-center gap-3">
                  {franchise?.franchiseTeam && franchise.franchiseTeam.some(t => t.is_selected) && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "team" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "team" && (
                <div className="p-6">
                  <FranchiseTeamForm
                    franchiseId={id}
                    franchiseTeamData={franchise.franchiseTeam}
                    reloadFranchiseData={reloadFranchiseData}
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Marketing */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "marketing" ? null : "marketing")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>
                  Marketing
                </span>
                <span className="flex items-center gap-3">
                  {franchise?.franchiseMarketing && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "marketing" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "marketing" && (
                <div className="p-6">
                  <FranchiseMarketingForm
                    franchiseId={id}
                    franchiseMarketingData={franchise.franchiseMarketing}
                    reloadFranchiseData={reloadFranchiseData}
                    getFileUrl={getFileUrl}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Installation and Training Stage */}
        {activeStage === "installation-training" && (
          <div className="space-y-4">
            {/* Accordion 1: Installation */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "installation" ? null : "installation")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.5 1.5 0 0020 20l-5.83-5.83m-2.75 1a8.5 8.5 0 11-8.5-8.5v3m0 0l-1.5 1.5M3.75 6.75L5.25 8.25" />
                  </svg>
                  Installation
                </span>
                <span className="flex items-center gap-3">
                  {franchise?.franchiseInstallation && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "installation" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "installation" && (
                <div className="p-6">
                  <FranchiseInstallationForm
                    franchiseId={id}
                    franchiseInstallationData={franchise.franchiseInstallation}
                    reloadFranchiseData={reloadFranchiseData}
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Swip Machine */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "swipe-machine" ? null : "swipe-machine")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  Swip Machine
                </span>
                <span className="flex items-center gap-3">
                  {franchise?.franchiseSwipeMachine && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "swipe-machine" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "swipe-machine" && (
                <div className="p-6">
                  <FranchiseSwipeMachineForm
                    franchiseId={id}
                    franchiseSwipeMachineData={franchise.franchiseSwipeMachine}
                    reloadFranchiseData={reloadFranchiseData}
                  />
                </div>
              )}
            </div>

            {/* Accordion 3: Training */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "training" ? null : "training")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c-2.79 0-5.437-.472-7.897-1.33A4.952 4.952 0 003 15.03V9.75m11.963-3.078a31.29 31.29 0 00-6.917-1.096m6.917 1.096A31.182 31.182 0 0118 9.75v5.28c0 1.95-1.12 3.67-2.84 4.53A48.618 48.618 0 0112 20.9m11.963-14.228L12 3 2.037 6.672m19.926 0l-9.963 3.668-9.963-3.668m9.963 3.668v6.528" />
                  </svg>
                  Training
                </span>
                <span className="flex items-center gap-3">
                  {franchise?.franchiseTraining && franchise.franchiseTraining.some(t => t.is_done) && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "training" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "training" && (
                <div className="p-6">
                  <FranchiseTrainingForm
                    franchiseId={id}
                    franchiseTrainingData={franchise.franchiseTraining}
                    reloadFranchiseData={reloadFranchiseData}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Finance & Pricing Stage */}
        {activeStage === "finance-pricing" && (
          <div className="space-y-4">
            {/* Accordion 1: Deposit & Stock */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "deposit-stock" ? null : "deposit-stock")}
                className="w-full flex justify-between items-center px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-all border-b border-slate-100 text-left font-bold text-slate-800 text-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-1.958-.59-1.172-.88-1.172-2.303 0-3.183 1.171-.879 3.07-.879 4.242 0 .224.168.4.373.53.597m-9 3.33H18" />
                  </svg>
                  Deposit & stock
                </span>
                <span className="flex items-center gap-3">
                  {franchise?.franchiseDepositStock && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">Saved</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openAccordion === "deposit-stock" ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>

              {openAccordion === "deposit-stock" && (
                <div className="p-6">
                  <FranchiseDepositStockForm
                    franchiseId={id}
                    franchiseDepositStockData={franchise.franchiseDepositStock}
                    reloadFranchiseData={reloadFranchiseData}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Other Unlocked Stages */}
        {activeStage !== "store-operations" && activeStage !== "teams-marketing" && activeStage !== "installation-training" && activeStage !== "finance-pricing" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8 text-center max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 bg-[#f5f3ff] text-[#6804a1] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Stage: {stages.find(s => s.id === activeStage)?.name}</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">
              This stage is unlocked! Form details for this stage will be added soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
