from function import *
import pandas as pd
from datetime import datetime

datetime_format = "%Y-%m-%d"
# datetime_start = datetime.strptime('2020-01-01', datetime_format)
# datetime_end = datetime.strptime('2023-12-31', datetime_format)


seed = 20230303
torch.manual_seed(seed)

PATH = "./LTSF.pth"
window_size, forecast_size = 30*12,10 # 30일 12달 데이터로 30일 예측(데이터 1일당 1개)



# raw = pd.read_csv('fakedata.csv', index_col=['date_day'], parse_dates = True)
# raw = pd.read_csv('data_3차필터링.csv', index_col=['date_day'], parse_dates = True)
# plt.plot(raw)
# plt.show()

# ''' 1. preprocess raw data '''
# date, data=split_data(raw,0,index=True) 

# # default '2023-12-22'
# # datetime_pred = datetime.strptime('2023-12-20', datetime_format)
# # print(date.index(datetime_pred))



# ''' 2. build dataloader '''
# dataloader=build_dataLoader(data,
#                             window_size=window_size,
#                             forecast_size=forecast_size,
#                             batch_size=4)

# ''' 3. train and evaluate '''
# pred=trainer(date, data,
#              dataloader,
#              window_size=window_size,
#              forecast_size=forecast_size,
#              name="NLinear",
#              loadModel=True,
#              PATH=PATH,
#              pred_date=date.index(datetime_pred)).implement() 

# ''' 4. plot the result ''' 
# figureplot(date,data,pred,window_size,forecast_size,pred_date=date.index(datetime_pred))








async def predict_ltsf(pred_date, raw, name):
    datetime_pred = datetime.strptime(pred_date, datetime_format)
    ''' 1. preprocess raw data '''
    date, data=split_data(raw,0,index=True) 

    ''' 2. build dataloader '''
    dataloader=build_dataLoader(data,
                            window_size=window_size,
                            forecast_size=forecast_size,
                            batch_size=4)

    ''' 3. train and evaluate '''
    pred=trainer(date, data,
             dataloader,
             window_size=window_size,
             forecast_size=forecast_size,
             name=name,
             loadModel=True,
             PATH=PATH,
             pred_date=date.index(datetime_pred)).implement()
    
    ''' 4. plot the result ''' 
    figureplot(date,data,pred,window_size,forecast_size,pred_date=date.index(datetime_pred))

    return pred

    

