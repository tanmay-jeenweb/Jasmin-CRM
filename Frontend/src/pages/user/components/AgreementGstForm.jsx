import { useState, useEffect } from "react";
import { submitAgreementGstForm, submitSingleDocument, freezeAgreementGst } from "../../../api/inProcessFranchiseApi";
import FreezeConfirmationModal from "./FreezeConfirmationModal";
import toast from "react-hot-toast";

export default function AgreementGstForm({
  franchiseId,
  agreementGstData,
  docChecklist,
  masterDocs,
  reloadFranchiseData,
  getFileUrl
}) {
  const [partnerDate, setPartnerDate] = useState("");
  const [gstRegistrationDate, setGstRegistrationDate] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [additionalBusinessAddress, setAdditionalBusinessAddress] = useState("");
  const [serialNumberGstForm, setSerialNumberGstForm] = useState("");
  const [agreementGstDocs, setAgreementGstDocs] = useState([]);
  const [submittingAgreementGst, setSubmittingAgreementGst] = useState(false);
  const [submittingDocIndices, setSubmittingDocIndices] = useState({});
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezing, setFreezing] = useState(false);

  const isFrozen = Boolean(agreementGstData?.is_frozen);

  const getLocalDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (agreementGstData) {
      setPartnerDate(getLocalDateString(agreementGstData.partner_date));
      setGstRegistrationDate(getLocalDateString(agreementGstData.gst_registration_date));
      setGstNumber(agreementGstData.gst_number || "");
      setAdditionalBusinessAddress(agreementGstData.additional_business_address || "");
      setSerialNumberGstForm(agreementGstData.serial_number_gst_form || "");
    }

    const savedDocs = agreementGstData?.documents || [];

    // Determine the list of documents that are selected for this franchise
    let selectedSources = [];
    if (docChecklist && Array.isArray(docChecklist) && docChecklist.length > 0) {
      selectedSources = docChecklist.filter((d) => d.is_required === 1 || d.is_required === true);
    } else if (masterDocs && Array.isArray(masterDocs) && masterDocs.length > 0) {
      selectedSources = masterDocs.filter((d) => d.is_required === 1 || d.is_required === true);
    }

    const merged = selectedSources.map((item) => {
      const existingSaved = savedDocs.find(
        (sd) => sd.doc_type?.toLowerCase() === item.doc_type?.toLowerCase()
      );
      return {
        doc_type: item.doc_type,
        document_path: existingSaved?.document_path || item.document_path || "",
        expiry_date: getLocalDateString(existingSaved?.expiry_date || item.expiry_date),
        file: null
      };
    });

    setAgreementGstDocs(merged);
  }, [agreementGstData, docChecklist, masterDocs]);

  const handleDocFieldChange = (index, field, value) => {
    if (isFrozen) return;
    const updated = [...agreementGstDocs];
    updated[index][field] = value;
    setAgreementGstDocs(updated);
  };

  // Submit an individual document
  const handleSingleDocSubmit = async (index) => {
    if (isFrozen) {
      return toast.error("Agreement & GST is frozen and cannot be modified.");
    }

    const doc = agreementGstDocs[index];
    if (!doc.doc_type) {
      return toast.error("Document type is missing.");
    }
    if (!doc.file && !doc.document_path) {
      return toast.error(`Please select a file to upload for ${doc.doc_type}.`);
    }

    setSubmittingDocIndices((prev) => ({ ...prev, [index]: true }));
    try {
      const fd = new FormData();
      fd.append("docType", doc.doc_type);
      fd.append("expiryDate", doc.expiry_date || "");
      if (doc.file) {
        fd.append("file", doc.file);
      }

      const res = await submitSingleDocument(franchiseId, fd);
      if (res.data?.success) {
        toast.success(`${doc.doc_type} submitted successfully!`);
        // Update local state for that document
        const updatedDocs = [...agreementGstDocs];
        updatedDocs[index] = {
          ...updatedDocs[index],
          document_path: res.data.data?.document_path || doc.document_path,
          file: null
        };
        setAgreementGstDocs(updatedDocs);

        if (reloadFranchiseData) {
          await reloadFranchiseData();
        }
      } else {
        toast.error(res.data?.message || `Failed to submit ${doc.doc_type}`);
      }
    } catch (err) {
      console.error(`Error submitting ${doc.doc_type}:`, err);
      toast.error(err?.response?.data?.message || `Failed to submit ${doc.doc_type}`);
    } finally {
      setSubmittingDocIndices((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Save the basic details (Partner Date, GST number, etc.)
  const handleBasicDetailsSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isFrozen) {
      return toast.error("Agreement & GST is frozen and cannot be modified.");
    }

    setSubmittingAgreementGst(true);
    try {
      const fd = new FormData();
      fd.append("partnerDate", partnerDate);
      fd.append("gstRegistrationDate", gstRegistrationDate);
      fd.append("gstNumber", gstNumber.trim());
      fd.append("additionalBusinessAddress", additionalBusinessAddress.trim());
      fd.append("serialNumberGstForm", serialNumberGstForm.trim());

      const res = await submitAgreementGstForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Agreement & GST details saved successfully!");
        if (reloadFranchiseData) {
          await reloadFranchiseData();
        }
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Agreement & GST details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Agreement & GST details.");
    } finally {
      setSubmittingAgreementGst(false);
    }
  };

  // Confirm final submission & freeze
  const handleConfirmFreeze = async () => {
    setFreezing(true);
    try {
      const res = await freezeAgreementGst(franchiseId);
      if (res.data?.success) {
        toast.success("Agreement & GST finalized and frozen successfully!");
        setIsFreezeModalOpen(false);
        if (reloadFranchiseData) {
          await reloadFranchiseData();
        }
      } else {
        toast.error(res.data?.message || "Failed to finalize form");
      }
    } catch (err) {
      console.error("Error freezing Agreement & GST:", err);
      toast.error(err?.response?.data?.message || "Failed to finalize form.");
    } finally {
      setFreezing(false);
    }
  };

  // Check if ALL required documents are submitted completely
  const totalRequiredDocs = agreementGstDocs.length;
  const submittedRequiredDocs = agreementGstDocs.filter((d) => Boolean(d.document_path)).length;
  const allRequiredDocsSubmitted = totalRequiredDocs > 0 && submittedRequiredDocs === totalRequiredDocs;

  return (
    <div className="space-y-6">
      {/* Frozen Status Banner */}
      {isFrozen && (
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Agreement & GST Finalized and Frozen
              <span className="text-[10px] bg-slate-200 text-slate-700 uppercase font-extrabold px-2 py-0.5 rounded-full">
                Locked
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This form was permanently finalized
              {agreementGstData?.frozen_by_name ? ` by ${agreementGstData.frozen_by_name}` : ""}
              {agreementGstData?.frozen_at ? ` on ${formatDate(agreementGstData.frozen_at)}` : ""}.
              All documents and fields are frozen and cannot be modified.
            </p>
          </div>
        </div>
      )}

      {/* Basic Form Details */}
      <form onSubmit={handleBasicDetailsSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Partner Date</label>
            <input
              type="date"
              disabled={isFrozen}
              value={partnerDate}
              onChange={(e) => setPartnerDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">GST Registration Date</label>
            <input
              type="date"
              disabled={isFrozen}
              value={gstRegistrationDate}
              onChange={(e) => setGstRegistrationDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">GST Number</label>
            <input
              type="text"
              disabled={isFrozen}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="Enter GST Registration Number"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Additional Business Address</label>
            <input
              type="text"
              disabled={isFrozen}
              value={additionalBusinessAddress}
              onChange={(e) => setAdditionalBusinessAddress(e.target.value)}
              placeholder="Enter Additional Business Address"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Serial Number in GST Form for this address
            </label>
            <input
              type="text"
              disabled={isFrozen}
              value={serialNumberGstForm}
              onChange={(e) => setSerialNumberGstForm(e.target.value)}
              placeholder="Enter Serial Number"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>

        {!isFrozen && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingAgreementGst}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {submittingAgreementGst ? "Saving Details..." : "Save GST Details"}
            </button>
          </div>
        )}
      </form>

      {/* Documents Section (Only displays documents selected in Document Checklist) */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              Required Documents
              <span className="bg-purple-100 text-[#6804a1] font-bold text-[10px] px-2.5 py-0.5 rounded-full lowercase">
                {submittedRequiredDocs} / {totalRequiredDocs} submitted
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Only documents selected in the <strong>Required Documents Checklist</strong> accordion are listed here.
            </p>
          </div>
        </div>

        {agreementGstDocs.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No documents selected in the Document Checklist accordion above. Please check the documents required in the checklist.
          </div>
        ) : (
          <div className="space-y-4">
            {agreementGstDocs.map((doc, idx) => {
              const isSubmittingDoc = Boolean(submittingDocIndices[idx]);
              const hasUploaded = Boolean(doc.document_path);

              return (
                <div
                  key={idx}
                  className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl border transition-all ${
                    hasUploaded
                      ? "bg-emerald-50/20 border-emerald-200/80"
                      : "bg-slate-50/60 border-slate-200"
                  }`}
                >
                  {/* Doc Name & Status */}
                  <div className="lg:w-1/4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{doc.doc_type}</span>
                      {hasUploaded ? (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">
                          Submitted
                        </span>
                      ) : (
                        <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                          Pending
                        </span>
                      )}
                    </div>

                    {hasUploaded && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#6804a1]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <a
                          href={getFileUrl(doc.document_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#6804a1] hover:underline font-bold truncate max-w-xs"
                          title={doc.document_path}
                        >
                          View Current Document →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* File Upload Input */}
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {hasUploaded ? "Replace / Upload File" : "Upload File"}
                    </label>
                    <input
                      type="file"
                      disabled={isFrozen}
                      onChange={(e) => handleDocFieldChange(idx, "file", e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="lg:w-48">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      disabled={isFrozen}
                      value={doc.expiry_date}
                      onChange={(e) => handleDocFieldChange(idx, "expiry_date", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  {/* Individual Document Submit Button */}
                  {!isFrozen && (
                    <div className="self-end lg:self-center pt-2 lg:pt-5">
                      <button
                        type="button"
                        disabled={isSubmittingDoc || (!doc.file && !doc.document_path)}
                        onClick={() => handleSingleDocSubmit(idx)}
                        className={`text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          hasUploaded
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#6804a1] hover:bg-[#52037e] text-white"
                        }`}
                        title={hasUploaded ? "Update this document" : "Submit this document"}
                      >
                        {isSubmittingDoc ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : hasUploaded ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Update
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Submit
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Final Submit Section */}
      <div className="pt-6 border-t border-slate-200">
        {!isFrozen && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {allRequiredDocsSubmitted ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  All {totalRequiredDocs} required documents submitted. You can now perform the final submission.
                </span>
              ) : (
                <span className="text-amber-700 font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Final submission button will appear once all {totalRequiredDocs} required documents are submitted completely ({submittedRequiredDocs}/{totalRequiredDocs} submitted).
                </span>
              )}
            </div>

            {/* Final Submit Button - Only appears if all required docs are submitted completely */}
            {allRequiredDocsSubmitted && (
              <button
                type="button"
                onClick={() => setIsFreezeModalOpen(true)}
                className="bg-gradient-to-r from-[#6804a1] to-[#8d0ecf] hover:from-[#52037e] hover:to-[#6804a1] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer text-xs flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Final Submit Complete Form
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <FreezeConfirmationModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirm={handleConfirmFreeze}
        confirming={freezing}
        totalDocs={totalRequiredDocs}
      />
    </div>
  );
}
