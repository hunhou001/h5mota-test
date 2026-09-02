import axios, {
  ADMIN_LONG_REQUEST_MS,
  BaseResponse,
  ShowMessage,
  wrapGet,
  wrapParameterlessGet,
  wrapPostJson,
} from "./utils";
import type { towerInfo } from "./user";

/** 参考 .idea/addtower/router.ts 中 requestCheckLazy 用法 */
export interface CheckLazyResponse extends BaseResponse {
  lazy?: boolean;
  fishing_time?: string | number;
}

/**
 * 摸鱼锁定检查：GET h5mota 后台 getLazyMan.php，携带当前用户 id（查询参数 id，与参考 requestCheckLazy({ id }) 一致）。
 * ShowMessage.None 避免未接好接口时全局 Toast 干扰鉴权页。
 */
export const requestCheckLazy = wrapGet<{ id: string }, CheckLazyResponse>(
  "/api/admin/getLazyMan",
);

/** @param userid 当前登录用户 id，即 user_info 中的 id */
export function fetchCheckLazy(userid: string) {
  return requestCheckLazy(
    { id: userid },
    { message: ShowMessage.None }
  );
}

/** 与发塔管理 API 共用 `addTowerApiGate`（登录 + tower≥2，无摸鱼） */
export interface AddTowerApiPrecheckResponse extends BaseResponse {
  data?: { ready?: boolean };
}

export const requestAddTowerApiPrecheck =
  wrapParameterlessGet<AddTowerApiPrecheckResponse>(
    "/api/admin/addTowerApiPrecheck"
  );

export function fetchAddTowerApiPrecheck() {
  return requestAddTowerApiPrecheck({ message: ShowMessage.None });
}

export interface TowersByAuthorIdResponse extends BaseResponse {
  data: towerInfo[];
}

export const requestTowersByAuthorId = wrapGet<
  { author_id: string },
  TowersByAuthorIdResponse
>("/api/admin/towersByAuthorId");

export function fetchTowersByAuthorId(authorId: string) {
  return requestTowersByAuthorId(
    { author_id: authorId },
    { message: ShowMessage.None }
  );
}

/** 发塔：若 `TOWERS_TMP_PATH/${name}.zip` 存在则复制到 `TOWERS_TMP_PATH_H5MOTA` */
export interface StageTmpTowerZipToH5motaResponse extends BaseResponse {
  data?: { copied?: boolean };
}

export const requestStageTmpTowerZipToH5mota = wrapPostJson<
  { name: string },
  StageTmpTowerZipToH5motaResponse
>("/api/admin/stageTmpTowerZipToH5mota");

export function fetchStageTmpTowerZipToH5mota(name: string) {
  return requestStageTmpTowerZipToH5mota(
    { name },
    { message: ShowMessage.None }
  );
}

/** 发塔：直接上传 zip 到 `TOWERS_TMP_PATH_H5MOTA/${name}.zip`（测试区服务端保存） */
export interface UploadTmpTowerZipToH5motaResponse extends BaseResponse {
  data?: { saved?: boolean };
}

export async function fetchUploadTmpTowerZipToH5mota(payload: {
  name: string;
  file: File;
}) {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("file", payload.file);
  try {
    const { data } = await axios.post<UploadTmpTowerZipToH5motaResponse>(
      "/api/admin/uploadTmpTowerZipToH5mota",
      fd
    );
    return data;
  } catch (e) {
    return {
      code: -1000,
      message: `上传塔包时发生错误.${String(e)}`,
    } as UploadTmpTowerZipToH5motaResponse;
  }
}

/** 管理发塔页提交的完整塔信息（与主站 add 类字段对齐，供测试区落库与主站 receive 使用） */
export type TowerPublishFormPayload = {
  name: string;
  title: string;
  authorId: string;
  author: string;
  author2: string;
  ismod: boolean;
  mod_of: string;
  remastered: boolean;
  competition: boolean;
  link_only: boolean;
  link: string;
  text: string;
  /** 竖线拼接，已含按需前置的「复刻塔」 */
  tag: string;
  /** 发塔员（当前操作人）uid；由测试区 pushBuiltTowerToMain 后端注入，前端表单不传 */
  operatorId?: string;
  /** 是否来自测试区管理发塔，默认由后端注入为 true */
  from_test?: boolean;
};

/** 管理发塔：复制到主站临时目录后，以 from=h5mota 调用 /api/tower/create（可不传 file，由服务端使用已复制的 zip） */
export interface TowerCreateFromH5motaResponse extends BaseResponse {
  data?: { message?: string; code?: number };
}

export async function fetchTowerCreateFromH5mota(payload: {
  name: string;
  title: string;
  tester: string[];
}) {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("title", payload.title);
  fd.append("tester", JSON.stringify(payload.tester));
  fd.append("from", "h5mota");
  try {
    const { data } = await axios.post<TowerCreateFromH5motaResponse>(
      "/api/tower/create",
      fd
    );
    return data;
  } catch (e) {
    return { code: -1000, message: `在create tower时发生错误.${String(e)}` } as TowerCreateFromH5motaResponse;
  }
}

