import sys, json, sklearn
import pandas as pd
import numpy as np
import datetime
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

class DataAnalysis:
    def __init__(self, data: dict, alpha: float = 50.0):
        '''
        Инициализирует и преобразует базовые данные для обучения модели
        '''
        self.data = data
        self.alpha = alpha
        self.df = pd.DataFrame(list(data.items()), columns=['week_num', 'sales'])
        self.model = None
        self.scaler = StandardScaler()

    def _prepare_features(self, df: pd.DataFrame, target_col='sales'):
        '''
        Подготавливает признаки, необходимые для обучения Ridge-регрессии
        '''
        df = df.copy()
        df['lag_1'] = df[target_col].shift(1)
        df['rolling_mean'] = df[target_col].shift(1).rolling(3).mean()
        return df.dropna()

    def train(self):
        '''
        Обучает модель на "удобных" данных
        '''
        df_feat = self._prepare_features(self.df)
        
        if len(df_feat) < 1:
            raise ValueError(f"Недостаточно данных")
        
        X = df_feat[['lag_1', 'rolling_mean']]
        y = df_feat['sales']
        
        X_scaled = self.scaler.fit_transform(X)
        self.model = Ridge(alpha=self.alpha)
        self.model.fit(X_scaled, y)
        return self

    def get_prediction(self):
        '''
        Анализирует объем данных и принимает решение о том, использовать 
        ли модель, или использовать метод среднего
        '''
        if (self.data):
            next_week = max(self.data.keys()) + 1
            response = dict()
            if(self.data.__len__() >= 5):
                if self.model is None:
                    self.train()
                
                sales_history = self.df['sales'].values.tolist()
                predictions = []
                
                lag_1 = sales_history[-1]
                window = sales_history[-3:] if len(sales_history) >= 3 else sales_history
                rolling_mean = float(np.mean(window))
                
                features = pd.DataFrame({'lag_1': [lag_1], 'rolling_mean': [rolling_mean]})
                features_scaled = self.scaler.transform(features)
                
                pred = float(self.model.predict(features_scaled)[0])
                predictions.append(pred)
                sales_history.append(pred)
                
                max_val = self.df['sales'].max()
                predictions = [max(0, min(p, max_val * 1.5)) for p in predictions]
                response = {next_week: int(float(f"{predictions[0]:.1f}"))} 
            else:
                amounts = [self.data[el] for el in self.data]
                sum_amounts = sum(amounts)/len(amounts)
                response = {next_week: round(sum_amounts)}
            return response
        else:
            raise BaseException("Данных нет")

def getDatetimeFormatFromStrDate(strDate: str):
    splitted_start_day = strDate.split('-')
    year = int(splitted_start_day[0])
    month = int(splitted_start_day[1])
    day = int(splitted_start_day[2])

    datetime_date = datetime.datetime(
        year=year,
        month=month,
        day=day
    )

    return datetime_date

def getWeekdayFromStrDate(strDate: str) -> int:
    return getDatetimeFormatFromStrDate(strDate).weekday()

def getWeekRangeForDate(strDate: str) -> list:
    datetimeDate = getDatetimeFormatFromStrDate(strDate)
    daysAfterStart = datetime.timedelta(days=getWeekdayFromStrDate(strDate))
    daysInWeek = datetime.timedelta(days=6)
    startOfWeek = datetimeDate-daysAfterStart
    endOfWeek = startOfWeek+daysInWeek
    return([startOfWeek.date().__str__(), endOfWeek.date().__str__()])

def getWeeklyPrediction(data: dict, dispersion=[0.15, 0.1, 0.15, 0.1, 0.2, 0.1, 0.2]): 
    '''Принимает массив пар [Дата-Число], преобразует его к типу, 
    принимаемому классом-аналитиком и возвращает прогноз, распространенный на неделю'''

    if (data[0]):
        dict_keys = list(data[0].keys())
        day_key = dict_keys[0]
        amount_key = dict_keys[1]
        
        week_number = 1
        amount = 0 + data[0][amount_key]

        min_day = min([el[day_key] for el in data])

        structured_data = {}

        dayRange = getWeekRangeForDate(min_day)

        for el in data:
            if(dayRange[0] <= el[day_key] <= dayRange[1]):
                if(el[day_key] != min_day):
                    amount += el[amount_key]
            else:
                dayRange = getWeekRangeForDate(el[day_key])
                structured_data[week_number] = amount
                week_number += 1
                amount = el[amount_key]
                if(el[day_key] == data[-1][day_key]):
                    structured_data[week_number] = amount

        try:
            analyser = DataAnalysis(structured_data, alpha=50.0)
            predictSell = analyser.get_prediction()

            last_day = data[-1][day_key]
            last_amount = data[-1][amount_key]
            predictionStart = getDatetimeFormatFromStrDate(getWeekRangeForDate(last_day)[1]) + datetime.timedelta(days=1)
            predictionOnDays = [round(predictSell[list(predictSell.keys())[0]] * c_o) for c_o in dispersion]

            response = list()

            for i in range(7):
                predictionDay = predictionStart + datetime.timedelta(days=i)
                response.append({'day': predictionDay.date().__str__(), 'predict_sells_amount': predictionOnDays[i]})

            return response

        except BaseException as e:
            print("Ошибка:", e.__str__())
    else:
        raise BaseException("Данных нет")


if __name__ == "__main__":
    collected_data = []
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            record = json.loads(line)
            collected_data.append(record)
        except json.JSONDecodeError as e:
            sys.stderr.write(f"JSON Error: {e}\n")
            continue

    if collected_data:
        result = getWeeklyPrediction(collected_data)
        print(json.dumps(result), flush=True)
    else:
        print(json.dumps({"error": "Данные не получены"}), flush=True)