/**
 * 欢迎页面组件
 *
 * 展示用户欢迎信息、待处理审批统计和快捷操作入口。
 */

import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import dashboardService, { type RecentActivity, type DashboardStatistics } from '@/services/dashboardService'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react'

/**
 * 根据当前时间获取问候语
 *
 * [hour] 当前小时数
 * 返回：对应时间段的问候语
 */
function getGreeting(hour: number): string {
    if (hour >= 5 && hour < 12) {
        return '上午好'
    } else if (hour >= 12 && hour < 18) {
        return '下午好'
    } else {
        return '晚上好'
    }
}

/**
 * 数字动画组件
 *
 * [value] 目标数值
 * [duration] 动画持续时间（毫秒）
 */
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
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
            const currentValue = Math.round(startValue + (value - startValue) * easeProgress)
            setDisplayValue(currentValue)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [value, duration])

    return <span>{displayValue}</span>
}

/**
 * 欢迎页面
 *
 * 返回：欢迎页面组件
 */
export default function WelcomePage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [activities, setActivities] = useState<RecentActivity[]>([])
    const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
    const [loading, setLoading] = useState(true)

    // 计算时间段问候语
    const greeting = useMemo(() => {
        const hour = new Date().getHours()
        return getGreeting(hour)
    }, [])

    // 加载数据
    useEffect(() => {
        loadData()
    }, [])

    /**
     * 加载欢迎页数据
     */
    const loadData = async () => {
        try {
            setLoading(true)
            const [activitiesData, statsData] = await Promise.all([
                dashboardService.getRecentActivities(5),
                dashboardService.getStatistics()
            ])
            setActivities(activitiesData)
            setStatistics(statsData)
        } catch (error) {
            console.error('加载数据失败:', error)
            toast.error('加载数据失败')
        } finally {
            setLoading(false)
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 }
    }

    const listVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.08 }
        }
    }

    // 统计卡片配置
    const statsCards = [
        {
            title: '待我审批',
            value: statistics?.pending ?? 0,
            icon: Clock,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            onClick: () => navigate('/approval?tab=pending')
        },
        {
            title: '已通过',
            value: statistics?.approved ?? 0,
            icon: CheckCircle2,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            onClick: () => navigate('/approval?status=approved')
        },
        {
            title: '已拒绝',
            value: statistics?.rejected ?? 0,
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            onClick: () => navigate('/approval?status=rejected')
        }
    ]

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* 欢迎区域 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10 p-8 md:p-10"
            >
                {/* 背景装饰元素 */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary mb-2">
                        {greeting}，{user?.username || '用户'}！
                    </h1>
                    <p className="text-base text-muted-foreground mb-6">
                        发现、创建和管理您的审批流程。
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => navigate('/approval/new')}
                                className="rounded-full px-5 py-2"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                创建新审批
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                onClick={() => navigate('/approval')}
                                className="rounded-full px-5 py-2"
                            >
                                查看全部
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className="cursor-pointer transition-shadow hover:shadow-md"
                            onClick={card.onClick}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{card.title}</p>
                                        <p className="text-2xl font-bold">
                                            {loading ? (
                                                <span className="inline-block w-8 h-6 bg-muted animate-pulse rounded"></span>
                                            ) : (
                                                <AnimatedNumber value={card.value} />
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* 最近活动 */}
            <Card>
                <CardHeader>
                    <CardTitle>最近活动</CardTitle>
                    <CardDescription>您的最新操作记录</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-muted" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-muted rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <motion.div
                            className="space-y-3"
                            variants={listVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {activities.map((activity) => (
                                <motion.div
                                    key={activity.approvalId}
                                    variants={itemVariants}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                    onClick={() => navigate(`/approval/${activity.approvalId}`)}
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${activity.activityType === 'approved' ? 'bg-green-500' :
                                        activity.activityType === 'rejected' ? 'bg-red-500' :
                                            activity.activityType === 'withdrawn' ? 'bg-gray-500' :
                                                'bg-blue-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {activity.activityType === 'approved' ? '已通过' :
                                                activity.activityType === 'rejected' ? '已拒绝' :
                                                    activity.activityType === 'withdrawn' ? '已撤回' :
                                                        '已提交'} - {activity.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{activity.relativeTime}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="h-32 flex items-center justify-center text-center text-muted-foreground">
                            <p>暂无活动记录</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
