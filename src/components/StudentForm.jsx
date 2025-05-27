import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import dayjs from "dayjs";
import { sinhVienService } from "../services/sinhVienService";

const { Option } = Select;

const StudentForm = ({ student, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [truongDoiTacOptions, setTruongDoiTacOptions] = useState([]);
  const [quocGiaOptions, setQuocGiaOptions] = useState([]);
  const [customTruongDoiTac, setCustomTruongDoiTac] = useState("");
  const [customQuocGia, setCustomQuocGia] = useState("");
  const [searchTruongDoiTac, setSearchTruongDoiTac] = useState("");
  const [searchQuocGia, setSearchQuocGia] = useState("");
  const [isFormChanged, setIsFormChanged] = useState(false); // Thêm state để theo dõi thay đổi
  const [initialFormValues, setInitialFormValues] = useState({}); // Lưu giá trị ban đầu của form

  const hinhThucOptions = ["Trao đổi", "Chuyển tiếp"];
  const capBacOptions = ["Đại học", "Sau đại học"];

  const initialValues = {
    maSV: "",
    hoVaTen: "",
    hinhThuc: "",
    capBac: "",
    chuyenNganh: "",
    lop: "",
    truongDoiTac: "",
    quocGia: "",
    thoiGianBatDau: undefined,
    thoiGianKetThuc: undefined,
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
        setTruongDoiTacOptions(getUnique(truongDoiTacs, "truongDoiTac"));
        setQuocGiaOptions(getUnique(quocGias, "quocGia"));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sinh viên:", error);
        message.error(
          error.response?.status === 404
            ? "Không tìm thấy dữ liệu sinh viên"
            : "Không thể tải danh sách trường đối tác và quốc gia"
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
        ? dayjs(student.thoiGianBatDau).format("YYYY-MM-DD")
        : undefined;
      const thoiGianKetThuc = student.thoiGianKetThuc
        ? dayjs(student.thoiGianKetThuc).format("YYYY-MM-DD")
        : undefined;

      // Lưu giá trị ban đầu để so sánh
      const initialValues = {
        maSV: student.maSV || "",
        hoVaTen: student.hoVaTen || "",
        hinhThuc: student.hinhThuc || "",
        capBac: student.capBac || "",
        chuyenNganh: student.chuyenNganh || "",
        lop: student.lop || "",
        truongDoiTac: student.truongDoiTac || "",
        quocGia: student.quocGia || "",
        thoiGianBatDau: thoiGianBatDau || undefined,
        thoiGianKetThuc: thoiGianKetThuc || undefined,
      };
      setInitialFormValues(initialValues);

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

      setIsFormChanged(false); // Ban đầu không có thay đổi
    } else {
      // Create mode: Reset form
      form.resetFields();
      setCustomTruongDoiTac("");
      setCustomQuocGia("");
      setSearchTruongDoiTac("");
      setSearchQuocGia("");
      setInitialFormValues({});
      setIsFormChanged(false);
    }
  }, [student, form]);

  // Set custom values after options are loaded
  useEffect(() => {
    if (student) {
      setCustomTruongDoiTac(
        student.truongDoiTac &&
          !truongDoiTacOptions.includes(student.truongDoiTac)
          ? student.truongDoiTac
          : ""
      );
      setCustomQuocGia(
        student.quocGia && !quocGiaOptions.includes(student.quocGia)
          ? student.quocGia
          : ""
      );
    }
  }, [student, truongDoiTacOptions, quocGiaOptions]);

  // Hàm kiểm tra thay đổi của form
  const handleFieldsChange = () => {
    if (!student) return; // Chỉ kiểm tra khi chỉnh sửa

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

  // Handle Select changes
  const handleSelectChange = (field, value) => {
    if (field === "truongDoiTac") {
      if (value === "Khác") {
        form.setFieldValue("truongDoiTac", searchTruongDoiTac || "");
        setCustomTruongDoiTac(searchTruongDoiTac || "");
      } else {
        form.setFieldValue("truongDoiTac", value);
        setCustomTruongDoiTac("");
      }
    } else if (field === "quocGia") {
      if (value === "Khác") {
        form.setFieldValue("quocGia", searchQuocGia || "");
        setCustomQuocGia(searchQuocGia || "");
      } else {
        form.setFieldValue("quocGia", value);
        setCustomQuocGia("");
      }
    }
    handleFieldsChange(); // Kiểm tra thay đổi sau khi select
  };

  // Handle search input
  const handleTruongDoiTacSearch = (value) => {
    setSearchTruongDoiTac(value);
    if (
      form.getFieldValue("truongDoiTac") === searchTruongDoiTac ||
      form.getFieldValue("truongDoiTac") === "Khác"
    ) {
      form.setFieldValue("truongDoiTac", value);
      setCustomTruongDoiTac(value);
    }
    handleFieldsChange();
  };

  const handleQuocGiaSearch = (value) => {
    setSearchQuocGia(value);
    if (
      form.getFieldValue("quocGia") === searchQuocGia ||
      form.getFieldValue("quocGia") === "Khác"
    ) {
      form.setFieldValue("quocGia", value);
      setCustomQuocGia(value);
    }
    handleFieldsChange();
  };

  // Custom filter function for Select
  const filterOption = (input, option) => {
    if (option.value === "Khác") return true; // Always show "Khác"
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  // Validation function for thoiGianKetThuc
  const validateTimeRange = (_, value) => {
    const thoiGianBatDau = form.getFieldValue("thoiGianBatDau");
    const thoiGianKetThuc = value;

    if (thoiGianBatDau && thoiGianKetThuc) {
      const start = new Date(thoiGianBatDau);
      const end = new Date(thoiGianKetThuc);
      if (end < start) {
        return Promise.reject(
          new Error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu")
        );
      }
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const thoiGianBatDau = values.thoiGianBatDau
        ? new Date(values.thoiGianBatDau)
        : null;
      const thoiGianKetThuc = values.thoiGianKetThuc
        ? new Date(values.thoiGianKetThuc)
        : null;

      const payload = {
        ...values,
        thoiGianBatDau: thoiGianBatDau
          ? thoiGianBatDau.toISOString()
          : undefined,
        thoiGianKetThuc: thoiGianKetThuc
          ? thoiGianKetThuc.toISOString()
          : undefined,
      };

      if (student?._id) {
        const updatedValues = { ...payload };
        delete updatedValues._id;
        await sinhVienService.updateSinhVien(student._id, updatedValues);
        message.success("Cập nhật sinh viên thành công");
      } else {
        await sinhVienService.createSinhVien(payload);
        message.success("Thêm sinh viên thành công");
      }

      // Reset form
      form.resetFields();
      setCustomTruongDoiTac("");
      setCustomQuocGia("");
      setSearchTruongDoiTac("");
      setSearchQuocGia("");
      setIsFormChanged(false);
      setInitialFormValues({});
      onSuccess();
    } catch (error) {
      console.error("Error saving student:", error);
      if (error.response?.status === 400 && error.response.data?.message) {
        const msg = error.response.data.message;

        if (msg.includes("Mã sinh viên đã tồn tại")) {
          form.setFields([
            {
              name: "maSV",
              errors: ["Mã sinh viên đã tồn tại, vui lòng nhập mã khác"],
            },
          ]);
        } else if (msg.includes("Mã sinh viên phải đúng 12 ký tự")) {
          form.setFields([
            { name: "maSV", errors: ["Mã sinh viên phải đúng 12 ký tự"] },
          ]);
        } else {
          message.error(msg || "Lỗi server khi lưu sinh viên");
        }
      } else {
        message.error(error.message || "Có lỗi xảy ra khi lưu sinh viên");
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
      validateTrigger={["onFinish"]}
      validateOnMount={false}
      className="grid grid-cols-2 gap-4"
      onValuesChange={handleFieldsChange} // Theo dõi thay đổi của form
    >
      <Form.Item
        label="Mã sinh viên"
        name="maSV"
        className="col-span-1"
        rules={[
          { required: true, message: "Vui lòng nhập mã sinh viên" },
          {
            validator: (_, value) => {
              if (!value || value.length === 0) return Promise.resolve();
              if (value.length !== 12) {
                return Promise.reject(
                  new Error("Mã sinh viên phải đúng 12 ký tự")
                );
              }
              if (!/^\d+$/.test(value)) {
                return Promise.reject(
                  new Error("Mã sinh viên chỉ được chứa số")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Họ và tên"
        name="hoVaTen"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Hình thức"
        name="hinhThuc"
        rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
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
        rules={[{ required: true, message: "Vui lòng chọn cấp bậc" }]}
      >
        <Select placeholder="Chọn cấp bậc">
          {capBacOptions.map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label=" Chuyên ngành"
        name="chuyenNganh"
        rules={[{ required: true, message: "Vui lònglòng chọn chuyên ngành" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Lớp"
        name="lop"
        rules={[{ required: true, message: "Vui lòng nhập lớp" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Trường đối tác"
        name="truongDoiTac"
        rules={[
          { required: true, message: "Vui lòng chọn hoặc nhập trường đối tác" },
        ]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("truongDoiTac", value)}
          onSearch={handleTruongDoiTacSearch}
          placeholder="Chọn hoặc nhập trường đối tác"
          filterOption={filterOption}
          value={customTruongDoiTac || undefined}
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
        rules={[
          { required: true, message: "Vui lòng chọn hoặc nhập quốc gia" },
        ]}
      >
        <Select
          showSearch
          allowClear
          onChange={(value) => handleSelectChange("quocGia", value)}
          onSearch={handleQuocGiaSearch}
          placeholder="Chọn hoặc nhập quốc gia"
          filterOption={filterOption}
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
        label="Thời gian bắt đầu"
        name="thoiGianBatDau"
        rules={[{ required: true, message: "Vui lòng nhập thời gian bắt đầu" }]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item
        label="Thời gian kết thúc"
        name="thoiGianKetThuc"
        rules={[
          { required: true, message: "Vui lòng nhập thời gian kết thúc" },
          { validator: validateTimeRange },
        ]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item className="col-span-2 flex justify-between">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={student ? !isFormChanged : false} // Disable nút "Cập nhật" nếu không có thay đổi
        >
          {student?.maSV ? "Cập nhật" : "Lưu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StudentForm;
