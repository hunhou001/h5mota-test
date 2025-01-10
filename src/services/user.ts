import { BaseResponse, wrapGet, wrapPost } from "./utils";

interface getUserInfoRequest {}

interface getUserInfoResponse extends BaseResponse {
  data: object;
}

export const requestGetUserInfo = wrapGet<
  getUserInfoRequest,
  getUserInfoResponse
>("/api/user_info");

interface myTowerRequest {}

export interface towerInfo {
  are_you_ready: number;
  author: number;
  create_time: number;
  update_time: number;
  name: string;
  title: string;
  tester: string;
  disabled: number;
}
interface myTowerResponse extends BaseResponse {
  data: towerInfo[];
}

export const requestMyTower = wrapGet<myTowerRequest, myTowerResponse>(
  "/api/queryMyTower"
);

export const requestMyTestTower = wrapGet<myTowerRequest, myTowerResponse>(
  "/api/queryMyTest"
);

export const requestNotification = wrapGet<myTowerRequest, myTowerResponse>(
  "/api/queryMyTest"
);