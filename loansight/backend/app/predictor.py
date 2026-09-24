import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional

import numpy as np
import pandas as pd
import joblib

from app.config import settings

logger = logging.getLogger("loansight.predictor")

class LoanPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = None
        self.columns_meta = None
        self.metrics_meta = None
        self.is_loaded = False
        self.demo_mode = False

    def load_artifacts(self) -> bool:
        """Loads model artifacts from settings.MODEL_DIR if available."""
        model_dir = settings.MODEL_DIR
        model_file = model_dir / "model.pkl"
        scaler_file = model_dir / "scaler.pkl"
        encoders_file = model_dir / "encoders.pkl"
        columns_file = model_dir / "columns.json"
        metrics_file = model_dir / "metrics.json"

        if not (model_file.exists() and scaler_file.exists() and encoders_file.exists() and columns_file.exists()):
            logger.warning(f"Model files missing in {model_dir}. Operating in DEMO MODE.")
            self.is_loaded = False
            self.demo_mode = True
            return False

        try:
            logger.info(f"Loading ML artifacts from {model_dir}...")
            self.model = joblib.load(model_file)
            self.scaler = joblib.load(scaler_file)
            self.encoders = joblib.load(encoders_file)

            with open(columns_file, "r", encoding="utf-8") as f:
                self.columns_meta = json.load(f)

            if metrics_file.exists():
                with open(metrics_file, "r", encoding="utf-8") as f:
                    self.metrics_meta = json.load(f)

            self.is_loaded = True
            self.demo_mode = False
            logger.info("Successfully loaded real model artifacts.")
            return True
        except Exception as e:
            logger.error(f"Failed to load model artifacts: {e}", exc_info=True)
            self.is_loaded = False
            self.demo_mode = True
            return False

    def _preprocess_input_df(self, input_dict: Dict[str, Any]) -> pd.DataFrame:
        """Preprocesses single input record strictly following training pipeline."""
        df = pd.DataFrame([input_dict])

        num_cols = self.columns_meta["numerical_cols"]
        cat_cols = self.columns_meta["categorical_cols"]
        feature_order = self.columns_meta["feature_order"]
        iqr_bounds = self.columns_meta["iqr_bounds"]

        # 1. Apply saved IQR bounds clipping to numerical features
        for col in num_cols:
            if col in df.columns:
                val = float(df[col].iloc[0])
                lower_b, upper_b = iqr_bounds[col]
                df[col] = np.clip(val, lower_b, upper_b)

        # 2. Encode categorical variables using saved encoders
        for col in cat_cols:
            if col in df.columns:
                le = self.encoders[col]
                raw_val = str(df[col].iloc[0])
                # Safe transform: if category unseen, fallback to first class
                if raw_val in le.classes_:
                    df[col] = le.transform([raw_val])[0]
                else:
                    df[col] = le.transform([le.classes_[0]])[0]

        # 3. Order columns strictly
        df_ordered = df[feature_order].copy()
        return df_ordered

    def _predict_raw_proba(self, input_dict: Dict[str, Any]) -> float:
        """Helper to get default probability for raw input dict."""
        df_proc = self._preprocess_input_df(input_dict)
        X_scaled = self.scaler.transform(df_proc)
        if hasattr(self.model, "predict_proba"):
            proba = float(self.model.predict_proba(X_scaled)[0][1])
        else:
            proba = float(self.model.predict(X_scaled)[0])
        return float(np.clip(proba, 0.0, 1.0))

    def _compute_what_if_top_factors(self, input_dict: Dict[str, Any], baseline_proba: float) -> List[Dict[str, str]]:
        """Computes top risk factors using per-prediction what-if substitution method."""
        baselines = self.columns_meta.get("reference_baselines", {})
        deltas = []

        feature_labels = {
            "DTIRatio": "Debt-to-Income (DTI) Ratio",
            "CreditScore": "Credit Score",
            "InterestRate": "Interest Rate",
            "Income": "Annual Income",
            "EmploymentType": "Employment Status",
            "MonthsEmployed": "Employment Duration",
            "LoanAmount": "Loan Amount",
            "HasCoSigner": "Co-Signer Status",
            "LoanTerm": "Loan Term",
            "NumCreditLines": "Credit Lines",
            "HasMortgage": "Mortgage Status",
            "HasDependents": "Dependents",
            "Age": "Applicant Age",
            "Education": "Education Level",
            "MaritalStatus": "Marital Status",
            "LoanPurpose": "Loan Purpose"
        }

        for col, val in input_dict.items():
            if col not in baselines:
                continue
            base_val = baselines[col]
            temp_payload = dict(input_dict)
            temp_payload[col] = base_val
            
            p_modified = self._predict_raw_proba(temp_payload)
            delta_p = baseline_proba - p_modified
            deltas.append({
                "feature": col,
                "label": feature_labels.get(col, col),
                "actual_val": val,
                "base_val": base_val,
                "delta_p": delta_p
            })

        deltas.sort(key=lambda x: x["delta_p"], reverse=True)

        top_factors_formatted = []
        for item in deltas[:4]:
            feat = item["feature"]
            actual = item["actual_val"]
            delta_pct = item["delta_p"] * 100.0

            if feat == "DTIRatio":
                text = f"High Debt-to-Income ratio ({actual:.2f}) raises default risk (+{abs(delta_pct):.1f}%)" if item["delta_p"] > 0 else f"Favorable DTI ratio ({actual:.2f}) reduces risk (-{abs(delta_pct):.1f}%)"
            elif feat == "CreditScore":
                text = f"Credit Score ({actual}) increases risk (+{abs(delta_pct):.1f}%)" if item["delta_p"] > 0 else f"Strong Credit Score ({actual}) lowers risk (-{abs(delta_pct):.1f}%)"
            elif feat == "InterestRate":
                text = f"High interest rate ({actual:.1f}%) increases monthly burden (+{abs(delta_pct):.1f}%)" if item["delta_p"] > 0 else f"Low interest rate ({actual:.1f}%) reduces risk"
            elif feat == "Income":
                text = f"Income of ₹{actual:,} limits repayment buffer" if item["delta_p"] > 0 else f"Solid annual income (₹{actual:,}) strengthens repayment capacity"
            elif feat == "EmploymentType":
                text = f"Employment status '{actual}' elevates credit risk" if item["delta_p"] > 0 else f"Stable employment ('{actual}') lowers risk"
            elif feat == "HasCoSigner":
                text = f"Absence of a co-signer increases risk exposure" if item["delta_p"] > 0 and actual == "No" else f"Having a co-signer provides credit backing"
            elif feat == "MonthsEmployed":
                text = f"Short employment history ({actual} months) increases risk" if item["delta_p"] > 0 else f"Established employment history ({actual} months) adds stability"
            elif feat == "LoanAmount":
                text = f"Large loan amount (₹{actual:,}) relative to income profile" if item["delta_p"] > 0 else f"Manageable loan size (₹{actual:,})"
            else:
                impact_type = "raises" if item["delta_p"] > 0 else "reduces"
                text = f"{item['label']} ('{actual}') {impact_type} risk"

            top_factors_formatted.append(text)

        return top_factors_formatted

    def mock_predict(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Heuristic mock predictor if real model is unavailable."""
        credit_score = input_dict.get("CreditScore", 600)
        dti = input_dict.get("DTIRatio", 0.40)
        interest_rate = input_dict.get("InterestRate", 12.0)
        income = input_dict.get("Income", 50000)
        loan_amount = input_dict.get("LoanAmount", 20000)

        risk_score = (850 - credit_score) / 550.0 * 0.4 + dti * 0.3 + (interest_rate / 25.0) * 0.2 + (loan_amount / income) * 0.1
        proba = float(np.clip(risk_score * 0.4, 0.03, 0.92))

        risk_level = "Low" if proba < 0.15 else ("Medium" if proba <= 0.35 else "High")
        prediction = 1 if proba >= 0.35 else 0
        label = "Likely to Default" if prediction == 1 else "Likely to Repay"

        top_factors = [
            f"Credit score of {credit_score} evaluated against mock rules",
            f"Debt-to-Income ratio of {dti:.2f}",
            f"Loan amount of ₹{loan_amount:,} relative to income ₹{income:,}"
        ]

        return {
            "prediction": prediction,
            "label": label,
            "default_probability": round(proba, 4),
            "risk_level": risk_level,
            "top_factors": top_factors,
            "demo_mode": True
        }

    def predict(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Predicts loan default probability and extracts what-if top factors."""
        if not self.is_loaded or self.model is None:
            return self.mock_predict(input_dict)

        try:
            proba = self._predict_raw_proba(input_dict)

            if proba < 0.15:
                risk_level = "Low"
            elif proba <= 0.35:
                risk_level = "Medium"
            else:
                risk_level = "High"

            prediction = 1 if proba >= 0.35 else 0
            label = "Likely to Default" if prediction == 1 else "Likely to Repay"

            top_factors = self._compute_what_if_top_factors(input_dict, proba)

            return {
                "prediction": prediction,
                "label": label,
                "default_probability": round(proba, 4),
                "risk_level": risk_level,
                "top_factors": top_factors,
                "demo_mode": False
            }
        except Exception as e:
            logger.error(f"Inference error: {e}", exc_info=True)
            return self.mock_predict(input_dict)

predictor = LoanPredictor()
