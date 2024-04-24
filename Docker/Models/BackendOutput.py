#!/usr/bin/env python
# coding: utf-8

# In[38]:


import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import json


# ### Uplading predicted data & report dictionary

# In[39]:


predicted_data = pd.read_csv('Predicted_Data.csv')


# In[40]:


with open('Report_Dict.json', 'r') as file:
        report_dict = json.load(file)


# ### Creating string of Last Updated

# In[41]:


LastUpdated = {'LastUpdated' : f"Last Updated at {datetime.now().replace(microsecond=0)}"}
jsonLastUpdated = json.dumps(LastUpdated)


# ### Sending data

# In[42]:


# Flask API to send report and predicted data to frontend
app = Flask(__name__)
CORS(app)

@app.route('/api/model')
def get_model():
    return report_dict

@app.route('/api/data')
def get_data():
    return jsonify(predicted_data.to_dict(orient='records'))

if __name__ == 'main':
    app.run(debug=True)




