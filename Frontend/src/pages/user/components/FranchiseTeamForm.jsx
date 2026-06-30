import React, { useState, useEffect } from "react";
import { submitFranchiseTeamForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FranchiseTeamForm({ franchiseId, franchiseTeamData, reloadFranchiseData }) {
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (franchiseTeamData && Array.isArray(franchiseTeamData)) {
      // Map the incoming data to our local state
      setRoles(
        franchiseTeamData.map((r) => ({
          role_id: r.role_id,
          role_name: r.role_name,
          is_required: r.is_required,
          count: r.count || 0,
          is_selected: !!r.is_selected
        }))
      );
    }
  }, [franchiseTeamData]);

  const handleCheckboxChange = (roleId, checked) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role_id === roleId) {
          return {
            ...r,
            is_selected: checked,
            // If checking, set count to 1 if it's 0. If unchecking, set count to 0.
            count: checked ? (r.count > 0 ? r.count : 1) : 0
          };
        }
        return r;
      })
    );
  };

  const handleCountChange = (roleId, value) => {
    const numericValue = Math.max(0, parseInt(value, 10) || 0);
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role_id === roleId) {
          return {
            ...r,
            count: numericValue,
            is_selected: numericValue > 0
          };
        }
        return r;
      })
    );
  };

  const incrementCount = (roleId) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role_id === roleId) {
          const newCount = r.count + 1;
          return {
            ...r,
            count: newCount,
            is_selected: true
          };
        }
        return r;
      })
    );
  };

  const decrementCount = (roleId) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role_id === roleId) {
          const newCount = Math.max(0, r.count - 1);
          return {
            ...r,
            count: newCount,
            is_selected: newCount > 0
          };
        }
        return r;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      // Send only selected roles with count > 0
      const payload = roles.map((r) => ({
        role_id: r.role_id,
        count: r.count,
        is_selected: r.is_selected
      }));

      const res = await submitFranchiseTeamForm(franchiseId, payload);
      if (res.data?.success) {
        toast.success("Franchise Team details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving franchise team:", err);
      toast.error(err?.response?.data?.message || "Failed to save franchise team details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-slate-400 italic">No team roles available in the system.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.role_id}
            className={`p-4 rounded-xl border transition-all duration-250 flex items-center justify-between gap-4 ${
              r.is_selected
                ? "bg-purple-50/30 border-purple-200 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Checkbox and Label */}
            <label className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
              <input
                type="checkbox"
                checked={r.is_selected}
                onChange={(e) => handleCheckboxChange(r.role_id, e.target.checked)}
                className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-700 truncate">
                  {r.role_name}
                </span>
                {r.is_required === 1 && (
                  <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">
                    Required
                  </span>
                )}
              </div>
            </label>

            {/* Numeric Input with Inc/Dec Controls */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => decrementCount(r.role_id)}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-slate-500 font-bold transition-all text-xs cursor-pointer select-none active:bg-slate-200"
              >
                &minus;
              </button>
              <input
                type="number"
                min="0"
                value={r.count}
                onChange={(e) => handleCountChange(r.role_id, e.target.value)}
                className="w-10 text-center text-xs font-bold text-slate-800 focus:outline-hidden py-1 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => incrementCount(r.role_id)}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-500 font-bold transition-all text-xs cursor-pointer select-none active:bg-slate-200"
              >
                &#43;
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Team Details"}
        </button>
      </div>
    </form>
  );
}
