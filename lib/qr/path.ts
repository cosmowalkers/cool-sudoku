/**
 * 把二维码模块矩阵转成单条 SVG path。
 * 同一行内连续的深色模块合并为一条子路径，减少节点数量。
 */
export function qrToPath(modules: boolean[][]): string {
  const parts: string[] = [];

  for (let y = 0; y < modules.length; y++) {
    const row = modules[y];
    let x = 0;

    while (x < row.length) {
      if (!row[x]) {
        x++;
        continue;
      }

      let run = 0;
      while (x + run < row.length && row[x + run]) run++;

      parts.push(`M${x} ${y}h${run}v1H${x}z`);
      x += run;
    }
  }

  return parts.join("");
}
