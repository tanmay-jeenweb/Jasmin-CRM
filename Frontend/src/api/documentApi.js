import apiClient from "./authApi";

export const getDocuments = async () => {
    return apiClient.get("/documents/all");
};

export const createDocument = async (data) => {
    // data: { docType, isRequired }
    return apiClient.post("/documents/add", data);
};

export const updateDocument = async (id, data) => {
    // data: { docType, isRequired }
    return apiClient.put(`/documents/update/${id}`, data);
};

export const deleteDocument = async (id) => {
    return apiClient.delete(`/documents/delete/${id}`);
};
