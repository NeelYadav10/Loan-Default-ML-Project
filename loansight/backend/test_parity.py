import os
import sys
import json
import requests
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

def run_parity_test():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    print("==================================================")
    print("LoanSight Model & API Parity Test (20 Random Samples)")
    print("==================================================\n")

    base_dir = Path(__file__).resolve().parent
    model_dir = base_dir / "model"
    csv_path = base_dir.parent.parent / "Python files" / "Loan_default.csv"

    if not csv_path.exists():
        print(f"Error: Dataset not found at {csv_path}")
        sys.exit(1)

    # 1. Load artifacts directly
    model = joblib.load(model_dir / "model.pkl")
    scaler = joblib.load(model_dir / "scaler.pkl")
    encoders = joblib.load(model_dir / "encoders.pkl")
    with open(model_dir / "columns.json", "r", encoding="utf-8") as f:
        columns_meta = json.load(f)

    feature_cols = columns_meta["feature_order"]
    num_cols = columns_meta["numerical_cols"]
    cat_cols = columns_meta["categorical_cols"]
    iqr_bounds = columns_meta["iqr_bounds"]

    # 2. Read dataset and take 20 random rows with random_state=42
    df = pd.read_csv(csv_path)
    samples = df.sample(n=20, random_state=42).copy()

    api_url = "http://localhost:8000/api/predict"
    mismatches = 0

    print(f"{'Sample #':<10} | {'Direct Model Proba':<20} | {'API Response Proba':<20} | {'Abs Diff':<15} | {'Status'}")
    print("-" * 80)

    for i, (_, row) in enumerate(samples.iterrows(), 1):
        payload = {
            "Age": int(row["Age"]),
            "Income": int(row["Income"]),
            "LoanAmount": int(row["LoanAmount"]),
            "CreditScore": int(row["CreditScore"]),
            "MonthsEmployed": int(row["MonthsEmployed"]),
            "NumCreditLines": int(row["NumCreditLines"]),
            "InterestRate": float(row["InterestRate"]),
            "LoanTerm": int(row["LoanTerm"]),
            "DTIRatio": float(row["DTIRatio"]),
            "Education": str(row["Education"]),
            "EmploymentType": str(row["EmploymentType"]),
            "MaritalStatus": str(row["MaritalStatus"]),
            "HasMortgage": str(row["HasMortgage"]),
            "HasDependents": str(row["HasDependents"]),
            "LoanPurpose": str(row["LoanPurpose"]),
            "HasCoSigner": str(row["HasCoSigner"])
        }

        # --- (a) Direct Inference Pipeline ---
        df_single = pd.DataFrame([payload])
        for col in num_cols:
            val = float(df_single[col].iloc[0])
            lower_b, upper_b = iqr_bounds[col]
            df_single[col] = np.clip(val, lower_b, upper_b)

        for col in cat_cols:
            le = encoders[col]
            df_single[col] = le.transform([str(df_single[col].iloc[0])])[0]

        df_single = df_single[feature_cols]
        X_scaled = scaler.transform(df_single)
        p_direct = float(model.predict_proba(X_scaled)[0][1])

        # --- (b) API Request Inference ---
        resp = requests.post(api_url, json=payload, timeout=5)
        if resp.status_code != 200:
            print(f"Sample {i:2d}: API Error HTTP {resp.status_code}")
            mismatches += 1
            continue

        resp_json = resp.json()
        p_api = float(resp_json["default_probability"])
        diff = abs(p_direct - p_api)

        status_str = "PASSED OK" if diff < 1e-4 else "FAILED MISMATCH"
        if diff >= 1e-4:
            mismatches += 1

        print(f"{i:<10} | {p_direct:<20.6f} | {p_api:<20.6f} | {diff:<15.2e} | {status_str}")

    print("-" * 80)
    if mismatches == 0:
        print("PARITY TEST PASSED! All 20 sample predictions matched within 1e-4 tolerance.")
    else:
        print(f"PARITY TEST FAILED! Found {mismatches} mismatches.")
        sys.exit(1)

if __name__ == "__main__":
    run_parity_test()
