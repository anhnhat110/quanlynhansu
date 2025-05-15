import axios from 'axios';

const apiConfig = axios.create({
    baseURL: 'http://127.0.0.1:3005/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false
});

// Thêm interceptor để xử lý response
apiConfig.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        throw error;
    }
);

// Thêm interceptor để xử lý request
apiConfig.interceptors.request.use(
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

export default apiConfig; 