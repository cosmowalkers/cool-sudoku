/**
 * App 下载地址（Web 端下载入口使用）。
 *
 * - android: APK 直链。当前指向 GitHub Releases 的 latest 资源，
 *   上传安装包时按 `cool-sudoku.apk` 命名即可持续生效；换对象存储/CDN 时改这里。
 * - ios: 尚未上架，置为 null 时界面显示「敬请期待」。
 */
export const APP_DOWNLOADS: Record<"android" | "ios", string | null> = {
  android:
    "https://github.com/cosmowalkers/cool-sudoku/releases/latest/download/cool-sudoku.apk",
  ios: null,
};
