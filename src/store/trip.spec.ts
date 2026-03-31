import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTripStore } from './trip';
import { generateMockTrip, createUniMock } from '../test/utils/test-helpers';
import type { Trip, PaginatedResponse } from '../types';

// Mock uni API
vi.stubGlobal('uni', createUniMock());

describe('Trip Store', () => {
  let store: ReturnType<typeof useTripStore>;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    store = useTripStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      expect(store.trips).toEqual([]);
      expect(store.currentTrip).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.total).toBe(0);
      expect(store.page).toBe(1);
      expect(store.pageSize).toBe(10);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({
        status: undefined,
      });
    });
  });

  describe('fetchTrips', () => {
    it('should fetch trips successfully for first page', async () => {
      const mockTrips = [
        generateMockTrip({ id: 1 }),
        generateMockTrip({ id: 2 }),
      ];
      const mockResponse: PaginatedResponse<ReturnType<typeof generateMockTrip>> = {
        list: mockTrips,
        total: 2,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTrips();

      expect(store.trips).toEqual(mockTrips);
      expect(store.total).toBe(2);
      expect(store.hasMore).toBe(false);
      expect(store.loading).toBe(false);
    });

    it('should append trips for subsequent pages', async () => {
      const existingTrips = [generateMockTrip({ id: 1 })];
      store.trips = [...existingTrips];
      store.page = 2;
      store.currentQuery = { status: 'completed' };

      const newTrips = [generateMockTrip({ id: 2 })];
      const mockResponse: PaginatedResponse<Trip> = {
        list: newTrips,
        total: 3,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTrips();

      expect(store.trips).toHaveLength(2);
      expect(store.trips[1].id).toBe(2);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({ status: 'completed' });
    });

    it('should set loading state correctly', async () => {
      const mockResponse: PaginatedResponse<Trip> = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      const fetchPromise = store.fetchTrips();
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should pass params to API and persist query on first page', async () => {
      const mockResponse: PaginatedResponse<Trip> = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const tripApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: listSpy,
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTrips({ status: 'completed' });

      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        status: 'completed',
      });
      expect(store.currentQuery).toEqual({ status: 'completed' });
    });

    it('should handle API call failure', async () => {
      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('API Error')),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await expect(store.fetchTrips()).rejects.toThrow('API Error');
    });

    it('should handle network timeout', async () => {
      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockRejectedValue(new Error('Request timeout')),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await expect(store.fetchTrips()).rejects.toThrow('Request timeout');
    });
  });

  describe('fetchTripDetail', () => {
    it('should fetch trip detail successfully', async () => {
      const mockTrip = generateMockTrip({ id: 123 });

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn(),
        getDetail: vi.fn().mockResolvedValue(mockTrip),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTripDetail(123);

      expect(store.currentTrip).toEqual(mockTrip);
      expect(store.loading).toBe(false);
    });

    it('should set loading during fetch', async () => {
      const mockTrip = generateMockTrip({ id: 123 });

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn(),
        getDetail: vi.fn().mockResolvedValue(mockTrip),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      const fetchPromise = store.fetchTripDetail(123);
      
      expect(store.loading).toBe(true);
      
      await fetchPromise;
      
      expect(store.loading).toBe(false);
    });

    it('should handle API call failure', async () => {
      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn(),
        getDetail: vi.fn().mockRejectedValue(new Error('API Error')),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await expect(store.fetchTripDetail(123)).rejects.toThrow('API Error');
    });
  });

  describe('resetList', () => {
    it('should reset list state', () => {
      store.trips = [generateMockTrip({ id: 1 })];
      store.page = 5;
      store.hasMore = false;
      store.currentQuery = { status: 'completed' };

      store.resetList();

      expect(store.page).toBe(1);
      expect(store.trips).toEqual([]);
      expect(store.hasMore).toBe(true);
      expect(store.currentQuery).toEqual({ status: 'completed' });
    });
  });

  describe('loadMore', () => {
    it('should load more with persisted query when has more data', async () => {
      store.hasMore = true;
      store.loading = false;
      store.page = 1;
      store.currentQuery = { status: 'completed' };

      const mockResponse: PaginatedResponse<Trip> = {
        list: [generateMockTrip({ id: 2 })],
        total: 5,
        page: 2,
        pageSize: 10,
        hasMore: true,
      };

      const tripApi = await import('@/services/api');
      const listSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: listSpy,
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.loadMore();
      await store.fetchTrips();

      expect(store.page).toBe(2);
      expect(listSpy).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        status: 'completed',
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
      store.trips = [generateMockTrip({ id: 1 }), generateMockTrip({ id: 2 })];
      store.currentTrip = generateMockTrip({ id: 1 });
      store.page = 5;
      store.hasMore = false;
      store.total = 100;
      store.currentQuery = { status: 'completed' };

      store.resetStore();

      expect(store.trips).toEqual([]);
      expect(store.currentTrip).toBeNull();
      expect(store.page).toBe(1);
      expect(store.hasMore).toBe(true);
      expect(store.total).toBe(0);
      expect(store.currentQuery).toEqual({ status: undefined });
    });
  });

  describe('edge cases', () => {
    it('should handle empty data response', async () => {
      const mockResponse: PaginatedResponse<Trip> = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTrips();

      expect(store.trips).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.hasMore).toBe(false);
    });

    it('should handle pagination at last page', async () => {
      const mockTrips = Array.from({ length: 10 }, (_, i) => generateMockTrip({ id: i + 1 }));
      const mockResponse: PaginatedResponse<Trip> = {
        list: mockTrips,
        total: 10,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTrips();

      expect(store.hasMore).toBe(false);
      expect(store.page).toBe(1);
    });

    it('should handle single item response', async () => {
      const mockTrips = [generateMockTrip({ id: 1 })];
      const mockResponse: PaginatedResponse<Trip> = {
        list: mockTrips,
        total: 1,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const tripApi = await import('@/services/api');
      vi.spyOn(tripApi, 'tripApi', 'get').mockReturnValue({
        list: vi.fn().mockResolvedValue(mockResponse),
        getDetail: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as unknown as typeof tripApi.tripApi);

      await store.fetchTrips();

      expect(store.trips).toHaveLength(1);
      expect(store.total).toBe(1);
    });
  });
});
