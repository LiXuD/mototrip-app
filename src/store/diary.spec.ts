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
      });

      await store.fetchDiaries();

      expect(store.diaries).toEqual(mockDiaries);
      expect(store.total).toBe(2);
      expect(store.hasMore).toBe(false);
      expect(store.loading).toBe(false);
    });

    it('should append diaries for subsequent pages', async () => {
      const existingDiaries = [generateMockDiary({ id: 1 })];
      store.diaries = [...existingDiaries];
      store.page = 2;

      const newDiaries = [generateMockDiary({ id: 2 })];
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: newDiaries,
        total: 3,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      });

      await store.fetchDiaries();

      expect(store.diaries).toHaveLength(2);
      expect(store.diaries[1].id).toBe(2);
      expect(store.hasMore).toBe(true);
    });

    it('should set loading state correctly', async () => {
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
      });

      const fetchPromise = store.fetchDiaries();
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should pass params to API', async () => {
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const diaryApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: listSpy,
      });

      await store.fetchDiaries({ tripId: 1, userId: 2 });

      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        tripId: 1,
        userId: 2,
      });
    });
  });

  describe('likeDiary', () => {
    it('should call like API and update likes count', async () => {
      const mockDiary = generateMockDiary({ id: 1, likes: 10 });
      store.diaries= [mockDiary];

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        like: vi.fn().mockResolvedValue({}),
      });

      await store.likeDiary(1);

      expect(store.diaries[0].likes).toBe(11);
    });

    it('should not throw if diary not found', async () => {
      const mockDiary = generateMockDiary({ id: 1 });
      store.diaries= [mockDiary];

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        like: vi.fn().mockResolvedValue({}),
      });

      // Should not throw
      await store.likeDiary(999);
    });
  });

  describe('resetList', () => {
    it('should reset list state', () => {
      store.diaries= [generateMockDiary({ id: 1 })];
      store.page= 5;
      store.hasMore= false;

      store.resetList();

      expect(store.page).toBe(1);
      expect(store.diaries).toEqual([]);
      expect(store.hasMore).toBe(true);
    });
  });

  describe('loadMore', () => {
    it('should load more when has more data', async () => {
      store.hasMore= true;
      store.loading= false;
      store.page= 1;

      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockDiary>> = {
        list: [generateMockDiary({ id: 2 })],
        total: 5,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const diaryApi = await import('@/services/api');
      vi.spyOn(diaryApi, 'diaryApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      });

      await store.loadMore();

      expect(store.page).toBe(2);
    });

    it('should not load more when already loading', () => {
      store.hasMore= true;
      store.loading= true;
      store.page= 1;

      store.loadMore();

      expect(store.page).toBe(1);
    });

    it('should not load more when no more data', () => {
      store.hasMore= false;
      store.loading= false;
      store.page= 1;

      store.loadMore();

      expect(store.page).toBe(1);
    });
});

});
