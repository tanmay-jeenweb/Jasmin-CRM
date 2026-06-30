import React, { useState, useEffect } from "react";
import { submitDocPrepForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function DocPrepForm({ franchiseId, docPrepData, reloadFranchiseData, getFileUrl }) {
  const [dispatchDate, setDispatchDate] = useState("");
  const [dispatchName, setDispatchName] = useState("");
  const [dispatchFile, setDispatchFile] = useState(null);
  const [dispatchFileName, setDispatchFileName] = useState("");
  const [receiverDate, setReceiverDate] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverFile, setReceiverFile] = useState(null);
  const [receiverFileName, setReceiverFileName] = useState("");
  const [submittingDocPrep, setSubmittingDocPrep] = useState(false);

  const getLocalDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (docPrepData) {
      setDispatchDate(getLocalDateString(docPrepData.dispatch_date));
      setDispatchName(docPrepData.dispatch_name || "");
      setDispatchFileName(docPrepData.dispatch_file || "");
      setReceiverDate(getLocalDateString(docPrepData.receiver_date));
      setReceiverName(docPrepData.receiver_name || "");
      setReceiverFileName(docPrepData.receiver_file || "");
    }
  }, [docPrepData]);

  const handleDocPrepSubmit = async (e) => {
    e.preventDefault();

    setSubmittingDocPrep(true);
    try {
      const fd = new FormData();
      fd.append("dispatchDate", dispatchDate);
      fd.append("dispatchName", dispatchName.trim());
      fd.append("receiverDate", receiverDate);
      fd.append("receiverName", receiverName.trim());

      if (dispatchFile) {
        fd.append("dispatchFile", dispatchFile);
      }
      if (receiverFile) {
        fd.append("receiverFile", receiverFile);
      }

      const res = await submitDocPrepForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Document Preparation details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Document Preparation details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Document Preparation details.");
    } finally {
      setSubmittingDocPrep(false);
    }
  };

  return (
    <form onSubmit={handleDocPrepSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        {/* Dispatch Fields */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Dispatch Date</label>
          <input
            type="date"
            value={dispatchDate}
            onChange={(e) => setDispatchDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Dispatch Name</label>
          <input
            type="text"
            value={dispatchName}
            onChange={(e) => setDispatchName(e.target.value)}
            placeholder="Enter Dispatch Name"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Dispatch File</label>
          <input
            type="file"
            onChange={(e) => setDispatchFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {dispatchFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(dispatchFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={dispatchFileName}
              >
                View Dispatch File
              </a>
            </div>
          )}
        </div>

        {/* Receiver Fields */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Receiver Date</label>
          <input
            type="date"
            value={receiverDate}
            onChange={(e) => setReceiverDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Receiver Name</label>
          <input
            type="text"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="Enter Receiver Name"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Receiver File</label>
          <input
            type="file"
            onChange={(e) => setReceiverFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {receiverFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(receiverFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={receiverFileName}
              >
                View Receiver File
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submittingDocPrep}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submittingDocPrep ? "Saving..." : "Save Document Preparation"}
        </button>
      </div>
    </form>
  );
}
