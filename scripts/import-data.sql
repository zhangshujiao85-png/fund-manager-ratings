-- ============================================
-- 基金经理数据导入脚本 - SQL 版本
-- ============================================
-- 说明：这个脚本会从 public/managers_final.json 导入数据
-- 但由于 Supabase 不支持直接从 JSON 文件导入，
-- 我们需要暂时禁用 RLS，使用 Node.js 脚本导入

-- 步骤 1: 暂时禁用 RLS
ALTER TABLE fund_managers DISABLE ROW LEVEL SECURITY;

-- 步骤 2: 现在可以运行 Node.js 导入脚本了
-- 运行: node scripts/import-to-supabase.js

-- 步骤 3: 导入完成后，重新启用 RLS
-- ALTER TABLE fund_managers ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS 已禁用，现在可以运行导入脚本了' as status;
SELECT '运行: node scripts/import-to-supabase.js' as next_step;
SELECT '导入完成后运行: ALTER TABLE fund_managers ENABLE ROW LEVEL SECURITY;' as final_step;
