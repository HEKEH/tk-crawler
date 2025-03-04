<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { ElButton, ElTable, ElTableColumn } from 'element-plus';

defineOptions({
  name: 'OrgManage',
});

const { data, isLoading, isError, error } = useQuery<any>({
  queryKey: ['orgs'],
  retry: false,
  queryFn: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            date: '2016-05-01',
            name: 'Tom',
            state: 'California',
            city: 'Los Angeles',
            address: 'No. 189, Grove St, Los Angeles',
            zip: 'CA 90036',
          },
          {
            date: '2016-05-02',
            name: 'Tom',
            state: 'California',
            city: 'Los Angeles',
            address: 'No. 189, Grove St, Los Angeles',
            zip: 'CA 90036',
          },
          {
            date: '2016-05-03',
            name: 'Tom',
            state: 'California',
            city: 'Los Angeles',
            address: 'No. 189, Grove St, Los Angeles',
            zip: 'CA 90036',
          },
        ]);
      }, 1000);
    });
  },
});

function deleteRow(index: number) {
  console.log('deleteRow', index);
}

function onAddItem() {}
</script>

<template>
  <div v-loading="isLoading" class="org-manage">
    <template v-if="!isLoading">
      <div v-if="isError" class="org-manage-error">
        {{ error?.message }}
      </div>
      <template v-if="!isError">
        <ElTable :data="data" style="width: 100%" max-height="250">
          <ElTableColumn fixed prop="date" label="Date" width="150" />
          <ElTableColumn prop="name" label="Name" width="120" />
          <ElTableColumn prop="state" label="State" width="120" />
          <ElTableColumn prop="city" label="City" width="120" />
          <ElTableColumn prop="address" label="Address" width="600" />
          <ElTableColumn prop="zip" label="Zip" width="120" />
          <ElTableColumn fixed="right" label="Operations" min-width="120">
            <template #default="scope">
              <ElButton
                link
                type="primary"
                size="small"
                @click.prevent="deleteRow(scope.$index)"
              >
                Remove
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <ElButton class="mt-4" style="width: 100%" @click="onAddItem">
          Add Item
        </ElButton>
      </template>
    </template>
  </div>
</template>

<style scoped>
.org-manage {
  padding: 1rem;
  position: relative;
  flex: 1;
  height: 100%;
  .org-manage-error {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-danger);
  }
}
</style>
