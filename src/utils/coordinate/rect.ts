import { LocPOD } from "./loc";
import { range, unzip } from "lodash-es";

/** POD 形式的矩形，用左下右上顶点的坐标表示 */
export type RectPOD = Readonly<[lb: LocPOD, rt: LocPOD]>;

export class Rect {
  static create(lb: LocPOD, rt: LocPOD): RectPOD {
    return [lb, rt];
  }

  static addLoc([lb, rt]: RectPOD, [x, y]: LocPOD) {
    const [sx, sy] = lb;
    const [dx, dy] = rt;
    return [
      [Math.min(sx, x), Math.min(sy, y)],
      [Math.max(dx, x), Math.max(dy, y)],
    ];
  }

  static travasalLoc<R>([lb, rt]: RectPOD, visitor: (loc: LocPOD) => R): R[][] {
    const [sx, sy] = lb;
    const [dx, dy] = rt;
    return range(sx, dx).map((y) => range(sy, dy).map((x) => visitor([x, y])));
  }

  static toQuadruple([lb, rt]: RectPOD) {
    const [sx, sy] = lb;
    const [dx, dy] = rt;
    return [sx, sy, dx, dy];
  }

  static size(rect: RectPOD): LocPOD {
    const [sx, sy, dx, dy] = Rect.toQuadruple(rect);
    return [dx - sx, dy - sy];
  }

  static fromLocs(locs: LocPOD[]): RectPOD {
    const [xs, ys] = unzip(locs);
    const sx = Math.min(...xs);
    const sy = Math.min(...ys);
    const dx = Math.max(...xs);
    const dy = Math.max(...ys);
    return [
      [sx, sy],
      [dx, dy],
    ];
  }
}
