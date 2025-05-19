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
  Treemap,
  CartesianGrid,
  Cell,
} from "recharts";
import moment from "moment";
import apiClient from "../config/api.config";

const { Title } = Typography;

// Combined color palette from DashboardCharts and HomePage
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
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
];

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

const CustomTooltip = ({ active, payload, label, chartType }) => {
  if (active && payload && payload.length) {
    let content = "";
    switch (chartType) {
      case "eventsByTime":
        content = `Tháng: ${label}<br/>Số sự kiện: ${payload[0].value}`;
        break;
      case "expertsByGenderCountry":
        content = `Quốc gia: ${label}<br/>Nam: ${payload[0].value}<br/>Nữ: ${payload[1]?.value || 0}<br/>Khác: ${payload[2]?.value || 0}`;
        break;
      case "expertsByCountryTreemap":
        content = `Quốc gia: ${label}<br/>Số chuyên gia: ${payload[0].value}`;
        break;
      case "topTruongDonVi":
        content = `Trường/Đơn vị: ${label}<br/>Số chuyên gia: ${payload[0].value}`;
        break;
      case "topExpertsByEvent":
        content = `Chuyên gia: ${label}<br/>Số sự kiện: ${payload[0].value}`;
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
  const [expertsByGenderCountry, setExpertsByGenderCountry] = useState([]);
  const [expertsByCountryTreemap, setExpertsByCountryTreemap] = useState([]);
  const [topTruongDonVi, setTopTruongDonVi] = useState([]);
  const [topExpertsByEvent, setTopExpertsByEvent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data
        const [suKienRes, doanRes, chuyenGiaRes, topChuyenGiaRes] = await Promise.all([
          apiClient.get("/sukiens"),
          apiClient.get("/danhmucdoans"),
          apiClient.get("/chuyengias"),
          apiClient.get("/sukiens/top-chuyengias"),
        ]);

        // Log responses to debug structure
        console.log("API Responses:", {
          suKienRes: suKienRes.data,
          doanRes: doanRes.data,
          chuyenGiaRes: chuyenGiaRes.data,
          topChuyenGiaRes: topChuyenGiaRes.data,
        });

        // Extract data with defensive checks
        const suKiens = Array.isArray(suKienRes.data?.suKiens)
          ? suKienRes.data.suKiens
          : Array.isArray(suKienRes.data)
          ? suKienRes.data
          : [];
        const doans = Array.isArray(doanRes.data?.danhMucDoans)
          ? doanRes.data.danhMucDoans
          : Array.isArray(doanRes.data)
          ? doanRes.data
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

        // Log extracted data
        console.log("Extracted Data:", { suKiens, doans, chuyenGias, topChuyenGias });

        // Events by time (TinyLineChart)
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

        // Experts by gender and country (SimpleBarChart)
        const expertGenderMap = {};
        chuyenGias.forEach((cg) => {
          const country = cg.quocGia || "Khác";
          const gender = cg.gioiTinh || "Khác";
          expertGenderMap[country] = expertGenderMap[country] || {
            name: country,
            Nam: 0,
            Nữ: 0,
            Khác: 0,
          };
          expertGenderMap[country][gender] += 1;
        });
        setExpertsByGenderCountry(Object.values(expertGenderMap));

        // Experts by country (SimpleTreemap)
        const expertCountryMap = chuyenGias.reduce((acc, cg) => {
          const country = cg.quocGia || "Khác";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});
        setExpertsByCountryTreemap(
          Object.entries(expertCountryMap).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // Top 5 truongDonVi (TriangleBarChart)
        const truongDonViCounts = chuyenGias.reduce((acc, expert) => {
          const truongDonVi = expert.truongDonVi || "Không xác định";
          acc[truongDonVi] = (acc[truongDonVi] || 0) + 1;
          return acc;
        }, {});
        setTopTruongDonVi(
          Object.entries(truongDonViCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );

        // Top 5 experts by event (BarChart)
        const formattedTopExperts = topChuyenGias.map((item) => ({
          hoVaTen: item.chuyenGia || "Không xác định",
          totalEvents: item.eventCount || 0,
        }));
        setTopExpertsByEvent(formattedTopExperts.slice(0, 5));
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
      <Title level={2}>Dashboard Thống Kê</Title>

      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Sự kiện theo Thời gian</Title>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={eventsByTime}>
                <XAxis dataKey="month" />
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

          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Chuyên gia Nam và Nữ theo Quốc gia</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expertsByGenderCountry}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip chartType="expertsByGenderCountry" />} />
                <Legend />
                <Bar dataKey="Nam" fill={COLORS[0]} />
                <Bar dataKey="Nữ" fill={COLORS[1]} />
                <Bar dataKey="Khác" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Quốc gia có nhiều Chuyên gia nhất</Title>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={expertsByCountryTreemap}
                dataKey="value"
                nameKey="name"
                ratio={4 / 3}
                stroke="#fff"
                fill={COLORS[0]}
              >
                {expertsByCountryTreemap.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Tooltip content={<CustomTooltip chartType="expertsByCountryTreemap" />} />
              </Treemap>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <Title level={4}>Top 5 Trường Có Nhiều Chuyên Gia Nhất</Title>
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
                <Bar
                  dataKey="count"
                  shape={<TriangleBar />}
                  name="Số lượng chuyên gia"
                  label={{ position: "top" }}
                >
                  {topTruongDonVi.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-white p-4 rounded shadow">
            <Title level={4}>Top 5 Chuyên Gia Tham Gia Nhiều Sự Kiện Nhất</Title>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={topExpertsByEvent}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hoVaTen" />
                <YAxis domain={[0, "auto"]} allowDecimals={false} />
                <Tooltip content={<CustomTooltip chartType="topExpertsByEvent" />} />
                <Legend />
                <Bar
                  dataKey="totalEvents"
                  name="Số sự kiện"
                  label={{ position: "top" }}
                >
                  {topExpertsByEvent.map((entry, index) => (
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
