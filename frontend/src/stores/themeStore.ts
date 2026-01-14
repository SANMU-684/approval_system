/**
 * 主题状态管理
 *
 * 管理应用的明暗主题切换，支持 View Transition API 实现圆环扩散动画。
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 主题类型 */
type Theme = 'light' | 'dark'

/** 主题 Store 状态接口 */
interface ThemeState {
    /** 当前主题 */
    theme: Theme
    /**
     * 切换主题
     *
     * [x] 点击事件的 x 坐标，用于动画起点
     * [y] 点击事件的 y 坐标，用于动画起点
     */
    toggleTheme: (x?: number, y?: number) => void
    /**
     * 设置主题
     *
     * [theme] 要设置的主题
     */
    setTheme: (theme: Theme) => void
}

/**
 * 应用主题到 DOM
 *
 * [theme] 要应用的主题
 */
const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    if (theme === 'dark') {
        root.classList.add('dark')
    } else {
        root.classList.remove('dark')
    }
}

/**
 * 使用 View Transition API 执行主题切换动画
 *
 * [x] 动画起点 x 坐标
 * [y] 动画起点 y 坐标
 * [callback] 切换主题的回调函数
 */
const toggleWithAnimation = async (
    x: number,
    y: number,
    callback: () => void
) => {
    // 检查浏览器是否支持 View Transition API
    if (!document.startViewTransition) {
        callback()
        return
    }

    // 计算从点击位置到屏幕最远角的距离（作为圆的最终半径）
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    )

    // 启动 View Transition
    const transition = document.startViewTransition(() => {
        callback()
    })

    // 等待过渡准备就绪
    await transition.ready

    // 动画始终应用到新视图，圆环扩散出新主题色
    document.documentElement.animate(
        {
            clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
            ]
        },
        {
            duration: 500,
            easing: 'ease-out',
            pseudoElement: '::view-transition-new(root)'
        }
    )
}

/**
 * 主题状态管理 Store
 *
 * 提供主题切换功能，支持持久化存储和圆环扩散动画。
 */
export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'light',

            toggleTheme: (x?: number, y?: number) => {
                const currentTheme = get().theme
                const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light'

                // 如果提供了坐标，使用动画切换
                if (x !== undefined && y !== undefined) {
                    toggleWithAnimation(x, y, () => {
                        applyTheme(newTheme)
                        set({ theme: newTheme })
                    })
                } else {
                    // 没有坐标时直接切换
                    applyTheme(newTheme)
                    set({ theme: newTheme })
                }
            },

            setTheme: (theme: Theme) => {
                applyTheme(theme)
                set({ theme })
            }
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                // 在状态恢复后应用主题
                if (state) {
                    applyTheme(state.theme)
                }
            }
        }
    )
)

/**
 * 初始化主题
 *
 * 在应用启动时调用，确保主题正确应用。
 * 优先使用存储的偏好，其次检测系统偏好。
 */
export const initializeTheme = () => {
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
        try {
            const { state } = JSON.parse(stored)
            if (state?.theme) {
                applyTheme(state.theme)
                return
            }
        } catch {
            // 解析失败时使用默认主题
        }
    }

    // 检测系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
}
