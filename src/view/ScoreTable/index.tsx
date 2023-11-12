import { Descriptions, Table } from "@douyinfe/semi-ui";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import styles from "./index.module.less";
import { ScoreType, requestSubmissions } from "@/services/submissions";
import { formatTime } from "@/utils/formatTime";

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

  const expandRowRender = (record?: object, index?: number) => {
    if (index === void 0) return;
    const { atk, def, mdef, money, experience } = JSON.parse(
      ScoreData[index].detail
    );
    const data = [
      { key: "攻击", value: atk },
      { key: "防御", value: def },
      { key: "魔防", value: mdef },
      { key: "金币", value: money },
      { key: "经验", value: experience },
    ];
    return <Descriptions row data={data} />;
  };

  const getScoreData = useQuery([], async () => {
    const data = await requestSubmissions({ tower_name: "template" });
    if (data.code === 0) {
      data.data.forEach((element) => {
        element.submit_time = formatTime(parseInt(element.submit_time) / 1000);
      });
      return data.data;
    }

    return [];
  });

  const ScoreData = getScoreData.data as ScoreType[];

  return (
    <>
      <Table
        rowKey={"id"}
        dataSource={ScoreData}
        columns={columns}
        expandedRowRender={expandRowRender}
        pagination={false}
        className={styles.Table}
      />
    </>
  );
};

export default ScoreTable;
