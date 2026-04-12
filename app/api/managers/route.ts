import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 动态导入JSON文件
    const managers = await import('@/../../public/managers_final.json')
      .then(m => m.default || [])
      .catch(() => [])

    return NextResponse.json(managers)
  } catch (error) {
    console.error('Error loading managers:', error)
    return NextResponse.json([], { status: 500 })
  }
}
