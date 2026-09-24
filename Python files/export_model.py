import os
import sys
import json
import shutil
from pathlib import Path

import pandas as pd
import numpy as np
import joblib
import sklearn
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

def export_model_pipeline():
    print("==================================================")
    print("LoanSight Model Export Script")
    print(f"Python Version: {sys.version.split()[0]}")
    print(f"scikit-learn Version: {sklearn.__version__}")
    print(f"pandas Version: {pd.__version__}")
    print(f"numpy Version: {np.__version__}")
    print(f"joblib Version: {joblib.__version__}")
    print("==================================================\n")

    # Paths setup
    base_dir = Path(__file__).resolve().parent
    csv_path = base_dir / "Loan_default.csv"
    artifacts_dir = base_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    print(f"Loading dataset from: {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Dataset loaded: {df.shape[0]:,} rows, {df.shape[1]} columns.")

    # Drop duplicates if any
    initial_rows = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    if len(df) < initial_rows:
        print(f"Removed {initial_rows - len(df)} duplicate rows.")

    # Target & Identifier setup
    target_col = "Default"
    id_col = "LoanID"

    num_cols = ["Age", "Income", "LoanAmount", "CreditScore", "MonthsEmployed", "NumCreditLines", "InterestRate", "LoanTerm", "DTIRatio"]
    cat_cols = ["Education", "EmploymentType", "MaritalStatus", "HasMortgage", "HasDependents", "LoanPurpose", "HasCoSigner"]

    feature_cols = num_cols + cat_cols

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # 1. Stratified 80/20 train/test split
    print("\nSplitting dataset into 80% Train and 20% Test (stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 2. Categorical Encoding (LabelEncoder fit strictly on X_train)
    print("Fitting LabelEncoders on X_train...")
    encoders = {}
    cat_mappings = {}

    for col in cat_cols:
        le = LabelEncoder()
        # Fit on training data categories
        X_train[col] = le.fit_transform(X_train[col].astype(str))
        X_test[col] = le.transform(X_test[col].astype(str))
        encoders[col] = le
        cat_mappings[col] = {str(cls): int(idx) for idx, cls in enumerate(le.classes_)}

    # 3. IQR Outlier Bounds Calculation on X_train
    print("Calculating IQR outlier bounds on X_train...")
    iqr_bounds = {}
    for col in num_cols:
        q1 = float(X_train[col].quantile(0.25))
        q3 = float(X_train[col].quantile(0.75))
        iqr = q3 - q1
        lower_b = q1 - 1.5 * iqr
        upper_b = q3 + 1.5 * iqr
        iqr_bounds[col] = [lower_b, upper_b]
        # Clip X_train and X_test using saved training bounds
        X_train[col] = np.clip(X_train[col], lower_b, upper_b)
        X_test[col] = np.clip(X_test[col], lower_b, upper_b)

    # 4. Compute Baseline Reference Stats (Medians for numeric, Modes for categorical) on X_train
    reference_baselines = {}
    for col in num_cols:
        reference_baselines[col] = float(X_train[col].median())
    for col in cat_cols:
        reference_baselines[col] = str(encoders[col].inverse_transform([int(X_train[col].mode()[0])])[0])

    # 5. Feature Scaling (StandardScaler fit on X_train)
    print("Fitting StandardScaler on X_train...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 6. Fit Champion Gradient Boosting Classifier (matching tasks.ipynb tuned params)
    print("\nTraining Champion Model: GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, max_depth=4)...")
    model = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=4,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    # 7. Evaluate on held-out test set
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Probability percentiles for cutoff calibration
    proba_percentiles = {
        "p10": float(np.percentile(y_proba, 10)),
        "p25": float(np.percentile(y_proba, 25)),
        "p50": float(np.percentile(y_proba, 50)),
        "p75": float(np.percentile(y_proba, 75)),
        "p90": float(np.percentile(y_proba, 90)),
        "mean": float(np.mean(y_proba)),
        "std": float(np.std(y_proba))
    }

    # Feature importances
    feature_importances = {
        col: float(imp) for col, imp in zip(feature_cols, model.feature_importances_)
    }
    # Sort feature importances descending
    sorted_importances = dict(sorted(feature_importances.items(), key=lambda x: x[1], reverse=True))

    print("\n=== Test Set Evaluation Results ===")
    print(f"Accuracy:        {acc:.4f}")
    print(f"Precision:       {prec:.4f}")
    print(f"Recall:          {rec:.4f}")
    print(f"F1-Score:        {f1:.4f}")
    print(f"ROC-AUC Score:   {roc_auc:.4f}")
    print(f"Probability Mean: {proba_percentiles['mean']:.4f} (std: {proba_percentiles['std']:.4f})")
    print(f"Probability P25/P50/P75: {proba_percentiles['p25']:.3f} / {proba_percentiles['p50']:.3f} / {proba_percentiles['p75']:.3f}")

    # 8. Save Artifacts to artifacts/
    print("\nSaving artifact files...")
    joblib.dump(model, artifacts_dir / "model.pkl")
    joblib.dump(scaler, artifacts_dir / "scaler.pkl")
    joblib.dump(encoders, artifacts_dir / "encoders.pkl")

    columns_meta = {
        "feature_order": feature_cols,
        "numerical_cols": num_cols,
        "categorical_cols": cat_cols,
        "categorical_mappings": cat_mappings,
        "iqr_bounds": iqr_bounds,
        "reference_baselines": reference_baselines
    }
    with open(artifacts_dir / "columns.json", "w", encoding="utf-8") as f:
        json.dump(columns_meta, f, indent=2)

    metrics_meta = {
        "algorithm": "GradientBoostingClassifier",
        "hyperparameters": {
            "n_estimators": 150,
            "learning_rate": 0.1,
            "max_depth": 4,
            "random_state": 42
        },
        "sklearn_version": sklearn.__version__,
        "dataset_info": {
            "total_records": len(df),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features_count": len(feature_cols)
        },
        "metrics": {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "roc_auc": roc_auc,
            "confusion_matrix": cm
        },
        "probability_distribution": proba_percentiles,
        "risk_cutoffs": {
            "low_threshold": 0.30,
            "high_threshold": 0.60
        },
        "feature_importances": sorted_importances
    }
    with open(artifacts_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_meta, f, indent=2)

    print(f"Artifacts successfully saved to: {artifacts_dir}")

    # Copy artifacts to backend/model directory
    backend_model_dir = base_dir.parent / "loansight" / "backend" / "model"
    backend_model_dir.mkdir(parents=True, exist_ok=True)
    print(f"Copying artifacts to backend model directory: {backend_model_dir}...")

    for artifact in ["model.pkl", "scaler.pkl", "encoders.pkl", "columns.json", "metrics.json"]:
        shutil.copy2(artifacts_dir / artifact, backend_model_dir / artifact)

    print("All 5 artifact files successfully copied to backend/model/\n")
    print("Model Export Completed Successfully!")

if __name__ == "__main__":
    export_model_pipeline()
