import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import dayjs from 'dayjs';
import { sinhVienService } from '../services/sinhVienService';

const { Option } = Select;

const StudentForm = ({ student, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [truongDoiTacOptions, setTruongDoiTacOptions] = useState([]);
  const [quocGiaOptions, setQuocGiaOptions] = useState([]);
  const [customTruongDoiTac, setCustomTruongDoiTac] = useState('');
  const [customQuocGia, setCustomQuocGia] = useState('');
  const [searchTruongDoiTac, setSearchTruongDoiTac] = useState('');
  const [searchQuocGia, setSearchQuocGia] = useState('');

  const hinhThucOptions = ['Trao đổi', 'Chuyển tiếp'];
  const capBacOptions = ['Đại học', 'Sau đại học'];

  const initialValues = {
    maSV: '',
    hoVaTen: '',
    hinhThuc: '',
    capBac: '',
    chuyenNganh: '',
    lop: '',
    truongDoiTac: '',
    quocGia: '',
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
  };

  // Fetch truongDoiTac and quocGia options from SinhVien
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [truongRes, quocGiaRes] = await Promise.all([
          sinhVienService.getTruongDoiTacs(),
          sinhVienService.getQuocGias(),
        ]);
        const truongDoiTacs = truongRes?.data?.sinhViens || [];
        const quocGias = quocGiaRes?.data?.sinhViens || [];
        const getUnique = (data, key) =>
          Array.from(new Set(data.map((item) => item[key]).filter(Boolean)));
        setTruongDoiTacOptions(getUnique(truongDoiTacs, 'truongDoiTac'));
        setQuocGiaOptions(getUnique(quocGias, 'quocGia'));
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sinh viên:', error);
        message.error(
          error.response?.status === 404
            ? 'Không tìm thấy dữ liệu sinh viên'
            : 'Không thể tải danh sách trường đối tác và quốc gia'
        );
      }
    };
    fetchOptions();
  }, []);

  // Populate form and set custom values
  useEffect(() => {
    if (student) {
      // Edit mode: Populate form with student data
      const thoiGianBatDau = student.thoiGianBatDau
        ? dayjs(student.thoiGianBatDau).format('YYYY-MM-DDTHH:mm')
        : '';
      const thoiGianKetThuc = student.thoiGianKetThuc
        ? dayjs(student.thoiGianKetThuc).format('YYYY-MM-DDTHH:mm')
        : '';

      form.setFieldsValue({
        maSV: student.maSV,
        hoVaTen: student.hoVaTen,
        hinhThuc: student.hinhThuc,
        capBac: student.capBac,
        chuyenNganh: student.chuyenNganh,
        lop: student.lop,
        truongDoiTac: student.truongDoiTac,
        quocGia: student.quocGia,
        thoiGianBatDau,
        thoiGianKetThuc,
      });
    } else {
      // Create mode: Reset form
      form.resetFields();
      setCustomTruongDoiTac('');
      setCustomQuocGia('');
      setSearchTruongDoiTac('');
      setSearchQuocGia('');
    }
  }, [student, form]);

  // Set custom values after options are loaded
  useEffect(() => {
    if (student) {
      setCustomTruongDoiTac(
        student.truongDoiTac && !truongDoiTacOptions.includes(student.truongDoiTac)
          ? student.truongDoiTac
          : ''
      );
      setCustomQuocGia(
        student.quocGia && !quocGiaOptions.includes(student.quocGia) ? student.quocGia : ''
      );
    }
  }, [student, truongDoiTacOptions, quocGiaOptions]);

  // Handle Select changes
  const handleSelectChange = (field, value) => {
    if (field === 'truongDoiTac') {
      if (value === 'Khác') {
        form.setFieldValue('truongDoiTac', searchTruongDoiTac || '');
        setCustomTruongDoiTac(searchTruongDoiTac || '');
      } else {
        form.setFieldValue('truongDoiTac', value);
        setCustomTruongDoiTac('');
      }
    } else if (field === 'quocGia') {
      if (value === 'Khác') {
        form.setFieldValue('quocGia', searchQuocGia || '');
        setCustomQuocGia(searchQuocGia || '');
      } else {
        form.setFieldValue('quocGia', value);
        setCustomQuocGia('');
      }
    }
  };

  // Handle search input
  const handleTruongDoiTacSearch = (value) => {
    setSearchTruongDoiTac(value);
    if (
      form.getFieldValue('truongDoiTac') === searchTruongDoiTac ||
      form.getFieldValue('truongDoiTac') === 'Khác'
    ) {
      form.setFieldValue('truongDoiTac', value);
      setCustomTruongDoiTac(value);
    }
  };

  const handleQuocGiaSearch = (value) => {
    setSearchQuocGia(value);
    if (
      form.getFieldValue('quocGia') === searchQuocGia ||
      form.getFieldValue('quocGia') === 'Khác'
    ) {
      form.setFieldValue('quocGia', value);
      setCustomQuocGia(value);
    }
  };

  // Custom filter function for Select
  const filterOption = (input, option) => {
    if (option.value === 'Khác') return true; // Always show "Khác"
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Convert dates to ISO format
      const payload = {
        ...values,
        thoiGianBatDau: values.thoiGianBatDau
          ? new Date(values.thoiGianBatDau).toISOString()
          : undefined,
        thoiGianKetThuc: values.thoiGianKetThuc
          ? new Date(values.thoiGianKetThuc).toISOString()
          : undefined,
      };

      if (student?._id) {
        const updatedValues = { ...payload };
        delete updatedValues._id;
        await sinhVienService.updateSinhVien(student._id, updatedValues);
        message.success('Cập nhật sinh viên thành công');
      } else {
        await sinhVienService.createSinhVien(payload);
        message.success('Thêm sinh viên thành công');
      }

      // Reset form
      form.resetFields();
      setCustomTruongDoiTac('');
      setCustomQuocGia('');
      setSearchTruongDoiTac('');
      setSearchQuocGia('');
      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
if (error.response?.status === 400 && error.response.data?.message) {
  const msg = error.response.data.message;

  if (msg.includes('Mã sinh viên đã tồn tại')) {
    form.setFields([{ name: 'maSV', errors: ['Mã sinh viên đã tồn tại, vui lòng nhập mã khác'] }]);
  } else if (msg.includes('Mã sinh viên phải đúng 12 ký tự')) {
    form.setFields([{ name: 'maSV', errors: ['Mã sinh viên phải đúng 12 ký tự'] }]);
    
  }
  else if (
    msg.includes("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu")
  ) {
    form.setFields([
      {
        name: "thoiGianKetThuc",
        errors: ["Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"],
      },
    ]);
  }
   else {
    message.error(msg || 'Lỗi server khi lưu sinh viên');
  }

} else {
  message.error(error.message || 'Có lỗi xảy ra khi lưu sinh viên');
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
      initialValues={initialValues}
      className="grid grid-cols-2 gap-4"
    >
      <Form.Item
        label="Mã sinh viên"
        name="maSV"
        className="col-span-1"
        rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên' }]}
      >
        <Input />
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
        rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập trường đối tác' }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange('truongDoiTac', value)}
          onSearch={handleTruongDoiTacSearch}
          placeholder="Chọn hoặc nhập trường đối tác"
          filterOption={filterOption}
        >
          {truongDoiTacOptions.map((item, idx) => (
            <Option key={idx} value={item}>
              {item}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Quốc gia"
        name="quocGia"
        rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập quốc gia' }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange('quocGia', value)}
          onSearch={handleQuocGiaSearch}
          placeholder="Chọn hoặc nhập quốc gia"
          filterOption={filterOption}
        >
          {quocGiaOptions.map((item, idx) => (
            <Option key={idx} value={item}>
              {item}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
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

      <Form.Item className="col-span-2 flex justify-between">
        <Button
          type="default"
          htmlType="button"
          onClick={() => {
            form.resetFields();
            setCustomTruongDoiTac('');
            setCustomQuocGia('');
            setSearchTruongDoiTac('');
            setSearchQuocGia('');
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