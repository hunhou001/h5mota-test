import { BaseResponse, wrapGet, wrapPost } from "./utils";

interface applytowerRequest {
  name: string;
  title: string;
  tester: string[];
  file: File;
}

interface applytowerResponse extends BaseResponse {
  code: 0;
  data: Object;
}

interface CreateTowerErrorResponse extends BaseResponse {
  code: -4;
  data: {
    bgm_remote: boolean;
    code: number;
    message: string;
  };
}

export const requestApplyTower = wrapPost<
  applytowerRequest,
  applytowerResponse | CreateTowerErrorResponse
>("/api/tower/create");

interface edittowerRequest {
  name: string;
  title: string;
  tester: string[];
  // file: any;
}

interface edittowerResponse extends BaseResponse {}

export const requestEditTower = wrapPost<edittowerRequest, edittowerResponse>(
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
