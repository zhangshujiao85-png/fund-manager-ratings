'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { ManagerCard } from '@/components/ManagerCard'
import { getRedList, getBlackList, initializeData } from '@/lib/storage'
import { FundManager, ListType } from '@/types'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'

export default function ListPage() {
  const params = useParams()
  const listType = (params.type as ListType) || 'red'

  const [managers, setManagers] = useState<FundManager[]>([])

  useEffect(() => {
    const loadData = async () => {
      await initializeData()

      if (listType === 'red') {
        const data = await getRedList(50)
        setManagers(data)
      } else {
        const data = await getBlackList(50)
        setManagers(data)
      }
    }
    loadData()
  }, [listType])

  const isRedList = listType === 'red'
  const title = isRedList ? '红榜' : '黑榜'
  const description = isRedList ? '口碑最好的基金经理' : '体验最差的基金经理'
  const bgColor = isRedList ? 'from-red-50 to-orange-50' : 'from-gray-50 to-slate-50'
  const textColor = isRedList ? 'text-red-600' : 'text-gray-600'
  const iconBg = isRedList ? 'from-red-500 to-orange-500' : 'from-gray-600 to-slate-700'
  const Icon = isRedList ? TrendingUp : TrendingDown

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* 页面头部 */}
      <div className={`bg-gradient-to-br ${bgColor} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                {title}
                <Award className="w-8 h-8 text-yellow-500" />
              </h1>
              <p className="text-lg text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">上榜经理</div>
            <div className="text-3xl font-bold text-gray-900">{managers.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">平均评分</div>
            <div className={`text-3xl font-bold ${textColor}`}>
              {managers.length > 0
                ? (managers.reduce((sum, m) => sum + m.averageScore, 0) / managers.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">总评分人数</div>
            <div className="text-3xl font-bold text-gray-900">
              {managers.reduce((sum, m) => sum + m.totalRatings, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 榜单列表 */}
        <div className="space-y-4">
          {managers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无数据</p>
            </div>
          ) : (
            managers.map((manager) => (
              <ManagerCard key={manager.id} manager={manager} showRank />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 基金经理评分. 仅供参考，不构成投资建议</p>
      </footer>
    </div>
  )
}
