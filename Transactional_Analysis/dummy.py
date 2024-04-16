from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/data')
def get_data():
    # Fetch query parameters for persona filtering
    personas = request.args.getlist('persona')  # This will get personas as a list

    all_data = [
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Savings Savant', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 25},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Savings Savant', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 64},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Savings Savant', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 54},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Savings Savant', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 38},

        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Digital Dynamos', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 92},
        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Digital Dynamos', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 21},
        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Digital Dynamos', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 63},
        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Digital Dynamos', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 43},

        {'FirstPersona': 'Trustee Tribe', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Trustee Tribe', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 59},
        {'FirstPersona': 'Trustee Tribe', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Trustee Tribe', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 7},
        {'FirstPersona': 'Trustee Tribe', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Trustee Tribe', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 23},
        {'FirstPersona': 'Trustee Tribe', 'SecondPersona':'', 'ThirdPersona':'', 'CombinedPersonas': 'Trustee Tribe', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 95},

        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'', 'CombinedPersonas': 'Frugal Innovators', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 22},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'', 'CombinedPersonas': 'Frugal Innovators', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 66},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'', 'CombinedPersonas': 'Frugal Innovators', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 54},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'', 'CombinedPersonas': 'Frugal Innovators', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 41},

        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Cost-Conscious Careseekers', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 32},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Cost-Conscious Careseekers', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 73},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Cost-Conscious Careseekers', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 54},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Cost-Conscious Careseekers', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 69},

        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Premium Patrons', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 42},
        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Premium Patrons', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 37},
        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Premium Patrons', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 5},
        {'FirstPersona': 'Digital Dynamos', 'SecondPersona':'Trustee Tribe', 'ThirdPersona':'', 'CombinedPersonas': 'Premium Patrons', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 89},

        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'Trustee Tribe', 'CombinedPersonas': 'Triple Advantage Allies', 'CurrLifecycle': 'Active', 'PredictedLifecycle': 'Dormant', 'Average_Churned_Proba': 38},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'Trustee Tribe', 'CombinedPersonas': 'Triple Advantage Allies', 'CurrLifecycle': 'Dormant', 'PredictedLifecycle': 'Churned', 'Average_Churned_Proba': 45},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'Trustee Tribe', 'CombinedPersonas': 'Triple Advantage Allies', 'CurrLifecycle': 'Churned', 'PredictedLifecycle': 'Reactivated', 'Average_Churned_Proba': 58},
        {'FirstPersona': 'Savings Savant', 'SecondPersona':'Digital Dynamos', 'ThirdPersona':'Trustee Tribe', 'CombinedPersonas': 'Triple Advantage Allies', 'CurrLifecycle': 'Reactivated', 'PredictedLifecycle': 'Active', 'Average_Churned_Proba': 62}
    ]

    # Filter data based on personas, if any
    if personas:
        filtered_data = [data for data in all_data if data['CombinedPersonas'] in personas]
        return jsonify(filtered_data)
    else:
        return jsonify(all_data)

if __name__ == '__main__':
    app.run(debug=True)
