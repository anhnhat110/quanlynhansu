import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Upload } from "antd";
import { chuyenGiaService } from "../services/chuyenGiaService";
import { v4 as uuidv4 } from "uuid";
import { PlusOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";

const { Option } = Select;

const ChuyenGiaForm = ({ chuyengia, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [truongDonViOptions, setTruongDonViOptions] = useState([]);
  const [customChucDanh, setCustomChucDanh] = useState("");
  const [customQuocGia, setCustomQuocGia] = useState("");
  const [customTruongDonVi, setCustomTruongDonVi] = useState("");
  const [fileList, setFileList] = useState([]);
  const [hoChieuBase64, setHoChieuBase64] = useState("");
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({});
  const [initialHoChieuBase64, setInitialHoChieuBase64] = useState("");

  // Định nghĩa tĩnh quocGiaOptions và chucDanhOptions
  const quocGiaOptions = ["Ý", "Việt Nam", "Đức", "Canada", "Anh"];
  const chucDanhOptions = ["PGS", "GS", "TS", "Th.S", "Giám Đốc", "Không"];

  const generateMaCG = () => "CG-" + uuidv4().slice(0, 4).toUpperCase();

  useEffect(() => {
    const fetchChuyenGias = async () => {
      try {
        const res = await chuyenGiaService.getAllChuyenGia();
        const chuyenGias = res?.data?.chuyenGias || [];
        const getUnique = (key) =>
          Array.from(new Set(chuyenGias.map((cg) => cg[key]).filter(Boolean)));
        setTruongDonViOptions(getUnique("truongDonVi"));
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
        message.error("Không thể tải danh sách dữ liệu từ chuyên gia");
      }
    };
    fetchChuyenGias();
  }, []);

  useEffect(() => {
    if (chuyengia) {
      const initialValues = {
        maCG: chuyengia.maCG || "",
        hoVaTen: chuyengia.hoVaTen || "",
        email: chuyengia.email || "",
        gioiTinh: chuyengia.gioiTinh || "",
        quocGia: chuyengia.quocGia || "",
        truongDonVi: chuyengia.truongDonVi || "",
        chucDanh: chuyengia.chucDanh || "",
        chucVu: chuyengia.chucVu || "",
        chuyenNganh: chuyengia.chuyenNganh || "",
        hoChieu: chuyengia.hoChieu || "",
        ghiChu: chuyengia.ghiChu || "",
      };
      setInitialFormValues(initialValues);
      setInitialHoChieuBase64(chuyengia.anhHoChieu || "");

      form.setFieldsValue(chuyengia);

      // Xử lý giá trị tùy chỉnh cho quocGia
      if (chuyengia.quocGia && !quocGiaOptions.includes(chuyengia.quocGia)) {
        setCustomQuocGia(chuyengia.quocGia);
      } else {
        setCustomQuocGia("");
      }

      // Xử lý giá trị tùy chỉnh cho chucDanh
      if (chuyengia.chucDanh && !chucDanhOptions.includes(chuyengia.chucDanh)) {
        setCustomChucDanh(chuyengia.chucDanh);
      } else {
        setCustomChucDanh("");
      }

      // Xử lý giá trị tùy chỉnh cho truongDonVi
      if (
        chuyengia.truongDonVi &&
        !truongDonViOptions.includes(chuyengia.truongDonVi)
      ) {
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
      } else {
        setFileList([]);
        setHoChieuBase64("");
      }
      setIsFormChanged(false);
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
      setInitialFormValues({});
      setInitialHoChieuBase64("");
      setIsFormChanged(false);
    }
  }, [chuyengia, form]);

  const handleFieldsChange = () => {
    if (!chuyengia) return;

    const currentValues = form.getFieldsValue();
    const hasFormChanged = Object.keys(initialFormValues).some(
      (key) => currentValues[key] !== initialFormValues[key]
    );
    const hasImageChanged = hoChieuBase64 !== initialHoChieuBase64;

    setIsFormChanged(hasFormChanged || hasImageChanged);
  };

  const handleSelectChange = (field, value) => {
    if (field === "chucDanh") {
      if (value === "Khác") {
        setCustomChucDanh("");
        form.setFieldValue("chucDanh", "");
      } else {
        setCustomChucDanh("");
        form.setFieldValue("chucDanh", value);
      }
    } else if (field === "quocGia") {
      if (value === "Khác") {
        setCustomQuocGia("");
        form.setFieldValue("quocGia", "");
      } else {
        setCustomQuocGia("");
        form.setFieldValue("quocGia", value);
      }
    } else if (field === "truongDonVi") {
      if (value === "Khác") {
        setCustomTruongDonVi("");
        form.setFieldValue("truongDonVi", "");
      } else {
        setCustomTruongDonVi("");
        form.setFieldValue("truongDonVi", value);
      }
    }
    handleFieldsChange();
  };

  const handleChucDanhSearch = (value) => {
    if (value) {
      setCustomChucDanh(value);
      form.setFieldValue("chucDanh", value);
    }
    handleFieldsChange();
  };

  const handleQuocGiaSearch = (value) => {
    if (value) {
      setCustomQuocGia(value);
      form.setFieldValue("quocGia", value);
    }
    handleFieldsChange();
  };

  const handleTruongDonViSearch = (value) => {
    if (value) {
      setCustomTruongDonVi(value);
      form.setFieldValue("truongDonVi", value);
    }
    handleFieldsChange();
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
          handleFieldsChange();
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
      handleFieldsChange();
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
      setIsFormChanged(false);
      setInitialFormValues({});
      setInitialHoChieuBase64("");

      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi lưu chuyên gia:", error);
      if (error.response?.status === 400 && error.response.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes("Email đã tồn tại")) {
          form.setFields([
            { name: "email", errors: ["Email đã tồn tại, vui lòng nhập khác"] },
          ]);
        } else if (msg.includes("Hộ chiếu đã tồn tại")) {
          form.setFields([
            {
              name: "hoChieu",
              errors: ["Hộ chiếu đã tồn tại, vui lòng nhập khác"],
            },
          ]);
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
      className="grid grid-cols-2 gap-1 "
      onValuesChange={handleFieldsChange}
      size="small"
    >
      <Form.Item
        label={<span style={{ fontSize: 13 }}>Mã chuyên gia</span>}
        name="maCG"
        style={{ marginBottom: "5px" }}
      >
        <Input disabled className="bg-gray-100" />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Họ và tên</span>}
        name="hoVaTen"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        style={{ marginBottom: "5px" }}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Email</span>}
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
        style={{ marginBottom: "5px" }}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Giới tính</span>}
        name="gioiTinh"
        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        style={{ marginBottom: "5px" }}
      >
        <Select placeholder="Chọn giới tính">
          <Option value="Nam">Nam</Option>
          <Option value="Nữ">Nữ</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Quốc gia</span>}
        name="quocGia"
        rules={[
          { required: true, message: "Vui lòng chọn hoặc nhập quốc gia" },
        ]}
        style={{ marginBottom: "5px" }}
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
        label={<span style={{ fontSize: 13 }}>Trường / Đơn vị</span>}
        name="truongDonVi"
        rules={[
          {
            required: true,
            message: "Vui lòng chọn hoặc nhập trường / đơn vị",
          },
        ]}
        style={{ marginBottom: "5px" }}
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
        label={<span style={{ fontSize: 13 }}>Hộ chiếu</span>}
        name="hoChieu"
        rules={[{ required: true, message: "Vui lòng nhập hộ chiếu" }]}
        style={{ marginBottom: "5px" }}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Ảnh hộ chiếu</span>}
        name="anhHoChieu"
        style={{ marginBottom: "5px" }}
      >
        <div>
          {hoChieuBase64 && (
            <img
              src={hoChieuBase64}
              alt="Ảnh hộ chiếu"
              style={{
                maxWidth: "100%",
                maxHeight: "150px",
                marginBottom: "5px",
              }}
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
              <div style={{ marginTop: 4 }}>Tải ảnh</div>
            </div>
          </Upload>
        </div>
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Chức danh</span>}
        name="chucDanh"
        rules={[
          { required: true, message: "Vui lòng chọn hoặc nhập chức danh" },
        ]}
        style={{ marginBottom: "5px" }}
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

      <Form.Item label={<span style={{ fontSize: 13 }}>Chức vụ</span>} name="chucVu" style={{ marginBottom: "5px" }}>
        <Input />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Chuyên ngành</span>}
        name="chuyenNganh"
        style={{ marginBottom: "5px" }}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontSize: 13 }}>Ghi chú</span>}
        name="ghiChu"
        className="col-span-2"
        style={{ marginBottom: "5px" }}
      >
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item className="col-span-2 flex justify-between">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={chuyengia ? !isFormChanged : false}
          size=""
        >
          {chuyengia?.maCG ? "Cập nhật" : "Lưu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChuyenGiaForm;
