  
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { danhMucDoanService } from '../services/danhMucDoanService';

const DanhMucDoanForm = ({ doan, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doan) {
      form.setFieldsValue({
        tenDoan: doan.tenDoan,
        nguoiDaiDien: doan.nguoiDaiDien,
        hoChieu: doan.hoChieu,
        quocTich: doan.quocTich,
        DOB: doan.DOB ? new Date(doan.DOB).toISOString().slice(0, 16) : '',
        thoiGianBatDau: doan.thoiGianBatDau ? new Date(doan.thoiGianBatDau).toISOString().slice(0, 16) : '',
        thoiGianKetThuc: doan.thoiGianKetThuc ? new Date(doan.thoiGianKetThuc).toISOString().slice(0, 16) : '',
        noiDung: doan.noiDung,
        ghiChu: doan.ghiChu,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        tenDoan: '',
        nguoiDaiDien: '',
        hoChieu: '',
        quocTich: '',
        DOB: '',
        thoiGianBatDau: '',
        thoiGianKetThuc: '',
        noiDung: '',
        ghiChu: '',
      });
    }
  }, [doan, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Client-side validation for hoChieu
      if (!/^[A-Za-z0-9]{8}$/.test(values.hoChieu)) {
        form.setFields([
          {
            name: 'hoChieu',
            errors: ['Hộ chiếu phải có đúng 8 ký tự chữ hoặc số'],
          },
        ]);
        setLoading(false);
        return;
      }

      const payload = { ...values };

      if (doan?._id) {
        const updatedValues = { ...payload };
        delete updatedValues._id;
        await danhMucDoanService.updateDanhMucDoan(doan._id, updatedValues);
        message.success('Cập nhật đoàn thành công');
      } else {
        await danhMucDoanService.createDanhMucDoan(payload);
        message.success('Thêm đoàn thành công');
      }

      form.resetFields();
      form.setFieldsValue({
        tenDoan: '',
        nguoiDaiDien: '',
        hoChieu: '',
        quocTich: '',
        DOB: '',
        thoiGianBatDau: '',
        thoiGianKetThuc: '',
        noiDung: '',
        ghiChu: '',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving danh muc doan:', error);
      if (error.response?.status === 400 && error.response.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('Hộ chiếu đã tồn tại')) {
          form.setFields([
            { name: 'hoChieu', errors: ['Hộ chiếu đã tồn tại, vui lòng nhập khác'] }
          ]);
        } else if (msg.includes('Hộ chiếu phải có đúng 8 ký tự')) {
          form.setFields([
            { name: 'hoChieu', errors: ['Hộ chiếu phải có đúng 8 ký tự chữ hoặc số'] }
          ]);
        } else if (msg.includes('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu')) {
          form.setFields([
            {
              name: 'thoiGianKetThuc',
              errors: ['Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu'],
            },
          ]);
        } else {
          message.error(msg || 'Lỗi server khi lưu đoàn');
        }
      } else {
        message.error(error.message || 'Có lỗi xảy ra khi lưu đoàn');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={doan || {}}
      className="grid grid-cols-2 gap-4"
    >
      <Form.Item
        label="Tên đoàn"
        name="tenDoan"
        rules={[{ required: true, message: 'Vui lòng nhập tên đoàn' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Người đại diện"
        name="nguoiDaiDien"
        rules={[{ required: true, message: 'Vui lòng nhập người đại diện' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Hộ chiếu"
        name="hoChieu"
        className="col-span-1"
        rules={[
          { required: true, message: 'Vui lòng nhập hộ chiếu' },
          {
            pattern: /^[A-Za-z0-9]{8}$/,
            message: 'Hộ chiếu phải có đúng 8 ký tự chữ hoặc số',
          }
        ]}
      >
        <Input maxLength={8} />
      </Form.Item>

      <Form.Item
        label="Quốc tịch"
        name="quocTich"
        rules={[{ required: true, message: 'Vui lòng nhập quốc tịch' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Ngày sinh"
        name="DOB"
        rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
      >
        <Input type="datetime-local" />
      </Form.Item>

      <Form.Item
        label="Thời gian bắt đầu"
        name="thoiGianBatDau"
        rules={[{ required: true, message: 'Vui lòng nhập thời gian bắt đầu' }]}
      >
        <Input type="datetime-local" />
      </Form.Item>

      <Form.Item
        label="Thời gian kết thúc"
        name="thoiGianKetThuc"
        rules={[{ required: true, message: 'Vui lòng nhập thời gian kết thúc' }]}
      >
        <Input type="datetime-local" />
      </Form.Item>

      <Form.Item
        label="Nội dung"
        name="noiDung"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Ghi chú" name="ghiChu">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item className="col-span-2 flex justify-between">
        <Button
          type="default"
          htmlType="button"
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              tenDoan: '',
              nguoiDaiDien: '',
              hoChieu: '',
              quocTich: '',
              DOB: '',
              thoiGianBatDau: '',
              thoiGianKetThuc: '',
              noiDung: '',
              ghiChu: '',
            });
          }}
        >
          Nhập lại
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {doan?._id ? 'Cập nhật' : 'Lưu'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DanhMucDoanForm;