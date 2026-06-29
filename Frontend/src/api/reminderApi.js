import apiClient from "./authApi";

export const createReminder = async (data) => {
    return apiClient.post("/reminders/add", data);
};

export const getReminders = async (inquiryId) => {
    return apiClient.get(`/reminders/inquiry/${inquiryId}`);
};
