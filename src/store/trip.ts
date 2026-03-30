import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePaginatedList } from './usePaginatedList'
import type { Trip, TripListParams } from '@/types'
import { tripApi } from '@/services/api'

const defaultTripQuery: TripListParams = {
  status: undefined,
}

export const useTripStore = defineStore('trip', () => {
  const {
    items: trips,
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
  } = usePaginatedList<Trip, TripListParams>()

  const currentTrip = ref<Trip | null>(null)

  async function fetchTrips(params?: TripListParams) {
    await fetchItems(tripApi.list, defaultTripQuery, params)
  }

  async function fetchTripDetail(id: number) {
    loading.value = true
    try {
      currentTrip.value = await tripApi.getDetail(id) as Trip
    } finally {
      loading.value = false
    }
  }

  function resetStore() {
    resetStoreFn(defaultTripQuery)
    currentTrip.value = null
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
    resetStore,
    loadMore,
  }
})
