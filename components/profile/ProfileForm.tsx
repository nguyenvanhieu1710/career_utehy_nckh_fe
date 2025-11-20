"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserStorage } from "@/services/auth";

export default function ProfileForm() {
  const [form, setForm] = useState({
    name: getUserStorage().fullname,
    email: getUserStorage().email,
    phone: "",
    address: "",
    birthday: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateName = (name: string) => {
    if (!name.trim()) return "Họ tên là bắt buộc";
    if (name.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
    if (name.length > 50) return "Họ tên không được vượt quá 50 ký tự";
    if (!/^[\p{L}\s]+$/u.test(name)) return "Họ tên chỉ được chứa chữ cái và dấu cách";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Số điện thoại là bắt buộc";
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Check if starts with 0 or +84
    if (!/^(0|\+84)/.test(cleaned)) {
      return "Số điện thoại phải bắt đầu bằng 0 hoặc +84";
    }
    
    // Check length (10-11 digits for Vietnamese numbers)
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      return "Số điện thoại phải có 10-11 chữ số";
    }
    
    return "";
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) return "Địa chỉ là bắt buộc";
    if (address.length < 5) return "Địa chỉ phải có ít nhất 5 ký tự";
    if (address.length > 200) return "Địa chỉ không được vượt quá 200 ký tự";
    return "";
  };

  const validateBirthday = (birthday: string) => {
    if (!birthday) return "Ngày sinh là bắt buộc";
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return "Ngày sinh không hợp lệ";
    }
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) return "Bạn phải đủ 18 tuổi trở lên";
    if (age > 100) return "Tuổi không được vượt quá 100";
    
    return "";
  };

  const validateGender = (gender: string) => {
    if (!gender) return "Vui lòng chọn giới tính";
    return "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const error = validateName(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (name === 'phone') {
      const error = validatePhone(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (name === 'address') {
      const error = validateAddress(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (name === 'birthday') {
      const error = validateBirthday(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (name === 'gender') {
      const error = validateGender(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);
    const addressError = validateAddress(form.address);
    const birthdayError = validateBirthday(form.birthday);
    const genderError = validateGender(form.gender);
    
    const newErrors = {
      name: nameError,
      phone: phoneError,
      address: addressError,
      birthday: birthdayError,
      gender: genderError,
    };
    
    setErrors(newErrors);
    
    // If no errors, submit the form
    if (!nameError && !phoneError && !addressError && !birthdayError && !genderError) {
      console.log('Form submitted:', form);
    }
  };

  // Animation variants with proper TypeScript types
  const container: Record<string, any> = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.08,
        delayChildren: 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as any, // Using 'as any' to bypass the type check
      },
    },
  };

  const item: Record<string, any> = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
        mass: 0.5,
      }
    },
  };

  const header: Record<string, any> = {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        delay: 0.2,
      }
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-6xl mx-auto"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div 
        className="text-center mb-8"
        variants={header}
      >
        <motion.h2 
          className="text-3xl font-bold text-[#0C6A4E] mb-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          THÔNG TIN CƠ BẢN
        </motion.h2>
        <motion.p 
          className="text-black-600 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Bạn vui lòng hoàn thiện các thông tin dưới đây.{" "}
          
        </motion.p>
        <motion.p>
          <span className="text-red-500">*</span> Các thông tin bắt buộc
        </motion.p>
      </motion.div>

      <motion.div className="space-y-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-12 items-center gap-4">
          <label className="col-span-3 text-right font-medium text-gray-700">
            Họ tên
          </label>
          <div className="col-span-9">
            <div className="w-full">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="VD: Nguyễn Văn A"
              />
              {errors.name && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.name}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <label className="col-span-3 text-right font-medium text-gray-700">
            Email
          </label>
          <div className="col-span-9">
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="VD: abc@gmail.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <label className="col-span-3 text-right font-medium text-gray-700">
            Điện thoại
          </label>
          <div className="col-span-9">
            <div className="w-full">
              <Input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="VD: 0912345678 hoặc +84912345678"
                required
              />
              {errors.phone && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.phone}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <label className="col-span-3 text-right font-medium text-gray-700">
            Địa chỉ
          </label>
          <div className="col-span-9">
            <div className="w-full">
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="VD: Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                required
              />
              {errors.address && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.address}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <label className="col-span-3 text-right font-medium text-gray-700">
            Ngày sinh
          </label>
          <div className="col-span-9">
            <Input
              name="birthday"
              type="date"
              value={form.birthday}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <label className="col-span-3 text-right font-medium text-gray-700">
            Giới tính
          </label>
          <div className="col-span-9">
            <motion.select
              name="gender"
              className={`w-full border ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-2 focus:ring-2 focus:ring-[#0C6A4E] focus:border-transparent h-[42px] transition-all duration-200`}
              value={form.gender}
              onBlur={handleBlur}
              onChange={handleChange}
              required
              whileFocus={{ 
                scale: 1.005,
                boxShadow: "0 0 0 2px rgba(12, 106, 78, 0.2)"
              }}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </motion.select>
            {errors.gender && (
              <motion.p 
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.gender}
              </motion.p>
            )}
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-12 gap-4 pt-6"
          variants={item}
        >
          <div className="col-span-3"></div>
          <div className="col-span-9">
            <motion.button
              type="submit"
              className="bg-[#0C6A4E] hover:bg-[#0a5840] text-white font-semibold py-2.5 px-6 rounded-lg w-full md:w-auto min-w-[180px]"
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
              }}
              whileTap={{ 
                scale: 0.98,
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
              }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 10
              }}
            >
              Lưu thông tin
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}

function Input({
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  required,
  placeholder,
}: {
  name: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <motion.div
      className="relative"
      whileHover={{
        scale: 1.01,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
      whileFocus={{
        scale: 1.01,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
    >
      <motion.div
        className="relative rounded-lg overflow-hidden"
        initial={false}
        animate={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
        whileHover={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
      >
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full border-2 border-gray-300 bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0C6A4E] focus:border-[#0C6A4E] transition-all duration-200"
          placeholder={placeholder}
        />
        <AnimatePresence>
          {required && value === "" && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold"
            >
              *
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
