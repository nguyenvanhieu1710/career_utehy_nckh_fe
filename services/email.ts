import api from "@/cores/api";

export const sendVerifyEmail = async (email: string, password: string, fullname: string) => {
  return api.post(`/email/send-verify-mail/${email}?password=${password}&fullname=${fullname}`, null);
};

export const verifyEmail = async (token: string) => {
  return api.post(`/email/verify-mail/${token}`);
};

export const sendForgotPasswordEmail = async (email: string) => {
  return api.post(`/email/send-email-forgot-password/${email}`);
};

export const verifyForgotPasswordEmail = async (token: string) => {
  return api.post(`/email/verify-mail-forgot-password/${token}`);
};

export const sendOtpEmail = async (currentPassword: string) => {
  return api.post(`/email/send-otp-email`, null, {
    params: { current_password: currentPassword },
  });
};

export default api;