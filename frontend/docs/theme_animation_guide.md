# 暗黑模式动画适配指南

## 概述

本项目使用 **View Transition API** 实现了从按钮点击位置向外扩散的圆环动画效果来切换暗黑/亮色模式。本文档描述了动画的实现原理和组件适配要求。

## 技术实现

### 核心文件

| 文件 | 作用 |
|------|------|
| `src/stores/themeStore.ts` | 主题状态管理，包含动画逻辑 |
| `src/components/layout/ThemeToggle.tsx` | 主题切换按钮组件 |
| `src/styles/globals.css` | View Transition 动画样式 |

### 动画原理

1. 点击切换按钮时，记录点击位置坐标 `(x, y)`
2. 调用 `document.startViewTransition()` API 启动过渡
3. 浏览器捕获旧视图快照（`::view-transition-old`）和新视图快照（`::view-transition-new`）
4. 使用 `clip-path: circle()` 从点击位置向外扩散新视图

### 关键 CSS

```css
/* 禁用默认动画，使用自定义 clip-path 动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 新视图始终在上层 */
::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 9999;
}
```

### 关键 JavaScript

```typescript
// 计算从点击位置到屏幕最远角的距离
const endRadius = Math.hypot(
  Math.max(x, window.innerWidth - x),
  Math.max(y, window.innerHeight - y)
)

// 应用 clip-path 动画到新视图
document.documentElement.animate(
  {
    clipPath: [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]
  },
  {
    duration: 500,
    easing: 'ease-out',
    pseudoElement: '::view-transition-new(root)'
  }
)
```

---

## 组件适配要求

### 1. 颜色适配

所有组件必须使用 CSS 变量定义颜色，确保在暗黑/亮色模式下正确切换：

```css
/* ✅ 正确：使用 CSS 变量 */
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

/* ❌ 错误：硬编码颜色 */
.my-component {
  background-color: #ffffff;
  color: #000000;
}
```

### 2. 可用的 CSS 变量

| 变量名 | 用途 |
|--------|------|
| `--background` | 页面背景色 |
| `--foreground` | 主要文字颜色 |
| `--card` | 卡片背景色 |
| `--card-foreground` | 卡片文字色 |
| `--primary` | 主色调 |
| `--primary-foreground` | 主色调上的文字 |
| `--secondary` | 次要色 |
| `--secondary-foreground` | 次要色上的文字 |
| `--muted` | 柔和背景色 |
| `--muted-foreground` | 柔和文字色 |
| `--accent` | 强调色 |
| `--accent-foreground` | 强调色上的文字 |
| `--destructive` | 危险/删除操作色 |
| `--border` | 边框颜色 |
| `--input` | 输入框边框 |
| `--ring` | 聚焦环颜色 |

### 3. Tailwind CSS 类名

使用 Tailwind 的语义化颜色类，而非固定颜色：

```tsx
{/* ✅ 正确：使用语义化类名 */}
<div className="bg-background text-foreground border-border">
  <button className="bg-primary text-primary-foreground">
    提交
  </button>
</div>

{/* ❌ 错误：使用固定颜色 */}
<div className="bg-white text-black border-gray-200">
  <button className="bg-blue-500 text-white">
    提交
  </button>
</div>
```

### 4. 图片和图标适配

对于需要在暗黑模式下调整的图片或图标：

```tsx
// 方法一：使用 dark: 变体
<img 
  src="/logo-light.svg" 
  className="dark:hidden" 
/>
<img 
  src="/logo-dark.svg" 
  className="hidden dark:block" 
/>

// 方法二：使用 CSS filter
<img 
  src="/icon.svg" 
  className="dark:invert dark:brightness-90" 
/>
```

### 5. 阴影适配

暗黑模式下阴影效果需要调整：

```tsx
{/* 使用 Tailwind 的 shadow 配合暗黑模式 */}
<div className="shadow-md dark:shadow-lg dark:shadow-black/20">
  内容
</div>
```

---

## 使用主题 Store

### 获取当前主题

```tsx
import { useThemeStore } from '@/stores/themeStore'

function MyComponent() {
  const { theme } = useThemeStore()
  
  return (
    <div>
      当前主题：{theme === 'dark' ? '暗黑模式' : '亮色模式'}
    </div>
  )
}
```

### 编程式切换主题

```tsx
import { useThemeStore } from '@/stores/themeStore'

function MyComponent() {
  const { toggleTheme, setTheme } = useThemeStore()
  
  // 无动画切换
  const handleToggle = () => {
    toggleTheme()
  }
  
  // 带动画切换（需要传入坐标）
  const handleAnimatedToggle = (e: React.MouseEvent) => {
    toggleTheme(e.clientX, e.clientY)
  }
  
  // 直接设置主题
  const handleSetDark = () => {
    setTheme('dark')
  }
  
  return (
    <button onClick={handleAnimatedToggle}>
      切换主题
    </button>
  )
}
```

---

## 浏览器兼容性

View Transition API 支持情况：

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | 111+ |
| Edge | 111+ |
| Safari | 18+ |
| Firefox | 不支持 |

对于不支持的浏览器，动画会自动降级为即时切换，不影响功能。

---

## 调试技巧

### 1. 检查主题状态

打开浏览器开发者工具，在 Console 中执行：

```javascript
// 检查当前是否有 dark 类
document.documentElement.classList.contains('dark')

// 检查 localStorage 中的主题设置
localStorage.getItem('theme-storage')
```

### 2. 强制暗黑模式

在开发者工具中手动添加/移除 `dark` 类：

```javascript
// 切换到暗黑模式
document.documentElement.classList.add('dark')

// 切换到亮色模式
document.documentElement.classList.remove('dark')
```

### 3. 测试动画效果

View Transition API 的动画可以在 Chrome DevTools 的 Animations 面板中查看和调试。
