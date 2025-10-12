import {
  CreatePlotChoiceRequest,
  CreateWorldRequest,
  PlotChoicesRequest,
  createPlotChoice,
  queryPlotChoices
} from '@/src/api/parallel-world/feed';
import {
  ReportError,
  catchErrorLog,
  errorReport,
  requestErrorLog
} from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import {
  ActImage,
  WorldAct,
  WorldPlot
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import {
  CreatePlotRes,
  PlotChoice
} from '@step.ai/proto-gen/raccoon/world/world_pb';
import Act from './ActModel';

export type PlotModel = {
  plotId: CreatePlotRes['plotId'];
  plotIndex: number;
  acts: Map<string, Act>;
  actIndexMap: Map<number, string>;
  plotChoices?: PlotChoice[];
  choicePoint: string;
};

// 每一章节
export default class Plot {
  plot: PlotModel = {
    plotId: '',
    acts: new Map(), // 用actId为key
    actIndexMap: new Map(), // 用index查id
    plotChoices: undefined,
    choicePoint: '',
    plotIndex: 0
  };
  actIndex: number = 0;
  lastActIndex: number = 0;
  cardId: string = '';
  constructor(plot: Partial<WorldPlot> | null) {
    if (plot && plot.plotId) {
      const { plotId, acts, choicePoint } = plot;
      this.plot.plotId = plotId;
      this.plot.plotIndex = plot.plotIndex || 0;
      this.plot.choicePoint = choicePoint || plot.choice || '';
      if (plot.cardId) {
        this.cardId = plot.cardId;
      }
      if (acts) {
        log.log('plots----', acts);
        acts.forEach(item => {
          this.collectAct(item);
        });
      }
    }
  }
  setCardId(cardId: string) {
    this.cardId = cardId;
  }
  setPlotIndex(plotIndex: number) {
    this.plot.plotIndex = plotIndex;
  }
  initPlot(actInfo: PartialMessage<CreatePlotRes>) {
    if (actInfo && actInfo.plotId) {
      this.plot.plotId = actInfo.plotId;
      this.plot.choicePoint = actInfo.plotChoice || '';
    }
  }
  collect(actInfo: PartialMessage<CreatePlotRes>) {
    const { plotId, plotChoice, act, isFinish } = actInfo;
    if (isFinish) return;

    if (plotChoice) {
      this.plot.choicePoint = plotChoice;
    }

    if (!this.plot.plotId) {
      this.initPlot(actInfo);
    }
    // plotID 串了
    if (this.plot.plotId && this.plot.plotId !== actInfo.plotId) {
      requestErrorLog(
        'plot-id-error',
        {
          currentPlotId: this.plot.plotId,
          newPlotId: actInfo.plotId
        },
        { tag: ReportError.PARALLEL_WORLD }
      );
      return;
    }

    if (act) {
      this.collectAct(act);
    }

    console.log('collect------------', actInfo);
  }

  // 处理幕数据
  collectAct(act: PartialMessage<WorldAct>) {
    const { actId, actIndex } = act;
    if (!actId || typeof actIndex !== 'number') {
      requestErrorLog('actid-id-error', act, {
        tag: ReportError.PARALLEL_WORLD
      });
    } else {
      const cacheAct = this.plot.acts.get(actId);
      log.log('collectAct', actId);
      if (cacheAct) {
        log.log('cacheAct', cacheAct);
        cacheAct.collect(act);
      } else {
        log.log('no cacheAct', actId);
        this.plot.acts.set(actId, new Act(act));
        this.plot.actIndexMap.set(actIndex, actId);
      }
      this.lastActIndex = Math.max(this.lastActIndex, actIndex);
    }
  }

  // 请求选项
  requestChoice() {
    // 存在选项，不更新了
    if (this.plot.plotChoices) return Promise.resolve();
    return queryPlotChoices({
      plotId: this.plot.plotId,
      cardId: this.cardId
    })
      .then(res => {
        this.plot.plotChoices = res.choices;
      })
      .catch(e => {
        catchErrorLog('queryPlotChoices', e, {
          tag: ReportError.PARALLEL_WORLD
        });
        return Promise.reject(e);
      });
  }

  getChoice() {
    return this.plot.plotChoices;
  }

  updateActIndex(index: number) {
    this.actIndex = index;
  }
  nextAct() {
    if (this.checkLastAct()) return;
    this.actIndex += 1;
  }
  prevAct() {
    if (!this.actIndex) return;
    this.actIndex -= 1;
  }
  getCurrentActId() {
    return this.plot.actIndexMap.get(this.actIndex);
  }
  getCurrentPlotIndex() {
    return this.actIndex;
  }
  getCurrentAct() {
    // 获取当前幕
    const actId = this.getCurrentActId();
    if (actId) {
      return this.plot?.acts.get(actId);
    }
    return null;
  }

  queryImages() {
    const images: PartialMessage<ActImage>[] = [];
    this.plot.acts.forEach(item => {
      if (item.act.image) {
        images.push(item.act.image);
      }
    });
    return images;
  }
  queryActs() {
    const acts: Act[] = [];
    this.plot.acts.forEach(item => {
      acts.push(item);
    });
    return acts;
  }
  checkLastAct() {
    return this.actIndex >= this.lastActIndex;
  }
}
