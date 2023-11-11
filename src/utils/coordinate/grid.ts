import { LocPOD } from "./loc";
import { RectPOD } from "./rect";

export type GridPOD = Readonly<[width: number, height: number]>;

export class Grid {
  static create(width: number, height: number): GridPOD {
    return [width, height];
  }

  static mapLoc([x, y]: LocPOD, [width, height]: GridPOD): LocPOD {
    return [x * width, y * height];
  }

  static unmapLoc(
    [x, y]: LocPOD,
    [width, height]: GridPOD,
    ceil = false
  ): LocPOD {
    if (ceil) {
      return [Math.ceil(x / width), Math.ceil(y / height)];
    } else {
      return [Math.floor(x / width), Math.floor(y / height)];
    }
  }

  static normalizeLoc(loc: LocPOD, grid: GridPOD) {
    return Grid.mapLoc(Grid.unmapLoc(loc, grid), grid);
  }

  static toLoc([width, height]: GridPOD): LocPOD {
    return [width, height];
  }
  static dump(grid: GridPOD) {
    return grid.join("x");
  }

  static load(str: string): GridPOD {
    const [x, y] = str.split("x");
    return [Number(x), Number(y)];
  }

  static mapRect([lb, rt]: RectPOD, grid: GridPOD): RectPOD {
    return [Grid.mapLoc(lb, grid), Grid.mapLoc(rt, grid)];
  }

  static isNormalLoc([x, y]: LocPOD, [w, h]: GridPOD): boolean {
    return x % w === 0 && y % h === 0;
  }
}
