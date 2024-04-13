#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
import pandas as pd
import json
from flask import Flask, jsonify
from flask_cors import CORS
from sklearn.metrics import classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
import xgboost as XGB


# In[2]:


# Read in the tuned hyperparameters
try:
    # Open the JSON file
    with open('Models.json', 'r') as file:
        # Load the models
        models = json.load(file)
    # File is successfully opened and loaded
    print(models)
except FileNotFoundError:
    # Handle the FileNotFoundError
    print("The file 'Models.json' does not exist or cannot be opened.")


# In[3]:


# Read in the list of columns that were not used to train
try:
    # Open the JSON file
    with open('FeatureDropped.json', 'r') as file:
        # Load the models
        features_dropped = json.load(file)
    # File is successfully opened and loaded
    print(features_dropped)
except FileNotFoundError:
    # Handle the FileNotFoundError
    print("The file 'FeatureDropped.json' does not exist or cannot be opened.")


# In[4]:


# Read in the train and test data
train_data = pd.read_csv('train.csv')
test_data = pd.read_csv('test.csv')
input_features = [column for column in train_data.columns if column not in features_dropped]


# In[5]:


# Encode categorical variables for logistic regression
label_encoder = LabelEncoder()
train_data_encoded = train_data.copy()
test_data_encoded = test_data.copy()

for column in train_data_encoded.columns:
    if train_data_encoded[column].dtype == 'object':
        train_data_encoded[column] = label_encoder.fit_transform(train_data_encoded[column])
        test_data_encoded[column] = label_encoder.fit_transform(test_data_encoded[column])


# In[6]:


# Copy data sets to do encoding and scaling for logistic regression
train_lgr = train_data_encoded.copy()
test_lgr = test_data_encoded.copy()


# In[7]:


# Scale dataset (except for the labels) for logistic regression
scaler = StandardScaler()

train_lgr_features = train_lgr[[column for column in train_lgr.columns if column not in ['CurrLifecycle_Active', 'CurrLifecycle_Reactivated', 'CurrLifecycle_Dormant', 'CurrLifecycle_Churned']]]
train_lgr_labels = train_lgr[[column for column in train_lgr.columns if column in ['CurrLifecycle_Active', 'CurrLifecycle_Reactivated', 'CurrLifecycle_Dormant', 'CurrLifecycle_Churned']]]

train_lgr_features = pd.DataFrame(scaler.fit_transform(train_lgr_features), columns = train_lgr_features.columns)
train_lgr = pd.concat([train_lgr_features, train_lgr_labels], axis = 1)


test_lgr_features = test_lgr[[column for column in test_lgr.columns if column not in ['CurrLifecycle_Active', 'CurrLifecycle_Reactivated', 'CurrLifecycle_Dormant', 'CurrLifecycle_Churned']]]
test_lgr_labels = test_lgr[[column for column in test_lgr.columns if column in ['CurrLifecycle_Active', 'CurrLifecycle_Reactivated', 'CurrLifecycle_Dormant', 'CurrLifecycle_Churned']]]

test_lgr_features = pd.DataFrame(scaler.fit_transform(test_lgr_features), columns = test_lgr_features.columns)
test_lgr = pd.concat([test_lgr_features, test_lgr_labels], axis = 1)


# In[8]:


# Separate the lgr, xgb, and rf parameters into
# a list of 4 dictionaries with key value pairs of hyperparamters for Active, Reactivated, Dormant, and Churned Classification
lgr = models[0]
xgb = models[1]
rf = models[2]


# In[9]:


y_train_all_lgr = [train_lgr['CurrLifecycle_Active'], train_lgr['CurrLifecycle_Reactivated'], train_lgr['CurrLifecycle_Dormant'], train_lgr['CurrLifecycle_Churned']]
y_test_all_lgr = [test_lgr['CurrLifecycle_Active'], test_lgr['CurrLifecycle_Reactivated'], test_lgr['CurrLifecycle_Dormant'], test_lgr['CurrLifecycle_Churned']]

y_train_all = [train_data_encoded['CurrLifecycle_Active'], train_data_encoded['CurrLifecycle_Reactivated'], train_data_encoded['CurrLifecycle_Dormant'], train_data_encoded['CurrLifecycle_Churned']]
y_test_all = [test_data_encoded['CurrLifecycle_Active'], test_data_encoded['CurrLifecycle_Reactivated'], test_data_encoded['CurrLifecycle_Dormant'], test_data_encoded['CurrLifecycle_Churned']]


