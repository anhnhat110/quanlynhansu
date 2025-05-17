import React from 'react';
import { Modal, message } from 'antd';
import { danhMucDoanService } from '../services/danhMucDoanService';

const DeleteDanhMucDoanModal = ({ doan, visible, onCancel, onSuccess }) => {
  const handleDelete = async () => {
    if (!doan?._id) {
      message.error('Không tìm thấy ID đoàn');
      return;
    }

    try {
      await danhMucDoanService.deleteDanhMucDoan(doan._id);
      message.success('Xóa đoàn thành công');
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting danh muc doan:', error);
      message.error('Không thể xóa đoàn');
    }
  };

  return (
    <Modal
      title="Xác nhận xóa đoàn"
      open={visible}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Xóa"
      okType="danger"
      cancelText="Hủy"
    >
      <p>Bạn có chắc chắn muốn xóa đoàn "{doan?.tenDoan || ''}" không?</p>
    </Modal>
  );
};

export default DeleteDanhMucDoanModal;