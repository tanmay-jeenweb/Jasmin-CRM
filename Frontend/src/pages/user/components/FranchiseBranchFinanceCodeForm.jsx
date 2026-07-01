import React, { useState, useEffect } from "react";
import { submitFranchiseBranchFinanceCodeForm } from "../../../api/inProcessFranchiseApi";
import { getMobileBrands } from "../../../api/mobileBrandApi";
import { getFinanceMachines } from "../../../api/financeMachineApi";
import { getBanks } from "../../../api/bankApi";
import toast from "react-hot-toast";

export default function FranchiseBranchFinanceCodeForm({ franchiseId, franchiseBranchFinanceCodeData, reloadFranchiseData }) {
  const [brands, setBrands] = useState([]);
  const [machines, setMachines] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAndMergeData = async () => {
      setLoading(true);
      try {
        const [brandsRes, machinesRes, banksRes] = await Promise.all([
          getMobileBrands(),
          getFinanceMachines(),
          getBanks()
        ]);

        const masterBrands = brandsRes.data?.data || [];
        const masterMachines = machinesRes.data?.data || [];
        const masterCompanies = banksRes.data?.data || [];

        const savedBrands = franchiseBranchFinanceCodeData?.brands || [];
        const savedMachines = franchiseBranchFinanceCodeData?.machines || [];
        const savedCompanies = franchiseBranchFinanceCodeData?.companies || [];

        // Merge Brands
        const mergedBrands = masterBrands.map(mb => {
          const saved = savedBrands.find(sb => sb.brand_id === mb.id);
          return {
            brand_id: mb.id,
            brand_name: mb.mobile_brand,
            brand_code: saved ? saved.brand_code : ""
          };
        });

        // Merge Machines
        const mergedMachines = masterMachines.map(mm => {
          const saved = savedMachines.find(sm => sm.machine_id === mm.id);
          return {
            machine_id: mm.id,
            machine_name: mm.machine_name,
            tid: saved ? saved.tid : "",
            pos_id: saved ? saved.pos_id : "",
            serial_no: saved ? saved.serial_no : ""
          };
        });

        // Merge Companies
        const mergedCompanies = masterCompanies.map(mc => {
          const saved = savedCompanies.find(sc => sc.company_id === mc.id);
          return {
            company_id: mc.id,
            company_name: mc.bank_card_name,
            company_code: saved ? saved.company_code : ""
          };
        });

        setBrands(mergedBrands);
        setMachines(mergedMachines);
        setCompanies(mergedCompanies);
      } catch (err) {
        console.error("Failed to load branch finance code lists:", err);
        toast.error("Failed to load list of brands, machines, or companies.");
      } finally {
        setLoading(false);
      }
    };

    loadAndMergeData();
  }, [franchiseBranchFinanceCodeData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        brands: brands.filter(b => b.brand_code && b.brand_code.trim()),
        machines: machines.filter(m => (m.tid && m.tid.trim()) || (m.pos_id && m.pos_id.trim()) || (m.serial_no && m.serial_no.trim())),
        companies: companies.filter(c => c.company_code && c.company_code.trim())
      };

      const res = await submitFranchiseBranchFinanceCodeForm(franchiseId, payload);
      if (res.data?.success) {
        toast.success("Branch Finance Codes saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving branch finance codes:", err);
      toast.error(err?.response?.data?.message || "Failed to save branch finance codes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#6804a1] border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-xs font-bold text-slate-500">Loading master definitions...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Brand Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-[#6804a1] rounded-sm"></span>
          1. Brand Finance Codes
        </h3>
        {brands.length === 0 ? (
          <p className="text-xs italic text-slate-400">No brands defined in Brand Master.</p>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {brands.map((b, idx) => (
                <div key={b.brand_id} className="flex border-b border-slate-100 last:border-b-0 md:even:border-l border-slate-100 items-stretch">
                  <div className="w-1/3 bg-slate-50/70 px-4 py-3 flex items-center justify-center text-center border-r border-slate-100 font-extrabold text-[10px] text-slate-600 select-none uppercase tracking-wider">
                    {b.brand_name}
                  </div>
                  <div className="w-2/3 p-2 bg-white flex items-center">
                    <input
                      type="text"
                      value={b.brand_code}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrands(prev => prev.map((item, i) => i === idx ? { ...item, brand_code: val } : item));
                      }}
                      placeholder={`Enter ${b.brand_name} code`}
                      className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#6804a1] text-slate-800 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Finance Machine Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-[#6804a1] rounded-sm"></span>
          2. Finance Machine Details
        </h3>
        {machines.length === 0 ? (
          <p className="text-xs italic text-slate-400">No machines defined in Finance Machine Master.</p>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3 text-center border-r border-slate-200 w-1/4">Finance Machine</th>
                    <th className="px-4 py-3 text-center border-r border-slate-200 w-1/4">TID</th>
                    <th className="px-4 py-3 text-center border-r border-slate-200 w-1/4">POS ID</th>
                    <th className="px-4 py-3 text-center w-1/4">Serial NO</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((m, idx) => (
                    <tr key={m.machine_id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3 text-center bg-slate-50/40 border-r border-slate-200 font-extrabold text-[10px] text-slate-600 uppercase tracking-wider">
                        {m.machine_name}
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={m.tid}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMachines(prev => prev.map((item, i) => i === idx ? { ...item, tid: val } : item));
                          }}
                          placeholder="Enter TID"
                          className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#6804a1] text-slate-800 bg-white"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={m.pos_id}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMachines(prev => prev.map((item, i) => i === idx ? { ...item, pos_id: val } : item));
                          }}
                          placeholder="Enter POS ID"
                          className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#6804a1] text-slate-800 bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={m.serial_no}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMachines(prev => prev.map((item, i) => i === idx ? { ...item, serial_no: val } : item));
                          }}
                          placeholder="Enter Serial NO"
                          className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#6804a1] text-slate-800 bg-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. Finance Company Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-[#6804a1] rounded-sm"></span>
          3. Finance Company Codes
        </h3>
        {companies.length === 0 ? (
          <p className="text-xs italic text-slate-400">No finance companies defined in Finance Company Master.</p>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {companies.map((c, idx) => (
                <div key={c.company_id} className="flex border-b border-slate-100 last:border-b-0 md:even:border-l border-slate-100 items-stretch">
                  <div className="w-1/3 bg-slate-50/70 px-4 py-3 flex items-center justify-center text-center border-r border-slate-100 font-extrabold text-[10px] text-slate-600 select-none uppercase tracking-wider">
                    {c.company_name}
                  </div>
                  <div className="w-2/3 p-2 bg-white flex items-center">
                    <input
                      type="text"
                      value={c.company_code}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompanies(prev => prev.map((item, i) => i === idx ? { ...item, company_code: val } : item));
                      }}
                      placeholder={`Enter ${c.company_name} code`}
                      className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#6804a1] text-slate-800 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Branch Finance Codes"}
        </button>
      </div>
    </form>
  );
}
