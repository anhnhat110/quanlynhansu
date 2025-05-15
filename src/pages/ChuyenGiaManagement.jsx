import React, { useState, useEffect } from "react";
import { Table, Button, Space, Select, Input, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ChuyenGiaForm from "../components/ChuyenGiaForm";
import DeleteChuyenGiaModal from "../components/DeleteChuyenGiaModal";
import { chuyenGiaService } from "../services/chuyenGiaService";

const { Option } = Select;

const ChuyenGiaManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [chuyenGiaList, setChuyenGiaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingChuyenGia, setEditingChuyenGia] = useState(null);
  const [deletingChuyenGia, setDeletingChuyenGia] = useState(null);
  const [sortOrder, setSortOrder] = useState("lastest");
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Current page (e.g., page=1)
  const [pageSize, setPageSize] = useState(10); // Limit per page (e.g., limit=10)
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records

  const fetchChuyenGiaList = async (page = 1, pageSize = 10, sortOrder = "", searchTerm = "") => {
    try {
      setLoading(true);
      const params = {
        page, // Page number (e.g., 1, 2, 3...)
        limit: pageSize, // Number of items per page (e.g., 10)
      };

      if (sortOrder === "lastest") params.sort = "hoVaTen"; // Sort A-Z
      if (sortOrder === "oldest") params.sort = "-hoVaTen"; // Sort Z-A
      if (searchTerm) params.search = searchTerm; // Search term

      const response = await chuyenGiaService.getAllChuyenGia(params);
      const data = response?.data || {};
      const chuyenGias = Array.isArray(data.chuyenGias) ? data.chuyenGias : [];
      const total = data.total || chuyenGias.length || 0; // Extract total from response

      setChuyenGiaList(chuyenGias);
      setTotalRecords(total);
    } catch (error) {
      console.error("Error fetching chuyenGia list:", error);
      setChuyenGiaList([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 on search
    fetchChuyenGiaList(1, pageSize, sortOrder, searchTerm);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1); // Reset to page 1 on sort change
    fetchChuyenGiaList(1, pageSize, value, searchTerm);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page); // Update to new page (e.g., page=2)
    setPageSize(pageSize); // Update limit per page (e.g., limit=20)
    fetchChuyenGiaList(page, pageSize, sortOrder, searchTerm);
  };

  useEffect(() => {
    fetchChuyenGiaList(currentPage, pageSize, sortOrder, searchTerm);
  }, [currentPage, pageSize, sortOrder, searchTerm]);

  const handleDeleteClick = (record) => {
    setDeletingChuyenGia(record);
    setIsDeleteModalVisible(true);
  };

  const handleImageClick = (hoChieu) => {
    setSelectedImage(hoChieu);
    setIsImageModalVisible(true);
  };

  const columns = [
    {
      title: "Mã CG",
      dataIndex: "maCG",
      key: "maCG",
    },
    {
      title: "Họ và tên",
      dataIndex: "hoVaTen",
      key: "hoVaTen",
    },
    {
      title: "Giới tính",
      dataIndex: "gioiTinh",
      key: "gioiTinh",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Quốc gia",
      dataIndex: "quocGia",
      key: "quocGia",
    },
    {
      title: "Hộ chiếu",
      dataIndex: "hoChieu",
      key: "hoChieu",
      render: (hoChieu) => (
        <div style={{ textAlign: "center" }}>
          {hoChieu && hoChieu.startsWith("data:image") ? (
            <img
              src={hoChieu}
              alt="Hộ chiếu"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                objectFit: "contain",
                cursor: "pointer",
                imageRendering: "auto",
              }}
              onClick={() => handleImageClick(hoChieu)}
            />
          ) : (
            "Không có ảnh"
          )}
        </div>
      ),
    },
    {
      title: "Trường / Đơn vị",
      dataIndex: "truongDonVi",
      key: "truongDonVi",
    },
    {
      title: "Chức danh",
      dataIndex: "chucDanh",
      key: "chucDanh",
    },
    {
      title: "Chức vụ",
      dataIndex: "chucVu",
      key: "chucVu",
    },
    {
      title: "Chuyên ngành",
      dataIndex: "chuyenNganh",
      key: "chuyenNganh",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingChuyenGia(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Danh sách chuyên gia</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingChuyenGia(null);
            setIsModalVisible(true);
          }}
        >
          Tạo chuyên gia
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input.Search
          placeholder="Tìm kiếm chuyên gia"
          style={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />
        <Select
          value={sortOrder}
          style={{ width: 200 }}
          placeholder="Sắp xếp theo"
          onChange={handleSortChange}
        >
          <Option value="lastest">Họ và tên (A-Z)</Option>
          <Option value="oldest">Họ và tên (Z-A)</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={chuyenGiaList}
        loading={loading}
        rowKey="maCG"
        className="shadow-sm"
        style={{ borderRadius: "8px", overflow: "hidden" }}
        pagination={{
          current: currentPage, // Corresponds to page parameter
          pageSize: pageSize, // Corresponds to limit parameter
          total: totalRecords,
          onChange: handlePageChange,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chuyên gia`,
        }}
      />

      <Modal
        title={editingChuyenGia ? "Sửa thông tin chuyên gia" : "Tạo chuyên gia mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingChuyenGia(null);
        }}
        footer={null}
        width={1000}
      >
        <ChuyenGiaForm
          chuyengia={editingChuyenGia}
          onSuccess={() => {
            fetchChuyenGiaList(currentPage, pageSize, sortOrder, searchTerm);
            setIsModalVisible(false);
          }}
        />
      </Modal>

      <DeleteChuyenGiaModal
        chuyenGia={deletingChuyenGia}
        visible={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDeletingChuyenGia(null);
        }}
        onSuccess={() => {
          setIsDeleteModalVisible(false);
          setDeletingChuyenGia(null);
          fetchChuyenGiaList(currentPage, pageSize, sortOrder, searchTerm);
        }}
      />

      <Modal
        title="Xem ảnh hộ chiếu"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Hộ chiếu phóng to"
            style={{ width: "100%", height: "auto", imageRendering: "auto" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ChuyenGiaManagement;