import type { ViewStyle } from "react-native";

/**
 * 按压反馈参数。
 *
 * 用缩放而不是"键体下沉 + 阴影层压扁"：后者需要额外一层 View 撑出硬边，
 * 在桌面 Web 上看起来像多余的一条线；缩放是纯 transform，三端表现一致。
 */
export const PRESS_SCALE = 0.95;
export const PRESS_IN_MS = 80;
export const PRESS_OUT_MS = 120;

/**
 * 静止态的柔和投影。
 * shadow* 在 iOS 与 Web（react-native-web 会映射成 CSS box-shadow）生效，
 * Android 需要 elevation；elevation 在 Web 上被忽略，互不干扰。
 */
export const softShadow: ViewStyle = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
