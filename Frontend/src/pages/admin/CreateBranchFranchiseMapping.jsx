import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import {
  getUnmappedFranchises,
  getUnmappedBranches,
  createMapping
} from "../../api/branchFranchiseMappingApi";

export default function CreateBranchFranchiseMapping() {
  const navigate = useNavigate();
  const [unmappedFranchises, setUnmappedFranchises] = useState([]);
  const [unmappedBranches, setUnmappedBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Search/filter inputs for columns
  const [franchiseSearch, setFranchiseSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

  // Selected items for mapping
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [franchisesRes, branchesRes] = await Promise.all([
        getUnmappedFranchises(),
        getUnmappedBranches()
      ]);
      setUnmappedFranchises(franchisesRes.data.data || []);
      setUnmappedBranches(branchesRes.data.data || []);
    } catch (err) {
      console.error("Failed to load mapping master data", err);
      setError("Unable to load data. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMap = async () => {
    if (!selectedFranchise || !selectedBranch || saving) return;
    setSaving(true);
    const toastId = toast.loading("Creating mapping link...");
    try {
      await createMapping({
        franchiseId: selectedFranchise.id,
        branchCode: selectedBranch.branch_code
      });
      toast.success("Franchise mapped to branch successfully!", { id: toastId });
      setSelectedFranchise(null);
      setSelectedBranch(null);
      // Navigate back to the mappings list
      navigate("/admin/branch-franchise-mapping");
    } catch (err) {
      console.error("Failed to map branch to franchise", err);
      toast.error(err?.response?.data?.message || "Failed to create mapping link.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Filtered lists
  const filteredFranchises = useMemo(() => {
    return unmappedFranchises.filter((f) => {
      const search = franchiseSearch.toLowerCase();
      return (
        f.store_name?.toLowerCase().includes(search) ||
        f.partner_name?.toLowerCase().includes(search) ||
        f.city?.toLowerCase().includes(search) ||
        f.state?.toLowerCase().includes(search)
      );
    });
  }, [unmappedFranchises, franchiseSearch]);

  const filteredBranches = useMemo(() => {
    return unmappedBranches.filter((b) => {
      const search = branchSearch.toLowerCase();
      return (
        b.branch_name?.toLowerCase().includes(search) ||
        b.branch_code?.toLowerCase().includes(search) ||
        b.branch_city?.toLowerCase().includes(search) ||
        b.branch_state?.toLowerCase().includes(search)
      );
    });
  }, [unmappedBranches, branchSearch]);

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

        {/* Selection panel block */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 28 }}>

          {/* Left Column: Franchises */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 460 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}></span>
                Unmapped Franchises
                <span style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 8px", borderRadius: 12, color: "#64748b", marginLeft: "auto" }}>
                  {filteredFranchises.length} available
                </span>
              </h3>

              {/* Search Bar */}
              <div style={{ marginTop: 14, position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search by store name, partner, city..."
                  value={franchiseSearch}
                  onChange={(e) => setFranchiseSearch(e.target.value)}
                  style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px 8px 34px", fontSize: 14, outline: "none" }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.602Z" />
                </svg>
              </div>
            </div>

            {/* List */}
            <div style={{ padding: "16px 24px", flex: 1, overflowY: "auto", maxHeight: 340 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading franchises...</div>
              ) : filteredFranchises.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
                  {franchiseSearch ? "No matching franchises found" : "No unmapped franchises remaining"}
                </div>
              ) : (
                filteredFranchises.map((f) => {
                  const isSelected = selectedFranchise?.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFranchise(isSelected ? null : f)}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        border: isSelected ? "2px solid #6804a1" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#faf5ff" : "#fff",
                        marginBottom: 12,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isSelected ? "0 4px 10px rgba(104,4,161,0.06)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: isSelected ? "#52037e" : "#0f172a" }}>
                          {f.store_name}
                        </span>
                        {isSelected && (
                          <span style={{ color: "#6804a1", display: "flex", alignItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.74-5.24Z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                        Owner: <strong style={{ color: "#334155" }}>{f.partner_name}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 12, height: 12 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {f.city}, {f.state}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Branches */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 460 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}></span>
                Unmapped Branches
                <span style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 8px", borderRadius: 12, color: "#64748b", marginLeft: "auto" }}>
                  {filteredBranches.length} available
                </span>
              </h3>

              {/* Search Bar */}
              <div style={{ marginTop: 14, position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search by branch name, code, city..."
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px 8px 34px", fontSize: 14, outline: "none" }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.602Z" />
                </svg>
              </div>
            </div>

            {/* List */}
            <div style={{ padding: "16px 24px", flex: 1, overflowY: "auto", maxHeight: 340 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading branches...</div>
              ) : filteredBranches.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
                  {branchSearch ? "No matching branches found" : "No unmapped branches remaining. Sync branches from list page if needed."}
                </div>
              ) : (
                filteredBranches.map((b) => {
                  const isSelected = selectedBranch?.branch_code === b.branch_code;
                  return (
                    <div
                      key={b.branch_code}
                      onClick={() => setSelectedBranch(isSelected ? null : b)}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        border: isSelected ? "2px solid #6804a1" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#faf5ff" : "#fff",
                        marginBottom: 12,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isSelected ? "0 4px 10px rgba(104,4,161,0.06)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: isSelected ? "#52037e" : "#0f172a" }}>
                          {b.branch_name} <span style={{ fontWeight: 500, color: "#64748b", fontSize: 13 }}>({b.branch_code})</span>
                        </span>
                        {isSelected && (
                          <span style={{ color: "#6804a1", display: "flex", alignItems: "center", marginLeft: "auto" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.74-5.24Z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 12, height: 12 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {b.branch_city || "Unknown City"}, {b.branch_state || "Unknown State"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Submit block banner */}
        <div style={{
          background: selectedFranchise && selectedBranch ? "#faf5ff" : "#f1f5f9",
          border: selectedFranchise && selectedBranch ? "1.5px dashed #d8b4fe" : "1.5px solid #e2e8f0",
          borderRadius: 16,
          padding: "20px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          transition: "all 0.2s"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: selectedFranchise && selectedBranch ? "#f3e8ff" : "#e2e8f0",
              color: selectedFranchise && selectedBranch ? "#6804a1" : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.187 9.223c.182.111.349.25.497.415l3.181 3.53a4.13 4.13 0 1 1-6.185 5.57l-3.185-3.53a4.13 4.13 0 0 1 5.693-6.17M10.813 14.777l-3.18-3.53a4.13 4.13 0 1 1 6.183-5.57l3.186 3.53a4.13 4.13 0 0 1-5.693 6.17" />
              </svg>
            </div>
            <div>
              {selectedFranchise && selectedBranch ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Ready to Link Mapping</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Map franchise <strong style={{ color: "#6804a1" }}>{selectedFranchise.store_name}</strong> to branch <strong style={{ color: "#6804a1" }}>{selectedBranch.branch_name} ({selectedBranch.branch_code})</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>Mapping Selection Pending</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>Select one franchise and one branch from the columns above to enable mapping.</div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/admin/branch-franchise-mapping")}
              style={{
                padding: "11px 22px",
                borderRadius: 10,
                border: "1.5px solid #cbd5e1",
                background: "#fff",
                color: "#475569",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleMap}
              disabled={!selectedFranchise || !selectedBranch || saving}
              style={{
                padding: "11px 26px",
                borderRadius: 10,
                border: "none",
                background: (!selectedFranchise || !selectedBranch) ? "#cbd5e1" : (saving ? "#94a3b8" : "linear-gradient(135deg,#6804a1,#52037e)"),
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: (!selectedFranchise || !selectedBranch || saving) ? "not-allowed" : "pointer",
                boxShadow: (!selectedFranchise || !selectedBranch || saving) ? "none" : "0 4px 12px rgba(104,4,161,0.25)",
                transition: "all 0.2s"
              }}
            >
              {saving ? "Mapping…" : "Create Mapping Link"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
