import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import SplashScreen from "../ui/SplashScreen";
import { useEffect, useState } from "react";
import { clearAuth, setAuth, setAuthLoading } from "../../store/authSlice";
import { getToken } from "../../utils/auth";
import { fetchProtectedApi } from "../../api/fetchProtectedApi";
import store from "../../store";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const [fetched, setFetched] = useState(false);
  const authLoading = useSelector((state) => state.auth.loading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  console.log("isAuthenticated", isAuthenticated);
  console.log("authLoading", authLoading);

  useEffect(() => {
    if (isAuthenticated) {
      setFetched(true);
      return;
    }
    if (fetched) return;
    const token = getToken();
    if (!token) {
      dispatch(clearAuth());
      return;
    }
    dispatch(setAuthLoading(true));
    fetchProtectedApi({ url: "/auth/verify-token", method: "POST" })
      .then((res) => {
        console.log("verify-token response", res.data);
        if (res.data.valid) {
          dispatch(setAuth({ user: res.data.user, token }));
        } else {
          dispatch(clearAuth());
        }
      })
      .catch(() => {
        dispatch(clearAuth());
      })
      .finally(() => {
        dispatch(setAuthLoading(false));
        setFetched(true);
      });
  }, []);

  if (authLoading) return <SplashScreen />;
  if (fetched && !isAuthenticated)
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
