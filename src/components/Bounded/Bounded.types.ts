import { ElementType, ReactNode } from 'react';

export type BoundedProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};
