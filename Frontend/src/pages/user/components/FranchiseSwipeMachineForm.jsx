import React, { useState, useEffect } from "react";
import { submitFranchiseSwipeMachineForm } from "../../../api/inProcessFranchiseApi";
import { getMobileBrands } from "../../../api/mobileBrandApi";
import toast from "react-hot-toast";

const PLATFORMS = [
  { key: "BE_NOW", label: "BE NOW" },
  { key: "PAYTM", label: "PAYTM" },
  { key: "PINE_LAB", label: "PINE LAB" }
];

export default function FranchiseSwipeMachineForm({ franchiseId, franchiseSwipeMachineData, reloadFranchiseData }) {
  const [brands, setBrands] = useState([]);
  const [receiptDate, setReceiptDate] = useState("");
  const [qrBharatPay, setQrBharatPay] = useState(false);
  const [qrHdfc, setQrHdfc] = useState(false);
  
  // Matrix state: { [brand]: { [platform]: boolean } }
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch brands from master
  useEffect(() => {
    const loadBrands = async () => {
      setLoading(true);
      try {
        const res = await getMobileBrands();
        if (res.data?.success) {
          setBrands(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
        toast.error("Failed to load mobile brands.");
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    if (brands.length === 0) return;

    if (franchiseSwipeMachineData) {
      if (franchiseSwipeMachineData.agreement_photo_receipt_date) {
        try {
          const d = new Date(franchiseSwipeMachineData.agreement_photo_receipt_date);
          if (!isNaN(d.getTime())) {
            setReceiptDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setReceiptDate("");
        }
      } else {
        setReceiptDate("");
      }

      setQrBharatPay(!!franchiseSwipeMachineData.qr_bharat_pay);
      setQrHdfc(!!franchiseSwipeMachineData.qr_hdfc);

      // Populate matrix
      const initialMatrix = {};
      brands.forEach(b => {
        const brandName = b.mobile_brand.toUpperCase();
        initialMatrix[brandName] = {
          BE_NOW: false,
          PAYTM: false,
          PINE_LAB: false
        };
      });

      if (franchiseSwipeMachineData.brands) {
        franchiseSwipeMachineData.brands.forEach(item => {
          const brand = item.brand_name.toUpperCase();
          const platform = item.platform_name;
          if (initialMatrix[brand]) {
            initialMatrix[brand][platform] = true;
          }
        });
      }
      setMatrix(initialMatrix);
    } else {
      // Clear/default matrix
      const defaultMatrix = {};
      brands.forEach(b => {
        const brandName = b.mobile_brand.toUpperCase();
        defaultMatrix[brandName] = {
          BE_NOW: false,
          PAYTM: false,
          PINE_LAB: false
        };
      });
      setMatrix(defaultMatrix);
    }
  }, [franchiseSwipeMachineData, brands]);

  const handleCheckboxChange = (brand, platform, checked) => {
    setMatrix(prev => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [platform]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert matrix to flat array of selected items
      const selectedBrands = [];
      Object.keys(matrix).forEach(brand => {
        Object.keys(matrix[brand]).forEach(platform => {
          if (matrix[brand][platform]) {
            selectedBrands.push({
              brand_name: brand,
              platform_name: platform
            });
          }
        });
      });

      const payload = {
        agreementPhotoReceiptDate: receiptDate || null,
        qrBharatPay,
        qrHdfc,
        brands: selectedBrands
      };

      const res = await submitFranchiseSwipeMachineForm(franchiseId, payload);
      if (res.data?.success) {
        toast.success("Swipe Machine details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Swipe Machine details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Swipe Machine details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-[#6804a1] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold">Loading Swipe Machine form...</p>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">
          Please make sure you have added entries in <span className="font-bold">Mobile Brand Master</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Receipt Date */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
          Agreement & photo receipt date
        </label>
        <input
          type="date"
          value={receiptDate}
          onChange={(e) => setReceiptDate(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
        />
      </div>

      {/* 2. QR Code */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
          QR code
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-xs text-slate-700">
            <input
              type="checkbox"
              checked={qrBharatPay}
              onChange={(e) => setQrBharatPay(e.target.checked)}
              className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
            />
            Bharat Pay
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-xs text-slate-700">
            <input
              type="checkbox"
              checked={qrHdfc}
              onChange={(e) => setQrHdfc(e.target.checked)}
              className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
            />
            HDFC
          </label>
        </div>
      </div>

      {/* 3. Brands Payment platforms Matrix */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
          Brands Payment platforms
        </label>
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                  Brand
                </th>
                {PLATFORMS.map(platform => (
                  <th key={platform.key} className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    {platform.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map(b => {
                const brandName = b.mobile_brand.toUpperCase();
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-slate-700 font-sans">
                      {brandName}
                    </td>
                    {PLATFORMS.map(platform => {
                      const isChecked = matrix[brandName]?.[platform.key] || false;
                      return (
                        <td key={platform.key} className="px-6 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(brandName, platform.key, e.target.checked)}
                            className="w-4.5 h-4.5 rounded-md text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer transition-all hover:scale-105"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Swipe Machine Details"}
        </button>
      </div>
    </form>
  );
}
