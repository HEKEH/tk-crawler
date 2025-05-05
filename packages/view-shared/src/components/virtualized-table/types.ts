import type {
  CellRenderer,
  ClassNameGetter,
  HeaderCellRenderer,
  HeaderClassGetter,
} from 'element-plus/es/components/table-v2/src/types';
import type { CSSProperties } from 'vue';

export interface VirtualizedTableColumn<T> {
  align?: 'left' | 'center' | 'right';
  class?: string | ClassNameGetter<T>;
  key?: string;
  dataKey?: string;
  fixed?: true | 'left' | 'right';
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
  cellRenderer?: CellRenderer<T>;
  headerCellRenderer?: HeaderCellRenderer<T>;
  /**
   * Extendable sections
   */
  [key: string]: any;
}
