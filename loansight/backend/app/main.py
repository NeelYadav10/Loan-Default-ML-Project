import json
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import PredictRequest, PredictResponse, HealthResponse
from app.predictor import predictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("loansight.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager loading ML model ONCE at startup."""
    logger.info("Initializing LoanSight Backend Service...")
    model_loaded = predictor.load_artifacts()
    if model_loaded:
        logger.info("ML Model successfully loaded into memory.")
    else:
        logger.warning("ML Model failed to load. Serving in Demo Mode.")
    yield
    logger.info("Shutting down LoanSight Backend Service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS setup with origin regex for local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):(517[0-9]|3000|800[0-9])",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint reporting model loading status."""
    return HealthResponse(
        status="ok",
        model_loaded=predictor.is_loaded,
        version=settings.VERSION,
        demo_mode=predictor.demo_mode
    )

@app.get("/api/schema", tags=["Metadata"])
async def get_form_schema():
    """Returns dynamic schema for frontend form generation."""
    schema = {
        "steps": [
            {
                "id": "personal",
                "title": "Personal Details",
                "description": "Applicant demographic & dependent profile",
                "fields": ["Age", "Education", "MaritalStatus", "HasDependents"]
            },
            {
                "id": "employment",
                "title": "Employment & Income",
                "description": "Work history & annual earnings",
                "fields": ["EmploymentType", "MonthsEmployed", "Income"]
            },
            {
                "id": "credit",
                "title": "Credit Profile",
                "description": "Credit score & existing debt ratios",
                "fields": ["CreditScore", "NumCreditLines", "DTIRatio", "HasMortgage"]
            },
            {
                "id": "loan",
                "title": "Loan Details",
                "description": "Requested loan parameters & backing",
                "fields": ["LoanAmount", "LoanTerm", "InterestRate", "LoanPurpose", "HasCoSigner"]
            }
        ],
        "fields": {
            "Age": {"type": "number", "label": "Age", "min": 18, "max": 69, "step": 1, "default": 42, "unit": "years"},
            "Income": {"type": "currency", "label": "Annual Income", "min": 15000, "max": 149999, "step": 1000, "default": 75000, "unit": "USD"},
            "LoanAmount": {"type": "currency", "label": "Loan Amount", "min": 5000, "max": 249999, "step": 1000, "default": 25000, "unit": "USD"},
            "CreditScore": {"type": "slider", "label": "Credit Score", "min": 300, "max": 849, "step": 1, "default": 680, "unit": "points"},
            "MonthsEmployed": {"type": "slider", "label": "Months Employed", "min": 0, "max": 119, "step": 1, "default": 36, "unit": "months"},
            "NumCreditLines": {"type": "number", "label": "Open Credit Lines", "min": 1, "max": 4, "step": 1, "default": 2, "unit": "lines"},
            "InterestRate": {"type": "slider", "label": "Interest Rate", "min": 2.0, "max": 25.0, "step": 0.1, "default": 10.5, "unit": "%"},
            "LoanTerm": {"type": "segmented", "label": "Loan Term", "options": [12, 24, 36, 48, 60], "default": 36, "unit": "months"},
            "DTIRatio": {"type": "slider", "label": "Debt-to-Income (DTI) Ratio", "min": 0.10, "max": 0.90, "step": 0.01, "default": 0.35, "unit": "ratio"},
            "Education": {"type": "chip", "label": "Education Level", "options": ["High School", "Bachelor's", "Master's", "PhD"], "default": "Bachelor's"},
            "EmploymentType": {"type": "chip", "label": "Employment Type", "options": ["Full-time", "Part-time", "Self-employed", "Unemployed"], "default": "Full-time"},
            "MaritalStatus": {"type": "chip", "label": "Marital Status", "options": ["Single", "Married", "Divorced"], "default": "Married"},
            "HasMortgage": {"type": "toggle", "label": "Has Mortgage", "options": ["Yes", "No"], "default": "No"},
            "HasDependents": {"type": "toggle", "label": "Has Dependents", "options": ["Yes", "No"], "default": "No"},
            "LoanPurpose": {"type": "chip", "label": "Loan Purpose", "options": ["Auto", "Business", "Education", "Home", "Other"], "default": "Home"},
            "HasCoSigner": {"type": "toggle", "label": "Has Co-Signer", "options": ["Yes", "No"], "default": "No"}
        }
    }
    return JSONResponse(content=schema)

@app.get("/api/model-info", tags=["Metadata"])
async def get_model_info():
    """Returns trained model metrics and architecture from metrics.json."""
    metrics_file = settings.MODEL_DIR / "metrics.json"
    if not metrics_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics file not found."
        )
    try:
        with open(metrics_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error reading metrics.json: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error reading model metrics."
        )

@app.post("/api/predict", response_model=PredictResponse, tags=["Inference"])
async def predict_loan_default(payload: PredictRequest, response: Response):
    """
    Evaluates loan application parameters and predicts default probability.
    Returns prediction (0/1), label, probability, risk level, and top factors.
    Includes Cache-Control: no-store header to prevent result caching.
    """
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    try:
        input_dict = payload.model_dump()
        result = predictor.predict(input_dict)
        return PredictResponse(**result)
    except Exception as e:
        logger.error(f"Prediction endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )
