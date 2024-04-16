from flask import Flask, jsonify, request, redirect, url_for, render_template
from flask_cors import CORS
import numpy as np
from datetime import datetime
import pandas as pd
import json
from dateutil.relativedelta import relativedelta
import plotly.express as px
import plotly.io as pio
import statistics
import collections

# Global variables
past6months = False
past1Year = False
customRange = False
start = None
end = None
LastUpdated = f"Last Updated at {datetime.now().replace(microsecond=0)}"
global_filters = {}

# Load data
def load_data():
    global predicted_data
    try:
        predicted_data = pd.read_csv("./Predicted_Data.csv")
        print("Data loaded successfully.")
    except Exception as e:
        print(f"Failed to load data: {e}")

load_data()
dates = [datetime.strptime(x, "%Y-%m-%d") for x in predicted_data['ChurnDate'] if not pd.isnull(x)]
minStartDate = min(dates)
maxEndDate = max(dates)

# Selected columns for Demographics Hub and Engagement Analytics tabs
selected_columns = [
    "HousingStatus",
    "ServiceSupportFrequency",
    "Education",
    "TransactionAmt",
    "CombinedPersonas",
    "FeatureSupportFrequency",
    "IncomeSource",
    "Tenure",
    "CustomerSatisfaction",
    "Happiness",
    "MaritalStatus",
    "TransactionFreq",
    "NPS",
    "EmploymentStatus",
    "Dependents",
    "PaymentMethod",
    "PrevLifecycle_Churned",
    "CurrLifecycle_Churned",
    "Age",
    "FeatureSatisfaction",
    "MarketingOffersAcceptance",
    "SupportSatisfaction",
    "ChangeInBehaviourMkt",
    "ChurnDate",
    "Retention",
    "NumOfProducts",
    "ChangeInBehaviourCust",
    "average_Dormant_proba",
    "MonthsInactive",
    "Gender",
    "Balance",
    "LoanAmt",
    "SocialInfluencer",
    "EstimatedSalary",
    "average_Churned_proba"
]

EA_selected_data = [entry for entry in predicted_data.to_dict(orient='records') if entry["PrevLifecycle_Churned"] != 1 and entry["CurrLifecycle_Churned"] != 1]
EA_data = [dict(row) for row in pd.DataFrame(EA_selected_data).loc[:, selected_columns].to_dict(orient='records')]

DH_selected_data = predicted_data[selected_columns]
DH_data = DH_selected_data[DH_selected_data['ChurnDate'].isna()]
DH_data.drop('ChurnDate', axis=1, inplace=True)
DH_data = DH_data.to_dict(orient='records')

# Filter data based on time range
def filter(data):
    if not past1Year and not past6months and not customRange:
        print("no filter applied")
        return data
    elif past1Year:
        lastYear = maxEndDate - relativedelta(years=1)
        selected = [True if pd.isnull(rows) else datetime.strptime(rows,"%Y-%m-%d") >= lastYear and datetime.strptime(rows,"%Y-%m-%d") <= maxEndDate for rows in data["ChurnDate"]]
        newDf = data.loc[selected]
        print("one year applied")
        return newDf
    elif past6months:
        lastSixMonths = maxEndDate - relativedelta(months=6)
        selected = [True if pd.isnull(rows) else datetime.strptime(rows,"%Y-%m-%d") >= lastSixMonths and datetime.strptime(rows,"%Y-%m-%d") <= maxEndDate for rows in data["ChurnDate"]]
        newDf = data.loc[selected]
        print("six months applied")
        return newDf
    else:
        selected = [True if pd.isnull(rows) else datetime.strptime(rows,"%Y-%m-%d") >= start and datetime.strptime(rows,"%Y-%m-%d") <= end for rows in data["ChurnDate"]]
        newDf = data.loc[selected]
        print(f"custom range applied from {start} to {end}")
        return newDf

# Update data and compute statistics
def updateData(data):
    filtered = filter(data)
    churn_dates = [np.datetime64(x) for x in filtered['ChurnDate'] if not pd.isnull(x)]
    hist_churn = [1 if not pd.isnull(x) else 0 for x in filtered['ChurnDate']]
    account = [filtered["Balance"].iloc[i] for i in range(filtered["Balance"].shape[0]) if hist_churn[i] == 1]
    proj_churn = [filtered["PredLifecycle_Churned"].iloc[i] for i in range(filtered["PredLifecycle_Churned"].shape[0]) if hist_churn[i] == 0]
    persona = filtered["CombinedPersonas"].tolist()

    global hist_churn_percentage, proj_churn_percentage, persona_segment_top_3, persona_segment_full, hist_churn_graph, loss_impact_graph

    hist_churn_percentage = str(round(statistics.fmean(hist_churn)*100,1)) + "%" if hist_churn else str(round(0/1,1))+"%"
    proj_churn_percentage = str(round(statistics.fmean(hist_churn)*100,1)) + "%" if proj_churn else str(round(0/1,1))+"%"

    persona_segment_full = []
    personaFreq = collections.Counter(persona)
    for key,value in personaFreq.items():
        pctg = round(value/personaFreq.total(),1)
        persona_segment_full.append({"persona":key, "pctg":pctg})
    persona_segment_full.sort(key= lambda x: x['pctg'],reverse=True)
    for each in persona_segment_full:
        each['pctg'] = str(each['pctg']*100) +"%"
    persona_segment_top_3 = persona_segment_full[:3]

    final_dates = []
    churn_freq = []
    churnDatesFreq = collections.Counter(churn_dates)
    for key, value in churnDatesFreq.items():
        final_dates.append(key)
        churn_freq.append(value)
    index = np.argsort(final_dates)

    acc_dict = {}
    new_account = [-1*i for i in account]
    for i,record in enumerate(churn_dates):
        if record in acc_dict:
            acc_dict[record] += new_account[i]
        else:
            acc_dict[record] = new_account[i]
    index2nd = np.argsort(list(acc_dict.keys()))

    churn_df = pd.DataFrame(data={'Date':np.array(final_dates)[index],'Churn Occurrences':np.array(churn_freq)[index]})
    account_df = pd.DataFrame(data={'Date':np.array(list(acc_dict.keys()))[index2nd],'Total Loss':np.array(list(acc_dict.values()))[index2nd]})
    fig = px.line(churn_df, x="Date", y="Churn Occurrences", title="Historical Churn Occurrences", color_discrete_sequence=["#9f0606"])
    fig2 = px.line(account_df, x="Date",y="Total Loss", title="Raw Loss Impact", color_discrete_sequence=["#9f0606"])

    loss_impact_graph = pio.to_json(fig2)
    hist_churn_graph = pio.to_json(fig)

