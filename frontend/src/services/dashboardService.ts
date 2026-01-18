import api from './api'

/**
 * 仪表盘统计数据类型
 */
export interface DashboardStatistics {
    /** 待处理审批数量 */
    pending: number
    /** 已通过审批数量 */
    approved: number
    /** 已拒绝审批数量 */
    rejected: number
    /** 总审批数量 */
    total: number
}

/**
 * 最近活动类型
 */
export interface RecentActivity {
    /** 审批ID */
    approvalId: string
    /** 活动类型 */
    activityType: 'created' | 'approved' | 'rejected' | 'withdrawn'
    /** 审批标题 */
    title: string
    /** 审批类型名称 */
    typeName: string
    /** 审批类型图标 */
    typeIcon?: string
    /** 审批类型颜色 */
    typeColor?: string
    /** 活动时间 */
    activityTime: string
    /** 状态码 */
    status: number
    /** 相对时间描述 */
    relativeTime: string
}

/**
 * 趋势数据点类型
 */
export interface TrendDataPoint {
    /** 日期 (YYYY-MM-DD) */
    date: string
    /** 审批数量 */
    count: number
    /** 通过数量 */
    approved: number
    /** 拒绝数量 */
    rejected: number
}

/**
 * 审批类型分布类型
 */
export interface TypeDistribution {
    /** 类型名称 */
    name: string
    /** 数量 */
    value: number
    /** 颜色 */
    color: string
}

/**
 * 效率指标类型
 */
export interface EfficiencyMetrics {
    /** 平均处理时间（小时） */
    avgProcessTime: number
    /** 本月审批量 */
    monthlyCount: number
    /** 审批通过率（百分比） */
    approvalRate: number
    /** 相比上月变化百分比 */
    monthlyChange: number
}

/**
 * 待办事项类型
 */
export interface TodoItem {
    /** 审批ID */
    id: string
    /** 标题 */
    title: string
    /** 发起人姓名 */
    applicantName: string
    /** 发起人头像 */
    applicantAvatar?: string
    /** 优先级 (1-高, 2-中, 3-低) */
    priority: 1 | 2 | 3
    /** 等待时间描述 */
    waitingTime: string
    /** 审批类型 */
    typeName: string
}

/**
 * 审批类型效率类型
 */
export interface TypeEfficiency {
    /** 类型名称 */
    typeName: string
    /** 平均处理时间（小时） */
    avgProcessTime: number
}

/**
 * 每日提交统计类型
 */
export interface DailySubmission {
    /** 日期 (YYYY-MM-DD) */
    date: string
    /** 提交数量 */
    count: number
    /** 活跃度等级 (0-4) */
    level: number
}

/**
 * 仪表盘服务
 */
const dashboardService = {
    /**
     * 获取仪表盘统计数据
     * 
     * @returns 统计数据
     */
    getStatistics: async (): Promise<DashboardStatistics> => {
        const response = await api.get<{ data: DashboardStatistics }>('/dashboard/statistics')
        return response.data.data
    },

    /**
     * 获取最近活动记录
     * 
     * @param limit 返回数量限制
     * @returns 最近活动列表
     */
    getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
        const response = await api.get<{ data: RecentActivity[] }>('/dashboard/recent-activities', {
            params: { limit }
        })
        return response.data.data
    },

    /**
     * 获取趋势数据
     * 
     * [days] 天数，默认30天
     * 返回：趋势数据数组
     */
    getTrendData: async (days: number = 30): Promise<TrendDataPoint[]> => {
        const response = await api.get<{ data: TrendDataPoint[] }>('/dashboard/trend', {
            params: { days }
        })
        return response.data.data
    },

    /**
     * 获取审批类型分布
     * 
     * 返回：类型分布数组
     */
    getTypeDistribution: async (): Promise<TypeDistribution[]> => {
        const response = await api.get<{ data: TypeDistribution[] }>('/dashboard/type-distribution')
        return response.data.data
    },

    /**
     * 获取效率指标
     * 
     * 返回：效率指标对象
     */
    getEfficiencyMetrics: async (): Promise<EfficiencyMetrics> => {
        const response = await api.get<{ data: EfficiencyMetrics }>('/dashboard/efficiency')
        return response.data.data
    },

    /**
     * 获取待办事项列表
     * 
     * [limit] 返回数量限制
     * 返回：待办事项数组
     */
    getTodoList: async (limit: number = 5): Promise<TodoItem[]> => {
        const response = await api.get<{ data: TodoItem[] }>('/dashboard/todos', {
            params: { limit }
        })
        return response.data.data
    },

    /**
     * 获取审批类型效率分析
     * 
     * 返回：效率分析数组
     */
    getTypeEfficiency: async (): Promise<TypeEfficiency[]> => {
        const response = await api.get<{ data: TypeEfficiency[] }>('/dashboard/efficiency/breakdown')
        return response.data.data
    },

    /**
     * 获取提交热力图数据
     * 
     * 返回：每日提交数组
     */
    getSubmissionHeatmap: async (): Promise<DailySubmission[]> => {
        const response = await api.get<{ data: DailySubmission[] }>('/dashboard/activities/heatmap')
        return response.data.data
    },
}

export default dashboardService

