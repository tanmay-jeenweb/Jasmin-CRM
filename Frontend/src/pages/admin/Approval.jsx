import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { usePermission } from "../../context/PermissionContext";
import {
  getAllFindStores,
  approveFindStoreForm,
  rejectFindStoreForm,
  getAllDepositStocks,
  approveDepositStockForm,
  rejectDepositStockForm
} from "../../api/inProcessFranchiseApi";

// ==========================================
// 1. Store Details Approval Component
// ==========================================
function StoreDetailsApprovalContent() {
  const { hasPermission } = usePermission();
  const canApprove = hasPermission("store_details_approval", "write");

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending"); // pending, approved, rejected, all

  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedSubId, setSelectedSubId] = useState(null); // id of in-process-franchise for rejection
  const [processingId, setProcessingId] = useState(null);

  const UPLOADS_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "/uploads")
    : "http://localhost:5000/uploads";

  const getFileUrl = (filename) => {
    if (!filename) return "";
    return `${UPLOADS_BASE_URL}/${filename}`;
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getAllFindStores();
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
      } else {
        toast.error("Failed to load submissions.");
      }
    } catch (err) {
      console.error("Failed to load store submissions:", err);
      toast.error("Error loading submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this store location?")) return;
    setProcessingId(id);
    try {
      const res = await approveFindStoreForm(id);
      if (res.data?.success) {
        toast.success("Store details approved successfully!");
        await loadSubmissions();
      } else {
        toast.error(res.data?.message || "Failed to approve store details");
      }
    } catch (err) {
      console.error("Error approving store:", err);
      toast.error("Failed to approve store details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return toast.error("Rejection reason is required");
    setProcessingId(selectedSubId);
    try {
      const res = await rejectFindStoreForm(selectedSubId, rejectionReason.trim());
      if (res.data?.success) {
        toast.success("Store details rejected.");
        setSelectedSubId(null);
        setRejectionReason("");
        await loadSubmissions();
      } else {
        toast.error(res.data?.message || "Failed to reject store details");
      }
    } catch (err) {
      console.error("Error rejecting store:", err);
      toast.error("Failed to reject store details.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeFilter === "all") return true;
    return sub.status === activeFilter;
  });

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 mb-6 flex flex-wrap gap-2 shadow-sm">
        {["pending", "approved", "rejected", "all"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setSelectedSubId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
              activeFilter === filter
                ? "bg-[#6804a1] text-white shadow-md shadow-purple-100"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            {filter === "all" ? "All Submissions" : `${filter} Review`}
          </button>
        ))}
      </div>

      {/* Modal / Dialog inline overlay for Rejection reason */}
      {selectedSubId && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-rose-800 mb-2">Reject Store Details</h3>
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Specify Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this submission is being rejected..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processingId !== null || !rejectionReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer disabled:opacity-50"
              >
                Submit Rejection
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubId(null);
                  setRejectionReason("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold mt-3 animate-pulse">Fetching submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-12 h-12 text-slate-300 mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
          </svg>
          <h3 className="text-sm font-bold text-slate-800">No submissions found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no records matching the selected review filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
              {/* Details layout */}
              <div className="flex-1 space-y-4">
                {/* Partner and Store Brand Header */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex flex-wrap items-center gap-2">
                    {sub.partner_name}
                    <span className="text-xs bg-[#f5f3ff] text-[#6804a1] border border-indigo-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {sub.store_name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sub.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : sub.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                      {sub.status}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Submitted by {sub.submitted_by_name || "Unknown"} on {formatDate(sub.timestamp)}
                  </p>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Store Location</span>
                    <span className="text-xs font-semibold text-slate-800">{sub.store_location}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Area</span>
                    <span className="text-xs font-semibold text-slate-800">{sub.business_area}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Map Link</span>
                    {sub.store_map_link ? (
                      <a
                        href={sub.store_map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6804a1] hover:underline text-xs font-bold inline-flex items-center gap-1 mt-0.5"
                      >
                        Google Maps Link
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cluster Value</span>
                    <span className="text-xs font-semibold text-slate-800">{sub.cluster_value || "—"}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Process Active Value</span>
                    <span className="text-xs font-semibold text-slate-800">{sub.process_active_value || "—"}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authority Certificate</span>
                    {sub.authority_certificate ? (
                      <a
                        href={getFileUrl(sub.authority_certificate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6804a1] hover:underline text-xs font-bold inline-flex items-center gap-1 mt-0.5"
                      >
                        View Certificate
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Not provided</span>
                    )}
                  </div>
                </div>

                {/* Approved By/Rejection notes */}
                {sub.status === "approved" && (
                  <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 text-[11px] text-emerald-800 font-semibold w-fit">
                    Approved by {sub.approved_by_name || "Admin"} on {formatDate(sub.approved_at)}
                  </div>
                )}

                {sub.status === "rejected" && (
                  <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/50 text-[11px] text-rose-800 font-semibold w-fit">
                    Rejection Reason: {sub.rejection_reason || "None specified."}
                  </div>
                )}
              </div>

              {/* Photo thumbnail and approval buttons */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                {(() => {
                  if (!sub.store_photo) return null;
                  let photos = [];
                  try {
                    const parsed = JSON.parse(sub.store_photo);
                    photos = Array.isArray(parsed) ? parsed : [sub.store_photo];
                  } catch (e) {
                    photos = [sub.store_photo];
                  }
                  return (
                    <div className="flex flex-wrap gap-2.5 justify-end max-w-xs">
                      {photos.map((photo, idx) => (
                        <div key={photo} className="flex flex-col items-center gap-1 shrink-0">
                          <img
                            src={getFileUrl(photo)}
                            alt={`Store location ${idx + 1}`}
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                          />
                          <a
                            href={getFileUrl(photo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-[#6804a1] hover:underline font-bold"
                          >
                            Open Photo {photos.length > 1 ? idx + 1 : ""}
                          </a>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {sub.status === "pending" && canApprove && (
                  <div className="flex md:flex-col gap-2 shrink-0 ml-auto md:ml-0">
                    <button
                      onClick={() => handleApprove(sub.in_process_franchise_id)}
                      disabled={processingId !== null}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedSubId(sub.in_process_franchise_id)}
                      disabled={processingId !== null}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ==========================================
// 2. Deposit & Stock Approval Component
// ==========================================
function DepositStockApprovalContent() {
  const { hasPermission } = usePermission();
  const canApprove = hasPermission("deposit_stock_approval", "write");

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending"); // pending, approved, rejected, all

  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedSubId, setSelectedSubId] = useState(null); // id of in-process-franchise for rejection
  const [processingId, setProcessingId] = useState(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getAllDepositStocks();
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
      } else {
        toast.error("Failed to load submissions.");
      }
    } catch (err) {
      console.error("Failed to load deposit & stock submissions:", err);
      toast.error("Error loading submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this Deposit & Stock submission? This will move the franchise to the completed Franchise module.")) return;
    setProcessingId(id);
    try {
      const res = await approveDepositStockForm(id);
      if (res.data?.success) {
        toast.success("Deposit & Stock approved successfully! Franchise moved to Franchise Module.");
        await loadSubmissions();
      } else {
        toast.error(res.data?.message || "Failed to approve deposit & stock details");
      }
    } catch (err) {
      console.error("Error approving deposit & stock:", err);
      toast.error("Failed to approve deposit & stock details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return toast.error("Rejection reason is required");
    setProcessingId(selectedSubId);
    try {
      const res = await rejectDepositStockForm(selectedSubId, rejectionReason.trim());
      if (res.data?.success) {
        toast.success("Deposit & Stock details rejected.");
        setSelectedSubId(null);
        setRejectionReason("");
        await loadSubmissions();
      } else {
        toast.error(res.data?.message || "Failed to reject deposit & stock details");
      }
    } catch (err) {
      console.error("Error rejecting deposit & stock:", err);
      toast.error("Failed to reject deposit & stock details.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeFilter === "all") return true;
    return sub.status === activeFilter;
  });

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 mb-6 flex flex-wrap gap-2 shadow-sm">
        {["pending", "approved", "rejected", "all"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setSelectedSubId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
              activeFilter === filter
                ? "bg-[#6804a1] text-white shadow-md shadow-purple-100"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            {filter === "all" ? "All Submissions" : `${filter} Review`}
          </button>
        ))}
      </div>

      {/* Rejection Modal overlay */}
      {selectedSubId && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-rose-800 mb-2">Reject Deposit & Stock Details</h3>
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Specify Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this submission is being rejected..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processingId !== null || !rejectionReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer disabled:opacity-50"
              >
                Submit Rejection
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubId(null);
                  setRejectionReason("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading / Data Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold mt-3 animate-pulse">Fetching submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-12 h-12 text-slate-300 mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-1.958-.59-1.172-.88-1.172-2.303 0-3.183 1.171-.879 3.07-.879 4.242 0 .224.168.4.373.53.597m-9 3.33H18" />
          </svg>
          <h3 className="text-sm font-bold text-slate-800">No submissions found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no records matching the selected review filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="flex-1 space-y-4">
                {/* Title & status */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex flex-wrap items-center gap-2">
                    {sub.partner_name}
                    <span className="text-xs bg-[#f5f3ff] text-[#6804a1] border border-indigo-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {sub.store_name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sub.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : sub.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                      {sub.status === "pending" ? "pending approval" : sub.status}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Submitted by {sub.submitted_by_name || "Unknown"} on {formatDate(sub.timestamp)}
                  </p>
                </div>

                {/* Core details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">PO Number</span>
                    <span className="text-xs font-semibold text-slate-800">{sub.po_number || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">PO Creation Date</span>
                    <span className="text-xs font-semibold text-slate-800">{formatDate(sub.po_creation_date)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected Opening Date</span>
                    <span className="text-xs font-semibold text-slate-800">{formatDate(sub.expected_opening_date)}</span>
                  </div>
                </div>

                {/* Checklist details */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Checklist</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Stock", checked: sub.chk_stock },
                      { name: "Bill Paper", checked: sub.chk_bill_paper },
                      { name: "Bag", checked: sub.chk_bag },
                      { name: "Blue Chit", checked: sub.chk_blue_chit },
                      { name: "Stamp", checked: sub.chk_stamp },
                      { name: "Swipe Machine", checked: sub.chk_swipe_machine },
                      { name: "QR Code", checked: sub.chk_qr_code }
                    ].map((item) => (
                      <span
                        key={item.name}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                          item.checked
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-slate-50 text-slate-400 border-slate-100 line-through"
                        }`}
                      >
                        {item.checked ? "✓" : "✗"} {item.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* APX details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                    sub.stock_received_apx
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <span className="text-xs font-bold">
                      {sub.stock_received_apx ? "✓ Stock Received in APX" : "✗ Stock Not Received in APX"}
                    </span>
                  </div>
                  {sub.stock_received_apx && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">APX Receipt Date</span>
                      <span className="text-xs font-semibold text-slate-800">{formatDate(sub.stock_received_apx_date)}</span>
                    </div>
                  )}
                </div>

                {/* Approved By/Rejection notes */}
                {sub.status === "approved" && (
                  <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 text-[11px] text-emerald-800 font-semibold w-fit">
                    Approved by {sub.approved_by_name || "Admin"} on {formatDate(sub.approved_at)}
                  </div>
                )}

                {sub.status === "rejected" && (
                  <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/50 text-[11px] text-rose-800 font-semibold w-fit">
                    Rejection Reason: {sub.rejection_reason || "None specified."}
                  </div>
                )}
              </div>

              {/* Approve/Reject Buttons */}
              {sub.status === "pending" && canApprove && (
                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 ml-auto md:ml-0">
                  <button
                    onClick={() => handleApprove(sub.in_process_franchise_id)}
                    disabled={processingId !== null}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50 text-center"
                  >
                    Approve & Migrate
                  </button>
                  <button
                    onClick={() => setSelectedSubId(sub.in_process_franchise_id)}
                    disabled={processingId !== null}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50 text-center"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ==========================================
// 3. Main Approval Page Component
// ==========================================
export default function Approval() {
  const { hasPermission } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();

  const canReadStore = hasPermission("store_details_approval", "read");
  const canReadDeposit = hasPermission("deposit_stock_approval", "read");

  // Determine standard default tab based on permission
  const defaultTab = canReadStore ? "store" : (canReadDeposit ? "deposit" : "");
  const currentTab = searchParams.get("tab") || defaultTab;

  useEffect(() => {
    // If current tab is set to something we don't have access to, or not set, set it to the defaultTab.
    if (currentTab === "store" && !canReadStore && canReadDeposit) {
      setSearchParams({ tab: "deposit" }, { replace: true });
    } else if (currentTab === "deposit" && !canReadDeposit && canReadStore) {
      setSearchParams({ tab: "store" }, { replace: true });
    } else if (!searchParams.get("tab") && defaultTab) {
      setSearchParams({ tab: defaultTab }, { replace: true });
    }
  }, [currentTab, canReadStore, canReadDeposit, defaultTab, setSearchParams]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const showTabs = canReadStore && canReadDeposit;

  // Header Title and Description based on active view
  let pageTitle = "Approval";
  let pageDescription = "Manage and review franchise onboarding approvals.";

  if (!showTabs) {
    if (canReadStore) {
      pageTitle = "Store Details Approval";
      pageDescription = "Review and approve store location detail submissions for franchise onboarding stages.";
    } else if (canReadDeposit) {
      pageTitle = "Deposit & Stock Approval";
      pageDescription = "Review and approve POs, stock checklists, and APX stock receipt status before migrating to completed franchises.";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Navbar />

      <main className="mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-slate-500 text-xs mt-1">{pageDescription}</p>
        </div>

        {/* Tab Buttons (Only visible if access to both is granted) */}
        {showTabs && (
          <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("store")}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                  currentTab === "store"
                    ? "border-[#6804a1] text-[#6804a1]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Store Details Approval
              </button>
              <button
                onClick={() => handleTabChange("deposit")}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                  currentTab === "deposit"
                    ? "border-[#6804a1] text-[#6804a1]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Deposit & Stock Approval
              </button>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        {currentTab === "store" && canReadStore && (
          <StoreDetailsApprovalContent />
        )}
        {currentTab === "deposit" && canReadDeposit && (
          <DepositStockApprovalContent />
        )}
      </main>
    </div>
  );
}
