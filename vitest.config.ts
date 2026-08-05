import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    env: { JWT_SECRET: "test-secret-for-unit-tests" },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
