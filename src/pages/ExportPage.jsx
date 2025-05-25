import React, { useState, useEffect, useMemo } from "react";
import { Select, Checkbox, Button, Card, Spin, Table, message } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const { Option } = Select;
const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const fieldMap = {
  // Chuyên gia
  "Họ và tên": "hoVaTen",
  "Giới tính": "gioiTinh",
  "Quốc gia": "quocGia",
  "Hộ chiếu": "hoChieu",
  "Email": "email",
  "Trường/Đơn vị": "truongDonVi",
  "Chức danh": "chucDanh",
  "Chức vụ": "chucVu",
  "Chuyên ngành": "chuyenNganh",
  "Ghi chú (CG)": "ghiChuCG",
  // Sự kiện
  "Chuyên gia": "chuyenGia",
  "Mục đích": "mucDich",
  "Sự kiện": "suKien",
  "Thời gian bắt đầu": "thoiGianBatDau",
  "Thời gian kết thúc": "thoiGianKetThuc",
  "Địa điểm": "diaDiem",
  "Thành phần": "thanhPhan",
  "Ghi chú (SK)": "ghiChuSK",
  // Sinh viên
  "Mã sinh viên": "maSV",
  "Hình thức": "hinhThuc",
  "Cấp bậc": "capBac",
  "Lớp": "lop",
  "Trường đối tác": "truongDoiTac",

  "Tên đoàn": "tenDoan",
  "Người đại diện": "nguoiDaiDien",
  "Quốc tịch": "quocTich",
  "Ngày sinh": "DOB",
  "Nội dung": "noiDung",
  "Ghi chú": "ghiChu",
};

const thongTinChuyenGia = [
  "Họ và tên", "Giới tính", "Quốc gia", "Hộ chiếu", "Email",
  "Trường/Đơn vị", "Chức danh", "Chức vụ", "Chuyên ngành", "Ghi chú (CG)",
];

const thongTinSuKien = [
  "Chuyên gia", "Mục đích", "Sự kiện", "Thời gian bắt đầu", "Thời gian kết thúc",
  "Địa điểm", "Thành phần", "Ghi chú (SK)",
];

const thongTinSinhVien = [
  "Mã sinh viên", "Họ và tên", "Hình thức", "Cấp bậc",
  "Chuyên ngành", "Lớp", "Trường đối tác", "Quốc gia",
  "Thời gian bắt đầu", "Thời gian kết thúc",
];

const thongTinDoan = [
  "Tên đoàn", "Người đại diện", "Hộ chiếu", "Quốc tịch",
  "Ngày sinh", "Thời gian bắt đầu", "Thời gian kết thúc",
  "Nội dung", "Ghi chú",
];

