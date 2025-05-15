import React, { useState, useEffect } from "react";
import { Table, Input, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { chuyenGiaService } from "../services/chuyenGiaService"; // Nhật có service sẵn

const { Title } = Typography;

export default function ExpertsByUnit() {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await chuyenGiaService.getAllChuyenGia();
      const experts = response.data.chuyenGias;
      console.log(experts)

      // Nhóm theo Trường/Đơn vị
      const groupedData = experts.reduce((acc, expert) => {
        const unit = expert.truongDonVi || "Chưa rõ"; // Nếu thiếu field
        acc[unit] = (acc[unit] || 0) + 1;
        return acc;
      }, {});

      // Chuyển thành array để dùng cho Table
      const finalData = Object.entries(groupedData).map(([unit, experts], index) => ({
        key: index + 1,
        unit,
        experts,
      }));

      setData(finalData);
    } catch (error) {
      console.error("Failed to fetch experts:", error);
    }
  };

  const filteredData = data.filter((item) =>
    item.unit.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 70,
      align: "center",
    },
    {
      title: "Trường/Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Số lượng chuyên gia",
      dataIndex: "experts",
      key: "experts",
      align: "center",
      render: (value) => (
        <span className="font-medium text-blue-500">{value}</span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Phân loại theo Trường/Đơn vị</Title>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm theo tên Trường/Đơn vị"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} đơn vị`,
          }}
          className="border rounded-lg"
        />

        <div className="mt-4 text-right text-gray-500">
          Tổng số chuyên gia: {data.reduce((sum, item) => sum + item.experts, 0)}
        </div>
      </div>
    </div>
  );
}
