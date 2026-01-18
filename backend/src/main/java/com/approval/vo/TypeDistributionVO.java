package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 审批类型分布VO
 * 用于展示审批类型饼图
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypeDistributionVO {

    /**
     * 类型名称
     */
    private String name;

    /**
     * 数量
     */
    private Integer value;

    /**
     * 颜色 (CSS颜色值)
     */
    private String color;
}
