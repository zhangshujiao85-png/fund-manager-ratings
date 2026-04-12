'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { getRedList, getBlackList, initializeData } from '@/lib/storage'
import { FundManager } from '@/types'

export default function Home() {
  const [redList, setRedList] = useState<FundManager[]>([])
  const [blackList, setBlackList] = useState<FundManager[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await initializeData()

      const red = await getRedList(20)
      const black = await getBlackList(20)

      console.log('📊 首页数据加载:', {
        redList: red.length,
        blackList: black.length,
        firstRed: red[0] ? { name: red[0].name, score: red[0].averageScore, ratings: red[0].totalRatings } : null,
        firstBlack: black[0] ? { name: black[0].name, score: black[0].averageScore, ratings: black[0].totalRatings } : null,
      })

      setRedList(red)
      setBlackList(black)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-600">加载中...</div>
      </div>
    )
  }

  const ManagerCard = ({ manager, isRed }: { manager: FundManager; isRed: boolean }) => (
    <Link href={`/manager/${manager.id}`}>
      <div className={`rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative ${
        isRed ? 'bg-gradient-to-br from-blue-400 to-blue-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'
      }`}>
        {/* 排名角标 */}
        {manager.rank && (
          <div className={`absolute -top-2 -left-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
            isRed ? 'bg-red-500' : 'bg-gray-600'
          }`}>
            {manager.rank <= 3 ? (
              manager.rank === 1 ? '🥇' : manager.rank === 2 ? '🥈' : '🥉'
            ) : (
              manager.rank
            )}
          </div>
        )}

        {/* 头像 */}
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 text-2xl font-bold mx-auto mb-3 shadow-inner">
          {manager.name.charAt(0)}
        </div>

        {/* 名字 */}
        <h3 className="text-white text-lg font-bold text-center mb-1 truncate">{manager.name}</h3>
        <p className="text-white/80 text-xs text-center mb-3 truncate">{manager.company}</p>

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🌟 基金经理口碑榜</h1>
          </div>
          <button
            onClick={() => {
              localStorage.clear()
              location.reload()
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
          >
            🔄 重新加载数据
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 红榜 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🔥 红榜</h2>
              <p className="text-sm text-gray-500">口碑最好的基金经理 TOP {redList.length}</p>
            </div>
          </div>
          {redList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-500">暂无数据，请点击右上角"重新加载数据"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {redList.map((manager) => (
                <ManagerCard key={manager.id} manager={manager} isRed={true} />
              ))}
            </div>
          )}
        </div>

        {/* 黑榜 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gray-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⚠️ 黑榜</h2>
              <p className="text-sm text-gray-500">体验最差的基金经理 TOP {blackList.length}</p>
            </div>
          </div>
          {blackList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-500">暂无数据，请点击右上角"重新加载数据"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {blackList.map((manager) => (
                <ManagerCard key={manager.id} manager={manager} isRed={false} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>© 2025 基金经理评分 · 仅供参考，不构成投资建议</p>
      </footer>
    </div>
  )
}
