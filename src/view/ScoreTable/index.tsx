import { Collapse, Descriptions, Empty, List, Table } from "@douyinfe/semi-ui";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import styles from "./index.module.less";
import { ScoreType, requestSubmissions } from "@/services/submissions";
import { formatTime } from "@/utils/formatTime";
import { groupBy } from "lodash-es";
import { useSearchParam } from "react-use";
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from "@douyinfe/semi-illustrations";

const ScoreTable: FC = () => {
  const columns = [
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
      dataIndex: "name",
    },
    {
      title: "提交时间",
      dataIndex: "submit_time",
    },
  ];

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

  return (
    <>
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
    </>
  );
};

export default ScoreTable;
