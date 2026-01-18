/**
 * 趋势面积图组件
 *
 * 使用 recharts 展示审批趋势数据，支持时间范围切换。
 */

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { type TrendDataPoint } from '@/services/dashboardService'

/**
 * 图表配置
 */
const chartConfig = {
    count: {
        label: '总数',
        color: 'var(--color-primary-500)',
    },
    approved: {
        label: '通过',
        color: 'var(--color-success)',
    },
    rejected: {
        label: '拒绝',
        color: 'var(--color-danger)',
    },
} satisfies ChartConfig

interface AreaChartCardProps {
    /** 趋势数据 */
    data: TrendDataPoint[]
    /** 是否加载中 */
    loading?: boolean
    /** 标题 */
    title?: string
    /** 描述 */
    description?: string
}

/**
 * 格式化日期为简短格式
 *
 * [dateStr] 日期字符串 (YYYY-MM-DD)
 * 返回：格式化后的日期 (MM/DD)
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * 趋势面积图组件
 *
 * [data] 趋势数据
 * [loading] 是否加载中
 * [title] 标题
 * [description] 描述
 * 返回：面积图卡片组件
 */
export function AreaChartCard({
    data,
    loading = false,
    title = '审批趋势',
    description = '过去30天的审批数据',
}: AreaChartCardProps) {
    // 处理数据，添加格式化的日期
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            formattedDate: formatDate(item.date),
        }))
    }, [data])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-50 w-full" />
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-50 w-full">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-count)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-count)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-approved)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-approved)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                <XAxis
                                    dataKey="formattedDate"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    minTickGap={32}
                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                    allowDecimals={false}
                                    width={30}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Area
                                    dataKey="count"
                                    type="natural"
                                    fill="url(#fillCount)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-count)"
                                    strokeWidth={2}
                                    dot={{ r: 4, fillOpacity: 1, strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    dataKey="approved"
                                    type="natural"
                                    fill="url(#fillApproved)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-approved)"
                                    strokeWidth={2}
                                    dot={{ r: 4, fillOpacity: 1, strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
