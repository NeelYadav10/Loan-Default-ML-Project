from typing import Literal, List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    Age: int = Field(..., ge=18, le=69, description="Applicant age in years (18-69)")
    Income: int = Field(..., ge=15000, le=149999, description="Annual income in INR (₹15,000 - ₹149,999)")
    LoanAmount: int = Field(..., ge=5000, le=249999, description="Requested loan amount in INR (₹5,000 - ₹249,999)")
    CreditScore: int = Field(..., ge=300, le=849, description="Credit score (300-849)")
    MonthsEmployed: int = Field(..., ge=0, le=119, description="Months employed at current job (0-119)")
    NumCreditLines: int = Field(..., ge=1, le=4, description="Number of existing open credit lines (1-4)")
    InterestRate: float = Field(..., ge=2.0, le=25.0, description="Interest rate percentage (2.0% - 25.0%)")
    LoanTerm: Literal[12, 24, 36, 48, 60] = Field(..., description="Loan term in months (12, 24, 36, 48, 60)")
    DTIRatio: float = Field(..., ge=0.10, le=0.90, description="Debt-to-Income ratio (0.10 - 0.90)")
    Education: Literal["High School", "Bachelor's", "Master's", "PhD"] = Field(..., description="Highest education level")
    EmploymentType: Literal["Full-time", "Part-time", "Self-employed", "Unemployed"] = Field(..., description="Employment status")
    MaritalStatus: Literal["Single", "Married", "Divorced"] = Field(..., description="Marital status")
    HasMortgage: Literal["Yes", "No"] = Field(..., description="Has existing mortgage")
    HasDependents: Literal["Yes", "No"] = Field(..., description="Has dependents")
    LoanPurpose: Literal["Auto", "Business", "Education", "Home", "Other"] = Field(..., description="Purpose of loan")
    HasCoSigner: Literal["Yes", "No"] = Field(..., description="Has co-signer on loan")

    model_config = {
        "json_schema_extra": {
            "example": {
                "Age": 46,
                "Income": 84208,
                "LoanAmount": 129188,
                "CreditScore": 451,
                "MonthsEmployed": 26,
                "NumCreditLines": 3,
                "InterestRate": 21.17,
                "LoanTerm": 24,
                "DTIRatio": 0.31,
                "Education": "Master's",
                "EmploymentType": "Unemployed",
                "MaritalStatus": "Divorced",
                "HasMortgage": "Yes",
                "HasDependents": "Yes",
                "LoanPurpose": "Auto",
                "HasCoSigner": "No"
            }
        }
    }

class TopFactor(BaseModel):
    feature: str
    impact: str
    explanation: str

class PredictResponse(BaseModel):
    prediction: int = Field(..., description="0 for Repay, 1 for Default")
    label: str = Field(..., description="'Likely to Repay' or 'Likely to Default'")
    default_probability: float = Field(..., description="Predicted probability of default (0.0 to 1.0)")
    risk_level: str = Field(..., description="'Low', 'Medium', or 'High'")
    top_factors: List[str] = Field(..., description="Human readable top risk drivers from what-if feature analysis")
    detailed_factors: List[TopFactor] = Field(default=[], description="Structured top factor details")
    demo_mode: bool = Field(False, description="True if using mock predictor fallback")

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    demo_mode: bool

class SchemaField(BaseModel):
    name: str
    type: str
    label: str
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    step: Optional[float] = None
    options: Optional[List[Any]] = None
    default: Any
    unit: Optional[str] = None

class FormSchemaResponse(BaseModel):
    fields: Dict[str, SchemaField]
    steps: List[Dict[str, Any]]
