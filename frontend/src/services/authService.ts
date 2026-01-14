/**
 * 认证服务模块
 *
 * 封装登录、注册等认证相关的 API 调用。
 */

import api from './api'

/**
 * 用户信息接口
 */
export interface UserInfo {
    /** 用户ID */
    id: number
    /** 用户名 */
    username: string
    /** 昵称 */
    nickname: string
    /** 邮箱 */
    email?: string
    /** 头像 */
    avatar?: string
    /** 角色列表 */
    roles: string[]
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
    /** JWT Token */
    token: string
    /** Token 类型 */
    tokenType: string
    /** 用户信息 */
    user: UserInfo
}

/**
 * 登录请求参数
 */
export interface LoginParams {
    /** 用户名 */
    username: string
    /** 密码 */
    password: string
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
    /** 用户名 */
    username: string
    /** 密码 */
    password: string
    /** 昵称 */
    nickname: string
    /** 邮箱 */
    email?: string
}

/**
 * API 响应通用结构
 */
interface ApiResponse<T> {
    code: number
    message: string
    data: T
    timestamp: number
}

/**
 * 用户登录
 *
 * [params] 登录参数
 * 返回：登录响应数据
 * 抛出：包含服务端错误消息的 Error
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
    try {
        const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', params)
        return response.data.data
    } catch (error) {
        // 尝试从响应中提取错误消息
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || '登录失败，请检查用户名和密码'
        throw new Error(message)
    }
}

/**
 * 用户注册
 *
 * [params] 注册参数
 */
export async function register(params: RegisterParams): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/register', params)
}

/**
 * 导出认证服务
 */
const authService = {
    login,
    register,
}

export default authService
