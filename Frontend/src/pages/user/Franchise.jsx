import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getFranchises, deleteFranchise, restoreFranchise } from "../../api/franchiseApi";
import DataTable from "../../components/DataTable";
import toast from "react-hot-toast";
import { usePermission } from "../../context/PermissionContext";

// ─── Detailed View Modal ──────────────────────────────────────────────────────
function DetailedFranchiseModal({ isOpen, franchise, onClose }) {
  if (!isOpen || !franchise) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const fieldStyle = { marginBottom: 16 };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 };
  const valueStyle = { fontSize: 14, fontWeight: 600, color: "#1e293b" };

  const isDeleted = !!franchise.is_deleted;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 650, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", fontStyle: "normal", justifyContent: "space-between",
          background: isDeleted ? "linear-gradient(135deg,#e11d48,#be123c)" : "linear-gradient(135deg,#10b981,#047857)"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
              Franchise Details {isDeleted ? "(Soft Deleted)" : "(Active)"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: isDeleted ? "#fecdd3" : "#d1fae5" }}>{franchise.partner_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            <div style={fieldStyle}>
              <span style={labelStyle}>Partner Name</span>
              <span style={valueStyle}>{franchise.partner_name}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Mobile Number</span>
              <span style={valueStyle}>{franchise.partner_mobile}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Email Address</span>
              <span style={valueStyle}>{franchise.partner_email || "N/A"}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Store Name</span>
              <span style={{ ...valueStyle, display: "inline-block", background: isDeleted ? "#fff1f2" : "#ecfdf5", color: isDeleted ? "#be123c" : "#047857", padding: "4px 8px", borderRadius: 6, border: isDeleted ? "1px solid #fecdd3" : "1px solid #a7f3d0" }}>
                {franchise.store_name}
              </span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>City</span>
              <span style={valueStyle}>{franchise.city}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>District</span>
              <span style={valueStyle}>{franchise.district}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>State</span>
              <span style={valueStyle}>{franchise.state}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Franchise Category</span>
              <span style={valueStyle}>{franchise.franchise_category || "N/A"}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>BDM Area</span>
              <span style={valueStyle}>{franchise.bdm_area}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Inquiry Manager</span>
              <span style={valueStyle}>{franchise.inquiry_manager_name || "N/A"}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Tentative Opening Date</span>
              <span style={valueStyle}>{formatDate(franchise.tentative_opening_date)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Final Opening Date</span>
              <span style={valueStyle}>{formatDate(franchise.final_opening_date)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Added By</span>
              <span style={valueStyle}>{franchise.added_by_name || "N/A"}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Onboarded At</span>
              <span style={valueStyle}>{formatDate(franchise.timestamp)}</span>
            </div>
            {isDeleted && (
              <>
                <div style={fieldStyle}>
                  <span style={{ ...labelStyle, color: "#e11d48" }}>Deleted At</span>
                  <span style={{ ...valueStyle, color: "#be123c" }}>
                    {franchise.deleted_at ? new Date(franchise.deleted_at).toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>
                <div style={fieldStyle}>
                  <span style={{ ...labelStyle, color: "#e11d48" }}>Deleted By</span>
                  <span style={{ ...valueStyle, color: "#be123c" }}>{franchise.deleted_by_name || "N/A"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", background: "#fafafa", alignItems: "center" }}>
          <span className={`text-xs font-semibold ${isDeleted ? "text-rose-600" : "text-emerald-600"}`}>
            {isDeleted ? "Soft Deleted Franchise" : "Active Franchise Store"}
          </span>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #cbd5e1", color: "#475569", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Franchise() {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [viewTab, setViewTab] = useState("active"); // "active" | "deleted"

  const loadFranchises = async (tab = viewTab) => {
    setLoading(true);
    try {
      const res = await getFranchises({ deleted: tab === "deleted" });
      setFranchises(res.data.data || []);
    } catch (err) {
      console.error("Failed to load franchises:", err);
      toast.error("Failed to load franchises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFranchises(viewTab);
  }, [viewTab]);

  const handleSoftDelete = async (franchise) => {
    if (!window.confirm(`Are you sure you want to soft delete franchise "${franchise.partner_name}" (${franchise.store_name})?\n\nIt will be moved to the Deleted Franchises view and can be restored anytime.`)) {
      return;
    }
    try {
      await deleteFranchise(franchise.id);
      toast.success("Franchise soft deleted successfully!");
      await loadFranchises(viewTab);
    } catch (err) {
      console.error("Failed to soft delete franchise:", err);
      toast.error(err?.response?.data?.message || "Failed to soft delete franchise.");
    }
  };

  const handleRestore = async (franchise) => {
    if (!window.confirm(`Are you sure you want to restore franchise "${franchise.partner_name}" (${franchise.store_name}) back to Active status?`)) {
      return;
    }
    try {
      await restoreFranchise(franchise.id);
      toast.success("Franchise restored successfully!");
      await loadFranchises(viewTab);
    } catch (err) {
      console.error("Failed to restore franchise:", err);
      toast.error(err?.response?.data?.message || "Failed to restore franchise.");
    }
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: "partner_name",
        label: "Partner Name",
        render: (row) => <span className="font-bold text-slate-800">{row.partner_name}</span>
      },
      {
        key: "partner_email",
        label: "Email",
        render: (row) => <span className="text-slate-600 font-medium">{row.partner_email || "N/A"}</span>
      },
      {
        key: "partner_mobile",
        label: "Phone",
        render: (row) => <span className="text-slate-600 font-medium">{row.partner_mobile}</span>
      },
      {
        key: "store_name",
        label: "Store Name",
        render: (row) => (
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
            viewTab === "deleted"
              ? "bg-rose-50 text-rose-700 border-rose-200/60"
              : "bg-emerald-50 text-emerald-700 border-emerald-100/50"
          }`}>
            {row.store_name}
          </span>
        )
      },
      {
        key: "bdm_area",
        label: "BDM Area",
        render: (row) => <span className="text-slate-600 font-medium">{row.bdm_area}</span>
      },
      {
        key: "inquiry_manager_name",
        label: "Inquiry Manager",
        render: (row) => <span className="text-slate-700 font-semibold">{row.inquiry_manager_name || "N/A"}</span>
      },
      {
        key: "final_opening_date",
        label: "Opening Date",
        render: (row) => {
          const dateVal = row.final_opening_date || row.tentative_opening_date;
          if (!dateVal) return "N/A";
          return (
            <span className="text-slate-600 font-medium">
              {new Date(dateVal).toLocaleDateString("en-IN")}
            </span>
          );
        }
      }
    ];

    if (viewTab === "deleted") {
      cols.push(
        {
          key: "deleted_at",
          label: "Deleted At",
          render: (row) => (
            <span className="text-rose-700 font-medium text-xs">
              {row.deleted_at ? new Date(row.deleted_at).toLocaleString("en-IN") : "N/A"}
            </span>
          )
        },
        {
          key: "deleted_by_name",
          label: "Deleted By",
          render: (row) => (
            <span className="text-slate-700 font-semibold text-xs">
              {row.deleted_by_name || "N/A"}
            </span>
          )
        }
      );
    }

    cols.push({
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          {viewTab === "active" ? (
            <>
              {/* Timeline / Stage Button */}
              <button
                onClick={() => navigate(`/user/franchises/${row.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-700 cursor-pointer transition-all hover:scale-[1.03] active:scale-95"
                title="View Onboarding Timeline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Timeline
              </button>

              {/* View Info Button */}
              <button
                onClick={() => {
                  setSelectedFranchise(row);
                  setIsViewOpen(true);
                }}
                className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700 cursor-pointer transition-all hover:scale-105"
                title="View Details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
                </svg>
              </button>

              {/* Soft Delete Button */}
              {hasPermission("franchise_master", "delete") && (
                <button
                  onClick={() => handleSoftDelete(row)}
                  className="flex w-8 h-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 cursor-pointer transition-all hover:scale-105"
                  title="Soft Delete Franchise"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h12m-1.5 0-.563 12.375A2.25 2.25 0 0113.693 21H10.307a2.25 2.25 0 01-2.244-2.125L7.5 7.5m3-3h3A1.5 1.5 0 0115 6v1.5H9V6a1.5 1.5 0 011.5-1.5Z" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <>
              {/* Restore Button */}
              {hasPermission("franchise_master", "delete") && (
                <button
                  onClick={() => handleRestore(row)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 cursor-pointer transition-all hover:scale-[1.03] active:scale-95"
                  title="Restore Franchise"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                  </svg>
                  Restore
                </button>
              )}

              {/* View Details Button */}
              <button
                onClick={() => {
                  setSelectedFranchise(row);
                  setIsViewOpen(true);
                }}
                className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700 cursor-pointer transition-all hover:scale-105"
                title="View Details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
                </svg>
              </button>
            </>
          )}
        </div>
      )
    });

    return cols;
  }, [viewTab, hasPermission, navigate]);

  const toggleActions = (
    <div className="inline-flex rounded-lg bg-slate-100/90 p-0.5 border border-slate-200 shadow-inner">
      <button
        type="button"
        onClick={() => setViewTab("active")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
          viewTab === "active"
            ? "bg-white text-blue-900 shadow-sm border border-slate-200/80"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Active
      </button>
      <button
        type="button"
        onClick={() => setViewTab("deleted")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
          viewTab === "deleted"
            ? "bg-rose-50 text-rose-700 shadow-sm border border-rose-200"
            : "text-slate-500 hover:text-rose-600"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        Deleted
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <DetailedFranchiseModal
        isOpen={isViewOpen}
        franchise={selectedFranchise}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedFranchise(null);
        }}
      />

      <main className="flex-1 w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DataTable
          tableId={viewTab === "active" ? "completed_franchises" : "deleted_franchises"}
          title={viewTab === "active" ? "Franchise" : "Deleted Franchises"}
          data={franchises}
          columns={columns}
          loading={loading}
          toggleActions={toggleActions}
          searchPlaceholder={viewTab === "active" ? "Search franchises..." : "Search deleted franchises..."}
        />
      </main>
    </div>
  );
}
