import { Toast } from "@douyinfe/semi-ui";
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { mapValues } from "lodash-es";

const config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const axios = Axios.create(config);

export default axios;

// 网站 api 均有 code 和 message 返回
export interface BaseResponse {
  code: number;
  message: string;
}

interface ErrorResponse {
  code: -1000;
  message: string;
}

export enum ShowMessage {
  None,
  ErrorOnly,
  Always,
}

type RequestOptions = { message: ShowMessage } & AxiosRequestConfig;

const putMessage = (message: string | undefined) => {
  return {
    duration: 3,
    content: message || "",
    stack: true,
  };
};

const handle = <R extends BaseResponse>(
  request: Promise<AxiosResponse<R, any>>,
  showMessage: ShowMessage
): Promise<R | ErrorResponse> => {
  return request
    .then((res) => {
      const { data } = res;
      if (showMessage !== ShowMessage.None) {
        if (data.code < 0 || data.code > 1000) {
          Toast.error(putMessage(data.message));
        } else {
          if (showMessage === ShowMessage.Always) {
            Toast.success(putMessage(data.message));
          }
        }
      }
      return data;
    })
    .catch((e) => {
      if (showMessage !== ShowMessage.None) {
        Toast.error(putMessage(`请求失败: ${e}`));
      }
      return {
        code: -1000,
        message: e,
      };
    });
};

const serializeParams = (params: Record<string, any>) => {
  return mapValues(params, (value) => {
    if (value && typeof value === "object" && !(value instanceof Blob)) {
      return JSON.stringify(value);
    }
    return value;
  });
};

export const wrapParameterlessGet = <R extends BaseResponse>(path: string) => {
  return ({ message, ...options }: Partial<RequestOptions> = {}) => {
    return handle(
      axios.get<R>(path, options),
      message ?? ShowMessage.ErrorOnly
    );
  };
};

export const wrapGet = <T extends Record<string, any>, R extends BaseResponse>(
  path: string
) => {
  return (params: T, { message, ...options }: Partial<RequestOptions> = {}) => {
    return handle(
      axios.get<R>(path, { ...options, params: serializeParams(params) }),
      message ?? ShowMessage.ErrorOnly
    );
  };
};

export const wrapPost = <T extends Record<string, any>, R extends BaseResponse>(
  path: string
) => {
  return (data: T, { message, ...options }: Partial<RequestOptions> = {}) => {
    return handle(
      axios.postForm<R>(path, serializeParams(data), options),
      message ?? ShowMessage.Always
    );
  };
};

export const createFormData = function (data: Record<string, any>) {
  const formdata = new FormData();
  for (const key in data) {
    formdata.append(key, data[key]);
  }
  return formdata;
};
