/**
 * 提交热力图组件
 *
 * 展示过去一年每日的提交活跃度
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type DailySubmission } from '@/services/dashboardService'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SubmissionHeatmapCardProps {
    data: DailySubmission[]
    loading?: boolean
}

export function SubmissionHeatmapCard({ data, loading = false }: SubmissionHeatmapCardProps) {
    // 处理数据，生成完整的年日历网格
    const mapData = useMemo(() => {
        if (!data || data.length === 0) return []

        // 创建日期映射
        const dateMap = new Map(data.map(d => [d.date, d]))

        // 获取结束日期（今天）
        const today = new Date()

        // 生成过去 52 周 (364天) 的网格
        // 为了方便按周排列，我们按 Columns (Weeks) -> Rows (Days) 渲染
        // Recharts 或其他库通常按行渲染
        // 这里我们生成一个 Week[]，每个 Week 包含 7 Days

        const weeks = []
        // 从一年前的周日开始
        const endDate = today
        // 找到 52 周前的日期
        const startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 364)

        // 调整 startDate 到最近的周日 (0)
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)

        let currentDate = new Date(startDate)

        for (let w = 0; w < 53; w++) {
            const week = []
            for (let d = 0; d < 7; d++) {
                const dateStr = currentDate.toISOString().split('T')[0]
                const item = dateMap.get(dateStr) || { date: dateStr, count: 0, level: 0 }
                week.push({
                    date: dateStr,
                    count: item.count,
                    level: item.level,
                    isFuture: currentDate > today // 不显示未来的日子
                })
                currentDate.setDate(currentDate.getDate() + 1)
            }
            weeks.push(week)
        }

        return weeks
    }, [data])

    // 颜色映射
    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-muted' // 灰色
            case 1: return 'bg-primary-500/20' // 浅色
            case 2: return 'bg-primary-500/40'
            case 3: return 'bg-primary-500/70'
            case 4: return 'bg-primary-500' // 深色
            default: return 'bg-muted'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">提交活跃度</CardTitle>
                    <CardDescription>过去一年的审批提交记录</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-35 w-full" />
                    ) : (
                        <div className="w-full overflow-x-auto pb-2">
                            <div className="flex gap-1 min-w-200">
                                {mapData.map((week, wIndex) => (
                                    <div key={wIndex} className="flex flex-col gap-1">
                                        {week.map((day) => (
                                            !day.isFuture ? (
                                                <TooltipProvider key={day.date}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={`w-3 h-3 rounded-xs ${getLevelColor(day.level)} hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all cursor-pointer`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs font-medium">{day.date}</p>
                                                            <p className="text-xs text-muted-foreground">{day.count} 次提交</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <div key={day.date} className="w-3 h-3" />
                                            )
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-xs bg-muted" />
                                    <div className="w-3 h-3 rounded-xs bg-primary-500/20" />
                                    <div className="w-3 h-3 rounded-xs bg-primary-500/40" />
                                    <div className="w-3 h-3 rounded-xs bg-primary-500/70" />
                                    <div className="w-3 h-3 rounded-xs bg-primary-500" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
