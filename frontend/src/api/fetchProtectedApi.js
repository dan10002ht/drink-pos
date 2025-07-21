import axios from "axios";
import { getToken, handleAuthError } from "../utils/auth";
console.log(import.meta.env.VITE_API_URL);

const protectedApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
});

protectedApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để xử lý token không hợp lệ
protectedApi.interceptors.response.use(
  (response) => {
    // Nếu response thành công, trả về data
    return response;
  },
  (error) => {
    // Xử lý các lỗi authentication
    if (error.response) {
      const { status } = error.response;

      // 401 Unauthorized hoặc 403 Forbidden
      if (status === 401 || status === 403) {
        console.warn(
          "Token không hợp lệ hoặc hết hạn. Redirecting to login..."
        );
        handleAuthError();
        return Promise.reject(new Error("Authentication failed"));
      }

      // 500 Internal Server Error
      if (status >= 500) {
        console.error("Server error:", error.response.data);
        return Promise.reject(new Error("Server error occurred"));
      }
    }

    // Xử lý network errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      return Promise.reject(new Error("Request timeout"));
    }

    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(new Error("Network error occurred"));
    }

    // Trả về error gốc cho các trường hợp khác
    return Promise.reject(error);
  }
);

export async function fetchProtectedApi({
  url,
  method = "get",
  data,
  params,
  headers,
}) {
  try {
    const response = await protectedApi.request({
      url,
      method,
      data,
      params,
      headers,
    });
    return response.data;
  } catch (error) {
    // Nếu đã được xử lý bởi interceptor (401/403), không cần throw lại
    if (error.message === "Authentication failed") {
      return Promise.reject(error);
    }

    // Throw error cho các trường hợp khác
    throw error;
  }
}
