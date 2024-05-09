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
import { requestGetUserInfo } from "@/services/user";

const MainHeader: FC = () => {
  const getUserInfo = useQuery("requestGetUserInfo", async () => {
    const data = await requestGetUserInfo({});

    if (data.code === -1) {
      location.href = `https://test.mota.press/login?${new URLSearchParams({
        from: location.pathname + location.search,
      })}`;
      return null;
    } else if (data.code === 0) {
      return data.data;
    }
  });

  const user = getUserInfo.data as {
    username: string;
    privileger: Object;
    id: string;
    avatar: string;
  };

  const backHome = () => {
    location.href = "/";
  };

  return (
    <>
      <div className={styles.mainHeader}>
        <div className={styles.logo} onClick={backHome}>
          LOGO
        </div>
        {user?.username && (
          <div className={styles.mainHeaderRight}>
            <img
              src={"https://h5mota.com" + user?.avatar}
              className={styles.avatar}
            />
            <span>{user.username}</span>
          </div>
        )}
        {!user?.username && (
          <div className={styles.mainHeaderRight}>未登录</div>
        )}
      </div>
      <div className={styles.padding}></div>
    </>
  );
};

export default MainHeader;
