import { useMutation } from "@tanstack/react-query";
import { fetchPublicApi, fetchProtectedApi } from "../api/fetchPublicApi";

export function useCreateApi({
  url,
  data,
  protected: isProtected = false,
  onSuccess,
  onError,
  ...options
}) {
  const mutationFn = async (payload) => {
    if (isProtected) {
      return fetchProtectedApi({ url, method: "post", data: payload || data });
    }
    return fetchPublicApi({ url, method: "post", data: payload || data });
  };

  return useMutation({
    mutationFn,
    onSuccess,
    onError,
    ...options,
  });
}
