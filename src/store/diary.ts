import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Diary, PaginatedResponse } from '@/types'
import { diaryApi } from '@/services/api'

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref<Diary[]>([])
  const currentDiary = ref<Diary | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)

  async function fetchDiaries(params?: { tripId?: number; userId?: number }) {
    loading.value = true
    try {
      const res = await diaryApi.list({ page: page.value, pageSize: pageSize.value, ...params }) as PaginatedResponse<Diary>
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

  function loadMore() {
    if (hasMore.value && !loading.value) {
      page.value++
      fetchDiaries()
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
    fetchDiaries,
    likeDiary,
    resetList,
    loadMore,
  }
})
