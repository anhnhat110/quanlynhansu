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
  const [fileList, setFileList] = useState([]);
  const [hoChieuBase64, setHoChieuBase64] = useState("");

  const generateMaCG = () => "CG-" + uuidv4().slice(0, 8).toUpperCase();

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
      }
      if (chuyengia.quocGia && !quocGiaOptions.includes(chuyengia.quocGia)) {
        setCustomQuocGia(chuyengia.quocGia);
      }
      if (chuyengia.truongDonVi && !truongDonViOptions.includes(chuyengia.truongDonVi)) {
        setCustomTruongDonVi(chuyengia.truongDonVi);
      }
      if (chuyengia.hoChieu) {
        setHoChieuBase64(chuyengia.hoChieu);
        setFileList([
          {
            uid: "-1",
            name: "passport.jpg",
            status: "done",
            url: chuyengia.hoChieu,
          },
        ]);
      }
    } else {
      form.resetFields();
      form.setFieldValue("maCG", generateMaCG());
      setFileList([]);
      setHoChieuBase64("");
    }
  }, [chuyengia, form, chucDanhOptions, quocGiaOptions, truongDonViOptions]);

  const handleSelectChange = (field, value) => {
    if (field === "chucDanh") {
      if (value && !chucDanhOptions.includes(value) && value !== "Khác") {
        setCustomChucDanh(value);
        form.setFieldValue("chucDanh", value);
      } else if (value === "Khác") {
        setCustomChucDanh("");
        form.setFieldValue("chucDanh", "");
      } else {
        setCustomChucDanh("");
        form.setFieldValue("chucDanh", value);
      }
    } else if (field === "quocGia") {
      if (value && !quocGiaOptions.includes(value) && value !== "Khác") {
        setCustomQuocGia(value);
        form.setFieldValue("quocGia", value);
      } else if (value === "Khác") {
        setCustomQuocGia("");
        form.setFieldValue("quocGia", "");
      } else {
        setCustomQuocGia("");
        form.setFieldValue("quocGia", value);
      }
    } else if (field === "truongDonVi") {
      if (value && !truongDonViOptions.includes(value) && value !== "Khác") {
        setCustomTruongDonVi(value);
        form.setFieldValue("truongDonVi", value);
      } else if (value === "Khác") {
        setCustomTruongDonVi("");
        form.setFieldValue("truongDonVi", "");
      } else {
        setCustomTruongDonVi("");
        form.setFieldValue("truongDonVi", value);
      }
    }
  };

  const handleChucDanhSearch = (value) => {
    if (value) {
      setCustomChucDanh(value);
      form.setFieldValue("chucDanh", value);
    }
  };

  const handleQuocGiaSearch = (value) => {
    if (value) {
      setCustomQuocGia(value);
      form.setFieldValue("quocGia", value);
    }
  };

  const handleTruongDonViSearch = (value) => {
    if (value) {
      setCustomTruongDonVi(value);
      form.setFieldValue("truongDonVi", value);
    }
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
        hoChieu: hoChieuBase64,
      };

      if (!data.hoChieu) {
        throw new Error("Vui lòng tải lên ảnh hộ chiếu");
      }

      // Log the payload for debugging
      console.log("Submitting data:", data);
      console.log("hoChieuBase64 size (bytes):", hoChieuBase64.length);

      if (chuyengia?._id) {
        // Ensure _id exists for update
        if (!chuyengia._id) {
          throw new Error("Không tìm thấy ID của chuyên gia để cập nhật");
        }

        const updatedValues = { ...data };
        delete updatedValues._id; // Remove _id from the payload
        console.log("Updating specialist with ID:", chuyengia._id);
        console.log("Update payload:", updatedValues);

        const response = await chuyenGiaService.updateChuyenGia(chuyengia._id, updatedValues);
        console.log("Update response:", response);
        message.success("Cập nhật chuyên gia thành công");
      } else {
        console.log("Creating new specialist");
        const response = await chuyenGiaService.createChuyenGia(data);
        console.log("Create response:", response);
        message.success("Thêm mới chuyên gia thành công");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi lưu chuyên gia:", error);
      // Check if the error has a response from the server
      if (error.response) {
        console.error("Server response:", error.response.data);
        message.error(
          error.response.data.message || "Lỗi server khi lưu chuyên gia"
        );
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error("Có lỗi xảy ra khi lưu chuyên gia");
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
          filterOption={false}
          value={customQuocGia || undefined}
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
        label="Hộ chiếu"
        name="hoChieu"
        rules={[{ required: true, message: "Vui lòng tải lên ảnh hộ chiếu" }]}
      >
        <div>
          {hoChieuBase64 && (
            <img
              src={hoChieuBase64}
              alt="Hộ chiếu"
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
          filterOption={false}
          value={customTruongDonVi || undefined}
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
          filterOption={false}
          value={customChucDanh || undefined}
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
        rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
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
        <Button
          type="default"
          htmlType="button"
          onClick={() => form.resetFields()}
        >
          Hủy
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {chuyengia?.maCG ? "Cập nhật" : "Lưu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChuyenGiaForm;