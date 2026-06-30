import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getInProcessFranchiseById, getActiveUsers, updateInProcessFranchise } from "../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function InProcessFranchiseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  // No activeTab state needed since Complete View has been removed

  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  // Form states for editable fields
  const [tentativeOpeningDate, setTentativeOpeningDate] = useState("");
  const [finalOpeningDate, setFinalOpeningDate] = useState("");
  const [bdmArea, setBdmArea] = useState("");
  const [inquiryManagerId, setInquiryManagerId] = useState("");
  const [storeName, setStoreName] = useState("");

  const getLocalDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [franchiseRes, usersRes] = await Promise.all([
          getInProcessFranchiseById(id),
          getActiveUsers()
        ]);
        
        if (franchiseRes.data?.success) {
          const f = franchiseRes.data.data;
          setFranchise(f);
          // Initialize form states
          setTentativeOpeningDate(getLocalDateString(f.tentative_opening_date));
          setFinalOpeningDate(getLocalDateString(f.final_opening_date));
          setBdmArea(f.bdm_area || "");
          setInquiryManagerId(f.inquiry_manager_id || "");
          setStoreName(f.store_name || "JASMIN");
        } else {
          toast.error("Failed to fetch franchise details.");
        }
        
        if (usersRes.data?.success) {
          setUsers(usersRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load details:", err);
        toast.error("Error loading details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleSaveChanges = async () => {
    if (!tentativeOpeningDate) return toast.error("Tentative Opening Date is required");
    if (!bdmArea.trim()) return toast.error("BDM Area is required");
    if (!inquiryManagerId) return toast.error("Inquiry Manager is required");
    if (!storeName) return toast.error("Store Name is required");

    setSaving(true);
    try {
      const response = await updateInProcessFranchise(id, {
        partnerName: franchise.partner_name,
        partnerMobile: franchise.partner_mobile,
        partnerEmail: franchise.partner_email || "",
        city: franchise.city,
        district: franchise.district,
        state: franchise.state,
        franchiseCategory: franchise.franchise_category || "",
        tentativeOpeningDate,
        finalOpeningDate: finalOpeningDate || null,
        bdmArea: bdmArea.trim(),
        inquiryManagerId,
        storeName
      });

      if (response.data.success) {
        toast.success("Franchise updated successfully!");
        // Refresh the franchise details to keep them in sync
        const res = await getInProcessFranchiseById(id);
        if (res.data?.success) {
          setFranchise(res.data.data);
        }
      } else {
        toast.error(response.data.message || "Failed to update franchise");
      }
    } catch (err) {
      console.error("Error updating franchise:", err);
      toast.error(err?.response?.data?.message || "Failed to update franchise.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-[#6804a1] rounded-full animate-spin"></div>
            <p className="text-slate-500 font-semibold text-sm animate-pulse">Loading franchise details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Franchise Not Found</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              The franchise record you are looking for does not exist or has been deleted.
            </p>
            <button
              onClick={() => navigate("/user/in-process-franchises")}
              className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumbs and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {franchise.partner_name}
              <span className="text-xs bg-[#f5f3ff] text-[#6804a1] border border-indigo-100 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {franchise.store_name}
              </span>
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              BDM Area: <span className="font-semibold text-slate-700">{franchise.bdm_area}</span> • Inquiry Manager: <span className="font-semibold text-slate-700">{franchise.inquiry_manager_name || "N/A"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/user/in-process-franchises")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-xs py-1.5 px-3 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Franchise List
            </button>
            
          </div>
        </div>

        {/* Contact Details Form (as requested by user) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800">Contact details</h2>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
            {/* Row 1 */}
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">Partner Name</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.partner_name}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">Partner Mobile</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.partner_mobile}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">City</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.city}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">District</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.district}</span>
            </div>

            {/* Row 2 */}
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">State</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.state || "\u00A0"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-1">Franchise category</span>
              <span className="text-sm font-semibold text-slate-800">{franchise.franchise_category || "\u00A0"}</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tentative Opening Date</label>
              <input
                type="date"
                value={tentativeOpeningDate}
                onChange={(e) => setTentativeOpeningDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Final Opening Date :</label>
              <input
                type="date"
                value={finalOpeningDate}
                onChange={(e) => setFinalOpeningDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">BDM Area :</label>
              <input
                type="text"
                value={bdmArea}
                onChange={(e) => setBdmArea(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Inquiry Manager :</label>
              <select
                value={inquiryManagerId}
                onChange={(e) => setInquiryManagerId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1] bg-white"
              >
                <option value="">Select Inquiry Manager</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 4 - Store Name */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Store Name :</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { val: "8 to 9", label: "8 TO 9" },
                  { val: "BIG PHONE", label: "BIG PHONE" },
                  { val: "JASMIN", label: "JASMIN" },
                  { val: "PHONE 2 PHONE", label: "Phone 2 Phone" }
                ].map((store) => (
                  <label key={store.val} className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-500 uppercase">
                    <input
                      type="radio"
                      name="storeName"
                      value={store.val}
                      checked={storeName === store.val}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-4 h-4 text-[#6804a1] focus:ring-[#6804a1] accent-[#6804a1]"
                    />
                    {store.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
