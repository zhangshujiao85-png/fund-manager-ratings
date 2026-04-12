import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查是否配置了有效的 Supabase 凭据
const isValidUrl = supabaseUrl &&
  supabaseUrl !== 'your-supabase-project-url' &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))

const isValidKey = supabaseAnonKey &&
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseAnonKey.length > 20

if (!isValidUrl || !isValidKey) {
  console.warn('⚠️ Supabase 凭据未配置或无效，将使用 localStorage 模式')
}

export const supabase = isValidUrl && isValidKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 检查是否配置了 Supabase
export const isSupabaseConfigured = !!supabase
