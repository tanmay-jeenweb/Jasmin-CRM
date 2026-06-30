import { useState, useEffect } from "react";

export default function WhatsAppModal({ isOpen, inquiry, onClose }) {
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMessageText("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !inquiry) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError("Message text is required.");
      return;
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = inquiry.phone ? inquiry.phone.replace(/\D/g, "") : "";
    
    // If it's a 10-digit number (common in India), prepend '91' country code
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    if (!finalPhone) {
      setError("Inquiry does not have a valid phone number.");
      return;
    }

    // Construct WhatsApp Web URL
    const url = `https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(messageText.trim())}`;
    
    // Open in a new tab
    window.open(url, "_blank");
    
    // Close the modal
    onClose();
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
        <div style={{ 
          padding: "20px 28px", 
          borderBottom: "1px solid #f1f5f9", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          color: "#fff"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
              </svg>
              Send WhatsApp Message
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>To {inquiry.name} ({inquiry.phone || "No phone"})</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSend}>
          <div style={{ padding: "24px 28px" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Message *</label>
              <textarea
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Type your WhatsApp message here..."
                rows={5}
                style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", resize: "none" }}
              />
              {error && <p style={{ color: "#e11d48", fontSize: 11, margin: "4px 0 0" }}>{error}</p>}
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 12, background: "#fafafa" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #cbd5e1", color: "#475569", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="submit"
              style={{ 
                padding: "9px 24px", 
                borderRadius: 8, 
                border: "none", 
                background: "linear-gradient(135deg, #25D366, #128C7E)", 
                color: "#fff", 
                fontWeight: 700, 
                fontSize: 13, 
                cursor: "pointer", 
                boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              Send via WhatsApp Web
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
