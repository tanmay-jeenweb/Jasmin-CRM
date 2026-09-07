import apiClient from "./authApi";

export const getStoreBrands = async () => {
    return apiClient.get("/storebrands/all");
};

export const createStoreBrand = async (data) => {
    // data: { name, forCode }
    return apiClient.post("/storebrands/add", data);
};

export const updateStoreBrand = async (id, data) => {
    // data: { name, forCode }
    return apiClient.put(`/storebrands/update/${id}`, data);
};

export const deleteStoreBrand = async (id) => {
    return apiClient.delete(`/storebrands/delete/${id}`);
};
