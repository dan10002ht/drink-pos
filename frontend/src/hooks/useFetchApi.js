import { useQuery } from "@tanstack/react-query";
import { fetchPublicApi, fetchProtectedApi } from "../api/fetchPublicApi";

export function useFetchApi({
  queryKey,
  url,
  params,
  protected: isProtected = false,
  options,
  defaultData = [],
  fullResponse = false,
}) {
  const fetchFn = async () => {
    if (isProtected) {
      return fetchProtectedApi({ url, params });
    }
    return fetchPublicApi({ url, params });
  };

  const { data, ...rest } = useQuery({
    ...options,
    queryKey: Array.isArray(queryKey)
      ? queryKey
      : queryKey
      ? [queryKey, url, params]
      : [url, params],
    queryFn: fetchFn,
    initialData: defaultData,
  });

  return { ...rest, data: fullResponse ? data : data?.data };
}
