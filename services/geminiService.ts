import { GoogleGenAI, Type } from "@google/genai";
import { Invoice } from "../types";
import { MOCK_EXTRACTED_INVOICE } from "../constants";

// NOTE: Ideally, the key comes from process.env.API_KEY.
const apiKey = process.env.API_KEY || 'mock-key'; 

const ai = new GoogleGenAI({ apiKey });

const EXTRACTION_SYSTEM_PROMPT = `
You are an expert automotive invoice OCR engine. Extract structured data from the provided invoice image/PDF.
Output strictly valid JSON matching the schema. 
- Extract the dealer name and address into 'dealer_info'.
- Extract the customer name, ID, and address.
- Extract vehicle details (VIN, Model, Mileage, Color).
- Extract each job/service segment with its complaint, correction, parts, and labor.
- Extract totals carefully.
- Extract legal disclaimers as a list of strings.
- If a field is missing, use reasonable defaults or empty strings, but do not omit required fields.
- Ensure numeric values are parsed correctly as numbers.
`;

const TRANSLATION_SYSTEM_PROMPT = `
You are an expert automotive service translator. Translate the provided JSON invoice data from English to Spanish (Mexican/US).

Terminology Rules:
- Strut -> Amortiguador
- Labor -> Mano de Obra
- Shop Supplies -> Insumos de Taller
- G.O.G. -> G.O.G. y Suministros
- Mount and Balance -> Montaje y Balanceo
- Alignment -> Alineación

Constraints:
- DO NOT translate Proper Nouns (Brand names, People, Dealer Names).
- DO NOT translate VINs, Part Numbers, or Op Codes.
- DO NOT change any numeric values or dates.
- PRESERVE the exact JSON structure.
- Translate 'complaint' and 'correction' fields with a professional, technical tone.
`;

const invoiceSchema = {
  type: Type.OBJECT,
  required: [
     "invoice_number", 
     "date", 
     "dealer_info", 
     "customer", 
     "vehicle", 
     "jobs", 
     "totals", 
     "disclaimers"
  ],
  properties: {
    invoice_number: { type: Type.STRING },
    date: { type: Type.STRING },
    dealer_info: { type: Type.STRING },
    customer: { 
        type: Type.OBJECT,
        required: ["name", "id"],
        properties: {
            name: { type: Type.STRING },
            id: { type: Type.STRING },
            address: { type: Type.STRING }
        }
    },
    vehicle: {
        type: Type.OBJECT,
        required: ["vin", "year_make_model", "mileage"],
        properties: {
            vin: { type: Type.STRING },
            year_make_model: { type: Type.STRING },
            mileage: { type: Type.STRING },
            color: { type: Type.STRING }
        }
    },
    jobs: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            required: ["job_number", "job_title", "complaint", "correction", "parts", "labor", "job_total"],
            properties: {
                job_number: { type: Type.INTEGER },
                job_title: { type: Type.STRING },
                complaint: { type: Type.STRING },
                correction: { type: Type.STRING },
                parts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            part_number: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            description: { type: Type.STRING },
                            unit_price: { type: Type.NUMBER },
                            total_price: { type: Type.NUMBER }
                        }
                    }
                },
                labor: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            op_code: { type: Type.STRING },
                            description: { type: Type.STRING },
                            tech_id: { type: Type.STRING },
                            hours: { type: Type.NUMBER },
                            amount: { type: Type.NUMBER }
                        }
                    }
                },
                job_total: { type: Type.NUMBER }
            }
        }
    },
    totals: {
        type: Type.OBJECT,
        required: ["parts_amount", "labor_amount", "misc_charges", "tax", "grand_total"],
        properties: {
            parts_amount: { type: Type.NUMBER },
            labor_amount: { type: Type.NUMBER },
            misc_charges: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            grand_total: { type: Type.NUMBER }
        }
    },
    disclaimers: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractInvoiceData = async (file: File): Promise<Invoice> => {
  if (apiKey === 'mock-key') {
     console.warn("Using mock extraction because API_KEY is missing.");
     await new Promise(r => setTimeout(r, 2000)); // Simulate delay
     return MOCK_EXTRACTED_INVOICE;
  }

  try {
    const filePart = await fileToPart(file);
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [filePart, { text: "Extract data from this invoice." }]
        },
        config: {
            systemInstruction: EXTRACTION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: invoiceSchema
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini during extraction");
    return JSON.parse(text) as Invoice;

  } catch (error) {
    console.error("Extraction failed", error);
    return MOCK_EXTRACTED_INVOICE;
  }
};

export const translateInvoice = async (invoiceData: Invoice): Promise<Invoice> => {
  if (apiKey === 'mock-key') {
     console.warn("Using mock translation because API_KEY is missing.");
     await new Promise(r => setTimeout(r, 1000));
     return mockTranslation(invoiceData);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: JSON.stringify(invoiceData),
      config: {
        systemInstruction: TRANSLATION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: invoiceSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini during translation");
    
    return JSON.parse(text) as Invoice;

  } catch (error) {
    console.error("Translation failed", error);
    return mockTranslation(invoiceData);
  }
};

// Fallback logic for demo/mocking
const mockTranslation = (invoice: Invoice): Invoice => {
  const spanishInvoice = JSON.parse(JSON.stringify(invoice));
  
  spanishInvoice.jobs.forEach((job: any) => {
    if (job.job_title.includes("REPLACE")) job.job_title = job.job_title.replace("REPLACE", "REEMPLAZAR");
    if (job.job_title.includes("MOUNT AND BALANCE")) job.job_title = "MONTAJE Y BALANCEO";
    
    job.complaint = `[ES] ${job.complaint}`;
    job.correction = `[ES] ${job.correction}`;
    
    job.labor.forEach((labor: any) => {
        labor.description = `[ES] ${labor.description}`;
    });
    
    job.parts.forEach((part: any) => {
        part.description = `[ES] ${part.description}`;
    });
  });

  spanishInvoice.disclaimers = spanishInvoice.disclaimers.map((d: string) => `[ES-LEGAL] ${d}`);
  
  return spanishInvoice;
};