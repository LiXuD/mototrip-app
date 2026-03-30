import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePaginatedList } from './usePaginatedList'
import type { Diary, DiaryListParams } from '@/types'
import { diaryApi } from '@/services/api'

const defaultDiaryQuery: DiaryListParams = {
  tripId: undefined,
  userId: undefined,
  tag: undefined,
}

export const useDiaryStore = defineStore('diary', () => {
  const {
    items: diaries,
    loading,
    total,
    page,
    pageSize,
    hasMore,
    currentQuery,
    fetchItems,
    resetList,
    resetStore: resetStoreFn,
    loadMore,
  } = usePaginatedList<Diary, DiaryListParams>()

  const currentDiary = ref<Diary | null>(null)

  async function fetchDiaries(params?: DiaryListParams) {
    await fetchItems(diaryApi.list, defaultDiaryQuery, params)
  }

  async function likeDiary(id: number) {
    await diaryApi.like(id)
    const index = diaries.value.findIndex(d => d.id === id)
    if (index !== -1) {
      const diary = diaries.value[index]
      diary.likes++
      diary.isLiked = !diary.isLiked
    }
    if (currentDiary.value?.id === id) {
      currentDiary.value.likes++
      currentDiary.value.isLiked = !currentDiary.value.isLiked
    }
  }

  function resetStore() {
    resetStoreFn(defaultDiaryQuery)
    currentDiary.value = null
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
    resetStore,
    loadMore,
  }
})
