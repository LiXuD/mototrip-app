import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Trip, PaginatedResponse } from '@/types'
import { tripApi } from '@/services/api'

export const useTripStore = defineStore('trip', () => {
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)

  async function fetchTrips(params?: { status?: string }) {
    loading.value = true
    try {
      const res = await tripApi.list({ page: page.value, pageSize: pageSize.value, ...params }) as PaginatedResponse<Trip>
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

  function loadMore() {
    if (hasMore.value && !loading.value) {
      page.value++
      fetchTrips()
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
    fetchTrips,
    fetchTripDetail,
    resetList,
    loadMore,
  }
})
