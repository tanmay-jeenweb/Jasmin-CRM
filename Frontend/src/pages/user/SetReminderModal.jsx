import { useState, useEffect } from "react";

export default function SetReminderModal({ isOpen, inquiry, onClose, onSave, saving }) {
  const [formData, setFormData] = useState({
    reminderText: "",
    reminderDate: "",
    reminderTime: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const localTime = `${hours}:${minutes}`;
      
      setFormData({
        reminderText: "",
        reminderDate: localDate,
        reminderTime: localTime,
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !inquiry) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.reminderText.trim()) newErrors.reminderText = "Reminder text is required";
    if (!formData.reminderDate) newErrors.reminderDate = "Date is required";
    if (!formData.reminderTime) newErrors.reminderTime = "Time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      inquiryId: inquiry.id,
      ...formData
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 500, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#6804a1,#52037e)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Set Reminder</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>Set a reminder for {inquiry.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px 28px" }} className="space-y-5">
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Reminder *</label>
              <textarea
                name="reminderText"
                value={formData.reminderText}
                onChange={handleChange}
                placeholder="Enter reminder details..."
                rows={4}
                style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", resize: "none" }}
              />
              {errors.reminderText && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.reminderText}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Date *</label>
                <input
                  type="date"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.reminderDate && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.reminderDate}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Time *</label>
                <input
                  type="time"
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.reminderTime && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.reminderTime}</p>}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 12, background: "#fafafa" }}>
            <button type="button" onClick={onClose} disabled={saving}
              style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #cbd5e1", color: "#475569", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "linear-gradient(135deg,#6804a1,#52037e)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 8px rgba(104,4,161,0.35)" }}>
              {saving ? "Saving…" : "Set Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
