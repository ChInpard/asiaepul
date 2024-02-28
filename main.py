import pandas as pd
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Query
from starlette.middleware.cors import CORSMiddleware

from typing import List, Dict
from pydantic import BaseModel

import random

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

    async def read_and_merge_data(self):
        if self.total_data is None:
            # 데이터 읽기 및 병합
            data_frames = []
            directory = "C:\\Pulmuone Fastapi\\data\\"
            for filename in os.listdir(directory):
                if filename.endswith(".csv"):
                    data_frames.append(pd.read_csv(os.path.join(directory, filename)))
            self.total_data = pd.concat(data_frames, ignore_index=True)
            print(f"total_data: {self.total_data}")
            print("=================")
        return self.total_data

    async def extract_yesterday_data(self):
        if self.yesterday_data is None:
            total_data = await self.read_and_merge_data()
            total_data['date'] = pd.to_datetime(total_data['date'])  # 문자열을 datetime으로 변환
            start_of_day = datetime.combine(self.yesterday, datetime.min.time())
            end_of_day = datetime.combine(self.yesterday, datetime.max.time())
            self.yesterday_data = total_data[(total_data['date'] >= start_of_day) & (total_data['date'] <= end_of_day)]
            print(f"yestday_date: {self.yesterday_data}")
        return self.yesterday_data
    
    async def extract_today_data(self):
        if self.today_data is None:
            total_data = await self.read_and_merge_data()
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
async def variance():
    yesterday_data = await data_processor.extract_yesterday_data()
    today_data = await data_processor.extract_today_data()
    result = data_processor.get_variance(yesterday_data, today_data)
    return {"variance": result}

@app.get("/best-category")
async def best_category():
    today_data = await data_processor.extract_today_data()
    result = data_processor.get_max_cate(today_data)
    return {"category": result}

@app.get("/best-product")
async def best_product():
    today_data = await data_processor.extract_today_data()
    result = data_processor.get_max_item(today_data)
    return {"product": result}

@app.get("/best-mart")
async def best_mart():
    today_data = await data_processor.extract_today_data()
    result = data_processor.get_best_mart(today_data)
    return {"mart": result}

@app.get("/peaktime")
async def peaktime():
    today_data = await data_processor.extract_today_data()
    result = data_processor.get_peak_time(today_data)
    return {"peakTime": result}


class MartData(BaseModel):
    categories: List[str]
    series: List[dict]

@app.get("/mart-rank", response_model=MartData)
async def get_mart_ranking():
    today_data = await data_processor.extract_today_data()
    
    mart_totals = today_data.groupby('mart')['tot'].sum().sort_values(ascending=True)
    top_mart_totals = mart_totals.head(9)
    
    mart_ranking = {}
    for idx, (mart, total) in enumerate(top_mart_totals.items(), start=1):
        rank = f"{idx}st" if idx == 1 else f"{idx}nd" if idx == 2 else f"{idx}rd" if idx == 3 else f"{idx}th"
        mart_ranking[mart] = {rank: total}

    categories = list(mart_ranking.keys())
    series = [{"value": list(values.values())[0]} for values in mart_ranking.values()]

    return MartData(categories=categories, series=series)

@app.get("/sales-volume")
async def sales_volume():
    today_data = await data_processor.extract_today_data()

    # today_data에서 code별 tot의 합계를 구하고 상위 5개를 선택합니다.
    top_codes_today = today_data.groupby('code')['tot'].sum().nlargest(5)
    
    sales_volume_data = []
    for rank, (code, today_tot) in enumerate(top_codes_today.items(), start=1):
        # 증감률 대신에 today_data에서 각 code의 tot의 합계 값을 입력합니다.
        # change_rate = abs(change_rate)  # 절대값으로 변환

        # 결과를 딕셔너리에 저장
        sales_top5 = {
            "rank": rank,
            "category": today_data.loc[today_data['code'] == code, 'cate'].iloc[0],
            "product": today_data.loc[today_data['code'] == code, 'name'].iloc[0],
            "amount": today_tot,  # 증감률 대신에 각 code의 tot의 합계 값을 입력합니다.
            # "change_rate": f"{symbol} {change_rate}%"  # 부호와 함께 증감률을 문자열 형식으로 저장
        }
        sales_volume_data.append(sales_top5)
    
    return sales_volume_data

