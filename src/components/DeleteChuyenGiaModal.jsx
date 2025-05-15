import React from 'react';
import { Modal, message } from 'antd';
import { chuyenGiaService } from '../services/chuyenGiaService';

const DeleteChuyenGiaModal = ({ chuyenGia, visible, onCancel, onSuccess }) => {
    const handleDelete = async () => {
        if (!chuyenGia?._id) {
            message.error('Không tìm thấy ID chuyên gia');
            return;
        }

        try {
            await chuyenGiaService.deleteChuyenGia(chuyenGia._id);
            message.success('Xóa chuyên gia thành công');
            onSuccess?.();
        } catch {
            message.error('Không thể xóa chuyên gia');
        }
    };

    return (
        <Modal
            title="Xác nhận xóa chuyên gia"
            open={visible}
            onCancel={onCancel}
            onOk={handleDelete}
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
        >
            <p>Bạn có chắc chắn muốn xóa chuyên gia "{chuyenGia?.hoVaTen || ''}" không?</p>
        </Modal>
    );
};

export default DeleteChuyenGiaModal;
