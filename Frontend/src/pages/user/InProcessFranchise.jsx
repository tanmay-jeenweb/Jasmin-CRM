import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  getInProcessFranchises,
  createInProcessFranchise,
  updateInProcessFranchise,
  deleteInProcessFranchise
} from "../../api/inProcessFranchiseApi";
import InProcessFranchiseModal from "./InProcessFranchiseModal";
import DataTable from "../../components/DataTable";
import toast from "react-hot-toast";

// ─── Detailed View Modal ──────────────────────────────────────────────────────
function DetailedInProcessFranchiseModal({ isOpen, franchise, onClose }) {
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

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 600, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", fontStyle: "normal", justifyContent: "space-between", background: "linear-gradient(135deg,#6804a1,#52037e)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Franchise Details</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>{franchise.partner_name}</p>
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
              <span style={{ ...valueStyle, display: "inline-block", background: "#f5f3ff", color: "#6804a1", padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd6fe" }}>
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
              <span style={labelStyle}>Created At</span>
              <span style={valueStyle}>{formatDate(franchise.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", background: "#fafafa" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #cbd5e1", color: "#475569", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InProcessFranchise() {
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);

  const loadFranchises = async () => {
    setLoading(true);
    try {
      const res = await getInProcessFranchises();
      setFranchises(res.data.data || []);
    } catch (err) {
      console.error("Failed to load in process franchises:", err);
      toast.error("Failed to load in-process franchises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFranchises();
  }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (selectedFranchise?.id) {
        // Edit mode
        await updateInProcessFranchise(selectedFranchise.id, data);
        toast.success("In Process Franchise updated successfully!");
      } else {
        // Create mode
        await createInProcessFranchise(data);
        toast.success("In Process Franchise created successfully!");
      }
      setIsModalOpen(false);
      setSelectedFranchise(null);
      await loadFranchises();
    } catch (err) {
      console.error("Failed to save franchise:", err);
      toast.error(err?.response?.data?.message || "Failed to save franchise.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this in-process franchise?")) return;
    try {
      await deleteInProcessFranchise(id);
      toast.success("In Process Franchise deleted successfully!");
      await loadFranchises();
    } catch (err) {
      console.error("Failed to delete franchise:", err);
      toast.error(err?.response?.data?.message || "Failed to delete franchise.");
    }
  };

  const columns = useMemo(() => [
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
        <span className="px-2 py-0.5 bg-indigo-50 text-[#6804a1] rounded-md text-xs font-bold border border-indigo-100/50">
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
      key: "tentative_opening_date",
      label: "Tentative Date",
      render: (row) => (
        <span className="text-slate-600 font-medium">
          {row.tentative_opening_date ? new Date(row.tentative_opening_date).toLocaleDateString("en-IN") : "N/A"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Stage Button */}
          <button
            onClick={() => navigate(`/user/in-process-franchises/${row.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 text-[#6804a1] cursor-pointer transition-all hover:scale-[1.03] active:scale-95"
            title="Stage / Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Stage
          </button>

          {/* View Button */}
          <button
            onClick={() => {
              setSelectedFranchise(row);
              setIsViewOpen(true);
            }}
            className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700 cursor-pointer"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
            </svg>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => {
              setSelectedFranchise(row);
              setIsModalOpen(true);
            }}
            className="flex w-8 h-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 text-[#6804a1] cursor-pointer"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931Z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => handleDelete(row.id)}
            className="flex w-8 h-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-rose-700 cursor-pointer"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h12m-1.5 0-.563 12.375A2.25 2.25 0 0113.693 21H10.307a2.25 2.25 0 01-2.244-2.125L7.5 7.5m3-3h3A1.5 1.5 0 0115 6v1.5H9V6a1.5 1.5 0 011.5-1.5Z" />
            </svg>
          </button>
        </div>
      )
    }
  ], []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <InProcessFranchiseModal
        isOpen={isModalOpen}
        franchise={selectedFranchise}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFranchise(null);
        }}
        onSave={handleSave}
        saving={saving}
      />

      <DetailedInProcessFranchiseModal
        isOpen={isViewOpen}
        franchise={selectedFranchise}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedFranchise(null);
        }}
      />

      <main className="flex-1 w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DataTable
          tableId="in_process_franchises"
          title="In Process Franchise"
          data={franchises}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search franchises..."
          actionButton={
            <button
              onClick={() => navigate("/user/in-process-franchises/create")}
              className="flex w-10 h-10 items-center justify-center rounded-lg bg-[#6804a1] hover:bg-[#52037e] text-white border-none cursor-pointer shadow-md transition-all"
              title="Create In Process Franchise"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          }
        />
      </main>
    </div>
  );
}
