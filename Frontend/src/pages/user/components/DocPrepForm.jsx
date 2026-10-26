import { useState, useEffect } from "react";
import { submitDocPrepForm, lockDocPrepForm } from "../../../api/inProcessFranchiseApi";
import LockConfirmationModal from "./LockConfirmationModal";
import toast from "react-hot-toast";

export default function DocPrepForm({ franchiseId, docPrepData, reloadFranchiseData, getFileUrl }) {
  // Section 1: HO -> Franchisee
  const [hoAgreementCompleted, setHoAgreementCompleted] = useState("");
  const [hoAgreementCompletionDate, setHoAgreementCompletionDate] = useState("");
  const [hoAgreementFile, setHoAgreementFile] = useState(null);
  const [hoAgreementFileName, setHoAgreementFileName] = useState("");

  const [dispatchDate, setDispatchDate] = useState("");
  const [dispatchName, setDispatchName] = useState("");
  const [dispatchFile, setDispatchFile] = useState(null);
  const [dispatchFileName, setDispatchFileName] = useState("");

  const [receiverDate, setReceiverDate] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverFile, setReceiverFile] = useState(null);
  const [receiverFileName, setReceiverFileName] = useState("");

  // Section 2: Franchisee -> HO
  const [franchiseAgreementCompleted, setFranchiseAgreementCompleted] = useState("");
  const [franchiseAgreementCompletionDate, setFranchiseAgreementCompletionDate] = useState("");
  const [franchiseAgreementFile, setFranchiseAgreementFile] = useState(null);
  const [franchiseAgreementFileName, setFranchiseAgreementFileName] = useState("");

  const [franchiseDispatchDate, setFranchiseDispatchDate] = useState("");
  const [franchiseDispatchName, setFranchiseDispatchName] = useState("");
  const [franchiseDispatchFile, setFranchiseDispatchFile] = useState(null);
  const [franchiseDispatchFileName, setFranchiseDispatchFileName] = useState("");

  const [hoReceiverDate, setHoReceiverDate] = useState("");
  const [hoReceiverName, setHoReceiverName] = useState("");
  const [hoReceiverFile, setHoReceiverFile] = useState(null);
  const [hoReceiverFileName, setHoReceiverFileName] = useState("");

  const [submittingDocPrep, setSubmittingDocPrep] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [locking, setLocking] = useState(false);

  const isLocked = Boolean(docPrepData?.is_locked);

  const getLocalDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (docPrepData) {
      // Section 1: HO -> Franchisee
      setHoAgreementCompleted(docPrepData.ho_agreement_completed || "");
      setHoAgreementCompletionDate(getLocalDateString(docPrepData.ho_agreement_completion_date));
      setHoAgreementFileName(docPrepData.ho_agreement_file || "");

      setDispatchDate(getLocalDateString(docPrepData.dispatch_date));
      setDispatchName(docPrepData.dispatch_name || "");
      setDispatchFileName(docPrepData.dispatch_file || "");

      setReceiverDate(getLocalDateString(docPrepData.receiver_date));
      setReceiverName(docPrepData.receiver_name || "");
      setReceiverFileName(docPrepData.receiver_file || "");

      // Section 2: Franchisee -> HO
      setFranchiseAgreementCompleted(docPrepData.franchise_agreement_completed || "");
      setFranchiseAgreementCompletionDate(getLocalDateString(docPrepData.franchise_agreement_completion_date));
      setFranchiseAgreementFileName(docPrepData.franchise_agreement_file || "");

      setFranchiseDispatchDate(getLocalDateString(docPrepData.franchise_dispatch_date));
      setFranchiseDispatchName(docPrepData.franchise_dispatch_name || "");
      setFranchiseDispatchFileName(docPrepData.franchise_dispatch_file || "");

      setHoReceiverDate(getLocalDateString(docPrepData.ho_receiver_date));
      setHoReceiverName(docPrepData.ho_receiver_name || "");
      setHoReceiverFileName(docPrepData.ho_receiver_file || "");
    }
  }, [docPrepData]);

  const handleDocPrepSubmit = async (e) => {
    e.preventDefault();

    setSubmittingDocPrep(true);
    try {
      const fd = new FormData();

      // Section 1: HO -> Franchisee
      fd.append("hoAgreementCompleted", hoAgreementCompleted || "");
      fd.append("hoAgreementCompletionDate", hoAgreementCompleted === "Yes" ? hoAgreementCompletionDate : "");
      fd.append("dispatchDate", dispatchDate || "");
      fd.append("dispatchName", dispatchName.trim());
      fd.append("receiverDate", receiverDate || "");
      fd.append("receiverName", receiverName.trim());

      if (hoAgreementFile) {
        fd.append("hoAgreementFile", hoAgreementFile);
      }
      if (dispatchFile) {
        fd.append("dispatchFile", dispatchFile);
      }
      if (receiverFile) {
        fd.append("receiverFile", receiverFile);
      }

      // Section 2: Franchisee -> HO
      fd.append("franchiseAgreementCompleted", franchiseAgreementCompleted || "");
      fd.append("franchiseAgreementCompletionDate", franchiseAgreementCompleted === "Yes" ? franchiseAgreementCompletionDate : "");
      fd.append("franchiseDispatchDate", franchiseDispatchDate || "");
      fd.append("franchiseDispatchName", franchiseDispatchName.trim());
      fd.append("hoReceiverDate", hoReceiverDate || "");
      fd.append("hoReceiverName", hoReceiverName.trim());

      if (franchiseAgreementFile) {
        fd.append("franchiseAgreementFile", franchiseAgreementFile);
      }
      if (franchiseDispatchFile) {
        fd.append("franchiseDispatchFile", franchiseDispatchFile);
      }
      if (hoReceiverFile) {
        fd.append("hoReceiverFile", hoReceiverFile);
      }

      const res = await submitDocPrepForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Agreement Status details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Agreement Status details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Agreement Status details.");
    } finally {
      setSubmittingDocPrep(false);
    }
  };

  const handleLockConfirm = async () => {
    setLocking(true);
    try {
      const res = await lockDocPrepForm(franchiseId);
      if (res.data?.success) {
        toast.success("Agreement Status locked successfully!");
        setIsLockModalOpen(false);
        if (reloadFranchiseData) {
          await reloadFranchiseData();
        }
      } else {
        toast.error(res.data?.message || "Failed to lock section");
      }
    } catch (err) {
      console.error("Error locking Agreement Status:", err);
      toast.error(err?.response?.data?.message || "Failed to lock Agreement Status.");
    } finally {
      setLocking(false);
    }
  };

  return (
    <form onSubmit={handleDocPrepSubmit} className="space-y-8">
      {/* Locked Status Banner */}
      {isLocked && (
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Agreement Status Locked
              <span className="text-[10px] bg-slate-200 text-slate-700 uppercase font-extrabold px-2 py-0.5 rounded-full">
                Locked
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This section is finalized and locked
              {docPrepData?.locked_by_name ? ` by ${docPrepData.locked_by_name}` : ""}
              {docPrepData?.locked_at ? ` on ${new Date(docPrepData.locked_at).toLocaleDateString()}` : ""}.
              Modifications are disabled unless unlocked by an Administrator in Approvals.
            </p>
          </div>
        </div>
      )}

      <fieldset disabled={isLocked} className="space-y-8 disabled:opacity-85">
        {/* SECTION 1: HO -> FRANCHISEE */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6804a1]"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6804a1]">
            Agreement Status: Head Office (HO) to Franchisee
          </h4>
        </div>

        {/* Row 1: Agreement Completed Radio Button */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Agreement Completed
          </label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="hoAgreementCompleted"
                value="Yes"
                checked={hoAgreementCompleted === "Yes"}
                onChange={(e) => setHoAgreementCompleted(e.target.value)}
                className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] cursor-pointer"
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="hoAgreementCompleted"
                value="No"
                checked={hoAgreementCompleted === "No"}
                onChange={(e) => setHoAgreementCompleted(e.target.value)}
                className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] cursor-pointer"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Conditional Document Completion Date and Upload */}
        {hoAgreementCompleted === "Yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl border border-purple-100 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Date of Document Completion
              </label>
              <input
                type="date"
                value={hoAgreementCompletionDate}
                onChange={(e) => setHoAgreementCompletionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Upload Document
              </label>
              <input
                type="file"
                onChange={(e) => setHoAgreementFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
              />
              {hoAgreementFileName && (
                <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <a
                    href={getFileUrl(hoAgreementFileName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                    title={hoAgreementFileName}
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Rows: Dispatch (HO) & Receiver (Franchisee) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-1">
          {/* Dispatch Fields (HO) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Dispatch Date (HO)
            </label>
            <input
              type="date"
              value={dispatchDate}
              onChange={(e) => setDispatchDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Dispatch Name (HO)
            </label>
            <input
              type="text"
              value={dispatchName}
              onChange={(e) => setDispatchName(e.target.value)}
              placeholder="Enter Dispatch Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Dispatch File (HO)
            </label>
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

          {/* Receiver Fields (Franchisee) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Receiver Date (Franchisie)
            </label>
            <input
              type="date"
              value={receiverDate}
              onChange={(e) => setReceiverDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Receiver Name (Franchisie)
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="Enter Receiver Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Receiver File (Franchisie)
            </label>
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
      </div>

      {/* SECTION 2: FRANCHISEE -> HO */}
      <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6804a1]"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6804a1]">
            Agreement Status: Franchisee to Head Office (HO)
          </h4>
        </div>

        {/* Row 1: Agreement Completed Radio Button */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Agreement Completed
          </label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="franchiseAgreementCompleted"
                value="Yes"
                checked={franchiseAgreementCompleted === "Yes"}
                onChange={(e) => setFranchiseAgreementCompleted(e.target.value)}
                className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] cursor-pointer"
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="franchiseAgreementCompleted"
                value="No"
                checked={franchiseAgreementCompleted === "No"}
                onChange={(e) => setFranchiseAgreementCompleted(e.target.value)}
                className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] cursor-pointer"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Conditional Document Completion Date and Upload */}
        {franchiseAgreementCompleted === "Yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl border border-purple-100 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Date of Document Completion
              </label>
              <input
                type="date"
                value={franchiseAgreementCompletionDate}
                onChange={(e) => setFranchiseAgreementCompletionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Upload Document
              </label>
              <input
                type="file"
                onChange={(e) => setFranchiseAgreementFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
              />
              {franchiseAgreementFileName && (
                <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <a
                    href={getFileUrl(franchiseAgreementFileName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                    title={franchiseAgreementFileName}
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Rows: Dispatch (Franchisee) & Receiver (HO) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-1">
          {/* Dispatch Fields (Franchisee) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Dispatch Date (Franchisie)
            </label>
            <input
              type="date"
              value={franchiseDispatchDate}
              onChange={(e) => setFranchiseDispatchDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Dispatch Name (Franchisie)
            </label>
            <input
              type="text"
              value={franchiseDispatchName}
              onChange={(e) => setFranchiseDispatchName(e.target.value)}
              placeholder="Enter Dispatch Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Dispatch File (Franchisie)
            </label>
            <input
              type="file"
              onChange={(e) => setFranchiseDispatchFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
            {franchiseDispatchFileName && (
              <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <a
                  href={getFileUrl(franchiseDispatchFileName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                  title={franchiseDispatchFileName}
                >
                  View Dispatch File
                </a>
              </div>
            )}
          </div>

          {/* Receiver Fields (HO) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Receiver Date (HO)
            </label>
            <input
              type="date"
              value={hoReceiverDate}
              onChange={(e) => setHoReceiverDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Receiver Name (HO)
            </label>
            <input
              type="text"
              value={hoReceiverName}
              onChange={(e) => setHoReceiverName(e.target.value)}
              placeholder="Enter Receiver Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Receiver File (HO)
            </label>
            <input
              type="file"
              onChange={(e) => setHoReceiverFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
            {hoReceiverFileName && (
              <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <a
                  href={getFileUrl(hoReceiverFileName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                  title={hoReceiverFileName}
                >
                  View Receiver File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </fieldset>

      {/* ACTION BUTTONS */}
      {!isLocked ? (
        <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submittingDocPrep}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-5 rounded-xl border border-slate-300 transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {submittingDocPrep ? "Saving..." : "Save Agreement Status"}
          </button>
          <button
            type="button"
            onClick={() => setIsLockModalOpen(true)}
            disabled={submittingDocPrep}
            className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Submit & Lock Agreement Status</span>
          </button>
        </div>
      ) : (
        <div className="pt-2 flex justify-end">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 text-xs font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Section Locked
          </span>
        </div>
      )}

      {/* Double Check Lock Confirmation Modal */}
      <LockConfirmationModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        onConfirm={handleLockConfirm}
        loading={locking}
        title="Lock Agreement Status"
        subtitle="This action will freeze all Head Office & Franchisee agreement dispatch and reception data."
        warningText="Once locked, all form fields, file uploads, and tracking entries will be strictly read-only. You will not be able to edit or upload new documents unless an Administrator grants an unlock in the Approvals section."
        confirmButtonText="Confirm & Lock Status"
      />
    </form>
  );
}
