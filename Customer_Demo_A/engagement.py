from flask import Flask, jsonify, request, redirect, url_for, render_template
from flask_cors import CORS
import numpy as np
from datetime import datetime
import pandas as pd
import json

app = Flask(__name__)
CORS(app)

# Global variables to store filters based on token IDs
global_filters = {}

predicted_data = None
report_dict = None
jsonLastUpdated = None


def load_model():
    global report_dict, jsonLastUpdated
    with open('./Report_Dict.json', 'r') as file:
        report_dict = json.load(file)
    LastUpdated = {'LastUpdated' : f"Last Updated at {datetime.now().replace(microsecond=0)}"}
    jsonLastUpdated = json.dumps(LastUpdated)
load_model()
    

def load_data():
    global predicted_data
    try:
        predicted_data = pd.read_csv("./Predicted_Data.csv")
        print("Data loaded successfully.")
        #print(global_data)
    except Exception as e:
        print(f"Failed to load data: {e}")
load_data()


selected_columns = [
    "Gender",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "EstimatedSalary",
    "LoanAmt",
    "TransactionFreq",
    "TransactionAmt",
    "MonthsInactive",
    "Education",
    "EmploymentStatus",
    "MaritalStatus",
    "HousingStatus",
    "Dependents",
    "MarketingOffersAcceptance",
    "PaymentMethod",
    "CustomerSatisfaction",
    "IncomeSource",
    #"CreditUtilization",
    "Retention",
    "NPS",
    "Happiness",
    "CombinedPersonas",
    "PrevLifecycle_Churned",
    "CurrLifecycle_Churned",
    "average_Dormant_proba",
    "average_Churned_proba",
]
selected_data = [entry for entry in predicted_data.to_dict(orient='records') if entry["PrevLifecycle_Churned"] != 1 and entry["CurrLifecycle_Churned"] != 1]
customerpersona_data = [dict(row) for row in pd.DataFrame(selected_data).loc[:, selected_columns].to_dict(orient='records')]


@app.route("/")
def form():
    return render_template("page1EA.html")


@app.route('/api/model')
def get_model():
    return report_dict

@app.route('/api/data')
def get_data():
    return jsonify(predicted_data.to_dict(orient='records'))


@app.route("/api/results/customer-persona-analysis")
def get_results_CPA():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in global_filters:
        return jsonify({"error": "Invalid or missing token ID"}), 400

    filters = global_filters[token_id]
    all_data = customerpersona_data

    filtered_data = []
    for entry in all_data:
        matches = True
        for filter_key, filter_values in filters.items():
            if filter_key in [
                "Age", "Tenure", "Balance", "NumOfProducts", "EstimatedSalary",
                "LoanAmt", "TransactionFreq", "TransactionAmt",
                "MonthsInactive", "Dependents", "MarketingOffersAcceptance",
                "CustomerSatisfaction", "Retention"
            ]:
                entry_value = entry.get(filter_key, None)
                if entry_value is None:
                    matches = False
                    break

                entry_value = float(entry_value)  # Ensure float for comparison
                matched = False

                for value in filter_values:
                    min_value, max_value = map(lambda v: float('inf') if v == 'INF' else float(v), value.split('-'))
                    if min_value <= entry_value <= max_value:
                        matched = True
                        break

                if not matched:
                    matches = False
                    break
            else:  # For string-based filters, assuming exact matches
                entry_value = entry.get(filter_key, "").lower()
                if not any(entry_value == f_val.lower() for f_val in filter_values):
                    matches = False
                    break

        if matches:
            filtered_data.append(entry)

    if not filtered_data:
        return jsonify({"error": "No data matches the selected filters"}), 404

    # Calculate Most Prominent Persona, Average NPS Score, Happiness Index
    persona_counts = {}
    total_nps = 0
    happiness_count = 0
    for entry in filtered_data:
        persona = entry["CombinedPersonas"]
        persona_counts[persona] = persona_counts.get(persona, 0) + 1
        total_nps += entry["NPS"]
        happiness_count += entry["Happiness"]

    most_prominent_persona = max(persona_counts, key=persona_counts.get)
    average_nps_score = total_nps / len(filtered_data)
    happiness_index = happiness_count / len(filtered_data)

    results = {
        "Most Prominent Persona": most_prominent_persona,
        "Average NPS Score": round(average_nps_score, 2),
        "Happiness Index": round(happiness_index, 2),
        "Filtered Data": filtered_data,
    }

    return jsonify(results)
    


@app.route("/api/handle-filters/customer-persona-analysis", methods=["POST"])
def handle_filters_CPA():
    filters = {}

    # List of filter names
    filter_names = [
    "Gender",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "EstimatedSalary",
    "LoanAmt",
    "TransactionFreq",
    "TransactionAmt",
    "MonthsInactive",
    "Education",
    "EmploymentStatus",
    "MaritalStatus",
    "HousingStatus",
    "Dependents",
    "MarketingOffersAcceptance",
    "PaymentMethod",
    "CustomerSatisfaction",
    "IncomeSource",
    #"CreditUtilization",
    "Retention",
    ]
    # Iterate through each filter name and add to the filters dict if not empty
    for filter_name in filter_names:
        selected_values = request.form.getlist(filter_name)
        if selected_values: 
            filters[filter_name] = selected_values

    token_id = request.form.get("token-id")
    global global_filters
    global_filters[token_id] = filters

    #print(global_filters)
    return redirect(url_for("result_redirect_CPA", token_id=token_id))


@app.route("/result/customer-persona-analysis/<token_id>")
def result_redirect_CPA(token_id):
    return render_template("page2EA.html", token_id=token_id)


if __name__ == "__main__":
    customerpersona_data
    app.run(debug=True)


