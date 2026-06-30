import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllDepositStocks, approveDepositStockForm, rejectDepositStockForm } from "../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function DepositStockApproval() {
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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Deposit & Stock Approval</h1>
          <p className="text-slate-500 text-xs mt-1">
            Review and approve POs, stock checklists, and APX stock receipt status before migrating to completed franchises.
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
                {sub.status === "pending" && (
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
      </main>
    </div>
  );
}
