/**
 * 用户认证状态管理
 *
 * 使用 Zustand 管理用户登录状态，支持持久化存储。
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 用户信息类型
 */
export interface User {
    /** 用户 ID */
    id: string
    /** 用户名 */
    username: string
    /** 用户邮箱 */
    email: string
    /** 用户角色 */
    role: 'user' | 'approver' | 'admin' | 'superadmin'
    /** 用户头像 */
    avatar?: string
}

/**
 * 认证状态类型
 */
interface AuthState {
    /** 当前登录用户信息 */
    user: User | null
    /** JWT Token */
    token: string | null
    /** 是否已认证 */
    isAuthenticated: boolean
    /** 登录操作 */
    login: (user: User, token: string) => void
    /** 登出操作 */
    logout: () => void
    /** 更新用户信息 */
    updateUser: (user: Partial<User>) => void
}

/**
 * 认证状态 Store
 *
 * 使用 persist 中间件将状态持久化到 localStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            /**
             * 用户登录
             *
             * [user] 用户信息
             * [token] JWT Token
             */
            login: (user, token) => {
                localStorage.setItem('token', token)
                set({
                    user,
                    token,
                    isAuthenticated: true,
                })
            },

            /**
             * 用户登出
             */
            logout: () => {
                localStorage.removeItem('token')
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                })
            },

            /**
             * 更新用户信息
             *
             * [userData] 要更新的用户字段
             */
            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }))
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)
