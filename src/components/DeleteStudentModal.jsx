import React from 'react';
import { Modal, message } from 'antd';
import { sinhVienService } from '../services/sinhVienService';

const DeleteStudentModal = ({ student, visible, onCancel, onSuccess }) => {
  const handleDelete = async () => {
    if (!student?._id) {
      message.error('Không tìm thấy ID sinh viên');
      return;
    }

    try {
      await sinhVienService.deleteSinhVien(student._id);
      message.success('Xóa sinh viên thành công');
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('Không thể xóa sinh viên');
    }
  };

  return (
    <Modal
      title="Xác nhận xóa sinh viên"
      open={visible}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Xóa"
      okType="danger"
      cancelText="Hủy"
    >
      <p>Bạn có chắc chắn muốn xóa sinh viên "{student?.hoVaTen || ''}" không?</p>
    </Modal>
  );
};

export default DeleteStudentModal;