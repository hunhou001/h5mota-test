import { BaseResponse, wrapGet, wrapPost } from "./utils";

interface getUserInfoRequest {}

interface getUserInfoResponse extends BaseResponse {
  data: Object;
}

export const requestGetUserInfo = wrapGet<
  getUserInfoRequest,
  getUserInfoResponse
>("/api/user_info");

interface myTowerRequest {}

interface myTowerResponse extends BaseResponse {}

export const requestMyTower = wrapGet<myTowerRequest, myTowerResponse>(
  "/api/queryMyTower"
);
