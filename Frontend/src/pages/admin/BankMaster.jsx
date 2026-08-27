import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { getBanks } from "../../api/bankApi";
import DataTable from "../../components/DataTable";
import { syncMasterData } from "../../api/syncApi";

import toast from "react-hot-toast";
import { usePermission } from "../../context/PermissionContext";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BankMaster() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { hasPermission } = usePermission();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Syncing finance company data from external API...");
    try {
      const response = await syncMasterData({ syncBrands: false, syncCompanies: true, syncMachines: false });
      if (response.data?.success) {
        const addedCount = response.data.data?.financeCompanies?.added || 0;
        const skippedCount = response.data.data?.financeCompanies?.skipped || 0;
        toast.success(`Sync complete! Added: ${addedCount}, Skipped: ${skippedCount}`, { id: toastId });
        await loadBanks();
      } else {
        toast.error(response.data?.message || "Sync failed", { id: toastId });
      }
    } catch (err) {
      console.error("Failed to sync finance company data", err);
      toast.error(err?.response?.data?.message || "Unable to sync finance company data. Please try again.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const loadBanks = async () => {

    setLoading(true);
    setError("");
    try {
      const response = await getBanks();
      setBanks(response.data.data || []);
    } catch (err) {
      console.error("Failed to load finance companies", err);
      setError("Unable to load finance companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const columns = useMemo(() => {
    const cols = [
      { key: "id", label: "ID", minWidth: "80px" },
      {
        key: "bank_card_name", label: "Finance Company Name",
        render: (row) => <span style={{ fontWeight: 700, color: "#0f172a" }}>{row.bank_card_name}</span>
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
          tableId="bank_master"
          title="Finance Company Master"
          data={banks}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search finance companies..."
          actionButton={
            hasPermission("bank_master", "write") ? (
              <button
                onClick={handleSync}
                disabled={syncing || loading}
                style={{ display: "flex", width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 9, background: "#f1f5f9", color: "#475569", border: "1.5px solid #cbd5e1", cursor: (syncing || loading) ? "not-allowed" : "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                title="Sync Finance Company Data"
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
