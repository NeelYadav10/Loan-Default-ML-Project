# LoanSight — Loan Default Prediction Web Application

LoanSight is a production-grade Loan Default Prediction application featuring a **FastAPI backend** serving a trained **Gradient Boosting Classifier** model (255,000 borrower records, 16 features) and a **React + Vite + Tailwind CSS** frontend.

---

## Repository Structure

```
loansight/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI server, endpoints & CORS
│   │   ├── schemas.py       # Pydantic v2 schemas with range validations
│   │   ├── predictor.py     # ML inference & What-If factor ranking
│   │   └── config.py        # Relative path configurations
│   ├── model/               # Model artifacts (model.pkl, scaler.pkl, encoders.pkl, columns.json, metrics.json)
│   ├── test_parity.py       # 20-sample API parity test suite
│   ├── requirements.txt     # Python backend dependencies
│   └── README.md            # Backend documentation
│
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Footer, LoanSnapshot, ResultGauge, ErrorBoundary
    │   ├── pages/           # Home, Predict (5-step wizard + results), About
    │   ├── constants/       # Field metadata & step definitions
    │   └── lib/             # Axios API client
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── README.md
```

---

## Machine Learning Pipeline & Artifacts

Model artifacts are exported using `Python files/export_model.py` and placed in `backend/model/`:
- `model.pkl`: Champion `GradientBoostingClassifier` (150 trees, max depth 4, learning rate 0.1).
- `scaler.pkl`: `StandardScaler` fitted on `X_train`.
- `encoders.pkl`: `LabelEncoder`s per categorical feature fitted on `X_train`.
- `columns.json`: Feature column order, saved training IQR bounds for clipping, baseline training medians/modes.
- `metrics.json`: Accuracy (88.6%), ROC-AUC (0.758), Precision, Recall, F1-score, and Gini feature importances.

---

## Quick Start Commands (Windows)

### 1. Export Model & Generate Artifacts (if re-exporting)
From project root:
```powershell
python "Python files/export_model.py"
```

### 2. Start Backend Server
From `loansight/backend/`:
```powershell
cd "loansight/backend"
uvicorn app.main:app --reload --port 8000
```
Backend API interactive docs: `http://localhost:8000/docs`

### 3. Run Backend Parity Test (Optional)
From `loansight/backend/`:
```powershell
python test_parity.py
```

### 4. Start Frontend Development Server
From `loansight/frontend/`:
```powershell
cd "loansight/frontend"
npm install
npm run dev
```
Frontend web application: `http://localhost:5173`

---

## API Endpoints Summary

- `GET /health`: Health check reporting whether the real model is loaded into memory.
- `GET /api/schema`: Dynamic form field metadata, range constraints, and wizard step groupings.
- `GET /api/model-info`: Model architecture, test set performance metrics, and feature importances.
- `POST /api/predict`: Evaluates 16 applicant parameters. Returns `prediction` (0/1), `label` ("Likely to Repay" / "Likely to Default"), `default_probability` (0.0 to 1.0), `risk_level` ("Low", "Medium", "High"), and `top_factors` (What-If risk drivers).

---

## Disclaimer

*Educational project. Not financial advice.*
