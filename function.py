import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from tqdm import tqdm
import torch
import torch.nn as nn
from torch.utils.data import Dataset
from torch.utils.data import DataLoader
from model import Dlinear,Nlinear
from sklearn.preprocessing import MinMaxScaler

scaler=MinMaxScaler()

def split_data(data,target,index=False):
    if index==False:
        result=data.loc[:,target]
    else:
        result=data.iloc[:,target]
    return list(result.index), result.to_numpy()

def transform(raw,check_inverse=False):
    data=raw.reshape(-1,1)
    if not check_inverse:
        return scaler.fit_transform(data)
    else:
        return scaler.inverse_transform(data)[:,0]
    
class windowDataset(Dataset):
    def __init__(self, y, input_window, output_window, stride=1):
        # y 1101, input_window 360, output_window 30
        L = y.shape[0]
        #stride씩 움직일 때 생기는 총 sample의 개수
        # 제외된 개수에서 윈도우 사이즈 + 예측 사이즈를 제외한 개수를 배치사이즈로 나누어 제공
        # num_samples 355
        num_samples = (L - input_window - output_window) // stride + 1
        #input과 output
        X,Y = np.zeros([input_window, num_samples]), np.zeros([output_window, num_samples])

        for i in np.arange(num_samples):
            start_x = stride*i
            end_x = start_x + input_window
            X[:,i] = y[start_x:end_x]

            start_y = stride*i + input_window
            end_y = start_y + output_window
            Y[:,i] = y[start_y:end_y]
            # 712개 원소배열인 360 개
            # X 0~711, 1~712, 2~713, ... , 359~1070
            # 712개 원소배열인 30 개 
            # Y 360~1071, ... , 389~1100

        X = X.reshape(X.shape[0], X.shape[1], 1).transpose((1,0,2)) #X:(num_samples,input_window,1)
        Y = Y.reshape(Y.shape[0], Y.shape[1], 1).transpose((1,0,2)) #Y:(num_samples,output_window,1)
        # X.shape (712, 360, 1), Y.shape (712, 30, 1)
        # 360 개 원소배열인 712 개
        # X 0~359, ... , 711~1070
        # 30 개 원소배열인 712 개
        # Y 360~389, ... , 1071~1100
        self.x, self.y = X, Y
        self.len = len(X)

    def __getitem__(self, i):
        return self.x[i], self.y[i]
    
    def __len__(self):
        return self.len

def build_dataLoader(data,window_size:int,forecast_size:int,batch_size:int):
    # data 총 개수 1461 개, window_size 360, forecast_size 30
    # train 윈도우 사이즈 제외한 1101 개
    transdata=transform(data)
    train=transdata[:-window_size,0]
    dataset=windowDataset(train,window_size,forecast_size) 
    result=DataLoader(dataset,batch_size=batch_size)
    return result

