from ex_quantity import *
raw = pd.read_csv('data_3차필터링.csv', index_col=['date_day'], parse_dates = True)
pred = predict("2023-12-22", raw)

print(pred)