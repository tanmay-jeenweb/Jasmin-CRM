import { useState, useEffect } from "react";
import { getActiveUsers } from "../../api/inProcessFranchiseApi";
import { getCompanyBrands } from "../../api/companyBrandApi";
import toast from "react-hot-toast";

export default function InProcessFranchiseModal({ isOpen, inquiry, franchise, onClose, onSave, saving }) {
  const [partnerName, setPartnerName] = useState("");
  const [partnerMobile, setPartnerMobile] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [franchiseCategory, setFranchiseCategory] = useState("");
  const [tentativeOpeningDate, setTentativeOpeningDate] = useState("");
  const [finalOpeningDate, setFinalOpeningDate] = useState("");
  const [bdmArea, setBdmArea] = useState("");
  const [inquiryManagerId, setInquiryManagerId] = useState("");
  const [storeName, setStoreName] = useState("JASMIN");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [companyBrands, setCompanyBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const isEdit = !!franchise;
  const isConversion = !!inquiry;

  useEffect(() => {
    if (isOpen) {
      // Fetch active users for inquiry manager dropdown
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await getActiveUsers();
          setUsers(res.data.data || []);
        } catch (err) {
          console.error("Failed to fetch active users:", err);
          toast.error("Failed to load inquiry managers.");
        } finally {
          setLoadingUsers(false);
        }
      };

      // Fetch company brands
      const fetchBrands = async () => {
        setLoadingBrands(true);
        try {
          const res = await getCompanyBrands();
          setCompanyBrands(res.data.data || []);
        } catch (err) {
          console.error("Failed to fetch company brands:", err);
          toast.error("Failed to load company brands.");
        } finally {
          setLoadingBrands(false);
        }
      };

      fetchUsers();
      fetchBrands();

      if (franchise) {
        setPartnerName(franchise.partner_name || "");
        setPartnerMobile(franchise.partner_mobile || "");
        setPartnerEmail(franchise.partner_email || "");
        setCity(franchise.city || "");
        setDistrict(franchise.district || "");
        setState(franchise.state || "");
        setFranchiseCategory(franchise.franchise_category || "");
        setTentativeOpeningDate(franchise.tentative_opening_date ? franchise.tentative_opening_date.substring(0, 10) : "");
        setFinalOpeningDate(franchise.final_opening_date ? franchise.final_opening_date.substring(0, 10) : "");
        setBdmArea(franchise.bdm_area || "");
        setInquiryManagerId(franchise.inquiry_manager_id || "");
        setStoreName(franchise.store_name || "JASMIN");
      } else if (inquiry) {
        setPartnerName(inquiry.name || "");
        setPartnerMobile(inquiry.phone || "");
        setPartnerEmail(inquiry.email || "");
        setCity(inquiry.city || "");
        setDistrict(inquiry.district || "");
        setState(inquiry.state || "");
        setFranchiseCategory("");
        setTentativeOpeningDate("");
        setFinalOpeningDate("");
        setBdmArea("");
        setInquiryManagerId("");
        setStoreName("JASMIN");
      } else {
        setPartnerName("");
        setPartnerMobile("");
        setPartnerEmail("");
        setCity("");
        setDistrict("");
        setState("");
        setFranchiseCategory("");
        setTentativeOpeningDate("");
        setFinalOpeningDate("");
        setBdmArea("");
        setInquiryManagerId("");
        setStoreName("JASMIN");
      }
    }
  }, [isOpen, inquiry, franchise]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!partnerName.trim()) return toast.error("Partner Name is required");
    if (!partnerMobile.trim()) return toast.error("Partner Mobile is required");
    if (!partnerEmail.trim()) return toast.error("Partner Email is required");
    if (!city.trim()) return toast.error("City is required");
    if (!district.trim()) return toast.error("District is required");
    if (!state.trim()) return toast.error("State is required");
    if (!bdmArea.trim()) return toast.error("BDM Area is required");
    if (!inquiryManagerId) return toast.error("Inquiry Manager is required");
    if (!storeName) return toast.error("Store Name is required");

    onSave({
      inquiryId: franchise ? franchise.inquiry_id : (inquiry ? inquiry.id : null),
      partnerName: partnerName.trim(),
      partnerMobile: partnerMobile.trim(),
      partnerEmail: partnerEmail.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      franchiseCategory: franchiseCategory.trim(),
      tentativeOpeningDate,
      finalOpeningDate: finalOpeningDate || null,
      bdmArea: bdmArea.trim(),
      inquiryManagerId,
      storeName
    });
  };

  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 };
  const inputStyle = { width: "100%", boxSizing: "border-box", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", transition: "all 0.15s" };
  const readOnlyStyle = { ...inputStyle, background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 650, margin: "0 auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh"
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#6804a1,#52037e)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
              {isEdit ? "Edit In Process Franchise" : (isConversion ? "Convert to In Process Franchise" : "Create In Process Franchise")}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d9e2ec" }}>
              {isEdit ? "Update franchise setup details" : "Fill out the franchise setup information"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Prefilled Fields (Only show when editing, hide during conversion) */}
              {!isConversion && (
                <>
                  {/* Partner Name */}
                  <div>
                    <label style={labelStyle}>Partner Name *</label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      style={inputStyle}
                      placeholder="Enter partner name"
                    />
                  </div>

                  {/* Partner Mobile */}
                  <div>
                    <label style={labelStyle}>Partner Mobile No. *</label>
                    <input
                      type="text"
                      value={partnerMobile}
                      onChange={(e) => setPartnerMobile(e.target.value)}
                      style={inputStyle}
                      placeholder="Enter mobile number"
                    />
                  </div>

                  {/* Partner Email */}
                  <div>
                    <label style={labelStyle}>Partner Email *</label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      style={inputStyle}
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={inputStyle}
                      placeholder="Enter city"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label style={labelStyle}>District *</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      style={inputStyle}
                      placeholder="Enter district"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label style={labelStyle}>State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={inputStyle}
                      placeholder="Enter state"
                    />
                  </div>
                </>
              )}

              {/* Franchise Category */}
              <div>
                <label style={labelStyle}>Franchise Category</label>
                <input
                  type="text"
                  value={franchiseCategory}
                  onChange={(e) => setFranchiseCategory(e.target.value)}
                  style={inputStyle}
                  placeholder="Category (optional)"
                />
              </div>

              {/* BDM Area */}
              <div>
                <label style={labelStyle}>BDM Area *</label>
                <input
                  type="text"
                  value={bdmArea}
                  onChange={(e) => setBdmArea(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter BDM area"
                />
              </div>

              {/* Tentative Opening Date */}
              <div>
                <label style={labelStyle}>Tentative Opening Date</label>
                <input
                  type="date"
                  value={tentativeOpeningDate}
                  onChange={(e) => setTentativeOpeningDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Final Opening Date */}
              <div>
                <label style={labelStyle}>Final Opening Date</label>
                <input
                  type="date"
                  value={finalOpeningDate}
                  onChange={(e) => setFinalOpeningDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Inquiry Manager */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Inquiry Manager *</label>
                <select
                  value={inquiryManagerId}
                  onChange={(e) => setInquiryManagerId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Inquiry Manager</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Name Radio Buttons */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Store Name *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 8 }}>
                  {companyBrands.length > 0 ? (
                    companyBrands.map((brand) => (
                      <label key={brand.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155" }}>
                        <input
                          type="radio"
                          name="storeName"
                          value={brand.brand_name}
                          checked={storeName === brand.brand_name}
                          onChange={(e) => setStoreName(e.target.value)}
                          style={{ accentColor: "#6804a1", width: 16, height: 16 }}
                        />
                        {brand.brand_name}
                      </label>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                      No brands available in Company Brand Master
                    </span>
                  )}
                </div>
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
              disabled={saving || loadingUsers}
              style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "linear-gradient(135deg,#6804a1,#52037e)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 8px rgba(104,4,161,0.35)" }}>
              {saving ? "Saving…" : (isEdit ? "Update Franchise" : "Convert Franchise")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
