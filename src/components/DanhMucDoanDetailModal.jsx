import React from 'react';
import { Modal, Descriptions } from 'antd';

const DanhMucDoanDetailModal = ({ doan, visible, onCancel }) => {
  if (!doan) return null;

  return (
    <Modal
      title="Chi tiết đoàn"
      open={visible}
      onCancel={onCancel}
      footer={[<button key="close" className="ant-btn ant-btn-primary" onClick={onCancel}>Đóng</button>]}
      width={800}
    >
      <Descriptions
        bordered
        column={1}
        labelStyle={{ width: '200px', fontWeight: 'bold' }}
        contentStyle={{ width: 'auto' }}
      >
        <Descriptions.Item label="Tên đoàn">{doan.tenDoan || '—'}</Descriptions.Item>
        <Descriptions.Item label="Người đại diện">{doan.nguoiDaiDien || '—'}</Descriptions.Item>
        <Descriptions.Item label="Hộ chiếu">{doan.hoChieu || '—'}</Descriptions.Item>
        <Descriptions.Item label="Quốc tịch">{doan.quocTich || '—'}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {doan.DOB ? new Date(doan.DOB).toLocaleDateString('vi-VN') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">
          {doan.thoiGianBatDau ? new Date(doan.thoiGianBatDau).toLocaleDateString('vi-VN') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">
          {doan.thoiGianKetThuc ? new Date(doan.thoiGianKetThuc).toLocaleDateString('vi-VN') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Nội dung">{doan.noiDung || '—'}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{doan.ghiChu || 'Không có ghi chú'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default DanhMucDoanDetailModal;