import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePaginatedList } from './usePaginatedList'
import type { Route, RouteListParams } from '@/types'
import { routeApi } from '@/services/api'

const defaultRouteQuery: RouteListParams = {
  keyword: undefined,
  difficulty: undefined,
  sort: 'desc',
}

export const useRouteStore = defineStore('route', () => {
  const { 
    items: routes, 
    loading, 
    total, 
    page, 
    pageSize, 
    hasMore, 
    currentQuery,
    fetchItems,
    resetList,
    resetStore: resetStoreFn,
    loadMore 
  } = usePaginatedList<Route, RouteListParams>()

  const currentRoute = ref<Route | null>(null)

  async function fetchRoutes(params?: RouteListParams) {
    await fetchItems(routeApi.list, defaultRouteQuery, params)
  }

  async function fetchRouteDetail(id: number) {
    loading.value = true
    try {
      currentRoute.value = await routeApi.getDetail(id) as Route
    } finally {
      loading.value = false
    }
  }

  function resetStore() {
    resetStoreFn(defaultRouteQuery)
    currentRoute.value = null
  }

  return {
    routes,
    currentRoute,
    loading,
    total,
    page,
    pageSize,
    hasMore,
    currentQuery,
    fetchRoutes,
    fetchRouteDetail,
    resetList,
    resetStore,
    loadMore,
  }
})
