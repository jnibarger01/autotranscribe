export interface InvoicePart {
  part_number: string;
  quantity: number;
  description: string;
  unit_price: number;
  total_price: number;
}

export interface InvoiceLineItem {
  op_code: string;
  description: string;
  tech_id: string;
  hours: number;
  amount: number;
}

export interface JobSegment {
  job_number: number;
  job_title: string;
  complaint: string;
  correction: string;
  parts: InvoicePart[];
  labor: InvoiceLineItem[];
  job_total: number;
}

export interface Customer {
  name: string;
  id: string;
  address?: string;
}

export interface Vehicle {
  vin: string;
  year_make_model: string;
  mileage: string;
  color?: string;
}

export interface InvoiceTotals {
  parts_amount: number;
  labor_amount: number;
  misc_charges: number; // G.O.G. etc
  tax: number;
  grand_total: number;
}

export interface Invoice {
  invoice_number: string;
  date: string;
  dealer_info: string;
  customer: Customer;
  vehicle: Vehicle;
  jobs: JobSegment[];
  totals: InvoiceTotals;
  disclaimers: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  EXTRACTING = 'EXTRACTING',
  TRANSLATING = 'TRANSLATING',
  RECONSTRUCTING = 'RECONSTRUCTING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessingStats {
  confidenceScore: number;
  translationLatency: number;
  partsCost: number;
  laborCost: number;
}