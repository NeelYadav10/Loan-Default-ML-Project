export const FORM_STEPS = [
  {
    id: 'personal',
    title: 'Personal Profile',
    shortTitle: 'Personal',
    description: 'Demographics & household details',
    fields: ['Age', 'Education', 'MaritalStatus', 'HasDependents']
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    shortTitle: 'Employment',
    description: 'Work history & annual earnings',
    fields: ['EmploymentType', 'MonthsEmployed', 'Income']
  },
  {
    id: 'credit',
    title: 'Credit Profile',
    shortTitle: 'Credit',
    description: 'Credit score & debt ratios',
    fields: ['CreditScore', 'NumCreditLines', 'DTIRatio', 'HasMortgage']
  },
  {
    id: 'loan',
    title: 'Loan Details',
    shortTitle: 'Loan',
    description: 'Requested loan parameters & backing',
    fields: ['LoanAmount', 'LoanTerm', 'InterestRate', 'LoanPurpose', 'HasCoSigner']
  },
  {
    id: 'review',
    title: 'Review & Predict',
    shortTitle: 'Review',
    description: 'Confirm details and run model evaluation',
    fields: []
  }
];

export const DEFAULT_FORM_VALUES = {
  Age: 42,
  Income: 75000,
  LoanAmount: 25000,
  CreditScore: 680,
  MonthsEmployed: 36,
  NumCreditLines: 2,
  InterestRate: 10.5,
  LoanTerm: 36,
  DTIRatio: 0.35,
  Education: "Bachelor's",
  EmploymentType: "Full-time",
  MaritalStatus: "Married",
  HasMortgage: "No",
  HasDependents: "No",
  LoanPurpose: "Home",
  HasCoSigner: "No"
};

export const FIELD_METADATA = {
  Age: { min: 18, max: 69, step: 1, unit: 'yrs' },
  Income: { min: 15000, max: 149999, step: 1000, unit: 'INR' },
  LoanAmount: { min: 5000, max: 249999, step: 1000, unit: 'INR' },
  CreditScore: { min: 300, max: 849, step: 1, unit: 'pts' },
  MonthsEmployed: { min: 0, max: 119, step: 1, unit: 'mos' },
  NumCreditLines: { min: 1, max: 4, step: 1, unit: 'lines' },
  InterestRate: { min: 2.0, max: 25.0, step: 0.1, unit: '%' },
  DTIRatio: { min: 0.10, max: 0.90, step: 0.01, unit: 'ratio' },

  Education: [
    { value: 'High School', label: 'High School', icon: 'GraduationCap' },
    { value: "Bachelor's", label: "Bachelor's", icon: 'Award' },
    { value: "Master's", label: "Master's", icon: 'BookOpen' },
    { value: 'PhD', label: 'Doctorate / PhD', icon: 'Sparkles' }
  ],
  EmploymentType: [
    { value: 'Full-time', label: 'Full-time', icon: 'Briefcase' },
    { value: 'Part-time', label: 'Part-time', icon: 'Clock' },
    { value: 'Self-employed', label: 'Self-employed', icon: 'UserCheck' },
    { value: 'Unemployed', label: 'Unemployed', icon: 'AlertCircle' }
  ],
  MaritalStatus: [
    { value: 'Single', label: 'Single', icon: 'User' },
    { value: 'Married', label: 'Married', icon: 'Heart' },
    { value: 'Divorced', label: 'Divorced', icon: 'Users' }
  ],
  LoanPurpose: [
    { value: 'Auto', label: 'Auto Purchase', icon: 'Car' },
    { value: 'Business', label: 'Business Expansion', icon: 'Building' },
    { value: 'Education', label: 'Education / Tuition', icon: 'BookOpen' },
    { value: 'Home', label: 'Home Improvement / Mortgage', icon: 'Home' },
    { value: 'Other', label: 'Other Personal Use', icon: 'HelpCircle' }
  ]
};
