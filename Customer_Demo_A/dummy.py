from flask import Flask, jsonify, request, redirect, url_for, render_template
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

# Global variables to store filters based on token IDs
global_filters = {}

# Global variable to store data from ML team
global_data = {}


# [COMMENT METHODOLOGY]
# [NOTE] - Requires additional attention before finalizing
# [DEBUG] - Used for debugging purposes (Recommended to remove before finalizing)
# [TODO] - Used for indicating tasks that need to be completed
# [URGENT] - Used for indicating urgent tasks that need to be completed


def generate_random_data(num_rows=1000):
    """Generate random data for the 21 filters including persona, happiness, and NPS.

    Default number of rows is 100. Stores the generated data in the global_data variable.
    """
    global global_data
    data = {}
    #print("[START] Generating random data...")
    for i in range(num_rows):  # Generating default 100 rows of dummy data
        entry = {
            "Age": random.randint(18, 70),
            "Gender": random.choice(["Male", "Female", "Other"]),
            "Marital Status": random.choice(
                ["Single", "Married", "Divorced", "Widowed"]
            ),
            "Number of Dependents": random.randint(0, 5),
            "Employment Status": random.choice(
                ["Employed", "Unemployed", "Self-employed", "Student", "Retired"]
            ),
            "Income Source": random.choice(
                ["Wages", "Salary", "Investments", "Rental Income", "Pension"]
            ),
            "Education Level": random.choice(
                [
                    "Less Than High School",
                    "High School Diploma",
                    "Some College",
                    "Bachelor's Degree",
                    "Graduate Degree",
                ]
            ),
            "Account Balance": round(random.uniform(100, 10000), 2),
            "Credit Utilization": round(random.uniform(0, 100), 2),
            "Number of Products": random.randint(1, 10),
            "Tenure": random.randint(0, 30),  # Assuming tenure in months
            "Credit Card": random.choice(["Yes", "No"]),
            "Active Member Status": random.choice(["Yes", "No"]),
            "Months Inactive": random.randint(0, 12),
            "Customer Satisfaction Surveys": random.choice(
                [
                    "Very Satisfied",
                    "Satisfied",
                    "Neutral",
                    "Unsatisfied",
                    "Very Unsatisfied",
                ]
            ),
            "Response to Previous Retention Efforts": random.choice(
                [
                    "Highly Responsive",
                    "Moderately Responsive",
                    "Slightly Responsive",
                    "Not Responsive",
                ]
            ),
            "Channels Used for Transactions": random.choice(
                ["Online", "Mobile", "In Store", "Phone", "Mail Order"]
            ),
            "Marketing Offers Accepted": random.choice(["Yes", "No", "Sometimes"]),
            "Persona": random.choice(
                [
                    "Price-Sensitive",
                    "Feature-Driven",
                    "Service-Dependent",
                    "PS+FD",
                    "PS+SD",
                    "FD+SD",
                    "PS+FD+SD",
                ]
            ),
            "Happiness": random.choice(
                [True, False]
            ),  # True for happy, False for not happy
            "NPS": random.randint(0, 10),
            "ChurnLikelihood": random.random()
        }
        #print(entry)
        data[i] = entry
    global_data = data
    #print(global_data)
    #print("[END] Random data generated successfully!")
    return


# [NOTE] Change "/" to "/form" if there is a main index page after integrating with the rest of the team
@app.route("/")
def form():
    return render_template("index.html")


