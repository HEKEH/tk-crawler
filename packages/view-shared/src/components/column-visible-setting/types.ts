export interface VisibleSettingColumn {
  label: string;
  key: string;
  defaultHidden?: boolean;
}

export interface VisibleSettingColumnMap {
  [key: string]: boolean;
}

export interface ColumnVisibleSettingProps {
  columns: VisibleSettingColumn[];
  columnsVisibleMap: VisibleSettingColumnMap;
}
