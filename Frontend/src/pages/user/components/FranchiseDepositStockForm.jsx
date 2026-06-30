import React, { useState, useEffect } from "react";
import { submitFranchiseDepositStockForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FranchiseDepositStockForm({ franchiseId, franchiseDepositStockData, reloadFranchiseData }) {
  const [poCreationDate, setPoCreationDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [expectedOpeningDate, setExpectedOpeningDate] = useState("");

  // Checklist items
  const [chkStock, setChkStock] = useState(false);
  const [chkBillPaper, setChkBillPaper] = useState(false);
  const [chkBag, setChkBag] = useState(false);
  const [chkBlueChit, setChkBlueChit] = useState(false);
  const [chkStamp, setChkStamp] = useState(false);
  const [chkSwipeMachine, setChkSwipeMachine] = useState(false);
  const [chkQrCode, setChkQrCode] = useState(false);

  // APX receipt items
  const [stockReceivedApx, setStockReceivedApx] = useState(false);
  const [stockReceivedApxDate, setStockReceivedApxDate] = useState("");

  // Status and rejection
  const [status, setStatus] = useState("draft");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvedByName, setApprovedByName] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (franchiseDepositStockData) {
      if (franchiseDepositStockData.po_creation_date) {
        try {
          const d = new Date(franchiseDepositStockData.po_creation_date);
          if (!isNaN(d.getTime())) {
            setPoCreationDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setPoCreationDate("");
        }
      } else {
        setPoCreationDate("");
      }

      setPoNumber(franchiseDepositStockData.po_number || "");

      if (franchiseDepositStockData.expected_opening_date) {
        try {
          const d = new Date(franchiseDepositStockData.expected_opening_date);
          if (!isNaN(d.getTime())) {
            setExpectedOpeningDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setExpectedOpeningDate("");
        }
      } else {
        setExpectedOpeningDate("");
      }

      setChkStock(!!franchiseDepositStockData.chk_stock);
      setChkBillPaper(!!franchiseDepositStockData.chk_bill_paper);
      setChkBag(!!franchiseDepositStockData.chk_bag);
      setChkBlueChit(!!franchiseDepositStockData.chk_blue_chit);
      setChkStamp(!!franchiseDepositStockData.chk_stamp);
      setChkSwipeMachine(!!franchiseDepositStockData.chk_swipe_machine);
      setChkQrCode(!!franchiseDepositStockData.chk_qr_code);

      setStockReceivedApx(!!franchiseDepositStockData.stock_received_apx);

      if (franchiseDepositStockData.stock_received_apx_date) {
        try {
          const d = new Date(franchiseDepositStockData.stock_received_apx_date);
          if (!isNaN(d.getTime())) {
            setStockReceivedApxDate(d.toISOString().split('T')[0]);
          }
        } catch (e) {
          setStockReceivedApxDate("");
        }
      } else {
        setStockReceivedApxDate("");
      }

      setStatus(franchiseDepositStockData.status || "draft");
      setRejectionReason(franchiseDepositStockData.rejection_reason || "");
      setApprovedByName(franchiseDepositStockData.approved_by_name || "");
    }
  }, [franchiseDepositStockData]);

  const handleSubmit = async (e, submitForApproval = false) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        poCreationDate: poCreationDate || null,
        poNumber: poNumber.trim() || null,
        expectedOpeningDate: expectedOpeningDate || null,
        chkStock,
        chkBillPaper,
        chkBag,
        chkBlueChit,
        chkStamp,
        chkSwipeMachine,
        chkQrCode,
        stockReceivedApx,
        stockReceivedApxDate: stockReceivedApxDate || null,
        status: submitForApproval ? "pending" : status === "rejected" ? "draft" : status
      };

      const res = await submitFranchiseDepositStockForm(franchiseId, payload);
      if (res.data?.success) {
        toast.success(
          submitForApproval
            ? "Deposit & Stock details submitted for approval!"
            : "Deposit & Stock details saved successfully!"
        );
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving Deposit & Stock details:", err);
      toast.error(err?.response?.data?.message || "Failed to save Deposit & Stock details.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = status === "pending" || status === "approved";

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Approval Status:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              status === "approved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "rejected"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : status === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {status === "pending" ? "Pending Approval" : status}
          </span>
        </div>

        {isLocked && (
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            {status === "approved"
              ? `Approved by ${approvedByName || "Admin"}. This record is locked.`
              : "Submitted for review. This record is locked."}
          </p>
        )}
      </div>

      {/* Rejection Reason Alert */}
      {status === "rejected" && rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs font-medium flex flex-col gap-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700">
            Rejection Reason
          </span>
          <p>{rejectionReason}</p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        {/* 1. Dates & PO Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
              PO creation date
            </label>
            <input
              type="date"
              disabled={isLocked}
              value={poCreationDate}
              onChange={(e) => setPoCreationDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
              PO number
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="Enter PO number"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
              Expected opening date
            </label>
            <input
              type="date"
              disabled={isLocked}
              value={expectedOpeningDate}
              onChange={(e) => setExpectedOpeningDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* 2. Stock Transfer Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-3.5 uppercase tracking-wider">
            Stock transfer checklist
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Stock", state: chkStock, setter: setChkStock },
              { label: "Bill paper", state: chkBillPaper, setter: setChkBillPaper },
              { label: "Bag", state: chkBag, setter: setChkBag },
              { label: "Blue chit", state: chkBlueChit, setter: setChkBlueChit },
              { label: "Stamp", state: chkStamp, setter: setChkStamp },
              { label: "Swipe machine", state: chkSwipeMachine, setter: setChkSwipeMachine },
              { label: "QR code", state: chkQrCode, setter: setChkQrCode }
            ].map((item, idx) => (
              <label
                key={idx}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 select-none ${
                  isLocked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  item.state
                    ? "bg-purple-50/30 border-purple-200 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={isLocked}
                  checked={item.state}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Stock Received in APX & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Received Checkbox in Green Box */}
          <div className="md:col-span-2">
            <label
              className={`p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 select-none ${
                isLocked ? "cursor-not-allowed" : "cursor-pointer"
              } ${
                stockReceivedApx
                  ? "bg-emerald-50/75 border-emerald-200 text-emerald-800 font-bold"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 font-semibold"
              }`}
            >
              <input
                type="checkbox"
                disabled={isLocked}
                checked={stockReceivedApx}
                onChange={(e) => setStockReceivedApx(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-xs">Stock received in APX</span>
            </label>
          </div>

          {/* Received Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">
              Stock received in APX Date
            </label>
            <input
              type="date"
              disabled={isLocked}
              value={stockReceivedApxDate}
              onChange={(e) => setStockReceivedApxDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {!isLocked && (
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(null, true)}
              disabled={submitting}
              className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
