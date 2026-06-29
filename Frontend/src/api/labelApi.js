import apiClient from "./authApi";

export const getLabels = async () => {
    return apiClient.get("/labels/all");
};

export const createLabel = async (data) => {
    // data: { labelName }
    return apiClient.post("/labels/add", data);
};

export const updateLabel = async (id, data) => {
    // data: { labelName }
    return apiClient.put(`/labels/update/${id}`, data);
};

export const deleteLabel = async (id) => {
    return apiClient.delete(`/labels/delete/${id}`);
};