export default function ExportPage() {
  const [selectedCG, setSelectedCG] = useState([]);
  const [selectedSK, setSelectedSK] = useState([]);
  const [selectedSV, setSelectedSV] = useState([]);
  const [selectedDoan, setSelectedDoan] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    truongDonVi: [],
    quocGia: [],
    chucVu: [],
    mucDich: [],
    thoiGian: [], // Giữ lại cho các loại khác (CG, SV, Doan nếu cần)
    thoiGianBatDau: [],
    hinhThuc: [],
    capBac: [],
    truongDoiTac: [],
    quocTich: [],
  });

  const [filterValues, setFilterValues] = useState({
    truongDonVi: undefined,
    quocGia: undefined,
    chucVu: undefined,
    mucDich: undefined,
    thoiGian: undefined,
    thoiGianBatDau: undefined,
    hinhThuc: undefined,
    capBac: undefined,
    truongDoiTac: undefined,
    quocTich: undefined,
  });

  const selectedType = selectedCG.length > 0 ? "CG" :
                       selectedSK.length > 0 ? "SK" :
                       selectedSV.length > 0 ? "SV" :
                       selectedDoan.length > 0 ? "Doan" : null;
  const selectedFields = selectedType === "CG" ? selectedCG :
                        selectedType === "SK" ? selectedSK :
                        selectedType === "SV" ? selectedSV : selectedDoan;

  const handleChange = (type) => (checkedValues) => {
    console.log(`Type changed to ${type}, values:`, checkedValues);
    if (type === "CG") {
      setSelectedCG(checkedValues);
      setSelectedSK([]);
      setSelectedSV([]);
      setSelectedDoan([]);
    } else if (type === "SK") {
      setSelectedSK(checkedValues);
      setSelectedCG([]);
      setSelectedSV([]);
      setSelectedDoan([]);
    } else if (type === "SV") {
      setSelectedSV(checkedValues);
      setSelectedCG([]);
      setSelectedSK([]);
      setSelectedDoan([]);
    } else {
      setSelectedDoan(checkedValues);
      setSelectedCG([]);
      setSelectedSK([]);
      setSelectedSV([]);
    }
  };

  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key}=${value}`);
    setFilterValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedType) {
        setData([]);
        return;
      }
      setLoading(true);
      try {
        const fields = selectedFields.length > 0
          ? selectedFields.map(label => fieldMap[label])
          : (selectedType === "CG" ? thongTinChuyenGia :
             selectedType === "SK" ? thongTinSuKien :
             selectedType === "SV" ? thongTinSinhVien : thongTinDoan).map(label => fieldMap[label]);

        const type = selectedType === "CG" ? "chuyengias" :
                     selectedType === "SK" ? "sukiens" :
                     selectedType === "SV" ? "sinhviens" : "danhmucdoans";
        const params = new URLSearchParams();
        params.append("fields", fields.join(","));

        Object.entries(filterValues).forEach(([key, value]) => {
          if (value && filters[key].length > 0) {
            params.append(key === "thoiGianBatDau" ? "year" : key, value);
          }
        });

        const url = `${API_URL}/${type}?${params.toString()}`;
        console.log("Fetching data:", url);
        const response = await axios.get(url);
        const resData = response.data.data || response.data;
        const dataKey = selectedType === "CG" ? "chuyenGias" :
                        selectedType === "SK" ? "suKiens" :
                        selectedType === "SV" ? "sinhViens" : "danhMucDoans";
        setData(Array.isArray(resData) ? resData : resData[dataKey] || []);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error.response || error);
        setData([]);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedType, selectedFields, filterValues]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterValues(prev => ({
          ...prev,
          ...(selectedType === "CG" ? {
            truongDonVi: prev.truongDonVi,
            quocGia: prev.quocGia,
            chucVu: prev.chucVu,
            mucDich: undefined,
            thoiGian: undefined,
            thoiGianBatDau: undefined,
            hinhThuc: undefined,
            capBac: undefined,
            truongDoiTac: undefined,
            quocTich: undefined,
          } : selectedType === "SK" ? {
            truongDonVi: undefined,
            quocGia: undefined,
            chucVu: undefined,
            mucDich: prev.mucDich,
            thoiGian: undefined, // Xóa thoiGian cho SK
            thoiGianBatDau: prev.thoiGianBatDau,
            hinhThuc: undefined,
            capBac: undefined,
            truongDoiTac: undefined,
            quocTich: undefined,
          } : selectedType === "SV" ? {
            truongDonVi: undefined,
            quocGia: prev.quocGia,
            chucVu: undefined,
            mucDich: undefined,
            thoiGian: undefined,
            thoiGianBatDau: prev.thoiGianBatDau,
            hinhThuc: prev.hinhThuc,
            capBac: prev.capBac,
            truongDoiTac: prev.truongDoiTac,
            quocTich: undefined,
          } : selectedType === "Doan" ? {
            truongDonVi: undefined,
            quocGia: undefined,
            chucVu: undefined,
            mucDich: undefined,
            thoiGian: undefined,
            thoiGianBatDau: prev.thoiGianBatDau,
            hinhThuc: undefined,
            capBac: undefined,
            truongDoiTac: undefined,
            quocTich: prev.quocTich,
          } : {
            truongDonVi: undefined,
            quocGia: undefined,
            chucVu: undefined,
            mucDich: undefined,
            thoiGian: undefined,
            thoiGianBatDau: undefined,
            hinhThuc: undefined,
            capBac: undefined,
            truongDoiTac: undefined,
            quocTich: undefined,
          }),
        }));

        const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))].sort();

        if (selectedType === "CG") {
          const res = await axios.get(`${API_URL}/chuyengias?fields=truongDonVi,quocGia,chucVu`);
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data.chuyenGias || [];
          setFilters({
            truongDonVi: unique(data, "truongDonVi"),
            quocGia: unique(data, "quocGia"),
            chucVu: unique(data, "chucVu"),
            mucDich: [],
            thoiGian: [],
            thoiGianBatDau: [],
            hinhThuc: [],
            capBac: [],
            truongDoiTac: [],
            quocTich: [],
          });
        } else if (selectedType === "SK") {
          const res = await axios.get(`${API_URL}/sukiens?fields=mucDich,thoiGianBatDau,thoiGianKetThuc`);
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data.suKiens || [];
          const startYears = [...new Set(
            data.map(item => item.thoiGianBatDau ? new Date(item.thoiGianBatDau).getFullYear() : null)
          )].filter(Boolean).sort().map(year => year.toString());
          setFilters({
            truongDonVi: [],
            quocGia: [],
            chucVu: [],
            mucDich: unique(data, "mucDich"),
            thoiGian: [], // Xóa thoiGian cho SK
            thoiGianBatDau: startYears,
            hinhThuc: [],
            capBac: [],
            truongDoiTac: [],
            quocTich: [],
          });
        } else if (selectedType === "SV") {
          const res = await axios.get(`${API_URL}/sinhviens?fields=hinhThuc,capBac,quocGia,truongDoiTac,thoiGianBatDau,thoiGianKetThuc`);
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data.sinhViens || [];
          const startYears = [...new Set(
            data.map(item => item.thoiGianBatDau ? new Date(item.thoiGianBatDau).getFullYear() : null)
          )].filter(Boolean).sort().map(year => year.toString());
          setFilters({
            truongDonVi: [],
            quocGia: unique(data, "quocGia"),
            chucVu: [],
            mucDich: [],
            thoiGian: [],
            thoiGianBatDau: startYears,
            hinhThuc: unique(data, "hinhThuc"),
            capBac: unique(data, "capBac"),
            truongDoiTac: unique(data, "truongDoiTac"),
            quocTich: [],
          });
        } else if (selectedType === "Doan") {
          const res = await axios.get(`${API_URL}/danhmucdoans?fields=quocTich,thoiGianBatDau,thoiGianKetThuc`);
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data.danhMucDoans || [];
          const startYears = [...new Set(
            data.map(item => item.thoiGianBatDau ? new Date(item.thoiGianBatDau).getFullYear() : null)
          )].filter(Boolean).sort().map(year => year.toString());
          setFilters({
            truongDonVi: [],
            quocGia: [],
            chucVu: [],
            mucDich: [],
            thoiGian: [],
            thoiGianBatDau: startYears,
            hinhThuc: [],
            capBac: [],
            truongDoiTac: [],
            quocTich: unique(data, "quocTich"),
          });
        } else {
          setFilters({
            truongDonVi: [],
            quocGia: [],
            chucVu: [],
            mucDich: [],
            thoiGian: [],
            thoiGianBatDau: [],
            hinhThuc: [],
            capBac: [],
            truongDoiTac: [],
            quocTich: [],
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu lọc:", error.response || error);
        message.error("Không thể tải bộ lọc");
      }
    };
    fetchFilterOptions();
  }, [selectedType]);

  const generateColumns = useMemo(() => (fields) =>
    fields.map(label => ({
      title: label,
      dataIndex: fieldMap[label],
      key: fieldMap[label],
      render: (text) => {
        if (["thoiGianBatDau", "thoiGianKetThuc", "DOB"].includes(fieldMap[label])) {
          return text ? dayjs(text).format("DD/MM/YYYY") : "-";
        }
        return text || "-";
      },
    })), []);

  const exportToExcel = () => {
    if (!data || data.length === 0 || selectedFields.length === 0) {
      message.warning("Không có dữ liệu hoặc cột được chọn để xuất.");
      return;
    }
    const exportData = data.map(row => {
      const obj = {};
      selectedFields.forEach(label => {
        const key = fieldMap[label];
        obj[label] = ["thoiGianBatDau", "thoiGianKetThuc", "DOB"].includes(key)
          ? (row[key] ? dayjs(row[key]).format("DD/MM/YYYY") : "")
          : (row[key] ?? "");
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

  const filterFields = useMemo(() => [
    { label: "Trường/Đơn vị", key: "truongDonVi" },
    { label: "Quốc gia", key: "quocGia" },
    { label: "Chức vụ", key: "chucVu" },
    { label: "Mục đích", key: "mucDich" },
    { label: "Thời gian (năm)", key: "thoiGian" },
    { label: "Thời gian bắt đầu (năm)", key: "thoiGianBatDau" },
    { label: "Hình thức", key: "hinhThuc" },
    { label: "Cấp bậc", key: "capBac" },
    { label: "Trường đối tác", key: "truongDoiTac" },
    { label: "Quốc tịch", key: "quocTich" },
  ].filter(({ key }) => filters[key].length > 0 && !(key === "thoiGian" && selectedType === "SK")), [filters, selectedType]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-[18px] md:text-[20px]">
      <Card className="max-w-full mx-auto shadow-lg">
        {/* Checkbox Section */}
        <div className="flex flex-col gap-6 items-start mb-8">
          <div className="bg-gray-100 p-6 rounded-md w-full">
            <div className="grid grid-cols-2 gap-10">
              {[
                ["Thông tin chuyên gia", thongTinChuyenGia, selectedCG, "CG"],
                ["Thông tin sự kiện", thongTinSuKien, selectedSK, "SK"],
                ["Thông tin sinh viên", thongTinSinhVien, selectedSV, "SV"],
                ["Thông tin đoàn", thongTinDoan, selectedDoan, "Doan"],
              ].map(([title, options, value, type], idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-xl mb-3">{title}</h3>
                  <Checkbox.Group
                    value={value}
                    onChange={handleChange(type)}
                    disabled={selectedType && selectedType !== type}
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
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Bộ Lọc</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {filterFields.map(({ label, key }) => (
              <Select
                key={key}
                placeholder={label}
                allowClear
                size="large"
                className="w-full text-lg"
                value={filterValues[key]}
                onChange={(value) => handleFilterChange(key, value)}
                style={{ minWidth: 200 }}
                dropdownStyle={{ maxHeight: 300, overflowY: "auto" }}
              >
                {filters[key].map((value) => (
                  <Option key={value} value={value} className="text-lg">{value}</Option>
                ))}
              </Select>
            ))}
          </div>
        </div>

        {/* Table Section */}
        <div className="border border-dashed border-gray-300 rounded-md h-72 overflow-auto p-6 mb-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" />
            </div>
          ) : selectedType ? (
            data?.length > 0 ? (
              <Table
                dataSource={data}
                columns={generateColumns(selectedFields.length > 0 ? selectedFields : (
                  selectedType === "CG" ? thongTinChuyenGia :
                  selectedType === "SK" ? thongTinSuKien :
                  selectedType === "SV" ? thongTinSinhVien : thongTinDoan
                ))}
                pagination={false}
                rowKey={(record) => record._id || record.id}
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
              Vui lòng chọn thông tin chuyên gia, sự kiện, sinh viên hoặc đoàn để hiển thị dữ liệu
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex-1 flex justify-end w-full">
          <Button
            type="primary"
            size="large"
            className="rounded-xl px-8 py-4 text-lg"
            onClick={exportToExcel}
            disabled={!data || data.length === 0}
          >
            Xuất file
          </Button>
        </div>
      </Card>
    </div>
  );
}