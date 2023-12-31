import {
  copyCanvas,
  fillWithTransparentMosaic,
  hueRotate,
} from "@/utils/canvas";
import { openLocalImage } from "@/utils/image";
import {
  useGlobalSetting,
  useReferences,
  openReference,
  setCurrentReferenceId,
  useCurrentReference,
  closeReference,
  setReferenceOpacity,
  setReferenceHue,
  strokeByRect,
  setReferenceSelection,
} from "@/utils/store";
import { IconPlus, IconImage } from "@douyinfe/semi-icons";
import { Button, Empty, Tabs } from "@douyinfe/semi-ui";
import { uniqueId } from "lodash-es";
import { FC, useMemo, useRef, useEffect, MouseEventHandler } from "react";
import styles from "./index.module.less";
import { useMutation } from "react-query";
import { useNodeRef } from "@/utils/hooks/useNodeRef";
import SliderInput from "./SliderInput";
import { Grid, Loc, LocPOD, Rect } from "@/utils/coordinate";

const References: FC = () => {
  const { pixelGrid } = useGlobalSetting();

  const { references } = useReferences();

  const tabList = useMemo(
    () =>
      references.map((e) => ({ tab: e.name, itemKey: e.id, closable: true })),
    [references]
  );

  const openReferenceMutation = useMutation(async () => {
    const result = await openLocalImage();
    if (!result) return;
    const { source, name } = result;
    const id = uniqueId("reference");
    openReference({
      id,
      name,
      source,
      opacity: 255,
      hue: 0,
      selection: undefined,
    });
    setCurrentReferenceId(id);
  });

  const currentReference = useCurrentReference();

  // const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasRef, mountRef] = useNodeRef<HTMLCanvasElement>();

  const canvasCtx = useMemo(
    () => canvasRef.current?.getContext("2d"),
    [canvasRef.current]
  );

  const mouseSession = useRef<LocPOD>();

  const handleMouseDown: MouseEventHandler = (e) => {
    if (!currentReference) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const loc = Grid.unmapLoc([offsetX, offsetY], pixelGrid);
    mouseSession.current = loc;
    setReferenceSelection(currentReference.id, [loc, Loc.add(loc, [1, 1])]);
  };

  const handleMouseMove: MouseEventHandler = (e) => {
    if (!mouseSession.current || !currentReference) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const loc = Grid.unmapLoc([offsetX, offsetY], pixelGrid);
    const start = mouseSession.current;
    const rect = Rect.fromLocs([
      loc,
      Loc.add(loc, [1, 1]),
      start,
      Loc.add(start, [1, 1]),
    ]);
    setReferenceSelection(currentReference.id, rect);
  };

  const handleMouseUp: MouseEventHandler = (e) => {
    if (!mouseSession.current || !currentReference) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const loc = Grid.unmapLoc([offsetX, offsetY], pixelGrid);
    const start = mouseSession.current;
    const rect = Rect.fromLocs([
      loc,
      Loc.add(loc, [1, 1]),
      start,
      Loc.add(start, [1, 1]),
    ]);
    // setReferenceSelection(currentReference.id, rect);
    mouseSession.current = void 0;
  };

  useEffect(() => {
    if (canvasCtx && currentReference) {
      copyCanvas(canvasCtx, currentReference.source);
      fillWithTransparentMosaic(canvasCtx);

      canvasCtx.globalAlpha = currentReference.opacity / 255;
      canvasCtx.drawImage(currentReference.source, 0, 0);
      canvasCtx.globalAlpha = 1;
      if (currentReference.hue !== 0) {
        hueRotate(canvasCtx, currentReference.hue);
      }

      if (currentReference.selection) {
        const [lb, rt] = Grid.mapRect(currentReference.selection, pixelGrid);
        const BORDER_COLOR = "#000000";
        const BORDER_WIDTH = 1;
        const LINE_COLOR = "#FFFFFF";
        const LINE_WIDTH = 2;
        strokeByRect(
          canvasCtx,
          [lb, rt],
          BORDER_WIDTH * 2 + LINE_WIDTH,
          BORDER_COLOR
        );
        strokeByRect(
          canvasCtx,
          [
            Loc.add(lb, [BORDER_WIDTH, BORDER_WIDTH]),
            Loc.add(rt, [-BORDER_WIDTH, -BORDER_WIDTH]),
          ],
          LINE_WIDTH,
          LINE_COLOR
        );
      }
    }
  }, [currentReference, canvasCtx, pixelGrid]);

  return (
    <>
      {references.length > 0 ? (
        <Tabs
          className={styles.tab}
          type="card"
          tabList={tabList}
          tabBarExtraContent={
            <Button
              icon={<IconPlus />}
              loading={openReferenceMutation.isLoading}
              onClick={() => openReferenceMutation.mutate()}
            />
          }
          activeKey={currentReference?.id}
          onTabClick={(key) => {
            setCurrentReferenceId(key);
          }}
          onTabClose={(key) => {
            const index = references.findIndex((e) => e.id === key);
            const nextIndex = index === 0 ? 1 : index - 1;
            const next = references[nextIndex];
            if (next) {
              setCurrentReferenceId(next.id);
            } else {
              setCurrentReferenceId();
            }
            closeReference(key);
          }}
        >
          {currentReference && (
            <>
              <div className={styles.canvasContainer} onMouseUp={handleMouseUp}>
                <canvas
                  ref={mountRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                ></canvas>
              </div>

              <div className={styles.canvasItem}>
                <label>不透明度:</label>
                <SliderInput
                  min={0}
                  max={255}
                  value={currentReference.opacity}
                  onChange={(val) =>
                    setReferenceOpacity(currentReference.id, val as number)
                  }
                />
              </div>
              <div className={styles.canvasItem}>
                <label>色相:</label>
                <SliderInput
                  value={currentReference.hue}
                  min={0}
                  max={330}
                  step={30}
                  onChange={(val) =>
                    setReferenceHue(currentReference.id, val as number)
                  }
                />
              </div>
            </>
          )}
        </Tabs>
      ) : (
        <div className={styles.empty}>
          <Empty description="打开本地文件作为参照">
            <Button
              type="primary"
              icon={<IconImage />}
              loading={openReferenceMutation.isLoading}
              onClick={() => openReferenceMutation.mutate()}
            >
              打开文件
            </Button>
          </Empty>
        </div>
      )}
    </>
  );
};

export default References;
