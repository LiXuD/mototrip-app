import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePreparationStore } from './preparation';
import { generateMockPreparation, createUniMock } from '../test/utils/test-helpers';

// Mock uni API
vi.stubGlobal('uni', createUniMock());

describe('Preparation Store', () => {
  let store: ReturnType<typeof usePreparationStore>;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    store = usePreparationStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      expect(store.items).toEqual([]);
      expect(store.loading).toBe(false);
    });

    it('should have correct initial computed values', () => {
      expect(store.packedCount).toBe(0);
      expect(store.totalCount).toBe(0);
      expect(store.progress).toBe(0);
      expect(store.groupedItems).toEqual([]);
    });
  });

  describe('fetchPreparations', () => {
    it('should fetch preparations successfully', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1, isPacked: true }),
        generateMockPreparation({ id: 2, isPacked: false }),
        generateMockPreparation({ id: 3, isPacked: true }),
      ];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockPreparations),
      });

      await store.fetchPreparations();

      expect(store.items).toEqual(mockPreparations);
      expect(store.loading).toBe(false);
    });

    it('should set loading state correctly', async () => {
      const mockPreparations: ReturnType<typeof generateMockPreparation>[] = [];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockPreparations),
      });

      const fetchPromise = store.fetchPreparations();
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should update computed values after fetch', async () => {
      const mockPreparations = [
        generateMockPreparation({ isPacked: true }),
        generateMockPreparation({ isPacked: false }),
        generateMockPreparation({ isPacked: true }),
        generateMockPreparation({ isPacked: false }),
      ];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockPreparations),
      });

      await store.fetchPreparations();

      expect(store.totalCount).toBe(4);
      expect(store.packedCount).toBe(2);
      expect(store.progress).toBe(50);
    });

    it('should handle API call failure', async () => {
      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('API Error')),
      });

      await expect(store.fetchPreparations()).rejects.toThrow('API Error');
    });

    it('should handle network timeout', async () => {
      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('Request timeout')),
      });

      await expect(store.fetchPreparations()).rejects.toThrow('Request timeout');
    });
  });

  describe('togglePacked', () => {
    it('should toggle packed status successfully', async () => {
      const mockPreparation = generateMockPreparation({ id: 1, isPacked: false });
      store.items = [mockPreparation];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        togglePacked: vi.fn().mockResolvedValue({}),
      });

      await store.togglePacked(1);

      expect(store.items[0].isPacked).toBe(true);
    });

    it('should toggle back to unpacked', async () => {
      const mockPreparation = generateMockPreparation({ id: 1, isPacked: true });
      store.items = [mockPreparation];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        togglePacked: vi.fn().mockResolvedValue({}),
      });

      await store.togglePacked(1);

      expect(store.items[0].isPacked).toBe(false);
    });

    it('should update computed values after toggle', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1, isPacked: true }),
        generateMockPreparation({ id: 2, isPacked: false }),
      ];
      store.items = [...mockPreparations];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        togglePacked: vi.fn().mockResolvedValue({}),
      });

      await store.togglePacked(2);

      expect(store.packedCount).toBe(2);
      expect(store.progress).toBe(100);
    });

    it('should not throw if item not found', async () => {
      store.items = [generateMockPreparation({ id: 1 })];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        togglePacked: vi.fn().mockResolvedValue({}),
      });

      // Should not throw
      await store.togglePacked(999);
    });
  });

  describe('addItem', () => {
    it('should add new item successfully', async () => {
      const newPreparation = generateMockPreparation({ id: 1, name: 'New Item' });

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        create: vi.fn().mockResolvedValue(newPreparation),
      });

      await store.addItem({ name: 'New Item', category: 'tool' });

      expect(store.items).toHaveLength(1);
      expect(store.items[0].name).toBe('New Item');
    });

    it('should update total count after adding', async () => {
      const newPreparation = generateMockPreparation({ id: 1 });

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        create: vi.fn().mockResolvedValue(newPreparation),
      });

      await store.addItem({ name: 'Test', category: 'tool' });

      expect(store.totalCount).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1 }),
        generateMockPreparation({ id: 2 }),
      ];
      store.items = [...mockPreparations];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        delete: vi.fn().mockResolvedValue({}),
      });

      await store.removeItem(1);

      expect(store.items).toHaveLength(1);
      expect(store.items[0].id).toBe(2);
    });

    it('should update computed values after removing', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1, isPacked: true }),
        generateMockPreparation({ id: 2, isPacked: false }),
      ];
      store.items = [...mockPreparations];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        delete: vi.fn().mockResolvedValue({}),
      });

      await store.removeItem(1);

      expect(store.totalCount).toBe(1);
      expect(store.packedCount).toBe(0);
      expect(store.progress).toBe(0);
    });
  });

  describe('groupedItems computed', () => {
    it('should group items by category', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1, category: 'tool' }),
        generateMockPreparation({ id: 2, category: 'tool' }),
        generateMockPreparation({ id: 3, category: 'safety' }),
      ];
      store.items = [...mockPreparations];

      const grouped = store.groupedItems;

      expect(grouped).toHaveLength(2);
      expect(grouped.find(g => g.category === '工具')?.items).toHaveLength(2);
      expect(grouped.find(g => g.category === '安全装备')?.items).toHaveLength(1);
    });

    it('should filter out empty categories', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1, category: 'tool' }),
      ];
      store.items = [...mockPreparations];

      const grouped = store.groupedItems;

      expect(grouped).toHaveLength(1);
      expect(grouped[0].category).toBe('工具');
    });

    it('should return empty array when no items', () => {
      expect(store.groupedItems).toEqual([]);
    });
  });

  describe('progress computed', () => {
    it('should calculate 0% when no items', () => {
      expect(store.progress).toBe(0);
    });

    it('should calculate 100% when all packed', () => {
      store.items = [
        generateMockPreparation({ isPacked: true }),
        generateMockPreparation({ isPacked: true }),
      ];

      expect(store.progress).toBe(100);
    });

    it('should calculate correct percentage', () => {
      store.items = [
        generateMockPreparation({ isPacked: true }),
        generateMockPreparation({ isPacked: false }),
        generateMockPreparation({ isPacked: false }),
      ];

      expect(store.progress).toBe(33); // 1/3 = 33.33... -> 33
    });
  });

  describe('edge cases', () => {
    it('should handle empty data response', async () => {
      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue([]),
      } as any);

      await store.fetchPreparations();

      expect(store.items).toEqual([]);
      expect(store.totalCount).toBe(0);
      expect(store.packedCount).toBe(0);
      expect(store.progress).toBe(0);
    });

    it('should handle single item', async () => {
      const mockPreparation = generateMockPreparation({ id: 1, isPacked: false });

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue([mockPreparation]),
      } as any);

      await store.fetchPreparations();

      expect(store.items).toHaveLength(1);
      expect(store.totalCount).toBe(1);
      expect(store.packedCount).toBe(0);
      expect(store.progress).toBe(0);
    });

    it('should handle all items already packed', async () => {
      const mockPreparations = [
        generateMockPreparation({ id: 1, isPacked: true }),
        generateMockPreparation({ id: 2, isPacked: true }),
        generateMockPreparation({ id: 3, isPacked: true }),
      ];

      const preparationApiModule = await import('@/services/api');
      vi.spyOn(preparationApiModule, 'preparationApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockPreparations),
      } as any);

      await store.fetchPreparations();

      expect(store.packedCount).toBe(3);
      expect(store.totalCount).toBe(3);
      expect(store.progress).toBe(100);
    });
  });
});
