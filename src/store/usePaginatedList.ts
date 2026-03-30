import { ref } from 'vue'
import type { Ref } from 'vue'
import type { PaginatedResponse } from '@/types'

/**
 * 分页列表 Mixin - 提取 Store 中分页相关的公共逻辑
 *
 * @param T 实体类型 (Route, Trip, Diary)
 * @param P 查询参数类型
 */
export function usePaginatedList<T, P extends Record<string, any>>() {
  const items: Ref<T[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const total: Ref<number> = ref(0)
  const page: Ref<number> = ref(1)
  const pageSize: Ref<number> = ref(10)
  const hasMore: Ref<boolean> = ref(true)
  const currentQuery: Ref<P> = ref({} as P)

  /**
   * 获取列表数据
   * @param apiFn API 调用函数
   * @param defaultParams 默认查询参数
   * @param overrideParams 覆盖参数
   */
  async function fetchItems(
    apiFn: (params: any) => Promise<PaginatedResponse<T>>,
    defaultParams: P,
    overrideParams?: P
  ) {
    if (page.value === 1) {
      currentQuery.value = { ...defaultParams, ...overrideParams } as P
    }

    loading.value = true
    try {
      const res = await apiFn({
        page: page.value,
        pageSize: pageSize.value,
        ...currentQuery.value,
      }) as PaginatedResponse<T>

      if (page.value === 1) {
        items.value = res.list
      } else {
        items.value = [...items.value, ...res.list]
      }
      total.value = res.total
      hasMore.value = res.hasMore
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置列表（保留查询条件）
   */
  function resetList() {
    page.value = 1
    items.value = []
    hasMore.value = true
  }

  /**
   * 完全重置 Store
   * @param defaultParams 默认查询参数
   */
  function resetStore(defaultParams: P) {
    items.value = []
    loading.value = false
    total.value = 0
    page.value = 1
    pageSize.value = 10
    hasMore.value = true
    currentQuery.value = { ...defaultParams } as P
  }

  /**
   * 加载更多
   * @param fetchFn fetchItems 绑定后的函数
   */
  async function loadMore(fetchFn?: () => Promise<void>) {
    if (!hasMore.value || loading.value) return

    page.value += 1
    try {
      if (fetchFn) {
        await fetchFn()
      }
    } catch (error) {
      page.value -= 1
      throw error
    }
  }

  return {
    items,
    loading,
    total,
    page,
    pageSize,
    hasMore,
    currentQuery,
    fetchItems,
    resetList,
    resetStore,
    loadMore,
  }
}