@app.get("/rapid-change")
async def get_top_changes():
    today_data = await data_processor.extract_today_data()
    yesterday_data = await data_processor.extract_yesterday_data()

    # today_data와 yesterday_data를 code로 그룹화하여 tot의 합계를 구합니다.
    today_totals = today_data.groupby('code')['tot'].sum()
    yesterday_totals = yesterday_data.groupby('code')['tot'].sum().loc[lambda x: x >= 16]
    
    # 각 코드별 증감률을 계산합니다.
    changes = ((today_totals - yesterday_totals) / yesterday_totals) * 100
    
    # 증감률이 가장 큰 상위 5개를 선택합니다.
    top_changes = changes.nlargest(5)

    # 결과를 json 형식으로 변환합니다.
    result = []

    for rank, (code, change) in enumerate(top_changes.items(), start=1):
        # 해당 코드의 정보를 추출합니다.
        category = today_data.loc[today_data['code'] == code, 'cate'].iloc[0]
        product = today_data.loc[today_data['code'] == code, 'name'].iloc[0]
        yesterday_total = int(yesterday_totals.get(code, 0))
        today_total = int(today_totals.get(code, 0))

        # 부호를 결정합니다.
        symbol = '▲' if change > 0 else '▼'
        
        # 결과를 딕셔너리로 구성하되, code 대신 rank를 사용합니다.
        entry = {
            "rank": rank,                                 # 변경된 부분
            "category": category,
            "product": product,
            "yesterdayTotal": yesterday_total,
            "todayTotal": today_total,
            "status": f"{symbol}",
            "changeRate": f"{abs(change):.2f}%"
        }
        result.append(entry)
    return result

class SalesData(BaseModel):
    categories: List[str]
    series: List[int]

@app.get("/sales-trend", response_model=SalesData)
async def group_by_date_bin_to_json():
    today_data = await data_processor.extract_today_data()
    filtered_data = today_data[(today_data['date'].dt.hour >= 9) & (today_data['date'].dt.hour <= 23)]  # 오전 9시 ~ 오후 11시 59분
    filtered_data['date_bin'] = filtered_data['date'].dt.floor('30T')  # 30분 단위 구간 분할
    grouped = filtered_data.groupby('date_bin')['tot'].sum().reset_index()  # 시간대별로 그룹화
    grouped['date_bin'] = grouped['date_bin'].dt.strftime('%H:%M')  # 시간대 표기법 지정

    # SalesData 모델에 맞추어 데이터 형식을 변환
    categories = grouped['date_bin'].tolist()
    series = grouped['tot'].tolist()

    return {"categories": categories, "series": series}

class PredictData(BaseModel):
    categories: List[str]
    series: List[Dict[str, List[int]]]

@app.get("/prediction", response_model=PredictData)
async def get_sales_trend_chart_data():
    dates = []
    
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2023, 12, 31)

    extended_end_date = end_date + timedelta(days=40)

    date = start_date
    while date <= extended_end_date:
        year = str(date.year)[-2:]
        month = str(date.month).zfill(2)
        day = str(date.day).zfill(2)

        formatted_date = f"{year}.{month}.{day}"
        dates.append(formatted_date)

        date += timedelta(days=1)

    real_data = generate_real_data()
    predicted_data = generate_predicted_data()

    return PredictData(categories=dates, series=[
        {'realData': real_data},
        {'predictedData': predicted_data}
    ])


# 1년치의 더미 데이터를 생성하는 함수입니다.
def generate_real_data():
    data = []
    for i in range(365):
        # 수치를 엇비슷하게 만들기 위해 무작위 값을 사용합니다.
        random_value = random.randint(80, 250)
        data.append(random_value)

    return data

def generate_predicted_data():
    data = []
    for i in range(365 + 30):
        # 수치를 엇비슷하게 만들기 위해 무작위 값을 사용합니다.
        random_value = random.randint(80, 250)
        data.append(random_value)

    return data


class Product(BaseModel):
    id: int
    category: str
    name: str
    demandPrediction: int
    changeStatus: str
    changeRate: str
    actualVolume: List[int]
    demandForecast: List[int]
    dates: List[str]

