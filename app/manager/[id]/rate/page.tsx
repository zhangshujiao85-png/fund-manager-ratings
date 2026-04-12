'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { RatingSlider } from '@/components/RatingSlider'
import { Button } from '@/components/Button'
import { getFundManagerById, addRating, getCurrentUser, initializeData, hasUserRated } from '@/lib/storage'
import { RatingDimensions } from '@/types'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'

export default function RateManagerPage() {
  const params = useParams()
  const router = useRouter()
  const managerId = params.id as string

  const [manager, setManager] = useState<any>(null)
  const [dimensions, setDimensions] = useState<RatingDimensions>({
    returnRate: 5,
    riskControl: 5,
    drawdown: 5,
    stability: 5,
    communication: 5,
    service: 5,
  })
  const [comment, setComment] = useState('')
  const [fundCodes, setFundCodes] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)

  useEffect(() => {
    initializeData()

    const managerData = getFundManagerById(managerId)
    if (!managerData) {
      router.push('/explore')
      return
    }

    setManager(managerData)

    // 检查是否已评分
    if (hasUserRated(managerId)) {
      router.push(`/manager/${managerId}`)
    }
  }, [managerId, router])

  const calculateOverallScore = () => {
    const scores = Object.values(dimensions)
    const sum = scores.reduce((acc, score) => acc + score, 0)
    return Number((sum / scores.length).toFixed(1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const user = getCurrentUser()
    if (!user) {
      alert('请先登录')
      return
    }

    setLoading(true)

    try {
      const overallScore = calculateOverallScore()

      addRating({
        managerId,
        userId: user.id,
        fundCodes: fundCodes ? fundCodes.split(',').map(c => c.trim()) : [],
        dimensions,
        overallScore,
        comment,
        helpful: 0,
        notHelpful: 0,
        isAnonymous,
      })

      alert('评分提交成功！')
      router.push(`/manager/${managerId}`)
    } catch (error) {
      console.error('提交评分失败:', error)
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!manager) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  const overallScore = calculateOverallScore()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link href={`/manager/${managerId}`}>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>返回详情</span>
          </button>
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">给基金经理打分</h1>
          <p className="text-gray-600">分享你的真实持有体验</p>
        </div>

        {/* 基金经理信息卡片 */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {manager.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{manager.name}</h2>
              <p className="text-gray-600">{manager.company}</p>
            </div>
          </div>
        </div>

        {/* 评分表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
          {/* 6维度评分 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              6维度评分
            </h3>
            <RatingSlider dimensions={dimensions} onChange={setDimensions} />
          </div>

          {/* 综合评分显示 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">综合评分</div>
                <div className="text-4xl font-bold text-gray-900">{overallScore}</div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>基于6个维度的平均值</div>
                <div className="mt-1">满分10分</div>
              </div>
            </div>
          </div>

          {/* 持有基金代码（可选） */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              持有基金代码（可选）
            </label>
            <input
              type="text"
              value={fundCodes}
              onChange={(e) => setFundCodes(e.target.value)}
              placeholder="如：110022, 161725（多个用逗号分隔）"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">证明你持有该经理的基金</p>
          </div>

          {/* 文字评价（可选） */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              文字评价（可选）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="分享你的持有体验、投资故事..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">说说你的真实感受</p>
          </div>

          {/* 匿名选项 */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">匿名评价</span>
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="flex-1"
            >
              <Star className="w-5 h-5 mr-2" />
              提交评分
            </Button>
            <Link href={`/manager/${managerId}`} className="flex-1">
              <Button type="button" variant="outline" size="lg" className="w-full">
                取消
              </Button>
            </Link>
          </div>

          {/* 免责声明 */}
          <p className="text-xs text-gray-500 mt-6 text-center">
            提交评分即表示你同意遵守社区规范，评分仅代表个人观点，不构成投资建议
          </p>
        </form>
      </div>
    </div>
  )
}
