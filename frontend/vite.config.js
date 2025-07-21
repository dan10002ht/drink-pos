import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/guide/env-and-mode.html
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const tunnelDomain = env.VITE_TUNNEL_DOMAIN;
  const isDev = mode === "development";
  return {
    plugins: [react()],
    server: {
      allowedHosts: isDev
        ? ["*", ...(tunnelDomain ? [tunnelDomain] : [])]
        : [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            ...(tunnelDomain ? [tunnelDomain] : []),
          ],
    },
  };
});
