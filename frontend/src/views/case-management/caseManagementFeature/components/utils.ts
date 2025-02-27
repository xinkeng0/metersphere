import type { FormItem } from '@/components/pure/ms-form-create/types';
import { MsTableColumnData } from '@/components/pure/ms-table/type';
import { getFileEnum } from '@/components/pure/ms-upload/iconMap';
import type { MsFileItem } from '@/components/pure/ms-upload/types';
import type { CaseLevel } from '@/components/business/ms-case-associate/types';

import { useI18n } from '@/hooks/useI18n';
import { hasAnyPermission } from '@/utils/permission';

import type { AssociatedList, CustomAttributes } from '@/models/caseManagement/featureCase';
import { StatusType } from '@/enums/caseEnum';

const { t } = useI18n();

export interface ReviewResult {
  key: keyof typeof StatusType;
  icon: string;
  statusText: string;
}

// 图标评审结果 TODO:TS 类型 key
export const statusIconMap: Record<string, any> = {
  UN_REVIEWED: {
    key: 'UN_REVIEWED',
    icon: StatusType.UN_REVIEWED,
    statusText: t('caseManagement.featureCase.notReviewed'),
    color: 'text-[var(--color-text-brand)]',
  },
  UNDER_REVIEWED: {
    key: 'UNDER_REVIEWED',
    icon: StatusType.UNDER_REVIEWED,
    statusText: t('caseManagement.featureCase.reviewing'),
    color: 'text-[rgb(var(--link-6))]',
  },
  PASS: {
    key: 'PASS',
    icon: StatusType.PASS,
    statusText: t('caseManagement.featureCase.passed'),
    color: '',
  },
  UN_PASS: {
    key: 'UN_PASS',
    icon: StatusType.UN_PASS,
    statusText: t('caseManagement.featureCase.notPass'),
    color: '',
  },
  RE_REVIEWED: {
    key: 'RE_REVIEWED',
    icon: StatusType.RE_REVIEWED,
    statusText: t('caseManagement.featureCase.retrial'),
    color: 'text-[rgb(var(--warning-6))]',
  },
};
// 图标执行结果 TODO:TS 类型 key
export const executionResultMap: Record<string, any> = {
  UN_EXECUTED: {
    key: 'UN_EXECUTED',
    icon: StatusType.UN_EXECUTED,
    statusText: t('caseManagement.featureCase.nonExecution'),
    color: 'text-[var(--color-text-brand)]',
  },
  PASSED: {
    key: 'PASSED',
    icon: StatusType.PASSED,
    statusText: t('caseManagement.featureCase.passed'),
    color: '',
  },
  SKIPPED: {
    key: 'SKIPPED',
    icon: StatusType.SKIPPED,
    statusText: t('caseManagement.featureCase.skip'),
    color: 'text-[rgb(var(--link-6))]',
  },
  BLOCKED: {
    key: 'BLOCKED',
    icon: StatusType.BLOCKED,
    statusText: t('caseManagement.featureCase.chokeUp'),
    color: 'text-[rgb(var(--warning-6))]',
  },
  FAILED: {
    key: 'FAILED',
    icon: StatusType.FAILED,
    statusText: t('caseManagement.featureCase.failure'),
    color: '',
  },
};

/** *
 *
 * @description 将文件信息转换为文件格式
 * @param fileInfo 文件file
 */

export function convertToFile(fileInfo: AssociatedList): MsFileItem {
  const gatewayAddress = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
  const fileName = fileInfo.fileType ? `${fileInfo.name}.${fileInfo.fileType || ''}` : `${fileInfo.name}`;

  const fileFormatMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const fileFormatType = fileFormatMatch ? fileFormatMatch[1] : 'none';
  const type = getFileEnum(fileFormatType);
  const file = new File([new Blob()], `${fileName}`, {
    type: `application/${type}`,
  });
  Object.defineProperty(file, 'size', { value: fileInfo.size });
  const { id, createUserName, createTime, local, isUpdateFlag, associateId } = fileInfo;
  return {
    enable: fileInfo.enable || false,
    file,
    name: fileName,
    originalName: fileInfo.originalName,
    percent: 0,
    status: 'done',
    uid: id,
    url: `${gatewayAddress}/${fileInfo.filePath || ''}`,
    createUserName,
    createTime,
    local: !!local,
    deleteContent: local ? '' : 'caseManagement.featureCase.cancelLink',
    isUpdateFlag,
    associateId,
  };
}

// 返回用例等级
export function getCaseLevels(customFields: CustomAttributes[]): CaseLevel {
  const caseLevelItem = (customFields || []).find((it: any) => it.internal && it.fieldName === '用例等级');
  return (
    (caseLevelItem?.options.find((it: any) => it.value === caseLevelItem.defaultValue)?.text as CaseLevel) ||
    ('P0' as CaseLevel)
  );
}

