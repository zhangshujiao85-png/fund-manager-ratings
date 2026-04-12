# Supabase 数据库集成指南

## 📋 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com
2. 注册/登录账户
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: fund-manager-ratings (或任意名称)
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择距离你最近的区域
5. 点击 "Create new project"，等待 2-3 分钟

## 📋 步骤 2: 获取 API 凭据

项目创建完成后：

1. 在左侧菜单点击 **Settings** -> **API**
2. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 开头

3. 将这两个值粘贴到 `.env.local` 文件中：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 📋 步骤 3: 创建数据库表

在 Supabase Dashboard 中：

1. 点击左侧菜单 **SQL Editor**
2. 点击 **New Query**
3. 复制 `supabase-setup.sql` 文件中的所有 SQL 代码
4. 粘贴到编辑器中
5. 点击 **Run** 执行

## 📋 步骤 4: 启用行级安全 (RLS)

SQL 脚本会自动配置 RLS 策略：
- ✅ 基金经理数据：所有人可读，仅认证用户可写
- ✅ 评分数据：所有人可读，仅作者可修改/删除
- ✅ 用户数据：仅本人可读写

## 📋 步骤 5: 导入初始数据（可选）

如果你想导入 4110 位基金经理的真实数据：

1. 在 SQL Editor 中运行：
   ```sql
   -- 这个步骤需要在代码中实现导入功能
   -- 或使用 Supabase 的 Table Editor 逐条导入
   ```

## 🚀 完成后

重启开发服务器：
```bash
npm run dev
```

访问 http://localhost:3000，应用现在会使用 Supabase 数据库！

## 🔍 常见问题

**Q: 数据没有加载？**
- 检查 `.env.local` 文件是否正确配置
- 确认 Supabase 项目是否处于 Active 状态
- 查看浏览器控制台的错误信息

**Q: 如何查看数据库内容？**
- 在 Supabase Dashboard 点击 **Table Editor**

**Q: 如何重置数据库？**
- 在 SQL Editor 运行 `supabase-setup.sql` 中的 DROP TABLE 语句，然后重新创建
