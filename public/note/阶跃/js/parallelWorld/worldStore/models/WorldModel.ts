import { log } from '@/src/utils/logger';
import {
  WorldInfo,
  WorldPlot
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import {
  QueryWorldRes,
  TimelinePlot
} from '@/proto-registry/src/web/raccoon/world/world_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import PlotModel from './PlotModel';

interface IWorldIndo {
  world?: Partial<QueryWorldRes['world']>;
  topic?: QueryWorldRes['topic'];
  timelinePlots?: TimelinePlot[];
  plot?: QueryWorldRes['plot'];
  refCardId?: string;
}
// 每个世界
export default class World {
  world: WorldModel | null = null;
  plotIndex: number = 0;
  lastPlotIndex: number = 0;
  cardId: string = '';
  dataLoading: boolean = false; // 数据加载状态
  dataError: boolean = false; // 数据报错
  refCardId: string = '';

  //   world: IWorldInfo | null = null;
  constructor(worldInfo: IWorldIndo) {
    const { topic, world, timelinePlots, plot, refCardId } = worldInfo;
    if (!world) return;
    const { cardId } = world;
    this.cardId = cardId || '';
    this.world = {
      ...world,
      topic,
      timelinePlots,
      plots: new Map(),
      plotIndexMap: new Map()
    };

    if (plot) {
      const plotModel = new PlotModel(plot);
      plotModel.setCardId(this.cardId);
      this.collectPlot(plotModel);
      this.updatePlotIndex(plot.plotIndex);
      log.log('9999999999 world info', plot);
    }
    // if (timelinePlots) {
    //   this.lastPlotIndex = timelinePlots.length - 1;
    // }
    if (refCardId) {
      this.refCardId = refCardId;
    }
  }

  checkLastPlot() {
    return (
      this.plotIndex >=
      Math.max(this.lastPlotIndex, this.world.timelinePlots.length - 1)
    );
  }

  collectPlot(plotModel: PlotModel) {
    const plotId = plotModel.plot.plotId;
    log.log('collectPlot==2', {
      plotModel
    });
    if (!plotId) {
      log.log('collectPlot error', plotModel.plot);
      return;
    }

    const cachePlot = this.world?.plots.get(plotId);
    this.world?.plots.set(plotId, plotModel);
    log.log('collectPlot==', {
      plotId,
      plotModel,
      cachePlot,
      index: plotModel.plot.plotIndex
    });
    if (!cachePlot) {
      // 第一次收集这个plot 新建一下
      const plotIndex = plotModel.plot.plotIndex;
      this.world?.plotIndexMap.set(plotIndex, plotId);
      this.lastPlotIndex = Math.max(plotIndex, this.lastPlotIndex);
      // alert(plotId);
      this.collectPlotChoice(plotModel);
    }
  }
  collectPlotChoice(plot: WorldPlot) {
    // alert('collectPlotChoice');
    // alert(plot.plotId);
    // alert(this.world?.plots.get(plot.plotId));
    // alert(plot.plot.plotId || plot.plotId);
    // 查选项
    this.dataLoading = true;
    this.world?.plots
      .get(plot.plot.plotId || plot.plotId)
      ?.requestChoice()
      .then(() => {
        this.dataLoading = false;
      })
      .catch(() => {
        this.dataLoading = false;
        this.dataError = true;
      });
  }

  nextPlot() {
    // alert(this.checkLastPlot());
    if (this.checkLastPlot()) return;
    this.updatePlotIndex(this.plotIndex + 1);
  }
  prevPlot() {
    if (this.plotIndex <= 0) return;
    this.updatePlotIndex(this.plotIndex - 1);
  }
  updatePlotIndex(index: number) {
    this.plotIndex = index;
  }
  getCurrentPlotId() {
    return this.world?.plotIndexMap.get(this.plotIndex);
  }

  getTlPlot(index: number) {
    return this.world?.timelinePlots?.[index];
  }

  // 创建时间线
  createTL(refWolrd: World | null, TLData: Partial<TimelinePlot>) {
    if (refWolrd) {
      const timeline = [
        ...(refWolrd.world?.timelinePlots || []).slice(
          0,
          refWolrd.plotIndex + 1
        ),
        {
          plotId: this.getCurrentPlotId(),
          cardId: this.cardId,
          ...TLData
        }
      ].map(i => new TimelinePlot(i));
      log.log('timeline', {
        timelinePlots: refWolrd.world?.timelinePlots,
        timeline,
        plotIndex: this.plotIndex
      });
      console.log(111111, this.world);
      if (this.world) {
        this.world.timelinePlots = timeline;
      }
    }
  }

  getPlotByIndex(index: number) {
    const plotId = this.world?.plotIndexMap.get(index);
    if (!plotId) return null;
    return this.world?.plots.get(plotId);
  }
  getCurrentPlotIndex() {
    return this.plotIndex;
  }
  getCurrentPlot() {
    // log.log('getCurrentPlot', { test: 'test' });
    // 获取当前章节
    const plotId = this.getCurrentPlotId();
    if (plotId) {
      return this.world?.plots.get(plotId);
    }
    return null;
  }
}

export type WorldModel = PartialMessage<WorldInfo> & {
  topic?: string;
  timelinePlots?: TimelinePlot[];
  plots: Map<string, PlotModel>;
  plotIndexMap: Map<number, string>;
};
