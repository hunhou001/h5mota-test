import { requestGetUserInfo } from "@/services/user";
import { useState } from "react";
import { useQuery } from "react-query";
import { createModel } from "../hooks/model";
// import { combine } from "zustand/middleware";
// import { StoreApi, create } from "zustand";
// import { LocPOD, GridPOD, Loc, RectPOD, Rect } from "../coordinate";
// import { Command, EditStack, EditStackPOD } from "../editStack";
// import { Draft, produce } from "immer";
// import { useMemo } from "react";
// import { TileHelper } from "../tile";
// import { createEmptyCanvas, hueRotate, resizeWithContent } from "../canvas";

// type Tile = ImageData;

// interface DrawingBoard {
//   context: CanvasRenderingContext2D;
//   fileHandle?: FileSystemFileHandle;
//   version: number;
//   name: string;
// }

// interface Reference {
//   id: string;
//   name: string;
//   source: HTMLImageElement;
//   opacity: number;
//   hue: number;
//   selection?: RectPOD;
// }

// interface ReferenceList {
//   references: Reference[];
//   currentId?: string;
// }

// interface GlobalSetting {
//   pixelGrid: GridPOD;
// }

// interface TilesetEditorState {
//   drawingBoard: DrawingBoard;
//   references: ReferenceList;
//   globalSetting: GlobalSetting;
//   editStack: EditStackPOD;
// }

// type TilesetEditorStore = StoreApi<TilesetEditorState>;

// let set!: TilesetEditorStore["setState"];
// let get!: TilesetEditorStore["getState"];

// const emptyCanvas = document.createElement("canvas");
// const emptyContext = emptyCanvas.getContext("2d")!;
// const defaultGrid = Loc.create(32, 32);

// export const useTilesetEditorStore = create(
//   combine(
//     {
//       drawingBoard: {
//         context: createEmptyCanvas(defaultGrid),
//         version: 0,
//         fileHandle: void 0,
//         name: "新文件",
//       },
//       references: {
//         references: [],
//         currentId: void 0,
//       },
//       globalSetting: {
//         pixelGrid: defaultGrid,
//       },
//       editStack: EditStack.create(30),
//     } as TilesetEditorState,
//     (_set, _get) => {
//       set = _set;
//       get = _get;
//       return {};
//     }
//   )
// );

// export const useGlobalSetting = () =>
//   useTilesetEditorStore(({ globalSetting }) => globalSetting);
// export const useDrawingBoard = () =>
//   useTilesetEditorStore(({ drawingBoard }) => drawingBoard);
// export const useReferences = () =>
//   useTilesetEditorStore(({ references }) => references);
// export const useEditStack = () =>
//   useTilesetEditorStore(({ editStack }) => editStack);

// export const useCurrentReference = () => {
//   const { references, currentId } = useReferences();

//   const currentReference = useMemo(() => {
//     if (!currentId) return void 0;
//     return references.find((e) => e.id === currentId);
//   }, [references, currentId]);

//   return currentReference;
// };

// const registerCommand = <T extends any[], R>(command: Command<T, R>) => {
//   const executor = EditStack.registerCommand(command);

//   return (...args: T) => {
//     set(({ editStack }) => ({
//       editStack: executor(editStack, ...args),
//     }));
//   };
// };

// const modifyGlobalSetting = (action: (state: GlobalSetting) => void) => {
//   const { globalSetting } = get();
//   set({
//     globalSetting: produce(globalSetting, (globalSetting) => {
//       action(globalSetting);
//     }),
//   });
//   return globalSetting;
// };

// export const resizePixelGrid = registerCommand({
//   exec: (pixelGrid: GridPOD) => {
//     const old = modifyGlobalSetting((draft) => {
//       draft.pixelGrid = pixelGrid;
//     });
//     return old.pixelGrid;
//   },
//   discard: (pixelGrid) => {
//     modifyGlobalSetting((draft) => {
//       draft.pixelGrid = pixelGrid;
//     });
//   },
//   mergeable: true,
// });

// const updateEditStack = (action: (editStack: EditStackPOD) => EditStackPOD) => {
//   set((state) => ({
//     editStack: action(state.editStack),
//   }));
// };

// export const redo = () => {
//   updateEditStack((editStack) => EditStack.redo(editStack));
// };

// export const undo = () => {
//   updateEditStack((editStack) => EditStack.undo(editStack));
// };

// export const clearStack = () => {
//   updateEditStack((editStack) => EditStack.create(editStack.capacity));
// };

// // references相关
// const updateReferenceArray = (action: (state: Reference[]) => Reference[]) => {
//   set(({ references }) => ({
//     references: {
//       ...references,
//       references: action(references.references),
//     },
//   }));
// };

// export const modifyReference = (
//   id: string,
//   action: (state: Draft<Reference>) => void
// ) => {
//   updateReferenceArray((references) => {
//     const referenceId = references.findIndex((e) => e.id === id);
//     if (referenceId === -1) {
//       throw new Error("try to update unknown reference");
//     }
//     return produce(references, (draft) => {
//       action(draft[referenceId]);
//     });
//   });
// };

// export const openReference = (reference: Reference) => {
//   updateReferenceArray((references) => references.concat([reference]));
// };

// export const closeReference = (id: string) => {
//   updateReferenceArray((references) => references.filter((e) => e.id !== id));
// };

// export const setCurrentReferenceId = (id?: string) => {
//   const state = get();
//   set(
//     produce(state, ({ references }) => {
//       references.currentId = id;
//     })
//   );
//   // return state.references.currentId;
// };

