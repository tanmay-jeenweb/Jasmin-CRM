import React, { useState, useEffect } from "react";
import { usePermission } from "../../../context/PermissionContext";
import {
  getUnmappedBranches,
  createMapping,
  deleteMapping,
  syncBranches
} from "../../../api/branchFranchiseMappingApi";
import toast from "react-hot-toast";

export default function FranchiseBranchMappingForm({ franchiseId, branchMapping, reloadFranchiseData }) {
  const { hasPermission } = usePermission();
  const canWrite = hasPermission("branch_franchise_mapping", "write");
  const canDelete = hasPermission("branch_franchise_mapping", "delete");

  const [branches, setBranches] = useState([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Search and dropdown states
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUnmappedBranches = async () => {
    setLoading(true);
    try {
      const res = await getUnmappedBranches();
      if (res.data?.success) {
        setBranches(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load unmapped branches:", err);
      toast.error("Failed to load unmapped branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!branchMapping) {
      loadUnmappedBranches();
    }
  }, [branchMapping]);

  // Click outside dropdown container closes it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#branch-select-container")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Autofills selection search query when selection updates
  useEffect(() => {
    if (selectedBranchCode && branches.length > 0) {
      const b = branches.find(item => item.branch_code === selectedBranchCode);
      if (b) {
        setSearchTerm(`${b.branch_name} (${b.branch_code})`);
      }
    } else if (!selectedBranchCode) {
      setSearchTerm("");
    }
  }, [selectedBranchCode, branches]);

  const handleMap = async (e) => {
    e.preventDefault();
    if (!selectedBranchCode) {
      toast.error("Please select a branch to map.");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Creating branch mapping...");
    try {
      const res = await createMapping({
        franchiseId,
        branchCode: selectedBranchCode
      });
      if (res.data?.success) {
        toast.success("Franchise mapped to branch successfully!", { id: toastId });
        setSelectedBranchCode("");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to create mapping link.", { id: toastId });
      }
    } catch (err) {
      console.error("Error creating mapping:", err);
      toast.error(err?.response?.data?.message || "Failed to create mapping link.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnmap = async () => {
    if (!branchMapping?.id) return;
    if (!window.confirm("Are you sure you want to unmap this franchise from the branch?")) return;
    setSubmitting(true);
    const toastId = toast.loading("Removing branch mapping...");
    try {
      const res = await deleteMapping(branchMapping.id);
      if (res.data?.success) {
        toast.success("Franchise unmapped successfully!", { id: toastId });
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to remove mapping.", { id: toastId });
      }
    } catch (err) {
      console.error("Error removing mapping:", err);
      toast.error(err?.response?.data?.message || "Failed to remove mapping.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

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
      await loadUnmappedBranches();
    } catch (err) {
      console.error("Failed to sync branches:", err);
      toast.error(err?.response?.data?.message || "Sync failed. Please check external API credentials or status.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter branches dynamically based on searchTerm text
  const filteredBranches = branches.filter(b =>
    (b.branch_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.branch_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.branch_city || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-6.5 h-6.5 border-2.5 border-[#6804a1] border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-xs font-bold text-slate-500">Loading branch data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {branchMapping ? (
        // Current mapping display
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Mapped Branch</span>
              <h4 className="text-sm font-extrabold text-slate-800">
                {branchMapping.branch_name}
              </h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Branch Code: <span className="text-[#6804a1] font-extrabold">{branchMapping.branch_code}</span>
              </p>
              {branchMapping.branch_city && (
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Location: {branchMapping.branch_city}, {branchMapping.branch_state}
                </p>
              )}
              <p className="text-[10px] text-slate-400 font-bold mt-2">
                Mapped at: {formatDate(branchMapping.created_at)}
              </p>
            </div>
            
            {canDelete && (
              <button
                type="button"
                onClick={handleUnmap}
                disabled={submitting}
                className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 font-bold py-2 px-4 rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Unmap Branch
              </button>
            )}
          </div>
        </div>
      ) : (
        // Map new branch
        <form onSubmit={handleMap} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full relative" id="branch-select-container">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
                Select Sync'd Branch *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="-- Search & Select Branch --"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                    if (selectedBranchCode) {
                      setSelectedBranchCode("");
                    }
                  }}
                  onFocus={() => setIsOpen(true)}
                  disabled={!canWrite || submitting}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#6804a1] bg-white disabled:opacity-50 pr-8"
                />
                
                {/* Clear / Chevron Action */}
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                  {(selectedBranchCode || searchTerm) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranchCode("");
                        setSearchTerm("");
                        setIsOpen(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={!canWrite || submitting}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Floating Dropdown List */}
              {isOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-50 divide-y divide-slate-50">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((b) => {
                      const isSelected = selectedBranchCode === b.branch_code;
                      return (
                        <div
                          key={b.branch_code}
                          role="button"
                          onClick={() => {
                            setSelectedBranchCode(b.branch_code);
                            setSearchTerm(`${b.branch_name} (${b.branch_code})`);
                            setIsOpen(false);
                          }}
                          className={`px-3 py-2 text-left text-xs font-semibold cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-purple-50 text-[#6804a1] font-bold" 
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="font-bold">{b.branch_name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Code: {b.branch_code} • {b.branch_city || "No City"}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2.5 text-center text-xs text-slate-400 italic">
                      No matching branches found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSync}
                disabled={!canWrite || syncing || submitting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition-all border border-slate-200 cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
                title="Pull latest active branches list from external system"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Sync Branches
              </button>
              
              <button
                type="submit"
                disabled={!canWrite || submitting || !selectedBranchCode}
                className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2 px-5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                Save Mapping
              </button>
            </div>
          </div>
          
          {branches.length === 0 && (
            <p className="text-[11px] text-slate-400 italic">
              No unmapped active branches available. Try syncing branches from the external system first.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
