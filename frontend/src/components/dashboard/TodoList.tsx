/**
 * 待办事项列表组件
 *
 * 展示待审批的事项列表，按优先级排序，支持快速操作。
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronRight, AlertCircle } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type TodoItem } from '@/services/dashboardService'

interface TodoListProps {
    /** 待办事项列表 */
    data: TodoItem[]
    /** 是否加载中 */
    loading?: boolean
    /** 标题 */
    title?: string
    /** 描述 */
    description?: string
}

/**
 * 获取优先级配置
 *
 * [priority] 优先级 (1-高, 2-中, 3-低)
 * 返回：优先级配置对象
 */
function getPriorityConfig(priority: 1 | 2 | 3) {
    switch (priority) {
        case 1:
            return {
                label: '紧急',
                color: 'bg-red-500',
                badgeVariant: 'destructive' as const,
            }
        case 2:
            return {
                label: '普通',
                color: 'bg-yellow-500',
                badgeVariant: 'secondary' as const,
            }
        case 3:
            return {
                label: '低',
                color: 'bg-green-500',
                badgeVariant: 'outline' as const,
            }
    }
}

/**
 * 待办事项列表组件
 *
 * [data] 待办事项数据
 * [loading] 是否加载中
 * [title] 标题
 * [description] 描述
 * 返回：待办事项列表卡片
 */
export function TodoList({
    data,
    loading = false,
    title = '待办事项',
    description = '需要您处理的审批',
}: TodoListProps) {
    const navigate = useNavigate()

    const listVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.08 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 },
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                {title}
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/approval?tab=pending')}
                        >
                            查看全部
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-70 pr-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-9 h-9 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : data.length > 0 ? (
                            <motion.div
                                className="space-y-3"
                                variants={listVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {data.map((item) => {
                                    const priorityConfig = getPriorityConfig(item.priority)
                                    return (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            whileHover={{ x: 4, backgroundColor: 'hsl(var(--muted))' }}
                                            className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                                            onClick={() => navigate(`/approval/${item.id}`)}
                                        >
                                            {/* 优先级指示器 */}
                                            <div
                                                className={cn(
                                                    'w-1 h-10 rounded-full shrink-0',
                                                    priorityConfig.color
                                                )}
                                            />
                                            {/* 发起人头像 */}
                                            <Avatar className="w-9 h-9">
                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {item.applicantName.slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* 内容 */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {item.title}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{item.applicantName}</span>
                                                    <span>·</span>
                                                    <span className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {item.waitingTime}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* 类型标签 */}
                                            <Badge variant={priorityConfig.badgeVariant} className="shrink-0 text-xs">
                                                {item.typeName}
                                            </Badge>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        ) : (
                            <div className="h-50 flex items-center justify-center text-muted-foreground">
                                <p>暂无待办事项 🎉</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    )
}
