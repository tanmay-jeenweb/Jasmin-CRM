import apiClient from "./authApi";

export const getFranchises = async () => {
    return apiClient.get("/franchises/all");
};

export const getFranchiseById = async (id) => {
    return apiClient.get(`/franchises/${id}`);
};

export const updateFranchise = async (id, data) => {
    return apiClient.put(`/franchises/update/${id}`, data);
};

export const deleteFranchise = async (id) => {
    return apiClient.delete(`/franchises/delete/${id}`);
};
