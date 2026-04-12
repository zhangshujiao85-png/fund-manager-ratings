# 基金经理数据导入指南

本指南将帮助你将 4110 位基金经理数据导入到 Supabase 数据库。

## 📋 前置条件

在导入数据之前，请确保已完成以下步骤：

1. ✅ 创建 Supabase 项目
2. ✅ 运行 `supabase-setup.sql` 创建数据库表
3. ✅ 在 `.env.local` 中配置 Supabase 凭据

## 🚀 快速开始

### 步骤 1: 配置 Supabase 凭据

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**如何获取凭据：**
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **Settings** → **API**
4. 复制 **Project URL** 和 **anon public** key

### 步骤 2: 安装依赖（如果还没安装）

```bash
npm install
```

### 步骤 3: 运行导入脚本

```bash
node scripts/import-to-supabase.js
```

## 📊 导入过程

脚本执行时会显示以下信息：

```
🚀 开始导入基金经理数据到 Supabase...

📖 读取 managers_final.json...
✅ 成功读取 4110 位基金经理

🔍 检查数据库...
📊 当前数据库中有 0 位基金经理

📦 开始批量导入...
✅ 进度: 2% (100/4110)
✅ 进度: 5% (200/4110)
...
✅ 进度: 100% (4110/4110)

==================================================
📊 导入完成!
==================================================
✅ 成功导入: 4110 条
❌ 失败: 0 个批次
📈 总数: 4110 位基金经理

🔍 验证导入结果...
✅ 数据库中现有 4110 位基金经理

🎉 导入完成! 你可以在 Supabase Dashboard 中查看数据
🔗 https://supabase.com/dashboard
```

## 🔍 验证导入

导入完成后，你可以通过以下方式验证：

### 方式 1: Supabase Dashboard

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **Table Editor**
4. 查看 `fund_managers` 表

### 方式 2: 运行测试

访问你的应用并检查：

```bash
npm run dev
```

打开浏览器控制台，应该看到：

```
📦 存储模式: Supabase 云数据库
```

然后在应用中搜索基金经理，应该能看到 4110 条数据。

## 🛠️ 脚本特性

- ✅ **批量导入** - 每批 100 条，提高效率
- ✅ **错误处理** - 单个批次失败不影响其他批次
- ✅ **进度显示** - 实时显示导入进度
- ✅ **upsert 模式** - 已存在的数据会被更新，避免重复
- ✅ **数据验证** - 导入后自动验证数据量

## 📝 数据字段映射

脚本会自动转换字段名：

| JSON 字段 | 数据库字段 |
|----------|----------|
| id | id |
| name | name |
| company | company |
| experience | experience |
| managedFunds | managed_funds |
| totalAssets | total_assets |
| fundTypes | fund_types |
| biography | biography |
| totalRatings | total_ratings |
| averageScore | average_score |
| dimensionScores.returnRate | dimension_return_rate |
| dimensionScores.riskControl | dimension_risk_control |
| dimensionScores.drawdown | dimension_drawdown |
| dimensionScores.stability | dimension_stability |
| dimensionScores.communication | dimension_communication |
| dimensionScores.service | dimension_service |

## ⚠️ 常见问题

### Q: 导入失败怎么办？

**错误**: `检查数据库失败: ...`

**解决**:
1. 确认 Supabase 凭据是否正确
2. 确认已运行 `supabase-setup.sql` 创建表
3. 检查网络连接

### Q: 如何重新导入？

**选项 1**: 追加模式（默认）
- 再次运行脚本，会跳过已存在的数据

**选项 2**: 清空重导
1. 在 Supabase Dashboard 中
2. 打开 SQL Editor
3. 运行: `TRUNCATE TABLE fund_managers RESTART IDENTITY CASCADE;`
4. 重新运行导入脚本

### Q: 导入速度慢？

导入速度取决于：
- 网络延迟（Supabase 服务器位置）
- 批次大小（默认 100，可在脚本中调整）

如果需要更快导入，可以：
1. 调整 `batchSize` 变量（如改为 200）
2. 确保网络稳定

### Q: 数据不完整？

脚本会导入 `public/managers_final.json` 中的所有数据。如果数据不完整：

1. 检查 JSON 文件是否完整
2. 查看控制台错误信息
3. 验证 Supabase 表结构

## 🔄 后续操作

导入完成后，建议：

1. **测试应用** - 访问 http://localhost:3000 验证数据
2. **查看数据** - 在 Supabase Dashboard 中检查数据质量
3. **设置 RLS** - 确认行级安全策略已正确配置
4. **备份** - 定期备份 Supabase 数据库

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 配置指南
- [README.md](./README.md) - 项目说明

## 🆘 需要帮助？

如果遇到问题：

1. 查看脚本输出的错误信息
2. 检查 Supabase Dashboard 中的日志
3. 确认 `.env.local` 配置正确
4. 查看浏览器控制台的错误

---

**祝你导入顺利！** 🎉
