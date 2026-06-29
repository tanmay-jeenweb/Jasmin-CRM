import apiClient from "./authApi";

export const getInquiries = async () => {
    return apiClient.get("/inquiries/all");
};

export const createInquiry = async (data) => {
    return apiClient.post("/inquiries/add", data);
};

export const updateInquiry = async (id, data) => {
    return apiClient.put(`/inquiries/update/${id}`, data);
};

export const updateInquiryLabel = async (id, labelId) => {
    return apiClient.put(`/inquiries/update-label/${id}`, { labelId });
};
