import { Drawer } from 'antd';
import type { DrawerProps } from 'antd/lib';

export interface CodeInfo {
  lang: 'html';
  content: string;
}

export default function CodeDrawer({ data, ...drawerProps }: { data: CodeInfo | undefined } & DrawerProps) {
  return (
    <Drawer {...drawerProps}>
      <iframe className="h-full w-full" srcDoc={data?.content}></iframe>
      {/* {data?.content} */}
    </Drawer>
  );
}
