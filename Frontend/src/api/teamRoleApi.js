import apiClient from "./authApi";

export const getTeamRoles = async () => {
    return apiClient.get("/teamroles/all");
};

export const createTeamRole = async (data) => {
    // data: { role, isRequired }
    return apiClient.post("/teamroles/add", data);
};

export const updateTeamRole = async (id, data) => {
    // data: { role, isRequired }
    return apiClient.put(`/teamroles/update/${id}`, data);
};

export const deleteTeamRole = async (id) => {
    return apiClient.delete(`/teamroles/delete/${id}`);
};
