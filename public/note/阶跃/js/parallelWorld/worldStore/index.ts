import { router } from 'expo-router';
import { create } from 'zustand';
import {
  parallelWorldClient,
  queryParallelWorldInfo,
  queryParallelWorldPlot
} from '@/src/api/parallel-world';
import { saveWorld } from '@/src/api/parallel-world/consumer';
import {
  createPlot,
  createPlotChoice,
  createWorld,
  queryPlotTags
} from '@/src/api/parallel-world/feed';
import { Socket } from '@/src/api/websocket';
import {
  Control,
  TasksControl,
  createPromiseClient
} from '@/src/api/websocket/StreamTaskControl';
import { ErrorRes } from '@/src/api/websocket/stream_connect';
import {
  REVIEW_ERR_ENUM,
  showErr
} from '@/src/bizComponents/parallelWorld/errorMsg';
import { initParallelWorldEmojiInfo } from '@/src/store/emoji-creator';
import { GameType } from '@/src/types';
import {
  ReportError,
  catchErrorLog,
  errorReport,
  requestErrorLog
} from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import {
  FRONTEND_FETCH_WAITING_TIMEOUT,
  requestWithTimeout
} from '@/src/utils/requestWithTimeout';
import { safeGoBack } from '@/src/utils/safeGoBack';
import { showToast } from '@Components/toast';
import { reportClick, reportExpo } from '@Utils/report';
import { uuid } from '@Utils/uuid';
import { useAuthStore } from '../authInfo';
import { useDetailStore } from '../detail';
import { useStorageStore } from '../storage';
import PlotModel from './models/PlotModel';
import WorldModel from './models/WorldModel';
import {
  ActImage,
  ActItem,
  PlotTag,
  WorldAct
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import {
  CreatePlotChoiceRes,
  CreateWorldRes,
  TimelinePlot
} from '@/proto-registry/src/web/raccoon/world/world_pb';

const MAX_WORLD_NUM = 10; // 最多同时保存10个平行世界
// type WorldInfo = {
//   cardId: string;
// };

export enum PARALLEL_WORLD_PAGES_ENUM {
  MAIN = 'MAIN',
  FEED = 'FEED',
  CONSUMER = 'CONSUMER',
  PUBLISH = 'PUBLISH'
}

export interface WorldRoute {
  route: PARALLEL_WORLD_PAGES_ENUM;
  cardId?: string; // publish页面不需要
  plotId?: string; // publish页面不需要
}

interface IConfig {
  worldAudio: boolean;
  worldMusic: boolean;
}
interface PlaceCardInfo {
  title?: string;
  actIndex?: number;
  plotIndex?: number;
  refreshTimeline?: boolean;
}
export enum CreateSatus {
  init = 'init', // 初始
  creating = 'creating', // 创建中
  world = 'world', // 世界创建好了
  plot = 'plot', // 有剧情了
  done = 'done' // 全部完成
}

/* 折叠状态枚举 */
export enum FOLD_STATUS_ENUM {
  FOLD = 'FOLD',
  UNFOLD = 'UNFOLD',
  FOLD_2_UNFOLD = 'LOOP'
}

export enum ModalType {
  TEXT_EDIT = 'TEXT_EDIT',
  NEXT_CHAPTER = 'NEXT_CHAPTER',
  FEED_INPUT = 'FEED_INPUT'
}

const findBreakPoint = (
  timeline: TimelinePlot[],
  newTimeLine: TimelinePlot[]
): number => {
  let breakPoint = 0;
  const l = Math.max(timeline.length, newTimeLine.length);
  for (let i = 0; i < l; i++) {
    if (timeline[i]?.plotId !== newTimeLine[i]?.plotId) {
      breakPoint = i;
      break;
    }
  }

  return breakPoint;
};

const taskControls = new TasksControl();

type States = {
  requestWorlding: boolean;
  worlds: Map<String, WorldModel>;
  currentWorld: WorldModel | null;
  timelinePlots: TimelinePlot[]; // 时间轴要维护成全局。。因为它和接口不对应
  plotIndex: number; // 章节索引
  actIndex: number; // 幕索引
  plotId: string; // 当前章节ID
  actId: string; // 当前幕ID
  _worldStack: string[]; // 世界堆栈
  worldRouteStack: WorldRoute[];
  poppedRoute: WorldRoute | null;
  worldCreateStatus: CreateSatus;
  _worldStatusStack: CreateSatus[];
  actNonce: Record<string, string> | null;
  cacheEditAct: Partial<WorldAct> | null; // 缓存编辑态数据
  actsLen: number;
  pageFoldStatus: FOLD_STATUS_ENUM;
  // 弹窗
  modalVisible: boolean; // 全局弹窗的显示隐藏 一次仅一个
  modalScope: ModalType | null; // 弹窗类型
  modalData: any; // 弹窗数据
  // 选项
  plotTags: PlotTag[] | null;
  selectedPlotTag: PlotTag | undefined;

  // loading
  globalLoading: boolean;

  // 设置
  config: IConfig;

  prevd: boolean;

  placeCardInfo?: PlaceCardInfo;
};

type Actions = {
  setConfig: (payload: IConfig) => void;
  initWorld: (cardId: string, placeCardInfo?: PlaceCardInfo) => void; // 初始化世界
  pushWorldRouteStack: (route: WorldRoute) => void;
  popWorldRouteStack: () => WorldRoute | undefined;
  nextAct: () => void;
  prevAct: () => void;

  setActIndex: (actIndex: number) => void;
  setPlotIndex: (plotIndex: number) => void;
  requestPlot: (plotId: string, index?: number) => void;
  updatePlotIndex: (plotIndex: number) => void;
  updateActIndex: (actIndex: number) => void;
  nextPlot: () => void;
  prevPlot: () => void;
  createWorld: (tagCode: number) => Promise<CreateWorldRes>;
  createPlot: ({
    prePlotId,
    choice
  }: {
    prePlotId: string;
    choice: string;
  }) => Promise<unknown>;
  updateWorldStatus: (status: CreateSatus) => void;
  reset: () => void;
  setPrevd: (prevd: boolean) => void;
  changeNonce: (key: string) => void;
  switchPageFoldStatus: (status: FOLD_STATUS_ENUM) => void;
  gotoTL: (index: number) => void;
  gotoPlot: (index: number) => void;
  updateCacheAct: (act: Partial<WorldAct>) => void; // 缓存编辑态act
  updateCurrentAct: () => Promise<unknown>;
  showModal: <T>(scope: ModalType, modalData: T) => void;
  hideModal: () => void;
  checkModalVisible: (scope: ModalType) => boolean;
  createChoice: () => Promise<CreatePlotChoiceRes>;
  selectPlotTag: (plogTag: PlotTag) => void;
  changeLoading: (loading: boolean) => void;
  updateAllAct: () => void;
  revertWorld: () => void;
};

function resetState() {
  return {
    placeCardInfo: undefined,
    timelinePlots: [],
    pageFoldStatus: FOLD_STATUS_ENUM.UNFOLD,
    actNonce: null,
    currentWorld: null, // 当前世界
    worlds: new Map(),
    plotIndex: 0, // 当前章节索引
    actIndex: 0, // 当前幕索引
    consumerData: {}, // 生成的数据
    plotId: '', // 当前章节ID
    actId: '', // 当前幕ID
    _worldStack: [],
    _worldStatusStack: [],
    // 路由
    worldRouteStack: [],
    poppedRoute: null,
    plotTags: null, // 剧情标签
    worldCreateStatus: CreateSatus.init, // 世界的创建状态
    actsLen: 0, // 仅生成过程用
    modalVisible: false,
    modalScope: null,
    modalData: null,
    cacheEditAct: null,
    selectedPlotTag: undefined,
    globalLoading: false,
    requestWorlding: false
  };
}

export const useWorldStore = create<States & Actions>()((set, get) => ({
  prevd: false,
  config: {
    worldAudio: true,
    worldMusic: true
  },
  ...resetState(),
  setConfig(config) {
    set({
      config
    });
    useStorageStore.getState().__setStorage({
      worldAudio: config.worldAudio,
      worldMusic: config.worldMusic
    });
  },
  changeLoading(loading) {
    set({ globalLoading: loading });
  },
  selectPlotTag(selectedPlotTag) {
    set({ selectedPlotTag });
  },
  checkModalVisible(scope) {
    return scope === get().modalScope && get().modalVisible;
  },
  showModal(scope, data) {
    set({ modalScope: scope, modalVisible: true, modalData: data });
  },
  hideModal() {
    set({ modalScope: null, modalVisible: false });
  },
  updateCacheAct(act) {
    const currentAct = get().currentWorld?.getCurrentPlot()?.getCurrentAct();

    currentAct?.update(act);

    if (currentAct?.act.isFinish) {
      get().updateCurrentAct();
    }

    if (currentAct?.act.actId) {
      get().changeNonce(currentAct?.act.actId);
    }
  },
  updateCurrentAct() {
    const { currentWorld } = get();
    const currentAct = currentWorld?.getCurrentPlot()?.getCurrentAct();

    const params = {
      cardId: currentWorld?.cardId,
      plotId: currentWorld?.getCurrentPlotId(),
      act: currentAct?.act
    };
    log.log('updateCurrentAct', params);
    return parallelWorldClient
      .updateSinglePlotAct(params)
      .then(actInfo => {
        log.log('actInfo-------', actInfo);
        // const { image } = actInfo.act;
        // todo 更新tts
        // if (!act) return;
        if (actInfo.act) {
          currentAct?.update(actInfo.act);
          get().changeNonce(currentAct?.act.actId || '');
        }
        return actInfo;
      })
      .catch(e => {
        console.log('updateCurrentAct error', e);
        showToast('剧情不太行，再调整一下'); // TODO 要改 不好
        catchErrorLog('updateCurrentAct', e);
        return Promise.reject(e);
      });
  },
  updateAllAct() {
    const { currentWorld } = get();
    const acts = currentWorld?.getCurrentPlot()?.queryActs();
    const plotId = currentWorld?.getCurrentPlotId();
    const cardId = currentWorld?.cardId;
    if (!plotId || !cardId) {
      log.log('updateAllAct', { cardId, plotId });
      return;
    }
    acts?.forEach(act => {
      if (act._updated) {
        parallelWorldClient
          .updateSinglePlotAct({
            cardId,
            plotId
          })
          .then(actInfo => {
            log.log('actInfo-------', actInfo);
            if (actInfo.act) {
              act?.update(actInfo.act);
            }
            return actInfo;
          })
          .catch(e => {
            console.log('updateCurrentAct error', e);
            showErr(e, REVIEW_ERR_ENUM.PLOT_CHANGE);
            catchErrorLog('updateCurrentAct', e);
            return Promise.reject(e);
          });
      }
    });
  },
  reset() {
    set({ ...resetState() });
  },

  setPrevd(prevd) {
    set({ prevd });
  },

  switchPageFoldStatus(status: FOLD_STATUS_ENUM) {
    set({ pageFoldStatus: status });
  },

  async initWorld(cardId, placeCardInfo) {
    // console.log(
    //   'initWolrd',
    //   cardId,
    //   get().currentWorld?.world?.cardId,
    //   get().requestWorlding
    // );
    if (placeCardInfo) {
      set({ placeCardInfo });
    }

    if (get().currentWorld?.world?.cardId === cardId) return;
    if (get().requestWorlding) return;
    // const cacheWorld = get().worlds.get(cardId);
    // if (cacheWorld) {
    //   if (
    //     (cacheWorld.world?.timelinePlots?.length || 0) >
    //     get().timelinePlots.length
    //   ) {
    //     set({ timelinePlots: cacheWorld.world?.timelinePlots });
    //   }

    //   if (typeof placeCardInfo?.actIndex !== 'undefined') {
    //     get().updateActIndex(cacheWorld.getCurrentPlot()?.actIndex || 0);
    //   }
    //   if (typeof placeCardInfo?.plotIndex !== 'undefined') {
    //     get().updatePlotIndex(cacheWorld.getCurrentPlotIndex() || 0);
    //   }
    //   set({ currentWorld: cacheWorld });
    //   // log.log('cacheWorld', {
    //   //   cacheWorld,
    //   //   actIndex: cacheWorld.getCurrentPlot()?.actIndex || 0,
    //   //   plotIndex: cacheWorld.getCurrentPlotIndex() || 0,
    //   //   currentPlot: cacheWorld.getCurrentPlot(),
    //   //   plots: cacheWorld.world?.plots
    //   // });
    //   console.log(
    //     'cacheWorld.world?.plots',
    //     cacheWorld.getCurrentPlotIndex(),
    //     cacheWorld.world?.plotIndexMap,
    //     cacheWorld.world?.plots,
    //     placeCardInfo
    //   );

    //   // todo 初始化表情包数据
    //   // initParallelWorldEmojiInfo(res);

    //   return;
    // }
    // todo 已有数据不重复取
    set({ requestWorlding: true });

    try {
      const timer = setTimeout(() => {
        if (get().requestWorlding) {
          set({ requestWorlding: false, worldCreateStatus: CreateSatus.init });
          get().setPrevd(false);
          errorReport('queryParallelWorldInfo——timeout', ReportError.STORE, {
            cardId
          });
          showToast('加载失败~');
          safeGoBack();
        }
      }, 4000);
      const res = await queryParallelWorldInfo({ cardId });
      clearTimeout(timer);
      log.log('initWorld', res);
      set({ requestWorlding: false });
      if (!res?.world?.cardId) return; // cardId 不存在

      const currentWorld = new WorldModel(res);

      const { timelinePlots } = get();
      get().worlds.set(cardId, currentWorld);

      useWorldStore.getState().pushWorldRouteStack({
        route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
        cardId
      });

      if (typeof placeCardInfo?.actIndex !== 'undefined') {
        get().updateActIndex(placeCardInfo?.actIndex);
      } else {
        get().updateActIndex(currentWorld.getCurrentPlot()?.actIndex || 0);
      }
      if (typeof placeCardInfo?.plotIndex !== 'undefined') {
        get().updatePlotIndex(placeCardInfo?.plotIndex);
      } else {
        get().updatePlotIndex(currentWorld.getCurrentPlotIndex() || 0);
      }
      // get().updateActIndex(currentWorld.getCurrentPlot()?.actIndex || 0);
      // // alert(currentWorld.getCurrentPlotIndex());
      // get().updatePlotIndex(currentWorld.getCurrentPlotIndex() || 0);
      set({ currentWorld });
      // todo
      if (!get().timelinePlots?.length || placeCardInfo?.refreshTimeline) {
        set({ timelinePlots: currentWorld.world?.timelinePlots });
      }

      // 管理内存
      get()._worldStack.unshift();
      if (get()._worldStack.length > MAX_WORLD_NUM) {
        const oldestCardId = get()._worldStack.pop();
        if (oldestCardId) {
          get().worlds.delete(oldestCardId);
        }
      }
      // 初始化表情包数据
      initParallelWorldEmojiInfo(res);

      // 初始化剧情标签
      if (!get().plotTags?.length) {
        queryPlotTags({}).then(({ tags }) => {
          set({ plotTags: tags });
        });
      }

      //   const { acts = [], ...plotInfo } = res?.plot ?? {};

      //   const defaultPlotIndex = (plotInfo as PlotInfo).plotIndex ?? 0;

      //   // 是否播放视频逻辑
      //   const { worldRouteStack } = useParallelWorldStore.getState();
      //   const isInitAnimationPlay =
      //     defaultPlotIndex !== 0 && worldRouteStack.length === 1;

      //   set({
      //     acts,
      //     topic: res?.topic,
      //     worldInfo: res?.world,
      //     timeline: res?.timelinePlots ?? [],
      //     activeTimelineSectionIdx: defaultPlotIndex,
      //     actIndex: 0,
      //     isInitAnimationPlay
      //   });
    } catch (e) {
      set({ requestWorlding: false, worldCreateStatus: CreateSatus.init });
      get().setPrevd(false);
      errorReport('queryParallelWorldInfo', ReportError.STORE, e);
      // @ts-ignore
      if (e?.code === 10004) {
        router.replace('/empty-page/');
      } else {
        showToast('加载失败~');
        router.back();
      }
      // get().reset();
    }
  },

  updateWorldStatus(worldCreateStatus) {
    if ([CreateSatus.init, CreateSatus.done].includes(worldCreateStatus)) {
      get()._worldStatusStack = [];
    }

    get()._worldStatusStack.push(worldCreateStatus);
    set({ worldCreateStatus });
  },

  updateActIndex(index: number) {
    const { currentWorld } = get();
    const currentPlot = currentWorld?.getCurrentPlot();
    log.log('updateActIndex', { index, plot: currentPlot?.plot });
    currentPlot?.updateActIndex(index);
    get().setActIndex(index);
  },
  updatePlotIndex(index: number) {
    const { currentWorld } = get();
    currentWorld?.updatePlotIndex(index);
    get().setPlotIndex(index);
  },
  setActIndex(index: number) {
    const { currentWorld } = get();
    set({
      actIndex: index,
      actId: currentWorld?.getCurrentPlot()?.getCurrentActId()
    });
  },
  setPlotIndex(index: number) {
    const { currentWorld } = get();
    set({
      plotIndex: index,
      plotId: currentWorld?.getCurrentPlotId()
    });
  },
  requestPlot(plotId: string, index?: number) {
    return queryParallelWorldPlot({ plotId }).then(res => {
      log.log('requestPlot', res);
      if (res.plot) {
        const plotModel = new PlotModel(res.plot);
        get().currentWorld?.collectPlot(plotModel);
        if (index) {
          plotModel.setPlotIndex(index);
        }
        // get().currentWorld?.collectPlotChoice(plotModel);
      } else {
        requestErrorLog('requestPlot', { plotId, res: JSON.stringify(res) });
      }
    });
  },
  nextPlot() {
    get().currentWorld?.nextPlot(); // 下一个章节
    get().updatePlotIndex(get().currentWorld?.getCurrentPlotIndex() || 0);
    const currentPlot = get().currentWorld?.getCurrentPlot();
    currentPlot?.updateActIndex(0);
    get().setActIndex(0);
  },
  prevPlot() {
    get().currentWorld?.prevPlot(); // 上一个章节
    get().updatePlotIndex(get().currentWorld?.getCurrentPlotIndex() || 0);
    const currentAct = get().currentWorld?.getCurrentPlot()?.getCurrentAct();
    // currentPlot?.updateActIndex(0);
    get().updateActIndex(currentAct?.act.actIndex || 0);
  },
  async gotoPlot(index) {
    const { currentWorld } = get();
    const plot = currentWorld?.getPlotByIndex(index);
    const { plotId } = get().timelinePlots?.[index];
    if (plot) {
      get().updatePlotIndex(index);
      get().updateActIndex(0);
    } else if (plotId) {
      await get().requestPlot(plotId, index);
      get().updatePlotIndex(index);
      get().updateActIndex(0);
    }

    // 初始化世界数据
    const currentPlot = currentWorld?.getCurrentPlot();
    const id = currentPlot?.cardId;
    useWorldStore.getState().pushWorldRouteStack({
      route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
      cardId: id as string
    });
  },
  async gotoTL(index) {
    const { currentWorld, timelinePlots } = get();

    if (get().worldCreateStatus === CreateSatus.plot) {
      showToast('当前时间线创建中，请勿随意移动~');
      return;
    }
    const plot = timelinePlots?.[index];
    if (!plot) {
      log.log('gotoTL', {
        index,
        timelinePlots: currentWorld?.world?.timelinePlots
      });
      return;
    }

    set({
      requestWorlding: true
    });

    useWorldStore
      .getState()
      .switchPageFoldStatus(FOLD_STATUS_ENUM.FOLD_2_UNFOLD);
    await get().gotoPlot(index);
    // get().pushWorldRouteStack({
    //   route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
    //   cardId: get().currentWorld?.getCurrentPlot().cardId
    // });
    set({ requestWorlding: false });

    // // todo 为什么cardid和plot里面的cardid不一样？？？
    // if (plot.cardId === currentWorld?.cardId) {
    //   await get().gotoPlot(index);
    //   return;
    // }
    // const { cardId } = plot;
    // log.log('gotoTL', { index, plotID: plot.plotId });
    // await get().initWorld(cardId, { actIndex: 0, plotIndex: index });
    // set({ requestWorlding: false });
    // get().pushWorldRouteStack({
    //   route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
    //   cardId
    // });
    // useWorldStore
    //   .getState()
    //   .switchPageFoldStatus(FOLD_STATUS_ENUM.FOLD_2_UNFOLD);
  },
  nextAct() {
    const { currentWorld } = get();
    const currentPlot = currentWorld?.getCurrentPlot();
    // console.log(
    //   'nextAct--------',
    //   currentPlot,
    //   currentPlot?.actIndex,
    //   currentPlot?.lastActIndex,
    //   currentPlot?.checkLastAct(),
    //   this.currentWorld?.plotIndex,
    //   this.currentWorld?.lastPlotIndex,
    //   this.currentWorld?.checkLastPlot()
    // );
    if (!currentPlot) return;
    // 最后一个act了
    if (currentPlot?.checkLastAct()) {
      get().pushWorldRouteStack({
        route: PARALLEL_WORLD_PAGES_ENUM.FEED,
        cardId: currentPlot?.cardId,
        plotId: currentWorld?.getCurrentPlotId()
      });
      // 最后一个章节了
      // if (currentWorld?.checkLastPlot()) {
      //   console.log('最后一幕了@@@@!');
      //   // todo
      //   get().pushWorldRouteStack({
      //     route: PARALLEL_WORLD_PAGES_ENUM.FEED,
      //     cardId: currentPlot?.cardId,
      //     plotId: currentWorld?.getCurrentPlotId()
      //   });
      // } else {
      //   get().nextPlot();
      // }
    } else {
      currentPlot.nextAct();
      get().updateActIndex(currentPlot.actIndex);
    }

    console.log(
      'nextAct--------2',
      get().plotIndex,
      get().actIndex,
      get().currentWorld
    );
  },
  prevAct() {
    const currentPlot = get().currentWorld?.getCurrentPlot();

    if (!currentPlot) return;

    if (!currentPlot?.actIndex) {
      // 第一个act
      if (!get().currentWorld?.plotIndex) {
        // 第一幕
        return;
      } else {
        get().prevPlot();
      }
    } else {
      currentPlot.prevAct();
      get().updateActIndex(currentPlot.actIndex);
    }
  },

  createTimeLinePlots() {},
  // todo: 限频
  createWorld(tagCode) {
    const { currentWorld, updateWorldStatus } = get();
    get().changeLoading(true);
    updateWorldStatus(CreateSatus.creating);
    const refCardId = currentWorld?.cardId;
    return createWorld({
      cardId: refCardId || '',
      plotId: currentWorld?.getCurrentPlotId() || '',
      tagCode
    })
      .then(res => {
        get().changeLoading(false);
        updateWorldStatus(CreateSatus.world);
        const { worldId, cardId, worldNum } = res;
        // const newTimelinePlots = get().createTimeLinePlots()
        const newWorld = new WorldModel({
          world: {
            worldId,
            cardId,
            // @ts-ignore
            worldNum: worldNum, // todo 接口字段格式不统一
            originalCardId: currentWorld?.world?.originalCardId || '',
            beginPlotId: currentWorld?.getCurrentPlotId() || ''
          },
          refCardId
          // timelinePlots: get().createTimeLinePlots()
        });
        get().worlds.set(cardId, newWorld);
        set({ currentWorld: newWorld });
        log.log('newWolrd', { cardId, cardId2: newWorld.cardId });
        // console.log('createWorld res----', res);
        return res;
      })
      .catch(e => {
        get().changeLoading(false);
        catchErrorLog('createWorld_error', e, {
          tag: ReportError.PARALLEL_WORLD
        });
        updateWorldStatus(CreateSatus.init);
        // get().popWorldRouteStack();
        return Promise.reject(e);
      });
  },
  changeNonce(key) {
    set({
      actNonce: { [key]: uuid() }
    });
  },
  createPlot({ choice, prePlotId }) {
    const { currentWorld, updateWorldStatus } = get();
    const cardId = currentWorld?.cardId || '';
    log.log('createPlot', { choice, prePlotId });
    let createdPlot = false;
    const plot = new PlotModel(null);
    plot.setCardId(cardId);
    updateWorldStatus(CreateSatus.creating);

    return createPromiseClient((control: Control) => {
      taskControls.add(control);
      createPlot(
        {
          cardId,
          prePlotId,
          choice
        },
        actInfo => {
          if (!control.check()) return;
          // 空包，上报+不处理
          if (!actInfo) {
            requestErrorLog('createPlotByChoice-actinfo-empty', {
              choice,
              prePlotId
            });
            return;
          }

          if (actInfo.isFinish) {
            updateWorldStatus(CreateSatus.done);
            get().updateAllAct();
            // todo
            const { currentWorld, worlds } = get();
            const refCardId = currentWorld?.refCardId;
            let refWorld = null;
            if (refCardId) {
              refWorld = worlds.get(refCardId);
            }
            const timeline = refWorld?.world?.timelinePlots;
            const newTimeLine = currentWorld?.world?.timelinePlots;
            const breakPoint = findBreakPoint(
              timeline || [],
              newTimeLine || []
            );
            const refPlot = newTimeLine?.slice(0, breakPoint) || [];
            const createPlotId = newTimeLine?.slice(breakPoint) || [];

            log.log('save_world_params', {
              cardId: get().currentWorld?.cardId || '',
              refPlotId: refPlot.map(s => s?.plotId),
              createPlotId: createPlotId.map(s => s?.plotId),
              timeline,
              newTimeLine
            });
            // todo 保存失败
            saveWorld({
              cardId: get().currentWorld?.cardId || '',
              refPlotId: refPlot.map(s => s?.plotId),
              createPlotId: createPlotId.map(s => s?.plotId)
            }).catch(e => {
              // showErr(e, REVIEW_ERR_ENUM.PLOT_CHANGE);
              catchErrorLog('saveWord', e);
              control.reject(e);
              get().revertWorld();
              // get().popWorldRouteStack();
            });
            control.resolve();
          }

          log.log('actInfo', actInfo);

          if (actInfo.plotId) {
            plot.collect(actInfo);

            if (actInfo.plotChoice) {
              const currentTL = get().timelinePlots;
              if (currentTL[currentTL.length - 1]) {
                currentTL[currentTL.length - 1].choicePoint =
                  actInfo.plotChoice;
                set({ timelinePlots: currentTL });
              }
            }

            if (!createdPlot) {
              createdPlot = true;
              const isNewWorld =
                !get().currentWorld?.world?.timelinePlots?.length; // 是否为新创建的世界
              const currentPlotIndex = get().plotIndex; // 上一个plotIndex

              const newTLNode = {
                plotId: actInfo.plotId,
                choice,
                cardId,
                author: useAuthStore.getState().userInfo ?? undefined,
                isFollowed: false,
                beingFollowed: false,
                choicePoint: actInfo.plotChoice
              };

              if (isNewWorld) {
                const refCardId = get().currentWorld?.refCardId;
                const refWolrd = get().worlds.get(refCardId || '');
                log.log('isNewWorld', { isNewWorld, refCardId, refWolrd });
                if (refWolrd) {
                  get().currentWorld?.createTL(refWolrd, newTLNode);
                  set({
                    timelinePlots: get().currentWorld?.world?.timelinePlots
                  });
                }
              } else {
                get().currentWorld?.createTL(get().currentWorld, newTLNode);
                set({
                  timelinePlots: get().currentWorld?.world?.timelinePlots
                });
              }

              const plotIndex = currentPlotIndex + 1;
              // 更新幕的索引值
              plot.setPlotIndex(plotIndex);

              // log.log('createPlotLog', {
              //   plotIndex,
              //   currentPlotIndex: get().plotIndex
              // });
              log.log('createPlot-------', { plotIndex: plotIndex });
              // const newPlot = { ...plot, plotIndex,plotId: actInfo.plotId };
              get().currentWorld?.collectPlot(plot);

              // get().updatePlotIndex(get().plotIndex + 1);
              get().updatePlotIndex(plotIndex);
              get().updateActIndex(0);
              updateWorldStatus(CreateSatus.plot);

              get().pushWorldRouteStack({
                route: PARALLEL_WORLD_PAGES_ENUM.CONSUMER,
                cardId: currentWorld?.cardId,
                plotId: actInfo?.plotId ?? ''
              });
            }

            set({
              actsLen: currentWorld?.getCurrentPlot()?.queryActs().length
            });

            if (actInfo.act?.actId) {
              log.log('test2', actInfo.act?.actId);
              get().changeNonce(actInfo.act?.actId);
            }
          }
        },
        err => {
          control.reject(err);
          catchErrorLog('createPlot', err);
          get().revertWorld();
          // get().popWorldRouteStack();
        }
      );
    });
  },
  // 回退世界
  revertWorld() {
    // todo 已经创建好了
    const { currentWorld, _worldStatusStack } = get();
    if (!currentWorld?.cardId) return;
    const hasWorld = _worldStatusStack.includes(CreateSatus.world);
    const hasPlot = _worldStatusStack.includes(CreateSatus.plot);
    if (hasWorld) {
      // 新创建了世界
      const refCardId = currentWorld?.refCardId;
      if (refCardId) {
        const prevWorld = get().worlds.get(refCardId);
        set({ currentWorld: prevWorld }); // 回退世界
      }
    }
    if (hasPlot) {
      const { currentWorld } = get();
      const prevPlotIndex = hasWorld
        ? currentWorld?.plotIndex || 0
        : (currentWorld?.plotIndex || 1) - 1;
      get().updatePlotIndex(prevPlotIndex);
      const prevActIndex = currentWorld?.getCurrentPlot()?.actIndex;
      get().updateActIndex(prevActIndex || 0);
    }
    get().updateWorldStatus(CreateSatus.init);
  },
  async createChoice() {
    get().changeLoading(true);
    const { currentWorld, selectedPlotTag } = get();
    log.log('createChoice', {
      cardId: currentWorld?.cardId,
      plotId: currentWorld?.getCurrentPlotId()
    });

    const payload = {
      cardId: currentWorld?.cardId ?? '',
      prePlotId: currentWorld?.getCurrentPlotId() || '',
      tagCode: selectedPlotTag?.code as number
    };

    log.log('createChoice', {
      cardId: currentWorld?.cardId ?? '',
      prePlotId: currentWorld?.getCurrentPlotId(),
      timeline: currentWorld?.world?.timelinePlots,
      tagCode: selectedPlotTag?.code as number
    });

    // reportClick('world_set_world', {
    //   set_world_button: 2,
    //   contentid: currentWorld?.cardId || '',
    //   world_contentid: currentWorld?.world?.worldId || ''
    // });

    return createPlotChoice(payload)
      .then(res => {
        get().changeLoading(false);
        return res;
      })
      .catch(e => {
        get().changeLoading(false);
        return Promise.reject(e);
      });
  },
  pushWorldRouteStack(route) {
    const { worldRouteStack } = get();
    const lastItem = worldRouteStack[worldRouteStack.length - 1];
    if (
      route &&
      lastItem &&
      route.cardId === lastItem.cardId &&
      route.route === lastItem.route &&
      route.plotId === lastItem.plotId
    )
      return;
    console.log('pushWorldRouteStack------>');
    // alert('push');
    // alert(route.route);
    set({ worldRouteStack: [...worldRouteStack, route], poppedRoute: null });
  },
  popWorldRouteStack() {
    const { worldRouteStack, worldCreateStatus } = get();
    const newStack = [...worldRouteStack];
    const popRoute = newStack.pop();
    // publish直接跳过到上一个页面
    if (
      newStack[newStack.length - 1]?.route === PARALLEL_WORLD_PAGES_ENUM.PUBLISH
    ) {
      newStack.pop();
    }

    set({
      worldRouteStack: newStack,
      poppedRoute: popRoute
    });
    taskControls.cancel();
    return popRoute;
  }
}));
