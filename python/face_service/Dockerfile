FROM python:3.11-slim

# dlib build deps + runtime libs
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        libopenblas-dev \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py /app/app.py

ENV HOST=0.0.0.0
ENV PORT=5005

EXPOSE 5005

CMD ["python", "app.py"]
