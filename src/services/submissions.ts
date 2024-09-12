import { wrapGet, BaseResponse } from "./utils";

export type ScoreType = {
  // detail: {
  //   hp: number;
  //   atk: number;
  //   def: number;
  //   mdef: number;
  //   money: number;
  //   experience: number;
  // };
  detail: string;

  id: number;
  name: string;
  userid: number;
  ending: string;
  hard: string;
  route: number;
  score: number;
  submit_time: string;
  verify: number;
};

interface submissionsRquest {
  tower_name: string;
}

interface submissionsResponse extends BaseResponse {
  data: ScoreType[];
}

export const requestSubmissions = wrapGet<
  submissionsRquest,
  submissionsResponse
>("/api/submissions");
