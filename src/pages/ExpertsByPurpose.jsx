import React, { useState, useEffect } from "react";
import { Typography } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { suKienService } from "../services/suKienService"; // Nhật đã có service sẵn

const { Title } = Typography;

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2", "#eb2f96", "#fa541c"];

const ExpertsByPurpose = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await suKienService.getAllSuKien();
      const suKiens = response.data.suKiens; // tùy theo API Nhật, nếu response khác thì chỉnh chỗ này
      console.log(suKiens);

      // Gom nhóm theo mục đích
      const groupedData = suKiens.reduce((acc, suKien) => {
        const purpose = suKien.mucDich || "Khác";
        acc[purpose] = (acc[purpose] || 0) + 1;
        return acc;
      }, {});

      // Chuyển thành array cho biểu đồ
      const finalData = Object.entries(groupedData).map(([name, value]) => ({
        name,
        value,
      }));

      setData(finalData);
    } catch (error) {
      console.error("Failed to fetch purposes:", error);
    }
  };

  const totalExperts = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Phân loại theo Mục đích</Title>

      <div className="grid grid-cols-2 gap-6">
        {/* Biểu đồ cột */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Title level={4} className="mb-4 text-center">Số lượng chuyên gia theo mục đích</Title>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Title level={4} className="mb-4 text-center">Tỉ lệ phân bố theo mục đích</Title>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thông tin tổng hợp */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-4 gap-6">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-medium" style={{ color: COLORS[index % COLORS.length] }}>
                {item.value}
              </div>
              <div className="text-gray-500">{item.name}</div>
              <div className="text-sm text-gray-400">
                {((item.value / totalExperts) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right text-gray-500">
          Tổng số chuyên gia: {totalExperts}
        </div>
      </div>
    </div>
  );
};

export default ExpertsByPurpose;
