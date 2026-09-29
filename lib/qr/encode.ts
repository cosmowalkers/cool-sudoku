/**
 * 轻量二维码（QR Code）编码器，仅实现 8bit 字节模式。
 *
 * 算法移植自 Kazuhiko Arase 的 qrcode.js（MIT License），
 * 用于在 Web 端本地渲染二维码，避免引入额外依赖或依赖第三方二维码图片服务。
 *
 * 支持版本 1-10（字节模式下最高约 271 字节），足够承载下载链接。
 */

export type QrErrorCorrectLevel = "L" | "M" | "Q" | "H";

export interface QrMatrix {
  /** 每边的模块数（版本 1 = 21，版本 10 = 57） */
  size: number;
  /** modules[row][col]，true 表示深色模块 */
  modules: boolean[][];
}

const MAX_VERSION = 10;

/** 纠错等级在格式信息中的取值 */
const LEVEL_BITS: Record<QrErrorCorrectLevel, number> = {
  M: 0,
  L: 1,
  H: 2,
  Q: 3,
};

/** [分块数, 总码字数, 数据码字数, ...] 按 版本 × 纠错等级 排列 */
const RS_BLOCK_TABLE: number[][] = [
  [1, 26, 19], // 1 L
  [1, 26, 16], // 1 M
  [1, 26, 13], // 1 Q
  [1, 26, 9], // 1 H
  [1, 44, 34], // 2 L
  [1, 44, 28], // 2 M
  [1, 44, 22], // 2 Q
  [1, 44, 16], // 2 H
  [1, 70, 55], // 3 L
  [1, 70, 44], // 3 M
  [2, 35, 17], // 3 Q
  [2, 35, 13], // 3 H
  [1, 100, 80], // 4 L
  [2, 50, 32], // 4 M
  [2, 50, 24], // 4 Q
  [4, 25, 9], // 4 H
  [1, 134, 108], // 5 L
  [2, 67, 43], // 5 M
  [2, 33, 15, 2, 34, 16], // 5 Q
  [2, 33, 11, 2, 34, 12], // 5 H
  [2, 86, 68], // 6 L
  [4, 43, 27], // 6 M
  [4, 43, 19], // 6 Q
  [4, 43, 15], // 6 H
  [2, 98, 78], // 7 L
  [4, 49, 31], // 7 M
  [2, 32, 14, 4, 33, 15], // 7 Q
  [4, 39, 13, 1, 40, 14], // 7 H
  [2, 121, 97], // 8 L
  [2, 60, 38, 2, 61, 39], // 8 M
  [4, 40, 18, 2, 41, 19], // 8 Q
  [4, 40, 14, 2, 41, 15], // 8 H
  [2, 146, 116], // 9 L
  [3, 58, 36, 2, 59, 37], // 9 M
  [4, 36, 16, 4, 37, 17], // 9 Q
  [4, 36, 12, 4, 37, 13], // 9 H
  [2, 86, 68, 2, 87, 69], // 10 L
  [4, 69, 43, 1, 70, 44], // 10 M
  [6, 43, 19, 2, 44, 20], // 10 Q
  [6, 43, 15, 2, 44, 16], // 10 H
];

/** 校正图形中心坐标 */
const PATTERN_POSITION_TABLE: number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

// --- GF(256) 运算表 ---

const EXP_TABLE = new Array<number>(256);
const LOG_TABLE = new Array<number>(256);

for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] =
    EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;

function gexp(n: number): number {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n];
}

function glog(n: number): number {
  if (n < 1) throw new Error(`glog(${n})`);
  return LOG_TABLE[n];
}

// --- 多项式 ---

class Polynomial {
  readonly num: number[];

  constructor(num: number[], shift: number) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;

    this.num = new Array<number>(num.length - offset + shift).fill(0);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  get length(): number {
    return this.num.length;
  }

  at(index: number): number {
    return this.num[index];
  }

