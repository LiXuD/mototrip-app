declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// uni-app 类型扩展
declare namespace uni {
  // 存储相关
  function getStorageSync(key: string): string | undefined
  function setStorageSync(key: string, value: string): void
  function removeStorageSync(key: string): void

  // 界面相关
  function showToast(params: {
    title: string
    icon?: 'success' | 'none' | 'error' | 'loading'
    duration?: number
    image?: string
  }): void

  function reLaunch(params: { url: string }): void
  function navigateTo(params: { url: string }): void
  function navigateBack(params?: { delta?: number }): void
  function switchTab(params: { url: string }): void

  // 网络请求
  function request<T = any>(params: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: Record<string, string>
    success?: (res: { statusCode: number; data: any }) => void
    fail?: (err: any) => void
  }): void

  // 页面相关
  function getCurrentPages(): Array<{
    route?: string
    options?: Record<string, any>
    $vm?: any
  }>

  // 位置相关
  function getLocation(params?: {
    type?: string
    success?: (res: { latitude: number; longitude: number }) => void
    fail?: (err: any) => void
  }): void

  function chooseLocation(params?: {
    success?: (res: {
      name: string
      address: string
      latitude: number
      longitude: number
    }) => void
    fail?: (err: any) => void
  }): void

  // 图片相关
  function chooseImage(params: {
    count?: number
    sourceType?: string | string[]
    success?: (res: { tempFilePaths: string[]; tempFiles: Array<{ path: string; size: number }> }) => void
    fail?: (err: any) => void
  }): void

  // 文件上传
  function uploadFile(params: {
    url: string
    filePath: string
    name?: string
    formData?: Record<string, string>
    success?: (res: { statusCode: number; data: string }) => void
    fail?: (err: any) => void
  }): void

  // 剪贴板
  function setClipboardData(params: {
    data: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  // 图片预览
  function previewImage(params: {
    current?: string | number
    urls: string[]
    success?: () => void
    fail?: (err: any) => void
  }): void

  // 电话
  function makePhoneCall(params: {
    phoneNumber: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  // 打开位置
  function openLocation(params: {
    latitude: number
    longitude: number
    name?: string
    address?: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  // 文件上传
  function uploadFile(params: {
    url: string
    filePath: string
    name?: string
    formData?: Record<string, string>
    success?: (res: { statusCode: number; data: string }) => void
    fail?: (err: any) => void
  }): void

  // 下拉刷新
  function stopPullDownRefresh(params?: { success?: () => void }): void
}

// 全局 uni 对象
declare const uni: typeof uni
