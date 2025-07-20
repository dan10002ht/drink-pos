import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
});

// Response interceptor để xử lý lỗi
publicApi.interceptors.response.use(
  (response) => {
    // Nếu response thành công, trả về data
    return response;
  },
  (error) => {
    // Xử lý server errors
    if (error.response) {
      const { status } = error.response;

      // 500 Internal Server Error
      if (status >= 500) {
        console.error("Server error:", error.response.data);
        return Promise.reject(new Error("Server error occurred"));
      }

      // 400 Bad Request
      if (status === 400) {
        console.error("Bad request:", error.response.data);
        return Promise.reject(new Error("Invalid request"));
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

export async function fetchPublicApi({
  url,
  method = "get",
  data,
  params,
  headers,
}) {
  const response = await publicApi.request({
    url,
    method,
    data,
    params,
    headers,
  });
  return response.data;
}

// Re-export fetchProtectedApi để các hook import từ một nơi
export { fetchProtectedApi } from "./fetchProtectedApi";
