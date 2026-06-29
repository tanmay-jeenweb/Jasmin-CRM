import apiClient from "./authApi";

export const getCompanyBrands = async () => {
    return apiClient.get("/companybrands/all");
};

export const createCompanyBrand = async (data) => {
    // data: { brandName }
    return apiClient.post("/companybrands/add", data);
};

export const updateCompanyBrand = async (id, data) => {
    // data: { brandName }
    return apiClient.put(`/companybrands/update/${id}`, data);
};

export const deleteCompanyBrand = async (id) => {
    return apiClient.delete(`/companybrands/delete/${id}`);
};
