import React, { useEffect, useState } from "react";
import { Typography, Spin } from "antd";
import apiClient from "../config/api.config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const { Title } = Typography;

// Color palette for bars
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

// Define the path for a triangular bar
const getPath = (x, y, width, height) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};

// TriangleBar component for custom bar shape
const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentExperts, setRecentExperts] = useState([]);
  const [allExperts, setAllExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topExpertsByEvent, setTopExpertsByEvent] = useState([]);

  const fetchTopExpertsByEvent = async () => {
    try {
      const response = await apiClient.get("/sukiens/top-chuyengias");
      const raw = response?.data?.topChuyenGias || [];
      console.log("Top Experts by Event Data:", raw);

      const formattedData = raw.map((item) => ({
        hoVaTen: item.chuyenGia || "Không xác định",
        totalEvents: item.eventCount || 0,
      }));

      setTopExpertsByEvent(formattedData);
      console.log("Dữ liệu biểu đồ:", formattedData);
    } catch (error) {
      console.error("Failed to fetch top experts by event:", error);
      setTopExpertsByEvent([]);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await apiClient.get(
        "/sukiens?limit=5&sort=-thoiGianBatDau"
      );
      const currentDate = new Date();
      const events = response?.data?.suKiens || [];
      console.log("Fetched Events:", events);

      // Filter events where thoiGianKetThuc is greater than current date
      const upcoming = events.filter((event) => {
        const endTime = new Date(event.thoiGianKetThuc);
        return endTime > currentDate;
      });

      console.log("Upcoming Events:", upcoming);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error);
      setUpcomingEvents([]);
    }
  };

  const fetchRecentExperts = async () => {
    try {
      const response = await apiClient.get(
        "/chuyengias?limit=5&sort=-createdAt"
      );
      console.log("Recent Experts Data:", response?.data?.chuyenGias);
      setRecentExperts(response?.data?.chuyenGias || []);
    } catch (error) {
      console.error("Failed to fetch recent experts:", error);
      setRecentExperts([]);
    }
  };

  const fetchAllExperts = async () => {
    try {
      const response = await apiClient.get("/chuyengias");
      console.log("All Experts Data:", response?.data?.chuyenGias);
      setAllExperts(response?.data?.chuyenGias || []);
    } catch (error) {
      console.error("Failed to fetch all experts:", error);
      setAllExperts([]);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUpcomingEvents(),
        fetchRecentExperts(),
        fetchAllExperts(),
        fetchTopExpertsByEvent(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Aggregate experts by truongDonVi and get top 5
  const truongDonViCounts = allExperts.reduce((acc, expert) => {
    const truongDonVi = expert.truongDonVi || "Không xác định";
    acc[truongDonVi] = (acc[truongDonVi] || 0) + 1;
    return acc;
  }, {});

  const topTruongDonViData = Object.entries(truongDonViCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Tổng quan
      </Title>

      {/* Custom Shape Bar Chart - Top 5 Trường Có Nhiều Chuyên Gia Nhất */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Title level={4} className="mb-4">
          Top 5 Trường Có Nhiều Chuyên Gia Nhất
        </Title>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={topTruongDonViData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, "auto"]} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              shape={<TriangleBar />}
              name="Số lượng chuyên gia"
              label={{ position: 'top' }}
            >
              {topTruongDonViData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Top 5 Chuyên Gia Tham Gia Nhiều Sự Kiện Nhất */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Title level={4} className="mb-4">
          Top 5 Chuyên Gia Tham Gia Nhiều Sự Kiện Nhất
        </Title>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={topExpertsByEvent}
            margin={{
              top: 20,
              blue: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hoVaTen" />
            <YAxis domain={[0, "auto"]} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="totalEvents"
              name="Số sự kiện"
              label={{ position: 'top' }}
            >
              {topExpertsByEvent.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

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
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center border-b border-gray-200"
              >
                <div className="flex-1">
                  <div className="text-blue-500 font-medium text-xl">
                    {event.suKien}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Mục đích:</span>{" "}
                    {event.mucDich || (
                      <span className="italic text-gray-400">
                        Không xác định
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Chuyên gia:</span>{" "}
                    {event.chuyenGia || (
                      <span className="italic text-gray-400">
                        Không xác định
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Địa điểm:</span>{" "}
                    {event.diaDiem || (
                      <span className="italic text-gray-400">
                        Không xác định
                      </span>
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

      {/* Danh sách chuyên gia gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Title level={4} className="mb-4">
          Danh sách chuyên gia được thêm gần đây
        </Title>
        <div className="grid grid-cols-6 gap-6">
          {recentExperts.map((expert, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-500 text-xl font-medium">
                  {expert.hoVaTen?.charAt(0) || ""}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {expert.hoVaTen}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;