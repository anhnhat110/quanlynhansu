import React, { useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { sinhVienService } from '../services/sinhVienService';
import { useState } from 'react';

const { Option } = Select;

const StudentForm = ({ student, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const hinhThucOptions = ['Trao đổi', 'Chuyển tiếp'];
  const capBacOptions = ['Đại học', 'Sau đại học'];

  const generateMaSV = () => `SV-${uuidv4().slice(0, 4).toUpperCase()}`;

  useEffect(() => {
    if (student) {
      form.setFieldsValue({
        maSV: student.maSV,
        hoVaTen: student.hoVaTen,
        hinhThuc: student.hinhThuc,
        capBac: student.capBac,
        chuyenNganh: student.chuyenNganh,
        lop: student.lop,
        truongDoiTac: student.truongDoiTac,
        quocGia: student.quocGia,
        thoiGian: student.thoiGian,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        maSV: generateMaSV(),
        hoVaTen: '',
        hinhThuc: '',
        capBac: '',
        chuyenNganh: '',
        lop: '',
        truongDoiTac: '',
        quocGia: '',
        thoiGian: '',
      });
    }
  }, [student, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (!values.maSV) {
        values.maSV = generateMaSV();
      }

      const payload = { ...values };

      if (student?._id) {
        const updatedValues = { ...payload };
        delete updatedValues._id;
        await sinhVienService.updateSinhVien(student._id, updatedValues);
        message.success('Cập nhật sinh viên thành công');
      } else {
        await sinhVienService.createSinhVien(payload);
        message.success('Thêm sinh viên thành công');
      }

      form.resetFields();
      form.setFieldsValue({
        maSV: generateMaSV(),
        hoVaTen: '',
        hinhThuc: '',
        capBac: '',
        chuyenNganh: '',
        lop: '',
        truongDoiTac: '',
        quocGia: '',
        thoiGian: '',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      message.error('Có lỗi xảy ra khi lưu sinh viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={student || {}}
      className="grid grid-cols-2 gap-4"
    >
      <Form.Item label="Mã sinh viên" name="maSV" className="col-span-1">
        <Input disabled className="bg-gray-100" />
      </Form.Item>

      <Form.Item
        label="Họ và tên"
        name="hoVaTen"
        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Hình thức"
        name="hinhThuc"
        rules={[{ required: true, message: 'Vui lòng chọn hình thức' }]}
      >
        <Select placeholder="Chọn hình thức">
          {hinhThucOptions.map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Cấp bậc"
        name="capBac"
        rules={[{ required: true, message: 'Vui lòng chọn cấp bậc' }]}
      >
        <Select placeholder="Chọn cấp bậc">
          {capBacOptions.map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Chuyên ngành" name="chuyenNganh">
        <Input />
      </Form.Item>

      <Form.Item label="Lớp" name="lop">
        <Input />
      </Form.Item>

      <Form.Item
        label="Trường đối tác"
        name="truongDoiTac"
        rules={[{ required: true, message: 'Vui lòng nhập trường đối tác' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Quốc gia"
        name="quocGia"
        rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Thời gian"
        name="thoiGian"
        rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
      >
        <Input placeholder="VD: 2025-03-01 to 2025-08-31" />
      </Form.Item>

      <Form.Item className="col-span-2 flex justify-between">
        <Button
          type="default"
          htmlType="button"
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              maSV: generateMaSV(),
              hoVaTen: '',
              hinhThuc: '',
              capBac: '',
              chuyenNganh: '',
              lop: '',
              truongDoiTac: '',
              quocGia: '',
              thoiGian: '',
            });
          }}
        >
          Nhập lại
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {student?.maSV ? 'Cập nhật' : 'Lưu'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StudentForm;