# In[10]:


lgr_models_list = []
xgb_models_list = []
rf_models_list = []
for i in range(4):
    # Train the lgr models and store in the list
    lgr_model = LogisticRegression(**lgr[i])
    lgr_model.fit(train_lgr[input_features], y_train_all_lgr[i])
    lgr_models_list.append(lgr_model)
    
    # Train the xgb models and store in the list
    xgb_model = XGB.XGBClassifier(**xgb[i])
    xgb_model.fit(train_data_encoded[input_features], y_train_all[i])
    xgb_models_list.append(xgb_model)
    
    # Train the rf models and store in the list
    rf_model = RandomForestClassifier(**rf[i])
    rf_model.fit(train_data_encoded[input_features], y_train_all[i])
    rf_models_list.append(rf_model)


# In[11]:


# Define the function to generate predictions from the trained models
def prediction(lgr, xgb, rf, data, features):
    # Generate predictions for data
    for i in range(len(lgr)):
        # lgr[0], xgb[0], rf[0] is the model with binary label Active/Non-Active
        if i == 0:
            data['lgr_Active_proba'] = lgr[0].predict_proba(data[features])[:, 1]
            data['xgb_Active_proba'] = xgb[0].predict_proba(data[features])[:, 1]
            data['rf_Active_proba'] = rf[0].predict_proba(data[features])[:, 1]
            
        # lgr[1], xgb[1], rf[1] is the model with binary label Reactivated/Non-Reactivated
        elif i == 1:
            data['lgr_Reactivated_proba'] = lgr[1].predict_proba(data[features])[:, 1]
            data['xgb_Reactivated_proba'] = xgb[1].predict_proba(data[features])[:, 1]
            data['rf_Reactivated_proba'] = rf[1].predict_proba(data[features])[:, 1]
            
        # lgr[2], xgb[2], rf[2] is the model with binary label Dormant/Non-Dormant
        elif i == 2:
            data['lgr_Dormant_proba'] = lgr[2].predict_proba(data[features])[:, 1]
            data['xgb_Dormant_proba'] = xgb[2].predict_proba(data[features])[:, 1]
            data['rf_Dormant_proba'] = rf[2].predict_proba(data[features])[:, 1]
           
        # lgr[3], xgb[3], rf[3] is the model with binary label Churned/Non-Churned
        elif i == 3:
            data['lgr_Churned_proba'] = lgr[3].predict_proba(data[features])[:, 1]
            data['xgb_Churned_proba'] = xgb[3].predict_proba(data[features])[:, 1]
            data['rf_Churned_proba'] = rf[3].predict_proba(data[features])[:, 1]
    
    # Calculate the average probability from the probabilities generated by each model (Ensemble Learning)
    data['average_Active_proba'] = data[['lgr_Active_proba', 'xgb_Active_proba', 'rf_Active_proba']].mean(axis = 1)
    data['average_Reactivated_proba'] = data[['lgr_Reactivated_proba', 'xgb_Reactivated_proba', 'rf_Reactivated_proba']].mean(axis = 1)
    data['average_Dormant_proba'] = data[['lgr_Dormant_proba', 'xgb_Dormant_proba', 'rf_Dormant_proba']].mean(axis = 1)
    data['average_Churned_proba'] = data[['lgr_Churned_proba', 'xgb_Churned_proba', 'rf_Churned_proba']].mean(axis = 1)
    
    # Based on the definition of lifecycle, it is not possible for a customer to have the below stated transitions
    # Active -> Reactivated, Dormant -> Dormant, Dormant -> Active, Reactivated -> Reactivated
    # Hence, set the probabilities of these cases to 0
    data['average_Active_proba'] = np.where((data['CurrLifecycle_Dormant'] == 1) & (data['average_Active_proba'] > 0), 0, data['average_Active_proba'])
    data['average_Reactivated_proba'] = np.where(((data['CurrLifecycle_Active'] == 1) | (data['CurrLifecycle_Reactivated'] == 1)) & (data['average_Reactivated_proba'] > 0), 0, data['average_Reactivated_proba'])
    data['average_Dormant_proba'] = np.where((data['CurrLifecycle_Dormant'] == 1) & (data['average_Dormant_proba'] > 0), 0, data['average_Dormant_proba'])
    
    # Normalize the probablities such that each row adds up to 1
    total_prob = data[['average_Active_proba', 'average_Reactivated_proba', 'average_Dormant_proba', 'average_Churned_proba']].sum(axis=1)
    data['average_Active_proba'] = data['average_Active_proba'] / total_prob
    data['average_Reactivated_proba'] = data['average_Reactivated_proba'] / total_prob
    data['average_Dormant_proba'] = data['average_Dormant_proba'] / total_prob
    data['average_Churned_proba'] = data['average_Churned_proba'] / total_prob
    
    # Rename the probabilities column
    data['Active'] = data['average_Active_proba']
    data['Reactivated'] = data['average_Reactivated_proba']
    data['Dormant'] = data['average_Dormant_proba']
    data['Churned'] = data['average_Churned_proba']
    
    # The lifecycle with the highest probability will be the predicted lifecycle
    data['PredictedLifecycle'] = data[['Active', 'Reactivated', 'Dormant', 'Churned']].idxmax(axis=1)

    return data


