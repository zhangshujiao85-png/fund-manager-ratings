// Supabase 存储服务
// 与 storage.ts 并行工作，自动检测使用哪个存储

import { supabase, isSupabaseConfigured } from './supabase'
import type { FundManager, UserRating, User } from '@/types'
import { STORAGE_KEYS, MOCK_FUND_MANAGERS } from './constants'

// ========== 标记：是否使用 Supabase ==========

// 如果 Supabase 已配置，使用 Supabase；否则使用 localStorage
export const USE_SUPABASE = isSupabaseConfigured

console.log(`📦 存储模式: ${USE_SUPABASE ? 'Supabase 云数据库' : 'localStorage 本地存储'}`)

// ========== 初始化数据 ==========

export async function initializeData() {
  if (USE_SUPABASE) {
    // Supabase 模式：检查是否需要导入初始数据
    const { data, error } = await supabase!
      .from('fund_managers')
      .select('count')

    if (error || !data || data.length === 0) {
      console.log('📥 Supabase 数据库为空，准备导入数据...')
      // 这里可以添加导入逻辑
      return
    }

    console.log(`✅ Supabase 已有数据，跳过初始化`)
    return
  }

  // localStorage 模式（原有逻辑）
  if (typeof window === 'undefined') return

  // 初始化基金经理数据 - 从JSON文件加载真实数据
  if (!localStorage.getItem(STORAGE_KEYS.MANAGERS)) {
    try {
      // 从public文件夹加载真实数据
      const response = await fetch('/managers_final.json')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const realManagers = await response.json()

      // 为部分基金经理生成模拟评分数据（用于演示红黑榜）
      const managersWithRatings = realManagers.map((manager: FundManager, index: number) => {
        // 前100位基金经理添加评分，形成红黑榜
        if (index < 100) {
          const scoreRange = index < 20 ? { min: 8.5, max: 9.9 } : // 前20名高分（红榜）
                             index < 50 ? { min: 4.0, max: 6.5 } : // 中间分数
                             { min: 1.0, max: 3.5 } // 后50名低分（黑榜）

          const totalRatings = Math.floor(Math.random() * 500) + 20 // 20-520个评分
          const averageScore = Number((Math.random() * (scoreRange.max - scoreRange.min) + scoreRange.min).toFixed(1))

          // 生成各维度分数
          const variance = averageScore * 0.2 // 各维度分数的波动范围
          const dimensionScores = {
            returnRate: Number(Math.max(1, Math.min(10, averageScore + (Math.random() - 0.5) * variance)).toFixed(1)),
            riskControl: Number(Math.max(1, Math.min(10, averageScore + (Math.random() - 0.5) * variance)).toFixed(1)),
            drawdown: Number(Math.max(1, Math.min(10, averageScore + (Math.random() - 0.5) * variance)).toFixed(1)),
            stability: Number(Math.max(1, Math.min(10, averageScore + (Math.random() - 0.5) * variance)).toFixed(1)),
            communication: Number(Math.max(1, Math.min(10, averageScore + (Math.random() - 0.5) * variance)).toFixed(1)),
            service: Number(Math.max(1, Math.min(10, averageScore + (Math.random() - 0.5) * variance)).toFixed(1)),
          }

          return {
            ...manager,
            totalRatings,
            averageScore,
            dimensionScores,
          }
        }

        // 其他基金经理没有评分
        return {
          ...manager,
          totalRatings: 0,
          averageScore: 0,
          dimensionScores: {
            returnRate: 0,
            riskControl: 0,
            drawdown: 0,
            stability: 0,
            communication: 0,
            service: 0,
          },
        }
      })

      localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(managersWithRatings))
      console.log(`✅ 成功加载 ${managersWithRatings.length} 位基金经理（含模拟评分）`)
    } catch (error) {
      console.error('❌ 加载真实数据失败，使用模拟数据:', error)
      localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(MOCK_FUND_MANAGERS))
    }
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
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('fund_managers')
      .select('*')
      .order('average_score', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('获取基金经理失败:', error)
      return []
    }

    return data.map(mapSupabaseManager) || []
  }

  // localStorage 模式
  if (typeof window === 'undefined') return [...MOCK_FUND_MANAGERS] as FundManager[]
  const data = localStorage.getItem(STORAGE_KEYS.MANAGERS)
  return data ? (JSON.parse(data) as FundManager[]) : [...MOCK_FUND_MANAGERS] as FundManager[]
}

