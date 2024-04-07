import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS

def test():
    date = pd.date_range('1/1/2018', freq = 'D', periods = 31)
    x = np.arange(31)
    y = np.arange(31, 62)
    df = pd.DataFrame(date, columns=['Date'])
    df['x'] = x
    df['y'] = y
    return df.to_dict()

app = Flask(name)
CORS(app)

@app.route('/api/data')
def get_data():
    # Your code to fetch and process data from the desired source
    # For simplicity, let's assume dummy data
    data = test()
    return jsonify(data)

if name == 'main':
    app.run(debug=True)