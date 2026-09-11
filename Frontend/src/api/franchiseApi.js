import apiClient from "./authApi";

export const getFranchises = async (params = {}) => {
    return apiClient.get("/franchises/all", { params });
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

export const restoreFranchise = async (id) => {
    return apiClient.put(`/franchises/restore/${id}`);
};
