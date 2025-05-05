import type {
  ClassNameGetter,
  HeaderCellRenderer,
  HeaderClassGetter,
} from 'element-plus/es/components/table-v2/src/types';
import type { Component, CSSProperties, VNode } from 'vue';

export interface CellComponentProps<T = any> {
  rowData: T;
}

export type CellComponent<T = any> = Component<CellComponentProps<T>>;

export interface VirtualizedTableColumn<T> {
  align?: 'left' | 'center' | 'right';
  class?: string | ClassNameGetter<T>;
  key?: string;
  dataKey?: string;
  fixed?: 'left' | 'right' | null;
  flexGrow?: CSSProperties['flexGrow'];
  flexShrink?: CSSProperties['flexShrink'];
  title?: string;
  hidden?: boolean;
  headerClass?: HeaderClassGetter<T> | string;
  maxWidth?: number;
  minWidth?: number;
  style?: CSSProperties;
  sortable?: boolean;
  width: number;
  /**
   * Renderers
   */
  cellRenderer?: (params: { rowData: T }) => VNode;
  CellComponent?: CellComponent<T>;
  headerCellRenderer?: HeaderCellRenderer<T>;
  /**
   * Extendable sections
   */
  [key: string]: any;
}
