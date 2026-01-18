/**
 * 活动时间线组件
 *
 * 展示最近的审批活动，带时间线视觉效果。
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, RotateCcw, FileText, ChevronRight } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type RecentActivity } from '@/services/dashboardService'

interface ActivityTimelineProps {
    /** 活动列表 */
    data: RecentActivity[]
    /** 是否加载中 */
    loading?: boolean
    /** 标题 */
    title?: string
    /** 描述 */
    description?: string
}

/**
 * 获取活动类型配置
 *
 * [activityType] 活动类型
 * 返回：活动类型配置对象
 */
function getActivityConfig(activityType: RecentActivity['activityType']) {
    switch (activityType) {
        case 'approved':
            return {
                icon: CheckCircle2,
                color: 'text-green-500',
                bgColor: 'bg-green-500',
                label: '已通过',
            }
        case 'rejected':
            return {
                icon: XCircle,
                color: 'text-red-500',
                bgColor: 'bg-red-500',
                label: '已拒绝',
            }
        case 'withdrawn':
            return {
                icon: RotateCcw,
                color: 'text-gray-500',
                bgColor: 'bg-gray-500',
                label: '已撤回',
            }
        case 'created':
        default:
            return {
                icon: FileText,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500',
                label: '已提交',
            }
    }
}

/**
 * 活动时间线组件
 *
 * [data] 活动数据
 * [loading] 是否加载中
 * [title] 标题
 * [description] 描述
 * 返回：活动时间线卡片
 */
export function ActivityTimeline({
    data,
    loading = false,
    title = '最近活动',
    description = '您的审批动态',
}: ActivityTimelineProps) {
    const navigate = useNavigate()

    const listVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.1 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/approval')}
                        >
                            全部记录
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-70 pr-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : data.length > 0 ? (
                            <motion.div
                                className="relative"
                                variants={listVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {/* 时间线竖线 */}
                                <div className="absolute left-3.75 top-2 bottom-2 w-px bg-border" />

                                <div className="space-y-4">
                                    {data.map((activity, index) => {
                                        const config = getActivityConfig(activity.activityType)
                                        const Icon = config.icon
                                        return (
                                            <motion.div
                                                key={activity.approvalId}
                                                variants={itemVariants}
                                                whileHover={{ x: 4 }}
                                                className="flex gap-3 cursor-pointer group"
                                                onClick={() => navigate(`/approval/${activity.approvalId}`)}
                                            >
                                                {/* 时间线节点 */}
                                                <div className="relative z-10">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.7 + index * 0.1 }}
                                                        className={cn(
                                                            'w-8 h-8 rounded-full flex items-center justify-center bg-background border-2',
                                                            `border-current ${config.color}`
                                                        )}
                                                    >
                                                        <Icon className={cn('w-4 h-4', config.color)} />
                                                    </motion.div>
                                                </div>

                                                {/* 内容 */}
                                                <div className="flex-1 min-w-0 pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn('text-xs font-medium', config.color)}>
                                                            {config.label}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {activity.relativeTime}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium mt-0.5 truncate group-hover:text-primary transition-colors">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {activity.typeName}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-50 flex items-center justify-center text-muted-foreground">
                                <p>暂无活动记录</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    )
}
