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
import { useMutation, useQuery } from "react-query";
import { openLocalImage } from "@/utils/image";
import { requestMyTower } from "@/services/user";

const MainHeader: FC = () => {
  const getMyTower = useQuery("requestMyTower", async () => {
    const data = await requestMyTower({});
    if (data.code === 0) {
      console.log(data);
      return data.data;
    }
  });

  const user = getMyTower.data as {
    username: string;
    privileger: Object;
    id: string;
    avatar: string;
  };

  const backHome = () => {
    location.href = "/";
  };

  return <>test</>;
};

export default MainHeader;
