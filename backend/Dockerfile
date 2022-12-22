FROM python:3.10
WORKDIR /backend
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
COPY . .
CMD hypercorn $HYPERCORN_CMD_ARGS -b 0.0.0.0:$PORT "src/app:create_app()"
