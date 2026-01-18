package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 趋势数据点VO
 * 用于展示审批趋势图表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendDataVO {

    /**
     * 日期 (YYYY-MM-DD格式)
     */
    private String date;

    /**
     * 当日审批总数
     */
    private Integer count;

    /**
     * 已通过数量
     */
    private Integer approved;

    /**
     * 已拒绝数量
     */
    private Integer rejected;
}
