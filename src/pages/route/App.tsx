import { TextArea, Layout, Button, Modal } from "@douyinfe/semi-ui";
import { FC } from "react";
import styles from "./index.module.less";
import { requestGetRouteLog, requestRecheckRoute } from "@/services/route";
import { useSearchParam } from "react-use";
import MainHeader from "../../components/MainHeader";
import { useQuery } from "react-query";

const App: FC = () => {

  const { Header, Sider, Content} = Layout
  const id = useSearchParam("id");

  const modifyLog = useQuery("requestGetRouteLog", async() => {
    if (id) {
      const data = await requestGetRouteLog({ id })
      if (data.code == 0) {
        return data;
      }
      else {
        return { code: data.code, data: "录像不存在或已过期", name: '' }
      }
    }
    return { data: "无效的录像编号"};
  })


  const replayRoute = () => {
    Modal.confirm({ title: '确认框', content: '确认要重跑这个录像吗？(请耐心等待录像跑完)', onOk: async () => {
      if (id && modifyLog.data?.code == 0) {
        await requestRecheckRoute({ id: id, name: modifyLog.data.name });
        window.location.href = `/workbench/route?id=${id}`;        
      }
    }});
  }

  return (
    <>
     <MainHeader />
      <Layout>
        <Header>
          { modifyLog.data?.code == 0 && <Button theme='borderless' className={styles.VerticalBtn} onClick={replayRoute}> 再次重跑 </Button> }
        </Header>
        <Sider>
        </Sider>
        <Content>
          <TextArea
            style={{ left: "50px" }}
            autosize
            value={modifyLog.data ? modifyLog.data.data : "连接出错"}
          />
        </Content>
      </Layout>
    </>
  );
};

export default App;
