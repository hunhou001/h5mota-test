import { Badge, Button, Col, Form, Input, Row } from "@douyinfe/semi-ui";
import Section from "@douyinfe/semi-ui/lib/es/form/section";
import { FC } from "react";
import styles from "./index.module.less";
import { values } from "lodash-es";
import { FormState } from "@douyinfe/semi-ui/lib/es/form";

const ApplyTower: FC = () => {
  const initValue = {
    name: "",
    title: "",
    tester: [],
  };

  const validateName = (name: string) => {
    if (!name) return "不能为空！";
    if (!/^\w+$/.test(name)) return "需要由字母、数字、下划线组成！";
    return "";
  };

  const validateTesters = (testers: string[]) => {
    const t: string[] = [];
    if (testers.length > 10) return "输入数量过多";
    for (const tester of testers) {
      if (t.includes(tester)) return "不得重复输入";
      t.push(tester);
      if (!/^\d{4,5}$/.test(tester)) return "请输入正确uid";
    }
    return "";
  };

  const validateTitle = (title: string) => {
    if (!title) return "不能为空！";
    return "";
  };

  const handleSubmit = (value: typeof initValue) => {
    if (
      validateName(value.name) ||
      validateTesters(value.tester) ||
      validateTitle(value.title)
    )
      return;
    console.log(value);
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
            </Row>
          </Section>
          <Button onClick={() => handleSubmit(values)}>提交</Button>
        </>
      )}
    </Form>
  );
};

export default ApplyTower;