# Initialize Flask app
app = Flask(__name__, template_folder='./Customer_Demo_B/templates/', static_folder='./Customer_Demo_B/static/')
CORS(app)

@app.route("/")
def form_KPI():
    return render_template("KPI.html")

# API endpoint to fetch KPI summary data
@app.route('/api/data/KPI-Summary')
def get_numerical_data():
    global predicted_data, hist_churn_percentage, proj_churn_percentage, persona_segment_full, persona_segment_top_3, loss_impact_graph, hist_churn_graph, LastUpdated
    updateData(predicted_data)
    data = {
        "hist-churn": hist_churn_percentage,
        "proj-churn": proj_churn_percentage,
        "persona-segment-top-3": persona_segment_top_3,
        "persona-segment-full": persona_segment_full,
        "loss-impact-graph": loss_impact_graph,
        "hist-churn-graph": hist_churn_graph,
        "timestamp": LastUpdated
    }
    return jsonify(data)

# API endpoint to handle time filters
@app.route('/api/time-filter/KPI-Summary', methods=['POST'])
def handle_time_filter():
    data = request.json
    global past6months, past1Year, customRange, predicted_data

    filter_type = data.get('filter')
    if filter_type == 'past6months':
        past6months = True
        past1Year = False
        customRange = False
        get_numerical_data()
        return jsonify("6 months applied")
    elif filter_type == 'past1year':
        past6months = False
        past1Year = True
        customRange = False
        get_numerical_data()
        return jsonify("1 Year applied")
    elif filter_type == 'customrange':
        global start, end
        start = datetime.strptime(data.get('start'),"%Y-%m-%d")
        end = datetime.strptime(data.get('end'),"%Y-%m-%d")
        past6months = False
        past1Year = False
        customRange = True
        get_numerical_data()
        return jsonify(f"Custom range from {start} to {end} applied")
    else:
        return jsonify('Invalid filter criteria')

# API endpoint to fetch model data
@app.route('/api/model')
def get_model():
    with open("Report_Dict.json","r") as perform:
        model_perform = json.load(perform)
    return jsonify(model_perform)

@app.route("/Engagement-Analytics")
def form_EA():
    return render_template("EA_1.html")

@app.route("/api/results/customer-persona-analysis")
def get_results_CPA():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in global_filters:
        return jsonify({"error": "Invalid or missing token ID"}), 400

    filters = global_filters[token_id]
    all_data = EA_data

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

    return redirect(url_for("result_redirect_CPA", token_id=token_id))


@app.route("/result/customer-persona-analysis/<token_id>")
def result_redirect_CPA(token_id):
    return render_template("EA_2.html", token_id=token_id)

@app.route("/Demographics-Hub")
def form_DH():
    return render_template("DH_1.html")

@app.route("/api/results/Demographics-Hub")
def get_results_DH():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in global_filters:
        return jsonify({"error": "Invalid or missing token ID"}), 400
    filters = global_filters[token_id]
    all_data = DH_data
    filtered_data = []
    for entry in all_data:
        matches = True
        for filter_key, filter_values in filters.items():
            if filter_key == "Customer Persona Type":
                keyword = "CombinedPersonas"
            elif filter_key == "Customer Happiness":
                keyword = "Happiness"
                mapping_1 = {"Happy": 1, "Unhappy": 0}
                filter_values = [mapping_1[value] for value in filter_values]
            else:
                keyword = "SocialInfluencer"
                mapping_2 = {"Promoter": 1, "Non-promoter": 0}
                filter_values = [mapping_2[value] for value in filter_values]
            entry_value = entry[keyword]
            if entry_value not in filter_values:
                matches = False
                break
        if matches:
            filtered_data.append(entry)
    if not filtered_data:
        return jsonify({"error": "No data matches the selected filters"}), 404
    results = {
        "Filtered Data": filtered_data
    }
    return jsonify(results)

@app.route("/api/handle-filters/Demographics-Hub", methods=["POST"])
def handle_filters_DH():
    filters = {}
    filter_names = ["Customer Persona Type", "Customer Happiness", "Customer Influence"]
    for filter_name in filter_names:
        selected_values = request.form.getlist(filter_name)
        if selected_values:
            filters[filter_name] = selected_values
    token_id = request.form.get("token-id")
    global global_filters
    global_filters[token_id] = filters
    return redirect(url_for("result_redirect_DH", token_id=token_id))

@app.route("/result/Demographics-Hub/<token_id>")
def result_redirect_DH(token_id):
    return render_template("DH_2.html", token_id=token_id)

if __name__ == '__main__':
    app.run(debug=True)
