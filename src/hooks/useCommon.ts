import { ref } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { UPLOAD_URL } from '@/utils/env'

/**
 * 使用下拉刷新
 */
export function usePullDownRefresh(onRefresh: () => Promise<void>) {
  const refreshing = ref(false)

  // #ifdef H5
  // #endif

  // #ifndef H5
  onPullDownRefresh(async () => {
    refreshing.value = true
    await onRefresh()
    refreshing.value = false
    uni.stopPullDownRefresh()
  })
  // #endif

  return {
    refreshing,
  }
}

/**
 * 使用上拉加载更多
 */
export function useLoadMore(
  loadMoreFn: () => Promise<void>,
  hasMore: () => boolean
) {
  const loading = ref(false)

  async function handleLoadMore() {
    if (loading.value || !hasMore()) return
    loading.value = true
    try {
      await loadMoreFn()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    loadMore: handleLoadMore,
  }
}

/**
 * 使用分享
 */
export function useShare(options?: {
  title?: string
  path?: string
  imageUrl?: string
}) {
  return {
    onShareAppMessage() {
      return {
        title: options?.title || '摩旅助手',
        path: options?.path || '/pages/index/index',
        imageUrl: options?.imageUrl,
      }
    },
    onShareTimeline() {
      return {
        title: options?.title || '摩旅助手',
        query: options?.path || '/pages/index/index',
        imageUrl: options?.imageUrl,
      }
    },
  }
}

/**
 * 使用位置
 */
export function useLocation() {
  const location = ref<{ latitude: number; longitude: number } | null>(null)
  const loading = ref(false)

  async function getLocation() {
    loading.value = true
    try {
      const res = await uni.getLocation<UniApp.GetLocationSuccess>({ type: 'wgs84' })
      if (res) {
        location.value = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
      }
      return location.value
    } catch (e) {
      console.error('获取位置失败', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function chooseLocation() {
    const res = await uni.chooseLocation<UniApp.ChooseLocationSuccess>()
    if (res && res.latitude) {
      location.value = {
        latitude: res.latitude,
        longitude: res.longitude,
      }
    }
    return res
  }

  return {
    location,
    loading,
    getLocation,
    chooseLocation,
  }
}

/**
 * 使用图片上传
 */
export function useUpload() {
  const uploading = ref(false)

  async function uploadImage(sourceType: Array<'album' | 'camera'> = ['album', 'camera']) {
    const res = await uni.chooseImage<UniApp.ChooseImageSuccess>({
      count: 9,
      sourceType,
    })
    return res.tempFilePaths
  }

  async function uploadFiles(filePaths: string[]): Promise<string[]> {
    uploading.value = true
    const urls: string[] = []

    try {
      for (const path of filePaths) {
        const result = await uni.uploadFile<UniApp.UploadFileSuccess>({
          url: UPLOAD_URL,
          filePath: path,
          name: 'file',
        })
        if (result.statusCode === 200) {
          const data = JSON.parse(result.data)
          urls.push(data.url)
        }
      }
    } catch (e) {
      console.error('上传失败', e)
    } finally {
      uploading.value = false
    }

    return urls
  }

  return {
    uploading,
    uploadImage,
    uploadFiles,
  }
}
