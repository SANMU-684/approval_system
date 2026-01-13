/**
 * API 服务层 - Axios 封装
 *
 * 该模块封装了 Axios HTTP 客户端，提供统一的请求/响应拦截器，
 * 自动处理 Token 认证和错误响应。
 */

import axios from 'axios'

// 创建 Axios 实例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * 请求拦截器
 * 在每个请求发送前自动添加 Authorization 头
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
api.interceptors.response.use(
    (response) => {
        // 直接返回 data 中的 data 字段
        return response.data.data
    },
    (error) => {
        // 处理 401 未授权错误
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        // 提取错误信息
        const message = error.response?.data?.message || error.message || '请求失败'
        console.error('API 请求错误:', message)

        return Promise.reject(error)
    }
)

export default api
