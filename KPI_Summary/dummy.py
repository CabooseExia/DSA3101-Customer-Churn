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
    model_perform = {'0': {'precision': 0.7807673500542655, 'recall': 0.6820407567927989, 'f1-score': 0.7280724680394369, 'support': 95984.0}, 
                     '1': {'precision': 0.3665760361968411, 'recall': 0.4900122073021862, 'f1-score': 0.4194004155535767, 'support': 36044.0}, 
                     'accuracy': 0.6296164449965159, 
                     'macro avg': {'precision': 0.5736716931255532, 'recall': 0.5860264820474925, 'f1-score': 0.5737364417965068, 'support': 132028.0}, 
                     'weighted avg': {'precision': 0.6676920045466685, 'recall': 0.6296164449965159, 'f1-score': 0.6438041654081743, 'support': 132028.0}}
    return jsonify(model_perform)

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port =5000, debug=True) #use this for Docker run instead
    app.run(debug=True) # only for local run 