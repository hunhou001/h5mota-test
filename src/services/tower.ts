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
  data?: {
    bgm_remote: boolean;
    code: number;
    message: string;
  };
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

interface deleteTowerRequest {
  name: string;
}

interface deleteTowerResponse extends BaseResponse {

}

export const requestDeleteTower = wrapPost<
  deleteTowerRequest,
  deleteTowerResponse
>("/api/tower/delete");