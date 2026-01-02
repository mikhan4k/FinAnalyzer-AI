
export interface FinancialRow {
  label: string;
  values: string[];
  isTotal?: boolean;
}

export interface FinancialStatement {
  title: string;
  years: string[];
  rows: FinancialRow[];
}

export interface ExtractionResult {
  profitAndLoss: FinancialStatement;
  balanceSheet: FinancialStatement;
  cashFlow: FinancialStatement;
  companyName: string;
  reportingPeriod: string;
}

export enum StatementType {
  PL = 'profitAndLoss',
  BS = 'balanceSheet',
  CF = 'cashFlow'
}

export enum ReportingBasis {
  CONSOLIDATED = 'Consolidated',
  STANDALONE = 'Standalone'
}
