import React, { useState, useEffect } from "react";
import { submitFranchiseInstallationForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FranchiseInstallationForm({ franchiseId, franchiseInstallationData, reloadFranchiseData }) {
  const [apx, setApx] = useState(false);
  const [firewallDevice, setFirewallDevice] = useState(false);
  const [priceList, setPriceList] = useState(false);
  const [internetConnection, setInternetConnection] = useState(false);
  const [installationDate, setInstallationDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (franchiseInstallationData) {
      setApx(!!franchiseInstallationData.apx);
      setFirewallDevice(!!franchiseInstallationData.firewall_device);
      setPriceList(!!franchiseInstallationData.price_list);
      setInternetConnection(!!franchiseInstallationData.internet_connection);
      
      if (franchiseInstallationData.installation_date) {
        try {
          const d = new Date(franchiseInstallationData.installation_date);
          if (!isNaN(d.getTime())) {
            setInstallationDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setInstallationDate("");
        }
      } else {
        setInstallationDate("");
      }
      
      setRemarks(franchiseInstallationData.remarks || "");
    }
  }, [franchiseInstallationData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        apx,
        firewallDevice,
        priceList,
        internetConnection,
        installationDate: installationDate || null,
        remarks: remarks.trim()
      };

      const res = await submitFranchiseInstallationForm(franchiseId, payload);
      if (res.data?.success) {
        toast.success("Installation details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving franchise installation details:", err);
      toast.error(err?.response?.data?.message || "Failed to save franchise installation details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Installation Checklist */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
          Installation Checklist
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "APX", state: apx, setter: setApx },
            { label: "Firewall device", state: firewallDevice, setter: setFirewallDevice },
            { label: "Price list", state: priceList, setter: setPriceList },
            { label: "Internet connection", state: internetConnection, setter: setInternetConnection }
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer select-none ${
                item.state
                  ? "bg-purple-50/30 border-purple-200 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.setter(e.target.checked)}
                className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date & Remarks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
            Installation Date
          </label>
          <input
            type="date"
            value={installationDate}
            onChange={(e) => setInstallationDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
            Remarks
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter any installation remarks"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Installation Details"}
        </button>
      </div>
    </form>
  );
}
