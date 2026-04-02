/**
 * 环境变量配置
 */

// 开发环境
const DEV = {
  API_URL: '',
}

// 生产环境
const PROD = {
  API_URL: 'https://api.mototrip.com',
}

// 根据环境变量获取配置
const env = process.env.NODE_ENV === 'production' ? PROD : DEV

export const API_URL = env.API_URL

// 导出便捷方法
export const getApiUrl = (path: string) => `${API_URL}${path}`
