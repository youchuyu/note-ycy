import { message } from 'antd';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import type { ExtraProps } from 'react-markdown';
import type { CodeInfo } from './CodeDrawer';
import MDCodeRender from './MDCodeRender';

function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren(children.props.children);
  }
  return '';
}

export const codeBlock = (
  e: React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & ExtraProps,
  { onPlay }: { onPlay: (data: CodeInfo) => void }
) => {
  const { className, children } = e;
  const match = /language-([\w-]+)/.exec(className || '');

  const code = getTextFromChildren(children);

  const handlePlay = () => {
    onPlay({ content: code, lang: match?.[1] as CodeInfo['lang'] });
  };

  const handleCopied = () => {
    message.success('复制成功！');
  };

  if (match) {
    return (
      <div className="rounded-xl bg-[#f9f9f9]">
        <div className="text-token-text-secondary bg-token-sidebar-surface-primary flex h-9 items-center justify-between rounded-t-2xl px-4 py-2 font-sans text-xs select-none">
          {match[1]}
        </div>
        <div className="sticky top-14">
          <div className="absolute end-0 bottom-0 flex h-9 items-center bg-[#f9f9f9] pe-2">
            <div className="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-3 rounded-sm px-2 font-sans text-xs">
              {match[1] === 'html' && <i className="iconfont icon-yunhang hover: cursor-pointer text-xs!" onClick={handlePlay} />}
              <CopyToClipboard text={code} onCopy={handleCopied}>
                <i className="iconfont icon-fuzhi-01 hover: text-s! cursor-pointer" />
              </CopyToClipboard>
            </div>
          </div>
        </div>
        <MDCodeRender codeNode={children} code={code} lang={match?.[1]} />
      </div>
    );
  } else {
    return children;
  }
};