export async function getFundManagerById(id: string): Promise<FundManager | undefined> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('fund_managers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return undefined
    return mapSupabaseManager(data)
  }

  // localStorage 模式
  const managers = await getFundManagers()
  return managers.find(m => m.id === id)
}

export async function getRedList(limit = 20): Promise<FundManager[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('fund_managers')
      .select('*')
      .gte('total_ratings', 10)
      .order('average_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取红榜失败:', error)
      return []
    }

    return (data || []).map((m, i) => ({
      ...mapSupabaseManager(m),
      rank: i + 1,
      rankType: 'red' as const
    }))
  }

  // localStorage 模式
  const managers = await getFundManagers()
  const filtered = managers.filter(m => m.totalRatings >= 10)
  console.log(`🔴 红榜筛选: 总经理数=${managers.length}, 有10+评分的=${filtered.length}`)

  return filtered
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit)
    .map((m, i) => ({ ...m, rank: i + 1, rankType: 'red' as const }))
}

export async function getBlackList(limit = 20): Promise<FundManager[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('fund_managers')
      .select('*')
      .gte('total_ratings', 10)
      .order('average_score', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('获取黑榜失败:', error)
      return []
    }

    return (data || []).map((m, i) => ({
      ...mapSupabaseManager(m),
      rank: i + 1,
      rankType: 'black' as const
    }))
  }

  // localStorage 模式
  const managers = await getFundManagers()
  const filtered = managers.filter(m => m.totalRatings >= 10)
  console.log(`⚫ 黑榜筛选: 总经理数=${managers.length}, 有10+评分的=${filtered.length}`)

  return filtered
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, limit)
    .map((m, i) => ({ ...m, rank: i + 1, rankType: 'black' as const }))
}

// ========== 评分操作 ==========

export async function getRatings(managerId?: string): Promise<UserRating[]> {
  if (USE_SUPABASE) {
    let query = supabase!
      .from('user_ratings')
      .select('*')
      .order('created_at', { ascending: false })

    if (managerId) {
      query = query.eq('manager_id', managerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取评分失败:', error)
      return []
    }

    return (data || []).map(mapSupabaseRating)
  }

  // localStorage 模式
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.RATINGS)
  const allRatings: UserRating[] = data ? JSON.parse(data) : []

  if (managerId) {
    return allRatings.filter(r => r.managerId === managerId)
  }
  return allRatings
}

export async function getUserRatings(userId: string): Promise<UserRating[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from('user_ratings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取用户评分失败:', error)
      return []
    }

    return (data || []).map(mapSupabaseRating)
  }

  // localStorage 模式
  const allRatings = await getRatings()
  return allRatings.filter(r => r.userId === userId)
}

export async function addRating(rating: Omit<UserRating, 'id' | 'createdAt'>): Promise<UserRating> {
  if (USE_SUPABASE) {
    const newRating = {
      user_id: rating.userId,
      manager_id: rating.managerId,
      overall_score: rating.overallScore,
      dimension_return_rate: rating.dimensions.returnRate,
      dimension_risk_control: rating.dimensions.riskControl,
      dimension_drawdown: rating.dimensions.drawdown,
      dimension_stability: rating.dimensions.stability,
      dimension_communication: rating.dimensions.communication,
      dimension_service: rating.dimensions.service,
      comment: rating.comment,
      helpful: 0,
      not_helpful: 0,
    }

    const { data, error } = await supabase!
      .from('user_ratings')
      .insert(newRating)
      .select()
      .single()

    if (error) {
      console.error('添加评分失败:', error)
      throw error
    }

    return mapSupabaseRating(data)
  }

  // localStorage 模式
  const newRating: UserRating = {
    ...rating,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }

  // 保存评分
  const allRatings = await getRatings()
  allRatings.push(newRating)
  localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(allRatings))

  // 更新用户的评分列表
  const user = getCurrentUser()
  if (user) {
    user.myRatings.push(newRating.id)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  // 重新计算基金经理的评分
  await updateManagerScores(rating.managerId)

  return newRating
}

