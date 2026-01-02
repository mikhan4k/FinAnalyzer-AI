
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, ReportingBasis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    companyName: { type: Type.STRING },
    reportingPeriod: { type: Type.STRING },
    profitAndLoss: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        years: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              values: { type: Type.ARRAY, items: { type: Type.STRING } },
              isTotal: { type: Type.BOOLEAN }
            },
            required: ["label", "values"]
          }
        }
      },
      required: ["title", "years", "rows"]
    },
    balanceSheet: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        years: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              values: { type: Type.ARRAY, items: { type: Type.STRING } },
              isTotal: { type: Type.BOOLEAN }
            },
            required: ["label", "values"]
          }
        }
      },
      required: ["title", "years", "rows"]
    },
    cashFlow: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        years: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              values: { type: Type.ARRAY, items: { type: Type.STRING } },
              isTotal: { type: Type.BOOLEAN }
            },
            required: ["label", "values"]
          }
        }
      },
      required: ["title", "years", "rows"]
    }
  },
  required: ["companyName", "reportingPeriod", "profitAndLoss", "balanceSheet", "cashFlow"]
};

export const extractFinancials = async (base64File: string, mimeType: string, basis: ReportingBasis): Promise<ExtractionResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64File,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this annual report and extract the ${basis} Profit & Loss statement (Statement of Comprehensive Income), ${basis} Balance Sheet (Statement of Financial Position), and ${basis} Cash Flow statement. Ensure you capture the correct line items, exact values for the listed years, and identify which rows represent totals or sub-totals. If multiple years are present (e.g., current and prior), include both as separate columns. Focus exclusively on the ${basis} figures as requested.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ExtractionResult;
};
