<template>
  <MsCard :loading="loading" simple>
    <div class="mb-4 flex items-center justify-between">
      <a-button v-permission="['SYSTEM_TEST_RESOURCE_POOL:READ+ADD']" v-xpack type="primary" @click="addPool">
        {{ t('system.resourcePool.createPool') }}
      </a-button>
      <a-input-search
        v-model:model-value="keyword"
        :placeholder="t('system.resourcePool.searchPool')"
        class="w-[230px]"
        allow-clear
        @search="searchPool"
        @press-enter="searchPool"
        @clear="searchPool"
      ></a-input-search>
    </div>
    <ms-base-table v-bind="propsRes" no-disable v-on="propsEvent">
      <template #name="{ record }">
        <a-button type="text" class="px-0" @click="showPoolDetail(record.id)">{{ record.name }}</a-button>
      </template>
      <template #action="{ record }">
        <MsButton v-permission="['SYSTEM_TEST_RESOURCE_POOL:READ+UPDATE']" @click="editPool(record)">
          {{ t('system.resourcePool.editPool') }}
        </MsButton>
        <MsButton
          v-if="record.enable"
          v-permission="['SYSTEM_TEST_RESOURCE_POOL:READ+UPDATE']"
          v-xpack
          @click="disabledPool(record)"
        >
          {{ t('system.resourcePool.tableDisable') }}
        </MsButton>
        <MsButton v-else v-permission="['SYSTEM_TEST_RESOURCE_POOL:READ+UPDATE']" v-xpack @click="enablePool(record)">
          {{ t('system.resourcePool.tableEnable') }}
        </MsButton>
        <MsTableMoreAction
          v-permission="['SYSTEM_TEST_RESOURCE_POOL:READ+DELETE']"
          :list="tableActions"
          @select="handleSelect($event, record)"
        ></MsTableMoreAction>
      </template>
    </ms-base-table>
  </MsCard>
  <MsDrawer
    v-model:visible="showDetailDrawer"
    :width="480"
    :title="activePool?.name"
    :title-tag="activePool?.enable ? t('system.resourcePool.tableEnable') : t('system.resourcePool.tableDisable')"
    :title-tag-color="activePool?.enable ? 'green' : 'gray'"
    :descriptions="activePoolDesc"
    :footer="false"
    :mask="false"
    :show-skeleton="drawerLoading"
    show-description
  >
    <template #tbutton>
      <a-button
        v-permission="['SYSTEM_TEST_RESOURCE_POOL:READ+UPDATE']"
        type="outline"
        size="mini"
        :disabled="drawerLoading"
        @click="editPool(activePool)"
      >
        {{ t('system.resourcePool.editPool') }}
      </a-button>
    </template>
  </MsDrawer>
  <JobTemplateDrawer
    v-model:visible="showJobDrawer"
    :default-val="activePool?.testResourceReturnDTO.jobDefinition || ''"
    read-only
  />
</template>

