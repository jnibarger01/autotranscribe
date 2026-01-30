import { Invoice } from './types';

// Simulating the result of AWS Textract + Parser
export const MOCK_EXTRACTED_INVOICE: Invoice = {
  invoice_number: "TOCS380946",
  date: "24JAN26",
  dealer_info: "HENDRICK TOYOTA MERIAM\n555 Automotive Dr, Kansas City, MO",
  customer: {
    name: "GERAN LAMONT MCCONNELL",
    id: "495580",
    address: "123 Maple St, Overland Park, KS"
  },
  vehicle: {
    vin: "5TDDR34...",
    year_make_model: "2018 TOYOTA HIGHLANDER",
    mileage: "71,000",
    color: "WHITE"
  },
  jobs: [
    {
      job_number: 1,
      job_title: "STRUT MOUNT REPLACE",
      complaint: "CUSTOMER STATES VEHICLE IS MAKING A CLUNKING NOISE OVER BUMPS.",
      correction: "VERIFIED CONCERN. INSPECTED SUSPENSION AND FOUND FRONT STRUT MOUNTS WORN. REPLACED FRONT STRUTS AND MOUNTS. TEST DROVE. NOISE GONE.",
      parts: [
        {
          part_number: "48609-0E050",
          quantity: 2,
          description: "INSULATOR SUB-ASSY",
          unit_price: 85.00,
          total_price: 170.00
        }
      ],
      labor: [
        {
          op_code: "95TOZZ",
          description: "STRUT REPLACE FRONT",
          tech_id: "134945",
          hours: 2.80,
          amount: 420.00
        }
      ],
      job_total: 590.00
    },
    {
      job_number: 2,
      job_title: "MOUNT AND BALANCE",
      complaint: "CHECK TIRES FOR WEAR.",
      correction: "TIRES AT 3/32. MOUNTED AND BALANCED 4 NEW TIRES. SET PRESSURES.",
      parts: [],
      labor: [
        {
          op_code: "99TOZZ",
          description: "MOUNT AND BALANCE 4 TIRES",
          tech_id: "134945",
          hours: 1.5,
          amount: 150.00
        }
      ],
      job_total: 150.00
    }
  ],
  totals: {
    parts_amount: 170.00,
    labor_amount: 570.00,
    misc_charges: 45.00, // GOG
    tax: 62.80,
    grand_total: 847.80
  },
  disclaimers: [
    "The service charge is not a government tax.",
    "All parts are new unless otherwise specified."
  ]
};