import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { danhMucDoanService } from '../services/danhMucDoanService';

const DanhMucDoanForm = ({ doan, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false); // Thêm state để theo dõi thay đổi
  const [initialFormValues, setInitialFormValues] = useState({}); // Lưu giá trị ban đầu của form

  useEffect(() => {
    if (doan) {
      const thoiGianBatDau = doan.thoiGianBatDau
        ? new Date(doan.thoiGianBatDau).toISOString().slice(0, 16)
        : undefined;
      const thoiGianKetThuc = doan.thoiGianKetThuc
        ? new Date(doan.thoiGianKetThuc).toISOString().slice(0, 16)
        : undefined;
      const DOB = doan.DOB ? new Date(doan.DOB).toISOString().split('T')[0] : undefined;

      // Lưu giá trị ban đầu để so sánh
      const initialValues = {
        tenDoan: doan.tenDoan || '',
        nguoiDaiDien: doan.nguoiDaiDien || '',
        hoChieu: doan.hoChieu || '',
        quocTich: doan.quocTich || '',
        DOB: DOB || undefined,
        thoiGianBatDau: thoiGianBatDau || undefined,
        thoiGianKetThuc: thoiGianKetThuc || undefined,
        noiDung: doan.noiDung || '',
        ghiChu: doan.ghiChu || '',
      };
      setInitialFormValues(initialValues);

      form.setFieldsValue({
        tenDoan: doan.tenDoan,
        nguoiDaiDien: doan.nguoiDaiDien,
        hoChieu: doan.hoChieu,
        quocTich: doan.quocTich,
        DOB,
        thoiGianBatDau,
        thoiGianKetThuc,
        noiDung: doan.noiDung,
        ghiChu: doan.ghiChu,
      });

      setIsFormChanged(false); // Ban đầu không có thay đổi
    } else {
      form.resetFields();
      form.setFieldsValue({
        tenDoan: '',
        nguoiDaiDien: '',
        hoChieu: '',
        quocTich: '',
        DOB: undefined,
        thoiGianBatDau: undefined,
        thoiGianKetThuc: undefined,
        noiDung: '',
        ghiChu: '',
      });
      setInitialFormValues({});
      setIsFormChanged(false);
    }
  }, [doan, form]);

  // Hàm kiểm tra thay đổi của form
  const handleFieldsChange = () => {
    if (!doan) return; // Chỉ kiểm tra khi chỉnh sửa

    const currentValues = form.getFieldsValue();
    const hasFormChanged = Object.keys(initialFormValues).some((key) => {
      const initialValue = initialFormValues[key];
      const currentValue = currentValues[key];
      // So sánh các giá trị, xử lý trường hợp undefined
      if (key === 'thoiGianBatDau' || key === 'thoiGianKetThuc' || key === 'DOB') {
        return initialValue !== currentValue;
      }
      return (initialValue || '') !== (currentValue || '');
    });

    setIsFormChanged(hasFormChanged);
  };

  const validateTimeRange = (_, value) => {
    const thoiGianBatDau = form.getFieldValue('thoiGianBatDau');
    const thoiGianKetThuc = value;

    if (thoiGianBatDau && thoiGianKetThuc) {
      const start = new Date(thoiGianBatDau);
      const end = new Date(thoiGianKetThuc);
      if (end < start) {
        return Promise.reject(new Error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu'));
      }
    }
    return Promise.resolve();
  };

  const validateDOB = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập ngày sinh'));
    }
    const dob = new Date(value);
    const today = new Date();
    if (dob > today) {
      return Promise.reject(new Error('Ngày sinh không được là ngày trong tương lai'));
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Chuẩn hóa định dạng DOB thành YYYY-MM-DD (không bao gồm giờ)
      const payload = {
        ...values,
        DOB: values.DOB ? values.DOB : null, // Giữ nguyên YYYY-MM-DD
        thoiGianBatDau: values.thoiGianBatDau ? new Date(values.thoiGianBatDau).toISOString() : null,
        thoiGianKetThuc: values.thoiGianKetThuc ? new Date(values.thoiGianKetThuc).toISOString() : null,
      };

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
        DOB: undefined,
        thoiGianBatDau: undefined,
        thoiGianKetThuc: undefined,
        noiDung: '',
        ghiChu: '',
      });
      setIsFormChanged(false);
      setInitialFormValues({});

      onSuccess();
    } catch (error) {
      console.error('Error saving danh muc doan:', error);
      if (error.response?.status === 400 && error.response.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('Hộ chiếu đã tồn tại')) {
          form.setFields([{ name: 'hoChieu', errors: ['Hộ chiếu đã tồn tại, vui lòng nhập khác'] }]);
        } else if (msg.includes('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu')) {
          form.setFields([
            { name: 'thoiGianKetThuc', errors: ['Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu'] },
          ]);
        } else if (msg.includes('Ngày sinh không hợp lệ')) {
          form.setFields([
            { name: 'DOB', errors: ['Ngày sinh không hợp lệ, vui lòng kiểm tra lại'] },
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
      validateTrigger={['onFinish']}
      validateOnMount={false}
      className="grid grid-cols-2 gap-4"
      onValuesChange={handleFieldsChange} // Theo dõi thay đổi của form
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
        rules={[{ required: true, message: 'Vui lòng nhập hộ chiếu' }]}
      >
        <Input />
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
        rules={[
          { required: true, message: 'Vui lòng nhập ngày sinh' },
          { validator: validateDOB },
        ]}
      >
        <Input type="date" />
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
        rules={[
          { required: true, message: 'Vui lòng nhập thời gian kết thúc' },
          { validator: validateTimeRange },
        ]}
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
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={doan ? !isFormChanged : false} // Disable nút "Cập nhật" nếu không có thay đổi
        >
          {doan?._id ? 'Cập nhật' : 'Lưu'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DanhMucDoanForm;