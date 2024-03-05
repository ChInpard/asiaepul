# https://eunhye-zz.tistory.com/8

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset # 텐서데이터셋
from torch.utils.data import DataLoader # 데이터로더
import random
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime

seed = 20230303
torch.manual_seed(seed)

datetime_format = "%Y-%m-%d"
datetime_pred = datetime.strptime('2023-12-22', datetime_format)
# print(date.index(datetime_pred))
# print(len(date)-forecast_size)



device = torch.device("cpu")
print(device)

# 데이터 불러오기
# df = pd.read_csv('data_3차필터링.csv', index_col=['date_day'], parse_dates = True)
# df['y'] = df['tot']
# print(df.info())

# print(df.info())
# df = pyupbit.get_ohlcv("KRW-BTC", interval="minute60", count=4320) # 180 일
# df = df.reset_index()
# df = df.loc[:, 'open':'volume']
# df.drop(0, axis=1)

# 30일간의 데이터가 입력으로 들어가고 batch size는 임의로 지정
split_size = 0.9
seq_length = 120 # window size
pred_length = 10 # forecast_size
batch = 4

# 데이터를 역순으로 정렬하여 전체 데이터의 80% 학습, 20% 테스트에 사용
# df = df[::-1]

# scaler = MinMaxScaler()
# df.loc[:, ['open','high','low','close','volume']] = scaler.fit_transform(df.loc[:, ['open','high','low','close','volume']])


# 데이터셋 생성 함수
def build_dataset(time_series, seq_length):
    dataX = []
    dataY = []
    for i in range(0, len(time_series)-seq_length):
        # _x = time_series.loc[i:i+seq_length, ['open','high','low','volume','value']]
        # _y = time_series.loc[i+seq_length, 'close']
        _x = time_series[i:i+seq_length, [0]]
        _y = time_series[i+seq_length, [1]]
        # print(_x, "-->",_y)
        dataX.append(_x)
        dataY.append(_y)

    return np.array(dataX), np.array(dataY)

def split_data(df, split_size, seq_length, pred_length, pred_date):

    # train_size = int(len(df)*split_size)
    train_size = pred_date
    # train_set = df[0:train_size]
    train_set=df[:train_size]
    test_set = df[train_size-seq_length:]
    print("df_set : ", df.shape, "train_set : ", train_set.shape, "test_set : ", test_set.shape)
    # df_set :  (1461, 2) train_set :  (1168, 2) test_set :  (653, 2) # 80%

    # Input scale
    scaler_x = MinMaxScaler()
    scaler_x.fit(train_set.loc[:, ['tot']])

    # train_set.iloc[:, :-1] = scaler_x.transform(train_set.iloc[:, :-1])
    # test_set.iloc[:, :-1] = scaler_x.transform(test_set.iloc[:, :-1])
    train_set.loc[:, ['tot']] = scaler_x.transform(train_set.loc[:, ['tot']])
    test_set.loc[:, ['tot']] = scaler_x.transform(test_set.loc[:, ['tot']])

    # Output scale
    scaler_y = MinMaxScaler()
    scaler_y.fit(train_set.loc[:, ['y']])

    # train_set.iloc[:, -1] = scaler_y.transform(train_set.iloc[:, [-1]])
    # test_set.iloc[:, -1] = scaler_y.transform(test_set.iloc[:, [-1]])
    train_set.loc[:, ['y']] = scaler_y.transform(train_set.loc[:, ['y']])
    test_set.loc[:, ['y']] = scaler_y.transform(test_set.loc[:, ['y']])

    trainX, trainY = build_dataset(np.array(train_set), seq_length)
    print(trainX.shape, trainY.shape)
    testX, testY = build_dataset(np.array(test_set), seq_length)
    print(testX.shape, testY.shape)

    # 텐서로 변환
    trainX_tensor = torch.FloatTensor(trainX)
    trainY_tensor = torch.FloatTensor(trainY)

    testX_tensor = torch.FloatTensor(testX)
    testY_tensor = torch.FloatTensor(testY)
    print("testX size :", testX_tensor.size(), " testX shape : ", testX_tensor.shape)
    print("testY size :", testY_tensor.size(), " testY shape : ", testY_tensor.shape)

    # 텐서 형태로 데이터 정의
    dataset = TensorDataset(trainX_tensor, trainY_tensor)

    # 데이터로더는 기본적으로 2개의 인자를 입력받으며 배치크기는 통상적으로 2의 배수를 사용
    dataloader = DataLoader(dataset,
                            batch_size=batch,
                            shuffle=True,
                            drop_last=True)
    
    return train_size, train_set, test_set, testX_tensor, testY_tensor, scaler_y, dataloader


# 설정값
# data_dim = 5
data_dim = 2
hidden_dim = 10 
output_dim = 1 
learning_rate = 0.01
nb_epochs = 100

