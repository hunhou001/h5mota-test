import { FC, useMemo } from "react";
import styles from "./index.module.less";
import { useMutation, useQuery } from "react-query";
import { requestGetUserInfo } from "@/services/user";
import { userInfoModel } from "@/utils/store";

const MainHeader: FC = () => {
  // const getUserInfo = useQuery("requestGetUserInfo", async () => {
  //   const data = await requestGetUserInfo({});

  //   if (data.code === -1) {
  //     location.href = `https://test.mota.press/login?${new URLSearchParams({
  //       from: location.pathname + location.search,
  //     })}`;
  //     return null;
  //   } else if (data.code === 0) {
  //     return data.data;
  //   } else return null;
  // });

  // const user = getUserInfo.data as {
  //   username: string;
  //   privileger: Object;
  //   id: string;
  //   avatar: string;
  // };

  const user = userInfoModel();

  const backHome = () => {
    location.href = "/workbench/";
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
