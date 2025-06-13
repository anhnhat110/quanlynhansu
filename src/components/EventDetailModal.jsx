import React from 'react';
import { Modal, Descriptions } from 'antd';

const EventDetailModal = ({ event, visible, onCancel }) => {
  if (!event) return null;

  const guide = event.guides?.[0];

  return (
    <Modal
      title="Chi tiết sự kiện"
      open={visible}
      onCancel={onCancel}
      footer={[<button key="close" className="ant-btn ant-btn-primary" onClick={onCancel}>Đóng</button>]}
      width={800}
    >
      <Descriptions
        bordered
        column={1}
        labelStyle={{ width: '200px', fontWeight: 'bold' }}
        contentStyle={{ width: 'auto', }}
      >
        <Descriptions.Item label="Mã sự kiện">{event.maSK || '—'}</Descriptions.Item>
        <Descriptions.Item label="Chuyên gia">
          {guide ? `${guide.hoVaTen} (${guide.maCG || '—'})` : 'Không'}
        </Descriptions.Item>
        <Descriptions.Item label="Mục đích">{event.mucDich || '—'}</Descriptions.Item>
        <Descriptions.Item label="Sự kiện">{event.suKien || '—'}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">
          {event.thoiGianBatDau ? new Date(event.thoiGianBatDau).toLocaleString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">
          {event.thoiGianKetThuc ? new Date(event.thoiGianKetThuc).toLocaleString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Địa điểm">{event.diaDiem || '—'}</Descriptions.Item>
        <Descriptions.Item label="Thành phần">{event.thanhPhan || '—'}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{event.ghiChu || 'Không'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default EventDetailModal;