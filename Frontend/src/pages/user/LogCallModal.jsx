import { useState, useEffect } from "react";

export default function LogCallModal({ isOpen, inquiry, onClose, onSave, saving }) {
  const [formData, setFormData] = useState({
    callOutcome: "",
    callDate: "",
    callTime: "",
    description: "",
    setReminder: false,
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
        callOutcome: "",
        callDate: localDate,
        callTime: localTime,
        description: "",
        setReminder: false,
        reminderText: "",
        reminderDate: localDate,
        reminderTime: localTime,
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !inquiry) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.callOutcome) newErrors.callOutcome = "Call outcome is required";
    if (!formData.callDate) newErrors.callDate = "Date is required";
    if (!formData.callTime) newErrors.callTime = "Time is required";

    if (formData.setReminder) {
      if (!formData.reminderText.trim()) newErrors.reminderText = "Reminder text is required";
      if (!formData.reminderDate) newErrors.reminderDate = "Reminder date is required";
      if (!formData.reminderTime) newErrors.reminderTime = "Reminder time is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      inquiryId: inquiry.id,
      ...formData
    });
  };

  const outcomeOptions = [
    "Busy",
    "Connected",
    "Left Live Message",
    "Left voicemail",
    "No Answer",
    "Wrong number"
  ];

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
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Log Call</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>Log call details for {inquiry.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px 28px", maxHeight: "60vh", overflowY: "auto" }} className="space-y-5">
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Call Outcome *</label>
              <select
                name="callOutcome"
                value={formData.callOutcome}
                onChange={handleChange}
                style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fff" }}
              >
                <option value="">Select</option>
                {outcomeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.callOutcome && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.callOutcome}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Date *</label>
                <input
                  type="date"
                  name="callDate"
                  value={formData.callDate}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.callDate && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.callDate}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Time *</label>
                <input
                  type="time"
                  name="callTime"
                  value={formData.callTime}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.callTime && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.callTime}</p>}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Describe the call</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the call..."
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", resize: "none" }}
              />
            </div>

            {/* Set Reminder Section */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155" }}>
                <input
                  type="checkbox"
                  name="setReminder"
                  checked={formData.setReminder}
                  onChange={handleChange}
                  style={{ width: 16, height: 16, accentColor: "#6804a1" }}
                />
                Set a Reminder for this call
              </label>
            </div>

            {formData.setReminder && (
              <div className="space-y-4" style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Reminder Text *</label>
                  <input
                    type="text"
                    name="reminderText"
                    value={formData.reminderText}
                    onChange={handleChange}
                    placeholder="e.g. Follow up on budget discussion"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", background: "#fff" }}
                  />
                  {errors.reminderText && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.reminderText}</p>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Date *</label>
                    <input
                      type="date"
                      name="reminderDate"
                      value={formData.reminderDate}
                      onChange={handleChange}
                      style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", background: "#fff" }}
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
                      style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", background: "#fff" }}
                    />
                    {errors.reminderTime && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.reminderTime}</p>}
                  </div>
                </div>
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
              disabled={saving}
              style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "linear-gradient(135deg,#6804a1,#52037e)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 8px rgba(104,4,161,0.35)" }}>
              {saving ? "Saving…" : "Save Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
