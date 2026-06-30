import apiClient from "./authApi";

export const getCallOutcomes = async () => {
    return apiClient.get("/calloutcomes/all");
};

export const createCallOutcome = async (data) => {
    // data: { outcomeName }
    return apiClient.post("/calloutcomes/add", data);
};

export const updateCallOutcome = async (id, data) => {
    // data: { outcomeName }
    return apiClient.put(`/calloutcomes/update/${id}`, data);
};

export const deleteCallOutcome = async (id) => {
    return apiClient.delete(`/calloutcomes/delete/${id}`);
};
