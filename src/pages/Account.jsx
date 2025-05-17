import React, { useEffect } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const { Title } = Typography;

const Account = () => {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Backend API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3005";

  // Fetch user data
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        message.error("Vui lòng đăng nhập để tiếp tục");
        navigate("/login");
        return;
      }

      // Get user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        profileForm.setFieldsValue({
          name: parsedUser.name,
          email: parsedUser.email,
        });
      }

      // Optionally fetch fresh data from backend (uncomment if /me endpoint exists)
      /*
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUser = response.data.data.user;
      profileForm.setFieldsValue({
        name: fetchedUser.name,
        email: fetchedUser.email,
      });
      localStorage.setItem('user', JSON.stringify(fetchedUser));
      */
    } catch (error) {
      console.error("Error fetching user:", error);
      message.error("Không thể tải thông tin người dùng");
      if (error.response?.status === 401) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (values) => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.patch(
        `${API_BASE_URL}/users/updateMe`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = response.data.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      message.success("Cập nhật thông tin thành công");
      profileForm.setFieldsValue({
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 400 && error.response?.data?.errors?.email
          ? "Email đã được sử dụng"
          : "Cập nhật thông tin thất bại");
      message.error(errorMessage);
      if (error.response?.status === 401) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (values) => {
    setLoadingPassword(true);
    try {
      const token = localStorage.getItem("jwt");
      await axios.patch(
        `${API_BASE_URL}/users/updateMyPassword`,
        {
          passwordCurrent: values.passwordCurrent,
          password: values.password,
          passwordConfirm: values.passwordConfirm,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Cập nhật mật khẩu thành công");
      passwordForm.resetFields();
    } catch (error) {
      console.error("Error updating password:", error);
      const errorMessage =
        error.response?.data?.message || "Cập nhật mật khẩu thất bại";
      message.error(errorMessage);
      if (error.response?.status === 401) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Title level={2}>Quản lý tài khoản</Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Profile Update Form */}
        <Card title="Thông tin cá nhân" bordered={false}>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loadingProfile}>
                Cập nhật thông tin
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Password Update Form */}
        <Card title="Đổi mật khẩu" bordered={false}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleUpdatePassword}
          >
            <Form.Item
              name="passwordCurrent"
              label="Mật khẩu hiện tại"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu hiện tại"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve(); // Required rule will handle empty
                    }
                    if (value.length < 8) {
                      return Promise.reject(
                        new Error("Mật khẩu phải có ít nhất 8 ký tự")
                      );
                    }
                    if (!/[a-z]/.test(value)) {
                      return Promise.reject(
                        new Error("Mật khẩu phải chứa ít nhất 1 chữ thường")
                      );
                    }
                    if (!/[A-Z]/.test(value)) {
                      return Promise.reject(
                        new Error("Mật khẩu phải chứa ít nhất 1 chữ hoa")
                      );
                    }
                    if (!/[0-9]/.test(value)) {
                      return Promise.reject(
                        new Error("Mật khẩu phải chứa ít nhất 1 số")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              name="passwordConfirm"
              label="Xác nhận mật khẩu mới"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingPassword}
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default Account;
