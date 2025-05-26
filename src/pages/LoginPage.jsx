import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

const { Title, Text } = Typography;
import logo from '../assets/images.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;
    try {
      const response = await userService.login({ email, password });
      if (response.token) {
        message.success('Đăng nhập thành công!');
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      }
    } catch (error) {
      message.error(error.message || 'Kiểm tra lại email hoặc mật khẩu!');
      console.error('Lỗi đăng nhập:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-blue-50">
      <div className="flex-1 bg-blue-500 flex flex-col justify-center items-center p-10 text-center text-white">
        <img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mb-6 rounded-full shadow-lg bg-white p-2"
        />
        <Title level={2} className="!text-white !mb-2">
          HỆ THỐNG QUẢN LÝ CÁC THÔNG TIN HỢP TÁC QUỐC TẾ 
        </Title>
        <Text className="text-lg font-medium">
          Đại học Đà Nẵng - Trường Đại học Kinh Tế
        </Text>
      </div>

      <div className="flex-1 bg-white flex justify-center items-center p-10 shadow-lg">
        <div className="w-full max-w-md">
          <Title level={2} className="!text-center">Đăng nhập tài khoản</Title>
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password placeholder="Mật khẩu" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                size="large"
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <Text className="block text-center">
              Bạn chưa có tài khoản?{' '}
              <Link to="/signup" className="text-blue-500">Đăng ký ngay</Link>
            </Text>

            <Text className="block text-center mt-2">
              <Link to="/forgotPassword" className="text-blue-500">Quên mật khẩu?</Link>
            </Text>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
