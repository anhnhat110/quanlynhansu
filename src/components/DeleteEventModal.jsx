import React from 'react';
import { Modal, message } from 'antd';
import { suKienService } from '../services/suKienService';

const DeleteEventModal = ({ event, visible, onCancel, onSuccess }) => {
    const handleDelete = async () => {
        if (!event?._id) {
            message.error('Không tìm thấy ID sự kiện');
            return;
        }

        try {
            await suKienService.deleteSuKien(event._id);
            message.success('Xóa sự kiện thành công');
            onSuccess?.();
        } catch  {
            message.error('Không thể xóa sự kiện');
        }
    };

    return (
        <Modal
            title="Xác nhận xóa sự kiện"
            open={visible}
            onCancel={onCancel}
            onOk={handleDelete}
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
        >
            <p>Bạn có chắc chắn muốn xóa sự kiện "{event?.suKien || ''}" không?</p>
        </Modal>
    );
};

export default DeleteEventModal; 