class trainer():
    def __init__(self, date, data, dataloader, window_size, forecast_size, name="NLinear", feature_size=4, lr=1e-4, loadModel=False, PATH='', pred_date=0):
        self.device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
        self.date = date
        self.data=data
        self.transdata=transform(data)
        self.trains=self.transdata[:-window_size,0]
        self.dataloader=dataloader
        self.window_size=window_size
        self.forecast_size=forecast_size
        self.loadModel = loadModel
        self.PATH = PATH
        self.lr = lr
        self.epoch = 100
        self.pred_date = pred_date

        if name=="DLinear":
            self.model=Dlinear(window_size,forecast_size).to(self.device)
            if(self.loadModel):
                self.model.load_state_dict(torch.load(self.PATH)["model"])
        elif name=="NLinear":
            self.model=Nlinear(window_size,forecast_size).to(self.device)
            if(self.loadModel):
                self.model.load_state_dict(torch.load(self.PATH)["model"])
        else:
            raise(ValueError("model name이 정확하지 않습니다. DLinear 또는 NLinear로 입력하셨는지 확인해주세요."))
        self.feature_size=feature_size
        self.name=name
        self.criterion = nn.MSELoss()
        self.optimizer=torch.optim.Adam(self.model.parameters(),lr=lr)

    def train(self, epoch=100): # epoch=65
        self.model.train()
        progress=tqdm(range(epoch))
        losses=[]
        for _ in progress:
            batchloss = 0.0
            for (inputs, outputs) in self.dataloader:
                self.optimizer.zero_grad()
                result = self.model(inputs.float().to(self.device))
                loss = self.criterion(result, outputs.float().to(self.device))
                loss.backward()
                self.optimizer.step()
                batchloss += loss
            losses.append(batchloss.cpu().item())
            progress.set_description("loss: {:0.6f}".format(batchloss.cpu().item() / len(self.dataloader)))

        # 모델 저장
            
        # for name, param in self.model.named_parameters():
        #     print(name, param.shape, param)
        # print("lr: ", self.optimizer.param_groups[0]['lr'])
        if(self.loadModel == False):
            PATH = "./LTSF.pth"
            # torch.save(self.model.state_dict(), PATH)
            torch.save({
                "model": self.model.state_dict(),
                "optimizer": self.optimizer.state_dict(),
                "lr": self.lr,
                "epoch": self.epoch
                }
                , PATH)

        plt.xlabel('epochs')
        plt.ylabel('loss')
        plt.title('epoch vs loss graph')
        plt.plot(losses)

    def evaluate(self):
        window_size=self.window_size
        forecast_size=self.forecast_size
        # input = torch.tensor(self.transdata[-window_size-forecast_size:-forecast_size]).reshape(1,-1,1).float().to(self.device)
        input = torch.tensor(self.transdata[self.pred_date-window_size:self.pred_date]).reshape(1,-1,1).float().to(self.device)
        # self.trains=transform(self.data)[:-window_size-self.forecast_size,0]
        # input = torch.tensor(self.trains[-window_size:]).reshape(1,-1,1).float().to(self.device)
        print("trainsdata shape : ", self.transdata.shape, "pred input shape : ", input.shape)
        # 슬라이싱은 마지막 숫자 제외 1461 로 입력해야 1460 까지 슬라이싱
        print(f"trainsdata[{self.pred_date-window_size}:{self.pred_date}]")
        print(f"trainsdata[{self.date[self.pred_date-window_size]}:{self.date[self.pred_date]}]")
        self.model.eval()
        if(self.loadModel):
            predictions = self.model(input)
            # for i in range(10):
            #     print(i)
            #     input = torch.tensor(self.transdata[-window_size-forecast_size+i:-forecast_size+i]).reshape(1,-1,1).float().to(self.device)
            #     predictions = self.model(input)
            #     print(predictions)
        else:
            predictions = self.model(input)
        return predictions.detach().cpu().numpy()
    
    def implement(self):
        process=trainer(self.date, self.data, self.dataloader, self.window_size,
                        self.forecast_size, self.name, self.feature_size, self.lr, self.loadModel, self.PATH, self.pred_date)
        if(self.loadModel == False):
            process.train()
        evaluate=process.evaluate()
        result=transform(evaluate,check_inverse=True)
        return result

def figureplot(date,data,pred,window_size,forecast_size,pred_date):
    print(pred)
    print(pred_date)
    print(data.shape)
    # datetime 배열 => float 형으로 변경 
    datenum=mdates.date2num(date)
    
    len=data.shape[0]

    # print(datenum.shape, data.shape)
    fig, ax = plt.subplots(figsize=(16,9))
    # x => datenum, y => data
    # ax.plot(datenum[len-forecast_size:len], data[len-forecast_size:len], label="Real")
    print(f"data[{pred_date}:{pred_date+forecast_size}]")
    print(f"date[{date[pred_date]}:{date[pred_date+forecast_size-1]}]")
    ax.plot(datenum[pred_date:pred_date+forecast_size], data[pred_date:pred_date+forecast_size], label="Real")
    ax.plot(datenum[pred_date:pred_date+forecast_size], pred, label="LTSF-linear")
    # ax.set_xlim(datenum[len-forecast_size],datenum[-1])
    ax.set_xlim(datenum[pred_date],datenum[pred_date+forecast_size-1])
    print(pred_date+forecast_size)
    print('x축 : ',datenum[0],'->',datenum[-1])
    locator = mdates.AutoDateLocator()
    formatter = mdates.AutoDateFormatter(locator)
    ax.xaxis.set_major_locator(locator)
    ax.xaxis.set_major_formatter(formatter)
    plt.xlabel('date')
    plt.ylabel('values')
    plt.title('Comparison between prediction and actual values')
    plt.legend()
    # plt.show()