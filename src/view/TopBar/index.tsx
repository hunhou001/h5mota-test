import { CONFIG_KEY } from "@/const";
import { Grid } from "@/utils/coordinate";
import {
  useEditStack,
  useGlobalSetting,
  resizePixelGrid,
  undo,
  redo,
  useDrawingBoard,
  changeImage,
  enlargeCanvas,
} from "@/utils/store";
import { OptionProps } from "@douyinfe/semi-ui/lib/es/select";
import { FC, useMemo } from "react";
import { useKey, useLocalStorage } from "react-use";
import { usePixelGridOptionsModal } from "./usePixelGridOptionsModal";
import { Banner, Button, Select, Toast, Typography } from "@douyinfe/semi-ui";
import {
  IconDownload,
  IconImage,
  IconPlus,
  IconRedo,
  IconSave,
  IconUndo,
} from "@douyinfe/semi-icons";
import { EditStack } from "@/utils/editStack";
import styles from "./index.module.less";
import { withResolvers } from "@/utils/hooks/useResolver";
import { SUPPORT_FS, downloadFile, saveImageToLocalFS } from "@/utils/file";
import { useMutation } from "react-query";
import { openLocalImage } from "@/utils/image";

const TopBar: FC = () => {
  const globalSetting = useGlobalSetting();
  const editStack = useEditStack();
  const { context, name } = useDrawingBoard();
  const { pixelGrid } = useGlobalSetting();

  const { width, height } = context.canvas;
  const contextIsNormal = Grid.isNormalLoc([width, height], pixelGrid);

  const fixDrawingBoard = () => {
    const [nw, nh] = Grid.mapLoc(
      Grid.unmapLoc([width, height], pixelGrid, true),
      pixelGrid
    );
    enlargeCanvas([nw - width, nh - height]);
  };

  const [rawPixelGridOptions = ["32x32", "32x48"], setRawPixelGridOptions] =
    useLocalStorage<string[]>(CONFIG_KEY.PixelGridOptions);
  const pixelGridOptions = useMemo(
    () => rawPixelGridOptions.map((e): OptionProps => ({ value: e, label: e })),
    [rawPixelGridOptions]
  );

  const downloadImageMutation = useMutation(async () => {
    const { promise, resolve } = withResolvers();
    context.canvas.toBlob(async (blob) => {
      if (blob) {
        await downloadFile(blob, name ? name : "新文件.png");
      } else {
        Toast.error("导出失败");
      }
      resolve();
    });
    return promise;
  });
  const saveImageMutation = useMutation(async () => {
    const { promise, resolve } = withResolvers();
    context.canvas.toBlob(async (blob) => {
      if (blob) {
        await saveImageToLocalFS(blob, name ? name : "新文件.png");
      } else {
        Toast.error("导出失败");
      }
      resolve();
    });
    return promise;
  });

  const openImageMutation = useMutation(async () => {
    const result = await openLocalImage();
    if (!result) return;
    const { source, name } = result;
    changeImage(source, name);
  });

  const pixelGridOptionsModal = usePixelGridOptionsModal();
  const canUndo = EditStack.canUndo(editStack);
  const canRedo = EditStack.canRedo(editStack);

  useKey(
    (e) => (e.ctrlKey || e.metaKey) && e.key === "z",
    (e) => {
      if (canUndo) {
        undo();
      }
      e.preventDefault();
    }
  );

  useKey(
    (e) => (e.ctrlKey || e.metaKey) && e.key === "y",
    (e) => {
      if (canRedo) {
        redo();
      }
      e.preventDefault();
    }
  );

  return (
    <span>
      <label>网格尺寸:</label>
      <Select
        style={{ marginLeft: 2, width: 160 }}
        optionList={pixelGridOptions}
        value={Grid.dump(globalSetting.pixelGrid)}
        onChange={(val) => {
          const grid = Grid.load(val as string);
          resizePixelGrid(grid);
        }}
      />

      <Button
        className={styles.item}
        icon={<IconPlus />}
        onClick={() => {
          pixelGridOptionsModal.open(rawPixelGridOptions).then((options) => {
            setRawPixelGridOptions(options);
          });
        }}
      />
      {pixelGridOptionsModal.modal}

      <Button
        className={styles.item}
        icon={<IconUndo />}
        disabled={!canUndo}
        onClick={undo}
      />
      <Button
        className={styles.item}
        icon={<IconRedo />}
        disabled={!canRedo}
        onClick={redo}
      />

      <Button
        type="primary"
        icon={<IconImage />}
        onClick={() => openImageMutation.mutate()}
      >
        打开图片
      </Button>

      {!contextIsNormal && (
        <Banner
          type="danger"
          description={
            <span>
              当前图片的尺寸为{width}x{height}
              ，与网格尺寸不匹配，可能导致编辑错误，请更换图片或
              <Typography.Text link onClick={fixDrawingBoard}>
                进行修复
              </Typography.Text>
            </span>
          }
          closeIcon={null}
        />
      )}

      {SUPPORT_FS ? (
        <Button
          className={styles.item}
          type="primary"
          icon={<IconSave />}
          onClick={() => saveImageMutation.mutate()}
        >
          另存为
        </Button>
      ) : (
        <Button
          className={styles.item}
          type="primary"
          icon={<IconDownload />}
          onClick={() => downloadImageMutation.mutate()}
        >
          下载
        </Button>
      )}
    </span>
  );
};

export default TopBar;
