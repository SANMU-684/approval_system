package com.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户查询DTO
 * 用于分页查询用户列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQueryDTO {

    /**
     * 搜索关键词（用户名/昵称/邮箱）
     */
    private String keyword;

    /**
     * 部门ID筛选
     */
    private Long departmentId;

    /**
     * 状态筛选
     */
    private Integer status;

    /**
     * 当前页码（从1开始）
     */
    @lombok.Builder.Default
    private Integer page = 1;

    /**
     * 每页条数
     */
    @lombok.Builder.Default
    private Integer pageSize = 10;
}
