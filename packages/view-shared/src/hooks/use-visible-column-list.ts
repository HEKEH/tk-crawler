import type { ComputedRef } from 'vue';
import type {
  VisibleSettingColumn,
  VisibleSettingColumnMap,
} from '../components';
import type { LocalStorageStore } from '../utils';
import { computed, ref } from 'vue';

export function useVisibleColumnList<
  Column extends {
    key: string;
    title?: string;
  },
>({
  columns,
  localStoreKey,
  localStorageStore,
  defaultHiddenColumnKeys = [],
}: {
  columns: ComputedRef<Column[]>;
  localStoreKey?: string;
  localStorageStore?: LocalStorageStore;
  defaultHiddenColumnKeys?: string[];
}) {
  const columnsForVisibleSetting = computed<VisibleSettingColumn[]>(() => {
    return columns.value.map(column => {
      return {
        key: column.key,
        label: column.title ?? '',
        defaultHidden: defaultHiddenColumnKeys.includes(column.key),
      };
    });
  });

  const visibleSettingColumnMap = ref<VisibleSettingColumnMap>(
    localStoreKey && localStorageStore
      ? (localStorageStore.getItem<VisibleSettingColumnMap>(localStoreKey) ??
          {})
      : {},
  );

  const completeVisibleSettingColumnMap = computed(() => {
    return columnsForVisibleSetting.value.reduce((acc, col) => {
      let visible: boolean;
      if (visibleSettingColumnMap.value[col.key] !== undefined) {
        visible = visibleSettingColumnMap.value[col.key];
      } else {
        visible = !col.defaultHidden;
      }
      return {
        ...acc,
        [col.key]: visible,
      };
    }, {} as VisibleSettingColumnMap);
  });

  // const hiddenColumnKeys = computed(() => {
  //   return columnsForVisibleSetting.value
  //     .filter(column => !completeVisibleSettingColumnMap.value[column.key])
  //     .map(column => column.key);
  // });
  const visibleColumns = computed(() => {
    return columns.value.filter(
      column => completeVisibleSettingColumnMap.value[column.key],
    );
  });

  const setVisibleColumnMap = (map: VisibleSettingColumnMap) => {
    visibleSettingColumnMap.value = map;
    if (localStoreKey && localStorageStore) {
      localStorageStore.setItem(localStoreKey, visibleSettingColumnMap.value);
    }
  };
  return {
    columnsForVisibleSetting,
    visibleSettingColumnMap,
    visibleColumns,
    setVisibleColumnMap,
  };
}
