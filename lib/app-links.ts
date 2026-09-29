/**
 * App 下载地址（Web 端下载入口使用）。
 *
 * - android: APK 直链。主源用 Gitee（国内可访问），
 *   上传安装包时按 `cool-sudoku.apk` 命名，latest 别名即可持续生效。
 *   备用源：https://github.com/cosmowalkers/cool-sudoku/releases/latest/download/cool-sudoku.apk
 *   将来若挂到自有对象存储/CDN，改这里一行即可。
 * - ios: 尚未上架，置为 null 时界面显示「敬请期待」。
 */
export const APP_DOWNLOADS: Record<"android" | "ios", string | null> = {
  android: "https://gitee.com/chaunceym/cool-sudoku/releases/download/latest/cool-sudoku.apk",
  ios: null,
};
