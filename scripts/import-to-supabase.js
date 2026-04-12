#!/usr/bin/env node

/**
 * 基金经理数据导入脚本
 * 将 managers_final.json 导入到 Supabase 数据库
 *
 * 使用方法：
 * 1. 确保 .env.local 中已配置 Supabase 凭据
 * 2. 运行: node scripts/import-to-supabase.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: .env.local 中未找到 Supabase 配置')
  console.error('请确保 .env.local 包含以下配置:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

// 检查是否是占位符
if (supabaseUrl.includes('your-supabase-project-url')) {
  console.error('❌ 错误: .env.local 中的 Supabase URL 还是占位符')
  console.error('请先配置真实的 Supabase 凭据')
  process.exit(1)
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey)

// 转换数据格式
function transformManager(manager) {
  return {
    id: manager.id,
    name: manager.name,
    company: manager.company,
    experience: manager.experience || 0,
    managed_funds: manager.managedFunds || 0,
    total_assets: manager.totalAssets || '0亿',
    fund_types: manager.fundTypes || [],
    biography: manager.biography || '',
    total_ratings: manager.totalRatings || 0,
    average_score: manager.averageScore || 0,
    dimension_return_rate: manager.dimensionScores?.returnRate || 0,
    dimension_risk_control: manager.dimensionScores?.riskControl || 0,
    dimension_drawdown: manager.dimensionScores?.drawdown || 0,
    dimension_stability: manager.dimensionScores?.stability || 0,
    dimension_communication: manager.dimensionScores?.communication || 0,
    dimension_service: manager.dimensionScores?.service || 0,
  }
}

// 主函数
async function importData() {
  try {
    console.log('🚀 开始导入基金经理数据到 Supabase...\n')

    // 1. 读取 JSON 文件
    console.log('📖 读取 managers_final.json...')
    const jsonPath = path.join(__dirname, '..', 'public', 'managers_final.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    console.log(`✅ 成功读取 ${jsonData.length} 位基金经理\n`)

    // 2. 检查数据库中是否已有数据
    console.log('🔍 检查数据库...')
    const { data: existingData, error: checkError } = await supabase
      .from('fund_managers')
      .select('count')

    if (checkError) {
      console.error('❌ 检查数据库失败:', checkError.message)
      process.exit(1)
    }

    const existingCount = existingData?.[0]?.count || 0
    console.log(`📊 当前数据库中有 ${existingCount} 位基金经理\n`)

    if (existingCount > 0) {
      console.log('⚠️  数据库中已有数据')
      console.log('选项:')
      console.log('  1. 追加新数据 (保留现有数据)')
      console.log('  2. 清空并重新导入\n')

      // 注意: 这里简单处理为追加模式
      // 如果需要清空，可以手动在 Supabase Dashboard 中操作
      console.log('✅ 选择追加模式...\n')
    }

    // 3. 批量导入数据
    console.log('📦 开始批量导入...')
    const batchSize = 100 // 每批100条
    const total = jsonData.length
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < total; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize)
      const transformedBatch = batch.map(transformManager)

      const { data, error } = await supabase
        .from('fund_managers')
        .upsert(transformedBatch, { onConflict: 'id' })

      if (error) {
        console.error(`❌ 批次 ${i + 1}-${Math.min(i + batchSize, total)} 导入失败:`, error.message)
        errorCount++
      } else {
        successCount += transformedBatch.length
        const progress = Math.round((i + batchSize) / total * 100)
        console.log(`✅ 进度: ${progress}% (${successCount}/${total})`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 导入完成!')
    console.log('='.repeat(50))
    console.log(`✅ 成功导入: ${successCount} 条`)
    console.log(`❌ 失败: ${errorCount} 个批次`)
    console.log(`📈 总数: ${total} 位基金经理`)

    // 4. 验证导入结果
    console.log('\n🔍 验证导入结果...')
    const { data: finalData, error: finalError } = await supabase
      .from('fund_managers')
      .select('count')

    if (!finalError && finalData) {
      const finalCount = finalData[0].count
      console.log(`✅ 数据库中现有 ${finalCount} 位基金经理`)
    }

    console.log('\n🎉 导入完成! 你可以在 Supabase Dashboard 中查看数据')
    console.log('🔗 https://supabase.com/dashboard')

  } catch (error) {
    console.error('\n❌ 导入失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// 运行导入
importData()
