'use client'

import Link from 'next/link'
import { FundManager } from '@/types'
import { formatNumber } from '@/lib/utils'
import { RatingStars } from './RatingStars'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'

interface ManagerCardProps {
  manager: FundManager
  showRank?: boolean
  className?: string
}

export function ManagerCard({ manager, showRank = false, className }: ManagerCardProps) {
  const isRedList = manager.rankType === 'red'
  const TrendIcon = isRedList ? TrendingUp : TrendingDown
  const trendColor = isRedList ? 'text-green-600' : 'text-red-600'

  return (
    <Link href={`/manager/${manager.id}`}>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden">
        {/* 头部信息 */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {manager.name.charAt(0)}
              </div>

              {/* 基本信息 */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {manager.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{manager.company}</p>
              </div>
            </div>

            {/* 排名徽章 */}
            {showRank && manager.rank && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                isRedList
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600'
                  : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600'
              }`}>
                <Award className="w-4 h-4" />
                <span>#{manager.rank}</span>
              </div>
            )}
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{manager.experience}</div>
              <div className="text-xs text-gray-500 mt-1">从业年限</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{manager.managedFunds}</div>
              <div className="text-xs text-gray-500 mt-1">管理基金</div>
            </div>
          </div>

          {/* 评分 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <RatingStars rating={manager.averageScore} size="sm" showValue />
                <TrendIcon className={`w-5 h-5 ${trendColor}`} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(manager.totalRatings)} 人评分
              </p>
            </div>

            <div className="text-right">
              <div className={`text-sm font-semibold ${isRedList ? 'text-red-600' : 'text-gray-600'}`}>
                {isRedList ? '🔥 红榜' : '⚠️ 黑榜'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
