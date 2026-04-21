import axios, {
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

/** create 成功后：将 `TOWERS_PATH_H5MOTA/${name}` 打成 zip 并同步至主站 receiveBuiltTower（测试区服务端执行） */
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
    timeout: 600_000,
  });
}
