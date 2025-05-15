import React, { useState, useEffect } from "react";
import { Select, Checkbox, Button, Card, Spin, Table, message } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Option } = Select;

const fieldMap = {
  "Họ và tên": "hoVaTen",
  "Giới tính": "gioiTinh",
  "Quốc gia": "quocGia",
  "Hộ chiếu": "hoChieu",
  "Email": "email",
  "Trường/Đơn vị": "truongDonVi",
  "Chức danh": "chucDanh",
  "Chức vụ": "chucVu",
  "Khoa tham dự": "khoaThamDu",
  "Ghi chú (CG)": "ghiChuCG",
  "Chuyên gia": "chuyenGia",
  "Mục đích": "mucDich",
  "Sự kiện": "suKien",
  "Thời gian": "thoiGian",
  "Địa điểm": "diaDiem",
  "Thành phần": "thanhPhan",
  "Ghi chú (SK)": "ghiChuSK"
};

const thongTinChuyenGia = [
  "Họ và tên", "Giới tính", "Quốc gia", "Hộ chiếu", "Email",
  "Trường/Đơn vị", "Chức danh", "Chức vụ", "Khoa tham dự","Ghi chú (CG)"
];

const thongTinSuKien = [
  "Chuyên gia", "Mục đích", "Sự kiện", "Thời gian",
  "Địa điểm", "Thành phần", "Ghi chú (SK)"
];

export default function ExportPage() {
  const [selectedCG, setSelectedCG] = useState([]);
  const [selectedSK, setSelectedSK] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    truongDonVi: [],
    quocGia: [],
    chucVu: [],
    mucDich: [],
    thoiGian: []
  });

  const [filterValues, setFilterValues] = useState({
    truongDonVi: undefined,
    quocGia: undefined,
    chucVu: undefined,
    mucDich: undefined,
    thoiGian: undefined
  });

  const isChuyenGia = selectedCG.length > 0 || selectedSK.length === 0;
  const selectedFields = isChuyenGia ? selectedCG : selectedSK;

  const handleChange = (type) => (checkedValues) => {
    if (type === "CG") {
      setSelectedCG(checkedValues);
      if (checkedValues.length > 0) setSelectedSK([]);
    } else {
      setSelectedSK(checkedValues);
      if (checkedValues.length > 0) setSelectedCG([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fields = selectedFields.length > 0
          ? selectedFields.map(label => fieldMap[label])
          : (isChuyenGia ? thongTinChuyenGia : thongTinSuKien).map(label => fieldMap[label]);

        const type = isChuyenGia ? "chuyengias" : "sukiens";
        const params = new URLSearchParams();

        params.append("fields", fields.join(","));

        // add filters
        Object.entries(filterValues).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });

        const url = `http://127.0.0.1:3005/api/v1/${type}?${params.toString()}`;
        const response = await axios.get(url);
        const resData = response.data.data;
        setData(isChuyenGia ? resData.chuyenGias : resData.suKiens);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCG, selectedSK, filterValues]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterValues({}); // ✅ Reset filter khi đổi chọn
  
        if (isChuyenGia) {
          const res = await axios.get("http://127.0.0.1:3005/api/v1/chuyengias");
          const data = res.data.data.chuyenGias;
          const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];
  
          setFilters({
            truongDonVi: unique(data, "truongDonVi"),
            mucDich: [],
            quocGia: unique(data, "quocGia"),
            chucVu: unique(data, "chucVu"),
            thoiGian: []
          });
        } else if (selectedSK.length > 0) {
          const res = await axios.get("http://127.0.0.1:3005/api/v1/sukiens");
          const data = res.data.data.suKiens;
          const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];
  
          setFilters({
            truongDonVi: [],
            mucDich: unique(data, "mucDich"),
            quocGia: [],
            chucVu: [],
            thoiGian: [...new Set(data.map(item => new Date(item.thoiGian).getFullYear()))].sort().map(year => year.toString())
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu lọc:", error);
      }
    };
  
    fetchFilterOptions();
  }, [selectedCG, selectedSK]);
  
  

  const generateColumns = (fields) =>
    fields.map(label => ({
      title: label,
      dataIndex: fieldMap[label],
      key: fieldMap[label]
    }));

  const exportToExcel = () => {
    if (!data || data.length === 0 || selectedFields.length === 0) {
      message.warning("Không có dữ liệu hoặc cột được chọn để xuất.");
      return;
    }

    const exportData = data.map(row => {
      const obj = {};
      selectedFields.forEach(label => {
        const key = fieldMap[label];
        obj[label] = row[key] ?? "";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "export_data.xlsx");
  };

  const filterFields = [
    { label: "Trường/Đơn vị", key: "truongDonVi" },
    { label: "Quốc gia", key: "quocGia" },
    { label: "Chức vụ", key: "chucVu" },
    { label: "Mục đích", key: "mucDich" },
    { label: "Thời gian (năm)", key: "thoiGian" }
  ];

  return (
  <div className="p-6 bg-gray-50 min-h-screen text-[18px] md:text-[20px]">
    
  <Card className="max-w-full mx-auto shadow-lg">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      {filterFields.map(({ label, key }) => (
        <Select
          key={key}
          placeholder={label}
          allowClear
          size="large"
          className="w-full text-lg"
          value={filterValues[key]}
          onChange={(value) => handleFilterChange(key, value)}
        >
          {filters[key].map((value) => (
            <Option key={value} value={value} className="text-lg">{value}</Option>
          ))}
        </Select>
      ))}
    </div>

    <div className="border border-dashed border-gray-300 rounded-md h-72 overflow-auto p-6 mb-6">

      {loading ? (
        <Spin size="large" />
      ) : (selectedCG.length > 0 || selectedSK.length > 0) ? (
        data?.length > 0 ? (
          <Table
            dataSource={data}
            columns={generateColumns(selectedFields.length > 0 ? selectedFields : (isChuyenGia ? thongTinChuyenGia : thongTinSuKien))}
            pagination={false}
            rowKey={(record) => record.id}
            bordered
            size="middle"
          />
        ) : (
          <div className="text-gray-400 text-xl flex items-center justify-center h-full">
            Không có thông tin nào được hiển thị
          </div>
        )
      ) : (
        <div className="text-gray-400 text-xl flex items-center justify-center h-full">
          Vui lòng chọn thông tin chuyên gia hoặc sự kiện để hiển thị dữ liệu
        </div>
      )}
    </div>

    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="bg-gray-100 p-6 rounded-md w-full md:w-2/3">
        <div className="grid grid-cols-2 gap-10">
          {[["Thông tin chuyên gia", thongTinChuyenGia, selectedCG, "CG"],
            ["Thông tin sự kiện", thongTinSuKien, selectedSK, "SK"]].map(([title, options, value, type], idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-xl mb-3">{title}</h3>
              <Checkbox.Group
                value={value}
                onChange={handleChange(type)}
                disabled={(type === "CG" ? selectedSK : selectedCG).length > 0}
              >
                <div className="grid grid-cols-2 gap-4">
                  {options.map(label => (
                    <Checkbox key={label} value={label} className="text-lg">{label}</Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-end justify-end w-full md:w-1/3">
        <Button type="primary" size="large" className="rounded-xl px-8 py-4 text-lg" onClick={exportToExcel}>
          Xuất file
        </Button>
      </div>
    </div>
  </Card>
</div>
  )}