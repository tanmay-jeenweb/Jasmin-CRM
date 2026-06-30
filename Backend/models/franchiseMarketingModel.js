const db = require('../config/db.js');

const createFranchiseMarketingTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_marketing (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            coming_soon_post VARCHAR(255) NULL,
            opening_photo VARCHAR(255) NULL,
            thank_you_post VARCHAR(255) NULL,
            invitation_card TINYINT(1) DEFAULT 0,
            visiting_card TINYINT(1) DEFAULT 0,
            grand_opening TINYINT(1) DEFAULT 0,
            offer_pamphlet TINYINT(1) DEFAULT 0,
            rickshaw_banner TINYINT(1) DEFAULT 0,
            hoarding TINYINT(1) DEFAULT 0,
            newspaper_add TINYINT(1) DEFAULT 0,
            cinema_slide TINYINT(1) DEFAULT 0,
            reels TINYINT(1) DEFAULT 0,
            fm_radio TINYINT(1) DEFAULT 0,
            social_media_post_boosting TINYINT(1) DEFAULT 0,
            opening_city_address TEXT NULL,
            google_my_business_link VARCHAR(500) NULL,
            facebook_business_page_link VARCHAR(500) NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Marketing table ready");
};

const getFranchiseMarketingByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            m.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_marketing m
        LEFT JOIN users u ON m.submitted_by = u.id
        WHERE m.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertFranchiseMarketing = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_marketing WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const comingSoonPostVal = data.comingSoonPost || null;
    const openingPhotoVal = data.openingPhoto || null;
    const thankYouPostVal = data.thankYouPost || null;
    
    const invitationCardVal = data.invitationCard ? 1 : 0;
    const visitingCardVal = data.visitingCard ? 1 : 0;
    const grandOpeningVal = data.grandOpening ? 1 : 0;
    
    const offerPamphletVal = data.offerPamphlet ? 1 : 0;
    const rickshawBannerVal = data.rickshawBanner ? 1 : 0;
    const hoardingVal = data.hoarding ? 1 : 0;
    const newspaperAddVal = data.newspaperAdd ? 1 : 0;
    const cinemaSlideVal = data.cinemaSlide ? 1 : 0;
    const reelsVal = data.reels ? 1 : 0;
    const fmRadioVal = data.fmRadio ? 1 : 0;
    const socialMediaPostBoostingVal = data.socialMediaPostBoosting ? 1 : 0;
    
    const openingCityAddressVal = data.openingCityAddress || null;
    const googleMyBusinessLinkVal = data.googleMyBusinessLink || null;
    const facebookBusinessPageLinkVal = data.facebookBusinessPageLink || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_marketing SET
                coming_soon_post = COALESCE(?, coming_soon_post),
                opening_photo = COALESCE(?, opening_photo),
                thank_you_post = COALESCE(?, thank_you_post),
                invitation_card = ?,
                visiting_card = ?,
                grand_opening = ?,
                offer_pamphlet = ?,
                rickshaw_banner = ?,
                hoarding = ?,
                newspaper_add = ?,
                cinema_slide = ?,
                reels = ?,
                fm_radio = ?,
                social_media_post_boosting = ?,
                opening_city_address = ?,
                google_my_business_link = ?,
                facebook_business_page_link = ?,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            comingSoonPostVal,
            openingPhotoVal,
            thankYouPostVal,
            invitationCardVal,
            visitingCardVal,
            grandOpeningVal,
            offerPamphletVal,
            rickshawBannerVal,
            hoardingVal,
            newspaperAddVal,
            cinemaSlideVal,
            reelsVal,
            fmRadioVal,
            socialMediaPostBoostingVal,
            openingCityAddressVal,
            googleMyBusinessLinkVal,
            facebookBusinessPageLinkVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_marketing (
                in_process_franchise_id, coming_soon_post, opening_photo, thank_you_post,
                invitation_card, visiting_card, grand_opening,
                offer_pamphlet, rickshaw_banner, hoarding, newspaper_add, cinema_slide, reels, fm_radio, social_media_post_boosting,
                opening_city_address, google_my_business_link, facebook_business_page_link, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            comingSoonPostVal,
            openingPhotoVal,
            thankYouPostVal,
            invitationCardVal,
            visitingCardVal,
            grandOpeningVal,
            offerPamphletVal,
            rickshawBannerVal,
            hoardingVal,
            newspaperAddVal,
            cinemaSlideVal,
            reelsVal,
            fmRadioVal,
            socialMediaPostBoostingVal,
            openingCityAddressVal,
            googleMyBusinessLinkVal,
            facebookBusinessPageLinkVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createFranchiseMarketingTable,
    getFranchiseMarketingByFranchiseId,
    upsertFranchiseMarketing
};
