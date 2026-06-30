import React, { useState, useEffect } from "react";
import { submitStoreAmbianceForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function StoreAmbianceForm({ franchiseId, storeAmbianceData, reloadFranchiseData, getFileUrl }) {
  const [furnitureFixingFile, setFurnitureFixingFile] = useState(null);
  const [furnitureFixingFileName, setFurnitureFixingFileName] = useState("");
  const [companyFurnitureFittingFile, setCompanyFurnitureFittingFile] = useState(null);
  const [companyFurnitureFittingFileName, setCompanyFurnitureFittingFileName] = useState("");
  const [shineBoardFile, setShineBoardFile] = useState(null);
  const [shineBoardFileName, setShineBoardFileName] = useState("");
  const [inShopBrandingFile, setInShopBrandingFile] = useState(null);
  const [inShopBrandingFileName, setInShopBrandingFileName] = useState("");
  const [templeLocationFile, setTempleLocationFile] = useState(null);
  const [templeLocationFileName, setTempleLocationFileName] = useState("");
  const [ambiancePhotoFile, setAmbiancePhotoFile] = useState(null);
  const [ambiancePhotoFileName, setAmbiancePhotoFileName] = useState("");
  const [ambianceRemark, setAmbianceRemark] = useState("");
  const [submittingStoreAmbiance, setSubmittingStoreAmbiance] = useState(false);

  useEffect(() => {
    if (storeAmbianceData) {
      setFurnitureFixingFileName(storeAmbianceData.furniture_fixing_file || "");
      setCompanyFurnitureFittingFileName(storeAmbianceData.company_furniture_fitting_file || "");
      setShineBoardFileName(storeAmbianceData.shine_board_file || "");
      setInShopBrandingFileName(storeAmbianceData.in_shop_branding_file || "");
      setTempleLocationFileName(storeAmbianceData.temple_location_file || "");
      setAmbiancePhotoFileName(storeAmbianceData.ambiance_photo_file || "");
      setAmbianceRemark(storeAmbianceData.remark || "");
    }
  }, [storeAmbianceData]);

  const handleStoreAmbianceSubmit = async (e) => {
    e.preventDefault();

    setSubmittingStoreAmbiance(true);
    try {
      const fd = new FormData();
      fd.append("remark", ambianceRemark.trim());

      if (furnitureFixingFile) fd.append("furnitureFixingFile", furnitureFixingFile);
      if (companyFurnitureFittingFile) fd.append("companyFurnitureFittingFile", companyFurnitureFittingFile);
      if (shineBoardFile) fd.append("shineBoardFile", shineBoardFile);
      if (inShopBrandingFile) fd.append("inShopBrandingFile", inShopBrandingFile);
      if (templeLocationFile) fd.append("templeLocationFile", templeLocationFile);
      if (ambiancePhotoFile) fd.append("ambiancePhotoFile", ambiancePhotoFile);

      const res = await submitStoreAmbianceForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Store Ambiance details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Store Ambiance details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Store Ambiance details.");
    } finally {
      setSubmittingStoreAmbiance(false);
    }
  };

  return (
    <form onSubmit={handleStoreAmbianceSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        {/* Furniture fixing */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Furniture fixing</label>
          <input
            type="file"
            onChange={(e) => setFurnitureFixingFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {furnitureFixingFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(furnitureFixingFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={furnitureFixingFileName}
              >
                View Furniture fixing
              </a>
            </div>
          )}
        </div>

        {/* Company furniture fitting */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Company furniture fitting</label>
          <input
            type="file"
            onChange={(e) => setCompanyFurnitureFittingFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {companyFurnitureFittingFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(companyFurnitureFittingFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={companyFurnitureFittingFileName}
              >
                View Furniture fitting
              </a>
            </div>
          )}
        </div>

        {/* Shine board */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Shine board</label>
          <input
            type="file"
            onChange={(e) => setShineBoardFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {shineBoardFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(shineBoardFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={shineBoardFileName}
              >
                View Shine board
              </a>
            </div>
          )}
        </div>

        {/* In-shop branding */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">In-shop branding</label>
          <input
            type="file"
            onChange={(e) => setInShopBrandingFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {inShopBrandingFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(inShopBrandingFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={inShopBrandingFileName}
              >
                View In-shop branding
              </a>
            </div>
          )}
        </div>

        {/* Temple location */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Temple location</label>
          <input
            type="file"
            onChange={(e) => setTempleLocationFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {templeLocationFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(templeLocationFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={templeLocationFileName}
              >
                View Temple location
              </a>
            </div>
          )}
        </div>

        {/* Ambiance Photo */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Ambiance Photo</label>
          <input
            type="file"
            onChange={(e) => setAmbiancePhotoFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
          />
          {ambiancePhotoFileName && (
            <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a
                href={getFileUrl(ambiancePhotoFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                title={ambiancePhotoFileName}
              >
                View Ambiance Photo
              </a>
            </div>
          )}
        </div>

        {/* Remark */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Remark</label>
          <textarea
            rows={3}
            value={ambianceRemark}
            onChange={(e) => setAmbianceRemark(e.target.value)}
            placeholder="Enter store ambiance remarks"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submittingStoreAmbiance}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submittingStoreAmbiance ? "Saving..." : "Save Store Ambiance"}
        </button>
      </div>
    </form>
  );
}
