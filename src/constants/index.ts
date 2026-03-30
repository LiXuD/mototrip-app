// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SEARCH_HISTORY: 'searchHistory',
  SETTINGS: 'settings',
}

// 分页默认值
export const PAGE_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
}

// 路由难度
export const DIFFICULTY_MAP = {
  easy: { label: '简单', color: '#4caf50', icon: '😊' },
  medium: { label: '中等', color: '#ff9800', icon: '🤔' },
  hard: { label: '困难', color: '#f44336', icon: '😰' },
}

// 途点类型
export const WAYPOINT_TYPE_MAP = {
  scenic: { label: '景点', icon: '🏞️' },
  restaurant: { label: '餐厅', icon: '🍜' },
  hotel: { label: '酒店', icon: '🏨' },
  gas: { label: '加油站', icon: '⛽' },
  repair: { label: '维修站', icon: '🔧' },
  other: { label: '其他', icon: '📍' },
}

// 整备分类
export const PREPARATION_CATEGORY_MAP = {
  tool: { label: '工具', icon: '🔧' },
  safety: { label: '安全装备', icon: '⛑️' },
  clothing: { label: '骑行服饰', icon: '👕' },
  electronics: { label: '电子设备', icon: '📱' },
  documents: { label: '证件', icon: '📄' },
  other: { label: '其他', icon: '📦' },
}

// 心情类型
export const MOOD_MAP = {
  happy: { label: '开心', icon: '😊' },
  excited: { label: '兴奋', icon: '🤩' },
  calm: { label: '平静', icon: '😌' },
  tired: { label: '疲惫', icon: '😫' },
  neutral: { label: '一般', icon: '😐' },
}

// 行程状态
export const TRIP_STATUS_MAP = {
  planning: { label: '计划中', color: '#1976d2' },
  ongoing: { label: '进行中', color: '#ff9800' },
  completed: { label: '已完成', color: '#4caf50' },
}

// 图片配置
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_COUNT: 9,
  ACCEPT_TYPES: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
}

// 地图配置
export const MAP_CONFIG = {
  DEFAULT_LAT: 39.9042, // 北京
  DEFAULT_LNG: 116.4074,
  DEFAULT_ZOOM: 12,
}
