from lstm_pulmuone_20240304 import *


# print(df.index[0])
# print('loc',df.index.get_loc('2023-12-31'))

datetime_format = "%Y-%m-%d"
datetime_pred = datetime.strptime('2020-01-01', datetime_format)
# pred_date=df[datetime_pred]

# print("pred_date: ", pred_date==df.index[0])

def LSTM(pred_date, df):

    train_size, train_set, test_set, testX_tensor, testY_tensor, scaler_y, dataloader = split_data(df, split_size, seq_length, pred_length, df.index.get_loc(pred_date))

    PATH = training(dataloader, loadModel = False)

    pred_inverse, testY_inverse = predict(df.index.get_loc(pred_date), data_dim, hidden_dim, seq_length, output_dim, testX_tensor, testY_tensor, scaler_y, PATH)

    print(pred_inverse.shape, testY_inverse.shape)

    figure_plot(df, train_size, pred_inverse, testY_inverse)

    return pred_inverse

def LSTM_pred(pred_date, df):

    train_size, train_set, test_set, testX_tensor, testY_tensor, scaler_y, dataloader = split_data(df, split_size, seq_length, pred_length, df.index.get_loc(pred_date))

    PATH = training(dataloader, loadModel = True)

    pred_inverse, testY_inverse = predict(df.index.get_loc(pred_date), data_dim, hidden_dim, seq_length, output_dim, testX_tensor, testY_tensor, scaler_y, PATH)

    # print(pred_inverse.shape, testY_inverse.shape)

    figure_plot(df, train_size, pred_inverse, testY_inverse)

    return pred_inverse