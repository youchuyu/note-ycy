import { Dimensions, Platform } from 'react-native';
import { getRemoteAssets } from '@/src/utils/getRemoteAssets';

export const window = Dimensions.get('window');
export const screen = Dimensions.get('screen');
// console.log('window----->', window);
// console.log('screen----->', screen);

export const parallelWorldColors = {
  bg: 'rgb(23, 29, 38)',
  inputBg: 'rgba(28, 37, 48, 1)',
  bgMask: 'rgba(71, 105, 135, 0.1)',
  fontBlue: 'rgba(129, 194, 255, 1)',
  fontGlow: 'rgba(127, 217, 255, 1)',
  bgGlow: 'rgba(127, 217, 255, 0.2)'
};

export const parallelWorldPalette = [
  '#B49CE2',
  '#5FBDF5',
  '#29CDA3',
  '#F7C668',
  '#FF8660',
  '#EE6464'
];

export const PARALLEL_WORLD_BG = getRemoteAssets(
  'image/parallel-world/parallel-bg.jpg'
);
export const PARALLEL_WORLD_BG_VIDEO = getRemoteAssets(
  'mp4/parallel-world/background.mp4'
);
export const PW_LOADING_VIDEO = getRemoteAssets(
  'mp4/parallel-world/loading-img.mp4'
);
export const PW_PURE_BG_VIDEO = getRemoteAssets(
  'mp4/parallel-world/pure-loading.mp4'
);

// 按钮高度
export const BUTTON_HEIGHT = 46;

// 头像展示尺寸
export const AVATAR_SIZE = 28;

export const BOTTOM_BAR_HEIGHT = 84;
export const TIMELINE_HEIGHT = 42;
const HEADER_HEIGHT = 54;
const CARD_TEXT_HEIGHT = 120;

const GAPs = 30 + 28 + 54 + 40;

// 卡片尺寸
export const getGenImgHeightByWidth = (imgWidth: number) => (imgWidth / 3) * 4;

// 计算卡片宽度
export const getGenImgWidthByHeight = (imgHeigh: number) => {
  const defaultWidth = (imgHeigh / 4) * 3;

  if (defaultWidth < screen.width - 48) {
    return defaultWidth;
  } else {
    return (imgHeigh / 3) * 2;
  }
};

export const CARD_WIDTH = screen.width - 48;

export const VIEWER_CARD_IMG_HEIGHT =
  screen.height -
  BOTTOM_BAR_HEIGHT -
  TIMELINE_HEIGHT -
  HEADER_HEIGHT -
  CARD_TEXT_HEIGHT -
  GAPs;

export const VIEWER_CARD_IMG_WIDTH = getGenImgWidthByHeight(
  VIEWER_CARD_IMG_HEIGHT
);

// 埋点参数
export namespace WorldAPM {
  export enum INTERACTIVE_BEHAVIOR {
    CLICK = 1,
    LEFT = 2,
    RIGHT = 3
  }
  export enum CONTENT_STATE {
    FINISHED = 1,
    UNFINISHED = 2
  }
}

// banner
export const PREVIOUS = require('@Assets/image/parallel-world/previous.png');

export const BGM_RESOURCE =
  'https://resource.lipuhome.com/resource/mp3/prod/guimie.mp3';

export const BGM_RESOURCES = {};
