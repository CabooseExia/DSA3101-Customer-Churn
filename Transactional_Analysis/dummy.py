from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import plotly.express as px
import plotly.io as pio

app = Flask(__name__)
CORS(app)

# Load data from a CSV file
df = pd.read_csv('Predicted_Data.csv')

@app.route('/api/data', methods=['GET'])
def get_data():
    personas = request.args.getlist('persona')
    # Filter the DataFrame to include only the selected personas, if any
    filtered_df = df[df['CombinedPersonas'].isin(personas)] if personas else df

    # Data for the first graph: Distribution of Lifecycles by Persona
    lifecycle_counts = filtered_df.groupby(['CombinedPersonas', 'CurrLifecycle']).size().reset_index(name='Count')
    fig1 = px.bar(lifecycle_counts, 
                  x="CurrLifecycle", 
                  y="Count", 
                  color="CombinedPersonas", 
                  barmode="group",
                  labels={"CurrLifecycle": "Lifecycle", "Count": "Number of Users"},
                  title="Distribution of Lifecycles by Persona")
    fig1.update_layout(
        legend_title_text='Legend',
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.3,
            xanchor="center",
            x=0.5
        )
    )

    # Data for the second graph: Churn Probability by Lifecycle and Persona
    churn_lifecycles = ['Active', 'Dormant', 'Reactivated']
    churn_df = filtered_df[filtered_df['CurrLifecycle'].isin(churn_lifecycles)]

    # Calculate the average churn probability per lifecycle and persona
    average_churn = churn_df.groupby(['CombinedPersonas', 'CurrLifecycle']).agg({'average_Churned_proba': 'mean'}).reset_index()
    average_churn['average_Churned_proba'] *= 100  # Converts the proportion to a percentage
    

    fig2 = px.bar(average_churn, 
                  x="average_Churned_proba", 
                  y="CurrLifecycle", 
                  color="CombinedPersonas", 
                  orientation='h',
                  barmode='group',
                  labels={"CurrLifecycle": "Lifecycle", "average_Churned_proba": "Churn Probability (%)"},
                  title="Churn Probability by Lifecycle and Persona")
    fig2.update_layout(
        xaxis=dict(
            range=[0, 100]  # This sets the x-axis to extend from 0 to 100
        ),
        legend_title_text='Legend',
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.3,
            xanchor="center",
            x=0.5
        )
    )


    # Generate lifecycle transition heatmap
    transition_matrix = pd.crosstab(index=filtered_df['CurrLifecycle'], columns=filtered_df['PredictedLifecycle'])
    fig3 = px.imshow(transition_matrix,
                     labels=dict(x="Predicted Lifecycle", y="Current Lifecycle", color="Number of Users"),
                     x=transition_matrix.columns,
                     y=transition_matrix.index,
                     title="Lifecycle Transition Heatmap",
                     color_continuous_scale='RdYlGn')  # Using predefined color scale RdYlGn
    fig3.update_layout(legend_title_text='Number of Users', xaxis_nticks=36)


    # Convert both figures to JSON strings using Plotly's to_json function
    graph_json1 = pio.to_json(fig1)
    graph_json2 = pio.to_json(fig2)
    graph_json3 = pio.to_json(fig3)

    return jsonify(graph1=graph_json1, graph2=graph_json2, graph3=graph_json3)

if __name__ == '__main__':
    app.run(debug=True)