  multiply(other: Polynomial): Polynomial {
    const num = new Array<number>(this.length + other.length - 1).fill(0);
    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < other.length; j++) {
        num[i + j] ^= gexp(glog(this.at(i)) + glog(other.at(j)));
      }
    }
    return new Polynomial(num, 0);
  }

  mod(other: Polynomial): Polynomial {
    if (this.length - other.length < 0) return this;

    const ratio = glog(this.at(0)) - glog(other.at(0));
    const num = [...this.num];
    for (let x = 0; x < other.length; x++) {
      num[x] ^= gexp(glog(other.at(x)) + ratio);
    }
    return new Polynomial(num, 0).mod(other);
  }
}

function errorCorrectPolynomial(length: number): Polynomial {
  let poly = new Polynomial([1], 0);
  for (let i = 0; i < length; i++) {
    poly = poly.multiply(new Polynomial([1, gexp(i)], 0));
  }
  return poly;
}

// --- 位缓冲 ---

class BitBuffer {
  readonly buffer: number[] = [];
  length = 0;

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  private putBit(bit: boolean): void {
    const index = Math.floor(this.length / 8);
    if (this.buffer.length <= index) this.buffer.push(0);
    if (bit) this.buffer[index] |= 0x80 >>> this.length % 8;
    this.length++;
  }
}

// --- BCH / 掩码 ---

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1;
const G18 =
  (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1;
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

function bchDigit(data: number): number {
  let digit = 0;
  let value = data;
  while (value !== 0) {
    digit++;
    value >>>= 1;
  }
  return digit;
}

function bchTypeInfo(data: number): number {
  let d = data << 10;
  while (bchDigit(d) - bchDigit(G15) >= 0) {
    d ^= G15 << (bchDigit(d) - bchDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
}

function bchTypeNumber(data: number): number {
  let d = data << 12;
  while (bchDigit(d) - bchDigit(G18) >= 0) {
    d ^= G18 << (bchDigit(d) - bchDigit(G18));
  }
  return (data << 12) | d;
}

function maskAt(pattern: number, i: number, j: number): boolean {
  switch (pattern) {
    case 0:
      return (i + j) % 2 === 0;
    case 1:
      return i % 2 === 0;
    case 2:
      return j % 3 === 0;
    case 3:
      return (i + j) % 3 === 0;
    case 4:
      return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5:
      return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6:
      return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7:
      return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default:
      throw new Error(`bad maskPattern: ${pattern}`);
  }
}

// --- UTF-8 ---

function toUtf8Bytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);

    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i++;
      }
    }

    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

// --- 纠错码字 ---

interface RsBlock {
  totalCount: number;
  dataCount: number;
}

function rsBlocksFor(version: number, level: QrErrorCorrectLevel): RsBlock[] {
  const offset = ["L", "M", "Q", "H"].indexOf(level);
  const row = RS_BLOCK_TABLE[(version - 1) * 4 + offset];
  const blocks: RsBlock[] = [];
  for (let i = 0; i < row.length; i += 3) {
    const count = row[i];
    for (let j = 0; j < count; j++) {
      blocks.push({ totalCount: row[i + 1], dataCount: row[i + 2] });
    }
  }
  return blocks;
}

function createBytes(buffer: BitBuffer, rsBlocks: RsBlock[]): number[] {
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;
  const dcData: number[][] = [];
  const ecData: number[][] = [];

  for (let r = 0; r < rsBlocks.length; r++) {
    const dcCount = rsBlocks[r].dataCount;
    const ecCount = rsBlocks[r].totalCount - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    const dc = new Array<number>(dcCount).fill(0);
    for (let i = 0; i < dc.length; i++) {
      dc[i] = 0xff & (buffer.buffer[i + offset] ?? 0);
    }
    offset += dcCount;
    dcData.push(dc);

    const rsPoly = errorCorrectPolynomial(ecCount);
    const modPoly = new Polynomial(dc, rsPoly.length - 1).mod(rsPoly);

    const ec = new Array<number>(rsPoly.length - 1).fill(0);
    for (let i = 0; i < ec.length; i++) {
      const modIndex = i + modPoly.length - ec.length;
      ec[i] = modIndex >= 0 ? modPoly.at(modIndex) : 0;
    }
    ecData.push(ec);
  }

  const data: number[] = [];
  for (let i = 0; i < maxDcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < dcData[r].length) data.push(dcData[r][i]);
    }
  }
  for (let i = 0; i < maxEcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < ecData[r].length) data.push(ecData[r][i]);
    }
  }
  return data;
}

