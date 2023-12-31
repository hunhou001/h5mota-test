import {
  drawReference,
  useCurrentReference,
  useDrawingBoard,
  useGlobalSetting,
} from "@/utils/store";
import styles from "./index.module.less";
import { FC, MouseEventHandler, useEffect, useMemo, useRef } from "react";
import { Grid } from "@/utils/coordinate";
import { fillWithTransparentMosaic, resizeAsSource } from "@/utils/canvas";

const DrawingBoard: FC = () => {
  const { pixelGrid } = useGlobalSetting();
  const { context, version, name } = useDrawingBoard();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasCtx = useMemo(
    () => canvasRef.current?.getContext("2d"),
    [canvasRef.current]
  );

  useEffect(() => {
    if (canvasCtx) {
      resizeAsSource(canvasCtx, context.canvas);
      fillWithTransparentMosaic(canvasCtx);
      canvasCtx.drawImage(context.canvas, 0, 0);
    }
  }, [context, version, canvasCtx]);

  const currentReference = useCurrentReference();

  const handleClick: MouseEventHandler = (e) => {
    if (!currentReference || !currentReference.selection) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const loc = Grid.normalizeLoc([offsetX, offsetY], pixelGrid);
    drawReference(
      currentReference.id,
      Grid.mapRect(currentReference.selection, pixelGrid),
      loc
    );
  };

  return (
    <div className={styles.drawingBoard}>
      <div className="semi-tabs-tab semi-tabs-tab-card semi-tabs-tab-top semi-tabs-tab-single semi-tabs-tab-active">
        {name ? name : "新文件"}
      </div>
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} onClick={handleClick}></canvas>
      </div>
    </div>
  );
};

export default DrawingBoard;
