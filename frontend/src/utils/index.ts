/**
 * 工具函数集合
 */

/**
 * 格式化日期时间
 *
 * [date] 日期字符串或 Date 对象
 * [format] 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * 返回：格式化后的日期字符串
 */
export function formatDate(
    date: string | Date,
    format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
    const d = typeof date === 'string' ? new Date(date) : date

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

/**
 * 格式化文件大小
 *
 * [bytes] 文件字节数
 * 返回：格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 *
 * [fn] 要防抖的函数
 * [delay] 延迟时间 (毫秒)
 * 返回：防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>

    return function (this: unknown, ...args: Parameters<T>) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), delay)
    }
}

/**
 * 节流函数
 *
 * [fn] 要节流的函数
 * [limit] 时间限制 (毫秒)
 * 返回：节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false

    return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
            fn.apply(this, args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

/**
 * 生成唯一 ID
 *
 * 返回：唯一 ID 字符串
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
