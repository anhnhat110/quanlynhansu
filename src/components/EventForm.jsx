import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const { Option } = Select;

const EventForm = ({ event, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chuyenGiaOptions, setChuyenGiaOptions] = useState([]);
  const [customMucDich, setCustomMucDich] = useState("");
  const [customChuyenGia, setCustomChuyenGia] = useState("");
  const [customThanhPhan, setCustomThanhPhan] = useState("");
  const [isFormChanged, setIsFormChanged] = useState(false); // Thêm state để theo dõi thay đổi
  const [initialFormValues, setInitialFormValues] = useState({}); // Lưu giá trị ban đầu của form

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

  useEffect(() => {
    const fetchChuyenGias = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chuyengias?fields=hoVaTen`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch chuyenGias");
        const data = await res.json();
        const chuyenGias = data?.data?.chuyenGias || [];
        setChuyenGiaOptions(chuyenGias);
      } catch (error) {
        console.error("Lỗi khi load chuyên gia:", error);
        message.error("Không thể tải danh sách chuyên gia");
      }
    };
    fetchChuyenGias();
  }, []);

  useEffect(() => {
    if (chuyenGiaOptions.length === 0 && event) return;

    if (event) {
      const thoiGianBatDau = event.thoiGianBatDau
        ? dayjs(event.thoiGianBatDau).format("YYYY-MM-DDTHH:mm")
        : undefined;
      const thoiGianKetThuc = event.thoiGianKetThuc
        ? dayjs(event.thoiGianKetThuc).format("YYYY-MM-DDTHH:mm")
        : undefined;

      // Lưu giá trị ban đầu để so sánh
      const initialValues = {
        maSK: event.maSK || "",
        chuyenGia: event.chuyenGia || "",
        mucDich: event.mucDich || "",
        suKien: event.suKien || "",
        thoiGianBatDau: thoiGianBatDau || undefined,
        thoiGianKetThuc: thoiGianKetThuc || undefined,
        diaDiem: event.diaDiem || "",
        thanhPhan: event.thanhPhan || "",
        ghiChu: event.ghiChu || "",
        guides: event.guides?.[0] || undefined,
      };
      setInitialFormValues(initialValues);

      form.setFieldsValue({
        maSK: event.maSK,
        chuyenGia: event.chuyenGia,
        mucDich: event.mucDich,
        suKien: event.suKien,
        thoiGianBatDau,
        thoiGianKetThuc,
        diaDiem: event.diaDiem,
        thanhPhan: event.thanhPhan,
        ghiChu: event.ghiChu,
        guides: event.guides?.[0] || undefined,
      });

      if (event.mucDich && !mucDichOptions.includes(event.mucDich)) {
        setCustomMucDich(event.mucDich);
      } else {
        setCustomMucDich("");
      }

      if (event.chuyenGia && !chuyenGiaOptions.some((cg) => cg.hoVaTen === event.chuyenGia)) {
        setCustomChuyenGia(event.chuyenGia);
      } else {
        setCustomChuyenGia("");
      }

      if (event.thanhPhan && !thanhPhanOptions.includes(event.thanhPhan)) {
        setCustomThanhPhan(event.thanhPhan);
      } else {
        setCustomThanhPhan("");
      }

      setIsFormChanged(false); // Ban đầu không có thay đổi
    } else {
      form.resetFields();
      form.setFieldsValue({
        maSK: generateMaSK(),
        suKien: "",
        mucDich: "",
        chuyenGia: "",
        thanhPhan: "",
        diaDiem: "",
        thoiGianBatDau: undefined,
        thoiGianKetThuc: undefined,
        ghiChu: "",
      });
      setCustomMucDich("");
      setCustomChuyenGia("");
      setCustomThanhPhan("");
      setInitialFormValues({});
      setIsFormChanged(false);
    }
  }, [event, form, chuyenGiaOptions]);

  // Hàm kiểm tra thay đổi của form
  const handleFieldsChange = () => {
    if (!event) return; // Chỉ kiểm tra khi chỉnh sửa

    const currentValues = form.getFieldsValue();
    const hasFormChanged = Object.keys(initialFormValues).some((key) => {
      const initialValue = initialFormValues[key];
      const currentValue = currentValues[key];
      // So sánh các giá trị, xử lý trường hợp undefined
      if (key === "thoiGianBatDau" || key === "thoiGianKetThuc") {
        return initialValue !== currentValue;
      }
      return (initialValue || "") !== (currentValue || "");
    });

    setIsFormChanged(hasFormChanged);
  };

  const handleSelectChange = (field, value) => {
    if (field === "mucDich") {
      if (value === "Khác") {
        setCustomMucDich("");
        form.setFieldValue("mucDich", "");
      } else {
        setCustomMucDich("");
        form.setFieldValue("mucDich", value);
      }
    } else if (field === "chuyenGia") {
      if (value === "Khác") {
        setCustomChuyenGia("");
        form.setFieldValue("chuyenGia", "");
      } else {
        setCustomChuyenGia("");
        form.setFieldValue("chuyenGia", value);
      }
    } else if (field === "thanhPhan") {
      if (value === "Khác") {
        setCustomThanhPhan("");
        form.setFieldValue("thanhPhan", "");
      } else {
        setCustomThanhPhan("");
        form.setFieldValue("thanhPhan", value);
      }
    }
    handleFieldsChange(); // Kiểm tra thay đổi sau khi select
  };

  const handleMucDichSearch = (value) => {
    if (value) {
      setCustomMucDich(value);
      form.setFieldValue("mucDich", value);
    }
    handleFieldsChange();
  };

  const handleChuyenGiaSearch = (value) => {
    if (value) {
      setCustomChuyenGia(value);
      form.setFieldValue("chuyenGia", value);
    }
    handleFieldsChange();
  };

  const handleThanhPhanSearch = (value) => {
    if (value) {
      setCustomThanhPhan(value);
      form.setFieldValue("thanhPhan", value);
    }
    handleFieldsChange();
  };

  const validateTimeRange = (_, value) => {
    const thoiGianBatDau = form.getFieldValue("thoiGianBatDau");
    const thoiGianKetThuc = value;

    if (thoiGianBatDau && thoiGianKetThuc) {
      const start = new Date(thoiGianBatDau);
      const end = new Date(thoiGianKetThuc);
      if (end < start) {
        return Promise.reject(new Error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"));
      }
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const thoiGianBatDau = values.thoiGianBatDau ? new Date(values.thoiGianBatDau) : null;
      const thoiGianKetThuc = values.thoiGianKetThuc ? new Date(values.thoiGianKetThuc) : null;

      if (!values.maSK) {
        values.maSK = generateMaSK();
      }

      const payload = {
        ...values,
        thoiGianBatDau: thoiGianBatDau ? thoiGianBatDau.toISOString() : undefined,
        thoiGianKetThuc: thoiGianKetThuc ? thoiGianKetThuc.toISOString() : undefined,
      };

      const selectedChuyenGia = chuyenGiaOptions.find((cg) => cg.hoVaTen === values.chuyenGia);
      const guideId = selectedChuyenGia ? selectedChuyenGia._id : values.guides;
      payload.guides = guideId ? [guideId] : [];

      const token = localStorage.getItem("jwt");
      if (!token) {
        message.error("Vui lòng đăng nhập để tiếp tục");
        setLoading(false);
        return;
      }

      let res;
      if (event?._id) {
        const updatedValues = { ...payload };
        delete updatedValues._id;
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sukiens/${event._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(updatedValues),
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sukiens`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save event");
      }

      message.success(event?._id ? "Cập nhật sự kiện thành công" : "Thêm mới sự kiện thành công");

      form.resetFields();
      form.setFieldsValue({
        maSK: generateMaSK(),
        suKien: "",
        mucDich: "",
        chuyenGia: "",
        thanhPhan: "",
        diaDiem: "",
        thoiGianBatDau: undefined,
        thoiGianKetThuc: undefined,
        ghiChu: "",
      });
      setCustomMucDich("");
      setCustomChuyenGia("");
      setCustomThanhPhan("");
      setIsFormChanged(false);
      setInitialFormValues({});
      onSuccess();
    } catch (error) {
      console.error(error.message);
      message.error(error.message || "Có lỗi xảy ra khi lưu sự kiện");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      validateTrigger={["onFinish"]}
      validateOnMount={false}
      className="grid grid-cols-2 gap-2"
      onValuesChange={handleFieldsChange} 
      size="small"// Theo dõi thay đổi của form
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
          filterOption={false}
          value={customChuyenGia || undefined}
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
        rules={[
          { required: true, message: "Vui lòng nhập thời gian kết thúc" },
          { validator: validateTimeRange },
        ]}
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
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={event ? !isFormChanged : false}
          size="" // Disable nút "Cập nhật" nếu không có thay đổi
        >
          {event?._id ? "Cập nhật" : "Lưu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EventForm;