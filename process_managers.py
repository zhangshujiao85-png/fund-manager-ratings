import pandas as pd
import json

# 读取Excel
df = pd.read_excel(r'C:\Users\14437\Desktop\基金经理大全.xlsx', engine='openpyxl')

# 跳过第一行（表头行）
df = df.iloc[1:].copy()  # 从第2行开始

# 重命名列（17列）
df.columns = [
    'name', 'gender', 'education', 'birth_year', 'country',
    'experience_years', 'management_years', 'resume',
    'manager_years', 'fund_count', 'company_count',
    'total_return', 'geo_avg_return', 'avg_return',
    'current_funds', 'current_fund_count', 'current_fund_size'
]

# 清理数据
managers = []
for _, row in df.iterrows():
    try:
        # 提取基金公司名称
        company = str(row['current_funds']).replace('管理有限公司', '').replace('基金管理有限公司', '').replace('基金有限公司', '').strip()
        if not company or company == 'nan':
            company = '未知公司'

        # 计算从业年限
        experience = 0
        try:
            experience = float(row['experience_years']) if pd.notna(row['experience_years']) else 0
        except:
            experience = 0

        # 计算管理基金数量
        fund_count = 0
        try:
            fund_count = int(row['fund_count']) if pd.notna(row['fund_count']) else 0
        except:
            fund_count = 0

        # 管理规模
        total_assets = '0亿'
        try:
            size = float(row['current_fund_size']) if pd.notna(row['current_fund_size']) else 0
            if size > 0:
                if size >= 10000:
                    total_assets = f"{size/10000:.2f}万亿"
                else:
                    total_assets = f"{size:.2f}亿"
        except:
            pass

        # 创建经理对象
        manager = {
            'id': f"mgr_{len(managers) + 1}",
            'name': str(row['name']).strip(),
            'company': company,
            'experience': int(experience),
            'managedFunds': fund_count,
            'totalAssets': total_assets,
            'fundTypes': ['mixed', 'stock'],
            'biography': str(row['resume'])[:100] if pd.notna(row['resume']) else '',
            'totalRatings': 0,
            'averageScore': 0,
            'dimensionScores': {
                'returnRate': 0,
                'riskControl': 0,
                'drawdown': 0,
                'stability': 0,
                'communication': 0,
                'service': 0
            }
        }
        managers.append(manager)
    except Exception as e:
        continue

print(f"成功处理 {len(managers)} 位基金经理")

# 保存处理后的数据
with open('D:/USERS/fund-manager-ratings/public/managers_processed.json', 'w', encoding='utf-8') as f:
    json.dump(managers, f, ensure_ascii=False, indent=2)

print(f"数据已保存")

# 显示前5个经理
print("\n前5位基金经理:")
for i, m in enumerate(managers[:5]):
    print(f"{i+1}. {m['name']} - {m['company']}")
