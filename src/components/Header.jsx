import React, { useEffect, useState } from "react";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { Space, Dropdown, Menu, message } from "antd";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [userName, setUserName] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserName(user.name || "User");
        } else {
          setUserName("User");
        }
      } catch {
        setUserName("User");
      }
    };

    fetchUser();

    // Listen to localStorage change in case user info updated
    const handleStorageChange = () => {
      fetchUser();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    message.loading({ content: "Đang đăng xuất...", key: "logout" });
    setTimeout(() => {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      message.success({ content: "Đăng xuất thành công!", key: "logout" });
      navigate("/login");
    }, 500);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="account" onClick={() => navigate("/account")}>
        Quản lý tài khoản
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="flex items-center justify-end bg-white px-8 py-4 shadow">
      <Space size={24} align="center">
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <Space className="cursor-pointer">
            <UserOutlined style={{ fontSize: 20, color: "#8c8c8c" }} />
            <span className="text-sm font-medium">{userName}</span>
          </Space>
        </Dropdown>
      </Space>
    </header>
  );
};

export default Header;
