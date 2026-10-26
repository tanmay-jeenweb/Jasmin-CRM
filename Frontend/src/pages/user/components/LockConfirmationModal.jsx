
export default function LockConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  confirming = false,
  title = "Confirm Section Lock & Final Submission",
  description = "Are you sure you want to lock and finalize this section? After locking, no fields or documents can be modified without Administrator approval.",
  confirmText = "Yes, Lock & Finalize",
  accentColor = "amber" // "amber" or "purple" or "rose"
}) {
  if (!isOpen) return null;

  const headerGradient =
    accentColor === "rose"
      ? "from-rose-600 to-red-700"
      : accentColor === "purple"
      ? "from-[#6804a1] to-[#8d0ecf]"
      : "from-amber-500 to-rose-600";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerGradient} px-6 py-5 text-white flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="text-xs text-white/90 mt-0.5">Permanent action confirmation</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              Double-Check Notice: This action will lock this section!
            </p>
            <p className="text-amber-900 leading-relaxed">
              {description}
            </p>
          </div>

          <p className="text-xs text-slate-600">
            Once locked, you will not be able to modify, replace files, or edit dates in this accordion. Only an <strong>Administrator</strong> can unlock it from the Approvals center.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={confirming}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {confirming ? (
              <>
                <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Locking...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
