import type { Route, Trip, Diary, Preparation, User, Waypoint, Post, Review, OfflineMap, DangerZone, NoParkingZone, UserModeSettings, PaginatedResponse, Weather, NightWarning, DangerWarning, NoParkingWarning, WarningResult, DangerZoneReport, NoParkingZoneReport } from './index'

// ============ API 响应类型定义 ============

// Auth
export type AuthLoginResponse = { token: string; user: User }
export type AuthResponse = AuthLoginResponse

// User
export type UserProfileResponse = User

// Route
export type RouteListResponse = PaginatedResponse<Route>
export type RouteDetailResponse = Route

// Trip
export type TripListResponse = PaginatedResponse<Trip>
export type TripDetailResponse = Trip

// Diary
export type DiaryListResponse = PaginatedResponse<Diary>

// Waypoint
export type WaypointListResponse = PaginatedResponse<Waypoint>

// Post
export type PostListResponse = PaginatedResponse<Post>

// Preparation
export type PreparationListResponse = Preparation[]

// Review
export type ReviewListResponse = PaginatedResponse<Review>

// OfflineMap
export type OfflineMapListResponse = OfflineMap[]

// DangerZone
export type DangerZoneListResponse = PaginatedResponse<DangerZone>
export type DangerZoneNearbyResponse = DangerZone[]

// NoParkingZone
export type NoParkingZoneListResponse = PaginatedResponse<NoParkingZone>
export type NoParkingZoneNearbyResponse = NoParkingZone[]

// UserMode
export type UserModeResponse = UserModeSettings
export type UserModeSwitchResponse = UserModeSettings

// Weather
export type WeatherResponse = Weather

// Warning
export type NightCheckResponse = NightWarning
export type WarningResponse = WarningResult

// Generic response types
export type SuccessResponse = { success: boolean }
export type MessageResponse = { message: string }
