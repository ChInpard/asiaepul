import numpy as np
import pandas as pd


### part1 start ### 통합.xlsx 파일 읽어서 'cate' column 'Bagel' 행 sheet 별로 추출하기

# # all sheet loaded
# df = pd.read_excel('C:\edu\data\pulmuone\pulmuone.xlsx', sheet_name=None)
# df.info()

# # // 각각 sheet 별 그룹화 후 개수 정렬
# df['data0'].groupby(['cate','name']).size().sort_values(ascending=False)
# df0 = df['data0']

# for i in range(len(df)):
#     df_part = df[f'data{i}']
#     # // 정규식 이용하여 행 추출하기
#     filtered_df = df_part[df_part['cate'].str.contains(r'(Bagel)')]

#     # // index 없이 data 만 저장하기
#     filtered_df.to_csv(f'data{i}_1차필터링.csv', index=False)
### part1 end ###

### part2 start ### sheet 별 파일 합치기
# df_csv = pd.DataFrame()
# df_ = pd.DataFrame()
# print(df_csv.info())


# for i in range(10):
#     data = pd.read_csv(f'data{i}_1차필터링.csv')
#     if i == 0:
#         df_csv = data.copy()
#     else:
#         df_ = data.copy()
#         df_csv = pd.concat([df_csv, df_])

# df_csv.to_csv(f'data_2차필터링.csv', index=False)
### part2 end ###
# data = pd.read_csv('data_2차필터링.csv', index_col=['date'], parse_dates = True)
data = pd.read_csv(f'data_2차필터링.csv')
data['date'] = pd.to_datetime(data['date'])
# print(df_csv.groupby(['Unnamed: 0']).size())
print(data.groupby(['date']).size().sort_values(ascending=False))
data['date_day'] = data['date'].dt.strftime('%Y-%m-%d')
data_final = data.groupby(['date_day']).agg({'tot': 'sum'})
data_final = data_final.reset_index()
data_final.to_csv('data_3차필터링.csv', index=False)