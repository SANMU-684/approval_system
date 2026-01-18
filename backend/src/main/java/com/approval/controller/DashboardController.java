package com.approval.controller;

import com.approval.common.Result;
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.DashboardService;
import com.approval.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 仪表盘控制器
 * 提供仪表盘统计数据接口
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    /**
     * 获取仪表盘统计数据
     * 根据当前用户返回对应的统计信息
     *
     * @param token JWT Token
     * @return 统计数据
     */
    @GetMapping("/statistics")
    public Result<DashboardStatisticsVO> getStatistics(@RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        DashboardStatisticsVO statistics = dashboardService.getStatistics(userId);
        return Result.success(statistics);
    }

    /**
     * 获取最近活动记录
     *
     * @param token JWT Token
     * @param limit 返回数量限制
     * @return 最近活动列表
     */
    @GetMapping("/recent-activities")
    public Result<List<RecentActivityVO>> getRecentActivities(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "10") int limit) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        List<RecentActivityVO> activities = dashboardService.getRecentActivities(userId, limit);
        return Result.success(activities);
    }

    /**
     * 获取审批趋势数据
     *
     * @param token JWT Token
     * @param days  天数（默认30天）
     * @return 趋势数据列表
     */
    @GetMapping("/trend")
    public Result<List<TrendDataVO>> getTrendData(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "30") int days) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        List<TrendDataVO> trendData = dashboardService.getTrendData(userId, days);
        return Result.success(trendData);
    }

    /**
     * 获取审批类型分布
     *
     * @param token JWT Token
     * @return 类型分布列表
     */
    @GetMapping("/type-distribution")
    public Result<List<TypeDistributionVO>> getTypeDistribution(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        List<TypeDistributionVO> distribution = dashboardService.getTypeDistribution(userId);
        return Result.success(distribution);
    }

    /**
     * 获取效率指标
     *
     * @param token JWT Token
     * @return 效率指标
     */
    @GetMapping("/efficiency")
    public Result<EfficiencyMetricsVO> getEfficiencyMetrics(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        EfficiencyMetricsVO metrics = dashboardService.getEfficiencyMetrics(userId);
        return Result.success(metrics);
    }

    /**
     * 获取待办事项列表
     *
     * @param token JWT Token
     * @param limit 返回数量限制
     * @return 待办事项列表
     */
    @GetMapping("/todos")
    public Result<List<TodoItemVO>> getTodoList(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "5") int limit) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        List<TodoItemVO> todos = dashboardService.getTodoList(userId, limit);
        return Result.success(todos);
    }

    /**
     * 获取审批类型效率分析
     *
     * @param token JWT Token
     * @return 效率分析列表
     */
    @GetMapping("/efficiency/breakdown")
    public Result<List<TypeEfficiencyVO>> getTypeEfficiency(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        List<TypeEfficiencyVO> breakdown = dashboardService.getTypeEfficiency(userId);
        return Result.success(breakdown);
    }

    /**
     * 获取提交热力图数据
     *
     * @param token JWT Token
     * @return 每日提交列表
     */
    @GetMapping("/activities/heatmap")
    public Result<List<DailySubmissionVO>> getSubmissionHeatmap(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        List<DailySubmissionVO> heatmap = dashboardService.getSubmissionHeatmap(userId);
        return Result.success(heatmap);
    }
}
