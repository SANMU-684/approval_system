/**
 * 环形饼图组件
 *
 * 展示审批类型分布，使用 recharts PieChart。
 */

import { useMemo } from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'
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
import { type TypeDistribution } from '@/services/dashboardService'

interface DonutChartCardProps {
    /** 类型分布数据 */
    data: TypeDistribution[]
    /** 是否加载中 */
    loading?: boolean
    /** 标题 */
    title?: string
    /** 描述 */
    description?: string
}

/**
 * 环形饼图组件
 *
 * [data] 类型分布数据
 * [loading] 是否加载中
 * [title] 标题
 * [description] 描述
 * 返回：环形饼图卡片组件
 */
const COLORS = [
    'var(--color-primary-500)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-danger)',
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
]

export function DonutChartCard({
    data,
    loading = false,
    title = '类型分布',
    description = '各审批类型占比',
}: DonutChartCardProps) {
    // 计算总数
    const totalValue = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0)
    }, [data])

    // 动态生成图表配置
    const chartConfig = useMemo(() => {
        const config: ChartConfig = {}
        data.forEach((item, index) => {
            // 如果后端返回的是默认变量颜色，则使用自定义色板
            const isDefaultColor = !item.color || item.color.includes('var(--chart')
            const color = isDefaultColor ? COLORS[index % COLORS.length] : item.color

            config[item.name] = {
                label: item.name,
                color: color,
            }
            // 同时更新数据项中的颜色，以便 Cell 使用
            item.color = color
        })
        return config
    }, [data])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-50">
                            <Skeleton className="h-40 w-40 rounded-full" />
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-50 w-full">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={50}
                                    outerRadius={80}
                                    strokeWidth={2}
                                    stroke="hsl(var(--background))"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-2xl font-bold"
                                                        >
                                                            {totalValue}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 20}
                                                            className="fill-muted-foreground text-xs"
                                                        >
                                                            总数
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    )}
                    {/* 图例 */}
                    {!loading && (
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {data.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                            backgroundColor: item.color
                                        }}
                                    />

                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
