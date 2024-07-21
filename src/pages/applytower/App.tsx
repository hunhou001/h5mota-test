import {
  Badge,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Toast,
} from "@douyinfe/semi-ui";
import Section from "@douyinfe/semi-ui/lib/es/form/section";
import { FC, useState } from "react";
import styles from "./index.module.less";
import { IconPlus } from "@douyinfe/semi-icons";
import { requestApplyTower } from "@/services/tower";
import { useLoading } from "@/utils/use";
import MainHeader from "../../components/MainHeader";

const App: FC = () => {
  const initValue = {
    name: "",
    title: "",
    tester: [] as string[],
    file: [] as any[],
  };
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

  const validateFile = (files: any[]) => {
    if (files.length === 0) return "未传入压缩包！";
    for (const file of files) {
      if (!file.name.endsWith(".zip")) return "文件格式不符！";
    }
    return "";
  };

  const [submitLoading, handleSubmit] = useLoading(
    async (value: typeof initValue) => {
      const validate =
        validateName(value.name) ||
        validateTesters(value.tester) ||
        validateTitle(value.title) ||
        validateFile(value.file);
      if (validate) {
        Toast.error(validate);
        return;
      }
      const data = await requestApplyTower(
        {
          ...value,
          file: value.file[0].fileInstance,
        },
        {
          onUploadProgress: (e) => {
            if (!e.total) return;
            setProgress(((e.loaded / e.total) * 100) | 0);
          },
        }
      );
      if (data.code === 0) {
        setTimeout(() => {
          location.href = `/workbench/info/?tower_name=${value.name}`;
        }, 2000);
        setProgress(0);
      } else if (data.code === -4) {
        Modal.error({
          title: "发布失败",
          width: "85%",
          content: <pre className={styles.message}>{data.data.message}</pre>,
        });
      }
    }
  );

  return (
    <>
      <MainHeader />
      <Form initValues={initValue} className={styles.applyTower}>
        {({ formState, values, formApi }) => (
          <>
            <Section text={"发塔信息"}>
              <Row>
                <Form.Input
                  field="name"
                  label="塔的英文标识符（英文，无空格，来自全塔属性name项目）"
                  validate={validateName}
                ></Form.Input>
                <Form.Input
                  field="title"
                  label="塔的中文名"
                  validate={validateTitle}
                ></Form.Input>
                <Form.TagInput
                  field="tester"
                  label="测试员列表（填数字uid，最多十人，以回车分割不同测试员）"
                  validate={validateTesters}
                ></Form.TagInput>
                <Form.Upload
                  action=""
                  field="file"
                  uploadTrigger="custom"
                  limit={1}
                  accept=".zip"
                  label="压缩包(zip格式)"
                >
                  <Button
                    // disabled={values.file.length >= 1}
                    icon={<IconPlus />}
                    theme="light"
                    style={{ marginRight: 8 }}
                  >
                    选择文件
                  </Button>
                </Form.Upload>
              </Row>
            </Section>
            <Progress
              percent={uploadProgress}
              stroke={strokeArr}
              strokeGradient={true}
              showInfo
              size="large"
              aria-label="file download speed"
            />
            <Button
              loading={submitLoading}
              onClick={() => handleSubmit(values)}
              style={{ marginTop: "10px" }}
            >
              提交
            </Button>
          </>
        )}
      </Form>
    </>
  );
};

export default App;
