import { create } from 'zustand';
import {
  CHOICE_FAIL_TIP,
  CHOICE_LOADING_TIP
} from '@/src/bizComponents/parallelWorld/others/LiHelp';
import {
  CreatePlotChoiceRequest,
  CreateWorldRequest,
  PlotChoicesRequest,
  createPlotChoice,
  queryPlotChoices
} from '../../api/parallel-world/feed';
import { ReportError, errorReport } from '../../utils/error-log';
import { PlotTag } from '@/proto-registry/src/web/raccoon/world/common_pb';
import {
  PlotChoice,
  QueryChoicesRes,
  TimelinePlot
} from '@/proto-registry/src/web/raccoon/world/world_pb';

type LastCreateWorldPayload = CreateWorldRequest & { choice: string };

/** 详情 */
type States = {
  // plotId: string; // 标记当前的store
  nextPlot: TimelinePlot | null;
  currentPlot: TimelinePlot | null;
  plotChoices: PlotChoice[];
  isFeedInputVisible: boolean;
  // isPlotChoicesLoading: boolean;
  // plotTags: PlotTag[];
  selectedPlotTag: PlotTag | null;
  choiceText: string;
  isCreatingChoice: boolean;
  // 缓存上次的创建世界线请求参数
  lastCreateWorldPayload: LastCreateWorldPayload | null;
};

export type WorldFeedBackUp = Pick<
  States,
  'nextPlot' | 'currentPlot' | 'plotChoices'
>;

type Actions = {
  reset: () => void;
  restore: (backup: WorldFeedBackUp) => void;
  openFeedInputModal: () => void;
  closeFeedInputModal: () => void;
  getChoices: (
    payload: PlotChoicesRequest
  ) => Promise<QueryChoicesRes | undefined>;
  changeNextPlot: (plot: TimelinePlot | null) => void;
  changeCurrentPlot: (plot: TimelinePlot) => void;
  selectPlotTag: (tag: PlotTag) => void;
  changeChoiceText: (text: string) => void;
  createChoice: (payload: CreatePlotChoiceRequest) => Promise<void>;
  toggleIsCreatingChoice: (isCreating: boolean) => void;
  changeLastCreateWorldPayload: (
    payload: LastCreateWorldPayload | null
  ) => void;
};

const getDefaultStates = (): States => ({
  plotChoices: [],
  nextPlot: null,
  currentPlot: null,
  selectedPlotTag: null,
  choiceText: '',
  isFeedInputVisible: false,
  isCreatingChoice: false,
  lastCreateWorldPayload: null
});

export const useParallelWorldFeedStore = create<States & Actions>()(
  (set, get) => ({
    ...getDefaultStates(),
    reset: () => {
      set(getDefaultStates());
    },
    restore(backup) {
      set({ ...getDefaultStates, ...backup });
    },
    openFeedInputModal() {
      set({ isFeedInputVisible: true });
    },
    closeFeedInputModal() {
      set({ isFeedInputVisible: false });
    },
    // 转折点列表
    async getChoices(payload) {
      try {
        console.log('queryPlotChoices--------------->payload', payload);
        const res = await queryPlotChoices(payload);
        console.log('queryPlotChoices--------------->res', res);

        set({
          plotChoices: res.choices
          // plotId: payload?.plotId
        });
        return res;
      } catch (e) {
        errorReport('getChoices', ReportError.STORE, e);
        console.log('getChoices ERROR Payload: ', payload);
        set({ plotChoices: [] });
      }
    },
    changeNextPlot(plot) {
      set({ nextPlot: plot });
    },
    changeCurrentPlot(plot) {
      set({ currentPlot: plot });
    },
    selectPlotTag(tag: PlotTag) {
      set({ selectedPlotTag: tag });
    },
    // 创建新世界的提示词
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
              set({ isCreatingChoice: false });
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
    },
    toggleIsCreatingChoice(isCreating) {
      set({ isCreatingChoice: isCreating });
    },
    changeLastCreateWorldPayload(payload) {
      set({ lastCreateWorldPayload: payload });
    }
  })
);
