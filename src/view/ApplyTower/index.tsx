import { Badge, Button, Col, Form, Input, Row, Toast } from "@douyinfe/semi-ui";
import Section from "@douyinfe/semi-ui/lib/es/form/section";
import { FC } from "react";
import styles from "./index.module.less";
import { IconPlus } from "@douyinfe/semi-icons";
import { requestApplyTower } from "@/services/tower";
import { ShowMessage } from "@/services/utils";

const ApplyTower: FC = () => {
  const initValue = {
    name: "",
    title: "",
    tester: [] as string[],
    file: [] as any[],
  };

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

  const handleSubmit = async (value: typeof initValue) => {
    const validate =
      validateName(value.name) ||
      validateTesters(value.tester) ||
      validateTitle(value.title) ||
      validateFile(value.file);
    if (validate) {
      Toast.error(validate);
      return;
    }
    const data = await requestApplyTower({
      ...value,
      file: value.file[0].fileInstance,
    });
    if (data.code === 0) {
      console.log(data);
    }
  };

  return (
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
                label="测试员列表（填数字uid，最多十人）"
                validate={validateTesters}
              ></Form.TagInput>
              <Form.Upload
                action=""
                field="file"
                uploadTrigger="custom"
                limit={1}
                maxSize={1024 * 200}
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
          <Button onClick={() => handleSubmit(values)}>提交</Button>
        </>
      )}
    </Form>
  );
};

export default ApplyTower;
