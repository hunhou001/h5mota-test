import { FC, useMemo } from "react";
import { useQuery } from "react-query";
import { requestMyTestTower, requestMyTower, towerInfo } from "@/services/user";
import styles from "./index.module.less";
import { Button, Empty, Table, Typography, Modal } from "@douyinfe/semi-ui";
import { IconLock } from "@douyinfe/semi-icons";
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from "@douyinfe/semi-illustrations";
import { formatTime } from "@/utils/formatTime";
import { userInfoModel } from "@/utils/store";
import { requestEditTower } from "@/services/tower";
const { Column } = Table;
const { Text } = Typography;

const App: FC = () => {
  const getMyTower = useQuery("requestMyTower", async () => {
    const data = await requestMyTower({});
    if (data.code === 0) {
      let index = 0;
      return data.data.map((ele) => {
        return {
          ...ele,
          update_time: ele.update_time / 1000,
          create_time: ele.create_time / 1000,
          key: (index++).toString(),
        };
      });
    }
  });

  const getMyTest = useQuery("requestMyTest", async () => {
    const data = await requestMyTestTower({});
    if (data.code === 0) {
      let index = 0;
      return data.data.map((ele) => {
        return {
          ...ele,
          update_time: ele.update_time / 1000,
          create_time: ele.create_time / 1000,
          key: (index++).toString(),
        };
      });
    }
  });

  let myTowers = getMyTower.data as towerInfo[];
  if (myTowers) {
    // 锁定塔放在后面
    myTowers = myTowers.sort((a, b) => a.disabled - b.disabled)
  }
  const myTests = getMyTest.data as towerInfo[];
  const user = userInfoModel();
  // const user = null;

  return (
    <>
      <div className={styles.mainCard}>
        <h2>便捷功能</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={() => (location.href = "/workbench/applytower")}>
            发新塔
          </Button>
          <Button onClick={() => (location.href = "/login")}>
            {user ? "切号" : "登录"}
          </Button>
        </div>
      </div>
      {user && (
        <>
          <div className={styles.mainCard}>
            <h2>我发的塔</h2>
            {myTowers && (
              <Table dataSource={myTowers} pagination={false}>
                <Column title={() => <Text style={{display:"flex", justifyContent:"center"}}>锁定</Text>} dataIndex="disabled" key="lock" width={100} render={(text) => {
                  if (text != 0) return <IconLock style={{color:"var(--semi-color-link)", display: "flex", justifyContent: "center"}}/>
                }}>
                </Column>
                <Column title="name" dataIndex="name" key="name" width={100} />
                <Column
                  title="标题"
                  dataIndex="title"
                  key="title"
                  width={250}
                />
                <Column
                  title="更新时间"
                  dataIndex="update_time"
                  key="update_time"
                  render={(text) => <div>{formatTime(text)}</div>}
                  width={150}
                />
                <Column
                  title="发布状况"
                  dataIndex="are_you_ready"
                  key="are_you_ready"
                  render={(text) => {
                    if (text) return <div>已发布</div>;
                    else return <div>测试中</div>;
                  }}
                />
                <Column
                  title=""
                  dataIndex="operate"
                  key="operate"
                  width={200}
                  render={(text, record) => (
                    <div className={styles.linkButton}>
                      <Text link={{ href: "/towers/" + record.name + "/" }}>
                        进入游戏
                      </Text>
                      <Text
                        link={{
                          href: "/workbench/tower/?tower_name=" + record.name,
                        }}
                      >
                        成绩
                      </Text>
                      <Text
                        link={{
                          href: "/workbench/info/?tower_name=" + record.name,
                        }}
                      >
                        修改信息
                      </Text>
                      <Text
                        link={{}}
                        onClick={() => {
                          Modal.confirm({ title: '确认框', content: '确认要锁定这个塔吗？\n锁定后的塔不会再出现在测试员的【我测的塔】列表中。', onOk: async () => {
                            requestEditTower({name: record.name, disabled: 1});
                          }})
                        }}
                      >
                        锁定
                      </Text>
                    </div>
                  )}
                />
              </Table>
            )}
            {!myTowers && (
              <Empty
                image={
                  <IllustrationNoResult style={{ width: 150, height: 150 }} />
                }
                darkModeImage={
                  <IllustrationNoResultDark
                    style={{ width: 150, height: 150 }}
                  />
                }
                description={"暂无已发的塔"}
              ></Empty>
            )}
          </div>
          <div className={styles.mainCard}>
            <h2>我测的塔</h2>
            {myTests && (
              <Table dataSource={myTests} pagination={false}>
                <Column title="name" dataIndex="name" key="name" width={100} />
                <Column
                  title="标题"
                  dataIndex="title"
                  key="title"
                  width={250}
                />
                <Column
                  title="更新时间"
                  dataIndex="update_time"
                  key="update_time"
                  render={(text) => <div>{formatTime(text)}</div>}
                  width={150}
                />
                <Column
                  title="发布状况"
                  dataIndex="are_you_ready"
                  key="are_you_ready"
                  render={(text) => {
                    if (text) return <div>已发布</div>;
                    else return <div>测试中</div>;
                  }}
                />
                <Column
                  title=""
                  dataIndex="operate"
                  key="operate"
                  width={200}
                  render={(text, record) => (
                    <div className={styles.linkButton}>
                      <Text link={{ href: "/towers/" + record.name + "/" }}>
                        进入游戏
                      </Text>
                      <Text
                        link={{
                          href: "/workbench/tower/?tower_name=" + record.name,
                        }}
                      >
                        成绩
                      </Text>
                    </div>
                  )}
                />
              </Table>
            )}
            {!myTests && (
              <Empty
                image={
                  <IllustrationNoResult style={{ width: 150, height: 150 }} />
                }
                darkModeImage={
                  <IllustrationNoResultDark
                    style={{ width: 150, height: 150 }}
                  />
                }
                description={"暂无已发的塔"}
              ></Empty>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default App;
