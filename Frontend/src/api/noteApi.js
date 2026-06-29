import apiClient from "./authApi";

export const createNote = async (data) => {
    return apiClient.post("/notes/add", data);
};

export const getNotes = async (inquiryId) => {
    return apiClient.get(`/notes/inquiry/${inquiryId}`);
};
