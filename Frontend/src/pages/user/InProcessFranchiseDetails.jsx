import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  getInProcessFranchiseById,
  getActiveUsers,
  updateInProcessFranchise,
  submitFindStoreForm,
  approveFindStoreForm,
  rejectFindStoreForm,
  submitAgreementGstForm
} from "../../api/inProcessFranchiseApi";
import { getDocuments } from "../../api/documentApi";
import toast from "react-hot-toast";

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

  // Form states for editable fields
  const [tentativeOpeningDate, setTentativeOpeningDate] = useState("");
  const [finalOpeningDate, setFinalOpeningDate] = useState("");
  const [bdmArea, setBdmArea] = useState("");
  const [inquiryManagerId, setInquiryManagerId] = useState("");
  const [storeName, setStoreName] = useState("");

  // Find store form states
  const [storeLocation, setStoreLocation] = useState("");
  const [storeMapLink, setStoreMapLink] = useState("");
  const [storePhotoFile, setStorePhotoFile] = useState(null);
  const [storePhotoName, setStorePhotoName] = useState(""); // existing filename from DB
  const [businessArea, setBusinessArea] = useState("");
  const [clusterValue, setClusterValue] = useState("");
  const [processActiveValue, setProcessActiveValue] = useState("");
  const [authorityCertificateFile, setAuthorityCertificateFile] = useState(null);
  const [authorityCertificateName, setAuthorityCertificateName] = useState(""); // existing filename from DB
  const [submittingFindStore, setSubmittingFindStore] = useState(false);

  // Admin approval states
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [processingAdminAction, setProcessingAdminAction] = useState(false);

  // Agreement & GST states
  const [masterDocs, setMasterDocs] = useState([]);
  const [partnerDate, setPartnerDate] = useState("");
  const [gstRegistrationDate, setGstRegistrationDate] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [agreementGstDocs, setAgreementGstDocs] = useState([]);
  const [submittingAgreementGst, setSubmittingAgreementGst] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("find-store"); // "find-store" or "agreement-gst" or null

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

  const mergeAndSetDocuments = (f, masterDocsList) => {
    const savedDocs = f.agreementGst?.documents || [];
    const mergedDocs = [];

    // 1. Add required docs
    masterDocsList.forEach(reqDoc => {
      const existingSaved = savedDocs.find(sd => sd.doc_type.toLowerCase() === reqDoc.doc_type.toLowerCase());
      if (existingSaved) {
        mergedDocs.push({
          doc_type: reqDoc.doc_type,
          document_path: existingSaved.document_path,
          expiry_date: getLocalDateString(existingSaved.expiry_date),
          file: null,
          is_custom: false
        });
      } else {
        mergedDocs.push({
          doc_type: reqDoc.doc_type,
          document_path: "",
          expiry_date: "",
          file: null,
          is_custom: false
        });
      }
    });

    // 2. Add custom saved docs
    savedDocs.forEach(sd => {
      const isReq = masterDocsList.some(reqDoc => reqDoc.doc_type.toLowerCase() === sd.doc_type.toLowerCase());
      if (!isReq) {
        mergedDocs.push({
          doc_type: sd.doc_type,
          document_path: sd.document_path,
          expiry_date: getLocalDateString(sd.expiry_date),
          file: null,
          is_custom: true
        });
      }
    });

    setAgreementGstDocs(mergedDocs);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [franchiseRes, usersRes, docsRes] = await Promise.all([
          getInProcessFranchiseById(id),
          getActiveUsers(),
          getDocuments().catch(() => ({ data: { success: false, data: [] } }))
        ]);
        
        let loadedMasterDocs = [];
        if (docsRes.data?.success) {
          const allDocs = docsRes.data.data || [];
          loadedMasterDocs = allDocs.filter(d => d.is_required === 1 || d.is_required === true);
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

          // Initialize find store states
          if (f.findStore) {
            setStoreLocation(f.findStore.store_location || "");
            setStoreMapLink(f.findStore.store_map_link || "");
            setStorePhotoName(f.findStore.store_photo || "");
            setBusinessArea(f.findStore.business_area || "");
            setClusterValue(f.findStore.cluster_value || "");
            setProcessActiveValue(f.findStore.process_active_value || "");
            setAuthorityCertificateName(f.findStore.authority_certificate || "");
          }

          // Initialize Agreement & GST states
          if (f.agreementGst) {
            setPartnerDate(getLocalDateString(f.agreementGst.partner_date));
            setGstRegistrationDate(getLocalDateString(f.agreementGst.gst_registration_date));
            setGstNumber(f.agreementGst.gst_number || "");
          }

          // Merge and set documents
          mergeAndSetDocuments(f, loadedMasterDocs);
        } else {
          toast.error("Failed to fetch franchise details.");
        }
        
        if (usersRes.data?.success) {
          setUsers(usersRes.data.data || []);
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
        const f = res.data.data;
        setFranchise(f);
        if (f.findStore) {
          setStoreLocation(f.findStore.store_location || "");
          setStoreMapLink(f.findStore.store_map_link || "");
          setStorePhotoName(f.findStore.store_photo || "");
          setBusinessArea(f.findStore.business_area || "");
          setClusterValue(f.findStore.cluster_value || "");
          setProcessActiveValue(f.findStore.process_active_value || "");
          setAuthorityCertificateName(f.findStore.authority_certificate || "");
        }
        if (f.agreementGst) {
          setPartnerDate(getLocalDateString(f.agreementGst.partner_date));
          setGstRegistrationDate(getLocalDateString(f.agreementGst.gst_registration_date));
          setGstNumber(f.agreementGst.gst_number || "");
        }
        mergeAndSetDocuments(f, masterDocs);
      }
    } catch (err) {
      console.error("Failed to reload data:", err);
    }
  };

  const handleFindStoreSubmit = async (e) => {
    e.preventDefault();

    if (!storeLocation.trim()) return toast.error("Store Location is required");
    if (!storeMapLink.trim()) return toast.error("Store Map Link is required");
    if (!businessArea.trim()) return toast.error("Business Area is required");
    if (!storePhotoFile && !storePhotoName) return toast.error("Store Photo is required");

    setSubmittingFindStore(true);
    try {
      const fd = new FormData();
      fd.append("storeLocation", storeLocation.trim());
      fd.append("storeMapLink", storeMapLink.trim());
      fd.append("businessArea", businessArea.trim());
      fd.append("clusterValue", clusterValue.trim());
      fd.append("processActiveValue", processActiveValue.trim());

      if (storePhotoFile) {
        fd.append("storePhoto", storePhotoFile);
      }
      if (authorityCertificateFile) {
        fd.append("authorityCertificate", authorityCertificateFile);
      }

      const res = await submitFindStoreForm(id, fd);
      if (res.data?.success) {
        toast.success("Find Store details submitted successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to submit store details");
      }
    } catch (err) {
      console.error("Error submitting find store form:", err);
      toast.error(err?.response?.data?.message || "Failed to submit store details.");
    } finally {
      setSubmittingFindStore(false);
    }
  };

  const handleAddDoc = () => {
    setAgreementGstDocs([
      ...agreementGstDocs,
      {
        doc_type: "",
        document_path: "",
        expiry_date: "",
        file: null,
        is_custom: true
      }
    ]);
  };

  const handleRemoveDoc = (index) => {
    const updated = [...agreementGstDocs];
    updated.splice(index, 1);
    setAgreementGstDocs(updated);
  };

  const handleDocFieldChange = (index, field, value) => {
    const updated = [...agreementGstDocs];
    updated[index][field] = value;
    setAgreementGstDocs(updated);
  };

  const handleAgreementGstSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    for (const doc of agreementGstDocs) {
      if (!doc.doc_type.trim()) {
        return toast.error("Document type is required for all documents.");
      }
      if (!doc.document_path && !doc.file) {
        return toast.error(`Please upload a document file for ${doc.doc_type}`);
      }
    }

    setSubmittingAgreementGst(true);
    try {
      const fd = new FormData();
      fd.append("partnerDate", partnerDate);
      fd.append("gstRegistrationDate", gstRegistrationDate);
      fd.append("gstNumber", gstNumber.trim());

      const docsPayload = agreementGstDocs.map((doc) => {
        return {
          doc_type: doc.doc_type,
          expiry_date: doc.expiry_date || "",
          document_path: doc.document_path || ""
        };
      });

      fd.append("documents", JSON.stringify(docsPayload));

      agreementGstDocs.forEach((doc, idx) => {
        if (doc.file) {
          fd.append(`file_${idx}`, doc.file);
        }
      });

      const res = await submitAgreementGstForm(id, fd);
      if (res.data?.success) {
        toast.success("Agreement & GST details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Agreement & GST details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Agreement & GST details.");
    } finally {
      setSubmittingAgreementGst(false);
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
      return;
    }

    if (!isUnlocked) {
      toast.error("Please complete and get approval for 'Find Store' in Store operations to unlock this stage.");
      return;
    }

    setActiveStage(stageId);
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { val: "8 to 9", label: "8 TO 9" },
                  { val: "BIG PHONE", label: "BIG PHONE" },
                  { val: "JASMIN", label: "JASMIN" },
                  { val: "PHONE 2 PHONE", label: "Phone 2 Phone" }
                ].map((store) => (
                  <label key={store.val} className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-500 uppercase">
                    <input
                      type="radio"
                      name="storeName"
                      value={store.val}
                      checked={storeName === store.val}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] accent-[#6804a1]"
                    />
                    {store.label}
                  </label>
                ))}
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
                {!isStageLocked && stage.id !== "store-operations" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

            {findStoreStatus === "approved" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
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
                  <form onSubmit={handleFindStoreSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Store Location *</label>
                        <input
                          type="text"
                          disabled={findStoreStatus === "approved"}
                          value={storeLocation}
                          onChange={(e) => setStoreLocation(e.target.value)}
                          placeholder="Enter specific store location"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Store Map Link *</label>
                        <input
                          type="url"
                          disabled={findStoreStatus === "approved"}
                          value={storeMapLink}
                          onChange={(e) => setStoreMapLink(e.target.value)}
                          placeholder="Google Maps link"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
                        />
                        {storeMapLink && (
                          <a
                            href={storeMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#6804a1] hover:underline font-bold mt-1 inline-block"
                          >
                            Open Map Link →
                          </a>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Business Area *</label>
                        <input
                          type="text"
                          disabled={findStoreStatus === "approved"}
                          value={businessArea}
                          onChange={(e) => setBusinessArea(e.target.value)}
                          placeholder="e.g. Retail, Commercial Area"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Cluster Value</label>
                        <input
                          type="text"
                          disabled={findStoreStatus === "approved"}
                          value={clusterValue}
                          onChange={(e) => setClusterValue(e.target.value)}
                          placeholder="Cluster name / value"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Process Active Value</label>
                        <input
                          type="text"
                          disabled={findStoreStatus === "approved"}
                          value={processActiveValue}
                          onChange={(e) => setProcessActiveValue(e.target.value)}
                          placeholder="e.g. Active, Under Setup"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">
                          Store Photo * <span className="text-[10px] text-slate-400 font-semibold">(Attachment)</span>
                        </label>
                        {findStoreStatus !== "approved" && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setStorePhotoFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
                          />
                        )}
                        {storePhotoName && (
                          <div className="mt-2.5 flex items-center gap-3">
                            <img
                              src={getFileUrl(storePhotoName)}
                              alt="Store Photo"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm"
                            />
                            <a
                              href={getFileUrl(storePhotoName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6804a1] hover:underline text-xs font-bold"
                            >
                              View Full Image
                            </a>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">
                          Authority Certificate <span className="text-[10px] text-slate-400 font-semibold">(Attachment)</span>
                        </label>
                        {findStoreStatus !== "approved" && (
                          <input
                            type="file"
                            onChange={(e) => setAuthorityCertificateFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
                          />
                        )}
                        {authorityCertificateName && (
                          <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <a
                              href={getFileUrl(authorityCertificateName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                              title={authorityCertificateName}
                            >
                              View Certificate
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {findStoreStatus !== "approved" && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingFindStore}
                          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {submittingFindStore ? "Saving..." : "Submit Store Details"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Accordion 2: Agreement and GST */}
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
                  <form onSubmit={handleAgreementGstSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Partner Date</label>
                        <input
                          type="date"
                          value={partnerDate}
                          onChange={(e) => setPartnerDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">GST Registration Date</label>
                        <input
                          type="date"
                          value={gstRegistrationDate}
                          onChange={(e) => setGstRegistrationDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">GST Number</label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          placeholder="Enter GST Registration Number"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                        />
                      </div>
                    </div>

                    {/* Dynamic Documents List */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documents</h4>
                        <button
                          type="button"
                          onClick={handleAddDoc}
                          className="flex items-center gap-1.5 text-xs text-[#6804a1] hover:text-[#52037e] font-bold transition-colors cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Add Document
                        </button>
                      </div>

                      {agreementGstDocs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No documents required or added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {agreementGstDocs.map((doc, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row md:items-end gap-4 p-4 bg-slate-50/50 border border-slate-150 rounded-xl">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doc Type</label>
                                <input
                                  type="text"
                                  disabled={!doc.is_custom}
                                  value={doc.doc_type}
                                  onChange={(e) => handleDocFieldChange(idx, "doc_type", e.target.value)}
                                  placeholder="e.g. Aadhar Card"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
                                />
                              </div>

                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Document File {!doc.document_path && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                  type="file"
                                  onChange={(e) => handleDocFieldChange(idx, "file", e.target.files[0])}
                                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
                                />
                                {doc.document_path && (
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#6804a1]">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <a
                                      href={getFileUrl(doc.document_path)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-[#6804a1] hover:underline font-bold truncate max-w-xs"
                                      title={doc.document_path}
                                    >
                                      View Document
                                    </a>
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                                <input
                                  type="date"
                                  value={doc.expiry_date}
                                  onChange={(e) => handleDocFieldChange(idx, "expiry_date", e.target.value)}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                                />
                              </div>

                              {doc.is_custom && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(idx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer md:mb-0.5"
                                  title="Delete Document Type"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingAgreementGst}
                        className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submittingAgreementGst ? "Saving..." : "Save Agreement & GST"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Other Unlocked Stages */}
        {activeStage !== "store-operations" && (
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
