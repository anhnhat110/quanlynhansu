import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { v4 as uuidv4 } from "uuid";

const { Option } = Select;

const EventForm = ({ event, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chuyenGiaOptions, setChuyenGiaOptions] = useState([]); // Contains { _id, hoVaTen }
  const [customMucDich, setCustomMucDich] = useState("");
  const [customChuyenGia, setCustomChuyenGia] = useState("");
  const [customThanhPhan, setCustomThanhPhan] = useState("");

  // Fixed options for mucDich and thanhPhan
  const mucDichOptions = [
    "Cập nhật kỹ năng",
    "Đào tạo chuyên môn",
    "Hội thảo chuyên đề",
  ];
  const thanhPhanOptions = [
    "Sinh viên",
    "Giảng viên",
    "Nhân viên",
  ];

  const generateMaSK = () => "SK-" + uuidv4().slice(0, 4).toUpperCase();

  // Fetch chuyenGiaOptions from the API and populate form after data is loaded
  useEffect(() => {
    const fetchChuyenGias = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chuyengias?fields=hoVaTen`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const chuyenGias = data?.data?.chuyenGias || [];
        setChuyenGiaOptions(chuyenGias); // Array of { _id, hoVaTen }
      } catch (error) {
        console.error("Lỗi khi load chuyên gia:", error);
        message.error("Không thể tải danh sách chuyên gia");
      }
    };
    fetchChuyenGias();
  }, []);

  // Populate form after chuyenGiaOptions is loaded
  useEffect(() => {
    if (chuyenGiaOptions.length === 0) return; // Wait for chuyenGiaOptions to load

    if (event) {
      // Edit mode: Populate form with event data
      form.setFieldsValue({
        maSK: event.maSK,
        chuyenGia: event.chuyenGia, // This will be the hoVaTen
        mucDich: event.mucDich,
        suKien: event.suKien,
        thoiGianBatDau: event.thoiGianBatDau,
        thoiGianKetThuc: event.thoiGianKetThuc,
        diaDiem: event.diaDiem,
        thanhPhan: event.thanhPhan,
        ghiChu: event.ghiChu,
        guides: event.guides?.[0] || undefined, // Set the _id from guides if exists
      });

      // Set custom values only if they don't match the options
      if (event.mucDich && !mucDichOptions.includes(event.mucDich)) {
        setCustomMucDich(event.mucDich);
      } else {
        setCustomMucDich(""); // Reset if it matches an option
      }

      if (event.chuyenGia && !chuyenGiaOptions.some((cg) => cg.hoVaTen === event.chuyenGia)) {
        setCustomChuyenGia(event.chuyenGia);
      } else {
        setCustomChuyenGia(""); // Reset if it matches an option
      }

      if (event.thanhPhan && !thanhPhanOptions.includes(event.thanhPhan)) {
        setCustomThanhPhan(event.thanhPhan);
      } else {
        setCustomThanhPhan(""); // Reset if it matches an option
      }
    } else {
      // Create mode: Reset form and generate new maSK
      form.resetFields();
      form.setFieldsValue({
        maSK: generateMaSK(),
        suKien: "",
        mucDich: "",
        chuyenGia: "",
        thanhPhan: "",
        diaDiem: "",
        thoiGianBatDau: "",
        thoiGianKetThuc: "",
        ghiChu: "",
      });
      setCustomMucDich("");
      setCustomChuyenGia("");
      setCustomThanhPhan("");
    }
  }, [event, form, chuyenGiaOptions, mucDichOptions, thanhPhanOptions]);

  const handleSelectChange = (field, value) => {
    if (field === "mucDich") {
      if (value && !mucDichOptions.includes(value) && value !== "Khác") {
        setCustomMucDich(value);
        form.setFieldValue("mucDich", value);
      } else if (value === "Khác") {
        setCustomMucDich("");
        form.setFieldValue("mucDich", "");
      } else {
        setCustomMucDich("");
        form.setFieldValue("mucDich", value);
      }
    } else if (field === "chuyenGia") {
      if (value && !chuyenGiaOptions.some((cg) => cg.hoVaTen === value) && value !== "Khác") {
        setCustomChuyenGia(value);
        form.setFieldValue("chuyenGia", value);
      } else if (value === "Khác") {
        setCustomChuyenGia("");
        form.setFieldValue("chuyenGia", "");
      } else {
        setCustomChuyenGia("");
        form.setFieldValue("chuyenGia", value);
      }
    } else if (field === "thanhPhan") {
      if (value && !thanhPhanOptions.includes(value) && value !== "Khác") {
        setCustomThanhPhan(value);
        form.setFieldValue("thanhPhan", value);
      } else if (value === "Khác") {
        setCustomThanhPhan("");
        form.setFieldValue("thanhPhan", "");
      } else {
        setCustomThanhPhan("");
        form.setFieldValue("thanhPhan", value);
      }
    }
  };

  const handleMucDichSearch = (value) => {
    if (value) {
      setCustomMucDich(value);
      form.setFieldValue("mucDich", value);
    }
  };

  const handleChuyenGiaSearch = (value) => {
    if (value) {
      setCustomChuyenGia(value);
      form.setFieldValue("chuyenGia", value);
    }
  };

  const handleThanhPhanSearch = (value) => {
    if (value) {
      setCustomThanhPhan(value);
      form.setFieldValue("thanhPhan", value);
    }
  };

  const onFinish = async (values) => {
    console.log("Submitted data:", values);
    try {
      setLoading(true);

      if (!values.maSK) {
        values.maSK = generateMaSK();
      }

      // Find the selected chuyenGia's _id based on hoVaTen
      const selectedChuyenGia = chuyenGiaOptions.find((cg) => cg.hoVaTen === values.chuyenGia);
      const guideId = selectedChuyenGia ? selectedChuyenGia._id : values.guides; // Fallback to guides if in edit mode

      const payload = {
        ...values,
        guides: guideId ? [guideId] : [], // Add guides as an array with the _id
      };

      if (event?._id) {
        const updatedValues = { ...payload };
        delete updatedValues._id;
        await fetch(`http://127.0.0.01:3005/api/v1/sukiens/${event._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedValues),
        });
        message.success("Cập nhật sự kiện thành công");
      } else {
        await fetch("http://127.0.0.01:3005/api/v1/sukiens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        message.success("Thêm mới sự kiện thành công");
      }

      // Reset form and custom states
      form.resetFields();
      form.setFieldsValue({
        maSK: generateMaSK(),
        suKien: "",
        mucDich: "",
        chuyenGia: "",
        thanhPhan: "",
        diaDiem: "",
        thoiGianBatDau: "",
        thoiGianKetThuc: "",
        ghiChu: "",
      });
      setCustomMucDich("");
      setCustomChuyenGia("");
      setCustomThanhPhan("");

      // Call onSuccess to notify parent
      onSuccess();
    } catch (error) {
      console.error("Error saving event:", error);
      message.error("Có lỗi xảy ra khi lưu sự kiện");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={event || {}}
      className="grid grid-cols-2 gap-4"
    >
      <Form.Item label="Mã sự kiện" name="maSK" className="col-span-1">
        <Input disabled className="bg-gray-100" />
      </Form.Item>

      <Form.Item
        label="Chuyên gia"
        name="chuyenGia"
        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập chuyên gia" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("chuyenGia", value)}
          onSearch={handleChuyenGiaSearch}
          placeholder="Chọn hoặc nhập chuyên gia"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {chuyenGiaOptions.map((item) => (
            <Option key={item._id} value={item.hoVaTen}>
              {item.hoVaTen}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Mục đích"
        name="mucDich"
        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập mục đích" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("mucDich", value)}
          onSearch={handleMucDichSearch}
          placeholder="Chọn hoặc nhập mục đích"
          filterOption={false}
          value={customMucDich || undefined}
        >
          {mucDichOptions.map((item, idx) => (
            <Option key={idx} value={item}>
              {item}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Sự kiện"
        name="suKien"
        rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Thời gian bắt đầu"
        name="thoiGianBatDau"
        rules={[{ required: true, message: "Vui lòng nhập thời gian bắt đầu" }]}
      >
        <Input type="datetime-local" />
      </Form.Item>

      <Form.Item
        label="Thời gian kết thúc"
        name="thoiGianKetThuc"
        rules={[{ required: true, message: "Vui lòng nhập thời gian kết thúc" }]}
      >
        <Input type="datetime-local" />
      </Form.Item>

      <Form.Item
        label="Địa điểm"
        name="diaDiem"
        rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Thành phần"
        name="thanhPhan"
        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập thành phần" }]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("thanhPhan", value)}
          onSearch={handleThanhPhanSearch}
          placeholder="Chọn hoặc nhập thành phần"
          filterOption={false}
          value={customThanhPhan || undefined}
        >
          {thanhPhanOptions.map((item, idx) => (
            <Option key={idx} value={item}>
              {item}
            </Option>
          ))}
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Ghi chú" name="ghiChu" className="col-span-2">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item className="col-span-2 flex justify-between">
        <Button
          type="default"
          htmlType="button"
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              maSK: generateMaSK(),
              suKien: "",
              mucDich: "",
              chuyenGia: "",
              thanhPhan: "",
              diaDiem: "",
              thoiGianBatDau: "",
              thoiGianKetThuc: "",
              ghiChu: "",
            });
            setCustomMucDich("");
            setCustomChuyenGia("");
            setCustomThanhPhan("");
          }}
        >
          Hủy
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {event?.maSK ? "Cập nhật" : "Lưu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EventForm;