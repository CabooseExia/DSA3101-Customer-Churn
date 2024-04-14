from flask import Flask, request, redirect, url_for, render_template
from flask_cors import CORS
from flask import jsonify
import pandas as pd

# Filter out customers who have churned
df = pd.read_parquet("./Customer_Demo_B/Predicted_Data.parquet")
global_data = df.to_dict(orient='records') # Store data from backend team

app = Flask(__name__)
CORS(app)

global_filters = {}  # Store filters based on token IDs

@app.route("/")
def form():
    return render_template("4B_1.html")

# To do Unit-Testing
@app.route("/api/results/Demographics-Hub")
def get_results():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in global_filters:
        return jsonify({"error": "Invalid or missing token ID"}), 400
    filters = global_filters[token_id]
    global global_data
    all_data = global_data
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
def handle_filters():
    filters = {}
    filter_names = ["Customer Persona Type", "Customer Happiness", "Customer Influence"]
    for filter_name in filter_names:
        selected_values = request.form.getlist(filter_name)
        if selected_values:
            filters[filter_name] = selected_values
    token_id = request.form.get("token-id")
    global global_filters
    global_filters[token_id] = filters
    return redirect(url_for("result_redirect", token_id=token_id))

@app.route("/result/Demographics-Hub/<token_id>")
def result_redirect(token_id):
    return render_template("4B_2.html", token_id=token_id)

if __name__ == "__main__":
    # [NOTE] Change to "read" data from file once Data frame is available
    app.run(debug=True)
