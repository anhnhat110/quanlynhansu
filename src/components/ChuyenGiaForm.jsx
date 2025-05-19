import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Upload } from "antd";
import { chuyenGiaService } from "../services/chuyenGiaService";
import { v4 as uuidv4 } from "uuid";
import { PlusOutlined } from "@ant-design/icons";
import imageCompression from 'browser-image-compression';

const { Option } = Select;

const ChuyenGiaForm = ({ chuyengia, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [truongDonViOptions, setTruongDonViOptions] = useState([]);
  const [chucDanhOptions, setChucDanhOptions] = useState([]);
  const [quocGiaOptions, setQuocGiaOptions] = useState([]);
  const [customChucDanh, setCustomChucDanh] = useState("");
  const [customQuocGia, setCustomQuocGia] = useState("");
  const [customTruongDonVi, setCustomTruongDonVi] = useState("");
  const [searchChucDanh, setSearchChucDanh] = useState("");
  const [searchQuocGia, setSearchQuocGia] = useState("");
  const [searchTruongDonVi, setSearchTruongDonVi] = useState("");
  const [fileList, setFileList] = useState([]);
  const [hoChieuBase64, setHoChieuBase64] = useState("");

  const generateMaCG = () => "CG-" + uuidv4().slice(0, 4).toUpperCase();

  useEffect(() => {
    const fetchChuyenGias = async () => {
      try {
        const res = await chuyenGiaService.getAllChuyenGia();
        const chuyenGias = res?.data?.chuyenGias || [];

        const getUnique = (key) =>
          Array.from(new Set(chuyenGias.map((cg) => cg[key]).filter(Boolean)));

        setTruongDonViOptions(getUnique("truongDonVi"));
        setChucDanhOptions(getUnique("chucDanh"));
        setQuocGiaOptions(getUnique("quocGia"));
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
        message.error("Không thể tải danh sách dữ liệu từ chuyên gia");
      }
    };

    fetchChuyenGias();
  }, []);

  useEffect(() => {
    if (chuyengia) {
      form.setFieldsValue(chuyengia);
      if (chuyengia.chucDanh && !chucDanhOptions.includes(chuyengia.chucDanh)) {
        setCustomChucDanh(chuyengia.chucDanh);
      } else {
        setCustomChucDanh("");
      }
      if (chuyengia.quocGia && !quocGiaOptions.includes(chuyengia.quocGia)) {
        setCustomQuocGia(chuyengia.quocGia);
      } else {
        setCustomQuocGia("");
      }
      if (chuyengia.truongDonVi && !truongDonViOptions.includes(chuyengia.truongDonVi)) {
        setCustomTruongDonVi(chuyengia.truongDonVi);
      } else {
        setCustomTruongDonVi("");
      }
      if (chuyengia.anhHoChieu) {
        setHoChieuBase64(chuyengia.anhHoChieu);
        setFileList([
          {
            uid: "-1",
            status: "done",
            url: chuyengia.anhHoChieu,
          },
        ]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        maCG: generateMaCG(),
        hoVaTen: "",
        email: "",
        gioiTinh: "",
        quocGia: "",
        truongDonVi: "",
        chucDanh: "",
        chucVu: "",
        chuyenNganh: "",
        ghiChu: "",
      });
      setFileList([]);
      setHoChieuBase64("");
      setCustomChucDanh("");
      setCustomQuocGia("");
      setCustomTruongDonVi("");
      setSearchChucDanh("");
      setSearchQuocGia("");
      setSearchTruongDonVi("");
    }
  }, [chuyengia, form, chucDanhOptions, quocGiaOptions, truongDonViOptions]);

  // Handle Select changes (aligned with StudentForm.jsx)
  const handleSelectChange = (field, value) => {
    if (field === "chucDanh") {
      if (value === "Khác") {
        form.setFieldValue("chucDanh", searchChucDanh || "");
        setCustomChucDanh(searchChucDanh || "");
      } else {
        form.setFieldValue("chucDanh", value);
        setCustomChucDanh("");
      }
    } else if (field === "quocGia") {
      if (value === "Khác") {
        form.setFieldValue("quocGia", searchQuocGia || "");
        setCustomQuocGia(searchQuocGia || "");
      } else {
        form.setFieldValue("quocGia", value);
        setCustomQuocGia("");
      }
    } else if (field === "truongDonVi") {
      if (value === "Khác") {
        form.setFieldValue("truongDonVi", searchTruongDonVi || "");
        setCustomTruongDonVi(searchTruongDonVi || "");
      } else {
        form.setFieldValue("truongDonVi", value);
        setCustomTruongDonVi("");
      }
    }
  };

  // Handle search input (aligned with StudentForm.jsx)
  const handleChucDanhSearch = (value) => {
    setSearchChucDanh(value);
    if (form.getFieldValue("chucDanh") === searchChucDanh || 
        form.getFieldValue("chucDanh") === "Khác") {
      form.setFieldValue("chucDanh", value);
      setCustomChucDanh(value);
    }
  };

  const handleQuocGiaSearch = (value) => {
    setSearchQuocGia(value);
    if (form.getFieldValue("quocGia") === searchQuocGia || 
        form.getFieldValue("quocGia") === "Khác") {
      form.setFieldValue("quocGia", value);
      setCustomQuocGia(value);
    }
  };

  const handleTruongDonViSearch = (value) => {
    setSearchTruongDonVi(value);
    if (form.getFieldValue("truongDonVi") === searchTruongDonVi || 
        form.getFieldValue("truongDonVi") === "Khác") {
      form.setFieldValue("truongDonVi", value);
      setCustomTruongDonVi(value);
    }
  };

  // Custom filter function for Select (same as StudentForm.jsx)
  const filterOption = (input, option) => {
    if (option.value === "Khác") return true; // Always show "Khác"
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  const handleUploadChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          setHoChieuBase64(base64String);
          setFileList([
            {
              uid: "-1",
              name: file.name,
              status: "done",
              url: base64String,
            },
          ]);
        };
        reader.onerror = () => {
          message.error("Không thể đọc file ảnh");
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Lỗi khi nén ảnh:", error);
        message.error("Không thể nén ảnh");
      }
    } else {
      setHoChieuBase64("");
      setFileList([]);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (!values.maCG) {
        values.maCG = generateMaCG();
      }

      const data = {
        ...values,
        anhHoChieu: hoChieuBase64,
      };

      if (chuyengia?._id) {
        if (!chuyengia._id) {
          throw new Error("Không tìm thấy ID của chuyên gia để cập nhật");
        }
        const updatedValues = { ...data };
        delete updatedValues._id;
        await chuyenGiaService.updateChuyenGia(chuyengia._id, updatedValues);
        message.success("Cập nhật chuyên gia thành công");
      } else {
        await chuyenGiaService.createChuyenGia(data);
        message.success("Thêm mới chuyên gia thành công");
      }

      // Reset form
      form.resetFields();
      form.setFieldsValue({
        maCG: generateMaCG(),
        hoVaTen: "",
        email: "",
        gioiTinh: "",
        quocGia: "",
        truongDonVi: "",
        chucDanh: "",
        chucVu: "",
        chuyenNganh: "",
        ghiChu: "",
      });
      setFileList([]);
      setHoChieuBase64("");
      setCustomChucDanh("");
      setCustomQuocGia("");
      setCustomTruongDonVi("");
      setSearchChucDanh("");
      setSearchQuocGia("");
      setSearchTruongDonVi("");

      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi lưu chuyên gia:", error);
      if (error.response?.status === 400 && error.response.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('Email đã tồn tại')) {
          form.setFields([{ name: 'email', errors: ['Email đã tồn tại, vui lòng nhập khác'] }]);
        } else if (msg.includes('Hộ chiếu đã tồn tại')) {
          form.setFields([{ name: 'hoChieu', errors: ['Hộ chiếu đã tồn tại, vui lòng nhập khác'] }]);
        } else {
          message.error(msg || "Lỗi server khi lưu chuyên gia");
        }
      } else {
        message.error(error.message || "Có lỗi xảy ra khi lưu chuyên gia");
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
      initialValues={chuyengia || {}}
      className="grid grid-cols-2 gap-4"
    >
      <Form.Item label="Mã chuyên gia" name="maCG" className="col-span-1">
        <Input disabled className="bg-gray-100" />
      </Form.Item>

      <Form.Item
        label="Họ và tên"
        name="hoVaTen"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Giới tính"
        name="gioiTinh"
        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
      >
        <Select placeholder="Chọn giới tính">
          <Option value="Nam">Nam</Option>
          <Option value="Nữ">Nữ</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Quốc gia"
        name="quocGia"
        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập quốc gia" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("quocGia", value)}
          onSearch={handleQuocGiaSearch}
          placeholder="Chọn hoặc nhập quốc gia"
          filterOption={filterOption}
          value={customQuocGia || form.getFieldValue("quocGia") || undefined}
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
        label="Trường / Đơn vị"
        name="truongDonVi"
        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập trường / đơn vị" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("truongDonVi", value)}
          onSearch={handleTruongDonViSearch}
          placeholder="Chọn hoặc nhập trường / đơn vị"
          filterOption={filterOption}
          value={customTruongDonVi || form.getFieldValue("truongDonVi") || undefined}
        >
          {truongDonViOptions.map((ten, idx) => (
            <Option key={idx} value={ten}>
              {ten}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Hộ chiếu"
        name="hoChieu"
        rules={[{ required: true, message: "Vui lòng nhập hộ chiếu" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Ảnh hộ chiếu"
        name="anhHoChieu"
      >
        <div>
          {hoChieuBase64 && (
            <img
              src={hoChieuBase64}
              alt="Ảnh hộ chiếu"
              style={{ maxWidth: "100%", maxHeight: "200px", marginBottom: "10px" }}
            />
          )}
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Tải ảnh</div>
            </div>
          </Upload>
        </div>
      </Form.Item>

      <Form.Item
        label="Chức danh"
        name="chucDanh"
        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập chức danh" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("chucDanh", value)}
          onSearch={handleChucDanhSearch}
          placeholder="Chọn hoặc nhập chức danh"
          filterOption={filterOption}
          value={customChucDanh || form.getFieldValue("chucDanh") || undefined}
        >
          {chucDanhOptions.map((item, idx) => (
            <Option key={idx} value={item}>
              {item}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Chức vụ"
        name="chucVu"
      >
        <Input />
      </Form.Item>

      <Form.Item label="Chuyên ngành" name="chuyenNganh">
        <Input />
      </Form.Item>

      <Form.Item label="Ghi chú" name="ghiChu" className="col-span-2">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item className="col-span-2 flex justify-between">
        <Button type="primary" htmlType="submit" loading={loading}>
          {chuyengia?.maCG ? "Cập nhật" : "Lưu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChuyenGiaForm;