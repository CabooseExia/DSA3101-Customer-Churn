Frontend/
│
├── .gitignore              # Git ignore file     
├── .gitattributes
├── README.md               # Project README file
│
├── static/                 # Stores the JavaScript, CSS and PNG files
│   ├── DH_1.js       
│   ├── DH_2.js             # JS File for Demographics Hub Tab
│   ├── DH.css              # CSS File for Demographics Hub Tab
│   ├── EA.js               # JS File for Engagement Analytics Tab
│   ├── EA.css              # CSS File for Engagement Analytics Tab
|   ├── KPI.js              # JS File for KPI Summary Tab
│   ├── KPI.css             # CSS File for KPI Summary Tab
│   ├── LE.js               # JS File for Lifecycle Explorer Tab
│   ├── LE.css              # CSS File for Lifecycle Explorer Tab
│
├── templates/              # Stores the html files for the web
|   ├── DH_1.html      
│   ├── DH_2.html           # HTML File for Demographics Hub Tab
│   ├── EA_1.html           
│   ├── EA_2.html           # HTML File for Engagement Analytics Tab
│   ├── KPI.html            # HTML File for KPI Summary Tab
|   ├── LE.html             # HTML File for Lifecycle Explorer Tab
│  
├── app.py                  # Python Flask APP to handle the REST API to Frontend
├── Dockerfile              # Dockerfile for Containerization
├── Predicted_Data.csv      # Backend-Generated Output 
├── Report_Dict.json        # Backend-Generated Output 
├── requirements.txt        # Version Dependencies for the Frontend functionalities 


Instructions to run the web:

1) Go to the parent folder "DSA3101-Customer-Churn"
2) Execute "docker-compose build" in Bash
3) Execute "docker-compose up" in Bash
4) Access the Web at the generated address in Flask App

(For Debugging Purposes of Frontend Functionality without Container)
1) Execute "python app.py" in Terminal
2) Access the Web at the generated address in Flask App