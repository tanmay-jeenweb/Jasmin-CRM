import apiClient from "./authApi";

export const createCallLog = async (data) => {
    return apiClient.post("/call-logs/add", data);
};

export const getCallLogs = async (inquiryId) => {
    return apiClient.get(`/call-logs/inquiry/${inquiryId}`);
};
