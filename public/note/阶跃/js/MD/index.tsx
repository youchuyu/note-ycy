import 'highlight.js/styles/stackoverflow-light.css'; // 可换其它主题
import 'katex/dist/katex.min.css';
import { memo, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeMathjax from 'rehype-mathjax';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkMath from 'remark-math';
import { codeBlock } from './codeBlock';
import CodeDrawer, { type CodeInfo } from './CodeDrawer';
import { preBlock } from './preBlock';
import { rehypeSanitizeSchema } from './rehypeSanitizeSchema';
import { Think } from './think';

const MD = memo(({ children }: { children: string }) => {
  const [codeDrawerVisible, setCodeDrawerVisible] = useState(false);
  const [codeInfo, setCodeInfo] = useState<CodeInfo>();

  const parsedMd = useMemo(
    () =>
      children.replace(/<think>([\s\S]*?)<\/think>/g, (_m, content) => {
        return `<section>${content}</section>`;
      }),
    [children]
  );

  return (
    <>
      <Markdown
        children={parsedMd}
        remarkPlugins={[remarkMath]}
        skipHtml={false}
        rehypePlugins={[[rehypeSanitize, rehypeSanitizeSchema], rehypeMathjax, rehypeHighlight, rehypeRaw]}
        components={{
          code: (e) =>
            codeBlock(e, {
              onPlay: (data) => {
                setCodeDrawerVisible(true);
                setCodeInfo(data);
              },
            }),
          pre: preBlock,
          section: Think,
        }}
      />
      <CodeDrawer
        data={codeInfo}
        open={codeDrawerVisible}
        width={800}
        destroyOnHidden={true}
        onClose={() => {
          setCodeDrawerVisible(false);
        }}
      />
    </>
  );
});

export default MD;
