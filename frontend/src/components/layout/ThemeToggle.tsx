/**
 * 主题切换按钮组件
 *
 * 显示太阳/月亮图标，点击时触发带圆环扩散动画的主题切换。
 */

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/themeStore'

/**
 * 主题切换按钮
 *
 * 返回：主题切换按钮组件
 */
export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore()
    const isDark = theme === 'dark'

    /**
     * 处理点击事件
     *
     * [event] 鼠标点击事件
     */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // 获取点击位置坐标
        const x = event.clientX
        const y = event.clientY
        toggleTheme(x, y)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="relative overflow-hidden"
            title={isDark ? '切换到亮色模式' : '切换到暗黑模式'}
        >
            {/* 太阳图标 - 亮色模式显示 */}
            <Sun
                className={`h-5 w-5 transition-all duration-300 ${isDark
                        ? 'rotate-90 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                    }`}
            />
            {/* 月亮图标 - 暗黑模式显示 */}
            <Moon
                className={`absolute h-5 w-5 transition-all duration-300 ${isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                    }`}
            />
            <span className="sr-only">
                {isDark ? '切换到亮色模式' : '切换到暗黑模式'}
            </span>
        </Button>
    )
}
