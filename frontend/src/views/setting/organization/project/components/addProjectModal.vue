<template>
  <a-modal
    v-model:visible="currentVisible"
    title-align="start"
    class="ms-modal-form ms-modal-medium"
    unmount-on-close
    :mask-closable="false"
    @cancel="handleCancel(false)"
  >
    <template #title>
      <span v-if="isEdit" class="flex">
        {{ t('system.project.updateProject') }}
        <div class="ml-[4px] flex text-[var(--color-text-4)]">
          (
          <a-tooltip :content="props.currentProject?.name">
            <div class="one-line-text max-w-[300px]">{{ props.currentProject?.name }}</div>
          </a-tooltip>
          )
        </div>
      </span>
      <span v-else>
        {{ t('system.project.createProject') }}
      </span>
    </template>
    <div class="form">
      <a-form ref="formRef" class="rounded-[4px]" :model="form" layout="vertical">
        <a-form-item
          field="name"
          required
          :label="t('system.project.name')"
          asterisk-position="end"
          :rules="[
            { required: true, message: t('system.project.projectNameRequired') },
            { maxLength: 255, message: t('common.nameIsTooLang') },
          ]"
        >
          <a-input v-model="form.name" allow-clear :placeholder="t('system.project.projectNamePlaceholder')" />
        </a-form-item>
        <a-form-item field="organizationId" asterisk-position="end" :label="t('system.project.affiliatedOrg')">
          <a-select
            v-model="form.organizationId"
            disabled
            allow-search
            allow-clear
            :options="affiliatedOrgOption"
            :default-value="isXpack ? '' : '100001'"
            :placeholder="t('system.project.affiliatedOrgPlaceholder')"
            :field-names="{ label: 'name', value: 'id' }"
          >
          </a-select>
        </a-form-item>
        <a-form-item
          field="userIds"
          asterisk-position="end"
          :rules="[{ required: true, message: t('system.project.projectAdminIsNotNull') }]"
          :label="t('system.project.projectAdmin')"
        >
          <MsUserSelector
            v-model="form.userIds"
            :type="UserRequestTypeEnum.ORGANIZATION_PROJECT_ADMIN"
            placeholder="system.project.pleaseSelectAdmin"
            :load-option-params="{
              organizationId: currentOrgId,
            }"
            :at-least-one="true"
          />
        </a-form-item>
        <a-form-item field="module" :label="t('system.project.moduleSetting')">
          <a-checkbox-group v-model="form.moduleIds" :options="moduleOption" @change="handleModuleChange">
            <template #label="{ data }">
              <span>{{ t(data.label) }}</span>
            </template>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item
          v-if="showPool"
          field="resourcePoolIds"
          :label="t('system.project.resourcePool')"
          asterisk-position="end"
          :rules="[{ required: showPool, message: t('system.project.poolIsNotNull') }]"
        >
          <MsSystemPool
            v-model:modelValue="form.resourcePoolIds"
            :module-ids="form.moduleIds"
            :organization-id="currentOrgId"
            :is-org="true"
          />
        </a-form-item>
        <a-form-item field="description" :label="t('system.organization.description')">
          <a-textarea
            v-model="form.description"
            :max-length="1000"
            :placeholder="t('system.project.descriptionPlaceholder')"
            allow-clear
            :auto-size="{ minRows: 1 }"
          />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="flex flex-row justify-between">
        <div class="flex flex-row items-center gap-[4px]">
          <a-switch v-model="form.enable" size="small" type="line" />
          <span>{{ t('system.organization.status') }}</span>
          <a-tooltip :content="t('system.project.createTip')" position="top">
            <MsIcon
              type="icon-icon-maybe_outlined"
              class="text-[var(--color-text-4)] hover:text-[rgb(var(--primary-5))]"
            />
          </a-tooltip>
        </div>
        <div class="flex flex-row gap-[14px]">
          <a-button type="secondary" :loading="loading" @click="handleCancel(false)">
            {{ t('common.cancel') }}
          </a-button>
          <a-button type="primary" :loading="loading" @click="handleBeforeOk">
            {{ isEdit ? t('common.confirm') : t('common.create') }}
          </a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watchEffect } from 'vue';
  import { useIntervalFn } from '@vueuse/core';
  import { Message } from '@arco-design/web-vue';

  import MsIcon from '@/components/pure/ms-icon-font/index.vue';
  import MsSystemPool from '@/components/business/ms-system-pool/MsSystemPool.vue';
  import MsUserSelector from '@/components/business/ms-user-selector/index.vue';
  import { UserRequestTypeEnum } from '@/components/business/ms-user-selector/utils';

  import { createOrUpdateProjectByOrg, getSystemOrgOption } from '@/api/modules/setting/organizationAndProject';
  import { useI18n } from '@/hooks/useI18n';
  import { useAppStore, useUserStore } from '@/store';
  import useLicenseStore from '@/store/modules/setting/license';

  import { CreateOrUpdateSystemProjectParams, SystemOrgOption } from '@/models/setting/system/orgAndProject';

  import type { FormInstance, ValidatedError } from '@arco-design/web-vue';

  defineOptions({
    name: 'OrgAddProjectModal',
  });

  const { t } = useI18n();
  const props = defineProps<{
    currentProject?: CreateOrUpdateSystemProjectParams;
  }>();

  const formRef = ref<FormInstance>();

  const loading = ref(false);
  const isEdit = computed(() => !!(props.currentProject && props.currentProject.id));
  const affiliatedOrgOption = ref<SystemOrgOption[]>([]);
  const userStore = useUserStore();
  const appStore = useAppStore();
  const currentOrgId = computed(() => appStore.currentOrgId);
  const licenseStore = useLicenseStore();
  const timer = ref(5); // 存储倒计时
  const { pause, resume } = useIntervalFn(() => {
    timer.value--;
  }, 1000);
  // 初始化组件时关闭
  pause();
  // timer 为0时关闭
  watch(timer, () => {
    if (timer.value === 0) {
      pause();
    }
  });
  const moduleOption = [
    // { label: 'menu.workbench', value: 'workstation' },
    // { label: 'menu.testPlan', value: 'testPlan' },
    { label: 'menu.bugManagement', value: 'bugManagement' },
    { label: 'menu.caseManagement', value: 'caseManagement' },
    { label: 'menu.apiTest', value: 'apiTest' },
    // { label: 'menu.uiTest', value: 'uiTest' },
    // { label: 'menu.performanceTest', value: 'loadTest' },
  ];

  const emit = defineEmits<{
    (e: 'cancel', shouldSearch: boolean): void;
  }>();

  const allModuleIds = ['bugManagement', 'caseManagement', 'apiTest'];

  const showPoolModuleIds = ['uiTest', 'apiTest', 'loadTest'];

  const form = reactive<CreateOrUpdateSystemProjectParams>({
    name: '',
    userIds: [],
    organizationId: currentOrgId.value,
    description: '',
    resourcePoolIds: [],
    enable: true,
    moduleIds: allModuleIds,
  });

  const currentVisible = defineModel<boolean>('visible', {
    default: false,
  });
  const showPool = computed(() => showPoolModuleIds.some((item) => form.moduleIds?.includes(item)));

  const isXpack = computed(() => {
    return licenseStore.hasLicense();
  });

  const formReset = () => {
    form.name = '';
    form.userIds = userStore.id ? [userStore.id] : [];
    form.organizationId = currentOrgId.value;
    form.description = '';
    form.enable = true;
    form.moduleIds = allModuleIds;
    form.resourcePoolIds = [];
    timer.value = 5;
    Message.clear();
    pause();
  };
  const handleModuleChange = (value: (string | number | boolean)[]) => {
    if (props.currentProject?.id && timer.value === 5 && props.currentProject.moduleIds?.length) {
      if (props.currentProject.moduleIds.some((item) => value.includes(item))) {
        resume();
        Message.warning({
          content: () =>
            h('span', [
              h('span', t('system.project.afterModule')),
              h('span', { class: 'ml-[20px] text-[var(--color-text-4)]' }, `${timer.value}s`),
            ]),
          duration: 5000,
        });
      }
    }
  };
  const handleCancel = (shouldSearch: boolean) => {
    emit('cancel', shouldSearch);
  };

  const handleBeforeOk = async () => {
    await formRef.value?.validate(async (errors: undefined | Record<string, ValidatedError>) => {
      if (errors) {
        return;
      }
      try {
        loading.value = true;
        await createOrUpdateProjectByOrg({ id: isEdit.value ? props.currentProject?.id : '', ...form });
        Message.success(
          isEdit.value ? t('system.project.updateProjectSuccess') : t('system.project.createProjectSuccess')
        );
        appStore.initProjectList();
        handleCancel(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        loading.value = false;
      }
    });
  };
  const initAffiliatedOrgOption = async () => {
    try {
      const res = await getSystemOrgOption();
      affiliatedOrgOption.value = res;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  watchEffect(() => {
    initAffiliatedOrgOption();
    if (props.currentProject?.id) {
      // 编辑
      if (props.currentProject) {
        form.id = props.currentProject.id;
        form.name = props.currentProject.name;
        form.description = props.currentProject.description;
        form.enable = props.currentProject.enable;
        form.userIds = props.currentProject.userIds;
        form.organizationId = props.currentProject.organizationId;
        form.moduleIds = props.currentProject.moduleIds;
        form.resourcePoolIds = props.currentProject.resourcePoolIds;
      }
    } else {
      // 新建
      formReset();
    }
  });
</script>
