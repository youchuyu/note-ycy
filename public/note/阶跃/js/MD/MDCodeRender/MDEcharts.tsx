import ReactECharts from 'echarts-for-react';
import { HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { memo } from 'react';
export const ECHARTS_LANGUAGE = 'echarts';

echarts.use([HeatmapChart, TooltipComponent, GridComponent, VisualMapComponent, CanvasRenderer]);

const MDEchartsComp = ({ code }: { code: string }) => {
  const codeObj = new Function(`return ${code}`)();
  return <ReactECharts option={codeObj} notMerge={true} lazyUpdate={true} style={{ height: 400 }} />;
};

const MDEcharts = memo(MDEchartsComp);

export default MDEcharts;
