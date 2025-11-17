import api from "@/cores/api";

export const authAPI = {
    login: (email: string, password: string) => api.post(`/auth/login`, { email: email, password: password }),
    verify: () => api.get("/auth/verify"),
    getByEmail: (email: string) => api.get(`/user/get-by-email/${email}`),
    updatePassword: (token: string, new_password: string)=> api.patch(`/auth/update-password?token=${token}`, {password: new_password})
};

export const isEmail = (email: string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
export const logout = () => {
    deleteTokenCookie();
    window.localStorage.removeItem('account_email');
    window.localStorage.removeItem('account_username');
    window.localStorage.removeItem('account_id');
    window.location.href = "/";
}

export const setUserStorage = (email: string, username: string, id: string, fullname: string) => {
    window.localStorage.setItem('account_email', email);
    window.localStorage.setItem('account_username', username);
    window.localStorage.setItem('account_id', id);
    window.localStorage.setItem('fullname', fullname);
}

export const getUserStorage = () => {
    const email = window.localStorage.getItem('account_email');
    const username = window.localStorage.getItem('account_username');
    const user_id = window.localStorage.getItem('account_id');
    return {
        email, username, user_id
    }
}

export function setTokenCookie(token: string, days = 1) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    window.document.cookie = `access_token=${token}; ${expires}; path=/; Secure; SameSite=Strict`;
}

export function deleteTokenCookie() {
    window.document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
}

export function getTokenCookie() {
  if (typeof window === "undefined") return null;

  const name = "access_token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(name)) {
      return c.substring(name.length);
    }
  }
  return null;
}