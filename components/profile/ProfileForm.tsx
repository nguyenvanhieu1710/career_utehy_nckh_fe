"use client";

import { useState } from "react";

export default function ProfileForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthday: "",
    gender: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 md:p-8"
    >
      <h2 className="text-xl font-semibold text-green-800 mb-2">
        THÔNG TIN CƠ BẢN
      </h2>
      <p className="text-gray-600 mb-6 text-sm">
        Bạn vui lòng hoàn thiện các thông tin dưới đây. <br />
        (<span className="text-red-500">*</span>) Các thông tin bắt buộc
      </p>

      <div className="space-y-4">
        <Input label="Họ tên" name="name" value={form.name} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <Input label="Điện thoại" name="phone" value={form.phone} onChange={handleChange} required />
        <Input label="Địa chỉ" name="address" value={form.address} onChange={handleChange} required />
        <Input label="Ngày sinh" name="birthday" type="date" value={form.birthday} onChange={handleChange} required />

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Giới tính <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">-- Chọn --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg"
      >
        Lưu thông tin
      </button>
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600"
      />
    </div>
  );
}