function lengthInBits(version: number): number {
  return version < 10 ? 8 : 16;
}

function createData(bytes: number[], version: number, level: QrErrorCorrectLevel): number[] {
  const rsBlocks = rsBlocksFor(version, level);
  const totalDataCount = rsBlocks.reduce((sum, block) => sum + block.dataCount, 0);

  const buffer = new BitBuffer();
  buffer.put(4, 4); // 8bit 字节模式
  buffer.put(bytes.length, lengthInBits(version));
  for (const byte of bytes) buffer.put(byte, 8);

  if (buffer.length > totalDataCount * 8) {
    throw new Error(`二维码内容过长：${buffer.length} > ${totalDataCount * 8} bits`);
  }

  if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
  while (buffer.length % 8 !== 0) buffer.put(0, 1);

  // 交替填充字节
  while (buffer.length < totalDataCount * 8) {
    buffer.put(0xec, 8);
    if (buffer.length >= totalDataCount * 8) break;
    buffer.put(0x11, 8);
  }

  return createBytes(buffer, rsBlocks);
}

function lostPoint(modules: boolean[][], size: number): number {
  let lost = 0;

  // 相邻同色模块
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let sameCount = 0;
      const dark = modules[row][col];
      for (let r = -1; r <= 1; r++) {
        if (row + r < 0 || size <= row + r) continue;
        for (let c = -1; c <= 1; c++) {
          if (col + c < 0 || size <= col + c) continue;
          if (r === 0 && c === 0) continue;
          if (dark === modules[row + r][col + c]) sameCount++;
        }
      }
      if (sameCount > 5) lost += 3 + sameCount - 5;
    }
  }

  // 2x2 同色块
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      let count = 0;
      if (modules[row][col]) count++;
      if (modules[row + 1][col]) count++;
      if (modules[row][col + 1]) count++;
      if (modules[row + 1][col + 1]) count++;
      if (count === 0 || count === 4) lost += 3;
    }
  }

  // 1:1:3:1:1 特征
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 6; col++) {
      if (
        modules[row][col] &&
        !modules[row][col + 1] &&
        modules[row][col + 2] &&
        modules[row][col + 3] &&
        modules[row][col + 4] &&
        !modules[row][col + 5] &&
        modules[row][col + 6]
      ) {
        lost += 40;
      }
    }
  }
  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size - 6; row++) {
      if (
        modules[row][col] &&
        !modules[row + 1][col] &&
        modules[row + 2][col] &&
        modules[row + 3][col] &&
        modules[row + 4][col] &&
        !modules[row + 5][col] &&
        modules[row + 6][col]
      ) {
        lost += 40;
      }
    }
  }

  // 深浅比例
  let darkCount = 0;
  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size; row++) {
      if (modules[row][col]) darkCount++;
    }
  }
  const ratio = Math.abs((100 * darkCount) / size / size - 50) / 5;
  lost += ratio * 10;

  return lost;
}

