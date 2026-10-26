import React, { useState, useEffect } from "react";
import { submitInternalAgreementForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function InternalAgreementForm({
  franchiseId,
  internalAgreementData,
  reloadFranchiseData,
  getFileUrl,
}) {
  const [internalAgreementFile, setInternalAgreementFile] = useState(null);
  const [internalAgreementFileName, setInternalAgreementFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (internalAgreementData) {
      setInternalAgreementFileName(internalAgreementData.internal_agreement_file || "");
    }
  }, [internalAgreementData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!internalAgreementFile && !internalAgreementFileName) {
      toast.error("Please select a file to upload.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      if (internalAgreementFile) {
        fd.append("internalAgreementFile", internalAgreementFile);
      }

      const res = await submitInternalAgreementForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Internal Agreement Status saved successfully!");
        setInternalAgreementFile(null);
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save Internal Agreement details.");
      }
    } catch (err) {
      console.error("Error saving Internal Agreement details:", err);
      toast.error(
        err?.response?.data?.message || "Failed to save Internal Agreement details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Internal Agreement Document <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Upload the signed internal agreement document (PDF, DOC, DOCX, or Image).
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setInternalAgreementFile(e.target.files[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer border border-dashed border-slate-300 rounded-xl p-3 bg-white hover:border-[#6804a1]/50 transition-colors"
          />

          {internalAgreementFile && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 bg-purple-50/80 px-3 py-1.5 rounded-lg border border-purple-100 w-fit">
              <span className="font-semibold text-[#6804a1]">Selected:</span>
              <span className="truncate max-w-sm">{internalAgreementFile.name}</span>
            </div>
          )}

          {internalAgreementFileName && (
            <div className="mt-3 flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 w-fit shadow-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-[#6804a1]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <a
                href={getFileUrl(internalAgreementFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={internalAgreementFileName}
              >
                View Uploaded Document
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
          {submitting ? "Saving..." : "Save Internal Agreement"}
        </button>
      </div>
    </form>
  );
}
