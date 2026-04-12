-- ============================================
-- 基金经理评分系统 - Supabase 数据库设置
-- ============================================

-- 1. 创建基金经理表
CREATE TABLE IF NOT EXISTS fund_managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  experience INTEGER,
  managed_funds INTEGER DEFAULT 0,
  total_assets TEXT,
  fund_types TEXT[] DEFAULT '{}',
  biography TEXT,

  -- 评分相关字段
  total_ratings INTEGER DEFAULT 0,
  average_score DECIMAL(3, 1) DEFAULT 0,

  -- 各维度平均分
  dimension_return_rate DECIMAL(3, 1) DEFAULT 0,
  dimension_risk_control DECIMAL(3, 1) DEFAULT 0,
  dimension_drawdown DECIMAL(3, 1) DEFAULT 0,
  dimension_stability DECIMAL(3, 1) DEFAULT 0,
  dimension_communication DECIMAL(3, 1) DEFAULT 0,
  dimension_service DECIMAL(3, 1) DEFAULT 0,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,

  -- 用户统计
  total_ratings INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,

  -- 收藏的基金经理列表
  favorite_managers TEXT[] DEFAULT '{}',

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建评分表
CREATE TABLE IF NOT EXISTS user_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manager_id TEXT NOT NULL REFERENCES fund_managers(id) ON DELETE CASCADE,

  -- 综合评分
  overall_score DECIMAL(3, 1) NOT NULL,

  -- 各维度评分 (1-10)
  dimension_return_rate DECIMAL(3, 1) NOT NULL,
  dimension_risk_control DECIMAL(3, 1) NOT NULL,
  dimension_drawdown DECIMAL(3, 1) NOT NULL,
  dimension_stability DECIMAL(3, 1) NOT NULL,
  dimension_communication DECIMAL(3, 1) NOT NULL,
  dimension_service DECIMAL(3, 1) NOT NULL,

  -- 评论
  comment TEXT,

  -- 有用投票
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 确保每个用户对每个经理只能评分一次
  UNIQUE(user_id, manager_id)
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_fund_managers_score ON fund_managers(average_score DESC, total_ratings DESC);
CREATE INDEX IF NOT EXISTS idx_fund_managers_company ON fund_managers(company);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_manager ON user_ratings(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created ON user_ratings(created_at DESC);

-- 5. 启用行级安全 (RLS)
ALTER TABLE fund_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略

-- 基金经理表策略
-- 所有人可以读取基金经理数据
CREATE POLICY "Public can view fund managers"
ON fund_managers FOR SELECT
TO public
USING (true);

-- 只有认证用户可以插入/更新基金经理数据（用于管理）
CREATE POLICY "Authenticated can insert fund managers"
ON fund_managers FOR INSERT
TO authenticated
WITH CHECK (true);

-- 只有认证用户可以更新基金经理数据
CREATE POLICY "Authenticated can update fund managers"
ON fund_managers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 用户表策略
-- 用户只能查看自己的数据
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO public
USING (auth.uid()::text = id);

-- 用户可以插入自己的数据
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO public
WITH CHECK (auth.uid()::text = id);

-- 用户只能更新自己的数据
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO public
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- 评分表策略
-- 所有人可以读取评分
CREATE POLICY "Public can view ratings"
ON user_ratings FOR SELECT
TO public
USING (true);

-- 认证用户可以插入评分
CREATE POLICY "Authenticated can insert ratings"
ON user_ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- 用户只能更新/删除自己的评分
CREATE POLICY "Users can update own ratings"
ON user_ratings FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own ratings"
ON user_ratings FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- 7. 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fund_managers_updated_at BEFORE UPDATE ON fund_managers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 创建更新基金经理评分的触发器
CREATE OR REPLACE FUNCTION update_manager_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 当有新评分或评分更新时，重新计算该经理的平均分
  UPDATE fund_managers
  SET
    total_ratings = (
      SELECT COUNT(*)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    average_score = (
      SELECT AVG(overall_score)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    dimension_return_rate = (
      SELECT AVG(dimension_return_rate)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    dimension_risk_control = (
      SELECT AVG(dimension_risk_control)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    dimension_drawdown = (
      SELECT AVG(dimension_drawdown)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    dimension_stability = (
      SELECT AVG(dimension_stability)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    dimension_communication = (
      SELECT AVG(dimension_communication)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    dimension_service = (
      SELECT AVG(dimension_service)
      FROM user_ratings
      WHERE manager_id = NEW.manager_id
    ),
    updated_at = NOW()
  WHERE id = NEW.manager_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manager_stats_on_rating_change
AFTER INSERT OR UPDATE ON user_ratings
FOR EACH ROW
EXECUTE FUNCTION update_manager_rating_stats();

-- 完成！
SELECT 'Supabase 数据库设置完成！' as status;
