import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Preparation, PreparationChecklist } from '@/types'
import { preparationApi } from '@/services/api'

export const usePreparationStore = defineStore('preparation', () => {
  const items = ref<Preparation[]>([])
  const loading = ref(false)
  const packedCount = computed(() => items.value.filter(i => i.isPacked).length)
  const totalCount = computed(() => items.value.length)
  const progress = computed(() => totalCount.value > 0 ? Math.round((packedCount.value / totalCount.value) * 100) : 0)

  const groupedItems = computed<PreparationChecklist[]>(() => {
    const categories = ['tool', 'safety', 'clothing', 'electronics', 'documents', 'other']
    const categoryNames: Record<string, string> = {
      tool: '工具',
      safety: '安全装备',
      clothing: '骑行服饰',
      electronics: '电子设备',
      documents: '证件',
      other: '其他',
    }
    
    return categories.map(cat => ({
      category: categoryNames[cat] || cat,
      items: items.value.filter(i => i.category === cat),
    })).filter(g => g.items.length > 0)
  })

  async function fetchPreparations() {
    loading.value = true
    try {
      items.value = await preparationApi.list() as Preparation[]
    } finally {
      loading.value = false
    }
  }

  async function togglePacked(id: number) {
    await preparationApi.togglePacked(id)
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.isPacked = !item.isPacked
    }
  }

  async function addItem(data: Partial<Preparation>) {
    const newItem = await preparationApi.create(data) as Preparation
    items.value.push(newItem)
  }

  async function removeItem(id: number) {
    await preparationApi.delete(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  return {
    items,
    loading,
    packedCount,
    totalCount,
    progress,
    groupedItems,
    fetchPreparations,
    togglePacked,
    addItem,
    removeItem,
  }
})
