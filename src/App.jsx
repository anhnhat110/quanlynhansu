import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "antd";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ChuyenGiaManagement from "./pages/ChuyenGiaManagement";
import EventManagement from "./pages/EventManagement";
import DashboardCharts from "./pages/DashboardCharts";
import ExportPage from "./pages/ExportPage";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudentManagement from "./pages/StudentManagament";
import DanhMucDoanManagement from "./pages/DanhMucDoanManegament";
import Account from "./pages/Account";
const { Content } = Layout;
import { useState, useEffect } from "react";


const App = () => {
  const location = useLocation();

  // ✅ Thêm useState để quản lý user
  const [user, setUser] = useState(null);

  // ✅ Khi app mount hoặc route thay đổi, lấy lại user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isForgotPasswordPage = location.pathname === "/forgotPassword";
  const isResetPasswordPage = location.pathname.startsWith("/resetPassword");

  const isAuthenticated = () => {
    return !!localStorage.getItem("jwt");
  };

  if (
    !isAuthenticated() &&
    !isLoginPage &&
    !isSignUpPage &&
    !isForgotPasswordPage &&
    !isResetPasswordPage
  ) {
    window.location.href = "/login";
    return null;
  }

  if (
    isLoginPage ||
    isSignUpPage ||
    isForgotPasswordPage ||
    isResetPasswordPage
  ) {
    return (
      <>
        {isLoginPage && <LoginPage setUser={setUser} />}
        {isSignUpPage && <CreateAccountPage />}
        {isForgotPasswordPage && <ForgotPasswordPage />}
        {isResetPasswordPage && <ResetPasswordPage />}
      </>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        {/* ✅ Truyền user vào Header */}
        <Header user={user} />
        <Content style={{ background: "#F0F2F5", padding: "24px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/tai-khoan"
              element={<Account user={user} setUser={setUser} />}
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/tai-khoan" element={<Account />} />
            <Route path="/chuyen-gia" element={<ChuyenGiaManagement />} />
            <Route path="/su-kien" element={<EventManagement />} />
            <Route path="/sinh-vien" element={<StudentManagement />} />
            <Route path="/danh-muc-doan" element={<DanhMucDoanManagement />} />
            <Route path="/bieu-do" element={<DashboardCharts />} />
            <Route path="/export" element={<ExportPage />} />
            <Route
              path="/resetPassword/:token"
              element={<ResetPasswordPage />}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
