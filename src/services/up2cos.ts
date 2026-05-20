import axios from "./utils";
import { isAxiosError } from "axios";

/** 主站站点根（测试区页面无对应路由时，外链用户页、塔详情、后台下载等） */
export const H5MOTA_ORIGIN = "https://h5mota.com";

/** 主站自助更新拉数 URL（跨站方案暂停用，保留备查） */
export const H5MOTA_UP2COS_GET_DATA_URL =
  "https://h5mota.com/up2cos/getData.php";

export type Up2cosH5motaTowerItem = {
  name: string;
  title: string;
  text: string;
};

export type Up2cosH5motaTmpRow = {
  name: string;
  size: string | number;
  comment: string;
  uploadTime: string;
  status: string;
};

/** 与 `.idea/自助更新相关/index.js` 中 `formatSize` 一致（审核表「文件大小」列） */
export function formatH5motaTmpSize(size: string | number): string {
  const n = typeof size === "string" ? Number(size) : size;
  if (!Number.isFinite(n)) return String(size);
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)}KB`;
  if (n < 1024 * 1024 * 1024)
    return `${(n / 1024 / 1024).toFixed(2)}MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

/** 登录且拉取成功时 PHP / 测试区 `GET /api/up2cos/getData` 成功体（见 getData.php） */
export type Up2cosH5motaGetDataOk = {
  id: number;
  username: string;
  list: Up2cosH5motaTowerItem[];
  code: 1;
  data: Up2cosH5motaTmpRow[];
};

export type Up2cosH5motaGetDataErr = {
  code: number;
  str?: string;
  message?: string;
};

/**
 * 向测试区后端索取用于主站 `Authorization: Bearer` 的 JWT。
 * 路径需与测试区 Nest 实现一致；若尚未部署则返回 null，主站会返回 need login。
 */
export async function fetchUp2cosH5motaJwt(): Promise<string | null> {
  try {
    const { data } = await axios.get<{
      code: number;
      data?: { token?: string; jwt?: string; bearer?: string };
      token?: string;
    }>("/api/up2cos/h5motaJwt", { withCredentials: true });
    if (data.code !== 0) return null;
    const raw =
      data.data?.token ??
      data.data?.jwt ??
      data.data?.bearer ??
      (data as { token?: string }).token;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

/** 与主站 setData.php / 测试区 `POST /api/up2cos/setData` 成功体一致 */
export type Up2cosH5motaSetDataOk = {
  code: 1;
  id: number;
  username: string;
  error?: number;
  upload?: boolean;
  [key: string]: unknown;
};

export type Up2cosH5motaSetDataErr = {
  code: number;
  str?: string;
};

export function isUp2cosH5motaSetDataOk(
  body: unknown
): body is Up2cosH5motaSetDataOk {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { code?: unknown }).code === 1
  );
}

/**
 * 测试区内自助更新上传：`POST /api/up2cos/setData`（cookie 会话），
 * `multipart/form-data` 含 `name`、`comment`、`file`；可选 `type=upload` 与旧 index.js 一致。
 */
export async function postUp2cosSetData(
  params: {
    name: string;
    comment: string;
    file: File;
  },
  options?: {
    onUploadProgress?: (percent: number) => void;
  }
): Promise<Up2cosH5motaSetDataOk | Up2cosH5motaSetDataErr | null> {
  const fd = new FormData();
  fd.append("type", "upload");
  fd.append("name", params.name);
  fd.append("comment", params.comment);
  fd.append("file", params.file);

  try {
    const { data } = await axios.post<
      Up2cosH5motaSetDataOk | Up2cosH5motaSetDataErr
    >("/api/up2cos/setData", fd, {
      withCredentials: true,
      onUploadProgress: (e) => {
        if (!e.total || !options?.onUploadProgress) return;
        options.onUploadProgress(
          Math.round((100 * e.loaded) / e.total)
        );
      },
    });
    return data;
  } catch (e: unknown) {
    if (isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
      return e.response.data as Up2cosH5motaSetDataOk | Up2cosH5motaSetDataErr;
    }
    console.error("[up2cos] POST /api/up2cos/setData failed", e);
    return null;
  }
}

export function isUp2cosH5motaGetDataOk(
  body: unknown
): body is Up2cosH5motaGetDataOk {
  if (body === null || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    o.code === 1 &&
    Array.isArray(o.list) &&
    Array.isArray(o.data) &&
    typeof o.username === "string"
  );
}

/** 测试区本库拉数：`GET /api/up2cos/getData`（cookie）；`tmp` 表按塔名仅最新一条 */
export async function getUp2cosGetDataLocal(): Promise<
  Up2cosH5motaGetDataOk | Up2cosH5motaGetDataErr | null
> {
  try {
    const { data } = await axios.get<
      Up2cosH5motaGetDataOk | Up2cosH5motaGetDataErr
    >("/api/up2cos/getData", { withCredentials: true });
    return data;
  } catch (e) {
    console.error("[up2cos] GET /api/up2cos/getData failed", e);
    return null;
  }
}

/*
 * --- 跨站主站 getData（暂注释；若需恢复主站历史/组合数据可取消注释并在 App 中改回调用）---
 *
 * export async function postUp2cosH5motaGetData(
 *   uid: string,
 *   bearerToken: string | null
 * ): Promise<Up2cosH5motaGetDataOk | Up2cosH5motaGetDataErr | null> {
 *   const fd = new FormData();
 *   fd.append("id", uid);
 *   const headers: Record<string, string> = {};
 *   if (bearerToken) {
 *     headers.Authorization = `Bearer ${bearerToken}`;
 *   }
 *   try {
 *     const { data } = await axios.post<
 *       Up2cosH5motaGetDataOk | Up2cosH5motaGetDataErr
 *     >(H5MOTA_UP2COS_GET_DATA_URL, fd, { headers });
 *     return data;
 *   } catch (e) {
 *     console.error("[up2cos] post getData.php failed", e);
 *     return null;
 *   }
 * }
 */
