import pandas as pd
import json

# 读取Excel
df = pd.read_excel(r'C:\Users\14437\Desktop\基金经理大全.xlsx', engine='openpyxl', header=None)

# 第1行是表头
headers = df.iloc[1].tolist()

# 从第2行开始获取数据
data_df = df.iloc[2:].copy()
data_df.columns = headers

# 列名映射（根据索引）
col_map = {
    0: 'name',           # 基金经理
    6: 'experience',     # 证券从业年限
    9: 'fund_count',     # 任职基金数
    16: 'company'        # 基金公司
}

managers = []
for idx, row in data_df.iterrows():
    try:
        # 提取数据
        name = str(row.iloc[0]).strip()
        company = str(row.iloc[16]).strip()

        # 清理公司名称
        company = company.replace('管理有限公司', '').replace('基金管理有限公司', '')
        company = company.replace('基金有限公司', '').replace('有限公司', '').strip()

        # 从业年限
        try:
            experience = float(row.iloc[6]) if pd.notna(row.iloc[6]) else 0
        except:
            experience = 0

        # 基金数量
        try:
            fund_count = int(row.iloc[9]) if pd.notna(row.iloc[9]) else 0
        except:
            fund_count = 0

        # 创建经理对象
        manager = {
            'id': f"mgr_{idx}",
            'name': name,
            'company': company,
            'experience': int(experience),
            'managedFunds': fund_count,
            'totalAssets': '0亿',
            'fundTypes': ['mixed', 'stock'],
            'biography': '',
            'totalRatings': 0,
            'averageScore': 5.0,
            'dimensionScores': {
                'returnRate': 5.0,
                'riskControl': 5.0,
                'drawdown': 5.0,
                'stability': 5.0,
                'communication': 5.0,
                'service': 5.0
            }
        }
        managers.append(manager)
    except Exception as e:
        continue

print(f"成功处理 {len(managers)} 位基金经理")

# 保存数据
with open('D:/USERS/fund-manager-ratings/public/managers_final.json', 'w', encoding='utf-8') as f:
    json.dump(managers, f, ensure_ascii=False, indent=2)

print("数据已保存到 managers_final.json")

# 显示统计信息
companies = {}
for m in managers:
    companies[m['company']] = companies.get(m['company'], 0) + 1

print(f"\n共有 {len(companies)} 个基金公司")
print("\n基金经理数量最多的前10个公司:")
sorted_companies = sorted(companies.items(), key=lambda x: x[1], reverse=True)
for i, (company, count) in enumerate(sorted_companies[:10]):
    print(f"  {i+1}. {company}: {count}位")
