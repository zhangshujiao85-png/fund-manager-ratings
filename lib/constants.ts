// 基金类型配置
export const FUND_TYPES = {
  stock: {
    label: '股票型',
    color: 'bg-red-100 text-red-700',
    icon: '📈',
  },
  mixed: {
    label: '混合型',
    color: 'bg-blue-100 text-blue-700',
    icon: '🔄',
  },
  bond: {
    label: '债券型',
    color: 'bg-green-100 text-green-700',
    icon: '💰',
  },
  index: {
    label: '指数型',
    color: 'bg-purple-100 text-purple-700',
    icon: '📊',
  },
  qdii: {
    label: 'QDII',
    color: 'bg-orange-100 text-orange-700',
    icon: '🌍',
  },
  money: {
    label: '货币型',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '💵',
  },
  other: {
    label: '其他',
    color: 'bg-gray-100 text-gray-700',
    icon: '📦',
  },
} as const

// 评分维度配置
export const RATING_DIMENSIONS = {
  returnRate: {
    label: '收益率表现',
    description: '基金经理的收益能力',
    color: '#ef4444',
  },
  riskControl: {
    label: '风控能力',
    description: '控制风险的能力',
    color: '#f59e0b',
  },
  drawdown: {
    label: '回撤控制',
    description: '下跌时的控制能力',
    color: '#10b981',
  },
  stability: {
    label: '稳定性',
    description: '业绩持续稳定的程度',
    color: '#3b82f6',
  },
  communication: {
    label: '沟通透明度',
    description: '与投资者沟通的及时性',
    color: '#8b5cf6',
  },
  service: {
    label: '服务质量',
    description: '整体服务体验',
    color: '#ec4899',
  },
} as const

// 模拟基金经理数据
export const MOCK_FUND_MANAGERS = [
  {
    id: '1',
    name: '张坤',
    company: '易方达基金',
    experience: 12,
    managedFunds: 5,
    fundTypes: ['stock', 'mixed'],
    biography: '易方达基金副总经理，投资总监，管理易方达蓝筹精选等基金',
    totalRatings: 1234,
    averageScore: 8.5,
    dimensionScores: {
      returnRate: 8.2,
      riskControl: 7.8,
      drawdown: 7.5,
      stability: 8.5,
      communication: 9.2,
      service: 8.8,
    },
    rank: 3,
    rankType: 'red' as const,
  },
  {
    id: '2',
    name: '葛兰',
    company: '中欧基金',
    experience: 8,
    managedFunds: 3,
    fundTypes: ['stock', 'mixed'],
    biography: '中欧基金基金经理，医药研究背景',
    totalRatings: 892,
    averageScore: 7.2,
    dimensionScores: {
      returnRate: 6.5,
      riskControl: 6.8,
      drawdown: 6.2,
      stability: 7.0,
      communication: 8.5,
      service: 8.0,
    },
    rank: 45,
    rankType: 'black' as const,
  },
  {
    id: '3',
    name: '刘彦春',
    company: '景顺长城基金',
    experience: 13,
    managedFunds: 4,
    fundTypes: ['stock', 'mixed'],
    biography: '景顺长城基金副总经理，投资部负责人',
    totalRatings: 1056,
    averageScore: 8.8,
    dimensionScores: {
      returnRate: 9.0,
      riskControl: 8.5,
      drawdown: 8.2,
      stability: 8.8,
      communication: 9.0,
      service: 9.2,
    },
    rank: 1,
    rankType: 'red' as const,
  },
  {
    id: '4',
    name: '周蔚文',
    company: '中欧基金',
    experience: 15,
    managedFunds: 6,
    fundTypes: ['mixed', 'stock'],
    biography: '中欧基金投资总监，价值投资践行者',
    totalRatings: 723,
    averageScore: 6.5,
    dimensionScores: {
      returnRate: 5.8,
      riskControl: 6.5,
      drawdown: 6.0,
      stability: 6.8,
      communication: 7.0,
      service: 7.2,
    },
    rank: 87,
    rankType: 'black' as const,
  },
  {
    id: '5',
    name: '朱少醒',
    company: '富国基金',
    experience: 18,
    managedFunds: 2,
    fundTypes: ['mixed'],
    biography: '富国基金副总经理，管理富国天惠精选成长',
    totalRatings: 2341,
    averageScore: 9.2,
    dimensionScores: {
      returnRate: 9.5,
      riskControl: 9.0,
      drawdown: 8.8,
      stability: 9.2,
      communication: 9.5,
      service: 9.3,
    },
    rank: 2,
    rankType: 'red' as const,
  },
]

// 本地存储键名
export const STORAGE_KEYS = {
  USER: 'fund_rating_user',
  RATINGS: 'fund_rating_ratings',
  MANAGERS: 'fund_rating_managers',
} as const
