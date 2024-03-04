from function import *
import pandas as pd
from yahooquery import Ticker
import pyupbit

# raw=Ticker('AAPL').history(period='1y').xs('AAPL')

raw = pyupbit.get_ohlcv("KRW-BTC", interval="minute60", count=4320)

window_size,forecast_size=240,24
''' 1. preprocess raw data '''
# index => date, column => data
date, data=split_data(raw,'close')
''' 2. build dataloader '''
dataloader=build_dataLoader(data,
                            window_size=window_size,
                            forecast_size=forecast_size,
                            batch_size=8)
''' 3. train and evaluate '''
pred=trainer(data,
             dataloader,
             window_size=window_size,
             forecast_size=forecast_size).implement() 
''' 4. plot the result '''
figureplot(date,data,pred,window_size,forecast_size)
