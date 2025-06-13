import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Input, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DanhMucDoanForm from '../components/DanhMucDoanForm';
import DeleteDanhMucDoanModal from '../components/DeleteDanhMucDoanModal';
import DanhMucDoanDetailModal from '../components/DanhMucDoanDetailModal';
import { danhMucDoanService } from '../services/danhMucDoanService';

const { Option } = Select;

const DanhMucDoanManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [danhMucDoans, setDanhMucDoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDoan, setEditingDoan] = useState(null);
  const [deletingDoan, setDeletingDoan] = useState(null);
  const [viewingDoan, setViewingDoan] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchDanhMucDoans = async (page = 1, pageSize = 10, sortOrder = '', searchTerm = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
      };

      if (sortOrder === 'latest') params.sort = '-createdAt';
      if (sortOrder === 'oldest') params.sort = 'createdAt';
      if (searchTerm) params.search = searchTerm;

      const response = await danhMucDoanService.getAllDanhMucDoan(params);
      const doanData = response?.data?.danhMucDoans || response?.danhMucDoans || response?.data || response || [];
      const total = response?.data?.total || response?.total || doanData.length || 0;

      setDanhMucDoans(Array.isArray(doanData) ? doanData : []);
      setTotalRecords(total);
    } catch (error) {
      console.error('Failed to fetch danh muc doan:', error);
      setDanhMucDoans([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDanhMucDoans(1, pageSize, sortOrder, searchTerm);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1);
    fetchDanhMucDoans(1, pageSize, value, searchTerm);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    fetchDanhMucDoans(page, pageSize, sortOrder, searchTerm);
  };

  useEffect(() => {
    fetchDanhMucDoans(currentPage, pageSize, sortOrder, searchTerm);
  }, [currentPage, pageSize, sortOrder, searchTerm]);

  const handleDeleteClick = (record) => {
    setDeletingDoan(record);
    setIsDeleteModalVisible(true);
  };

  const handleDetailClick = (record) => {
    setViewingDoan(record);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Tên đoàn',
      dataIndex: 'tenDoan',
      key: 'tenDoan',
    },
    {
      title: 'Người đại diện',
      dataIndex: 'nguoiDaiDien',
      key: 'nguoiDaiDien',
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'quocTich',
      key: 'quocTich',
    },
    {
      title: 'Thời gian',
      key: 'thoiGian',
      render: (_, record) => {
        const batDau = record.thoiGianBatDau
          ? new Date(record.thoiGianBatDau).toLocaleDateString('vi-VN')
          : '—';
        const ketThuc = record.thoiGianKetThuc
          ? new Date(record.thoiGianKetThuc).toLocaleDateString('vi-VN')
          : '—';
        return `${batDau} - ${ketThuc}`;
      },
      width: 200,
    },
    {
      title: 'Nội dung',
      dataIndex: 'noiDung',
      key: 'noiDung',
      render: (text) => text || '—',
    },
    {
      title: '',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleDetailClick(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDoan(record);
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
        <h1 className="text-2xl font-semibold">Danh sách đoàn</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingDoan(null);
            setIsModalVisible(true);
          }}
        >
          Tạo đoàn
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input.Search
          placeholder="Tìm kiếm đoàn"
          style={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />
        <Select
          value={sortOrder}
          style={{ width: 200 }}
          placeholder="Sắp xếp"
          onChange={handleSortChange}
        >
          <Option value="latest">Thời gian (gần nhất)</Option>
          <Option value="oldest">Thời gian (cũ nhất)</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={danhMucDoans}
        loading={loading}
        rowKey="_id"
        className="shadow-sm"
        style={{ borderRadius: '8px', overflow: 'hidden' }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalRecords,
          onChange: handlePageChange,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đoàn`,
        }}
      />

      <Modal
        title={editingDoan ? 'Sửa thông tin đoàn' : 'Thêm đoàn mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingDoan(null);
        }}
        footer={null}
        width={800}
      >
        <DanhMucDoanForm
          doan={editingDoan}
          onSuccess={() => {
            fetchDanhMucDoans(currentPage, pageSize, sortOrder, searchTerm);
            setIsModalVisible(false);
          }}
        />
      </Modal>

      <DeleteDanhMucDoanModal
        doan={deletingDoan}
        visible={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDeletingDoan(null);
        }}
        onSuccess={() => {
          setIsDeleteModalVisible(false);
          setDeletingDoan(null);
          fetchDanhMucDoans(currentPage, pageSize, sortOrder, searchTerm);
        }}
      />

      <DanhMucDoanDetailModal
        doan={viewingDoan}
        visible={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingDoan(null);
        }}
      />
    </div>
  );
};

export default DanhMucDoanManagement;