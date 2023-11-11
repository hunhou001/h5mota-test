import { LocPOD, RectPOD } from "./coordinate";
import { defineCommand } from "./editStack";

type Tile = ImageData;

export const takeTile = (
  ctx: CanvasRenderingContext2D,
  [[sx, sy], [dx, dy]]: RectPOD
) => {
  return ctx.getImageData(sx, sy, dx, dy);
};

export const drawTile = (
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  [dx, dy]: LocPOD
) => {
  ctx.putImageData(tile, dx, dy);
};

export const TileCommands = {
  drawTile: defineCommand({
    exec: (
      ctx: CanvasRenderingContext2D,
      tile: Tile,
      loc: LocPOD
    ): [CanvasRenderingContext2D, Tile, LocPOD] => {
      const oldTile = takeTile(ctx, [loc, [tile.width, tile.height]]);
      drawTile(ctx, tile, loc);
      return [ctx, oldTile, loc];
    },
    discard: ([ctx, tile, loc]) => {
      drawTile(ctx, tile, loc);
    },
  }),
};

export class TileHelper {
  static takeTile(
    ctx: CanvasRenderingContext2D,
    [sx, sy]: LocPOD,
    [sw, sh]: LocPOD
  ) {
    return ctx.getImageData(sx, sy, sw, sh);
  }

  static putTile(ctx: CanvasRenderingContext2D, tile: Tile, [dx, dy]: LocPOD) {
    ctx.putImageData(tile, dx, dy);
  }
}
