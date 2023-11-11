/** POD 形式的坐标 */
export type LocPOD = Readonly<[number, number]>;

export class Loc {
  static ZERO: LocPOD = [0, 0];

  static create(x: number, y: number): LocPOD {
    return [x, y];
  }

  static add([ax, ay]: LocPOD, [bx, by]: LocPOD): LocPOD {
    return [ax + bx, ay + by];
  }
}
