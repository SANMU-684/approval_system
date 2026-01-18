/**
 * 统计卡片组件
 *
 * 可复用的统计卡片，支持数字动画、趋势指示和进度环。
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/**
 * 数字动画组件
 *
 * [value] 目标数值
 * [duration] 动画持续时间（毫秒）
 * [suffix] 后缀（如 %、h）
 */
function AnimatedNumber({
    value,
    duration = 800,
    suffix = '',
    decimals = 0,
}: {
    value: number
    duration?: number
    suffix?: string
    decimals?: number
}) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (value === 0) {
            setDisplayValue(0)
            return
        }

        const startTime = Date.now()
        const startValue = 0

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // 使用 easeOutQuart 缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 4)
            const currentValue = startValue + (value - startValue) * easeProgress
            setDisplayValue(currentValue)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [value, duration])

    return (
        <span>
            {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
            {suffix}
        </span>
    )
}

interface StatsCardProps {
    /** 标题 */
    title: string
    /** 数值 */
    value: number
    /** 图标 */
    icon: LucideIcon
    /** 图标颜色类名 */
    iconColor?: string
    /** 图标背景颜色类名 */
    iconBgColor?: string
    /** 是否加载中 */
    loading?: boolean
    /** 点击回调 */
    onClick?: () => void
    /** 趋势变化百分比 */
    trend?: number
    /** 后缀（如 %、h） */
    suffix?: string
    /** 小数位数 */
    decimals?: number
    /** 是否显示进度环 */
    showProgress?: boolean
    /** 进度值（0-100） */
    progressValue?: number
    /** 动画延迟（秒） */
    delay?: number
}

/**
 * 统计卡片组件
 *
 * [title] 标题
 * [value] 数值
 * [icon] 图标
 * [iconColor] 图标颜色
 * [iconBgColor] 图标背景色
 * [loading] 是否加载中
 * [onClick] 点击回调
 * [trend] 趋势变化
 * [suffix] 后缀
 * [decimals] 小数位数
 * [showProgress] 是否显示进度
 * [progressValue] 进度值
 * [delay] 动画延迟
 * 返回：统计卡片组件
 */
export function StatsCard({
    title,
    value,
    icon: Icon,
    iconColor = 'text-primary',
    iconBgColor = 'bg-primary/10',
    loading = false,
    onClick,
    trend,
    suffix = '',
    decimals = 0,
    showProgress = false,
    progressValue = 0,
    delay = 0,
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                className={cn(
                    'transition-shadow hover:shadow-md',
                    onClick && 'cursor-pointer'
                )}
                onClick={onClick}
            >
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className={cn('p-3 rounded-xl', iconBgColor)}>
                            <Icon className={cn('w-5 h-5', iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground truncate">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold">
                                    {loading ? (
                                        <span className="inline-block w-12 h-7 bg-muted animate-pulse rounded" />
                                    ) : (
                                        <AnimatedNumber
                                            value={value}
                                            suffix={suffix}
                                            decimals={decimals}
                                        />
                                    )}
                                </p>
                                {trend !== undefined && !loading && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: delay + 0.5 }}
                                        className={cn(
                                            'flex items-center text-xs font-medium',
                                            trend >= 0 ? 'text-green-500' : 'text-red-500'
                                        )}
                                    >
                                        {trend >= 0 ? (
                                            <TrendingUp className="w-3 h-3 mr-0.5" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-0.5" />
                                        )}
                                        {Math.abs(trend).toFixed(1)}%
                                    </motion.span>
                                )}
                            </div>
                        </div>
                    </div>
                    {showProgress && !loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.3 }}
                            className="mt-3"
                        >
                            <Progress value={progressValue} className="h-1.5" />
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
