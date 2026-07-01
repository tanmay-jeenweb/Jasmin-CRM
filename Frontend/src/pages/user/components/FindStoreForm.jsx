import React, { useState, useEffect } from "react";
import { submitFindStoreForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FindStoreForm({ franchiseId, findStoreData, findStoreStatus, reloadFranchiseData, getFileUrl }) {
  const [storeLocation, setStoreLocation] = useState("");
  const [storeMapLink, setStoreMapLink] = useState("");
  const [storePhotoFiles, setStorePhotoFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
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
      setBusinessArea(findStoreData.business_area || "");
      setClusterValue(findStoreData.cluster_value || "");
      setProcessActiveValue(findStoreData.process_active_value || "");
      setAuthorityCertificateName(findStoreData.authority_certificate || "");

      if (findStoreData.store_photo) {
        try {
          const parsed = JSON.parse(findStoreData.store_photo);
          setExistingPhotos(Array.isArray(parsed) ? parsed : [findStoreData.store_photo]);
        } catch (e) {
          setExistingPhotos([findStoreData.store_photo]);
        }
      } else {
        setExistingPhotos([]);
      }
      setStorePhotoFiles([]);
    }
  }, [findStoreData]);

  const handlePhotoFilesChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setStorePhotoFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewPhotoFile = (indexToRemove) => {
    setStorePhotoFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeExistingPhoto = (photoToRemove) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== photoToRemove));
  };

  const handleFindStoreSubmit = async (e) => {
    e.preventDefault();

    if (!storeLocation.trim()) return toast.error("Store Location is required");
    if (!storeMapLink.trim()) return toast.error("Store Map Link is required");
    if (!businessArea.trim()) return toast.error("Business Area is required");
    if (storePhotoFiles.length === 0 && existingPhotos.length === 0) {
      return toast.error("At least one Store Photo is required");
    }

    setSubmittingFindStore(true);
    try {
      const fd = new FormData();
      fd.append("storeLocation", storeLocation.trim());
      fd.append("storeMapLink", storeMapLink.trim());
      fd.append("businessArea", businessArea.trim());
      fd.append("clusterValue", clusterValue.trim());
      fd.append("processActiveValue", processActiveValue.trim());
      fd.append("existingPhotos", JSON.stringify(existingPhotos));

      storePhotoFiles.forEach((file) => {
        fd.append("storePhoto", file);
      });

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

        <div className="col-span-1 md:col-span-2 border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Store Photos * <span className="text-[10px] text-slate-400 font-semibold">(Select one or more Images , Maximum 20 Image)</span>
            </label>
            {findStoreStatus !== "approved" && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoFilesChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
              />
            )}
          </div>

          {/* Existing saved photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saved Photos:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {existingPhotos.map((photo, idx) => (
                  <div key={photo} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex flex-col items-center">
                    <img
                      src={getFileUrl(photo)}
                      alt={`Store Photo ${idx + 1}`}
                      className="w-full h-16 object-cover rounded-md"
                    />
                    <div className="flex items-center justify-between w-full mt-1.5 px-1 gap-1">
                      <a
                        href={getFileUrl(photo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-[#6804a1] hover:underline font-bold"
                      >
                        View Full
                      </a>
                      {findStoreStatus !== "approved" && (
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(photo)}
                          className="text-rose-600 hover:text-rose-800 text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly selected photos (to be uploaded) */}
          {storePhotoFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#6804a1] uppercase tracking-wider">New Photos to Upload:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {storePhotoFiles.map((file, idx) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-violet-200 bg-violet-50/30 p-1 flex flex-col items-center">
                      <img
                        src={previewUrl}
                        alt={`New Photo ${idx + 1}`}
                        className="w-full h-16 object-cover rounded-md"
                      />
                      <div className="flex items-center justify-between w-full mt-1.5 px-1 gap-1">
                        <span className="text-[8px] text-slate-500 font-semibold truncate max-w-[60%]" title={file.name}>
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewPhotoFile(idx)}
                          className="text-rose-600 hover:text-rose-800 text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