/** create 成功后：将 `TOWERS_PATH_H5MOTA/${name}` 打成 zip 并同步至主站 receiveBuiltTower（测试区服务端执行；JWT 含 operatorId，towerFormJSON 含 operatorId） */
export interface PushBuiltTowerToMainResponse extends BaseResponse {
  data?: { upstream?: unknown; upstreamRaw?: unknown };
}

export const requestPushBuiltTowerToMain = wrapPostJson<
  { name: string; towerFormJson: string },
  PushBuiltTowerToMainResponse
>("/api/admin/pushBuiltTowerToMain");

export function fetchPushBuiltTowerToMain(payload: {
  name: string;
  towerFormJson: string;
}) {
  return requestPushBuiltTowerToMain(payload, {
    message: ShowMessage.None,
    timeout: ADMIN_LONG_REQUEST_MS,
  });
}

/** 测试区 `GET /api/admin/auditTowerTmpList`：仅含 `status` 1/2；`title`/`username` 暂为 `name`/`userId` */
export interface AuditTowerTmpListItem {
  id: string;
  userId: string;
  name: string;
  title: string;
  comment: string;
  /** 解压日志（5058 message），`status=2` 时弹窗展示 */
  msg?: string;
  /** 部署/迁移阶段日志（归档记录常用） */
  msg2?: string;
  status: number;
  size: string | number;
  uploadTime: string;
  username: string;
  reviewerId: string;
  reviewerName: string;
  reviewTime: string;
}

export interface AuditTowerTmpListResponse extends BaseResponse {
  data?: {
    list: AuditTowerTmpListItem[];
  };
}

export const requestAuditTowerTmpList =
  wrapParameterlessGet<AuditTowerTmpListResponse>(
    "/api/admin/auditTowerTmpList"
  );

export function fetchAuditTowerTmpList() {
  return requestAuditTowerTmpList({ message: ShowMessage.None });
}

/** 审核记录（归档 `status` 6/7/10/11），分页，字段与待审列表一致 */
export interface AuditTowerTmpRecordListResponse extends BaseResponse {
  data?: {
    list: AuditTowerTmpListItem[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const requestAuditTowerTmpRecordList = wrapGet<
  { page: number; pageSize: number },
  AuditTowerTmpRecordListResponse
>("/api/admin/auditTowerTmpRecordList");

export function fetchAuditTowerTmpRecordList(payload: {
  page: number;
  pageSize: number;
}) {
  return requestAuditTowerTmpRecordList(payload, { message: ShowMessage.None });
}

/** 解压预览：`POST /api/admin/auditTowerTmpUnzip` */
export interface AuditTowerTmpUnzipResponse extends BaseResponse {
  data?: {
    message?: string;
    bgm_remote?: boolean;
    /** 5058 请求异常等 */
    detail?: string;
    code?: number;
  };
}

export const requestAuditTowerTmpUnzip = wrapPostJson<
  { id: string },
  AuditTowerTmpUnzipResponse
>("/api/admin/auditTowerTmpUnzip");

export function fetchAuditTowerTmpUnzip(id: string) {
  return requestAuditTowerTmpUnzip(
    { id },
    { message: ShowMessage.None, timeout: ADMIN_LONG_REQUEST_MS },
  );
}

/** 拒绝：`POST /api/admin/auditTowerTmpReject` */
export interface AuditTowerTmpRejectResponse extends BaseResponse {
  data?: { mainRejectSynced?: boolean; mainError?: string };
}

export const requestAuditTowerTmpReject = wrapPostJson<
  { id: string; reason?: string },
  AuditTowerTmpRejectResponse
>("/api/admin/auditTowerTmpReject");

export function fetchAuditTowerTmpReject(payload: { id: string; reason?: string }) {
  return requestAuditTowerTmpReject(payload, { message: ShowMessage.None });
}

/** 确认上线：`POST /api/admin/auditTowerTmpConfirm`；成功时外层 `message` 为短文案，长日志在 `deployLog` */
export interface AuditTowerTmpConfirmResponse extends BaseResponse {
  data?: {
    deployed?: boolean;
    deployLog?: string;
    detail?: string;
    output?: { message?: string };
    upstream?: unknown;
  };
}

export const requestAuditTowerTmpConfirm = wrapPostJson<
  { id: string; bgm_remote: boolean; reset_hot: boolean },
  AuditTowerTmpConfirmResponse
>("/api/admin/auditTowerTmpConfirm");

export function fetchAuditTowerTmpConfirm(payload: {
  id: string;
  bgm_remote: boolean;
  reset_hot: boolean;
}) {
  return requestAuditTowerTmpConfirm(payload, {
    message: ShowMessage.None,
    timeout: ADMIN_LONG_REQUEST_MS,
  });
}
