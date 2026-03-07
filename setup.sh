#!/bin/bash

echo "Setting up Rescue Priority Engine..."

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running rescue priority engine..."
python -m backend.demo_runner

echo "Launching dashboard..."
streamlit run dashboard.py

echo "Setup complete."
