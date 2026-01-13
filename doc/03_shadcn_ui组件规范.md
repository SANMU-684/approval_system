# 审批系统 - shadcn/ui 组件规范

## 1. 技术概述

shadcn/ui 是一套基于 Radix UI 和 Tailwind CSS 的可复制组件库，特点：

- **可复制性**：组件代码直接复制到项目中，完全可控
- **可定制性**：基于 Tailwind CSS，易于自定义样式
- **无障碍性**：基于 Radix UI，内置无障碍支持
- **TypeScript**：完整的类型定义

## 2. 安装配置

### 2.1 初始化 shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

系统会询问配置选项，推荐配置：

```
✔ Style: Default
✔ Base color: Slate
✔ CSS variables: Yes
```

### 2.2 components.json 配置

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 3. 常用组件安装

```bash
# 基础组件
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add textarea

# 表单组件
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add radio-group
pnpm dlx shadcn@latest add switch

# 数据展示
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add avatar

# 反馈组件
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add alert-dialog
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add skeleton

# 导航组件
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add navigation-menu
```

## 4. 组件使用示例

### 4.1 Button 按钮

```tsx
import { Button } from "@/components/ui/button"

// 变体
<Button variant="default">默认按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">危险按钮</Button>

// 尺寸
<Button size="sm">小按钮</Button>
<Button size="default">默认按钮</Button>
<Button size="lg">大按钮</Button>

// 加载状态
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  加载中...
</Button>
```

### 4.2 Card 卡片

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>审批详情</CardTitle>
    <CardDescription>查看审批记录的详细信息</CardDescription>
  </CardHeader>
  <CardContent>
    <p>审批内容...</p>
  </CardContent>
  <CardFooter>
    <Button>确认</Button>
  </CardFooter>
</Card>
```

### 4.3 Form 表单

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().min(10, "内容至少10个字符"),
})

function ApprovalForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="请输入标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">提交</Button>
      </form>
    </Form>
  )
}
```

### 4.4 Table 表格

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>标题</TableHead>
      <TableHead>状态</TableHead>
      <TableHead>创建时间</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {approvals.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.title}</TableCell>
        <TableCell>
          <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
            {item.statusText}
          </Badge>
        </TableCell>
        <TableCell>{item.createdAt}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 4.5 Dialog 对话框

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>确认操作</DialogTitle>
      <DialogDescription>您确定要执行此操作吗？</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">取消</Button>
      <Button>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 5. 审批系统专用组件

建议创建以下业务组件：

| 组件名 | 说明 |
|--------|------|
| ApprovalCard | 审批卡片，展示审批概要 |
| ApprovalTimeline | 审批时间线，展示审批流程 |
| ApprovalForm | 审批表单，创建/编辑审批 |
| FileUploader | 文件上传组件 |
| StatusBadge | 状态标签，不同状态不同颜色 |
| UserAvatar | 用户头像，展示用户信息 |

## 6. 工具函数 (lib/utils.ts)

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 * 用于条件性地组合类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
