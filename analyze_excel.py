import pandas as pd
import json

# 读取Excel，不跳过行
df = pd.read_excel(r'C:\Users\14437\Desktop\基金经理大全.xlsx', engine='openpyxl', header=None)

# 第1行是表头，第2行开始是数据
headers = df.iloc[1].tolist()
print('表头:', headers)

# 从第2行开始获取数据
data_df = df.iloc[2:].copy()
data_df.columns = headers

print(f'\n数据行数: {len(data_df)}')
print('\n前3行数据:')
print(data_df.head(3))

# 找到基金公司列（最后一列）
fund_company_col = data_df.columns[-1]
print(f'\n基金公司列名: {fund_company_col}')

# 统计唯一基金公司数量
unique_companies = data_df[fund_company_col].dropna().unique()
print(f'\n基金公司数量: {len(unique_companies)}')
print('前10个基金公司:')
for i, company in enumerate(unique_companies[:10]):
    print(f"  {i+1}. {company}")
