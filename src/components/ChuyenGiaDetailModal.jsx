import React from 'react';
import { Modal, Descriptions, Image } from 'antd';

const ChuyenGiaDetailModal = ({ chuyenGia, visible, onCancel }) => {
  if (!chuyenGia) return null;

  return (
    <Modal
      title="Chi tiết chuyên gia"
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
        <Descriptions.Item label="Mã chuyên gia">{chuyenGia.maCG || '—'}</Descriptions.Item>
        <Descriptions.Item label="Họ và tên">{chuyenGia.hoVaTen || '—'}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">{chuyenGia.gioiTinh || '—'}</Descriptions.Item>
        <Descriptions.Item label="Email">{chuyenGia.email || '—'}</Descriptions.Item>
        <Descriptions.Item label="Quốc gia">{chuyenGia.quocGia || '—'}</Descriptions.Item>
        <Descriptions.Item label="Hộ chiếu">{chuyenGia.hoChieu || '—'}</Descriptions.Item>

        <Descriptions.Item label="Ảnh hộ chiếu">
          {chuyenGia.anhHoChieu && chuyenGia.anhHoChieu.startsWith('data:image') ? (
            <Image
              src={chuyenGia.anhHoChieu}
              alt="Ảnh hộ chiếu"
              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
            />
          ) : (
            'Không có ảnh'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Trường / Đơn vị">{chuyenGia.truongDonVi || '—'}</Descriptions.Item>
        <Descriptions.Item label="Chức danh">{chuyenGia.chucDanh || '—'}</Descriptions.Item>
        <Descriptions.Item label="Chức vụ">{chuyenGia.chucVu || '—'}</Descriptions.Item>
        <Descriptions.Item label="Chuyên ngành">{chuyenGia.chuyenNganh || '—'}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{chuyenGia.ghiChu || '—'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ChuyenGiaDetailModal;