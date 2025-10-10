import * as audios from "@current/utils/sourceEntry/audio";
import { AudioInstance } from "../audio";

const play = require("@utils/audio-play");
const load = require("audio-loader");

export type BGMType =
  | "NEXT_PIC"
  | "NEXT_PLOT"
  | "CHOSEN"
  | "FILM1"
  | "FILM2"
  | "PROJECTOR1"
  | "PROJECTOR2"
  | "SCORE"
  | "EMOJI_SHOW"
  | "SUCCESS"
  | "FAIL";

interface AudioConfig {
  //start/end time, can be negative to measure from the end
  start: number;

  //repeat playback within start/end
  loop: boolean;

  //playback rate
  rate: number;

  //volume
  volume: number;

  //start playing immediately
  autoplay: boolean;
}

const defaultConfig: AudioConfig = {
  //start/end time, can be negative to measure from the end
  start: 0,

  //repeat playback within start/end
  loop: false,

  //playback rate
  rate: 1,

  // //volume
  volume: 1,

  //start playing immediately
  autoplay: true,
};

export class BGM {
  buffSet: Partial<Record<BGMType, any>> = {};
  bgmInstance: Partial<Record<BGMType, AudioInstance>> = {};
  globalConfig: Partial<AudioConfig> = {};

  constructor() {}

  mute() {
    const globalConfig = this.globalConfig;
    this.globalConfig = { ...globalConfig, volume: 0 };
    const instances = this.bgmInstance;

    for (const key in instances) {
      instances[key as BGMType]?.pause();
    }
  }

  unMute() {
    const { volume, ...configs } = this.globalConfig;
    this.globalConfig = configs;
  }

  async createBgm(key: BGMType, config: Partial<AudioConfig> = {}) {
    // 加载
    if (!this.buffSet[key]) {
      const buff = await load(audios[key]);

      this.buffSet[key] = buff;
    }

    if (this.bgmInstance[key]) {
      this.bgmInstance[key].pause();
    }
    return new Promise((resolve) => {
      this.bgmInstance[key] = play(
        this.buffSet[key],
        { ...config, ...this.globalConfig },
        () => {
          resolve(this.bgmInstance[key]);
        }
      );
    });
  }

  async playOnce(key: BGMType, config: Partial<AudioConfig> = {}) {
    // 播放
    await this.createBgm(key, {
      autoplay: true,
      ...config,
      ...this.globalConfig,
    });
    this.bgmInstance[key] = null;
  }

  async playLoop(key: BGMType, config: Partial<AudioConfig> = {}) {
    if (!this.bgmInstance[key]) {
      // 播放
      await this.createBgm(key, {
        ...config,
        ...this.globalConfig,
        autoplay: true,
        loop: true,
      });
    }
  }

  async pause(key: BGMType) {
    this.bgmInstance[key]?.pause();
    this.bgmInstance[key] = null;
  }

  getBgmInstance(key: BGMType) {
    return this.bgmInstance[key];
  }

  clearBgmInstance(key: BGMType) {
    if (this.bgmInstance[key]) {
      this.bgmInstance[key].pause();
      this.bgmInstance[key] = null;
    }
  }
}

export const bgm = new BGM();