# In[12]:


# Filter the existing active customers from the train_data
train_drop_index = train_data_encoded[(train_data_encoded['CurrLifecycle_Dormant'] == 1) | (train_data_encoded['CurrLifecycle_Churned'] == 1)].index
train_active = train_data_encoded.drop(train_drop_index)
train_data = train_data.drop(train_drop_index)

# Returns the df with predictions for train_active (This train data only consists of existing active customers)
# Note: train_active_prediction is the encoded dataframe
train_active_prediction = prediction(lgr_models_list, xgb_models_list, rf_models_list, train_active, input_features)

# Returns the df with predictions for test_data 
# This test data consists of both active and churned customers to generate classification report for model performance evaluation
# Note: test_prediction is the encoded dataframe
test_prediction = prediction(lgr_models_list, xgb_models_list, rf_models_list, test_data_encoded, input_features)


# In[13]:


# Add the probabilities and predicted Lifecycle columns to the non-encoded dataframe
train_data = pd.concat([train_data, train_active_prediction.loc[:, 'average_Active_proba':'average_Churned_proba'], train_active_prediction['PredictedLifecycle']], axis=1)
test_data = pd.concat([test_data, test_prediction.loc[:, 'average_Active_proba':'average_Churned_proba'], test_prediction['PredictedLifecycle']], axis=1)


# In[14]:


# Encode the Predicted Lifecycles
test_data['PredLifecycle_Active'] = (test_data['PredictedLifecycle'] == 'Active').astype(int)
test_data['PredLifecycle_Reactivated'] = (test_data['PredictedLifecycle'] == 'Reactivated').astype(int)
test_data['PredLifecycle_Dormant'] = (test_data['PredictedLifecycle'] == 'Dormant').astype(int)
test_data['PredLifecycle_Churned'] = (test_data['PredictedLifecycle'] == 'Churned').astype(int)

train_data['PredLifecycle_Active'] = (train_data['PredictedLifecycle'] == 'Active').astype(int)
train_data['PredLifecycle_Reactivated'] = (train_data['PredictedLifecycle'] == 'Reactivated').astype(int)
train_data['PredLifecycle_Dormant'] = (train_data['PredictedLifecycle'] == 'Dormant').astype(int)
train_data['PredLifecycle_Churned'] = (train_data['PredictedLifecycle'] == 'Churned').astype(int)


# In[15]:


# Generate classification report using the test predictions
report_table = classification_report(test_data['CurrLifecycle_Churned'], test_data['PredLifecycle_Churned']) 
report_dict = classification_report(test_data['CurrLifecycle_Churned'], test_data['PredLifecycle_Churned'], output_dict=True) 


# In[16]:


print(report_table)


# In[31]:


print(report_dict)


# In[17]:


# Filter out the existing active customers from the test data
test_drop_index = test_data[(test_data['CurrLifecycle_Dormant'] == 1) | (test_data['CurrLifecycle_Churned'] == 1)].index
test_active_prediction = test_data.drop(test_drop_index) 


# In[18]:


# Concat the train_data and test_active_prediction data
predicted_data = pd.concat([train_data, test_active_prediction], ignore_index=True)   


# In[19]:


predicted_data.head()


# In[20]:


predicted_data.to_csv("Predicted_Data.csv")


# In[30]:


predicted_data.head().to_dict(orient='records')


# In[22]:


# Flask API to send report and predicted data to frontend
app = Flask(__name__)
CORS(app)

@app.route('/api/model')
def get_model():
    return jsonify(report_dict)

@app.route('/api/data')
def get_data():
    return jsonify(predicted_data.to_dict(orient='records'))

if __name__ == 'main':
    app.run(debug=True)