// // SliderInput
// export const setReferenceOpacity = (id: string, opacity: number) => {
//   modifyReference(id, (reference) => {
//     reference.opacity = opacity;
//   });
// };

// export const setReferenceHue = (id: string, hue: number) => {
//   modifyReference(id, (reference) => {
//     reference.hue = hue;
//   });
// };

// export const setReferenceSelection = (id: string, selection?: RectPOD) => {
//   modifyReference(id, (reference) => {
//     reference.selection = selection as Draft<RectPOD>;
//   });
// };

// export const strokeByRect = (
//   ctx: CanvasRenderingContext2D,
//   rect: RectPOD,
//   lineWidth: number,
//   style: string
// ) => {
//   ctx.strokeStyle = style;
//   ctx.lineWidth = lineWidth;
//   const [sx, sy, dx, dy] = Rect.toQuadruple(rect);
//   const w = dx - sx - lineWidth;
//   const h = dy - sy - lineWidth;
//   ctx.strokeRect(sx + lineWidth / 2, sy + lineWidth / 2, w, h);
// };

// // drawingBoard
// const modifyDrawingBoard = (action: (state: Draft<DrawingBoard>) => void) => {
//   const { drawingBoard } = get();
//   set({
//     drawingBoard: produce(drawingBoard, (drawingBoard) => {
//       action(drawingBoard);
//     }),
//   });
//   return drawingBoard;
// };

// const updateVersion = (version: number) => {
//   const old = modifyDrawingBoard((draft) => {
//     draft.version = version;
//   });
//   return old.version;
// };

// export const putTile = registerCommand({
//   exec: (tile: Tile, loc: LocPOD): [Tile, LocPOD] => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const oldTile = TileHelper.takeTile(context, loc, [
//       tile.width,
//       tile.height,
//     ]);
//     TileHelper.putTile(context, tile, loc);
//     updateVersion(version + 1);
//     return [oldTile, loc];
//   },
//   discard: ([tile, loc]) => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     updateVersion(version - 1);
//     TileHelper.putTile(context, tile, loc);
//   },
// });

// export const drawReference = (id: string, rect: RectPOD, dest: LocPOD) => {
//   const { references } = get();
//   const reference = references.references.find((e) => e.id === id);
//   if (!reference) {
//     throw `unknown reference ${id}`;
//   }
//   const size = Rect.size(rect);
//   const [w, h] = size;
//   const ctx = createEmptyCanvas(size);
//   const [lb] = rect;
//   const [sx, sy] = lb;
//   ctx.globalAlpha = reference.opacity / 255;
//   ctx.drawImage(reference.source, sx, sy, w, h, 0, 0, w, h);
//   if (reference.hue) {
//     hueRotate(ctx, reference.hue);
//   }
//   const tile = TileHelper.takeTile(ctx, Loc.ZERO, size);
//   putTile(tile, dest);
// };

// export const changeImage = (image: HTMLImageElement, name: string) => {
//   clearStack();
//   const context = createEmptyCanvas([image.width, image.height]);
//   context.drawImage(image, 0, 0);
//   modifyDrawingBoard((draft) => {
//     draft.context = context as unknown as Draft<CanvasRenderingContext2D>;
//     draft.name = name;
//     draft.version = 0;
//   });
// };

// // canvas
// export const enlargeCanvas = registerCommand({
//   exec: ([dx, dy]: LocPOD): LocPOD => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const { width, height } = context.canvas;
//     resizeWithContent(context, [width + dx, height + dy]);
//     updateVersion(version + 1);
//     return [dx, dy];
//   },
//   discard: ([dx, dy]) => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const { width, height } = context.canvas;
//     resizeWithContent(context, [width - dx, height - dy]);
//     updateVersion(version - 1);
//   },
// });

// export const shrinkCanvasWidth = registerCommand({
//   exec: (delta: number): [number, Tile] => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const { width, height } = context.canvas;
//     const tile = TileHelper.takeTile(context, [width, 0], [delta, height]);
//     resizeWithContent(context, [width - delta, height]);
//     updateVersion(version + 1);
//     return [delta, tile];
//   },
//   discard: ([delta, tile]) => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const { width, height } = context.canvas;
//     resizeWithContent(context, [width + delta, height]);
//     TileHelper.putTile(context, tile, [width, 0]);
//     updateVersion(version - 1);
//   },
// });

// export const shrinkCanvasHeight = registerCommand({
//   exec: (delta: number): [number, Tile] => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const { width, height } = context.canvas;
//     const tile = TileHelper.takeTile(context, [0, height], [width, delta]);
//     resizeWithContent(context, [width, height - delta]);
//     updateVersion(version + 1);
//     return [delta, tile];
//   },
//   discard: ([delta, tile]) => {
//     const { drawingBoard } = get();
//     const { context, version } = drawingBoard;
//     const { width, height } = context.canvas;
//     resizeWithContent(context, [width, height + delta]);
//     TileHelper.putTile(context, tile, [0, height]);
//     updateVersion(version - 1);
//   },
// });

interface userInfoType {
  username: string;
  privileger: Object;
  id: string;
  avatar: string;
}

export const userInfoModel = createModel(() => {
  const getUserInfo = useQuery("requestGetUserInfo", async () => {
    const data = await requestGetUserInfo({});

    if (data.code === -1) {
      location.href = `https://test.mota.press/login?${new URLSearchParams({
        from: location.pathname + location.search,
      })}`;
      return null;
    } else if (data.code === 0) {
      return data.data as userInfoType;
    } else return null;
  });
  return getUserInfo.data;
});
