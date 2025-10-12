import { Collapse } from "antd";
import type { ExtraProps } from "react-markdown";

export function Think({
  children,
}: React.ClassAttributes<HTMLElement> &
  React.HTMLAttributes<HTMLElement> &
  ExtraProps) {
  return (
    <div className="mb-[16px]">
      <Collapse
        size="small"
        items={[{ key: "think", label: "思考过程", children: children }]}
      />
    </div>
  );
}
