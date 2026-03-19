# 摩旅助手 (MotoTrip)

> 摩托车旅行助手小程序，帮助摩友记录旅途、管理路线、保障安全、组队出行。

## 项目简介

摩旅助手是一款专为摩托车旅行者打造的小程序应用，提供路线规划、行程管理、摩旅日记、安全预警、组队出行、足迹记录等功能，让您的摩旅之旅更加安全、便捷、有趣。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 状态管理 | Pinia |
| UI 框架 | uni-app |
| 构建工具 | Vite |
| 测试 | Vitest |

## 功能模块

### 🏠 首页 (pages/index)
- 快速入口导航
- 近期行程概览
- 天气/安全提醒

### 🛣️ 路线 (pages/route)
- **路线列表** - 浏览推荐路线
- **路线详情** - 查看路线详情、途经点、距离等信息

### 📍 途点 (pages/waypoint)
- 途点管理与浏览

### 🚀 行程 (pages/trip)
- **行程列表** - 管理您的摩旅行程
- 行程规划与记录

### 🎒 整备 (pages/preparation)
- 摩旅装备清单
- 出发前检查项

### 📔 摩旅日记 (pages/diary)
- **日记列表** - 记录旅途点滴
- **日记详情** - 查看日记内容

### 🌐 社区 (pages/social)
- 摩友社区互动

### 🗺️ 地图 (pages/map)
- **离线地图** - 下载离线地图包
- **地图查看** - 在线查看地图

### ⚠️ 安全 (pages/safety)
- **危险路段上报** - 报告危险路段
- **禁停区上报** - 报告禁停区域
- 危险区域提示组件
- 夜间骑行预警

### 👥 车队 (pages/team)
- **车队列表** - 浏览/加入车队
- **创建车队** - 创建新的车队
- **车队详情** - 车队成员管理

### 👣 足迹 (pages/footprint)
- **足迹地图** - 展示骑行轨迹
- **成就** - 骑行成就系统

### 📍 位置共享 (pages/location)
- 实时位置共享功能

### 👤 个人中心 (pages/profile)
- **我的** - 用户信息与设置
- **骑行模式** - 选择骑行模式
- **模式设置** - 自定义骑行模式参数

### 📤 分享 (pages/share)
- **分享海报** - 生成旅途分享海报

### 🔍 搜索 (pages/search)
- 全局搜索功能

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
cd mototrip-app
npm install
```

### 运行项目

```bash
# H5 网页版
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# App 端
npm run dev:app
```

### 构建项目

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# App
npm run build:app
```

### 运行测试

```bash
# 单元测试
npm run test

# 监听模式
npm run test:watch

# 测试覆盖率
npm run test:coverage
```

## 目录结构

```
mototrip-app/
├── src/
│   ├── components/          # 公共组件
│   │   ├── DangerZones.vue       # 危险区域提示
│   │   └── NightWarning.vue      # 夜间骑行预警
│   ├── constants/          # 常量定义
│   ├── hooks/              # 组合式函数
│   ├── pages/              # 页面目录
│   │   ├── index/          # 首页
│   │   ├── route/          # 路线相关
│   │   ├── waypoint/       # 途点
│   │   ├── trip/           # 行程
│   │   ├── preparation/    # 整备
│   │   ├── diary/          # 摩旅日记
│   │   ├── social/         # 社区
│   │   ├── map/            # 地图
│   │   ├── safety/         # 安全
│   │   ├── team/           # 车队
│   │   ├── footprint/      # 足迹
│   │   ├── location/       # 位置共享
│   │   ├── profile/        # 个人中心
│   │   ├── share/          # 分享
│   │   └── search/         # 搜索
│   ├── services/           # API 服务
│   ├── store/              # Pinia 状态管理
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   ├── pages.json          # 页面配置
│   ├── uni.scss            # uni-app 全局样式
│   └── manifest.json       # 应用配置
├── index.html              # HTML 模板
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── vitest.config.ts        # Vitest 配置
```

## 开发指南

### 添加新页面

1. 在 `src/pages/` 下创建页面目录和 `.vue` 文件
2. 在 `pages.json` 的 `pages` 数组中添加页面配置
3. 如需底部 TabBar，在 `pages.json` 的 `tabBar.list` 中添加配置

### 状态管理 (Pinia)

在 `src/store/` 目录下创建 store：

```typescript
// src/store/useExampleStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore('example', () => {
  const count = ref(0)
  
  function increment() {
    count.value++
  }
  
  return { count, increment }
})
```

### 组件开发

公共组件放在 `src/components/` 目录下，使用 `PascalCase` 命名。

### API 调用

在 `src/services/` 目录下封装 API 请求，统一管理接口地址。

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 风格
- 组件采用 `<script setup>` 语法糖

## 许可证

MIT License
