import React, { useState, useEffect } from "react";
import { saveDocChecklist } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function DocumentChecklistForm({
  franchiseId,
  docChecklistData,
  isFrozen,
  reloadFranchiseData
}) {
  const [checklist, setChecklist] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (docChecklistData && Array.isArray(docChecklistData)) {
      setChecklist(
        docChecklistData.map((item) => ({
          ...item,
          is_required: Boolean(item.is_required)
        }))
      );
    }
  }, [docChecklistData]);

  const handleToggle = (masterId) => {
    if (isFrozen) return;
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.master_id === masterId) {
          return { ...item, is_required: !item.is_required };
        }
        return item;
      })
    );
  };

  const handleSelectAll = (selectVal) => {
    if (isFrozen) return;
    setChecklist((prev) =>
      prev.map((item) => ({ ...item, is_required: selectVal }))
    );
  };

  const handleResetToDefaults = () => {
    if (isFrozen) return;
    setChecklist((prev) =>
      prev.map((item) => ({
        ...item,
        is_required: Boolean(item.master_is_required)
      }))
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (isFrozen) {
      return toast.error("Agreement & GST is frozen. Document checklist cannot be modified.");
    }

    setSaving(true);
    try {
      const payload = checklist.map((item) => ({
        doc_type: item.doc_type,
        is_required: item.is_required ? 1 : 0
      }));

      const res = await saveDocChecklist(franchiseId, payload);
      if (res.data?.success) {
        toast.success("Document checklist saved successfully!");
        if (reloadFranchiseData) {
          await reloadFranchiseData();
        }
      } else {
        toast.error(res.data?.message || "Failed to save checklist");
      }
    } catch (err) {
      console.error("Error saving document checklist:", err);
      toast.error(err?.response?.data?.message || "Failed to save document checklist.");
    } finally {
      setSaving(false);
    }
  };

  const filteredChecklist = checklist.filter((item) =>
    item.doc_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = checklist.filter((i) => i.is_required).length;
  const totalCount = checklist.length;

  return (
    <div className="space-y-5">
      {/* Top Banner if Frozen */}
      {isFrozen && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 text-slate-600 text-xs font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            <strong className="text-slate-800">Checklist Locked:</strong> Agreement & GST has been finalized and frozen. Document requirements cannot be changed.
          </span>
        </div>
      )}

      {/* Info & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 border border-purple-100 rounded-xl p-4">
        <div>
          <h4 className="text-xs font-bold text-[#6804a1] uppercase tracking-wider">
            Required Documents Configuration
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the documents required for this franchise. Only ticked documents will be displayed in the <strong>Agreement & GST</strong> documents section.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="bg-purple-100 text-[#6804a1] font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap">
            {selectedCount} of {totalCount} Selected
          </span>
        </div>
      </div>

      {/* Search and Action Shortcuts */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document name..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-slate-400 absolute left-2.5 top-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {!isFrozen && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="text-[#6804a1] hover:underline font-semibold cursor-pointer px-2 py-1"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="text-slate-600 hover:underline font-semibold cursor-pointer px-2 py-1"
            >
              Deselect All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-slate-600 hover:underline font-semibold cursor-pointer px-2 py-1"
              title="Reset checklist to document master defaults"
            >
              Reset to Master Defaults
            </button>
          </div>
        )}
      </div>

      {/* Checklist Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Required</th>
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4 text-center">Upload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecklist.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                    {checklist.length === 0 ? "No documents found in Document Master." : "No documents match your search."}
                  </td>
                </tr>
              ) : (
                filteredChecklist.map((item) => (
                  <tr
                    key={item.master_id}
                    onClick={() => !isFrozen && handleToggle(item.master_id)}
                    className={`transition-colors ${
                      item.is_required
                        ? "bg-purple-50/20 hover:bg-purple-50/40"
                        : "hover:bg-slate-50/60"
                    } ${!isFrozen ? "cursor-pointer" : ""}`}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled={isFrozen}
                        checked={item.is_required}
                        onChange={() => handleToggle(item.master_id)}
                        className="w-4 h-4 text-[#6804a1] rounded border-slate-300 focus:ring-[#6804a1] cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span>{item.doc_type}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.is_uploaded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      {!isFrozen && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Saving Checklist...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Document Checklist
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
