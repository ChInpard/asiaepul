import pandas as pd
from datetime import datetime
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

import asyncio
# from prisma import Prisma

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DataProcessor:
    def __init__(self):
        self.total_data = None
        self.yesterday_data = None
        self.today_data = None
        self.yesterday = datetime(2023, 12, 30)
        self.today = datetime(2023, 12, 31)

    def read_and_merge_data(self):
        if self.total_data is None:
            # 데이터 읽기 및 병합
            data_frames = [pd.read_csv(f"C:\\Pulmuone Fastapi\\data\\data{i}.csv") for i in range(10)]
            self.total_data = pd.concat(data_frames, ignore_index=True)
            # self.total_data['date'] = pd.to_datetime(self.total_data['date'])
            print(f"total_data: {self.total_data}")
            print("=================")
        return self.total_data

    def extract_yesterday_data(self):
        if self.yesterday_data is None:
            total_data = self.read_and_merge_data()
            total_data['date'] = pd.to_datetime(total_data['date'])  # 문자열을 datetime으로 변환
            start_of_day = datetime.combine(self.yesterday, datetime.min.time())
            end_of_day = datetime.combine(self.yesterday, datetime.max.time())
            self.yesterday_data = total_data[(total_data['date'] >= start_of_day) & (total_data['date'] <= end_of_day)]
            print(f"yestday_date: {self.yesterday_data}")
        return self.yesterday_data
    
    def extract_today_data(self):
        if self.today_data is None:
            total_data = self.read_and_merge_data()
            total_data['date'] = pd.to_datetime(total_data['date'])  # 문자열을 datetime으로 변환
            start_of_day = datetime.combine(self.today, datetime.min.time())
            end_of_day = datetime.combine(self.today, datetime.max.time())
            self.today_data = total_data[(total_data['date'] >= start_of_day) & (total_data['date'] <= end_of_day)]
            print(f"today_data: {self.today_data}")
        return self.today_data
    
    def get_variance(self, yestday_data, today_data):
        yesterday_tot_sum = yestday_data['tot'].sum()
        today_tot_sum = today_data['tot'].sum()
        
        change_rate = round(((today_tot_sum - yesterday_tot_sum) / yesterday_tot_sum) * 100, 2)
        symbol = '▲' if change_rate > 0 else '▼'
        change_rate_str = f"{symbol} {abs(change_rate)}%"
        print(data_processor.today)
        return change_rate_str
    
    def get_max_cate(self, today_data):
        max_cate = today_data.groupby('cate')['tot'].sum().idxmax()
        return max_cate

    def get_max_item(self, today_data):
        max_item = today_data.groupby(['cate', 'name'])['tot'].sum().idxmax()[1]
        return max_item

    def get_best_mart(self, today_data):
        today_data['mart'] = today_data['mart'].astype(str)
        best_mart = today_data.groupby('mart')['tot'].sum().idxmax()
        return best_mart

    
    def get_peak_time(self,today_data):
        today_data = today_data.copy()  # 복사본 생성
        today_data['date'] = pd.to_datetime(today_data['date'])
        peak_hour = today_data['date'].dt.hour.value_counts().idxmax()
        start_time = pd.to_datetime(f'{peak_hour}:00:00').strftime('%H:%M')
        end_time = (pd.to_datetime(f'{peak_hour}:00:00') + pd.Timedelta(hours=1)).strftime('%H:%M')
        peak_time = f"{start_time} ~ {end_time}"
        return peak_time


data_processor = DataProcessor()

@app.get("/variance")
def variance():
    yesterday_data = data_processor.extract_yesterday_data()
    today_data = data_processor.extract_today_data()
    result = data_processor.get_variance(yesterday_data, today_data)
    return {"variance": result}

@app.get("/best-category")
def best_category():
    today_data = data_processor.extract_today_data()
    result = data_processor.get_max_cate(today_data)
    return {"category": result}

@app.get("/best-product")
def best_product():
    today_data = data_processor.extract_today_data()
    result = data_processor.get_max_item(today_data)
    return {"product": result}

@app.get("/best-mart")
def best_mart():
    today_data = data_processor.extract_today_data()
    result = data_processor.get_best_mart(today_data)
    return {"mart": result}

@app.get("/peaktime")
def peaktime():
    today_data = data_processor.extract_today_data()
    result = data_processor.get_peak_time(today_data)
    return {"peakTime": result}
