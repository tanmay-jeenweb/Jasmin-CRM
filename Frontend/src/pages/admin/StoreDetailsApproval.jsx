import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllFindStores, approveFindStoreForm, rejectFindStoreForm } from "../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function StoreDetailsApproval() {
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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Store Details Approval</h1>
          <p className="text-slate-500 text-xs mt-1">
            Review and approve store location detail submissions for franchise onboarding stages.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 mb-6 flex flex-wrap gap-2 shadow-sm">
          {["pending", "approved", "rejected", "all"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setSelectedSubId(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${activeFilter === filter
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
                  {sub.store_photo && (
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <img
                        src={getFileUrl(sub.store_photo)}
                        alt="Store location"
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                      <a
                        href={getFileUrl(sub.store_photo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#6804a1] hover:underline font-bold"
                      >
                        Open Photo
                      </a>
                    </div>
                  )}

                  {sub.status === "pending" && (
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
      </main>
    </div>
  );
}
