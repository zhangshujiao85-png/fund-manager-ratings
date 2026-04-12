# 基金经理评分系统

一个类似虎扑风格的基金经理评分平台，支持用户评分、评论和收藏功能。

## ✨ 功能特点

- 🔥 **红黑榜** - 显示口碑最好和最差的基金经理
- 🔍 **发现页** - 搜索、筛选、排序基金经理
- 👤 **个人中心** - 登录、收藏、评分历史
- ⭐ **六维评分** - 收益率、风控、回撤、稳定性、沟通、服务
- 💬 **评论系统** - 支持文字评论和有用投票
- 📊 **实时排名** - 自动计算并更新排行榜

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 配置 Supabase（可选）

默认使用 localStorage 存储数据。如需使用云数据库，请参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 配置 Supabase。

**导入数据到 Supabase：**

配置好 Supabase 后，运行以下命令导入 4110 位基金经理数据：

```bash
node scripts/import-to-supabase.js
```

详细说明请查看 [IMPORT_DATA.md](./IMPORT_DATA.md)。

## 📦 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **图表**: Recharts
- **数据库**: Supabase (可选) / localStorage

## 📁 项目结构

```
fund-manager-ratings/
├── app/                    # Next.js 应用目录
│   ├── page.tsx           # 首页（红黑榜）
│   ├── explore/           # 发现页
│   ├── profile/           # 个人中心
│   └── manager/[id]/      # 基金经理详情
├── components/            # React 组件
│   ├── Navbar.tsx        # 导航栏
│   └── ...
├── lib/                  # 工具库
│   ├── storage.ts        # 统一存储接口
│   ├── storage-supabase.ts # Supabase 实现
│   └── ...
├── types/               # TypeScript 类型定义
└── public/              # 静态资源
    └── managers_final.json # 基金经理数据
```

## 🎨 页面说明

### 首页 (/)
- 🔥 红榜：评分最高的 TOP 20
- ⚠️ 黑榜：评分最低的 TOP 20
- 🏆 排名角标：前3名显示奖牌

### 发现页 (/explore)
- 🔍 搜索基金经理或公司
- 🏷️ 按基金类型筛选
- ⬆️⬇️ 按评分排序

### 个人中心 (/profile)
- 👤 登录/退出登录
- ❤️ 收藏的基金经理
- ⭐ 我的评分历史

## 📊 数据说明

### 基金经理数据
- 总数：4110 位基金经理
- 来源：真实市场数据
- 公司：167 家基金公司

### 评分数据
- 前台演示：前100位经理有模拟评分
- 真实环境：用户提交评分后自动计算

## 🔒 安全特性

- ✅ 行级安全（RLS）
- ✅ 用户只能修改自己的数据
- ✅ 评分防刷：每人每经理只能评一次

## 📝 待实现功能

- [ ] Supabase Auth 集成（真实用户登录）
- [ ] 实时订阅（评分变化通知）
- [ ] 用户头像上传
- [ ] 数据导出功能
- [ ] 移动端优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

---

**需要帮助？** 查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 了解如何配置云数据库。
