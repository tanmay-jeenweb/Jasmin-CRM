import React, { useState, useEffect } from "react";
import { submitFindStoreForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FindStoreForm({ franchiseId, findStoreData, findStoreStatus, reloadFranchiseData, getFileUrl }) {
  const [storeLocation, setStoreLocation] = useState("");
  const [storeMapLink, setStoreMapLink] = useState("");
  const [storePhotoFile, setStorePhotoFile] = useState(null);
  const [storePhotoName, setStorePhotoName] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [clusterValue, setClusterValue] = useState("");
  const [processActiveValue, setProcessActiveValue] = useState("");
  const [authorityCertificateFile, setAuthorityCertificateFile] = useState(null);
  const [authorityCertificateName, setAuthorityCertificateName] = useState("");
  const [submittingFindStore, setSubmittingFindStore] = useState(false);

  useEffect(() => {
    if (findStoreData) {
      setStoreLocation(findStoreData.store_location || "");
      setStoreMapLink(findStoreData.store_map_link || "");
      setStorePhotoName(findStoreData.store_photo || "");
      setBusinessArea(findStoreData.business_area || "");
      setClusterValue(findStoreData.cluster_value || "");
      setProcessActiveValue(findStoreData.process_active_value || "");
      setAuthorityCertificateName(findStoreData.authority_certificate || "");
    }
  }, [findStoreData]);

  const handleFindStoreSubmit = async (e) => {
    e.preventDefault();

    if (!storeLocation.trim()) return toast.error("Store Location is required");
    if (!storeMapLink.trim()) return toast.error("Store Map Link is required");
    if (!businessArea.trim()) return toast.error("Business Area is required");
    if (!storePhotoFile && !storePhotoName) return toast.error("Store Photo is required");

    setSubmittingFindStore(true);
    try {
      const fd = new FormData();
      fd.append("storeLocation", storeLocation.trim());
      fd.append("storeMapLink", storeMapLink.trim());
      fd.append("businessArea", businessArea.trim());
      fd.append("clusterValue", clusterValue.trim());
      fd.append("processActiveValue", processActiveValue.trim());

      if (storePhotoFile) {
        fd.append("storePhoto", storePhotoFile);
      }
      if (authorityCertificateFile) {
        fd.append("authorityCertificate", authorityCertificateFile);
      }

      const res = await submitFindStoreForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Find Store details submitted successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to submit store details");
      }
    } catch (err) {
      console.error("Error submitting find store form:", err);
      toast.error(err?.response?.data?.message || "Failed to submit store details.");
    } finally {
      setSubmittingFindStore(false);
    }
  };

  return (
    <form onSubmit={handleFindStoreSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Store Location *</label>
          <input
            type="text"
            disabled={findStoreStatus === "approved"}
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
            placeholder="Enter specific store location"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Store Map Link *</label>
          <input
            type="url"
            disabled={findStoreStatus === "approved"}
            value={storeMapLink}
            onChange={(e) => setStoreMapLink(e.target.value)}
            placeholder="Google Maps link"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
          />
          {storeMapLink && (
            <a
              href={storeMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6804a1] hover:underline font-bold mt-1 inline-block"
            >
              Open Map Link →
            </a>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Business Area *</label>
          <input
            type="text"
            disabled={findStoreStatus === "approved"}
            value={businessArea}
            onChange={(e) => setBusinessArea(e.target.value)}
            placeholder="e.g. Retail, Commercial Area"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Cluster Value</label>
          <input
            type="text"
            disabled={findStoreStatus === "approved"}
            value={clusterValue}
            onChange={(e) => setClusterValue(e.target.value)}
            placeholder="Cluster name / value"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Process Active Value</label>
          <input
            type="text"
            disabled={findStoreStatus === "approved"}
            value={processActiveValue}
            onChange={(e) => setProcessActiveValue(e.target.value)}
            placeholder="e.g. Active, Under Setup"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Store Photo * <span className="text-[10px] text-slate-400 font-semibold">(Attachment)</span>
          </label>
          {findStoreStatus !== "approved" && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setStorePhotoFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
          )}
          {storePhotoName && (
            <div className="mt-2.5 flex items-center gap-3">
              <img
                src={getFileUrl(storePhotoName)}
                alt="Store Photo"
                className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm"
              />
              <a
                href={getFileUrl(storePhotoName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold"
              >
                View Full Image
              </a>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Authority Certificate <span className="text-[10px] text-slate-400 font-semibold">(Attachment)</span>
          </label>
          {findStoreStatus !== "approved" && (
            <input
              type="file"
              onChange={(e) => setAuthorityCertificateFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
          )}
          {authorityCertificateName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(authorityCertificateName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={authorityCertificateName}
              >
                View Certificate
              </a>
            </div>
          )}
        </div>
      </div>

      {findStoreStatus !== "approved" && (
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submittingFindStore}
            className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {submittingFindStore ? "Saving..." : "Submit Store Details"}
          </button>
        </div>
      )}
    </form>
  );
}
