import { useMutation } from "@tanstack/react-query";
import { fetchPublicApi, fetchProtectedApi } from "../api/fetchPublicApi";

export function useDeleteApi({
  url,
  protected: isProtected = false,
  onSuccess,
  onError,
  ...options
}) {
  const mutationFn = async (id) => {
    const deleteUrl = id ? `${url}/${id}` : url;
    if (isProtected) {
      return fetchProtectedApi({ url: deleteUrl, method: "delete" });
    }
    return fetchPublicApi({ url: deleteUrl, method: "delete" });
  };

  return useMutation({
    mutationFn,
    onSuccess,
    onError,
    ...options,
  });
}
