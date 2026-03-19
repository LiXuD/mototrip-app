import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from './user';
import { useRouteStore } from './route';
import { useTripStore } from './trip';
import { useDiaryStore } from './diary';
import { generateMockUser, generateMockUserMode, createUniMock } from '../test/utils/test-helpers';

// Mock uni API
vi.stubGlobal('uni', createUniMock());

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const store = useUserStore();
      expect(store.token).toBe('');
      expect(store.userInfo).toBeNull();
      expect(store.userMode).toBeNull();
    });

    it('should not be logged in initially', () => {
      const store = useUserStore();
      expect(store.isLoggedIn).toBe(false);
    });

    it('should have null current mode', () => {
      const store = useUserStore();
      expect(store.currentMode).toBeNull();
    });

    it('should not be in any mode initially', () => {
      const store = useUserStore();
      expect(store.isNewbie).toBe(false);
      expect(store.isExperienced).toBe(false);
      expect(store.isPassenger).toBe(false);
    });
  });

  describe('setToken', () => {
    it('should set token correctly', () => {
      const store = useUserStore();
      const testToken = 'test-token-123';
      
      store.setToken(testToken);
      
      expect(store.token).toBe(testToken);
      expect(uni.setStorageSync).toHaveBeenCalledWith('token', testToken);
    });

    it('should update isLoggedIn when token is set', () => {
      const store = useUserStore();
      store.setToken('new-token');
      expect(store.isLoggedIn).toBe(true);
    });
  });

  describe('setUserInfo', () => {
    it('should set user info correctly', () => {
      const store = useUserStore();
      const mockUser = generateMockUser();
      
      store.setUserInfo(mockUser);
      
      expect(store.userInfo).toEqual(mockUser);
    });
  });

  describe('loadUserMode', () => {
    it('should load user mode successfully', async () => {
      const store = useUserStore();
      const mockUserMode = generateMockUserMode({ mode: 'newbie' });
      
      // Mock API
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(mockUserMode),
      });
      
      // Re-import store with mocked API
      const result = await store.loadUserMode();
      
      expect(store.userMode).toEqual(mockUserMode);
      expect(result).toEqual(mockUserMode);
    });

    it('should return null on error', async () => {
      const store = useUserStore();
      
      // Mock API error
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      });
      
      const result = await store.loadUserMode();
      
      expect(result).toBeNull();
    });
  });

  describe('updateUserMode', () => {
    it('should update user mode successfully', async () => {
      const store = useUserStore();
      const mockUserMode = generateMockUserMode({ mode: 'experienced' });
      
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        update: vi.fn().mockResolvedValue(mockUserMode),
      });
      
      const result = await store.updateUserMode({ maxSpeed: 100 });
      
      expect(store.userMode).toEqual(mockUserMode);
      expect(result).toEqual(mockUserMode);
    });

    it('should throw error on failure', async () => {
      const store = useUserStore();
      
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        update: vi.fn().mockRejectedValue(new Error('Update failed')),
      });
      
      await expect(store.updateUserMode({})).rejects.toThrow('Update failed');
    });
  });

  describe('switchUserMode', () => {
    it('should switch user mode successfully', async () => {
      const store = useUserStore();
      const mockUserMode = generateMockUserMode({ mode: 'passenger' });
      
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        switchMode: vi.fn().mockResolvedValue(mockUserMode),
      });
      
      const result = await store.switchUserMode('passenger');
      
      expect(store.userMode).toEqual(mockUserMode);
      expect(result).toEqual(mockUserMode);
    });
  });

  describe('computed properties', () => {
    it('should correctly identify newbie mode', async () => {
      const store = useUserStore();
      const mockUserMode = generateMockUserMode({ mode: 'newbie' });
      
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(mockUserMode),
      });
      
      await store.loadUserMode();
      
      expect(store.currentMode).toBe('newbie');
      expect(store.isNewbie).toBe(true);
      expect(store.isExperienced).toBe(false);
      expect(store.isPassenger).toBe(false);
    });

    it('should correctly identify experienced mode', async () => {
      const store = useUserStore();
      const mockUserMode = generateMockUserMode({ mode: 'experienced' });
      
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(mockUserMode),
      });
      
      await store.loadUserMode();
      
      expect(store.currentMode).toBe('experienced');
      expect(store.isNewbie).toBe(false);
      expect(store.isExperienced).toBe(true);
      expect(store.isPassenger).toBe(false);
    });

    it('should correctly identify passenger mode', async () => {
      const store = useUserStore();
      const mockUserMode = generateMockUserMode({ mode: 'passenger' });
      
      const userModeApi = await import('@/services/api');
      vi.spyOn(userModeApi, 'userModeApi', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(mockUserMode),
      });
      
      await store.loadUserMode();
      
      expect(store.currentMode).toBe('passenger');
      expect(store.isNewbie).toBe(false);
      expect(store.isExperienced).toBe(false);
      expect(store.isPassenger).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear all user and list store data on logout', () => {
      const store = useUserStore();
      const routeStore = useRouteStore();
      const tripStore = useTripStore();
      const diaryStore = useDiaryStore();
      
      // Setup state
      store.setToken('test-token');
      store.setUserInfo(generateMockUser());
      routeStore.routes = [{ id: 1 } as any];
      routeStore.currentQuery = { keyword: 'mountain', difficulty: 'hard', sort: 'asc' };
      routeStore.hasMore = false;
      routeStore.page = 3;
      tripStore.trips = [{ id: 2 } as any];
      tripStore.currentQuery = { status: 'completed' };
      tripStore.hasMore = false;
      tripStore.page = 2;
      diaryStore.diaries = [{ id: 3 } as any];
      diaryStore.currentQuery = { tripId: 1, userId: 2, tag: 'repair' };
      diaryStore.hasMore = false;
      diaryStore.page = 4;
      
      store.logout();
      
      expect(store.token).toBe('');
      expect(store.userInfo).toBeNull();
      expect(store.userMode).toBeNull();
      expect(store.isLoggedIn).toBe(false);
      expect(routeStore.routes).toEqual([]);
      expect(routeStore.currentQuery).toEqual({ keyword: undefined, difficulty: undefined, sort: 'desc' });
      expect(routeStore.hasMore).toBe(true);
      expect(routeStore.page).toBe(1);
      expect(tripStore.trips).toEqual([]);
      expect(tripStore.currentQuery).toEqual({ status: undefined });
      expect(tripStore.hasMore).toBe(true);
      expect(tripStore.page).toBe(1);
      expect(diaryStore.diaries).toEqual([]);
      expect(diaryStore.currentQuery).toEqual({ tripId: undefined, userId: undefined, tag: undefined });
      expect(diaryStore.hasMore).toBe(true);
      expect(diaryStore.page).toBe(1);
      expect(uni.removeStorageSync).toHaveBeenCalledWith('token');
    });
  });
});