@app.route("/api/results/customer-persona-analysis")
def get_results_CPA():
    """
    Retrieves filtered results based on the provided token ID and returns statistics about the data.

    Returns:
        A JSON response containing the following statistics:
        - Most Prominent Persona: The persona that appears most frequently in the filtered data.
        - Average NPS Score: The average Net Promoter Score (NPS) calculated from the filtered data.
        - Happiness Index: The percentage of entries in the filtered data that have a positive happiness value.
    """
    token_id = request.args.get("token_id")
    if not token_id or token_id not in global_filters:
        return jsonify({"error": "Invalid or missing token ID"}), 400

    filters = global_filters[token_id]
    global global_data
    all_data = global_data.values()

    # Apply filters
    filtered_data = []
    for entry in all_data:
        matches = True
        for filter_key, filter_values in filters.items():
            # Handling different types of filters based on the key
            if filter_key in [
                "Age",
                "Number of Dependents",
                "Account Balance",
                "Credit Utilization",
                "Number of Products",
                "Tenure",
                "Months Inactive",
                "NPS",
            ]:
                # Assuming numeric filters are specified as ranges ('min-max'),
                # or ('min-INF')
                entry_value = entry[filter_key]
                infiniteFilter = False
                infiniteValue = -1
                # [NOTE] set() is used for O(1) lookup
                possible_values = set()
                for value in filter_values:
                    split_value = value.split("-")
                    if split_value[1] == "INF":
                        infiniteFilter = True
                        infiniteValue = int(split_value[0])
                    else:
                        min_value = int(split_value[0])
                        max_value = int(split_value[1])
                        possible_values.update(range(min_value, max_value + 1))
                if infiniteFilter:
                    if (
                        int(entry_value) not in possible_values
                        and entry_value < infiniteValue
                    ):
                        matches = False
                        break
                else:
                    if int(entry_value) not in possible_values:
                        matches = False
                        break
            elif filter_key in ["Happiness"]:  # Boolean filter
                # [NOTE] Please make sure you check this Happiness filter before finalizing
                # Assuming filter_values like ['True'] for true, ['False'] for false
                entry_value = entry[filter_key]
                filter_value = filter_values[0].lower() in ["true", "yes", "1"]
                if entry_value != filter_value:
                    matches = False
            else:  # For string-based filters, assuming exact matches
                entry_value = entry[filter_key].lower()
                if not any(entry_value == f_val.lower() for f_val in filter_values):
                    matches = False
                    break

        if matches:
            filtered_data.append(entry)

    # [DEBUG] Sleep to simulate processing time
    # time.sleep(3)

    # [DEBUG] Print
    #print(filtered_data)
    if not filtered_data:
        # [NOTE] NOT IMPLEMENTED ATM - Removes filters from global_filters after failing to get results
        # global_filters.pop(token_id, None)
        return jsonify({"error": "No data matches the selected filters"}), 404

    # Calculate Most Prominent Persona
    persona_counts = {}
    for entry in filtered_data:
        persona = entry["Persona"]
        if persona in persona_counts:
            persona_counts[persona] += 1
        else:
            persona_counts[persona] = 1
    most_prominent_persona = max(persona_counts, key=persona_counts.get)

    # Calculate Average NPS Score
    total_nps = sum(entry["NPS"] for entry in filtered_data)
    average_nps_score = total_nps / len(filtered_data)

    # Calculate Happiness Index
    happiness_count = sum(entry["Happiness"] for entry in filtered_data)
    happiness_index = happiness_count / len(filtered_data)

    # [NOTE] Filtered Data is returned for plotly.js visualization [The bottom 4 graphs on the result page]
    results = {
        "Most Prominent Persona": most_prominent_persona,
        "Average NPS Score": round(average_nps_score, 2),
        "Happiness Index": round(happiness_index, 2),
        "Filtered Data": filtered_data,
    }

    # [NOTE] NOT IMPLEMENTED ATM - Removes filters from global_filters after getting results
    # global_filters.pop(token_id, None)
    #print(f'results {results}')
    return jsonify(results)
    


@app.route("/api/handle-filters/customer-persona-analysis", methods=["POST"])
def handle_filters_CPA():
    """
    Handle the selected filters from the form submission.

    This function receives a POST request with filter selections from a form submission.
    It iterates through each filter name and adds the selected values to a dictionary.
    The dictionary is then stored in a global variable using a token ID as the key.
    Finally, it redirects to a result page with the token ID.

    Returns:
        A redirect response to the result page.
    """
    filters = {}

    # List of filter names
    filter_names = [
        "Age",
        "Gender",
        "Marital Status",
        "Number of Dependents",
        "Employment Status",
        "Income Source",
        "Education Level",
        "Account Balance",
        "Credit Utilization",
        "Number of Products",
        "Tenure",
        "Credit Card",
        "Active Member Status",
        "Months Inactive",
        "Customer Satisfaction Surveys",
        "Response to Previous Retention Efforts",
        "Channels Used for Transactions",
        "Marketing Offers Accepted",
        "Persona",
        "Happiness",
        "NPS",
    ]
    # Iterate through each filter name and add to the filters dict if not empty
    for filter_name in filter_names:
        selected_values = request.form.getlist(filter_name)
        if selected_values:  # Checks if the list is not empty
            filters[filter_name] = selected_values

    # Store the filters in the global variable
    token_id = request.form.get("token-id")
    global global_filters
    global_filters[token_id] = filters

    # [DEBUG] Print all Token IDs and their respective filters
    #print(global_filters)
    return redirect(url_for("result_redirect_CPA", token_id=token_id))


@app.route("/result/customer-persona-analysis/<token_id>")
def result_redirect_CPA(token_id):
    return render_template("page2.html", token_id=token_id)


if __name__ == "__main__":
    # [NOTE] Change to "read" data from file once backend data is available
    generate_random_data()
    app.run(debug=True)
