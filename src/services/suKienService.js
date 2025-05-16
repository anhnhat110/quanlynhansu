import apiClient from '../config/api.config';

export const suKienService = {
    // Lấy danh sách sự kiện
    getAllSuKien: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.sort) {
            queryParams.append('sort', params.sort);
        }

        if (params.search) {
            queryParams.append('search', params.search); // Thêm tham số search
        }

        // Log URL và các query params trước khi gọi API
        console.log(`Calling GET /sukiens with params: ${queryParams.toString()}`);

        return apiClient.get('/sukiens', { params: queryParams })
            .then(response => {
                // Log response sau khi nhận được từ API
                console.log('API response:', response);
                return response;
            })
            .catch(error => {
                // Log error nếu có lỗi
                console.error('API request failed:', error);
                throw error;
            });
    },

    // Lấy chi tiết một sự kiện
    getSuKienById: (id) => {
        console.log(`Calling GET /sukiens/${id}`);
        return apiClient.get(`/sukiens/${id}`);
    },

    // Tạo sự kiện mới
    createSuKien: (data) => {
        console.log('Calling POST /sukiens with data:', data);
        return apiClient.post('/sukiens', data);
    },

    // Cập nhật sự kiện
    updateSuKien: (id, data) => {
        console.log(`Calling PATCH /sukiens/${id} with data:`, data);
        return apiClient.patch(`/sukiens/${id}`, data);
    },

    // Xóa sự kiện
    deleteSuKien: async (id) => {
        try {
            console.log(`Calling DELETE /sukiens/${id}`);
            console.log('Full URL:', `${apiClient.defaults.baseURL}/sukiens/${id}`);
            const response = await apiClient.delete(`/sukiens/${id}`);
            console.log('Delete response:', response);
            return response;
        } catch (error) {
            console.error('Delete request failed:', {
                config: error.config,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },
    // Lấy 5 sự kiện gần nhất
    get5LatestSuKien: () => {
        console.log('Calling GET /sukiens?sort=createdAt');
        return apiClient.get('/sukiens?sort=createdAt')
            .then(response => {
                console.log('API response:', response);
                return response;
            })
            .catch(error => {
                console.error('API request failed:', error);
                throw error;
            });
    },
    getMucDichMucDichs: () => {
        return apiClient.get('/sukiens', { params: { fields: 'mucDich' } });
      },
      
      // Lấy danh sách chức danh duy nhất
      getChuyenGias: () => {
        return apiClient.get('/sukiens', { params: { fields: 'chuyenGia' } });
      },
      
      // Lấy danh sách quốc gia duy nhất
      getThanhPhans: () => {
        return apiClient.get('/sukiens', { params: { fields: 'thanhPhan' } });
      }
}; 