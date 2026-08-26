import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DataTable from "../../components/DataTable";
import toast from "react-hot-toast";
import { usePermission } from "../../context/PermissionContext";
import {
  syncBranches,
  getAllMappings,
  deleteMapping
} from "../../api/branchFranchiseMappingApi";

export default function BranchFranchiseMappingMaster() {
  const navigate = useNavigate();
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const { hasPermission } = usePermission();

  const loadMappings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllMappings();
      setMappings(response.data.data || []);
    } catch (err) {
      console.error("Failed to load mappings data", err);
      setError("Unable to load mappings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    const toastId = toast.loading("Syncing branches from external API...");
    try {
      const res = await syncBranches();
      const summary = res.data.data;
      toast.success(
        `Sync successful! Total: ${summary.total}, New: ${summary.inserted}, Updated: ${summary.updated}`,
        { id: toastId, duration: 4000 }
      );
      await loadMappings();
    } catch (err) {
      console.error("Failed to sync branches", err);
      toast.error(err?.response?.data?.message || "Sync failed. Please check credentials or API status.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const handleUnmap = async (id) => {
    if (!window.confirm("Are you sure you want to unmap this franchise and branch? This will delete the mapping link.")) return;
    const toastId = toast.loading("Removing mapping link...");
    try {
      await deleteMapping(id);
      toast.success("Franchise unmapped successfully", { id: toastId });
      await loadMappings();
    } catch (err) {
      console.error("Failed to unmap", err);
      toast.error(err?.response?.data?.message || "Failed to remove mapping.", { id: toastId });
    }
  };

  const columns = useMemo(() => {
    const cols = [
      { key: "id", label: "Mapping ID", minWidth: "90px" },
      {
        key: "franchise_name",
        label: "Franchise Name",
        render: (row) => <span style={{ fontWeight: 700, color: "#1e293b" }}>{row.franchise_name}</span>
      },
      {
        key: "branch_name",
        label: "Mapped Branch",
        render: (row) => (
          <span style={{ fontWeight: 600, color: "#52037e" }}>
            {row.branch_name} ({row.branch_code})
          </span>
        )
      },
      { key: "submitted_by_name", label: "Mapped By", minWidth: "150px" },
      {
        key: "created_at",
        label: "Mapped At",
        render: (row) => <span>{new Date(row.created_at).toLocaleString()}</span>
      }
    ];

    if (hasPermission("branch_franchise_mapping", "delete")) {
      cols.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        minWidth: "80px",
        render: (row) => (
          <button
            onClick={() => handleUnmap(row.id)}
            style={{
              display: "flex",
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "1px solid #fecdd3",
              background: "#fff1f2",
              color: "#be123c",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#ffe4e6";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff1f2";
            }}
            title="Unmap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: 16, height: 16 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.187 9.223c.182.111.349.25.497.415l3.181 3.53a4.13 4.13 0 11-6.185 5.57l-3.185-3.53a4.13 4.13 0 015.693-6.17M10.813 14.777l-3.18-3.53a4.13 4.13 0 1 1 6.183-5.57l3.186 3.53a4.13 4.13 0 0 1-5.693 6.17m-2.22-3.18l6.36-6.36"
              />
            </svg>
          </button>
        )
      });
    }

    return cols;
  }, [hasPermission]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#f8fafc", fontFamily: "'Inter',sans-serif", minHeight: "100vh" }}>
      <Navbar title="CRM Admin" />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: 1400, margin: "0 auto", padding: "32px 30px" }}>
        
        {/* Error notification */}
        {error && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", padding: "14px 18px", borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 500, display: "flex", justifyContent: "between", alignItems: "center" }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#be123c", fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}>Dismiss</button>
          </div>
        )}

        {/* Existing mapping table */}
        <div style={{ flex: 1 }}>
          <DataTable
            tableId="branch_franchise_mapping"
            title="Branch Franchise Mappings"
            data={mappings}
            columns={columns}
            loading={loading}
            searchPlaceholder="Search mappings..."
            toggleActions={
              hasPermission("branch_franchise_mapping", "write") ? (
                <button
                  onClick={handleSync}
                  disabled={syncing || loading}
                  className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                    syncing
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 cursor-pointer"
                  }`}
                  title="Sync Branches from ERP"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  {syncing ? "Syncing..." : "Sync Branches"}
                </button>
              ) : null
            }
            actionButton={
              hasPermission("branch_franchise_mapping", "write") ? (
                <button
                  onClick={() => navigate("/admin/branch-franchise-mapping/create")}
                  style={{
                    display: "flex",
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9,
                    background: "linear-gradient(135deg,#6804a1,#52037e)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(104,4,161,0.35)",
                    transition: "all 0.2s"
                  }}
                  title="Create Mapping"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    style={{ width: 18, height: 18 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              ) : null
            }
          />
        </div>

      </main>
    </div>
  );
}
