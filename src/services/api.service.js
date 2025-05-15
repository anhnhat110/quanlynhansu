import axios from 'axios';
import  apiConfig from '../config/api.config';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: apiConfig.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để xử lý lỗi
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Xử lý lỗi ở đây (ví dụ: hiển thị thông báo lỗi)
        return Promise.reject(error);
    }
);

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