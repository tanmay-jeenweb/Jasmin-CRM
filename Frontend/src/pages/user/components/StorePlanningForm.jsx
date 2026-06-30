import React, { useState, useEffect } from "react";
import { submitStorePlanningForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function StorePlanningForm({ franchiseId, storePlanningData, reloadFranchiseData, getFileUrl }) {
  const [mainBoardSignSize, setMainBoardSignSize] = useState("");
  const [interiorFile, setInteriorFile] = useState(null);
  const [interiorFileName, setInteriorFileName] = useState("");
  const [inshopBrandingFile, setInshopBrandingFile] = useState(null);
  const [inshopBrandingFileName, setInshopBrandingFileName] = useState("");
  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanFileName, setFloorPlanFileName] = useState("");
  const [billingFormatFile, setBillingFormatFile] = useState(null);
  const [billingFormatFileName, setBillingFormatFileName] = useState("");
  const [submittingStorePlanning, setSubmittingStorePlanning] = useState(false);

  useEffect(() => {
    if (storePlanningData) {
      setMainBoardSignSize(storePlanningData.main_board_sign_size || "");
      setInteriorFileName(storePlanningData.interior_file || "");
      setInshopBrandingFileName(storePlanningData.inshop_branding_file || "");
      setFloorPlanFileName(storePlanningData.floor_plan_file || "");
      setBillingFormatFileName(storePlanningData.billing_format_file || "");
    }
  }, [storePlanningData]);

  const handleStorePlanningSubmit = async (e) => {
    e.preventDefault();

    setSubmittingStorePlanning(true);
    try {
      const fd = new FormData();
      fd.append("mainBoardSignSize", mainBoardSignSize.trim());

      if (interiorFile) {
        fd.append("interiorFile", interiorFile);
      }
      if (inshopBrandingFile) {
        fd.append("inshopBrandingFile", inshopBrandingFile);
      }
      if (floorPlanFile) {
        fd.append("floorPlanFile", floorPlanFile);
      }
      if (billingFormatFile) {
        fd.append("billingFormatFile", billingFormatFile);
      }

      const res = await submitStorePlanningForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Store Planning details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Store Planning details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Store Planning details.");
    } finally {
      setSubmittingStorePlanning(false);
    }
  };

  return (
    <form onSubmit={handleStorePlanningSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        {/* Main Board Sign Size */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Main Board Sign Size</label>
          <input
            type="text"
            value={mainBoardSignSize}
            onChange={(e) => setMainBoardSignSize(e.target.value)}
            placeholder="Enter main board sign size"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>

        {/* Interior File */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Interior File</label>
          <input
            type="file"
            onChange={(e) => setInteriorFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {interiorFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(interiorFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={interiorFileName}
              >
                View Interior File
              </a>
            </div>
          )}
        </div>

        {/* Inshop Branding File */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Inshop Branding File</label>
          <input
            type="file"
            onChange={(e) => setInshopBrandingFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {inshopBrandingFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(inshopBrandingFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={inshopBrandingFileName}
              >
                View Inshop Branding File
              </a>
            </div>
          )}
        </div>

        {/* Floor Plan File */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Floor Plan File</label>
          <input
            type="file"
            onChange={(e) => setFloorPlanFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {floorPlanFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(floorPlanFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={floorPlanFileName}
              >
                View Floor Plan File
              </a>
            </div>
          )}
        </div>

        {/* Billing Format File */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Billing Format File</label>
          <input
            type="file"
            onChange={(e) => setBillingFormatFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {billingFormatFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(billingFormatFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={billingFormatFileName}
              >
                View Billing Format File
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submittingStorePlanning}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submittingStorePlanning ? "Saving..." : "Save Store Planning"}
        </button>
      </div>
    </form>
  );
}
