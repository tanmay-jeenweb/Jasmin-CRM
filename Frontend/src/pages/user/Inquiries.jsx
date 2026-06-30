import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getInquiries, updateInquiry, updateInquiryLabel, updateInquiryStatus } from "../../api/inquiryApi";
import { getInquirySources } from "../../api/inquirySourceApi";
import { getCallLogs as getCallLogsApi, createCallLog as createCallLogApi } from "../../api/callLogApi";
import { getReminders as getRemindersApi, createReminder as createReminderApi } from "../../api/reminderApi";
import { getNotes as getNotesApi, createNote as createNoteApi } from "../../api/noteApi";
import LogCallModal from "./LogCallModal";
import SetReminderModal from "./SetReminderModal";
import NoteModal from "./NoteModal";
import LabelModal from "./LabelModal";
import InProcessFranchiseModal from "./InProcessFranchiseModal";
import WhatsAppModal from "./WhatsAppModal";
import { createInProcessFranchise } from "../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

// ─── Detailed View Modal ──────────────────────────────────────────────────────
function DetailedInquiryModal({ isOpen, inquiry, onClose }) {
  if (!isOpen || !inquiry) return null;

  const formatCurrency = (val) => {
    if (!val) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 600, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#6804a1,#52037e)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Inquiry Details</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>Detailed profile information</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px 28px", maxHeight: "65vh", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#d4b24f26", border: "1px solid #d4b24f40", color: "#a37e1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 22 }}>
              {inquiry.name ? inquiry.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{inquiry.name}</h3>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Source: {inquiry.inquirySource || "N/A"}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Email</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", wordBreak: "break-all" }}>{inquiry.email || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Phone</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{inquiry.phone || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>State</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{inquiry.state || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>City</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{inquiry.city || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>District</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{inquiry.district || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Current Occupation</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{inquiry.currentOccupation || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Field of Occupation</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{inquiry.fieldOfOccupation || "N/A"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Business Setup</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", textTransform: "capitalize" }}>
                {inquiry.businessLocation === "own" ? "Own Property" : inquiry.businessLocation === "rental" ? "Rental Property" : "N/A"}
              </span>
            </div>
            <div style={{ background: "#ecfdf5", padding: "10px 14px", borderRadius: 10, border: "1px solid #a7f3d0" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>Min Budget</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#047857" }}>{formatCurrency(inquiry.minBudget)}</span>
            </div>
            <div style={{ background: "#f5f3ff", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd6fe" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>Max Budget</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#6d28d9" }}>{formatCurrency(inquiry.maxBudget)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", background: "#fafafa" }}>
          <button type="button" onClick={onClose}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6804a1,#52037e)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Inquiry Modal ────────────────────────────────────────────────────────
function EditInquiryModal({ isOpen, inquiry, onClose, onSave, saving, sources }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    district: "",
    currentOccupation: "",
    fieldOfOccupation: "",
    businessLocation: "own",
    inquirySource: "",
    minBudget: "",
    maxBudget: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inquiry) {
      setFormData({
        name: inquiry.name || "",
        email: inquiry.email || "",
        phone: inquiry.phone || "",
        state: inquiry.state || "",
        city: inquiry.city || "",
        district: inquiry.district || "",
        currentOccupation: inquiry.currentOccupation || "",
        fieldOfOccupation: inquiry.fieldOfOccupation || "",
        businessLocation: inquiry.businessLocation || "own",
        inquirySource: inquiry.inquirySource || "",
        minBudget: inquiry.minBudget || "",
        maxBudget: inquiry.maxBudget || "",
      });
      setErrors({});
    }
  }, [inquiry, isOpen]);

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
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.currentOccupation.trim()) newErrors.currentOccupation = "Current occupation is required";
    if (!formData.fieldOfOccupation.trim()) newErrors.fieldOfOccupation = "Field of occupation is required";
    if (!formData.inquirySource) newErrors.inquirySource = "Inquiry source is required";

    const minBudgetVal = Number(formData.minBudget);
    const maxBudgetVal = Number(formData.maxBudget);

    if (!formData.minBudget || isNaN(minBudgetVal)) {
      newErrors.minBudget = "Minimum Budget is required";
    } else if (minBudgetVal < 1000000) {
      newErrors.minBudget = "Minimum Budget must not be less than 1,000,000";
    }

    if (!formData.maxBudget || isNaN(maxBudgetVal)) {
      newErrors.maxBudget = "Maximum Budget is required";
    } else if (maxBudgetVal < 5000000) {
      newErrors.maxBudget = "Maximum Budget must not be less than 5,000,000";
    } else if (minBudgetVal && maxBudgetVal < minBudgetVal) {
      newErrors.maxBudget = "Maximum Budget must be greater than or equal to Minimum Budget";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(inquiry.id, {
      ...formData,
      minBudget: minBudgetVal,
      maxBudget: maxBudgetVal
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 750, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#6804a1,#52037e)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Update Inquiry</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>Modify prospect details below</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px 28px", maxHeight: "60vh", overflowY: "auto" }} className="space-y-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.name && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.name}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.email && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.email}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.phone && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.phone}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.state && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.state}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.city && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.city}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.district && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.district}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Current Occupation *</label>
                <input
                  type="text"
                  name="currentOccupation"
                  value={formData.currentOccupation}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.currentOccupation && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.currentOccupation}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Field of Occupation *</label>
                <input
                  type="text"
                  name="fieldOfOccupation"
                  value={formData.fieldOfOccupation}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.fieldOfOccupation && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.fieldOfOccupation}</p>}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Business Location Setup *</label>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155" }}>
                  <input
                    type="radio"
                    name="businessLocation"
                    value="own"
                    checked={formData.businessLocation === "own"}
                    onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: "#6804a1" }}
                  />
                  Own Property
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155" }}>
                  <input
                    type="radio"
                    name="businessLocation"
                    value="rental"
                    checked={formData.businessLocation === "rental"}
                    onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: "#6804a1" }}
                  />
                  Rental Property
                </label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Inquiry Source *</label>
                <select
                  name="inquirySource"
                  value={formData.inquirySource}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", background: "#fff" }}
                >
                  <option value="">Select source...</option>
                  {sources.map((src) => (
                    <option key={src.id || src.source_name} value={src.source_name}>
                      {src.source_name}
                    </option>
                  ))}
                </select>
                {errors.inquirySource && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.inquirySource}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Min Budget *</label>
                <input
                  type="number"
                  name="minBudget"
                  value={formData.minBudget}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.minBudget && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.minBudget}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Max Budget *</label>
                <input
                  type="number"
                  name="maxBudget"
                  value={formData.maxBudget}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
                />
                {errors.maxBudget && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{errors.maxBudget}</p>}
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
              {saving ? "Saving…" : "Update Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function Inquiries() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCallLogModalOpen, setIsCallLogModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isInProcessModalOpen, setIsInProcessModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const [callLogs, setCallLogs] = useState([]);
  const [loadingCallLogs, setLoadingCallLogs] = useState(false);

  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);

  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load call logs, reminders, and notes for selected inquiry
  useEffect(() => {
    if (selectedInquiry?.id) {
      loadCallLogs(selectedInquiry.id);
      loadReminders(selectedInquiry.id);
      loadNotes(selectedInquiry.id);
    } else {
      setCallLogs([]);
      setReminders([]);
      setNotes([]);
    }
  }, [selectedInquiry?.id]);

  const loadCallLogs = async (inquiryId) => {
    setLoadingCallLogs(true);
    try {
      const response = await getCallLogsApi(inquiryId);
      setCallLogs(response.data.data || []);
    } catch (err) {
      console.error("Failed to load call logs:", err);
    } finally {
      setLoadingCallLogs(false);
    }
  };

  const loadReminders = async (inquiryId) => {
    setLoadingReminders(true);
    try {
      const response = await getRemindersApi(inquiryId);
      setReminders(response.data.data || []);
    } catch (err) {
      console.error("Failed to load reminders:", err);
    } finally {
      setLoadingReminders(false);
    }
  };

  const loadNotes = async (inquiryId) => {
    setLoadingNotes(true);
    try {
      const response = await getNotesApi(inquiryId);
      setNotes(response.data.data || []);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleNoteSave = async (noteData) => {
    setSaving(true);
    try {
      const response = await createNoteApi(noteData);
      if (response.data.success) {
        toast.success("Note added successfully!");
        setIsNoteModalOpen(false);
        if (selectedInquiry?.id) {
          await loadNotes(selectedInquiry.id);
        }
      } else {
        toast.error(response.data.message || "Failed to add note");
      }
    } catch (err) {
      console.error("Error adding note:", err);
      toast.error(err?.response?.data?.message || "Failed to add note.");
    } finally {
      setSaving(false);
    }
  };

  const handleLabelSave = async (inquiryId, labelId) => {
    setSaving(true);
    try {
      const response = await updateInquiryLabel(inquiryId, labelId);
      if (response.data.success) {
        toast.success("Label assigned successfully!");
        setIsLabelModalOpen(false);
        await loadInquiries();
      } else {
        toast.error(response.data.message || "Failed to assign label");
      }
    } catch (err) {
      console.error("Error assigning label:", err);
      toast.error(err?.response?.data?.message || "Failed to assign label.");
    } finally {
      setSaving(false);
    }
  };

  const handleInProcessSave = async (franchiseData) => {
    setSaving(true);
    try {
      const response = await createInProcessFranchise(franchiseData);
      if (response.data.success) {
        toast.success("Converted to In Process Franchise successfully!");
        setIsInProcessModalOpen(false);
        setSelectedInquiry(null);
        await loadInquiries();
      } else {
        toast.error(response.data.message || "Failed to convert");
      }
    } catch (err) {
      console.error("Error converting:", err);
      toast.error(err?.response?.data?.message || "Failed to convert.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogCallSave = async (logData) => {
    setSaving(true);
    try {
      const response = await createCallLogApi(logData);
      if (response.data.success) {
        toast.success("Call logged successfully!");
        setIsCallLogModalOpen(false);
        if (selectedInquiry?.id) {
          await loadCallLogs(selectedInquiry.id);
          if (logData.setReminder) {
            await loadReminders(selectedInquiry.id);
          }
        }
      } else {
        toast.error(response.data.message || "Failed to log call");
      }
    } catch (err) {
      console.error("Error logging call:", err);
      toast.error(err?.response?.data?.message || "Failed to log call.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetReminderSave = async (reminderData) => {
    setSaving(true);
    try {
      const response = await createReminderApi(reminderData);
      if (response.data.success) {
        toast.success("Reminder set successfully!");
        setIsReminderModalOpen(false);
        if (selectedInquiry?.id) {
          await loadReminders(selectedInquiry.id);
        }
      } else {
        toast.error(response.data.message || "Failed to set reminder");
      }
    } catch (err) {
      console.error("Error setting reminder:", err);
      toast.error(err?.response?.data?.message || "Failed to set reminder.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseInquiry = async () => {
    if (!selectedInquiry) return;
    if (!window.confirm("Are you sure you want to close this inquiry?")) return;
    setSaving(true);
    try {
      const response = await updateInquiryStatus(selectedInquiry.id, "closed");
      if (response.data.success) {
        toast.success("Inquiry closed successfully!");
        setSelectedInquiry(null);
        await loadInquiries();
      } else {
        toast.error(response.data.message || "Failed to close inquiry");
      }
    } catch (err) {
      console.error("Error closing inquiry:", err);
      toast.error(err?.response?.data?.message || "Failed to close inquiry.");
    } finally {
      setSaving(false);
    }
  };

  // Fetch inquiries from database
  const loadInquiries = async () => {
    setLoading(true);
    try {
      const response = await getInquiries();
      const dataList = response.data.data || [];

      // Map database keys to state model
      const mapped = dataList.map(inq => ({
        id: inq.id,
        name: inq.name,
        detail: inq.phone,
        email: inq.email,
        phone: inq.phone,
        state: inq.state,
        city: inq.city,
        district: inq.district,
        currentOccupation: inq.current_occupation,
        fieldOfOccupation: inq.field_of_occupation,
        businessLocation: inq.business_location,
        inquirySource: inq.inquiry_source,
        minBudget: Number(inq.min_budget),
        maxBudget: Number(inq.max_budget),
        label_id: inq.label_id,
        label_name: inq.label_name,
        status: inq.status
      }));

      setInquiries(mapped);

      // Select auto redirect ID or default to first
      if (location.state?.selectId) {
        const autoSelect = mapped.find(inq => inq.id === location.state.selectId);
        if (autoSelect) {
          setSelectedInquiry(autoSelect);
        }
        navigate(location.pathname, { replace: true, state: {} });
      } else if (mapped.length > 0) {
        // Keep currently selected if it still exists, else select first
        setSelectedInquiry(prev => {
          if (prev) {
            const exists = mapped.find(inq => inq.id === prev.id);
            if (exists) return exists;
          }
          return mapped[0];
        });
      }
    } catch (err) {
      console.error("Failed to load inquiries from database:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Inquiry Sources for Edit dropdown
  useEffect(() => {
    const loadSources = async () => {
      try {
        const response = await getInquirySources();
        setSources(response.data.data || []);
      } catch (err) {
        console.error("Failed to load inquiry sources", err);
      }
    };
    loadSources();
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [location.state, navigate, location.pathname]);

  // Filter inquiries based on search input
  const filteredInquiries = inquiries.filter(inquiry => {
    const query = searchQuery.toLowerCase();
    return (
      inquiry.name.toLowerCase().includes(query) ||
      inquiry.detail.toLowerCase().includes(query) ||
      (inquiry.email && inquiry.email.toLowerCase().includes(query)) ||
      (inquiry.city && inquiry.city.toLowerCase().includes(query))
    );
  });

  // Ensure the first filtered item is selected if current selection is filtered out
  useEffect(() => {
    if (filteredInquiries.length > 0) {
      const isStillPresent = filteredInquiries.some(inq => inq.id === selectedInquiry?.id);
      if (!isStillPresent) {
        setSelectedInquiry(filteredInquiries[0]);
      }
    } else {
      setSelectedInquiry(null);
    }
  }, [searchQuery, inquiries]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const formatCurrency = (val) => {
    if (!val) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleUpdateSave = async (id, updatedData) => {
    setSaving(true);
    try {
      const response = await updateInquiry(id, updatedData);
      if (response.data.success) {
        toast.success("Inquiry updated successfully!");
        setIsEditModalOpen(false);
        await loadInquiries();
      } else {
        toast.error(response.data.message || "Failed to update inquiry");
      }
    } catch (err) {
      console.error("Error updating inquiry:", err);
      toast.error(err?.response?.data?.message || "Failed to update inquiry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Navigation Header */}
      <Navbar title="ERP System" />

      <DetailedInquiryModal
        isOpen={isViewModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsViewModalOpen(false)}
      />

      <EditInquiryModal
        isOpen={isEditModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateSave}
        saving={saving}
        sources={sources}
      />

      <LogCallModal
        isOpen={isCallLogModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsCallLogModalOpen(false)}
        onSave={handleLogCallSave}
        saving={saving}
      />

      <SetReminderModal
        isOpen={isReminderModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSetReminderSave}
        saving={saving}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleNoteSave}
        saving={saving}
      />

      <LabelModal
        isOpen={isLabelModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsLabelModalOpen(false)}
        onSave={handleLabelSave}
        saving={saving}
      />

      <InProcessFranchiseModal
        isOpen={isInProcessModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsInProcessModalOpen(false)}
        onSave={handleInProcessSave}
        saving={saving}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        inquiry={selectedInquiry}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* Main CRM Workspace (2-Column Setup) */}
      <div className="flex-1 flex overflow-hidden mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">

        {/* Left Column: Inquiry list with Search & Create Button */}
        <div className="w-60 md:w-80 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col overflow-hidden">

          {/* Top Section: Action Button */}
          <div className="p-4 pb-2">
            <button
              onClick={() => navigate("/user/inquiries/create")}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#6804a1] hover:bg-[#52037e] text-white font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Inquiry
            </button>
          </div>

          {/* Search Input Box */}
          <div className="px-4 py-2">
            <div className="relative flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="absolute left-4 w-5 h-5 text-slate-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
              <input
                type="text"
                placeholder="Search name, phone, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder-slate-400 transition-all duration-150"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-slate-400 mt-3">Loading inquiries...</span>
              </div>
            ) : filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => {
                const isSelected = selectedInquiry?.id === inquiry.id;
                return (
                  <div
                    key={inquiry.id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all duration-150 border ${isSelected
                      ? "bg-indigo-50/80 border-indigo-200/80 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#d4b24f]/15 border border-[#d4b24f]/25 text-[#a37e1a] flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                      {getInitials(inquiry.name)}
                    </div>

                    {/* Contact Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {inquiry.name}
                        </h4>
                        {inquiry.label_name && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-indigo-50 text-[#6804a1] text-[9px] font-bold rounded-md border border-indigo-100/50">
                            {inquiry.label_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                        {inquiry.detail}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="text-xs font-semibold">No inquiries found</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Display Details / Action Workspace */}
        <div className="flex-1 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col overflow-hidden">
          {selectedInquiry ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Profile Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#d4b24f]/15 border border-[#d4b24f]/25 text-[#a37e1a] flex items-center justify-center font-bold text-2xl shadow-xs">
                    {getInitials(selectedInquiry.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-800">{selectedInquiry.name}</h2>
                      {selectedInquiry.label_name ? (
                        <span className="px-2 py-0.5 bg-indigo-50 text-[#6804a1] rounded-md text-[10px] font-bold border border-indigo-100/60">
                          {selectedInquiry.label_name}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold border border-slate-200">
                          No Label
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{selectedInquiry.inquirySource || "Direct Lead"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="mr-0.5">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setIsInProcessModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6804a1] hover:bg-[#52037e] text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-xs"
                  >
                    In Process
                  </button>
                  <button
                    onClick={handleCloseInquiry}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Close Inquiry
                  </button>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap gap-2.5 shrink-0">
                <button
                  onClick={() => setIsCallLogModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50/60 hover:bg-indigo-100/60 text-[#6804a1] font-bold rounded-lg text-xs border border-indigo-100/50 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  Log Call
                </button>
                <button
                  onClick={() => setIsReminderModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50/60 hover:bg-indigo-100/60 text-[#6804a1] font-bold rounded-lg text-xs border border-indigo-100/50 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Set Reminders
                </button>
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50/60 hover:bg-indigo-100/60 text-[#6804a1] font-bold rounded-lg text-xs border border-indigo-100/50 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Notes
                </button>
                <button
                  onClick={() => setIsLabelModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50/60 hover:bg-indigo-100/60 text-[#6804a1] font-bold rounded-lg text-xs border border-indigo-100/50 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#6804a1]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.43 1.43 0 0 0 2.022 0l4.318-4.318a1.43 1.43 0 0 0 0-2.022L11.16 3.659A2.23 2.23 0 0 0 9.568 3Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                  </svg>
                  Label
                </button>
                <button
                  onClick={() => setIsViewModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs border border-emerald-100 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  View
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs border border-amber-100 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Update Inquiry
                </button>
              </div>

              {/* Unified Scrollable Workspace Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">

                {/* Call Logs & Reminders Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white shrink-0">

                  {/* Left Column: Call Logs */}
                  <div className="p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                        Your Call Logs
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-bold">
                        {callLogs.length} {callLogs.length === 1 ? "log" : "logs"}
                      </span>
                    </div>

                    {loadingCallLogs ? (
                      <div className="flex items-center justify-center py-4 flex-1">
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
                      </div>
                    ) : callLogs.length > 0 ? (
                      <div className="space-y-2.5 flex-1">
                        {callLogs.map((log) => {
                          const formattedDate = new Date(log.call_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });
                          const formattedTime = log.call_time.substring(0, 5);

                          let outcomeClass = "bg-slate-100 text-slate-700 border-slate-200";
                          if (log.call_outcome === "Connected") {
                            outcomeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                          } else if (log.call_outcome === "Busy") {
                            outcomeClass = "bg-amber-50 text-amber-700 border-amber-200/60";
                          } else if (log.call_outcome === "No Answer") {
                            outcomeClass = "bg-rose-50 text-rose-700 border-rose-200/60";
                          } else if (log.call_outcome === "Wrong number") {
                            outcomeClass = "bg-red-50 text-red-700 border-red-200/60";
                          } else if (log.call_outcome.includes("Message") || log.call_outcome.includes("voicemail")) {
                            outcomeClass = "bg-blue-50 text-blue-700 border-blue-200/60";
                          }

                          return (
                            <div key={log.id} className="p-3 bg-white border border-slate-200/70 rounded-xl shadow-xs flex flex-col gap-1.5 transition-all hover:border-slate-300">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${outcomeClass}`}>
                                  {log.call_outcome}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {formattedDate} at {formattedTime}
                                </span>
                              </div>
                              {log.description && (
                                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                                  {log.description}
                                </p>
                              )}
                              {log.reminder_id && (
                                <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50/60 border border-amber-100 rounded-lg text-[10px] font-semibold text-amber-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-amber-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                  </svg>
                                  Linked Reminder: {log.reminder_text} ({new Date(log.reminder_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {log.reminder_time.substring(0, 5)})
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl flex-1 flex items-center justify-center">
                        <p className="text-[11px] font-semibold text-slate-400">No calls logged yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Reminders */}
                  <div className="p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Your Reminders
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-bold">
                        {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"}
                      </span>
                    </div>

                    {loadingReminders ? (
                      <div className="flex items-center justify-center py-4 flex-1">
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
                      </div>
                    ) : reminders.length > 0 ? (
                      <div className="space-y-2.5 flex-1">
                        {reminders.map((reminder) => {
                          const formattedDate = new Date(reminder.reminder_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });
                          const formattedTime = reminder.reminder_time.substring(0, 5);

                          return (
                            <div key={reminder.id} className="p-3 bg-white border border-slate-200/70 rounded-xl shadow-xs flex flex-col gap-1 transition-all hover:border-slate-300">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Due: {formattedDate} at {formattedTime}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                                {reminder.reminder_text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl flex-1 flex items-center justify-center">
                        <p className="text-[11px] font-semibold text-slate-400">No reminders set yet.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Notes Feed */}
                <div className="border-t border-slate-100 p-4 bg-slate-50/25 flex flex-col shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      Your Notes
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-bold">
                      {notes.length} {notes.length === 1 ? "note" : "notes"}
                    </span>
                  </div>

                  <div>
                    {loadingNotes ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#6804a1] rounded-full animate-spin"></div>
                      </div>
                    ) : notes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 pb-2">
                        {notes.map((note) => {
                          const formattedDate = new Date(note.timestamp).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          });

                          return (
                            <div key={note.id} className="p-3 bg-white border border-slate-200/70 rounded-xl shadow-xs flex flex-col gap-1.5 transition-all hover:border-slate-300">
                              <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {note.note_text}
                              </p>
                              <span className="text-[10px] text-slate-400 font-bold text-right self-end">
                                {formattedDate}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                        <p className="text-[11px] font-semibold text-slate-400">No notes added yet.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>


            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
              <span className="text-slate-600 font-semibold text-base">
                Select a contact from the list
              </span>
              <span className="text-slate-400 text-sm mt-1">
                to view details, log calls, set reminders, and send messages.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

