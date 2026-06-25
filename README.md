# CampusCivic Agent (PEC Community Hero)

An advanced full-stack civic orchestration agent built for the Vibe2Ship Hackathon utilizing the Gemini API and deployed on Google Cloud Run.

## 🚀 Project Overview
CampusCivic Agent bridges the gap between local citizens and public/campus infrastructure administration at Punjab Engineering College (PEC) and Chandigarh. Instead of filing static, easily ignored complaint forms, the platform uses an intelligent conversational AI layer that dynamically triages, structures, targets, and tracks community infrastructure issues in real-time.

## 🎨 Design System: Chandigarh Modern Slate
Inspired by Chandigarh’s iconic modernist architectural heritage, the application uses a strict structural layout:
* **Typography Hierarchy:** Clean, readable `Inter` for data display paired with high-contrast `Space Grotesk` headers for a sharp Swiss-Modern architectural aesthetic. `JetBrains Mono` is utilized for backend logs, timestamps, and active docket system IDs.
* **Aesthetic Language:** Implements deep slate grays, off-white background canvases, emerald action indicators, and clear high-visibility priority badges (Red, Amber, Blue) mapping administrative triage risk levels.

## ⚙️ Architectural Core & Functional Modules
1. **Secure Server-Side Middleware:** Engineered with an Express.js backend that fully isolates and abstracts all downstream REST calls to the Google Gemini API. This safeguards sensitive cloud environment variables from exposure to client-side browsers.
2. **AI Coordinator Chat UI:** A responsive chat framework featuring localized area parsing, conversational history streaming, and adaptive context extraction.
3. **Quick-Lodge Dispatcher:** A high-speed structural bypass route allowing power users to lodge fully classified dockets instantly without undergoing standard conversational loops.
4. **Civic Action Panel:** A mock formal administrative dashboard displaying targeted structural email drafts, calculated priority weights, and point-of-contact details for the Chandigarh Municipal Corporation (MCC) or PEC Estate Office.
5. **Interactive State-Driven Docket Tracker:** An interactive workflow lifecycle component that models civic resolution tracking from 0% to 100% across four explicit state-machine intervals: *Lodge*, *Review*, *Dispatch*, and *Resolve*.

## 🛠️ Google Technologies Utilized
* **Gemini API (`gemini-3.5-flash`):** Handles semantic validation, unstructured address parsing, priority categorization, and natural administrative email generation.
* **Google Cloud Run:** Fully serverless container hosting providing public web access, elastic scalability, and production-ready runtime deployment.
