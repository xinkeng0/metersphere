package io.metersphere.project.service;

import io.metersphere.project.constants.ProjectMenuConstants;
import io.metersphere.project.domain.*;
import io.metersphere.project.dto.ProjectRequest;
import io.metersphere.project.mapper.ExtProjectMapper;
import io.metersphere.project.mapper.ProjectMapper;
import io.metersphere.project.mapper.ProjectTestResourcePoolMapper;
import io.metersphere.project.mapper.ProjectVersionMapper;
import io.metersphere.project.request.ProjectSwitchRequest;
import io.metersphere.sdk.constants.ApplicationScope;
import io.metersphere.sdk.constants.InternalUserRole;
import io.metersphere.sdk.exception.MSException;
import io.metersphere.sdk.util.BeanUtils;
import io.metersphere.sdk.util.CommonBeanFactory;
import io.metersphere.sdk.util.Translator;
import io.metersphere.system.domain.TestResourcePool;
import io.metersphere.system.domain.TestResourcePoolExample;
import io.metersphere.system.domain.User;
import io.metersphere.system.domain.UserRoleRelationExample;
import io.metersphere.system.dto.ProjectDTO;
import io.metersphere.system.dto.sdk.OptionDTO;
import io.metersphere.system.dto.sdk.SessionUser;
import io.metersphere.system.dto.user.UserDTO;
import io.metersphere.system.dto.user.UserExtendDTO;
import io.metersphere.system.mapper.*;
import io.metersphere.system.service.CommonProjectService;
import io.metersphere.system.service.UserLoginService;
import io.metersphere.system.utils.ServiceUtils;
import io.metersphere.system.utils.SessionUtils;
import jakarta.annotation.Resource;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

@Service
@Transactional(rollbackFor = Exception.class)
public class ProjectService {
    @Resource
    private ProjectMapper projectMapper;
    @Resource
    private ProjectVersionMapper projectVersionMapper;
    @Resource
    private UserRoleRelationMapper userRoleRelationMapper;
    @Resource
    private ExtProjectMapper extProjectMapper;
    @Resource
    private UserLoginService userLoginService;
    @Resource
    private OrganizationMapper organizationMapper;
    @Resource
    private CommonProjectService commonProjectService;
    @Resource
    private TestResourcePoolMapper testResourcePoolMapper;
    @Resource
    private ProjectTestResourcePoolMapper projectTestResourcePoolMapper;
    @Resource
    private ExtSystemProjectMapper extSystemProjectMapper;
    @Resource
    private BaseUserMapper baseUserMapper;

    public static final Long ORDER_STEP = 5000L;


    public List<Project> getUserProject(String organizationId, String userId) {
        checkOrg(organizationId);
        //查询用户当前的项目  如果存在默认排在第一个
        User user = baseUserMapper.selectById(userId);
        String projectId;
        if (user != null && StringUtils.isNotBlank(user.getLastProjectId())) {
            projectId = user.getLastProjectId();
        } else {
            projectId = null;
        }
        //判断用户是否是系统管理员
        List<Project> allProject = new ArrayList<>();
        UserRoleRelationExample userRoleRelationExample = new UserRoleRelationExample();
        userRoleRelationExample.createCriteria().andUserIdEqualTo(userId).andRoleIdEqualTo(InternalUserRole.ADMIN.name());
        if (userRoleRelationMapper.countByExample(userRoleRelationExample) > 0) {
            allProject = extProjectMapper.getAllProject(organizationId);
        } else {
            allProject = extProjectMapper.getUserProject(organizationId, userId);
        }
        List<Project> temp = allProject;
        return allProject.stream()
                .filter(project -> StringUtils.equals(project.getId(), projectId))
                .findFirst()
                .map(project -> {
                    temp.remove(project);
                    temp.add(0, project);
                    return temp;
                })
                .orElse(allProject);
    }

    private void checkOrg(String organizationId) {
        if (organizationMapper.selectByPrimaryKey(organizationId) == null) {
            throw new MSException(Translator.get("organization_not_exist"));
        }
    }

