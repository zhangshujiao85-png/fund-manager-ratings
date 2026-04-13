// 基金经理评分系统 - 类型定义

// 基金类型
export type FundType =
  | 'stock'      // 股票型
  | 'mixed'      // 混合型
  | 'bond'       // 债券型
  | 'index'      // 指数型
  | 'qdii'       // QDII
  | 'money'      // 货币型
  | 'other'      // 其他

// 评分维度（6个体验维度）
export type RatingDimension =
  | 'returnRate'      // 收益率表现
  | 'riskControl'     // 风控能力
  | 'drawdown'        // 回撤控制
  | 'stability'       // 稳定性
  | 'communication'   // 沟通透明度
  | 'service'         // 服务质量

export interface RatingDimensions {
  returnRate: number
  riskControl: number
  drawdown: number
  stability: number
  communication: number
  service: number
}

// 基金经理信息
export interface FundManager {
  id: string
  name: string
  avatar?: string
  company: string
  experience: number        // 从业年限
  managedFunds: number      // 管理基金数量
  fundTypes: FundType[]     // 擅长的基金类型
  biography?: string        // 简介

  // 统计数据（系统计算）
  totalRatings: number      // 总评分人数
  averageScore: number      // 综合平均分
  dimensionScores: RatingDimensions  // 各维度平均分
  rank?: number             // 排名
  rankType?: 'red' | 'black'  // 红榜/黑榜
}

// 用户评分
export interface UserRating {
  id: string
  managerId: string         // 基金经理ID
  userId: string            // 用户ID（匿名）
  fundCodes?: string[]      // 持有的基金代码
  dimensions: RatingDimensions  // 6维度评分
  overallScore: number      // 综合评分（自动计算）
  comment?: string          // 文字评价
  createdAt: string         // 创建时间

  // 元数据
  helpful: number           // 有用数
  notHelpful: number        // 无用数
  isAnonymous: boolean      // 是否匿名
}

// 用户（本地存储）
export interface User {
  id: string
  nickname: string
  avatar?: string
  createdAt: string
  myRatings: string[]       // 我的评分ID列表
  favoriteManagers: string[] // 收藏的基金经理ID
}

// 榜单类型
export type ListType = 'red' | 'black'  // 红榜/黑榜

// 排序方式
export type SortType = 'score' | 'ratings' | 'recent'

// 页面路由
export interface RouteParams {
  managerId?: string
  listType?: ListType
}
