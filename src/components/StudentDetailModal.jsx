import React from 'react';
import { Modal, Descriptions } from 'antd';

const StudentDetailModal = ({ student, visible, onCancel }) => {
  if (!student) return null;

  return (
    <Modal
      title="Chi tiết sinh viên"
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
        <Descriptions.Item label="Mã sinh viên">{student.maSV || '—'}</Descriptions.Item>
        <Descriptions.Item label="Họ và tên">{student.hoVaTen || '—'}</Descriptions.Item>
        <Descriptions.Item label="Hình thức">{student.hinhThuc || '—'}</Descriptions.Item>
        <Descriptions.Item label="Cấp bậc">{student.capBac || '—'}</Descriptions.Item>
        <Descriptions.Item label="Chuyên ngành">{student.chuyenNganh || '—'}</Descriptions.Item>
        <Descriptions.Item label="Lớp">{student.lop || '—'}</Descriptions.Item>
        <Descriptions.Item label="Trường đối tác">{student.truongDoiTac || '—'}</Descriptions.Item>
        <Descriptions.Item label="Quốc gia">{student.quocGia || '—'}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">
          {student.thoiGianBatDau ? new Date(student.thoiGianBatDau).toLocaleDateString('vi-VN') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">
          {student.thoiGianKetThuc ? new Date(student.thoiGianKetThuc).toLocaleDateString('vi-VN') : '—'}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default StudentDetailModal;