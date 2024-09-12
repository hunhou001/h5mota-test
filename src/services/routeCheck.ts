import { wrapGet, BaseResponse } from "./utils";

export type RouteMessageType = {
  code: number;
  msg?: string;
  reason?: string;
};

interface recheckRouteRquest {
  name: string;
  id: number;
}

interface recheckAllRouteRquest {
  name: string;
}

interface recheckAllRouteResponse extends BaseResponse {
  data: string;
}

interface recheckRouteResponse extends BaseResponse {
  data: RouteMessageType;
}

interface Routemsgs {
  [code: string]: string
}

export const routemsgs:Routemsgs = {
  "-2": "录像运行成功，但是结果和上传成绩不一致。",
  "-1": "录像验证成功！",
  "0": "未验证的录像",
  "1": "未处理的脚本错误！",
  "2": "录像内容为空！",
  "3": "不能以root权限运行检测程序！",
  "4": "该塔不存在！",
  "5": "录像文件不存在！",
  '6': "运行参数错误！",
  "7": "录像和塔不一致！",
  "8": "仅支持检测2.6及以上的塔！",
  "10": "录像播放出错！",
  "15": "录像运行超时！",
  "16": "意外中断的录像，有可能是回调链断裂。",
  "18": "录像难度与提交的难度不一致",
}

export const requestRecheckRoute = wrapGet<
  recheckRouteRquest,
  recheckRouteResponse
>("/api/recheckRoute");

export const requestRecheckAllRoute = wrapGet<
  recheckAllRouteRquest,
  recheckAllRouteResponse
>("/api/recheckAllRoute");
