import { useCallback } from 'react';
import { CreateWorldRequest } from '@/src/api/parallel-world/feed';
import { ErrInfo } from '@/src/bizComponents/parallelWorld/errorMsg';
import { useWorldStore } from '@/src/store/world/';
import World, { WorldModel } from '@/src/store/world/models/WorldModel';
import { catchErrorLog } from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import { reportClick } from '@Utils/report';
import { REVIEW_ERR_ENUM, showErr } from '../errorMsg';
import { PlotTag } from '@step.ai/proto-gen/raccoon/world/common_pb';

export default ({
  currentWorld,
  selectedPlotTag,
  choiceText
}: {
  currentWorld: World | null;
  selectedPlotTag: PlotTag | undefined;
  choiceText: string;
}) => {
  const createWorld = useCallback(async () => {
    const prePlotId = currentWorld?.getCurrentPlotId() || '';

    try {
      await useWorldStore.getState().createWorld(selectedPlotTag?.code || 0);
      await useWorldStore.getState().createPlot({
        prePlotId,
        choice: choiceText
      });
    } catch (error) {
      log.log('error-----', { error });
      showErr(error as ErrInfo, REVIEW_ERR_ENUM.WORLD_CREATE);
      catchErrorLog('createWorld', error);
    }

    // todo 要加上报
    // reportClick('world_set_world', {
    //     contentid: useWorldStore.getState().currentWorld?.cardId,
    //     plotId: timeline[activeTimelineSectionIdx]?.plotId,
    //     tagCode: selectedPlotTag?.code,
    //     set_world_button: 1
    //   });
  }, [currentWorld, choiceText, selectedPlotTag]);

  return { createWorld };
};
