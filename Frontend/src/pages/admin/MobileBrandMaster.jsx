import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { getMobileBrands } from "../../api/mobileBrandApi";
import DataTable from "../../components/DataTable";
import { syncMasterData } from "../../api/syncApi";

import toast from "react-hot-toast";
import { usePermission } from "../../context/PermissionContext";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MobileBrandMaster() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { hasPermission } = usePermission();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Syncing brand data from external API...");
    try {
      const response = await syncMasterData({ syncBrands: true, syncCompanies: false, syncMachines: false });
      if (response.data?.success) {
        const addedCount = response.data.data?.mobileBrands?.added || 0;
        const skippedCount = response.data.data?.mobileBrands?.skipped || 0;
        toast.success(`Sync complete! Added: ${addedCount}, Skipped: ${skippedCount}`, { id: toastId });
        await loadBrands();
      } else {
        toast.error(response.data?.message || "Sync failed", { id: toastId });
      }
    } catch (err) {
      console.error("Failed to sync brand data", err);
      toast.error(err?.response?.data?.message || "Unable to sync brand data. Please try again.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const loadBrands = async () => {

    setLoading(true);
    setError("");
    try {
      const response = await getMobileBrands();
      setBrands(response.data.data || []);
    } catch (err) {
      console.error("Failed to load brands", err);
      setError("Unable to load brands. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const columns = useMemo(() => {
    const cols = [
      { key: "id", label: "ID", minWidth: "80px" },
      {
        key: "mobile_brand", label: "Brand Name",
        render: (row) => <span style={{ fontWeight: 700, color: "#0f172a" }}>{row.mobile_brand}</span>
      },
      {
        key: "for_code", label: "For Code",
        render: (row) => (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "700",
            background: row.for_code === "Yes" ? "#ecfdf5" : "#f1f5f9",
            color: row.for_code === "Yes" ? "#047857" : "#475569"
          }}>
            {row.for_code || "No"}
          </span>
        )
      }
    ];

    return cols;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#f8fafc", fontFamily: "'Inter',sans-serif" }}>
      <Navbar title="CRM Admin" />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", margin: "0 auto", padding: "32px 30px" }}>
        {error && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
            {error}
          </div>
        )}
        <DataTable
          tableId="mobile_brand_master"
          title="Brand Master"
          data={brands}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search brands..."
          actionButton={
            hasPermission("mobile_brand_master", "write") ? (
              <button
                onClick={handleSync}
                disabled={syncing || loading}
                style={{ display: "flex", width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 9, background: "#f1f5f9", color: "#475569", border: "1.5px solid #cbd5e1", cursor: (syncing || loading) ? "not-allowed" : "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                title="Sync Brand Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={syncing ? "animate-spin" : ""} style={{ width: 18, height: 18 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            ) : null
          }
        />
      </main>
    </div>
  );
}
