import type { ReactNode } from 'react';
import MDEcharts from './MDEcharts';

export default function MDCodeRender({ lang, code, codeNode }: { lang: string; code: string; codeNode: ReactNode }) {
  if (lang === 'echarts-json') {
    return <MDEcharts code={code} />;
  }

  return <div className="overflow-x-auto p-4">{codeNode}</div>;
}
