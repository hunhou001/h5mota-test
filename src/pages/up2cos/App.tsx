import {
  Button,
  Progress,
  Select,
  Table,
  TextArea,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import MainHeader from "../../components/MainHeader";
import styles from "./index.module.less";
import { userInfoModel } from "@/utils/store";
import {
  formatH5motaTmpSize,
  getUp2cosGetDataLocal,
  isUp2cosH5motaGetDataOk,
  isUp2cosH5motaSetDataOk,
  postUp2cosSetData,
  type Up2cosH5motaTowerItem,
} from "@/services/up2cos";

/** 特殊塔名拦截 */
const BLOCKED_TOWERLIST = ["qiuyuechuanshuo"];

type AuditRow = {
  key: string;
  name: string;
  size: string;
  comment: string;
  uploadedAt: string;
  status: string;
};

const App: FC = () => {
  const user = userInfoModel();
  const uid = user?.id;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [towerId, setTowerId] = useState<string | undefined>();
  const [comment, setCommentText] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  /** 对齐 index.js：仅当所选塔 name 变化时覆盖「作者的话」，不因 list 刷新误覆盖用户编辑 */
  const lastSyncedTowerForCommentRef = useRef<string | undefined>(undefined);

  const up2cosQuery = useQuery(
    ["up2cosGetData", uid],
    async () => {
      const raw = await getUp2cosGetDataLocal();
      console.log("[up2cos getData] 测试区返回:", raw);
      if (raw != null && !isUp2cosH5motaGetDataOk(raw)) {
        if (raw.code === 1001) {
          Toast.warning("请登陆");
        } else if (typeof raw.str === "string") {
          Toast.error(raw.str);
        }
      }
      return raw;
    },
    {
      enabled: Boolean(uid),
      staleTime: 60_000,
      retry: false,
    }
  );

  const towerList: Up2cosH5motaTowerItem[] = useMemo(() => {
    const raw = up2cosQuery.data;
    if (!raw || !isUp2cosH5motaGetDataOk(raw)) return [];
    return raw.list;
  }, [up2cosQuery.data]);

  const auditRows: AuditRow[] = useMemo(() => {
    const raw = up2cosQuery.data;
    if (!raw || !isUp2cosH5motaGetDataOk(raw)) return [];
    return raw.data.map((row, index) => ({
      key: `${row.name}-${row.uploadTime}-${index}`,
      name: row.name,
      size: formatH5motaTmpSize(row.size),
      comment: row.comment,
      uploadedAt: row.uploadTime,
      status: row.status,
    }));
  }, [up2cosQuery.data]);

  const mainAuthorLabel = useMemo(() => {
    if (!uid) return "—";
    const raw = up2cosQuery.data;
    if (raw && isUp2cosH5motaGetDataOk(raw)) {
      return `${raw.username} (ID:${String(raw.id)})`;
    }
    return user?.username ?? "—";
  }, [uid, user?.username, up2cosQuery.data]);

  /** 与 index.js 中 `<option>` 文案一致：展示 `title`，无则退回 `name` */
  const towerOptions = useMemo(
    () =>
      towerList.map((t) => ({
        label: t.title || t.name,
        value: t.name,
      })),
    [towerList]
  );

  useEffect(() => {
    if (towerList.length === 0) {
      setTowerId(undefined);
      setCommentText("");
      lastSyncedTowerForCommentRef.current = undefined;
      return;
    }
    const first = towerList[0];
    setTowerId((prev) => {
      if (prev && towerList.some((t) => t.name === prev)) return prev;
      return first.name;
    });
  }, [towerList]);

  /** 对齐 `setComment()`：仅 `towerId` 变化时用 `texts[name]` 填充 textarea */
  useEffect(() => {
    if (!towerId) {
      setCommentText("");
      lastSyncedTowerForCommentRef.current = undefined;
      return;
    }
    if (lastSyncedTowerForCommentRef.current === towerId) {
      return;
    }
    lastSyncedTowerForCommentRef.current = towerId;
    const t = towerList.find((x) => x.name === towerId);
    setCommentText(t?.text ?? "");
  }, [towerId, towerList]);

  const handleUpload = async () => {
    if (!towerId || towerId === "") {
      setUploadMsg("选择要更新的塔！");
      return;
    }
    if (!zipFile) {
      setUploadMsg("未选择上传文件.");
      return;
    }
    if (BLOCKED_TOWERLIST.includes(towerId)) {
      setUploadMsg("该塔禁止进行自助更新！");
      return;
    }

    setUploadProgress(0);
    setUploadMsg("正在上传，请稍后...");

    if (!uid) {
      setUploadMsg("请先登录");
      return;
    }

    setUploading(true);
    try {
      const pData = await postUp2cosSetData(
        {
          name: towerId,
          comment,
          file: zipFile,
        },
        { onUploadProgress: (p) => setUploadProgress(p) }
      );

      console.log("[up2cos setData] 测试区返回:", pData);

      if (pData === null) {
        setUploadMsg("网络错误");
        return;
      }

      if (isUp2cosH5motaSetDataOk(pData)) {
        Toast.success("操作成功");
        setUploadProgress(0);
        setUploadMsg("");
        setZipFile(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await queryClient.invalidateQueries(["up2cosGetData", uid]);
        return;
      }

      const errStr =
        typeof (pData as { str?: string }).str === "string"
          ? (pData as { str: string }).str
          : "未知错误";
      setUploadMsg(`错误：${errStr}`);
    } finally {
      setUploading(false);
    }
  };

  const auditColumns = [
    { title: "name", dataIndex: "name" },
    { title: "文件大小", dataIndex: "size" },
    { title: "作者的话", dataIndex: "comment" },
    { title: "更新上传时间", dataIndex: "uploadedAt" },
    { title: "审核状态", dataIndex: "status" },
  ];

  /** 对齐参考页 main0 / main1 / main2：仅 getData 成功（code===1）后显示 */
  const showMainPanels = Boolean(
    uid &&
    up2cosQuery.data != null &&
    isUp2cosH5motaGetDataOk(up2cosQuery.data)
  );

  return (
    <>
      <MainHeader />
      <div className={styles.wrap}>
        <Typography.Title heading={4}>自助更新系统</Typography.Title>
        <div className={styles.section}>
          <Typography.Text>
            注意：本页面和原主站的自助更新页面功能一样，用于自助更新在<strong>主站</strong>的塔。
          </Typography.Text>
        </div>

        {showMainPanels ? (
          <>
            <div className={styles.section}>
              <Typography.Text>作者：{mainAuthorLabel}</Typography.Text>
            </div>

            <div className={styles.section}>
              <p>塔名：</p>
              <Select
                style={{ width: 320 }}
                optionList={towerOptions}
                value={towerId}
                placeholder={uid ? "暂无可用塔" : "请先登录"}
                emptyContent="暂无数据"
                onChange={(v) => {
                  setTowerId(v as string);
                }}
              />
              <p style={{ marginTop: 12 }}>
                作者的话（显示在该塔的卡片底部）：
              </p>
              <TextArea
                value={comment}
                onChange={setCommentText}
                rows={4}
                style={{ maxWidth: 400 }}
                placeholder="在这里填写作者的话，会显示在该塔的底部。"
              />
              <p style={{ marginTop: 12 }}>请选择 zip 格式的文件：</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setZipFile(f);
                  setFileName(f?.name ?? "");
                }}
              />
              {fileName ? (
                <Typography.Text type="tertiary" style={{ marginLeft: 8 }}>
                  {fileName}
                </Typography.Text>
              ) : null}
              <p style={{ marginTop: 12 }}>
                <Button
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!uid}
                >
                  上传
                </Button>
              </p>
              <div className={styles.progressRow}>
                <span>文件上传进度：</span>
                <Progress percent={uploadProgress} style={{ width: 300 }} />
                <span>{uploadProgress}%</span>
              </div>
              {uploadMsg ? (
                <div className={styles.msg}>{uploadMsg}</div>
              ) : null}
            </div>

            <Typography.Title heading={6} style={{ marginTop: 24 }}>
              目前审核情况
            </Typography.Title>
            <Table
              columns={auditColumns}
              dataSource={auditRows}
              rowKey="key"
              pagination={false}
            />
          </>
        ) : null}

        <div className={styles.instructions}>
          <Typography.Paragraph>
            此页面允许自助更新塔，基本流程如下：
          </Typography.Paragraph>
          <Typography.Title heading={5}>首次发塔：</Typography.Title>
          <ol>
            <li>
              检测全塔属性的 name
              是否进行修改，不能为 template 且不能和网站上任何塔重复。
            </li>
            <ul>
              <li>
                可以点
                <a href="/games/xxx/" target="_blank" rel="noreferrer">
                  此处
                </a>
                并把地址栏中的 xxx 改成你自己的 name 以确认没有重复。
              </li>
            </ul>
            <li>
              压缩方式：直接将该塔的文件夹进行压缩成 zip
              格式。请勿在内部全选多个文件压缩，或者外部再套一层。
            </li>
            <li>将原始的塔在发塔群中，管理员会审核首次上传。</li>
          </ol>
          <Typography.Title heading={5}>后续更新：</Typography.Title>
          <ol>
            <li>不一定需要下载离线版本进行修改。你可以接着自己的工程继续做。</li>
            <li>
              修改完毕后，重新压缩，在此页面上传，然后通知管理员审核就行。
            </li>
            <ul>
              <li>
                如果要清理存档（不能接档），请修改全塔属性中的
                version。这样读档时提示存档失效，会询问是否回放该存档的录像。
              </li>
              <li>
                如果要清理榜单，请通知管理员。原则上测试期结束后不允许清理。
              </li>
            </ul>
          </ol>
        </div>
      </div>
    </>
  );
};

export default App;
