import pandas as pd
import json

# 读取Excel文件
df = pd.read_excel(r'C:\Users\14437\Desktop\基金经理大全.xlsx', engine='openpyxl')

# 显示信息
print("列名:")
print(df.columns.tolist())
print("\n前3行数据:")
print(df.head(3))
print(f"\n总共有 {len(df)} 位基金经理")

# 保存为JSON
output_file = 'D:/USERS/fund-manager-ratings/public/managers.json'
df.to_json(output_file, orient='records', force_ascii=False, indent=2)
print(f"\n数据已保存到: {output_file}")
