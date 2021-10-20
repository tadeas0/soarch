FROM python:3.6
WORKDIR /backend
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
COPY . .
CMD gunicorn --chdir src -b 0.0.0.0:$PORT "app:create_app()"