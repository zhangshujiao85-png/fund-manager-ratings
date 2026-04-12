'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { getFundManagerById, getRatings, initializeData, hasUserRated, toggleFavoriteManager, isManagerFavorited } from '@/lib/storage'
import { FundManager, UserRating } from '@/types'
import { ArrowLeft, Star, Heart } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { RATING_DIMENSIONS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export default function ManagerDetailPage() {
  const params = useParams()
  const managerId = params.id as string

  const [manager, setManager] = useState<FundManager | null>(null)
  const [ratings, setRatings] = useState<UserRating[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      await initializeData()

      const managerData = await getFundManagerById(managerId)
      if (managerData) {
        setManager(managerData)
        const ratingsData = await getRatings(managerId)
        setRatings(ratingsData)
        const hasRatedValue = await hasUserRated(managerId)
        setHasRated(hasRatedValue)
        const isFavoritedValue = isManagerFavorited(managerId)
        setIsFavorited(isFavoritedValue)
      }
    }
    loadData()
  }, [managerId])

  const handleFavorite = () => {
    const newState = toggleFavoriteManager(managerId)
    setIsFavorited(newState)
  }

  if (!manager) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">基金经理不存在</p>
        </div>
      </div>
    )
  }

  // 准备雷达图数据
  const radarData = [
    { subject: RATING_DIMENSIONS.returnRate.label, value: manager.dimensionScores.returnRate, fullMark: 10 },
    { subject: RATING_DIMENSIONS.riskControl.label, value: manager.dimensionScores.riskControl, fullMark: 10 },
    { subject: RATING_DIMENSIONS.drawdown.label, value: manager.dimensionScores.drawdown, fullMark: 10 },
    { subject: RATING_DIMENSIONS.stability.label, value: manager.dimensionScores.stability, fullMark: 10 },
    { subject: RATING_DIMENSIONS.communication.label, value: manager.dimensionScores.communication, fullMark: 10 },
    { subject: RATING_DIMENSIONS.service.label, value: manager.dimensionScores.service, fullMark: 10 },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* 顶部标题栏 */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-100 hover:text-white text-sm flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-blue-600 text-2xl font-bold">
              {manager.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{manager.name}</h1>
              <p className="text-blue-100 text-sm">{manager.company}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">基本信息</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{manager.experience}</div>
                  <div className="text-xs text-gray-500">从业年限</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{manager.managedFunds}</div>
                  <div className="text-xs text-gray-500">管理基金</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{manager.totalAssets}</div>
                  <div className="text-xs text-gray-500">管理规模</div>
                </div>
              </div>
              {manager.biography && (
                <p className="text-sm text-gray-600 mt-4">{manager.biography}</p>
              )}
            </div>

            {/* 评分雷达图 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">评分维度</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name={manager.name}
                      dataKey="value"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 用户评价 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="font-bold text-gray-900">用户评价 ({ratings.length})</h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {ratings.length === 0 ? (
                  <div className="px-4 py-12 text-center text-gray-500">
                    <p>暂无评价</p>
                  </div>
                ) : (
                  ratings.map((rating) => (
                    <div key={rating.id} className="px-4 py-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                            {rating.isAnonymous ? '匿' : rating.userId.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {rating.isAnonymous ? '匿名用户' : `用户${rating.userId.slice(0, 6)}`}
                            </div>
                            <div className="text-xs text-gray-400">{formatDate(rating.createdAt)}</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">{rating.overallScore}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                        <div className="text-gray-500">收益率 {rating.dimensions.returnRate}</div>
                        <div className="text-gray-500">风控 {rating.dimensions.riskControl}</div>
                        <div className="text-gray-500">回撤 {rating.dimensions.drawdown}</div>
                        <div className="text-gray-500">稳定性 {rating.dimensions.stability}</div>
                        <div className="text-gray-500">沟通 {rating.dimensions.communication}</div>
                        <div className="text-gray-500">服务 {rating.dimensions.service}</div>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{rating.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 评分卡片 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mb-1">{manager.averageScore}</div>
                <div className="text-sm text-gray-500">综合评分</div>
                <div className="text-xs text-gray-400 mt-1">{manager.totalRatings}人评分</div>
              </div>
              <div className="space-y-2">
                <Link href={`/manager/${manager.id}/rate`}>
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    {hasRated ? '修改评分' : '立即评分'}
                  </button>
                </Link>
                <button
                  onClick={handleFavorite}
                  className={`w-full py-2 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                    isFavorited
                      ? 'border-red-500 text-red-500'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? '已收藏' : '收藏'}
                </button>
              </div>
            </div>

            {/* 各维度评分 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">各维度评分</h3>
              <div className="space-y-3">
                {Object.entries(RATING_DIMENSIONS).map(([key, config]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{config.label}</span>
                      <span className="font-medium text-gray-900">
                        {manager.dimensionScores[key as keyof typeof manager.dimensionScores].toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${(manager.dimensionScores[key as keyof typeof manager.dimensionScores] / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 基金类型 */}
            {manager.fundTypes && manager.fundTypes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">擅长类型</h3>
                <div className="flex flex-wrap gap-2">
                  {manager.fundTypes.map((type) => (
                    <span key={type} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {type === 'stock' && '股票型'}
                      {type === 'mixed' && '混合型'}
                      {type === 'bond' && '债券型'}
                      {type === 'index' && '指数型'}
                    </span>
                  ))}
                </div>
              </div>
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
