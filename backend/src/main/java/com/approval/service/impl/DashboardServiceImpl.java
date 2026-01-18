package com.approval.service.impl;

import com.approval.entity.ApprovalNode;
import com.approval.entity.ApprovalRecord;
import com.approval.entity.ApprovalType;
import com.approval.entity.SysUser;
import com.approval.mapper.ApprovalNodeMapper;
import com.approval.mapper.ApprovalRecordMapper;
import com.approval.mapper.ApprovalTypeMapper;
import com.approval.mapper.SysUserMapper;
import com.approval.service.DashboardService;
import com.approval.vo.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 仪表盘服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final ApprovalRecordMapper approvalRecordMapper;
    private final ApprovalTypeMapper approvalTypeMapper;
    private final ApprovalNodeMapper approvalNodeMapper;
    private final SysUserMapper sysUserMapper;

    /**
     * 审批状态常量
     */
    private static final int STATUS_PENDING = 1;
    private static final int STATUS_IN_PROGRESS = 2;
    private static final int STATUS_APPROVED = 3;
    private static final int STATUS_REJECTED = 4;
    private static final int STATUS_WITHDRAWN = 5;

    @Override
    public DashboardStatisticsVO getStatistics(Long userId) {
        // 获取当前月份的起始时间
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 统计我发起的审批记录（按状态分类）
        LambdaQueryWrapper<ApprovalRecord> baseWrapper = new LambdaQueryWrapper<>();
        baseWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .ge(ApprovalRecord::getCreatedAt, monthStart)
                .le(ApprovalRecord::getCreatedAt, monthEnd);

        // 1. 待处理的审批（状态为待审批或审批中）
        LambdaQueryWrapper<ApprovalRecord> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .in(ApprovalRecord::getStatus, STATUS_PENDING, STATUS_IN_PROGRESS);
        int pendingCount = Math.toIntExact(approvalRecordMapper.selectCount(pendingWrapper));

        // 2. 已通过的审批
        LambdaQueryWrapper<ApprovalRecord> approvedWrapper = new LambdaQueryWrapper<>();
        approvedWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .eq(ApprovalRecord::getStatus, STATUS_APPROVED)
                .ge(ApprovalRecord::getCreatedAt, monthStart)
                .le(ApprovalRecord::getCreatedAt, monthEnd);
        int approvedCount = Math.toIntExact(approvalRecordMapper.selectCount(approvedWrapper));

        // 3. 已拒绝的审批
        LambdaQueryWrapper<ApprovalRecord> rejectedWrapper = new LambdaQueryWrapper<>();
        rejectedWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .eq(ApprovalRecord::getStatus, STATUS_REJECTED)
                .ge(ApprovalRecord::getCreatedAt, monthStart)
                .le(ApprovalRecord::getCreatedAt, monthEnd);
        int rejectedCount = Math.toIntExact(approvalRecordMapper.selectCount(rejectedWrapper));

        // 4. 本月发起的总数量
        int totalCount = Math.toIntExact(approvalRecordMapper.selectCount(baseWrapper));

        log.info("用户 {} 的仪表盘统计（我发起的）: 待处理={}, 已通过={}, 已拒绝={}, 本月总计={}",
                userId, pendingCount, approvedCount, rejectedCount, totalCount);

        return DashboardStatisticsVO.builder()
                .pending(pendingCount)
                .approved(approvedCount)
                .rejected(rejectedCount)
                .total(totalCount)
                .build();
    }

    @Override
    public List<RecentActivityVO> getRecentActivities(Long userId, int limit) {
        List<RecentActivityVO> activities = new ArrayList<>();

        // 限制 limit 在合理范围内，防止负数或过大值影响性能
        limit = Math.max(1, Math.min(limit, 100));

        // 查询我最近发起的审批
        LambdaQueryWrapper<ApprovalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .orderByDesc(ApprovalRecord::getCreatedAt)
                .last("LIMIT " + limit);
        List<ApprovalRecord> recentRecords = approvalRecordMapper.selectList(wrapper);

        for (ApprovalRecord record : recentRecords) {
            ApprovalType type = approvalTypeMapper.selectOne(
                    new LambdaQueryWrapper<ApprovalType>()
                            .eq(ApprovalType::getCode, record.getTypeCode()));

            String activityType = "created";
            LocalDateTime activityTime = record.getCreatedAt();

            // 根据审批状态确定活动类型和时间
            if (record.getStatus() == STATUS_APPROVED) {
                activityType = "approved";
                activityTime = record.getCompletedAt() != null ? record.getCompletedAt() : record.getUpdatedAt();
            } else if (record.getStatus() == STATUS_REJECTED) {
                activityType = "rejected";
                activityTime = record.getCompletedAt() != null ? record.getCompletedAt() : record.getUpdatedAt();
            } else if (record.getStatus() == STATUS_WITHDRAWN) {
                activityType = "withdrawn";
                activityTime = record.getUpdatedAt();
            }

            activities.add(RecentActivityVO.builder()
                    .approvalId(record.getId())
                    .activityType(activityType)
                    .title(record.getTitle())
                    .typeName(type != null ? type.getName() : record.getTypeCode())
                    .typeIcon(type != null ? type.getIcon() : null)
                    .typeColor(type != null ? type.getColor() : null)
                    .activityTime(activityTime)
                    .status(record.getStatus())
                    .relativeTime(calculateRelativeTime(activityTime))
                    .build());
        }

        // 按时间降序排列
        activities.sort(Comparator.comparing(RecentActivityVO::getActivityTime).reversed());

        return activities;
    }

    @Override
    public List<TrendDataVO> getTrendData(Long userId, int days) {
        // 限制天数范围
        days = Math.max(7, Math.min(days, 90));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        // 查询该时间范围内的所有审批记录
        LambdaQueryWrapper<ApprovalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(ApprovalRecord::getCreatedAt, startDateTime)
                .orderByAsc(ApprovalRecord::getCreatedAt);
        List<ApprovalRecord> records = approvalRecordMapper.selectList(wrapper);

        // 按日期分组统计
        Map<String, TrendDataVO> dateMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // 初始化所有日期
        for (int i = 0; i < days; i++) {
            String dateStr = startDate.plusDays(i).format(formatter);
            dateMap.put(dateStr, TrendDataVO.builder()
                    .date(dateStr)
                    .count(0)
                    .approved(0)
                    .rejected(0)
                    .build());
        }

        // 统计每日数据
        for (ApprovalRecord record : records) {
            String dateStr = record.getCreatedAt().toLocalDate().format(formatter);
            TrendDataVO trend = dateMap.get(dateStr);
            if (trend != null) {
                trend.setCount(trend.getCount() + 1);
                if (record.getStatus() == STATUS_APPROVED) {
                    trend.setApproved(trend.getApproved() + 1);
                } else if (record.getStatus() == STATUS_REJECTED) {
                    trend.setRejected(trend.getRejected() + 1);
                }
            }
        }

        return new ArrayList<>(dateMap.values());
    }

    @Override
    public List<TypeDistributionVO> getTypeDistribution(Long userId) {
        // 定义图表颜色
        String[] chartColors = {
                "hsl(var(--chart-1))",
                "hsl(var(--chart-2))",
                "hsl(var(--chart-3))",
                "hsl(var(--chart-4))",
                "hsl(var(--chart-5))"
        };

        // 查询所有审批记录并按类型分组
        List<ApprovalRecord> allRecords = approvalRecordMapper.selectList(null);
        Map<String, Long> typeCountMap = allRecords.stream()
                .collect(Collectors.groupingBy(ApprovalRecord::getTypeCode, Collectors.counting()));

        // 获取所有审批类型
        List<ApprovalType> allTypes = approvalTypeMapper.selectList(null);
        Map<String, ApprovalType> typeMap = allTypes.stream()
                .collect(Collectors.toMap(ApprovalType::getCode, t -> t));

        // 构建分布数据
        List<TypeDistributionVO> distribution = new ArrayList<>();
        int colorIndex = 0;

        for (Map.Entry<String, Long> entry : typeCountMap.entrySet()) {
            ApprovalType type = typeMap.get(entry.getKey());
            String typeName = type != null ? type.getName() : entry.getKey();
            String color = type != null && type.getColor() != null ? type.getColor()
                    : chartColors[colorIndex % chartColors.length];

            distribution.add(TypeDistributionVO.builder()
                    .name(typeName)
                    .value(entry.getValue().intValue())
                    .color(color)
                    .build());
            colorIndex++;
        }

        // 按数量降序排列
        distribution.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        return distribution;
    }

    @Override
    public EfficiencyMetricsVO getEfficiencyMetrics(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        LocalDateTime currentMonthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime currentMonthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        LocalDateTime lastMonthStart = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime lastMonthEnd = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        // 本月审批量
        LambdaQueryWrapper<ApprovalRecord> currentMonthWrapper = new LambdaQueryWrapper<>();
        currentMonthWrapper.ge(ApprovalRecord::getCreatedAt, currentMonthStart)
                .le(ApprovalRecord::getCreatedAt, currentMonthEnd);
        int monthlyCount = Math.toIntExact(approvalRecordMapper.selectCount(currentMonthWrapper));

        // 上月审批量
        LambdaQueryWrapper<ApprovalRecord> lastMonthWrapper = new LambdaQueryWrapper<>();
        lastMonthWrapper.ge(ApprovalRecord::getCreatedAt, lastMonthStart)
                .le(ApprovalRecord::getCreatedAt, lastMonthEnd);
        int lastMonthCount = Math.toIntExact(approvalRecordMapper.selectCount(lastMonthWrapper));

        // 计算环比变化
        double monthlyChange = 0.0;
        if (lastMonthCount > 0) {
            monthlyChange = ((double) (monthlyCount - lastMonthCount) / lastMonthCount) * 100;
        }

        // 计算审批通过率（全局）
        LambdaQueryWrapper<ApprovalRecord> approvedWrapper = new LambdaQueryWrapper<>();
        approvedWrapper.eq(ApprovalRecord::getStatus, STATUS_APPROVED);
        long approvedTotal = approvalRecordMapper.selectCount(approvedWrapper);

        LambdaQueryWrapper<ApprovalRecord> completedWrapper = new LambdaQueryWrapper<>();
        completedWrapper.in(ApprovalRecord::getStatus, STATUS_APPROVED, STATUS_REJECTED);
        long completedTotal = approvalRecordMapper.selectCount(completedWrapper);

        double approvalRate = completedTotal > 0 ? ((double) approvedTotal / completedTotal) * 100 : 0;

        // 计算平均处理时间（已完成的审批）
        List<ApprovalRecord> completedRecords = approvalRecordMapper.selectList(completedWrapper);
        double avgProcessTime = 0.0;
        if (!completedRecords.isEmpty()) {
            long totalHours = 0;
            int validCount = 0;
            for (ApprovalRecord record : completedRecords) {
                if (record.getCompletedAt() != null && record.getCreatedAt() != null) {
                    Duration duration = Duration.between(record.getCreatedAt(), record.getCompletedAt());
                    totalHours += duration.toHours();
                    validCount++;
                }
            }
            if (validCount > 0) {
                avgProcessTime = (double) totalHours / validCount;
            }
        }

        return EfficiencyMetricsVO.builder()
                .avgProcessTime(Math.round(avgProcessTime * 10) / 10.0)
                .monthlyCount(monthlyCount)
                .approvalRate(Math.round(approvalRate * 10) / 10.0)
                .monthlyChange(Math.round(monthlyChange * 10) / 10.0)
                .build();
    }

    @Override
    public List<TodoItemVO> getTodoList(Long userId, int limit) {
        limit = Math.max(1, Math.min(limit, 20));

        // 查询待当前用户审批的节点
        LambdaQueryWrapper<ApprovalNode> nodeWrapper = new LambdaQueryWrapper<>();
        nodeWrapper.eq(ApprovalNode::getApproverId, userId)
                .eq(ApprovalNode::getStatus, 0) // 0 = 待审批
                .orderByDesc(ApprovalNode::getCreatedAt)
                .last("LIMIT " + limit);
        List<ApprovalNode> pendingNodes = approvalNodeMapper.selectList(nodeWrapper);

        List<TodoItemVO> todoList = new ArrayList<>();

        for (ApprovalNode node : pendingNodes) {
            // 获取对应的审批记录
            ApprovalRecord record = approvalRecordMapper.selectById(node.getApprovalId());
            if (record == null || record.getStatus() > STATUS_IN_PROGRESS) {
                continue; // 跳过已完成的审批
            }

            // 获取发起人信息
            SysUser initiator = sysUserMapper.selectById(record.getInitiatorId());
            String applicantName = initiator != null ? initiator.getNickname() : "未知用户";
            if (applicantName == null || applicantName.isEmpty()) {
                applicantName = initiator != null ? initiator.getUsername() : "未知用户";
            }

            // 获取审批类型
            ApprovalType type = approvalTypeMapper.selectOne(
                    new LambdaQueryWrapper<ApprovalType>()
                            .eq(ApprovalType::getCode, record.getTypeCode()));
            String typeName = type != null ? type.getName() : record.getTypeCode();

            // 计算等待时间
            String waitingTime = calculateRelativeTime(record.getCreatedAt());

            // 转换优先级 (原: 0-普通 1-紧急 2-非常紧急 -> 目标: 1-高 2-中 3-低)
            int priority = switch (record.getPriority()) {
                case 2 -> 1; // 非常紧急 -> 高
                case 1 -> 1; // 紧急 -> 高
                default -> 2; // 普通 -> 中
            };

            todoList.add(TodoItemVO.builder()
                    .id(record.getId())
                    .title(record.getTitle())
                    .applicantName(applicantName)
                    .priority(priority)
                    .waitingTime(waitingTime)
                    .typeName(typeName)
                    .build());
        }

        return todoList;
    }

    @Override
    public List<TypeEfficiencyVO> getTypeEfficiency(Long userId) {
        // 1. 查询所有已完成的审批记录（我的）
        LambdaQueryWrapper<ApprovalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .in(ApprovalRecord::getStatus, STATUS_APPROVED, STATUS_REJECTED)
                .isNotNull(ApprovalRecord::getCompletedAt)
                .isNotNull(ApprovalRecord::getCreatedAt);
        List<ApprovalRecord> records = approvalRecordMapper.selectList(wrapper);

        // 2. 按类型分组计算平均时间 (使用秒以最大化精度)
        Map<String, List<Long>> typeDurationMap = new HashMap<>();

        for (ApprovalRecord record : records) {
            String typeCode = record.getTypeCode();
            Duration duration = Duration.between(record.getCreatedAt(), record.getCompletedAt());
            typeDurationMap.computeIfAbsent(typeCode, k -> new ArrayList<>()).add(duration.toSeconds());
        }

        // 3. 获取类型名称并构建结果
        List<TypeEfficiencyVO> result = new ArrayList<>();
        List<ApprovalType> allTypes = approvalTypeMapper.selectList(null);
        Map<String, String> typeNameMap = allTypes.stream()
                .collect(Collectors.toMap(ApprovalType::getCode, ApprovalType::getName));

        for (Map.Entry<String, List<Long>> entry : typeDurationMap.entrySet()) {
            String typeCode = entry.getKey();
            List<Long> durations = entry.getValue();

            // 计算平均秒数
            double avgSeconds = durations.stream()
                    .mapToLong(Long::longValue)
                    .average()
                    .orElse(0.0);

            // 转换为小时，保留两位小数
            double avgHours = avgSeconds / 3600.0;

            result.add(TypeEfficiencyVO.builder()
                    .typeName(typeNameMap.getOrDefault(typeCode, typeCode))
                    .avgProcessTime(Math.round(avgHours * 100) / 100.0)
                    .build());
        }

        // 按时间降序排列
        result.sort((a, b) -> b.getAvgProcessTime().compareTo(a.getAvgProcessTime()));
        return result;
    }

    @Override
    public List<DailySubmissionVO> getSubmissionHeatmap(Long userId) {
        // 1. 获取过去一年的日期范围
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(1);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        // 2. 查询每日提交数量
        LambdaQueryWrapper<ApprovalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .ge(ApprovalRecord::getCreatedAt, startDateTime);
        List<ApprovalRecord> records = approvalRecordMapper.selectList(wrapper);

        // 3. 统计每日数量
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Integer> dateCountMap = new HashMap<>();

        for (ApprovalRecord record : records) {
            String date = record.getCreatedAt().toLocalDate().format(formatter);
            dateCountMap.merge(date, 1, Integer::sum);
        }

        // 4. 构建结果并计算热度等级
        List<DailySubmissionVO> result = new ArrayList<>();
        // 找出最大值以计算相对热度
        int maxCount = dateCountMap.values().stream().max(Integer::compareTo).orElse(1);

        // 生成每一天的数据（包括零提交的日期，或者只返回有数据的日期由前端补全？通常热力图库需要完整数据或能处理缺失）
        // 这里只返回有数据的日期，前端日历库通常能处理
        for (Map.Entry<String, Integer> entry : dateCountMap.entrySet()) {
            int count = entry.getValue();
            // 简单的等级计算：根据最大值分5档 (0-4)
            int level;
            if (count == 0)
                level = 0;
            else if (count <= maxCount * 0.25)
                level = 1;
            else if (count <= maxCount * 0.5)
                level = 2;
            else if (count <= maxCount * 0.75)
                level = 3;
            else
                level = 4;

            result.add(DailySubmissionVO.builder()
                    .date(entry.getKey())
                    .count(count)
                    .level(level)
                    .build());
        }

        return result;
    }

    /**
     * 计算相对时间
     */
    private String calculateRelativeTime(LocalDateTime time) {
        if (time == null) {
            return "未知";
        }
        Duration duration = Duration.between(time, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1) {
            return "刚刚";
        } else if (minutes < 60) {
            return minutes + "分钟前";
        } else if (hours < 24) {
            return hours + "小时前";
        } else if (days < 30) {
            return days + "天前";
        } else {
            return (days / 30) + "个月前";
        }
    }
}
