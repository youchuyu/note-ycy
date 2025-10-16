import { GameType } from "@lipu/web-api/raccoon/common/types_pb";

export const BRIDGE_TYPE = {
  LOGIN: "LOGIN",
  TAKE_PHOTO: "TAKE_PHOTO",
  ROUTER_PUSH: "ROUTER_PUSH",
  ROUTER_REPLACE: "ROUTER_REPLACE",
  SHARE_INFO_REGISTER: "SHARE_INFO_REGISTER",
  SHARE_INFO_REGISTER_V2: "SHARE_INFO_REGISTER_V2",
  ROUTER_BACK: "ROUTER_BACK",
  WEBVIEW_INFO: "WEBVIEW_INFO",
  PUBLISH: "PUBLISH",
  MAGIC_VIDEO: "MAGIC_VIDEO",
  REPORT: "REPORT",
  REFRESH_TOKEN: "REFRESH_TOKEN",
};

export enum WebviewShareScene {
  DECISION_H5 = "decision_h5",
  DECISION_H5_IMAGE = "decision_h5_image",
}

export enum WebviewReportState {
  MOUNT = "MOUNT",
  UNMOUNT = "UNMOUNT",
}

export interface WebviewReportArgs {
  state: WebviewReportState;
  name: string;
  params: object;
}

export interface ShareInfo {
  title: string;
  description: string;
  // 分享卡片缩略图，优先于 images，用于特殊情况下覆盖 images，例如审核中场景
  thumbnail?: string;
  images: string[];
  imageIndex: number;
  url: string;
  imageMeta?: string;
  // 支持分享视频的渠道将优先分享视频
  videoUrl?: string;
}

// 分享参数
export interface WebviewShareParams {
  gameType?: GameType;
  scene?: WebviewShareScene;
  shareInfo?: Partial<ShareInfo>;
}

export interface MagicVideoImgItem {
  imageUrl: string;
  imageId: string;
}
export interface WebviewMagicVideoParams {
  images: MagicVideoImgItem[];
}

export interface WebviewNavParams {
  pathname: string;
  params?: object;
}

function sendNaviveEvent(type: string, params?: any) {
  if (typeof window !== "undefined" && type) {
    // @ts-ignore
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: type,
        parameter: params || {},
      })
    );
  }
}

export { sendNaviveEvent };
