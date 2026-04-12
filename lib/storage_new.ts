// 本地存储服务 - 更新版
// 支持从JSON文件加载真实数据

import type { FundManager, UserRating, User } from '@/types'
import { STORAGE_KEYS, MOCK_FUND_MANAGERS } from './constants'

// ========== 初始化数据 ==========

export async function loadManagersFromJSON(): Promise<FundManager[]> {
  try {
    const response = await fetch('/managers_final.json')
    const data = await response.json()
    return data as FundManager[]
  } catch (error) {
    console.error('加载基金经理数据失败:', error)
    return MOCK_FUND_MANAGERS
  }
}

export function initializeData() {
  if (typeof window === 'undefined') return

  // 初始化基金经理数据
  if (!localStorage.getItem(STORAGE_KEYS.MANAGERS)) {
    // 使用模拟数据初始化
    localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(MOCK_FUND_MANAGERS))
  }

  // 初始化评分数据
  if (!localStorage.getItem(STORAGE_KEYS.RATINGS)) {
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify([]))
  }

  // 初始化用户数据
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    const newUser: User = {
      id: generateId(),
      nickname: `用户${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      myRatings: [],
      favoriteManagers: [],
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
  }
}

// ========== 基金经理操作 ==========

export async function getFundManagers(): Promise<FundManager[]> {
  if (typeof window === 'undefined') {
    // 服务器端返回模拟数据
    return import('/managers_final.json').then(m => m.default || MOCK_FUND_MANAGERS)
  }

  const data = localStorage.getItem(STORAGE_KEYS.MANAGERS)
  if (data) {
    return JSON.parse(data)
  }

  // 尝试从JSON文件加载
  try {
    const managers = await loadManagersFromJSON()
    localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(managers))
    return managers
  } catch {
    return MOCK_FUND_MANAGERS
  }
}

export function getFundManagerById(id: string): FundManager | undefined {
  // 这个需要是同步的
  if (typeof window === 'undefined') return undefined
  const data = localStorage.getItem(STORAGE_KEYS.MANAGERS)
  const managers = data ? JSON.parse(data) : MOCK_FUND_MANAGERS
  return managers.find((m: FundManager) => m.id === id)
}

export function getRedList(limit = 20): FundManager[] {
  const managers = getFundManagers()
  return managers
}

export function getBlackList(limit = 20): FundManager[] {
  const managers = getFundManagers()
  return managers
}

export function getPopularManagers(limit = 6): FundManager[] {
  const managers = getFundManagers()
  return managers
}

export function getRatings(managerId?: string): UserRating[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.RATINGS)
  const allRatings: UserRating[] = data ? JSON.parse(data) : []

  if (managerId) {
    return allRatings.filter(r => r.managerId === managerId)
  }
  return allRatings
}

export function getUserRatings(userId: string): UserRating[] {
  const allRatings = getRatings()
  return allRatings.filter(r => r.userId === userId)
}

export function addRating(rating: Omit<UserRating, 'id' | 'createdAt'>): UserRating {
  const newRating: UserRating = {
    ...rating,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }

  // 保存评分
  const allRatings = getRatings()
  allRatings.push(newRating)
  localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(allRatings))

  // 更新用户的评分列表
  const user = getCurrentUser()
  if (user) {
    user.myRatings.push(newRating.id)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  // 重新计算基金经理的评分
  updateManagerScores(rating.managerId)

  return newRating
}

export function updateRatingHelpful(ratingId: string, helpful: boolean) {
  const allRatings = getRatings()
  const rating = allRatings.find(r => r.id === ratingId)
  if (rating) {
    if (helpful) {
      rating.helpful++
    } else {
      rating.notHelpful++
    }
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(allRatings))
  }
}

function updateManagerScores(managerId: string) {
  const managers = localStorage.getItem(STORAGE_KEYS.MANAGERS)
  if (!managers) return

  const managersList = JSON.parse(managers)
  const managerIndex = managersList.findIndex((m: FundManager) => m.id === managerId)

  if (managerIndex === -1) return

  const ratings = getRatings(managerId)
  if (ratings.length === 0) return

  // 计算各维度平均分
  const dimensions = {
    returnRate: 0,
    riskControl: 0,
    drawdown: 0,
    stability: 0,
    communication: 0,
    service: 0,
  }

  ratings.forEach(rating => {
    dimensions.returnRate += rating.dimensions.returnRate
    dimensions.riskControl += rating.dimensions.riskControl
    dimensions.drawdown += rating.dimensions.drawdown
    dimensions.stability += rating.dimensions.stability
    dimensions.communication += rating.dimensions.communication
    dimensions.service += rating.dimensions.service
  })

  const count = ratings.length
  Object.keys(dimensions).forEach(key => {
    dimensions[key as keyof typeof dimensions] /= count
  })

  const averageScore =
    (dimensions.returnRate +
      dimensions.riskControl +
      dimensions.drawdown +
      dimensions.stability +
      dimensions.communication +
      dimensions.service) / 6

  managersList[managerIndex] = {
    ...managersList[managerIndex],
    totalRatings: ratings.length,
    averageScore: Number(averageScore.toFixed(1)),
    dimensionScores: dimensions,
  }

  localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(managersList))
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getCurrentUser()
  if (!user) return null

  const updatedUser = { ...user, ...updates }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
  return updatedUser
}

export function toggleFavoriteManager(managerId: string): boolean {
  const user = getCurrentUser()
  if (!user) return false

  const isFavorite = user.favoriteManagers.includes(managerId)
  let newFavorites: string[]

  if (isFavorite) {
    newFavorites = user.favoriteManagers.filter(id => id !== managerId)
  } else {
    newFavorites = [...user.favoriteManagers, managerId]
  }

  updateUser({ favoriteManagers: newFavorites })
  return !isFavorite
}

export function isManagerFavorited(managerId: string): boolean {
  const user = getCurrentUser()
  return user?.favoriteManagers.includes(managerId) || false
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateOverallScore(dimensions: {
  returnRate: number
  riskControl: number
  drawdown: number
  stability: number
  communication: number
  service: number
}): number {
  const scores = Object.values(dimensions)
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return Number((sum / scores.length).toFixed(1))
}

export function hasUserRated(managerId: string): boolean {
  const user = getCurrentUser()
  if (!user) return false

  const userRatings = getUserRatings(user.id)
  return userRatings.some(r => r.managerId === managerId)
}
