# LoanSight Backend Service

FastAPI service serving the trained ML model (`GradientBoostingClassifier`) for Loan Default Prediction.

## Project Layout

```
backend/
├── app/
│   ├── main.py          # FastAPI application, routes, CORS
│   ├── schemas.py       # Pydantic v2 schemas
│   ├── predictor.py     # Inference pipeline & what-if top factor analysis
│   └── config.py        # Environment & relative path settings
├── model/               # Model artifacts (model.pkl, scaler.pkl, encoders.pkl, columns.json, metrics.json)
├── requirements.txt     # Python dependencies
└── test_parity.py       # API parity test suite
```

## API Endpoints

- `GET /health`: Health check reporting whether the real model is loaded into memory.
- `GET /api/schema`: Dynamic form field metadata and steps configuration.
- `GET /api/model-info`: Model architecture, test set metrics, and feature importances from `metrics.json`.
- `POST /api/predict`: Runs inference on 16 applicant parameters. Returns prediction (0/1), label, default probability, risk level, and top what-if risk factors.

## Running the Backend Server

From the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```
