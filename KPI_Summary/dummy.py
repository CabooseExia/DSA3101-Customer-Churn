from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/data')
def get_data():
    # Your code to fetch and process data from the desired source
    # For simplicity, let's assume dummy data
    data = [{'date': '2024-01-01', 'value': 10},
            {'date': '2024-01-02', 'value': 20},
            {'date': '2024-01-03', 'value': 15}]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)