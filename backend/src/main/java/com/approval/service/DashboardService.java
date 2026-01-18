package com.approval.service;

import com.approval.vo.DashboardStatisticsVO;
import com.approval.vo.EfficiencyMetricsVO;
import com.approval.vo.RecentActivityVO;
import com.approval.vo.TodoItemVO;
import com.approval.vo.TrendDataVO;
import com.approval.vo.TypeDistributionVO;
import com.approval.vo.TypeEfficiencyVO;
import com.approval.vo.DailySubmissionVO;

import java.util.List;

/**
 * 仪表盘服务接口
 */
public interface DashboardService {

    /**
     * 获取用户的仪表盘统计数据
     *
     * @param userId 用户ID
     * @return 统计数据
     */
    DashboardStatisticsVO getStatistics(Long userId);

    /**
     * 获取用户的最近活动记录
     *
     * @param userId 用户ID
     * @param limit  返回数量限制
     * @return 最近活动列表
     */
    List<RecentActivityVO> getRecentActivities(Long userId, int limit);

    /**
     * 获取审批趋势数据
     *
     * @param userId 用户ID
     * @param days   天数
     * @return 趋势数据列表
     */
    List<TrendDataVO> getTrendData(Long userId, int days);

    /**
     * 获取审批类型分布
     *
     * @param userId 用户ID
     * @return 类型分布列表
     */
    List<TypeDistributionVO> getTypeDistribution(Long userId);

    /**
     * 获取效率指标
     *
     * @param userId 用户ID
     * @return 效率指标
     */
    EfficiencyMetricsVO getEfficiencyMetrics(Long userId);

    /**
     * 获取待办事项列表
     *
     * @param userId 用户ID
     * @param limit  返回数量限制
     * @return 待办事项列表
     */
    List<TodoItemVO> getTodoList(Long userId, int limit);

    /**
     * 获取审批类型效率分析
     *
     * @param userId 用户ID
     * @return 效率分析列表
     */
    List<TypeEfficiencyVO> getTypeEfficiency(Long userId);

    /**
     * 获取提交热力图数据
     *
     * @param userId 用户ID
     * @return 每日提交列表
     */
    List<DailySubmissionVO> getSubmissionHeatmap(Long userId);
}
