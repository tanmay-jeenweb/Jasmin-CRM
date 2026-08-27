import apiClient from "./authApi";

export const syncMasterData = async (options) => {
    // options: { syncBrands: boolean, syncCompanies: boolean, syncMachines: boolean }
    return apiClient.post("/sync/masters", options);
};