class Net(nn.Module):
    # # 기본변수, layer를 초기화해주는 생성자
    def __init__(self, input_dim, hidden_dim, seq_len, output_dim, layers):
        super(Net, self).__init__()
        self.hidden_dim = hidden_dim
        self.seq_len = seq_len
        self.output_dim = output_dim
        self.layers = layers
        
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=layers,
                            # dropout = 0.1,
                            batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim, bias = True) 
        
    # 학습 초기화를 위한 함수
    def reset_hidden_state(self): 
        self.hidden = (
                torch.zeros(self.layers, self.seq_len, self.hidden_dim),
                torch.zeros(self.layers, self.seq_len, self.hidden_dim))
    
    # 예측을 위한 함수
    def forward(self, x):
        x, _status = self.lstm(x)
        x = self.fc(x[:, -1])
        return x
    
    def train_model(model, train_df, num_epochs = None, lr = None, verbose = 10, patience = 10):
     
        criterion = nn.MSELoss().to(device)
        optimizer = torch.optim.Adam(model.parameters(), lr = learning_rate)
        nb_epochs = num_epochs
        
        # epoch마다 loss 저장
        train_hist = np.zeros(nb_epochs)

        for epoch in range(nb_epochs):
            avg_cost = 0
            total_batch = len(train_df)
            
            for batch_idx, samples in enumerate(train_df):

                x_train, y_train = samples
                
                # seq별 hidden state reset
                model.reset_hidden_state()
                
                # H(x) 계산
                outputs = model(x_train)
                    
                # cost 계산
                loss = criterion(outputs, y_train)                    
                
                # cost로 H(x) 개선
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                
                avg_cost += loss/total_batch
                
            train_hist[epoch] = avg_cost        
            
            if epoch % verbose == 0:
                print('Epoch:', '%04d' % (epoch), 'train loss :', '{:.4f}'.format(avg_cost))
                
            # patience번째 마다 early stopping 여부 확인
            if (epoch % patience == 0) & (epoch != 0):
                
                # loss가 커졌다면 early stop
                if train_hist[epoch-patience] < train_hist[epoch]:
                    print('\n Early Stopping')
                    
                    break
                
        return model.eval(), train_hist

nb_epochs = 100
learning_rate = 0.01

def training(dataloader, loadModel):

    if(loadModel == False):
        # 모델 학습
        net = Net(data_dim, hidden_dim, seq_length, output_dim, 1).to(device)
        model, train_hist = net.train_model( dataloader, num_epochs = nb_epochs, lr = learning_rate, verbose = 20, patience = 10)
        # epoch별 손실값
        fig = plt.figure(figsize=(10, 4))
        plt.plot(train_hist, label="Training loss")
        plt.legend()
        plt.show()

    # 모델 저장    
    PATH = "./Timeseries_LSTM_data-pulmuone_daily_.pth"

    if(loadModel == False):
        torch.save(model.state_dict(), PATH)

    return PATH

def predict(pred_date, data_dim, hidden_dim, seq_length, output_dim, testX_tensor, testY_tensor, scaler_y, PATH):
    # 불러오기
    model = Net(data_dim, hidden_dim, seq_length, output_dim, 1).to(device)
    model.load_state_dict(torch.load(PATH), strict=False)
    model.eval() # 평가모드로 전환

    # print("len testX", len(testX_tensor))
    # 예측 테스트
    with torch.no_grad(): 
        pred = []
        for pr in range(len(testX_tensor)):

            model.reset_hidden_state()

            predicted = model(torch.unsqueeze(testX_tensor[pr], 0))
            predicted = torch.flatten(predicted).item()
            pred.append(predicted)

        # INVERSE
        print("pred.length : ", len(pred))
        pred_inverse = scaler_y.inverse_transform(np.array(pred).reshape(-1, 1))
        testY_inverse = scaler_y.inverse_transform(testY_tensor)

        return pred_inverse, testY_inverse
    

def MAE(true, pred):
    return np.mean(np.abs(true-pred))

def figure_plot(df, train_size, pred_inverse, testY_inverse):

    print('MAE SCORE : ', MAE(pred_inverse, testY_inverse))
    print('len(df) : ', len(df))
    print('train_size : ',train_size)
    print('pred_inverse : ',len(pred_inverse))
    print('testY_inverse : ',len(testY_inverse))
    fig = plt.figure(figsize=(16,9))

    plt.plot(df.index[train_size:], pred_inverse.reshape(-1,), label = 'pred', color='red')
    plt.plot(df.index[train_size:], testY_inverse.reshape(-1,), label = 'true')
    # plt.plot(np.arange(len(pred_inverse)), pred_inverse, label = 'pred')
    # plt.plot(np.arange(len(testY_inverse)), testY_inverse, label = 'true')
    # plt.plot(df.index, df['tot'], label = 'tot')
    # plt.xlim(df.index[train_size-seq_length], df.index[-1])
    plt.xlim(df.index[train_size], df.index[-1])
    plt.title("Loss plot")
    # plt.show()