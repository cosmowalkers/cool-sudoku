module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // unstable_transformImportMeta: Web 端客户端包若不转换，zustand devtools 里的
      // `import.meta` 会被原样保留，而非 module 脚本解析时会直接语法报错导致白屏
      ["babel-preset-expo", { jsxImportSource: "nativewind", unstable_transformImportMeta: true }],
      "nativewind/babel",
    ],
  };
};
