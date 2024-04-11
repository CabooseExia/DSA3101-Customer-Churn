# # For more information, please refer to https://aka.ms/vscode-docker-python
# FROM python:3.12-slim

# # Keeps Python from generating .pyc files in the container
# ENV PYTHONDONTWRITEBYTECODE=1

# # Turns off buffering for easier container logging
# ENV PYTHONUNBUFFERED=1

# # Install pip requirements
# COPY requirements.txt .
# RUN python -m pip install -r requirements.txt

# WORKDIR /app
# COPY . /app

# # Creates a non-root user with an explicit UID and adds permission to access the /app folder
# # For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
# RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
# USER appuser

# # During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
# CMD ["python", "docker\Database\Database.py"]

FROM python:3
 
RUN apt-get update
RUN apt-get install -y python3 python3-venv python3-pip

WORKDIR /usr/src/app

# Do we need a virtual env?
#ENV VIRTUAL_ENV=/opt/venv
#RUN python3 -m venv $VIRTUAL_ENV
#ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY . ./
RUN pip3 install -r requirements.txt

CMD ["python3" , "./Database.py"]