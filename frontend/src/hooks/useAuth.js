import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuth, clearAuth, setAuthLoading } from "../store/authSlice";
import { getToken } from "../utils/auth";
import { fetchProtectedApi } from "../api/fetchProtectedApi";

export default function useAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAuthLoading(true));
    const token = getToken();
    if (!token) {
      dispatch(clearAuth());
      return;
    }
    fetchProtectedApi({ url: "/auth/verify-token", method: "POST" })
      .then((res) => {
        if (res.data.valid) {
          dispatch(setAuth({ user: res.data.user, token }));
        } else {
          dispatch(clearAuth());
        }
      })
      .catch(() => {
        dispatch(clearAuth());
      });
  }, [dispatch]);
}
