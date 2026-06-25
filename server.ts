import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in your environment or Secrets tab.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Chat and Agentic Drafting Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();

    // Compile chat history into a string format for Gemini
    const formattedHistory = (history || [])
      .map((h: { role: string; content: string }) => `${h.role === "user" ? "Citizen" : "CampusCivic Agent"}: ${h.content}`)
      .join("\n");

    const systemInstruction = `You are CampusCivic Agent, an advanced municipal and campus coordinator for Punjab Engineering College (PEC) and Chandigarh.
Your job is to assist citizens and students in lodging complaints (e.g. broken streetlights, potholes, waste management, campus infrastructure).

Strict Multi-Step Agentic Workflow:
1. Greet the citizen/student professionally and ask for the issue details and specific location if not fully provided.
2. If the user provides a complaint description and specific location:
   a. Categorize the problem (e.g. Roads & Traffic, Waste & Sanitation, Electricity & Lighting, Water Supply, Campus Estates, General Municipal).
   b. Assess its safety priority (CRITICAL, HIGH, MEDIUM, LOW) and justify why.
   c. Determine the high-visibility Hazard Level (Red, Amber, or Blue):
      - Red: Immediate hazards, open live wires, severe road blockages, structural instability, safety risks.
      - Amber: High/Medium priority issues that require quick action but are not immediate life threats.
      - Blue: Standard low priority, routine maintenance, administrative or aesthetic issues.
   d. Draft a highly professional formal email directed to the correct local authority:
      - For PEC campus issues: PEC Estate Office (estateofficer@pec.edu.in) or Chief Warden (chiefwarden@pec.edu.in) or Estate Branch.
      - For Chandigarh municipal issues: Chandigarh Municipal Corporation (comm-mcc-chd@nic.in) or respective Department Executive Engineer.
   e. Estimate a realistic resolution timeline (e.g., CRITICAL: 24-48 hours, HIGH: 3-5 days, MEDIUM: 7-10 days, LOW: 10-14 days).
   f. Generate a tracking ID starting with PEC-EST-2026-XXXX (for PEC issues) or CHD-MCC-2026-XXXX (for Chandigarh issues) where XXXX is random letters/digits.

If the citizen has NOT provided BOTH the issue details and specific location, reply in a warm, helpful manner asking for the missing details, and set 'hasComplaintDrafted' to false. Do not draft a complaint.
If they HAVE provided both (or if they are confirming previous details), immediately draft the complaint, explain that you have done so in your message, and set 'hasComplaintDrafted' to true. Include the full 'complaintDraft' object in the structured JSON.`;

    const prompt = `Chat History:\n${formattedHistory}\n\nNew Citizen Message: ${message}\n\nPerform your assessment. Reply to the user and if you have enough details, draft the formal complaint and email.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "Your friendly, helpful conversational reply to the citizen. If a complaint is being drafted, state it clearly."
            },
            hasComplaintDrafted: {
              type: Type.BOOLEAN,
              description: "Set to true if and only if both the specific issue details AND specific location are known, enabling a formal complaint draft."
            },
            complaintDraft: {
              type: Type.OBJECT,
              description: "Details of the drafted complaint. This field MUST be included if hasComplaintDrafted is true.",
              properties: {
                category: {
                  type: Type.STRING,
                  description: "One of: Roads & Traffic, Waste & Sanitation, Electricity & Lighting, Water Supply, Campus Estates, General Municipal"
                },
                priority: {
                  type: Type.STRING,
                  description: "CRITICAL, HIGH, MEDIUM, or LOW"
                },
                hazardLevel: {
                  type: Type.STRING,
                  description: "Red, Amber, or Blue"
                },
                priorityJustification: {
                  type: Type.STRING,
                  description: "Professional explanation of why this priority was assigned based on public safety or student welfare."
                },
                location: {
                  type: Type.STRING,
                  description: "The cleaned and specific location in Chandigarh or PEC (e.g., 'Outside Hostel 4, PEC Campus' or 'Inner Market, Sector 15-C, Chandigarh')."
                },
                authorityName: {
                  type: Type.STRING,
                  description: "Exact department or authority name (e.g. PEC Estate Office, Chandigarh Municipal Corporation (MCC) Health Dept, MC Electricity Branch)."
                },
                authorityEmail: {
                  type: Type.STRING,
                  description: "Likely contact email (e.g., estateofficer@pec.edu.in, commissioner@mcchandigarh.gov.in, eepublichealth@chd.nic.in)."
                },
                formalEmailSubject: {
                  type: Type.STRING,
                  description: "Respectful and clear subject line (e.g., 'Urgent: Restoring Damaged Streetlights at Sector 11-A Secondary Road')"
                },
                formalEmailBody: {
                  type: Type.STRING,
                  description: "Complete formal, polite email drafted on behalf of the citizen. Address the authority respectfully, describe the issue, specify the exact location, request timely intervention, and close professionally."
                },
                estimatedTimeline: {
                  type: Type.STRING,
                  description: "Estimated completion timeline (e.g., '24-48 Hours', '3-5 Business Days', '7-10 Days')"
                },
                trackingId: {
                  type: Type.STRING,
                  description: "Simulated tracking number, e.g., PEC-EST-2026-X83C or CHD-MCC-2026-M49F"
                }
              },
              required: [
                "category",
                "priority",
                "hazardLevel",
                "priorityJustification",
                "location",
                "authorityName",
                "authorityEmail",
                "formalEmailSubject",
                "formalEmailBody",
                "estimatedTimeline",
                "trackingId"
              ]
            }
          },
          required: ["message", "hasComplaintDrafted"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred during agent execution." });
  }
});

// 2. Direct Quick Submission / Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { complaintText, location } = req.body;
    if (!complaintText || !location) {
      return res.status(400).json({ error: "Both complaint description and location are required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are CampusCivic Agent. Analyze the given civic/municipal complaint and specific location in Chandigarh or Punjab Engineering College (PEC).
Provide a high-quality, structured complaint analysis containing:
1. Category (Roads & Traffic, Waste & Sanitation, Electricity & Lighting, Water Supply, Campus Estates, General Municipal).
2. Priority level (CRITICAL, HIGH, MEDIUM, LOW) based on safety hazards (e.g. open manholes or live wires are CRITICAL; broken lighting is HIGH; minor pothole on sub-road is MEDIUM; aesthetic issues are LOW).
3. Hazard level: Red, Amber, or Blue (Red for critical/life threats, Amber for intermediate active issues, Blue for standard routine issues).
4. A professional safety/priority justification.
5. Correct Authority Name and contact Email (PEC Estate Office/Chief Warden for campus, Chandigarh MC or administration departments for city).
6. Formal Email Subject & full Email Body drafted professionally on behalf of the complainant.
7. Realistic estimated resolution timeline.
8. Tracking ID following local formats.`;

    const prompt = `Complaint Details: "${complaintText}"\nLocation: "${location}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            hazardLevel: { type: Type.STRING, description: "Red, Amber, or Blue" },
            priorityJustification: { type: Type.STRING },
            location: { type: Type.STRING },
            authorityName: { type: Type.STRING },
            authorityEmail: { type: Type.STRING },
            formalEmailSubject: { type: Type.STRING },
            formalEmailBody: { type: Type.STRING },
            estimatedTimeline: { type: Type.STRING },
            trackingId: { type: Type.STRING }
          },
          required: [
            "category",
            "priority",
            "hazardLevel",
            "priorityJustification",
            "location",
            "authorityName",
            "authorityEmail",
            "formalEmailSubject",
            "formalEmailBody",
            "estimatedTimeline",
            "trackingId"
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No analysis returned from Gemini");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    res.status(500).json({ error: error.message || "An error occurred during complaint analysis." });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusCivic server running on http://localhost:${PORT}`);
  });
}

startServer();
