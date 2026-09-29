import React, { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { encodeQr, qrToPath } from "@/lib/qr";

const QUIET_ZONE = 4;

interface QrCodeProps {
  value: string;
  /** 渲染边长（像素） */
  size?: number;
  /** 深色模块颜色 */
  color?: string;
}

/**
 * 本地渲染的二维码。始终使用白底深色模块，
 * 避免深色主题下反色二维码导致扫描失败。
 */
export function QrCode({ value, size = 176, color = "#0F172A" }: QrCodeProps) {
  const matrix = useMemo(() => {
    try {
      return encodeQr(value, "M");
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) return null;

  const box = matrix.size + QUIET_ZONE * 2;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${box} ${box}`}
      accessibilityLabel={value}
    >
      <Rect
        x={-QUIET_ZONE}
        y={-QUIET_ZONE}
        width={box}
        height={box}
        fill="#FFFFFF"
      />
      <Path d={qrToPath(matrix.modules)} fill={color} />
    </Svg>
  );
}