    public UserDTO switchProject(ProjectSwitchRequest request, String currentUserId) {
        if (!StringUtils.equals(currentUserId, request.getUserId())) {
            throw new MSException(Translator.get("not_authorized"));
        }
        if (projectMapper.selectByPrimaryKey(request.getProjectId()) == null) {
            throw new MSException(Translator.get("project_not_exist"));
        }

        User user = new User();
        user.setId(request.getUserId());
        user.setLastProjectId(request.getProjectId());
        userLoginService.updateUser(user);
        UserDTO userDTO = userLoginService.getUserDTO(user.getId());
        SessionUser sessionUser = SessionUser.fromUser(userDTO, SessionUtils.getSessionId());
        SessionUtils.putUser(sessionUser);
        return sessionUser;
    }

    public ProjectDTO getProjectById(String id) {
        return commonProjectService.get(id);
    }

    public ProjectDTO update(ProjectRequest updateProjectDto, String updateUser) {
        Project project = new Project();
        ProjectDTO projectDTO = new ProjectDTO();
        project.setId(updateProjectDto.getId());
        project.setName(updateProjectDto.getName());
        project.setDescription(updateProjectDto.getDescription());
        project.setOrganizationId(updateProjectDto.getOrganizationId());
        project.setEnable(updateProjectDto.getEnable());
        project.setUpdateUser(updateUser);
        project.setCreateUser(null);
        project.setCreateTime(null);
        project.setUpdateTime(System.currentTimeMillis());
        checkProjectExistByName(project);
        checkProjectNotExist(project.getId());
        projectDTO.setOrganizationName(organizationMapper.selectByPrimaryKey(updateProjectDto.getOrganizationId()).getName());
        BeanUtils.copyBean(projectDTO, project);

        projectMapper.updateByPrimaryKeySelective(project);
        return projectDTO;
    }

    private void checkProjectExistByName(Project project) {
        ProjectExample example = new ProjectExample();
        example.createCriteria().andNameEqualTo(project.getName()).andOrganizationIdEqualTo(project.getOrganizationId()).andIdNotEqualTo(project.getId());
        if (projectMapper.countByExample(example) > 0) {
            throw new MSException(Translator.get("project_name_already_exists"));
        }
    }

    public Project checkProjectNotExist(String id) {
        Project project = projectMapper.selectByPrimaryKey(id);
        if (project == null) {
            throw new MSException(Translator.get("project_is_not_exist"));
        }
        return project;
    }

    private List<String> getPoolIds(String projectId) {
        ProjectTestResourcePoolExample example = new ProjectTestResourcePoolExample();
        example.createCriteria().andProjectIdEqualTo(projectId);
        List<ProjectTestResourcePool> projectPools = projectTestResourcePoolMapper.selectByExample(example);
        return projectPools.stream().map(ProjectTestResourcePool::getTestResourcePoolId).toList();
    }

    public List<OptionDTO> getPoolOptions(String projectId, String type) {
        checkProjectNotExist(projectId);
        List<String> poolIds = getPoolIds(projectId);
        if (CollectionUtils.isEmpty(poolIds)) {
            return new ArrayList<>();
        }
        TestResourcePoolExample example = new TestResourcePoolExample();
        TestResourcePoolExample.Criteria criteria = example.createCriteria();
        criteria.andIdIn(poolIds).andEnableEqualTo(true).andDeletedEqualTo(false);
        List<TestResourcePool> testResourcePools = new ArrayList<>();
        testResourcePools = switch (type) {
            case ApplicationScope.API_TEST -> {
                criteria.andApiTestEqualTo(true);
                yield testResourcePoolMapper.selectByExample(example);
            }
            default -> new ArrayList<>();
        };
        return testResourcePools.stream().map(testResourcePool ->
                new OptionDTO(testResourcePool.getId(), testResourcePool.getName())
        ).toList();
    }

    public static Project checkResourceExist(String id) {
        return ServiceUtils.checkResourceExist(Objects.requireNonNull(CommonBeanFactory.getBean(ProjectMapper.class)).selectByPrimaryKey(id), "permission.project.name");
    }

    /**
     * 获取指定项目的最新版本
     *
     * @param projectId 项目ID
     * @return 最新版本
     */
    public ProjectVersion getLatestVersion(String projectId) {
        ProjectVersionExample projectVersionExample = new ProjectVersionExample();
        projectVersionExample.createCriteria().andProjectIdEqualTo(projectId);
        return projectVersionMapper.selectByExample(projectVersionExample).getFirst();
    }

