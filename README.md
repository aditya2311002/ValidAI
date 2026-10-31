#  ValidAI Compliance Engine
**AI-Powered Application Validation, Document Authentication & Regulatory Compliance Verification**  
*Hackathon Prototype Submission*  
**Team Name:** Code Blooded 
**Author:** Aditya Kumar Yadav - [GitHub](https://github.com/aditya2311002) | [LinkedIn](https://linkedin.com//in/aditya-kumar-yadav-966329370?utm_source=share_via&utm_content=profile&utm_medium=member_android) 
**Team Members:**  
* Anoushka Hegde 
* Aastik Tyagi - [GitHub](https://github.com/Aastik-Tyagi-07) | [LinkedIn](https://linkedin.com/in/aastik-tyagi-2a5384448?utm_source=share_via&utm_content=profile&utm_medium=member_android)  
* Nikunj Bansiya
* Abhay Bharat Raj  
* Ashish Anand - [GitHub](https://github.com/ashish622007-pixel)

---

##  Live Demo & Presentation
* **Live Web App:** [https://blueprint-seven-olive.vercel.app](https://blueprint-seven-olive.vercel.app)
* **Presentation Deck (PPT):** Included in repository root (`/docs/presentation.pdf`)

---

##  Problem Statement & Overview
* **Problem ID:** SIH26261
* **Theme:** Smart Automation
* **Category:** Software

Manual document verification for institutional approvals (such as AICTE applications, land ownership deeds, and faculty strength rosters) suffers from heavy administrative bottlenecks, human error, and vulnerability to forged certificates. Traditional review cycles can take up to 3 days per institution.

---

##  Proposed Solution
**ValidAI Compliance Engine** is an intelligent automation platform that streamlines institutional approval workflows through:
1. **Secure Ingestion Portal:** Securely uploads institutional applications and supporting statutory documents.
2. **Advanced OCR Extraction:** Automatically extracts text, tables, and key fields from variable document layouts.
3. **AI Visual Forensics:** Analyzes pixel metadata, error-level analysis (ELA), and verifies official stamps and signatures for forgery detection.
4. **RAG-Powered Rule Check:** Cross-references extracted data against regulatory handbooks (e.g., AICTE Approval Process Handbook) using vector search and LLMs.
5. **Instant Audit Report:** Generates a comprehensive compliance score, confidence breakdown, and actionable officer decisions (`Approve`, `Reject`, or `Query`).

---

##  System Workflow

```text
[ Secure Portal ] 
       │
       ▼
[ OCR & Layout Extraction ] 
       │
       ▼
[ AI Forensic Verification (Stamps/Signatures) ] 
       │
       ▼
[ RAG Compliance Cross-Check (AICTE Norms) ] 
       │
       ▼
[ Automated Scoring & Audit Report Generation ] 
       │
       ├──► [ Compliant ➔ Auto-Approve / Recommend ]
       └──► [ Discrepancy ➔ Flag for Human Review ]
```

---

##  Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Python, FastAPI, Node.js
* **AI / Computer Vision:** Tesseract OCR / PaddleOCR, OpenCV (Error-Level Analysis), PyTorch, LangChain, Llama-3 / OpenAI APIs
* **Database & Vector Store:** PostgreSQL, ChromaDB
* **Deployment:** Vercel (Frontend)

---

##  Key Features
*  **80% Faster Processing:** Reduces manual verification timelines from days to minutes.
*  **Multi-Layered Validation:** Combines structural OCR data extraction with optical forensic checks.
*  **Officer Dashboard:** Intuitive queue management for reviewing pending, approved, and flagged institutional applications.
*  **Fraud Prevention:** Instantly flags altered stamps, mismatched faculty counts, or invalid land certificates.

---

##  Local Setup & Installation

To run the project locally for development or testing:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/validai-compliance-engine.git
   cd validai-compliance-engine
   ```

2. **Backend Setup (Python / FastAPI):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Frontend Setup (React / Vite):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

##  Research & References
* [AICTE Approval Process Handbook (APH) Guidelines](https://www.aicte.gov.in/sites/default/files/APH%20Final.pdf?utm_source=chatgpt.com)
* [Tesseract OCR Documentation](https://tesseract-ocr.github.io/tessdoc/?utm_source=chatgpt.com)
* [OpenCV Error-Level Analysis Research & Documentation](https://opencv.org/)
* [LangChain & RAG Framework Documentation](https://docs.langchain.com/oss/python/langchain/quickstart)

---

## 📜 License
Developed under the MIT License for hackathon demonstration purposes.
