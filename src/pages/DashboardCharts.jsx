import React, { useState, useEffect } from "react";
import { Typography, message } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import moment from "moment";
import apiClient from "../config/api.config";

const { Title } = Typography;

// Combined color palette
const COLORS = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa541c",
  "#2f54eb",
  "#fadb14",
];

// Custom Tooltip for all charts
const CustomTooltip = ({ active, payload, label, chartType }) => {
  if (active && payload && payload.length) {
    let content = "";
    switch (chartType) {
      case "eventsByTime":
        content = `Tháng: ${label}<br/>Số sự kiện: ${payload[0].value}`;
        break;
      case "topExpertsByEvent":
        content = `Chuyên gia: ${label}<br/>Số sự kiện: ${payload[0].value}`;
        break;
      case "topTruongDonVi":
        content = `Trường/Đơn vị: ${label}<br/>Số chuyên gia: ${payload[0].value}`;
        break;
      case "studentsByExchangeType":
        content = `Hình thức: ${label}<br/>Số sinh viên: ${payload[0].value}`;
        break;
      case "studentsByCountry":
        content = `Quốc gia: ${label}<br/>Số sinh viên: ${payload[0].value}`;
        break;
      case "doansByCountry":
        content = `Quốc gia: ${label}<br/>Số đoàn: ${payload[0].value}`;
        break;
      default:
        content = `${label}: ${payload[0].value}`;
    }
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "8px",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }} />
      </div>
    );
  }
  return null;
};

