import apiClient from '../config/api.config';

export const chuyenGiaService = {
    // Lấy danh sách chuyên gia
    getAllChuyenGia: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.sort) {
          queryParams.append('sort', params.sort);
        }
        
        if (params.search) {
          queryParams.append('search', params.search); // Thêm tham số search
        }
        
        // Log URL và các query params trước khi gọi API
        console.log(`Calling GET /chuyengias with params: ${queryParams.toString()}`);
    
        return apiClient.get('/chuyengias', { params: queryParams })
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

    // Lấy chi tiết một chuyên gia
    getChuyenGiaById: (id) => {
        return apiClient.get(`/chuyengias/${id}`);
    },

    // Tạo chuyên gia mới
    createChuyenGia: (data) => {
        return apiClient.post('/chuyengias', data);
    },

    // Cập nhật chuyên gia
    updateChuyenGia: (id, data) => {
        return apiClient.patch(`/chuyengias/${id}`, data);
    },

    // Xóa chuyên gia
    deleteChuyenGia: async (id) => {
        try {
            const response = await apiClient.delete(`/chuyengias/${id}`);
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
    },// Lấy danh sách trường đơn vị duy nhất
    getTruongDonVis: () => {
      return apiClient.get('/chuyengias', { params: { fields: 'truongDonVi' } });
    },
    
    // Lấy danh sách chức danh duy nhất
    getChucDanhs: () => {
      return apiClient.get('/chuyengias', { params: { fields: 'chucDanh' } });
    },
    
    // Lấy danh sách quốc gia duy nhất
    getQuocGias: () => {
      return apiClient.get('/chuyengias', { params: { fields: 'quocGia' } });
    }
    

}; 