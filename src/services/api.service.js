import  apiClient from '../config/api.config';



export const apiService = {
    // GET request
    get: async (endpoint) => {
        const response = await apiClient.get(endpoint);
        return response.data;
    },

    // POST request
    post: async (endpoint, data) => {
        const response = await apiClient.post(endpoint, data);
        return response.data;
    },

    // PUT request
    put: async (endpoint, data) => {
        const response = await apiClient.put(endpoint, data);
        return response.data;
    },

    // PATCH request
    patch: async (endpoint, data) => {
        const response = await apiClient.patch(endpoint, data);
        return response.data;
    },

    // DELETE request
    delete: async (endpoint) => {
        const response = await apiClient.delete(endpoint);
        return response.data;
    },
}; 