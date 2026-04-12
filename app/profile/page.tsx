'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { getCurrentUser, getUserRatings, getFundManagers, initializeData, login, logout } from '@/lib/storage'
import { User, UserRating, FundManager } from '@/types'
import { Star, Heart, LogOut, LogIn } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myRatings, setMyRatings] = useState<UserRating[]>([])
  const [favoriteManagers, setFavoriteManagers] = useState<FundManager[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'ratings'>('favorites')

  const handleLogin = () => {
    const newUser = login()
    setUser(newUser)
    loadUserData()
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setMyRatings([])
    setFavoriteManagers([])
  }

  useEffect(() => {
    const loadData = async () => {
      await initializeData()
      loadUserData()
    }
    loadData()
  }, [])

  const loadUserData = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    setUser(currentUser)
    const ratings = await getUserRatings(currentUser.id)
    setMyRatings(ratings)
    const managers = await getFundManagers()
    const favorites = managers.filter(m => currentUser.favoriteManagers.includes(m.id))
    setFavoriteManagers(favorites)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        {/* 顶部标题栏 */}
        <div className="bg-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">个人中心</h1>
            <p className="text-blue-100 text-sm mt-1">管理你的收藏和评分</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-md p-12 max-w-md mx-auto">
            <LogIn className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎来到基金经理评分</h2>
            <p className="text-gray-500 mb-6">登录后可以收藏基金经理、提交评分</p>
            <button
              onClick={handleLogin}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <LogIn className="w-5 h-5" />
              立即登录
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          <p>© 2025 基金经理评分 · 仅供参考，不构成投资建议</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* 顶部标题栏 */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">个人中心</h1>
          <p className="text-blue-100 text-sm mt-1">管理你的收藏和评分</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 用户信息 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                {user.nickname.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
                <p className="text-sm text-gray-500">
                  加入于 {formatDate(user.createdAt)} · {myRatings.length}条评分 · {favoriteManagers.length}个收藏
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'favorites'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                收藏 ({favoriteManagers.length})
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'ratings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                评分 ({myRatings.length})
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="divide-y divide-gray-100">
            {activeTab === 'favorites' ? (
              favoriteManagers.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>还没有收藏任何基金经理</p>
                </div>
              ) : (
                favoriteManagers.map((manager) => (
                  <Link key={manager.id} href={`/manager/${manager.id}`}>
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {manager.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                          <p className="text-sm text-gray-500">{manager.company}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{manager.averageScore}</div>
                          <div className="text-xs text-gray-400">{manager.totalRatings}人评分</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )
            ) : myRatings.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>还没有评分记录</p>
              </div>
            ) : (
              myRatings.map((rating) => {
                const [manager, setManager] = useState<FundManager | null>(null)

                useEffect(() => {
                  getFundManagerById(rating.managerId).then(setManager)
                }, [rating.managerId])

                if (!manager) return null

                return (
                  <div key={rating.id} className="px-4 py-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {manager.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <Link href={`/manager/${manager.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600">{manager.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500">{manager.company}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-blue-600">{rating.overallScore}</div>
                        <div className="text-xs text-gray-400">{formatDate(rating.createdAt)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 ml-15">
                      <div className="text-xs text-gray-500">收益率 {rating.dimensions.returnRate}</div>
                      <div className="text-xs text-gray-500">风控 {rating.dimensions.riskControl}</div>
                      <div className="text-xs text-gray-500">回撤 {rating.dimensions.drawdown}</div>
                      <div className="text-xs text-gray-500">稳定性 {rating.dimensions.stability}</div>
                      <div className="text-xs text-gray-500">沟通 {rating.dimensions.communication}</div>
                      <div className="text-xs text-gray-500">服务 {rating.dimensions.service}</div>
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded ml-15">{rating.comment}</p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>© 2025 基金经理评分 · 仅供参考，不构成投资建议</p>
      </footer>
    </div>
  )
}
