import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

const userService = {
  createUser: async (userData) => {
    try {
      console.log('Đang gửi yêu cầu đăng ký:', userData);
      const response = await axios.post(`${API_URL}/signup`, userData, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log('Phản hồi đăng ký:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng ký:', error.message, error.response?.data);
      if (error.message.includes('Network Error')) {
        throw { message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend tại http://127.0.0.1:3005 hoặc thử lại sau.' };
      }
      throw error.response?.data || { message: 'Không thể tạo người dùng' };
    }
  },

  login: async (loginData) => {
    try {
      console.log('Đang gửi yêu cầu đăng nhập:', loginData);
      const response = await axios.post(`${API_URL}/login`, loginData, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log('Phản hồi đăng nhập:', response.data);
      if (response.data.token) {
        localStorage.setItem('jwt', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.message, error.response?.data);
      if (error.message.includes('Network Error')) {
        throw { message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend tại http://127.0.0.1:3005 hoặc thử lại sau.' };
      }
      if (error.response?.status === 401) {
        throw { message: 'Email hoặc mật khẩu không đúng' };
      }
      throw error.response?.data || { message: 'Không thể đăng nhập' };
    }
  },

  forgotPassword: async (data) => {
    try {
      console.log('Đang gửi yêu cầu quên mật khẩu:', data);
      const response = await axios.post(`${API_URL}/forgotPassword`, data, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log('Phản hồi quên mật khẩu:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error.message, error.response?.data);
      if (error.message.includes('Network Error')) {
        throw { message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend tại http://127.0.0.1:3005 hoặc thử lại sau.' };
      }
      throw error.response?.data || { message: 'Không thể gửi liên kết đặt lại mật khẩu' };
    }
  },

  resetPassword: async ({ token, matkhau, matkhauXacNhan }) => {
    try {
      const response = await axios.patch(`${API_URL}/resetPassword/${token}`, {
        matkhau,
        matkhauXacNhan,
      }, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log('Phản hồi đặt lại mật khẩu:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error.message, error.response?.data);
      if (error.message.includes('Network Error')) {
        throw { message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend tại http://127.0.0.1:3005 hoặc thử lại sau.' };
      }
      throw error.response?.data || { message: 'Không thể đặt lại mật khẩu' };
    }
  },
};

export { userService };
