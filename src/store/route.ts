import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Route, RouteListParams, PaginatedResponse } from '@/types'
import { routeApi } from '@/services/api'

const defaultRouteQuery: RouteListParams = {
  keyword: undefined,
  difficulty: undefined,
  sort: 'desc',
}

export const useRouteStore = defineStore('route', () => {
  const routes = ref<Route[]>([])
  const currentRoute = ref<Route | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)
  const currentQuery = ref<RouteListParams>({ ...defaultRouteQuery })

  function cleanImageUrl(route: Route): Route {
    const cleanedRoute = { ...route }
    if (cleanedRoute.coverImage) {
      cleanedRoute.coverImage = cleanedRoute.coverImage.replace(/^`|`$/g, '')
    }
    return cleanedRoute
  }

  async function fetchRoutes(params?: RouteListParams) {
    if (page.value === 1) {
      currentQuery.value = { ...defaultRouteQuery, ...params }
    }

    loading.value = true
    try {
      const res = await routeApi.list({
        page: page.value,
        pageSize: pageSize.value,
        ...currentQuery.value,
      }) as PaginatedResponse<Route>
      const cleanedList = res.list.map(cleanImageUrl)
      if (page.value === 1) {
        routes.value = cleanedList
      } else {
        routes.value = [...routes.value, ...cleanedList]
      }
      total.value = res.total
      hasMore.value = res.hasMore
    } finally {
      loading.value = false
    }
  }

  async function fetchRouteDetail(id: number) {
    loading.value = true
    try {
      const route = await routeApi.getDetail(id) as Route
      currentRoute.value = cleanImageUrl(route)
    } finally {
      loading.value = false
    }
  }

  function resetList() {
    page.value = 1
    routes.value = []
    hasMore.value = true
  }

  function resetStore() {
    routes.value = []
    currentRoute.value = null
    loading.value = false
    total.value = 0
    page.value = 1
    pageSize.value = 10
    hasMore.value = true
    currentQuery.value = { ...defaultRouteQuery }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return

    page.value += 1
    try {
      await fetchRoutes()
    } catch (error) {
      page.value -= 1
      throw error
    }
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
