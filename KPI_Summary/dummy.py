from flask import Flask, jsonify, request
from flask_cors import CORS 
import json
from datetime import datetime
import pandas as pd
import numpy as np
from dateutil.relativedelta import relativedelta
import plotly.express as px
import plotly.io as pio
import statistics
import collections

past6months = False
past1Year= False
customRange = False
start = None 
end = None  
df = None
LastUpdated = f"Last Updated at {datetime.now().replace(microsecond=0)}"
df = pd.read_csv('Predicted_Data.csv')

dates = [datetime.strptime(x,"%Y-%m-%d") for x in df['ChurnDate'] if not pd.isnull(x) ]
minStartDate = min(dates)
maxEndDate = max(dates)

def filter(data):
    if not past1Year and not past6months and not customRange:
        print("no filter applied")
        return data
    elif past1Year:
        lastYear = maxEndDate -relativedelta(years=1)
        selected=[]
        for rows in data["ChurnDate"]:
            if pd.isnull(rows):
                selected.append(True)
            else:
                if datetime.strptime(rows,"%Y-%m-%d") >= lastYear and datetime.strptime(rows,"%Y-%m-%d") <= maxEndDate:
                    selected.append(True)
                else:
                    selected.append(False)
        newDf = data.loc[selected]
        print("one year applied")
        return newDf
    elif past6months:
        lastSixMonths = maxEndDate -relativedelta(months=6)
        selected=[]
        for rows in data["ChurnDate"]:
            if pd.isnull(rows):
                selected.append(True)
            else:
                if datetime.strptime(rows,"%Y-%m-%d") >= lastSixMonths and datetime.strptime(rows,"%Y-%m-%d") <= maxEndDate:
                    selected.append(True)
                else:
                    selected.append(False)
        newDf = data.loc[selected]
        print("six months applied")
        return newDf
    else:
        selected=[]
        for rows in data["ChurnDate"]:
            if pd.isnull(rows):
                selected.append(True)
            else:
                if datetime.strptime(rows,"%Y-%m-%d") >= start and datetime.strptime(rows,"%Y-%m-%d") <= end:
                    selected.append(True)
                else:
                    selected.append(False)
        newDf = data.loc[selected]
        f"custom range applied from {start} to {end}"
        return newDf
    
