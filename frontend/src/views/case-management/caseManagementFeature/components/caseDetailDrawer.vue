<template>
  <MsDetailDrawer
    ref="detailDrawerRef"
    v-model:visible="showDrawerVisible"
    :width="1200"
    :footer="false"
    :mask="false"
    :title="t('caseManagement.featureCase.caseDetailTitle', { id: detailInfo?.num, name: detailInfo?.name })"
    :detail-id="props.detailId"
    :detail-index="props.detailIndex"
    :get-detail-func="getCaseDetail"
    :pagination="props.pagination"
    :table-data="props.tableData"
    :page-change="props.pageChange"
    :mask-closable="true"
    :edit-name="true"
    show-full-screen
    :unmount-on-close="true"
    @loaded="loadedCase"
  >
    <template #titleLeft>
      <div class="flex items-center"><caseLevel :case-level="caseLevels" /></div>
    </template>
    <template #titleRight="{ loading }">
      <div class="rightButtons flex items-center">
        <MsButton
          v-permission="['FUNCTIONAL_CASE:READ+UPDATE']"
          type="icon"
          status="secondary"
          class="mr-4 !rounded-[var(--border-radius-small)]"
          :disabled="loading"
          :loading="editLoading"
          @click="updateHandler('edit')"
        >
          <MsIcon type="icon-icon_edit_outlined" class="mr-2 font-[16px]" />
          {{ t('common.edit') }}
        </MsButton>
        <MsButton
          v-permission="['FUNCTIONAL_CASE:READ+UPDATE']"
          type="icon"
          status="secondary"
          class="mr-4 !rounded-[var(--border-radius-small)]"
          :disabled="loading"
          :loading="shareLoading"
          @click="shareHandler"
        >
          <MsIcon type="icon-icon_share1" class="mr-2 font-[16px]" />
          {{ t('caseManagement.featureCase.share') }}
        </MsButton>
        <MsButton
          v-permission="['FUNCTIONAL_CASE:READ+UPDATE']"
          type="icon"
          status="secondary"
          class="mr-4 !rounded-[var(--border-radius-small)]"
          :disabled="loading"
          :loading="followLoading"
          @click="followHandler"
        >
          <MsIcon
            :type="detailInfo.followFlag ? 'icon-icon_collect_filled' : 'icon-icon_collection_outlined'"
            class="mr-2 font-[16px]"
            :class="[detailInfo.followFlag ? 'text-[rgb(var(--warning-6))]' : '']"
          />
          {{ t('caseManagement.featureCase.follow') }}
        </MsButton>
        <MsButton type="icon" status="secondary" class="mr-2 !rounded-[var(--border-radius-small)]">
          <a-dropdown position="br" :hide-on-select="false">
            <div class="flex items-center">
              <icon-more class="mr-2" />
              <span> {{ t('caseManagement.featureCase.more') }}</span>
            </div>

            <template #content>
              <!-- TOTO公共用例先不上 -->
              <!-- <a-doption>
                <a-switch class="mr-1" size="small" type="line" />{{ t('caseManagement.featureCase.addToPublic') }}
              </a-doption> -->
              <a-doption @click="updateHandler('copy')">
                <MsIcon type="icon-icon_copy_filled" class="font-[16px]" />{{ t('common.copy') }}</a-doption
              >
              <a-doption class="error-6 text-[rgb(var(--danger-6))]" @click="deleteHandler">
                <MsIcon type="icon-icon_delete-trash_outlined" class="font-[16px] text-[rgb(var(--danger-6))]" />
                {{ t('common.delete') }}
              </a-doption>
            </template>
          </a-dropdown>
        </MsButton>
      </div>
    </template>
    <template #default="{ loading }">
      <div
        ref="wrapperRef"
        :class="[`${!commentInputIsActive ? 'h-[calc(100%-72px)]' : 'h-[calc(100%-286px)]'}`, 'bg-white']"
      >
        <div class="header relative h-[48px] pl-2">
          <MsTab
            v-model:active-key="activeTab"
            :content-tab-list="tabSetting"
            :get-text-func="getTotal"
            class="no-content relative border-b"
            @change="clickMenu"
          />
          <span class="absolute bottom-0 right-4 top-4 my-auto text-[var(--color-text-2)]" @click="showMenuSetting">{{
            t('caseManagement.featureCase.detailDisplaySetting')
          }}</span>
        </div>
        <MsSplitBox
          :size="0.8"
          :max="0.7"
          :min="0.6"
          direction="horizontal"
          expand-direction="right"
          class="!h-[calc(100%-48px)]"
        >
          <template #first>
            <div class="leftWrapper h-full">
              <div class="leftContent w-full pl-[16px] pr-[24px] pt-4">
                <template v-if="activeTab === 'detail'">
                  <TabDetail
                    ref="tabDetailRef"
                    :form="detailInfo"
                    :allow-edit="true"
                    :form-rules="formItem"
                    :form-api="fApi"
                    @update-success="updateSuccess"
                  />
                </template>
                <template v-if="activeTab === 'requirement'">
                  <TabDemand :case-id="props.detailId" />
                </template>
                <template v-if="activeTab === 'case'">
                  <TabCaseTable :case-id="props.detailId" />
                </template>
                <template v-if="activeTab === 'bug'">
                  <TabDefect :case-id="props.detailId" />
                </template>
                <template v-if="activeTab === 'dependency'">
                  <TabDependency :case-id="props.detailId" />
                </template>
                <template v-if="activeTab === 'caseReview'">
                  <TabCaseReview :case-id="props.detailId" />
                </template>
                <template v-if="activeTab === 'testPlan'">
                  <TabTestPlan />
                </template>
                <template v-if="activeTab === 'comments'">
                  <TabComment ref="commentRef" :case-id="props.detailId" />
                </template>
                <template v-if="activeTab === 'changeHistory'">
                  <TabChangeHistory :case-id="props.detailId" />
                </template>
              </div>
            </div>
          </template>
          <template #second>
            <div class="rightWrapper h-full p-4">
              <a-skeleton v-if="loading" class="w-full" :loading="loading" :animation="true">
                <a-space direction="vertical" class="w-[100%]" size="large">
                  <a-skeleton-line :rows="14" :line-height="30" :line-spacing="30" />
                </a-space>
              </a-skeleton>
              <div v-else>
                <div class="mb-4 font-medium">{{ t('caseManagement.featureCase.basicInfo') }}</div>
                <div class="baseItem">
                  <span class="label"> {{ t('caseManagement.featureCase.tableColumnModule') }}</span>
                  <span class="w-[calc(100%-36%)]">
                    <a-tree-select
                      v-model="detailInfo.moduleId"
                      :data="caseTree"
                      class="w-full"
                      :allow-search="true"
                      :filter-tree-node="filterTreeNode"
                      :field-names="{
                        title: 'name',
                        key: 'id',
                        children: 'children',
                      }"
                      :tree-props="{
                        virtualListProps: {
                          height: 200,
                        },
                      }"
                      @change="handleChangeModule"
                    >
                      <template #tree-slot-title="node">
                        <a-tooltip :content="`${node.name}`" position="tl">
                          <div class="one-line-text w-[300px] text-[var(--color-text-1)]">{{ node.name }}</div>
                        </a-tooltip>
                      </template>
                    </a-tree-select>
                  </span>
                </div>
                <!-- 自定义字段开始 -->
                <MsFormCreate
                  v-if="formRules.length"
                  ref="formCreateRef"
                  v-model:api="fApi"
                  v-model:form-item="formItem"
                  :form-rule="formRules"
                  class="w-full"
                  :option="options"
                  @change="changeHandler"
                />
                <!-- 自定义字段结束 -->
                <div class="baseItem">
                  <span class="label"> {{ t('caseManagement.featureCase.tableColumnCreateUser') }}</span>
                  <a-tooltip
                    v-if="translateTextToPX(detailInfo?.createUserName) > 200"
                    :content="detailInfo?.createUserName"
                  >
                    <span class="one-line-text" style="max-width: 200px">{{ detailInfo?.createUserName }}</span>
                  </a-tooltip>
                  <span v-else class="value">{{ detailInfo?.createUserName }}</span>
                </div>
                <div class="baseItem">
                  <span class="label"> {{ t('caseManagement.featureCase.tableColumnCreateTime') }}</span>
                  <span class="value">{{ dayjs(detailInfo?.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </div>
                <div class="baseItem">
                  <span class="label"> {{ t('caseManagement.featureCase.tableColumnTag') }}</span>
                  <span class="value">
                    <MsTag v-for="item of detailInfo.tags" :key="item"> {{ item }} </MsTag>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </MsSplitBox>
        <inputComment
          ref="commentInputRef"
          v-model:content="content"
          v-model:notice-user-ids="noticeUserIds"
          v-permission="['FUNCTIONAL_CASE:READ+COMMENT']"
          :preview-url="PreviewEditorImageUrl"
          :is-active="isActive"
          is-show-avatar
          is-use-bottom
          :upload-image="handleUploadImage"
          @publish="publishHandler"
          @cancel="cancelPublish"
        />
      </div>
    </template>
  </MsDetailDrawer>
  <SettingDrawer ref="settingDrawerRef" v-model:visible="showSettingDrawer" @init-data="initTab" />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Message, TreeNodeData } from '@arco-design/web-vue';
  import dayjs from 'dayjs';

  import MsButton from '@/components/pure/ms-button/index.vue';
  import MsFormCreate from '@/components/pure/ms-form-create/ms-form-create.vue';
  import type { FormItem, FormRuleItem } from '@/components/pure/ms-form-create/types';
  import MsSplitBox from '@/components/pure/ms-split-box/index.vue';
  import MsTab from '@/components/pure/ms-tab/index.vue';
  import type { MsPaginationI } from '@/components/pure/ms-table/type';
  import MsTag from '@/components/pure/ms-tag/ms-tag.vue';
  import caseLevel from '@/components/business/ms-case-associate/caseLevel.vue';
  import type { CaseLevel } from '@/components/business/ms-case-associate/types';
  import inputComment from '@/components/business/ms-comment/input.vue';
  import { CommentParams } from '@/components/business/ms-comment/types';
  import MsDetailDrawer from '@/components/business/ms-detail-drawer/index.vue';
  import SettingDrawer from './tabContent/settingDrawer.vue';

  import {
    createCommentList,
    deleteCaseRequest,
    editorUploadFile,
    followerCaseRequest,
    getCaseDetail,
    getCaseModuleTree,
  } from '@/api/modules/case-management/featureCase';
  import { postTabletList } from '@/api/modules/project-management/menuManagement';
  import { PreviewEditorImageUrl } from '@/api/requrls/case-management/featureCase';
  import { useI18n } from '@/hooks/useI18n';
  import useModal from '@/hooks/useModal';
  import { useAppStore } from '@/store';
  import useFeatureCaseStore from '@/store/modules/case/featureCase';
  import useUserStore from '@/store/modules/user';
  import { characterLimit } from '@/utils';
  import { translateTextToPX } from '@/utils/css';
  import { hasAnyPermission } from '@/utils/permission';

  import type { CustomAttributes, DetailCase, TabItemType } from '@/models/caseManagement/featureCase';
  import { ModuleTreeNode } from '@/models/common';
  import { CaseManagementRouteEnum } from '@/enums/routeEnum';

  import { getCaseLevels, initFormCreate } from './utils';
  import { LabelValue } from '@arco-design/web-vue/es/tree-select/interface';
  import debounce from 'lodash-es/debounce';
  // 异步加载组件
  const TabDefect = defineAsyncComponent(() => import('./tabContent/tabBug/tabDefect.vue'));
  const TabCaseTable = defineAsyncComponent(() => import('./tabContent/tabCase/tabCaseTable.vue'));
  const TabCaseReview = defineAsyncComponent(() => import('./tabContent/tabCaseReview.vue'));
  const TabChangeHistory = defineAsyncComponent(() => import('./tabContent/tabChangeHistory.vue'));
  const TabComment = defineAsyncComponent(() => import('./tabContent/tabComment/tabCommentIndex.vue'));
  const TabDemand = defineAsyncComponent(() => import('./tabContent/tabDemand/demand.vue'));
  const TabDependency = defineAsyncComponent(() => import('./tabContent/tabDependency/tabDependency.vue'));
  const TabDetail = defineAsyncComponent(() => import('./tabContent/tabDetail.vue'));
  const TabTestPlan = defineAsyncComponent(() => import('./tabContent/tabTestPlan.vue'));

  const router = useRouter();
  const detailDrawerRef = ref<InstanceType<typeof MsDetailDrawer>>();
  const wrapperRef = ref();
  const featureCaseStore = useFeatureCaseStore();
  const userStore = useUserStore();
  const { t } = useI18n();
  const { openModal } = useModal();
  const props = defineProps<{
    visible: boolean;
    detailId: string; // 详情 id
    detailIndex: number; // 详情 下标
    tableData: any[]; // 表格数据
    pagination: MsPaginationI; // 分页器对象
    pageChange: (page: number) => Promise<void>; // 分页变更函数
  }>();

  const emit = defineEmits(['update:visible', 'success']);
  const userId = computed(() => userStore.userInfo.id);
  const appStore = useAppStore();

  const currentProjectId = computed(() => appStore.currentProjectId);

  const showDrawerVisible = ref<boolean>(false);

  const showSettingDrawer = ref<boolean>(false);
  function showMenuSetting() {
    showSettingDrawer.value = true;
  }

  const commentInputRef = ref<InstanceType<typeof inputComment>>();
  const commentInputIsActive = computed(() => commentInputRef.value?.isActive);

  // const tabSettingList = computed(() => {
  //   return featureCaseStore.tabSettingList;
  // });

  // const tabSetting = ref<TabItemType[]>([...tabSettingList.value]);
  const tabSetting = ref<TabItemType[]>([]);
  const activeTab = ref<string>('detail');

  function clickMenu(key: string) {
    activeTab.value = key;
    featureCaseStore.setActiveTab(key);
    switch (activeTab.value) {
      case 'setting':
        activeTab.value = 'detail';
        showMenuSetting();
        break;
      default:
        showSettingDrawer.value = false;
        break;
    }
  }
  const initDetail: DetailCase = {
    id: '',
    projectId: '',
    templateId: '',
    name: '',
    prerequisite: '', // prerequisite
    caseEditType: '', // 编辑模式：步骤模式/文本模式
    steps: '',
    textDescription: '',
    expectedResult: '', // 预期结果
    description: '',
    publicCase: false, // 是否公共用例
    moduleId: '',
    versionId: '',
    tags: [],
    customFields: [], // 自定义字段集合
    relateFileMetaIds: [], // 关联文件ID集合
    functionalPriority: '',
    reviewStatus: 'UN_REVIEWED',
  };

  const caseTree = ref<ModuleTreeNode[]>([]);

  async function getCaseTree() {
    try {
      caseTree.value = await getCaseModuleTree({ projectId: currentProjectId.value });
    } catch (error) {
      console.log(error);
    }
  }
  const route = useRoute();
  const detailInfo = ref<DetailCase>({ ...initDetail });
  const customFields = ref<CustomAttributes[]>([]);
  const caseLevels = ref<CaseLevel>('P0');

  // 初始化count
  function setCount(detail: DetailCase) {
    const {
      bugCount,
      caseCount,
      caseReviewCount,
      demandCount,
      relateEdgeCount,
      testPlanCount,
      commentCount,
      historyCount,
    } = detail;
    const countMap: Record<string, any> = {
      case: caseCount || '0',
      dependency: relateEdgeCount || '0',
      caseReview: caseReviewCount || '0',
      testPlan: testPlanCount || '0',
      bug: bugCount || '0',
      requirement: demandCount || '0',
      comments: commentCount || '0',
      changeHistory: historyCount || '0',
    };
    featureCaseStore.initCountMap(countMap);
  }

  function loadedCase(detail: DetailCase) {
    getCaseTree();
    detailInfo.value = { ...detail };
    setCount(detail);
    customFields.value = detailInfo.value?.customFields as CustomAttributes[];
    caseLevels.value = getCaseLevels(customFields.value) as CaseLevel;
  }

  const editLoading = ref<boolean>(false);

  async function updateSuccess() {
    detailDrawerRef.value?.initDetail();
    emit('success');
  }

  function updateHandler(type: string) {
    router.push({
      name: CaseManagementRouteEnum.CASE_MANAGEMENT_CASE_DETAIL,
      query: {
        id: detailInfo.value.id,
      },
      params: {
        mode: type,
      },
    });
  }

  const shareLoading = ref<boolean>(false);

  function shareHandler() {
    const { origin } = window.location;
    const url = `${origin}/#${route.path}?id=${detailInfo.value.id}&pId=${appStore.currentProjectId}&orgId=${appStore.currentOrgId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => {
          Message.info(t('bugManagement.detail.shareTip'));
        },
        (e) => {
          Message.error(e);
        }
      );
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      Message.info(t('bugManagement.detail.shareTip'));
    }
  }

  const followLoading = ref<boolean>(false);
  // 关注
  async function followHandler() {
    followLoading.value = true;
    try {
      if (detailInfo.value.id) {
        await followerCaseRequest({ userId: userStore.id as string, functionalCaseId: detailInfo.value.id });
        updateSuccess();
        Message.success(
          detailInfo.value.followFlag
            ? t('caseManagement.featureCase.cancelFollowSuccess')
            : t('caseManagement.featureCase.followSuccess')
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      followLoading.value = false;
    }
  }

  // 删除用例
  function deleteHandler() {
    const { id, name } = detailInfo.value;
    openModal({
      type: 'error',
      title: t('caseManagement.featureCase.deleteCaseTitle', { name: characterLimit(name) }),
      content: t('caseManagement.featureCase.beforeDeleteCase'),
      okText: t('common.confirmDelete'),
      cancelText: t('common.cancel'),
      okButtonProps: {
        status: 'danger',
      },
      onBeforeOk: async () => {
        try {
          const params = {
            id,
            deleteAll: false,
            projectId: currentProjectId.value,
          };
          await deleteCaseRequest(params);
          Message.success(t('common.deleteSuccess'));
          showDrawerVisible.value = false;
          emit('success');
        } catch (error) {
          console.log(error);
        }
      },
      hideCancel: false,
    });
  }

  const formRules = ref<FormItem[]>([]);
  const formItem = ref<FormRuleItem[]>([]);

  // 表单配置项
  const options = {
    resetBtn: false, // 不展示默认配置的重置和提交
    submitBtn: false,
    on: false, // 取消绑定on事件
    form: {
      layout: 'horizontal',
      labelAlign: 'left',
      labelColProps: {
        span: 9,
      },
      wrapperColProps: {
        span: 15,
      },
      contentClass: 'contentClass',
      autoLabelWidth: true,
    },
    // 暂时默认
    row: {
      gutter: 0,
    },
    wrap: {
      'asterisk-position': 'end',
      'validate-trigger': ['change'],
      'hide-asterisk': true,
    },
  };

  const fApi = ref(null);
  // 初始化表单
  function initForm() {
    formRules.value = initFormCreate(customFields.value, ['FUNCTIONAL_CASE:READ+UPDATE']);
  }

  const tabDetailRef = ref();
  function handleChangeModule(value: string | number | LabelValue | Array<string | number> | LabelValue[] | undefined) {
    detailInfo.value.moduleId = value as string;
    tabDetailRef.value.handleOK();
  }

  function filterTreeNode(searchValue: string, nodeValue: TreeNodeData) {
    return (nodeValue as ModuleTreeNode).name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
  }

  function getTotal(key: string) {
    switch (key) {
      case 'detail':
        return '';
      default:
        break;
    }
    return featureCaseStore.countMap[key] > 99 ? '99+' : `${featureCaseStore.countMap[key]}` || '';
  }

  watch(
    () => customFields.value,
    () => {
      initForm();
    },
    { deep: true }
  );
  const settingDrawerRef = ref();
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        showDrawerVisible.value = val;
        activeTab.value = 'detail';
        featureCaseStore.setActiveTab(activeTab.value);
      } else {
        activeTab.value = '';
      }
    }
  );

  watch(
    () => showDrawerVisible.value,
    (val) => {
      emit('update:visible', val);
    }
  );

  const content = ref('');
  const commentRef = ref();
  const isActive = ref<boolean>(false);

  const noticeUserIds = ref<string[]>([]);
  async function publishHandler(currentContent: string) {
    try {
      const params: CommentParams = {
        caseId: detailInfo.value.id,
        notifier: noticeUserIds.value.join(';'),
        replyUser: '',
        parentId: '',
        content: currentContent,
        event: noticeUserIds.value.join(';') ? 'AT' : 'COMMENT', // 任务事件(仅评论: ’COMMENT‘; 评论并@: ’AT‘; 回复评论/回复并@: ’REPLAY‘;)
      };
      await createCommentList(params);
      if (activeTab.value === 'comments') {
        commentRef.value.getAllCommentList();
      }

      Message.success(t('common.publishSuccessfully'));
    } catch (error) {
      console.log(error);
    }
  }

  function cancelPublish() {
    isActive.value = !isActive.value;
  }

  const changeHandler = debounce(() => {
    tabDetailRef.value.handleOK();
  }, 300);

  const tabDefaultSettingList: TabItemType[] = [
    {
      value: 'detail',
      label: t('caseManagement.featureCase.detail'),
      canHide: false,
      isShow: true,
    },
    {
      value: 'case',
      label: t('caseManagement.featureCase.case'),
      canHide: true,
      isShow: true,
    },
  ];

  const caseTab: TabItemType[] = [
    {
      value: 'dependency',
      label: t('caseManagement.featureCase.dependency'),
      canHide: true,
      isShow: true,
    },
    {
      value: 'caseReview',
      label: t('caseManagement.featureCase.caseReview'),
      canHide: true,
      isShow: true,
    },
    {
      value: 'comments',
      label: t('caseManagement.featureCase.comments'),
      canHide: true,
      isShow: true,
    },
    {
      value: 'changeHistory',
      label: t('caseManagement.featureCase.changeHistory'),
      canHide: true,
      isShow: true,
    },
  ];

  const buggerTab: TabItemType[] = [
    {
      value: 'requirement',
      label: t('caseManagement.featureCase.requirement'),
      canHide: true,
      isShow: true,
    },
    {
      value: 'bug',
      label: t('caseManagement.featureCase.bug'),
      canHide: true,
      isShow: true,
    },
  ];

  // 计算模块开启是否展示缺陷和需求
  const newTabDefaultSettingList = computed(() => {
    if (appStore.currentMenuConfig.includes('bugManagement')) {
      return [...tabDefaultSettingList, ...buggerTab, ...caseTab];
    }
    return [...tabDefaultSettingList, ...caseTab];
  });

  featureCaseStore.initContentTabList([...newTabDefaultSettingList.value]);
  tabSetting.value = ((await featureCaseStore.getContentTabList()) || []).filter((item) => item.isShow);

  async function handleUploadImage(file: File) {
    const { data } = await editorUploadFile({
      fileList: [file],
    });
    return data;
  }

  const initTab = async () => {
    showSettingDrawer.value = false;
    const tmpArr = (await featureCaseStore.getContentTabList()) || [];
    tabSetting.value = tmpArr.filter((item) => item.isShow);
    activeTab.value = 'detail';
  };
</script>

<style scoped lang="less">
  :deep(.arco-menu-light) {
    height: 50px;
    background: none !important;
    .arco-menu-inner {
      overflow: hidden;
      padding: 14px 0;
      height: 50px;
    }
  }
  .leftWrapper {
    .header {
      padding: 0 16px;
      border-bottom: 1px solid var(--color-text-n8);
    }
  }
  .rightWrapper {
    .baseItem {
      margin-bottom: 16px;
      height: 32px;
      line-height: 32px;
      @apply flex;
      .label {
        flex-shrink: 0;
        width: 84px;
        color: var(--color-text-3);
      }
      .value {
        padding-left: 10px;
      }
    }
    :deep(.arco-form-item-layout-horizontal) {
      margin-bottom: 16px !important;
    }
    :deep(.arco-form-item-label-col) {
      padding-right: 0;
    }
    :deep(.arco-col-9) {
      flex: 0 0 84px;
      width: 84px;
    }
    :deep(.arco-col-15) {
      flex: 0 0 calc(100% - 84px);
      width: calc(100% - 84px);
    }
    :deep(.arco-form-item-label::after) {
      color: red !important;
    }
    :deep(.arco-form-item-label-col > .arco-form-item-label) {
      overflow: hidden;
      width: 84px;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--color-text-3) !important;
    }
    :deep(.arco-select-view-single) {
      border-color: transparent !important;
      .arco-select-view-suffix {
        visibility: hidden;
      }
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
        .arco-select-view-suffix {
          visibility: visible !important;
        }
      }
      &:hover > .arco-input {
        font-weight: normal;
        text-decoration: none;
        color: var(--color-text-1);
      }
      & > .arco-input {
        font-weight: 500;
        text-decoration: underline;
        color: var(--color-text-1);
      }
    }
    :deep(.arco-input-tag) {
      border-color: transparent !important;
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
      }
    }
    :deep(.arco-input-wrapper) {
      border-color: transparent !important;
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
      }
    }
    :deep(.arco-select-view-multiple) {
      border-color: transparent !important;
      .arco-select-view-suffix {
        visibility: hidden;
      }
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
        .arco-select-view-suffix {
          visibility: visible !important;
        }
      }
    }
    :deep(.arco-textarea-wrapper) {
      border-color: transparent !important;
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
      }
    }
    :deep(.arco-input-number) {
      border-color: transparent !important;
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
      }
    }
    :deep(.arco-picker) {
      border-color: transparent !important;
      .arco-picker-suffix {
        visibility: hidden;
      }
      &:hover {
        border-color: rgb(var(--primary-5)) !important;
        arco-picker-suffix {
          visibility: visible !important;
        }
      }
    }
  }
  .rightButtons {
    :deep(.ms-button--secondary):hover,
    :hover > .arco-icon {
      color: rgb(var(--primary-5)) !important;
      background: var(--color-bg-3);
      .arco-icon:hover {
        color: rgb(var(--primary-5)) !important;
      }
    }
  }
  .error-6 {
    color: rgb(var(--danger-6));
    &:hover {
      color: rgb(var(--danger-6));
    }
  }
  :deep(.active .arco-badge-text) {
    background: rgb(var(--primary-5));
  }
</style>