const DashboardCharts = () => {
  const [eventsByTime, setEventsByTime] = useState([]);
  const [topTruongDonVi, setTopTruongDonVi] = useState([]);
  const [topExpertsByEvent, setTopExpertsByEvent] = useState([]);
  const [studentsByExchangeType, setStudentsByExchangeType] = useState([]);
  const [studentsByCountry, setStudentsByCountry] = useState([]);
  const [doansByCountry, setDoansByCountry] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [suKienRes, chuyenGiaRes, topChuyenGiaRes, sinhVienRes, doanRes] = await Promise.all([
          apiClient.get("/sukiens"),
          apiClient.get("/chuyengias"),
          apiClient.get("/sukiens/top-chuyengias"),
          apiClient.get("/sinhviens"),
          apiClient.get("/danhmucdoans"),
        ]);

        // Log responses to debug structure
        console.log("API Responses:", {
          suKienRes: suKienRes.data,
          chuyenGiaRes: chuyenGiaRes.data,
          topChuyenGiaRes: topChuyenGiaRes.data,
          sinhVienRes: sinhVienRes.data,
          doanRes: doanRes.data,
        });

        const suKiens = Array.isArray(suKienRes.data?.suKiens)
          ? suKienRes.data.suKiens
          : Array.isArray(suKienRes.data)
          ? suKienRes.data
          : [];
        const chuyenGias = Array.isArray(chuyenGiaRes.data?.chuyenGias)
          ? chuyenGiaRes.data.chuyenGias
          : Array.isArray(chuyenGiaRes.data)
          ? chuyenGiaRes.data
          : [];
        const topChuyenGias = Array.isArray(topChuyenGiaRes.data?.topChuyenGias)
          ? topChuyenGiaRes.data.topChuyenGias
          : Array.isArray(topChuyenGiaRes.data)
          ? topChuyenGiaRes.data
          : [];
        const sinhViens = Array.isArray(sinhVienRes.data?.sinhViens)
          ? sinhVienRes.data.sinhViens
          : Array.isArray(sinhVienRes.data)
          ? sinhVienRes.data
          : [];
        const doans = Array.isArray(doanRes.data?.danhMucDoans)
          ? doanRes.data.danhMucDoans
          : Array.isArray(doanRes.data)
          ? doanRes.data
          : [];

        // Events by time
        const eventMonthMap = suKiens.reduce((acc, sk) => {
          const month = moment(sk.thoiGianBatDau).format("YYYY-MM");
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});
        setEventsByTime(
          Object.entries(eventMonthMap)
            .map(([month, value]) => ({ month, value }))
            .sort((a, b) => a.month.localeCompare(b.month))
        );

        // 1. Số lượng chuyên gia theo trường/đơn vị
        const truongDonViCounts = chuyenGias.reduce((acc, expert) => {
          const truongDonVi = expert.truongDonVi || "Không xác định";
          acc[truongDonVi] = (acc[truongDonVi] || 0) + 1;
          return acc;
        }, {});
        setTopTruongDonVi(
          Object.entries(truongDonViCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        );

        // 2. Top 5 chuyên gia tham gia nhiều sự kiện nhất
        const formattedTopExperts = topChuyenGias.map((item) => ({
          hoVaTen: item.chuyenGia || "Không xác định",
          totalEvents: item.eventCount || 0,
        }));
        setTopExpertsByEvent(formattedTopExperts.slice(0, 5));

        // 4. Tỷ lệ sinh viên trao đổi theo hình thức
        const exchangeTypeMap = sinhViens.reduce((acc, sv) => {
          const type = sv.hinhThuc || "Khác";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        setStudentsByExchangeType(
          Object.entries(exchangeTypeMap).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // 3. Thống kê số sinh viên trao đổi theo quốc gia
        const studentCountryMap = sinhViens.reduce((acc, sv) => {
          const country = sv.quocGia || "Khác";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});
        setStudentsByCountry(
          Object.entries(studentCountryMap).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // 5. Số lượng đoàn theo quốc gia
        const doanCountryMap = doans.reduce((acc, doan) => {
          const country = doan.quocTich || "Khác";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});
        setDoansByCountry(
          Object.entries(doanCountryMap).map(([name, value]) => ({
            name,
            value,
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 grid gap-8">
      <Title level={2}>Tổng quan</Title>

      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Sự kiện theo thời gian */}
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Sự kiện theo Thời gian</Title>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={eventsByTime}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip chartType="eventsByTime" />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 2. Top 5 chuyên gia tham gia nhiều sự kiện nhất */}
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Top 5 Chuyên gia Tham gia Nhiều Sự kiện Nhất</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topExpertsByEvent}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hoVaTen" />
                <YAxis domain={[0, "auto"]} allowDecimals={false} />
                <Tooltip content={<CustomTooltip chartType="topExpertsByEvent" />} />
                <Legend />
                <Bar dataKey="totalEvents" name="Số sự kiện" label={{ position: "top" }}>
                  {topExpertsByEvent.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 1. Số lượng chuyên gia theo trường/đơn vị */}
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Số lượng Chuyên gia theo Trường/Đơn vị</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topTruongDonVi}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, "auto"]} allowDecimals={false} />
                <Tooltip content={<CustomTooltip chartType="topTruongDonVi" />} />
                <Legend />
                <Bar dataKey="count" name="Số lượng chuyên gia" label={{ position: "top" }}>
                  {topTruongDonVi.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 4. Tỷ lệ sinh viên trao đổi theo hình thức trao đổi/chuyển tiếp */}
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Tỷ lệ Sinh viên Trao đổi theo Hình thức</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentsByExchangeType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {studentsByExchangeType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip chartType="studentsByExchangeType" />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Thống kê số sinh viên trao đổi theo quốc gia */}
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Số Sinh viên Trao đổi theo Quốc gia</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={studentsByCountry}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, "auto"]} allowDecimals={false} />
                <Tooltip content={<CustomTooltip chartType="studentsByCountry" />} />
                <Legend />
                <Bar dataKey="value" name="Số sinh viên" label={{ position: "top" }}>
                  {studentsByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 5. Số lượng đoàn theo quốc gia */}
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Số lượng Đoàn theo Quốc gia</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={doansByCountry}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, "auto"]} allowDecimals={false} />
                <Tooltip content={<CustomTooltip chartType="doansByCountry" />} />
                <Legend />
                <Bar dataKey="value" name="Số đoàn" label={{ position: "top" }}>
                  {doansByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;