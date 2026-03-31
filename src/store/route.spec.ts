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
      expect(store.currentQuery).toEqual({});
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
      } as any);

      await store.fetchRoutes();

      expect(store.routes).toEqual(mockRoutes);
      expect(store.total).toBe(2);
      expect(store.hasMore).toBe(false);
      expect(store.loading).toBe(false);
    });

    it('should append routes for subsequent pages', async () => {
      const existingRoutes = [generateMockRoute({ id: 1 })];
      store.routes = [...existingRoutes];
      store.page = 2;
      store.currentQuery = {
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      };

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
      } as any);

      await store.fetchRoutes();

      expect(store.routes).toHaveLength(2);
      expect(store.routes[1].id).toBe(2);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      });
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
      } as any);

      const fetchPromise = store.fetchRoutes();
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should pass search params to API and persist query on first page', async () => {
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
      } as any);

      await store.fetchRoutes({ keyword: 'mountain', difficulty: 'hard', sort: 'asc' });

      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      });
      expect(store.currentQuery).toEqual({
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      });
    });

    it('should handle API call failure', async () => {
      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      await expect(store.fetchRoutes()).rejects.toThrow('API Error');
    });

    it('should handle network timeout', async () => {
      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('Request timeout')),
      } as any);

      await expect(store.fetchRoutes()).rejects.toThrow('Request timeout');
    });
  });

  describe('fetchRouteDetail', () => {
    it('should fetch route detail successfully', async () => {
      const mockRoute = generateMockRoute({ id: 123 });

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        getDetail: vi.fn().mockResolvedValue(mockRoute),
      } as any);

      await store.fetchRouteDetail(123);

      expect(store.currentRoute).toEqual(mockRoute);
      expect(store.loading).toBe(false);
    });

    it('should set loading during fetch', async () => {
      const mockRoute = generateMockRoute({ id: 123 });

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        getDetail: vi.fn().mockResolvedValue(mockRoute),
      } as any);

      const fetchPromise = store.fetchRouteDetail(123);
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should handle API call failure', async () => {
      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        getDetail: vi.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      await expect(store.fetchRouteDetail(123)).rejects.toThrow('API Error');
    });
  });

  describe('resetList', () => {
    it('should reset list state', () => {
      store.routes = [generateMockRoute({ id: 1 })];
      store.page = 5;
      store.hasMore = false;
      store.currentQuery = {
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      };

      store.resetList();

      expect(store.page).toBe(1);
      expect(store.routes).toEqual([]);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      });
    });
  });

  describe('loadMore', () => {
    it('should load more with persisted query when has more data', async () => {
      store.hasMore = true;
      store.loading = false;
      store.page = 1;
      store.currentQuery = {
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
      };

      const mockResponse = {
        list: [generateMockRoute({ id: 2 })],
        total: 5,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const routeApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: listSpy,
        getDetail: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      } as any);

      await store.loadMore();
      await store.fetchRoutes();

      expect(store.page).toBe(2);
      expect(listSpy).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        keyword: 'mountain',
        difficulty: 'hard',
        sort: 'asc',
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
      store.routes = [generateMockRoute({ id: 1 }), generateMockRoute({ id: 2 })];
      store.currentRoute = generateMockRoute({ id: 1 });
      store.page = 5;
      store.hasMore = false;
      store.total = 100;
      store.currentQuery = { keyword: 'test', difficulty: 'hard', sort: 'asc' };

      store.resetStore();

      expect(store.routes).toEqual([]);
      expect(store.currentRoute).toBeNull();
      expect(store.page).toBe(1);
      expect(store.hasMore).toBe(true);
      expect(store.total).toBe(0);
      expect(store.currentQuery).toEqual({
        keyword: undefined,
        difficulty: undefined,
        sort: 'desc',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty data response', async () => {
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
      } as any);

      await store.fetchRoutes();

      expect(store.routes).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.hasMore).toBe(false);
    });

    it('should handle pagination at last page', async () => {
      const mockRoutes = Array.from({ length: 10 }, (_, i) => generateMockRoute({ id: i + 1 }));
      const mockResponse = {
        list: mockRoutes,
        total: 10,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      await store.fetchRoutes();

      expect(store.hasMore).toBe(false);
      expect(store.page).toBe(1);
    });

    it('should handle single item response', async () => {
      const mockRoutes = [generateMockRoute({ id: 1 })];
      const mockResponse = {
        list: mockRoutes,
        total: 1,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const routeApi = await import('@/services/api');
      vi.spyOn(routeApi, 'routeApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      await store.fetchRoutes();

      expect(store.routes).toHaveLength(1);
      expect(store.total).toBe(1);
    });
  });
});
