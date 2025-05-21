import apiClient from '../config/api.config';

export const sinhVienService = {
  // Lấy danh sách sinh viên
  getAllSinhVien: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.sort) {
        queryParams.append('sort', params.sort);
    }

    if (params.search) {
        queryParams.append('search', params.search);
    }

    // Log URL và các query params trước khi gọi API
    console.log(`Calling GET /sinhviens with params: ${queryParams.toString()}`);

    return apiClient.get('/sinhviens', { params: queryParams })
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


  // Lấy chi tiết một sinh viên
  getSinhVien: (id) => {
    console.log(`Calling GET /sinhviens/${id}`);
    return apiClient.get(`/sinhviens/${id}`)
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Tạo sinh viên mới
  createSinhVien: (data) => {
    console.log('Calling POST /sinhviens with data:', data);
    return apiClient.post('/sinhviens', data)
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Cập nhật sinh viên
  updateSinhVien: (id, data) => {
    console.log(`Calling PATCH /sinhviens/${id} with data:`, data);
    return apiClient.patch(`/sinhviens/${id}`, data)
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Xóa sinh viên
  deleteSinhVien: async (id) => {
    try {
      console.log(`Calling DELETE /sinhviens/${id}`);
      console.log('Full URL:', `${apiClient.defaults.baseURL}/sinhviens/${id}`);
      const response = await apiClient.delete(`/sinhviens/${id}`);
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

  // Lấy 5 sinh viên gần nhất
  get5LatestSinhVien: () => {
    console.log('Calling GET /sinhviens?sort=createdAt');
    return apiClient.get('/sinhviens?sort=createdAt')
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy danh sách hình thức duy nhất
  getHinhThucs: () => {
    console.log('Calling GET /sinhviens?fields=hinhThuc');
    return apiClient.get('/sinhviens', { params: { fields: 'hinhThuc' } })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy danh sách cấp bậc duy nhất
  getCapBacs: () => {
    console.log('Calling GET /sinhviens?fields=capBac');
    return apiClient.get('/sinhviens', { params: { fields: 'capBac' } })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },

  // Lấy danh sách trường đối tác duy nhất
  getTruongDoiTacs: () => {
    console.log('Calling GET /sinhviens?fields=truongDoiTac');
    return apiClient.get('/sinhviens', { params: { fields: 'truongDoiTac' } })
      .then(response => {
        console.log('API response:', response);
        return response;
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error;
      });
  },
  getQuocGias: () => {
  console.log('Calling GET /sinhviens?fields=quocGia');
  return apiClient.get('/sinhviens', { params: { fields: 'quocGia' } })
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
