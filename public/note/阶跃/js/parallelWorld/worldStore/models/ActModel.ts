import {
  CreateActImageRequest,
  createActImage
} from '@/src/api/parallel-world/consumer';
import { audioControl } from '@/src/components/audioPlayer/control';
import { ReportError, requestErrorLog } from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import AudioPlayer, {
  clearSounds,
  createSounds,
  createSoundsFromId
} from '@Components/audioPlayer';
import {
  ActDialog,
  ActImage,
  ActItem,
  ActType,
  WorldAct
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { Audio } from '@step.ai/expo-av';

export interface ActTTSDialog extends ActDialog {
  sounds: Promise<Audio.Sound | undefined>[];
}

export type ActModel = PartialMessage<WorldAct>;

export type TTSItem = {
  ttsUrl?: string[];
  ttsTaskId?: string;
  soundTask?: Promise<(Audio.Sound | undefined)[]>;
  ttsPending?: boolean;
};

export interface GenImage extends PartialMessage<ActImage> {
  loading?: boolean;
  isImgUserPrompt?: boolean;
}
export default class Act {
  act: ActModel = {
    actId: '',
    actIndex: 0,
    actItems: [],
    image: {}
  };
  genImages: GenImage[] = []; // 生成的图
  isImgUserPrompt = false; // 用户是否修改了prompt
  _updated: boolean = false;
  _itemMap: Map<string, number> = new Map();
  _ttsMap: Map<string, TTSItem> = new Map();
  _loading: boolean = false;
  constructor(act: PartialMessage<WorldAct>) {
    const { actItems, actId, roleInfoList, image, actIndex } = act;
    // this.act = { ...act };
    this.act.actId = actId || '';
    this.act.actIndex = actIndex || 0;
    this.collect(act);
    // this.act.actItems = (actItems || []).filter(
    //   item => item.type === ActType.Story || item.type === ActType.Dialog
    // );
    this.act.image = image;
    this.act.roleInfoList = roleInfoList;
    this.act.isFinish = act.isFinish;
  }

  getItems() {
    return this.act.actItems;
  }

  collectTTS(item: PartialMessage<ActItem>) {
    if (item.type === ActType.Dialog && item.item?.case === 'dialog') {
      const text = item.item?.value.text;
      if (!text) return;
      const { ttsTaskId, ttsUrl } = item.item.value; // ttsTaskId: 异步请求音频
      log.log('collectTTS4', item.item.value);
      if (ttsTaskId || ttsUrl?.length) {
        const params: TTSItem = {};

        // 二选一
        if (ttsUrl?.length) {
          params.ttsUrl = ttsUrl;
          params.soundTask = params.soundTask || createSounds(ttsUrl); // 不重复创建
          audioControl.add(params.soundTask);
        } else if (ttsTaskId) {
          params.ttsTaskId = ttsTaskId;
          params.soundTask = params.soundTask || createSoundsFromId(ttsTaskId);
          params.soundTask.catch(e => {
            params.soundTask = undefined;
          });
          audioControl.add(params.soundTask);
          // todo 要改
          // if (ttsTaskId === 'PENDING') {
          //   params.ttsPending = true;
          // } else {
          //   params.ttsTaskId = ttsTaskId;
          // }
        }
        this._ttsMap.set(text, params);
      }
    }
  }

  collectImage(act: Partial<WorldAct>) {
    if (act.image) {
      this.act.image = act.image;
    }
  }

  // todo 更新tts
  update(act: Partial<WorldAct>) {
    if (act.actItems) {
      this._itemMap = new Map();
      this.act.actItems = [];
    }
    log.log('update-------', { act });
    this.collect(act);
    this._updated = true;
  }

  getItemText(index: number) {
    const actItem = this.act?.actItems?.[index];
    if (!actItem) return '';
    // @ts-ignore
    if (actItem.type === ActType.Dialog && actItem.item?.case === 'dialog') {
      return actItem.item?.value?.text;
    }

    if (actItem.type === ActType.Story && actItem.item?.case === 'story') {
      return actItem.item?.value?.text;
    }
    // @ts-ignore
    return actItem.item?.value?.text;
  }

  getTextIndex(text: string) {
    log.log('getTextIndex', { text });
    const index = this._itemMap.get(text);
    if (typeof index === 'undefined') {
      log.log('getTextIndex', { text, index });
      requestErrorLog(
        'getTextIndex',
        { act: this.act },
        { tag: ReportError.PARALLEL_WORLD }
      );
    }
    return index || 0;
  }

  collect(act: PartialMessage<WorldAct>) {
    if (act.image) {
      this.act.image = act.image;
    }
    if (act.roleInfoList) {
      this.act.roleInfoList = act.roleInfoList;
    }

    if (act.isFinish) {
      this.act.isFinish = act.isFinish;
    }
    // todo 注意有坑 假如一幕中有重复文本，会有问题
    log.log('act.actItems', { actItems: act.actItems });
    act.actItems?.forEach((item, index) => {
      if (item.type === ActType.Story && item.item?.case === 'story') {
        const text = item.item?.value.text;
        if (!text) {
          return;
        }

        log.log('collect', { text, has: this._itemMap.has(text) });
        if (this._itemMap.has(text)) {
          return;
        }
        this._itemMap.set(text, index);
        this.act.actItems?.push(item);

        log.log('testlast----', item);
      }
      if (item.type === ActType.Dialog && item.item?.case === 'dialog') {
        const text = item.item?.value.text;
        log.log('collecttts', {
          text2: text,
          item,
          text: text && this._itemMap.has(text)
        });
        if (!text) {
          return;
        }
        this.collectTTS(item);

        if (this._itemMap.has(text)) {
          return;
        }
        this.act.actItems?.push(item);

        this._itemMap.set(text, index);
        log.log('collecttts3', {
          text,
          index,
          get: this._itemMap.get(text)
        });
      }
    });
  }
  getTTS(text: string) {
    return this._ttsMap.get(text);
  }
  createGenImages(imageMap: Map<string, ActImage>) {
    const result: ActImage[] = [];
    imageMap.forEach(item => {
      result.push(item);
    });
    return result;
  }
  requestImage(
    payload: CreateActImageRequest,
    cb: (payload: GenImage[]) => void,
    onError: (err: any) => void
  ) {
    if (this._loading) return;
    let lastGenImages = [...this.genImages];
    const { count } = payload;
    const { isImgUserPrompt } = this;
    const len = lastGenImages.length;
    for (let i = 0; i < count; i++) {
      lastGenImages.push({
        loading: true,
        isImgUserPrompt
      });
    }
    this.genImages = lastGenImages;
    cb(this.genImages);
    let cursor = 0;
    this._loading = true;
    createActImage(
      payload,
      d => {
        // this.collectGenImage();
        if (d.image) {
          lastGenImages[len + cursor] = {
            ...lastGenImages[len + cursor],
            loading: false,
            ...d.image
          };
          this.genImages = lastGenImages;
          cb(this.genImages);
          cursor += 1;
        }
        if (d.isFinish) {
          this.genImages = lastGenImages;
          cb(this.genImages);
          this._loading = false;
        }
      },
      e => {
        onError(e);
        this._loading = false;
      }
    );
  }
}
