/**
 * 合并 Tailwind CSS 类名的工具函数
 *
 * 该函数用于条件性地组合多个 CSS 类名，并使用 tailwind-merge
 * 来处理 Tailwind CSS 类名冲突。
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并并去重 Tailwind CSS 类名
 *
 * [inputs] 要合并的类名，支持字符串、数组、对象等格式
 * 返回：合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
