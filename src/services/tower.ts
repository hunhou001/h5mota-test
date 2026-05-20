import { BaseResponse, wrapGet, wrapPost } from "./utils";

interface applytowerRequest {
  name: string;
  title: string;
  tester: string[];
  file: File;
}

interface applytowerResponse extends BaseResponse {
  code: 0;
}

interface CreateTowerErrorResponse extends BaseResponse {
  code: Exclude<number, 0>;
  data?:
    | {
        bgm_remote?: boolean;
        code?: number;
        message?: string;
        detail?: string;
        unzipData?: { message?: string; detail?: string };
      }
    | string;
}

/** 发塔 / 更新文件失败时解析后端错误详情（含 buildTower:unzip 的 unzipData） */
export function extractTowerPublishFailMessage(res: {
  message?: string;
  data?: unknown;
}): string {
  const fallback = res.message || "发布出错";
  if (!("data" in res) || res.data == null) return fallback;
  const curr = res.data;
  if (typeof curr === "string") return curr || fallback;
  if (typeof curr !== "object") return fallback;
  const obj = curr as {
    message?: string;
    detail?: string;
    unzipData?: { message?: string; detail?: string };
  };
  const unzip = obj.unzipData;
  if (unzip) {
    if (typeof unzip.message === "string" && unzip.message.length > 0) {
      return unzip.message;
    }
    if (typeof unzip.detail === "string" && unzip.detail.length > 0) {
      return unzip.detail;
    }
  }
  if (typeof obj.message === "string" && obj.message.length > 0) return obj.message;
  if (typeof obj.detail === "string" && obj.detail.length > 0) return obj.detail;
  return fallback;
}

export const requestApplyTower = wrapPost<
  applytowerRequest,
  applytowerResponse | CreateTowerErrorResponse
>("/api/tower/create");

interface editTowerRequest {
  name: string;
  title?: string;
  tester?: string[];
  disabled?: number;
  are_you_ready?: number;
  // file: any;
}

interface editTowerResponse extends BaseResponse {}

export const requestEditTower = wrapPost<editTowerRequest, editTowerResponse>(
  "/api/tower/updateConfig"
);

interface towerEditInfoRequest {
  tower_name: string;
}

interface towerEditInfoResponse extends BaseResponse {
  data: {
    name: string;
    title: string;
    tester: string;
  }[];
}

export const requestEditTowerInfo = wrapGet<
  towerEditInfoRequest,
  towerEditInfoResponse
>("/api/tower/info");

interface towerFileUpdateRequest {
  name: string;
  file: File;
}

interface towerFileUpdateResponse extends BaseResponse {
  code: 0;
}

export const requestTowerFileUpdate = wrapPost<
  towerFileUpdateRequest,
  towerFileUpdateResponse | CreateTowerErrorResponse
>("/api/tower/update");

export interface releaseTowerRequest {
  name: string;
  ismod?: string;
  mod_of?: string;
  title: string;
  authorId: string;
  author: string;
  remastered?: boolean;
  author2?: string;
  competition?: string;
  text?: string;
  tag?: string;
}

interface releaseTowerResponse extends BaseResponse {

}

export const requestReleaseTower = wrapPost<
  releaseTowerRequest,
  releaseTowerResponse
>("/api/tower/postTowerForm");

interface DeleteTowerRequest {
  name: string;
}

interface DeleteTowerResponse extends BaseResponse {

}

export const requestDeleteTower = wrapPost<
  DeleteTowerRequest,
  DeleteTowerResponse
>("/api/tower/delete");

interface DeleteScoreRequest {
  name: string;
  id: number;
}

interface DeleteScoreResponse extends BaseResponse {
  
}

interface DeleteAllRedScoreRequest {
  name: string;
}

interface DeleteAllRedScoreResponse extends BaseResponse {
  
}

export const requestDeleteScore = wrapPost<
  DeleteScoreRequest,
  DeleteScoreResponse
>("/api/tower/DeleteScore");

export const requestDeleteAllRedScore = wrapPost<
  DeleteAllRedScoreRequest,
  DeleteAllRedScoreResponse
>("/api/tower/DeleteAllRedScore");