def updateData(data):
    filtered = filter(data)
    churn_dates = [np.datetime64(x) for x in filtered['ChurnDate'] if not pd.isnull(x)]
    hist_churn = [1 if not pd.isnull(x) else 0 for x in filtered['ChurnDate']]
    account = [filtered["Balance"].iloc[i] for i in range(filtered["Balance"].shape[0]) if hist_churn[i] == 1]
    proj_churn = [filtered["PredLifecycle_Churned"].iloc[i] for i in range(filtered["PredLifecycle_Churned"].shape[0]) if hist_churn[i] == 0]
    persona = filtered["CombinedPersonas"].tolist()

    global hist_churn_percentage, proj_churn_percentage,persona_segment_top_3, persona_segment_full,hist_churn_graph, loss_impact_graph

    if len(hist_churn) == 0:
        hist_churn_percentage = str(round(0/1,1))+"%"
    else:
        hist_churn_percentage = str(round(statistics.fmean(hist_churn)*100,1)) + "%"
    
    if len(proj_churn) == 0:
        proj_churn_percentage = str(round(0/1,1))+"%"
    else:
        proj_churn_percentage = str(round(statistics.fmean(hist_churn)*100,1)) + "%"
    
    persona_segment_full =[]
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
    
    acc_dict={}
    new_account = [-1*i for i in account]
    for i,record in enumerate(churn_dates):
        if record in acc_dict:
            acc_dict[record] += new_account[i]
        else:
            acc_dict[record] = new_account[i]
    index2nd = np.argsort(list(acc_dict.keys()))

    churn_df = pd.DataFrame(data={'Date':np.array(final_dates)[index],'Churn Occurrences':np.array(churn_freq)[index]})
    account_df =pd.DataFrame(data={'Date':np.array(list(acc_dict.keys()))[index2nd],'Total Loss':np.array(list(acc_dict.values()))[index2nd]})
    fig = px.line(churn_df, x="Date", y="Churn Occurrences", title="Historical Churn Occurrences", color_discrete_sequence=["#9f0606"])
    fig2 = px.line(account_df, x="Date",y="Total Loss", title="Raw Loss Impact", color_discrete_sequence=["#9f0606"])
    fig.update_layout(title = {'y':0.9,
                'x':0.5,
                'xanchor': 'center',
                'yanchor': 'top',
                "text": "Historical Churn Occurrences",
                "font":{
                    "family": 'Inter',
                    "size": 20,
                    "color":"#808080"
                }
            },
            xaxis= {
                "title": {
                    "text": '<b> Date </b>',
                    "font": {
                        "family": 'Inter',
                        "size" : 15
                    }
                },
                "ticksuffix":"   "
            },
            yaxis = {
                "title": {
                    "text" : '<b> # of Churn Occurrences </b>',
                    "font" :{
                        "family" : 'Inter',
                        "size" : 15
                    }
                },
                "ticksuffix":"   "
            },
            plot_bgcolor = "rgba( 255 , 255 , 255 , 0.000 )",
            # paper_bgcolor ="rgba( 255 , 255 , 255 , 0.000 )"
        )
    fig2.update_layout(title = {'y':0.9,
                'x':0.5,
                'xanchor': 'center',
                'yanchor': 'top',
                "text": "Raw Loss Impact",
                "font":{
                    "family": 'Inter',
                    "size": 20,
                    "color":"#808080"
                }
            },
            xaxis= {
                "title": {
                    "text": '<b> Date </b>',
                    "font": {
                        "family": 'Inter',
                        "size" : 15
                    }
                },
                "ticksuffix":"   "
            },
            yaxis = {
                "title": {
                    "text" : '<b> Net Loss </b>',
                    "font" :{
                        "family" : 'Inter',
                        "size" : 15
                    }
                },
                "ticksuffix":"   "
            },
            plot_bgcolor = "rgba( 255 , 255 , 255 , 0.000 )",
            # paper_bgcolor ="rgba( 255 , 255 , 255 , 0.000 )"
        )
    loss_impact_graph = pio.to_json(fig2)
    hist_churn_graph = pio.to_json(fig)

app = Flask(__name__)
CORS(app, origins='http://127.0.0.1:5500')

@app.route('/api/data/KPI-Summary')
def get_numerical_data():
    global df,hist_churn_percentage, proj_churn_percentage, persona_segment_full, persona_segment_top_3, loss_impact_graph, hist_churn_graph,LastUpdated
    updateData(df)
    data = {}
    data["hist-churn"] = hist_churn_percentage
    data["proj-churn"] = proj_churn_percentage
    data["persona-segment-top-3"] = persona_segment_top_3
    data["persona-segment-full"] = persona_segment_full
    data["loss-impact-graph"] = loss_impact_graph
    data["hist-churn-graph"] = hist_churn_graph
    data["timestamp"] = LastUpdated

    return jsonify(data)

@app.route('/api/time-filter/KPI-Summary', methods=['POST'])
def handle_time_filter():
    data = request.json  
    filter_type = data.get('filter')
    global past6months, past1Year, customRange,df

    if filter_type == 'past6months':
        past6months= True
        past1Year=False
        customRange = False
        get_numerical_data()
        return jsonify("6 months applied")
    elif filter_type == 'past1year':
        past6months= False
        past1Year=True
        customRange = False
        get_numerical_data()
        return jsonify("1 Year applied")
    elif filter_type == 'customrange':
        global start,end
        start = datetime.strptime(data.get('start'),"%Y-%m-%d")
        end = datetime.strptime(data.get('end'),"%Y-%m-%d")
        past6months= False
        past1Year=False
        customRange = True
        get_numerical_data()
        return jsonify(f"Custom range from {start} to {end} applied")
    else:
        return jsonify('Invalid filter criteria')

@app.route('/api/model')
def get_model():
    # Your code to fetch and process data from the desired source
    # For simplicity, let's assume dummy data
    with open("Report_Dict.json","r") as perform:
        model_perform = json.load(perform)
        return jsonify(model_perform)

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port =5000, debug=True) #use this for Docker run instead
    app.run(debug=True) # only for local run 