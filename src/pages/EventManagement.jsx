  import React, { useState, useEffect } from 'react';
  import { Table, Button, Space, Select, Input, Modal, Descriptions } from 'antd';
  import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
  import EventForm from '../components/EventForm';
  import DeleteEventModal from '../components/DeleteEventModal';
  import EventDetailModal from '../components/EventDetailModal';
  import { suKienService } from '../services/suKienService';

  const { Option } = Select;

  const EventManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deletingEvent, setDeletingEvent] = useState(null);
    const [viewingEvent, setViewingEvent] = useState(null);
    const [sortOrder, setSortOrder] = useState('latest');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const fetchEvents = async (page = 1, pageSize = 10, sortOrder = '', searchTerm = '') => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pageSize,
        };

        if (sortOrder === 'latest') params.sort = '-thoiGianKetThuc';
        if (sortOrder === 'oldest') params.sort = 'thoiGianKetThuc';
        if (searchTerm) params.search = searchTerm;

        const response = await suKienService.getAllSuKien(params);
        const eventData = response?.data?.suKiens || response?.suKiens || response?.data || response || [];
        const total = response?.data?.total || response?.total || eventData.length || 0;

        setEvents(Array.isArray(eventData) ? eventData : []);
        setTotalRecords(total);
      } catch {
        setEvents([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    const handleSearch = () => {
      setCurrentPage(1);
      fetchEvents(1, pageSize, sortOrder, searchTerm);
    };

    const handleSortChange = (value) => {
      setSortOrder(value);
      setCurrentPage(1);
      fetchEvents(1, pageSize, value, searchTerm);
    };

    const handlePageChange = (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
      fetchEvents(page, pageSize, sortOrder, searchTerm);
    };

    useEffect(() => {
      fetchEvents(currentPage, pageSize, sortOrder, searchTerm);
    }, [currentPage, pageSize, sortOrder, searchTerm]);

    const handleDeleteClick = (record) => {
      setDeletingEvent(record);
      setIsDeleteModalVisible(true);
    };

    const handleDetailClick = (record) => {
      setViewingEvent(record);
      setIsDetailModalVisible(true);
    };

    const handleShowGuide = (record) => {
      const guide = record.guides?.[0];
      if (guide) {
        setSelectedGuide(guide);
        setIsGuideModalVisible(true);
      }
    };
    
    const columns = [
      {

        title: 'Chuyên gia',
        key: 'chuyenGia',
        render: (_, record) => {
          const guide = record.guides?.[0];
          return guide ? (
            <Button type="link" onClick={() => handleShowGuide(record)}>
              {guide.hoVaTen || 'Xem chuyên gia'}
            </Button>
          ) : 'Không có chuyên gia';
        },
      },
      {
        title: 'Sự kiện',
        dataIndex: 'suKien',
        key: 'suKien',
      },
      {
        title: 'Thời gian',
        key: 'thoiGian',
        render: (_, record) => {
          const batDau = new Date(record.thoiGianBatDau).toLocaleString();
          const ketThuc = new Date(record.thoiGianKetThuc).toLocaleString();
          return `${batDau} - ${ketThuc}`;
        },
      },
      {
        title: 'Địa điểm',
        dataIndex: 'diaDiem',
        key: 'diaDiem',
      },
      {
        title: 'Thành phần',
        dataIndex: 'thanhPhan',
        key: 'thanhPhan',
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
                setEditingEvent(record);
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
          <h1 className="text-2xl font-semibold">Danh sách sự kiện</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEvent(null);
              setIsModalVisible(true);
            }}
          >
            Tạo sự kiện
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Input.Search
            placeholder="Tìm kiếm sự kiện"
            style={{ width: 300 }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
          dataSource={events}
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
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`,
          }}
        />

        <Modal
          title={editingEvent ? "Sửa thông tin sự kiện" : "Thêm sự kiện mới"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingEvent(null);
          }}
          style={{ top: 20 }}
          footer={null}
          width={1000}
        >
          <EventForm
            event={editingEvent}
            onSuccess={() => {
              fetchEvents(currentPage, pageSize, sortOrder, searchTerm);
              setIsModalVisible(false);
            }}
          />
        </Modal>

        <DeleteEventModal
          event={deletingEvent}
          visible={isDeleteModalVisible}
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setDeletingEvent(null);
          }}
          onSuccess={() => {
            setIsDeleteModalVisible(false);
            setDeletingEvent(null);
            fetchEvents(currentPage, pageSize, sortOrder, searchTerm);
          }}
        />

        <EventDetailModal
          event={viewingEvent}
          visible={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false);
            setViewingEvent(null);
          }}
        />

        <Modal
          open={isGuideModalVisible}
          title="Thông tin chuyên gia"
          onCancel={() => setIsGuideModalVisible(false)}
          footer={null}
        >
          {selectedGuide && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Họ và tên">{selectedGuide.hoVaTen}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{selectedGuide.gioiTinh}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedGuide.email}</Descriptions.Item>
              <Descriptions.Item label="Chức danh">{selectedGuide.chucDanh}</Descriptions.Item>
              <Descriptions.Item label="Chức vụ">{selectedGuide.chucVu}</Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành">{selectedGuide.chuyenNganh}</Descriptions.Item>
              <Descriptions.Item label="Mã CG">{selectedGuide.maCG}</Descriptions.Item>
              <Descriptions.Item label="Trường đơn vị">{selectedGuide.truongDonVi}</Descriptions.Item>
              <Descriptions.Item label="Quốc gia">{selectedGuide.quocGia}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    );
  };

  export default EventManagement;