import { Button, Form, Toast, Modal } from "@douyinfe/semi-ui";
import { FC, useRef } from "react";
import styles from "./index.module.less";
import { requestReleaseTower, releaseTowerRequest } from "@/services/tower";
import { useSearchParam } from "react-use";
import MainHeader from "../../components/MainHeader";
import type { CommonFieldProps } from "@douyinfe/semi-ui/lib/es/form";

const App: FC = () => {

  const TAGS = [
    "处女作", "悬赏塔", "高难塔", "剧情向", "加点塔", "转换塔", "道具塔", "境界塔", "技能塔",
    "平面塔", "连载塔", "已完结", "机关塔", "小游戏", "解密塔", "随机塔", "多角色", "联机游戏",
  ]

  const name = useSearchParam("name");
  const title = useSearchParam("title");
  const isMOD = useRef(false);

  const handleSubmit = (values: releaseTowerRequest) => {
    Modal.info({
      title: "发塔",
      content: "确定现在要发塔吗，请在制作完毕以后再选择发塔。",
      onOk: async () => {
        const res = await requestReleaseTower(values);
        if (res.code == 0) {
          //console.log(res)
          Toast.success({ content: "信息发送成功，请加入发塔群876332519通知管理发塔。", duration: 0});
        }
      }
    });
  };

  return (
    <>
      <MainHeader />
      {name && <Form className={styles.Table} labelPosition='left'>
        {({ formState, values, formApi }) => {
          const change = (v: string) => {
            if (v) formApi.setValue('link', `https://h5mota.com/games/${v}`);
            else formApi.setValue('link', ``);
          }

          const changeSwitch = (checked: boolean) => {
            isMOD.current = checked;
            formApi.validate(['name']);
          }

          const form = formState.values;
          if (!form.link && form.name) formApi.setValue('link', `https://h5mota.com/games/${form.name}`);

          const rules: Record<string, CommonFieldProps['rules']> = {
            name: [
              { required: true, message: '必须填写这一项内容' },
              { validator: (rule, value: string) => /^[a-zA-Z0-9_]+$/.test(value), message: "标识符只能由大小写字母和数字组成"},
              { validator: (rule, value: string) => {
                return isMOD.current ? value.startsWith(`${form.mod_of ?? ''}_`) : true
              }, message: "mod的标识符必须以原塔的标识符+下划线为前缀，如51的mod需以51_为前缀"},
            ],
            title: [
              { required: true, message: '必须填写这一项内容' }
            ],
            authorId: [
              { required: true, message: '必须填写这一项内容' },
              { validator: (rule, value: string) => /^(\d{4,6})?$/.test(value), message: "用户编号是四到六位数字" },
            ],
            author: [
              { required: true, message: '必须填写这一项内容'}
            ],
            link: [
              { required: true, message: '必须填写这一项内容' }
            ],
            mod_of: [
              { required: true, message: '必须填写这一项内容' }
            ]
        };
          return (
            <>
              <Form.Input
                label='英文名'
                field="name"
                disabled={true}
                placeholder='塔的唯一标识符'
                trigger='blur'
                initValue={name}
                rules={rules.name}
                onChange={change}
              />
              <Form.Input 
                field='title'
                label='中文名'
                placeholder='塔的中文名'
                trigger='blur'
                initValue={title}
                rules={rules.title}
              />
              <Form.InputNumber
                hideButtons
                field='authorId'
                label='作者用户id'
                placeholder='供自助更新使用'
                trigger='blur'
                rules={rules.authorId}
              />
              <Form.Switch field='remastered' label='复刻塔'/>
              <Form.Input
                field='author'
                label={values.remastered ? '原作者' : '作者名'}
                trigger='blur' rules={rules.author}
              />
              {form.remastered && <Form.Input field='author2' label='复刻者'></Form.Input>}
              <Form.Switch field='ismod' label='MOD塔' onChange={changeSwitch}></Form.Switch>
              {
                form.ismod && <Form.Input
                  field='mod_of'
                  label='原型塔的name'
                  placeholder='mod原型来源，如51代表50层魔塔的mod'
                  onChange={ () => formApi.validate(['name']) }
                  trigger='blur' rules={rules.mod_of}
                />
              }
              <Form.Input field='saveId' label='同步存档编号'></Form.Input>
              <Form.Slot label="存档说明"> 
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}> 请提交最难打出的成绩存档以保证塔内不存在无解的情况 </div>
              </Form.Slot>
              <Form.Input
                disabled={true}
                field='link'
                label='链接'
                trigger='blur'
                rules={rules.link}
              />
              <Form.Switch field='competition' label='不显示提交记录'></Form.Switch>
              <Form.CheckboxGroup field='tag' label='标签' direction='horizontal'>
                {TAGS.map((v, k) => (
                  <Form.Checkbox key={k} value={v}>{v}</Form.Checkbox>
                ))}
              </Form.CheckboxGroup>
              <Form.TextArea field='text' label='作者的话' placeholder='显示在底部的话'></Form.TextArea>
              <Button onClick={() => handleSubmit(form)}> 发塔 </Button>
            </>
          )
        }}
      </Form>}
      {!name && <p> 未知的塔 </p>}
    </>
  );
};

export default App;
