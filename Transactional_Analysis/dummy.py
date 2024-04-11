from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/data')
def get_data():
    # Fetch query parameters for persona filtering
    personas = request.args.getlist('persona')  # This will get personas as a list

    all_data = [
        {'Persona': 'Price-Sensitive', 'Lifecycle': 'Active', 'Churn Probability': 25},
        {'Persona': 'Price-Sensitive', 'Lifecycle': 'Dormant', 'Churn Probability': 64},
        {'Persona': 'Price-Sensitive', 'Lifecycle': 'Churn', 'Churn Probability': 54},
        {'Persona': 'Price-Sensitive', 'Lifecycle': 'Reactivated', 'Churn Probability': 38},
        {'Persona': 'Feature-Driven', 'Lifecycle': 'Active', 'Churn Probability': 92},
        {'Persona': 'Feature-Driven', 'Lifecycle': 'Dormant', 'Churn Probability': 32},
        {'Persona': 'Feature-Driven', 'Lifecycle': 'Churn', 'Churn Probability': 73},
        {'Persona': 'Feature-Driven', 'Lifecycle': 'Reactivated', 'Churn Probability': 32},
        {'Persona': 'Service-Dependent', 'Lifecycle': 'Active', 'Churn Probability': 85},
        {'Persona': 'Service-Dependent', 'Lifecycle': 'Dormant', 'Churn Probability': 8},
        {'Persona': 'Service-Dependent', 'Lifecycle': 'Churn', 'Churn Probability': 2},
        {'Persona': 'Service-Dependent', 'Lifecycle': 'Reactivated', 'Churn Probability': 42},
    ]

    # Filter data based on personas, if any
    if personas:
        filtered_data = [data for data in all_data if data['Persona'] in personas]
        return jsonify(filtered_data)
    else:
        return jsonify(all_data)

if __name__ == '__main__':
    app.run(debug=True)