class ProductsCache:
    _products = None

    @classmethod
    async def generate_products(cls, query: str = "") -> List[Product]:
        if cls._products is None:
            cls._products = await cls._generate_products(query)
        return cls._products

    @classmethod
    async def _generate_products(cls, query: str = "") -> List[Product]:
        products = []

        for i in range(1, 821):
            category_number = (i - 1) % 14 + 1  # 1부터 14까지의 숫자를 순환하도록 계산
            category = "Category " + str(category_number)
            name = "Product " + str(i)
            demand_prediction = random.randint(1000, 30000)
            change_status = "▲" if random.random() > 0.5 else "▼"
            change_rate = str(abs(round(random.uniform(-10, 10), 2)))
            
            dates = []
            start_date = datetime(2023, 1, 1)
            end_date = datetime(2023, 12, 31)
            extended_end_date = end_date + timedelta(days=40)

            date = start_date
            while date <= extended_end_date:
                formatted_date = date.strftime("%y.%m.%d")
                dates.append(formatted_date)
                date += timedelta(days=1)

            real_data = generate_real_data()
            predicted_data = generate_predicted_data()
            
            product = Product(
                id = i,
                category = category,
                name = name,
                demandPrediction = demand_prediction,
                changeStatus = change_status,
                changeRate = change_rate,
                actualVolume = real_data,
                demandForecast = predicted_data,
                dates = dates
            )
            
            # query에 해당하는 제품만 필터링
            if query and query.lower().replace(" ", "") not in product.name.lower().replace(" ", ""):
                continue
            
            products.append(product)
        
        return products

@app.get("/products")
async def get_products(query: str = Query(default=""), category: str = Query(default="")):
    print("query: ", {query})
    print("category: ", {category})
    products = await ProductsCache.generate_products(query)
    
    # 쿼리가 비어있지 않은 경우 제품 필터링
    if query:
        products = [product for product in products if query.lower() in product.name.lower()]

    # 카테고리가 제공된 경우 해당 카테고리에 속한 제품들만 필터링
    if category:
        products = [product for product in products if product.category == category]
    
    return products

@app.get("/categories")
async def get_categories(query: str = Query(default="")):
    print(query)
    products = await ProductsCache.generate_products(query)
    
    # 쿼리가 비어있지 않은 경우, 카테고리 이름에 쿼리 문자열이 포함된 카테고리를 필터링
    if query:
        categories = set(product.category for product in products if query.lower().replace(" ", "") in product.category.lower().replace(" ", ""))
    else:
        # 쿼리가 비어있는 경우 모든 제품의 카테고리를 가져옴
        categories = set(product.category for product in products)
    
    # 중복 제거 및 정렬된 고유한 카테고리 목록 생성
    sorted_categories = sorted(categories)
    
    return sorted_categories


class BigDataModel:
    def __init__(self):
        self.product_cache = {}

    async def run_analysis(self, productId: int) -> dict:
        if productId not in self.product_cache:
            # ProductsCache를 사용하여 제품 정보 가져오기
            products = await ProductsCache.generate_products()
        
            # productId를 사용하여 해당 제품 찾기
            product = next((p for p in products if p.id == productId), None)
        
            if product:
                # 제품 정보를 사용하여 분석 실행
                result = {
                    "productName": product.name,
                    "actualVolume": product.actualVolume,
                    "demandForecast": product.demandForecast,
                    "dates": product.dates
                }
                # 캐시에 저장
                self.product_cache[productId] = result
            else:
                result = {"error": "Product not found"}
        else:
            # 캐시에서 결과 반환
            result = self.product_cache[productId]
        
        return result
    
    async def calculate_error(self, productId: int) -> dict:
        # ProductsCache를 사용하여 제품 정보 가져오기
        products = await ProductsCache.generate_products()

        # productId를 사용하여 해당 제품 찾기
        product = next((p for p in products if p.id == productId), None)

        if product:
            # 실제 판매량과 예측 판매량 간의 오차 계산
            errors = [actual - forecast for actual, forecast in zip(product.actualVolume, product.demandForecast)]
            # 오차를 결과로 반환
            result = {"productName": product.name, "errors": errors}
        else:
            result = {"error": "Product not found"}

        return result

# BigDataModel 객체 생성
big_data_model_1 = BigDataModel()
big_data_model_2 = BigDataModel()

@app.get("/analysis/{productId}")
async def analyze_data(productId: int):
    # 두 모델에서 각각 분석 실행
    result_1 = await big_data_model_1.run_analysis(productId)
    result_2 = await big_data_model_2.calculate_error(productId)
    
    return {"resultModelOne": result_1, "resultModelTwo": result_2}