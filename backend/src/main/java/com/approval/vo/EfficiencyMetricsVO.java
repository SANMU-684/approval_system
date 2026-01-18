package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 效率指标VO
 * 用于展示审批处理效率相关指标
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EfficiencyMetricsVO {

    /**
     * 平均处理时间（小时）
     */
    private Double avgProcessTime;

    /**
     * 本月审批量
     */
    private Integer monthlyCount;

    /**
     * 审批通过率（百分比）
     */
    private Double approvalRate;

    /**
     * 相比上月变化百分比
     */
    private Double monthlyChange;
}