<script setup lang="ts">
  /**
   * @description 系统设置-资源池
   */
  import { onMounted, Ref, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';

  import MsButton from '@/components/pure/ms-button/index.vue';
  import MsCard from '@/components/pure/ms-card/index.vue';
  import type { Description } from '@/components/pure/ms-description/index.vue';
  import MsDrawer from '@/components/pure/ms-drawer/index.vue';
  import MsBaseTable from '@/components/pure/ms-table/base-table.vue';
  import type { MsTableColumn } from '@/components/pure/ms-table/type';
  import useTable from '@/components/pure/ms-table/useTable';
  import MsTableMoreAction from '@/components/pure/ms-table-more-action/index.vue';
  import type { ActionsItem } from '@/components/pure/ms-table-more-action/types';
  import { TagType, Theme } from '@/components/pure/ms-tag/ms-tag.vue';
  import JobTemplateDrawer from './components/jobTemplateDrawer.vue';

  import { delPoolInfo, getPoolInfo, getPoolList, togglePoolStatus } from '@/api/modules/setting/resourcePool';
  import { useI18n } from '@/hooks/useI18n';
  import useModal from '@/hooks/useModal';
  import { useTableStore } from '@/store';
  import { characterLimit } from '@/utils';
  import { hasAnyPermission } from '@/utils/permission';

  import type { ResourcePoolDetail } from '@/models/setting/resourcePool';
  import { TableKeyEnum } from '@/enums/tableEnum';

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();

  const hasOperationPoolPermission = computed(() =>
    hasAnyPermission(['SYSTEM_TEST_RESOURCE_POOL:READ+UPDATE', 'SYSTEM_TEST_RESOURCE_POOL:READ+DELETE'])
  );
  const columns: MsTableColumn = [
    {
      title: 'system.resourcePool.tableColumnName',
      slotName: 'name',
      dataIndex: 'name',
      showTooltip: true,
    },
    {
      title: 'system.resourcePool.tableColumnStatus',
      slotName: 'enable',
      dataIndex: 'enable',
    },
    {
      title: 'system.resourcePool.tableColumnDescription',
      dataIndex: 'description',
      showTooltip: true,
    },
    {
      title: 'system.resourcePool.tableColumnType',
      dataIndex: 'type',
    },
    {
      title: 'system.resourcePool.tableColumnCreateTime',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: 'system.resourcePool.tableColumnUpdateTime',
      dataIndex: 'updateTime',
      width: 180,
    },
    {
      title: hasOperationPoolPermission.value ? 'system.resourcePool.tableColumnActions' : '',
      slotName: 'action',
      dataIndex: 'operation',
      fixed: 'right',
      width: hasOperationPoolPermission.value ? 140 : 50,
    },
  ];
  const tableStore = useTableStore();
  await tableStore.initColumn(TableKeyEnum.SYSTEM_RESOURCEPOOL, columns, 'drawer');
  const { propsRes, propsEvent, loadList, setKeyword } = useTable(getPoolList, {
    tableKey: TableKeyEnum.SYSTEM_RESOURCEPOOL,
    columns,
    scroll: { y: 'auto' },
    selectable: false,
    showSelectAll: false,
  });

  const keyword = ref('');

  onMounted(async () => {
    setKeyword(keyword.value);
    await loadList();
  });

  async function searchPool() {
    setKeyword(keyword.value);
    await loadList();
  }

  const { openModal } = useModal();

  const tableActions: ActionsItem[] = [
    {
      label: 'system.resourcePool.delete',
      eventTag: 'delete',
      danger: true,
    },
  ];

  const loading = ref(false);

  /**
   * 启用资源池
   */
  async function enablePool(record: any) {
    try {
      loading.value = true;
      await togglePoolStatus(record.id);
      Message.success(t('system.resourcePool.enablePoolSuccess'));
      loadList();
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 禁用资源池
   */
  function disabledPool(record: any) {
    openModal({
      type: 'warning',
      title: t('system.resourcePool.disablePoolTip', { name: characterLimit(record.name) }),
      content: t('system.resourcePool.disablePoolContent'),
      okText: t('system.resourcePool.disablePoolConfirm'),
      cancelText: t('system.resourcePool.disablePoolCancel'),
      maskClosable: false,
      onBeforeOk: async () => {
        try {
          await togglePoolStatus(record.id);
          Message.success(t('system.resourcePool.disablePoolSuccess'));
          loadList();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      },
      hideCancel: false,
    });
  }

  /**
   * 删除资源池
   */
  function deletePool(record: any) {
    if (propsRes.value.data.length === 1) {
      Message.warning(t('system.resourcePool.atLeastOnePool'));
      return;
    }
    openModal({
      type: 'error',
      title: t('system.resourcePool.deletePoolTip', { name: characterLimit(record.name) }),
      content: t('system.resourcePool.deletePoolContentUsed'),
      okText: t('system.resourcePool.deletePoolConfirm'),
      cancelText: t('system.resourcePool.deletePoolCancel'),
      okButtonProps: {
        status: 'danger',
      },
      maskClosable: false,
      onBeforeOk: async () => {
        try {
          await delPoolInfo(record.id);
          Message.success(t('system.resourcePool.deletePoolSuccess'));
          loadList();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      },
      hideCancel: false,
    });
  }

  /**
   * 处理表格更多按钮事件
   * @param item
   */
  function handleSelect(item: ActionsItem, record: any) {
    switch (item.eventTag) {
      case 'delete':
        deletePool(record);
        break;
      default:
        break;
    }
  }

  const showDetailDrawer = ref(false);
  const activePoolDesc = ref<Description[]>([]);
  const activePool = ref<ResourcePoolDetail | null>(null);
  const showJobDrawer = ref(false);
  const drawerLoading = ref(false);
  /**
   * 查看资源池详情
   * @param id 资源池 id
   */
  async function showPoolDetail(id: string) {
    if (activePool.value?.id === id && showDetailDrawer.value) {
      return;
    }
    drawerLoading.value = true;
    showDetailDrawer.value = true;
    try {
      const res = await getPoolInfo(id);
      if (res) {
        if (res.deleted) {
          Message.warning(t('common.resourceDeleted'));
          drawerLoading.value = false;
          showDetailDrawer.value = false;
          return;
        }
        activePool.value = res;
        const poolUses = [
          activePool.value.apiTest ? t('system.resourcePool.useAPI') : '',
          activePool.value.uiTest ? t('system.resourcePool.useUI') : '',
        ];
        const { type, testResourceReturnDTO, loadTest, apiTest, uiTest } = activePool.value;
        const {
          ip,
          token, // k8s token
          namespace, // k8s 命名空间
          concurrentNumber, // k8s 最大并发数
          podThreads, // k8s 单pod最大线程数
          deployName, // k8s api测试部署名称
          girdConcurrentNumber,
          nodesList,
          loadTestImage,
          loadTestHeap,
          uiGrid,
        } = testResourceReturnDTO;
        // Node
        const nodeResourceDesc =
          type === 'Node'
            ? [
                {
                  label: t('system.resourcePool.detailResources'),
                  value: nodesList?.map((e) => `${e.ip},${e.port},${e.monitor},${e.concurrentNumber}`),
                  tagTheme: 'light' as Theme,
                  tagType: 'default' as TagType,
                  tagMaxWidth: '280px',
                  isTag: true,
                },
              ]
            : [];
        // K8S
        const k8sResourceDesc =
          type === 'Kubernetes'
            ? [
                {
                  label: t('system.resourcePool.testResourceDTO.ip'),
                  value: ip,
                },
                {
                  label: t('system.resourcePool.testResourceDTO.token'),
                  value: token,
                  showCopy: true,
                },
                {
                  label: t('system.resourcePool.testResourceDTO.namespace'),
                  value: namespace,
                },
                {
                  label: t('system.resourcePool.testResourceDTO.deployName'),
                  value: deployName,
                },
                {
                  label: t('system.resourcePool.testResourceDTO.concurrentNumber'),
                  value: concurrentNumber,
                },
                {
                  label: t('system.resourcePool.testResourceDTO.podThreads'),
                  value: podThreads,
                },
              ]
            : [];
        const jobTemplate =
          loadTest && type === 'Kubernetes'
            ? [
                {
                  label: t('system.resourcePool.jobTemplate'),
                  value: t('system.resourcePool.customJobTemplate'),
                  isButton: true,
                  onClick: () => {
                    showJobDrawer.value = true;
                  },
                },
              ]
            : [];
        // 性能测试
        const performanceDesc = loadTest
          ? [
              {
                label: t('system.resourcePool.mirror'),
                value: loadTestImage,
              },
              {
                label: t('system.resourcePool.testHeap'),
                value: loadTestHeap,
              },
            ]
          : [];
        // 接口测试/性能测试
        const resourceDesc = apiTest || loadTest ? [...nodeResourceDesc, ...k8sResourceDesc] : [];
        // ui 测试资源
        const uiDesc = uiTest
          ? [
              {
                label: t('system.resourcePool.uiGrid'),
                value: uiGrid,
              },
              {
                label: t('system.resourcePool.concurrentNumber'),
                value: girdConcurrentNumber,
              },
            ]
          : [];

        const detailType =
          apiTest || loadTest
            ? [
                {
                  label: t('system.resourcePool.detailType'),
                  value: activePool.value.type,
                },
              ]
            : [];
        activePoolDesc.value = [
          {
            label: t('system.resourcePool.detailDesc'),
            value: activePool.value.description,
          },
          {
            label: t('system.resourcePool.detailUrl'),
            value: activePool.value.serverUrl,
          },
          {
            label: t('system.resourcePool.detailRange'),
            value: activePool.value.allOrg
              ? [t('system.resourcePool.orgAll')]
              : activePool.value.testResourceReturnDTO.orgIdNameMap.map((e) => e.name),
            isTag: true,
            tagTheme: 'light',
            tagType: 'default',
          },
          {
            label: t('system.resourcePool.detailUse'),
            value: poolUses.filter((e) => e !== ''),
            tagTheme: 'light',
            tagType: 'default',
            isTag: true,
          },
          ...performanceDesc,
          ...uiDesc,
          ...detailType,
          ...resourceDesc,
          ...jobTemplate,
        ];
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      drawerLoading.value = false;
    }
  }

  onMounted(() => {
    if (route.query.id) {
      // 地址栏携带 id，自动打开资源池详情抽屉
      showPoolDetail(route.query.id as string);
    }
  });

  /**
   * 编辑资源池
   * @param record
   */
  function editPool(record: any) {
    router.push({
      name: 'settingSystemResourcePoolDetail',
      query: {
        id: record.id,
      },
    });
  }

  /**
   * 添加资源池
   * @param record
   */
  function addPool() {
    router.push({
      name: 'settingSystemResourcePoolDetail',
    });
  }
</script>

<style lang="less" scoped></style>