    public Long getNextOrder(Function<String, Long> getLastPosFunc, String projectId) {
        Long pos = getLastPosFunc.apply(projectId);
        return (pos == null ? 0 : pos) + ORDER_STEP;
    }

    public boolean hasPermission(String id, String userId) {
        boolean hasPermission = true;
        //判断用户是否是系统管理员
        UserRoleRelationExample userRoleRelationExample = new UserRoleRelationExample();
        userRoleRelationExample.createCriteria().andUserIdEqualTo(userId).andRoleIdEqualTo(InternalUserRole.ADMIN.name());
        if (userRoleRelationMapper.countByExample(userRoleRelationExample) > 0) {
            return hasPermission;
        }
        ProjectExample example = new ProjectExample();
        example.createCriteria().andIdEqualTo(id).andEnableEqualTo(true);
        if (CollectionUtils.isEmpty(projectMapper.selectByExample(example))) {
            return false;
        }
        userRoleRelationExample = new UserRoleRelationExample();
        userRoleRelationExample.createCriteria().andUserIdEqualTo(userId).andSourceIdEqualTo(id);
        if (CollectionUtils.isEmpty(userRoleRelationMapper.selectByExample(userRoleRelationExample))) {
            return false;
        }
        return hasPermission;
    }

    public List<UserExtendDTO> getMemberOption(String projectId, String keyword) {
        Project project = projectMapper.selectByPrimaryKey(projectId);
        if (project == null) {
            return new ArrayList<>();
        }
        return extSystemProjectMapper.getMemberByProjectId(projectId, keyword);
    }

    public List<Project> getUserProjectWidthModule(String organizationId, String module, String userId) {
        if (StringUtils.isBlank(module)) {
            throw new MSException(Translator.get("module.name.is.empty"));
        }
        String moduleName = null;
        if (StringUtils.equalsIgnoreCase(module, "API") || StringUtils.equalsIgnoreCase(module, "SCENARIO")) {
            moduleName = ProjectMenuConstants.MODULE_MENU_API_TEST;
        }
        if (StringUtils.equalsIgnoreCase(module, "FUNCTIONAL")) {
            moduleName = ProjectMenuConstants.MODULE_MENU_FUNCTIONAL_CASE;
        }
        if (StringUtils.equalsIgnoreCase(module, "BUG")) {
            moduleName = ProjectMenuConstants.MODULE_MENU_BUG;
        }
        if (StringUtils.equalsIgnoreCase(module, "PERFORMANCE")) {
            moduleName = ProjectMenuConstants.MODULE_MENU_LOAD_TEST;
        }
        if (StringUtils.equalsIgnoreCase(module, "UI")) {
            moduleName = ProjectMenuConstants.MODULE_MENU_UI;
        }
        if (StringUtils.equalsIgnoreCase(module, "TEST_PLAN")) {
            moduleName = ProjectMenuConstants.MODULE_MENU_TEST_PLAN;
        }
        if (StringUtils.isBlank(moduleName)) {
            throw new MSException(Translator.get("module.name.is.error"));
        }
        checkOrg(organizationId);
        //查询用户当前的项目  如果存在默认排在第一个
        User user = baseUserMapper.selectById(userId);
        String projectId;
        if (user != null && StringUtils.isNotBlank(user.getLastProjectId())) {
            projectId = user.getLastProjectId();
        } else {
            projectId = null;
        }
        //判断用户是否是系统管理员
        List<Project> allProject;
        UserRoleRelationExample userRoleRelationExample = new UserRoleRelationExample();
        userRoleRelationExample.createCriteria().andUserIdEqualTo(userId).andRoleIdEqualTo(InternalUserRole.ADMIN.name());
        if (userRoleRelationMapper.countByExample(userRoleRelationExample) > 0) {
            allProject = extProjectMapper.getAllProjectWidthModule(organizationId, moduleName);
        } else {
            allProject = extProjectMapper.getUserProjectWidthModule(organizationId, userId, moduleName);
        }
        List<Project> temp = allProject;
        return allProject.stream()
                .filter(project -> StringUtils.equals(project.getId(), projectId))
                .findFirst()
                .map(project -> {
                    temp.remove(project);
                    temp.add(0, project);
                    return temp;
                })
                .orElse(allProject);

    }
}

