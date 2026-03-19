import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Diary, PaginatedResponse, DiaryListParams } from '@/types'
import { diaryApi } from '@/services/api'

const defaultDiaryQuery: DiaryListParams = {
  tripId: undefined,
  userId: undefined,
  tag: undefined,
}

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref<Diary[]>([])
  const currentDiary = ref<Diary | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)
  const currentQuery = ref<DiaryListParams>({ ...defaultDiaryQuery })

  async function fetchDiaries(params?: DiaryListParams) {
    if (page.value === 1) {
      currentQuery.value = { ...defaultDiaryQuery, ...params }
    }

    loading.value = true
    try {
      const res = await diaryApi.list({
        page: page.value,
        pageSize: pageSize.value,
        ...currentQuery.value,
      }) as PaginatedResponse<Diary>
      if (page.value === 1) {
        diaries.value = res.list
      } else {
        diaries.value = [...diaries.value, ...res.list]
      }
      total.value = res.total
      hasMore.value = res.hasMore
    } finally {
      loading.value = false
    }
  }

  async function likeDiary(id: number) {
    await diaryApi.like(id)
    const index = diaries.value.findIndex(d => d.id === id)
    if (index !== -1) {
      diaries.value[index].likes++
    }
  }

  function resetList() {
    page.value = 1
    diaries.value = []
    hasMore.value = true
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return

    page.value += 1
    try {
      await fetchDiaries()
    } catch (error) {
      page.value -= 1
      throw error
    }
  }

  return {
    diaries,
    currentDiary,
    loading,
    total,
    page,
    pageSize,
    hasMore,
    currentQuery,
    fetchDiaries,
    likeDiary,
    resetList,
    loadMore,
  }
})
