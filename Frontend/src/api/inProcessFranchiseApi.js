import apiClient from "./authApi";

export const getInProcessFranchises = async () => {
    return apiClient.get("/in-process-franchises/all");
};

export const createInProcessFranchise = async (data) => {
    return apiClient.post("/in-process-franchises/add", data);
};

export const updateInProcessFranchise = async (id, data) => {
    return apiClient.put(`/in-process-franchises/update/${id}`, data);
};

export const deleteInProcessFranchise = async (id) => {
    return apiClient.delete(`/in-process-franchises/delete/${id}`);
};

export const getActiveUsers = async () => {
    return apiClient.get("/auth/active-users");
};