export async function updateRatingHelpful(ratingId: string, helpful: boolean): Promise<void> {
  if (USE_SUPABASE) {
    const column = helpful ? 'helpful' : 'not_helpful'

    const { error } = await supabase!
      .from('user_ratings')
      .update({ [column]: supabase!.rpc('incr', { x: column }) })

    if (error) {
      console.error('更新有用投票失败:', error)
    }
    return
  }

  // localStorage 模式
  const allRatings = await getRatings()
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

// ========== 用户操作 ==========

export function getCurrentUser(): User | null {
  if (USE_SUPABASE) {
    // Supabase Auth 需要单独实现
    // 这里先返回 null，稍后添加 Auth
    return null
  }

  // localStorage 模式
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function login(): User {
  if (USE_SUPABASE) {
    throw new Error('请使用 Supabase Auth 登录')
  }

  // localStorage 模式
  const newUser: User = {
    id: generateId(),
    nickname: `用户${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    myRatings: [],
    favoriteManagers: [],
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
  console.log('✅ 登录成功:', newUser.nickname)
  return newUser
}

export function logout(): void {
  if (USE_SUPABASE) {
    // Supabase Auth 登出
    supabase!.auth.signOut()
    return
  }

  // localStorage 模式
  localStorage.removeItem(STORAGE_KEYS.USER)
  console.log('✅ 已退出登录')
}

export async function updateUser(updates: Partial<User>): Promise<User | null> {
  if (USE_SUPABASE) {
    const user = getCurrentUser()
    if (!user) return null

    const { error } = await supabase!
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('更新用户失败:', error)
      return null
    }

    return { ...user, ...updates }
  }

  // localStorage 模式
  const user = getCurrentUser()
  if (!user) return null

  const updatedUser = { ...user, ...updates }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
  return updatedUser
}

export async function toggleFavoriteManager(managerId: string): Promise<boolean> {
  const user = getCurrentUser()
  if (!user) return false

  const isFavorite = user.favoriteManagers.includes(managerId)
  const newFavorites = isFavorite
    ? user.favoriteManagers.filter(id => id !== managerId)
    : [...user.favoriteManagers, managerId]

  if (USE_SUPABASE) {
    const { error } = await supabase!
      .from('users')
      .update({ favorite_managers: newFavorites })
      .eq('id', user.id)

    if (error) {
      console.error('更新收藏失败:', error)
      return false
    }

    // 更新本地状态
    updateUser({ favoriteManagers: newFavorites })
    return !isFavorite
  }

  // localStorage 模式
  updateUser({ favoriteManagers: newFavorites })
  return !isFavorite
}

export function isManagerFavorited(managerId: string): boolean {
  const user = getCurrentUser()
  return user?.favoriteManagers.includes(managerId) || false
}

// ========== 工具函数 ==========

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 映射 Supabase 数据到应用格式
function mapSupabaseManager(data: any): FundManager {
  return {
    id: data.id,
    name: data.name,
    company: data.company,
    experience: data.experience,
    managedFunds: data.managed_funds,
    totalAssets: data.total_assets,
    fundTypes: data.fund_types,
    biography: data.biography,
    totalRatings: data.total_ratings,
    averageScore: data.average_score,
    dimensionScores: {
      returnRate: data.dimension_return_rate,
      riskControl: data.dimension_risk_control,
      drawdown: data.dimension_drawdown,
      stability: data.dimension_stability,
      communication: data.dimension_communication,
      service: data.dimension_service,
    },
  }
}

function mapSupabaseRating(data: any): UserRating {
  return {
    id: data.id,
    userId: data.user_id,
    managerId: data.manager_id,
    overallScore: data.overall_score,
    dimensions: {
      returnRate: data.dimension_return_rate,
      riskControl: data.dimension_risk_control,
      drawdown: data.dimension_drawdown,
      stability: data.dimension_stability,
      communication: data.dimension_communication,
      service: data.dimension_service,
    },
    comment: data.comment,
    helpful: data.helpful,
    notHelpful: data.not_helpful,
    createdAt: data.created_at,
  }
}

// 重新计算基金经理的评分（仅 localStorage）
async function updateManagerScores(managerId: string) {
  const managers = await getFundManagers()
  const managerIndex = managers.findIndex(m => m.id === managerId)

  if (managerIndex === -1) return

  const ratings = await getRatings(managerId)

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

  // 计算综合平均分
  const averageScore =
    (dimensions.returnRate +
      dimensions.riskControl +
      dimensions.drawdown +
      dimensions.stability +
      dimensions.communication +
      dimensions.service) / 6

  // 更新基金经理数据
  managers[managerIndex] = {
    ...managers[managerIndex],
    totalRatings: ratings.length,
    averageScore: Number(averageScore.toFixed(1)),
    dimensionScores: dimensions,
  }

  localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(managers))
}

// 计算综合评分
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

// 检查用户是否已评分
export async function hasUserRated(managerId: string): Promise<boolean> {
  const user = getCurrentUser()
  if (!user) return false

  const userRatings = await getUserRatings(user.id)
  return userRatings.some(r => r.managerId === managerId)
}
