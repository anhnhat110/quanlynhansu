import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Input, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import StudentForm from '../components/StudentForm';
import DeleteStudentModal from '../components/DeleteStudentModal';
import StudentDetailModal from '../components/StudentDetailModal';
import { sinhVienService } from '../services/sinhVienService';

const { Option } = Select;

const StudentManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchStudents = async (page = 1, pageSize = 10, sortOrder = '', searchTerm = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
      };

      if (sortOrder === 'latest') params.sort = '-createdAt';
      if (sortOrder === 'oldest') params.sort = 'createdAt';
      if (searchTerm) params.search = searchTerm;

      const response = await sinhVienService.getAllSinhVien(params);
      const studentData = response?.data?.data?.sinhViens || response?.data?.sinhViens || [];
      const total = response?.data?.length || studentData.length || 0;

      setStudents(Array.isArray(studentData) ? studentData : []);
      setTotalRecords(total);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudents(1, pageSize, sortOrder, searchTerm);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1);
    fetchStudents(1, pageSize, value, searchTerm);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    fetchStudents(page, pageSize, sortOrder, searchTerm);
  };

  useEffect(() => {
    fetchStudents(currentPage, pageSize, sortOrder, searchTerm);
  }, [currentPage, pageSize, sortOrder, searchTerm]);

  const handleDeleteClick = (record) => {
    setDeletingStudent(record);
    setIsDeleteModalVisible(true);
  };

  const handleDetailClick = (record) => {
    setViewingStudent(record);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'maSV',
      key: 'maSV',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'hoVaTen',
      key: 'hoVaTen',
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'chuyenNganh',
      key: 'chuyenNganh',
      render: (text) => text || '—',
    },
    {
      title: 'Lớp',
      dataIndex: 'lop',
      key: 'lop',
      render: (text) => text || '—',
    },
    {
      title: 'Trường đối tác',
      dataIndex: 'truongDoiTac',
      key: 'truongDoiTac',
    },
    {
      title: 'Quốc gia',
      dataIndex: 'quocGia',
      key: 'quocGia',
    },
    {
      title: 'Thời gian',
      key: 'thoiGian',
     render: (_, record) => {
        const batDau = new Date(record.thoiGianBatDau).toLocaleDateString();
        const ketThuc = new Date(record.thoiGianKetThuc).toLocaleDateString();
        return `${batDau} - ${ketThuc}`;
      },
  
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
              setEditingStudent(record);
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
        <h1 className="text-2xl font-semibold">Danh sách sinh viên</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingStudent(null);
            setIsModalVisible(true);
          }}
        >
          Tạo sinh viên
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input.Search
          placeholder="Tìm kiếm sinh viên"
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
        dataSource={students}
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
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sinh viên`,
        }}
      />

      <Modal
        title={editingStudent ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingStudent(null);
        }}
        footer={null}
        width={800}
      >
        <StudentForm
          student={editingStudent}
          onSuccess={() => {
            fetchStudents(currentPage, pageSize, sortOrder, searchTerm);
            setIsModalVisible(false);
          }}
        />
      </Modal>

      <DeleteStudentModal
        student={deletingStudent}
        visible={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDeletingStudent(null);
        }}
        onSuccess={() => {
          setIsDeleteModalVisible(false);
          setDeletingStudent(null);
          fetchStudents(currentPage, pageSize, sortOrder, searchTerm);
        }}
      />

      <StudentDetailModal
        student={viewingStudent}
        visible={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingStudent(null);
        }}
      />
    </div>
  );
};

export default StudentManagement;