import type { KeyTextField, LinkField } from '@prismicio/client';

export type ButtonProps = {
  linkField: LinkField;
  label: KeyTextField;
  showIcon?: boolean;
  className?: string;
};
