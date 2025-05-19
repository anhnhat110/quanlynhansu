import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

const { Title, Text } = Typography;
import logo from '../assets/images.png';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { email } = values;
    try {
      await userService.forgotPassword({ email });
      message.success('Liên kết đặt lại mật khẩu đã được gửi đi');
      navigate('/login');
    } catch (error) {
      message.error(error.message || 'Không tìm thấy tài khoản');
      console.error('Forgot password error:', error);
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
        HỆ THỐNG QUẢN LÝ THÔNG TIN CÁC CHUYÊN GIA NƯỚC NGOÀI
        </Title>
        <Text className="text-lg font-medium">
          Đại học Đà Nẵng - Trường Đại học Kinh Tế
        </Text>
      </div>
      <div className="flex-1 bg-white flex justify-center items-center p-10 shadow-lg">
        <div className="w-full max-w-md">
          <Title level={2} className="!text-center">Quên mật khẩu</Title>
          <Form
            name="forgot_password"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Hãy nhập email chính xác' },
                { type: 'email', message: 'Hãy nhập email chính xác' },
              ]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600" 
                size="large"
                loading={loading}
              >
                Gửi Link 
              </Button>
            </Form.Item>
            <Text className="block text-center">
              Nhớ mật khẩu?{' '}
              <a href="/login" className="text-blue-500">Đăng nhập</a>
            </Text>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;