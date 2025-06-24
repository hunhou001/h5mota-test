import { Collapse, Descriptions, Empty, Table, Button, Tooltip, Modal, ButtonGroup } from "@douyinfe/semi-ui";
import { IconAlertCircle, IconTickCircle, IconClear } from "@douyinfe/semi-icons";
import { FC, ReactNode, useState } from "react";
import { useQuery } from "react-query";
import styles from "./index.module.less";
import { ScoreType, requestSubmissions } from "@/services/submissions";
import { requestRecheckAllRoute, requestRecheckRoute, routemsgs as msgs, requestDownloadRoute } from "@/services/route";
import { formatTime } from "@/utils/formatTime";
import { groupBy } from "lodash-es";
import { useSearchParam } from "react-use";
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from "@douyinfe/semi-illustrations";
import MainHeader from "../../components/MainHeader";
import { requestDeleteAllRedScore, requestDeleteScore } from "@/services/tower";

const App: FC = () => {
  const columns = [   
    {
      title: "",
      width: 1
    },
    {
      title: "录像状态",
      dataIndex: "verify",
      width: 100,
      render: (text: string) => {
        let Tag = <IconClear style={{ color: "red", display: "flex", justifyContent: "center"}}/>;
        if (text == "-1") {
          Tag = <IconTickCircle style={{ color: "green", display: "flex", justifyContent: "center"}}/>;
        }
        if (text == "0" || text == "8") {
          Tag = <IconAlertCircle style={{ color: "#1890ff", display: "flex", justifyContent: "center"}}/>;
        }
        return (
          <Tooltip content={`${text}:${msgs[text]}`}>
            {Tag}
          </Tooltip>
        );
      },
    },
    {
      title: "编号",
      width: 100,
      dataIndex: "id",
    }, 
    {
      title: "分数",
      width: 200,
      dataIndex: "score",
    },
    {
      title: "提交者",
      dataIndex: "userid",
    },
    {
      title: "提交时间",
      dataIndex: "submit_time",
    },
    {
      title: "录像",
      render: (text: string, record: ScoreType) => (
        <ButtonGroup type='secondary'>
          <Button onClick={() => recheckAction(record.id, record.name)}>重跑</Button>
          <Button onClick={() => downloadRoute(record.id)}>下载</Button>
          <Button onClick={() => deleteScore(record.id)}>删除</Button>
        </ButtonGroup>
        
      ),
    },
  ];

  const recheckAction = (id: number, name: string) => {
    Modal.confirm({ title: '确认框', content: '确认要重跑这个录像吗？(请耐心等待录像跑完)', onOk: async () => {
      await requestRecheckRoute({ id: id.toString(), name: name });
      //setVisible(false);
      Modal.confirm({ title: '确认框', content: '是否要查看录像检测日志？', onOk: async () => {
        window.location.href = `/workbench/route?id=${id}`;
      }})
    }});
  }

  const downloadRoute = async (id: number) => Modal.confirm({ title: '确认框', content: '确认要下载该录像吗？', onOk: async () => {
    const res = await requestDownloadRoute(id.toString());
    const link = document.createElement('a');
    const disposition = res.headers['content-disposition'];
    const filename = disposition.substring(disposition.lastIndexOf("filename=") + 9);
    console.log(disposition, filename)
    link.href = URL.createObjectURL(res.data);
    link.download = filename;
    link.click();
  }});

  // const [ScoreData, setScoreData] = useState<ScoreType[]>([]);

  const expandRowRender = (record?: ScoreType, index?: number) => {
    if (record === void 0) return;
    const { atk, def, mdef, money, experience } = JSON.parse(record.detail);
    const data = [
      { key: "攻击", value: atk },
      { key: "防御", value: def },
      { key: "魔防", value: mdef },
      { key: "金币", value: money },
      { key: "经验", value: experience },
    ];
    return <Descriptions row data={data} />;
  };

  const getScoreData = useQuery("requestSubmissions", async () => {
    if (!towername) return [];
    const data = await requestSubmissions({ tower_name: towername });
    if (data.code === 0) {
      data.data.forEach((element) => {
        element.submit_time = formatTime(parseInt(element.submit_time) / 1000);
      });
      const _data = Object.entries(groupBy(data.data, "hard")).map(
        ([hard, submissions]) => [
          hard,
          Object.entries(groupBy(submissions, "ending")),
        ]
      );
      return _data;
    }

    return [];
  });

  const towername = useSearchParam("tower_name");
  const ScoreData = getScoreData.data as [string, [string, ScoreType[]][]][];

  const recheckAllRoute = async () => {
    Modal.confirm({ title: '确认框', content: '确认要重跑本塔所有录像吗？', onOk: async () => {
      if (towername) {
        await requestRecheckAllRoute({name: towername});
        window.location.reload()
      }
    }});
  }

  const deleteScore = async (id: number) => {
    Modal.confirm({ title: '确认框', content: '确认要删除该成绩吗？', onOk: async () => {
      if (towername) {
        await requestDeleteScore({name: towername, id: id});
        getScoreData.refetch();
      }
    }});
  }

  const deleteAllRedScore = async () => {
    Modal.confirm({ title: '确认框', content: '确认要删除该成绩吗？', onOk: async () => {
      if (towername) {
        await requestDeleteAllRedScore({name: towername});
        window.location.reload()
      }
    }});
  }

  return (
    <>
      <MainHeader />
      <div className={styles.mainCard}>
        <h2>测试员成绩</h2>
        { towername &&
          <div>
            <Button type="primary" onClick={recheckAllRoute}> 重跑全部录像 </Button>
            <Button type="primary" onClick={deleteAllRedScore}> 删除全部红色成绩 </Button>
          </div>
        }
        {ScoreData &&
          ScoreData.map(([hard, oneHard]) => (
            <div className={styles.Table}>
              <h3>{hard}</h3>
              <Collapse>
                {oneHard &&
                  oneHard.map(([ending, scoredata], index) => (
                    <Collapse.Panel itemKey={index.toString()} header={ending}>
                      <Table
                        rowKey={"id"}
                        dataSource={scoredata}
                        columns={columns}
                        expandedRowRender={expandRowRender}
                        pagination={false}
                      />
                    </Collapse.Panel>
                  ))}
              </Collapse>
            </div>
          ))}

        {(!ScoreData || ScoreData.length === 0) && (
          <Empty
            className={styles.Table}
            image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
            }
            description={"搜索无结果"}
          />
        )}
      </div>
    </>
  );
};

export default App;
