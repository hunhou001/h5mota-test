import {
  Banner,
  Button,
  Checkbox,
  List,
  Modal,
  Pagination,
  Space,
  Spin,
  TabPane,
  Tabs,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import { IconClock, IconFile } from "@douyinfe/semi-icons";
import { FC, useCallback, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  fetchAuditTowerTmpConfirm,
  fetchAuditTowerTmpList,
  fetchAuditTowerTmpRecordList,
  fetchAuditTowerTmpReject,
  fetchAuditTowerTmpUnzip,
  type AuditTowerTmpConfirmResponse,
  type AuditTowerTmpListItem,
} from "@/services/admin";
import { formatH5motaTmpSize, H5MOTA_ORIGIN } from "@/services/up2cos";
import { getAxiosErrorHttpStatus } from "@/services/utils";
import styles from "./auditUpdate.module.less";

const RECORD_PAGE_SIZE = 20;

function formatAuditSize(size: string | number | undefined): string {
  if (size === undefined || size === "") return "";
  return formatH5motaTmpSize(size);
}

/** 列表行与测试区审核接口一致；`msg` / `msg2` 在弹窗或详情中用 */
export type AuditItem = AuditTowerTmpListItem & { msg?: string };

function getStatus(status: string | number): string {
  const s = String(status);
  return (
    {
      "1": "等待审核",
      "2": "已解压，待部署",
      "6": "解压出错",
      "7": "移动出错",
      "10": "审核通过",
      "11": "已被拒绝",
    }[s] ?? "未知"
  );
}

function inferBgmRemoteFromMsg(msg: string | undefined): boolean {
  if (!msg) return false;
  return (
    msg.includes("Found bgm_remote = true") ||
    msg.includes("bgmRemote = true")
  );
}

function extractConfirmFailDetail(res: AuditTowerTmpConfirmResponse): string {
  const d = res.data;
  if (typeof d?.detail === "string" && d.detail.length > 0) return d.detail;
  const outMsg = d?.output?.message;
  if (typeof outMsg === "string" && outMsg.length > 0) return outMsg;
  if (d?.upstream && typeof d.upstream === "object") {
    const u = d.upstream as {
      deploy_message?: string;
      message?: string;
      str?: string;
    };
    const t = u.deploy_message || u.message || u.str;
    if (typeof t === "string" && t.length > 0) return t;
  }
  return "";
}

/** 与 Nest JSON 数字 0 / 部分网关返回字符串 "0" 兼容（不把 null 当作成功） */
function isApiOk(code: unknown): boolean {
  if (code === 0 || code === "0") return true;
  if (typeof code === "string" && /^-?\d+$/.test(code)) {
    return Number(code) === 0;
  }
  return false;
}

function toastText(v: unknown, fallback: string): string {
  if (v == null || v === "") return fallback;
  if (typeof v === "string") return v || fallback;
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return fallback;
    }
  }
  return String(v);
}

function buildRecordLogText(item: AuditTowerTmpListItem): string {
  const parts: string[] = [];
  if (item.msg) parts.push(`--- 解压 / 预览 ---\n${item.msg}`);
  if (item.msg2) parts.push(`--- 部署 / 迁移 ---\n${item.msg2}`);
  return parts.join("\n\n");
}

/** 解压失败时 Nest 可能返回 `data.message`（5058 日志）或 `data.detail`（5058 调用异常） */
function extractUnzipFailLog(res: unknown): string {
  if (typeof res !== "object" || res === null || !("data" in res)) return "";
  const d = (res as { data?: unknown }).data;
  if (typeof d !== "object" || d === null) return "";
  const obj = d as { message?: unknown; detail?: unknown };
  if (typeof obj.message === "string" && obj.message.length > 0) return obj.message;
  if (typeof obj.detail === "string" && obj.detail.length > 0) return obj.detail;
  return "";
}

enum AuditState {
  UnStart,
  Unzipping,
  WaitConfirm,
  Confirming,
  Failed,
}

