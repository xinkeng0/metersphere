import common from './common';
import localeSettings from './settings';
import sys from './sys';
import dayjsLocale from 'dayjs/locale/zh-cn';

const _Cmodules: any = import.meta.glob('../../components/**/locale/zh-CN.ts', { eager: true });
const _Vmodules: any = import.meta.glob('../../views/**/locale/zh-CN.ts', { eager: true });
let result = {};
Object.keys(_Cmodules).forEach((key) => {
  const defaultModule = _Cmodules[key as any].default;
  if (!defaultModule) return;
  result = { ...result, ...defaultModule };
});
Object.keys(_Vmodules).forEach((key) => {
  const defaultModule = _Vmodules[key as any].default;
  if (!defaultModule) return;
  result = { ...result, ...defaultModule };
});
export default {
  message: {
    'menu.workbench': '工作台',
    'menu.testPlan': '测试计划',
    'menu.bugManagement': '缺陷管理',
    'menu.bugManagement.bugDetail': '缺陷',
    'menu.bugManagement.bugRecycle': '回收站',
    'menu.caseManagement': '用例管理',
    'menu.apiTest': '接口测试',
    'menu.apiTest.debug': '调试',
    'menu.apiTest.debug.debug': '调试',
    'menu.apiTest.management': '定义',
    'menu.apiTest.management.definition': '定义',
    'menu.apiTest.api': 'API列表',
    'menu.apiTest.apiScenario': '场景',
    'menu.apiTest.scenario': '场景',
    'menu.apiTest.scenario.recycle': '回收站',
    'menu.apiTest.report': '报告',
    'menu.uiTest': 'UI测试',
    'menu.workstation': '工作台',
    'menu.loadTest': '性能测试',
    'menu.performanceTest': '性能测试',
    'menu.projectManagement': '项目管理',
    'menu.projectManagement.templateManager': '模板管理',
    'menu.projectManagement.log': '日志',
    'menu.projectManagement.taskCenter': '任务中心',
    'menu.projectManagement.fileManagement': '文件管理',
    'menu.projectManagement.messageManagement': '消息管理',
    'menu.projectManagement.commonScript': '公共脚本',
    'menu.projectManagement.fakeError': '误报库',
    'menu.projectManagement.messageManagementEdit': '更新模板',
    'menu.projectManagement.environmentManagement': '环境管理',
    'menu.caseManagement.featureCase': '功能用例',
    'menu.caseManagement.featureCaseRecycle': '回收站',
    'menu.caseManagement.featureCaseList': '用例列表',
    'menu.caseManagement.featureCaseDetail': '创建用例',
    'menu.caseManagement.featureCaseEdit': '更新用例',
    'menu.caseManagement.featureCaseCreateSuccess': '创建用例成功',
    'menu.caseManagement.caseManagementReview': '用例评审',
    'menu.caseManagement.caseManagementReviewCreate': '创建评审',
    'menu.caseManagement.caseManagementReviewDetail': '评审详情',
    'menu.caseManagement.caseManagementReviewDetailCaseDetail': '评审用例详情',
    'menu.caseManagement.caseManagementCaseReviewEdit': '更新评审',
    'menu.caseManagement.caseManagementCaseDetail': '用例详情',
    'menu.projectManagement.projectPermission': '项目与权限',
    'menu.settings': '系统设置',
    'menu.settings.system': '系统',
    'menu.settings.system.user': '用户',
    'menu.settings.system.usergroup': '用户组',
    'menu.settings.system.authorizedManagement': '授权',
    'menu.settings.system.pluginManager': '插件',
    'menu.settings.system.organizationAndProject': '组织与项目',
    'menu.settings.system.resourcePool': '资源池',
    'menu.settings.system.resourcePoolDetail': '添加资源池',
    'menu.settings.system.resourcePoolEdit': '编辑资源池',
    'menu.settings.system.parameter': '系统参数',
    'menu.settings.system.log': '日志',
    'menu.settings.organization': '组织',
    'menu.settings.organization.member': '成员',
    'menu.settings.organization.userGroup': '用户组',
    'menu.settings.organization.project': '项目',
    'menu.settings.organization.serviceIntegration': '服务集成',
    'menu.settings.organization.template': '模板',
    'menu.settings.organization.bugTemplate': '缺陷模板',
    'menu.settings.organization.templateFieldSetting': '字段设置',
    'menu.settings.organization.templateManagementList': '模板列表',
    'menu.settings.organization.templateManagementDetail': '创建模板',
    'menu.settings.organization.templateManagementCopy': '复制模板',
    'menu.settings.organization.templateManagementEdit': '更新模板',
    'menu.settings.organization.templateManagementWorkFlow': '工作流设置',
    'menu.settings.organization.log': '日志',
    'navbar.action.locale': '切换为中文',
    ...sys,
    ...localeSettings,
    ...result,
    ...common,
  },
  dayjsLocale,
  dayjsLocaleName: 'zh-CN',
};
