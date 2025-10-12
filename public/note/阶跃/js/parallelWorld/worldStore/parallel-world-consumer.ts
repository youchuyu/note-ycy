import { throttle } from 'lodash';
import { create } from 'zustand';
import {
  CHOICE_FAIL_TIP,
  CHOICE_LOADING_TIP
} from '@/src/bizComponents/parallelWorld/others/LiHelp';
import {
  ParallelWorldPlotRequest,
  QueryParallelWorldInfoRequest,
  queryParallelWorldInfo,
  queryParallelWorldPlot
} from '../../api/parallel-world';
import {
  SaveWorldReqRequest,
  UpdatePlotActRequest,
  saveWorld,
  uploadPlotAct
} from '../../api/parallel-world/consumer';
import {
  CreatePlotChoiceRequest,
  CreatePlotRequest,
  CreateWorldRequest,
  CreatedAct,
  PlotChoicesRequest,
  createPlot,
  createPlotChoice,
  createWorld,
  queryPlotChoices
} from '../../api/parallel-world/feed';
import { PickPbQueryParams } from '../../api/utils';
import { ErrorRes } from '../../api/websocket/stream_connect';
import { hideLoading, showLoading } from '../../components';
import {
  ReportError,
  errorReport,
  requestErrorLog
} from '../../utils/error-log';
import PlotModel from './models/PlotModel';
import {
  ActImage,
  WorldAct
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import {
  CreateWorldRes,
  PlotChoice,
  QueryChoicesRes,
  TimelinePlot,
  UpdatePlotActRes
} from '@/proto-registry/src/web/raccoon/world/world_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { PlotInfo } from './parallel-world-main';

/* 创建Plot状态枚举 */
export enum PLOT_CREATE_STATUS_ENUM {
  // 触发流畅：用于限制重复触发
  START,
  // 创建content
  CONTENT_CREATING,
  // 等待act
  ACT_PENDING,
  // 创建act
  ACT_CREATING,
  // 创建完成
  CREATED,
  // 创建失败
  FAILED
}

// 生图信息
interface GenImgInfo {
  desc: string;
  img: ActImage[];
  isLoading: boolean;
}

// 生图信息Map
interface GenImgMap {
  [actId: string]: GenImgInfo;
}

type States = {
  /* 新世界线 */
  newWorld: PickPbQueryParams<CreateWorldRes> | null;
  // 用于后续判断是新建世界线还是新建节点
  isNewWorldMounted: boolean;
  // 章节创建阶段
  plotCreateStatus: PLOT_CREATE_STATUS_ENUM;
  // 控制取消生成
  abortController: AbortController | null;
  // 章节内容 - 用于提前展示
  plotId: string;
  plotContent: string;
  isPlotContentPlaying: boolean;
  allActsImages: ActImage[];
  // isPlotContentLoading: boolean;
  // 幕
  // isActGenerating: boolean;
  acts: (WorldAct | null)[];
  actIndex: number;
  // actsBuffer: (WorldAct | null)[];
  actsBackup: (WorldAct | null)[];
  isActsSaved: boolean; // 当前幕是否保存
  /* 世界线 */
  newTimeLine: TimelinePlot[];
  activeTimelineSectionIdx: number;
  // 用于编辑点副本
  editableActs: (WorldAct | null)[];
  /* 是否可编辑 */
  isGenCardEditable: boolean;
  /* 文案编辑弹窗 */
  isTextEditModalVisible: boolean;
  textEditAct: WorldAct | null;
  /** 图片换一换 */
  isImgGenModalVisible: boolean;
  imgGenAct: WorldAct | null;
  genImgMap: GenImgMap;
  /* 下一章 */
  isNextChapterModalVisible: boolean;
  /* 下一章提示 */
  aiPlotChoices: PlotChoice[];
  // isAiPlotChoicesLoading: boolean;
  choiceText: string; // 用户输入
  isCreatingChoice: boolean;
};

type Actions = {
  reset: () => void;
  /* 世界线状态 */
  changePlotCreateStatus: (status: PLOT_CREATE_STATUS_ENUM) => void;
  /* 生成世界线，返回id */
  createParallelWorld: (
    payload: CreateWorldRequest
  ) => Promise<CreateWorldRes | undefined>;
  changeNewWorld: (world: CreateWorldRes | null) => void;
  initNewWorldInfo: (payload: QueryParallelWorldInfoRequest) => void;
  // 修改世界线初始化状态
  toggleIsNewWorldMounted: (isMounted: boolean) => void;
  // 创建控制器
  createAbortController: () => AbortController;
  // 初始化plotId
  changePlotId: (id: string) => void;
  // 添加allActsImages(用于发布时的封面选择)
  appendAllActsImage: (actImages: ActImage[]) => void;
  // 备份acts
  backupActs: () => void;
  // 恢复acts的备份
  restoreActsBackup: () => void;
  getPlot: (payload: ParallelWorldPlotRequest) => Promise<void>;
  // toggleIsPlotContentLoading: (isLoading: boolean) => void;
  // toggleIsActGenerating: (isLoading: boolean) => void;
  changeActs: (acts: WorldAct[]) => void;
  // changeActsBuffer: (acts: WorldAct[]) => void;
  changeActIndex: (index: number) => void;
  // toggleIsPlotLoading: (isLoading: boolean) => void;
  // 清除章节信息
  // clearPlot: () => void;
  toggleIsPlotContentPlaying: (isPlaying: boolean) => void;
  clearPlotContent: () => void;
  // 更新acts
  changeEditableActs: (acts: (WorldAct | null)[]) => void;
  updateActs: (
    payload: UpdatePlotActRequest
  ) => Promise<UpdatePlotActRes | void>;
  toggleIsActsSaved: (isSaved: boolean) => void;
  // 修改时间线
  changeNewTimeLine: (newTimeLine: TimelinePlot[]) => void;
  changeActiveTimelineSectionIdx: (idx: number) => void;
  resetVirtualTimeline: () => void;
  /* 是否可编辑 */
  toggleIsGenCardEditable: (isEditable: boolean) => void;
  /* 文案编辑弹窗 */
  openTextEditModal: () => void;
  closeTextEditModal: () => void;
  changeTextEditAct: (act: WorldAct | null) => void;
  /* 图片换一换弹窗 */
  openImgGenModal: () => void;
  closeImgGenModal: () => void;
  changeImgGenAct: (act: WorldAct | null) => void;
  changeGenImgMap: (actId: string, genImgInfo: GenImgInfo) => void;
  /* 下一章 */
  openNextChapterModal: () => void;
  closeNextChapterModal: () => void;
  /* world保存 */
  saveCreatedWorld: (payload: SaveWorldReqRequest) => Promise<void>;
  /* 下一章提示 */
  // getAiChoices: (
  //   payload: PlotChoicesRequest
  // ) => Promise<QueryChoicesRes | undefined>;
  // clearAiChoices: () => void;
  createChoice: (payload: CreatePlotChoiceRequest) => Promise<void>;

  changeChoiceText: (text: string) => void;
};

const getDefaultStates = (): States => ({
  newWorld: null,
  isNewWorldMounted: false,
  plotCreateStatus: PLOT_CREATE_STATUS_ENUM.CREATED,
  plotContent: '',
  plotId: '',
  isPlotContentPlaying: false,
  abortController: null,
  // isActGenerating: false,
  allActsImages: [],
  acts: [],
  actIndex: 0,
  // actsBuffer: [],
  actsBackup: [],
  isActsSaved: false,
  newTimeLine: [],
  activeTimelineSectionIdx: 0,
  editableActs: [],
  isGenCardEditable: false,
  isTextEditModalVisible: false,
  textEditAct: null,
  isImgGenModalVisible: false,
  imgGenAct: null,
  genImgMap: {},
  isNextChapterModalVisible: false,
  aiPlotChoices: [],
  isCreatingChoice: false,
  // isAiPlotChoicesLoading: false,
  choiceText: ''
});

export const useParallelWorldConsumerStore = create<States & Actions>()(
  (set, get) => ({
    ...getDefaultStates(),
    reset: () => {
      set(getDefaultStates());
    },
    /* 世界线id */
    changeNewWorld(world) {
      set({ newWorld: world });
    },
    toggleIsNewWorldMounted(isMounted) {
      set({ isNewWorldMounted: isMounted });
    },
    async initNewWorldInfo(payload) {
      try {
        const res = await queryParallelWorldInfo(payload);

        const { acts = [], ...plotInfo } = res?.plot ?? {};

        set({
          acts,
          newWorld: {
            worldId: res?.world?.worldId ?? '',
            cardId: res?.world?.cardId ?? '',
            worldNum: String(res?.world?.worldNum ?? '')
          },
          plotId: (plotInfo as PlotInfo).plotId,
          newTimeLine: res?.timelinePlots ?? [],
          activeTimelineSectionIdx: (plotInfo as PlotInfo).plotIndex ?? 0
        });
      } catch (e) {
        errorReport('initNewWorldInfo', ReportError.STORE, e);
        console.log('initNewWorldInfo ERROR PAYLOAD: ', payload);
      }
    },
    changePlotId(id) {
      set({ plotId: id });
    },
    changePlotCreateStatus(status) {
      set({ plotCreateStatus: status });
    },
    toggleIsPlotContentPlaying(isPlaying) {
      set({ isPlotContentPlaying: isPlaying });
    },
    createAbortController() {
      const abortController = new AbortController();
      set({ abortController });
      return abortController;
    },
    clearPlotContent() {
      console.log('clearPlotContent TIME: ', Date.now());

      set({ plotContent: '' });
    },
    /* 生成平行世界(获取id) */
    async createParallelWorld(payload) {
      try {
        const res = await createWorld(payload);
        console.log('createParallelWorld------------> res', res);
        set({ newWorld: res });
        return res;
      } catch (e) {
        errorReport('createParallelWorld', ReportError.STORE, e);
        throw e;
      }
    },
    appendAllActsImage: actImages => {
      const { allActsImages } = get();
      set({ allActsImages: [...allActsImages, ...actImages] });
    },
    backupActs: () => {
      const { acts } = get();
      set({ actsBackup: [...acts], acts: [] });
    },
    restoreActsBackup: () => {
      const { actsBackup } = get();
      set({
        acts: [...actsBackup],
        actIndex: actsBackup.length - 1,
        actsBackup: []
      });
    },
    async getPlot(payload) {
      showLoading('加载中...');
      try {
        const res = await queryParallelWorldPlot(payload);

        set({ acts: res?.plot?.acts ?? [] });
      } catch (e) {
        errorReport('getPlot', ReportError.STORE, e);
        console.log('getPlot payload:', payload);
      } finally {
        hideLoading();
      }
    },
    changeActs(acts) {
      set({ acts: acts });
    },
    // changeActsBuffer(acts) {
    //   set({ actsBuffer: acts });
    // },
    changeActIndex(index) {
      set({ actIndex: index });
    },
    // 编辑
    changeEditableActs(acts) {
      set({ editableActs: acts });
    },
    async updateActs(payload) {
      try {
        const res = await uploadPlotAct(payload);

        if (res) {
          set({ isActsSaved: true });
          return res;
        }
      } catch (e) {
        errorReport('updateActs', ReportError.STORE, e, { params: payload });
        console.log('updateActs PAYLOAD: ', JSON.stringify(payload));
      }
    },
    toggleIsActsSaved(isSaved) {
      set({ isActsSaved: isSaved });
    },
    // 时间线
    changeNewTimeLine: newTimeLine => {
      set({ newTimeLine: newTimeLine });
    },
    changeActiveTimelineSectionIdx(idx: number) {
      set({ activeTimelineSectionIdx: idx });
    },
    resetVirtualTimeline: () => {
      const {
        plotCreateStatus,
        activeTimelineSectionIdx,
        newTimeLine,
        changeNewTimeLine,
        changeActiveTimelineSectionIdx
      } = get();

      // 此处的比较取决于createStart的执行时机
      if (plotCreateStatus < PLOT_CREATE_STATUS_ENUM.ACT_CREATING) {
        return;
      }

      const virtualPlotIdx = activeTimelineSectionIdx;

      const originTimeline = newTimeLine.slice(0, virtualPlotIdx);

      // 新建时间线
      changeNewTimeLine(originTimeline);
      changeActiveTimelineSectionIdx(virtualPlotIdx - 1);
    },
    /* 是否可编辑 */
    toggleIsGenCardEditable(isEditable: boolean) {
      set({ isGenCardEditable: isEditable });
    },
    /* 文案编辑弹窗 */
    openTextEditModal() {
      set({ isTextEditModalVisible: true });
    },
    closeTextEditModal() {
      set({ isTextEditModalVisible: false });
    },
    changeTextEditAct(act) {
      set({ textEditAct: act });
    },
    /* 图片换一换弹窗 */
    openImgGenModal() {
      set({ isImgGenModalVisible: true });
    },
    closeImgGenModal() {
      set({ isImgGenModalVisible: false });
    },
    changeImgGenAct(act) {
      set({ imgGenAct: act });
    },
    // 生图结果缓存,
    changeGenImgMap(actId, genImgInfo) {
      console.log('changeGenImgMap----------------->', actId, genImgInfo);

      set({
        genImgMap: {
          ...get().genImgMap,
          [actId]: genImgInfo
        }
      });
    },
    /* 生图描述 */
    openNextChapterModal() {
      set({ isNextChapterModalVisible: true });
    },
    closeNextChapterModal() {
      set({ isNextChapterModalVisible: false });
    },
    /* 世界线保存 */
    async saveCreatedWorld(payload) {
      try {
        console.log('saveCreatedWorld------------>', payload);
        const res = await saveWorld(payload);
        console.log('saveCreatedWorld------------>res is', res);
      } catch (e) {
        errorReport('saveCreatedWorld', ReportError.STORE, e, {
          params: payload
        });
      }
    },
    // 提示
    changeChoiceText(text) {
      set({ choiceText: text });
    },

    // 小狸帮想
    async createChoice(payload) {
      console.log('createPlotChoice----------->payload', payload);

      set({ isCreatingChoice: true, choiceText: CHOICE_LOADING_TIP });
      try {
        const res = await createPlotChoice(
          payload,
          d => {
            console.log('createPlotChoice----------->res', d);
            set({
              choiceText: d?.choice ?? ''
            });
            setTimeout(() => {
              set({
                isCreatingChoice: false
              });
            }, 300);
          },
          e => {
            console.log('createPlotChoice ERROR: ', e);
            set({
              choiceText: CHOICE_FAIL_TIP,
              isCreatingChoice: false
            });
          }
        );
        console.log('createChoice------------>', res);
      } catch (e) {
        errorReport('createChoice', ReportError.STORE, e);
      } finally {
      }
    }
  })
);
