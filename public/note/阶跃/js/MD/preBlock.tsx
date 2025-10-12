import type { ExtraProps } from 'react-markdown';

export const preBlock = ({ children }: React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & ExtraProps) => {
  return <pre className="overflow-visible!">{children}</pre>;
};
