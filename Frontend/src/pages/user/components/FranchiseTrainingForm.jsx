import React, { useState, useEffect } from "react";
import { submitFranchiseTrainingForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

const DEFAULT_MODULES = [
  "APX software",
  "Finance",
  "Swipe",
  "Price list",
  "Contacts details department wise",
  "DFM (monthly working)",
  "Scanner"
];

export default function FranchiseTrainingForm({ franchiseId, franchiseTrainingData, reloadFranchiseData }) {
  const [modules, setModules] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (franchiseTrainingData && franchiseTrainingData.length > 0) {
      // Map and format incoming data
      const formatted = franchiseTrainingData.map(item => {
        let dateStr = "";
        if (item.training_date) {
          try {
            const d = new Date(item.training_date);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          } catch (e) {
            dateStr = "";
          }
        }
        return {
          module_name: item.module_name,
          is_done: !!item.is_done,
          trainer_name: item.trainer_name || "",
          person_name: item.person_name || "",
          phone_number: item.phone_number || "",
          training_date: dateStr
        };
      });
      setModules(formatted);
    } else {
      // Setup default empty modules
      const defaults = DEFAULT_MODULES.map(name => ({
        module_name: name,
        is_done: false,
        trainer_name: "",
        person_name: "",
        phone_number: "",
        training_date: ""
      }));
      setModules(defaults);
    }
  }, [franchiseTrainingData]);

  const handleFieldChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Clean dates to null if empty
      const cleanedModules = modules.map(m => ({
        ...m,
        training_date: m.training_date || null
      }));

      const res = await submitFranchiseTrainingForm(franchiseId, cleanedModules);
      if (res.data?.success) {
        toast.success("Training details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Training details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Training details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                Module
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-12">
                Done
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Trainer Name
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Person Name
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modules.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-slate-700 font-sans">
                  {item.module_name}
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={item.is_done}
                    onChange={(e) => handleFieldChange(idx, "is_done", e.target.checked)}
                    className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.trainer_name}
                    onChange={(e) => handleFieldChange(idx, "trainer_name", e.target.value)}
                    placeholder="Trainer name"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.person_name}
                    onChange={(e) => handleFieldChange(idx, "person_name", e.target.value)}
                    placeholder="Person name"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="tel"
                    value={item.phone_number}
                    onChange={(e) => handleFieldChange(idx, "phone_number", e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={item.training_date}
                    onChange={(e) => handleFieldChange(idx, "training_date", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                  />
                </td>
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
          {submitting ? "Saving..." : "Save Training Details"}
        </button>
      </div>
    </form>
  );
}
