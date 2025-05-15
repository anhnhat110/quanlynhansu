import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

import logo from '../assets/images.png';
const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  
  // Lấy toàn bộ URL của trang hiện tại
  const pathname = window.location.pathname;
  console.log("Pathname:", pathname);  // Ví dụ: "/resetPassword/956a7ad1a42c7def62797b64ec06f6c8407d0305c761415703526c12487c94c2"

  // Tách phần token từ URL
  const token = pathname.split('/')[2];  // Lấy phần thứ 3 trong đường dẫn (index 2)
  console.log("Token:", token);  // Kết quả: "956a7ad1a42c7def62797b64ec06f6c8407d0305c761415703526c12487c94c2"

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { password, passwordConfirm } = values;
  
    if (!token) {
      message.error('Token đặt lại mật khẩu không hợp lệ. Vui lòng sử dụng liên kết từ email của bạn.');
      return;
    }
  
    setLoading(true);
  
    try {
      await userService.resetPassword({ token, password, passwordConfirm });
      message.success({
        content: 'Mật khẩu đã được đặt lại thành công! Đang chuyển hướng đến trang đăng nhập...',
        duration: 2,
        onClose: () => navigate('/login'),
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      message.error(errorMsg);
      console.error('Lỗi đặt lại mật khẩu:', error);
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
      <div className="flex-1 bg-white flex justify-center items-center p-10 rounded-l-3xl shadow-lg">
        <div className="w-full max-w-md">
          <Title level={2} className="!text-center">Đặt lại mật khẩu</Title>
          <Form name="reset_password" onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
              <Input.Password placeholder="Mật khẩu mới" size="large" />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu"
              name="passwordConfirm"
              dependencies={['password']}
              rules={[ 
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' }, 
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}>
              <Input.Password placeholder="Xác nhận mật khẩu" size="large" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                size="large"
                loading={loading}>
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
            <Text className="block text-center">
              Quay lại{' '}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate('/login')}>
                Đăng nhập
              </span>
            </Text>
          </Form>
        </div>
      </div>
    </div>
  );
  
};

export default ResetPasswordPage;
