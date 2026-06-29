import apiClient from "./authApi";

export const createReminder = async (data) => {
    return apiClient.post("/reminders/add", data);
};

export const getReminders = async (inquiryId) => {
    return apiClient.get(`/reminders/inquiry/${inquiryId}`);
};

export const getUnreadReminders = async () => {
    return apiClient.get("/reminders/unread");
};

export const markReminderAsRead = async (id) => {
    return apiClient.put(`/reminders/${id}/read`);
};

