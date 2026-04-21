import { Button, Layout, Nav, Spin, Typography } from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";
import { FC, useMemo, useState } from "react";
import { useQuery } from "react-query";
import MainHeader from "../../components/MainHeader";
import AddTower from "./AddTower";
import AdminDenied from "./AdminDenied";
import { requestGetUserInfo } from "@/services/user";
import { ShowMessage } from "@/services/utils";
import { fetchAddTowerApiPrecheck } from "@/services/admin";
import {
  canEnterAddTower,
  canEnterAdmin,
  isPrivilegerEmpty,
} from "@/utils/adminGate";
import styles from "./index.module.less";

type AdminSubKey = "addTower";

interface UserInfo {
  username: string;
  privileger: object;
  id: string;
  avatar: string;
}

const App: FC = () => {
  const [selected, setSelected] = useState<AdminSubKey>("addTower");

  const userQuery = useQuery(
    "requestGetUserInfo",
    async () => {
      const data = await requestGetUserInfo({ message: ShowMessage.None });
      if (data.code === -1) return null;
      if (data.code === 0) return data.data as UserInfo;
      return null;
    },
    { staleTime: Infinity }
  );

  const user = userQuery.data ?? null;
  const privileger = user?.privileger;
  const adminOk = user != null && canEnterAdmin(privileger);
  const addTowerOk = adminOk && canEnterAddTower(privileger);

  const addTowerPrecheckQuery = useQuery(
    ["adminAddTowerApiPrecheck", user?.id],
    () => fetchAddTowerApiPrecheck(),
    {
      enabled: Boolean(addTowerOk && selected === "addTower" && user?.id),
      retry: false,
    }
  );

  const title = useMemo(() => {
    if (selected === "addTower") return "发塔";
    return "管理";
  }, [selected]);

  if (userQuery.isLoading) {
    return (
      <>
        <MainHeader />
        <div className={styles.gateSpin}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  const backHome = (
    <Button type="primary" onClick={() => (location.href = "/")}>
      返回首页
    </Button>
  );

  if (user == null) {
    return (
      <>
        <MainHeader />
        <AdminDenied
          title="无法访问管理后台"
          description="当前未登录!"
          extra={backHome}
        />
      </>
    );
  }

  if (isPrivilegerEmpty(privileger)) {
    return (
      <>
        <MainHeader />
        <AdminDenied
          title="无法访问管理后台"
          description="您的账号没有任何管理员权限。"
          extra={backHome}
        />
      </>
    );
  }

  const renderAddTowerBody = () => {
    if (!addTowerOk) {
      return (
        <AdminDenied
          title="无发塔权限"
          description="您的账号没有发塔权限"
        />
      );
    }

    if (addTowerPrecheckQuery.isLoading) {
      return (
        <div className={styles.gateSpin}>
          <Spin tip="发塔权限校验中…" />
        </div>
      );
    }

    if (addTowerPrecheckQuery.isError) {
      return (
        <AdminDenied
          title="发塔权限校验失败"
          description="请检查网络或接口路径；详情见控制台。"
        />
      );
    }

    const preRes = addTowerPrecheckQuery.data;
    if (!preRes || preRes.code !== 0) {
      return (
        <AdminDenied
          title="发塔权限校验未通过"
          description={
            preRes && typeof preRes.message === "string" && preRes.message
              ? preRes.message
              : "请稍后重试或联系管理员"
          }
        />
      );
    }

    return <AddTower />;
  };

  return (
    <>
      <MainHeader />
      <div className={styles.adminRoot}>
        <Layout className={styles.adminLayout}>
          <Layout.Sider className={styles.sider}>
            <Nav
              mode="vertical"
              selectedKeys={[selected]}
              onSelect={({ selectedKeys }) => {
                const key = selectedKeys[0] as AdminSubKey | undefined;
                if (key) setSelected(key);
              }}
              items={[
                {
                  itemKey: "addTower",
                  text: "发塔",
                  icon: <IconUpload />,
                },
              ]}
            />
          </Layout.Sider>
          <Layout.Content className={styles.mainBranch}>
            <div className={styles.mainHeader}>
              <Typography.Title heading={2} className={styles.mainTitle}>
                {title}
              </Typography.Title>
            </div>
            <div className={styles.mainContent}>
              {selected === "addTower" && renderAddTowerBody()}
            </div>
          </Layout.Content>
        </Layout>
      </div>
    </>
  );
};

export default App;
