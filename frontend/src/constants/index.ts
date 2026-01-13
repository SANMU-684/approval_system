/**
 * 常量定义
 *
 * 定义应用中使用的常量值
 */

/**
 * 审批状态枚举
 */
export const APPROVAL_STATUS = {
    /** 草稿 */
    DRAFT: 'draft',
    /** 待审批 */
    PENDING: 'pending',
    /** 审批中 */
    IN_PROGRESS: 'in_progress',
    /** 已通过 */
    APPROVED: 'approved',
    /** 已拒绝 */
    REJECTED: 'rejected',
    /** 已撤回 */
    WITHDRAWN: 'withdrawn',
} as const

/**
 * 审批状态显示文本
 */
export const APPROVAL_STATUS_TEXT: Record<string, string> = {
    [APPROVAL_STATUS.DRAFT]: '草稿',
    [APPROVAL_STATUS.PENDING]: '待审批',
    [APPROVAL_STATUS.IN_PROGRESS]: '审批中',
    [APPROVAL_STATUS.APPROVED]: '已通过',
    [APPROVAL_STATUS.REJECTED]: '已拒绝',
    [APPROVAL_STATUS.WITHDRAWN]: '已撤回',
}

/**
 * 用户角色枚举
 */
export const USER_ROLES = {
    /** 普通用户 */
    USER: 'user',
    /** 审批人 */
    APPROVER: 'approver',
    /** 管理员 */
    ADMIN: 'admin',
    /** 超级管理员 */
    SUPERADMIN: 'superadmin',
} as const

/**
 * 用户角色显示文本
 */
export const USER_ROLE_TEXT: Record<string, string> = {
    [USER_ROLES.USER]: '普通用户',
    [USER_ROLES.APPROVER]: '审批人',
    [USER_ROLES.ADMIN]: '管理员',
    [USER_ROLES.SUPERADMIN]: '超级管理员',
}

/**
 * 分页默认值
 */
export const PAGINATION = {
    /** 默认页码 */
    DEFAULT_PAGE: 1,
    /** 默认每页条数 */
    DEFAULT_PAGE_SIZE: 10,
    /** 每页条数选项 */
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const
