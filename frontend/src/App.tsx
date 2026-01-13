/**
 * 应用根组件
 *
 * 配置路由和全局布局
 */

import { Routes, Route } from 'react-router-dom'

/**
 * 首页组件 (临时)
 */
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center animate-fade-in">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            审批系统
          </h1>
          <p className="text-gray-600">
            企业级审批流程管理平台
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ React 19
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ✓ TypeScript
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              ✓ Tailwind CSS
            </span>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            前端初始化完成，可以开始开发了！
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 应用根组件
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 后续添加更多路由 */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
    </Routes>
  )
}

export default App
