package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 待办事项VO
 * 用于展示待审批的事项列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoItemVO {

    /**
     * 审批ID
     */
    private String id;

    /**
     * 审批标题
     */
    private String title;

    /**
     * 发起人姓名
     */
    private String applicantName;

    /**
     * 优先级 (1-高/紧急, 2-中/普通, 3-低)
     */
    private Integer priority;

    /**
     * 等待时间描述
     */
    private String waitingTime;

    /**
     * 审批类型名称
     */
    private String typeName;
}
