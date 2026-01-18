/**
 * 效率分析柱状图组件
 *
 * 展示不同审批类型的平均处理时长
 */

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import { type TypeEfficiency } from '@/services/dashboardService'

interface EfficiencyChartCardProps {
    data: TypeEfficiency[]
    loading?: boolean
}

const chartConfig = {
    avgProcessTime: {
        label: '平均耗时 (小时)',
        color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig

export function EfficiencyChartCard({ data, loading = false }: EfficiencyChartCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">效率分析</CardTitle>
                    <CardDescription>各类型审批平均处理时长（小时）</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-75 w-full" />
                    ) : (
                        <ChartContainer config={chartConfig} className="h-75 w-full">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.2} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="typeName"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    width={80}
                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar
                                    dataKey="avgProcessTime"
                                    fill="var(--color-avgProcessTime)"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
