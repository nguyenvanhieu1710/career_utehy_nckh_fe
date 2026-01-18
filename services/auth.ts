import api from "@/cores/api";
import { authLogger } from "@/lib/logger";

export const authAPI = {
  login: (email: string, password: string) => {
    authLogger.info("Login attempt", { email });
    return api.post(`/auth/login`, { email: email, password: password });
  },
  verify: () => api.get("/auth/verify"),
  refresh: (refreshToken: string) => {
    authLogger.info("Token refresh attempt");
    return api.post("/auth/refresh", { refresh_token: refreshToken });
  },
  getByEmail: (email: string) => api.get(`/user/get-by-email/${email}`),
  updatePassword: (token: string, new_password: string) => {
    authLogger.info("Password update requested");
    return api.patch(`/auth/update-password?token=${token}`, {
      password: new_password,
    });
  },
  changePassword: (currentPassword: string, newPassword: string) => {
    authLogger.info("Password change requested");
    return api.patch(
      `/auth/change-password?current_password=${currentPassword}&new_password=${newPassword}`,
    );
  },
};

export const isEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const logout = () => {
  authLogger.info("User logout");
  deleteTokenCookie();
  deleteRefreshTokenCookie();
  window.localStorage.removeItem("account_email");
  window.localStorage.removeItem("account_username");
  window.localStorage.removeItem("account_id");
  window.localStorage.removeItem("fullname");
  window.localStorage.removeItem("avatar_url");
  window.location.href = "/";
};

export const setUserStorage = (
  email: string,
  username: string,
  id: string,
  fullname: string,
  avatar_url?: string,
) => {
  authLogger.info("User session stored", { userId: id, username });
  window.localStorage.setItem("account_email", email);
  window.localStorage.setItem("account_username", username);
  window.localStorage.setItem("account_id", id);
  window.localStorage.setItem("fullname", fullname);
  if (avatar_url) {
    window.localStorage.setItem("avatar_url", avatar_url);
  }
};

export const getUserStorage = () => {
  if (typeof window === "undefined") {
    return {
      email: null,
      username: null,
      user_id: null,
      fullname: null,
      avatar_url: null,
    };
  }
  const email = window.localStorage.getItem("account_email");
  const username = window.localStorage.getItem("account_username");
  const user_id = window.localStorage.getItem("account_id");
  const fullname = window.localStorage.getItem("fullname");
  const avatar_url = window.localStorage.getItem("avatar_url");
  return {
    email,
    username,
    user_id,
    fullname,
    avatar_url,
  };
};

export function setTokenCookie(token: string, days = 1) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  window.document.cookie = `access_token=${token}; ${expires}; path=/; Secure; SameSite=Strict`;
  authLogger.info("Auth token set", { expiresIn: `${days} days` });
}

export function setRefreshTokenCookie(token: string, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  window.document.cookie = `refresh_token=${token}; ${expires}; path=/; Secure; SameSite=Strict`;
  authLogger.info("Refresh token set", { expiresIn: `${days} days` });
}

export function deleteTokenCookie() {
  window.document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
  authLogger.info("Auth token deleted");
}

export function deleteRefreshTokenCookie() {
  window.document.cookie =
    "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
  authLogger.info("Refresh token deleted");
}

export function getTokenCookie() {
  if (typeof window === "undefined") return null;

  const name = "access_token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(name)) {
      return c.substring(name.length);
    }
  }
  return null;
}

export function getRefreshTokenCookie() {
  if (typeof window === "undefined") return null;

  const name = "refresh_token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(name)) {
      return c.substring(name.length);
    }
  }
  return null;
}
