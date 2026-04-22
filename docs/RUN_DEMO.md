# Running the Rescue Priority Engine

This document explains how to run the system locally.

## 1. Install dependencies

pip install -r requirements.txt

## 2. Run the AI prioritization engine

python -m backend.demo_runner

## 3. Run the Streamlit dashboard

streamlit run dashboard.py

## 4. Run the backend API

uvicorn backend.api.server:app --reload

## 5. Open interactive API docs

http://127.0.0.1:8000/docs

## 6. Run the React dashboard (optional)

cd frontend
npm install
npm start
