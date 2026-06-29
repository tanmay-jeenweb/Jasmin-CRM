import { useState, useEffect } from "react";
import { getLabels } from "../../api/labelApi";
import toast from "react-hot-toast";

export default function LabelModal({ isOpen, inquiry, onClose, onSave, saving }) {
  const [labels, setLabels] = useState([]);
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedLabelId(inquiry?.label_id || null);
      
      const fetchLabels = async () => {
        setLoading(true);
        try {
          const response = await getLabels();
          setLabels(response.data.data || []);
        } catch (err) {
          console.error("Failed to fetch labels:", err);
          toast.error("Failed to load labels.");
        } finally {
          setLoading(false);
        }
      };
      fetchLabels();
    }
  }, [isOpen, inquiry]);

  if (!isOpen || !inquiry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(inquiry.id, selectedLabelId);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 450, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#6804a1,#52037e)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Assign Label</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>Select a label for {inquiry.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px 28px", maxHeight: "50vh", overflowY: "auto" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                <div className="w-6 h-6 border-2 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* No Label Option */}
                <label style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  borderRadius: 12, border: "1.5px solid",
                  borderColor: selectedLabelId === null ? "#6804a1" : "#e2e8f0",
                  background: selectedLabelId === null ? "#fbf7ff" : "#fff",
                  cursor: "pointer", transition: "all 0.15s"
                }}>
                  <input
                    type="radio"
                    name="inquiryLabel"
                    checked={selectedLabelId === null}
                    onChange={() => setSelectedLabelId(null)}
                    style={{ accentColor: "#6804a1", width: 16, height: 16 }}
                  />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: selectedLabelId === null ? "#6804a1" : "#334155" }}>
                      No Label
                    </span>
                  </div>
                </label>

                {/* Master Labels */}
                {labels.map((lbl) => {
                  const isChecked = selectedLabelId === lbl.id;
                  return (
                    <label key={lbl.id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      borderRadius: 12, border: "1.5px solid",
                      borderColor: isChecked ? "#6804a1" : "#e2e8f0",
                      background: isChecked ? "#fbf7ff" : "#fff",
                      cursor: "pointer", transition: "all 0.15s"
                    }}>
                      <input
                        type="radio"
                        name="inquiryLabel"
                        checked={isChecked}
                        onChange={() => setSelectedLabelId(lbl.id)}
                        style={{ accentColor: "#6804a1", width: 16, height: 16 }}
                      />
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isChecked ? "#6804a1" : "#334155" }}>
                          {lbl.label_name}
                        </span>
                      </div>
                    </label>
                  );
                })}

                {labels.length === 0 && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: "10px 0" }}>
                    No labels found in the master table.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 12, background: "#fafafa" }}>
            <button type="button" onClick={onClose} disabled={saving}
              style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #cbd5e1", color: "#475569", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "linear-gradient(135deg,#6804a1,#52037e)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 8px rgba(104,4,161,0.35)" }}>
              {saving ? "Saving…" : "Save Label"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