const AuditUpdate: FC = () => {
  const queryClient = useQueryClient();
  const [recordPage, setRecordPage] = useState(1);
  const [logModal, setLogModal] = useState<{ title: string; text: string } | null>(
    null,
  );

  const listQuery = useQuery(
    ["auditTowerTmpList"],
    () => fetchAuditTowerTmpList(),
    {
      staleTime: 15_000,
      select: (res): AuditItem[] => {
        if (res.code !== 0 || !res.data?.list) {
          return [];
        }
        const list = Array.isArray(res.data.list) ? res.data.list : [];
        return list.filter((item: AuditTowerTmpListItem) =>
          [1, 2].includes(Number(item.status)),
        ) as AuditItem[];
      },
    },
  );

  const recordQuery = useQuery(
    ["auditTowerTmpRecordList", recordPage, RECORD_PAGE_SIZE],
    () =>
      fetchAuditTowerTmpRecordList({
        page: recordPage,
        pageSize: RECORD_PAGE_SIZE,
      }),
    {
      staleTime: 15_000,
      keepPreviousData: true,
      select: (res) => {
        if (res.code !== 0 || !res.data) {
          return { list: [] as AuditTowerTmpListItem[], total: 0 };
        }
        return {
          list: Array.isArray(res.data.list) ? res.data.list : [],
          total: typeof res.data.total === "number" ? res.data.total : 0,
        };
      },
    },
  );

  const waitAudit = listQuery.data ?? [];
  const auditRecord = recordQuery.data?.list ?? [];
  const recordTotal = recordQuery.data?.total ?? 0;

  const waitLoading = listQuery.isLoading || listQuery.isFetching;
  const recordLoading = recordQuery.isLoading || recordQuery.isFetching;

  const [auditState, setAuditState] = useState(AuditState.UnStart);
  const [bgmremote, setBgmremote] = useState(false);
  const [resethot, setResethot] = useState(false);
  const [auditItem, setAuditItem] = useState<AuditItem | undefined>();

  const loadList = useCallback(() => {
    void queryClient.invalidateQueries(["auditTowerTmpList"]);
    void queryClient.invalidateQueries(["auditTowerTmpRecordList"]);
  }, [queryClient]);

  const reject = (id: string) => {
    Modal.confirm({
      title: "确认拒绝该自助更新？",
      content: "将拒绝该塔的自助更新。",
      okText: "拒绝",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        const res = await fetchAuditTowerTmpReject({ id });
        if (res.code !== 0) {
          Toast.error(res.message || "拒绝失败");
          return Promise.reject(new Error("reject failed"));
        }
        if (res.data?.mainRejectSynced === false && res.data?.mainError) {
          Toast.warning(`已本地拒绝；主站管理日志同步出错: ${res.data.mainError}`);
        } else {
          Toast.success(res.message || "已拒绝");
        }
        void loadList();
      },
    });
  };

  const callAuditModel = async (id: string, needUnzip: boolean) => {
    const item = waitAudit.find((e) => e.id === id);
    if (!item) return;

    setResethot(false);

    if (needUnzip) {
      setAuditState(AuditState.Unzipping);
      setAuditItem({ ...item });
      setBgmremote(false);
      const res = await fetchAuditTowerTmpUnzip(id);
      if (!isApiOk(res.code)) {
        const failLog = extractUnzipFailLog(res);
        setAuditState(AuditState.Failed);
        setAuditItem((prev) =>
          prev
            ? {
                ...prev,
                msg: failLog || prev.msg || "",
              }
            : prev,
        );
        Toast.error(toastText(res.message, "解压失败"));
        if (failLog) {
          Modal.error({
            title: "解压失败",
            width: "85%",
            content: <pre className={styles.messagePre}>{failLog}</pre>,
            okText: "关闭",
          });
        }
        void loadList();
        return;
      }
      const unzipData = "data" in res ? res.data : undefined;
      const msgText =
        unzipData?.message != null ? String(unzipData.message) : "";
      setAuditItem((prev) =>
        prev ? { ...prev, msg: msgText } : prev,
      );
      setBgmremote(Boolean(unzipData?.bgm_remote));
      setAuditState(AuditState.WaitConfirm);
      return;
    }

    setAuditItem({ ...item, msg: item.msg ?? "" });
    setBgmremote(inferBgmRemoteFromMsg(item.msg));
    setAuditState(AuditState.WaitConfirm);
  };

  const confirm = async () => {
    if (!auditItem) return;
    setAuditState(AuditState.Confirming);
    const res = await fetchAuditTowerTmpConfirm({
      id: auditItem.id,
      bgm_remote: bgmremote,
      reset_hot: resethot,
    });
    if (!isApiOk(res.code)) {
      const httpStatus = getAxiosErrorHttpStatus(res.message);
      if (httpStatus === 504 || httpStatus === 502) {
        Toast.warning({
          content:
            "网关超时(504/502)，部署可能已在后台完成，请到「审核记录」或主站核对，勿重复点确认",
          duration: 8,
        });
        setAuditState(AuditState.UnStart);
        setAuditItem(undefined);
        void loadList();
        return;
      }
      Toast.error(toastText(res.message, "确认上线失败"));
      const detail = extractConfirmFailDetail(res);
      if (detail) {
        Modal.error({
          title: "操作失败",
          width: "85%",
          content: <pre className={styles.messagePre}>{detail}</pre>,
          okText: "关闭",
        });
      } else if (typeof res.message === "string" && res.message.length > 0) {
        Modal.error({
          title: "操作失败",
          width: "85%",
          content: <pre className={styles.messagePre}>{res.message}</pre>,
          okText: "关闭",
        });
      }
      setAuditState(AuditState.WaitConfirm);
      void loadList();
      return;
    }
    Toast.success(toastText(res.message, "操作成功"));
    setAuditState(AuditState.UnStart);
    setAuditItem(undefined);
    void loadList();
  };

  const cancel = () => {
    void loadList();
    setAuditState(AuditState.UnStart);
    setAuditItem(undefined);
  };

  const renderWaitList = () => (
    <List<AuditItem>
      layout="vertical"
      className={styles.listScroll}
      loading={waitLoading}
      emptyContent="当前没有待审批的更新"
      dataSource={waitAudit}
      renderItem={(item) => {
        const st = Number(item.status);
        const passLabel = st === 2 ? "部署" : "通过";
        const needUnzip = st !== 2;
        return (
          <List.Item key={item.id} className={styles.listItem}>
            <div className={styles.itemBody}>
              <div className={styles.itemMain}>
                <Typography.Title heading={6} style={{ margin: "0 0 8px" }}>
                  {item.name ? (
                    <a
                      className={styles.titleLink}
                      href={`${H5MOTA_ORIGIN}/tower?name=${encodeURIComponent(item.name)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.title ?? ""}
                    </a>
                  ) : (
                    <span>{item.title ?? ""}</span>
                  )}
                </Typography.Title>
                {item.comment ? (
                  <Typography.Paragraph
                    type="tertiary"
                    style={{ marginBottom: 8 }}
                  >
                    {item.comment}
                  </Typography.Paragraph>
                ) : null}
                <div className={styles.actionsRow}>
                  <span>
                    {item.username ?? ""}
                    {item.userId ? (
                      <span style={{ marginLeft: 4 }}>
                        (
                        <a
                          href={`${H5MOTA_ORIGIN}/user?id=${encodeURIComponent(item.userId)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          id: {item.userId}
                        </a>
                        )
                      </span>
                    ) : null}
                  </span>
                  <span>
                    <IconClock className={styles.actionIcon} size="small" />
                    {item.uploadTime ?? ""}
                  </span>
                  <span>
                    <IconFile className={styles.actionIcon} size="small" />
                    {item.name ? (
                      <a
                        href={`/api/admin/downloadH5motaSelfUpdateZip?name=${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {formatAuditSize(item.size)}
                      </a>
                    ) : (
                      formatAuditSize(item.size)
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.itemExtra}>
                <div style={{ marginBottom: 12 }}>{getStatus(item.status)}</div>
                <Space wrap>
                  <Button
                    type="primary"
                    onClick={() => void callAuditModel(item.id, needUnzip)}
                  >
                    {passLabel}
                  </Button>
                  <Button type="danger" onClick={() => reject(item.id)}>
                    拒绝
                  </Button>
                </Space>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );

  const renderRecordList = () => (
    <div className={styles.recordPane}>
      <List<AuditTowerTmpListItem>
        layout="vertical"
        className={styles.listScroll}
        loading={recordLoading}
        dataSource={auditRecord}
        emptyContent="暂无审核记录"
        renderItem={(item) => {
          const logText = buildRecordLogText(item);
          return (
            <List.Item key={item.id} className={styles.listItem}>
              <div className={styles.itemBody}>
                <div className={styles.itemMain}>
                  <Typography.Title heading={6} style={{ margin: "0 0 8px" }}>
                    {item.name ? (
                      <a
                        className={styles.titleLink}
                        href={`${H5MOTA_ORIGIN}/tower?name=${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.title ?? item.name}
                      </a>
                    ) : (
                      <span>{item.title ?? ""}</span>
                    )}
                  </Typography.Title>
                  {item.comment ? (
                    <Typography.Paragraph
                      type="tertiary"
                      style={{ marginBottom: 8 }}
                    >
                      {item.comment}
                    </Typography.Paragraph>
                  ) : null}
                  <div className={styles.actionsRow}>
                    <span>
                      作者 uid: {item.userId || item.username || "—"}
                      {item.userId ? (
                        <span style={{ marginLeft: 4 }}>
                          (
                          <a
                            href={`${H5MOTA_ORIGIN}/user?id=${encodeURIComponent(item.userId)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            主页
                          </a>
                          )
                        </span>
                      ) : null}
                    </span>
                    <span>
                      <IconClock className={styles.actionIcon} size="small" />
                      上传 {item.uploadTime ?? ""}
                    </span>
                    <span>
                      <IconFile className={styles.actionIcon} size="small" />
                      {item.name ? (
                        <a
                          href={`/api/admin/downloadH5motaSelfUpdateZip?name=${encodeURIComponent(item.name)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatAuditSize(item.size)}
                        </a>
                      ) : (
                        formatAuditSize(item.size)
                      )}
                    </span>
                  </div>
                </div>
                <div className={styles.itemExtra}>
                  <div style={{ marginBottom: 8 }}>{getStatus(item.status)}</div>
                  {item.reviewerName ? (
                    <div style={{ marginBottom: 4 }}>
                      {item.reviewerId ? (
                        <a
                          href={`${H5MOTA_ORIGIN}/user?id=${encodeURIComponent(item.reviewerId)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.reviewerName}
                        </a>
                      ) : (
                        item.reviewerName
                      )}
                    </div>
                  ) : null}
                  <Typography.Text type="tertiary" style={{ display: "block" }}>
                    审核时间 {item.reviewTime ?? "—"}
                  </Typography.Text>
                  {logText ? (
                    <Button
                      theme="borderless"
                      type="tertiary"
                      style={{ marginTop: 8, padding: 0 }}
                      onClick={() =>
                        setLogModal({
                          title: `日志 - ${item.name ?? item.id}`,
                          text: logText,
                        })
                      }
                    >
                      查看日志
                    </Button>
                  ) : null}
                </div>
              </div>
            </List.Item>
          );
        }}
      />
      <div className={styles.recordPagination}>
        <Pagination
          total={recordTotal}
          currentPage={recordPage}
          pageSize={RECORD_PAGE_SIZE}
          onPageChange={(p) => setRecordPage(p)}
          showTotal
          hideOnSinglePage
        />
      </div>
    </div>
  );

  const modalOpen = auditState !== AuditState.UnStart;
  const okDisabled =
    auditState === AuditState.Unzipping ||
    auditState === AuditState.Failed;

  return (
    <div className={styles.auditRoot}>
      <Tabs type="line" className={styles.tabs} defaultActiveKey="wait">
        <TabPane tab="待审核" itemKey="wait">
          {renderWaitList()}
        </TabPane>
        <TabPane tab="审核记录" itemKey="record">
          {renderRecordList()}
        </TabPane>
      </Tabs>

      <Modal
        title={`审核 - ${auditItem?.title ?? ""}`}
        visible={modalOpen}
        width="85%"
        okText="确认"
        onOk={() => void confirm()}
        onCancel={cancel}
        confirmLoading={auditState === AuditState.Confirming}
        okButtonProps={{ disabled: okDisabled }}
        maskClosable={false}
      >
        <Spin spinning={auditState === AuditState.Unzipping} tip="解压中...">
          <pre className={styles.messagePre}>{auditItem?.msg ?? ""}</pre>
        </Spin>
        {auditState === AuditState.Failed ? (
          <Banner type="danger" description="解压失败" fullMode={false} />
        ) : auditState !== AuditState.Unzipping ? (
          <div className={styles.modalChecks}>
            <div className={styles.checkLine}>
              更新第三方音乐:
              <Checkbox
                checked={bgmremote}
                onChange={(e) =>
                  setBgmremote(Boolean(e.target.checked))
                }
                style={{ marginLeft: 8 }}
              />
            </div>
            <div className={styles.checkLine}>
              重置热度:
              <Checkbox
                checked={resethot}
                onChange={(e) =>
                  setResethot(Boolean(e.target.checked))
                }
                style={{ marginLeft: 8 }}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title={logModal?.title ?? "日志"}
        visible={Boolean(logModal)}
        width="85%"
        footer={null}
        onCancel={() => setLogModal(null)}
        maskClosable
      >
        <pre className={styles.messagePre}>{logModal?.text ?? ""}</pre>
      </Modal>
    </div>
  );
};

export default AuditUpdate;
