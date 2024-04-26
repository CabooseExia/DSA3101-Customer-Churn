# Directory Structure

- Frontend/
  - .gitignore
  - .gitattributes
  - README.md
  - **static/**                _(Stores the JavaScript, CSS and PNG files)_ 
    - DH.css
    - EA.js
    - EA.css
    - KPI.js
    - KPI.css
    - LE.js
    - LE.css
  - **templates/**              _(Stores the html files for the web)_
    - DH_1.html
    - DH_2.html
    - EA_1.html
    - EA_2.html
    - KPI.html
    - LE.html
  - **app.py**                  _(Python Flask APP to handle the REST API to Frontend)_
  - **Dockerfile**              _(Dockerfile for Containerization)_
  - **Predicted_Data.csv**      _(Backend-Generated Output)_
  - **Report_Dict.json**      _(Backend-Generated Output)_
  - **requirements.txt**        _(Version Dependencies for the Frontend functionalities)_     


# Instructions to run the web:

1) Go to the parent folder "DSA3101-Customer-Churn"
2) Execute "docker-compose build" in Bash
3) Execute "docker-compose up" in Bash
4) Access the Web at the generated address in Flask App

## (For Debugging Purposes of Frontend Functionality without Container)
1) Execute "python app.py" in Terminal
2) Access the Web at the generated address in Flask App
