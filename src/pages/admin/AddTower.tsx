import {
  Banner,
  Button,
  Checkbox,
  Form,
  Modal,
  Table,
  TextArea,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import {
  type TowerPublishFormPayload,
  fetchPushBuiltTowerToMain,
  fetchStageTmpTowerZipToH5mota,
  fetchTowerCreateFromH5mota,
  fetchTowersByAuthorId,
} from "@/services/admin";
import type { towerInfo } from "@/services/user";
import { formatTime } from "@/utils/formatTime";
import { FC, useRef, useState } from "react";
import styles from "./addTower.module.less";

/** 勾选区不含「复刻塔」，开启复刻塔时在提交时再拼回 */
const TAGS = [
  "复刻塔",
  "处女作",
  "悬赏塔",
  "高难塔",
  "剧情向",
  "加点塔",
  "转换塔",
  "道具塔",
  "境界塔",
  "技能塔",
  "平面塔",
  "连载塔",
  "已完结",
  "机关塔",
  "小游戏",
  "解密塔",
  "随机塔",
  "多角色",
  "联机游戏",
];
const TAG_OPTIONS = TAGS.filter((t) => t !== "复刻塔");

export type TowerFormValues = {
  name: string;
  ismod: boolean;
  mod_of: string;
  title: string;
  authorId: string;
  author: string;
  author2: string;
  remastered: boolean;
  competition: boolean;
  link_only: boolean;
  link: string;
  text: string;
  tag?: string;
};
const emptyForm = (): TowerFormValues => ({
  name: "",
  ismod: false,
  mod_of: "",
  title: "",
  authorId: "",
  author: "",
  author2: "",
  remastered: false,
  competition: false,
  link_only: false,
  link: "",
  text: "",
});
const validateName = (name: string) => {
  if (!name) return "英文名不能为空";
  if (!/^\w+$/.test(name)) return "英文名需为字母、数字、下划线";
  return "";
};
const validateAuthorId = (id: string) => {
  if (!id) return "作者用户编号不能为空";
  if (!/^\d+$/.test(id)) return "作者用户编号应为数字";
  return "";
};

/** 与勾选区一致：复刻塔开启时把「复刻塔」拼回 tag */
function buildPublishPayload(
  values: TowerFormValues,
  tagChecks: string[]
): TowerPublishFormPayload {
  const tagParts = [...tagChecks];
  if (values.remastered && !tagParts.includes("复刻塔")) {
    tagParts.unshift("复刻塔");
  }
  return {
    name: String(values.name ?? "").trim(),
    title: String(values.title ?? "").trim(),
    authorId: String(values.authorId ?? "").trim(),
    author: String(values.author ?? "").trim(),
    author2: String(values.author2 ?? "").trim(),
    ismod: Boolean(values.ismod),
    mod_of: String(values.mod_of ?? "").trim(),
    remastered: Boolean(values.remastered),
    competition: Boolean(values.competition),
    link_only: Boolean(values.link_only),
    link: String(values.link ?? "").trim(),
    text: String(values.text ?? "").trim(),
    tag: tagParts.join("|"),
  };
}
const { Column } = Table;

const AddTower: FC = () => {
  const formApi = useRef<FormApi<TowerFormValues> | null>(null);
  const [addJson, setAddJson] = useState("");
  const [tagChecks, setTagChecks] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRows, setPickerRows] = useState<towerInfo[]>([]);
  const [resolvedAuthorUid, setResolvedAuthorUid] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const applyJsonPrefill = () => {
    try {
      const obj = JSON.parse(addJson) as Record<string, unknown>;
      const api = formApi.current;
      if (!api) return;
      const base = emptyForm();
      for (const key of Object.keys(obj)) {
        if (key in base) {
          api.setValue(key as keyof TowerFormValues, obj[key] as never);
        }
      }
      if (typeof obj.tag === "string" && obj.tag) {
        setTagChecks(obj.tag.split("|").filter((t) => TAG_OPTIONS.includes(t)));
      }
      Toast.success("已根据 JSON 填充（可继续手改）");
    } catch (e) {
      console.log("发塔预填 JSON 解析失败", e);
      Toast.error("JSON 格式无效");
    }
  };
  const fetchTowersForPicker = async () => {
    const uid = String(formApi.current?.getValue("authorId") ?? "").trim();
    if (!uid) {
      Toast.error("请先填写作者用户编号");
      return;
    }
    if (!/^\d+$/.test(uid)) {
      Toast.error("作者用户编号应为数字");
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetchTowersByAuthorId(uid);
      if (res.code === 0) {
        const rows = res.data ?? [];
        setPickerRows(rows);
        setResolvedAuthorUid(uid);
        setPickerOpen(true);
        if (rows.length === 0) {
          Toast.info("该 uid 在测试区 tower 表中暂无塔记录");
        }
      } else {
        Toast.error(
          typeof res.message === "string" && res.message
            ? res.message
            : "获取失败"
        );
      }
    } catch (e) {
      console.log("fetchTowersByAuthorId", e);
      Toast.error("请求失败，请检查网络或接口是否已部署");
    } finally {
      setLookupLoading(false);
    }
  };
  const applyTowerPick = (row: towerInfo) => {
    const api = formApi.current;
    if (!api) return;
    api.setValue("name", row.name);
    api.setValue("title", row.title);
    api.setValue("authorId", resolvedAuthorUid);
    api.setValue("link", `/games/${row.name}/`);
    setPickerOpen(false);
    Toast.success("已填入英文名、中文名、作者用户编号");
  };
  const submit = async () => {
    const api = formApi.current;
    if (!api) return;
    try {
      await api.validate();
    } catch {
      return;
    }
    const values = api.getValues();
    const publishPayload = buildPublishPayload(values, tagChecks);
    const { name } = publishPayload;
    const towerFormJson = JSON.stringify(publishPayload);
    setPublishLoading(true);
    try {
      const res = await fetchStageTmpTowerZipToH5mota(name);
      if (res.code !== 0) {
        Toast.error(
          typeof res.message === "string" && res.message
            ? res.message
            : "复制失败"
        );
        return;
      }

      const createRes = await fetchTowerCreateFromH5mota({
        name: publishPayload.name,
        title: publishPayload.title,
        tester: [],
      });
      if (createRes.code === 0) {
        const pushRes = await fetchPushBuiltTowerToMain({
          name,
          towerFormJson,
        });
        if (pushRes.code === 0) {
          const createMsg =
            typeof createRes.message === "string" && createRes.message
              ? createRes.message
              : "主站创建成功";
          const pushMsg =
            typeof pushRes.message === "string" && pushRes.message
              ? pushRes.message
              : "塔包已同步至主站";
          Toast.success(`${createMsg}；${pushMsg}`);
        } else {
          Toast.success(
            typeof createRes.message === "string" && createRes.message
              ? createRes.message
              : "主站创建成功"
          );
          Toast.warning(
            typeof pushRes.message === "string" && pushRes.message
              ? `同步包至主站失败：${pushRes.message}`
              : "同步包至主站失败，请稍后重试或联系管理员"
          );
        }
      } else {
        const nested =
          createRes.data &&
          typeof createRes.data === "object" &&
          "message" in createRes.data &&
          typeof (createRes.data as { message?: string }).message === "string"
            ? (createRes.data as { message: string }).message
            : "";
        Toast.error(
          nested ||
            (typeof createRes.message === "string" && createRes.message
              ? createRes.message
              : "主站 /api/tower/create 失败")
        );
      }
    } catch (e) {
      console.log("publish tower", e);
      Toast.error("请求失败，请检查网络或接口是否已部署");
    } finally {
      setPublishLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.pane}>
        <Banner
          fullMode={false}
          type="info"
          bordered
          title="发塔预填表"
          description={
            <span>
              可让作者在
              <Typography.Text
                link={{
                  href: "https://h5mota.com/tools/addtower/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                }}
              >
                发塔预填表
              </Typography.Text>
              填好后，将生成的 JSON 粘贴到下方。
            </span>
          }
        />
        <div className={styles.formRow}>
          <TextArea
            value={addJson}
            onChange={(s) => setAddJson(s)}
            rows={3}
            placeholder="请填入发塔信息 JSON"
          />
        </div>
        <div className={`${styles.formRow} ${styles.submitRow}`}>
          <Button type="primary" onClick={applyJsonPrefill}>
            添加
          </Button>
        </div>
      </div>
      <Form<TowerFormValues>
        getFormApi={(api) => {
          formApi.current = api;
        }}
        initValues={emptyForm()}
        className={styles.addTowerForm}
        labelPosition="left"
        labelWidth={150}
      >
        {({ values, formApi }) => (
          <>
            <Form.Slot label="作者用户编号" className={styles.authorUidSlot}>
              <div className={styles.authorUidRow}>
                <Form.Input
                  field="authorId"
                  noLabel
                  placeholder="作者用户编号（数字 uid）"
                  style={{ width: 220 }}
                  rules={[
                    {
                      validator: (_rule, val) => {
                        const msg = validateAuthorId(String(val ?? ""));
                        return msg ? new Error(msg) : true;
                      },
                    },
                  ]}
                />
                <Button
                  type="primary"
                  loading={lookupLoading}
                  onClick={() => void fetchTowersForPicker()}
                >
                  获取他发的塔列表
                </Button>
              </div>
              <Typography.Paragraph
                size="small"
                type="tertiary"
                style={{ marginTop: 8, marginBottom: 0 }}
              >
                在弹出列表中选中一座塔，将自动填入英文名、中文名、作者用户编号与链接。
              </Typography.Paragraph>
            </Form.Slot>
            <Form.Input
              field="name"
              label="英文名"
              placeholder="塔的唯一标识符"
              rules={[
                {
                  validator: (_rule, val) => {
                    const msg = validateName(String(val ?? ""));
                    return msg ? new Error(msg) : true;
                  },
                },
              ]}
              onChange={(v) => {
                formApi.setValue("link", v ? `/games/${v}/` : "");
              }}
            />
            <Form.Input
              field="title"
              label="中文名"
              placeholder="塔的中文名"
              rules={[{ required: true, message: "必填" }]}
            />
            <Form.Switch field="remastered" label="复刻塔" />
            <Form.Input
              field="author"
              label={values.remastered ? "原作者" : "作者"}
              rules={[{ required: true, message: "必填" }]}
            />
            {values.remastered && <Form.Input field="author2" label="复刻者" />}
            <Form.Switch field="ismod" label="MOD塔" />
            {values.ismod && (
              <Form.Input field="mod_of" label="原型塔的 name" placeholder="原型塔 name" />
            )}
            <Form.Input field="link" label="链接" disabled />
            <Form.Switch field="competition" label="不显示提交记录" />
            <Form.Switch field="link_only" label="仅链接游玩" />
            <Form.Slot label="标签">
              <div className={styles.tagCheckboxWrap} role="group" aria-label="标签">
                {TAG_OPTIONS.map((tag) => (
                  <Checkbox
                    key={tag}
                    checked={tagChecks.includes(tag)}
                    onChange={(e) => {
                      const checked = Boolean(e.target.checked);
                      setTagChecks((prev) =>
                        checked
                          ? Array.from(new Set([...prev, tag]))
                          : prev.filter((t) => t !== tag)
                      );
                    }}
                  >
                    {tag}
                  </Checkbox>
                ))}
              </div>
            </Form.Slot>
            <Form.Slot label="颜色">
              <Typography.Text type="secondary">白（新塔发布时默认为白）</Typography.Text>
            </Form.Slot>
            <Form.TextArea
              field="text"
              label="作者的话"
              rows={3}
              placeholder="显示在底部的话"
            />
            <Button
              type="primary"
              loading={publishLoading}
              onClick={() => void submit()}
            >
              发布
            </Button>
          </>
        )}
      </Form>
      <Modal
        title={`测试区塔列表（uid: ${resolvedAuthorUid}）`}
        visible={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        width={720}
        footer={
          <Button type="tertiary" onClick={() => setPickerOpen(false)}>
            关闭
          </Button>
        }
      >
        <Table
          dataSource={pickerRows}
          pagination={false}
          rowKey="name"
          size="small"
          empty="暂无塔记录"
        >
          <Column title="name" dataIndex="name" width={140} />
          <Column title="中文名" dataIndex="title" />
          <Column title="作者 id" dataIndex="author" width={100} />
          <Column
            title="更新时间"
            dataIndex="update_time"
            width={160}
            render={(t: number) => formatTime(t / 1000)}
          />
          <Column
            title="操作"
            width={100}
            render={(_: unknown, row: towerInfo) => (
              <Button size="small" type="primary" onClick={() => applyTowerPick(row)}>
                选中
              </Button>
            )}
          />
        </Table>
      </Modal>
    </div>
  );
};

export default AddTower;
