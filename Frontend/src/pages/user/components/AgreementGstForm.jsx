import React, { useState, useEffect } from "react";
import { submitAgreementGstForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function AgreementGstForm({ franchiseId, agreementGstData, masterDocs, reloadFranchiseData, getFileUrl }) {
  const [partnerDate, setPartnerDate] = useState("");
  const [gstRegistrationDate, setGstRegistrationDate] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [agreementGstDocs, setAgreementGstDocs] = useState([]);
  const [submittingAgreementGst, setSubmittingAgreementGst] = useState(false);

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
    if (agreementGstData) {
      setPartnerDate(getLocalDateString(agreementGstData.partner_date));
      setGstRegistrationDate(getLocalDateString(agreementGstData.gst_registration_date));
      setGstNumber(agreementGstData.gst_number || "");
    }

    const savedDocs = agreementGstData?.documents || [];
    const mergedDocs = [];

    // 1. Add required docs
    masterDocs.forEach(reqDoc => {
      const existingSaved = savedDocs.find(sd => sd.doc_type.toLowerCase() === reqDoc.doc_type.toLowerCase());
      if (existingSaved) {
        mergedDocs.push({
          doc_type: reqDoc.doc_type,
          document_path: existingSaved.document_path,
          expiry_date: getLocalDateString(existingSaved.expiry_date),
          file: null,
          is_custom: false
        });
      } else {
        mergedDocs.push({
          doc_type: reqDoc.doc_type,
          document_path: "",
          expiry_date: "",
          file: null,
          is_custom: false
        });
      }
    });

    // 2. Add custom saved docs
    savedDocs.forEach(sd => {
      const isReq = masterDocs.some(reqDoc => reqDoc.doc_type.toLowerCase() === sd.doc_type.toLowerCase());
      if (!isReq) {
        mergedDocs.push({
          doc_type: sd.doc_type,
          document_path: sd.document_path,
          expiry_date: getLocalDateString(sd.expiry_date),
          file: null,
          is_custom: true
        });
      }
    });

    setAgreementGstDocs(mergedDocs);
  }, [agreementGstData, masterDocs]);

  const handleAddDoc = () => {
    setAgreementGstDocs([
      ...agreementGstDocs,
      {
        doc_type: "",
        document_path: "",
        expiry_date: "",
        file: null,
        is_custom: true
      }
    ]);
  };

  const handleRemoveDoc = (index) => {
    const updated = [...agreementGstDocs];
    updated.splice(index, 1);
    setAgreementGstDocs(updated);
  };

  const handleDocFieldChange = (index, field, value) => {
    const updated = [...agreementGstDocs];
    updated[index][field] = value;
    setAgreementGstDocs(updated);
  };

  const handleAgreementGstSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    for (const doc of agreementGstDocs) {
      if (!doc.doc_type.trim()) {
        return toast.error("Document type is required for all documents.");
      }
      if (!doc.document_path && !doc.file) {
        return toast.error(`Please upload a document file for ${doc.doc_type}`);
      }
    }

    setSubmittingAgreementGst(true);
    try {
      const fd = new FormData();
      fd.append("partnerDate", partnerDate);
      fd.append("gstRegistrationDate", gstRegistrationDate);
      fd.append("gstNumber", gstNumber.trim());

      const docsPayload = agreementGstDocs.map((doc) => {
        return {
          doc_type: doc.doc_type,
          expiry_date: doc.expiry_date || "",
          document_path: doc.document_path || ""
        };
      });

      fd.append("documents", JSON.stringify(docsPayload));

      agreementGstDocs.forEach((doc, idx) => {
        if (doc.file) {
          fd.append(`file_${idx}`, doc.file);
        }
      });

      const res = await submitAgreementGstForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Agreement & GST details saved successfully!");
        await reloadFranchiseData();
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

  return (
    <form onSubmit={handleAgreementGstSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Partner Date</label>
          <input
            type="date"
            value={partnerDate}
            onChange={(e) => setPartnerDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">GST Registration Date</label>
          <input
            type="date"
            value={gstRegistrationDate}
            onChange={(e) => setGstRegistrationDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">GST Number</label>
          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            placeholder="Enter GST Registration Number"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
      </div>

      {/* Dynamic Documents List */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documents</h4>
          <button
            type="button"
            onClick={handleAddDoc}
            className="flex items-center gap-1.5 text-xs text-[#6804a1] hover:text-[#52037e] font-bold transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Document
          </button>
        </div>

        {agreementGstDocs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No documents required or added yet.</p>
        ) : (
          <div className="space-y-4">
            {agreementGstDocs.map((doc, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-end gap-4 p-4 bg-slate-50/50 border border-slate-150 rounded-xl">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doc Type</label>
                  <input
                    type="text"
                    disabled={!doc.is_custom}
                    value={doc.doc_type}
                    onChange={(e) => handleDocFieldChange(idx, "doc_type", e.target.value)}
                    placeholder="e.g. Aadhar Card"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Document File {!doc.document_path && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocFieldChange(idx, "file", e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
                  />
                  {doc.document_path && (
                    <div className="mt-1 flex items-center gap-1.5">
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
                        View Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={doc.expiry_date}
                    onChange={(e) => handleDocFieldChange(idx, "expiry_date", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
                  />
                </div>

                {doc.is_custom && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer md:mb-0.5"
                    title="Delete Document Type"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submittingAgreementGst}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submittingAgreementGst ? "Saving..." : "Save Agreement & GST"}
        </button>
      </div>
    </form>
  );
}
