import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDiaryStore } from './diary';
import { generateMockDiary, createUniMock } from '../test/utils/test-helpers';
import type { PaginatedResponse } from '../types';

// Mock uni API
vi.stubGlobal('uni', createUniMock());

describe('Diary Store', () => {
  let store: ReturnType<typeof useDiaryStore>;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDiaryStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      expect(store.diaries).toEqual([]);
      expect(store.currentDiary).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.total).toBe(0);
      expect(store.page).toBe(1);
      expect(store.pageSize).toBe(10);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({
        tripId: undefined,
        userId: undefined,
        tag: undefined,
      });
    });
  });

  describe('fetchDiaries', () => {
    it('should fetch diaries successfully for first page', async () => {
      const mockDiaries = [
        generateMockDiary({ id: 1, likes: 10 }),
        generateMockDiary({ id: 2, likes: 20 }),
      ];
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: mockDiaries,
        total: 2,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.fetchDiaries();

      expect(store.diaries).toEqual(mockDiaries);
      expect(store.total).toBe(2);
      expect(store.hasMore).toBe(false);
      expect(store.loading).toBe(false);
    });

    it('should append diaries for subsequent pages', async () => {
      store.page = 2;
      
      const existingDiaries = [generateMockDiary({ id: 1 })];
      store.diaries = [...existingDiaries];
      store.currentQuery = { tripId: 1, userId: 2, tag: 'repair' };

      const newDiaries = [generateMockDiary({ id: 2 })];
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: newDiaries,
        total: 3,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const diaryApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: listSpy,
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.fetchDiaries();

      expect(listSpy).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        tripId: 1,
        userId: 2,
        tag: 'repair',
      });
      expect(store.currentQuery).toEqual({
        tripId: 1,
        userId: 2,
        tag: 'repair',
      });
    });

    it('should handle API call failure', async () => {
      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('API Error')),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await expect(store.fetchDiaries()).rejects.toThrow('API Error');
    });

    it('should handle network timeout', async () => {
      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('Request timeout')),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await expect(store.fetchDiaries()).rejects.toThrow('Request timeout');
    });
  });

  describe('likeDiary', () => {
    it('should call like API and update likes count', async () => {
      const mockDiary = generateMockDiary({ id: 1, likes: 10 });
      store.diaries = [mockDiary];

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue({}),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.likeDiary(1);

      expect(store.diaries[0].likes).toBe(11);
    });

    it('should not throw if diary not found', async () => {
      const mockDiary = generateMockDiary({ id: 1 });
      store.diaries = [mockDiary];

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue({}),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.likeDiary(999);
    });

    it('should handle like API failure', async () => {
      const mockDiary = generateMockDiary({ id: 1, likes: 10 });
      store.diaries = [mockDiary];

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue({}),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockRejectedValue(new Error('Like failed')),
      } as any);

      await expect(store.likeDiary(1)).rejects.toThrow('Like failed');
    });
  });

  describe('resetList', () => {
    it('should reset list state', () => {
      store.diaries = [generateMockDiary({ id: 1 })];
      store.page = 5;
      store.hasMore = false;
      store.currentQuery = { tripId: undefined, userId: 2, tag: 'repair' };

      store.resetList();

      expect(store.page).toBe(1);
      expect(store.diaries).toEqual([]);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({ tripId: undefined, userId: 2, tag: 'repair' });
    });
  });

  describe('loadMore', () => {
    it('should load more with persisted query when has more data', async () => {
      store.hasMore = true;
      store.loading = false;
      store.page = 1;
      store.currentQuery = { tripId: 1, userId: 2, tag: 'repair' };

      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: [generateMockDiary({ id: 2 })],
        total: 5,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const diaryApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: listSpy,
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.loadMore();
      await store.fetchDiaries();

      expect(store.page).toBe(2);
      expect(listSpy).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        tripId: 1,
        userId: 2,
        tag: 'repair',
      });
    });

    it('should not load more when already loading', async () => {
      store.hasMore = true;
      store.loading = true;
      store.page = 1;

      await store.loadMore();

      expect(store.page).toBe(1);
    });

    it('should not load more when no more data', async () => {
      store.hasMore = false;
      store.loading = false;
      store.page = 1;

      await store.loadMore();

      expect(store.page).toBe(1);
    });
  });

  describe('resetStore', () => {
    it('should reset all store state', () => {
      store.diaries = [generateMockDiary({ id: 1 }), generateMockDiary({ id: 2 })];
      store.currentDiary = generateMockDiary({ id: 1 });
      store.page = 5;
      store.hasMore = false;
      store.total = 100;
      store.currentQuery = { tripId: 1, userId: 2, tag: 'repair' };

      store.resetStore();

      expect(store.diaries).toEqual([]);
      expect(store.currentDiary).toBeNull();
      expect(store.page).toBe(1);
      expect(store.hasMore).toBe(true);
      expect(store.total).toBe(0);
      expect(store.currentQuery).toEqual({
        tripId: undefined,
        userId: undefined,
        tag: undefined,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty data response', async () => {
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.fetchDiaries();

      expect(store.diaries).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.hasMore).toBe(false);
    });

    it('should handle pagination at last page', async () => {
      const mockDiaries = Array.from({ length: 10 }, (_, i) => generateMockDiary({ id: i + 1 }));
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: mockDiaries,
        total: 10,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.fetchDiaries();

      expect(store.hasMore).toBe(false);
      expect(store.page).toBe(1);
    });

    it('should handle single item response', async () => {
      const mockDiaries = [generateMockDiary({ id: 1 })];
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: mockDiaries,
        total: 1,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        like: vi.fn().mockResolvedValue({}),
      } as any);

      await store.fetchDiaries();

      expect(store.diaries).toHaveLength(1);
      expect(store.total).toBe(1);
    });
  });
});
