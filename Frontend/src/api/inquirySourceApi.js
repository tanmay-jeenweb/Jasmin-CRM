import apiClient from "./authApi";

export const getInquirySources = async () => {
    return apiClient.get("/inquirysources/all");
};

export const createInquirySource = async (data) => {
    // data: { sourceName }
    return apiClient.post("/inquirysources/add", data);
};

export const updateInquirySource = async (id, data) => {
    // data: { sourceName }
    return apiClient.put(`/inquirysources/update/${id}`, data);
};

export const deleteInquirySource = async (id) => {
    return apiClient.delete(`/inquirysources/delete/${id}`);
};
