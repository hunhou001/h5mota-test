import {
  Badge,
  Button,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Toast,
  Upload,
} from "@douyinfe/semi-ui";
import { FC, useState } from "react";
import styles from "./index.module.less";
import {
  requestDeleteTower,
  requestEditTower,
  requestEditTowerInfo,
  requestTowerFileUpdate,
} from "@/services/tower";
import { useSearchParam } from "react-use";
import { useQuery } from "react-query";
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from "@douyinfe/semi-illustrations";
import Section from "@douyinfe/semi-ui/lib/es/form/section";
import { IconPlus } from "@douyinfe/semi-icons";
import { customRequestArgs } from "@douyinfe/semi-ui/lib/es/upload";
import MainHeader from "../../components/MainHeader";

const App: FC = () => {
  // const initValue = {
  //   name: "",
  //   title: "",
  //   tester: [] as string[],
  // };
  const getInitValue = useQuery("requestEditTowerInfo", async () => {
    if (!towername)
      return {
        name: "",
        title: "",
        tester: [] as string[],
      };

    const data = await requestEditTowerInfo({ tower_name: towername });
    if (data.code === 0) {
      const t = JSON.parse(data.data[0].tester);
      return {
        ...data.data[0],
        tester: t,
      };
    }

    return {
      name: "",
      title: "",
      tester: [] as string[],
    };
  });

  const initValue = getInitValue.data as {
    name: string;
    title: string;
    tester: string[];
  };
  const towername = useSearchParam("tower_name");
  const strokeArr = [
    { percent: 0, color: "blue" },
    { percent: 100, color: "hsla(125, 50%, 46% / 1)" },
  ];
  const [uploadProgress, setProgress] = useState<number>(0);

  const validateName = (name: string) => {
    if (!name) return "英文名不能为空！";
    if (!/^\w+$/.test(name)) return "英文名需要由字母、数字、下划线组成！";
    return "";
  };

  const validateTesters = (testers: string[]) => {
    const t: string[] = [];
    if (testers.length > 10) return "输入测试员数量过多";
    for (const tester of testers) {
      if (t.includes(tester)) return "不得重复输入测试id";
      t.push(tester);
      if (!/^\d{4,5}$/.test(tester)) return "请输入正确uid";
    }
    return "";
  };

  const validateTitle = (title: string) => {
    if (!title) return "中文名不能为空！";
    return "";
  };

  const validateFile = (file: File | undefined) => {
    if (!file) return "未传入压缩包！";
    if (!file.name.endsWith(".zip")) return "文件格式不符！";
    return "";
  };

  const handleSubmit = async (value: typeof initValue) => {
    const validate =
      validateName(value.name) ||
      validateTesters(value.tester) ||
      validateTitle(value.title);
    if (validate) {
      Toast.error(validate);
      return;
    }
    const data = await requestEditTower({
      ...value,
    });
  };

  const handleUploadFile = async ({
    file,
    onProgress,
    onError,
    onSuccess,
  }: customRequestArgs) => {
    if (validateFile(file.fileInstance)) {
      Toast.error(validateFile(file.fileInstance));
      return;
    }
    if (!file.fileInstance) return;
    const data = await requestTowerFileUpdate(
      {
        file: file.fileInstance,
        name: initValue.name,
      },
      {
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(((e.loaded / e.total) * 100) | 0);
        },
      }
    );
    if (data.code === 0) {
      onSuccess(data.message);
      setProgress(0);
    } else if (data.code === -4) {
      Modal.error({
        title: "发布失败",
        width: "85%",
        content: <pre className={styles.message}>{data.data?.message}</pre>,
      });
    } else onError({});
  };

  const handleDelete = async (name: string) => {
    Modal.confirm({
      title: "确认删除塔？",
      content: `删除塔 ${name} 将会删除所有数据，且无法恢复。如果不确定可以改为在首页选择锁定`,
      onOk: async () => {
        const res = await requestDeleteTower({ name });
        if (res.code === 0) {
          Toast.success("删除成功");
          location.href = "/workbench";
        } else {
          Toast.error("删除失败");
        }
      },
    });
  };

  return (
    <>
      <MainHeader />
      {initValue && initValue.name === towername && (
        <>
          <Form className={styles.towerInfo}>
            {({ formState, values, formApi }) => (
              <>
                <Section text={"本塔信息"}>
                  <Row>
                    <Form.Input
                      field="name"
                      label="塔的英文标识符（英文，无空格，来自全塔属性name项目）"
                      validate={validateName}
                      disabled={true}
                      initValue={initValue.name}
                    ></Form.Input>
                    <Form.Input
                      field="title"
                      label="塔的中文名"
                      validate={validateTitle}
                      initValue={initValue.title}
                    ></Form.Input>
                    <Form.TagInput
                      field="tester"
                      label="测试员列表（填数字uid，最多十人，以回车分割不同测试员）"
                      validate={validateTesters}
                      initValue={initValue.tester}
                    ></Form.TagInput>
                  </Row>
                </Section>
                <Button onClick={() => handleSubmit(values)}>修改</Button>
                <Button onClick={() => handleDelete(values.name)}>删除</Button>
              </>
            )}
          </Form>
          <Section
            className={styles.towerInfo}
            style={{ marginTop: 20 }}
            text={"正式发布"}
          >
            <Button onClick={() => location.href = `/workbench/release?name=${towername}&title=${initValue.title}`}>发塔</Button>
          </Section>
          
          <Section
            className={styles.towerInfo}
            style={{ marginTop: 20 }}
            text={"更新文件"}
          >
            <Row>
              <Upload
                action=""
                // uploadTrigger="custom"
                limit={1}
                accept=".zip"
                customRequest={handleUploadFile}
              >
                <Button
                  // disabled={values.file.length >= 1}
                  icon={<IconPlus />}
                  theme="light"
                  style={{ marginRight: 8 }}
                >
                  更新文件
                </Button>
              </Upload>
            </Row>
            <div style={{ height: "10px" }}></div>
            <Progress
              percent={uploadProgress}
              stroke={strokeArr}
              strokeGradient={true}
              showInfo
              size="large"
              aria-label="file download speed"
            />
          </Section>
        </>
      )}
      {(!initValue || initValue.name !== towername) && (
        <Empty
          className={styles.towerInfo}
          image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
          darkModeImage={
            <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
          }
          description={"查无本塔"}
        ></Empty>
      )}
    </>
  );
};

export default App;
