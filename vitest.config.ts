import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 120_000, // 数独引擎涉及回溯求解，expert 难度较慢
    pool: "threads", // forks pool 在某些环境下有兼容性问题
  },
});
