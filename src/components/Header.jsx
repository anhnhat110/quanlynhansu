import React, { useState, useEffect } from "react";
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Space, Badge, message } from 'antd';

const Header = () => {
  const [userName, setUserName] = useState('Loading...');

  const fetchUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('User from localStorage:', user);
        setUserName(user.name || 'User');
      } else {
        console.log('No user data in localStorage');
        setUserName('User');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUserName('User');
    }
  };

  useEffect(() => {
    // Lấy thông tin người dùng khi component mount
    fetchUser();

    // Lắng nghe sự kiện storage để cập nhật khi localStorage thay đổi
    const handleStorageChange = () => {
      fetchUser();
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup sự kiện khi component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Cập nhật userName ngay sau khi đăng xuất
  const handleLogout = () => {
    message.loading({ content: 'Logging out...', key: 'logout' });
    setTimeout(() => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      setUserName('User'); // Cập nhật ngay userName thành 'User'
      message.success({ content: 'Đăng xuất thành công!', key: 'logout', duration: 2 });
      window.location.href = '/login';
    }, 500);
  };

  return (
    <header className="flex items-center justify-end bg-white px-8 py-4">
      <Space size={24} align="center">
        
        <Space align="center">
          <UserOutlined style={{ fontSize: '20px', color: '#8c8c8c', cursor: 'pointer' }} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </Space>
        <LogoutOutlined 
          style={{ fontSize: '20px', color: '#8c8c8c', cursor: 'pointer' }} 
          onClick={handleLogout}
        />
      </Space>
    </header>
  );
};

export default Header;