/**
 * 环境变量配置
 */

// 开发环境默认值
const DEV = {
  API_URL: 'http://localhost:3000/api',
}

// 生产环境默认值
const PROD = {
  API_URL: 'https://api.mototrip.com/api',
}

// 根据环境变量获取配置
const isProduction = import.meta.env.MODE === 'production'
const envConfig = isProduction ? PROD : DEV

// 从环境变量覆盖配置
export const API_URL = import.meta.env.VITE_API_URL || envConfig.API_URL
export const UPLOAD_URL = `${API_URL}/upload`
export const TIMEOUT = Number(import.meta.env.VITE_TIMEOUT) || 30000

// 导出便捷方法
export const getApiUrl = (path: string) => `${API_URL}${path}`
