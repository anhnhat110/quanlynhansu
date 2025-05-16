import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false
});

// Thêm interceptor để xử lý response
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        throw error;
    }
);

// Thêm interceptor để xử lý request
apiClient.interceptors.request.use(
    (config) => {
        // Đảm bảo headers luôn được gửi đi
        config.headers = {
            ...config.headers,
            'Accept': 'application/json'
        };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient; 