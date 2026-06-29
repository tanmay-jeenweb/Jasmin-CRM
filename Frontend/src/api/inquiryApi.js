import apiClient from "./authApi";

export const getInquiries = async () => {
    return apiClient.get("/inquiries/all");
};

export const createInquiry = async (data) => {
    return apiClient.post("/inquiries/add", data);
};
