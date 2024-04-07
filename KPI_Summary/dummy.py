from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/data')
def get_data():
    # Your code to fetch and process data from the desired source
    # For simplicity, let's assume dummy data
    data = [{'date': '2024-01-01', 'account': 25, 'churn': 1,'persona': 'Price-Sensitive','churn_predict': None},
            {'date': '2024-01-02', 'account':50, 'churn': 0,'persona': 'Support-Dependent', 'churn_predict': 1},
            {'date': '2024-01-03', 'account':60, 'churn': 0,'persona': 'Feature-Driven', 'churn_predict': 0}]
    return jsonify(data)

@app.route('/api/model')
def get_model():
    # Your code to fetch and process data from the desired source
    # For simplicity, let's assume dummy data
    model_perform = [{'accuracy':{'positive': '61%', 'negative':'72%','average':'65%'}
             ,'precision':{'positive': '61%', 'negative':'72%','average':'65%'}
             ,'recall':{'positive': '61%', 'negative':'72%','average':'65%'}
             ,'f1':{'positive': '61%', 'negative':'72%','average':'65%'}}]
    return jsonify(model_perform)
if __name__ == '__main__':
    app.run(debug=True)