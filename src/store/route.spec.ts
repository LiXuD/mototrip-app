import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRouteStore } from './route';
import { generateMockRoute, createUniMock } from '../test/utils/test-helpers';

// Mock uni API
vi.stubGlobal('uni', createUniMock());

describe('Route Store', () => {
  let store: ReturnType<typeof useRouteStore>;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    store = useRouteStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      expect(store.routes).toEqual([]);
      expect(store.currentRoute).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.total).toBe(0);
      expect(store.page).toBe(1);
      expect(store.pageSize).toBe(10);
      expect(store.hasMore).toBe(true);
    });
  });

  describe('fetchRoutes', () => {
    it('should fetch routes successfully for first page', async () => {
      const mockRoutes = [
        generateMockRoute({ id: 1 }),
        generateMockRoute({ id: 2 }),
      ];
      const mockResponse = {
        list: mockRoutes,
        total: 2,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      });

      await store.fetchRoutes();

      expect(store.routes).toEqual(mockRoutes);
      expect(store.total).toBe(2);
      expect(store.hasMore).toBe(false);
      expect(store.loading).toBe(false);
    });

    it('should append routes for subsequent pages', async () => {
      const existingRoutes = [generateMockRoute({ id: 1 })];
      store.routes= [...existingRoutes];
      store.page= 2;

      const newRoutes = [generateMockRoute({ id: 2 })];
      const mockResponse = {
        list: newRoutes,
        total: 3,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      });

      await store.fetchRoutes();

      expect(store.routes).toHaveLength(2);
      expect(store.routes[1].id).toBe(2);
      expect(store.hasMore).toBe(true);
    });

    it('should set loading state correctly', async () => {
      const mockResponse = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      });

      const fetchPromise = store.fetchRoutes();
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should pass search params to API', async () => {
      const mockResponse = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const routeApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: listSpy,
      });

      await store.fetchRoutes({ keyword: 'mountain', difficulty: 'hard' });

      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: 'mountain',
        difficulty: 'hard',
      });
    });
  });

  describe('fetchRouteDetail', () => {
    it('should fetch route detail successfully', async () => {
      const mockRoute = generateMockRoute({ id: 123 });

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        getDetail: vi.fn().mockResolvedValue(mockRoute),
      });

      await store.fetchRouteDetail(123);

      expect(store.currentRoute).toEqual(mockRoute);
      expect(store.loading).toBe(false);
    });

    it('should set loading during fetch', async () => {
      const mockRoute = generateMockRoute({ id: 123 });

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        getDetail: vi.fn().mockResolvedValue(mockRoute),
      });

      const fetchPromise = store.fetchRouteDetail(123);
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });
  });

  describe('resetList', () => {
    it('should reset list state', () => {
      store.routes= [generateMockRoute({ id: 1 })];
      store.page= 5;
      store.hasMore= false;

      store.resetList();

      expect(store.page).toBe(1);
      expect(store.routes).toEqual([]);
      expect(store.hasMore).toBe(true);
    });
  });

  describe('loadMore', () => {
    it('should load more when has more data', async () => {
      store.hasMore= true;
      store.loading= false;
      store.page= 1;

      const mockResponse = {
        list: [generateMockRoute({ id: 2 })],
        total: 5,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
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
      store.hasMore = false;
      store.loading = false;
      store.page = 1;

      store.loadMore();
  });
});

});
