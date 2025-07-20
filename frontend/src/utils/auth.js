// Utility functions cho authentication

/**
 * Lấy token từ localStorage
 */
export function getToken() {
  return localStorage.getItem("access_token");
}

/**
 * Lưu token vào localStorage
 */
export function setToken(token) {
  localStorage.setItem("access_token", token);
}

/**
 * Xóa token khỏi localStorage
 */
export function removeToken() {
  localStorage.removeItem("access_token");
}

/**
 * Kiểm tra xem user có đang đăng nhập không
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

/**
 * Xử lý khi token không hợp lệ
 */
export function handleAuthError() {
  removeToken();
  // Redirect về admin login page
  window.location.href = "/admin/login";
}

/**
 * Logout user
 */
export function logout() {
  removeToken();
  window.location.href = "/admin/login";
}

/**
 * Kiểm tra token có hợp lệ không (basic check)
 * Note: Đây chỉ là check cơ bản, server sẽ validate thực sự
 */
export function isTokenValid(token) {
  if (!token) return false;

  try {
    // Decode JWT token để check expiration
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error parsing token:", error);
    return false;
  }
}

/**
 * Lấy thông tin user từ token (nếu có)
 */
export function getUserFromToken(token) {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Error parsing user from token:", error);
    return null;
  }
}
