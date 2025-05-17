import apiClient from '../config/api.config';

export const danhMucDoanService = {
  // Lấy danh sách đoàn
  getAllDanhMucDoan: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    if (params.search) {
      queryParams.append('search', params.search);
    }

    if (params.page) {
      queryParams.append('page', params.page);
    }

    if (params.limit) {
      queryParams.append('limit', params.limit);
    }

    console.log(`Calling GET /danhmucdoans with params: ${queryParams.toString()}`);

    return apiClient.get('/danhmucdoans', { params: queryParams })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy chi tiết một đoàn
  getDanhMucDoan: (id) => {
    console.log(`Calling GET /danhmucdoans/${id}`);
    return apiClient.get(`/danhmucdoans/${id}`)
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Tạo đoàn mới
  createDanhMucDoan: (data) => {
    console.log('Calling POST /danhmucdoans with data:', data);
    return apiClient.post('/danhmucdoans', data)
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Cập nhật đoàn
  updateDanhMucDoan: (id, data) => {
    console.log(`Calling PATCH /danhmucdoans/${id} with data:`, data);
    return apiClient.patch(`/danhmucdoans/${id}`, data)
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Xóa đoàn
  deleteDanhMucDoan: async (id) => {
    try {
      console.log(`Calling DELETE /danhmucdoans/${id}`);
      console.log('Full URL:', `${apiClient.defaults.baseURL}/danhmucdoans/${id}`);
      const response = await apiClient.delete(`/danhmucdoans/${id}`);
      console.log('Delete response:', response);
      return response;
    } catch (error) {
      console.error('Delete request failed:', {
        config: error.config,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Lấy 5 đoàn gần nhất
  get5LatestDanhMucDoan: () => {
    console.log('Calling GET /danhmucdoans?sort=createdAt');
    return apiClient.get('/danhmucdoans?sort=createdAt')
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy danh sách tên đoàn duy nhất
  getTenDoans: () => {
    console.log('Calling GET /danhmucdoans?fields=tenDoan');
    return apiClient.get('/danhmucdoans', { params: { fields: 'tenDoan' } })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy danh sách quốc tịch duy nhất
  getQuocTichs: () => {
    console.log('Calling GET /danhmucdoans?fields=quocTich');
    return apiClient.get('/danhmucdoans', { params: { fields: 'quocTich' } })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy danh sách nội dung duy nhất
  getNoiDungs: () => {
    console.log('Calling GET /danhmucdoans?fields=noiDung');
    return apiClient.get('/danhmucdoans', { params: { fields: 'noiDung' } })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },
};