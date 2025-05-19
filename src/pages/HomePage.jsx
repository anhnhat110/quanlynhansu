import React, { useEffect, useState } from "react";
import { Typography, Spin, Modal } from "antd";
import apiClient from "../config/api.config";
import EventDetailModal from "../components/EventDetailModal";
import ChuyenGiaDetailModal from "../components/ChuyenGiaDetailModal";
import DanhMucDoanDetailModal from "../components/DanhMucDoanDetailModal";
import StudentDetailModal from "../components/StudentDetailModal";

const { Title } = Typography;

const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentExperts, setRecentExperts] = useState([]);
  const [upcomingDoans, setUpcomingDoans] = useState([]);
  const [recentSinhViens, setRecentSinhViens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedDoan, setSelectedDoan] = useState(null);
  const [selectedSinhVien, setSelectedSinhVien] = useState(null);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isExpertModalVisible, setIsExpertModalVisible] = useState(false);
  const [isDoanModalVisible, setIsDoanModalVisible] = useState(false);
  const [isSinhVienModalVisible, setIsSinhVienModalVisible] = useState(false);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await apiClient.get("/sukiens?limit=5&sort=-thoiGianBatDau");
      const currentDate = new Date();
      const events = response?.data?.suKiens || [];
      const upcoming = events.filter((event) => {
        const endTime = new Date(event.thoiGianKetThuc);
        return endTime > currentDate;
      });
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error);
      setUpcomingEvents([]);
    }
  };

  const fetchRecentExperts = async () => {
    try {
      const response = await apiClient.get("/chuyengias?limit=5&sort=-createdAt");
      setRecentExperts(response?.data?.chuyenGias || []);
    } catch (error) {
      console.error("Failed to fetch recent experts:", error);
      setRecentExperts([]);
    }
  };

  const fetchUpcomingDoans = async () => {
    try {
      const response = await apiClient.get("/danhmucdoans?limit=5&sort=-thoiGianBatDau");
      const currentDate = new Date();
      const doans = response?.data?.danhMucDoans || [];
      const upcoming = doans.filter((doan) => {
        const endTime = new Date(doan.thoiGianKetThuc);
        return endTime > currentDate;
      });
      setUpcomingDoans(upcoming);
    } catch (error) {
      console.error("Failed to fetch upcoming doans:", error);
      setUpcomingDoans([]);
    }
  };

  const fetchRecentSinhViens = async () => {
    try {
      const response = await apiClient.get("/sinhviens?limit=5&sort=-createdAt");
      console.log("Sinh Viens Response:", response.data);
      setRecentSinhViens(
        response?.data?.sinhViens ||
        response?.data?.results ||
        response?.data?.data?.students ||
        []
      );
    } catch (error) {
      console.error("Failed to fetch recent sinh viens:", error);
      setRecentSinhViens([]);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUpcomingEvents(),
        fetchRecentExperts(),
        fetchUpcomingDoans(),
        fetchRecentSinhViens(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventModalVisible(true);
  };

  const handleExpertClick = (expert) => {
    setSelectedExpert(expert);
    setIsExpertModalVisible(true);
  };

  const handleDoanClick = (doan) => {
    setSelectedDoan(doan);
    setIsDoanModalVisible(true);
  };

  const handleSinhVienClick = (student) => {
    console.log("Clicked Sinh Vien:", student);
    setSelectedSinhVien(student);
    setIsSinhVienModalVisible(true);
    setTimeout(() => {
      console.log("State Updated:", { selectedSinhVien, isSinhVienModalVisible });
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Tổng quan
      </Title>

      {/* Sự kiện sắp diễn ra */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Title level={4} className="mb-4">
          Các sự kiện sắp diễn ra
        </Title>
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center border-b border-gray-200 cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex-1">
                  <div className="text-blue-500 font-medium text-xl">{event.suKien}</div>
                  <div className="text-gray-600">
                    <span className="font-medium">Mục đích:</span>{" "}
                    {event.mucDich || (
                      <span className="italic text-gray-400">Không xác định</span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Chuyên gia:</span>{" "}
                    {event.chuyenGia || (
                      <span className="italic text-gray-400">Không xác định</span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Địa điểm:</span>{" "}
                    {event.diaDiem || (
                      <span className="italic text-gray-400">Không xác định</span>
                    )}
                  </div>
                </div>
                <div className="text-gray-600 text-sm text-right min-w-[180px]">
                  <div>
                    Bắt đầu:{" "}
                    {new Date(event.thoiGianBatDau).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                  <div>
                    Kết thúc:{" "}
                    {new Date(event.thoiGianKetThuc).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>Không có sự kiện nào.</div>
          )}
        </div>
      </div>

      {/* Đoàn sắp tới */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Title level={4} className="mb-4">
          Các đoàn sắp tới
        </Title>
        <div className="space-y-4">
          {upcomingDoans.length > 0 ? (
            upcomingDoans.map((doan, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center border-b border-gray-200 cursor-pointer"
                onClick={() => handleDoanClick(doan)}
              >
                <div className="flex-1">
                  <div className="text-blue-500 font-medium text-xl">{doan.tenDoan}</div>
                  <div className="text-gray-600">
                    <span className="font-medium">Người đại diện:</span>{" "}
                    {doan.nguoiDaiDien || (
                      <span className="italic text-gray-400">Không xác định</span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Quốc tịch:</span>{" "}
                    {doan.quocTich || (
                      <span className="italic text-gray-400">Không xác định</span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Nội dung:</span>{" "}
                    {doan.noiDung || (
                      <span className="italic text-gray-400">Không xác định</span>
                    )}
                  </div>
                </div>
                <div className="text-gray-600 text-sm text-right min-w-[180px]">
                  <div>
                    Bắt đầu:{" "}
                    {new Date(doan.thoiGianBatDau).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                  <div>
                    Kết thúc:{" "}
                    {new Date(doan.thoiGianKetThuc).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>Không có đoàn nào.</div>
          )}
        </div>
      </div>

      {/* Danh sách chuyên gia gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Title level={4} className="mb-4">
          Danh sách chuyên gia được thêm gần đây
        </Title>
        <div className="grid grid-cols-6 gap-6">
          {recentExperts.length > 0 ? (
            recentExperts.map((expert, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleExpertClick(expert)}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-500 text-xl font-medium">
                    {expert.hoVaTen?.charAt(0) || ""}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{expert.hoVaTen}</span>
              </div>
            ))
          ) : (
            <div>Không có chuyên gia nào.</div>
          )}
        </div>
      </div>

      {/* Sinh viên trao đổi gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Title level={4} className="mb-4">
          Sinh viên trao đổi được thêm gần đây
        </Title>
        <div className="grid grid-cols-6 gap-6">
          {recentSinhViens.length > 0 ? (
            recentSinhViens.map((student, index) => (
  <div
    key={index}
    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    onClick={() => handleSinhVienClick(student)}
  >
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
      <span className="text-blue-500 text-xl font-medium">
        {student.hoVaTen?.charAt(0) || ""}
      </span>
    </div>
    <span className="text-sm font-medium text-gray-700">{student.hoVaTen}</span>
  </div>
))
          ) : (
            <div>Không có sinh viên nào.</div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        visible={isEventModalVisible}
        onCancel={() => {
          setIsEventModalVisible(false);
          setSelectedEvent(null);
        }}
      />
      <ChuyenGiaDetailModal
        chuyenGia={selectedExpert}
        visible={isExpertModalVisible}
        onCancel={() => {
          setIsExpertModalVisible(false);
          setSelectedExpert(null);
        }}
      />
      <DanhMucDoanDetailModal
        doan={selectedDoan}
        visible={isDoanModalVisible}
        onCancel={() => {
          setIsDoanModalVisible(false);
          setSelectedDoan(null);
        }}
      />
      <StudentDetailModal
  visible={isSinhVienModalVisible}
  onCancel={() => setIsSinhVienModalVisible(false)}
  student={selectedSinhVien}
/>
    </div>
  );
};

export default HomePage;