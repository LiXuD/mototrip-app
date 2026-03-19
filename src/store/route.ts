import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Route } from '@/types'
import { routeApi } from '@/services/api'

export const useRouteStore = defineStore('route', () => {
  const routes = ref<Route[]>([])
  const currentRoute = ref<Route | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)

  async function fetchRoutes(params?: { keyword?: string; difficulty?: string }) {
    loading.value = true
    try {
      const res = await routeApi.list({ page: page.value, pageSize: pageSize.value, ...params })
      if (page.value === 1) {
        routes.value = res.list as Route[]
      } else {
        routes.value = [...routes.value, ...(res.list as Route[])]
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
      currentRoute.value = await routeApi.getDetail(id) as Route
    } finally {
      loading.value = false
    }
  }

  function resetList() {
    page.value = 1
    routes.value = []
    hasMore.value = true
  }

  function loadMore() {
    if (hasMore.value && !loading.value) {
      page.value++
      fetchRoutes()
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
    fetchRoutes,
    fetchRouteDetail,
    resetList,
    loadMore,
  }
})