// 处理自定义字段
export function getTableFields(customFields: CustomAttributes[], itemDataIndex: MsTableColumnData, userId: string) {
  const multipleExcludes = ['MULTIPLE_SELECT', 'CHECKBOX', 'MULTIPLE_MEMBER'];
  const selectExcludes = ['MEMBER', 'RADIO', 'SELECT'];

  const currentColumnData: CustomAttributes | undefined = (customFields || []).find(
    (item: any) => itemDataIndex.dataIndex === item.fieldId
  );

  if (currentColumnData) {
    let selectValue: string;
    // 处理多选项
    if (multipleExcludes.includes(currentColumnData.type) && currentColumnData.defaultValue) {
      selectValue = JSON.parse(currentColumnData.defaultValue);
      if (Array.isArray(selectValue) && selectValue.includes('CREATE_USER')) {
        const index = selectValue.indexOf('CREATE_USER');
        selectValue.splice(index, 1, userId);
      }
      if (selectValue === 'CREATE_USER') {
        selectValue = userId;
      }
      return (
        (currentColumnData.options || [])
          .filter((item: any) => selectValue.includes(item.value))
          .map((it: any) => it.text)
          .join(',') || '-'
      );
    }
    if (currentColumnData.type === 'MULTIPLE_INPUT') {
      // 处理标签形式
      return JSON.parse(currentColumnData.defaultValue).join('，') || '-';
    }
    if (selectExcludes.includes(currentColumnData.type)) {
      if (currentColumnData.defaultValue === 'CREATE_USER') {
        currentColumnData.defaultValue = userId;
      }
      return (
        (currentColumnData.options || [])
          .filter((item: any) => currentColumnData.defaultValue === item.value)
          .map((it: any) => it.text)
          .join() || '-'
      );
    }
    return currentColumnData.defaultValue || '-';
  }
  return '-';
}

export function initFormCreate(customFields: CustomAttributes[], permission: string[]) {
  return customFields.map((item: any) => {
    const multipleType = ['MULTIPLE_SELECT', 'CHECKBOX'];
    const numberType = ['INT', 'FLOAT'];
    const memberType = ['MEMBER', 'MULTIPLE_MEMBER'];
    const multipleInputType = ['MULTIPLE_INPUT'];
    const singleType = ['SELECT', 'RADIO'];
    let currentDefaultValue;
    const optionsValue = item.options || [];
    // 处理数字类型
    if (numberType.includes(item.type)) {
      currentDefaultValue = Number(item.defaultValue);
      // 处理多选项类型为空的默认值
    } else if (multipleType.includes(item.type) && Array.isArray(item.defaultValue) && item.defaultValue.length === 0) {
      currentDefaultValue = item.defaultValue;
      // 处理多选情况
    } else if (multipleType.includes(item.type)) {
      const tempValue = JSON.parse(item.defaultValue);
      const optionsIds = optionsValue.map((e: any) => e.value);
      currentDefaultValue = (optionsIds || []).filter((e: any) => tempValue.includes(e));
    } else if (memberType.includes(item.type)) {
      // @desc 上来为空成员且不包含默认值成员
      if (Array.isArray(item.defaultValue) && !item.defaultValue.includes('CREATE_USER')) {
        currentDefaultValue = item.type === 'MEMBER' ? '' : [];
        // @desc 包含默认值成员
      } else if (item.defaultValue.includes('CREATE_USER')) {
        currentDefaultValue = item.type === 'MEMBER' ? '' : [];
      } else {
        // @desc 如果默认原本的成员被系统移除则过滤掉该用户不展示
        const optionsIds = optionsValue.map((e: any) => e.value);
        if (item.type === 'MULTIPLE_MEMBER') {
          const tempValue = JSON.parse(item.defaultValue);
          currentDefaultValue = (optionsIds || []).filter((e: any) => tempValue.includes(e));
        } else {
          currentDefaultValue = (optionsIds || []).find((e: any) => item.defaultValue === e) || '';
        }
      }
    } else if (multipleInputType.includes(item.type)) {
      currentDefaultValue = Array.isArray(item.defaultValue) ? item.defaultValue : JSON.parse(item.defaultValue);
    } else if (singleType.includes(item.type)) {
      const optionsIds = optionsValue.map((e: any) => e.value);
      currentDefaultValue = (optionsIds || []).find((e: any) => item.defaultValue === e) || '';
    } else {
      currentDefaultValue = item.defaultValue;
    }
    return {
      ...item,
      type: item.type,
      name: item.fieldId,
      label: item.fieldName,
      value: currentDefaultValue,
      required: item.required,
      options: optionsValue || [],
      props: {
        modelValue: currentDefaultValue,
        disabled: !hasAnyPermission(permission),
        options: optionsValue || [],
      },
    };
  }) as FormItem[];
}
