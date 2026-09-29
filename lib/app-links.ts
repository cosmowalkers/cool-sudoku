export interface AppDownload {
  /** 主下载地址；null 表示尚未上架 */
  url: string | null;
  /** 备用下载地址，主源访问不畅时使用 */
  fallback?: string;
}

/**
 * App 下载地址（Web 端下载入口使用）。
 *
 * - android：主源走 Gitee（国内可访问），备用源为 GitHub。
 *   两个平台的 Release 都上传同名的 `cool-sudoku.apk`，因此 latest 别名长期有效：
 *   Gitee 是 /releases/download/latest/<文件名>，GitHub 是 /releases/latest/download/<文件名>。
 *   将来若挂到自有对象存储/CDN，改这里即可。
 * - ios：尚未上架，url 为 null 时界面显示「敬请期待」。
 */
export const APP_DOWNLOADS: Record<"android" | "ios", AppDownload> = {
  android: {
    url: "https://gitee.com/chaunceym/cool-sudoku/releases/download/latest/cool-sudoku.apk",
    fallback:
      "https://github.com/cosmowalkers/cool-sudoku/releases/latest/download/cool-sudoku.apk",
  },
  ios: { url: null },
};
