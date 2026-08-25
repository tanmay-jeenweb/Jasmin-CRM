import apiClient from "./authApi";

export const syncBranches = async () => {
    return apiClient.post("/branch-franchise-mappings/sync");
};

export const getUnmappedFranchises = async () => {
    return apiClient.get("/branch-franchise-mappings/unmapped-franchises");
};

export const getUnmappedBranches = async () => {
    return apiClient.get("/branch-franchise-mappings/unmapped-branches");
};

export const getAllMappings = async () => {
    return apiClient.get("/branch-franchise-mappings/all");
};

export const createMapping = async (data) => {
    // data: { franchiseId, branchCode }
    return apiClient.post("/branch-franchise-mappings/map", data);
};

export const deleteMapping = async (id) => {
    return apiClient.delete(`/branch-franchise-mappings/unmap/${id}`);
};
