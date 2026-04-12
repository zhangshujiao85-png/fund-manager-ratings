'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { getFundManagers, initializeData } from '@/lib/storage'
import { FundManager, FundType } from '@/types'
import { FUND_TYPES } from '@/lib/constants'
import { Search, ArrowUpDown } from 'lucide-react'

export default function ExplorePage() {
  const [managers, setManagers] = useState<FundManager[]>([])
  const [filteredManagers, setFilteredManagers] = useState<FundManager[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<FundType | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await initializeData()
      const data = await getFundManagers()
      setManagers(data)
      setFilteredManagers(data)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = [...managers]

    if (searchTerm) {
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((manager) =>
        manager.fundTypes?.includes(selectedType)
      )
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.averageScore - a.averageScore
      } else {
        return a.averageScore - b.averageScore
      }
    })

    setFilteredManagers(filtered)
  }, [searchTerm, selectedType, sortOrder, managers])

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  const ManagerCard = ({ manager }: { manager: FundManager }) => (
    <Link href={`/manager/${manager.id}`}>
      <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
        {/* 头像 */}
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 text-2xl font-bold mx-auto mb-3 shadow-inner">
          {manager.name.charAt(0)}
        </div>

        {/* 名字 */}
        <h3 className="text-white text-lg font-bold text-center mb-1 truncate">{manager.name}</h3>
        <p className="text-white/80 text-xs text-center mb-2 truncate">{manager.company}</p>

        {/* 标签 */}
        <div className="flex justify-center gap-1 mb-3">
          {manager.fundTypes?.slice(0, 2).map((type) => (
            <span key={type} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              {FUND_TYPES[type]?.label}
            </span>
          ))}
        </div>

        {/* 评分 */}
        <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
          <div className="text-white text-3xl font-bold">{manager.averageScore}</div>
          <div className="text-white/70 text-xs">{manager.totalRatings}人评分</div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      {/* 顶部标题 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">🔍 发现基金经理</h1>
          <p className="text-gray-500 text-sm">搜索、筛选、评分</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索基金经理或基金公司..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* 排序按钮 */}
            <button
              onClick={toggleSort}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
            >
              <ArrowUpDown className="w-5 h-5" />
              {sortOrder === 'desc' ? '评分从高到低' : '评分从低到高'}
            </button>
          </div>

          {/* 类型筛选 */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {Object.entries(FUND_TYPES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as FundType)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedType === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>

          {/* 统计 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              找到 <span className="font-bold text-blue-600">{filteredManagers.length}</span> 位基金经理
            </p>
          </div>
        </div>

        {/* 卡片网格 */}
        {filteredManagers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">没有找到匹配的基金经理</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredManagers.map((manager) => (
              <ManagerCard key={manager.id} manager={manager} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>© 2025 基金经理评分 · 仅供参考，不构成投资建议</p>
      </footer>
    </div>
  )
}
