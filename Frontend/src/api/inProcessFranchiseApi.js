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

export const getInProcessFranchiseById = async (id) => {
    return apiClient.get(`/in-process-franchises/${id}`);
};

export const getActiveUsers = async () => {
    return apiClient.get("/auth/active-users");
};

export const submitFindStoreForm = async (id, formData) => {
    return apiClient.post(`/in-process-franchises/${id}/find-store`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const approveFindStoreForm = async (id) => {
    return apiClient.post(`/in-process-franchises/${id}/find-store/approve`);
};

export const rejectFindStoreForm = async (id, reason) => {
    return apiClient.post(`/in-process-franchises/${id}/find-store/reject`, { reason });
};

export const getAllFindStores = async () => {
    return apiClient.get("/in-process-franchises/find-stores/all");
};

export const submitAgreementGstForm = async (id, formData) => {
    return apiClient.post(`/in-process-franchises/${id}/agreement-gst`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const submitDocPrepForm = async (id, formData) => {
    return apiClient.post(`/in-process-franchises/${id}/doc-prep`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const submitStorePlanningForm = async (id, formData) => {
    return apiClient.post(`/in-process-franchises/${id}/store-planning`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const submitStoreAmbianceForm = async (id, formData) => {
    return apiClient.post(`/in-process-franchises/${id}/store-ambiance`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

