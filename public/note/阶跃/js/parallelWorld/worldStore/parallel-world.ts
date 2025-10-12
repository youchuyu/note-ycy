import { create } from 'zustand';
import { queryPlotTags } from '../../api/parallel-world/feed';
import { PlotTag } from '@/proto-registry/src/web/raccoon/world/common_pb';
import { WorldFeedBackUp } from './parallel-world-feed';

/* 页面枚举 */
export enum PARALLEL_WORLD_PAGES_ENUM {
  MAIN = 'MAIN',
  FEED = 'FEED',
  CONSUMER = 'CONSUMER',
  PUBLISH = 'PUBLISH'
}

/* 折叠状态枚举 */
export enum FOLD_STATUS_ENUM {
  FOLD = 'FOLD',
  UNFOLD = 'UNFOLD',
  FOLD_2_UNFOLD = 'LOOP'
}

interface FeedBackUpMap {
  [id: string]: WorldFeedBackUp;
}

export interface WorldRoute {
  route: PARALLEL_WORLD_PAGES_ENUM;
  cardId?: string; // publish页面不需要
  plotId?: string; // publish页面不需要
}

/** 详情 */
type States = {
  parallelWorldPage: PARALLEL_WORLD_PAGES_ENUM;
  pageFoldStatus: FOLD_STATUS_ENUM;
  isParallelWorldLoading: boolean;
  worldRouteStack: WorldRoute[];
  poppedRoute: WorldRoute | null;
  plotTags: PlotTag[];

  // 数据备份
  feedBackUpMap: FeedBackUpMap;
};

type Actions = {
  reset: () => void;
  switchParallelWorldPage: (page: PARALLEL_WORLD_PAGES_ENUM) => void;
  switchPageFoldStatus: (status: FOLD_STATUS_ENUM) => void;
  toggleParallelWorldLoading: (isLoading: boolean) => void;
  pushWorldRouteStack: (route: WorldRoute) => void;
  popWorldRouteStack: () => WorldRoute | undefined;
  getPrevRoute: () => WorldRoute;
  getPlotTags: () => Promise<void>;
  backupFeedState: (state: FeedBackUpMap) => void;
};

const getDefaultStates = (): States => ({
  // 页面导航
  parallelWorldPage: PARALLEL_WORLD_PAGES_ENUM.MAIN,
  // 折叠状态
  pageFoldStatus: FOLD_STATUS_ENUM.UNFOLD,
  // 加载状态
  isParallelWorldLoading: false,
  // 路由
  worldRouteStack: [],
  poppedRoute: null,
  // 剧情走向
  plotTags: [],
  // 备份feed页数据
  feedBackUpMap: {}
});

export const useParallelWorldStore = create<States & Actions>()((set, get) => ({
  ...getDefaultStates(),
  reset() {
    set(getDefaultStates());
  },
  switchParallelWorldPage(page: PARALLEL_WORLD_PAGES_ENUM) {
    set({ parallelWorldPage: page });
  },
  switchPageFoldStatus(status: FOLD_STATUS_ENUM) {
    set({ pageFoldStatus: status });
  },
  toggleParallelWorldLoading(isLoading: boolean) {
    set({ isParallelWorldLoading: isLoading });
  },
  pushWorldRouteStack(route) {
    const { worldRouteStack } = get();
    console.log('pushWorldRouteStack------>');

    set({ worldRouteStack: [...worldRouteStack, route], poppedRoute: null });
  },
  popWorldRouteStack() {
    const { worldRouteStack } = get();
    const newStack = [...worldRouteStack];
    const popRoute = newStack.pop();
    // publish直接跳过到上一个页面
    if (
      newStack[newStack.length - 1]?.route === PARALLEL_WORLD_PAGES_ENUM.PUBLISH
    ) {
      newStack.pop();
    }

    set({ worldRouteStack: newStack, poppedRoute: popRoute });
    return popRoute;
  },
  getPrevRoute() {
    const { worldRouteStack } = get();
    return worldRouteStack[worldRouteStack.length - 2];
  },
  async getPlotTags() {
    const res = await queryPlotTags({});
    set({ plotTags: res.tags });
  },
  backupFeedState(state) {
    const { feedBackUpMap } = get();
    set({ feedBackUpMap: { ...feedBackUpMap, ...state } });
  }
}));
