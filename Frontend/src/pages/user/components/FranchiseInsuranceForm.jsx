import React, { useState, useEffect } from "react";
import { submitFranchiseInsuranceForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FranchiseInsuranceForm({ franchiseId, franchiseInsuranceData, reloadFranchiseData, getFileUrl }) {
  const [gstLocation, setGstLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (franchiseInsuranceData) {
      setGstLocation(franchiseInsuranceData.gst_location || "");
      
      if (franchiseInsuranceData.start_date) {
        try {
          const d = new Date(franchiseInsuranceData.start_date);
          if (!isNaN(d.getTime())) {
            setStartDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setStartDate("");
        }
      } else {
        setStartDate("");
      }

      if (franchiseInsuranceData.end_date) {
        try {
          const d = new Date(franchiseInsuranceData.end_date);
          if (!isNaN(d.getTime())) {
            setEndDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setEndDate("");
        }
      } else {
        setEndDate("");
      }

      setAmount(franchiseInsuranceData.amount || "");
      setImagePath(franchiseInsuranceData.image_path || "");
    }
  }, [franchiseInsuranceData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("gstLocation", gstLocation.trim());
      fd.append("startDate", startDate);
      fd.append("endDate", endDate);
      fd.append("amount", amount);
      if (imageFile) {
        fd.append("imageFile", imageFile);
      }

      const res = await submitFranchiseInsuranceForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Insurance details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Insurance details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Insurance details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
            GST Location
          </label>
          <input
            type="text"
            value={gstLocation}
            onChange={(e) => setGstLocation(e.target.value)}
            placeholder="Enter GST Location"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
          Upload Image
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50/50 border border-slate-150 rounded-xl">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-[#6804a1] hover:file:bg-purple-100 cursor-pointer"
          />
          {imagePath && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <a
                href={getFileUrl(imagePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#6804a1] hover:underline font-bold"
              >
                View Uploaded Image
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Insurance Details"}
        </button>
      </div>
    </form>
  );
}
