import { RouteEnum } from '@/enums/routeEnum';

export const MENU_LEVEL = ['SYSTEM', 'ORGANIZATION', 'PROJECT'] as const; // 菜单级别

export type PathMapKey = keyof typeof RouteEnum;

export type PathMapRoute = (typeof RouteEnum)[PathMapKey];

export interface PathMapItem {
  key: PathMapKey | string; // 系统设置
  locale: string;
  route: PathMapRoute | string;
  permission?: [];
  level: (typeof MENU_LEVEL)[number]; // 系统设置里有系统级别也有组织级别，按最低权限级别配置
  children?: PathMapItem[];
  routeQuery?: Record<string, any>;
}

/**
 * 路由与菜单、tab、权限、国际化信息的映射关系，用于通过路由直接跳转到各页面及携带 tab 参数
 * key 是与后台商定的映射 key
 * locale 是国际化的 key
 * route 是路由的 name
 * routeQuery 是路由的固定参数集合，与routeParamKeys互斥，用于跳转同一个路由但不同 tab 时或其他需要固定参数的情况
 * permission 是权限的 key 集合
 * level 是菜单级别，用于筛选不同级别的路由/tab
 * children 是子路由/tab集合
 */
export const pathMap: PathMapItem[] = [
  {
    key: 'API_TEST', // 接口测试
    locale: 'menu.apiTest',
    route: RouteEnum.API_TEST,
    permission: [],
    level: MENU_LEVEL[2],
    children: [
      {
        key: 'API_TEST_DEBUG', // 接口测试-接口调试
        locale: 'menu.apiTest.debug',
        route: RouteEnum.API_TEST_DEBUG,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'API_TEST_MANAGEMENT', // 接口测试-接口管理
        locale: 'menu.apiTest.management',
        route: RouteEnum.API_TEST_MANAGEMENT,
        permission: [],
        level: MENU_LEVEL[2],
      },
    ],
  },
  {
    key: 'BUG_MANAGEMENT', // 缺陷管理
    locale: 'menu.bugManagement',
    route: RouteEnum.BUG_MANAGEMENT,
    permission: [],
    level: MENU_LEVEL[2],
    children: [
      {
        key: 'BUG_MANAGEMENT_BUG_INDEX', // 缺陷管理-缺陷首页
        locale: 'menu.bugManagement.bugDetail',
        route: RouteEnum.BUG_MANAGEMENT_INDEX,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'BUG_MANAGEMENT_BUG_DETAIL', // 缺陷管理-缺陷详情
        locale: 'menu.bugManagement.bugDetail',
        route: RouteEnum.BUG_MANAGEMENT_DETAIL,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'BUG_MANAGEMENT_BUG_recycle', // 缺陷管理-回收站
        locale: 'menu.bugManagement.bugRecycle',
        route: RouteEnum.BUG_MANAGEMENT_RECYCLE,
        permission: [],
        level: MENU_LEVEL[2],
      },
    ],
  },
  {
    key: 'CASE_MANAGEMENT', // 功能测试
    locale: 'menu.caseManagement',
    route: RouteEnum.CASE_MANAGEMENT,
    permission: [],
    level: MENU_LEVEL[2],
    children: [
      {
        key: 'CASE_MANAGEMENT_CASE', // 功能测试-功能用例
        locale: 'menu.caseManagement.featureCase',
        route: RouteEnum.CASE_MANAGEMENT_CASE,
        permission: [],
        level: MENU_LEVEL[2],
        children: [
          {
            key: 'CASE_MANAGEMENT_CASE_DETAIL', // 功能测试-功能用例详情
            locale: 'menu.caseManagement.featureCaseDetail',
            route: RouteEnum.CASE_MANAGEMENT_CASE_DETAIL,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'CASE_MANAGEMENT_CASE_CREATE_SUCCESS', // 功能测试-功能用例创建成功页面
            locale: 'menu.caseManagement.featureCaseCreateSuccess',
            route: RouteEnum.CASE_MANAGEMENT_CASE_CREATE_SUCCESS,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'CASE_MANAGEMENT_CASE_RECYCLE', // 功能测试-功能用例-回收站
            locale: 'menu.caseManagement.featureCaseRecycle',
            route: RouteEnum.CASE_MANAGEMENT_CASE_RECYCLE,
            permission: [],
            level: MENU_LEVEL[2],
          },
        ],
      },
      {
        key: 'CASE_MANAGEMENT_REVIEW', // 功能测试-功能用例-用例评审
        locale: 'menu.caseManagement.caseManagementReview',
        route: RouteEnum.CASE_MANAGEMENT_REVIEW,
        permission: [],
        level: MENU_LEVEL[2],
        children: [
          {
            key: 'CASE_MANAGEMENT_REVIEW_LIST', // 功能测试-功能用例-用例评审列表
            locale: 'menu.caseManagement.caseManagementReview',
            route: RouteEnum.CASE_MANAGEMENT_REVIEW,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'CASE_MANAGEMENT_REVIEW_CREATE', // 功能测试-功能用例-创建评审
            locale: 'menu.caseManagement.caseManagementReviewCreate',
            route: RouteEnum.CASE_MANAGEMENT_REVIEW_CREATE,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'CASE_MANAGEMENT_REVIEW_UPDATE', // 功能测试-功能用例-更新评审
            locale: 'menu.caseManagement.caseManagementCaseReviewEdit',
            route: RouteEnum.CASE_MANAGEMENT_REVIEW_CREATE,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'CASE_MANAGEMENT_REVIEW_DETAIL', // 功能测试-功能用例-评审详情
            locale: 'menu.caseManagement.caseManagementReviewDetail',
            route: RouteEnum.CASE_MANAGEMENT_REVIEW_DETAIL,
            permission: [],
            level: MENU_LEVEL[2],
            children: [
              {
                key: 'CASE_MANAGEMENT_REVIEW_DETAIL_CASE_DETAIL', // 功能测试-功能用例-评审详情-用例详情
                locale: 'menu.caseManagement.caseManagementReviewDetailCaseDetail',
                route: RouteEnum.CASE_MANAGEMENT_REVIEW_DETAIL_CASE_DETAIL,
                permission: [],
                level: MENU_LEVEL[2],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'SETTING', // 系统设置
    locale: 'menu.settings',
    route: RouteEnum.SETTING,
    permission: [],
    level: MENU_LEVEL[1], // 系统设置里有系统级别也有组织级别，按最低权限级别配置
    children: [
      {
        key: 'SETTING_SYSTEM', // 系统设置-系统
        locale: 'menu.settings.system',
        route: RouteEnum.SETTING_SYSTEM,
        permission: [],
        level: MENU_LEVEL[0],
        children: [
          {
            key: 'SETTING_SYSTEM_USER_SINGLE', // 系统设置-系统-用户
            locale: 'menu.settings.system.user',
            route: RouteEnum.SETTING_SYSTEM_USER_SINGLE,
            permission: [],
            level: MENU_LEVEL[0],
          },
          {
            key: 'SETTING_SYSTEM_USER_GROUP', // 系统设置-系统-用户组
            locale: 'menu.settings.system.usergroup',
            route: RouteEnum.SETTING_SYSTEM_USER_GROUP,
            permission: [],
            level: MENU_LEVEL[0],
          },
          {
            key: 'SETTING_SYSTEM_ORGANIZATION', // 系统设置-系统-组织与项目
            locale: 'menu.settings.system.organizationAndProject',
            route: RouteEnum.SETTING_SYSTEM_ORGANIZATION,
            permission: [],
            level: MENU_LEVEL[0],
          },
          {
            key: 'SETTING_SYSTEM_PARAMETER', // 系统设置-系统-系统参数
            locale: 'menu.settings.system.parameter',
            route: RouteEnum.SETTING_SYSTEM_PARAMETER,
            permission: [],
            level: MENU_LEVEL[0],
            children: [
              {
                key: 'SETTING_SYSTEM_PARAMETER_BASE_CONFIG', // 系统设置-系统-系统参数-基础设置
                locale: 'system.config.baseConfig',
                route: RouteEnum.SETTING_SYSTEM_PARAMETER,
                permission: [],
                level: MENU_LEVEL[0],
              },
              {
                key: 'SETTING_SYSTEM_PARAMETER_PAGE_CONFIG', // 系统设置-系统-系统参数-界面设置
                locale: 'system.config.pageConfig',
                route: RouteEnum.SETTING_SYSTEM_PARAMETER,
                permission: [],
                routeQuery: {
                  tab: 'pageConfig',
                },
                level: MENU_LEVEL[0],
              },
              {
                key: 'SETTING_SYSTEM_PARAMETER_AUTH_CONFIG', // 系统设置-系统-系统参数-认证设置
                locale: 'system.config.authConfig',
                route: RouteEnum.SETTING_SYSTEM_PARAMETER,
                permission: [],
                routeQuery: {
                  tab: 'authConfig',
                },
                level: MENU_LEVEL[0],
              },
            ],
          },
          {
            key: 'SETTING_SYSTEM_RESOURCE_POOL', // 系统设置-系统-资源池
            locale: 'menu.settings.system.resourcePool',
            route: RouteEnum.SETTING_SYSTEM_RESOURCE_POOL,
            permission: [],
            level: MENU_LEVEL[0],
          },
          {
            key: 'SETTING_SYSTEM_AUTHORIZED_MANAGEMENT', // 系统设置-系统-授权管理
            locale: 'menu.settings.system.authorizedManagement',
            route: RouteEnum.SETTING_SYSTEM_AUTHORIZED_MANAGEMENT,
            permission: [],
            level: MENU_LEVEL[0],
          },
          {
            key: 'SETTING_SYSTEM_LOG', // 系统设置-系统-日志
            locale: 'menu.settings.system.log',
            route: RouteEnum.SETTING_SYSTEM_LOG,
            permission: [],
            level: MENU_LEVEL[0],
          },
          {
            key: 'SETTING_SYSTEM_PLUGIN_MANAGEMENT', // 系统设置-系统-插件管理
            locale: 'menu.settings.system.pluginManager',
            route: RouteEnum.SETTING_SYSTEM_PLUGIN_MANAGEMENT,
            permission: [],
            level: MENU_LEVEL[0],
          },
        ],
      },
      {
        key: 'SETTING_ORGANIZATION', // 系统设置-组织
        locale: 'menu.settings.organization',
        route: RouteEnum.SETTING_ORGANIZATION,
        permission: [],
        level: MENU_LEVEL[1],
        children: [
          {
            key: 'SETTING_ORGANIZATION_MEMBER', // 系统设置-组织-成员
            locale: 'menu.settings.organization.member',
            route: RouteEnum.SETTING_ORGANIZATION_MEMBER,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_USER_ROLE', // 系统设置-组织-用户组
            locale: 'menu.settings.organization.userGroup',
            route: RouteEnum.SETTING_ORGANIZATION_USER_GROUP,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_PROJECT', // 系统设置-组织-项目
            locale: 'menu.settings.organization.project',
            route: RouteEnum.SETTING_ORGANIZATION_PROJECT,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_SERVICE', // 系统设置-组织-服务集成
            locale: 'menu.settings.organization.serviceIntegration',
            route: RouteEnum.SETTING_ORGANIZATION_SERVICE,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_TEMPLATE', // 系统设置-组织-模板
            locale: 'menu.settings.organization.template',
            route: RouteEnum.SETTING_ORGANIZATION_TEMPLATE,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_TEMPLATE_FILED_SETTING', // 系统设置-模板管理-字段设置
            locale: 'menu.settings.organization.templateFieldSetting',
            route: RouteEnum.SETTING_ORGANIZATION_TEMPLATE_FILED_SETTING,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_TEMPLATE_MANAGEMENT', // 系统设置-模板管理列表
            locale: 'menu.settings.organization.templateManagementList',
            route: RouteEnum.SETTING_ORGANIZATION_TEMPLATE_MANAGEMENT,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_TEMPLATE_MANAGEMENT_DETAIL', // 系统设置-模板管理-详情
            locale: 'menu.settings.organization.templateManagementDetail',
            route: RouteEnum.SETTING_ORGANIZATION_TEMPLATE_MANAGEMENT_DETAIL,
            permission: [],
            level: MENU_LEVEL[1],
          },
          {
            key: 'SETTING_ORGANIZATION_TEMPLATE_MANAGEMENT_WORKFLOW', // 系统设置-模板管理-工作流
            locale: 'menu.settings.organization.templateManagementWorkFlow',
            route: RouteEnum.SETTING_ORGANIZATION_TEMPLATE_MANAGEMENT_WORKFLOW,
            permission: [],
            level: MENU_LEVEL[1],
          },
        ],
      },
    ],
  },
  {
    key: 'PROJECT_MANAGEMENT', // 项目管理
    locale: 'menu.projectManagement',
    route: RouteEnum.PROJECT_MANAGEMENT,
    permission: [],
    level: MENU_LEVEL[2],
    children: [
      {
        key: 'PROJECT_MANAGEMENT_PERMISSION', // 项目管理-项目与权限
        locale: 'menu.projectManagement.projectPermission',
        route: RouteEnum.PROJECT_MANAGEMENT_PERMISSION,
        permission: [],
        level: MENU_LEVEL[2],
        children: [
          {
            key: 'PROJECT_MANAGEMENT_PERMISSION_BASIC_INFO', // 项目管理-项目与权限-基本信息
            locale: 'project.permission.basicInfo',
            route: RouteEnum.PROJECT_MANAGEMENT_PERMISSION_BASIC_INFO,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'PROJECT_MANAGEMENT_PERMISSION_MENU_MANAGEMENT', // 项目管理-项目与权限-菜单管理
            locale: 'project.permission.menuManagement',
            route: RouteEnum.PROJECT_MANAGEMENT_PERMISSION_MENU_MANAGEMENT,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'PROJECT_MANAGEMENT_PERMISSION_VERSION', // 项目管理-项目与权限-项目版本
            locale: 'project.permission.projectVersion',
            route: RouteEnum.PROJECT_MANAGEMENT_PERMISSION_VERSION,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'PROJECT_MANAGEMENT_PERMISSION_MEMBER', // 项目管理-项目与权限-成员
            locale: 'project.permission.member',
            route: RouteEnum.PROJECT_MANAGEMENT_PERMISSION_MEMBER,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'PROJECT_MANAGEMENT_PERMISSION_USER_GROUP', // 项目管理-项目与权限-用户组
            locale: 'project.permission.userGroup',
            route: RouteEnum.PROJECT_MANAGEMENT_PERMISSION_USER_GROUP,
            permission: [],
            level: MENU_LEVEL[2],
          },
        ],
      },
      {
        key: 'PROJECT_MANAGEMENT_TEMPLATE', // 项目管理-模板管理
        locale: 'menu.settings.organization.template',
        route: RouteEnum.PROJECT_MANAGEMENT_TEMPLATE,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_TEMPLATE_FIELD_SETTING', // 项目管理-模板管理-字段设置
        locale: 'menu.settings.organization.templateFieldSetting',
        route: RouteEnum.PROJECT_MANAGEMENT_TEMPLATE_FIELD_SETTING,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_TEMPLATE_MANAGEMENT', // 项目管理-模板管理列表
        locale: 'menu.settings.organization.templateManagementList',
        route: RouteEnum.PROJECT_MANAGEMENT_TEMPLATE_MANAGEMENT,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_TEMPLATE_MANAGEMENT_DETAIL', // 项目管理-模板管理-详情
        locale: 'menu.settings.organization.templateManagementDetail',
        route: RouteEnum.PROJECT_MANAGEMENT_TEMPLATE_MANAGEMENT_DETAIL,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_TEMPLATE_MANAGEMENT_WORKFLOW', // 项目管理-模板管理-工作流
        locale: 'menu.settings.organization.templateManagementWorkFlow',
        route: RouteEnum.PROJECT_MANAGEMENT_TEMPLATE_MANAGEMENT_WORKFLOW,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_FILE_MANAGEMENT', // 项目管理-文件管理
        locale: 'menu.projectManagement.fileManagement',
        route: RouteEnum.PROJECT_MANAGEMENT_FILE_MANAGEMENT,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT', // 项目管理-消息管理
        locale: 'menu.projectManagement.messageManagement',
        route: RouteEnum.PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT,
        permission: [],
        level: MENU_LEVEL[2],
        children: [
          {
            key: 'PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT_CONFIG', // 项目管理-消息管理-消息设置
            locale: 'project.messageManagement.config',
            route: RouteEnum.PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT,
            permission: [],
            level: MENU_LEVEL[2],
          },
          {
            key: 'PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT_ROBOT', // 项目管理-消息管理-机器人列表
            locale: 'project.messageManagement.botList',
            route: RouteEnum.PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT,
            permission: [],
            routeQuery: {
              tab: 'botList',
            },
            level: MENU_LEVEL[2],
          },
        ],
      },
      {
        key: 'PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT_EDIT', // 项目管理-消息管理-编辑
        locale: 'menu.projectManagement.messageManagementEdit',
        route: RouteEnum.PROJECT_MANAGEMENT_MESSAGE_MANAGEMENT_EDIT,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_COMMON_SCRIPT', // 项目管理-公共脚本
        locale: 'menu.projectManagement.commonScript',
        route: RouteEnum.PROJECT_MANAGEMENT_COMMON_SCRIPT,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_LOG', // 项目管理-日志
        locale: 'menu.projectManagement.log',
        route: RouteEnum.PROJECT_MANAGEMENT_LOG,
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PROJECT_MANAGEMENT_ENVIRONMENT', // 项目管理-环境管理
        locale: 'menu.projectManagement.environmentManagement',
        route: RouteEnum.PROJECT_MANAGEMENT_ENVIRONMENT_MANAGEMENT,
        permission: [],
        level: MENU_LEVEL[2],
      },
    ],
  },
  // 测试计划
  {
    key: 'TEST_PLAN', // 测试计划
    locale: 'menu.testPlan',
    route: RouteEnum.TEST_PLAN,
    permission: [],
    level: MENU_LEVEL[2],
    children: [
      {
        key: 'TEST_PLAN_INDEX', // 测试计划-测试计划
        locale: 'menu.testPlan',
        route: RouteEnum.TEST_PLAN_INDEX,
        permission: [],
        level: MENU_LEVEL[2],
      },
    ],
  },
  {
    key: 'PERSONAL_INFORMATION', // 个人信息
    locale: 'ms.personal',
    route: '',
    permission: [],
    level: MENU_LEVEL[2],
    children: [
      {
        key: 'PERSONAL_INFORMATION_BASE_INFO', // 个人信息-基本信息
        locale: 'ms.personal.baseInfo',
        route: '',
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PERSONAL_INFORMATION_PSW', // 个人信息-密码设置
        locale: 'ms.personal.setPsw',
        route: '',
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PERSONAL_INFORMATION_APIKEYS', // 个人信息-ApiKeys
        locale: 'APIKEY',
        route: '',
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PERSONAL_INFORMATION_LOCAL_EXECUTE', // 个人信息-本地执行
        locale: 'ms.personal.localExecution',
        route: '',
        permission: [],
        level: MENU_LEVEL[2],
      },
      {
        key: 'PERSONAL_INFORMATION_TRIPARTITE', // 个人信息-三方平台账号
        locale: 'ms.personal.tripartite',
        route: '',
        permission: [],
        level: MENU_LEVEL[2],
      },
    ],
  },
];
