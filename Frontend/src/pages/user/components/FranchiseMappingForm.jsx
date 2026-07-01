import React, { useState, useEffect } from "react";
import { submitFranchiseMappingForm } from "../../../api/inProcessFranchiseApi";
import { getMobileBrands } from "../../../api/mobileBrandApi";
import { getBanks } from "../../../api/bankApi";
import toast from "react-hot-toast";

export default function FranchiseMappingForm({ franchiseId, franchiseMappingData, reloadFranchiseData }) {
  const [brands, setBrands] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedMappings, setSelectedMappings] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load brands, banks and initial mappings
  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [brandsRes, banksRes] = await Promise.all([
          getMobileBrands(),
          getBanks()
        ]);
        if (brandsRes.data?.success) {
          setBrands(brandsRes.data.data || []);
        }
        if (banksRes.data?.success) {
          setBanks(banksRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load master data for mapping:", err);
        toast.error("Failed to load brands or banks list.");
      } finally {
        setLoading(false);
      }
    };
    loadMasters();
  }, []);

  // Sync initial mapping data from backend
  useEffect(() => {
    if (franchiseMappingData) {
      const newSet = new Set();
      franchiseMappingData.forEach(m => {
        newSet.add(`${m.mobile_brand_id}-${m.bank_id}`);
      });
      setSelectedMappings(newSet);
    }
  }, [franchiseMappingData]);

  const handleToggle = (brandId, bankId) => {
    const key = `${brandId}-${bankId}`;
    setSelectedMappings(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAllBank = (bankId, isSelect) => {
    setSelectedMappings(prev => {
      const next = new Set(prev);
      brands.forEach(brand => {
        const key = `${brand.id}-${bankId}`;
        if (isSelect) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });
      return next;
    });
  };

  const handleSelectAllBrand = (brandId, isSelect) => {
    setSelectedMappings(prev => {
      const next = new Set(prev);
      banks.forEach(bank => {
        const key = `${brandId}-${bank.id}`;
        if (isSelect) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const mappingsArray = Array.from(selectedMappings).map(key => {
        const [brandId, bankId] = key.split("-").map(Number);
        return { mobile_brand_id: brandId, bank_id: bankId };
      });

      const res = await submitFranchiseMappingForm(franchiseId, mappingsArray);
      if (res.data?.success) {
        toast.success("Mapping details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save mapping");
      }
    } catch (err) {
      console.error("Error saving mapping details:", err);
      toast.error(err?.response?.data?.message || "Failed to save mapping details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-[#6804a1] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold">Loading mapping grid...</p>
        </div>
      </div>
    );
  }

  if (brands.length === 0 || banks.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">
          Please make sure you have added entries in both <span className="font-bold">Brand Master</span> and <span className="font-bold">Finance Company Master</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Top Span Header */}
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200/60 min-w-[180px]">
                FINANCE COMPANY
              </th>
              <th colSpan={brands.length} className="px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                BRAND
              </th>
            </tr>
            {/* Brands Header Row */}
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">
                {/* Blank corner */}
              </th>
              {brands.map(brand => (
                <th key={brand.id} className="px-3 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[100px]">
                  <div className="flex flex-col items-center gap-1.5">
                    <span>{brand.mobile_brand}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelectAllBrand(brand.id, true)}
                        className="text-[9px] text-[#6804a1] hover:underline font-semibold bg-transparent border-none cursor-pointer"
                        title="Select All for this Brand"
                      >
                        All
                      </button>
                      <span className="text-[9px] text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllBrand(brand.id, false)}
                        className="text-[9px] text-slate-400 hover:text-slate-600 hover:underline font-semibold bg-transparent border-none cursor-pointer"
                        title="Clear All for this Brand"
                      >
                        None
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {banks.map((bank) => (
              <tr key={bank.id} className="hover:bg-slate-50/40 transition-colors">
                {/* Bank row header */}
                <td className="px-4 py-3.5 text-xs font-bold text-slate-700 border-r border-slate-200/60 bg-slate-50/30">
                  <div className="flex items-center justify-between gap-4">
                    <span>{bank.bank_card_name}</span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectAllBank(bank.id, true)}
                        className="text-[9px] text-[#6804a1] hover:underline font-semibold bg-transparent border-none cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-[9px] text-slate-300">/</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllBank(bank.id, false)}
                        className="text-[9px] text-slate-400 hover:text-slate-600 hover:underline font-semibold bg-transparent border-none cursor-pointer"
                      >
                        None
                      </button>
                    </div>
                  </div>
                </td>
                {/* Brand checkboxes */}
                {brands.map(brand => {
                  const isChecked = selectedMappings.has(`${brand.id}-${bank.id}`);
                  return (
                    <td key={brand.id} className="px-3 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(brand.id, bank.id)}
                        className="w-4.5 h-4.5 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Mapping Details"}
        </button>
      </div>
    </form>
  );
}
