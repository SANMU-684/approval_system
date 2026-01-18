package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 每日提交统计 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySubmissionVO {
    /**
     * 日期 (YYYY-MM-DD)
     */
    private String date;

    /**
     * 提交数量
     */
    private Integer count;

    /**
     * 活跃度等级 (0-4)
     */
    private Integer level;
}
