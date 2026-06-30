import React, { useState, useEffect } from "react";
import { submitFranchiseMarketingForm } from "../../../api/inProcessFranchiseApi";
import toast from "react-hot-toast";

export default function FranchiseMarketingForm({ franchiseId, franchiseMarketingData, reloadFranchiseData, getFileUrl }) {
  // File states
  const [comingSoonPostFile, setComingSoonPostFile] = useState(null);
  const [comingSoonPostName, setComingSoonPostName] = useState("");
  const [openingPhotoFile, setOpeningPhotoFile] = useState(null);
  const [openingPhotoName, setOpeningPhotoName] = useState("");
  const [thankYouPostFile, setThankYouPostFile] = useState(null);
  const [thankYouPostName, setThankYouPostName] = useState("");

  // Collateral checklist states
  const [invitationCard, setInvitationCard] = useState(false);
  const [visitingCard, setVisitingCard] = useState(false);
  const [grandOpening, setGrandOpening] = useState(false);

  // Marketing ideas states
  const [offerPamphlet, setOfferPamphlet] = useState(false);
  const [rickshawBanner, setRickshawBanner] = useState(false);
  const [hoarding, setHoarding] = useState(false);
  const [newspaperAdd, setNewspaperAdd] = useState(false);
  const [cinemaSlide, setCinemaSlide] = useState(false);
  const [reels, setReels] = useState(false);
  const [fmRadio, setFmRadio] = useState(false);
  const [socialMediaPostBoosting, setSocialMediaPostBoosting] = useState(false);

  // Text / Link states
  const [openingCityAddress, setOpeningCityAddress] = useState("");
  const [googleMyBusinessLink, setGoogleMyBusinessLink] = useState("");
  const [facebookBusinessPageLink, setFacebookBusinessPageLink] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (franchiseMarketingData) {
      setComingSoonPostName(franchiseMarketingData.coming_soon_post || "");
      setOpeningPhotoName(franchiseMarketingData.opening_photo || "");
      setThankYouPostName(franchiseMarketingData.thank_you_post || "");

      setInvitationCard(!!franchiseMarketingData.invitation_card);
      setVisitingCard(!!franchiseMarketingData.visiting_card);
      setGrandOpening(!!franchiseMarketingData.grand_opening);

      setOfferPamphlet(!!franchiseMarketingData.offer_pamphlet);
      setRickshawBanner(!!franchiseMarketingData.rickshaw_banner);
      setHoarding(!!franchiseMarketingData.hoarding);
      setNewspaperAdd(!!franchiseMarketingData.newspaper_add);
      setCinemaSlide(!!franchiseMarketingData.cinema_slide);
      setReels(!!franchiseMarketingData.reels);
      setFmRadio(!!franchiseMarketingData.fm_radio);
      setSocialMediaPostBoosting(!!franchiseMarketingData.social_media_post_boosting);

      setOpeningCityAddress(franchiseMarketingData.opening_city_address || "");
      setGoogleMyBusinessLink(franchiseMarketingData.google_my_business_link || "");
      setFacebookBusinessPageLink(franchiseMarketingData.facebook_business_page_link || "");
    }
  }, [franchiseMarketingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const fd = new FormData();
      
      // Append files
      if (comingSoonPostFile) fd.append("comingSoonPost", comingSoonPostFile);
      if (openingPhotoFile) fd.append("openingPhoto", openingPhotoFile);
      if (thankYouPostFile) fd.append("thankYouPost", thankYouPostFile);

      // Append checkboxes
      fd.append("invitationCard", invitationCard ? "true" : "false");
      fd.append("visitingCard", visitingCard ? "true" : "false");
      fd.append("grandOpening", grandOpening ? "true" : "false");

      fd.append("offerPamphlet", offerPamphlet ? "true" : "false");
      fd.append("rickshawBanner", rickshawBanner ? "true" : "false");
      fd.append("hoarding", hoarding ? "true" : "false");
      fd.append("newspaperAdd", newspaperAdd ? "true" : "false");
      fd.append("cinemaSlide", cinemaSlide ? "true" : "false");
      fd.append("reels", reels ? "true" : "false");
      fd.append("fmRadio", fmRadio ? "true" : "false");
      fd.append("socialMediaPostBoosting", socialMediaPostBoosting ? "true" : "false");

      // Append text / links
      fd.append("openingCityAddress", openingCityAddress.trim());
      fd.append("googleMyBusinessLink", googleMyBusinessLink.trim());
      fd.append("facebookBusinessPageLink", facebookBusinessPageLink.trim());

      const res = await submitFranchiseMarketingForm(franchiseId, fd);
      if (res.data?.success) {
        toast.success("Marketing details saved successfully!");
        await reloadFranchiseData();
      } else {
        toast.error(res.data?.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving franchise marketing details:", err);
      toast.error(err?.response?.data?.message || "Failed to save franchise marketing details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Marketing Files */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
          Marketing Files
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coming Soon Post */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">Coming soon post</label>
            <input
              type="file"
              onChange={(e) => setComingSoonPostFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
            {comingSoonPostName && (
              <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <a
                  href={getFileUrl(comingSoonPostName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                  title={comingSoonPostName}
                >
                  View Coming Soon Post
                </a>
              </div>
            )}
          </div>

          {/* Opening Photo */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">Opening photo upload</label>
            <input
              type="file"
              onChange={(e) => setOpeningPhotoFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
            {openingPhotoName && (
              <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <a
                  href={getFileUrl(openingPhotoName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                  title={openingPhotoName}
                >
                  View Opening Photo
                </a>
              </div>
            )}
          </div>

          {/* Thank You Post */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">Thank you post</label>
            <input
              type="file"
              onChange={(e) => setThankYouPostFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6804a1] hover:file:bg-violet-100 cursor-pointer"
            />
            {thankYouPostName && (
              <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6804a1]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <a
                  href={getFileUrl(thankYouPostName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6804a1] hover:underline text-xs font-bold truncate max-w-xs"
                  title={thankYouPostName}
                >
                  View Thank You Post
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Collateral Checklist */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
          Collateral Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Invitation card", state: invitationCard, setter: setInvitationCard },
            { label: "Visiting card", state: visitingCard, setter: setVisitingCard },
            { label: "Grand opening", state: grandOpening, setter: setGrandOpening }
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer select-none ${
                item.state
                  ? "bg-purple-50/30 border-purple-200 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.setter(e.target.checked)}
                className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Marketing Ideas */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
          Marketing Idea Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Offer pamphlet", state: offerPamphlet, setter: setOfferPamphlet },
            { label: "Rickshaw banner", state: rickshawBanner, setter: setRickshawBanner },
            { label: "Hoarding", state: hoarding, setter: setHoarding },
            { label: "Newspaper ad", state: newspaperAdd, setter: setNewspaperAdd },
            { label: "Cinema side", state: cinemaSlide, setter: setCinemaSlide },
            { label: "Reels", state: reels, setter: setReels },
            { label: "FM radio", state: fmRadio, setter: setFmRadio },
            { label: "Social media post boosting", state: socialMediaPostBoosting, setter: setSocialMediaPostBoosting }
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer select-none ${
                item.state
                  ? "bg-purple-50/30 border-purple-200 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.setter(e.target.checked)}
                className="w-4 h-4 rounded text-[#6804a1] focus:ring-[#6804a1] border-slate-300 accent-[#6804a1] cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Opening Details & Presence */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
          Opening Details & Business Presence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Opening City / Address */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">Opening city / address</label>
            <textarea
              rows={2}
              value={openingCityAddress}
              onChange={(e) => setOpeningCityAddress(e.target.value)}
              placeholder="Enter opening city and full address details"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
          </div>

          {/* Google My Business Page */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">Google My Business page (link)</label>
            <input
              type="url"
              value={googleMyBusinessLink}
              onChange={(e) => setGoogleMyBusinessLink(e.target.value)}
              placeholder="https://g.page/..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
            {googleMyBusinessLink && googleMyBusinessLink.startsWith("http") && (
              <a
                href={googleMyBusinessLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#6804a1] hover:underline"
              >
                Open Google My Business
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>

          {/* Facebook Business Page */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">Facebook business page (link)</label>
            <input
              type="url"
              value={facebookBusinessPageLink}
              onChange={(e) => setFacebookBusinessPageLink(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#6804a1]"
            />
            {facebookBusinessPageLink && facebookBusinessPageLink.startsWith("http") && (
              <a
                href={facebookBusinessPageLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#6804a1] hover:underline"
              >
                Open Facebook Business Page
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#6804a1] hover:bg-[#52037e] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Marketing Details"}
        </button>
      </div>
    </form>
  );
}
