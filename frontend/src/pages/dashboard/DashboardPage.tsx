/**
 * 数据看板页面组件
 *
 * 综合性的数据分析仪表板，包含统计卡片、趋势图表、待办事项和活动时间线。
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    Clock,
    CheckCircle2,
    Timer,
    BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageContainer } from '@/components/layout/PageContainer'
import {
    AreaChartCard,
    DonutChartCard,
    StatsCard,
    EfficiencyChartCard,
    SubmissionHeatmapCard,
} from '@/components/dashboard'
import dashboardService, {
    type DashboardStatistics,
    type TrendDataPoint,
    type TypeDistribution,
    type EfficiencyMetrics,
    type TypeEfficiency,
    type DailySubmission,
} from '@/services/dashboardService'

/**
 * 数据看板页面
 *
 * 返回：数据看板组件
 */
export default function DashboardPage() {
    const navigate = useNavigate()

    // 状态
    const [loading, setLoading] = useState(true)
    const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
    const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
    const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
    const [efficiency, setEfficiency] = useState<EfficiencyMetrics | null>(null)
    const [typeEfficiency, setTypeEfficiency] = useState<TypeEfficiency[]>([])
    const [heatmapData, setHeatmapData] = useState<DailySubmission[]>([])

    // 加载所有数据
    useEffect(() => {
        loadData()
    }, [])

    /**
     * 加载看板数据
     */
    const loadData = async () => {
        try {
            setLoading(true)
            const [stats, trend, types, eff, typeEff, heatmap] = await Promise.all([
                dashboardService.getStatistics(),
                dashboardService.getTrendData(30),
                dashboardService.getTypeDistribution(),
                dashboardService.getEfficiencyMetrics(),
                dashboardService.getTypeEfficiency(),
                dashboardService.getSubmissionHeatmap(),
            ])
            setStatistics(stats)
            setTrendData(trend)
            setTypeDistribution(types)
            setEfficiency(eff)
            setTypeEfficiency(typeEff)
            setHeatmapData(heatmap)
        } catch (error) {
            console.error('加载数据失败:', error)
            toast.error('加载数据失败')
        } finally {
            setLoading(false)
        }
    }

    // 统计卡片配置
    const statsCards = [
        {
            title: '待我审批',
            value: statistics?.pending ?? 0,
            icon: Clock,
            iconColor: 'text-orange-500',
            iconBgColor: 'bg-orange-500/10',
            onClick: () => navigate('/approval?tab=pending'),
            delay: 0,
        },
        {
            title: '本月审批量',
            value: efficiency?.monthlyCount ?? 0,
            icon: BarChart3,
            iconColor: 'text-blue-500',
            iconBgColor: 'bg-blue-500/10',
            trend: efficiency?.monthlyChange,
            delay: 0.1,
        },
        {
            title: '平均处理时间',
            value: efficiency?.avgProcessTime ?? 0,
            icon: Timer,
            iconColor: 'text-purple-500',
            iconBgColor: 'bg-purple-500/10',
            suffix: 'h',
            decimals: 1,
            delay: 0.2,
        },
        {
            title: '审批通过率',
            value: efficiency?.approvalRate ?? 0,
            icon: CheckCircle2,
            iconColor: 'text-green-500',
            iconBgColor: 'bg-green-500/10',
            suffix: '%',
            decimals: 1,
            showProgress: true,
            progressValue: efficiency?.approvalRate ?? 0,
            delay: 0.3,
        },
    ]

    return (
        <PageContainer
            title="数据看板"
            description="实时掌握审批动态与效率指标"
        >
            <div className="space-y-6">
                {/* 统计卡片区域 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((card) => (
                        <StatsCard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            iconColor={card.iconColor}
                            iconBgColor={card.iconBgColor}
                            loading={loading}
                            onClick={card.onClick}
                            trend={card.trend}
                            suffix={card.suffix}
                            decimals={card.decimals}
                            showProgress={card.showProgress}
                            progressValue={card.progressValue}
                            delay={card.delay}
                        />
                    ))}
                </div>

                {/* 趋势与分布图表区域 - 第一行 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <AreaChartCard
                            data={trendData}
                            loading={loading}
                            title="审批趋势"
                            description="过去30天的审批数据走势"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <DonutChartCard
                            data={typeDistribution}
                            loading={loading}
                            title="类型分布"
                            description="各审批类型占比"
                        />
                    </div>
                </div>

                {/* 效率分析与热力图区域 - 第二行 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <EfficiencyChartCard
                            data={typeEfficiency}
                            loading={loading}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <SubmissionHeatmapCard
                            data={heatmapData}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