function setupPositionProbePattern(
  modules: (boolean | null)[][],
  size: number,
  row: number,
  col: number
): void {
  for (let r = -1; r <= 7; r++) {
    if (row + r <= -1 || size <= row + r) continue;
    for (let c = -1; c <= 7; c++) {
      if (col + c <= -1 || size <= col + c) continue;
      const dark =
        (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
        (2 <= r && r <= 4 && 2 <= c && c <= 4);
      modules[row + r][col + c] = dark;
    }
  }
}

function buildMatrix(
  data: number[],
  version: number,
  level: QrErrorCorrectLevel,
  maskPattern: number,
  test: boolean
): (boolean | null)[][] {
  const size = version * 4 + 17;
  const modules: (boolean | null)[][] = Array.from({ length: size }, () =>
    new Array<boolean | null>(size).fill(null)
  );

  setupPositionProbePattern(modules, size, 0, 0);
  setupPositionProbePattern(modules, size, size - 7, 0);
  setupPositionProbePattern(modules, size, 0, size - 7);

  // 校正图形
  const positions = PATTERN_POSITION_TABLE[version - 1];
  for (const row of positions) {
    for (const col of positions) {
      if (modules[row][col] !== null) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          modules[row + r][col + c] =
            Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
        }
      }
    }
  }

  // 定位图形
  for (let r = 8; r < size - 8; r++) {
    if (modules[r][6] !== null) continue;
    modules[r][6] = r % 2 === 0;
  }
  for (let c = 8; c < size - 8; c++) {
    if (modules[6][c] !== null) continue;
    modules[6][c] = c % 2 === 0;
  }

  // 格式信息
  const typeInfoBits = bchTypeInfo((LEVEL_BITS[level] << 3) | maskPattern);
  for (let v = 0; v < 15; v++) {
    const mod = !test && ((typeInfoBits >> v) & 1) === 1;
    if (v < 6) modules[v][8] = mod;
    else if (v < 8) modules[v + 1][8] = mod;
    else modules[size - 15 + v][8] = mod;
  }
  for (let h = 0; h < 15; h++) {
    const mod = !test && ((typeInfoBits >> h) & 1) === 1;
    if (h < 8) modules[8][size - h - 1] = mod;
    else if (h < 9) modules[8][15 - h - 1 + 1] = mod;
    else modules[8][15 - h - 1] = mod;
  }
  modules[size - 8][8] = !test;

  // 版本信息（版本 7 及以上）
  if (version >= 7) {
    const typeNumberBits = bchTypeNumber(version);
    for (let i = 0; i < 18; i++) {
      modules[Math.floor(i / 3)][(i % 3) + size - 8 - 3] =
        !test && ((typeNumberBits >> i) & 1) === 1;
    }
    for (let i = 0; i < 18; i++) {
      modules[(i % 3) + size - 8 - 3][Math.floor(i / 3)] =
        !test && ((typeNumberBits >> i) & 1) === 1;
    }
  }

  // 数据填充
  let inc = -1;
  let row = size - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (;;) {
      for (let c = 0; c < 2; c++) {
        if (modules[row][col - c] === null) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
          }
          if (maskAt(maskPattern, row, col - c)) dark = !dark;
          modules[row][col - c] = dark;
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || size <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }

  return modules;
}

/**
 * 将文本编码为二维码模块矩阵。
 * @param text 任意文本（按 UTF-8 编码）
 * @param level 纠错等级，默认 M
 */
export function encodeQr(text: string, level: QrErrorCorrectLevel = "M"): QrMatrix {
  const bytes = toUtf8Bytes(text);

  let version = 0;
  for (let candidate = 1; candidate <= MAX_VERSION; candidate++) {
    const totalDataCount = rsBlocksFor(candidate, level).reduce(
      (sum, block) => sum + block.dataCount,
      0
    );
    const neededBits = 4 + lengthInBits(candidate) + bytes.length * 8;
    if (neededBits <= totalDataCount * 8) {
      version = candidate;
      break;
    }
  }

  if (version === 0) {
    throw new Error(`二维码内容过长，最多支持 ${MAX_VERSION} 版本（约 271 字节）`);
  }

  const data = createData(bytes, version, level);

  // 逐个尝试 8 种掩码，取惩罚分最低的
  let bestPattern = 0;
  let minLostPoint = 0;
  for (let pattern = 0; pattern < 8; pattern++) {
    const modules = buildMatrix(data, version, level, pattern, true) as boolean[][];
    const point = lostPoint(modules, version * 4 + 17);
    if (pattern === 0 || minLostPoint > point) {
      minLostPoint = point;
      bestPattern = pattern;
    }
  }

  const size = version * 4 + 17;
  const modules = buildMatrix(data, version, level, bestPattern, false) as boolean[][];

  return { size, modules };
}
