package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 审批类型效率 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypeEfficiencyVO {
    /**
     * 审批类型名称
     */
    private String typeName;

    /**
     * 平均处理时间（小时）
     */
    private Double avgProcessTime;
}
