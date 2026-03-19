/**
 * 前端测试工具和Mock数据生成器
 * 位于: src/test/utils/test-helpers.ts
 */

/**
 * 生成随机字符串
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 生成随机数字
 */
export const generateRandomNumber = (min: number = 1, max: number = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机经纬度
 */
export const generateRandomCoordinate = () => {
  return {
    latitude: Math.random() * 180 - 90, // -90 to 90
    longitude: Math.random() * 360 - 180, // -180 to 180
  };
};

/**
 * 生成随机日期
 */
export const generateRandomDate = (startDate: Date = new Date(2020, 0, 1), endDate: Date = new Date()): Date => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

/**
 * 生成随机布尔值
 */
export const generateRandomBoolean = (): boolean => {
  return Math.random() > 0.5;
};

/**
 * 随机选择数组中的一个元素
 */
export const randomPick = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 生成模拟用户数据
 */
export const generateMockUser = (overrides = {}) => ({
  id: generateRandomNumber(),
  username: `user_${generateRandomString(8)}`,
  nickname: `nickname_${generateRandomString(6)}`,
  email: `${generateRandomString(8)}@test.com`,
  phone: `138${generateRandomNumber(10000000, 99999999)}`,
  avatar: `https://example.com/avatar/${generateRandomNumber(1, 100)}.jpg`,
  bio: 'Test user bio',
  motorcycleModel: 'Honda CB500X',
  licenseType: 'E',
  createdAt: generateRandomDate(),
  ...overrides,
});

/**
 * 生成模拟行程数据
 */
export const generateMockTrip = (overrides = {}) => ({
  id: generateRandomNumber(),
  userId: generateRandomNumber(),
  title: `Trip ${generateRandomString(10)}`,
  description: 'Test trip description',
  coverImage: `https://example.com/trip/${generateRandomNumber(1, 50)}.jpg`,
  status: 'planning',
  startDate: generateRandomDate(),
  endDate: generateRandomDate(),
  distance: generateRandomNumber(100, 5000),
  estimatedDays: generateRandomNumber(3, 30),
  routePoints: [],
  waypoints: [],
  createdAt: generateRandomDate(),
  ...overrides,
});

/**
 * 生成模拟路线点数据
 */
export const generateMockWaypoint = (overrides = {}) => {
  const coord = generateRandomCoordinate();
  return {
    id: generateRandomNumber(),
    tripId: generateRandomNumber(),
    name: `Waypoint ${generateRandomString(8)}`,
    type: randomPick(['scenic', 'rest', 'gas', 'repair', 'food', 'hotel', 'custom']),
    latitude: coord.latitude,
    longitude: coord.longitude,
    altitude: generateRandomNumber(0, 5000),
    description: 'Test waypoint',
    photos: [],
    order: generateRandomNumber(1, 100),
    createdAt: generateRandomDate(),
    ...overrides,
  };
};

/**
 * 生成模拟日记数据
 */
export const generateMockDiary = (overrides = {}) => {
  const coord = generateRandomCoordinate();
  return {
    id: generateRandomNumber(),
    userId: generateRandomNumber(),
    tripId: generateRandomNumber(),
    title: `Diary ${generateRandomString(10)}`,
    content: 'Test diary content',
    location: `Location ${generateRandomString(6)}`,
    latitude: coord.latitude,
    longitude: coord.longitude,
    mood: randomPick(['happy', 'excited', 'tired', 'peaceful', 'adventurous']),
    likesCount: generateRandomNumber(0, 100),
    commentsCount: generateRandomNumber(0, 50),
    images: [],
    createdAt: generateRandomDate(),
    ...overrides,
  };
};

/**
 * 生成模拟路线数据
 */
export const generateMockRoute = (overrides = {}) => ({
  id: generateRandomNumber(),
  tripId: generateRandomNumber(),
  name: `Route ${generateRandomString(10)}`,
  type: randomPick(['recommended', 'custom', 'estimated']),
  waypoints: [],
  distance: generateRandomNumber(100, 3000),
  duration: generateRandomNumber(1, 72),
  elevationGain: generateRandomNumber(0, 5000),
  difficulty: randomPick(['easy', 'moderate', 'hard', 'expert']),
  roadConditions: randomPick(['good', 'fair', 'poor', 'mixed']),
  scenery: generateRandomNumber(1, 10),
  createdAt: generateRandomDate(),
  ...overrides,
});

/**
 * 生成模拟危险区域数据
 */
export const generateMockDangerZone = (overrides = {}) => {
  const coord = generateRandomCoordinate();
  return {
    id: generateRandomNumber(),
    name: `Danger Zone ${generateRandomString(8)}`,
    type: randomPick(['roadwork', 'accident', ' landslide', 'flood', 'police', 'speedcamera']),
    latitude: coord.latitude,
    longitude: coord.longitude,
    radius: generateRandomNumber(100, 5000),
    severity: randomPick(['low', 'medium', 'high', 'critical']),
    description: 'Test danger zone',
    startTime: generateRandomDate(),
    endTime: generateRandomDate(),
    active: generateRandomBoolean(),
    createdAt: generateRandomDate(),
    ...overrides,
  };
};

/**
 * 生成模拟天气数据
 */
export const generateMockWeather = (overrides = {}) => ({
  location: `Location ${generateRandomString(6)}`,
  latitude: Math.random() * 180 - 90,
  longitude: Math.random() * 360 - 180,
  temperature: generateRandomNumber(-10, 40),
  feelsLike: generateRandomNumber(-10, 40),
  humidity: generateRandomNumber(0, 100),
  windSpeed: generateRandomNumber(0, 50),
  windDirection: randomPick(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']),
  condition: randomPick(['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'stormy']),
  visibility: generateRandomNumber(1, 20),
  uvIndex: generateRandomNumber(0, 11),
  precipitation: generateRandomNumber(0, 100),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * 创建 Vue Router Mock
 */
export const createRouterMock = (overrides = {}) => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn(),
  ...overrides,
});

/**
 * 创建 Uni API Mock
 */
export const createUniMock = () => ({
  showToast: vi.fn(),
  showModal: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  reLaunch: vi.fn(),
  switchTab: vi.fn(),
  navigateBack: vi.fn(),
  getStorageSync: vi.fn(),
  setStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
  getLocation: vi.fn(),
  request: vi.fn(),
  ...vi.fn(),
});

/**
 * 生成模拟整备数据
 */
export const generateMockPreparation = (overrides = {}) => ({
  id: generateRandomNumber(),
  name: `Item ${generateRandomString(8)}`,
  category: randomPick(['tool', 'safety', 'clothing', 'electronics', 'documents', 'other']),
  description: 'Test preparation item',
  isEssential: generateRandomBoolean(),
  isPacked: generateRandomBoolean(),
  quantity: generateRandomNumber(1, 10),
  userId: generateRandomNumber(),
  createdAt: generateRandomDate().toISOString(),
  updatedAt: generateRandomDate().toISOString(),
  ...overrides,
});

/**
 * 生成模拟用户模式设置数据
 */
export const generateMockUserMode = (overrides = {}) => ({
  id: generateRandomNumber(),
  userId: generateRandomNumber(),
  mode: randomPick(['newbie', 'experienced', 'passenger']),
  maxRideDistance: generateRandomNumber(100, 500),
  maxSpeed: generateRandomNumber(60, 120),
  enableDistanceReminder: generateRandomBoolean(),
  enableSpeedReminder: generateRandomBoolean(),
  enableDangerWarning: generateRandomBoolean(),
  enableSimplifiedUI: generateRandomBoolean(),
  enableComfortMode: generateRandomBoolean(),
  enableProfessionalFeatures: generateRandomBoolean(),
  createdAt: generateRandomDate().toISOString(),
  updatedAt: generateRandomDate().toISOString(),
  ...overrides,
});
