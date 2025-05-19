import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import logo from '../assets/images.png';

const { Title, Text } = Typography;

const CreateAccountPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { name, email, password, passwordConfirm } = values;

    try {
      const response = await userService.createUser({
        name,
        email,
        password,
        passwordConfirm,
      });

      if (response.token) {
        localStorage.setItem('jwt', response.token);
        console.log('Token saved:', response.token);
      }

      message.success('Tạo tài khoản thành công!');
      navigate('/login');
    } catch (error) {
      const errorMessage = 'Email đã tồn tại, vui lòng nhập email khác';
      message.error(errorMessage);
      console.error('Lỗi tạo tài khoản:', error);
    }
  };

  return (
    <div className="flex h-screen bg-blue-50">
      {/* Left Side with Logo */}
      <div className="flex-1 bg-blue-500 flex flex-col justify-center items-center p-10 text-white">
        <img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mb-6 rounded-full shadow-lg bg-white p-2"
        />
        <Title level={2} className="!text-white !mb-2 text-center">
          HỆ THỐNG QUẢN LÝ THÔNG TIN CÁC CHUYÊN GIA NƯỚC NGOÀI
        </Title>
        <Text className="text-lg font-medium text-center">
          Đại học Đà Nẵng - Trường Đại học Kinh Tế
        </Text>
      </div>

      {/* Right Side with Form */}
      <div className="flex-1 bg-white flex justify-center items-center p-10 shadow-lg">
        <div className="w-full max-w-md">
          <Title level={2} className="!text-center">
            Đăng ký tài khoản
          </Title>
          <Form
            name="create_account"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Tên người dùng"
              name="name"
              rules={[
                { required: true, message: 'Hãy nhập tên người dùng!' },
              ]}
            >
              <Input placeholder="Tên người dùng" size="large" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Hãy nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Hãy nhập mật khẩu!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
                {
                  validator(_, value) {
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
                    if (value && !passwordRegex.test(value)) {
                      return Promise.reject(
                        new Error('Mật khẩu phải bao gồm chữ hoa, chữ thường và số.')
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password placeholder="Mật khẩu" size="large" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="passwordConfirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Hãy xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Mật khẩu xác nhận không trùng khớp!')
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Đăng ký
              </Button>
            </Form.Item>

            <Text className="block text-center">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-500">
                Đăng nhập tại đây
              </Link>
            </Text>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;