import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Trip, PaginatedResponse, TripListParams } from '@/types'
import { tripApi } from '@/services/api'

const defaultTripQuery: TripListParams = {
  status: undefined,
}

export const useTripStore = defineStore('trip', () => {
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)
  const currentQuery = ref<TripListParams>({ ...defaultTripQuery })

  async function fetchTrips(params?: TripListParams) {
    if (page.value === 1) {
      currentQuery.value = { ...defaultTripQuery, ...params }
    }

    loading.value = true
    try {
      const res = await tripApi.list({
        page: page.value,
        pageSize: pageSize.value,
        ...currentQuery.value,
      }) as PaginatedResponse<Trip>
      if (page.value === 1) {
        trips.value = res.list
      } else {
        trips.value = [...trips.value, ...res.list]
      }
      total.value = res.total
      hasMore.value = res.hasMore
    } finally {
      loading.value = false
    }
  }

  async function fetchTripDetail(id: number) {
    loading.value = true
    try {
      currentTrip.value = await tripApi.getDetail(id) as Trip
    } finally {
      loading.value = false
    }
  }

  function resetList() {
    page.value = 1
    trips.value = []
    hasMore.value = true
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return

    page.value += 1
    try {
      await fetchTrips()
    } catch (error) {
      page.value -= 1
      throw error
    }
  }

  return {
    trips,
    currentTrip,
    loading,
    total,
    page,
    pageSize,
    hasMore,
    currentQuery,
    fetchTrips,
    fetchTripDetail,
    resetList,
    loadMore,
  }
})
