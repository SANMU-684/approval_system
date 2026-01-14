package com.approval.service;

import com.approval.dto.LoginRequest;
import com.approval.dto.RegisterRequest;
import com.approval.vo.LoginResponse;

/**
 * 认证服务接口
 * 提供用户登录和注册功能
 */
public interface AuthService {

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应（包含 Token 和用户信息）
     */
    LoginResponse login(LoginRequest request);

    /**
     * 用户注册
     *
     * @param request 注册请求
     */
    void register(RegisterRequest request);
}
