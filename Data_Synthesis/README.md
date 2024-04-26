# Data Synthesis

Hi, welcome to the data synthesis folder.
The code for synthesizing the data is in the NEW_DataSynthesis.ipynb
All data used can be found in the data folder, and the data we synthesized in the end can be found in ./data/final

| Feature                 | Type          | Dataset                                                             | Remarks                                                               |
|-------------------------|---------------|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| Gender                  | object        | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| Age                     | int32         | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| Tenure                  | int32         | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| Balance                 | float64       | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| NumOfProducts           | int64         | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| EstimatedSalary         | int32         | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| Exited                  | int64         | [Bank Churn Dataset](https://www.kaggle.com/datasets/rangalamahesh/bank-churn) |                                                                       |
| CustomerId              | int32         |                                                                       | Generated so that each row has its own unique ID                       |
| ChurnDate               | datetime64[ns]|                                                                       | GXS opened on 31/08/2022; churn dates generated between then and today if the customer has exited |
| MonthsInactive          | float64       |                                                                       |                                                                       |
| TransactionFreq         | int32         | [Bank Transaction Data](https://www.kaggle.com/datasets/apoorvwatsky/bank-transaction-data) |                                                                       |
| TransactionAmt          | float64       | [Bank Transaction Data](https://www.kaggle.com/datasets/apoorvwatsky/bank-transaction-data) |                                                                       |
| ServiceSupportFrequency | int32         | [Technical Customer Support Data](https://www.kaggle.com/datasets/saurav9786/technical-customer-support-data) |                                                                       |
| NPS                     | float64       | [NPSBank Dataset](https://www.kaggle.com/datasets/charlottetu/npsbank) | Net Promoter Score (NPS) is a measure used to gauge customer loyalty, satisfaction, and enthusiasm with a company | 
| Education               | object        | [Credit Card Customers Dataset](https://www.kaggle.com/datasets/sakshigoyal7/credit-card-customers) |                                                                       |
| EmploymentStatus        | object        |                                                                       |                                                                       |
| MaritalStatus           | object        | [Singapore Statistics](https://www.singstat.gov.sg/-/media/files/publications/cop2020/sr2/cop2020sr2.ashx) | Used statistics on page 9 to create our distribution for marital status |
| HousingStatus           | object        | [Loan Prediction Dataset](https://www.kaggle.com/datasets/subhamjain/loan-prediction-based-on-customer-behavior) |                                                                       |
| Dependants              | int32         | [Bank Card Churn Rate Dataset](https://www.kaggle.com/datasets/hanatuangud/bank-card-churn-rate) |                                                                       |
| MarketingOffersAcceptance| float64     | [Marketing Campaign Dataset](https://www.kaggle.com/datasets/rahulchavan99/marketing-campaign-dataset) |                                                                       |
| PaymentMethod           | object        | [Straits Times Article](https://www.straitstimes.com/business/cards-are-king-when-it-comes-to-making-payment-in-singapore-report) | Used the distributions in the Straits Times article                    |
| BrandSatisfaction       | int32         | [Bank Churn EDA Insights Dataset](https://www.kaggle.com/code/thabresh/bank-customer-churn-eda-insights/input) |                                                                       |
| FeatureSatisfaction     | int32         | [Bank Marketing Term Deposit Dataset](https://www.kaggle.com/datasets/sharanmk/bank-marketing-term-deposit/data) |                                                                       |
| SupportSatisfaction     | int32         | [Bank Marketing Term Deposit Dataset](https://www.kaggle.com/datasets/sharanmk/bank-marketing-term-deposit/data) |                                                                       |
| FeatureSupportFrequency | int32         | [Technical Customer Support Data](https://www.kaggle.com/datasets/saurav9786/technical-customer-support-data) |                                                                       |
| LoanAmt                 | float64       | [Custom Dataset](https://www.kaggle.com/datasets/zaurbegiev/my-dataset) |                                                                       |
| IncomeSource            | object        |                                                                       | Generated randomly based on employment type                             |
| Retention               | float64       |                                                                       | Modelled after a beta distribution                                     |
| ChangeInBehaviourMkt    | float64       |                                                                       | Modelled after a normal distribution                                   |
| ChangeInBehaviourCust   | float64       |                                                                       | Modelled after a normal distribution                                   |
| PrevLifecycle           | object        |                                                                       | Based on values in "ChurnDate", "MonthsInactive", and "Tenure"         |
| CurrLifecycle           | object        |                                                                       | Based on values in "ChurnDate", "PrevLifecycle", and "TransactionFreq" |
| Happiness               | int64         |                                                                       | Based on Num_pdts (0-4) & Brand Satisfaction (0-5)                     |
| SocialInfluencer        | int64         |                                                                       | Based on NPS value >= 8                                                 |
| Savings Savant          | float64       |                                                                       | Price sensitive, based on "MarketingOffersAcceptance" and "ChangeInBehaviourMkt" |
| Digital Dynamos         | float64       |                                                                       | Feature Driven, based on "FeatureSatisfaction" and "FeatureSupportFrequency" |
| Trustee Tribe           | float64       |                                                                       | Service Dependent, based on "ServiceSupportFrequency", "SupportSatisfaction", and "ChangeInBehaviourCust" |
| N_Savings Savant        | float64       |                                                                       | How much the person is price sensitive                                   |
| N_Digital Dynamos       | float64       |                                                                       | How much the person is feature driven                                    |
| N_Trustee Tribe         | float64       |                                                                       | How much the person is service dependent                                 |
| FirstPersona            | object        |                                                                       | Most prominent aspect of the customer                                   |
| SecondPersona           | object        |                                                                       | Only occurs if the difference between the first and second aspects are close |
| ThirdPersona            | object        |                                                                       | Only occurs if the difference between the second and third aspects are close |
| CombinedPersonas        | object        |                                                                       | Based on the 3 previous columns, create a persona for the customer       |
| PrevLifecycle_Active    | int32         |                                                                       |                                                                       |
| PrevLifecycle_Churned   | int32         |                                                                       |                                                                       |
| PrevLifecycle_Dormant   | int32         |                                                                       |                                                                       |
| PrevLifecycle_Reactivated| int32        |                                                                       |                                                                       |
| CurrLifecycle_Active    | int32         |                                                                       |                                                                       |
| CurrLifecycle_Churned   | int32         |                                                                       |                                                                       |
| CurrLifecycle_Dormant   | int32         |                                                                       |                                                                       |
| CurrLifecycle_Reactivated| int32        |                                                                       |                                                                       |
